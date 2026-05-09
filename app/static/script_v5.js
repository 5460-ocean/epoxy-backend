const canvas = document.getElementById("glcanvas");

const gl = canvas.getContext("webgl");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const vertexShaderSource = `
attribute vec2 position;
varying vec2 vUv;

void main(){

    vUv = position * 0.5 + 0.5;

    gl_Position = vec4(position,0.0,1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

varying vec2 vUv;

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

    for(int i=0;i<7;i++){

        value += amp * noise(st);

        st *= 2.0;

        amp *= 0.5;
    }

    return value;
}

////////////////////////////////////////////////////////
// FLOW FIELD
////////////////////////////////////////////////////////

vec2 flowField(vec2 uv){

    vec2 flow = uv;

    float t = uTime * 0.06;

    flow.x +=
        sin(flow.y * 2.0 + t) * 0.4;

    flow.y +=
        cos(flow.x * 1.5 - t) * 0.35;

    flow += vec2(
        fbm(flow * 1.2),
        fbm(flow * 1.2 + 7.0)
    ) * 0.2;

    return flow;
}

void main(){

    vec2 uv = vUv;

    uv -= 0.5;

    //////////////////////////////////////////////////////
    // FLOW
    //////////////////////////////////////////////////////

    vec2 flow =
        flowField(uv * 2.0);

    //////////////////////////////////////////////////////
    // LARGE OCEAN MASSES
    //////////////////////////////////////////////////////

    float mass1 =
        fbm(flow * 1.0);

    float mass2 =
        fbm(flow * 2.0 + 8.0);

    float ocean =
        smoothstep(
            0.2,
            0.85,
            mass1
        );

    //////////////////////////////////////////////////////
    // COLORS
    //////////////////////////////////////////////////////

    vec3 deep =
        vec3(0.01,0.03,0.08);

    vec3 blue =
        vec3(0.0,0.22,0.42);

    vec3 cyan =
        vec3(0.0,0.68,0.78);

    vec3 pearl =
        vec3(0.85,0.95,1.0);

    vec3 color =
        mix(
            deep,
            blue,
            ocean
        );

    color =
        mix(
            color,
            cyan,
            mass2 * 0.55
        );

    //////////////////////////////////////////////////////
    // RESIN DEPTH
    //////////////////////////////////////////////////////

    float depth1 =
        fbm(flow * 5.0);

    float depth2 =
        fbm(flow * 10.0);

    color += depth1 * 0.05;

    color += depth2 * 0.025;

    //////////////////////////////////////////////////////
    // GOLD BOUNDARIES
    //////////////////////////////////////////////////////

    float boundary =
        abs(mass1 - mass2);

    boundary =
        smoothstep(
            0.05,
            0.12,
            boundary
        );

    float goldNoise =
        fbm(flow * 18.0);

    float goldMask =
        smoothstep(
            0.58,
            0.75,
            goldNoise
        );

    vec3 gold =
        vec3(1.0,0.82,0.35);

    color +=
        gold *
        boundary *
        goldMask *
        0.45;

    //////////////////////////////////////////////////////
    // FOAM REGIONS
    //////////////////////////////////////////////////////

    float foamField =
        fbm(flow * 14.0);

    float foam =
        smoothstep(
            0.74,
            0.9,
            foamField
        );

    foam *= boundary;

    color +=
        pearl *
        foam *
        0.22;

    //////////////////////////////////////////////////////
    // MICRO TURBULENCE
    //////////////////////////////////////////////////////

    float micro =
        fbm(flow * 40.0);

    color += micro * 0.018;

    //////////////////////////////////////////////////////
    // PEARL METALLIC
    //////////////////////////////////////////////////////

    float sheen =
        smoothstep(
            0.3,
            1.0,
            mass2
        );

    color +=
        vec3(0.12,0.18,0.2) *
        sheen *
        0.14;

    //////////////////////////////////////////////////////
    // FINAL
    //////////////////////////////////////////////////////

    gl_FragColor =
        vec4(color,1.0);
}
`;

function createShader(type, source){

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    return shader;
}

const vertexShader =
    createShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

const fragmentShader =
    createShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );

const program = gl.createProgram();

gl.attachShader(program, vertexShader);

gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

const vertices = new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,

    -1, 1,
     1,-1,
     1, 1
]);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const position =
    gl.getAttribLocation(
        program,
        "position"
    );

gl.enableVertexAttribArray(position);

gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

const uTime =
    gl.getUniformLocation(
        program,
        "uTime"
    );

function render(time){

    time *= 0.001;

    canvas.width =
        canvas.clientWidth;

    canvas.height =
        canvas.clientHeight;

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTime, time);

    gl.drawArrays(gl.TRIANGLES,0,6);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
