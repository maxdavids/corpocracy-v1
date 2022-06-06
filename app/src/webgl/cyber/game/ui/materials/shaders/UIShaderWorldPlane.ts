import Renderer from "../../../../../core/Renderer";
import Shader from "../../../../../core/Shader";

/**
 * Created by mdavids on 2/7/2018.
 */
class UIShaderWorldPlane extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 
     uniform mat4 uWorld;
		 uniform mat4 uViewProjection;
		 
		 uniform float uIndex;
		 
		 out vec2 vUV;
		 
		 void main(void) {
			 gl_Position = uViewProjection * uWorld * vec4(aPos, 1.0);
			 
			 float zeroIndex = uIndex;
			 vUV = aUV + vec2(floor(zeroIndex / 7.0) * (512.0 / 1024.0), mod(zeroIndex, 7.0) * (-140.0 / 1024.0));
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
     uniform sampler2D uTexture1;
     
     uniform float uIndex;
		 
		 in vec2 vUV;
		 
		 layout(location=0) out vec4 fragColor;
		 
		 void main(void) {
			 vec4 color = texture(uTexture1, vUV);
			 fragColor = vec4(color.rgb, 1.0);
		 }
		 `;

    this.init("ui_shader_world_plane",vProgram, fProgram);
  }
}
export default UIShaderWorldPlane;
