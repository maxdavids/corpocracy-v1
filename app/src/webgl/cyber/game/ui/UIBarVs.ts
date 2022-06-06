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
import UIGlobals from "./UIGlobals";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIBarVs implements IUIWidget{

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

  protected _renderables:Renderable[] = [];

  protected _labels:string[];

  protected _labelLeft:TextRenderable;
  protected _labelRight:TextRenderable;

  protected _barLeft:Renderable;
  protected _barRight:Renderable;

  protected _colorBackground:number = 0x0;
  protected _colorLeft:number = 0x0;
  protected _colorRight:number = 0x0;

  public _uiData:any = {
    labelLeft:{ x:-1, y:1, pxOffX:0, pxOffY:0, pxHeight:10 },
    labelRight:{ x:1, y:1, pxOffX:0, pxOffY:0, pxHeight:10 },

    barLeft:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:-20, pxWidth:120, pxHeight:5 },
    barRight:{ x:1, y:1, pivX:0.5, pivY:0.5, pxOffX:0, pxOffY:-20, pxWidth:240, pxHeight:5 }
  };

  constructor(renderer:Renderer, loader:AssetsLoader, labels:string[], colorLeft:number, colorRight:number, colorBackground:number) {
    this._renderer = renderer;
    this._assetsLoader = loader;

    this._shaderPlane = new UIShaderPlane(this._renderer);

    this._labels = labels;

    this._vSize.x = 1;
    this._vSize.y = 1;

    this._colorBackground = colorBackground;
    this._colorLeft = colorLeft;
    this._colorRight = colorRight;

    this.build();
  }

  protected build():void
  {
    var mesh: Mesh = new MeshQuad(this._renderer);

    this._barRight = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._barRight.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._barRight.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(this._colorRight);
    (this._barRight.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._colorRight);
    (this._barRight.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._barRight);

    this._barLeft = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._barLeft.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._barLeft.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(this._colorLeft);
    (this._barLeft.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._colorLeft);
    (this._barLeft.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._barLeft);

    this._labelLeft = new TextRenderable(this._renderer, [this._labels[0]], [this._colorLeft], TextPivot.LEFT, TextPivot.CENTER, 0.7);
    this._labelLeft.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelLeft.getMaterial().backColor = Utils.hexToRGBA(this._colorBackground);
    this._renderables.push(this._labelLeft);

    this._labelRight = new TextRenderable(this._renderer, [this._labels[1]], [this._colorRight], TextPivot.RIGHT, TextPivot.CENTER, 0.7);
    this._labelRight.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelRight.getMaterial().backColor = Utils.hexToRGBA(this._colorBackground);
    this._renderables.push(this._labelRight);

    this.resize(this._vSize, this._scale);
  }

  public setColors(left:number, right:number, background:number):void
  {
    this._colorBackground = background;
    this._colorLeft = left;
    this._colorRight = right;

    (this._barRight.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(this._colorRight);
    (this._barRight.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._colorRight);

    (this._barLeft.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(this._colorLeft);
    (this._barLeft.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(this._colorLeft);

    this._labelLeft.setColors([this._colorLeft]);
    this._labelLeft.getMaterial().backColor = Utils.hexToRGBA(this._colorBackground);

    this._labelRight.setColors([this._colorRight]);
    this._labelRight.getMaterial().backColor = Utils.hexToRGBA(this._colorBackground);
  }

  public setLabels(labels:string[]):void
  {
    this._labels = labels;
    this._labelLeft.setText([this._labels[0]]);
    this._labelRight.setText([this._labels[1]]);

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

    var tmpOffset:Vector2 = new Vector2();
    tmpOffset.x = this._scale.x * (this._pivot.x + 0.5) * 2;
    tmpOffset.y = this._scale.y * (this._pivot.y + 0.5) * 2;

    this._pos.subtract(tmpOffset);
  }

  public refresh():void
  {
    var pxWidth:number = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    var pxHeight:number = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    this._uiData["barRight"].pxWidth = pxWidth;
    this._uiData["barLeft"].pxWidth = pxWidth * this.weight;

    this.transformElement2D("barLeft", this._barLeft);
    this.transformElement2D("barRight", this._barRight);
    this.transformTextElement2D("labelLeft", this._labelLeft);
    this.transformTextElement2D("labelRight", this._labelRight);
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
export default UIBarVs;
