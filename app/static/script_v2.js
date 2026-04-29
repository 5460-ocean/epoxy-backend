alert("EPOXY MOBILE REALISM");

// =====================
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

let themeValue = 0;

// =====================
const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// =====================
const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float theme;
uniform vec2 resolution;

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // ---------------------
    // 🌊 FLOW (directional)
    // ---------------------
    uv.x += sin(uv.y * 4.0 + time * 0.8) * 0.2;
    uv.y += cos(uv.x * 3.0 - time * 0.6) * 0.2;

    // ---------------------
    // 🧪 CELL STRUCTURE
    // ---------------------
    float c1 = sin(uv.x * 8.0);
    float c2 = cos(uv.y * 8.0);
    float cells = c1 * c2;

    // normalize
    cells = cells * 0.5 + 0.5;

    // sharpen into “cells”
    cells = smoothstep(0.3, 0.7, cells);

    // ---------------------
    // 🎯 EDGE CONTRAST
    // ---------------------
    float edges = abs(sin(cells * 6.28));
    edges = pow(edges, 3.0);

    // ---------------------
    // 🎨 COLOR
    // ---------------------
    vec3 col;

    if(theme < 0.5){
        col = mix(vec3(0.0,0.2,0.6), vec3(0.2,0.8,1.0), cells);
    }
    else if(theme < 1.5){
        col = mix(vec3(0.6,0.05,0.0), vec3(1.0,0.8,0.1), cells);
    }
    else if(theme < 2.5){
        col = mix(vec3(0.1,0.0,0.3), vec3(0.9,0.0,1.0), cells);
    }
    else{
        col = vec3(cells);
    }

    // apply darker edges (resin boundary)
    col = mix(col, col * 0.3, edges);

    // ---------------------
    // ✨ GLOSS (highlight)
    // ---------------------
    float gloss = pow(cells, 8.0);
    col += gloss * 0.4;

    gl_FragColor = vec4(col,1.0);
}
`;

// =====================
function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);

    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(s));
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

    const selected = document.getElementById("themeSelect").value;

    if(selected === "Ocean") themeValue = 0;
    else if(selected === "Fire") themeValue = 1;
    else if(selected === "Galaxy") themeValue = 2;
    else if(selected === "Marble") themeValue = 3;
};
