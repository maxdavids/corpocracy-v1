import Renderer from "./Renderer";
import IRenderTarget from "./IRenderTarget";

/**
 * Created by mdavids on 21/4/2017.
 */
class RenderBuffer implements IRenderTarget {

  public frameBuffer:WebGLFramebuffer;
  public sizeMultiplier:number = 1.0;
  public depthBuffer:WebGLRenderbuffer;
  public colorBuffer:WebGLRenderbuffer;

  protected _renderer:Renderer;
  protected _filterLinear:boolean = true;
  protected _useFloat:boolean = false;
  protected _useDepth:boolean = false;
  protected _multisampled:boolean = true;
  protected _scaleToCanvas:boolean = false;

  public width:number = -1;
  public height:number = -1;
  public aspect:number = 0;

  constructor(renderer:Renderer, width:number = -1, height:number = -1, scaleToCanvas:boolean = false, filterLinear:boolean = false, useDepth:boolean = false, useFloat:boolean = false,)
  {
    this._renderer = renderer;
    this._scaleToCanvas = scaleToCanvas;
    this._filterLinear = filterLinear;
    this._useFloat = useFloat;
    this._useDepth = useDepth;
    this._multisampled = true;

    this.setSize(width, height);

    var gl = this._renderer.context;
    this.frameBuffer = gl.createFramebuffer();

    this.createColorBuffer(width, height);
    if (this._useDepth) this.createDepthBuffer(width, height);
  }

  public getScaleToCanvas():boolean
  {
    return this._scaleToCanvas;
  }

  private createColorBuffer(width:number, height:number)
  {
    var gl = this._renderer.context;
    this.colorBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.colorBuffer);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, width, height);
  }

  private createDepthBuffer(width:number, height:number)
  {
    var gl = this._renderer.context;
    this.depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer( gl.RENDERBUFFER, this.depthBuffer );
    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.DEPTH_COMPONENT16, width, height);
  }

  public setAsTarget():void
  {
    var gl = this._renderer.context;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    if (this.colorBuffer){
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.colorBuffer);
    }

    if (this.depthBuffer){
      //this.renderer.renderState.setDepthTest(true);
      this._renderer.setDepthMask(true);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT,  gl.RENDERBUFFER, this.depthBuffer);
    }
  }

  public setSize(width:number, height:number):void
  {
    if (width == this.width && height == this.height) return;

    this.width = width;
    this.height = height;
    this.aspect = this.width / this.height;

    var gl = this._renderer.context;

    if (this.colorBuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.colorBuffer);

      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.RGBA8, width, height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    if (this.depthBuffer) {
      gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);

      //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, 4, gl.DEPTH_COMPONENT16, this.width, this.height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    //var internalFormat = this.useFloat? gl.RGBA16F : gl.RGBA8;
    //var format = gl.RGBA;
    //var type = this.useFloat? gl.FLOAT : gl.UNSIGNED_BYTE;
  }

  destruct()
  {
    if (this.frameBuffer) {
      var gl:WebGLRenderingContext = this._renderer.context;
      gl.deleteFramebuffer(this.frameBuffer);
    }

    this.frameBuffer = null;
    this.depthBuffer = null;
    this.colorBuffer = null;
  }
}
export default RenderBuffer;
