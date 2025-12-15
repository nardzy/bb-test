
import fragment_str from "./bb.frag";
import vertex_str from "./bb.vert";

const unwrap_gl2 = (canvas: OffscreenCanvas) => {
    const gl = canvas.getContext("webgl2");
    if (!gl) throw new Error("inmyu gl2");
    return gl;
};
const unwrap_ctx = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("inmyu ctx");
    return ctx;
};
const unwrap_uloc = (gl: WebGL2RenderingContext, program: WebGLProgram, name: string) => {
    const location = gl.getUniformLocation(program, name);
    if (!location) throw new Error("inarigahaittenai");
    return location;
}
const bracket = () => document.createElement("br");
type InputCallback = (file: File) => void;
class InputContainer {
    private parent = document.createElement("input");
    private callbacks: InputCallback[] = [];
    constructor(append: Node) {
        append.appendChild(this.parent);
        this.initialize();
    }
    private initialize() {
        this.parent.type = "file";
        this.parent.addEventListener("input", () => {

            const file = this.parent.files?.item(0);
            if (!file) {
                alert("please select valid video file inmustonikisugiinn");
                return;
            }

            this.callback(file);
            
        });
    }
    bind_callback(callback: InputCallback) {
        this.callbacks.push(callback);
    }
    private callback(file: File) {
        for (const callback of this.callbacks) {
            callback(file);
        }
    }
}
export class ViewContainer {

    private canvas = document.createElement("canvas");
    private ctx = unwrap_ctx(this.canvas);
    private bb: BBContainer;
    private delta_time = 0.0;
    private time = 0.0;

    private input: InputContainer;

    constructor(append: Node) {
        append.appendChild(this.canvas);
        this.bb = new BBContainer(append);
        append.appendChild(bracket());
        this.input = new InputContainer(append);
        this.initialize();
    }
    private initialize() {

        this.canvas.width = 19;
        this.canvas.height = 19;
        this.canvas.addEventListener("contextlost", () => {
            alert("kbtit context lost");
            this.ctx = unwrap_ctx(this.canvas);
        });

        this.canvas.addEventListener("contextrestored", () => {
            alert("kbtit context restored");
        });

        const bind = (time: number) => {
            this.render(time);
            requestAnimationFrame(bind);
        };
        requestAnimationFrame(bind);

        this.input.bind_callback(async file => {
            const [w, h] = await this.bb.bind_source(file);
            this.canvas.width = w;
            this.canvas.height = h;
        });

    }
    render(time: number) {

        this.delta_time = time - this.time;
        this.time = time;

        if (this.delta_time > 1000) {
            console.warn("drop_warn", this.delta_time);
        }
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // ctx.fillStyle = "#000";
        // ctx.globalAlpha = 1.0;
        // ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
// 
        // ctx.fillText(this.delta_time.toString(), 0, 0);

        const output = this.bb.write();

        ctx.drawImage(output, 0, 0, this.canvas.width, this.canvas.height);

    }
}
class BBContainer {
    private canvas = new OffscreenCanvas(1,1);
    private gl = unwrap_gl2(this.canvas);
    private video = document.createElement("video");
    private resolution!: WebGLUniformLocation;
    private data!: WebGLUniformLocation;
    private texture!: WebGLTexture;
    constructor(append: Node) {
        this.video.controls = true;
        append.appendChild(this.video);
        this.initialize();
    }
    private initialize() {
        
        this.canvas.addEventListener("contextlost", () => {
            alert("yjsnpi gl2 lost");
            this.gl = unwrap_gl2(this.canvas);
        });

        this.canvas.addEventListener("contextrestored", () => {
            alert("yjsnpi gl2 restored");
        });
        this.gl_init();
    }
    private gl_init() {

        const gl = this.gl;

        const vertex = gl.createShader(gl.VERTEX_SHADER);
        if (!vertex) throw new Error("verteeex");

        gl.shaderSource(vertex, vertex_str);
        gl.compileShader(vertex);

        const fragment = gl.createShader(gl.FRAGMENT_SHADER);
        if (!fragment) throw new Error("fraaaa");

        gl.shaderSource(fragment, fragment_str);
        gl.compileShader(fragment);

        const program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.useProgram(program);

        const vao = gl.createVertexArray();

        gl.bindVertexArray(vao);

        const vbo = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]), gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        const ibo = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([
            0, 1, 2,
            1, 2, 3
        ]), gl.STATIC_DRAW);

        this.resolution = unwrap_uloc(gl, program, "resolution");
        this.data = unwrap_uloc(gl, program, "data");
        this.texture = gl.createTexture();

    }
    async bind_source(source: MediaSource | Blob): Promise<[number,number]> {

        return new Promise(res => {

            const src = URL.createObjectURL(source);
            this.video.src = src;

            this.video.onloadedmetadata = () => {

                const w = this.video.videoWidth;
                const h = this.video.videoHeight;

                this.canvas.width = w;
                this.canvas.height = h;

                const gl = this.gl;

                gl.viewport(0, 0, w, h);
                gl.uniform2f(this.resolution, w, h);
                gl.uniform4f(this.data, 0, 0, w, h);

                res([w, h]);

            };

        });

    }
    
    write() {
        const gl = this.gl;

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            this.video
        );

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        gl.flush();
        return this.canvas;
    }
}