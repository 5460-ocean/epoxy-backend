alert("EPOXY DEBUG V1 LOADED"); // ✅ STEP 1: confirm file loads

// =====================
// CANVAS + WEBGL
// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;

gl.viewport(0, 0, canvas.width, canvas.height);

// =====================
// STATE
// =====================
let seed = 1;
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

uniform float theme;

void main(){

    vec3 col;

    // ✅ STEP 3: FORCE COLORS (no math, pure test)
    if(theme < 0.5){
        col = vec3(0.0, 0.0, 1.0); // BLUE (ocean)
    }
    else if(theme < 1.5){
        col = vec3(1.0, 0.0, 0.0); // RED (fire)
    }
    else if(theme < 2.5){
        col = vec3(1.0, 0.0, 1.0); // PURPLE (galaxy)
    }
    else{
        col = vec3(1.0, 1.0, 1.0); // WHITE (marble)
    }

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

    // 🔥 log compile errors
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
    }

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
// QUAD
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
const themeLoc = gl.getUniformLocation(program, "theme");

// 🔥 STEP 4: log uniform
console.log("themeLoc:", themeLoc);

// =====================
// RENDER LOOP
// =====================
function render(){

    gl.uniform1f(themeLoc, themeValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

render();

// =====================
// GENERATE BUTTON
// =====================
document.getElementById("generateBtn").onclick = ()=>{

    const prompt = document.getElementById("promptInput").value.toLowerCase();

    // ✅ STEP 2: detect theme
    if(prompt.includes("ocean")) themeValue = 0;
    else if(prompt.includes("fire")) themeValue = 1;
    else if(prompt.includes("galaxy")) themeValue = 2;
    else if(prompt.includes("marble")) themeValue = 3;

    seed = Math.random() * 1000;

    // 🔥 DEBUG OUTPUT
    alert("Theme value = " + themeValue);
};
