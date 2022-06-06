import Renderer from "../../../../../core/Renderer";
import Shader from "../../../../../core/Shader";

/**
 * Created by mdavids on 27/01/2018.
 */
export default class UIShaderPostBlend extends Shader
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
       vec4 color = texture(uTexture1, vUV);
       vec4 ui = texture(uTexture2, vUV);
       vec3 result = color.rgb;
       
       // float uiWeight = step(0.0001, dot(ui.rgb, vec3(0.2126, 0.7152, 0.0722)));
       // result = mix(result, ui.rgb, uiWeight);
       result = mix(result, ui.rrr, ui.b);
       
       fragColor = vec4(result, ui.a);
		 }
		 `;

    this.init("ui_shader_post_blend", vProgram, fProgram);
  }
}

