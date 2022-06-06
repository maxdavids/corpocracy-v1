import Renderer from "../../core/Renderer";
import AssetsLoader from "../../loader/AssetsLoader";
import TextLoader from "../../loader/TextLoader";
import Texture2DLoader from "../../loader/Texture2DLoader";
import Texture2DArrayLoader from "../../loader/Texture2DArrayLoader";
import MeshLoader from "../../loader/MeshLoader";
import IAsset from "../../loader/IAsset";
import LayerGameUI from "./LayerGameUI";
import RenderTexture from "../../core/RenderTexture";
import Texture3DLoader from "../../loader/Texture3DLoader";
import IStage from "../IStage";
import DAppInterface from "../../../DAppInterface";
import UIGlobals from "./ui/UIGlobals";
import Vector4 from "../../core/Vector4";
import Utils from "../../Utils";

/**
 * Created by mdavids on 9/7/2017.
 */
class StageGame implements IStage {

  protected _renderer:Renderer;
  protected _dAppInterface:DAppInterface;

  protected _assetsLoader:AssetsLoader;
  protected _isLoading:boolean = false;
  public wasBuilt:boolean = false;

  protected _layerUI:LayerGameUI;

  protected _buffersWidth:number = 0;
  protected _buffersHeight:number = 0;

  constructor(renderer:Renderer, assetsLoader:AssetsLoader) {
    this._renderer = renderer;

    this._dAppInterface = DAppInterface.instance;

    this._assetsLoader = assetsLoader;
    this._isLoading = true;
    this.wasBuilt = false;
  }

  public load():void {
    this._isLoading = true;

    this._assetsLoader.doneCallback = ()=>this.build();
    this._assetsLoader.errorCallback = (asset:IAsset)=>this.onLoadingError(asset);

    var baseUrl:string = "data/webgl/scenes/";

    var meshLoader:MeshLoader;
    var textureLoader:Texture2DLoader;
    var tex3DLoader:Texture3DLoader;

    // meshes
    var meshesUrl:string = baseUrl + "objects/";
    var meshesUIUrl:string = baseUrl + "ui/";
    var meshesData:any = [
      { id:"plane", url:meshesUrl + "plane.obj", cloud:false },
      { id:"city", url:meshesUrl + "city.fbx", cloud:false },
      { id:"buildings", url:meshesUrl + "city_buildings.fbx", cloud:false },
      { id:"sectors", url:meshesUrl + "city_sectors.fbx", cloud:false },
      { id:"roads", url:meshesUrl + "city_roads.fbx", cloud:false }
    ];

    for (let i:number = 0; i < meshesData.length; i++) {
      meshLoader = new MeshLoader(this._renderer, "mesh_" + meshesData[i]["id"], meshesData[i]["url"], meshesData[i]["cloud"]);
      this._assetsLoader.push(meshLoader);
    }

    // texture assets
    var texIndexStart:number = 7;
    var texturesData:any[] = [
      { id:"glyphs", url:"data/webgl/glyphs.png", index:7, mips:false, filter:true, clamp:true },
      { id:"background", url:baseUrl + "background_c.jpg", index:3, mips:false, filter:true, clamp:true },
      { id:"int_brdf", url:baseUrl + "integrate_brdf.png", index:4, mips:false, filter:false, clamp:true },
      { id:"labels_map", url:baseUrl + "ui/labels_map.png", index:7, mips:true, filter:true, clamp:true },
      { id:"noise", url:"data/webgl/noise.png", index:7, mips:false, filter:true, clamp:false },
      { id:"btn_map", url:baseUrl + "ui/btn_map.png", index:7, mips:true, filter:true, clamp:true },
      { id:"icon_missing", url:baseUrl + "ui/icon_missing.png", index:7, mips:false, filter:true, clamp:true },
      { id:"icon_corp", url:baseUrl + "ui/icon_corp_sdf.png", index:7, mips:false, filter:true, clamp:true },
      { id:"icon_profile", url:baseUrl + "ui/icon_profile_sdf.png", index:7, mips:false, filter:true, clamp:true },
      { id:"icon_dividends", url:baseUrl + "ui/icon_dividends_sdf.png", index:7, mips:false, filter:true, clamp:true },
      { id:"icon_referral", url:baseUrl + "ui/icon_bonus_sdf.png", index:7, mips:false, filter:true, clamp:true },
      { id:"icon_tokens", url:baseUrl + "ui/icon_tokens_sdf.png", index:7, mips:false, filter:true, clamp:true },
      { id:"filling_tokyo", url:baseUrl + "ui/filling_tokyo_sdf.png", index:7, mips:false, filter:true, clamp:true },
    ];

    for (let i:number = 0; i < texturesData.length; i++) {
      textureLoader = new Texture2DLoader(this._renderer, texturesData[i]["index"], "tex_" + texturesData[i]["id"], texturesData[i]["url"], texturesData[i]["mips"], texturesData[i]["filter"], texturesData[i]["clamp"]);
      this._assetsLoader.push(textureLoader);
    }

    var textureArrayLoader:Texture2DArrayLoader;
    var facadesUrl:string = meshesUrl + "textures/";
    var texIndexStart:number = 7;

    var facades:string[] = [
      facadesUrl + "base_albedo.png",
      facadesUrl + "water_albedo.png",
      facadesUrl + "builds_albedo.png",
      facadesUrl + "roads_albedo.png",
      facadesUrl + "grid_edge_albedo.png",
      facadesUrl + "grid_albedo.png"
    ];

    textureArrayLoader = new Texture2DArrayLoader(
      this._renderer,
      texIndexStart,
      "tex_facades",
      facades
    );

    this._assetsLoader.push(textureArrayLoader);

    var textLoader:TextLoader;
    var scenesData:any[] = [
      { id:"scene_01", url:baseUrl + "scene_01.json" }
    ];

    for (let i:number = 0; i < scenesData.length; i++) {
      textLoader = new TextLoader(scenesData[i]["id"], scenesData[i]["url"]);
      this._assetsLoader.push(textLoader);
    }

    // luts
    var lutIndexStart:number = 8;
    var lutData:any[] = [
      { id:"lut", url:"lut.png", index:lutIndexStart, width:16, height:16, depth:16 },
      { id:"lut_holo", url:"lut_holo.png", index:lutIndexStart, width:16, height:16, depth:16 }
    ];

    for (let i:number = 0; i < lutData.length; i++) {
      tex3DLoader = new Texture3DLoader(this._renderer, lutData[i]["index"], "tex_" + lutData[i]["id"], "data/webgl/scenes/" + lutData[i]["url"], lutData[i]["width"], lutData[i]["height"], lutData[i]["depth"]);
      this._assetsLoader.push(tex3DLoader);
    }

    this._assetsLoader.loadAll();
  }

  public build():void {
    const canvas = this._renderer.getCanvas();

    this.setUpUIColors();

    const backColor:Vector4 = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderer.setClearColor(backColor.x, backColor.y, backColor.z, 1);

    this._buffersWidth = canvas.width;
    this._buffersHeight = canvas.height;

    this._layerUI = new LayerGameUI(this._renderer, this._assetsLoader);
    this._layerUI.build();

    this._isLoading = false;
    this.wasBuilt = true;
  }

  protected setUpUIColors():void
  {
    if (this._dAppInterface.playerData["corpId"].toFixed() === "0") {
      UIGlobals.CURRENT_COLOR0 = UIGlobals.CORP1_COLOR0;
      UIGlobals.CURRENT_COLOR1 = UIGlobals.CORP1_COLOR1;
      UIGlobals.CURRENT_COLOR2 = UIGlobals.CORP1_COLOR2;
      UIGlobals.CURRENT_COLOR3 = UIGlobals.CORP1_COLOR3;

      UIGlobals.ENEMY_COLOR1 = UIGlobals.CORP2_COLOR1;
      UIGlobals.ENEMY_COLOR2 = UIGlobals.CORP2_COLOR2;
      UIGlobals.ENEMY_COLOR3 = UIGlobals.CORP2_COLOR3;

    } else {
      UIGlobals.CURRENT_COLOR0 = UIGlobals.CORP2_COLOR0;
      UIGlobals.CURRENT_COLOR1 = UIGlobals.CORP2_COLOR1;
      UIGlobals.CURRENT_COLOR2 = UIGlobals.CORP2_COLOR2;
      UIGlobals.CURRENT_COLOR3 = UIGlobals.CORP2_COLOR3;

      UIGlobals.ENEMY_COLOR1 = UIGlobals.CORP1_COLOR1;
      UIGlobals.ENEMY_COLOR2 = UIGlobals.CORP1_COLOR2;
      UIGlobals.ENEMY_COLOR3 = UIGlobals.CORP1_COLOR3;
    }
  }

  public resize(width:number, height:number)
  {
    if (this._isLoading) return;

    this._buffersWidth = Math.round(width);
    this._buffersHeight = Math.round(height);

    this._layerUI.resize(width, height);
  }

  public refresh():void
  {
    this.setUpUIColors();

    this._layerUI.refresh();
  }

  public update():void
  {
    if (this._isLoading) return;

    this._layerUI.update();
  }

  public draw(toTarget:RenderTexture):void
  {
    if (this._isLoading) return;

    this._layerUI.draw(toTarget);
  }

  destruct()
  {

  }

  protected onLoadingError(asset:IAsset):void
  {

  }

}
export default StageGame;
