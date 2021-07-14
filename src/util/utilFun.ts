export const resizeCanvas = (gl: WebGL2RenderingContext) => {
    const canvas = gl.canvas as HTMLCanvasElement;
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width != displayWidth || canvas.height != displayHeight) {
        canvas.height = displayHeight;
        canvas.width = displayWidth;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
};
