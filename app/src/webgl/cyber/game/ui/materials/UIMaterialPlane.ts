import Material from "../../../../core/Material";
import Renderer from "../../../../core/Renderer";
import Camera from "../../../../core/Camera";
import Renderable from "../../../../core/Renderable";
import Vector4 from "../../../../core/Vector4";
import Vector3 from "../../../../core/Vector3";
import Shader from "../../../../core/Shader";
import Quaternion from "../../../../core/Quaternion";

/**
 * Created by mdavids on 2/7/2018.
 */
class UIMaterialPlane extends Material {
  public pivot:Vector3 = new Vector3(0, 0, 0);
  public pos:Vector3 = new Vector3();
  public scale:Vector3 = new Vector3(1, 1, 1);
  public rotation:Quaternion = new Quaternion();

  public fillColor:Vector4 = new Vector4(1, 1, 1, 0);
  public borderColor:Vector4 = new Vector4(1, 1, 1, 0);
  public borderColorHighlight:Vector4 = new Vector4(1, 1, 1, 0);

  public borderSize:Vector4 = new Vector4();
  public diagonalWeight = 0;

  public preserveAlphaFlag:number = 0;

  protected _actionIndex:number = 255;

  constructor(renderer:Renderer, shader:Shader, actionIndex = 255) {
    super(renderer, "ui_material_plane");

    this.shader = shader;
    this._actionIndex = actionIndex;

    this.resetBlending();
    this.setDepthTest(false);
    this.setDepthWrite(false);
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector3('uPivot', this.pivot);
    this.setVector3('uPos', this.pos);
    this.setVector3('uScale', this.scale);
    this.setQuaternion('uRotation', this.rotation);

    this.setVector4('uFillColor', this.fillColor);
    this.setVector4('uBorderColor', this.borderColor);
    this.setVector4('uBorderColorHighlight', this.borderColorHighlight);

    this.setVector4('uBorderSize', this.borderSize);
    this.setFloat('uDiagonal', this.diagonalWeight);

    this.setFloat('uPreserveAlpha', this.preserveAlphaFlag);
    this.setFloat('uIndex', this._actionIndex);
    this.setVector2('uVSize', camera.vSize);
  }

  destruct()
  {
    super.destruct();
  }

}
export default UIMaterialPlane;
