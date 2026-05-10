
const canvas = document.getElementById("glcanvas");

const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertex = `
attribute vec2 position;

void main() {

    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `

precision highp float;

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265359

/*
=========================
HASH / NOISE
=========================
*/

float hash(vec2 p) {

    return fract(
        sin(dot(p, vec2(127.1,311.7)))
        * 43758.5453123
    );
}

float noise(vec2 p) {

    vec2 i = floor(p);

    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);

    float b = hash(i + vec2(1.0,0.0));

    float c = hash(i + vec2(0.0,1.0));

    float d = hash(i + vec2(1.0,1.0));

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}

float fbm(vec2 p) {

    float v = 0.0;

    float a = 0.5;

    for(int i=0;i<7;i++) {

        v += noise(p) * a;

        p *= 2.0;

        a *= 0.5;
    }

    return v;
}

/*
=========================
CURL FLOW FIELD
=========================
*/

vec2 curl(vec2 p) {

    float e = 0.1;

    float n1 =
        fbm(p + vec2(0.0, e));

    float n2 =
        fbm(p - vec2(0.0, e));

    float a =
        (n1 - n2) / (2.0 * e);

    float n3 =
        fbm(p + vec2(e, 0.0));

    float n4 =
        fbm(p - vec2(e, 0.0));

    float b =
        (n3 - n4) / (2.0 * e);

    return vec2(a, -b);
}

/*
=========================
WARPED FLOW
=========================
*/

vec2 flowField(vec2 uv) {

    float t =
        uTime * 0.12;

    vec2 p =
        uv * 1.8;

    vec2 c1 =
        curl(p + t);

    vec2 c2 =
        curl(p * 2.0 - t);

    vec2 c3 =
        curl(p * 4.0 + t * 0.5);

    p += c1 * 1.2;

    p += c2 * 0.6;

    p += c3 * 0.25;

    p.x += t * 0.22;

    return p;
}

/*
=========================
RIDGE
=========================
*/

float ridge(float v) {

    return 1.0 - abs(v * 2.0 - 1.0);
}

/*
=========================
MAIN
=========================
*/

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        uResolution.xy;

    uv.x *=
        uResolution.x /
        uResolution.y;

    /*
    =========================
    FLOW
    =========================
    */

    vec2 flow =
        flowField(uv);

    /*
    =========================
    LARGE OCEAN MASSES
    =========================
    */

    float macro =
        fbm(flow * 0.45);

    macro =
        smoothstep(
            0.28,
            0.82,
            macro
        );

    /*
    =========================
    RIVER CHANNELS
    =========================
    */

    float channels =
        ridge(
            fbm(flow * 1.4)
        );

    channels =
        pow(channels, 2.4);

    /*
    =========================
    FLOW COMPRESSION
    =========================
    */

    float compression =
        smoothstep(
            0.35,
            0.85,
            channels
        );

    /*
    =========================
    SECONDARY RIVERS
    =========================
    */

    float rivers =
        ridge(
            fbm(flow * 3.2)
        );

    rivers =
        pow(rivers, 3.0);

    /*
    =========================
    GOLD RIDGES
    =========================
    */

    float ridgeMask =
        abs(channels - rivers);

    ridgeMask =
        smoothstep(
            0.08,
            0.18,
            ridgeMask
        );

    /*
    =========================
    FOAM CELLS
    =========================
    */

    float foam =
        fbm(flow * 10.0);

    foam =
        smoothstep(
            0.72,
            0.92,
            foam
        );

    foam *= ridgeMask;

    /*
    =========================
    DEPTH STACKING
    =========================
    */

    vec3 abyss =
        vec3(
            0.01,
            0.03,
            0.08
        );

    vec3 deepBlue =
        vec3(
            0.0,
            0.12,
            0.22
        );

    vec3 cyan =
        vec3(
            0.0,
            0.45,
            0.58
        );

    vec3 shallow =
        vec3(
            0.45,
            0.82,
            0.78
        );

    vec3 ocean =
        mix(
            abyss,
            deepBlue,
            macro
        );

    ocean =
        mix(
            ocean,
            cyan,
            compression * 0.7
        );

    ocean =
        mix(
            ocean,
            shallow,
            rivers * 0.3
        );

    /*
    =========================
    GOLD
    =========================
    */

    vec3 gold =
        vec3(
            1.0,
            0.82,
            0.25
        );

    ocean +=
        gold *
        ridgeMask *
        1.6;

    /*
    =========================
    FOAM MEMBRANES
    =========================
    */

    ocean +=
        foam *
        0.4;

    /*
    =========================
    TRANSLUCENT RESIN FOG
    =========================
    */

    float fog =
        fbm(
            uv * 0.7
        );

    ocean *=
        0.8 + fog * 0.35;

    /*
    =========================
    PEARL SHEEN
    =========================
    */

    float sheen =
        pow(
            max(
                0.0,
                sin(
                    flow.x * 8.0 +
                    flow.y * 4.0 +
                    uTime
                )
            ),
            8.0
        );

    ocean +=
        sheen * 0.08;

    gl_FragColor =
        vec4(ocean, 1.0);
}
`;

function shader(type, source) {

    const s =
        gl.createShader(type);

    gl.shaderSource(s, source);

    gl.compileShader(s);

    return s;
}

const program =
    gl.createProgram();

gl.attachShader(
    program,
    shader(gl.VERTEX_SHADER, vertex)
);

gl.attachShader(
    program,
    shader(gl.FRAGMENT_SHADER, fragment)
);

gl.linkProgram(program);

gl.useProgram(program);

const vertices =
new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,
    -1, 1,
     1,-1,
     1, 1
]);

const buffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
);

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

window.addEventListener(
    "resize",
    () => {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;
    }
);

