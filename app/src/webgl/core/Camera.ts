//import refdef = require('def/ReferenceDefinitions');
import Transform from "./Transform";
import Renderer from "./Renderer";
import Vector3 from "./Vector3";
import Vector2 from "./Vector2";
import Vector4 from "./Vector4";

const glMatrix = require('gl-matrix');

/**
 * Created by mdavids on 19/04/2016.
 */
class Camera /*extends Destructible*/ {

  public vSize:Vector2 = new Vector2();
  public zParams:Vector4 = new Vector4();
  public camParams:Vector4 = new Vector4();

  private _renderer:Renderer;

  private _projection:Float32Array;
  private _invProjection:Float32Array;

  private _viewProjection:Float32Array;

  private _transform:Transform;

  private _isDirty:boolean = true;

  private _fov:number;
  private _nearPlane:number;
  private _farPlane:number;
  private _aspect:number;

  private _isOrthogonal:boolean = false;
  private _orthoSize:number = 1;

  constructor(renderer:Renderer, fov:number = 60, nearPlane:number = 0.01, farPlane:number = 100, aspect:number = 1) {
    this._renderer = renderer;

    this._fov = fov;
    this._nearPlane = nearPlane;
    this._farPlane = farPlane;
    this._aspect = aspect;

    this._projection = glMatrix.mat4.create();
    this._invProjection = glMatrix.mat4.create();

    this._transform = new Transform();
    this._viewProjection = glMatrix.mat4.create();

    this.updateProjection();
  }

  public forceOrthogonal(size:number = 2):void
  {
    this._orthoSize = size;

    var halfSize:number = this._orthoSize * 0.5;
    this._projection = glMatrix.mat4.ortho(this._projection, -halfSize * this._aspect, halfSize * this._aspect, -halfSize, halfSize, this._nearPlane, this._farPlane);
    this._invProjection = glMatrix.mat4.invert(this._invProjection, this._projection);

    this._isOrthogonal = true;
  }

  public setViewport(x:number, y:number, width:number, height:number):void
  {
    this._aspect = width / height;

    this.vSize.x = width;
    this.vSize.y = height;

    var gl:WebGLRenderingContext = this._renderer.context;
    gl.viewport(x, y, width, height);

    this.updateProjection();
  }

  public setFOV(fov:number):void
  {
    this._fov = fov;

    this.updateProjection();
  }

  public getFOV():number
  {
    return this._fov;
  }

  public getAspect():number
  {
    return this._aspect;
  }

  public getInvProjection():Float32Array {
    return this._invProjection;
  }

  public getTransform():Transform
  {
    return this._transform;
  }

  public getViewMatrix():Float32Array {
    return this._transform.getMatrix();
  }

  public getInvViewMatrix():Float32Array {
    return this._transform.getInvMatrix();
  }

  public getProjection():Float32Array {
    return this._projection;
  }

  public getViewProjection():Float32Array {
    this.updateViewProjection();
    return this._viewProjection;
  }

  private updateViewProjection():void {
    if (this._isDirty || this._transform.isDirtyInverse()) {
      glMatrix.mat4.multiply(this._viewProjection, this._projection, this.getInvViewMatrix());
      this._isDirty = false;
    }
  }

  private updateProjection():void
  {
    if (!this._isOrthogonal) {
      this._projection = glMatrix.mat4.perspective(this._projection, this._fov, this._aspect, this._nearPlane, this._farPlane);
      this._invProjection = glMatrix.mat4.invert(this._invProjection, this._projection);

      this.zParams.x = 1 - this._farPlane / this._nearPlane;
      this.zParams.y = this._farPlane / this._nearPlane;
      this.zParams.z = this.zParams.x / this._farPlane;
      this.zParams.w = this.zParams.y / this._farPlane;

      this.camParams.x = this._nearPlane;
      this.camParams.y = this._farPlane;
      this.camParams.z = this._fov;

    } else {
      var halfSize:number = this._orthoSize * 0.5;
      this._projection = glMatrix.mat4.ortho(this._projection, -halfSize * this._aspect, halfSize * this._aspect, -halfSize, halfSize, this._nearPlane, this._farPlane);
      this._invProjection = glMatrix.mat4.invert(this._invProjection, this._projection);
    }

    this._isDirty = true;
  }

  public getScreenRay(projX:number, projY:number, projZ:number = 1):Vector3
  {
    var projPos:Float32Array = glMatrix.vec4.fromValues(projX, projY, projZ, 1);
    glMatrix.vec4.transformMat4(projPos, projPos, this.getInvProjection());
    glMatrix.vec4.transformMat4(projPos, projPos, this.getViewMatrix());

    return new Vector3(projPos[0], projPos[1], projPos[2]);
  }

  public canViewPoint(point:Vector3):boolean
  {
    var pos:Float32Array = point.toF32();
    glMatrix.vec3.transformMat4(pos, pos, this._viewProjection);

    return (pos[0] >= -1 && pos[0] <= 1 && pos[1] >= -1 && pos[1] <= 1)
  }

  public getProjCoord(point:Vector3):Vector3
  {
    var pos:Float32Array = point.toF32();
    glMatrix.vec3.transformMat4(pos, pos, this.getViewProjection());

    return new Vector3(pos[0], pos[1], pos[2]);
  }

  public getProjCoordV4(point:Vector4):Vector4
  {
    var pos:Float32Array = point.toF32();
    glMatrix.vec4.transformMat4(pos, pos, this.getViewProjection());

    return new Vector4(pos[0], pos[1], pos[2], pos[3]);
  }

  public destruct():void {
    if (this._transform) {
      this._transform.destruct();
      this._transform = null;
    }

    this._projection = null;
    this._viewProjection = null;

    //super.destruct();
  }
}
export default Camera;
