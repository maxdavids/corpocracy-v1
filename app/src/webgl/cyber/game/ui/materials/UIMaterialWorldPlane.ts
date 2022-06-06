import Material from "../../../../core/Material";
import Renderer from "../../../../core/Renderer";
import Camera from "../../../../core/Camera";
import Renderable from "../../../../core/Renderable";
import Vector3 from "../../../../core/Vector3";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 2/7/2018.
 */
class UIMaterialWorldPlane extends Material {
  public pivot:Vector3 = new Vector3(0, 0, 0);
  public pos:Vector3 = new Vector3();
  public scale:Vector3 = new Vector3(1, 1, 1);

  public cameraWorld:Camera;

  public ownersIds:Float32Array;
  public flags:Float32Array;

  public index:number = 0;

  constructor(renderer:Renderer, shader:Shader) {
    super(renderer, "ui_material_world_plane");

    this.shader = shader;

    this.resetBlending();
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uWorldViewProj", this.cameraWorld.getViewProjection());
    this.setMatrix("uView", camera.getViewMatrix());
    this.setMatrix("uInvProjection", camera.getInvProjection());
    this.setMatrix("uViewProjection", camera.getViewProjection());

    this.setVector3('uPivot', this.pivot);
    this.setVector3('uPos', this.pos);
    this.setVector3('uScale', this.scale);

    this.setFloat32Array("uSectorOwnersIds", this.ownersIds);
    this.setFloat32Array("uFlags", this.flags);
    // this.setFloat('uIndex', this.index);
  }

  destruct()
  {
    super.destruct();
  }

}
export default UIMaterialWorldPlane;
