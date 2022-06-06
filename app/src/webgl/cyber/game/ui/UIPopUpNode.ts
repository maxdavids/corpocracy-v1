import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import AssetsLoader from "../../../loader/AssetsLoader";
import Renderable from "../../../core/Renderable";
import Mesh from "../../../core/Mesh";
import MeshQuad from "../../../core/MeshQuad";
import UIShaderPlane from "../ui/materials/shaders/UIShaderPlane";
import UIMaterialPlane from "../ui/materials/UIMaterialPlane";
import Texture2DLoader from "../../../loader/Texture2DLoader";
import {TextPivot, default as TextRenderable} from "./TextRenderable";
import Utils from "../../../Utils";
import Vector4 from "../../../core/Vector4";
import IUIWidget from "./IUIWidget";
import Vector2 from "../../../core/Vector2";
import UIBarVs from "./UIBarVs";
import IUIScreen from "./IUIScreen";
import Quaternion from "../../../core/Quaternion";
import Vector3 from "../../../core/Vector3";
import UIButton from "./UIButton";
import {default as LayerGameUI, UIActionIndex} from "../LayerGameUI";
import UIShaderPlaneSDF from "./materials/shaders/UIShaderPlaneSDF";
import DAppInterface from "../../../../DAppInterface";
import IRenderable from "../../../core/IRenderable";
import UIUtils from "./UIUtils";
import UIGlobals from "./UIGlobals";

const BigNumber = require("bignumber.js");

export enum UIPopUpNodeState {
  LOCKED,
  SAFE_OWNED,
  SAFE_ENEMYS,
  BETTING,
  PENDING
}

/**
 * Created by mdavids on 9/7/2017.
 */
class UIPopUpNode implements IUIScreen{

  public ATTRIBUTES:any = {
    x:-1,
    y:1,
    pivX:0,
    pivY:0.5,
    pxOffX:0,
    pxOffY:0,
    pxWidth:330,
    pxHeight:160
  };

  public nodeIndex:number = -1;

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _currentState:UIPopUpNodeState = UIPopUpNodeState.LOCKED;

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _layer:LayerGameUI;
  protected _shaderPlane:UIShaderPlane;
  protected _shaderPlaneSDF:UIShaderPlaneSDF;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _renderables:IRenderable[] = [];

  protected _label:TextRenderable;
  protected _labelOneLine:TextRenderable;
  protected _labelInvested:TextRenderable;
  protected _labelTokens:TextRenderable;

  protected _frame:Renderable;
  protected _rhombus:Renderable;
  protected _square:Renderable;
  protected _iconTokens:Renderable;

  protected _btnPlus:UIButton;
  protected _btnMinus:UIButton;
  protected _btnInvest:UIButton;
  protected _btnReveal:UIButton;

  protected _line1:Renderable;
  protected _line2:Renderable;
  protected _line3:Renderable;
  protected _line4:Renderable;

  protected _bar:UIBarVs;

  protected _currentStakes:any;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:240, pxHeight:60 },
    rhombus:{ x:0, y:-1, pivX:0, pivY:0, pxOffX:0, pxOffY:4, pxWidth:15, pxHeight:15 },
    square:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:20, pxOffY:-16, pxWidth:11, pxHeight:11 },

    label:{ x:-1, y:1, pxOffX:40, pxOffY:-22, pxHeight:14 },
    label_one_line:{ x:0, y:0, pxOffX:0, pxOffY:0, pxHeight:10 },
    label_invested:{ x:-1, y:1, pxOffX:20, pxOffY:-90, pxHeight:10 },
    label_tokens:{ x:-1, y:1, pxOffX:107, pxOffY:-128, pxHeight:10 },

    icon_tokens:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:13, pxOffY:-105, pxWidth:47, pxHeight:47 },

    btn_plus:{ x:0, y:1, pivX:0, pivY:0.5, pxOffX:-20, pxOffY:-113, pxWidth:30, pxHeight:30 },
    btn_minus:{ x:-1, y:1, pivX:0, pivY:0.5, pxOffX:70, pxOffY:-113, pxWidth:30, pxHeight:30 },
    btn_invest:{ x:1, y:1, pivX:0.5, pivY:0.5, pxOffX:-30, pxOffY:-113, pxWidth:110, pxHeight:30 },
    btn_reveal:{ x:0, y:1, pivX:0, pivY:0.5, pxOffX:0, pxOffY:-113, pxWidth:110, pxHeight:30 },

    line_1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:20, pxOffY:-100, pxWidth:290, pxHeight:2 },
    line_2:{ x:0, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:-120, pxWidth:2, pxHeight:15 },
    line_3:{ x:1, y:1, pivX:0.5, pivY:0.5, pxOffX:-24, pxOffY:-140, pxWidth:120, pxHeight:1 },
    line_4:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:20, pxOffY:-43, pxWidth:290, pxHeight:1 },

    bar:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:20, pxOffY:-50, pxWidth:290, pxHeight:50 }
  };

  constructor(renderer:Renderer, loader:AssetsLoader, layer:LayerGameUI) {
    this._renderer = renderer;
    this._assetsLoader = loader;
    this._layer = layer;

    this._shaderPlane = new UIShaderPlane(this._renderer);
    this._shaderPlaneSDF = new UIShaderPlaneSDF(this._renderer);

    this._vSize.x = 1;
    this._vSize.y = 1;

    this.build();
  }

  protected build():void
  {
    const mesh: Mesh = new MeshQuad(this._renderer);

    this._frame = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._frame.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff171717);
    (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frame);

    this._rhombus = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._rhombus.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._rhombus.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._rhombus.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffffffff);
    (this._rhombus.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    (this._rhombus.getMaterial() as UIMaterialPlane).rotation = Quaternion.fromEuler(new Vector3(0, 0, Math.PI * 0.25));

    this._square = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._square.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._square.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff171717);
    (this._square.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff171717);
    (this._square.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);

    this._label = new TextRenderable(this._renderer, ["$STATUS > UNDER ATTACK"], [0xff171717], TextPivot.LEFT, TextPivot.CENTER, 0.7);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._labelOneLine = new TextRenderable(this._renderer, ["$LOCKED"], [0xff171717], TextPivot.CENTER, TextPivot.CENTER, 0.7);
    this._labelOneLine.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelOneLine.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._labelInvested = new TextRenderable(this._renderer, ["$INVESTED: 0 TOKENS"], [0xff171717], TextPivot.LEFT, TextPivot.CENTER, 0.7);
    this._labelInvested.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelInvested.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._labelTokens = new TextRenderable(this._renderer, ["$0"], [0xff171717], TextPivot.CENTER, TextPivot.CENTER, 0.7);
    this._labelTokens.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTokens.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._line1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffe5e5e5);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffe5e5e5);
    (this._line1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);

    this._line2 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line2.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffe5e5e5);
    (this._line2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffe5e5e5);
    (this._line2.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);

    this._line3 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line3.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line3.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff171717);
    (this._line3.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff171717);
    (this._line3.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);

    this._line4 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line4.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line4.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff171717);
    (this._line4.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff171717);
    (this._line4.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);

    this._btnPlus = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.NODE_ADD_TOKENS, ["$+"], [0xff171717], 10, false);
    (this._btnPlus.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._btnPlus.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffffffff);
    (this._btnPlus.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnPlus.getLabel().getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._btnMinus = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.NODE_REMOVE_TOKENS, ["$-"], [0xff171717], 10, false);
    (this._btnMinus.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._btnMinus.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffffffff);
    (this._btnMinus.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnMinus.getLabel().getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._btnInvest = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.NODE_INVEST, ["$INVEST TOKENS"], [0xff171717], 10, false);
    (this._btnInvest.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._btnInvest.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffffffff);
    (this._btnInvest.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnInvest.getLabel().getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._btnReveal = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.NODE_REVEAL, ["$REVEAL"], [0xff171717], 10, false);
    (this._btnReveal.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._btnReveal.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff171717);
    (this._btnReveal.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnReveal.getLabel().getMaterial().backColor = Utils.hexToRGBA(0xffffffff);

    this._iconTokens = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF));
    this._iconTokens.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_tokens") as Texture2DLoader);
    (this._iconTokens.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff333333);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);

    this._bar = new UIBarVs(this._renderer, this._assetsLoader, ["$ATTACK STRENGTH 50% (TIME LEFT: 0HR)", "$ "], 0xff171717, 0xff878787, 0xffffffff);


    // actions
    this._layer.addAction(UIActionIndex.NODE_INVEST, ()=>this.onInvest());
    this._layer.addAction(UIActionIndex.NODE_ADD_TOKENS, ()=>this.onAddTokens());
    this._layer.addAction(UIActionIndex.NODE_REMOVE_TOKENS, ()=>this.onRemoveTokens());
    this._layer.addAction(UIActionIndex.NODE_REVEAL, ()=>this.onReveal());


    this._currentStakes = new BigNumber('0');

    this.resize(this._vSize, this._scale);
  }

  public open():void
  {
    this._currentStakes = new BigNumber('0');

    this.transformElements();
    this.refresh();
  }

  public close():void
  {

  }

  public loseFocus():void
  {

  }

  public regainFocus():void
  {

  }

  public resize(vSize:Vector2, scale:Vector2):void
  {
    this._vSize = vSize.clone();
    this._vAspect = this._vSize.x / this._vSize.y;

    this._scale = scale;
    this._scale.x /= UIGlobals.PIXEL_SIZE;
    this._scale.y /= UIGlobals.PIXEL_SIZE;

    this.transformElements();
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

  public transformElements():void
  {
    const frameData:any = this._uiData["frame"];
    frameData.pxWidth = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    frameData.pxHeight = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    if (this.ATTRIBUTES["pivY"] > 0) {
      this._uiData["rhombus"]["y"] = 1;
      this._uiData["rhombus"]["pxOffY"] = -4;
    }

    this.transformElement2D("frame", this._frame);
    this.transformElement2D("rhombus", this._rhombus);
    this.transformElement2D("square", this._square);

    this.transformElement2D("line_1", this._line1);
    this.transformElement2D("line_2", this._line2);
    this.transformElement2D("line_3", this._line3);
    this.transformElement2D("line_4", this._line4);

    this.transformElement2D("icon_tokens", this._iconTokens);

    this.transformTextElement2D("label", this._label);
    this.transformTextElement2D("label_one_line", this._labelOneLine);
    this.transformTextElement2D("label_invested", this._labelInvested);
    this.transformTextElement2D("label_tokens", this._labelTokens);

    this.transformWidget("bar", this._bar);
    this.transformWidget("btn_plus", this._btnPlus);
    this.transformWidget("btn_minus", this._btnMinus);
    this.transformWidget("btn_invest", this._btnInvest);
    this.transformWidget("btn_reveal", this._btnReveal);
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
    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(camera);
    }
  }

  destruct()
  {

  }

  public refresh():void
  {
    const dAppInstance:DAppInterface = DAppInterface.instance;
    const nodeName:string = dAppInstance.nodeNames[this.nodeIndex];
    const playerData:any = dAppInstance.playerData;
    const playerCorpId:any = playerData["corpId"];
    const worldState:any = dAppInstance.worldState;
    const owningCorpId:any = worldState["nodeOwners"][this.nodeIndex];
    const isPlayerCorpOwner:boolean = owningCorpId.eq(playerCorpId);

    if (!playerData.initialized) {
      this._label.setText(["$" + nodeName.toUpperCase() + " > " + (isPlayerCorpOwner? "OWNED" : "ENEMY'S")]);
      this._labelOneLine.setText(["$", "$", "$UNAVAILABLE TO GUESTS"]);

      this.setState(UIPopUpNodeState.LOCKED);

      return;
    }

    if (dAppInstance.IS_BETTING_LOCKED) {
      const desc:string = worldState["isPaused"]? "$(THE CONTRACT IS PAUSED)" : "$(PRERELEASE PHASE)";

      this._label.setText(["$" + nodeName.toUpperCase() + " > " + (isPlayerCorpOwner? "OWNED" : "ENEMY'S")]);
      this._labelOneLine.setText(["$", "$", "$LOCKED", desc]);

      this.setState(UIPopUpNodeState.LOCKED);

      return;
    }

    if (this.nodeIndex < 2) {
      this._label.setText(["$" + nodeName.toUpperCase() + " > " + (isPlayerCorpOwner? "OWNED" : "ENEMY'S")]);
      this._labelOneLine.setText(["$", "$", "$LOCKED", "$(CORP HEADQUARTERS)"]);

      this.setState(UIPopUpNodeState.LOCKED);

      return;
    }

    const playerRaidIds:any = playerData["raidIds"];
    const playerRaidStakes:any = playerData["raidStakes"];
    const raidsData:any = dAppInstance.raidsData;
    const raidId:any = worldState["pendingRaidIds"][this.nodeIndex];

    let tokensToInvest:any = this._currentStakes.toFixed(2);
    tokensToInvest = this._currentStakes.gte('1000')? this._currentStakes.div('1000').toFixed(2) + 'K' : tokensToInvest;
    tokensToInvest = this._currentStakes.gte('1000000')? this._currentStakes.div('1000000').toFixed(2) + 'M' : tokensToInvest;
    this._labelTokens.setText(["$" + tokensToInvest]);

    if (raidId.gt(0)) {
      this._label.setText(["$" + nodeName.toUpperCase() + " > ACQUISITION"]);

      const raid:any = raidsData[raidId.toFixed()];
      const hasBeenRevealed:boolean = raid["hasBeenRevealed"];
      const hasEnded:boolean = raid["hasEnded"];

      if (hasEnded && !hasBeenRevealed) {
        this._label.setText(["$" + nodeName.toUpperCase() + " > PENDING REVEAL"]);
        this._labelOneLine.setText(["$REVEAL THIS NODE"]);

        this.setState(UIPopUpNodeState.PENDING);

      } else {
        const defenderStakes:any = raid["defenderStakes"];
        const attackerStakes:any = raid["attackerStakes"];
        const totalStakes:any = defenderStakes.plus(attackerStakes);
        const attackingCorpId:any = raid["attackingCorpId"];
        const corpStakes:any = attackingCorpId.eq(playerCorpId)? attackerStakes : defenderStakes;
        const corpWeight:number = (corpStakes.div(totalStakes)).toNumber();
        const hoursLeft:string = UIUtils.clampText(raid["timeLeft"].div("60").div("60").toFixed(), 0);
        const minutesLeft:string = UIUtils.clampText(raid["timeLeft"].div("60").mod("60").toFixed(), 0);
        const barLabel:string = "$CORP STRENGTH " + Math.floor(corpWeight * 100) + "% (TIME LEFT: " + hoursLeft + "H " + minutesLeft + "M)";
        let playerInvestment:any = new BigNumber('0');

        this._bar.setLabels([barLabel, "$ "]);
        this._bar.weight = corpWeight;

        for (let i:number = 0; i < playerRaidIds.length; i++) {
          if (playerRaidIds[i].eq(raidId)) {
            playerInvestment = playerRaidStakes[i];
            break;
          }
        }

        let investedText:string = UIUtils.clampText(playerInvestment.toFixed());
        this._labelInvested.setText(["$INVESTED: " + investedText + " TOKENS"]);

        this.setState(UIPopUpNodeState.BETTING);
      }

    } else {
      this._label.setText(["$" + nodeName.toUpperCase() + " > " + (isPlayerCorpOwner? "OWNED" : "ACQUISITION")]);

      if (isPlayerCorpOwner) {
        this._labelOneLine.setText(["$THIS NODE IS SAFE"]);

        this.setState(UIPopUpNodeState.SAFE_OWNED);

      } else {
        this._labelOneLine.setText(["$BE THE FIRST TO INVEST"]);

        this.setState(UIPopUpNodeState.SAFE_ENEMYS);
      }
    }
  }

  protected setState(newState:UIPopUpNodeState):void
  {
    this._renderables = [];

    this._currentState = newState;

    this._renderables.push(this._frame);
    this._renderables.push(this._rhombus);
    this._renderables.push(this._square);
    this._renderables.push(this._label);

    switch (this._currentState) {
      case UIPopUpNodeState.LOCKED:
        this._renderables.push(this._labelOneLine);

        this._renderables.push(this._line4);
        break;

      case UIPopUpNodeState.SAFE_OWNED:
        this._renderables.push(this._labelOneLine);
        break;

      case UIPopUpNodeState.SAFE_ENEMYS:
        this._renderables.push(this._labelOneLine);

        this._renderables.push(this._btnPlus);
        this._renderables.push(this._btnMinus);
        this._renderables.push(this._btnInvest);
        this._renderables.push(this._iconTokens);
        this._renderables.push(this._labelTokens);

        this._renderables.push(this._line1);
        this._renderables.push(this._line2);
        this._renderables.push(this._line3);
        break;

      case UIPopUpNodeState.BETTING:
        this._renderables.push(this._labelInvested);

        this._renderables.push(this._btnPlus);
        this._renderables.push(this._btnMinus);
        this._renderables.push(this._btnInvest);
        this._renderables.push(this._iconTokens);
        this._renderables.push(this._labelTokens);
        this._renderables.push(this._bar);

        this._renderables.push(this._line1);
        this._renderables.push(this._line2);
        this._renderables.push(this._line3);
        break;

      case UIPopUpNodeState.PENDING:
        this._renderables.push(this._labelOneLine);
        this._renderables.push(this._btnReveal);

        this._renderables.push(this._line4);
        break;

      default:
        break;
    }

    this.transformElements();
  }

  // Actions

  private onInvest():void
  {
    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    // console.log("onInvest", this._currentStakes.toFixed());

    if (playerData.initialized) {
      this._btnInvest.disable();

      const playerCorpId:any = playerData["corpId"];
      const worldState:any = dAppInstance.worldState;
      const owningCorpId:any = worldState["nodeOwners"][this.nodeIndex];
      const isPlayerCorpOwner:boolean = owningCorpId.eq(playerCorpId);

      const ether:any = new BigNumber('1e18');
      const investment:any = (this._currentStakes.times(ether)).toFixed(0);

      if (isPlayerCorpOwner) {
        dAppInstance.defendWorldNode(
          this.nodeIndex,
          investment,
          (hash:string) => {
            this._btnInvest.enable();
          },
          (receipt:any) => {},
          (error:any) => {
            this._btnInvest.enable();
          }
        );

      } else {
        dAppInstance.raidWorldNode(
          this.nodeIndex,
          investment,
          (hash:string) => {
            this._btnInvest.enable();
          },
          (receipt:any) => {},
          (error:any) => {
            this._btnInvest.enable();
          }
        );
      }
    }
  }

  private onAddTokens():void
  {
    // console.log("onAddTokens");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    if (playerData.initialized) {
      const percent:any = new BigNumber('0.1');
      this._currentStakes = this._currentStakes.plus(playerData["tokenBalance"].times(percent));
      this._currentStakes = BigNumber.min(this._currentStakes, playerData["tokenBalance"]);

      this._layer.refresh(false);
    }
  }

  private onRemoveTokens():void
  {
    // console.log("onRemoveTokens");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    if (playerData.initialized) {
      const percent:any = new BigNumber('0.1');
      this._currentStakes = this._currentStakes.minus(playerData["tokenBalance"].times(percent));
      this._currentStakes = BigNumber.max(this._currentStakes, new BigNumber('0'));

      this._layer.refresh(false);
    }
  }

  private onReveal():void
  {
    // console.log("onReveal");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    if (playerData.initialized) {
      this._btnReveal.disable();

      dAppInstance.revealPendingRaid(
        this.nodeIndex,
        (hash:string) => this._btnReveal.enable(),
        (receipt:any) => {},
        (error:any) => this._btnReveal.enable()
      );
    }
  }

}
export default UIPopUpNode;
