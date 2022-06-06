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
import DAppInterface from "../../../../DAppInterface";
import Quaternion from "../../../core/Quaternion";
import Vector3 from "../../../core/Vector3";
import UIGlobals from "./UIGlobals";
import UIUtils from "./UIUtils";

/**
 * Created by mdavids on 9/7/2018.
 */
class UIPopUpCorp implements IUIScreen{

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

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _shaderPlane:UIShaderPlane;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _renderables:Renderable[] = [];
  protected _widgets:IUIWidget[] = [];

  protected _label:TextRenderable;
  protected _labelIndex:TextRenderable;
  protected _labelPlus:TextRenderable;
  protected _labelArrow:TextRenderable;
  protected _labelDesc:TextRenderable;
  protected _labelTokensCorp:TextRenderable;
  protected _labelDividendsCorp:TextRenderable;
  protected _labelTokensEnemy:TextRenderable;
  protected _labelDividendsEnemy:TextRenderable;
  protected _labelVS1:TextRenderable;
  protected _labelVS2:TextRenderable;

  protected _frame:Renderable;
  protected _frameDot:Renderable;

  protected _line1:Renderable;
  protected _line2:Renderable;
  protected _line3:Renderable;

  protected _bar:UIBarVs;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:240, pxHeight:60 },
    frame_dot:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:101, pxOffY:11, pxWidth:3, pxHeight:3 },

    label:{ x:-1, y:1, pxOffX:70, pxOffY:-40, pxHeight:20 },
    label_index:{ x:-1, y:1, pxOffX:40, pxOffY:-60, pxHeight:11 },
    label_plus:{ x:1, y:1, pxOffX:-40, pxOffY:-38, pxHeight:16 },
    label_arrow:{ x:1, y:-1, pxOffX:-45, pxOffY:40, pxHeight:11 },

    label_desc:{ x:-1, y:1, pxOffX:40, pxOffY:-100, pxHeight:11 },

    label_tokens_corp:{ x:-1, y:1, pxOffX:40, pxOffY:-280, pxHeight:11 },
    label_ether_corp:{ x:-1, y:1, pxOffX:40, pxOffY:-310, pxHeight:11 },
    label_tokens_enemy:{ x:1, y:1, pxOffX:-40, pxOffY:-280, pxHeight:11 },
    label_ether_enemy:{ x:1, y:1, pxOffX:-40, pxOffY:-310, pxHeight:11 },

    label_vs_1:{ x:-1, y:1, pxOffX:254, pxOffY:-280, pxHeight:11 },
    label_vs_2:{ x:-1, y:1, pxOffX:254, pxOffY:-310, pxHeight:11 },

    line_1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-160, pxWidth:460, pxHeight:1 },
    line_2:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-250, pxWidth:460, pxHeight:1 },
    line_3:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-350, pxWidth:460, pxHeight:1 },

    bar:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-195, pxWidth:460, pxHeight:50 }
  };

  constructor(renderer:Renderer, loader:AssetsLoader, width:number = 1, height:number = 1) {
    this._renderer = renderer;
    this._assetsLoader = loader;

    this._shaderPlane = new UIShaderPlane(this._renderer);

    this._vSize.x = width;
    this._vSize.y = height;

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

    this._frameDot = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._frameDot.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._frameDot.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frameDot);

    this._line1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line1);

    this._line2 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line2.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line2.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line2);

    this._line3 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._line3.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._line3.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line3.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line3.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line3);

    this._label = new TextRenderable(this._renderer, ["$_PALES ENGINEERING"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._label);

    this._labelIndex = new TextRenderable(this._renderer, ["$01"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.85);
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

    const corpDesc:string[] = [
      "$An American electrical engineering and software company that provide",
      "$automation products and services such as robotics and computer control systems."
    ];
    this._labelDesc = new TextRenderable(this._renderer, corpDesc, [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.6, 1.5);
    this._labelDesc.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelDesc.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelDesc);

    this._labelTokensCorp = new TextRenderable(this._renderer, ["$. Tokens"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.6, 1.5);
    this._labelTokensCorp.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTokensCorp.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelTokensCorp);

    this._labelDividendsCorp = new TextRenderable(this._renderer, ["$. DIVs per share"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.6, 1.5);
    this._labelDividendsCorp.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelDividendsCorp.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelDividendsCorp);

    this._labelTokensEnemy = new TextRenderable(this._renderer, ["$. Tokens"], [UIGlobals.CURRENT_COLOR2], TextPivot.RIGHT, TextPivot.TOP, 0.6, 1.5);
    this._labelTokensEnemy.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTokensEnemy.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelTokensEnemy);

    this._labelDividendsEnemy = new TextRenderable(this._renderer, ["$. DIVs per share"], [UIGlobals.CURRENT_COLOR2], TextPivot.RIGHT, TextPivot.TOP, 0.6, 1.5);
    this._labelDividendsEnemy.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelDividendsEnemy.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelDividendsEnemy);

    this._labelVS1 = new TextRenderable(this._renderer, ["$VS "], [UIGlobals.CURRENT_COLOR0], TextPivot.LEFT, TextPivot.TOP, 0.6, 1.5);
    this._labelVS1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelVS1.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    this._renderables.push(this._labelVS1);

    this._labelVS2 = new TextRenderable(this._renderer, ["$VS "], [UIGlobals.CURRENT_COLOR0], TextPivot.LEFT, TextPivot.TOP, 0.6, 1.5);
    this._labelVS2.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelVS2.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    this._renderables.push(this._labelVS2);

    this._bar = new UIBarVs(this._renderer, this._assetsLoader, ["$PALES ENGINEERING _ 50%", "$TOKYO PHARMACEUTICALS _ 50%"], UIGlobals.CURRENT_COLOR2, UIGlobals.ENEMY_COLOR2, UIGlobals.CURRENT_COLOR0);
    this._widgets.push(this._bar);


    // this.refresh();
    // this.resize(this._vSize, this._scale);
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

    var tmpOffset:Vector2 = new Vector2();
    tmpOffset.x = this._scale.x * (this._pivot.x + 0.5) * 2;
    tmpOffset.y = this._scale.y * (this._pivot.y + 0.5) * 2;

    this._pos.subtract(tmpOffset);
  }

  public transformElements():void
  {
    var frameData:any = this._uiData["frame"];
    frameData.pxWidth = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    frameData.pxHeight = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    this.transformElement2D("frame", this._frame);
    this.transformElement2D("frame_dot", this._frameDot);

    this.transformElement2D("line_1", this._line1);
    this.transformElement2D("line_2", this._line2);
    this.transformElement2D("line_3", this._line3);

    this.transformTextElement2D("label", this._label);
    this.transformTextElement2D("label_index", this._labelIndex);
    this.transformTextElement2D("label_plus", this._labelPlus);
    this.transformTextElement2D("label_arrow", this._labelArrow);
    this.transformTextElement2D("label_desc", this._labelDesc);
    this.transformTextElement2D("label_tokens_corp", this._labelTokensCorp);
    this.transformTextElement2D("label_ether_corp", this._labelDividendsCorp);
    this.transformTextElement2D("label_tokens_enemy", this._labelTokensEnemy);
    this.transformTextElement2D("label_ether_enemy", this._labelDividendsEnemy);

    this.transformTextElement2D("label_vs_1", this._labelVS1);
    this.transformTextElement2D("label_vs_2", this._labelVS2);

    this.transformWidget("bar", this._bar);
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

  private transformWidget(dataId:string, element:IUIWidget):void
  {
    var pixelSizeX:number = 1 / this._vSize.x * 2;
    var pixelSizeY:number = 1 / this._vSize.y * 2;

    var data:any = this._uiData[dataId];

    var scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * UIGlobals.PIXEL_SIZE : data.width;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;

    var posX:number = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    var posY:number = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;

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

    for (let i:number = 0; i < this._widgets.length; i++) {
      this._widgets[i].draw(camera);
    }
  }

  destruct()
  {

  }

  public refresh():void
  {
    var playerData:any = DAppInterface.instance.playerData;
    var playerCorpData:any = DAppInterface.instance.corpsData[playerData["corpId"].toFixed()];
    var enemyCorpData:any = DAppInterface.instance.corpsData[((playerData["corpId"].toNumber() + 1) % 2).toFixed()];

    this._label.setText(["$_" + playerCorpData["name"].toUpperCase()]);
    this._labelDesc.setText(playerCorpData["desc"]);

    this._labelTokensCorp.setText(["$. Tokens: " + UIUtils.clampText(playerCorpData["tokenSupply"].toFixed())]);
    this._labelDividendsCorp.setText(["$. EPS: " + UIUtils.clampText(playerCorpData["profitsPerShare"].toFixed(), 18)]);

    this._labelTokensEnemy.setText(["$. Tokens: " + UIUtils.clampText(enemyCorpData["tokenSupply"].toFixed())]);
    this._labelDividendsEnemy.setText(["$. EPS: " + UIUtils.clampText(enemyCorpData["profitsPerShare"].toFixed(), 18)]);

    var corp1Label:string = "$" + playerCorpData["name"].toUpperCase() +" _ " + playerCorpData["totalValue"].toFixed() + "%";
    var corp2Label:string = "$" + enemyCorpData["name"].toUpperCase() +" _ " + enemyCorpData["totalValue"].toFixed() + "%";
    this._bar.setLabels([corp1Label, corp2Label]);

    this._bar.weight = (playerCorpData["totalValue"].div(100)).toNumber();

    this.refreshUIColors();
    this.transformElements();
  }

  protected refreshUIColors():void
  {
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._frameDot.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line3.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line3.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);

    this._label.setColors([UIGlobals.CURRENT_COLOR2]);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelIndex.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelIndex.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelPlus.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelPlus.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelArrow.setColors([UIGlobals.CURRENT_COLOR3]);
    this._labelArrow.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelDesc.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelDesc.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelTokensCorp.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelTokensCorp.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelDividendsCorp.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelDividendsCorp.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelTokensEnemy.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelTokensEnemy.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelDividendsEnemy.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelDividendsEnemy.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelVS1.setColors([UIGlobals.CURRENT_COLOR0]);
    this._labelVS1.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    this._labelVS2.setColors([UIGlobals.CURRENT_COLOR0]);
    this._labelVS2.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    this._bar.setColors(UIGlobals.CURRENT_COLOR2, UIGlobals.ENEMY_COLOR2, UIGlobals.CURRENT_COLOR0);
  }
}
export default UIPopUpCorp;
