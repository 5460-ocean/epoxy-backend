alert("EPOXY V46 REAL RESIN");

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
// FLOW FIELD (continuous)
vec2 flow(vec2 p, float t){

    float fx = sin(p.y * 2.0 + t) + cos(p.y * 3.0 - t);
    float fy = cos(p.x * 2.0 - t) + sin(p.x * 3.0 + t);

    return p + vec2(fx, fy) * 0.2;
}

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv.x *= resolution.x / resolution.y;

    float t = time * 0.6;

    // GLOBAL FLOW
    uv += vec2(t * 0.3, t * 0.15);

    // MULTI-LAYER FLOW (DEPTH)
    vec2 uv1 = flow(uv, t);
    vec2 uv2 = flow(uv * 1.3, t);
    vec2 uv3 = flow(uv * 0.6, t);

    // ---------------------
    // BASE FIELD
    float f1 = sin(uv1.x * 2.0 + t) + cos(uv1.y * 2.0);
    float f2 = sin(uv2.x * 3.0 - t) + cos(uv2.y * 3.0);
    float f3 = sin(uv3.x * 4.0 + t);

    float field = (f1 * 0.5 + f2 * 0.3 + f3 * 0.2);
    field = field * 0.5 + 0.5;

    // ---------------------
    // 🔥 EPOXY CELLS (derived, not circles)
    float cells = smoothstep(0.45, 0.7, field);
    float cellEdges = smoothstep(0.48, 0.5, abs(field - 0.5));

    // ---------------------
    // ✨ METALLIC VEINS
    float veins = pow(cellEdges, 6.0);

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
        c2 = vec3(1.0,0.6,0.0);
    }
    else if(theme < 2.5){
        c1 = vec3(0.2,0.0,0.4);
        c2 = vec3(1.0,0.0,1.0);
    }
    else{
        c1 = vec3(0.9);
        c2 = vec3(0.3);
    }

    vec3 color = mix(c1, c2, cells);

    // ---------------------
    // 🌊 DEPTH LAYERING
    float depth = f2 * 0.5 + 0.5;
    color *= 0.6 + 0.4 * depth;

    // ---------------------
    // 💎 METALLIC GOLD
    vec3 gold = vec3(1.0, 0.85, 0.3);
    color += veins * gold * 0.8;

    // ---------------------
    // GLOSS
    float shine = pow(1.0 - abs(field - 0.5) * 2.0, 8.0);
    color += shine * 0.3;

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
