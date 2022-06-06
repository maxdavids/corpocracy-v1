//import Destructible from "../../../temple/core/Destructible";
import Material from "./Material";
import MeshQuad from "./MeshQuad";
import Texture2D from "./Texture2D";
import IRenderTarget from "./IRenderTarget";
import Camera from "./Camera";
import ITexture from "./ITexture";

/**
 * Created by mdavids on 19/04/2016.
 * Based on the work by johan
 */
class Renderer /*extends Destructible*/ {
  public context: WebGL2RenderingContext;

  private _quad:MeshQuad;
  private _canvas:HTMLCanvasElement;

  private _program: WebGLProgram;

  private _depthMask:boolean = true;
  private _depthTest:boolean = true;
  private _culling:number = -1;
  private _cullingEnabled:boolean = false;
  private _blendEquation:number = -1;
  private _blendEnabled:boolean = false;
  private _sourceBlend:number = -1;
  private _destinationBlend:number = -1;

  public renderWidth:number;
  public renderHeight:number;
  private _oldViewportX:number;
  private _oldViewportY:number;

  public currentRenderTarget:IRenderTarget;

  constructor(
    canvas:HTMLCanvasElement,
    transparent:boolean = false,
    autoClear:boolean = true
  ) {
    this._canvas = canvas;
    this.context =  <any>  canvas.getContext('webgl2', {alpha:transparent, preserveDrawingBuffer: !autoClear});
  }

  public init():boolean
  {
    if (!this.context){
      return false;
    }

    this._quad = new MeshQuad(this);

    this.handleCanvasResize();
    this.context.clearColor(0.0, 0.0, 0.0, 1.0);
    this.context.clearDepth(1);

    this.setDepthMask(this._depthMask, true);
    this.setDepthTest(this._depthTest, true);
    this.setCullingEnabled(this._cullingEnabled, true);
    this.setBlendEnabled(this._blendEnabled, true);

    return true;
  }

  public getCanvas():HTMLCanvasElement
  {
    return this._canvas;
  }

  public setClearColor(r:number, g:number, b:number, a:number):void {
    this.context.clearColor(r, g, b, a);
  }

  //when rendering to a fbo, and depth does not seem to clear, try clearing after the draw.
  public clearDepth():void {
    var gl:WebGLRenderingContext = this.context;
    gl.clear(gl.DEPTH_BUFFER_BIT);
  }

  public clearColor():void {
    var gl:WebGLRenderingContext = this.context;
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  public clear():void {
    var gl:WebGLRenderingContext = this.context;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  public setProgram(program:WebGLProgram, force:boolean = false):boolean
  {
    if (program != this._program || force){
      this._program = program;
      this.context.useProgram(this._program);
      return true;
    }
    return false;
  }

  public setDepthMask(value:boolean, force:boolean = false):void
  {
    if(value != this._depthMask || force){
      this.context.depthMask(value);
      this._depthMask = value;
    }
  }

  public setDepthTest(value:boolean, force:boolean = false):void
  {
    if(value != this._depthTest || force){
      var gl:WebGLRenderingContext = this.context;
      value? gl.enable(gl.DEPTH_TEST):gl.disable(gl.DEPTH_TEST);
      this._depthTest = value;

      //console.log("Renderer::setDepthTest: " + value);
    }
  }

  public setCullingEnabled(value:boolean, force:boolean = false):void
  {
    if(value != this._cullingEnabled || force){
      var gl:WebGLRenderingContext = this.context;
      value?   gl.enable(gl.CULL_FACE):  gl.disable(gl.CULL_FACE);
      this._cullingEnabled = value;

      //console.log("Renderer::setCullingEnabled: " + value);
    }
  }

  public setCulling(value:number, force:boolean = false):void
  {
    if(value != this._culling || force){
      var gl:WebGLRenderingContext = this.context;
      if(value == gl.NONE){
        this.setCullingEnabled(false);
      }else{
        this.setCullingEnabled(true);
        gl.cullFace(value);
      }
      this._culling = value;
    }
  }

  public setBlendEquation(value:number, force:boolean = false):void
  {
    if(value != this._blendEquation || force){
      this.context.blendEquation(value);
      this._blendEquation = value;
    }
  }

  public setBlendEnabled(value:boolean, force:boolean = false):void
  {
    if(value != this._blendEnabled || force){
      var gl:WebGLRenderingContext = this.context;
      value?   gl.enable(gl.BLEND):  gl.disable(gl.BLEND);
      this._blendEnabled = value;
    }
  }

  public setBlendFunc(source:number, destination:number, force:boolean = false):void
  {
    if(source != this._sourceBlend || destination != this._destinationBlend || force){
      this.context.blendFunc(source, destination);
      this._sourceBlend = source;
      this._destinationBlend = destination;
    }
  }

  public setDepthCompareLess():void
  {
    var gl:WebGLRenderingContext = this.context;
    gl.depthFunc(gl.LESS);
  }

  public setDepthCompareGreater():void
  {
    var gl:WebGLRenderingContext = this.context;
    gl.depthFunc(gl.GREATER);
  }

  public setRenderTarget(rt:IRenderTarget):void
  {
    if (rt.getScaleToCanvas()) rt.setSize(
        Math.round(this._canvas.width * rt.sizeMultiplier),
        Math.round(this._canvas.height * rt.sizeMultiplier)
    );

    rt.setAsTarget();
    this.currentRenderTarget = rt;

    this.renderWidth = rt.width;
    this.renderHeight = rt.height;

    this.setViewport();
  }

  public unSetRenderTarget():void
  {
    var gl = this.context;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.currentRenderTarget = null;

    this.renderWidth = this._canvas.width;
    this.renderHeight = this._canvas.height;

    this.setViewport();
  }

  private setViewport():void {
    //if (this._oldViewportX != this.renderWidth || this._oldViewportY != this.renderHeight) {
      this.context.viewport(0, 0, this.renderWidth, this.renderHeight);
      this._oldViewportX = this.renderWidth;
      this._oldViewportY = this.renderHeight;
    //}
  }

  public handleCanvasResize():void
  {
    this.renderWidth = this._canvas.width;
    this.renderHeight = this._canvas.height;
    this.setViewport();
  }

  public blitInto(source:ITexture, destination:IRenderTarget, material:Material = null, camera:Camera = null, clear:boolean = true) {
    this.setRenderTarget(destination);

    if (clear) {
      this.clear();
    }

    material.setTexture(source);
    this._quad.draw(camera, material, null);

    this.unSetRenderTarget();
  }

  public blitToScreen(source:ITexture, material:Material, camera:Camera = null) {
    this.unSetRenderTarget();

    material.setTexture(source);
    this._quad.draw(camera, material, null);
  }

  public blitRenderTargets(source:IRenderTarget, destination:IRenderTarget, clear:boolean = false) {
    var gl = this.context;
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.frameBuffer);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, destination.frameBuffer);

    if (clear) {
      this.clear();
    }

    gl.blitFramebuffer(
      0, 0, source.width, source.height,
      0, 0, destination.width, destination.height,
      gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, gl.NEAREST
    );

    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  }

  destruct()
  {
    this.context = null;

    if (this._quad) {
      this._quad.destruct();
      this._quad = null;
    }
    //super.destruct();
  }
}
export default Renderer;
