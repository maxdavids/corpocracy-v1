import Renderer from './Renderer';
import Texture2D from "./Texture2D";

/**
 * Created by mdavids on 01/02/2017.
 */

class TextureVideo extends Texture2D {

	constructor(renderer:Renderer, registerIndex:number, mips:boolean = false, filterLinear:boolean = true, wrapClamp:boolean = true) {
		super(renderer, registerIndex, mips, filterLinear, wrapClamp, false);
	}

	public setImage(image:any, flipY:boolean = true)
	{
		//if (this.isDestructed) return;

		var gl:WebGLRenderingContext = this.renderer.context;
		this.bind();

		if(flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

		this.width = image.width;
		this.height = image.height;
		this.aspect = this.width / this.height;

		if (image.readyState === image.HAVE_ENOUGH_DATA) {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

		} else {
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}

		if (this.useMips) {
			this.generateMips();
		}

		if(flipY)gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

		this.image = image;
	}

	public updateImage(flipY:boolean = true):void
	{
		var gl:WebGLRenderingContext = this.renderer.context;

		this.bind();
		if(flipY) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
	}

	destruct()
	{
		super.destruct();
	}
}
export default TextureVideo;
