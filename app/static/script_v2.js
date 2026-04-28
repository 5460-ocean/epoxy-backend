alert("EPOXY V23 REAL SHADER");

// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

// =====================
let seed = 1;
let themeValue = 0;

// =====================
const vertexShaderSource = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// =====================
// 🔥 REAL EPOXY SHADER
// =====================
const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;
uniform float theme;

float noise(vec2 p){
    return sin(p.x)*sin(p.y);
}

float fbm(vec2 p){
    float v = 0.0;
    v += noise(p*1.0);
    v += noise(p*2.0)*0.5;
    v += noise(p*4.0)*0.25;
    return v;
}

vec3 getColor(float n){

    if(theme < 0.5){
        return mix(vec3(0.0,0.2,0.5), vec3(0.2,0.8,1.0), n);
    }
    else if(theme < 1.5){
        return mix(vec3(0.5,0.05,0.0), vec3(1.0,0.7,0.1), n);
    }
    else if(theme < 2.5){
        return mix(vec3(0.1,0.0,0.3), vec3(0.8,0.0,1.0), n);
    }
    else{
        return mix(vec3(0.9), vec3(0.2), n);
    }
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth}.0, 300.0);

    uv += fbm(uv*3.0 + time*0.2 + seed) * 0.1;

    float n = fbm(uv*5.0);

    vec3 col = getColor(n);

    // ✨ gloss
    float highlight = pow(n, 6.0);
    col += highlight * 0.3;

    gl_FragColor = vec4(col, 1.0);
}
`;

// =====================
function createShader(gl, type, source){
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return s;
}

const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);
gl.useProgram(program);

// =====================
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
-1,-1, 1,-1, -1,1,
-1,1, 1,-1, 1,1
]), gl.STATIC_DRAW);

const pos = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

// =====================
const timeLoc = gl.getUniformLocation(program,"time");
const seedLoc = gl.getUniformLocation(program,"seed");
const themeLoc = gl.getUniformLocation(program,"theme");

// =====================
function render(t){

    gl.uniform1f(timeLoc, t*0.001);
    gl.uniform1f(seedLoc, seed);
    gl.uniform1f(themeLoc, themeValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

// =====================
// GENERATE
// =====================
document.getElementById("generateBtn").onclick = ()=>{

    const prompt = document.getElementById("promptInput").value.toLowerCase();
    const dropdown = document.getElementById("themeSelect").value.toLowerCase();

    const combined = prompt + " " + dropdown;

    if(combined.includes("ocean")) themeValue = 0;
    else if(combined.includes("fire")) themeValue = 1;
    else if(combined.includes("galaxy")) themeValue = 2;
    else if(combined.includes("marble")) themeValue = 3;

    seed = Math.random()*1000;
};
