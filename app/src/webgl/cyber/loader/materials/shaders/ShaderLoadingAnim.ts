import Renderer from "../../../../core/Renderer";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 16/7/2017.
 */
class ShaderLoadingAnim extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision mediump float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 
		 uniform mat4 uWorld;
		 uniform mat4 uViewProjection;
		 
		 out vec2 vUV;
		 
		 void main(void) {
			 gl_Position =  uViewProjection * uWorld * vec4(aPos, 1.0);
			 vUV = aUV;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision mediump float;
		 
		 uniform vec4 uColor;
     uniform float uTime;
		 
		 in vec2 vUV;
		 
		 out vec4 fragColor;
		 
     float circle(vec2 uv, float radius, float feather) {
        vec2 dist = uv - vec2(0.5);
        return 1.0 - smoothstep(radius - (radius * feather), radius + (radius * feather), dot(dist, dist) * 4.0);
     }
     
		 void main(void) {
       float shape = 0.0;
       float time = fract(uTime);
       
       shape += circle(vUV + vec2(0.25, 0.0), 0.03, 0.15) * smoothstep(0.0, 0.4, time);
       shape += circle(vUV + vec2(0.0, 0.0), 0.03, 0.15) * smoothstep(0.3, 0.7, time);
       shape += circle(vUV + vec2(-0.25, 0.0), 0.03, 0.15) * smoothstep(0.6, 1.0, time);
       
       fragColor = vec4(uColor.rgb * shape, 1.0);
		 }
		 `;

    this.init("shader_loading_anim", vProgram, fProgram);
  }
}
export default ShaderLoadingAnim;
