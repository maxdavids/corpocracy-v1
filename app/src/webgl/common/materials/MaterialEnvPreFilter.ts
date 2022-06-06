import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import ShaderEnvPreFilter from "./shaders/ShaderEnvPreFilter";
import Vector2 from "../../core/Vector2";

/**
 * Created by mdavids on 26/2/2017.
 */
class MaterialEnvPreFilter extends Material
{
  public size:Vector2 = new Vector2(1.0, 1.0);
  public offset:Vector2 = new Vector2();
  public texelSize:Vector2 = new Vector2();

  public roughness:number = 0;

  constructor(renderer:Renderer) {
    super(renderer, "material_env_pre_filter");

    this.shader = new ShaderEnvPreFilter(renderer);
    this.resetBlending();

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector2("uSize", this.size);
    this.setVector2("uOffset", this.offset);
    this.setFloat("uRoughness", this.roughness);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialEnvPreFilter;
