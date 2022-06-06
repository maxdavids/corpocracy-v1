import Renderer from './Renderer';
import IRenderTarget from "./IRenderTarget";
import Texture2DArray from "./Texture2DArray";
import Texture2D from "./Texture2D";

/**
 * Created by mdavids on 01-05-2016.
 */
class GBuffer extends Texture2DArray implements IRenderTarget {

  public frameBuffer:WebGLFramebuffer;
  public depthTexture:Texture2D;

  public sizeMultiplier:number = 1;

  protected _scaleToCanvas:boolean = false;
  protected _dynamic:boolean = false;
  protected _renderAttachments:number[] = [];

  constructor(
    renderer:Renderer,
    width:number = 1,
    height:number = 1,
    registerIndex:number = -1,
    scaleToCanvas:boolean = false,
    dynamic:boolean = false
  )
  {
    super(renderer, registerIndex, 3);

    this._scaleToCanvas = scaleToCanvas;
    this._dynamic = dynamic;

    var gl:WebGL2RenderingContext = this.renderer.context;
    this._renderAttachments = [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1, gl.COLOR_ATTACHMENT2];

    this.frameBuffer = gl.createFramebuffer();
    this.depthTexture = new Texture2D(this.renderer, this.registerIndex + 1, false, false, true, false);

    this.setSize(width, height);
  }

  public getScaleToCanvas():boolean
  {
    return this._scaleToCanvas;
  }

  public setAsTarget():void
  {
    var gl = this.renderer.context;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.textureGL, 0, 0);
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT1, this.textureGL, 0, 1);
    gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT2, this.textureGL, 0, 2);

    this.renderer.setDepthMask(true);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture.textureGL, 0);

    gl.drawBuffers(this._renderAttachments);
    this.renderer.setDepthMask(true);
  }

  public setSize(width:number, height:number):void
  {
    if (width == this.width && height == this.height) return;

    var gl = this.renderer.context;
    this.depthTexture.bind();
    this.depthTexture.width = this.width;
    this.depthTexture.height = this.height;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);

    this.bind();

    this.width = width;
    this.height = height;
    this.aspect = this.width / this.height;

    if (!this._initialized) {
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_BASE_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      this._initialized = true;
    }

    var internalFormat = gl.RGBA32F;
    var format = gl.RGBA;
    var type = gl.FLOAT;

    gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, internalFormat, this.width, this.height, this._depth, 0, format, type, null);
  }

  destruct()
  {
    var gl:WebGLRenderingContext = this.renderer.context;

    gl.deleteFramebuffer(this.frameBuffer);
    this.depthTexture.destruct();


    this.frameBuffer = null;
    this.depthTexture = null;

    // always call this last
    super.destruct();
  }
}
export default GBuffer;
