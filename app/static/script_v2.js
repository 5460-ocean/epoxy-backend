alert("EPOXY CLEAN BASE");

// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

// =====================
let themeValue = 0;
let seed = Math.random() * 1000;

// =====================
const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// =====================
// 🔥 SIMPLE + RELIABLE SHADER
// =====================
const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float theme;
uniform vec2 resolution;

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // 🔥 visible wave motion
    float wave = sin(uv.x * 10.0 + time) * 0.5 + 0.5;

    vec3 col;

    if(theme < 0.5){
        // 🌊 OCEAN
        col = vec3(0.0, wave, 1.0);
    }
    else if(theme < 1.5){
        // 🔥 FIRE
        col = vec3(1.0, wave * 0.5, 0.0);
    }
    else if(theme < 2.5){
        // 🌌 GALAXY
        col = vec3(wave, 0.0, 1.0);
    }
    else{
        // ⚪ MARBLE
        col = vec3(wave);
    }

    gl_FragColor = vec4(col, 1.0);
}
`;

// =====================
function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
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

const pos = gl.getAttribLocation(program,"position");
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

// =====================
const timeLoc = gl.getUniformLocation(program,"time");
const themeLoc = gl.getUniformLocation(program,"theme");
const resLoc = gl.getUniformLocation(program,"resolution");

// =====================
function render(t){

    gl.uniform1f(timeLoc, t*0.001);
    gl.uniform1f(themeLoc, themeValue);
    gl.uniform2f(resLoc, canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

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

    console.log("Theme:", themeValue);
};
