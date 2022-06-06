import Renderer from "../core/Renderer";
import Camera from "../core/Camera";
import Vector3 from "../core/Vector3";
import Spherical from "../core/Spherical";
import Vector2 from "../core/Vector2";
import Quaternion from "../core/Quaternion";
import Clock from "../Clock";

enum ControllerState {
	NONE,
	ROTATE,
	DOLLY,
	TOUCH_ROTATE,
	TOUCH_DOLLY
}

/**
 * Created by mdavids on 28/10/2016.
 */
class ControllerOrbiter {

	public minDistance:number = 1.0;
	public maxDistance:number = 5;

	public minPolarAngle:number = 0;
	public maxPolarAngle:number = Math.PI;

	public minAzimuthAngle:number = 0;
	public maxAzimuthAngle:number = Math.PI;

	public enableDamping:boolean = false;
	public dampingFactor:number = 0.25;

	public zoomSpeed:number = 0.5;
	public rotateSpeed:number = 0.5;

	private _renderer:Renderer;
	private _camera:Camera;

	public _target:Vector3;
	private _anchor:Vector3;
	private _scale:number = 1;

	private _sphericalPos:Spherical = new Spherical();
	private _sphericalDelta:Spherical = new Spherical();

	private _rotateStart:Vector2 = new Vector2();
	private _rotateEnd:Vector2 = new Vector2();
	private _rotateDelta:Vector2 = new Vector2();

	private _dollyStart:Vector2 = new Vector2();
	private _dollyEnd:Vector2 = new Vector2();
	private _dollyDelta:Vector2 = new Vector2();

	private _zoomChanged:boolean = false;

	private _keys:any;
	private _mouseButtons:any;

	private _state:ControllerState = ControllerState.NONE;

	constructor(renderer:Renderer, camera:Camera, anchor:Vector3, target:Vector3)
	{
		this._renderer = renderer;
		this._camera = camera;

		this._target = target;
		this._anchor = anchor;

		// The four arrow keys
		this._keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

		// Mouse buttons
		this._mouseButtons = { ORBIT: 0, ZOOM: 1, PAN: 2 };

		//this._sphericalPos.clampedUp = 0.9;
	}

	public rotateLeft(angle:number):void
	{
		this._sphericalDelta.theta = angle;
	}

	public rotateUp(angle)
	{
		this._sphericalDelta.phi = angle;
	}

	public dollyIn(dollyScale)
	{
		this._scale /= dollyScale;

		this._zoomChanged = true;
	}

	public dollyOut(dollyScale)
	{
		this._scale *= dollyScale;

		this._zoomChanged = true;
	}

	public getZoomScale():number
	{
		return Math.pow(0.95, this.zoomSpeed);
	}

	public getSphericalPos():Spherical
	{
		return this._sphericalPos;
	}

	public setDistance(radius:number):void
	{
		this._sphericalPos.radius = radius;
		this._sphericalPos.makeSafe();

		// restrict radius to be between desired limits
		this._sphericalPos.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._sphericalPos.radius));

		var position:Vector3 = new Vector3()
		position.setFromSpherical(this._sphericalPos);
		position = Vector3.add(this._target.clone(), position);

		this._camera.getTransform().setPosition(position);
		this._camera.getTransform().lookAt2(this._target);
	}

	/**
	 *	handleMouseDown
	 *	@method handleMouseDown
	 */
	public handleMouseDown(e):void
	{
		if (e.button === this._mouseButtons.ORBIT) {
			this.handleMouseDownRotate(e);

			this._state = ControllerState.ROTATE;

		} else {
			if (e.button === this._mouseButtons.ZOOM) {
				this.handleMouseDownDolly(e);

				this._state = ControllerState.DOLLY;
			}
		}
	}

	/**
	 *	handleMouseMove
	 *	@method handleMouseMove
	 */
	public handleMouseMove(e):void
	{
		if (this._state === ControllerState.ROTATE) {
			this.handleMouseMoveRotate(e);

		} else if (this._state === ControllerState.DOLLY) {
			this.handleMouseMoveDolly(e);
		}
	}

	/**
	 *	handleMouseUp
	 *	@method handleMouseUp
	 */
	public handleMouseUp():void
	{
		this._state = ControllerState.NONE;
	}

	/**
	 *	handleMouseOut
	 *	@method handleMouseOut
	 */
	public handleMouseOut():void
	{
		this._state = ControllerState.NONE;
	}

	public handleMouseWheel(e):void {
		if (e.deltaY < 0) {
			this.dollyOut(this.getZoomScale());

		} else if (e.deltaY > 0) {
			this.dollyIn(this.getZoomScale());
		}

		this.update();
	}

	private handleMouseDownRotate(e):void
	{
		this._rotateStart.setTo(e.clientX, e.clientY);
	}

	private handleMouseDownDolly(e):void
	{
		this._dollyStart.setTo(e.clientX, e.clientY);
	}

	private handleMouseMoveRotate(e):void
	{
		this._rotateEnd.setTo(e.clientX, e.clientY );
		this._rotateDelta = Vector2.subtract(this._rotateEnd, this._rotateStart);

		var width:number = this._renderer.getCanvas().width;
		var height:number = this._renderer.getCanvas().height;

		// rotating across whole screen goes 360 degrees around
		this.rotateLeft(2 * Math.PI * this._rotateDelta.x / width * this.rotateSpeed);

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		this.rotateUp(2 * Math.PI * this._rotateDelta.y / height * this.rotateSpeed);

		this._rotateStart = this._rotateEnd.clone();

		this.update();
	}

	private handleMouseMoveDolly(e):void
	{
		this._dollyEnd.setTo(e.clientX, e.clientY);
		this._dollyDelta = Vector2.subtract(this._dollyEnd, this._dollyStart);

		if(this._dollyDelta.y > 0) {
			this.dollyIn(this.getZoomScale());

		} else {
			if(this._dollyDelta.y < 0) {
				this.dollyOut((this.getZoomScale()));
			}
		}

		this._dollyStart = this._dollyEnd.clone();

		this.update();
	}

	public onTouchStart(e):void
	{
		switch (e.touches.length) {
			case 1:	// one-fingered touch: rotate
				this.handleTouchStartRotate(e);

				this._state = ControllerState.TOUCH_ROTATE;
				break;

			case 2:	// two-fingered touch: dolly
				this.handleTouchStartDolly(e);

				this._state = ControllerState.TOUCH_DOLLY;
				break;

			default:
				this._state = ControllerState.NONE;
		}
	}

	public onTouchMove(e):void
	{
		switch (e.touches.length) {
			case 1: // one-fingered touch: rotate
				if (this._state !== ControllerState.TOUCH_ROTATE ) return;

				this.handleTouchMoveRotate(e);
				break;

			case 2: // two-fingered touch: dolly
				if (this._state !== ControllerState.TOUCH_DOLLY ) return;

				this.handleTouchMoveDolly(e);
				break;

			default:
				this._state = ControllerState.NONE;
		}
	}

	public onTouchEnd(e):void
	{
		this.handleTouchEnd(e);
		this._state = ControllerState.NONE;
	}

	public handleTouchStartRotate(e):void
	{
		this._rotateStart.setTo(e.touches[0].pageX, e.touches[0].pageY);
	}

	public handleTouchStartDolly(e):void
	{
		var dx = e.touches[0].pageX - e.touches[1].pageX;
		var dy = e.touches[0].pageY - e.touches[1].pageY;

		var dist = Math.sqrt(dx * dx + dy * dy);

		this._dollyStart.setTo(0, dist);
	}

	public handleTouchMoveRotate(e):void
	{
		this._rotateEnd.setTo(e.touches[0].pageX, e.touches[0].pageY);
		this._rotateDelta = Vector2.subtract(this._rotateEnd, this._rotateStart);

		var width:number = this._renderer.getCanvas().width;
		var height:number = this._renderer.getCanvas().height;

		var speed:number = width / 1920 * this.rotateSpeed;

		// rotating across whole screen goes 360 degrees around
		this.rotateLeft(2 * Math.PI * this._rotateDelta.x / width * speed);

		// rotating up and down along whole screen attempts to go 360, but limited to 180
		this.rotateUp(2 * Math.PI * this._rotateDelta.y / height * speed);

		this._rotateStart = this._rotateEnd.clone();

		this.update();
	}

	public handleTouchMoveDolly(e):void
	{
		var dx = e.touches[0].pageX - e.touches[1].pageX;
		var dy = e.touches[0].pageY - e.touches[1].pageY;

		var dist = Math.sqrt(dx * dx + dy * dy);

		this._dollyEnd.setTo(0, dist);
		this._dollyDelta = Vector2.subtract(this._dollyEnd, this._dollyStart);

		if (this._dollyDelta.y > 0) {
			this.dollyOut(this.getZoomScale());

		} else {
			if (this._dollyDelta.y < 0) {
				this.dollyIn(this.getZoomScale());
			}
		}

		this._dollyStart = this._dollyEnd.clone();

		this.update();
	}

	public handleTouchEnd(e):void
	{

	}

	public update():void
	{
		var quat:Quaternion = new Quaternion();
		quat.setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(0, 1, 0));

		var quatInverse:Quaternion = quat.clone();
		quatInverse.invert();

		var position:Vector3 = this._camera.getTransform().position.clone();
		var offset:Vector3 = Vector3.subtract(position, this._target);

		offset.applyQuaternion(quat);

		this._sphericalPos.setFromVector3(offset);

		this._sphericalPos.theta += this._sphericalDelta.theta;
		this._sphericalPos.phi += this._sphericalDelta.phi;
    this._sphericalPos.phi = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this._sphericalPos.phi));

		this._sphericalPos.makeSafe();

		this._sphericalPos.radius *= this._scale;
		this._sphericalPos.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this._sphericalPos.radius));

		offset.setFromSpherical(this._sphericalPos);
		offset.applyQuaternion(quatInverse);

		var position:Vector3 = Vector3.add(this._target.clone(), offset);
		this._camera.getTransform().setPosition(position);
		this._camera.getTransform().lookAt2(this._target);

		this._sphericalDelta.theta *= this.dampingFactor * (1.0 - Clock.deltaTime);
		this._sphericalDelta.phi *= this.dampingFactor * (1.0 - Clock.deltaTime);

		this._scale = 1;
	}

	destruct()
	{

	}

}
export default ControllerOrbiter;
