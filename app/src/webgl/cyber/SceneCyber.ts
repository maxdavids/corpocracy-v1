import Renderer from "../core/Renderer";
import Scene from "../common/Scene";
import AssetsLoader from "../loader/AssetsLoader";
import Texture2DLoader from "../loader/Texture2DLoader";
import IAsset from "../loader/IAsset";
import RenderTexture from "../core/RenderTexture";
import Texture3DLoader from "../loader/Texture3DLoader";
import MaterialPost from "./materials/MaterialPost";
import StageGame from "./game/StageGame";
import StageLoader from "./loader/StageLoader";
import IStage from "./IStage";
import DAppInterface from "../../DAppInterface";
import Clock from "../Clock";
import UIGlobals from "./game/ui/UIGlobals";

declare var BigNumber:any;

/**
 * Created by mdavids on 2/7/2017.
 */
class SceneCyber extends Scene {

  protected _dAppInterface:DAppInterface;
  protected _dAppAccountSwitchAcc:number = 0;
  protected _dAppRefreshAcc:number = 0;
  protected _dAppIsRefreshing:boolean = false;
  protected _dAppRefreshRequested:boolean = false;

  protected _mainAssetsLoader:AssetsLoader = new AssetsLoader();
  protected _gameAssetsLoader:AssetsLoader = new AssetsLoader();
  protected _isLoading:boolean = false;

  protected _bufferMain:RenderTexture;
  protected _blitPost:MaterialPost;

  protected _stageLoader:StageLoader;
  protected _stageGame:StageGame;
  protected _currentStage:IStage;

  protected _buffersWidth:number = 0;
  protected _buffersHeight:number = 0;

  constructor(renderer:Renderer)
  {
    super(renderer);

    this._dAppInterface = DAppInterface.instance;
  }

  public init():void
  {
    UIGlobals.PIXEL_SIZE = window.devicePixelRatio || 1;
    // UIGlobals.PIXEL_SIZE = 1.2;
  }

  protected createObjects():void
  {
    this.loadAssets();
  }

  protected loadAssets():void
  {
    this._isLoading = true;

    this._mainAssetsLoader.doneCallback = ()=>this.buildScene();
    this._mainAssetsLoader.errorCallback = (asset:IAsset)=>this.onLoadingError(asset);
    this._mainAssetsLoader.updateCallback = ()=>this.onLoadingUpdate();

    var textureLoader:Texture2DLoader;
    var tex3DLoader:Texture3DLoader;

    var baseUrl:string = "data/webgl/";

    // texture assets
    var texIndexStart:number = 7;
    var texturesData:any[] = [
      { id:"glyphs", url:baseUrl + "glyphs.png", index:texIndexStart, mips:false, filter:true, clamp:true },
      { id:"noise", url:baseUrl + "noise.png", index:texIndexStart, mips:false, filter:true, clamp:false },
      { id:"icon_missing", url:baseUrl + "scenes/ui/icon_missing.png", index:texIndexStart, mips:false, filter:true, clamp:true },
    ];

    for (let i:number = 0; i < texturesData.length; i++) {
      textureLoader = new Texture2DLoader(this._renderer, texturesData[i]["index"], "tex_" + texturesData[i]["id"], texturesData[i]["url"], texturesData[i]["mips"], texturesData[i]["filter"], texturesData[i]["clamp"]);
      this._mainAssetsLoader.push(textureLoader);
    }

    // luts
    var lutIndexStart:number = 8;
    var lutData:any[] = [
      { id:"lut_screen", url:"lut_screen.png", index:lutIndexStart, width:16, height:16, depth:16 },
    ];

    for (let i:number = 0; i < lutData.length; i++) {
      tex3DLoader = new Texture3DLoader(this._renderer, lutData[i]["index"], "tex_" + lutData[i]["id"], "data/webgl/" + lutData[i]["url"], lutData[i]["width"], lutData[i]["height"], lutData[i]["depth"]);
      this._mainAssetsLoader.push(tex3DLoader);
    }

    this._mainAssetsLoader.loadAll();
  }

  protected buildScene():void
  {
    this._canvas = this._renderer.getCanvas();
    this._renderer.setClearColor(0, 0, 0, 1);

    this._buffersWidth = this._canvas.width;
    this._buffersHeight = this._canvas.height;

    this._bufferMain = new RenderTexture(this._renderer, this._canvas.width, this._canvas.height, 0, true, true, true, true, false, false, true);

    this._blitPost = new MaterialPost(this._renderer);
    this._blitPost.texNoise = this._mainAssetsLoader.getAsset("tex_noise") as Texture2DLoader;
    this._blitPost.texLUT = this._mainAssetsLoader.getAsset("tex_lut_screen") as Texture3DLoader;

    this._stageLoader = new StageLoader(this._renderer, this._mainAssetsLoader, this._gameAssetsLoader);
    this._stageLoader.build();
    this._currentStage = this._stageLoader;

    this._stageGame = new StageGame(this._renderer, this._gameAssetsLoader);

    this._dAppInterface.doneCallback = () => this.reload();
    this._dAppInterface.errorCallback = (err:any) => this.onDAppError(err);
    this._dAppInterface.eventCallback = () => this.onDAppEvent();
    this._dAppInterface.init();

    this._dAppAccountSwitchAcc = 0;
    this._dAppRefreshAcc = 0;
    this._dAppIsRefreshing = true;

    this._isLoading = false;
  }

  protected reload():void
  {
    this._dAppAccountSwitchAcc = 0;
    this._dAppRefreshAcc = 0;
    this._dAppIsRefreshing = false;

    if (!this._stageGame.wasBuilt) {
      this._stageGame.load();

    } else {
      this._stageGame.refresh();
    }
  }

  protected onDAppError(err:any):void
  {
    // console.log(err);

    this._dAppAccountSwitchAcc = 0;
    this._dAppRefreshAcc = 0;
    this._dAppIsRefreshing = false;

    if (
      err === 'no web3 provider'
      || err ==='no accounts')
    {
      this._stageLoader.showNeedMetaMask();
    }
  }

  protected onDAppEvent():void
  {
    // console.log("onDAppEvent");

    this._dAppRefreshRequested = true;
  }

  public resize(width:number, height:number):void
  {
    super.resize(width, height);

    if (this._isLoading) return;

    this._buffersWidth = Math.round(width);
    this._buffersHeight = Math.round(height);

    this._currentStage.resize(this._buffersWidth, this._buffersHeight);
  }

  protected onLoadingError(asset:IAsset):void
  {

  }

  protected onLoadingUpdate():void
  {

  }

  protected destructObjects():void
  {

  }

  public update():void {
    if (this._isLoading) {
      return;
    }

    if (this._stageGame.wasBuilt) {
      this._currentStage = this._stageGame;

      if (!this._dAppIsRefreshing) {
        this._dAppAccountSwitchAcc += Clock.deltaTime;
        this._dAppRefreshAcc += Clock.deltaTime;

        if (this._dAppAccountSwitchAcc > 0.5) {
          this._dAppAccountSwitchAcc = -10000;
          this._dAppInterface.checkForAccountSwitch((didSwitch:boolean) => {
            this._dAppAccountSwitchAcc = 0;
            if (didSwitch) {
              this._dAppRefreshRequested = true;
              this._dAppRefreshAcc = 11;
            }
          });
        }

        if (this._dAppRefreshAcc > 10) {
          if (this._dAppRefreshRequested) {
            this._dAppRefreshRequested = false;
            this._dAppIsRefreshing = true;
            this._dAppInterface.refresh();

          } else {
            this._dAppRefreshAcc = 9;
          }
        }
      }
    }

    this._currentStage.update();
  }

  public draw():void
  {
    if (this._isLoading) {
      return;
    }

    this._currentStage.draw(this._bufferMain);
    this._renderer.blitToScreen(this._bufferMain, this._blitPost);
  }

  destruct()
  {
    super.destruct();
  }

}
export default SceneCyber;
