import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import AssetsLoader from "../../../loader/AssetsLoader";
import Renderable from "../../../core/Renderable";
import Mesh from "../../../core/Mesh";
import MeshQuad from "../../../core/MeshQuad";
import UIShaderPlane from "../ui/materials/shaders/UIShaderPlane";
import DAppInterface from "../../../../DAppInterface";
import UIMaterialPlane from "../ui/materials/UIMaterialPlane";
import {default as LayerGameUI, UIActionIndex} from "../LayerGameUI";
import IUIScreen from "./IUIScreen";
import Vector2 from "../../../core/Vector2";
import Utils from "../../../Utils";
import Vector4 from "../../../core/Vector4";
import UIButton from "./UIButton";
import IUIWidget from "./IUIWidget";
import UIPopUpCorp from "./UIPopUpCorp";
import UIButtonTab from "./UIButtonTab";
import UIUtils from "./UIUtils";
import UIPopUpProfile from "./UIPopUpProfile";
import Texture2DLoader from "../../../loader/Texture2DLoader";
import UIGameMap from "./UIGameMap";
import UIGlobals from "./UIGlobals";
import UIToolTip from "./UIToolTip";
import TextRenderable, {TextPivot} from "./TextRenderable";
import {UIPopUpMarket} from "./UIPopUpMarket";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIScreenMain implements IUIScreen{

  public ATTRIBUTES:any = {
    x:-1,
    y:1,
    pivX:-0.5,
    pivY:0.5,
    pxOffX:209,
    pxOffY:-140,
    pxWidth:540,
    pxHeight:390
  };

  protected _renderer:Renderer;
  protected _layer:LayerGameUI;
  protected _assetsLoader:AssetsLoader;

  protected _shaderPlane:UIShaderPlane;

  protected _vSize:Vector2 = new Vector2();
  protected _aspect:number = 0;

  protected _renderables:Renderable[] = [];
  protected _widgets:IUIWidget[] = [];

  protected _fillTop:Renderable;
  protected _fillGuest:Renderable;
  protected _fillPending:Renderable;

  protected _labelGuest:TextRenderable;
  protected _labelPrerelease:TextRenderable;
  protected _labelPending:TextRenderable;

  protected _btnBalance:UIButton;
  protected _btnTokens:UIButtonTab;
  protected _btnAdmin:UIButton;

  protected _btnBack:UIButton;
  protected _btnCorp:UIButtonTab;
  protected _btnProfile:UIButtonTab;

  protected _map:UIGameMap;

  protected _tooltipClaimTokens:UIToolTip;
  protected _tooltipBuyTokens:UIToolTip;

  protected _buyTooltipFlag:boolean = true;

  protected _uiData:any = {
    fill_top:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:-60, width:1, pxHeight:60 },
    tooltip:{ x:-1, y:1, pivX:0, pivY:0.5, pxOffX:0, pxOffY:0, width:1, pxHeight:40 },
    tooltip_buy:{ x:1, y:1, pivX:0, pivY:0.5, pxOffX:0, pxOffY:0, width:1, pxHeight:40 },

    btn_balance:{ x:1, y:1, pivX:0.5, pivY:0.5, pxOffX:-150, pxOffY:-65, pxWidth:240, pxHeight:50 },
    btn_tokens:{ x:1, y:1, pivX:0.5, pivY:0.5, pxOffX:-150, pxOffY:-60, pxWidth:240, pxHeight:60 },
    btn_admin: { x:-1, y:-1, pivX:-0.5, pivY:-0.5, pxOffX:150, pxOffY:60, pxWidth:240, pxHeight:60 },

    btn_back:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:150, pxOffY:-60, pxWidth:60, pxHeight:60 },
    btn_corp:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:209, pxOffY:-60, pxWidth:180, pxHeight:60 },
    btn_ledger:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:388, pxOffY:-60, pxWidth:180, pxHeight:60 },

    fill_guest:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, width:1, pxHeight:30 },
    label_guest:{ x:0, y:1, pxOffX:0, pxOffY:-10, pxHeight:11 },

    label_prerelease:{ x:0, y:-1, pxOffX:0, pxOffY:20, pxHeight:10 },

    label_pending: { x:0, y:1, pxOffX: 0, pxOffY: -10, pxHeight:11 },
    // label_pending: { x:-1, y:1, pxOffX: 150, pxOffY: -220, pxHeight:10 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader, layer:LayerGameUI) {
    this._renderer = renderer;
    this._layer = layer;
    this._assetsLoader = loader;

    this._shaderPlane = new UIShaderPlane(this._renderer);

    this.build();
  }

  protected build():void
  {
    this._vSize.x = this._renderer.getCanvas().width;
    this._vSize.y = this._renderer.getCanvas().height;

    const mesh: Mesh = new MeshQuad(this._renderer);


    // map
    this._map = new UIGameMap(this._renderer, this._assetsLoader);
    this._widgets.push(this._map);


    // fillings
    this._fillTop = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._fillTop.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._fillTop.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._fillTop.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._fillTop.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 1, 1);
    this._renderables.push(this._fillTop);

    this._tooltipClaimTokens = new UIToolTip(this._renderer, this._assetsLoader, ["$YOU HAVE TOKENS TO CLAIM"], [0xff171717], 10);
    this._tooltipClaimTokens.hide();
    this._widgets.push(this._tooltipClaimTokens);

    this._tooltipBuyTokens = new UIToolTip(this._renderer, this._assetsLoader, ["$BUY GAME TOKENS"], [0xff171717], 10);
    this._tooltipBuyTokens.hide();
    this._widgets.push(this._tooltipBuyTokens);


    // buttons
    this._btnBack = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.BACK, ["$<"], [0xfff0f0f0], 24);
    this._widgets.push(this._btnBack);

    this._btnCorp = new UIButtonTab(this._renderer, this._assetsLoader, UIActionIndex.PROFILE_CORP, ["$  CORPORATION"], [UIGlobals.CURRENT_COLOR2], 10, true, "tex_icon_corp");
    this._widgets.push(this._btnCorp);

    this._btnProfile = new UIButtonTab(this._renderer, this._assetsLoader, UIActionIndex.PROFILE_PLAYER, ["$  PROFILE"], [UIGlobals.CURRENT_COLOR2], 10, true, "tex_icon_profile");
    this._widgets.push(this._btnProfile);


    // texts
    this._btnBalance = new UIButton(
      this._renderer,
      this._assetsLoader,
      UIActionIndex.BALANCE,
      ["$BALANCE $0#"],
      [UIGlobals.CURRENT_COLOR2, 0xfff0f0f0],
      10,
      true
    );
    this._btnBalance.setBorderless(true);
    this._widgets.push(this._btnBalance);

    this._btnTokens = new UIButtonTab(
      this._renderer,
      this._assetsLoader,
      UIActionIndex.TOKENS,
      ["$TOKENS $0"],
      [UIGlobals.CURRENT_COLOR2, 0xfff0f0f0],
      10,
      true
    );
    this._widgets.push(this._btnTokens);

    this._btnAdmin = new UIButton(
      this._renderer,
      this._assetsLoader,
      UIActionIndex.WITHDRAW_ADMIN_BALANCE,
      ["$0#"],
      [0xfff0f0f0],
      10,
      true
    );
    // this._btnAdmin.setBorderless(true);
    this._btnAdmin.hide();
    this._widgets.push(this._btnAdmin);


    // guest
    this._fillGuest = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._fillGuest.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._fillGuest.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.GUEST_FILLING);
    (this._fillGuest.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.GUEST_FILLING);
    (this._fillGuest.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 1, 1);

    const guestLabelText:string = "$YOU ARE VIEWING THE SITE AS A GUEST. BUY GAME TOKENS TO PLAY THE GAME";
    this._labelGuest = new TextRenderable(this._renderer, [guestLabelText], [0xffffffff], TextPivot.CENTER, TextPivot.TOP, 0.7);
    this._labelGuest.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelGuest.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.GUEST_FILLING);

    // pre-release
    const prereleaseLabelText:string[] = [
      "$THE GAME IS CURRENTLY IN THE PRERELEASE PHASE, AIMED AT BALANCING THE GAME WORLD BY ENSURING THAT THE FIRST TOKENS ARE EQUALLY DISTRIBUTED.",
      "$DURING THIS PHASE, SOME FEATURES ARE DISABLED AND PLAYERS CAN BUY A LIMITED AMOUNT OF GAME TOKENS.",
      "$THE PRERELEASE PHASE WILL END AS SOON AS THE PRERELEASE QUOTA IS MET (CURRENTLY AT 20 ETHER)"
    ];
    this._labelPrerelease = new TextRenderable(this._renderer, prereleaseLabelText, [UIGlobals.CURRENT_COLOR2], TextPivot.CENTER, TextPivot.BOTTOM, 0.7, 1.5);
    this._labelPrerelease.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelPrerelease.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    // pending transactions
    this._fillPending = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._fillPending.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._fillPending.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.PENDING_FILLING);
    (this._fillPending.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.PENDING_FILLING);
    (this._fillPending.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 1, 1);
    this._renderables.push(this._fillPending);

    const pendingLabelText:string[] = [
      "$NOTE: THERE ARE PENDING TRANSACTIONS."
    ];
    // this._labelPending = new TextRenderable(this._renderer, pendingLabelText, [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.BOTTOM, 0.7);
    this._labelPending = new TextRenderable(this._renderer, pendingLabelText, [0xffffffff], TextPivot.CENTER, TextPivot.TOP, 0.7);
    this._labelPending.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    // this._labelPending.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._labelPending.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.PENDING_FILLING);
    this._renderables.push(this._labelPending);


    // actions
    this._layer.addAction(UIActionIndex.BACK, ()=>this.onBack());
    this._layer.addAction(UIActionIndex.HELP, ()=>this.onHelp());
    this._layer.addAction(UIActionIndex.PROFILE_CORP, ()=>this.onCorpProfile());
    this._layer.addAction(UIActionIndex.PROFILE_PLAYER, ()=>this.onPlayerProfile());
    this._layer.addAction(UIActionIndex.TOKENS, ()=>this.onMarket());
    this._layer.addAction(UIActionIndex.WITHDRAW_ADMIN_BALANCE, ()=>this.onWithdrawAdminBalance());


    this.refresh();
    this.resize(this._vSize, null);
  }

  public getMap():UIGameMap
  {
    return this._map;
  }

  public open():void
  {

  }

  public close():void
  {

  }

  public loseFocus():void
  {

  }

  public regainFocus():void
  {
    this._btnCorp.unselect();
    this._btnProfile.unselect();
    this._btnTokens.unselect();
  }

  public translate(pos:Vector2, pivot:Vector2):void
  {

  }

  public resize(vSize:Vector2, scale:Vector2):void
  {
    this._vSize.x = vSize.x;
    this._vSize.y = vSize.y;

    this._aspect = this._vSize.x / this._vSize.y;

    this.transformElements();
  }

  public transformElements():void
  {
    this._map.resize(this._vSize, null);

    var mapUIData:any = this._map.getAtts()["uiData"];

    this._uiData["btn_back"]["pxOffX"] = mapUIData["pxOffX"] / UIGlobals.PIXEL_SIZE;
    this._uiData["btn_tokens"]["pxOffX"] = - (this._vSize.x / UIGlobals.PIXEL_SIZE - (mapUIData["pxOffX"] + mapUIData["pxWidth"]) / UIGlobals.PIXEL_SIZE);

    UIUtils.transformElement2D(this._uiData["fill_top"], this._fillTop, this._vSize, UIGlobals.PIXEL_SIZE);
    UIUtils.transformCanvas(this._uiData["btn_back"], this._btnBack, this._vSize, UIGlobals.PIXEL_SIZE);

    this._uiData["btn_corp"].pxOffX = this._uiData["btn_back"].pxOffX + this._uiData["btn_back"].pxWidth - 1;
    UIUtils.transformCanvas(this._uiData["btn_corp"], this._btnCorp, this._vSize, UIGlobals.PIXEL_SIZE);

    this._uiData["btn_ledger"].pxOffX = this._uiData["btn_corp"].pxOffX + this._btnCorp.getSize().x * this._vSize.x / UIGlobals.PIXEL_SIZE - 1;
    UIUtils.transformCanvas(this._uiData["btn_ledger"], this._btnProfile, this._vSize, UIGlobals.PIXEL_SIZE);
    UIUtils.transformCanvas(this._uiData["btn_tokens"], this._btnTokens, this._vSize, UIGlobals.PIXEL_SIZE);

    this._uiData["btn_balance"].pxOffX = this._uiData["btn_tokens"].pxOffX - this._btnTokens.getSize().x * this._vSize.x / UIGlobals.PIXEL_SIZE + 1;
    UIUtils.transformCanvas(this._uiData["btn_balance"], this._btnBalance, this._vSize, UIGlobals.PIXEL_SIZE);
    UIUtils.transformCanvas(this._uiData["btn_admin"], this._btnAdmin, this._vSize, UIGlobals.PIXEL_SIZE);

    this._uiData["tooltip"].pxOffX = this._uiData["btn_ledger"].pxOffX + this._uiData["btn_ledger"].pxWidth * 0.5;
    this._uiData["tooltip"].pxOffY = this._uiData["btn_ledger"].pxOffY - this._uiData["btn_ledger"].pxHeight - 10;
    UIUtils.transformCanvas(this._uiData["tooltip"], this._tooltipClaimTokens, this._vSize, UIGlobals.PIXEL_SIZE);

    this._uiData["tooltip_buy"].pxOffX = this._uiData["btn_tokens"].pxOffX - this._btnTokens.getSize().x * 0.5 * this._vSize.x / UIGlobals.PIXEL_SIZE;
    this._uiData["tooltip_buy"].pxOffY = this._uiData["btn_tokens"].pxOffY - this._uiData["btn_tokens"].pxHeight - 10;
    UIUtils.transformCanvas(this._uiData["tooltip_buy"], this._tooltipBuyTokens, this._vSize, UIGlobals.PIXEL_SIZE);

    // guest message
    UIUtils.transformElement2D(this._uiData["fill_guest"], this._fillGuest, this._vSize, UIGlobals.PIXEL_SIZE);
    UIUtils.transformTextElement2D(this._uiData["label_guest"], this._labelGuest, this._vSize, UIGlobals.PIXEL_SIZE);

    // prerelease message
    UIUtils.transformTextElement2D(this._uiData["label_prerelease"], this._labelPrerelease, this._vSize, UIGlobals.PIXEL_SIZE);
    const pixelSizeY:number = 1 / this._vSize.y * 2;
    const scaleY:number = this._uiData["label_prerelease"].pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE;
    const scaleX:number = scaleY / (this._vSize.x / this._vSize.y);
    this._labelPrerelease.setScale(scaleX, scaleY);

    // pending message
    UIUtils.transformElement2D(this._uiData["fill_guest"], this._fillPending, this._vSize, UIGlobals.PIXEL_SIZE);
    UIUtils.transformTextElement2D(this._uiData["label_pending"], this._labelPending, this._vSize, UIGlobals.PIXEL_SIZE);
  }

  public refresh():void
  {
    const dappInterface:DAppInterface = DAppInterface.instance;
    const playerData:any = dappInterface.playerData;
    const adminData:any = dappInterface.adminData;

    let tokenBalance:string = UIUtils.clampText(playerData["tokenBalance"].toFixed());
    this._btnTokens.getLabel().setText(["$TOKENS $" + tokenBalance]);

    let etherBalance:string = UIUtils.clampText(playerData["dividends"].toFixed());
    this._btnBalance.getLabel().setText(["$BALANCE $" + etherBalance + "#"]);

    let adminBalance:string = UIUtils.clampText(adminData["balance"].toFixed());
    this._btnAdmin.getLabel().setText(["$" + adminBalance + "#"]);
    if (adminData["isAdmin"]) this._btnAdmin.show(); else this._btnAdmin.hide();

    if (this.hasTokensToClaim()) {
      this._tooltipClaimTokens.show();

    } else {
      this._tooltipClaimTokens.hide();
    }

    const indexOfFillGuest:number = this._renderables.indexOf(this._fillGuest);
    if (indexOfFillGuest >= 0) {
      this._renderables.splice(indexOfFillGuest, 1);
    }

    const indexOfLabelGuest:number = this._renderables.indexOf(this._labelGuest);
    if (indexOfLabelGuest >= 0){
      this._renderables.splice(indexOfLabelGuest, 1);
    }

    if (!playerData.initialized) {
      this._renderables.push(this._fillGuest);
      this._renderables.push(this._labelGuest);

      if (this._buyTooltipFlag) {
        this._buyTooltipFlag = false;
        this._tooltipBuyTokens.show();
      }

    } else {
      this._tooltipBuyTokens.hide();
    }

    const indexOfPrerelease:number = this._renderables.indexOf(this._labelPrerelease);
    if (indexOfPrerelease >= 0){
      this._renderables.splice(indexOfPrerelease, 1);
    }

    if (dappInterface.worldState["isPrerelease"]) {
      this._renderables.push(this._labelPrerelease);
    }

    this._map.refresh();

    this.refreshUIColors();
    this.transformElements();
  }

  protected refreshUIColors():void
  {
    // fillings
    (this._fillTop.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._fillTop.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    // buttons
    this._btnBack.resetColors();

    this._btnCorp.setTextColors([UIGlobals.CURRENT_COLOR2]);
    this._btnCorp.resetColors();

    this._btnProfile.setTextColors([UIGlobals.CURRENT_COLOR2]);
    this._btnProfile.resetColors();

    // texts
    this._btnBalance.setTextColors([UIGlobals.CURRENT_COLOR2, 0xfff0f0f0]);
    this._btnBalance.resetColors();

    this._btnTokens.setTextColors([UIGlobals.CURRENT_COLOR2, 0xfff0f0f0]);
    this._btnTokens.resetColors();

    // pre-release
    this._labelPrerelease.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelPrerelease.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    // pending
    // this._labelPending.setColors([UIGlobals.CURRENT_COLOR2]);
    // this._labelPending.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
  }

  public includesPoint(point:Vector2):boolean
  {
    return true;
  }

  public update():void
  {
    if (DAppInterface.instance.hasPendingTransactions()) {
      if (this._labelPending.isHidden()) {
        const indexOfLabelPending:number = this._renderables.indexOf(this._labelPending);
        this._renderables.splice(indexOfLabelPending, 0, this._fillPending);

        this._labelPending.show();
        this._layer._isDirty = true;
      }

    } else {
      if (!this._labelPending.isHidden()) {
        const indexOfFillPending:number = this._renderables.indexOf(this._fillPending);
        this._renderables.splice(indexOfFillPending, 1);

        this._labelPending.hide();
        this._layer._isDirty = true;
      }
    }

    for (let i:number = 0; i < this._widgets.length; i++) {
      this._widgets[i].update();
    }
  }

  public draw(camera:Camera):void
  {
    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(camera);
    }

    // why does this take care of the hidden frames bug?
    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(camera);
    }

    for (let i:number = 0; i < this._widgets.length; i++) {
      this._widgets[i].draw(camera);
    }
  }

  destruct()
  {

  }

  private hasTokensToClaim():boolean
  {
    const playerData:any = DAppInterface.instance.playerData;
    const raidsData:any = DAppInterface.instance.raidsData;

    for (let i:number = 0; i < 4; i++) {
      const raidId:any = playerData["raidIds"][i];
      if (raidId.gt(0)) {
        const raid:any = raidsData[raidId.toFixed()];
        if (raid["hasBeenRevealed"]) {
          return true;
        }
      }
    }

    return false;
  }

  // Actions

  private onBack():void
  {

  }

  private onHelp():void
  {

  }

  private onCorpProfile():void
  {
    this._tooltipClaimTokens.hide();
    // this._tooltipBuyTokens.hide();

    let popUp:UIPopUpCorp = this._layer.corpPopUp;
    popUp.ATTRIBUTES["pxOffX"] = this._uiData["btn_corp"]["pxOffX"];
    this._layer.pushScreen(popUp);

    this._btnCorp.select();
  }

  private onPlayerProfile():void
  {
    this._tooltipClaimTokens.hide();
    // this._tooltipBuyTokens.hide();

    let popUp:UIPopUpProfile = this._layer.profilePopUp;
    popUp.ATTRIBUTES["pxOffX"] = this._uiData["btn_ledger"]["pxOffX"];
    this._layer.pushScreen(popUp);

    this._btnProfile.select();
  }

  private onMarket():void
  {
    this._tooltipClaimTokens.hide();
    this._tooltipBuyTokens.hide();

    let popUp:UIPopUpMarket = this._layer.marketPopUp;
    popUp.ATTRIBUTES["pxOffX"] = this._uiData["btn_tokens"]["pxOffX"];
    this._layer.pushScreen(popUp);

    this._btnTokens.select();
  }

  private onWithdrawAdminBalance():void
  {
    // console.log("onWithdrawAdminBalance");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const adminData:any = dAppInstance.adminData;

    if (adminData.isAdmin) {
      this._btnAdmin.disable();
      dAppInstance.withdrawAdminBalance(
        (hash:string) => this._btnAdmin.enable(),
        (receipt:any) => {},
        (error:any) => this._btnAdmin.enable()
      );
    }

    // if (adminData.isAdmin) {
    //   var playerData:any = DAppInterface.instance.playerData;
    //   const toCorp:number = playerData["corpId"].eq(1)? 0 : 1;
    //
    //   this._btnAdmin.disable();
    //   dAppInstance.changePlayerCorporation(
    //     toCorp,
    //     (hash:string) => this._btnAdmin.enable(),
    //     (receipt:any) => {},
    //     (error:any) => this._btnAdmin.enable()
    //   );
    // }

    // if (adminData.isAdmin) {
    //   this._btnAdmin.disable();
    //   dAppInstance.transfer(
    //     "0x947cFC2d53eA0C0f322322914535C21482BbaE85",
    //     (new BigNumber(100000)).times(1e18),
    //     (hash:string) => this._btnAdmin.enable(),
    //     (receipt:any) => {},
    //     (error:any) => this._btnAdmin.enable()
    //   );
    // }
  }
}
export default UIScreenMain;
