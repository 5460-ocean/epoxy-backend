alert("THEME CONNECTION TEST");

// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

// =====================
let themeValue = 0;

// =====================
const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// 🔥 ONLY TESTING THEME
const fragmentShaderSource = `
precision mediump float;

uniform float theme;

void main(){

    vec3 col;

    if(theme < 0.5){
        col = vec3(0.0, 0.0, 1.0); // BLUE
    }
    else if(theme < 1.5){
        col = vec3(1.0, 0.0, 0.0); // RED
    }
    else if(theme < 2.5){
        col = vec3(1.0, 0.0, 1.0); // PURPLE
    }
    else{
        col = vec3(1.0, 1.0, 1.0); // WHITE
    }

    gl_FragColor = vec4(col,1.0);
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
const themeLoc = gl.getUniformLocation(program,"theme");

// 🔥 DEBUG
console.log("themeLoc:", themeLoc);

// =====================
function render(){

    gl.uniform1f(themeLoc, themeValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}
render();

// =====================
document.getElementById("generateBtn").onclick = ()=>{

    const prompt = document.getElementById("promptInput").value.toLowerCase();

    if(prompt.includes("ocean")) themeValue = 0;
    else if(prompt.includes("fire")) themeValue = 1;
    else if(prompt.includes("galaxy")) themeValue = 2;
    else if(prompt.includes("marble")) themeValue = 3;

    alert("themeValue = " + themeValue);
};
