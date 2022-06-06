import Material from "../../core/Material";
import Texture2D from "../../core/Texture2D";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Shader from "../../core/Shader";

/**
 * Created by mdavids on 13/7/2017.
 */
class MaterialBlit extends Material {
  public texture2:Texture2D;

  constructor(renderer:Renderer, shader:Shader) {
    super(renderer, "material_blit");

    this.shader = shader;

    this._depthWrite = false;
    this._depthTest = false;
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

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
export default MaterialBlit;
