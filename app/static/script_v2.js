alert("EPOXY STRUCTURE RESET");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

let seedValue = Math.random();

const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;

// FLOW
vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 2.0 + t) * 0.12;
    p.y += cos(p.x * 2.0 - t) * 0.12;
    return p;
}

// BASE FIELD
float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.4, t * 0.6);
    uv = flow(uv * 1.8, t * 0.3);

    float f =
        sin(uv.x * 2.0 + t) +
        cos(uv.y * 2.0 - t);

    f = f * 0.5 + 0.5;

    float d =
        sin(uv.x * 6.0 - t) *
        cos(uv.y * 6.0 + t);

    d = d * 0.5 + 0.5;

    return mix(f, d, 0.6);
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.5 + seed * 10.0;

    float f = field(uv, t);

    // 🔥 HARD LAYER STRUCTURE (THIS FIXES BLUR)
    float bands = floor(f * 5.0) / 5.0;

    // smooth edges slightly (not blur)
    float layer = smoothstep(bands, bands + 0.05, f);

    // 🎨 DEEP RESIN COLORS
    vec3 c1 = vec3(0.02, 0.05, 0.12);
    vec3 c2 = vec3(0.0, 0.4, 0.8);
    vec3 c3 = vec3(0.2, 0.85, 1.0);

    vec3 color = mix(c1, c2, layer);
    color = mix(color, c3, layer * layer);

    // 🔥 STRONG EDGE DETECTION
    float e = 0.002;
    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    float edge = abs(fx - f) + abs(fy - f);

    // 👉 THIS CREATES REAL VEIN ZONES
    float veins = smoothstep(0.03, 0.08, edge);

    // widen veins
    veins = pow(veins, 0.7);

    // ✨ METALLIC GOLD
    vec3 goldDark = vec3(0.25, 0.18, 0.04);
    vec3 goldBright = vec3(1.0, 0.85, 0.35);

    vec3 normal = normalize(vec3(fx - f, fy - f, 1.0));

    float metal = pow(max(dot(normal, normalize(vec3(0.5,0.5,1.0))),0.0), 6.0);

    vec3 gold = mix(goldDark, goldBright, metal);

    // 👉 GOLD IS THICK (NOT LINES)
    color = mix(color, gold, veins);

    // 💡 STRONG GLOSS
    vec3 lightDir = normalize(vec3(-0.4, 0.6, 1.0));
    vec3 reflectDir = reflect(-lightDir, normal);

    float spec = pow(max(dot(vec3(0,0,1), reflectDir), 0.0), 80.0);

    color += spec * (0.5 + veins * 1.5);

    gl_FragColor = vec4(color,1.0);
}
`;

function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);

    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
        alert(gl.getShaderInfoLog(s));
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

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
-1,-1, 1,-1, -1,1,
-1,1, 1,-1, 1,1
]), gl.STATIC_DRAW);

const pos = gl.getAttribLocation(program,"position");
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);

const timeLoc = gl.getUniformLocation(program,"time");
const seedLoc = gl.getUniformLocation(program,"seed");

let start = Date.now();

function render(){
    let t = (Date.now() - start) * 0.002;

    gl.uniform1f(timeLoc, t);
    gl.uniform1f(seedLoc, seedValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();

document.querySelector("button").onclick = function(){
    seedValue = Math.random();
};
