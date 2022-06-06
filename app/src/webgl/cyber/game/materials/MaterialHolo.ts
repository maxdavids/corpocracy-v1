import Material from "../../../core/Material";
import Texture3D from "../../../core/Texture3D";
import Vector2 from "../../../core/Vector2";
import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import Renderable from "../../../core/Renderable";
import ITexture from "../../../core/ITexture";
import Texture2D from "../../../core/Texture2D";
import ShaderHoloBlend from "./shaders/ShaderHoloBlend";

/**
 * Created by mdavids on 5/7/2018.
 */
class MaterialHolo extends Material {
  protected texelSize:Vector2 = new Vector2();

  public texture2:Texture2D;
  public texLut:Texture3D;

  public cellSeed:number = 0;

  constructor(renderer:Renderer) {
    super(renderer, "material_holo");

    this.shader = new ShaderHoloBlend(renderer);

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setTexture2D(texture:ITexture):void
  {
    super.setTexture(texture);

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector2("uTexelSize", this.texelSize);
    this.setFloat("uAspect", this._texture.aspect);
    this.setFloat("uCellSeed", this.cellSeed);

    this.texelSize.x = 1 / this.texture2.width;
    this.texelSize.y = 1 / this.texture2.height;

    var textureUniform:WebGLUniformLocation;
    textureUniform = this.getLoc('uTexture2');
    this.texture2.bind();
    this._renderer.context.uniform1i(textureUniform, this.texture2.registerIndex);

    textureUniform = this.getLoc('uTextureLut');
    this.texLut.bind();
    this._renderer.context.uniform1i(textureUniform, this.texLut.registerIndex);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialHolo;
