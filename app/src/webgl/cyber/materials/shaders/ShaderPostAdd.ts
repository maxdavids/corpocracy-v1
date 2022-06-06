import Shader from "../../../core/Shader";
import Renderer from "../../../core/Renderer";

/**
 * Created by mdavids on 13/7/2017.
 */
class ShaderPostAdd extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision mediump float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 
		 out vec2 vUV;
		 
		 void main(void) {
			 gl_Position = vec4(aPos * 2.0, 1.0);
			 vUV = aUV;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision mediump float;
		 
		 uniform sampler2D uTexture1;
		 uniform sampler2D uTexture2;
		 
		 in vec2 vUV;
		 
		 out vec4 fragColor;
		 
		 void main(void) {
       vec4 color1 = texture(uTexture1, vUV);
       vec4 color2 = texture(uTexture2, vUV);
       
       fragColor = vec4(color1.rgb + color2.rgb, 1.0);
		 }
		 `;

    this.init("shader_post_add", vProgram, fProgram);
  }
}
export default ShaderPostAdd;
