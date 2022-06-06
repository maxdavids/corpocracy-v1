import Renderer from "../core/Renderer";
import Camera from "../core/Camera";
import Vector3 from "../core/Vector3";
import Vector2 from "../core/Vector2";
/**
 * Created by mdavids on 24/10/2016.
 */
class Scene {

	protected _renderer:Renderer;
	protected _canvas:HTMLCanvasElement;
	protected _camera:Camera;

	protected _isMouseDown:boolean = false;
	protected _didDrag:boolean = false;
	protected _mousePosX:number = 0.0;
	protected _mousePosY:number = 0.0;

	protected _initDragPos:Vector3;
	protected _initViewPos:Vector2 = new Vector2();

	protected _blockInput:boolean = false;

	protected _isHidden:boolean = false;
	protected _isLocked:boolean = false;

	constructor(renderer:Renderer)
	{
		this._renderer = renderer;
	}

	public init():void
	{
		this._canvas = this._renderer.getCanvas();

		this._isMouseDown = false;
		this._didDrag = false;
	}

	public load():void
	{
		this._isMouseDown = false;
		this._didDrag = false;
		this._mousePosX = 0.0;
		this._mousePosY = 0.0;

		this._initDragPos = new Vector3();
		this._initViewPos = new Vector2();

		this.destructObjects();
		this.createObjects();

		//this._blockInput = false;
	}

	public resize(width:number, height:number):void
	{
		this._initViewPos.x = 0.0;
		this._initViewPos.y = 0.0;

		//this._blockInput = false;

		// this._camera.setViewport(0, 0, width, height);
	}

	public loseFocus(value:boolean):void
	{
		this._isMouseDown = false;
	}

	public show(value:boolean):void
	{
		this._isHidden = !value;
	}

	public isHidden():boolean
	{
		return this._isHidden;
	}

	public lock(value:boolean):void
	{
		this._isLocked = value;
		this._blockInput = value;

		this.loseFocus(value);
	}

	/**
	 *	handleMouseDown
	 *	@method handleMouseDown
	 */
	public handleMouseDown(mouseX:number, mouseY:number, e:any):void
	{
		this._mousePosX = mouseX;
		this._mousePosY = mouseY;

		this._isMouseDown = true;
		this._didDrag = false;

		if (this._blockInput) {
			return;
		}
	}

	/**
	 *	handleMouseMove
	 *	@method handleMouseMove
	 */
	public handleMouseMove(mouseX:number, mouseY:number, e:any):void
	{
		this._mousePosX = mouseX;
		this._mousePosY = mouseY;

		if (this._blockInput) {
			this._isMouseDown = false;
			this._didDrag = false;

			return;
		}

		if (this._isMouseDown) {
			this._didDrag = true;
		}
	}

	/**
	 *	handleMouseUp
	 *	@method handleMouseUp
	 */
	public handleMouseUp():void
	{
		if (this._blockInput) {
			this._didDrag = false;

			return;
		}

		this._didDrag = false;
		this._isMouseDown = false;
	}

	/**
	 *	handleMouseOut
	 *	@method handleMouseOut
	 */
	public handleMouseOut():void
	{
		this._isMouseDown = false;
		this._didDrag = false;
	}

	public handleWheel(e):void
	{

	}

	protected createObjects():void
	{
		// var fovy:number = Math.tan(60 * 0.5 * 0.0174533);
		// this._camera = new Camera(this._renderer, fovy, 0.01, 50.0, this._canvas.width / this._canvas.height);
	}

	protected destructObjects():void
	{

	}

	public update():void
	{

	}

	public drawMainPass():void
	{

	}

	public drawMaskingPass():void
	{

	}

	public drawFinalPass():void
	{

	}

	destruct()
	{
		this.destructObjects();

		if (this._camera) {
			this._camera.destruct();
		}

		this._camera = null;
	}

}
export default Scene;
