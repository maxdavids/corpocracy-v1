import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import AssetsLoader from "../../../loader/AssetsLoader";
import Renderable from "../../../core/Renderable";
import Mesh from "../../../core/Mesh";
import MeshQuad from "../../../core/MeshQuad";
import UIShaderPlane from "../ui/materials/shaders/UIShaderPlane";
import UIMaterialPlane from "../ui/materials/UIMaterialPlane";
import Texture2DLoader from "../../../loader/Texture2DLoader";
import IUIWidget from "./IUIWidget";
import Vector2 from "../../../core/Vector2";
import UIUtils from "./UIUtils";
import UIShaderPostBlend from "./materials/shaders/UIShaderPostBlend";
import MaterialBlit from "../../materials/MaterialBlit";
import RenderTexture from "../../../core/RenderTexture";
import LayerGame3D from "../LayerGame3D";
import UIShaderWorldBtn from "./materials/shaders/UIShaderWorldBtn";
import DAppInterface from "../../../../DAppInterface";
import Quaternion from "../../../core/Quaternion";
import UIMaterialWorldPlane from "./materials/UIMaterialWorldPlane";
import FactoryScene from "../../FactoryScene";
import IRenderTarget from "../../../core/IRenderTarget";
import TextRenderable, {TextPivot} from "./TextRenderable";
import Vector3 from "../../../core/Vector3";
import Vector4 from "../../../core/Vector4";
import UIGlobals from "./UIGlobals";
import Utils from "../../../Utils";
import UIShaderPlaneSDF from "./materials/shaders/UIShaderPlaneSDF";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIGameMap implements IUIWidget{

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _posOriginal:Vector2 = new Vector2();

  protected _dAppInterface:DAppInterface;
  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _isHidden:boolean = false;
  protected _isDragging:boolean = false;

  protected _bufferGamePass:RenderTexture;
  protected _bufferGameWindow:RenderTexture;
  protected _layer3D:LayerGame3D;

  protected _shaderPlane:UIShaderPlane;
  protected _shaderPlaneSDF:UIShaderPlaneSDF;
  protected _shaderWorldBtn:UIShaderWorldBtn;

  protected _cameraLayer3D:Camera;
  protected _cameraSectorMarker:Camera;
  protected _markerOrthoSize:number = 25;
  protected _btnSectorMarker:Renderable;
  protected _mapBtns:any = [];

  protected _bufferSectorMarker;
  protected _blitPostBlendUI:MaterialBlit;

  protected _sectorOwners:Float32Array = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
  protected _sectorFlags:Float32Array = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);

  protected _map:Renderable;
  protected _fillTop:Renderable;
  protected _fillTokyo:Renderable;
  protected _lineTokyo:Renderable;

  protected _cell1:Renderable;
  protected _cell2:Renderable;

  protected _vLines:Renderable[] = [];
  protected _hLines:Renderable[] = [];

  protected _labelTokyo:TextRenderable;
  protected _labelArrow1:TextRenderable;
  protected _labelArrow2:TextRenderable;
  protected _labelPlus1:TextRenderable;

  protected _renderables:Renderable[] = [];

  protected _uiData:any = {
    map: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 540, pxHeight: 390 },
    fillTop: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 140, pxHeight: 90 },
    fillTokyo: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 220, pxHeight: 100 },

    lineTokyo: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 100, pxHeight: 1 },

    vLine: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 1, pxHeight: 90 },
    hLine: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 90, pxHeight: 1 },

    cell: { x: -1, y: 1, pivX: -0.5, pivY: 0.5, pxOffX: 150, pxOffY: -240, pxWidth: 90, pxHeight: 90 },

    label_tokyo: { x:-1, y:1, pxOffX:0, pxOffY:0, pxHeight:15 },
    label_arrow: { x:-1, y:1, pxOffX:0, pxOffY:0, pxHeight:11 },
    label_plus: { x:-1, y:1, pxOffX:0, pxOffY:0, pxHeight:16 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader) {
    this._renderer = renderer;
    this._assetsLoader = loader;

    this._vSize.x = 1;
    this._vSize.y = 1;

    this._dAppInterface = DAppInterface.instance;
    this._layer3D = new LayerGame3D(this._renderer, this._dAppInterface, this._assetsLoader);
    this._layer3D.build();
    this._cameraLayer3D = this._layer3D._camera;

    this._shaderPlane = new UIShaderPlane(this._renderer);
    this._shaderPlaneSDF = new UIShaderPlaneSDF(this._renderer);
    this._shaderWorldBtn = new UIShaderWorldBtn(this._renderer);

    this.createSectorBtnData();

    this.build();
  }

  protected build():void
  {
    var width:number = this._renderer.getCanvas().width;
    var height:number = this._renderer.getCanvas().height;

    var gwSize:Vector2 = this.getGameWindowSize(width, height);
    this._bufferGameWindow = new RenderTexture(this._renderer, gwSize.x, gwSize.y, 2, false, true, true, false, false, false, true);
    this._bufferGamePass = new RenderTexture(this._renderer, gwSize.x, gwSize.y, 5, false, true, true, false, false, false, true);

    var fovy: number = 40 * 0.0174533;
    this._cameraSectorMarker = new Camera(this._renderer, fovy, 0.1, 100, gwSize.x / gwSize.y);
    this._cameraSectorMarker.forceOrthogonal(gwSize.y * this._markerOrthoSize / 1080);
    this._cameraSectorMarker.setViewport(0, 0, gwSize.x, gwSize.y);
    this._cameraSectorMarker.getTransform().setPositionXYZ(0, 0, 10);

    var mesh: Mesh = new MeshQuad(this._renderer);

    var matGameWindow:UIMaterialPlane = new UIMaterialPlane(this._renderer, this._shaderPlane);
    matGameWindow.preserveAlphaFlag = 1;
    this._map = new Renderable(this._renderer, mesh, matGameWindow);
    this._map.getMaterial().setTexture(this._bufferGameWindow);
    this._renderables.push(this._map);

    for (let i:number = 0; i < 5; i++) {
      let vLine:Renderable = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
      (vLine.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff0d0d0d);
      (vLine.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff0d0d0d);
      (vLine.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
      vLine.getMaterial().setAdditiveBlending();

      this._vLines.push(vLine);
      this._renderables.push(vLine);
    }

    for (let i:number = 0; i < 5; i++) {
      let hLine:Renderable = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
      (hLine.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff0d0d0d);
      (hLine.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff0d0d0d);
      (hLine.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
      hLine.getMaterial().setAdditiveBlending();

      this._hLines.push(hLine);
      this._renderables.push(hLine);
    }

    this._cell1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._cell1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff000000);
    (this._cell1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff2d2d2d);
    (this._cell1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    (this._cell1.getMaterial() as UIMaterialPlane).diagonalWeight = 1;
    this._cell1.getMaterial().setAdditiveBlending();
    this._renderables.push(this._cell1);

    this._cell2 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._cell2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff000000);
    (this._cell2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff2d2d2d);
    (this._cell2.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    (this._cell2.getMaterial() as UIMaterialPlane).diagonalWeight = 1;
    this._cell2.getMaterial().setAdditiveBlending();
    this._renderables.push(this._cell2);

    this._fillTop = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    this._fillTop.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_missing") as Texture2DLoader);
    (this._fillTop.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._fillTop.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._fillTop);

    this._lineTokyo = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._lineTokyo.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xffffffff);
    (this._lineTokyo.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffffffff);
    (this._lineTokyo.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._lineTokyo.getMaterial().setAdditiveBlending();
    this._renderables.push(this._lineTokyo);

    this._fillTokyo = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF));
    this._fillTokyo.getMaterial().setTexture(this._assetsLoader.getAsset("tex_filling_tokyo") as Texture2DLoader);
    (this._fillTokyo.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff000000);
    (this._fillTokyo.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xffffffff);
    (this._fillTokyo.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);
    this._fillTokyo.getMaterial().setAdditiveBlending();
    this._renderables.push(this._fillTokyo);

    this._labelTokyo = new TextRenderable(this._renderer, ["$TOKYO"], [0xff000000], TextPivot.LEFT, TextPivot.CENTER);
    this._labelTokyo.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTokyo.getMaterial().backColor = Utils.hexToRGBA(0xffffffff);
    this._renderables.push(this._labelTokyo);

    this._labelArrow1 = new TextRenderable(this._renderer, ["${","","{"], [0xffffffff], TextPivot.LEFT, TextPivot.LEFT, 0.95, 0.8);
    this._labelArrow1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelArrow1.getMaterial().backColor = Utils.hexToRGBA(0xff000000);
    this._labelArrow1.getMaterial().rotation = Quaternion.fromEuler(new Vector3(0, 0, Math.PI));
    this._labelArrow1.getMaterial().setAdditiveBlending();
    this._renderables.push(this._labelArrow1);

    this._labelArrow2 = new TextRenderable(this._renderer, ["${","","{"], [0xffffffff], TextPivot.LEFT, TextPivot.LEFT, 0.95, 0.8);
    this._labelArrow2.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelArrow2.getMaterial().backColor = Utils.hexToRGBA(0xff000000);
    this._labelArrow2.getMaterial().rotation = Quaternion.fromEuler(new Vector3(0, 0, Math.PI));
    this._labelArrow2.getMaterial().setAdditiveBlending();
    this._renderables.push(this._labelArrow2);

    this._labelPlus1 = new TextRenderable(this._renderer, ["$+"], [0xffffffff], TextPivot.CENTER, TextPivot.CENTER);
    this._labelPlus1.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelPlus1.getMaterial().backColor = Utils.hexToRGBA(0xff000000);
    this._labelPlus1.getMaterial().setAdditiveBlending();
    this._renderables.push(this._labelPlus1);

    this._bufferSectorMarker = new RenderTexture(this._renderer, gwSize.x, gwSize.y, 6, false, true, true, false, false, false, true);
    this._blitPostBlendUI = new MaterialBlit(this._renderer, new UIShaderPostBlend(this._renderer));

    // retrieve contract data
    this.updateSectorData();

    var meshBtnMap:Mesh = new MeshQuad(this._renderer);
    var texBtnMap:Texture2DLoader = this._assetsLoader.getAsset("tex_" + "btn_map") as Texture2DLoader;
    var matBtnMap:UIMaterialWorldPlane = new UIMaterialWorldPlane(this._renderer, this._shaderWorldBtn);
    matBtnMap.setTexture(texBtnMap);
    matBtnMap.cameraWorld = this._cameraLayer3D;
    matBtnMap.ownersIds = this._sectorOwners;
    matBtnMap.flags = this._sectorFlags;

    FactoryScene.instantiateMesh(meshBtnMap, this._mapBtns, "btn");
    this._btnSectorMarker = new Renderable(this._renderer, meshBtnMap, matBtnMap);

    this.resize(this._vSize, this._scale);
  }

  protected getGameWindowSize(width:number, height:number):Vector2
  {
    var cellAspect:number = 16 / 6;
    var windowWidth:number = width * 0.9;

    return new Vector2(Math.round(windowWidth), Math.round(windowWidth / cellAspect));
  }

  public getSize():Vector2
  {
    return this._scale;
  }

  public getPos():Vector2
  {
    return this._pos;
  }

  public show():void
  {
    this._isHidden = false;
  }

  public hide():void
  {
    this._isHidden = true;
  }

  public getAtts():any
  {
    var result:any = {};
    result["scale"] = (this._map.getMaterial() as UIMaterialPlane).scale;
    result["pos"] = (this._map.getMaterial() as UIMaterialPlane).pos;
    result["uiData"] = this._uiData["map"];

    return result;
  }

  public getNodeProjPos(index:number):Vector3
  {
    var nodeData:any = this._mapBtns[index];
    var posStr:string[] = nodeData["p"].split(',');
    var nodePos:Vector3 = new Vector3(-Number(posStr[0]), Number(posStr[1]), Number(posStr[2]));
    var nodeProj:Vector3 = this._cameraLayer3D.getProjCoord(nodePos);

    return nodeProj;
  }

  public resize(vSize:Vector2, scale:Vector2):void
  {
    this._vSize = vSize.clone();
    this._vAspect = this._vSize.x / this._vSize.y;

    this._scale = scale;

    this.transformElements();
  }

  public transformElements():void
  {
    var width:number = this._renderer.getCanvas().width;
    var height:number = this._renderer.getCanvas().height;
    const pixelSize:number = 1;

    var gwSize:Vector2 = this.getGameWindowSize(width, height);
    this._bufferGameWindow.setSize(gwSize.x, gwSize.y);
    this._bufferGamePass.setSize(gwSize.x, gwSize.y);
    this._bufferSectorMarker.setSize(gwSize.x, gwSize.y);
    this._layer3D.resize(gwSize.x, gwSize.y);

    this._cameraSectorMarker.setViewport(0, 0, gwSize.x, gwSize.y);
    this._cameraSectorMarker.forceOrthogonal(gwSize.y * this._markerOrthoSize / 1080);

    this._uiData["map"]["pxWidth"] = gwSize.x;
    this._uiData["map"]["pxHeight"] = gwSize.y;
    this._uiData["map"]["pxOffX"] = Math.floor((width - gwSize.x) * 0.5);
    this._uiData["map"]["pxOffY"] = Math.floor((height - gwSize.y) * -0.5);
    UIUtils.transformElement2D(this._uiData["map"], this._map, this._vSize, pixelSize);

    const pxCellSize:number = gwSize.x / 16;
    const pxOffsetX:number = Math.floor(width - gwSize.x) * 0.5;

    this._uiData["fillTop"]["pxWidth"] = pxCellSize * 3;
    this._uiData["fillTop"]["pxHeight"] = pxCellSize;
    this._uiData["fillTop"]["pxOffX"] = pxOffsetX + pxCellSize * 4;
    this._uiData["fillTop"]["pxOffY"] = this._uiData["map"]["pxOffY"] + pxCellSize * 0.5;
    UIUtils.transformElement2D(this._uiData["fillTop"], this._fillTop, this._vSize, pixelSize);

    this._uiData["fillTokyo"]["pxOffX"] = pxOffsetX - 12;
    this._uiData["fillTokyo"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 4.25;
    this._uiData["fillTokyo"]["pxWidth"] = Math.floor(220 * UIGlobals.PIXEL_SIZE);
    this._uiData["fillTokyo"]["pxHeight"] = Math.floor(100 * UIGlobals.PIXEL_SIZE);
    UIUtils.transformElement2D(this._uiData["fillTokyo"], this._fillTokyo, this._vSize, pixelSize);

    this._uiData["lineTokyo"]["pxWidth"] = pxOffsetX + 10;
    this._uiData["lineTokyo"]["pxOffX"] = 0;
    this._uiData["lineTokyo"]["pxOffY"] = Math.floor(this._uiData["map"]["pxOffY"] - pxCellSize * 4.25 - this._uiData["fillTokyo"]["pxHeight"] + 32 * UIGlobals.PIXEL_SIZE);
    UIUtils.transformElement2D(this._uiData["lineTokyo"], this._lineTokyo, this._vSize, pixelSize);

    this._uiData["label_tokyo"]["pxOffX"] = pxOffsetX + 25;
    this._uiData["label_tokyo"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 4.25 - this._uiData["fillTokyo"]["pxHeight"] + 49 * UIGlobals.PIXEL_SIZE;
    UIUtils.transformTextElement2D(this._uiData["label_tokyo"], this._labelTokyo, this._vSize, pixelSize);
    const pixelSizeY:number = UIGlobals.PIXEL_SIZE / this._vSize.y * 2;
    const scaleY:number = this._uiData["label_tokyo"].pxHeight * pixelSizeY * 0.5;
    const scaleX:number = scaleY / (this._vSize.x / this._vSize.y);
    this._labelTokyo.setScale(scaleX, scaleY);

    // vertical lines
    this._uiData["vLine"]["pxHeight"] = height;
    this._uiData["vLine"]["pxOffX"] = pxOffsetX + pxCellSize;
    this._uiData["vLine"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize;
    UIUtils.transformElement2D(this._uiData["vLine"], this._vLines[0], this._vSize, pixelSize);

    this._uiData["vLine"]["pxHeight"] = height;
    this._uiData["vLine"]["pxOffX"] = pxOffsetX + pxCellSize * 5;
    this._uiData["vLine"]["pxOffY"] = 0;
    UIUtils.transformElement2D(this._uiData["vLine"], this._vLines[1], this._vSize, pixelSize);

    this._uiData["vLine"]["pxHeight"] = Math.abs(this._uiData["map"]["pxOffY"]) + gwSize.y + pxCellSize * 0.5;
    this._uiData["vLine"]["pxOffX"] = pxOffsetX + pxCellSize * 6;
    UIUtils.transformElement2D(this._uiData["vLine"], this._vLines[2], this._vSize, pixelSize);

    this._uiData["vLine"]["pxHeight"] = Math.abs(this._uiData["map"]["pxOffY"]) + gwSize.y - pxCellSize;
    this._uiData["vLine"]["pxOffX"] = pxOffsetX + pxCellSize * 13;
    UIUtils.transformElement2D(this._uiData["vLine"], this._vLines[3], this._vSize, pixelSize);

    this._uiData["vLine"]["pxHeight"] = height;
    this._uiData["vLine"]["pxOffX"] = pxOffsetX + pxCellSize * 13.5;
    UIUtils.transformElement2D(this._uiData["vLine"], this._vLines[4], this._vSize, pixelSize);

    // horizontal lines
    this._uiData["hLine"]["pxWidth"] = width * 0.5;
    this._uiData["hLine"]["pxOffX"] = width * 0.5;
    this._uiData["hLine"]["pxOffY"] = this._uiData["map"]["pxOffY"] + pxCellSize;
    UIUtils.transformElement2D(this._uiData["hLine"], this._hLines[0], this._vSize, pixelSize);

    this._uiData["hLine"]["pxWidth"] = width;
    this._uiData["hLine"]["pxOffX"] = pxOffsetX - pxCellSize * 0.5;
    this._uiData["hLine"]["pxOffY"] = this._uiData["map"]["pxOffY"];
    UIUtils.transformElement2D(this._uiData["hLine"], this._hLines[1], this._vSize, pixelSize);

    this._uiData["hLine"]["pxOffX"] = 0;
    this._uiData["hLine"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 2.25;
    UIUtils.transformElement2D(this._uiData["hLine"], this._hLines[2], this._vSize, pixelSize);

    this._uiData["hLine"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 2.5;
    UIUtils.transformElement2D(this._uiData["hLine"], this._hLines[3], this._vSize, pixelSize);

    this._uiData["hLine"]["pxOffX"] = -pxOffsetX - pxCellSize;
    this._uiData["hLine"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 6;
    UIUtils.transformElement2D(this._uiData["hLine"], this._hLines[4], this._vSize, pixelSize);

    this._uiData["cell"]["pxWidth"] = pxCellSize * 0.5 + 1;
    this._uiData["cell"]["pxHeight"] = pxCellSize * 0.5;
    this._uiData["cell"]["pxOffX"] = pxOffsetX + pxCellSize * 0.5;
    this._uiData["cell"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 1.5;
    UIUtils.transformElement2D(this._uiData["cell"], this._cell1, this._vSize, pixelSize);

    this._uiData["cell"]["pxWidth"] = pxCellSize;
    this._uiData["cell"]["pxHeight"] = pxCellSize;
    this._uiData["cell"]["pxOffX"] = pxOffsetX + pxCellSize * 15;
    this._uiData["cell"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 2;
    UIUtils.transformElement2D(this._uiData["cell"], this._cell2, this._vSize, pixelSize);

    this._uiData["label_arrow"]["pxOffX"] = pxOffsetX + 13;
    this._uiData["label_arrow"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize + 11;
    UIUtils.transformTextElement2D(this._uiData["label_arrow"], this._labelArrow1, this._vSize, pixelSize);

    this._uiData["label_arrow"]["pxOffX"] = pxOffsetX + pxCellSize * 16 + 7;
    this._uiData["label_arrow"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 5 - this._uiData["label_arrow"]["pxHeight"] * 3;
    UIUtils.transformTextElement2D(this._uiData["label_arrow"], this._labelArrow2, this._vSize, pixelSize);

    this._uiData["label_plus"]["pxOffX"] = pxOffsetX + pxCellSize * 6 - 1;
    this._uiData["label_plus"]["pxOffY"] = this._uiData["map"]["pxOffY"] - pxCellSize * 6 - 1;
    UIUtils.transformTextElement2D(this._uiData["label_plus"], this._labelPlus1, this._vSize, pixelSize);

    const matBtnMap:UIMaterialWorldPlane = (this._btnSectorMarker.getMaterial() as UIMaterialWorldPlane);
    matBtnMap.scale.x = UIGlobals.PIXEL_SIZE;
    matBtnMap.scale.y = UIGlobals.PIXEL_SIZE;
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
    this._layer3D.refresh();

    this.updateSectorData();
    const matBtnMap:UIMaterialWorldPlane = (this._btnSectorMarker.getMaterial() as UIMaterialWorldPlane);
    matBtnMap.flags = this._sectorFlags;
  }

  public includesPoint(point:Vector2):boolean
  {
    var mapAtts:any = this.getAtts();

    return (mapAtts.pos.x <= point.x &&
      mapAtts.pos.y >= point.y &&
      mapAtts.pos.x + mapAtts.scale.x * 2 >= point.x &&
      mapAtts.pos.y - mapAtts.scale.y * 2 <= point.y);
  }

  public update():void
  {
    this._layer3D.update();
  }

  public draw(camera:Camera):void
  {
    var toTarget:IRenderTarget = this._renderer.currentRenderTarget;
    this._layer3D.draw(this._bufferGamePass);

    this._renderer.setRenderTarget(this._bufferSectorMarker);
    this._renderer.clear();
    this._btnSectorMarker.draw(this._cameraSectorMarker);

    this._blitPostBlendUI.texture2 = this._bufferSectorMarker;
    this._renderer.blitInto(this._bufferGamePass, this._bufferGameWindow, this._blitPostBlendUI);

    this._renderer.setRenderTarget(toTarget);

    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(camera);
    }
  }

  destruct()
  {

  }

  protected updateSectorData():void
  {
    const isPrerelease:boolean = this._dAppInterface.worldState["isPrerelease"];
    const isPaused:boolean = this._dAppInterface.worldState["isPaused"];
    const playerData:any = this._dAppInterface.playerData;
    const wasInitialized:boolean = playerData.initialized;
    const playerCorpId:number = playerData["corpId"].toNumber();

    const owners:any[] = this._dAppInterface.worldState["nodeOwners"];
    const raidIds:any[] = this._dAppInterface.worldState["pendingRaidIds"];
    const raidsData:any = this._dAppInterface.raidsData;

    for (let i = 0; i < owners.length; i++) {
      this._sectorOwners[i] = owners[i].toNumber();

      if (i < 2 || isPrerelease || isPaused || !wasInitialized) {
        this._sectorFlags[i] = 1;
      } else {

        const raidId:any = raidIds[i];
        if (raidId.gt(0)) {
          const raid:any = raidsData[raidId.toFixed()];
          this._sectorFlags[i] = raid["hasEnded"]? 2 : 2;
        } else {
          this._sectorFlags[i] = this._sectorOwners[i] === playerCorpId? -1 : 0;
        }
      }
    }
  }

  private createSectorBtnData():void
  {
    // Note: Negated yz positions
    var quat:Quaternion = new Quaternion();
    // quat.setFromEuler(new Vector3(0,0,-Math.PI * 0.25));

    var S:string = "1.25,1.25,1.25";
    var R:string = quat.x + "," + quat.y + "," + quat.z + "," + quat.w;

    // Note: Negated x position
    this._mapBtns = [
      // headquarters
      { n:"btn", p:"17,0,17", r:R, s:S },
      { n:"btn", p:"-15,0,-17", r:R, s:S },

      // corp1
      { n:"btn", p:"24,0,7", r:R, s:S },
      { n:"btn", p:"16,0,6", r:R, s:S },
      { n:"btn", p:"3,0,10", r:R, s:S },
      { n:"btn", p:"24,0,-7", r:R, s:S },
      { n:"btn", p:"13,0,-4", r:R, s:S },
      { n:"btn", p:"17,0,-14", r:R, s:S },

      // corp2
      { n:"btn", p:"-0,0,-17", r:R, s:S },
      { n:"btn", p:"-10,0,-5", r:R, s:S },
      { n:"btn", p:"-22,0,2", r:R, s:S },
      { n:"btn", p:"-0,0,0", r:R, s:S },
      { n:"btn", p:"-15,0,8", r:R, s:S },
      { n:"btn", p:"-7,0,-26", r:R, s:S },
    ];
  }

  public handleMouseMove(mouseX:number, mouseY:number, e:any):void
  {
    if (this._isDragging) {
      this._layer3D.handleMouseMove(mouseX, mouseY, e);
    }
  }

  public handleMouseDown(mouseX:number, mouseY:number, e:any):void
  {
      this._isDragging = true;
      this._layer3D.handleMouseDown(mouseX, mouseY, e);
  }

  public handleMouseUp(mouseX:number, mouseY:number, e:any):void
  {
    this._isDragging = false;
    this._layer3D.handleMouseUp();
  }

  public handleMouseOut():void
  {
    this._isDragging = false;
    this._layer3D.handleMouseOut();
  }

}
export default UIGameMap;
