import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import AssetsLoader from "../../../loader/AssetsLoader";
import Renderable from "../../../core/Renderable";
import UIShaderPlane from "../ui/materials/shaders/UIShaderPlane";
import UIMaterialPlane from "../ui/materials/UIMaterialPlane";
import {TextPivot, default as TextRenderable} from "./TextRenderable";
import IUIWidget from "./IUIWidget";
import Vector2 from "../../../core/Vector2";
import UIBarVs from "./UIBarVs";
import Texture2DLoader from "../../../loader/Texture2DLoader";
import Utils from "../../../Utils";
import UIGlobals from "./UIGlobals";
import DAppInterface from "../../../../DAppInterface";
import UIUtils from "./UIUtils";

export enum UITokenInvestmentState {
  EMPTY,
  LOCKED,
  PENDING,
  READY
}

/**
 * Created by mdavids on 9/7/2017.
 */
class UITokenInvestment implements IUIWidget{

  public weight:number = 0.5;

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _shaderPlane:UIShaderPlane;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _isHidden:boolean = false;
  protected _currentState:UITokenInvestmentState = UITokenInvestmentState.EMPTY;

  protected _renderables:Renderable[] = [];
  protected _widgets:IUIWidget[] = [];

  protected _index:number = -1;
  protected _data:any;

  protected _colorBackground:number = 0x0;
  protected _colorLeft:number = 0x0;
  protected _colorRight:number = 0x0;

  protected _bar:UIBarVs;
  protected _labelOneLine:TextRenderable;
  protected _labelTitle:TextRenderable;

  protected _uiData:any = {
    bar:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:200, pxHeight:10 },
    label_one_line:{ x:0, y:0, pxOffX:0, pxOffY:18, pxHeight:10 },
    label_title:{ x:-1, y:1, pxOffX:0, pxOffY:10, pxHeight:10 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader, index:number) {
    this._renderer = renderer;
    this._assetsLoader = loader;
    this._index = index;

    this._shaderPlane = new UIShaderPlane(this._renderer);

    this._vSize.x = 1;
    this._vSize.y = 1;

    this._colorBackground = UIGlobals.CURRENT_COLOR0;
    this._colorLeft = UIGlobals.CURRENT_COLOR2;
    this._colorRight = UIGlobals.CURRENT_COLOR1;

    this.build();
  }

  protected build():void
  {
    this._labelOneLine = new TextRenderable(this._renderer, ["$EMPTY"], [0xff696766], TextPivot.CENTER, TextPivot.CENTER);
    this._labelOneLine.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelOneLine.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelTitle = new TextRenderable(this._renderer, ["$ARGO BIOTECH > 5000 TOKENS"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.7);
    this._labelTitle.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTitle.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._bar = new UIBarVs(
      this._renderer,
      this._assetsLoader,
      ["$CORP STRENGTH _ 50%", "$ "],
      this._colorLeft,
      this._colorRight,
      this._colorBackground
    );

    this._bar._uiData["labelLeft"]["pxOffY"] = -10;

    this.setState(UITokenInvestmentState.EMPTY);

    this.resize(this._vSize, this._scale);
  }

  public resetColors():void
  {
    this._labelOneLine.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelTitle.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelTitle.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._colorBackground = UIGlobals.CURRENT_COLOR0;
    this._colorLeft = UIGlobals.CURRENT_COLOR2;
    this._colorRight = UIGlobals.CURRENT_COLOR1;

    this._bar.setColors(
      this._colorLeft,
      this._colorRight,
      this._colorBackground
    );
  }

  public setData(data:any):void
  {
    this._data = data;

    const dAppInstance:DAppInterface = DAppInterface.instance;

    if (dAppInstance.IS_BETTING_LOCKED) {
      this._labelOneLine.setText(["$LOCKED"]);
      this.setState(UITokenInvestmentState.EMPTY);

      return;
    }

    if (this._data["id"].toFixed() === "0") {
      this._labelOneLine.setText(["$EMPTY"]);
      this.setState(UITokenInvestmentState.EMPTY);

    } else {
      const playerData:any = dAppInstance.playerData;
      const playerCorpId:any = playerData["corpId"];
      const nodeIndex:number = this._data["targetNodeId"].toNumber();
      const nodeName:string = dAppInstance.nodeNames[nodeIndex].toUpperCase();
      const investedTokens:any = playerData["raidStakes"][this._index];
      const hasBeenRevealed:boolean = this._data["hasBeenRevealed"];
      const attackerId:any = this._data["attackingCorpId"];
      const isAttacker:boolean = playerCorpId.eq(attackerId);
      const enemyStakes:any = isAttacker? this._data["defenderStakes"] : this._data["attackerStakes"];
      const teamStakes:any = isAttacker? this._data["attackerStakes"] : this._data["defenderStakes"];

      if (hasBeenRevealed) {
        const wasRaidSuccessful:boolean = this._data["wasSuccessful"];
        const didPlayerCorpWin:boolean = isAttacker? wasRaidSuccessful : !wasRaidSuccessful;

        let canClaim:any;
        if (didPlayerCorpWin) {
          canClaim = enemyStakes.div(4);
          canClaim = canClaim.times(investedTokens.div(teamStakes));
          canClaim = canClaim.plus(investedTokens);

        } else {
          canClaim = investedTokens.minus(investedTokens.div(4));
        }

        const wonLostText:string = didPlayerCorpWin? "ACQUISITION WON" : "ACQUISITION LOST";
        this._labelTitle.setText([
          "$" + nodeName + " > " + UIUtils.clampText(investedTokens.toFixed()) + " TOKENS",
          "$ ",
          "$" + wonLostText,
          "$CAN CLAIM: " + UIUtils.clampText(canClaim.toFixed()) + " TOKENS"
        ]);

        this._labelTitle.setColors([0xff696766]);

        this.setState(UITokenInvestmentState.READY);

      } else {
        const totalStakes:any = teamStakes.plus(enemyStakes);
        const corpStrength:number = teamStakes.div(totalStakes).toNumber();

        this._labelTitle.setText(["$" + nodeName + " > " + UIUtils.clampText(investedTokens.toFixed()) + " TOKENS"]);
        this._labelTitle.setColors([UIGlobals.CURRENT_COLOR2]);

        this._bar.setLabels(["$CORP STRENGTH _ " + Math.floor(corpStrength * 100) + "%", "$ "]);
        this._bar.weight = corpStrength;

        this.setState(UITokenInvestmentState.PENDING);
      }
    }
  }

  protected setState(newState:UITokenInvestmentState):void
  {
    this._renderables = [];
    this._widgets = [];

    this._currentState = newState;

    switch (this._currentState) {
      case UITokenInvestmentState.LOCKED:
      case UITokenInvestmentState.EMPTY:
        this._renderables.push(this._labelOneLine);
      break;

      case UITokenInvestmentState.PENDING:
        this._widgets.push(this._bar);
        this._renderables.push(this._labelTitle);
      break;

      case UITokenInvestmentState.READY:
        this._renderables.push(this._labelTitle);
      break;

      default:
      break;
    }

    this.refresh();
  }

  public show():void
  {
    this._isHidden = false;
  }

  public hide():void
  {
    this._isHidden = true;
  }

  public resize(vSize:Vector2, scale:Vector2):void
  {
    this._vSize = vSize.clone();
    this._vAspect = this._vSize.x / this._vSize.y;

    this._scale = scale;
  }

  public translate(pos:Vector2, pivot:Vector2):void
  {
    this._pivot = pivot;
    this._pos = pos;

    const tmpOffset:Vector2 = new Vector2();
    tmpOffset.x = this._scale.x * (this._pivot.x + 0.5) * 2;
    tmpOffset.y = this._scale.y * (this._pivot.y + 0.5) * 2;

    this._pos.subtract(tmpOffset);
  }

  public refresh():void
  {
    const pxWidth:number = this._scale.x * this._vSize.x;
    const pxHeight:number = this._scale.y * this._vSize.y;

    this.transformTextElement2D("label_one_line", this._labelOneLine);
    this.transformTextElement2D("label_title", this._labelTitle);
    this.transformWidget("bar", this._bar);
  }

  private transformElement2D(dataId:string, element:Renderable):void
  {
    const pixelSizeX:number = 1 / this._vSize.x * 2;
    const pixelSizeY:number = 1 / this._vSize.y * 2;

    const data:any = this._uiData[dataId];

    const scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * UIGlobals.PIXEL_SIZE : data.width;
    const scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;

    (element.getMaterial() as UIMaterialPlane).pos.x = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    (element.getMaterial() as UIMaterialPlane).pos.y = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;
    (element.getMaterial() as UIMaterialPlane).scale.x = scaleX;
    (element.getMaterial() as UIMaterialPlane).scale.y = scaleY;
    (element.getMaterial() as UIMaterialPlane).pivot.x = data.pivX;
    (element.getMaterial() as UIMaterialPlane).pivot.y = data.pivY;
  }

  private transformTextElement2D(dataId:string, element:TextRenderable):void
  {
    const pixelSizeX:number = 1 / this._vSize.x * 2;
    const pixelSizeY:number = 1 / this._vSize.y * 2;

    const data:any = this._uiData[dataId];

    const posX:number = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    const posY:number = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;

    const scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;
    const scaleX:number = scaleY / this._vAspect;

    element.setPosition(posX, posY);
    element.setScale(scaleX, scaleY);
  }

  private transformWidget(dataId:string, element:IUIWidget):void
  {
    const pixelSizeX:number = 1 / this._vSize.x * 2;
    const pixelSizeY:number = 1 / this._vSize.y * 2;

    const data:any = this._uiData[dataId];

    const scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * UIGlobals.PIXEL_SIZE : data.width;
    const scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;

    const posX:number = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    const posY:number = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;

    element.resize(this._vSize, new Vector2(scaleX, scaleY));
    element.translate(new Vector2(posX, posY), new Vector2(data.pivX, data.pivY));

    element.refresh();
  }

  public includesPoint(point:Vector2):boolean
  {
    return (this._pos.x <= point.x &&
      this._pos.y <= point.y &&
      this._pos.x + this._scale.x * 2 >= point.x &&
      this._pos.y + this._scale.y * 2 >= point.y);
  }

  public update():void
  {

  }

  public draw(camera:Camera):void
  {
    if (this._isHidden) {
      return;
    }

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
}
export default UITokenInvestment;
