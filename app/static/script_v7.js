const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265359

// -----------------------------------
// HASH
// -----------------------------------

float hash(vec2 p) {
    return fract(
        sin(dot(p, vec2(127.1, 311.7))) *
        43758.5453123
    );
}

// -----------------------------------
// NOISE
// -----------------------------------

float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );
}

// -----------------------------------
// FBM
// -----------------------------------

float fbm(vec2 p) {

    float value = 0.0;
    float amp = 0.5;

    for(int i = 0; i < 6; i++) {

        value += noise(p) * amp;

        p *= 2.0;
        amp *= 0.5;
    }

    return value;
}

// -----------------------------------
// FLOW FIELD
// -----------------------------------

vec2 riverFlow(vec2 uv) {

    float t = uTime * 0.06;

    uv.x += sin(uv.y * 1.8 + t) * 0.25;
    uv.y += cos(uv.x * 1.5 - t) * 0.20;

    uv.x += sin(uv.y * 4.0 + t * 0.7) * 0.08;
    uv.y += cos(uv.x * 3.0 - t * 0.5) * 0.08;

    return uv;
}

// -----------------------------------
// MAIN
// -----------------------------------

void main() {

    vec2 uv = gl_FragCoord.xy / uResolution.xy;

    uv -= 0.5;
    uv.x *= uResolution.x / uResolution.y;

    // -----------------------------------
    // LONG FLOW STREAKS
    // -----------------------------------

    vec2 flowUV = riverFlow(uv * 2.0);

    flowUV.x += uTime * 0.015;

    // -----------------------------------
    // MACRO OCEAN MASSES
    // -----------------------------------

    float basinA =
        fbm(flowUV * 0.8);

    float basinB =
        fbm(flowUV * 1.4 + 4.0);

    float basinC =
        fbm(flowUV * 2.2 - 2.0);

    float ocean =
        basinA * 0.55 +
        basinB * 0.30 +
        basinC * 0.15;

    // -----------------------------------
    // FLOW RIDGES
    // -----------------------------------

    float ridge =
        abs(
            basinA - basinB
        );

    ridge =
        smoothstep(
            0.08,
            0.28,
            ridge
        );

    // -----------------------------------
    // GOLD ENERGY LINES
    // -----------------------------------

    float goldMask =
        ridge *
        smoothstep(
            0.25,
            0.75,
            basinB
        );

    // -----------------------------------
    // TRANSLUCENT FLOW
    // -----------------------------------

    float translucent =
        fbm(flowUV * 0.6);

    translucent =
        smoothstep(
            0.1,
            0.9,
            translucent
        );

    // -----------------------------------
    // DEEP NAVY
    // -----------------------------------

    vec3 deepOcean = vec3(
        0.01,
        0.05,
        0.12
    );

    // -----------------------------------
    // TEAL TRANSPORT
    // -----------------------------------

    vec3 tealFlow = vec3(
        0.00,
        0.36,
        0.48
    );

    // -----------------------------------
    // CYAN BLOOM
    // -----------------------------------

    vec3 cyanBloom = vec3(
        0.30,
        0.75,
        0.85
    );

    // -----------------------------------
    // PEARL HAZE
    // -----------------------------------

    vec3 pearl = vec3(
        0.85,
        0.92,
        0.95
    );

    // -----------------------------------
    // GOLD VEINS
    // -----------------------------------

    vec3 gold = vec3(
        1.0,
        0.82,
        0.35
    );

    // -----------------------------------
    // VOLUME STYLE FLOW RENDERING
    // -----------------------------------

    vec3 color = deepOcean;

    // large basin accumulation
    color += tealFlow * ocean * 1.2;

    // translucent resin transport
    color += cyanBloom *
             translucent *
             0.25;

    // pearl metallic sheen
    color += pearl *
             pow(translucent, 3.0) *
             0.12;

    // gold ONLY on ridge masks
    color += gold *
             goldMask *
             0.65;

    // -----------------------------------
    // REMOVE HARD CONTOURS
    // -----------------------------------

    color = mix(
        color,
        vec3(
            dot(color, vec3(0.333))
        ),
        0.03
    );

    // -----------------------------------
    // SUBSURFACE DEPTH
    // -----------------------------------

    float depth =
        fbm(flowUV * 0.35);

    color *=
        0.82 +
        depth * 0.35;

    // -----------------------------------
    // MICRO PARTICLES
    // -----------------------------------

    float sparkle =
        pow(
            noise(flowUV * 18.0),
            14.0
        );

    color += sparkle * 0.08;

    // -----------------------------------
    // SOFT CINEMATIC GLOW
    // -----------------------------------

    color =
        pow(
            color,
            vec3(0.92)
        );

    gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        console.error(
            gl.getShaderInfoLog(shader)
        );
    }

    return shader;
}

const vertexShader =
    compileShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

const fragmentShader =
    compileShader(
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

const uResolution =
    gl.getUniformLocation(
        program,
        "uResolution"
    );

function render(time) {

    time *= 0.001;

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(
        uTime,
        time
    );

    gl.uniform2f(
        uResolution,
        canvas.width,
        canvas.height
    );

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
