alert("EPOXY CRISP + GLOSS");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

let themeValue = 0;
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

vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 3.0 + t) * 0.1;
    p.y += cos(p.x * 3.0 - t) * 0.1;
    return p;
}

float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.3, t * 0.5);

    uv.x *= 1.2;
    uv.y *= 0.9;

    float f =
        sin(uv.x * 2.0 + t) +
        cos(uv.y * 2.0 - t);

    f = f * 0.5 + 0.5;

    float d =
        sin(uv.x * 6.0 - t) *
        cos(uv.y * 6.0 + t);

    d = d * 0.5 + 0.5;

    f = mix(f, d, 0.5);

    f += seed * 0.15;

    // 🔥 HARD contrast (no blur)
    f = clamp(f, 0.0, 1.0);
    f = pow(f, 3.0);

    return f;
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.5 + seed * 10.0;

    float f = field(uv, t);

    // 🔥 COLOR (deeper)
    vec3 deep = vec3(0.01,0.02,0.08);
    vec3 light = vec3(0.0,0.7,1.0);

    vec3 color = mix(deep, light, f);

    // 🔥 SHARP VEINS (thin, not blobs)
    float v = abs(f - 0.5);

    float veins =
        smoothstep(0.02, 0.0, v) +
        smoothstep(0.04, 0.0, v);

    veins *= 0.7 + hash(uv * 12.0) * 0.6;

    // 🔥 NORMALS
    float e = 0.001;
    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    vec3 normal = normalize(vec3(
        (fx - f),
        (fy - f),
        1.0
    ));

    // 🔥 REAL METALLIC GOLD
    vec3 goldDark = vec3(0.3, 0.22, 0.05);
    vec3 goldBright = vec3(1.0, 0.85, 0.3);

    float specBand = pow(max(dot(normal, normalize(vec3(0.7,0.3,1.0))),0.0),10.0);

    vec3 gold = mix(goldDark, goldBright, specBand);

    color = mix(color, gold, veins);

    // 🔥 STRONG GLOSS (BIG FIX)
    vec3 lightDir = normalize(vec3(-0.5, 0.6, 1.0));
    vec3 viewDir = vec3(0.0,0.0,1.0);

    vec3 reflectDir = reflect(-lightDir, normal);

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 60.0);

    // stronger shine on veins
    color += spec * (0.2 + veins * 2.0);

    // 🔥 EDGE SHARPEN (remove smear)
    float edge = abs(fx - f) + abs(fy - f);
    color += edge * 0.5;

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
