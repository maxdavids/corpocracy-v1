import Renderer from "./Renderer";
import Shader from "./Shader";
import Vector4 from "./Vector4";
import Vector3 from "./Vector3";
import Vector2 from "./Vector2";
import Camera from "./Camera";
import Renderable from "./Renderable";
import Texture2D from "./Texture2D";
import ITexture from "./ITexture";
import Quaternion from "./Quaternion";

/**
 * Created by mdavids on 19/04/2016.
 */
class Material /*extends Destructible*/{
  public name: string;
  public shader: Shader;

  public _drawType: number;
  protected _depthTest: boolean = true;
  protected _depthWrite: boolean = true;
  protected _blend: boolean = false;
  protected _blendEquation: number;
  protected _sourceBlend: number;
  protected _destinationBlend: number;
  protected _sourceBlendRGB: number;
  protected _destinationBlendRGB: number;
  protected _culling:number;

  protected _renderer:Renderer;
  protected _texture:ITexture;

  constructor(renderer:Renderer, name:string, shader:Shader = null) {
    //super();
    this._renderer = renderer;
    this.name = name;
    this.shader = shader;

    var gl:WebGLRenderingContext = this._renderer.context;
    this._drawType = gl.TRIANGLES;
    this._blendEquation = gl.FUNC_ADD;
    this._sourceBlend = gl.ZERO;
    this._destinationBlend = gl.ONE;
    this._sourceBlendRGB = gl.ZERO;
    this._destinationBlendRGB = gl.ONE;
    this._culling = gl.BACK;
    //this._culling = gl.NONE;
  }

  public setActive() {
    this.setProgram();

    this._renderer.setDepthTest(this._depthTest);
    this._renderer.setDepthMask(this._depthWrite);
    this._renderer.setCulling(this._culling);

    this._renderer.setBlendEnabled(this._blend);
    if (this._blend){
      this._renderer.setBlendEquation(this._blendEquation);
      this._renderer.setBlendFunc(this._sourceBlend, this._destinationBlend);
    }
  }

  public setUniforms(camera:Camera, renderable:Renderable):void
  {
    if (this._texture) {
      var textureUniform:WebGLUniformLocation = this.getLoc('uTexture1');
      this._texture.bind();
      this._renderer.context.uniform1i(textureUniform, this._texture.registerIndex);
    }
  }

  public setTexture(texture:ITexture):void
  {
    this._texture = texture;
  }

  public getTexture():ITexture
  {
    return this._texture;
  }

  public setDepthWrite(value:boolean):void
  {
    this._depthWrite = value;
  }

  public setDepthTest(value:boolean):void
  {
    this._depthTest = value;
  }

  public resetBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    this._depthTest = true;
    this._depthWrite = true;
    this._blend = false;

    this._blendEquation = gl.FUNC_ADD;
    this._sourceBlend = gl.ZERO;
    this._destinationBlend = gl.ONE;
    this._sourceBlendRGB = gl.ZERO;
    this._destinationBlendRGB = gl.ONE;
    //this._culling = gl.NONE;
    this._culling = gl.BACK;
  }

  //http://www.andersriggelsen.dk/glblendfunc.php
  public setAlphaBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    this._depthWrite = false;
    this._depthTest = true;
    this._blend = true;

    //needed to do it this way on ios
    this._sourceBlendRGB = gl.SRC_ALPHA;
    this._destinationBlendRGB = gl.ONE_MINUS_SRC_ALPHA;
    this._sourceBlend = gl.SRC_ALPHA;
    this._destinationBlend = gl.ONE_MINUS_SRC_ALPHA;
  }

  public setPreAlphaBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    this._depthWrite = false;
    this._depthTest = true;
    this._blend = true;

    //needed to do it this way on ios
    this._sourceBlendRGB = gl.ONE;
    this._destinationBlendRGB = gl.ONE_MINUS_SRC_ALPHA;
    this._sourceBlend = gl.ONE;
    this._destinationBlend = gl.ONE_MINUS_SRC_ALPHA;
  }

  public setMaxBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    this._depthWrite = false;
    this._depthTest = false;
    this._blend = true;
    this._blendEquation = 0x8008;
    //needed to do it this way on ios
    this._sourceBlendRGB = gl.ONE;
    this._destinationBlendRGB = gl.ONE;
    this._sourceBlend = gl.ONE;
    this._destinationBlend = gl.ONE;
  }

  public setAdditiveBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    this._depthWrite = false;
    //this._depthTest = true;
    this._depthTest = false;
    this._blend = true;
    //needed to do it this way on ios
    this._sourceBlendRGB = gl.ONE;
    this._destinationBlendRGB = gl.ONE;
    this._sourceBlend = gl.ONE;
    this._destinationBlend = gl.ONE;
  }

  public setMultiplyBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    //Blend Zero SrcColor
    this._depthWrite = false;
    this._depthTest = false;
    this._blend = true;

    this._sourceBlend = gl.ZERO;
    this._destinationBlend = gl.SRC_COLOR;
    this._culling = gl.BACK;

    //this._blendEquation = GL.FUNC_SUBTRACT;
  }

  public setSubtractiveBlending():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;

    //Blend Zero SrcColor
    this._depthWrite = false;
    this._depthTest = false;
    this._blend = true;
    //needed to do it this way on ios
    this._sourceBlendRGB = gl.ONE;
    this._destinationBlendRGB = gl.ONE_MINUS_SRC_ALPHA;
    this._sourceBlend = gl.ONE;
    this._destinationBlend = gl.ONE_MINUS_SRC_ALPHA;

    this._blendEquation = gl.FUNC_SUBTRACT;
  }

  public setCullingBackFace():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;
    this._culling = gl.BACK;
  }

  public setCullingFrontFace():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;
    this._culling = gl.FRONT;
  }

  public setCullingDisabled():void
  {
    var gl:WebGLRenderingContext = this._renderer.context;
    this._culling = gl.NONE;
  }

  public setProgram()
  {
    this._renderer.setProgram(this.shader.getProgram());
  }

  public setFloat(propertyName: string, value: number) {
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc){
      this._renderer.setProgram(this.shader.getProgram());
      this._renderer.context.uniform1f(loc, value);
    }
  }

  public setInt(propertyName: string, value: number) {
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc) this._renderer.context.uniform1i(loc, value);
  }

  public setFloats(propertyName: string,  v0: number = 0,v1: number = 0,v2: number = 0,v3: number = 0) {
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc) this._renderer.context.uniform4f(loc, v0, v1, v2, v3);
  }

  public setShaderVector(propertyName: string, value: number[]) {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc == null) return;

    switch (value.length) {
      case 1: gl.uniform1f(loc, value[0]);
        break;
      case 2: gl.uniform2f(loc, value[0], value[1]);
        break;
      case 3: gl.uniform3f(loc, value[0], value[1], value[2]);
        break;
      case 4: gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
        break;
      default:
        break;
    }
    //console.log("setShaderVector: " + propertyName + ": " + value[0]);
  }

  public setMatrix(propertyName: string, value: Float32Array) {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc != null) gl.uniformMatrix4fv(loc, false, value);
  }

  public setMatrix3(propertyName: string, value: Float32Array) {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc != null) gl.uniformMatrix3fv(loc, false, value);
  }

  //this does not rely on getting a uniform _name from the shader text
  public setMatrixArray(propertyName: string, value: Float32Array[]) {
    for (var i = 0; i < value.length; i++) {
      var name:string = propertyName+"["+i+"]";
      this.setMatrix(name,  value[i]);
    }
  }

  public setFloat32Array(propertyName: string, array: Float32Array) {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc != null) gl.uniform1fv(loc, array);
  }

  public setColor(propertyName: string, r:number, g:number, b:number, a:number) {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc != null)gl.uniform4f(loc, r, g, b, a);
  }

  public setQuaternion(propertyName: string,  value: Quaternion)
  {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc == null) return;
    gl.uniform4f(loc, value.x, value.y, value.z, value.w);
  }

  public setVector4(propertyName: string,  value: Vector4)
  {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc == null) return;
    gl.uniform4f(loc, value.x, value.y, value.z, value.w);
  }

  public setVector3(propertyName: string,  value: Vector3)
  {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc == null) return;
    gl.uniform3f(loc, value.x, value.y, value.z);
  }

  public setVector2(propertyName: string,  value: Vector2)
  {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    if (loc == null) return;
    gl.uniform2f(loc, value.x, value.y);
  }

  public setVector2Array(propertyName: string,  value: Vector2[])
  {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    //console.log ("setVector2Array", propertyName, loc);
    if (loc == null) return;
    var l:number = value.length;
    var  array: Float32Array = new Float32Array(l * 2);
    for (var i = 0; i < l; i++) {
      array[i * 2] = value[i].x;
      array[i * 2 + 1] = value[i].y;
    }
    gl.uniform2fv(loc, array);
  }

  public setVector3Array(propertyName:string, value: Vector3[])
  {
    var gl = this._renderer.context;
    var loc: WebGLUniformLocation = this.getLoc(propertyName);
    //console.log ("setVector2Array", propertyName, loc);
    if (loc == null) return;
    var l:number = value.length;
    var  array: Float32Array = new Float32Array(l * 3);
    for (var i = 0; i < l; i++) {
      array[i * 3] = value[i].x;
      array[i * 3 + 1] = value[i].y;
      array[i * 3 + 2] = value[i].z;
    }
    gl.uniform3fv(loc, array);
  }

  public getLoc(propertyName: string): WebGLUniformLocation {
    this._renderer.setProgram(this.shader.getProgram());
    var loc: WebGLUniformLocation = this.shader.uniforms[propertyName];

    if (loc == null){
      //this is used by uniform arrays: the uniform was not found in the shader text, but does exist after compiling
      //can be used for caching of all uniforms
      var gl = this._renderer.context;
      loc = gl.getUniformLocation(this.shader.getProgram(), propertyName);
      if(loc){
        this.shader.uniforms[propertyName] = loc;
        return loc;
      }
    }
    return loc;
  }

  public hasUniform(name: string):boolean
  {
    this.setProgram();
    var loc: WebGLUniformLocation = this.shader.uniforms[name];
    return loc != null;
  }

  destruct()
  {
    if (this.shader) {
      this.shader.destruct();
    }

    if (this._texture) {
      this._texture.destruct();
    }

    this.shader = null;
    this._texture = null;

    this._renderer = null;
  }

}

export default Material;
