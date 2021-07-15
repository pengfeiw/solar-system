
import {vec3, mat4, glMatrix} from "gl-matrix";
import Shader from "../util/shader";
import {resizeCanvas} from "../util/utilFun";
import {getSpherePositions_drawTriangles as getSphereVertices} from "../util/data";
import {
    vertex_source_sun, fragment_source_sun, vertex_source, fragment_source, vertex_source_line, fragment_source_line,
    vertex_source_background, fragment_source_background
} from "./glsl";

const backgroundImage = require("./image/background.jpg");
const sunImage = require("./image/sun.jpg");
const earthImage = require("./image/earth.jpg"); // 地球
const mercuryImage = require("./image/mercury.jpg"); // 水星
const venusImage = require("./image/venus.jpg"); // 金星
const marsImage = require("./image/mars.jpg"); // 火星
const jupiterImage = require("./image/jupiter.jpg"); // 木星
const saturnImage = require("./image/saturn.jpg"); // 土星
const uranusImage = require('./image/uranus.jpg'); // 天王星
const neptuneImage = require("./image/neptune.jpg"); // 海王星

interface Star {
    name: string;
    diameter: number;
    texImage: any;
    center: vec3;
    rotation: number; // 自转速度
    revolutionSpeed?: number; // 公转速度
    starRingOuterRadius?: number;  // 行星环外圈半径
    starRingInnerRadius?: number; // 行星环内圈半径
    starRingAxis?: vec3; // 行星环轴, 旋转角度[x, y, z]
}

const stars: Star[] = [
    {
        name: "太阳",
        diameter: 30,
        texImage: sunImage,
        center: [0, 0, 0],
        rotation: 0.2,
    },
    {
        name: "水星",
        diameter: 3,
        texImage: mercuryImage,
        center: [20.5, 0, 0],
        revolutionSpeed: 4.7,
        rotation: 0.2
    },
    {
        name: "金星",
        diameter: 8,
        texImage: venusImage,
        center: [30, 0, 0],
        revolutionSpeed: 3.5,
        rotation: 0.2
    },
    {
        name: "地球",
        diameter: 7,
        texImage: earthImage,
        center: [42, 0, 0],
        revolutionSpeed: 3.0,
        rotation: 0.2
    },
    {
        name: "火星",
        diameter: 6,
        texImage: marsImage,
        center: [54, 0, 0],
        revolutionSpeed: 2.4,
        rotation: 0.2
    },
    {
        name: "木星",
        diameter: 14,
        texImage: jupiterImage,
        center: [70, 0, 0],
        revolutionSpeed: 1.3,
        rotation: 0.2
    },
    {
        name: "土星",
        diameter: 9,
        texImage: saturnImage,
        center: [88, 0, 0],
        revolutionSpeed: 0.96,
        starRingOuterRadius: 10,
        starRingInnerRadius: 8,
        starRingAxis: [Math.PI * 0.25, Math.PI * 0.45, 0],
        rotation: 0.2
    },
    {
        name: "天王星",
        diameter: 10,
        texImage: uranusImage,
        center: [105, 0, 0],
        revolutionSpeed: 0.7,
        rotation: 0.2
    },
    {
        name: "海王星",
        diameter: 12,
        texImage: neptuneImage,
        center: [125, 0, 0],
        revolutionSpeed: 0.55,
        rotation: 0.2
    }
];

const sun = stars[0];
const planets = stars.slice(1);

const cameraPos: vec3 = [60, -250, 90];

// circle半径为1
const getCirclePoints = (): number[] => {
    const vertices: number[] = [];

    // 圆弧划分成1000段
    for (let i = 0; i < 1000; i++) {
        const angle = i / 1000 * Math.PI * 2;
        const x = Math.cos(angle);
        const y = Math.sin(angle);
        vertices.push(x, y, 0);
    }

    vertices.push(vertices[0]);

    return vertices;
};

/**
 * 获得行星环的顶点数据
 * @param or 外圈半径
 * @param ir 内圈半径
 */
const getRingPoints = (or: number, ir: number) => {
    const vertices: number[] = [];
    const texCoords: number[] = [];

    const outerPoints: vec3[] = [];
    const innerPoints: vec3[] = [];
    // 圆弧划分成200段
    for (let i = 0; i < 200; i++) {
        const angle = i / 200 * Math.PI * 2;
        const x = Math.cos(angle) * or;
        const y = Math.sin(angle) * or;
        outerPoints.push([x, y, 0]);

        const x2 = Math.cos(angle) * ir;
        const y2 = Math.sin(angle) * ir;
        innerPoints.push([x2, y2, 0]);
    }

    const texShortX = 1 / 200;

    for (let i = 0; i < outerPoints.length - 1; i++) {
        vertices.push(outerPoints[i][0], outerPoints[i][1], outerPoints[i][2]);
        vertices.push(innerPoints[i][0], innerPoints[i][1], innerPoints[i][2]);
        vertices.push(outerPoints[i + 1][0], outerPoints[i + 1][1], outerPoints[i + 1][2]);

        vertices.push(innerPoints[i][0], innerPoints[i][1], innerPoints[i][2]);
        vertices.push(outerPoints[i + 1][0], outerPoints[i + 1][1], outerPoints[i + 1][2]);
        vertices.push(innerPoints[i + 1][0], innerPoints[i + 1][1], innerPoints[i + 1][2]);

        // 纹理坐标
        const texX1 = i * texShortX;
        const texX2 = (i + 1) * texShortX;
        texCoords.push(texX1, 1);
        texCoords.push(texX1, 0);
        texCoords.push(texX2, 1);
        texCoords.push(texX1, 0);
        texCoords.push(texX2, 1);
        texCoords.push(texX2, 0);
    }

    vertices.push(outerPoints[outerPoints.length - 1][0], outerPoints[outerPoints.length - 1][1], outerPoints[outerPoints.length - 1][2]);
    vertices.push(innerPoints[innerPoints.length - 1][0], innerPoints[innerPoints.length - 1][1], innerPoints[innerPoints.length - 1][2]);
    vertices.push(outerPoints[0][0], outerPoints[0][1], outerPoints[0][2]);
    vertices.push(innerPoints[innerPoints.length - 1][0], innerPoints[innerPoints.length - 1][1], innerPoints[innerPoints.length - 1][2]);
    vertices.push(outerPoints[0][0], outerPoints[0][1], outerPoints[0][2]);
    vertices.push(innerPoints[0][0], innerPoints[0][1], innerPoints[0][2]);

    const texX1 = 1, texX2 = 0;
    // 纹理坐标
    texCoords.push(texX1, 1);
    texCoords.push(texX1, 0);
    texCoords.push(texX2, 1);
    texCoords.push(texX1, 0);
    texCoords.push(texX2, 1);
    texCoords.push(texX2, 0);

    return {vertices, texCoords};
};

const spaceVertices = [
    -1, 1, 0, // lt
    -1, -1, 0, // ld
    1, 1, 0, // rt
    -1, -1, 0, // ld
    1, 1, 0, // rt
    1, -1, 0 // rd
];
const spaceTexCoords = [
    0, 1, // lt
    0, 0, // ld
    1, 1, // rt
    0, 0, // ld
    1, 1, // rt
    1, 0 // rd
];

const draw = (gl: WebGL2RenderingContext) => {
    gl.enable(gl.DEPTH_TEST);
    // 背景program
    const spaceShader = new Shader(gl, vertex_source_background, fragment_source_background);

    // 太阳program
    const sunShader = new Shader(gl, vertex_source_sun, fragment_source_sun);

    // 行星program
    const planetShader = new Shader(gl, vertex_source, fragment_source);

    // 公转线program
    const revolutionLineShader = new Shader(gl, vertex_source_line, fragment_source_line);

    // ---space
    const spaceVao = gl.createVertexArray();
    gl.bindVertexArray(spaceVao);
    const spaceVbo = gl.createBuffer();
    const spacePosLocation = gl.getAttribLocation(spaceShader.program, "aPos");
    gl.bindBuffer(gl.ARRAY_BUFFER, spaceVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spaceVertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(spacePosLocation);
    gl.vertexAttribPointer(spacePosLocation, 3, gl.FLOAT, false, 0, 0);

    const spaceTexVbo = gl.createBuffer();
    const spaceTexLocation = gl.getAttribLocation(spaceShader.program, "aTexCoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, spaceTexVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(spaceTexCoords), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(spaceTexLocation);
    gl.vertexAttribPointer(spaceTexLocation, 2, gl.FLOAT, false, 0, 0);

    const backgroundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    const imgEle = document.createElement("img") as HTMLImageElement;
    imgEle.src = backgroundImage;
    imgEle.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, imgEle);
    }

    // ---sun
    const sunVao = gl.createVertexArray();
    gl.bindVertexArray(sunVao);
    const sunVbo = gl.createBuffer();
    const {vertices: sunVertices, textureCoords: sunTexCoords} = getSphereVertices(100, 100, sun.diameter / 2);
    const sunPosLocation = gl.getAttribLocation(sunShader.program, "aPos");
    gl.bindBuffer(gl.ARRAY_BUFFER, sunVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunVertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(sunPosLocation);
    gl.vertexAttribPointer(sunPosLocation, 3, gl.FLOAT, false, 0, 0);

    const sunTexVbo = gl.createBuffer();
    const sunTexLocation = gl.getAttribLocation(sunShader.program, "aTexCoord");
    gl.bindBuffer(gl.ARRAY_BUFFER, sunTexVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sunTexCoords), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(sunTexLocation);
    gl.vertexAttribPointer(sunTexLocation, 2, gl.FLOAT, false, 0, 0);

    const sunTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sunTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    const sunImgEle = document.createElement("img") as HTMLImageElement;
    sunImgEle.src = sun.texImage;
    sunImgEle.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, sunTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, sunImgEle);
    }

    // ---planets
    const starVaos: WebGLVertexArrayObject[] = [];
    const planetTextures: WebGLTexture[] = [];
    for (let i = 0; i < planets.length; i++) {
        const planetVao = gl.createVertexArray();
        gl.bindVertexArray(planetVao);

        const {vertices: planetVertices, normals: planetNormals, textureCoords: planetTexCoords} = getSphereVertices(100, 100, planets[i].diameter / 2);

        const planetVbo = gl.createBuffer();
        const planetPosLocation = gl.getAttribLocation(planetShader.program, "aPos");
        gl.bindBuffer(gl.ARRAY_BUFFER, planetVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planetVertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(planetPosLocation);
        gl.vertexAttribPointer(planetPosLocation, 3, gl.FLOAT, false, 0, 0);

        const planetNormalVbo = gl.createBuffer();
        const planetNormalLocation = gl.getAttribLocation(planetShader.program, "aNorm");
        gl.bindBuffer(gl.ARRAY_BUFFER, planetNormalVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planetNormals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(planetNormalLocation);
        gl.vertexAttribPointer(planetNormalLocation, 3, gl.FLOAT, false, 0, 0);

        const planetTexVbo = gl.createBuffer();
        const planetTexLocation = gl.getAttribLocation(planetShader.program, "aTexCoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, planetTexVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(planetTexCoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(planetTexLocation);
        gl.vertexAttribPointer(planetTexLocation, 2, gl.FLOAT, false, 0, 0);

        // 纹理
        const starTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, starTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        const starImgEle = document.createElement("img") as HTMLImageElement;
        starImgEle.src = planets[i].texImage;
        starImgEle.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, starTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, starImgEle);
        }
        planetTextures.push(starTexture);

        starVaos.push(planetVao);
    }

    // ---行星环
    const starRingVaos: WebGLVertexArrayObject[] = [];
    const starRingVertices: number[][] = [];
    for (let i = 0; i < planets.length; i++) {
        const withRing = planets[i].starRingAxis && planets[i].starRingOuterRadius && planets[i].starRingInnerRadius;
        if (!withRing) {
            starRingVaos.push(null);
            starRingVertices.push([]);
            continue;
        }

        const ringVao = gl.createVertexArray();
        gl.bindVertexArray(ringVao);

        const {vertices: ringVertices, texCoords: ringTexCoords} = getRingPoints(planets[i].starRingOuterRadius, planets[i].starRingInnerRadius);
        starRingVertices.push(ringVertices);
        const ringPosVbo = gl.createBuffer();
        const ringPosLocation = gl.getAttribLocation(planetShader.program, "aPos");
        gl.bindBuffer(gl.ARRAY_BUFFER, ringPosVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ringVertices), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ringPosLocation);
        gl.vertexAttribPointer(ringPosLocation, 3, gl.FLOAT, false, 0, 0);

        const ringNormals: number[] = [];
        for (let j = 0; j < ringVertices.length / 3; j++) {
            ringNormals.push(0, 1, 0);
        }
        const ringNormalVbo = gl.createBuffer();
        const ringNormalLocation = gl.getAttribLocation(planetShader.program, "aNorm");
        gl.bindBuffer(gl.ARRAY_BUFFER, ringNormalVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ringNormals), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ringNormalLocation);
        gl.vertexAttribPointer(ringNormalLocation, 3, gl.FLOAT, false, 0, 0);

        const ringTexVbo = gl.createBuffer();
        const ringTexLocation = gl.getAttribLocation(planetShader.program, "aTexCoord");
        gl.bindBuffer(gl.ARRAY_BUFFER, ringTexVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ringTexCoords), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(ringTexLocation);
        gl.vertexAttribPointer(ringTexLocation, 2, gl.FLOAT, false, 0, 0);

        starRingVaos.push(ringVao);
    }

    // ---公转线
    const lineVao = gl.createVertexArray();
    gl.bindVertexArray(lineVao);
    const lineVbo = gl.createBuffer();
    const linePosAttLocation = gl.getAttribLocation(revolutionLineShader.program, "aPos");
    const linePoints = getCirclePoints();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(linePoints), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(linePosAttLocation);
    gl.vertexAttribPointer(linePosAttLocation, 3, gl.FLOAT, false, 0, 0);

    const initAngles: number[] = []; // 给各个行星一个初始角度
    for (let i = 0; i < planets.length; i++) {
        const angle = Math.random() * Math.PI * 2;
        initAngles.push(angle);
    }
    var cameraX = 0, cameraY = 0;
    const drawScene = (time: number) => {
        resizeCanvas(gl);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const projection = mat4.perspective(mat4.create(), glMatrix.toRadian(45), gl.canvas.width / gl.canvas.height, 0.1, 1000);
        const cx = Math.min(cameraX += 0.25, cameraPos[0]);
        const cy = Math.max(cameraY -= 0.7, cameraPos[1]);
        const view = mat4.lookAt(mat4.create(), [cx, cy, cameraPos[2]], [0, 0, 0], [0, 1, 0]);

        // ---space
        spaceShader.useProgram();
        gl.bindVertexArray(spaceVao);
        gl.bindTexture(gl.TEXTURE_2D, backgroundTexture);
        gl.disable(gl.DEPTH_TEST);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.enable(gl.DEPTH_TEST);

        // ---太阳
        sunShader.useProgram();
        gl.bindVertexArray(sunVao);
        sunShader.setMat4("projection", projection);
        sunShader.setMat4("model", mat4.rotateZ(mat4.create(), mat4.create(), time * 0.001 * sun.rotation));
        sunShader.setMat4("view", view);
        gl.bindTexture(gl.TEXTURE_2D, sunTexture);
        gl.drawArrays(gl.TRIANGLES, 0, sunVertices.length / 3);

        // ---行星
        planetShader.useProgram();
        planetShader.setMat4("projection", projection);
        planetShader.setFloat3("sunLightColor", 1, 1, 1);
        planetShader.setFloat3("sunPos", 0, 0, 0);
        planetShader.setMat4("view", view);
        for (let i = 0; i < starVaos.length; i++) {
            gl.bindVertexArray(starVaos[i]);

            const model = mat4.create();
            mat4.rotateZ(model, model, time * 0.0001 * planets[i].revolutionSpeed);
            mat4.rotateZ(model, model, initAngles[i]);
            mat4.translate(model, model, planets[i].center);
            mat4.rotateZ(model, model, time * 0.001 *planets[i].rotation);

            planetShader.setMat4("model", model);
            gl.bindTexture(gl.TEXTURE_2D, planetTextures[i]);
            gl.drawArrays(gl.TRIANGLES, 0, sunVertices.length / 3);
        }

        // ---行星环
        for (let i = 0; i < starRingVaos.length; i++) {
            if (starRingVaos[i]) {
                gl.bindVertexArray(starRingVaos[i]);

                const model = mat4.create();
                mat4.rotateZ(model, model, time * 0.0001 * planets[i].revolutionSpeed);
                mat4.rotateZ(model, model, initAngles[i]);
                mat4.translate(model, model, planets[i].center);
                mat4.rotateZ(model, model, planets[i].starRingAxis[2]);
                mat4.rotateY(model, model, planets[i].starRingAxis[1]);
                mat4.rotateX(model, model, planets[i].starRingAxis[0]);

                planetShader.setMat4("model", model);
                gl.bindTexture(gl.TEXTURE_2D, planetTextures[i]);
                gl.drawArrays(gl.TRIANGLES, 0, starRingVertices[i].length / 3);
            }
        }

        revolutionLineShader.useProgram();
        gl.bindVertexArray(lineVao);
        revolutionLineShader.setMat4("projection", projection);
        revolutionLineShader.setMat4("view", view);

        for (let i = 0; i < planets.length; i++) {
            const disToSun = vec3.dist(planets[i].center, sun.center);
            const model = mat4.create();
            mat4.scale(model, model, [disToSun, disToSun, 1]);

            revolutionLineShader.setMat4("model", model);
            gl.drawArrays(gl.LINE_STRIP, 0, linePoints.length / 3);
        }

        requestAnimationFrame(drawScene);
    }

    requestAnimationFrame(drawScene);
};

export default draw;
