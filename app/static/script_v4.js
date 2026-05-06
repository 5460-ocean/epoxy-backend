const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

const vs = `
attribute vec2 p;
varying vec2 vUv;
void main(){
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p,0.0,1.0);
}
`;

const fs = `
precision highp float;

uniform float t;
varying vec2 vUv;

// noise
float hash(vec2 p){
  return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0,0.0));
  float c = hash(i + vec2(0.0,1.0));
  float d = hash(i + vec2(1.0,1.0));

  vec2 u = f*f*(3.0-2.0*f);

  return mix(a,b,u.x) +
         (c-a)*u.y*(1.0-u.x) +
         (d-b)*u.x*u.y;
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<5;i++){
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = vUv;

  // 🔥 BASE FLOW (slow + thick)
  vec2 base = uv;
  base.x += t * 0.08;

  for(int i=0;i<5;i++){
    vec2 d = vec2(
      fbm(base + vec2(0.0, t*0.05)),
      fbm(base + vec2(3.0, t*0.05))
    );
    base += (d - 0.5) * vec2(0.25, 0.1);
  }

  // 🔥 SURFACE FLOW (faster detail layer)
  vec2 surface = base;
  surface.x += t * 0.12;

  for(int i=0;i<3;i++){
    vec2 d = vec2(
      fbm(surface * 2.0),
      fbm(surface * 2.0 + 5.0)
    );
    surface += (d - 0.5) * 0.15;
  }

  float n1 = fbm(base * 2.5);     // thick body
  float n2 = fbm(surface * 4.0);  // fine detail

  // 🔥 sharper, thicker edges
  float body = smoothstep(0.45, 0.55, n1);
  float detail = smoothstep(0.48, 0.52, n2);

  float mixVal = mix(body, detail, 0.4);

  vec3 deep = vec3(0.01,0.03,0.08);
  vec3 aqua = vec3(0.0,0.75,1.0);

  vec3 col = mix(deep, aqua, mixVal);

  // 🔥 depth shading (this adds "thickness")
  col *= 0.8 + 0.4 * mixVal;

  gl_FragColor = vec4(col,1.0);
}
`;

function compile(type,src){
  const s = gl.createShader(type);
  gl.shaderSource(s,src);
  gl.compileShader(s);

  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    alert(gl.getShaderInfoLog(s));
  }

  return s;
}

const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER,vs));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER,fs));
gl.linkProgram(prog);

gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1,-1, 1,-1, -1,1,
  -1,1, 1,-1, 1,1
]), gl.STATIC_DRAW);

const loc = gl.getAttribLocation(prog,"p");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

const ut = gl.getUniformLocation(prog,"t");

let start = performance.now();

function draw(){
  let time = (performance.now() - start) * 0.001;

  gl.uniform1f(ut, time);
  gl.drawArrays(gl.TRIANGLES,0,6);

  requestAnimationFrame(draw);
}

draw();
