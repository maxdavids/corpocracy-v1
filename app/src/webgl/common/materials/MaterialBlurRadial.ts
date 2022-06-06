import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import Texture2D from "../../core/Texture2D";
import Vector2 from "../../core/Vector2";
import ShaderBlurRadial from "./shaders/ShaderBlurRadial";
import ITexture from "../../core/ITexture";

/**
 * Created by mdavids on 02/11/2016.
 */
class MaterialBlurRadial extends Material{
	public weight:number = 0;
	public radialWeight:number = 1;

	protected texSize:Vector2 = new Vector2();
	protected coordMul:Vector2 = new Vector2();

	constructor(renderer:Renderer) {
		super(renderer, "material_blur_radial");

		this.shader = new ShaderBlurRadial(renderer);
		//this.resetBlending();
		this.setPreAlphaBlending();

		this._depthWrite = false;
		this._depthTest = false;
	}

	public setTexture(texture:ITexture):void
	{
		super.setTexture(texture);

		this.texSize.x = this._texture.width;
		this.texSize.y = this._texture.height;

		this.coordMul.y = 1.0 / this.texSize.y;
		this.coordMul.x = 1.0 / this.texSize.x * (this.texSize.x / this.texSize.y);
	}

	public setUniforms(camera:Camera, renderable:Renderable):void
	{
		super.setUniforms(camera, renderable);

		//this.setVector2("_ScreenSize", this.texSize);
		this.setVector2("_CoordMul", this.coordMul);
		this.setFloat("_Weight", this.weight);
		this.setFloat("_RadialWeight", this.radialWeight);
	}

	destruct()
	{
		super.destruct();
	}

}
export default MaterialBlurRadial;
