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

float noise(vec2 p){
  return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
  vec2 uv = vUv;

  // simple flowing motion
  uv.x += sin(uv.y * 4.0 + t) * 0.1;
  uv.y += cos(uv.x * 4.0 + t) * 0.1;

  float n = noise(uv * 5.0);

  // 🔥 sharper contrast (no blur look)
  float edge = step(0.5, n);

  vec3 deep = vec3(0.01,0.03,0.08);
  vec3 aqua = vec3(0.0,0.7,1.0);

  vec3 col = mix(deep, aqua, edge);

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

if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
  alert(gl.getProgramInfoLog(prog));
}

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
