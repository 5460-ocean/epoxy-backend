const canvas = document.getElementById("glcanvas");

const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////

function createShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    console.log(gl.getShaderInfoLog(shader));

    return shader;
}

function createProgram(vsSource, fsSource) {

    const vs = createShader(
        gl.VERTEX_SHADER,
        vsSource
    );

    const fs = createShader(
        gl.FRAGMENT_SHADER,
        fsSource
    );

    const program = gl.createProgram();

    gl.attachShader(program, vs);

    gl.attachShader(program, fs);

    gl.linkProgram(program);

    return program;
}

////////////////////////////////////////////////////////
// FULLSCREEN QUAD
////////////////////////////////////////////////////////

const vertices = new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,

    -1, 1,
     1,-1,
     1, 1
]);

const quadBuffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

////////////////////////////////////////////////////////
// VERTEX SHADER
////////////////////////////////////////////////////////

const vertexShader = `
attribute vec2 position;

varying vec2 vUv;

void main(){

    vUv = position * 0.5 + 0.5;

    gl_Position = vec4(position,0.0,1.0);
}
`;

////////////////////////////////////////////////////////
// SIMULATION SHADER
////////////////////////////////////////////////////////

const simulationShader = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uPrev;

uniform float uTime;

////////////////////////////////////////////////////////
// RANDOM
////////////////////////////////////////////////////////

float random(vec2 st){

    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233))) *
        43758.5453123
    );
}

////////////////////////////////////////////////////////
// NOISE
////////////////////////////////////////////////////////

float noise(vec2 st){

    vec2 i = floor(st);

    vec2 f = fract(st);

    float a = random(i);

    float b = random(i + vec2(1.0,0.0));

    float c = random(i + vec2(0.0,1.0));

    float d = random(i + vec2(1.0,1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a,b,u.x)
        + (c-a)*u.y*(1.0-u.x)
        + (d-b)*u.x*u.y;
}

////////////////////////////////////////////////////////
// FBM
////////////////////////////////////////////////////////

float fbm(vec2 st){

    float value = 0.0;

    float amp = 0.5;

    for(int i=0;i<4;i++){

        value += amp * noise(st);

        st *= 2.0;

        amp *= 0.5;
    }

    return value;
}

void main(){

    vec2 uv = vUv;

    //////////////////////////////////////////////////////
    // PREVIOUS FRAME
    //////////////////////////////////////////////////////

    vec4 prev =
        texture2D(uPrev, uv);

    //////////////////////////////////////////////////////
    // FLOW FIELD
    //////////////////////////////////////////////////////

    float t = uTime * 0.08;

    vec2 velocity = vec2(

        fbm(uv * 2.0 + t),

        fbm(uv * 2.0 + 10.0 + t)

    ) - 0.5;

    //////////////////////////////////////////////////////
    // DIRECTIONAL TRANSPORT
    //////////////////////////////////////////////////////

    velocity += vec2(
        0.08,
        0.02
    );

    //////////////////////////////////////////////////////
    // ADVECTION
    //////////////////////////////////////////////////////

    vec2 advectedUV =
        uv - velocity * 0.015;

    vec4 transported =
        texture2D(
            uPrev,
            advectedUV
        );

    //////////////////////////////////////////////////////
    // INJECT NEW DENSITY
    //////////////////////////////////////////////////////

    float source =
        fbm(
            uv * 1.5 +
            velocity * 2.0
        );

    vec3 inject = mix(

        vec3(0.0),

        vec3(
            0.0,
            0.35,
            0.55
        ),

        source
    );

    //////////////////////////////////////////////////////
    // ACCUMULATE
    //////////////////////////////////////////////////////

    vec3 color = mix(

        transported.rgb,

        inject,

        0.02
    );

    //////////////////////////////////////////////////////
    // FADE
    //////////////////////////////////////////////////////

    color *= 0.995;

    gl_FragColor =
        vec4(color,1.0);
}
`;

////////////////////////////////////////////////////////
// RENDER SHADER
////////////////////////////////////////////////////////

const renderShader = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;

////////////////////////////////////////////////////////
// FBM
////////////////////////////////////////////////////////

float random(vec2 st){

    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233))) *
        43758.5453123
    );
}

float noise(vec2 st){

    vec2 i = floor(st);

    vec2 f = fract(st);

    float a = random(i);

    float b = random(i + vec2(1.0,0.0));

    float c = random(i + vec2(0.0,1.0));

    float d = random(i + vec2(1.0,1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a,b,u.x)
        + (c-a)*u.y*(1.0-u.x)
        + (d-b)*u.x*u.y;
}

float fbm(vec2 st){

    float value = 0.0;

    float amp = 0.5;

    for(int i=0;i<4;i++){

        value += amp * noise(st);

        st *= 2.0;

        amp *= 0.5;
    }

    return value;
}

void main(){

    vec2 uv = vUv;

    vec3 sim =
        texture2D(
            uTexture,
            uv
        ).rgb;

    //////////////////////////////////////////////////////
    // OCEAN BASE
    //////////////////////////////////////////////////////

    vec3 deep =
        vec3(0.01,0.03,0.08);

    vec3 cyan =
        vec3(0.0,0.72,0.78);

    vec3 color =
        mix(
            deep,
            cyan,
            sim.b * 1.4
        );

    //////////////////////////////////////////////////////
    // FLOW BOUNDARIES
    //////////////////////////////////////////////////////

    float edge =
        abs(
            dFdx(sim.b)
        ) +
        abs(
            dFdy(sim.b)
        );

    edge =
        smoothstep(
            0.02,
            0.08,
            edge
        );

    //////////////////////////////////////////////////////
    // GOLD VEINS
    //////////////////////////////////////////////////////

    float goldNoise =
        fbm(uv * 8.0);

    vec3 gold =
        vec3(1.0,0.82,0.3);

    color +=
        gold *
        edge *
        goldNoise *
        0.35;

    //////////////////////////////////////////////////////
    // PEARL FOAM
    //////////////////////////////////////////////////////

    float foam =
        smoothstep(
            0.65,
            0.9,
            edge
        );

    color +=
        vec3(0.9,0.95,1.0) *
        foam *
        0.12;

    //////////////////////////////////////////////////////
    // RESIN DEPTH
    //////////////////////////////////////////////////////

    float depth =
        fbm(uv * 10.0);

    color += depth * 0.04;

    gl_FragColor =
        vec4(color,1.0);
}
`;

////////////////////////////////////////////////////////
// PROGRAMS
////////////////////////////////////////////////////////

const simProgram =
    createProgram(
        vertexShader,
        simulationShader
    );

const renderProgram =
    createProgram(
        vertexShader,
        renderShader
    );

////////////////////////////////////////////////////////
// TEXTURES
////////////////////////////////////////////////////////

function createTexture(){

    const tex = gl.createTexture();

    gl.bindTexture(
        gl.TEXTURE_2D,
        tex
    );

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        canvas.width,
        canvas.height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.LINEAR
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
    );

    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
    );

    return tex;
}

function createFramebuffer(texture){

    const fb =
        gl.createFramebuffer();

    gl.bindFramebuffer(
        gl.FRAMEBUFFER,
        fb
    );

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
    );

    return fb;
}

////////////////////////////////////////////////////////
// PING PONG
////////////////////////////////////////////////////////

let texA = createTexture();
let texB = createTexture();

let fbA = createFramebuffer(texA);
let fbB = createFramebuffer(texB);

////////////////////////////////////////////////////////
// DRAW QUAD
////////////////////////////////////////////////////////

function setupQuad(program){

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        quadBuffer
    );

    const position =
        gl.getAttribLocation(
            program,
            "position"
        );

    gl.enableVertexAttribArray(
        position
    );

    gl.vertexAttribPointer(
        position,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
}

////////////////////////////////////////////////////////
// RENDER LOOP
////////////////////////////////////////////////////////

function render(time){

    time *= 0.001;

    //////////////////////////////////////////////////////
    // SIMULATION PASS
    //////////////////////////////////////////////////////

    gl.useProgram(simProgram);

    gl.bindFramebuffer(
        gl.FRAMEBUFFER,
        fbB
    );

    setupQuad(simProgram);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(
        gl.TEXTURE_2D,
        texA
    );

    gl.uniform1i(
        gl.getUniformLocation(
            simProgram,
            "uPrev"
        ),
        0
    );

    gl.uniform1f(
        gl.getUniformLocation(
            simProgram,
            "uTime"
        ),
        time
    );

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    //////////////////////////////////////////////////////
    // FINAL RENDER PASS
    //////////////////////////////////////////////////////

    gl.useProgram(renderProgram);

    gl.bindFramebuffer(
        gl.FRAMEBUFFER,
        null
    );

    setupQuad(renderProgram);

    gl.activeTexture(gl.TEXTURE0);

    gl.bindTexture(
        gl.TEXTURE_2D,
        texB
    );

    gl.uniform1i(
        gl.getUniformLocation(
            renderProgram,
            "uTexture"
        ),
        0
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    //////////////////////////////////////////////////////
    // SWAP
    //////////////////////////////////////////////////////

    let tempTex = texA;
    texA = texB;
    texB = tempTex;

    let tempFb = fbA;
    fbA = fbB;
    fbB = tempFb;

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

////////////////////////////////////////////////////////
// RESIZE
////////////////////////////////////////////////////////

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
