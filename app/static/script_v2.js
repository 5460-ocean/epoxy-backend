alert("EPOXY STRUCTURE + VEINS");

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

vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 3.0 + t) * 0.12;
    p.y += cos(p.x * 3.0 - t) * 0.12;
    return p;
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.6;

    // FLOW (keep stable)
    uv = flow(uv, t);
    uv = flow(uv * 1.1, t);

    // BASE FIELD
    float f =
        sin(uv.x * 2.0 + t) +
        cos(uv.y * 2.0 - t);

    f = f * 0.5 + 0.5;

    // 🔥 ADD STRUCTURE (sharper contrast)
    float structure = smoothstep(0.3, 0.7, f);

    // COLORS
    vec3 deep = vec3(0.02, 0.05, 0.15);
    vec3 light = vec3(0.0, 0.7, 0.9);

    vec3 color = mix(deep, light, structure);

    // DEPTH
    color *= 0.7 + 0.6 * structure;

    // GLOSS
    float gloss = pow(structure, 10.0);
    color += gloss * 0.25;

    // 🟡 METALLIC VEINS (thin, not blobs)
    float vein = abs(fract(f * 6.0) - 0.5);
    vein = smoothstep(0.48, 0.5, vein);

    vec3 gold = vec3(1.0, 0.85, 0.3);

    color += vein * gold * 0.8;

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
