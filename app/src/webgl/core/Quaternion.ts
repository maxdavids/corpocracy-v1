import Vector3 from "./Vector3";
import Vector2 from "./Vector2";
/**
 * Created by mdavids on 31/10/2016.
 */
class Quaternion
{
	public x:number;
	public y:number;
	public z:number;
	public w:number;

	private _f32Array:Float32Array = new Float32Array(4);

	constructor(x:number = 0, y:number = 0, z:number = 0, w:number = 1)
	{
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	public setValues(x:number, y:number, z:number, w:number):void
	{
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	public clone():Quaternion
	{
		return new Quaternion(this.x, this.y, this.z, this.w);
	}

	public copy(from:Quaternion):void
	{
		this.x = from.x;
		this.y = from.y;
		this.z = from.z;
		this.w = from.w;
	}

	public setFromEuler(euler:Vector3):void
	{
		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		var c1:number = Math.cos(euler.x / 2);
		var c2:number = Math.cos(euler.y / 2);
		var c3:number = Math.cos(euler.z / 2);
		var s1:number = Math.sin(euler.x / 2);
		var s2:number = Math.sin(euler.y / 2);
		var s3:number = Math.sin(euler.z / 2);

		//var order = euler.order;

		//if ( order === 'XYZ' ) {
		this.x = s1 * c2 * c3 + c1 * s2 * s3;
		this.y = c1 * s2 * c3 - s1 * c2 * s3;
		this.z = c1 * c2 * s3 + s1 * s2 * c3;
		this.w = c1 * c2 * c3 - s1 * s2 * s3;

		/*} else if ( order === 'YXZ' ) {
		 this._x = s1 * c2 * c3 + c1 * s2 * s3;
		 this._y = c1 * s2 * c3 - s1 * c2 * s3;
		 this._z = c1 * c2 * s3 - s1 * s2 * c3;
		 this._w = c1 * c2 * c3 + s1 * s2 * s3;

		 } else if ( order === 'ZXY' ) {
		 this._x = s1 * c2 * c3 - c1 * s2 * s3;
		 this._y = c1 * s2 * c3 + s1 * c2 * s3;
		 this._z = c1 * c2 * s3 + s1 * s2 * c3;
		 this._w = c1 * c2 * c3 - s1 * s2 * s3;

		 } else if ( order === 'ZYX' ) {
		 this._x = s1 * c2 * c3 - c1 * s2 * s3;
		 this._y = c1 * s2 * c3 + s1 * c2 * s3;
		 this._z = c1 * c2 * s3 - s1 * s2 * c3;
		 this._w = c1 * c2 * c3 + s1 * s2 * s3;

		 } else if ( order === 'YZX' ) {
		 this._x = s1 * c2 * c3 + c1 * s2 * s3;
		 this._y = c1 * s2 * c3 + s1 * c2 * s3;
		 this._z = c1 * c2 * s3 - s1 * s2 * c3;
		 this._w = c1 * c2 * c3 - s1 * s2 * s3;

		 } else if ( order === 'XZY' ) {
		 this._x = s1 * c2 * c3 - c1 * s2 * s3;
		 this._y = c1 * s2 * c3 - s1 * c2 * s3;
		 this._z = c1 * c2 * s3 + s1 * s2 * c3;
		 this._w = c1 * c2 * c3 + s1 * s2 * s3;
		 }*/
	}

	public setFromAxisAngle(axis:Vector3, angle:number):void
	{
		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		var halfAngle:number = angle / 2;
		var s:number = Math.sin(halfAngle);

		this.x = axis.x * s;
		this.y = axis.y * s;
		this.z = axis.z * s;
		this.w = Math.cos(halfAngle);
	}

	public setFromUnitVectors(from:Vector3, to:Vector3):void
	{
		// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

		// assumes direction vectors vFrom and vTo are normalized

		var v1:Vector3 = new Vector3();
		var r:number = 0;

		var EPS:number = 0.000001;

		r = Vector3.dot(from, to) + 1;

		if(r < EPS)
		{
			r = 0;

			if(Math.abs(from.x) > Math.abs(from.z))
			{
				v1.setValues(-from.y, from.x, 0);

			}
			else
			{
				v1.setValues(0, -from.z, from.y);
			}

		}
		else
		{
			v1 = Vector3.cross(from, to);
		}

		this.x = v1.x;
		this.y = v1.y;
		this.z = v1.z;
		this.w = r;

		this.normalize();
	}

	public setAxisAngle(axis:Vector3, rad:number):void
	{
		var r = rad * 0.5;
		var s = Math.sin(r);
		this.x = s * axis.x;
		this.y = s * axis.y;
		this.z = s * axis.z;
		this.w = Math.cos(r);
	};

	public static fromEuler(euler:Vector3):Quaternion
  {
    var result:Quaternion = new Quaternion();
    result.setFromEuler(euler);

    return result;
  }

	public static rotateTo(from:Vector3, to:Vector3):Quaternion
	{
		var result:Quaternion = new Quaternion();

		var tmpvec3 = new Vector3();
		var xUnitVec3 = new Vector3(1, 0, 0);
		var yUnitVec3 = new Vector3(0, 1, 0);

		var dot = Vector3.dot(from, to);
		if (dot < -0.999999) {
			tmpvec3 = Vector3.cross(xUnitVec3, from);

			if (tmpvec3.length() < 0.000001) {
				tmpvec3 = Vector3.cross(yUnitVec3, from);
			}

			tmpvec3.normalize();
			result.setAxisAngle(tmpvec3, Math.PI);
			return result;

		} else if (dot > 0.999999) {
			result.x = 0;
			result.y = 0;
			result.z = 0;
			result.w = 1;
			return result;

		} else {
			tmpvec3 = Vector3.cross(from, to);
			result.x = tmpvec3.x;
			result.y = tmpvec3.y;
			result.z = tmpvec3.z;
			result.w = 1 + dot;
			result.normalize();

			return result;
		}
	}

	public static facing(forward:Vector3, worldUp:Vector3):Quaternion
	{
		var worldRight:Vector3 = Vector3.cross(worldUp, forward);
		worldRight.normalize();

		var perpWorldUp = Vector3.cross(forward, worldRight);
		perpWorldUp.normalize();

		var quat:Quaternion = new Quaternion();
		quat.w = Math.sqrt(1.0 + worldRight.x + perpWorldUp.y + forward.z) * 0.5;
		var w4_recip = 1.0 / (4.0 * quat.w);
		quat.x = (perpWorldUp.z - forward.y) * w4_recip;
		quat.y = (forward.x - worldRight.z) * w4_recip;
		quat.z = (worldRight.y - perpWorldUp.x) * w4_recip;

		return quat;
	}

	public invert():void
	{
		this.conjugate();
		this.normalize();
	}

	public conjugate():void
	{
		this.x *= -1;
		this.y *= -1;
		this.z *= -1;
	}

	public dot(v:Quaternion):number
	{
		return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
	}

	public lengthSq():number
	{
		return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
	}

	public length():number
	{
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
	}

	public normalize():void
	{
		var l:number = this.length();

		if(l === 0)
		{
			this.x = 0;
			this.y = 0;
			this.z = 0;
			this.w = 1;
		}
		else
		{
			l = 1 / l;

			this.x = this.x * l;
			this.y = this.y * l;
			this.z = this.z * l;
			this.w = this.w * l;
		}
	}

	public multiply(q:Quaternion):Quaternion
	{
		return Quaternion.multiplyQuaternions(this, q);
	}

	public static multiplyQuaternions(a:Quaternion, b:Quaternion):Quaternion
	{
		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		var qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		var qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		var x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		var y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		var z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		var w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		var result:Quaternion = new Quaternion();
		result.setValues(x, y, z, w);

		return result;
	}

	public equals(value:Quaternion):boolean
	{
		return (value.x === this.x) && (value.y === this.y) && (value.z === this.z) && (value.w === this.w);
	}

	public static slerp(qa:Quaternion, qb:Quaternion, t:number):Quaternion
	{
		if (t === 0) {
			return qa.clone();
		}

		if (t === 1) {
			return qb.clone();
		}

		var result:Quaternion = qa.clone();

		var x = qa.x;
		var y = qa.y;
		var z = qa.z;
		var w = qa.w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		var cosHalfTheta = w * qb.w + x * qb.x + y * qb.y + z * qb.z;

		if (cosHalfTheta < 0) {
			result.w = -qb.w;
			result.x = -qb.x;
			result.y = -qb.y;
			result.z = -qb.z;

			cosHalfTheta = -cosHalfTheta;

		} else {
			result.copy(qb);
		}

		if (cosHalfTheta >= 1.0) {
			result.w = w;
			result.x = x;
			result.y = y;
			result.z = z;

			return result;

		}

		var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if (Math.abs(sinHalfTheta) < 0.001) {
			result.w = 0.5 * (w + result.w);
			result.x = 0.5 * (x + result.x);
			result.y = 0.5 * (y + result.y);
			result.z = 0.5 * (z + result.z);

			return result;
		}

		var halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
		var ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
		var ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

		result.w = (w * ratioA + result.w * ratioB);
		result.x = (x * ratioA + result.x * ratioB);
		result.y = (y * ratioA + result.y * ratioB);
		result.z = (z * ratioA + result.z * ratioB);

		return result;
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
export default Quaternion;
