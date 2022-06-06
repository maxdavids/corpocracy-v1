import Material from "../../../core/Material";
import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import Renderable from "../../../core/Renderable";
import ShaderWireframe from "./shaders/ShaderWireframe";

/**
 * Created by mdavids on 3/7/2017.
 */
class MaterialWireframe extends Material {
  public sectorsCamera:Camera;
  public ownersIds:Float32Array;

  constructor(renderer:Renderer) {
    super(renderer, "material_wireframe");

    this.shader = new ShaderWireframe(renderer);

    this.setAdditiveBlending();
    // this.setMaxBlending();
    // this._depthWrite = false;
    // this._depthTest = true;
    this.setCullingDisabled();
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uWorld", renderable.getTransform().getMatrix());
    this.setMatrix("uViewProjection", camera.getViewProjection());

    this.setMatrix("uSectorsViewProj", this.sectorsCamera.getViewProjection());
    this.setFloat32Array("uSectorOwnersIds", this.ownersIds);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialWireframe;
