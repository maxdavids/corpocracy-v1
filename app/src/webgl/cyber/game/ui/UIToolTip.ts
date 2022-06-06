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
import Quaternion from "../../../core/Quaternion";
import Vector3 from "../../../core/Vector3";
import UIGlobals from "./UIGlobals";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIToolTip implements IUIWidget {

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _posOriginal:Vector2 = new Vector2();

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _shaderPlane:UIShaderPlane;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _isHidden:boolean = false;
  protected _isEnabled:boolean = true;
  protected _autoWidth:boolean = false;

  protected _renderables:Renderable[] = [];

  protected _text:string[];
  protected _textColors:number[];

  protected _label:TextRenderable;
  protected _frame:Renderable;
  protected _rhombus:Renderable;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:-7, pxWidth:240, pxHeight:40 },
    rhombus:{ x:0, y:1, pivX:0, pivY:0, pxOffX:0, pxOffY:-11, pxWidth:15, pxHeight:15 },
    label:{ x:0, y:0, pxOffX:0, pxOffY:-7, pxHeight:10 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader, text:string[], textColors:number[], textSize:number = 10)
  {
    this._renderer = renderer;
    this._assetsLoader = loader;

    this._shaderPlane = new UIShaderPlane(this._renderer);

    this._text = text;
    this._textColors = textColors;

    this._vSize.x = 1;
    this._vSize.y = 1;

    this._autoWidth = true;

    this._uiData["label"]["pxHeight"] = textSize;

    this.build();
  }

  protected build():void
  {
    var mesh: Mesh = new MeshQuad(this._renderer);

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
    this._renderables.push(this._rhombus);

    this._label = new TextRenderable(this._renderer, this._text, this._textColors, TextPivot.CENTER, TextPivot.CENTER);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);
    this._renderables.push(this._label);

    this.resize(this._vSize, this._scale);
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

      this._scale.x = this._label.getRawSize().x * scaleX + (20 / this._vSize.x) * 2 * UIGlobals.PIXEL_SIZE;
      this.translate(this._posOriginal, this._pivot);
    }

    var frameData:any = this._uiData["frame"];
    frameData.pxWidth = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    frameData.pxHeight = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    this.transformElement2D("frame", this._frame);
    this.transformElement2D("rhombus", this._rhombus);
    this.transformTextElement2D("label", this._label);
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
    if (this._isHidden) {
      return;
    }

    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(camera);
    }
  }

  destruct()
  {

  }

}
export default UIToolTip;
