import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Vector4 from "../../core/Vector4";
import ShaderSkybox from "./shaders/ShaderSkybox";
import Vector2 from "../../core/Vector2";

/**
 * Created by mdavids on 13/2/2017.
 */
class MaterialSkybox extends Material
{
  public color:Vector4 = new Vector4(1, 1, 1, 1);
  public yaw:number = 0;

  constructor(renderer:Renderer) {
    super(renderer, "material_skybox");

    this.shader = new ShaderSkybox(renderer);
    //this.setAlphaBlending();

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uInverseProj", camera.getInvProjection());
    this.setMatrix("uView", camera.getViewMatrix());

    this.setVector4("uColor", this.color);
    this.setVector2("uAspect", new Vector2(1 / camera.getAspect(), 1));
    this.setVector4("uCamParams", camera.camParams);

    this.setFloat("uYaw", this.yaw);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialSkybox;
