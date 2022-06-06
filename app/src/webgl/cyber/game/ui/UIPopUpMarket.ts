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
import IUIScreen from "./IUIScreen";
import DAppInterface from "../../../../DAppInterface";
import Quaternion from "../../../core/Quaternion";
import Vector3 from "../../../core/Vector3";
import UIButton from "./UIButton";
import {default as LayerGameUI, UIActionIndex} from "../LayerGameUI";
import UIShaderPlaneSDF from "./materials/shaders/UIShaderPlaneSDF";
import UIGlobals from "./UIGlobals";
import UIInputField from "./UIInputField";

const BigNumber = require("bignumber.js");

/**
 * Created by mdavids on 20/8/2018.
 */
export class UIPopUpMarket implements IUIScreen {

  public ATTRIBUTES:any = {
    x:1,
    y:1,
    pivX:0.5,
    pivY:0.5,
    pxOffX:-209,
    pxOffY:-140,
    pxWidth:540,
    pxHeight:615
  };

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _layer:LayerGameUI;

  protected _shaderPlane:UIShaderPlane;
  protected _shaderPlaneSDF:UIShaderPlaneSDF;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _renderables:Renderable[] = [];
  protected _widgets:IUIWidget[] = [];

  protected _label:TextRenderable;
  protected _labelIndex:TextRenderable;
  protected _labelPlus:TextRenderable;
  protected _labelArrow:TextRenderable;
  protected _labelTokens:TextRenderable;
  protected _labelBuy:TextRenderable;
  protected _labelSell:TextRenderable;

  protected _labelBuy1:TextRenderable;
  protected _labelBuy1Result:TextRenderable;

  protected _inputBuy:UIInputField;

  protected _labelSellResult:TextRenderable;

  protected _frame:Renderable;
  protected _frameDot:Renderable;
  protected _square1:Renderable;
  protected _square2:Renderable;
  protected _iconTokens:Renderable;

  protected _line1:Renderable;
  protected _line4:Renderable;
  protected _line8:Renderable;
  protected _line9:Renderable;

  protected _btnBuy1:UIButton;

  protected _btnSell:UIButton;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:240, pxHeight:60 },
    frame_dot:{ x:1, y:1, pivX:0.5, pivY:0.5, pxOffX:-83, pxOffY:11, pxWidth:3, pxHeight:3 },
    square1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-206, pxWidth:11, pxHeight:11 },
    square2:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-439, pxWidth:11, pxHeight:11 },

    label:{ x:-1, y:1, pxOffX:70, pxOffY:-40, pxHeight:20 },
    label_index:{ x:-1, y:1, pxOffX:40, pxOffY:-60, pxHeight:11 },
    label_plus:{ x:1, y:1, pxOffX:-40, pxOffY:-38, pxHeight:16 },
    label_arrow:{ x:1, y:-1, pxOffX:-45, pxOffY:40, pxHeight:11 },

    label_tokens:{ x:-1, y:1, pxOffX:90, pxOffY:-135, pxHeight:11 },
    label_buy:{ x:-1, y:1, pxOffX:65, pxOffY:-205, pxHeight:14 },
    label_sell:{ x:-1, y:1, pxOffX:65, pxOffY:-440, pxHeight:14 },

    label_buy1:{ x:-1, y:1, pxOffX:40, pxOffY:-250, pxHeight:11 },
    label_buy1_result:{ x:-1, y:1, pxOffX:300, pxOffY:-330, pxHeight:11 },
    input_buy: { x:-1, y:1, pivX:-0.5, pivY:0, pxOffX:50, pxOffY:-278, pxWidth:225, pxHeight:20 },

    label_sell_result:{ x:-1, y:1, pxOffX:300, pxOffY:-485, pxHeight:11 },

    icon_tokens:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:25, pxOffY:-104, pxWidth:60, pxHeight:60 },

    line_1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-90, pxWidth:460, pxHeight:1 },
    line_4:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-175, pxWidth:460, pxHeight:1 },
    line_8:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-410, pxWidth:460, pxHeight:1 },
    line_9:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-575, pxWidth:460, pxHeight:1 },

    btn_buy1:{ x:-1, y:1, pivX:-0.5, pivY:-0.5, pxOffX:40, pxOffY:-380, pxWidth:200, pxHeight:50 },
    btn_sell:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-485, pxWidth:200, pxHeight:50 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader, layer:LayerGameUI, width:number = 1, height:number = 1) {
    this._renderer = renderer;
    this._assetsLoader = loader;
    this._layer = layer;

    this._shaderPlane = new UIShaderPlane(this._renderer);
    this._shaderPlaneSDF = new UIShaderPlaneSDF(this._renderer);

    this._vSize.x = width;
    this._vSize.y = height;

    this.build();
  }

  protected build():void
  {
    const mesh: Mesh = new MeshQuad(this._renderer);

    this._frame = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frame);

    this._frameDot = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._frameDot.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frameDot);

    this._square1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._square1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._square1);

    this._square2 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._square2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square2.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._square2);

    this._line1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line1);

    this._line4 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line4.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line4.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line4.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line4);

    this._line8 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line8.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._line8.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line8.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line8);

    this._line9 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line9.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line9.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line9.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line9);

    this._iconTokens = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF));
    this._iconTokens.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_tokens") as Texture2DLoader);
    (this._iconTokens.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);
    this._renderables.push(this._iconTokens);

    this._label = new TextRenderable(this._renderer, ["$_MARKET"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._label);

    this._labelIndex = new TextRenderable(this._renderer, ["$03"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.85);
    this._labelIndex.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelIndex.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._labelIndex.getMaterial().rotation = Quaternion.fromEuler(new Vector3(0, 0, Math.PI * 0.5));
    this._renderables.push(this._labelIndex);

    this._labelPlus = new TextRenderable(this._renderer, ["$+"], [UIGlobals.CURRENT_COLOR2], TextPivot.RIGHT, TextPivot.TOP);
    this._labelPlus.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelPlus.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelPlus);

    this._labelArrow = new TextRenderable(this._renderer, ["$ {"], [UIGlobals.CURRENT_COLOR3], TextPivot.RIGHT, TextPivot.CENTER);
    this._labelArrow.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelArrow.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelArrow);

    this._labelTokens = new TextRenderable(this._renderer, ["$TOKENS > $0"], [UIGlobals.CURRENT_COLOR2, 0xfff0f0f0], TextPivot.LEFT, TextPivot.CENTER);
    this._labelTokens.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTokens.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelTokens);

    this._labelBuy = new TextRenderable(this._renderer, ["$_BUY TOKENS"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.75);
    this._labelBuy.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelBuy.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelBuy);

    this._labelSell = new TextRenderable(this._renderer, ["$_SELL TOKENS"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.75);
    this._labelSell.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelSell.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelSell);

    this._labelBuy1 = new TextRenderable(this._renderer, ["$ETHER TO SPEND $(during prerelease: min 0.01# max 1.0#)","","","$>"], [0xfff0f0f0, 0xff696766], TextPivot.LEFT, TextPivot.TOP, 0.65);
    this._labelBuy1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelBuy1.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelBuy1);

    this._labelBuy1Result = new TextRenderable(this._renderer, ["$You will receive tokens","0","","<","<"], [0xff696766], TextPivot.LEFT, TextPivot.TOP, 0.65);
    this._labelBuy1Result.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelBuy1Result.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelBuy1Result);

    this._labelSellResult = new TextRenderable(this._renderer, ["$You will receive ether","0#","","<","<"], [0xff696766], TextPivot.LEFT, TextPivot.TOP, 0.65);
    this._labelSellResult.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelSellResult.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelSellResult);

    this._btnBuy1 = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.BUY_TOKENS_1, ["$BUY TOKENS"], [0xff615e5e], 10, false);
    (this._btnBuy1.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._btnBuy1.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    (this._btnBuy1.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnBuy1.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._widgets.push(this._btnBuy1);

    this._btnSell = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.SELL_TOKENS, ["$SELL ALL TOKENS"], [0xff615e5e], 10, false);
    (this._btnSell.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._btnSell.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    (this._btnSell.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnSell.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._widgets.push(this._btnSell);

    this._inputBuy = new UIInputField(this._renderer, this._assetsLoader, this._layer, UIActionIndex.BUY_INPUT_FIELD,["$0.00#"], [0xfff0f0f0], 11);
    (this._inputBuy.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._inputBuy.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    this._inputBuy.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._widgets.push(this._inputBuy);


    // actions
    this._layer.addAction(UIActionIndex.BUY_INPUT_FIELD, ()=>this.onBuyInputClick());
    this._layer.addAction(UIActionIndex.BUY_TOKENS_1, ()=>this.onBuyTokens());
    this._layer.addAction(UIActionIndex.SELL_TOKENS, ()=>this.onSellTokens());


    // this.refresh();
    // this.resize(this._vSize, this._scale);
  }

  public open():void
  {
    this._inputBuy.reset();
    this._inputBuy.disable();
  }

  public close():void
  {
    this._inputBuy.reset();
    this._inputBuy.disable();
  }

  public loseFocus():void
  {
    this._inputBuy.reset();
    this._inputBuy.disable();
  }

  public regainFocus():void
  {
    this._inputBuy.disable();
  }

  public resize(vSize:Vector2, scale:Vector2):void
  {
    this._vSize.x = vSize.x;
    this._vSize.y = vSize.y;
    this._vAspect = this._vSize.x / this._vSize.y;

    this._scale = scale == null? this._scale : scale;
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

    this.transformElement2D("frame", this._frame);
    this.transformElement2D("frame_dot", this._frameDot);
    this.transformElement2D("square1", this._square1);
    this.transformElement2D("square2", this._square2);
    this.transformElement2D("icon_tokens", this._iconTokens);

    this.transformElement2D("line_1", this._line1);
    this.transformElement2D("line_4", this._line4);
    this.transformElement2D("line_8", this._line8);
    this.transformElement2D("line_9", this._line9);

    this.transformTextElement2D("label", this._label);
    this.transformTextElement2D("label_index", this._labelIndex);
    this.transformTextElement2D("label_plus", this._labelPlus);
    this.transformTextElement2D("label_arrow", this._labelArrow);
    this.transformTextElement2D("label_tokens", this._labelTokens);
    this.transformTextElement2D("label_buy", this._labelBuy);
    this.transformTextElement2D("label_sell", this._labelSell);

    this.transformTextElement2D("label_buy1", this._labelBuy1);

    this.transformTextElement2D("label_buy1_result", this._labelBuy1Result);
    this.transformTextElement2D("label_sell_result", this._labelSellResult);

    this.transformWidget("btn_buy1", this._btnBuy1);
    this.transformWidget("btn_sell", this._btnSell);
    this.transformWidget("input_buy", this._inputBuy);
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
    this._inputBuy.update();
  }

  public draw(camera:Camera):void
  {
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

  public refresh():void
  {
    const dappInterface:DAppInterface = DAppInterface.instance;
    const worldState:any = dappInterface.worldState;
    const playerData:any = dappInterface.playerData;
    const tokenBalance:any = playerData["tokenBalance"];
    const etherSpent:any = playerData["totalEtherSpent"];
    // const dividends:any = playerData["dividends"];
    // const referralBalance:any = playerData["referralBalance"];

    const tokenCost:any = new BigNumber("0.000001");
    const totalFee:any = new BigNumber("0.125");
    const oneMinusTotalFee:any = new BigNumber("0.875");

    const sellPrice:any = tokenBalance.times(tokenCost);
    const taxed:any = sellPrice.times(totalFee);
    const sellPriceTotal:any = sellPrice.minus(taxed);

    // const buy1Amount:any = new BigNumber(this._inputBuy.inputValue);
    // const buyPrice1:any = (buy1Amount.times(tokenCost)).div(oneMinusTotalFee).decimalPlaces(12);

    const etherToSpend:any = new BigNumber(this._inputBuy.inputValue);
    const tokensReceived:any = (etherToSpend.times(oneMinusTotalFee)).div(tokenCost).decimalPlaces(12);

    this._labelTokens.setText(["$TOKENS > $" + tokenBalance.toFixed()]);

    if (worldState["isPrerelease"]) {
      const maxEthAvailable:any = (new BigNumber('1')).minus(etherSpent).decimalPlaces(2);
      if (maxEthAvailable.gte(new BigNumber('0.02'))) {
        this._labelBuy1.setText(["$ETHER TO SPEND $(during prerelease: min 0.01# max " + maxEthAvailable.toFixed() + "#)","","","$>"]);
        this._inputBuy.maxValue = maxEthAvailable;
        this._inputBuy.unlock();
      } else {
        this._labelBuy1.setText(["$ETHER TO SPEND $(during prerelease: min 0.01# max 1.0#)","","","$>"]);
        this._inputBuy.maxValue = UIInputField.MAX_NUMBER;
        this._inputBuy.lock();
      }
    }

    this._labelBuy1Result.setText(["$You will receive tokens", tokensReceived.toFixed(),"","<","<"]);
    this._labelBuy1Result.setColors([0xfff0f0f0]);

    if (!worldState["isPaused"] && (!worldState["isPrerelease"] || etherSpent.lt(1))) {
      this._btnBuy1.enable();
      (this._btnBuy1.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xfff0f0f0);

    } else {
      this._btnBuy1.disable();
      (this._btnBuy1.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    }

    // let etherToWithdraw:any = dividends.plus(referralBalance);
    if (tokenBalance.gt(0)) {
      this._labelSellResult.setText(["$You will receive ether", sellPriceTotal.toFixed() + "#","","<","<"]);
      this._labelSellResult.setColors([0xfff0f0f0]);

      this._btnSell.enable();
      (this._btnSell.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xfff0f0f0);

    } else {
      this._labelSellResult.setText(["$You have no tokens to sell","","","<","<"]);
      this._labelSellResult.setColors([0xff696766]);

      this._btnSell.disable();
      (this._btnSell.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    }

    this.refreshUIColors();
    this.transformElements();
  }

  protected refreshUIColors():void
  {
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._frameDot.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._square1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._square2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line4.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line4.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line8.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._line8.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line9.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line9.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);

    (this._iconTokens.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    this._label.setColors([UIGlobals.CURRENT_COLOR2]);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelIndex.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelIndex.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelPlus.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelPlus.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelArrow.setColors([UIGlobals.CURRENT_COLOR3]);
    this._labelArrow.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelTokens.setColors([UIGlobals.CURRENT_COLOR2, 0xfff0f0f0]);
    this._labelTokens.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelBuy.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelBuy.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelSell.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelSell.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelBuy1.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelSellResult.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    (this._btnBuy1.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._btnBuy1.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    (this._btnSell.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._btnSell.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
  }

  private onBuyInputClick():void
  {
    this._inputBuy.enable();
  }

  private onBuyTokens():void
  {
    // console.log("onBuyTokens");

    // const tokenCost:any = new BigNumber("0.000001");
    // const oneMinusTotalFee:any = new BigNumber("0.875");
    // const tokensAmount:any = new BigNumber(amount.toString());
    // const ether:any = (tokensAmount.times(tokenCost)).div(oneMinusTotalFee).decimalPlaces(12);

    this._inputBuy.disable();

    if (this._inputBuy.getIsLocked()) {
      return;
    }

    const ether:any = (new BigNumber(this._inputBuy.inputValue)).decimalPlaces(18);
    // console.log(ether.toFixed());

    if (ether.lte(new BigNumber('0'))) {
      return;
    }

    this._btnBuy1.disable();

    DAppInterface.instance.buyTokens(
      ether,
      (hash:string) => {
        this._btnBuy1.enable();
      },
      (receipt:any) => {},
      (error:any) => {
        this._btnBuy1.enable();
      }
    );
  }

  private onSellTokens():void
  {
    // console.log("onSellTokens");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    const ether:any = new BigNumber('1e18');
    const tokenBalance:any = playerData["tokenBalance"].times(ether);

    if (playerData.initialized) {
      this._btnSell.disable();
      dAppInstance.sellTokens(
        tokenBalance,
        (hash:string) => {
          this._btnSell.enable();
        },
        (receipt:any) => {},
        (error:any) => {
          this._btnSell.enable();
        }
      );
    }
  }
}
