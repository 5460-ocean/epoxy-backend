alert("EPOXY V6 SHARP");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = 300;

let t = 0;
let theme = "ocean";

const themes = {
    ocean: [[0,80,200],[0,150,255],[200,240,255]],
    fire: [[180,20,0],[255,100,0],[255,200,0]],
    galaxy: [[20,0,50],[120,0,200],[255,0,180]],
    marble: [[240,240,240],[200,200,200],[100,100,100]]
};

function detectTheme(prompt){
    const p = prompt.toLowerCase();
    if(p.includes("fire")) return "fire";
    if(p.includes("ocean")||p.includes("water")) return "ocean";
    if(p.includes("galaxy")) return "galaxy";
    if(p.includes("marble")) return "marble";
    return "ocean";
}

// 🔥 sharper noise (less blur)
function noise(x,y,t){
    return Math.sin(x*0.05+t*1.5)+Math.cos(y*0.05-t*1.2);
}

// 🪨 STRONG veins (clear structure)
function veins(x,y,t){
    return Math.abs(Math.sin((x+y)*0.03 + noise(x,y,t)*2));
}

// 🎨 color
function getColor(v, vein){
    const p = themes[theme];

    let n = (v+2)/4;
    n = Math.max(0,Math.min(1,n));

    let c;
    if(n<0.5){
        const k=n*2;
        c = [
            p[0][0]+(p[1][0]-p[0][0])*k,
            p[0][1]+(p[1][1]-p[0][1])*k,
            p[0][2]+(p[1][2]-p[0][2])*k
        ];
    } else {
        const k=(n-0.5)*2;
        c = [
            p[1][0]+(p[2][0]-p[1][0])*k,
            p[1][1]+(p[2][1]-p[1][1])*k,
            p[1][2]+(p[2][2]-p[1][2])*k
        ];
    }

    // 🪨 apply strong veins (visible lines)
    const veinStrength = 0.6;
    c[0] *= (1 - vein * veinStrength);
    c[1] *= (1 - vein * veinStrength);
    c[2] *= (1 - vein * veinStrength);

    return c;
}

// 💎 SHARP highlight streak (not blur)
function highlight(x,y,t){
    const line = Math.sin(x*0.1 + t*3);
    return Math.abs(line) > 0.95 ? 1 : 0;
}

// 🎬 render
function draw(){
    const img = ctx.createImageData(canvas.width, canvas.height);

    for(let x=0;x<canvas.width;x++){
        for(let y=0;y<canvas.height;y++){

            const i=(x+y*canvas.width)*4;

            const v = noise(x,y,t);
            const vein = veins(x,y,t);

            const c = getColor(v, vein);

            // 💎 add sharp reflection line
            const h = highlight(x,y,t);
            if(h > 0){
                c[0] = 255;
                c[1] = 255;
                c[2] = 255;
            }

            img.data[i] = c[0];
            img.data[i+1] = c[1];
            img.data[i+2] = c[2];
            img.data[i+3] = 255;
        }
    }

    ctx.putImageData(img,0,0);

    t += 0.06; // faster visible motion
    requestAnimationFrame(draw);
}

// 🎯 input → theme
document.getElementById("generateBtn").onclick = ()=>{
    const prompt = document.getElementById("promptInput").value;
    theme = detectTheme(prompt);
};

draw();
