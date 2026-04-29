alert("EPOXY V32 BALANCED");

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
float random(vec2 st){
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.545);
}

float noise(vec2 st){
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0,0.0));
    float c = random(i + vec2(0.0,1.0));
    float d = random(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x)
         + (c-a)*u.y*(1.0-u.x)
         + (d-b)*u.x*u.y;
}

float fbm(vec2 st){
    float v = 0.0;
    float a = 0.5;

    for(int i=0;i<5;i++){
        v += a * noise(st);
        st *= 2.0;
        a *= 0.5;
    }
    return v;
}

// ---------------------
vec3 getColor(float n){

    if(theme < 0.5){
        return mix(vec3(0.0,0.2,0.6), vec3(0.2,0.8,1.0), n);
    }
    else if(theme < 1.5){
        return mix(vec3(0.6,0.05,0.0), vec3(1.0,0.8,0.1), n);
    }
    else if(theme < 2.5){
        return mix(vec3(0.1,0.0,0.3), vec3(0.9,0.0,1.0), n);
    }
    else{
        return mix(vec3(0.9), vec3(0.2), n);
    }
}

// ---------------------
void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;

    // 🌊 FLOW
    uv += vec2(
        fbm(uv * 2.0 + time * 0.2),
        fbm(uv * 2.0 - time * 0.15)
    ) * 0.2;

    float n = fbm(uv * 3.5);

    // 🎨 BASE BODY (IMPORTANT)
    vec3 base = getColor(n);

    // 🎯 VEINS (but softer now)
    float veins = abs(sin(n * 8.0));
    veins = pow(veins, 2.0);

    // 🔥 MIX BACK INTO BODY (KEY FIX)
    vec3 col = mix(base, base * 0.3, veins * 0.6);

    // ✨ GLOSS
    float gloss = pow(n, 6.0);
    col += gloss * 0.3;

    gl_FragColor = vec4(col, 1.0);
}
`;

// =====================
function createShader(gl, type, src){
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
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
