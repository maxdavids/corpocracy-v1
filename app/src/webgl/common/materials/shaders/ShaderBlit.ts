import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 01/05/2016.
 */
class ShaderBlit extends Shader
{
	constructor(renderer:Renderer)
	{
		super(renderer);

		var vProgram:string = `#version 300 es
         precision mediump float;
         
         in vec3 aPos;
         in vec2 aUV;
         in vec3 aNormal;
         
         out vec2 vUV;
         out vec3 vNormal;
         
         void main(void) {
             gl_Position = vec4(aPos * 2.0, 1.0);
             vUV = aUV;
             vNormal = aNormal;
         }
         `;

		var fProgram:string = `#version 300 es
         precision mediump float;
         
         uniform sampler2D uTexture1;
         
         in vec2 vUV;
         
         out vec4 fragColor;
         
         void main(void) {
             fragColor = texture(uTexture1, vUV);
         }
         `;

		this.init("shader_blit",vProgram, fProgram);
	}
}
export default ShaderBlit;
