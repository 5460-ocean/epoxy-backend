const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

const vs = `
attribute vec2 p;
void main(){
  gl_Position = vec4(p,0.0,1.0);
}
`;

const fs = `
precision mediump float;
uniform float t;
uniform vec2 r;

// basic noise
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

// 🔥 FLOW FIELD (this is the key)
vec2 flow(vec2 uv){
  float n = noise(uv * 2.0 + t * 0.2);

  // convert noise → direction
  float angle = n * 6.2831;

  return vec2(cos(angle), sin(angle));
}

void main(){
  vec2 uv = gl_FragCoord.xy / r.xy;

  // 🔥 apply multiple flow steps
  vec2 f1 = flow(uv);
  uv += f1 * 0.08;

  vec2 f2 = flow(uv + t * 0.1);
  uv += f2 * 0.06;

  vec2 f3 = flow(uv + t * 0.2);
  uv += f3 * 0.04;

  // sample final field
  float n = noise(uv * 4.0);

  // 🎨 deep resin colors
  vec3 deep = vec3(0.01,0.03,0.08);
  vec3 aqua = vec3(0.0,0.75,0.95);

  vec3 col = mix(deep, aqua, n);

  // contrast boost
  col = pow(col, vec3(0.8));

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
const ur = gl.getUniformLocation(prog,"r");

let start = performance.now();

function draw(){
  let time = (performance.now() - start) * 0.001;

  gl.uniform1f(ut, time);
  gl.uniform2f(ur, canvas.width, canvas.height);

  gl.drawArrays(gl.TRIANGLES,0,6);

  requestAnimationFrame(draw);
}

draw();
