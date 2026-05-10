const canvas = document.getElementById("glcanvas");

const gl = canvas.getContext("webgl");

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

////////////////////////////////////////////////////////
// VERTEX SHADER
////////////////////////////////////////////////////////

const vertexShaderSource = `
attribute vec2 position;

varying vec2 vUv;

void main(){

    vUv = position * 0.5 + 0.5;

    gl_Position = vec4(position,0.0,1.0);
}
`;

////////////////////////////////////////////////////////
// FRAGMENT SHADER
////////////////////////////////////////////////////////

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

    for(int i=0;i<5;i++){

        value += amp * noise(st);

        st *= 2.0;

        amp *= 0.5;
    }

    return value;
}

////////////////////////////////////////////////////////
// DIRECTIONAL FLOW
////////////////////////////////////////////////////////

vec2 advect(vec2 uv){

    float t = uTime * 0.05;

    //////////////////////////////////////////////////////
    // CONSTANT DRIFT
    //////////////////////////////////////////////////////

    uv += vec2(
        t * 0.18,
        t * 0.05
    );

    //////////////////////////////////////////////////////
    // MACRO WARP
    //////////////////////////////////////////////////////

    vec2 warp1 = vec2(

        fbm(uv * 0.5),

        fbm(uv * 0.5 + 8.0)
    );

    uv += (warp1 - 0.5) * 0.8;

    //////////////////////////////////////////////////////
    // SECONDARY FLOW
    //////////////////////////////////////////////////////

    vec2 warp2 = vec2(

        fbm(uv * 1.2 + 20.0),

        fbm(uv * 1.2 + 30.0)
    );

    uv += (warp2 - 0.5) * 0.25;

    return uv;
}

void main(){

    vec2 uv = vUv;

    uv -= 0.5;

    //////////////////////////////////////////////////////
    // FLOW FIELD
    //////////////////////////////////////////////////////

    vec2 flow = advect(uv * 1.4);

    //////////////////////////////////////////////////////
    // MASSIVE OCEAN REGIONS
    //////////////////////////////////////////////////////

    float river1 =
        fbm(flow * 0.4);

    float river2 =
        fbm(flow * 0.8 + 12.0);

    float ocean =
        smoothstep(
            0.18,
            0.82,
            river1
        );

    //////////////////////////////////////////////////////
    // COLORS
    //////////////////////////////////////////////////////

    vec3 deep =
        vec3(0.01,0.03,0.08);

    vec3 blue =
        vec3(0.0,0.22,0.42);

    vec3 cyan =
        vec3(0.0,0.72,0.78);

    vec3 pearl =
        vec3(0.9,0.96,1.0);

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
            river2 * 0.45
        );

    //////////////////////////////////////////////////////
    // SUBSURFACE DEPTH
    //////////////////////////////////////////////////////

    float depth1 =
        fbm(flow * 3.0);

    float depth2 =
        fbm(flow * 6.0);

    color += depth1 * 0.06;

    color += depth2 * 0.03;

    //////////////////////////////////////////////////////
    // GOLD BOUNDARIES
    //////////////////////////////////////////////////////

    float boundary =
        abs(river1 - river2);

    boundary =
        smoothstep(
            0.04,
            0.09,
            boundary
        );

    float goldNoise =
        fbm(flow * 10.0);

    float gold =
        smoothstep(
            0.72,
            0.84,
            goldNoise
        );

    vec3 goldColor =
        vec3(1.0,0.84,0.38);

    color +=
        goldColor *
        boundary *
        gold *
        0.16;

    //////////////////////////////////////////////////////
    // FOAM CELLS
    //////////////////////////////////////////////////////

    float foamField =
        fbm(flow * 12.0);

    float foam =
        smoothstep(
            0.76,
            0.92,
            foamField
        );

    foam *= boundary;

    color +=
        pearl *
        foam *
        0.14;

    //////////////////////////////////////////////////////
    // MICRO DETAIL
    //////////////////////////////////////////////////////

    float micro =
        fbm(flow * 20.0);

    color += micro * 0.01;

    //////////////////////////////////////////////////////
    // FINAL
    //////////////////////////////////////////////////////

    gl_FragColor =
        vec4(color,1.0);
}
`;

////////////////////////////////////////////////////////
// SHADER CREATION
////////////////////////////////////////////////////////

function createShader(type, source){

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    console.log(gl.getShaderInfoLog(shader));

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

////////////////////////////////////////////////////////
// PROGRAM
////////////////////////////////////////////////////////

const program = gl.createProgram();

gl.attachShader(program, vertexShader);

gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);

////////////////////////////////////////////////////////
// GEOMETRY
////////////////////////////////////////////////////////

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

////////////////////////////////////////////////////////
// UNIFORMS
////////////////////////////////////////////////////////

const uTime =
    gl.getUniformLocation(
        program,
        "uTime"
    );

////////////////////////////////////////////////////////
// RENDER LOOP
////////////////////////////////////////////////////////

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

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
