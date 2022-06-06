import Renderer from "../../core/Renderer";
import AssetsLoader from "../../loader/AssetsLoader";
import RenderTexture from "../../core/RenderTexture";
import IStage from "../IStage";
import Camera from "../../core/Camera";
import UIBarVs from "../game/ui/UIBarVs";
import IRenderable from "../../core/IRenderable";
import UIUtils from "../game/ui/UIUtils";
import UIGlobals from "../game/ui/UIGlobals";
import Vector4 from "../../core/Vector4";
import Utils from "../../Utils";
import UIPopUpLoginRequired from "../game/ui/UIPopUpLoginRequired";

/**
 * Created by mdavids on 9/7/2017.
 */
class StageLoader implements IStage {

  protected _renderer:Renderer;

  protected _mainAssetsLoader:AssetsLoader;
  protected _gameAssetsLoader:AssetsLoader;

  protected _buffersWidth:number = 0;
  protected _buffersHeight:number = 0;

  protected _bar:UIBarVs;
  protected _popUpLogin:UIPopUpLoginRequired;
  protected _renderables:IRenderable[] = [];

  protected _camera:Camera;
  protected _currentFov:number = 40.0;
  protected _orthoSize:number = 30;

  protected _uiData:any = {
    bar:{ x:0, y:0, pivX:0, pivY:0, pxOffX:0, pxOffY:0, pxWidth:290, pxHeight:50 },
    label_metamask:{ x:0, y:0, pxOffX:0, pxOffY:0, pxHeight:10 },
  };

  constructor(renderer:Renderer, assetsLoader:AssetsLoader, gameAssetsLoader:AssetsLoader) {
    this._renderer = renderer;

    this._mainAssetsLoader = assetsLoader;
    this._gameAssetsLoader = gameAssetsLoader;

    this._gameAssetsLoader.updateCallback = ()=>this.onLoadingUpdate();
  }

  public build():void {
    const canvas = this._renderer.getCanvas();
    const backColor:Vector4 = Utils.hexToRGBA(UIGlobals.CORP1_COLOR0);
    this._renderer.setClearColor(backColor.x, backColor.y, backColor.z, 1);

    this._buffersWidth = canvas.width;
    this._buffersHeight = canvas.height;

    const fovy: number = this._currentFov * 0.0174533;
    this._camera = new Camera(this._renderer, fovy, 0.1, 100, this._buffersWidth / this._buffersHeight);
    this._camera.forceOrthogonal(this._buffersHeight * this._orthoSize / 1080);
    this._camera.setViewport(0, 0, this._buffersWidth, this._buffersHeight);
    this._camera.getTransform().setPositionXYZ(0, 0, 10);

    this._bar = new UIBarVs(
      this._renderer,
      this._mainAssetsLoader,
      ["$LOADING...", "$ "],
      UIGlobals.CORP2_COLOR2,
      UIGlobals.CORP2_COLOR1,
      UIGlobals.CORP2_COLOR0
    );
    this._bar.weight = 0;
    this._renderables.push(this._bar);

    // need metamask
    this._popUpLogin = new UIPopUpLoginRequired(this._renderer, this._mainAssetsLoader);

    this.transformElements();
  }

  public resize(width:number, height:number)
  {
    this._buffersWidth = Math.round(width);
    this._buffersHeight = Math.round(height);

    this._camera.setViewport(0, 0, width, height);
    this._camera.forceOrthogonal(height * this._orthoSize / 1080);

    this.transformElements();
  }

  public transformElements():void
  {
    UIUtils.transformCanvas(this._uiData["bar"], this._bar, this._camera.vSize, UIGlobals.PIXEL_SIZE);
    UIUtils.transformPopUp(this._popUpLogin.ATTRIBUTES, this._popUpLogin, this._camera.vSize, UIGlobals.PIXEL_SIZE);
  }

  public update():void
  {

  }

  public draw(toTarget:RenderTexture):void
  {
    this._renderer.setRenderTarget(toTarget);
    this._renderer.clear();

    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(this._camera);
    }
  }

  public showNeedMetaMask():void
  {
    this._renderables = [];

    this._renderables.push(this._popUpLogin);
    this._popUpLogin.open();
  }

  protected onLoadingUpdate():void
  {
    const total:number = this._gameAssetsLoader.getDoneCount() + this._gameAssetsLoader.getLoadingCount() + this._gameAssetsLoader.getPendingCount();
    const barWeight:number = this._gameAssetsLoader.getDoneCount() / total;
    this._bar.weight = barWeight;

    this.transformElements();
  }

  destruct()
  {

  }

}
export default StageLoader;
