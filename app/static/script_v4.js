const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = 300 * dpr;
canvas.style.width = "100%";
canvas.style.height = "300px";

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
precision mediump float;

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

// flow field
vec2 flow(vec2 uv){
  float n = noise(uv * 3.0 + t * 0.5);
  float angle = n * 6.2831;
  return vec2(cos(angle), sin(angle));
}

void main(){

  vec2 uv = vUv;

  // continuous flow
  for(int i=0;i<6;i++){
    uv += flow(uv) * 0.04;
  }

  float n = noise(uv * 5.0);

  // 🔥 EDGE CREATION (THIS IS NEW)
  float edge = smoothstep(0.45, 0.55, n);

  // 🔥 HARD CONTRAST (kills softness)
  edge = pow(edge, 3.0);

  // colors
  vec3 deep = vec3(0.01,0.03,0.08);
  vec3 aqua = vec3(0.0,0.8,1.0);

  vec3 col = mix(deep, aqua, edge);

  // slight gloss boost
  col += edge * 0.15;

  gl_FragColor = vec4(col,1.0);
}
`;

function compile(type,src){
  const s = gl.createShader(type);
  gl.shaderSource(s,src);
  gl.compileShader(s);
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
