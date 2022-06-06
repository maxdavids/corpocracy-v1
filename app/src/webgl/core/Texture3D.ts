import Renderer from "./Renderer";
import ITexture from "./ITexture";

/**
 * Created by mdavids on 30/4/2017.
 */
class Texture3D implements ITexture {
  public textureGL: WebGLTexture;
  public renderer:Renderer;
  public registerIndex:number = -1;

  public width:number = -1;
  public height:number = -1;
  public aspect:number = 0;
  public depth:number = -1;

  constructor(renderer:Renderer, registerIndex:number)
  {
    this.renderer = renderer;

    var gl:WebGL2RenderingContext = this.renderer.context;
    this.textureGL = gl.createTexture();
    this.registerIndex = registerIndex;

    this.bind();
  }

  public bind():void
  {
    var gl:WebGL2RenderingContext = this.renderer.context;

    this.renderer.context.activeTexture(gl.TEXTURE0 + this.registerIndex);
    this.renderer.context.bindTexture(gl.TEXTURE_3D, this.textureGL);
  }

  public setImage(image:any, width:number, height:number, depth:number):void
  {
    this.bind();

    this.width = width;
    this.height = height;
    this.aspect = this.width / this.height;
    this.depth = depth;

    var gl:WebGL2RenderingContext = this.renderer.context;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAX_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage3D(gl.TEXTURE_3D, 0, gl.RGBA8, this.width, this.height, this.depth, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
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
export default Texture3D;
