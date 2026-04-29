alert("EPOXY SAFE MODE");

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

// 🔥 NO LOOP / NO FBM VERSION
const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float theme;
uniform vec2 resolution;

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // 🔥 SAFE FLOW
    float wave1 = sin(uv.x * 6.0 + time);
    float wave2 = cos(uv.y * 6.0 - time);

    float n = (wave1 + wave2) * 0.5;

    // normalize to 0–1
    n = n * 0.5 + 0.5;

    vec3 col;

    if(theme < 0.5){
        col = mix(vec3(0.0,0.2,0.6), vec3(0.2,0.8,1.0), n);
    }
    else if(theme < 1.5){
        col = mix(vec3(0.6,0.05,0.0), vec3(1.0,0.8,0.1), n);
    }
    else if(theme < 2.5){
        col = mix(vec3(0.1,0.0,0.3), vec3(0.9,0.0,1.0), n);
    }
    else{
        col = vec3(n);
    }

    // ✨ fake gloss
    float gloss = pow(n, 6.0);
    col += gloss * 0.3;

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
