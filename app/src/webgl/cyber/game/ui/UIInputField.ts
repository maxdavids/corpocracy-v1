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
import UIGlobals from "./UIGlobals";
import LayerGameUI, {UIActionIndex} from "../LayerGameUI";
import Clock from "../../../Clock";

const BigNumber = require("bignumber.js");

/**
 * Created by mdavids on 28/9/2019.
 */
class UIInputField implements IUIWidget {

  static MAX_SIZE:number = 17;
  static MAX_COMMA:number = 6;
  static MIN_NUMBER:any = new BigNumber('0.01');
  static MAX_NUMBER:any = new BigNumber('1.0');

  public maxValue:any = UIInputField.MAX_NUMBER;

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _posOriginal:Vector2 = new Vector2();

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _layer:LayerGameUI;
  protected _shaderPlane:UIShaderPlane;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _isHidden:boolean = false;
  protected _isEnabled:boolean = false;
  protected _isLocked:boolean = false;
  protected _autoWidth:boolean = false;

  protected _renderables:Renderable[] = [];

  protected _actionId:UIActionIndex;
  protected _text:string[];
  protected _textColors:number[];

  protected _label:TextRenderable;
  protected _mark:TextRenderable;
  protected _frame:Renderable;

  protected _markAcc:number = 0;
  protected _markThreshold:number = 0.5;

  protected _currentInput:string = '';

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:-7, pxWidth:240, pxHeight:20 },
    label:{ x:-1, y:0, pxOffX:0, pxOffY:-7, pxHeight:11 },
    mark:{ x:-1, y:0, pxOffX:0, pxOffY:-7, pxHeight:11 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader, layer:LayerGameUI, actionId:UIActionIndex, text:string[], textColors:number[], textSize:number = 10)
  {
    this._renderer = renderer;
    this._assetsLoader = loader;
    this._layer = layer;

    this._shaderPlane = new UIShaderPlane(this._renderer);

    this._actionId = actionId;
    this._text = text;
    this._textColors = textColors;

    this._vSize.x = 1;
    this._vSize.y = 1;

    // this._autoWidth = true;

    this._uiData["label"]["pxHeight"] = textSize;
    this._uiData["mark"]["pxHeight"] = textSize;

    this.build();
  }

  protected build():void
  {
    var mesh: Mesh = new MeshQuad(this._renderer);

    this._frame = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane, this._actionId));
    this._frame.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff171717);
    (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 1);
    this._renderables.push(this._frame);

    this._mark = new TextRenderable(this._renderer, ['$_'], this._textColors, TextPivot.LEFT, TextPivot.CENTER, 0.95, 0.98, this._actionId);
    this._mark.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._mark.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._mark);

    this._label = new TextRenderable(this._renderer, this._text, this._textColors, TextPivot.LEFT, TextPivot.CENTER, 0.95, 0.98, this._actionId);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);
    this._renderables.push(this._label);

    this.resize(this._vSize, this._scale);

    document.addEventListener('keyup', (event) => {
      if (this._isLocked || !this._isEnabled || event.defaultPrevented) {
        return;
      }

      const numbers:string[] = ['0','1','2','3','4','5','6','7','8','9'];
      // const key = event.key || event.keyCode;
      const key:string = event.key;

      if (key === 'Backspace' && this._currentInput.length > 0) {
        this._currentInput = this._currentInput.slice(0, -1);
      }

      if (key === 'Enter') {
        this.disable();
        return;
      }

      const commaIndex:number = this._currentInput.indexOf('.');
      if (this._currentInput.length > UIInputField.MAX_SIZE
        || (commaIndex >= 0 && this._currentInput.length - commaIndex > UIInputField.MAX_COMMA)) {
        return;
      }

      if (numbers.indexOf(key) >= 0) {
        this._currentInput += key;
      }

      if (key === '.' || key === ',') {
        const firstDot:boolean = this._currentInput.indexOf('.') < 0;
        if (firstDot) {
          if (this._currentInput.length <= 0) {
            this._currentInput += '0';
          }

          this._currentInput += '.';
        }
      }

      const labelTxt:string = this._currentInput.length > 0? this._currentInput : ' ';
      this._label.setText(['$' + labelTxt]);
      this._mark.setText(['$' + labelTxt + '_']);

      this._layer._isDirty = true;
    })
  }

  public reset():void {
    this._currentInput = '';
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

  public get inputValue():string
  {
    return this._currentInput.length > 0? this._currentInput : '0';
  }

  public getIsEnabled():boolean
  {
    return this._isEnabled;
  }

  public lock():void
  {
    this._isLocked = true;
  }

  public unlock():void
  {
    this._isLocked = false;
  }

  public getIsLocked():boolean
  {
    return this._isLocked;
  }

  public enable():void
  {
    this._isEnabled = true;

    let labelTxt:string = this._currentInput.length > 0? this._currentInput : ' ';
    labelTxt = this._isLocked? 'LOCKED (PRERELEASE)' : labelTxt;

    this._label.setText(['$' + labelTxt]);
    this._mark.setText(['$' + labelTxt + '_']);

    this._layer._isDirty = true;
  }

  public disable():void
  {
    this._isEnabled = false;

    this._currentInput = this.formatInput(this._currentInput);
    let labelTxt:string = this._currentInput.length > 0? this._currentInput + '#' : '0.00#';
    labelTxt = this._isLocked? 'LOCKED (PRERELEASE)' : labelTxt;

    this._label.setText(['$' + labelTxt]);
    this._mark.setText(['$' + labelTxt + '_']);

    this._layer.refresh(false);
    // this._layer._isDirty = true;

    this._mark.hide();
    this._markAcc = 0;
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
      const pixelSizeY:number = 1 / this._vSize.y * 2;
      const scaleY:number = this._uiData["label"].pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE;
      const scaleX:number = scaleY / this._vAspect;

      this._scale.x = this._label.getRawSize().x * scaleX + (20 / this._vSize.x) * 2 * UIGlobals.PIXEL_SIZE;
      this.translate(this._posOriginal, this._pivot);
    }

    const frameData:any = this._uiData["frame"];
    frameData.pxWidth = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    frameData.pxHeight = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    this.transformElement2D("frame", this._frame);
    this.transformTextElement2D("label", this._label);
    this.transformTextElement2D("mark", this._mark);

    this._label.show();
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
    if (this._isLocked || !this._isEnabled) {
      return;
    }

    this._markAcc += Clock.deltaTime;
    if (this._markAcc >= this._markThreshold) {
      this._markAcc = 0;

      if (this._mark.isHidden()) {
        this._mark.show();
      } else {
        this._mark.hide()
      }

      this._layer._isDirty = true;
    }
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

  private formatInput(input:string):string {
    let result:string = input;
    result = result.replace(/\.0*$|(\.\d*[1-9])0+$/g, '$1');
    result = result.replace(/^(0+)/g, '');

    const toNumber:any = new BigNumber(result);
    if (toNumber.gt(this.maxValue)) {
      result = this.maxValue.toFixed();
    }

    if (toNumber.lt(UIInputField.MIN_NUMBER)) {
      result = UIInputField.MIN_NUMBER.toFixed();
    }

    const dotIndex:number = result.indexOf('.');
    if (dotIndex === 0) {
      result = '0' + result;
    }

    return result;
  }

}
export default UIInputField;
