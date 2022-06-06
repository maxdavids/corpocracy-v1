import Renderer from "./Renderer";
import ITexture from "./ITexture";

/**
 * Created by mdavids on 18/7/2017.
 */
class Texture2DArray implements ITexture {
  public textureGL: WebGLTexture;
  public renderer:Renderer;
  public registerIndex:number = -1;

  public width:number = -1;
  public height:number = -1;

  public aspect:number = 0;

  protected _depth:number = 0;
  protected _initialized:boolean = false;
  protected _mipsCreated:boolean = false;

  constructor(renderer:Renderer, registerIndex:number, depth:number)
  {
    this.renderer = renderer;
    this._depth = depth;

    var gl:WebGL2RenderingContext = this.renderer.context;
    this.textureGL = gl.createTexture();
    this.registerIndex = registerIndex;

    this.bind();
  }

  public bind():void
  {
    var gl:WebGL2RenderingContext = this.renderer.context;

    this.renderer.context.activeTexture(gl.TEXTURE0 + this.registerIndex);
    this.renderer.context.bindTexture(gl.TEXTURE_2D_ARRAY, this.textureGL);
  }

  public setLevel(image:any, slice:number):void
  {
    this.bind();

    var gl:WebGL2RenderingContext = this.renderer.context;

    if (!this._initialized) {
      this.width = image.width;
      this.height = image.height;

      this.aspect = this.width / this.height;

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_BASE_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LEVEL, 0);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

      let maxLevels = Math.min(Math.log2(this.width), 8);
      gl.texStorage3D(gl.TEXTURE_2D_ARRAY, maxLevels, gl.RGBA8, this.width, this.height, this._depth);

      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

      this._initialized = true;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slice, this.width, this.height, 1, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
  }

  public generateMips():void
  {
    var gl = this.renderer.context;
    this.bind();
    gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
    this._mipsCreated = true;
  }

  destruct()
  {
    if (this.textureGL) {
      var gl:WebGL2RenderingContext = this.renderer.context;
      gl.deleteTexture(this.textureGL);
    }

    this.textureGL = null;
    this.renderer = null;
  }
}
export default Texture2DArray;
