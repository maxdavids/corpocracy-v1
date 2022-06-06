import Renderer from "./Renderer";
import ITexture from "./ITexture";
import IRenderTarget from "./IRenderTarget";

class TextureCube implements ITexture, IRenderTarget {
	public textureGL: WebGLTexture;
	public renderer:Renderer;
	public registerIndex:number = -1;
  public sizeMultiplier:number = 1;

	public width:number = 0;
	public height:number = 0;
	public aspect:number = 0;

	public targetFace:number = 0;

  public frameBuffer:WebGLFramebuffer;

  protected _scaleToCanvas:boolean = false;
  protected _renderAttachments:number[] = [];

	constructor(renderer:Renderer, width:number = -1, height:number = -1, registerIndex:number = -1)
	{
		this.renderer = renderer;

		var gl:WebGL2RenderingContext = this.renderer.context;

		this.textureGL = gl.createTexture();
		this.registerIndex = registerIndex;
    this._renderAttachments = [gl.COLOR_ATTACHMENT0];

    this.frameBuffer = gl.createFramebuffer();

    this.setSize(width, height);
	}

	public bind():void
	{
		var gl: WebGLRenderingContext = this.renderer.context;

		this.renderer.context.activeTexture(gl.TEXTURE0 + this.registerIndex);
		this.renderer.context.bindTexture(gl.TEXTURE_CUBE_MAP, this.textureGL);
	}

  public setSize(width:number, height:number):void
  {
    if (width == this.width && height == this.height) return;

    var gl = this.renderer.context;
    this.bind();

    this.width = width;
    this.height = height;
    this.aspect = this.width / this.height;

    var internalFormat = gl.RGBA8;
    var format = gl.RGBA;
    var type = gl.UNSIGNED_BYTE;

    var faces:number[] = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAX_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    for (var i = 0; i < faces.length; ++i) {
      gl.texImage2D(faces[i], 0, internalFormat, this.width, this.height, 0, format, type, null);
    }
  }

  public setAsTarget():void
  {
    var gl = this.renderer.context;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);

    var faces:number[] = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, faces[this.targetFace], this.textureGL, 0);
    gl.drawBuffers(this._renderAttachments);
  }

  public getScaleToCanvas():boolean
  {
    return this._scaleToCanvas;
  }

	public setImages(images:HTMLImageElement[]):void
	{
		var gl = this.renderer.context;

		this.bind();

		//flip y does work here
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

		var faces:number[] = [
			gl.TEXTURE_CUBE_MAP_POSITIVE_X,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
			gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
			gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
		];

		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

		for (var i = 0; i < faces.length; ++i) {
			//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
			if(images.length == 6){
				gl.texImage2D(faces[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
			}else{
				gl.texImage2D(faces[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[0]);
			}
		}
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
	}

	//TODO:implement
	destruct()
	{
		// always call this last
		//super.destruct();
	}
}
export default TextureCube;
