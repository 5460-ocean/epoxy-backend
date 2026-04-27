alert("EPOXY V19 WEBGL BASE");

// =====================
// CANVAS + WEBGL SETUP
// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

// =====================
// SEED SYSTEM
// =====================
let seed = 1;

function rand(){
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
}

// =====================
// SHADERS
// =====================
const vertexShaderSource = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;

void main() {

    vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth}.0, 300.0);

    // 🌊 base flow
    float v =
        sin(uv.x * 10.0 + time + seed) +
        cos(uv.y * 10.0 - time);

    // 🎨 normalize
    float n = (v + 2.0) / 4.0;

    // 🔥 color (fire style for now)
    vec3 color = mix(
        vec3(0.7, 0.1, 0.0),
        vec3(1.0, 0.8, 0.0),
        n
    );

    gl_FragColor = vec4(color, 1.0);
}
`;

// =====================
// SHADER COMPILER
// =====================
function createShader(gl, type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// =====================
// FULLSCREEN QUAD
// =====================
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
]), gl.STATIC_DRAW);

const positionLoc = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

// =====================
// UNIFORMS
// =====================
const timeLoc = gl.getUniformLocation(program, "time");
const seedLoc = gl.getUniformLocation(program, "seed");

// =====================
// RENDER LOOP (WEBGL)
// =====================
function render(time){
    gl.uniform1f(timeLoc, time * 0.001);
    gl.uniform1f(seedLoc, seed);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

// =====================
// GENERATE BUTTON (SEED)
// =====================
document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;

    // 🎲 new seed
    seed = Math.random() * 1000;

    console.log("Seed:", seed, "Prompt:", prompt);
};

// =====================
// HIGH RES EXPORT
// =====================
function downloadHighRes(){

    const exportCanvas = document.createElement("canvas");
    const scale = 4;

    exportCanvas.width = canvas.width * scale;
    exportCanvas.height = canvas.height * scale;

    const ex = exportCanvas.getContext("2d");

    ex.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    const link = document.createElement("a");
    link.download = "epoxy.png";
    link.href = exportCanvas.toDataURL();
    link.click();
}

document.getElementById("downloadBtn").onclick = downloadHighRes;
