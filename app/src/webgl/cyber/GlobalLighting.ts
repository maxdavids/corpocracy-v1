import Renderer from "../core/Renderer";
import Texture2D from "../core/Texture2D";
import RenderTexture from "../core/RenderTexture";
import MaterialEnvPreFilter from "../common/materials/MaterialEnvPreFilter";
import AssetsLoader from "../loader/AssetsLoader";
import Vector3 from "../core/Vector3";
import IRenderTarget from "../core/IRenderTarget";

/**
 * Created by mdavids on 26/4/2017.
 */
class GlobalLighting
{
  public texSkybox:Texture2D;
  protected _texSkyboxProbe:Texture2D;
  public texSkyboxIrradiance:Texture2D;

  public skyYaw:number = (-Math.PI / 180) * -180;
  public sunDir:Vector3 = new Vector3(0.5, 0.6, -1);
  public sunColor:Vector3 = new Vector3(1, 1, 1);
  public sunIntensity:number = 2;
  public ambientIntensity:number = 1;
  public fogDensity:number = 0.01;
  public fogWeight:number = 1;

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;

  protected _bufferSkyboxIrradiance:RenderTexture;
  protected _matSkyboxIrradiance:MaterialEnvPreFilter;
  protected _mustUpdateIrradiance:boolean = true;

  constructor(renderer:Renderer, assetsLoader:AssetsLoader) {
    this._renderer = renderer;
    this._assetsLoader = assetsLoader;

    this.sunColor.multiplyScalar(this.sunIntensity);
  }

  public prefilter():void
  {
    // irradiance pre filter
    this._bufferSkyboxIrradiance = new RenderTexture(this._renderer, 1024, 1024, 1, false, true, true, false);
    this._bufferSkyboxIrradiance.sizeMultiplier = 1;

    this.texSkyboxIrradiance = new Texture2D(this._renderer, 2, true, true, false);
    this.texSkyboxIrradiance.setEmpty(this._bufferSkyboxIrradiance.width, this._bufferSkyboxIrradiance.height, 6);

    this._matSkyboxIrradiance = new MaterialEnvPreFilter(this._renderer);
    this._matSkyboxIrradiance.setTexture(this._texSkyboxProbe);
  }

  public setSkyboxProbe(texture:Texture2D) {
    this._texSkyboxProbe = texture;
    this._mustUpdateIrradiance = true;
  }

  public updateIrradiance():void
  {
    if (this._mustUpdateIrradiance) {
      let currentTarget:IRenderTarget = this._renderer.currentRenderTarget;

      this._matSkyboxIrradiance.roughness = 0;
      this._matSkyboxIrradiance.size.x = 1;
      this._matSkyboxIrradiance.size.y = 1;
      this._matSkyboxIrradiance.offset.x = 0;
      this._matSkyboxIrradiance.offset.y = 0;

      for (let i:number = 0; i < 6; i++) {
        this._matSkyboxIrradiance.roughness = i / 5;
        this._matSkyboxIrradiance.size.x = Math.pow(2, i);
        this._matSkyboxIrradiance.size.y = Math.pow(2, i);

        this._renderer.blitInto(this._texSkyboxProbe, this._bufferSkyboxIrradiance, this._matSkyboxIrradiance, null, false);

        let bufferData:Uint8Array = this._bufferSkyboxIrradiance.getImageData(0, 0, 1024 / this._matSkyboxIrradiance.size.x, 1024 / this._matSkyboxIrradiance.size.y);
        this.texSkyboxIrradiance.updateLevel(i, bufferData);

        if (i==0) this.texSkyboxIrradiance.generateMips();
      }

      // this._bufferSkyboxIrradiance.destruct();

      this.texSkyboxIrradiance.setFilteringLinear(this.texSkyboxIrradiance.sampleLinear);
      this._mustUpdateIrradiance = false;

      this._renderer.setRenderTarget(currentTarget);
    }
  }

  destruct()
  {

  }

}
export default GlobalLighting;
