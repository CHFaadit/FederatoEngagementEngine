const base = `data:image/png;base64, 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`;

let speed = 35;
let scale = 3; // Image scale (I work on 1080p monitor)
let canvas;
let ctx;
let logoColor;

let dvd = {
    x: 200,
    y: 300,
    xspeed: 10,
    yspeed: 10,
    img: new Image()
};

function main(){
    canvas = document.getElementById("tv-screen");
    ctx = canvas.getContext("2d");
    dvd.img.src = base;

    //Draw the "tv screen"
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    pickColor();
    update();
}
main();

function update() {
    setTimeout(() => {
        //Draw the canvas background
        ctx.fillStyle = '#';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //Draw DVD Logo and his background
        ctx.fillStyle = logoColor;
        ctx.fillRect(dvd.x, dvd.y, dvd.img.width*scale, dvd.img.height*scale);
        ctx.drawImage(dvd.img, dvd.x, dvd.y, dvd.img.width*scale, dvd.img.height*scale);
        //Move the logo
        dvd.x+=dvd.xspeed;
        dvd.y+=dvd.yspeed;
        //Check for collision
        checkHitBox();
        update();
    }, speed)
}

//Check for border collision
function checkHitBox(){
    if(dvd.x+dvd.img.width*scale >= canvas.width || dvd.x <= 0){
        dvd.xspeed *= -1;
        pickColor();
    }

    if(dvd.y+dvd.img.height*scale >= canvas.height || dvd.y <= 0){
        dvd.yspeed *= -1;
        pickColor();
    }
}

//Pick a random color in RGB format
function pickColor(){
    r = Math.random() * (254 - 0) + 0;
    g = Math.random() * (254 - 0) + 0;
    b = Math.random() * (254 - 0) + 0;

    logoColor = 'rgb('+r+','+g+', '+b+')';
}

addEventListener("resize", (event) => {location.reload()});

let png = base;
