const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

////////////////////////////////////////////////////////
// VERTEX SHADER
////////////////////////////////////////////////////////

const vertexShaderSource = `
attribute vec2 position;

varying vec2 vUv;

void main() {

    vUv = position * 0.5 + 0.5;

    gl_Position = vec4(position, 0.0, 1.0);
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

float random(vec2 st) {

    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233))) *
        43758.5453123
    );
}

////////////////////////////////////////////////////////
// NOISE
////////////////////////////////////////////////////////

float noise(vec2 st) {

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

float fbm(vec2 st) {

    float value = 0.0;
    float amp = 0.5;

    for(int i=0;i<5;i++) {

        value += amp * noise(st);

        st *= 2.0;

        amp *= 0.5;
    }

    return value;
}

////////////////////////////////////////////////////////
// DIRECTIONAL FLUID ADVECTION
////////////////////////////////////////////////////////


vec2 advect(vec2 uv) {

    float t = uTime * 0.12;

    //////////////////////////////////////////////////////
    // DIRECTIONAL OCEAN TRANSPORT
    //////////////////////////////////////////////////////

    vec2 dir = normalize(vec2(
        1.0,
        0.35
    ));

    uv += dir * t;

    //////////////////////////////////////////////////////
    // STRETCHED FLOW SPACE
    //////////////////////////////////////////////////////

    vec2 stretched = vec2(
        uv.x * 0.35,
        uv.y * 1.4
    );

    //////////////////////////////////////////////////////
    // LARGE CURRENTS
    //////////////////////////////////////////////////////

    vec2 current1 = vec2(

        fbm(stretched * 0.25),

        fbm(stretched * 0.25 + 8.0)
    );

    uv += (current1 - 0.5) * 1.8;

    //////////////////////////////////////////////////////
    // SECONDARY FLUID SWIRL
    //////////////////////////////////////////////////////

    vec2 current2 = vec2(

        fbm(stretched * 0.55 + 20.0),

        fbm(stretched * 0.55 + 40.0)
    );

    uv += (current2 - 0.5) * 0.45;

    //////////////////////////////////////////////////////
    // LONG FLOWING DISTORTION
    //////////////////////////////////////////////////////

    uv.x += sin(uv.y * 2.0 + t) * 0.18;

    return uv;
}


void main() {

    vec2 uv = vUv;

    uv -= 0.5;

    //////////////////////////////////////////////////////
    // FLOW FIELD
    //////////////////////////////////////////////////////

    vec2 flow = advect(uv * 1.2);

    //////////////////////////////////////////////////////
    // MACRO COMPOSITION
    //////////////////////////////////////////////////////

    float macro =
        fbm(flow * 0.12);

    float macro2 =
        fbm(flow * 0.18 + 20.0);

    float riverMask =
        smoothstep(
            0.42,
            0.72,
            macro
        );

    //////////////////////////////////////////////////////
    // LARGE SWEEPING RIVERS
    //////////////////////////////////////////////////////

    float riverFlow =
        fbm(
            flow * 0.6 +
            macro2 * 2.0
        );

    float ocean =
        mix(
            riverFlow,
            macro,
            0.65
        );

    ocean =
        smoothstep(
            0.25,
            0.78,
            ocean
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
        vec3(0.88,0.94,1.0);

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
            riverFlow * 0.68
        );

    //////////////////////////////////////////////////////
    // SUBSURFACE DEPTH
    //////////////////////////////////////////////////////

    float depth1 =
        fbm(flow * 2.5);

    float depth2 =
        fbm(flow * 5.0);

    color += depth1 * 0.05;
    color += depth2 * 0.025;

    //////////////////////////////////////////////////////
    // GOLD FOLLOWS BOUNDARIES
    //////////////////////////////////////////////////////

    float boundary =
        abs(macro - riverFlow);

    boundary =
        smoothstep(
            0.035,
            0.09,
            boundary
        );

    float goldNoise =
        fbm(flow * 6.0);

    float goldMask =
        smoothstep(
            0.72,
            0.86,
            goldNoise
        );

    vec3 gold =
        vec3(1.0,0.82,0.32);

    color +=
        gold *
        boundary *
        goldMask *
        0.22;

    //////////////////////////////////////////////////////
    // FOAM ONLY IN RIVER REGIONS
    //////////////////////////////////////////////////////

    float foamField =
        fbm(flow * 10.0);

    float foam =
        smoothstep(
            0.82,
            0.94,
            foamField
        );

    foam *= boundary * riverMask;

    color +=
        pearl *
        foam *
        0.12;

    //////////////////////////////////////////////////////
    // MICRO DETAIL
    //////////////////////////////////////////////////////

    float micro =
        fbm(flow * 18.0);

    color += micro * 0.006;

    //////////////////////////////////////////////////////
    // DEPTH PARALLAX
    //////////////////////////////////////////////////////

    float parallax =
        fbm(
            flow * 1.8 +
            vec2(
                uTime * 0.03,
                uTime * 0.01
            )
        );

    color += parallax * 0.025;

    //////////////////////////////////////////////////////
    // RESIN GLOW
    //////////////////////////////////////////////////////

    color += vec3(
        0.02,
        0.05,
        0.08
    ) * ocean;

    //////////////////////////////////////////////////////
    // FINAL
    //////////////////////////////////////////////////////

    gl_FragColor =
        vec4(color,1.0);
}
`;

////////////////////////////////////////////////////////
// SHADER COMPILER
////////////////////////////////////////////////////////

function createShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    console.log(gl.getShaderInfoLog(shader));

    return shader;
}

const vertexShader = createShader(
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
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
    gl.getAttribLocation(program, "position");

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
    gl.getUniformLocation(program, "uTime");

////////////////////////////////////////////////////////
// RENDER LOOP
////////////////////////////////////////////////////////

function render(time) {

    time *= 0.001;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

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

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
