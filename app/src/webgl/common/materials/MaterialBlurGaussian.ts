import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Texture2D from "../../core/Texture2D";
import Vector2 from "../../core/Vector2";
import ShaderBlurGaussian from "./shaders/ShaderBlurGaussian";
import ITexture from "../../core/ITexture";

/**
 * Created by mdavids on 04/10/2016.
 */
class MaterialBlurGaussian extends Material{
	protected texSize:Vector2 = new Vector2();

	protected _kernel:Float32Array;
  protected _MSize:number = 11.0;
	protected _KSize:number = 0.0;
	protected _Z:number = 0.0;

	constructor(renderer:Renderer) {
		super(renderer, "material_blur_gaussian");

		this.shader = new ShaderBlurGaussian(renderer);
		this.resetBlending();

		this._depthWrite = false;
		this._depthTest = false;

		this.createKernel();
	}

	public setTexture(texture:ITexture):void
	{
		super.setTexture(texture);

		this.texSize.x = this._texture.width;
		this.texSize.y = this._texture.height;
	}

	private normpdf(x:number, sigma:number):number
	{
		return 0.39894 * Math.exp(-0.5 * x *x / (sigma * sigma)) / sigma;
	}

	private createKernel():void
	{
		this._KSize = Math.floor((this._MSize - 1) / 2);

		var sigma:number = 7.0;
		this._Z = 0.0;

		this._kernel = new Float32Array(this._MSize);

		for (let j:number = 0; j <= this._KSize; ++j) {
			this._kernel[this._KSize + j] = this._kernel[this._KSize - j] = this.normpdf(j, sigma);
		}

		//normalization factor
		for (let j:number = 0; j < this._MSize; ++j) {
			this._Z += this._kernel[j];
		}
	}

	public setUniforms(camera:Camera, renderable:Renderable):void
	{
		super.setUniforms(camera, renderable);

		this.setVector2("_ScreenSize", this.texSize);
		this.setFloat("_Z", this._Z);
		this.setFloat32Array("_Kernel", this._kernel);
	}

	destruct()
	{
		super.destruct();
	}

}
export default MaterialBlurGaussian;
