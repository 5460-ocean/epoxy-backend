alert("EPOXY FINAL STRUCTURE");

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

vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 3.0 + t) * 0.12;
    p.y += cos(p.x * 3.0 - t) * 0.12;
    return p;
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.6 + seed * 10.0;

    uv = flow(uv, t);
    uv = flow(uv * 1.1, t);

    float f =
        sin(uv.x * 2.5 + t) +
        cos(uv.y * 2.5 - t);

    f = f * 0.5 + 0.5;

    // 🔥 HARD STRUCTURE (banding)
    float bands = floor(f * 4.0) / 4.0;

    // smooth edges slightly (avoid pixel harshness)
    float structure = mix(bands, f, 0.3);

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

    vec3 color = mix(deep, light, structure);

    // 🔥 STRONG DEPTH
    color *= 0.4 + 1.2 * structure;

    // ✨ GLOSS (more visible)
    float gloss = pow(structure, 8.0);
    color += gloss * 0.35;

    // 🟡 VEINS (keep good version)
    float edge = abs(f - 0.5);
    float veins = 1.0 - smoothstep(0.0, 0.02, edge);

    vec3 gold = vec3(1.0, 0.85, 0.25);
    color += veins * gold * 1.4;

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
