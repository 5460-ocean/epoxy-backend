alert("EPOXY REAL FIX");

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
    p.x += sin(p.y * 2.0 + t) * 0.14;
    p.y += cos(p.x * 2.0 - t) * 0.14;
    return p;
}

// FIELD
float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.3, t * 0.6);
    uv = flow(uv * 1.7, t * 0.3);

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

    // 🔥 REAL COMPRESSION (not bands)
    float density = pow(f, 1.6);

    // 🎨 DEEP RESIN COLORS (FIX FLAT BLUE)
    vec3 deep  = vec3(0.02, 0.05, 0.12);
    vec3 mid   = vec3(0.0, 0.45, 0.85);
    vec3 light = vec3(0.3, 0.9, 1.0);

    vec3 color = mix(deep, mid, density);
    color = mix(color, light, density * density);

    // 🔥 EDGE ZONES (NOT LINES)
    float e = 0.0015;

    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    float edge = abs(fx - f) + abs(fy - f);

    // 👉 THICK EDGE AREAS
    float veins = smoothstep(0.015, 0.05, edge);

    // widen + organic
    veins *= 0.8 + sin(uv.x * 10.0 + t) * 0.2;

    // NORMALS
    vec3 normal = normalize(vec3(
        fx - f,
        fy - f,
        1.0
    ));

    // ✨ REAL METALLIC GOLD (FIX YELLOW)
    vec3 goldDark   = vec3(0.25, 0.18, 0.05);
    vec3 goldBright = vec3(1.0, 0.85, 0.35);

    float metal = pow(max(dot(normal, normalize(vec3(0.5,0.5,1.0))),0.0), 5.0);

    vec3 gold = mix(goldDark, goldBright, metal);

    // 👉 GOLD IS EMBEDDED (NOT LINES)
    color = mix(color, gold, veins * 0.9);

    // 💡 STRONG GLOSS
    vec3 lightDir = normalize(vec3(-0.4, 0.6, 1.0));
    vec3 reflectDir = reflect(-lightDir, normal);

    float spec = pow(max(dot(vec3(0,0,1), reflectDir), 0.0), 70.0);

    color += spec * (0.4 + veins * 1.2);

    // 🔥 CONTRAST BOOST (FIX FLATNESS)
    color = pow(color, vec3(0.9));

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
