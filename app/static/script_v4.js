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

float hash(vec2 p){
  return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);
}

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i+vec2(1.0,0.0));
  float c = hash(i+vec2(0.0,1.0));
  float d = hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x)+(c-a)*u.y*(1.0-u.x)+(d-b)*u.x*u.y;
}

float fbm(vec2 p){
  float v=0.0;
  float a=0.5;
  for(int i=0;i<5;i++){
    v+=a*noise(p);
    p*=2.0;
    a*=0.5;
  }
  return v;
}

void main(){
  vec2 uv = vUv;

  // FLOW
  uv.x += t * 0.1;

  vec2 p = uv;
  for(int i=0;i<5;i++){
    vec2 d = vec2(
      fbm(p + vec2(0.0, t*0.05)),
      fbm(p + vec2(3.0, t*0.05))
    );
    p += (d - 0.5) * vec2(0.3, 0.1);
  }

  float h = fbm(p * 3.0);

  // NORMAL
  float e = 0.002;
  float hx = fbm((p+vec2(e,0.0))*3.0);
  float hy = fbm((p+vec2(0.0,e))*3.0);
  vec3 normal = normalize(vec3(h-hx, h-hy, 0.02));

  vec3 light = normalize(vec3(0.5,0.4,1.0));
  float diff = clamp(dot(normal,light),0.0,1.0);

  // ===== BASE COLOR =====
  vec3 deep = vec3(0.005,0.01,0.04);
  vec3 mid  = vec3(0.0,0.25,0.45);
  vec3 high = vec3(0.0,0.65,0.95);

  float curve = pow(h,1.5);
  vec3 col = mix(deep, mid, curve);
  col = mix(col, high, smoothstep(0.45,0.55,h));

  // ===== GOLD VEINS =====
  float veins = pow(abs(sin(h*20.0)), 8.0);
  vec3 gold = vec3(1.0,0.75,0.2);
  col = mix(col, gold, veins * 0.6);

  // ===== BLACK MARBLE CRACKS =====
  float cracks = smoothstep(0.49,0.5,h) - smoothstep(0.5,0.51,h);
  col = mix(col, vec3(0.0), cracks * 0.8);

  // ===== METALLIC EFFECT =====
  float fresnel = pow(1.0 - dot(normal, vec3(0.0,0.0,1.0)), 3.0);
  col += fresnel * vec3(0.3,0.6,1.0);

  // ===== GLOSS =====
  float spec1 = pow(diff, 100.0);
  float spec2 = pow(diff, 15.0)*0.4;

  col += spec1 * vec3(1.0,0.9,0.7);
  col += spec2 * vec3(0.3,0.6,1.0);

  // ===== EDGE GLOW =====
  float edge = smoothstep(0.48,0.5,h) - smoothstep(0.5,0.52,h);
  col += edge * vec3(0.4,1.0,1.0);

  // ===== FINAL DEPTH =====
  col *= 0.6 + 0.8 * diff;

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
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
  -1,-1,1,-1,-1,1,
  -1,1,1,-1,1,1
]),gl.STATIC_DRAW);

const loc = gl.getAttribLocation(prog,"p");
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

const ut = gl.getUniformLocation(prog,"t");

let start = performance.now();

function draw(){
  let time = (performance.now()-start)*0.001;
  gl.uniform1f(ut,time);
  gl.drawArrays(gl.TRIANGLES,0,6);
  requestAnimationFrame(draw);
}

draw();
