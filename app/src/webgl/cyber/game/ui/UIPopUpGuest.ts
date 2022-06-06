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
import Vector2 from "../../../core/Vector2";
import IUIScreen from "./IUIScreen";
import UIShaderPlaneSDF from "./materials/shaders/UIShaderPlaneSDF";
import IRenderable from "../../../core/IRenderable";
import UIGlobals from "./UIGlobals";
import UIButton from "./UIButton";
import {default as LayerGameUI, UIActionIndex} from "../LayerGameUI";
import IUIWidget from "./IUIWidget";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIPopUpGuest implements IUIScreen{

  public ATTRIBUTES:any = {
    x:0,
    y:0,
    pivX:0,
    pivY:0,
    pxOffX:0,
    pxOffY:0,
    pxWidth:330,
    pxHeight:215
  };

  public nodeIndex:number = -1;

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

  protected _renderables:IRenderable[] = [];

  protected _label:TextRenderable;
  protected _labelOneLine:TextRenderable;

  protected _frame:Renderable;
  protected _square:Renderable;

  protected _line1:Renderable;

  protected _btnOK:UIButton;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:240, pxHeight:60 },
    square:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:20, pxOffY:-16, pxWidth:11, pxHeight:11 },

    label:{ x:-1, y:1, pxOffX:40, pxOffY:-22, pxHeight:14 },
    label_one_line:{ x:-1, y:1, pxOffX:20, pxOffY:-60, pxHeight:10 },

    line_1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:20, pxOffY:-40, pxWidth:290, pxHeight:1 },

    btn_ok:{ x:0, y:-1, pivX:0, pivY:0.5, pxOffX:0, pxOffY:50, pxWidth:110, pxHeight:30 },
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
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frame);

    this._square = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._square.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._square.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._square);

    const titleText:string[] = [
      "$GUEST ACCOUNT"
    ]
    this._label = new TextRenderable(this._renderer, titleText, [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.CENTER, 0.7);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._label);

    const mainText:string[] = [
      "$YOU ARE CURRENTLY VIEWING THE GAME AS A",
      "$GUEST AND WILL NOT BE ABLE TO PLAY.",
      "$",
      "$AFTER BUYING GAME TOKENS YOU WILL JOIN ONE",
      "$OF THE TWO COMPETING CORPORATIONS AND WILL",
      "$BE ABLE TO INVEST AND EARN DIVIDENDS."
    ];
    this._labelOneLine = new TextRenderable(this._renderer, mainText, [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.7, 1.5);
    this._labelOneLine.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelOneLine.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelOneLine);

    this._line1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line1);

    this._btnOK = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.GUEST_CLOSE, ["$CLOSE"], [UIGlobals.CURRENT_COLOR2], 10, false);
    (this._btnOK.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._btnOK.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._btnOK.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnOK.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._btnOK);


    // actions
    this._layer.addAction(UIActionIndex.GUEST_CLOSE, ()=>this.onClose());

    this.resize(this._vSize, this._scale);
  }

  public open():void
  {
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

    this.transformElement2D("frame", this._frame);
    this.transformElement2D("square", this._square);

    this.transformElement2D("line_1", this._line1);

    this.transformTextElement2D("label", this._label);
    this.transformTextElement2D("label_one_line", this._labelOneLine);

    this.transformWidget("btn_ok", this._btnOK);
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
    this.transformElements();
  }

  private onClose():void
  {
    // console.log("onClose");

    this._layer.popScreen(this);
  }
}
export default UIPopUpGuest;
