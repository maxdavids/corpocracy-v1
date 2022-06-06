import Vector3 from "./Vector3";
/**
 * Created by mdavids on 28/10/2016.
 */
class Spherical {

	public theta:number = 0;
	public phi:number = 0;
	public radius:number = 0;

	public clampedUp:number = 1;

	constructor(theta:number = 0, phi:number = 0, radius:number = 0)
	{
		this.theta = theta;
		this.phi = phi;
		this.radius = radius;
	}

	public makeSafe():void
	{
		var EPS:number = 0.000001;
		this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
	}

	public setFromVector3(value:Vector3):void
	{
		this.radius = value.length();

		if ( this.radius === 0 ) {
			this.theta = 0;
			this.phi = 0;

		} else {
			this.theta = Math.atan2(value.x, value.z);

			let clampedUp:number = Math.min(Math.max(value.y / this.radius, -this.clampedUp), this.clampedUp);
			this.phi = Math.acos(clampedUp);
		}
	}

}
export default Spherical;
