import Renderer from "../core/Renderer";
import Mesh from "../core/Mesh";
import AssetsLoader from "../loader/AssetsLoader";
import GlobalLighting from "./GlobalLighting";

/**
 * Created by mdavids on 26/4/2017.
 */
class FactoryScene {

  public globalLighting:GlobalLighting;

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;

  constructor(renderer:Renderer, assetsLoader:AssetsLoader) {
    this._renderer = renderer;

    this._assetsLoader = assetsLoader;
  }

  public static instantiateMesh(mesh:Mesh, instancingData:any, assetID:string, filtered:boolean = false):boolean
  {
    var posData:number[] = [];
    var scaleData:number[] = [];
    var rotationData:number[] = [];

    var instancesCount:number = instancingData.length;
    var filteredCount:number = 0;

    var idFilterTmp:string[];
    var idFilter:string;

    var textPos:string[];
    var textScale:string[];
    var textRotation:string[];
    for (let i:number = 0; i < instancesCount; i++) {
      if (filtered) {
        idFilterTmp = instancingData[i]["n"].split('_');
        idFilter = idFilterTmp[idFilterTmp.length - 1];

        if (idFilter !== assetID) continue;
      }

      filteredCount++;

      textPos = instancingData[i]["p"].split(',');
      textScale = instancingData[i]["s"].split(',');
      textRotation = instancingData[i]["r"].split(',');

      posData.push(Number(-textPos[0]));
      posData.push(Number(textPos[1]));
      posData.push(Number(textPos[2]));

      scaleData.push(Number(textScale[0]));
      scaleData.push(Number(textScale[1]));
      scaleData.push(Number(textScale[2]));

      rotationData.push(Number(textRotation[0]));
      rotationData.push(Number(-textRotation[1]));
      rotationData.push(Number(-textRotation[2]));
      rotationData.push(Number(textRotation[3]));
    }

    if (filteredCount > 0) {
      mesh.addArrayBuffer(new Float32Array(posData), "aIPos", 3, 1);
      mesh.addArrayBuffer(new Float32Array(scaleData), "aIScale", 3, 1);
      mesh.addArrayBuffer(new Float32Array(rotationData), "aIRotation", 4, 1);

      mesh.instances = filteredCount;

      return true;
    }

    console.log(assetID, filteredCount);
    return false;
  }

  destruct()
  {

  }

}
export default FactoryScene;
