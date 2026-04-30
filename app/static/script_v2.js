alert("EPOXY V43 GLOBAL FLOW");

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

// ---------------------
float rand(vec2 p){
    return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = rand(i);
    float b = rand(i + vec2(1.0,0.0));
    float c = rand(i + vec2(0.0,1.0));
    float d = rand(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x)
         + (c-a)*u.y*(1.0-u.x)
         + (d-b)*u.x*u.y;
}

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;

    // 🔥 GLOBAL FLOW (THIS FIXES EVERYTHING)
    float t = time * 0.3;

    // move entire field consistently
    uv += vec2(t * 0.5, t * 0.2);

    // ---------------------
    // LAYERED FLOW DISTORTION
    vec2 flow1 = vec2(
        noise(uv * 1.5 + t),
        noise(uv * 1.5 - t)
    );

    vec2 flow2 = vec2(
        noise(uv * 3.0 + t),
        noise(uv * 3.0 - t)
    );

    uv += flow1 * 0.5;
    uv += flow2 * 0.25;

    // ---------------------
    // STRUCTURE
    float n =
        noise(uv * 1.5) * 0.6 +
        noise(uv * 3.0) * 0.3 +
        noise(uv * 6.0) * 0.1;

    // ---------------------
    // VEINS (linear, not circular)
    float veins = abs(fract(n * 8.0) - 0.5);
    veins = smoothstep(0.48, 0.5, veins);

    // ---------------------
    // COLORS
    vec3 c1;
    vec3 c2;

    if(theme < 0.5){
        c1 = vec3(0.0,0.2,0.5);
        c2 = vec3(0.0,0.8,1.0);
    }
    else if(theme < 1.5){
        c1 = vec3(0.6,0.0,0.0);
        c2 = vec3(1.0,0.7,0.0);
    }
    else if(theme < 2.5){
        c1 = vec3(0.2,0.0,0.4);
        c2 = vec3(1.0,0.0,1.0);
    }
    else{
        c1 = vec3(0.9);
        c2 = vec3(0.3);
    }

    vec3 color = mix(c1, c2, n);

    // ---------------------
    // DEPTH
    color *= 0.7 + 0.3 * n;

    // ---------------------
    // VEINS
    color -= veins * 0.3;

    // ---------------------
    // GLOSS
    float shine = pow(1.0 - abs(n - 0.5) * 2.0, 6.0);
    color += shine * 0.4;

    gl_FragColor = vec4(color,1.0);
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
    gl.uniform1f(timeLoc, t * 0.001);
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
