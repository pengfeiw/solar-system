import draw from "./solarSystem";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2");

if (!gl) {
    console.log("抱歉你的浏览器不支持webgl");
}

draw(gl);
