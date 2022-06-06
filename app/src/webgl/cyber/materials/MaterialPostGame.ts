import Material from "../../core/Material";
import Texture2D from "../../core/Texture2D";
import Texture3D from "../../core/Texture3D";
import Vector2 from "../../core/Vector2";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Clock from "../../Clock";
import ShaderGamePost from "./shaders/ShaderPostGame";
import ITexture from "../../core/ITexture";

/**
 * Created by mdavids on 13/7/2017.
 */
class MaterialPostGame extends Material {
  protected texelSize:Vector2 = new Vector2();

  public texNoise:Texture2D;
  public texLut:Texture3D;
  public texBlur:Texture2D;

  public cellSeed:number = 0;

  constructor(renderer:Renderer) {
    super(renderer, "material_layer_post");

    this.shader = new ShaderGamePost(renderer);

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setTexture2D(texture:ITexture):void
  {
    super.setTexture(texture);

    this.texelSize.x = 1 / this._texture.width;
    this.texelSize.y = 1 / this._texture.height;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setVector2("uTexelSize", this.texelSize);
    this.setFloat("uAspect", this._texture.aspect);
    this.setFloat("uTime", Clock.globalTime);
    this.setFloat("uCellSeed", this.cellSeed);

    var textureUniform:WebGLUniformLocation;

    textureUniform = this.getLoc('uTextureNoise');
    this.texNoise.bind();
    this._renderer.context.uniform1i(textureUniform, this.texNoise.registerIndex);

    textureUniform = this.getLoc('uTextureLut');
    this.texLut.bind();
    this._renderer.context.uniform1i(textureUniform, this.texLut.registerIndex);

    textureUniform = this.getLoc('uTextureBlur');
    this.texBlur.bind();
    this._renderer.context.uniform1i(textureUniform, this.texBlur.registerIndex);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialPostGame;
