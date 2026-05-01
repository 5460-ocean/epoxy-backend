alert("EPOXY ORGANIC MODE");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

let themeValue = 0;
let seedValue = 0.0;

const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float theme;
uniform float seed;

// 🔥 pseudo-noise (no sin patterns)
float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
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

// 🔥 domain warp (THIS creates epoxy feel)
vec2 warp(vec2 p, float t){
    float n1 = noise(p * 2.0 + t);
    float n2 = noise(p * 2.0 - t);

    return p + vec2(n1, n2) * 0.3;
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.4 + seed * 20.0;

    // 🔥 MULTI WARP (organic flow)
    uv = warp(uv, t);
    uv = warp(uv * 1.5, t * 0.7);
    uv = warp(uv * 2.0, t * 0.3);

    // base field
    float f = noise(uv * 3.0);

    // contrast shaping
    f = pow(f, 1.8);

    // 🎨 colors
    vec3 deep;
    vec3 light;

    if(theme < 0.5){
        deep = vec3(0.02,0.05,0.15);
        light = vec3(0.0,0.7,0.9);
    } else if(theme < 1.5){
        deep = vec3(0.2,0.02,0.02);
        light = vec3(1.0,0.4,0.0);
    } else {
        deep = vec3(0.1,0.0,0.2);
        light = vec3(0.8,0.0,1.0);
    }

    vec3 color = mix(deep, light, f);

    // depth
    color *= 0.5 + 1.2 * f;

    // gloss
    float gloss = pow(f, 6.0);
    color += gloss * 0.4;

    // 🔥 REAL VEINS from noise gradients
    float veins = smoothstep(0.45, 0.5, abs(f - 0.5));

    vec3 gold = vec3(1.0,0.85,0.25);
    color += (1.0 - veins) * gold * 1.5;

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
const themeLoc = gl.getUniformLocation(program,"theme");
const seedLoc = gl.getUniformLocation(program,"seed");

let start = Date.now();

function render(){
    let t = (Date.now() - start) * 0.002;

    gl.uniform1f(timeLoc, t);
    gl.uniform1f(themeLoc, themeValue);
    gl.uniform1f(seedLoc, seedValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();

document.querySelector("button").onclick = function(){
    themeValue = (themeValue + 1.0) % 3.0;
    seedValue = Math.random();
};
