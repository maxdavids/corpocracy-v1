import Material from "../../../core/Material";
import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import Renderable from "../../../core/Renderable";
import Clock from "../../../Clock";
import Vector4 from "../../../core/Vector4";
import ShaderLoadingAnim from "./shaders/ShaderLoadingAnim";

/**
 * Created by mdavids on 16/7/2017.
 */
class MaterialLoadingAnim extends Material {
  public color:Vector4 = new Vector4(1, 1, 1, 1);

  constructor(renderer:Renderer) {
    super(renderer, "material_loading_anim");

    this.shader = new ShaderLoadingAnim(renderer);

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uWorld", renderable.getTransform().getMatrix());
    this.setMatrix("uViewProjection", camera.getViewProjection());

    this.setVector4('uColor', this.color);

    this.setFloat("uTime", Clock.globalTime);
  }
}
export default MaterialLoadingAnim;
