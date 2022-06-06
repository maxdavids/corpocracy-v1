import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import AssetsLoader from "../../loader/AssetsLoader";
import Renderable from "../../core/Renderable";
import Clock from "../../Clock";
import TextLoader from "../../loader/TextLoader";
import Mesh from "../../core/Mesh";
import Texture2DLoader from "../../loader/Texture2DLoader";
import Texture2DArrayLoader from "../../loader/Texture2DArrayLoader";
import MeshLoader from "../../loader/MeshLoader";
import FactoryScene from "../FactoryScene";
import MaterialTerrain from "./materials/MaterialTerrain";
import Vector3 from "../../core/Vector3";
import GlobalLighting from "../GlobalLighting";
import RenderTexture from "../../core/RenderTexture";
import ControllerOrbiter from "../../common/ControllerOrbiter";
import MaterialWireframe from "./materials/MaterialWireframe";
import MaterialSectors from "./materials/MaterialSectors";
import MaterialHolo from "./materials/MaterialHolo";
import Texture3DLoader from "../../loader/Texture3DLoader";
import DAppInterface from "../../../DAppInterface";
import MaterialBlurGaussian from "../../common/materials/MaterialBlurGaussian";
import MaterialFXAA from "../../common/materials/MaterialFXAA";
import MaterialPostGame from "../materials/MaterialPostGame";
import UIGlobals from "./ui/UIGlobals";
import Vector4 from "../../core/Vector4";
import Utils from "../../Utils";

/**
 * Created by mdavids on 20/01/2018.
 */
class LayerGame3D {

  protected _renderer:Renderer;
  protected _dAppInterface:DAppInterface;
  protected _assetsLoader:AssetsLoader;

  public _globalLighting:GlobalLighting;
  public _cellSeed:number = 0;

  protected _animStartTime:number = 0;

  public _camera:Camera;
  protected _cameraSectors:Camera;
  protected _currentFov:number = 40;
  protected _currentOrthoSize:number = 25;

  protected _orbiter:ControllerOrbiter;

  protected _bufferG:RenderTexture;
  protected _bufferTransparentPass:RenderTexture;
  protected _bufferSectorsPass:RenderTexture;

  protected _bufferPost1:RenderTexture;
  protected _bufferPost2:RenderTexture;

  protected _buffersWidth:number = 0;
  protected _buffersHeight:number = 0;

  protected _blitFXAA:MaterialFXAA;
  protected _blitBlur:MaterialBlurGaussian;
  protected _blitHolo:MaterialHolo;
  protected _blitGamePost:MaterialPostGame;

  protected _renderables:Renderable[] = [];
  protected _renderablesTransparent:Renderable[] = [];
  protected _renderablesSector:Renderable[] = [];

  protected _sceneStartTime:number = 0;

  protected _sectorOwners:Float32Array = new Float32Array([0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);

  constructor(renderer:Renderer, dAppInterface:DAppInterface, loader:AssetsLoader) {
    this._renderer = renderer;
    this._dAppInterface = dAppInterface;
    this._assetsLoader = loader;
  }

  public build():void {
    var canvas = this._renderer.getCanvas();

    this._buffersWidth = canvas.width;
    this._buffersHeight = canvas.height;

    this._bufferG = new RenderTexture(this._renderer, this._buffersWidth, this._buffersHeight, 0, false, true, true, true, false, false, true);
    this._bufferTransparentPass = new RenderTexture(this._renderer, this._buffersWidth, this._buffersHeight, 6, false, true, true, false, false, false, true);
    this._bufferSectorsPass = new RenderTexture(this._renderer, 2048, 2048, 2, false, false, true, false, false, false, false);

    this._bufferPost1 = new RenderTexture(this._renderer, this._buffersWidth, this._buffersHeight, 5, false, true, true, false, false, false, true);
    this._bufferPost2 = new RenderTexture(this._renderer, this._buffersWidth, this._buffersHeight, 6, false, true, true, false, false, false, true);

    this._blitFXAA = new MaterialFXAA(this._renderer);
    this._blitBlur = new MaterialBlurGaussian(this._renderer);

    this._blitHolo = new MaterialHolo(this._renderer);
    this._blitHolo.texLut = this._assetsLoader.getAsset("tex_lut_holo") as Texture3DLoader;

    this._blitGamePost = new MaterialPostGame(this._renderer);
    this._blitGamePost.texNoise = this._assetsLoader.getAsset("tex_noise") as Texture2DLoader;
    this._blitGamePost.texLut = this._assetsLoader.getAsset("tex_lut") as Texture3DLoader;
    this._blitGamePost.texBlur = this._bufferPost2;

    var aspect:number = this._buffersWidth / this._buffersHeight;
    var degToPi:number = -Math.PI / 180;
    var fovy: number = this._currentFov * 0.0174533;
    this._camera = new Camera(this._renderer, fovy, 0.1, 300, aspect);
    this._camera.setViewport(0, 0, this._buffersWidth, this._buffersHeight);
    this._camera.getTransform().setPositionXYZ(0, 55, 45);
    this._camera.getTransform().setRotationXYZ(55 * degToPi, 180 * degToPi + 180 * degToPi, 0);
    this._camera.forceOrthogonal(this._currentOrthoSize);

    this._cameraSectors = new Camera(this._renderer, fovy, 0.1, 300, aspect);
    this._cameraSectors.setViewport(0, 0, this._buffersWidth, this._buffersHeight);
    this._cameraSectors.getTransform().setPositionXYZ(0, 10, 0);
    this._cameraSectors.getTransform().setRotationXYZ(-Math.PI * 0.5, 0, 0);
    this._cameraSectors.forceOrthogonal(80);

    this._orbiter = new ControllerOrbiter(this._renderer, this._camera, new Vector3(), new Vector3());
    this._orbiter.minDistance = 40;
    this._orbiter.maxDistance = 60;
    // this._orbiter.minAzimuthAngle = Math.PI * 0.15;
    this._orbiter.minAzimuthAngle = Math.PI * 0.355;
    this._orbiter.maxAzimuthAngle = Math.PI * 0.355;

    this._blitHolo.cellSeed = this._orbiter.getSphericalPos().theta;


    // global illumination
    this._globalLighting = new GlobalLighting(this._renderer, this._assetsLoader);
    this._globalLighting.texSkybox = this._assetsLoader.getAsset("tex_background") as Texture2DLoader;
    this._globalLighting.setSkyboxProbe(this._globalLighting.texSkybox);
    this._globalLighting.prefilter();


    // retrieve contract data
    this.refresh();


    // build scene
    var jsonScene:any;
    var scenesIds:string[] = [
      "scene_01"
    ];

    for (let i:number = 0; i < scenesIds.length; i++) {
      jsonScene = JSON.parse((this._assetsLoader.getAsset(scenesIds[i]) as TextLoader).getText());

      this.buildTerrain(jsonScene);
      this.buildTransparent(jsonScene);
      this.buildSectors(jsonScene);
    }

    this._sceneStartTime = Clock.globalTime;
  }

  public resize(width:number, height:number)
  {
    this._buffersWidth = Math.round(width);
    this._buffersHeight = Math.round(height);

    this._bufferG.setSize(this._buffersWidth, this._buffersHeight);
    this._bufferTransparentPass.setSize(this._buffersWidth, this._buffersHeight);
    this._bufferPost1.setSize(this._buffersWidth, this._buffersHeight);
    this._bufferPost2.setSize(this._buffersWidth, this._buffersHeight);

    this._camera.setViewport(0, 0, this._buffersWidth, this._buffersHeight);
  }

  public update():void
  {
    var currentSceneTime:number = Clock.globalTime - this._sceneStartTime;

    this._orbiter.update();
    this._blitHolo.cellSeed = this._orbiter.getSphericalPos().theta;
    this._cellSeed = this._blitHolo.cellSeed;
    this._blitGamePost.cellSeed = this._cellSeed;

    this.updateState();
  }

  public draw(toTarget:RenderTexture):void
  {
    this._renderer.setClearColor(0, 0, 0, 1);

    this._renderer.setRenderTarget(this._bufferG);
    this._renderer.clear();
    this.drawOpaquePass();

    this._renderer.setRenderTarget(this._bufferSectorsPass);
    this._renderer.clear();
    this.drawSectorsPass();

    this._renderer.setRenderTarget(this._bufferTransparentPass);
    this._renderer.clear();
    this.drawTransparentPass(this._bufferSectorsPass);

    var backColor:Vector4 = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderer.setClearColor(backColor.x, backColor.y, backColor.z, 1);

    // post
    this._blitHolo.texture2 = this._bufferTransparentPass;
    this._renderer.blitInto(this._bufferG, this._bufferPost1, this._blitHolo);

    this._renderer.blitInto(this._bufferPost1, this._bufferPost2, this._blitFXAA);
    this._renderer.blitInto(this._bufferPost2, this._bufferPost1, this._blitBlur);

    this._blitGamePost.texBlur = this._bufferPost1;
    this._renderer.blitInto(this._bufferPost2, toTarget, this._blitGamePost);
  }

  protected drawSectorsPass():void
  {
    for (let i:number = 0; i < this._renderablesSector.length; i++) {
      this._renderablesSector[i].draw(this._cameraSectors);
    }
  }

  protected drawOpaquePass():void
  {
    this._globalLighting.updateIrradiance();

    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(this._camera);
    }
  }

  protected drawTransparentPass(sectorsBuffer:RenderTexture):void
  {
    for (let i:number = 0; i < this._renderablesTransparent.length; i++) {
      this._renderablesTransparent[i].getMaterial().setTexture(sectorsBuffer);
      this._renderablesTransparent[i].draw(this._camera);
    }
  }

  protected updateState():void
  {
    var currentTime:number = Clock.globalTime - this._animStartTime;
  }

  destruct()
  {

  }

  protected buildTerrain(jsonScene:any):void
  {
    var ids:string[] = [
      "city"
    ];

    var mesh: Mesh;
    var mat: MaterialTerrain;
    var renderable: Renderable;

    for (let i:number = 0; i < ids.length; i++) {
      mesh = this._assetsLoader.getAsset("mesh_" + ids[i]) as MeshLoader;
      mat = new MaterialTerrain(this._renderer);
      mat.texFacade = this._assetsLoader.getAsset("tex_facades") as Texture2DArrayLoader;
      mat.envBRDF = this._assetsLoader.getAsset("tex_int_brdf") as Texture2DLoader;
      mat.globalLight = this._globalLighting;

      FactoryScene.instantiateMesh(mesh, jsonScene, ids[i], true);

      renderable = new Renderable(this._renderer, mesh, mat);
      this._renderables.push(renderable);
    }
  }

  protected buildTransparent(jsonScene:any):void
  {
    var ids:string[] = [
      "buildings",
      // "roads"
    ];

    var mesh: Mesh;
    var mat: MaterialWireframe;
    var renderable: Renderable;

    for (let i:number = 0; i < ids.length; i++) {
      mesh = this._assetsLoader.getAsset("mesh_" + ids[i]) as MeshLoader;
      mat = new MaterialWireframe(this._renderer);
      mat.ownersIds = this._sectorOwners;
      mat.sectorsCamera = this._cameraSectors;

      FactoryScene.instantiateMesh(mesh, jsonScene, ids[i], true);

      renderable = new Renderable(this._renderer, mesh, mat);
      this._renderablesTransparent.push(renderable);
    }
  }

  protected buildSectors(jsonScene:any):void
  {
    var ids:string[] = [
      "sectors"
    ];

    var mesh: Mesh;
    var mat: MaterialSectors;
    var renderable: Renderable;

    for (let i:number = 0; i < ids.length; i++) {
      mesh = this._assetsLoader.getAsset("mesh_" + ids[i]) as MeshLoader;
      mat = new MaterialSectors(this._renderer);

      FactoryScene.instantiateMesh(mesh, jsonScene, ids[i], true);

      renderable = new Renderable(this._renderer, mesh, mat);
      this._renderablesSector.push(renderable);
    }
  }

  public refresh():void
  {
    // update sector owners
    const owners:any[] = this._dAppInterface.worldState["nodeOwners"];
    for (let i = 0; i < owners.length; i++) {
      this._sectorOwners[i] = owners[i].toNumber();
    }
  }

  /**
   *	handleMouseDown
   *	@method handleMouseDown
   */
  public handleMouseDown(mouseX:number, mouseY:number, e:any):void
  {
    this._orbiter.handleMouseDown(e);
  }

  /**
   *	handleMouseMove
   *	@method handleMouseMove
   */
  public handleMouseMove(mouseX:number, mouseY:number, e:any):void
  {
    this._orbiter.handleMouseMove(e);
  }

  /**
   *	handleMouseUp
   *	@method handleMouseUp
   */
  public handleMouseUp():void
  {
    this._orbiter.handleMouseUp();
  }

  /**
   *	handleMouseOut
   *	@method handleMouseOut
   */
  public handleMouseOut():void
  {
    this._orbiter.handleMouseOut();
  }

  public handleWheel(e):void
  {
    this._orbiter.handleMouseWheel(e);
  }
}
export default LayerGame3D;
