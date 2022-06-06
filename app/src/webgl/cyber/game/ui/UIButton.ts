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
import {UIActionIndex} from "../LayerGameUI";
import Utils from "../../../Utils";
import Vector4 from "../../../core/Vector4";
import IUIWidget from "./IUIWidget";
import Vector2 from "../../../core/Vector2";
import UIShaderPlaneSDF from "./materials/shaders/UIShaderPlaneSDF";
import UIGlobals from "./UIGlobals";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIButton implements IUIWidget{

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _posOriginal:Vector2 = new Vector2();

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _shaderPlane:UIShaderPlane;
  protected _shaderPlaneSDF:UIShaderPlaneSDF;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _isHidden:boolean = false;
  protected _isEnabled:boolean = true;
  protected _autoWidth:boolean = false;

  protected _renderables:Renderable[] = [];

  protected _actionId:UIActionIndex;
  protected _text:string[];
  protected _textColors:number[];
  protected _iconPath:string;

  protected _label:TextRenderable;
  protected _frame:Renderable;
  protected _icon:Renderable;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:240, pxHeight:60 },
    label:{ x:0, y:0, pxOffX:0, pxOffY:0, pxHeight:10 },
    icon:{ x:-1, y:0, pivX:-0.5, pivY:0, pxOffX:24, pxOffY:1, pxWidth:30, pxHeight:30 }
  };

  constructor(renderer:Renderer, loader:AssetsLoader, actionId:UIActionIndex, text:string[], textColors:number[], textSize:number = 10, autoWidth:boolean = false, icon:string = null) {
    this._renderer = renderer;
    this._assetsLoader = loader;

    this._shaderPlane = new UIShaderPlane(this._renderer);
    this._shaderPlaneSDF = new UIShaderPlaneSDF(this._renderer);

    this._actionId = actionId;
    this._text = text;
    this._textColors = textColors;
    this._iconPath = icon;

    this._vSize.x = 1;
    this._vSize.y = 1;

    this._autoWidth = autoWidth;

    this._uiData["label"]["pxHeight"] = textSize;

    this.build();
  }

  protected build():void
  {
    const mesh: Mesh = new MeshQuad(this._renderer);

    this._frame = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane, this._actionId));
    this._frame.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frame);

    this._label = new TextRenderable(this._renderer, this._text, this._textColors, TextPivot.CENTER, TextPivot.CENTER, 0.95, 0.98, this._actionId);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._label);

    if (this._iconPath) {
      this._icon = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF, this._actionId));
      this._icon.getMaterial().setTexture(this._assetsLoader.getAsset(this._iconPath) as Texture2DLoader);
      (this._icon.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
      (this._icon.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._textColors[0]);
      (this._icon.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);
      this._renderables.push(this._icon);
    }

    this.resize(this._vSize, this._scale);
  }

  public setTextColors(value:number[]):void
  {
    this._textColors = value;

    this._label.setColors(this._textColors);

    if (this._icon) {
      (this._icon.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._textColors[0]);
    }
  }

  public resetColors():void
  {
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    if (this._iconPath) {
      (this._icon.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
      (this._icon.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._textColors[0]);
    }
  }

  public setBorderless(value:boolean):void
  {
    if (value) {
      (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);

    } else {
      (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    }
  }

  public getLabel():TextRenderable
  {
    return this._label;
  }

  public getFrame():Renderable
  {
    return this._frame;
  }

  public getSize():Vector2
  {
    return this._scale;
  }

  public getPos():Vector2
  {
    return this._pos;
  }

  public getIsEnabled():boolean
  {
    return this._isEnabled;
  }

  public enable():void
  {
    this._isEnabled = true;
  }

  public disable():void
  {
    this._isEnabled = false;
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
    this._posOriginal = pos;
    this._pos = pos.clone();

    var tmpOffset:Vector2 = new Vector2();
    tmpOffset.x = this._scale.x * (this._pivot.x + 0.5) * 2;
    tmpOffset.y = this._scale.y * (this._pivot.y + 0.5) * 2;

    this._pos.subtract(tmpOffset);
  }

  public refresh():void
  {
    if (this._autoWidth) {
      var pixelSizeY:number = 1 / this._vSize.y * 2;
      var scaleY:number = this._uiData["label"].pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE;
      var scaleX:number = scaleY / this._vAspect;

      this._scale.x = this._label.getRawSize().x * scaleX + (40 / this._vSize.x) * 2 * UIGlobals.PIXEL_SIZE;
      this.translate(this._posOriginal, this._pivot);
    }

    var frameData:any = this._uiData["frame"];
    frameData.pxWidth = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    frameData.pxHeight = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    this.transformElement2D("frame", this._frame);
    this.transformTextElement2D("label", this._label);

    if (this._icon) {
      this.transformElement2D("icon", this._icon);
    }
  }

  private transformElement2D(dataId:string, element:Renderable):void
  {
    var pixelSizeX:number = 1 / this._vSize.x * 2;
    var pixelSizeY:number = 1 / this._vSize.y * 2;

    var data:any = this._uiData[dataId];

    var scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * UIGlobals.PIXEL_SIZE : data.width;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;

    (element.getMaterial() as UIMaterialPlane).pos.x = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    (element.getMaterial() as UIMaterialPlane).pos.y = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;
    (element.getMaterial() as UIMaterialPlane).scale.x = scaleX;
    (element.getMaterial() as UIMaterialPlane).scale.y = scaleY;
    (element.getMaterial() as UIMaterialPlane).pivot.x = data.pivX;
    (element.getMaterial() as UIMaterialPlane).pivot.y = data.pivY;
  }

  private transformTextElement2D(dataId:string, element:TextRenderable):void
  {
    var pixelSizeX:number = 1 / this._vSize.x * 2;
    var pixelSizeY:number = 1 / this._vSize.y * 2;

    var data:any = this._uiData[dataId];

    var posX:number = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    var posY:number = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;
    var scaleX:number = scaleY / this._vAspect;

    element.setPosition(posX, posY);
    element.setScale(scaleX, scaleY);
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
    if (!this._isHidden) {
      for (let i:number = 0; i < this._renderables.length; i++) {
        this._renderables[i].draw(camera);
      }
    }
  }

  destruct()
  {

  }

}
export default UIButton;
