alert("FULLSCREEN FIX");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// 🔥 FIX: proper sizing
const dpr = window.devicePixelRatio || 1;

canvas.style.width = window.innerWidth + "px";
canvas.style.height = "300px";

canvas.width = window.innerWidth * dpr;
canvas.height = 300 * dpr;

gl.viewport(0, 0, canvas.width, canvas.height);

const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform vec2 resolution;

// noise
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

// flow
vec2 flow(vec2 uv, float t){
    float n = smoothNoise(uv * 2.0 + t);

    vec2 dir = vec2(
        sin(n * 6.28),
        cos(n * 6.28)
    );

    return uv + dir * 0.05;
}

float field(vec2 uv, float t){
    uv = flow(uv, t);
    uv = flow(uv, t * 0.8);
    uv = flow(uv, t * 0.6);

    return smoothNoise(uv * 3.0);
}

void main(){

    vec2 uv = gl_FragCoord.xy / resolution;

    float t = time * 0.3;

    float f = field(uv, t);

    float shaped = smoothstep(0.25, 0.75, f);

    vec3 deep  = vec3(0.02, 0.05, 0.12);
    vec3 light = vec3(0.25, 0.85, 1.0);

    vec3 color = mix(deep, light, shaped);

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
const resLoc = gl.getUniformLocation(program,"resolution");

let start = Date.now();

function render(){
    let t = (Date.now() - start) * 0.002;

    gl.uniform1f(timeLoc, t);
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();
