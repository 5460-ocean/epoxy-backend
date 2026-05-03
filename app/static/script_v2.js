alert("ANTI GRID FLOW");

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

// 🔥 pseudo noise (breaks grid)
float noise(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

// 🔥 smooth noise
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

// 🔥 flow with distortion
vec2 flow(vec2 p, float t){

    float n = smoothNoise(p * 2.0 + t);

    p += vec2(n - 0.5) * 0.5;

    p.x += sin(p.y * 2.0 + t) * 0.1;
    p.y += cos(p.x * 2.0 - t) * 0.1;

    // diagonal stretch
    p += vec2(0.3, -0.2) * t * 0.1;

    return p;
}

float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.5, t * 0.6);
    uv = flow(uv * 2.0, t * 0.3);

    float f = smoothNoise(uv * 3.0);

    return f;
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.4 + seed * 10.0;

    float f = field(uv, t);

    // 🔥 STRUCTURE
    float shaped = smoothstep(0.3, 0.7, f);

    vec3 deep  = vec3(0.02, 0.05, 0.12);
    vec3 light = vec3(0.2, 0.8, 1.0);

    vec3 color = mix(deep, light, shaped);

    // subtle separation
    float edge = abs(f - shaped);
    float band = smoothstep(0.03, 0.1, edge);

    color *= (1.0 - band * 0.3);

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
