import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import AssetsLoader from "../../loader/AssetsLoader";
import Clock from "../../Clock";
import Vector3 from "../../core/Vector3";
import RenderTexture from "../../core/RenderTexture";
import DAppInterface from "../../../DAppInterface";
import UIScreenMain from "./ui/UIScreenMain";
import IUIScreen from "./ui/IUIScreen";
import UIUtils from "./ui/UIUtils";
import UIPopUpNode from "./ui/UIPopUpNode";
import Vector2 from "../../core/Vector2";
import UIGameMap from "./ui/UIGameMap";
import MaterialBlit from "../materials/MaterialBlit";
import ShaderPostSimple from "../materials/shaders/ShaderPostSimple";
import ShaderPostGlitch from "../materials/shaders/ShaderPostGlitch";
import MaterialBlitTimed from "../materials/MaterialBlitTimed";
import Texture2DLoader from "../../loader/Texture2DLoader";
import ShaderPostBlendUI from "./ui/ShaderPostBlendUI";
import UIGlobals from "./ui/UIGlobals";
import Vector4 from "../../core/Vector4";
import Utils from "../../Utils";
import UIPopUpCorp from "./ui/UIPopUpCorp";
import UIPopUpProfile from "./ui/UIPopUpProfile";
import {UIPopUpMarket} from "./ui/UIPopUpMarket";
import UIPopUpGuest from "./ui/UIPopUpGuest";

export enum UIActionIndex {
  BACK = 100,
  HELP,
  PROFILE_CORP,
  PROFILE_PLAYER,
  BALANCE,
  TOKENS,
  CLAIM_TOKENS,
  WITHDRAW_ETHER,
  WITHDRAW_ADMIN_BALANCE,
  BUY_INPUT_FIELD,
  BUY_TOKENS_1,
  BUY_TOKENS_2,
  BUY_TOKENS_3,
  SELL_TOKENS,
  NODE_INVEST,
  NODE_REVEAL,
  NODE_ADD_TOKENS,
  NODE_REMOVE_TOKENS,
  GUEST_CLOSE,
}

/**
 * Created by mdavids on 9/7/2017.
 */
class LayerGameUI {

  public nodePopUp:UIPopUpNode;
  public corpPopUp:UIPopUpCorp;
  public profilePopUp:UIPopUpProfile;
  public marketPopUp:UIPopUpMarket;
  public guestPopUp:UIPopUpGuest;

  protected _renderer:Renderer;
  protected _dAppInterface:DAppInterface;
  protected _assetsLoader:AssetsLoader;

  protected _buffer:RenderTexture;
  protected _bufferMainScreen:RenderTexture;
  protected _bufferPopUp:RenderTexture;

  protected _blitSimple:MaterialBlit;
  protected _blitSimpleUI:MaterialBlitTimed;
  protected _blitGlitch:MaterialBlitTimed;

  protected _refreshAcc:number = 2;

  protected _canCache:boolean = true;
  // protected _isDirty:boolean = true;
  public _isDirty:boolean = true;

  protected _camera:Camera;
  protected _currentFov:number = 40;

  protected _orthoSize:number = 30;
  protected _retinaMultiplier:number = 0;

  protected _screenStack:IUIScreen[] = [];
  protected _screensToRemove:IUIScreen[] = [];

  protected _sceneStartTime:number = 0;

  protected _actionMapping:Map<number, Function> = new Map<number, Function>();

  constructor(renderer:Renderer, loader:AssetsLoader) {
    this._renderer = renderer;
    this._assetsLoader = loader;

    this._dAppInterface = DAppInterface.instance;
  }

  public build():void {
    var width:number = this._renderer.getCanvas().width;
    var height:number = this._renderer.getCanvas().height;

    this._buffer = new RenderTexture(this._renderer, width, height, 4, false, true, true, false, false, false, true);
    this._bufferMainScreen = new RenderTexture(this._renderer, width, height, 5, false, true, true, false, false, false, true);
    this._bufferPopUp = new RenderTexture(this._renderer, width, height, 6, false, true, true, false, false, false, true);

    this._blitSimple = new MaterialBlit(this._renderer, new ShaderPostSimple(this._renderer));

    this._blitSimpleUI = new MaterialBlitTimed(this._renderer, new ShaderPostBlendUI(this._renderer));
    this._blitSimpleUI.texture2 = this._bufferPopUp;

    this._blitGlitch = new MaterialBlitTimed(this._renderer, new ShaderPostGlitch(this._renderer));
    this._blitGlitch.texture2 = this._assetsLoader.getAsset("tex_noise") as Texture2DLoader;

    var fovy: number = this._currentFov * 0.0174533;
    this._camera = new Camera(this._renderer, fovy, 0.1, 100, width / height);
    this._camera.forceOrthogonal(height * this._orthoSize / 1080);
    this._camera.setViewport(0, 0, width, height);
    this._camera.getTransform().setPositionXYZ(0, 0, 10);

    this.pushScreen(new UIScreenMain(this._renderer, this._assetsLoader, this));

    this._sceneStartTime = Clock.globalTime;
    this._retinaMultiplier = window.devicePixelRatio || 1;

    this.resize(width, height);
    this.initEventHandlers();


    // pop ups
    this.nodePopUp = new UIPopUpNode(this._renderer, this._assetsLoader, this);
    this.corpPopUp = new UIPopUpCorp(this._renderer, this._assetsLoader);
    this.profilePopUp = new UIPopUpProfile(this._renderer, this._assetsLoader, this);
    this.marketPopUp = new UIPopUpMarket(this._renderer, this._assetsLoader, this);
    this.guestPopUp = new UIPopUpGuest(this._renderer, this._assetsLoader, this);


    // const playerData:any = this._dAppInterface.playerData;
    // if (!playerData.initialized) {
    //   this.onGuest();
    // }
  }

  public refresh(resetAcc:boolean = true):void
  {
    if (resetAcc) {
      this._refreshAcc = 0;
    }

    for (let i:number = 0; i < this._screenStack.length; i++) {
      this._screenStack[i].refresh();
    }

    this._isDirty = true;
  }

  public addAction(actionIndex:UIActionIndex, callback:Function):void
  {
    this._actionMapping.set(actionIndex, callback);
  }

  public removeAction(actionIndex:UIActionIndex):void
  {
    this._actionMapping.delete(actionIndex);
  }

  public pushScreen(screen:IUIScreen):void
  {
    if (this._screenStack.length > 0) {
      this._screenStack[0].loseFocus();
    }

    this._screenStack.splice(0, 0, screen);

    UIUtils.transformPopUp(screen.ATTRIBUTES, screen, this._camera.vSize, UIGlobals.PIXEL_SIZE);
    screen.open();

    this._blitSimpleUI.startTime = Clock.globalTime;

    this._isDirty = true;
  }

  public popScreen(screen:IUIScreen, immediately:boolean = false):void
  {
    if (immediately) {
      const index:number = this._screenStack.indexOf(screen);
      this._screenStack.splice(index, 1);
      screen.close();

      if (this._screenStack.length > 0) {
        this._screenStack[0].regainFocus();
      }

    } else {
      this._screensToRemove.push(screen);
    }

    this._isDirty = true;
  }

  public closeCurrentPopUp():void {
    if (this._screenStack.length > 1) {
      this.popScreen(this._screenStack[0]);
    }
  }

  protected removePendingScreens():void {
    let index: number = 0;

    for (let screen of this._screensToRemove) {
      index = this._screenStack.indexOf(screen);
      this._screenStack.splice(index, 1);
      screen.close();
    }

    if (this._screenStack.length > 0) {
      this._screenStack[0].regainFocus();
    }

    this._screensToRemove = [];

    this._isDirty = true;
  }

  public resize(width:number, height:number):void
  {
    this._buffer.setSize(width, height);
    this._bufferMainScreen.setSize(width, height);
    this._bufferPopUp.setSize(width, height);

    this._camera.setViewport(0, 0, width, height);
    this._camera.forceOrthogonal(height * this._orthoSize / 1080);

    for (let i:number = 0; i < this._screenStack.length; i++) {
      UIUtils.transformPopUp(this._screenStack[i].ATTRIBUTES, this._screenStack[i], this._camera.vSize, UIGlobals.PIXEL_SIZE);
    }

    this._isDirty = true;
  }

  public update():void
  {
    this._refreshAcc += Clock.deltaTime;

    for (let i:number = 0; i < this._screenStack.length; i++) {
      this._screenStack[i].update();
    }

    if (this._screensToRemove.length > 0) {
      this.removePendingScreens();
    }
  }

  public draw(toTarget:RenderTexture):void
  {
    if (this._isDirty || !this._canCache) {
      this._renderer.setRenderTarget(this._bufferMainScreen);
      const backColor:Vector4 = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
      this._renderer.setClearColor(backColor.x, backColor.y, backColor.z, 1);
      this._renderer.clear();
      this._screenStack[this._screenStack.length - 1].draw(this._camera);

      this._renderer.setRenderTarget(this._bufferPopUp);
      this._renderer.setClearColor(0, 0, 0, 1);
      this._renderer.clear();

      for (let i:number = this._screenStack.length - 2; i >= 0; i--) {
        this._screenStack[i].draw(this._camera);
      }

      this._isDirty = false;
    }

    this._renderer.blitInto(this._bufferMainScreen, this._buffer, this._blitSimpleUI);

    if (this._refreshAcc < 0.7) {
      this._renderer.blitInto(this._buffer, toTarget, this._blitGlitch);

    } else {
      this._renderer.blitInto(this._buffer, toTarget, this._blitSimple);
    }
  }

  destruct()
  {

  }

  protected onSectorSelected(index:number):void
  {
    // console.log("onSectorSelected " + index.toFixed());

    var map:UIGameMap = (this._screenStack[0] as UIScreenMain).getMap();
    var mapAtts:any = map.getAtts();
    var nodeProj:Vector3 = map.getNodeProjPos(index);
    nodeProj.x = (nodeProj.x * 0.5 + 0.5) * mapAtts.scale.x;
    nodeProj.y = (nodeProj.y * 0.5 + 0.5) * mapAtts.scale.y;
    nodeProj.x += (mapAtts.pos.x * 0.5 + 0.5);
    nodeProj.y += (mapAtts.pos.y * 0.5 + 0.5) - mapAtts.scale.y;

    this.nodePopUp.nodeIndex = index;
    this.nodePopUp.ATTRIBUTES["x"] = nodeProj.x * 2 - 1;
    this.nodePopUp.ATTRIBUTES["y"] = nodeProj.y * 2 - 1;
    this.nodePopUp.ATTRIBUTES["pxOffY"] = -50;

    if (nodeProj.y < 0) {
      this.nodePopUp.ATTRIBUTES["pivY"] = -0.5;
      this.nodePopUp.ATTRIBUTES["pxOffY"] = 50;
    }

    this.pushScreen(this.nodePopUp);
  }

  protected initEventHandlers():void
  {
    var canvas:HTMLCanvasElement = this._renderer.getCanvas();
    canvas.addEventListener('mousedown', function(e){
      var rect = this._renderer.getCanvas().getBoundingClientRect();
      var mouseX:number = (e.clientX - rect.left) * this._retinaMultiplier;
      var mouseY:number = (e.clientY - rect.top) * this._retinaMultiplier;

      e.preventDefault();
      e.stopPropagation();

      this.handleMouseDown(mouseX, mouseY, e);
    }.bind(this));

    canvas.addEventListener('mouseup', function(e){
      var rect = this._renderer.getCanvas().getBoundingClientRect();
      var mouseX:number = (e.clientX - rect.left) * this._retinaMultiplier;
      var mouseY:number = (e.clientY - rect.top) * this._retinaMultiplier;

      e.preventDefault();
      e.stopPropagation();

      this.handleMouseUp(mouseX, mouseY, e);
    }.bind(this));

    canvas.addEventListener('mousemove', function(e){
      var rect = this._renderer.getCanvas().getBoundingClientRect();
      var mouseX:number = (e.clientX - rect.left) * this._retinaMultiplier;
      var mouseY:number = (e.clientY - rect.top) * this._retinaMultiplier;

      e.preventDefault();
      e.stopPropagation();

      this.handleMouseMove(mouseX, mouseY, e);
    }.bind(this));

    canvas.addEventListener('mouseout', function(e){
      e.preventDefault();
      e.stopPropagation();

      this.handleMouseOut();
    }.bind(this));
  }

  public handleMouseMove(mouseX:number, mouseY:number, e:any):void
  {
    if (this._screenStack.length === 1) {
      const mainScreen:UIScreenMain = this._screenStack[0] as UIScreenMain;
      const mapWindow:UIGameMap = mainScreen.getMap();
      mapWindow.handleMouseMove(mouseX, mouseY, e);

      this._isDirty = true;
    }

    if (this._buffer) {
      let u:number = mouseX / this._camera.vSize.x;
      let v:number = 1.0 - mouseY / this._camera.vSize.y;
      let index:number = this._buffer.getPixel(u, v)[3];

      if (index < 255) {
        this._renderer.getCanvas().style.cursor = 'pointer';

      } else {
        this._renderer.getCanvas().style.cursor = 'default';
      }
    }
  }

  public handleMouseDown(mouseX:number, mouseY:number, e:any):void
  {
    const u:number = mouseX / this._camera.vSize.x;
    const v:number = 1.0 - mouseY / this._camera.vSize.y;
    const proj:Vector2 = new Vector2(u * 2 - 1, v * 2 - 1);

    if (this._buffer) {
      if (this._screenStack.length > 1) {
        if (!this._screenStack[0].includesPoint(proj)) {
          this.popScreen(this._screenStack[0]);
        }

      } else {
        const mainScreen:UIScreenMain = this._screenStack[0] as UIScreenMain;
        const mapWindow:UIGameMap = mainScreen.getMap();
        if (mapWindow.includesPoint(proj)) {
          mapWindow.handleMouseDown(mouseX, mouseY, e);
        }
      }
    }
  }

  public handleMouseUp(mouseX:number, mouseY:number, e:any):void
  {
    if (this._buffer) {
      let u:number = mouseX / this._camera.vSize.x;
      let v:number = 1.0 - mouseY / this._camera.vSize.y;
      let index:number = this._buffer.getPixel(u, v)[3];

      if (index < 255) {
        if (index < 14) {
          this.onSectorSelected(index);

        } else {
          if (this._actionMapping.has(index)){
            this._actionMapping.get(index)();
          }
        }
      }

      const mainScreen:UIScreenMain = this._screenStack[this._screenStack.length - 1] as UIScreenMain;
      const mapWindow:UIGameMap = mainScreen.getMap();
      mapWindow.handleMouseUp(mouseX, mouseY, e);
    }
  }

  public handleMouseOut():void
  {
    const mainScreen:UIScreenMain = this._screenStack[this._screenStack.length - 1] as UIScreenMain;
    const mapWindow:UIGameMap = mainScreen.getMap();
    mapWindow.handleMouseOut();
  }

  private onGuest():void
  {
    let popUp:UIPopUpGuest = this.guestPopUp;
    this.pushScreen(popUp);
  }
}
export default LayerGameUI;
