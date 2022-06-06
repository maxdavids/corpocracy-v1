import Material from "../../../../core/Material";
import Renderer from "../../../../core/Renderer";
import Camera from "../../../../core/Camera";
import Renderable from "../../../../core/Renderable";
import Vector2 from "../../../../core/Vector2";
import Vector4 from "../../../../core/Vector4";
import ShaderText from "./shaders/ShaderText";
import ITexture from "../../../../core/ITexture";
import Vector3 from "../../../../core/Vector3";
import Quaternion from "../../../../core/Quaternion";

/**
 * Created by mdavids on 3/7/2017.
 */
class MaterialText extends Material {
  public pivot:Vector3 = new Vector3(0, 0, 0);
  public pos:Vector3 = new Vector3();
  public scale:Vector3 = new Vector3(1, 1, 1);
  public rotation:Quaternion = new Quaternion();

  public backColor:Vector4 = new Vector4(0,0,0,1);

  public offset:Vector2 = new Vector2();
  public pxRange:number = 4;

  public texelSize:Vector2 = new Vector2();

  protected _mdsfUnit:Vector2 = new Vector2();
  protected _actionIndex:number = 255;

  constructor(renderer:Renderer, actionIndex = 255) {
    super(renderer, "material_text");

    this.shader = new ShaderText(renderer);
    this._actionIndex = actionIndex;

    this.resetBlending();
    this._depthWrite = false;
    this._depthTest = false;
  }

  public setTexture(texture:ITexture):void
  {
    super.setTexture(texture);

    this._mdsfUnit.x = this.pxRange / this._texture.width;
    this._mdsfUnit.y = this.pxRange / this._texture.height;

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector4('uBackColor', this.backColor);
    this.setVector2('uOffset', this.offset);
    this.setVector2("uMSDFUnit", this._mdsfUnit);
    this.setVector2("uTexelSize", this.texelSize);
    this.setFloat('uIndex', this._actionIndex);

    this.setVector3('uPos', this.pos);
    this.setVector3('uScale', this.scale);
    this.setQuaternion('uRotation', this.rotation);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialText;
