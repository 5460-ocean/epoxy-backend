alert("EPOXY MASTER FINAL");

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
uniform float theme;
uniform float seed;

vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 4.0 + t) * 0.12;
    p.y += cos(p.x * 4.0 - t) * 0.12;
    return p;
}

float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

// 🔥 FIELD
float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.3, t * 0.7);
    uv = flow(uv * 1.7, t * 0.4);

    float f =
        sin(uv.x * 2.5 + t) +
        cos(uv.y * 2.5 - t);

    f = f * 0.5 + 0.5;

    float d =
        sin(uv.x * 10.0 - t) *
        cos(uv.y * 10.0 + t);

    d = d * 0.5 + 0.5;

    f = mix(f, d, 0.5);

    // seed influence (IMPORTANT)
    f += seed * 0.15;

    return smoothstep(0.05, 0.95, f);
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.5 + seed * 20.0;

    float f = field(uv, t);

    // 🔥 PIGMENT DENSITY
    float density = pow(f, 2.0);

    vec3 deep = vec3(0.01,0.03,0.1);
    vec3 light = vec3(0.0,0.8,1.0);

    if(theme > 0.5){
        deep = vec3(0.3,0.02,0.02);
        light = vec3(1.0,0.5,0.0);
    }
    if(theme > 1.5){
        deep = vec3(0.1,0.0,0.2);
        light = vec3(0.9,0.0,1.0);
    }

    vec3 color = mix(deep, light, density);

    // 🔥 THICK GOLD (multi-layer)
    float band1 = smoothstep(0.03, 0.0, abs(f - 0.5));
    float band2 = smoothstep(0.06, 0.0, abs(f - 0.5));

    float veins = band1 * 0.7 + band2 * 0.5;

    // breakup (no uniform lines)
    veins *= 0.6 + hash(uv * 25.0 + seed) * 0.8;

    vec3 goldA = vec3(1.0, 0.85, 0.3);
    vec3 goldB = vec3(0.7, 0.5, 0.1);

    vec3 gold = mix(goldA, goldB, f);

    color = mix(color, gold, veins);

    // 🔥 SHARP EDGES
    float edge = smoothstep(0.48, 0.5, f) - smoothstep(0.5, 0.52, f);
    color += edge * 0.2;

    // 🔥 PIGMENT STREAKS (flow direction)
    float streak =
        sin(uv.x * 20.0 + t) *
        sin(uv.y * 5.0 - t);

    color += streak * 0.05;

    // 🔥 FAKE NORMALS (FIXED - no mesh)
    float e = 0.001; // smaller = smoother

    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    vec3 normal = normalize(vec3(
        (fx - f),
        (fy - f),
        1.0
    ));

    vec3 lightDir = normalize(vec3(-0.4, 0.6, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);

    // 🔥 STRONG GLOSS
    vec3 viewDir = vec3(0.0,0.0,1.0);
    vec3 reflectDir = reflect(-lightDir, normal);

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 40.0);

    color *= 0.5 + diffuse * 1.2;

    // ✨ stronger on gold
    color += spec * (0.3 + veins * 1.2);

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
const themeLoc = gl.getUniformLocation(program,"theme");
const seedLoc = gl.getUniformLocation(program,"seed");

let start = Date.now();

function render(){
    let t = (Date.now() - start) * 0.002;

    gl.uniform1f(timeLoc, t);
    gl.uniform1f(themeLoc, themeValue);
    gl.uniform1f(seedLoc, seedValue);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
}
render();

// 🔥 FIX GENERATE
document.querySelector("button").onclick = function(){
    themeValue = (themeValue + 1.0) % 3.0;
    seedValue = Math.random(); // NOW ACTUALLY CHANGES OUTPUT
};
