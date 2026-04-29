alert("EPOXY V35 – STRUCTURE FIX");

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
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.545);
}

// ---------------------
float cells(vec2 uv){
    vec2 i = floor(uv);
    vec2 f = fract(uv);

    float d = 1.0;

    for(int y=-1; y<=1; y++){
        for(int x=-1; x<=1; x++){

            vec2 g = vec2(float(x), float(y));
            vec2 o = vec2(rand(i+g), rand(i+g+1.0));

            vec2 p = g + o - f;
            d = min(d, dot(p,p));
        }
    }

    return sqrt(d);
}

// ---------------------
void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // FLOW (gentle, not chaotic)
    uv += vec2(
        sin(uv.y * 3.0 + time*0.5),
        cos(uv.x * 3.0 - time*0.5)
    ) * 0.15;

    // ---------------------
    // LARGE STRUCTURE
    float big = cells(uv * 2.0);

    // SMALL DETAIL
    float small = cells(uv * 6.0 + time*0.3);

    // ---------------------
    // HARD REGION SPLIT (IMPORTANT)
    float region = step(0.35, big);

    // ---------------------
    // BASE COLOR PER THEME
    vec3 c1;
    vec3 c2;

    if(theme < 0.5){
        c1 = vec3(0.0,0.2,0.5);
        c2 = vec3(0.0,0.8,1.0);
    }
    else if(theme < 1.5){
        c1 = vec3(0.5,0.0,0.0);
        c2 = vec3(1.0,0.7,0.0);
    }
    else if(theme < 2.5){
        c1 = vec3(0.1,0.0,0.2);
        c2 = vec3(0.9,0.0,1.0);
    }
    else{
        c1 = vec3(0.2);
        c2 = vec3(0.8);
    }

    // ---------------------
    // REGION COLORS (NO BLUR MIX)
    vec3 col = mix(c1, c2, region);

    // ---------------------
    // CELL DETAIL OVERLAY
    float detail = smoothstep(0.1, 0.4, small);
    col *= 0.8 + detail * 0.4;

    // ---------------------
    // GOLD VEINS (SHARP CUTS)
    float veins = abs(fract(big * 8.0) - 0.5);
    veins = smoothstep(0.48, 0.5, veins);

    vec3 gold = vec3(1.0, 0.85, 0.3);

    col = mix(col, gold, veins);

    // ---------------------
    // GLOSS (strong highlight)
    float gloss = pow(1.0 - big, 8.0);
    col += gloss * 0.6;

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
