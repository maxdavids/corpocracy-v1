import Material from "../../../core/Material";
import Vector4 from "../../../core/Vector4";
import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import Renderable from "../../../core/Renderable";
import Texture2DArray from "../../../core/Texture2DArray";
import Shader from "../../../core/Shader";
import ShaderTerrain from "./shaders/ShaderTerrain";
import GBuffer from "../../../core/GBuffer";
import Texture2D from "../../../core/Texture2D";
import GlobalLighting from "../../GlobalLighting";

/**
 * Created by mdavids on 13/7/2017.
 */
class MaterialTerrain extends Material
{
  public texFacade:Texture2DArray;

  public globalLight:GlobalLighting;
  public envBRDF:Texture2D;

  constructor(renderer:Renderer, shader:Shader = null) {
    super(renderer, "material_terrain");

    this.shader = shader? shader : new ShaderTerrain(renderer);
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    super.setUniforms(camera, renderable);

    this.setMatrix("uViewProjection", camera.getViewProjection());

    this.setVector3("uCamPos", camera.getTransform().position);

    this.setVector3("uLightDir", this.globalLight.sunDir);
    this.setVector3("uLightColor", this.globalLight.sunColor);
    this.setFloat("uFogDensity", this.globalLight.fogDensity);
    this.setFloat("uFogMul", this.globalLight.fogWeight);
    this.setFloat("uAmbientIntensity", this.globalLight.ambientIntensity);
    this.setFloat("uSkyYaw", this.globalLight.skyYaw);

    var textureUniform:WebGLUniformLocation;
    textureUniform = this.getLoc('uTexFacade');
    this.texFacade.bind();
    this._renderer.context.uniform1i(textureUniform, this.texFacade.registerIndex);

    textureUniform = this.getLoc('uTexIrradiance');
    this.globalLight.texSkyboxIrradiance.bind();
    this._renderer.context.uniform1i(textureUniform, this.globalLight.texSkyboxIrradiance.registerIndex);

    textureUniform = this.getLoc('uTexBRDF');
    this.envBRDF.bind();
    this._renderer.context.uniform1i(textureUniform, this.envBRDF.registerIndex);
  }

  destruct()
  {
    super.destruct();
  }

}
export default MaterialTerrain;
