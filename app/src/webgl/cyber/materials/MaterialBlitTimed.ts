import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Clock from "../../Clock";
import Shader from "../../core/Shader";
import Texture2D from "../../core/Texture2D";

/**
 * Created by mdavids on 23/1/2018.
 */
export default class MaterialBlitTimed extends Material {
  public texture2:Texture2D;
  public startTime:number = 0;

  constructor(renderer:Renderer, shader:Shader) {
    super(renderer, "material_blit_timed");

    this.shader = shader;

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setFloat("uTime", Clock.globalTime - this.startTime);

    let textureUniform:WebGLUniformLocation;
    if (this.texture2) {
      textureUniform = this.getLoc('uTexture2');
      this.texture2.bind();
      this._renderer.context.uniform1i(textureUniform, this.texture2.registerIndex);
    }
  }

  destruct()
  {
    super.destruct();
  }

}
