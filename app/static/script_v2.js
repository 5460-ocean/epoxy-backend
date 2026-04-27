alert("EPOXY V22 THEME FIX");

// =====================
// CANVAS + WEBGL
// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

// =====================
// SEED
// =====================
let seed = 1;

// =====================
// THEME
// =====================
let themeValue = 0; // 0=ocean,1=fire,2=galaxy,3=marble

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
uniform float theme;

// 🌊 base field
float field(vec2 uv){
    return sin(uv.x * 10.0 + time + seed)
         + cos(uv.y * 10.0 - time);
}

// 🎨 theme colors
vec3 getColor(float n){

    if(theme < 0.5){
        // 🌊 OCEAN
        return mix(
            vec3(0.0, 0.2, 0.6),
            vec3(0.2, 0.8, 1.0),
            n
        );
    }
    else if(theme < 1.5){
        // 🔥 FIRE
        return mix(
            vec3(0.6, 0.05, 0.0),
            vec3(1.0, 0.8, 0.1),
            n
        );
    }
    else if(theme < 2.5){
        // 🌌 GALAXY
        return mix(
            vec3(0.05, 0.0, 0.2),
            vec3(0.8, 0.0, 1.0),
            n
        );
    }
    else{
        // ⚪ MARBLE
        return mix(
            vec3(0.9, 0.9, 0.9),
            vec3(0.3, 0.3, 0.3),
            n
        );
    }
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth}.0, 300.0);

    float v = field(uv);

    float n = (v + 2.0) / 4.0;

    vec3 col = getColor(n);

    gl_FragColor = vec4(col, 1.0);
}
`;

// =====================
// SHADER SETUP
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
const themeLoc = gl.getUniformLocation(program, "theme");

// =====================
// RENDER LOOP
// =====================
function render(time){

    gl.uniform1f(timeLoc, time * 0.001);
    gl.uniform1f(seedLoc, seed);
    gl.uniform1f(themeLoc, themeValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

// =====================
// GENERATE BUTTON
// =====================
document.getElementById("generateBtn").onclick = ()=>{

    const prompt = document.getElementById("promptInput").value.toLowerCase();

    if(prompt.includes("ocean")) themeValue = 0;
    else if(prompt.includes("fire")) themeValue = 1;
    else if(prompt.includes("galaxy")) themeValue = 2;
    else if(prompt.includes("marble")) themeValue = 3;

    seed = Math.random() * 1000;

    console.log("Theme:", themeValue, "Seed:", seed);
};

// =====================
// DOWNLOAD
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
