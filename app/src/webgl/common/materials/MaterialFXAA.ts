import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Texture2D from "../../core/Texture2D";
import Vector2 from "../../core/Vector2";
import ShaderFXAA from "./shaders/ShaderFXAA";
import ITexture from "../../core/ITexture";

/**
 * Created by mdavids on 4/5/2017.
 */
class MaterialFXAA extends Material{
  protected texSize:Vector2 = new Vector2();

  constructor(renderer:Renderer) {
    super(renderer, "material_fxaa");

    this.shader = new ShaderFXAA(renderer);

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setTexture(texture:ITexture):void
  {
    super.setTexture(texture);

    this.texSize.x = this._texture.width;
    this.texSize.y = this._texture.height;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector2("uTextureSize", this.texSize);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialFXAA;
