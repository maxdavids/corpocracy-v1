import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Texture2D from "../../core/Texture2D";
import Vector2 from "../../core/Vector2";
import ShaderSharpen from "./shaders/ShaderSharpen";
import Clock from "../../Clock";
import ITexture from "../../core/ITexture";

/**
 * Created by mdavids on 21/4/2017.
 */
class MaterialSharpen extends Material {
  public strength:number = 1.5;
  public clamp:number = 0.07;

  protected texelSize:Vector2 = new Vector2();

  constructor(renderer:Renderer) {
    super(renderer, "material_sharpen");

    this.shader = new ShaderSharpen(renderer);

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setTexture(texture:ITexture):void
  {
    super.setTexture(texture);

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector2("uTexelSize", this.texelSize);
    this.setFloat("uStrength", this.strength);
    this.setFloat("uClamp", this.clamp);
    this.setFloat("uTime", Clock.globalTime);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialSharpen;
