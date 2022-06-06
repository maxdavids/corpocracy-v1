import Material from "../../../core/Material";
import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import Renderable from "../../../core/Renderable";
import ShaderSectors from "./shaders/ShaderSectors";

/**
 * Created by mdavids on 3/7/2017.
 */
class MaterialSectors extends Material {
  constructor(renderer:Renderer) {
    super(renderer, "material_sectors");

    this.shader = new ShaderSectors(renderer);

    this.setAdditiveBlending();
    this._depthWrite = false;
    this._depthTest = true;
    this.setCullingDisabled();
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uWorld", renderable.getTransform().getMatrix());
    this.setMatrix("uViewProjection", camera.getViewProjection());
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialSectors;
