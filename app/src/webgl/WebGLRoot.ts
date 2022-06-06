import Renderer from "./core/Renderer";
import Clock from "./Clock";
import SceneCyber from "./cyber/SceneCyber";

class WebGLRoot
{
  public static FPS_DELTA:number = 1 / 30;

  public static MIN_WIDTH:number = 1440;
  public static MIN_INV_ASPECT:number = 1080 / 1920;

  public canvas:HTMLCanvasElement;
  protected _canvasParent:HTMLElement;
  protected _autoResize:boolean;
  protected _manualResizeUpdate:boolean;
  protected _resizeHandler:any;

  protected _updateFrameID:number = 0;
  protected _deltaTimeAcc:number = 0;

  protected _renderer:Renderer;
  protected _retinaMultiplier:number = 1.0;
  protected _canDraw:boolean = false;

  protected _startTime:number = 0;
  protected _lastTime:number = 0;

  protected _scene:SceneCyber;

  protected _errorCallback:() => void;

  /**
   *	Constructor
   *	@method constructor
   */
  public constructor()
  {
    //super();
  }

  /**
   *	Init
   *	@method init
   */
  public init(
    canvasParent:HTMLElement,
    readyCallback:() => void,
    errorCallback:() => void,
    autoResize:boolean = true
  )
  {
    this._canvasParent = canvasParent;
    this._autoResize = autoResize;

    this._errorCallback = errorCallback;

    if(!canvasParent) {
      this._autoResize = false;
    }

    this._manualResizeUpdate = false;
    this.canvas = this.prepareCanvas(canvasParent);

    this._renderer = new Renderer(this.canvas);
    if (this._renderer.init()) {
      this.loadScene();
    } else {
      this._errorCallback();
    }
  }

  private loadScene():void
  {
    this._renderer.clear();

    this._startTime = Date.now();
    this._lastTime = this._startTime;

    Clock.init();

    this._deltaTimeAcc = 0;

    this._scene = new SceneCyber(this._renderer);
    this._scene.init();
    this._scene.load();

    const width = Math.floor(Math.max(this._canvasParent.offsetWidth, 1) * this._retinaMultiplier);
    const height = Math.floor(Math.max(this._canvasParent.offsetHeight, 1) * this._retinaMultiplier);
    this._scene.resize(width, height);

    this._canDraw = true;

    this.pause();
    this.update();
  }

  private prepareCanvas(canvasParent:HTMLElement):HTMLCanvasElement
  {
    let canvas:HTMLCanvasElement = <HTMLCanvasElement> document.createElement('canvas');
    canvas.setAttribute('id', 'canvas');

    const width:number = Math.max(canvasParent.offsetWidth, WebGLRoot.MIN_WIDTH);
    const height:number = Math.max(canvasParent.offsetHeight, width * WebGLRoot.MIN_INV_ASPECT);

    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    this._retinaMultiplier = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * this._retinaMultiplier);
    canvas.height = Math.floor(height * this._retinaMultiplier);

    if(canvasParent) {
      canvasParent.appendChild(canvas);
    }

    if (this._autoResize) {
      this._resizeHandler = <any>this.handleResize.bind(this);
      window.addEventListener('resize', this._resizeHandler);
    }

    return canvas;
  }

  private handleResize():void
  {
    if(!this._canvasParent) return;

    const width = Math.floor(Math.max(this._canvasParent.offsetWidth, WebGLRoot.MIN_WIDTH));
    const height = Math.floor(Math.max(this._canvasParent.offsetHeight, width * WebGLRoot.MIN_INV_ASPECT));

    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    this._retinaMultiplier = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(width * this._retinaMultiplier);
    this.canvas.height = Math.floor(height * this._retinaMultiplier);

    this._renderer.unSetRenderTarget();
    this._scene.resize(this.canvas.width, this.canvas.height);

	  this.pause();
    this.update();
  }

  public pause():void
  {
    if (this._updateFrameID != 0) {
      window.cancelAnimationFrame(this._updateFrameID);
    }

    this._updateFrameID = 0;
  }

  public resume():void
  {
    this.pause();

    if (this._updateFrameID == 0) {
      this._updateFrameID = window.requestAnimationFrame(()=>this.update());
    }
  }

  public update = ():void =>
  {
    this._updateFrameID = window.requestAnimationFrame(this.update);

    const currentTime:number = Date.now();
    let deltaTime:number = currentTime - this._lastTime;
    deltaTime = Math.min(deltaTime * 0.001, 1);

    this._lastTime = currentTime;
    this._deltaTimeAcc += deltaTime;

    if (this._deltaTimeAcc < WebGLRoot.FPS_DELTA) {
      return;
    }

    this._deltaTimeAcc -= WebGLRoot.FPS_DELTA;

    Clock.update();

    this._scene.update();
    this.draw();
  }

  private draw():void
  {
    if (!this._canDraw) {
      return;
    }

    this._renderer.setDepthMask(true);
    this._renderer.setDepthTest(true);
    this._scene.draw();
  }

  destruct()
  {
    this.pause();
    this._canDraw = false;

    //this.removeAllEventListeners();

    this._scene.destruct();
    if (this._renderer) {
      this._renderer.destruct();
    }

    if (this._canvasParent && this.canvas) {
      this._canvasParent.removeChild(this.canvas);
    }

    this._canvasParent = null;
    this.canvas = null;

    //super.destruct();
  }
}
export default WebGLRoot;
