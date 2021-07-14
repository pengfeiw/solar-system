import {glMatrix, mat4, vec3} from "gl-matrix";

const YAW = -90;
const PITCH = 0;
const SPEED = 2.5;
const SENSITIVITY = 0.1;
const ZOOM = 45;

export enum Camera_Movement {
    FORWARD,
    BACKWARD,
    LEFT,
    RIGHT
}

class Camera {
    /**camera world position */
    public position: vec3;
    /**camera view direction */
    public front: vec3 = [0, 0, -1];
    /**camera up direction: the positive direction of camera y axis */
    public up: vec3 = [0, 1, 0];
    /**camera right direction: the positive direction of camera x axis */
    public right: vec3 = [1, 0, 0];
    /**up direction of world coordinate: positive direction of world y axis */
    public worldUp: vec3;
    /**yaw angle: 偏航角 */
    public yaw: number;
    /**pitch angle: 俯仰角 */
    public pitch: number;
    /**camera move speed */
    public movementSpeed: number = SPEED;
    /**the sensitivity of mouse */
    public mouseSensitivity: number = SENSITIVITY;
    public zoom: number = ZOOM;

    /**
     * 创建一个相机
     * @param position camera world position, the default value is [0, 0, 0]
     * @param worldUp up direction of world, the default value is [0, 1, 0]
     * @param yaw yaw angle.
     * @param pitch pitch angle.
     */
    public constructor(position: vec3 = [0, 0, 0], worldUp: vec3 = [0, 1, 0], yaw: number = YAW, pitch: number = PITCH) {
        this.position = position;
        this.worldUp = worldUp;
        this.yaw = yaw;
        this.pitch = pitch;

        this.updateCameraVectors();
    }

    /**
     * 获得当前的观察矩阵
     */
    public getViewMatrix() {
        const center = vec3.add(vec3.create(), this.position, this.front);
        return mat4.lookAt(mat4.create(), this.position, center, this.up);
    }

    /**
     * 相机移动，可以配合键盘模拟相机移动的效果
     */
    public processKeyboard(direction: Camera_Movement, deltaTime: number) {
        const velocity = this.movementSpeed * deltaTime;
        switch (direction) {
            case Camera_Movement.FORWARD:
                var movement = vec3.scale(vec3.create(), this.front, velocity);
                vec3.add(this.position, this.position, movement);
                break;
            case Camera_Movement.BACKWARD:
                var movement = vec3.scale(vec3.create(), this.front, velocity);
                vec3.sub(this.position, this.position, movement);
                break;
            case Camera_Movement.LEFT:
                var movement = vec3.scale(vec3.create(), this.right, velocity);
                vec3.sub(this.position, this.position, movement);
                break;
            case Camera_Movement.RIGHT:
                var movement = vec3.scale(vec3.create(), this.right, velocity);
                vec3.add(this.position, this.position, movement);
                break;
            default:
                break;
        }
    }

    /**
     * 处理鼠标移动，改变偏航角和俯仰角，模拟摄像机转向动作
     */
    public processMouseMovement(xoffset: number, yoffset: number, constrainPitch: boolean = true) {
        xoffset *= this.mouseSensitivity;
        yoffset *= this.mouseSensitivity;

        this.yaw += xoffset;
        this.pitch -= yoffset;
        if (constrainPitch) {
            if (this.pitch > 89) this.pitch = 89;
            if (this.pitch < -89) this.pitch = -89;
        }

        this.updateCameraVectors();
    }

    public processMouseScroll(yoffset: number) {
        this.zoom += yoffset;
        if (this.zoom < 1) this.zoom = 1;
        if (this.zoom > 60) this.zoom = 60;

        this.updateCameraVectors();
    }

    private updateCameraVectors() {
        const x = Math.cos(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        const y = Math.sin(glMatrix.toRadian(this.pitch));
        const z = Math.sin(glMatrix.toRadian(this.yaw)) * Math.cos(glMatrix.toRadian(this.pitch));
        vec3.normalize(this.front, [x, y, z]);
        vec3.cross(this.right, this.front, this.worldUp);
        vec3.cross(this.up, this.right, this.front);
    }
}

export default Camera;
