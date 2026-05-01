alert("EPOXY DEPTH + METAL");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = 300;
gl.viewport(0, 0, canvas.width, canvas.height);

const vertexShaderSource = `
attribute vec2 position;
void main(){
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision mediump float;

uniform float time;

// flow distortion
vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 3.0 + t) * 0.15;
    p.y += cos(p.x * 3.0 - t) * 0.15;
    return p;
}

float ridge(float x){
    return abs(x - 0.5) * 2.0;
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.6;

    // 🔥 layered flow
    uv = flow(uv, t);
    uv = flow(uv * 1.2, t);
    uv = flow(uv * 0.8, t);

    // base field
    float f =
        sin(uv.x * 2.0 + t) +
        cos(uv.y * 2.0 - t) +
        sin((uv.x + uv.y) * 1.5);

    f = f * 0.5 + 0.5;

    // 🎨 epoxy base colors
    vec3 deep = vec3(0.02, 0.05, 0.15);
    vec3 light = vec3(0.0, 0.6, 0.8);

    vec3 color = mix(deep, light, f);

    // =========================
    // 🌊 DEPTH (dark valleys)
    // =========================
    float r = ridge(f);
    r = pow(r, 2.0);
    color -= r * 0.4;

    // =========================
    // ✨ GLOSS (highlight shine)
    // =========================
    float gloss = pow(1.0 - r, 6.0);
    color += gloss * 0.4;

    // =========================
    // 🟡 METALLIC VEINS
    // =========================
    float edge = abs(f - 0.5);
    edge = 1.0 - smoothstep(0.0, 0.03, edge);

    vec3 gold = vec3(1.0, 0.85, 0.2);

    color += edge * gold * 1.5;

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

let start = Date.now();

function render(){
    let t = (Date.now() - start) * 0.002;

    gl.uniform1f(timeLoc, t);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}
render();
