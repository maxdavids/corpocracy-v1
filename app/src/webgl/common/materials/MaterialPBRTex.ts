import Material from "../../core/Material";
import Texture2D from "../../core/Texture2D";
import Vector2 from "../../core/Vector2";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import ShaderPBRTex from "./shaders/ShaderPBRTex";
import Shader from "../../core/Shader";
import Vector3 from "../../core/Vector3";

/**
 * Created by mdavids on 11/4/2017.
 */
class MaterialPBRTex extends Material
{
  public envBRDF:Texture2D;

  public texAlbedo:Texture2D;
  public texAtts:Texture2D;
  public texNormals:Texture2D;

  public uvScale:Vector2 = new Vector2(1, 1);
  public metallic:number = 0;
  public texelSize:Vector2 = new Vector2();

  public lightDir:Vector3 = new Vector3(0, -1, 0);
  public lightColor:Vector3 = new Vector3(1);
  public ambientIntensity:number = 1;
  public humidity:number = 0;
  public fogDensity:number = 0;
  public fogColorMul:number = 1;

  constructor(renderer:Renderer, shader:Shader = null, name:string = "material_pbr_tex") {
    super(renderer, name);

    this.shader = shader? shader : new ShaderPBRTex(renderer);
    //this.setAlphaBlending();

    //this._depthWrite = false;
    //this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uWorld", renderable.getTransform().getMatrix());
    this.setMatrix("uInvView", camera.getInvViewMatrix());
    this.setMatrix("uViewProjection", camera.getViewProjection());

    this.setVector3("uCamPos", camera.getTransform().position);

    this.setVector2("uUVScale", this.uvScale);
    this.setFloat("uMetallic", this.metallic);

    this.setVector3("uLightDir", this.lightDir);
    this.setVector3("uLightColor", this.lightColor);
    this.setFloat("uAmbientIntensity", this.ambientIntensity);
    this.setFloat("uHumidity", this.humidity);
    this.setFloat("uFogDensity", this.fogDensity);
    this.setFloat("uFogColorMul", this.fogColorMul);

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
    this.setVector2("uTexelSize", this.texelSize);

    var textureUniform:WebGLUniformLocation;
    if (this.envBRDF) {
      textureUniform = this.getLoc('uTexture2');
      this.envBRDF.bind();
      this._renderer.context.uniform1i(textureUniform, this.envBRDF.registerIndex);
    }

    if (this.texAlbedo) {
      textureUniform = this.getLoc('uTexture3');
      this.texAlbedo.bind();
      this._renderer.context.uniform1i(textureUniform, this.texAlbedo.registerIndex);
    }

    if (this.texAtts) {
      textureUniform = this.getLoc('uTexture4');
      this.texAtts.bind();
      this._renderer.context.uniform1i(textureUniform, this.texAtts.registerIndex);
    }

    if (this.texNormals) {
      textureUniform = this.getLoc('uTexture5');
      this.texNormals.bind();
      this._renderer.context.uniform1i(textureUniform, this.texNormals.registerIndex);
    }
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialPBRTex;
