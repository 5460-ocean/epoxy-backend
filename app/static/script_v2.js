alert("FIX: no dFdx + proper blending");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

let seedValue = Math.random();

const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;

float noise(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float smoothNoise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = noise(i);
    float b = noise(i + vec2(1.0,0.0));
    float c = noise(i + vec2(0.0,1.0));
    float d = noise(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x) +
           (c-a)*u.y*(1.0-u.x) +
           (d-b)*u.x*u.y;
}

vec2 flow(vec2 p, float t){
    float n = smoothNoise(p * 2.0 + t);

    p += vec2(n - 0.5) * 0.4;

    p.x += sin(p.y * 2.0 + t) * 0.1;
    p.y += cos(p.x * 2.0 - t) * 0.1;

    p += vec2(0.3, -0.2) * t * 0.1;

    return p;
}

float field(vec2 uv, float t){
    uv = flow(uv, t);
    uv = flow(uv * 1.5, t * 0.6);
    uv = flow(uv * 2.0, t * 0.3);

    return smoothNoise(uv * 3.0);
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.4 + seed * 10.0;

    float f = field(uv, t);

    float shaped = smoothstep(0.25, 0.75, f);

    vec3 deep  = vec3(0.02, 0.05, 0.12);
    vec3 mid   = vec3(0.0, 0.5, 0.9);
    vec3 light = vec3(0.3, 0.9, 1.0);

    vec3 color = mix(deep, mid, shaped);
    color = mix(color, light, shaped * shaped);

    // 🔥 manual edge detection (SAFE)
    float e = 0.002;

    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    float edge = abs(fx - f) + abs(fy - f);

    float softEdge = smoothstep(0.01, 0.05, edge);

    // soft blend instead of black borders
    color = mix(color, color * 0.85, softEdge * 0.3);

    gl_FragColor = vec4(color,1.0);
}
`;

function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);

    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(s));
    }

    return s;
}

const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
-1,-1, 1,-1, -1,1,
-1,1, 1,-1, 1,1
]), gl.STATIC_DRAW);

const pos = gl.getAttribLocation(program,"position");
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

const timeLoc = gl.getUniformLocation(program,"time");
const seedLoc = gl.getUniformLocation(program,"seed");

let start = Date.now();

function render(){
    let t = (Date.now() - start) * 0.002;

    gl.uniform1f(timeLoc, t);
    gl.uniform1f(seedLoc, seedValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();

document.querySelector("button").onclick = function(){
    seedValue = Math.random();
};
