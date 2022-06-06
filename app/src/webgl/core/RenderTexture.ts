import Texture2D from './Texture2D';
import Renderer from './Renderer';
import IRenderTarget from "./IRenderTarget";

/**
 * Created by mdavids on 01-05-2016.
 */
//http://jsfiddle.net/greggman/AYqEy/
class RenderTexture extends Texture2D implements IRenderTarget {

    public frameBuffer:WebGLFramebuffer;
    public sizeMultiplier:number = 1;
    public depthBuffer:WebGLRenderbuffer;
    public depthTexture:Texture2D;
    public normalTexture:Texture2D;

    protected _scaleToCanvas:boolean = false;
    protected _dynamic:boolean = false;
    protected _renderAttachments:number[] = [];

    constructor(
        renderer:Renderer,
        width:number = 1,
        height:number = 1,
        registerIndex:number = -1,
        scaleToCanvas:boolean = false,
        filterLinear:boolean = false,
        wrapClamp:boolean = true,
        useDepth:boolean = false,
        useFloat:boolean = false,
        normal:boolean = false,
        dynamic:boolean = false
    )
    {
        super(renderer, registerIndex, false, filterLinear, wrapClamp, useFloat);

        this._scaleToCanvas = scaleToCanvas;
        this._dynamic = dynamic;

        var gl = this.renderer.context;
        this.frameBuffer = gl.createFramebuffer();

        if (normal) {
          this.normalTexture = new Texture2D(this.renderer, this.registerIndex + 2, false, filterLinear, this._wrapClamp, false);
          this._renderAttachments = [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1];

        } else {
          this._renderAttachments = [gl.COLOR_ATTACHMENT0];
        }

        if (useDepth) this.createDepthBuffer(width, height);

        this.setTextureSize(width, height);
    }

    public getScaleToCanvas():boolean
    {
      return this._scaleToCanvas;
    }

    private createDepthBuffer(width:number, height:number)
    {
        var gl = this.renderer.context;

        this.depthTexture = new Texture2D(this.renderer, this.registerIndex + 1, false, false, this._wrapClamp, false);

        //this.depthBuffer = gl.createRenderbuffer();
        //gl.bindRenderbuffer( gl.RENDERBUFFER, this.depthBuffer );
        //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    }

    public setAsTarget():void
    {
        var gl = this.renderer.context;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureGL, 0);

        if (this.normalTexture) {
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, gl.TEXTURE_2D, this.normalTexture.textureGL, 0);
        }

        if (this.depthTexture){
          this.renderer.setDepthMask(true);
          //gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,  gl.RENDERBUFFER, this.depthBuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture.textureGL, 0);
        }

        gl.drawBuffers(this._renderAttachments);
    }

    public setSize(width:number, height:number):void
    {
      this.setTextureSize(width, height);
    }

    public setTextureSize(width:number, height:number):void
    {
        if (width == this.width && height == this.height) return;

        var gl = this.renderer.context;

        /*if (this.depthBuffer) {
            gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        }*/

        this.width = width;
        this.height = height;
        this.aspect = this.width / this.height;

        var internalFormat = this.useFloat? gl.RGBA32F : gl.RGBA8;
        var format = gl.RGBA;
        var type = this.useFloat? gl.FLOAT : gl.UNSIGNED_BYTE;

        this.bind();

        if (this._scaleToCanvas || this._dynamic) {
          gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, this.width, this.height, 0, format, type, null);

        } else {
          gl.texStorage2D(gl.TEXTURE_2D, 1, internalFormat, this.width, this.height);
        }

        if (this.normalTexture) {
          this.normalTexture.bind();
          this.normalTexture.width = this.width;
          this.normalTexture.height = this.height;
          gl.texImage2D(gl.TEXTURE_2D, 0, format, this.width, this.height, 0, format, type, null);
        }

        if (this.depthTexture) {
          this.depthTexture.bind();

          //gl.texParameteri(gl.TEXTURE_2D, 0x884B, //GL_DEPTH_TEXTURE_MODE, GL_INTENSITY);
          //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_MODE, 0x884E); //GL_COMPARE_R_TO_TEXTURE);
          //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_COMPARE_FUNC, gl.EQUAL);
          this.depthTexture.width = this.width;
          this.depthTexture.height = this.height;
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, this.width, this.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        }
    }

    public getPixel(u:number, v:number):Uint8Array
    {
        var gl: WebGLRenderingContext = this.renderer.context;
        this.setAsTarget();

        var data = new Uint8Array(1 * 1 * 4);
        gl.readPixels(u * this.width, v * this.height, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return data;
    }

    public getImageData(offX:number = 0, offY:number = 0, width:number = 0, height:number = 0):Uint8Array
    {
        var sizeX:number = width <= 0? this.width : width;
        var sizeY:number = height <= 0? this.height: height;

        var gl: WebGLRenderingContext = this.renderer.context;
        this.setAsTarget();

        var data = new Uint8Array(sizeX * sizeY * 4);
        gl.readPixels(offX, offY, sizeX, sizeY, gl.RGBA, gl.UNSIGNED_BYTE, data);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        return data;
    }

    destruct()
    {
      var gl:WebGLRenderingContext = this.renderer.context;

        if (this.frameBuffer) {
            gl.deleteFramebuffer(this.frameBuffer);
        }

        if (this.depthTexture) {
          this.depthTexture.destruct();
        }

        if (this.normalTexture) {
          this.normalTexture.destruct();
        }

        if (this.depthBuffer) {
          gl.deleteBuffer(this.depthBuffer);
        }

        this.frameBuffer = null;
        this.depthBuffer = null;
        this.depthTexture = null;
        this.normalTexture = null;

        // always call this last
        super.destruct();
    }
}
export default RenderTexture;
