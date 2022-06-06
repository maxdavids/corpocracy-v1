import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Texture2D from "../../core/Texture2D";
import Vector2 from "../../core/Vector2";
import Clock from "../../Clock";
import ShaderPost from "./shaders/ShaderPost";
import Texture3D from "../../core/Texture3D";
import ITexture from "../../core/ITexture";

/**
 * Created by mdavids on 28/4/2017.
 */
class MaterialPost extends Material {
  public strength:number = 0.75;
  // public strength:number = 1.1;
  public clamp:number = 0.5;

  // public noiseStrength:number = 0.07;
  public noiseStrength:number = 0.13;
  // public noiseStrength:number = 0.4;

  public texLUT:Texture3D;
  public texNoise:Texture2D;

  protected texelSize:Vector2 = new Vector2();

  constructor(renderer:Renderer) {
    super(renderer, "material_post");

    this.shader = new ShaderPost(renderer);

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setTexture(texture:ITexture):void
  {
    super.setTexture(texture);

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector2("uTexelSize", this.texelSize);
    this.setFloat("uStrength", this.strength);
    this.setFloat("uClamp", this.clamp);
    this.setFloat("uTime", Clock.globalTime);
    this.setFloat("uNoise", this.noiseStrength);

    var textureUniform:WebGLUniformLocation;

    textureUniform = this.getLoc('uTexture3');
    this.texLUT.bind();
    this._renderer.context.uniform1i(textureUniform, this.texLUT.registerIndex);

    textureUniform = this.getLoc('uTextureNoise');
    this.texNoise.bind();
    this._renderer.context.uniform1i(textureUniform, this.texNoise.registerIndex);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialPost;
