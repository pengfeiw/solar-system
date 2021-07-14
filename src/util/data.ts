
import {vec3} from "gl-matrix";

/**
 * 获得球体的顶点坐标，中心为(0, 0, 0)点，绘制模式为gl.DRAW_TRIANGLES 
 * @return {顶点，法向量，纹理坐标}
 */
export const getSpherePositions_drawTriangles = (splitCountH: number, splitCountV: number, radius: number) => {
    const vertices: number[] = []; // 最终结果
    const normals: number[] = []; // 法向量
    const textureCoords: number[] = []; // 纹理坐标

    const circlePointCount = splitCountV; // 纬线一圈的点数
    let topPoints: vec3[] = []; // 北极点
    for (let i = 0; i < circlePointCount; i++) {
        topPoints.push([0, radius, 0]);
    }

    const texShortX = 1 / splitCountV;
    const texShortY = 1 / splitCountH;

    // 1.从上往下，添加每一圈的面
    for (let i = 0; i < splitCountH - 1; i++) {
        const angle = (i + 1) * Math.PI / splitCountH;
        const y = Math.cos(angle) * radius; // y值（竖直长度）
        const xz = Math.sin(angle) * radius; // 水平长度

        const curCirclePoints: vec3[] = [];
        // 计算x和z
        for (let ii = 0; ii < circlePointCount; ii++) {
            const anglexz = ii * Math.PI * 2 / circlePointCount;

            const x = Math.cos(anglexz) * xz;
            const z = Math.sin(anglexz) * xz;

            curCirclePoints.push([x, y, z]);
        }

        const texYT = 1 - i * texShortY;
        const texYD = 1 - (i + 1) * texShortY;

        // 添加要绘制的面
        for (let ii = 0; ii < circlePointCount - 1; ii++) {
            vertices.push(topPoints[ii][0], topPoints[ii][1], topPoints[ii][2]);
            vertices.push(curCirclePoints[ii][0], curCirclePoints[ii][1], curCirclePoints[ii][2]);
            vertices.push(topPoints[ii + 1][0], topPoints[ii + 1][1], topPoints[ii + 1][2]);

            vertices.push(curCirclePoints[ii][0], curCirclePoints[ii][1], curCirclePoints[ii][2]);
            vertices.push(topPoints[ii + 1][0], topPoints[ii + 1][1], topPoints[ii + 1][2]);
            vertices.push(curCirclePoints[ii + 1][0], curCirclePoints[ii + 1][1], curCirclePoints[ii + 1][2]);

            // 纹理坐标
            const texX1 = texShortX * ii;
            const texX2 = texShortX * (ii + 1);

            textureCoords.push(texX1, texYT);
            textureCoords.push(texX1, texYD);
            textureCoords.push(texX2, texYD);
            textureCoords.push(texX1, texYD);
            textureCoords.push(texX2, texYD);
            textureCoords.push(texX2, texYT);
        }

        // 最后一个面
        vertices.push(topPoints[circlePointCount - 1][0], topPoints[circlePointCount - 1][1], topPoints[circlePointCount - 1][2]);
        vertices.push(curCirclePoints[circlePointCount - 1][0], curCirclePoints[circlePointCount - 1][1], curCirclePoints[circlePointCount - 1][2]);
        vertices.push(topPoints[0][0], topPoints[0][1], topPoints[0][2]);

        vertices.push(curCirclePoints[circlePointCount - 1][0], curCirclePoints[circlePointCount - 1][1], curCirclePoints[circlePointCount - 1][2]);
        vertices.push(topPoints[0][0], topPoints[0][1], topPoints[0][2]);
        vertices.push(curCirclePoints[0][0], curCirclePoints[0][1], curCirclePoints[0][2]);

        // 纹理坐标
        const texX1 = 1 - texShortX;
        const texX2 = 1;
        textureCoords.push(texX1, texYT);
        textureCoords.push(texX1, texYD);
        textureCoords.push(texX2, texYD);
        textureCoords.push(texX1, texYD);
        textureCoords.push(texX2, texYD);
        textureCoords.push(texX2, texYT);

        topPoints = curCirclePoints;
    }

    // 2. 最后一圈
    // 添加要绘制的面
    const texYT = texShortY;
    const texYD = 0;
    for (let i = 0; i < circlePointCount - 1; i++) {
        vertices.push(topPoints[i][0], topPoints[i][1], topPoints[i][2]);
        vertices.push(0, -radius, 0);
        vertices.push(topPoints[i + 1][0], topPoints[i + 1][1], topPoints[i + 1][2]);

        vertices.push(0, -radius, 0);
        vertices.push(topPoints[i + 1][0], topPoints[i + 1][1], topPoints[i + 1][2]);
        vertices.push(0, -radius, 0);

        // 纹理坐标
        const texX1 = texShortX * i;
        const texX2 = texShortX * (i + 1);

        textureCoords.push(texX1, texYT);
        textureCoords.push(texX1, texYD);
        textureCoords.push(texX2, texYD);
        textureCoords.push(texX1, texYD);
        textureCoords.push(texX2, texYD);
        textureCoords.push(texX2, texYT);
    }
    // 最后一个面
    vertices.push(topPoints[circlePointCount - 1][0], topPoints[circlePointCount - 1][1], topPoints[circlePointCount - 1][2]);
    vertices.push(0, -radius, 0);
    vertices.push(topPoints[0][0], topPoints[0][1], topPoints[0][2]);

    vertices.push(0, -radius, 0);
    vertices.push(topPoints[0][0], topPoints[0][1], topPoints[0][2]);
    vertices.push(0, -radius, 0);

    // 纹理坐标
    const texX1 = 1 - texShortX;
    const texX2 = 1;
    textureCoords.push(texX1, texYT);
    textureCoords.push(texX1, texYD);
    textureCoords.push(texX2, texYD);
    textureCoords.push(texX1, texYD);
    textureCoords.push(texX2, texYD);
    textureCoords.push(texX2, texYT);

    // 法向量
    for (let i = 0; i < vertices.length - 18; i += 18) {
        const vec11: vec3 = [vertices[i + 3] - vertices[i], vertices[i + 4] - vertices[i + 1], vertices[i + 5] - vertices[i + 2]];
        const vec12: vec3 = [vertices[i + 6] - vertices[i + 3], vertices[i + 7] - vertices[i + 4], vertices[i + 8] - vertices[i + 5]];
        const norml1 = vec3.cross(vec3.create(), vec11, vec12);
        vec3.normalize(norml1, norml1);

        const vec21: vec3 = [vertices[i + 12] - vertices[i + 9], vertices[i + 13] - vertices[i + 10], vertices[i + 14] - vertices[i + 11]];
        const vec22: vec3 = [vertices[i + 15] - vertices[i + 12], vertices[i + 16] - vertices[i + 13], vertices[i + 17] - vertices[i + 14]];
        const norml2 = vec3.cross(vec3.create(), vec22, vec21);
        vec3.normalize(norml2, norml2);

        normals.push(norml1[0], norml1[1], norml1[2]);
        normals.push(norml1[0], norml1[1], norml1[2]);
        normals.push(norml1[0], norml1[1], norml1[2]);

        normals.push(norml2[0], norml2[1], norml2[2]);
        normals.push(norml2[0], norml2[1], norml2[2]);
        normals.push(norml2[0], norml2[1], norml2[2]);
    }

    return {vertices, normals, textureCoords};
};
