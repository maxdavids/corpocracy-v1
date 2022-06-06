import Material from "../../core/Material";
import Renderer from "../../core/Renderer";
import Camera from "../../core/Camera";
import Renderable from "../../core/Renderable";
import ShaderTexture2D from "./shaders/ShaderTexture2D";
import Vector4 from "../../core/Vector4";
import Shader from "../../core/Shader";

/**
 * Created by mdavids on 29/04/2016.
 */
class MaterialTexture2D extends Material {
	public color:Vector4 = new Vector4(1, 1, 1, 1);

	constructor(renderer:Renderer, shader:Shader = null) {
		super(renderer, "material_texture_2d");

		this.shader = shader? shader : new ShaderTexture2D(renderer);
		this.setAlphaBlending();

		this._depthWrite = false;
		this._depthTest = false;
	}

	public setUniforms(camera:Camera, renderable:Renderable):void
	{
		super.setUniforms(camera, renderable);

		this.setMatrix("uWorld", renderable.getTransform().getMatrix());
		this.setMatrix("uViewProjection", camera.getViewProjection());

		this.setVector4('uColor', this.color);
	}

	destruct()
	{
		super.destruct();
	}

}
export default MaterialTexture2D;
