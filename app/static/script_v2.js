alert("EPOXY FINAL POLISH");

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

// 🔥 DIAGONAL FLOW
vec2 flow(vec2 p, float t){
    p.x += sin((p.y + p.x) * 3.0 + t) * 0.15;
    p.y += cos((p.x - p.y) * 3.0 - t) * 0.15;
    return p;
}

float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.4, t * 0.6);
    uv = flow(uv * 1.8, t * 0.3);

    float f =
        sin(uv.x * 2.2 + t) +
        cos(uv.y * 2.2 - t);

    f = f * 0.5 + 0.5;

    float d =
        sin(uv.x * 10.0 - t) *
        cos(uv.y * 10.0 + t);

    d = d * 0.5 + 0.5;

    f = mix(f, d, 0.55);

    f += seed * 0.2;

    return smoothstep(0.08, 0.92, f);
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.5 + seed * 15.0;

    float f = field(uv, t);

    // 🔥 STRONGER DEPTH
    float density = pow(f, 2.2);

    vec3 deep = vec3(0.01,0.03,0.12);
    vec3 light = vec3(0.0,0.85,1.0);

    if(theme > 0.5){
        deep = vec3(0.3,0.02,0.02);
        light = vec3(1.0,0.5,0.0);
    }
    if(theme > 1.5){
        deep = vec3(0.1,0.0,0.2);
        light = vec3(0.9,0.0,1.0);
    }

    vec3 color = mix(deep, light, density);

    // 🔥 REAL GOLD (NOT YELLOW)
    float band1 = smoothstep(0.025, 0.0, abs(f - 0.5));
    float band2 = smoothstep(0.05, 0.0, abs(f - 0.5));

    float veins = band1 * 0.7 + band2 * 0.6;

    veins *= 0.6 + hash(uv * 30.0 + seed) * 0.8;

    vec3 goldDark  = vec3(0.6, 0.45, 0.1);
    vec3 goldMid   = vec3(0.8, 0.65, 0.2);
    vec3 goldBright= vec3(1.0, 0.9, 0.4);

    vec3 gold = mix(goldDark, goldBright, pow(f, 1.5));
    gold = mix(gold, goldMid, 0.5);

    color = mix(color, gold, veins);

    // 🔥 CRISP EDGES (resin boundaries)
    float edge = smoothstep(0.49, 0.5, f) - smoothstep(0.5, 0.51, f);
    color += edge * 0.3;

    // 🔥 PIGMENT STREAKS (diagonal aligned)
    float streak = sin((uv.x + uv.y) * 25.0 + t);
    color += streak * 0.04;

    // 🔥 NORMALS (stable)
    float e = 0.001;

    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    vec3 normal = normalize(vec3(
        (fx - f),
        (fy - f),
        1.0
    ));

    vec3 lightDir = normalize(vec3(-0.4, 0.7, 1.0));
    float diffuse = max(dot(normal, lightDir), 0.0);

    vec3 viewDir = vec3(0.0,0.0,1.0);
    vec3 reflectDir = reflect(-lightDir, normal);

    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 45.0);

    color *= 0.5 + diffuse * 1.3;

    // ✨ GOLD-SENSITIVE SHINE
    color += spec * (0.2 + veins * 1.5);

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

document.querySelector("button").onclick = function(){
    themeValue = (themeValue + 1.0) % 3.0;
    seedValue = Math.random();
};
