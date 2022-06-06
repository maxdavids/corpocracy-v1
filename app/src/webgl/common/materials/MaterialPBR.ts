import Material from "../../core/Material";
import Texture2D from "../../core/Texture2D";
import Vector4 from "../../core/Vector4";
import Vector2 from "../../core/Vector2";
import Renderer from "../../core/Renderer";
import ShaderPBR from "./shaders/ShaderPBR";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Vector3 from "../../core/Vector3";

/**
 * Created by mdavids on 14/2/2017.
 */
class MaterialPBR extends Material
{
  public envBRDF:Texture2D;

  public albedo:Vector4 = new Vector4(1, 1, 1, 1);
  public metallic:number = 1;
  public roughness:number = 1;
  public texelSize:Vector2 = new Vector2();

  public lightDir:Vector3 = new Vector3(0, -1, 0);
  public lightColor:Vector3 = new Vector3(1);
  public ambientIntensity:number = 1;

  constructor(renderer:Renderer) {
    super(renderer, "material_pbr");

    this.shader = new ShaderPBR(renderer);
    //this.setAlphaBlending();

    //this._depthWrite = false;
    //this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uWorld", renderable.getTransform().getMatrix());
    this.setMatrix("uViewProjection", camera.getViewProjection());

    this.setVector3("uCamPos", camera.getTransform().position);

    this.setVector4("uAlbedo", this.albedo);
    this.setFloat("uMetallic", this.metallic);
    this.setFloat("uRoughness", this.roughness);

    this.setVector3("uLightDir", this.lightDir);
    this.setVector3("uLightColor", this.lightColor);
    this.setFloat("uAmbientIntensity", this.ambientIntensity);

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
    this.setVector2("uTexelSize", this.texelSize);

    if (this.envBRDF) {
      var textureUniform:WebGLUniformLocation = this.getLoc('uTexture2');
      this.envBRDF.bind();
      this._renderer.context.uniform1i(textureUniform, this.envBRDF.registerIndex);
    }
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialPBR;
