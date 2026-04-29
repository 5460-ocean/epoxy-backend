alert("EPOXY V33 THEMES FIXED");

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

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // =====================
    // THEME BEHAVIOR
    // =====================

    if(theme < 0.5){
        // 🌊 Ocean → horizontal flow
        uv.x += sin(uv.y * 6.0 + time) * 0.3;
    }
    else if(theme < 1.5){
        // 🔥 Fire → vertical rising
        uv.y += sin(uv.x * 6.0 + time * 1.5) * 0.4;
    }
    else if(theme < 2.5){
        // 🌌 Galaxy → swirl rotation
        float angle = time * 0.5;
        uv = vec2(
            uv.x * cos(angle) - uv.y * sin(angle),
            uv.x * sin(angle) + uv.y * cos(angle)
        );
    }
    else{
        // ⚪ Marble → slow drift
        uv += vec2(
            sin(time * 0.3),
            cos(time * 0.3)
        ) * 0.1;
    }

    // =====================
    // MULTI-SCALE STRUCTURE
    // =====================
    float base = sin(uv.x * 8.0) * cos(uv.y * 8.0);
    float detail = sin(uv.x * 16.0 + time) * cos(uv.y * 16.0 - time);

    float n = base * 0.7 + detail * 0.3;
    n = n * 0.5 + 0.5;

    // =====================
    // CELL SHAPING
    // =====================
    float cells = smoothstep(0.3, 0.7, n);

    // =====================
    // EDGE DEPTH
    // =====================
    float edges = pow(abs(sin(cells * 6.28)), 3.0);

    // =====================
    // COLOR PER THEME
    // =====================
    vec3 col;

    if(theme < 0.5){
        col = mix(vec3(0.0,0.2,0.5), vec3(0.0,0.8,1.0), cells);
    }
    else if(theme < 1.5){
        col = mix(vec3(0.4,0.0,0.0), vec3(1.0,0.7,0.0), cells);
    }
    else if(theme < 2.5){
        col = mix(vec3(0.1,0.0,0.2), vec3(0.9,0.0,1.0), cells);
    }
    else{
        col = vec3(cells);
    }

    // =====================
    // DEPTH MIX
    // =====================
    col = mix(col, col * 0.3, edges);

    // =====================
    // GLOSS HIGHLIGHT
    // =====================
    float gloss = pow(cells, 10.0);
    col += gloss * 0.5;

    gl_FragColor = vec4(col,1.0);
}
`;

// =====================
function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);

    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
        console.error(gl.getShaderInfoLog(s));
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

    const selected = document.getElementById("themeSelect").value;

    if(selected === "Ocean") themeValue = 0;
    else if(selected === "Fire") themeValue = 1;
    else if(selected === "Galaxy") themeValue = 2;
    else if(selected === "Marble") themeValue = 3;
};
