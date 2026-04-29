alert("EPOXY V34 – CELLULAR UPGRADE");

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
// pseudo random (no loops)
float rand(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.545);
}

// ---------------------
// fake cell pattern
float cells(vec2 uv){

    vec2 i = floor(uv);
    vec2 f = fract(uv);

    float d = 1.0;

    for(int y=-1; y<=1; y++){
        for(int x=-1; x<=1; x++){

            vec2 g = vec2(float(x), float(y));
            vec2 o = vec2(rand(i + g), rand(i + g + 1.0));

            vec2 p = g + o - f;

            d = min(d, dot(p,p));
        }
    }

    return sqrt(d);
}

void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // ---------------------
    // FLOW
    uv += vec2(
        sin(uv.y * 4.0 + time),
        cos(uv.x * 4.0 - time)
    ) * 0.2;

    // ---------------------
    // LAYERS
    float big = cells(uv * 3.0);
    float small = cells(uv * 8.0 + time);

    float mixVal = mix(big, small, 0.5);

    // ---------------------
    // SHAPE
    float shape = smoothstep(0.1, 0.5, mixVal);

    // ---------------------
    // COLOR
    vec3 col;

    if(theme < 0.5){
        col = mix(vec3(0.0,0.2,0.5), vec3(0.0,0.8,1.0), shape);
    }
    else if(theme < 1.5){
        col = mix(vec3(0.5,0.0,0.0), vec3(1.0,0.7,0.0), shape);
    }
    else if(theme < 2.5){
        col = mix(vec3(0.1,0.0,0.2), vec3(0.9,0.0,1.0), shape);
    }
    else{
        col = vec3(shape);
    }

    // ---------------------
    // METALLIC LINES
    float lines = smoothstep(0.0, 0.02, abs(fract(mixVal * 10.0) - 0.5));
    col += vec3(1.0,0.8,0.2) * lines * 0.5;

    // ---------------------
    // GLOSS
    float gloss = pow(1.0 - mixVal, 6.0);
    col += gloss * 0.4;

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
