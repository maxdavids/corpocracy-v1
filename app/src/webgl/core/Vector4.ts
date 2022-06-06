/**
 * Created by mdavids on 28-10-2015.
 */
class Vector4 {
  public x:number;
  public y:number;
  public z:number;
  public w:number;

  private _f32Array:Float32Array = new Float32Array(4);

  constructor(x: number = 0, y: number = 0, z: number = 0, w:number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  public clone() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  public static lerp(a:Vector4, b:Vector4, i:number):Vector4
  {
    return new Vector4(
        (1 - i) * a.x +  i * b.x,
        (1 - i) * a.y +  i * b.y,
        (1 - i) * a.z +  i * b.z,
        (1 - i) * a.w +  i * b.w
    );
  }

  public toF32()
  {
    this._f32Array[0] = this.x;
    this._f32Array[1] = this.y;
    this._f32Array[2] = this.z;
    this._f32Array[3] = this.w;

    return this._f32Array;
  }
}
export default Vector4;
