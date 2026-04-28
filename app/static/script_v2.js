alert("EPOXY LAYER 1: NOISE");

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

// =====================
// 🔥 NOISE + FLOW BASE
// =====================
const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float theme;
uniform vec2 resolution;

// random
float random(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.545);
}

// smooth noise
float noise(vec2 st){
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0,0.0));
    float c = random(i + vec2(0.0,1.0));
    float d = random(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x)
         + (c-a)*u.y*(1.0-u.x)
         + (d-b)*u.x*u.y;
}

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // 🔥 smooth movement
    uv += vec2(
        sin(time + uv.y * 4.0),
        cos(time + uv.x * 4.0)
    ) * 0.1;

    float n = noise(uv * 5.0);

    vec3 col;

    if(theme < 0.5){
        col = vec3(0.0, n, 1.0);
    }
    else if(theme < 1.5){
        col = vec3(1.0, n * 0.5, 0.0);
    }
    else if(theme < 2.5){
        col = vec3(n, 0.0, 1.0);
    }
    else{
        col = vec3(n);
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
};
