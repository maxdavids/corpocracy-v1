import Renderer from "../../../../core/Renderer";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 3/7/2017.
 */
class ShaderSectors extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
     in vec3 aNormal;
		 in float aMatData;
		 
		 in vec3 aIPos;
		 in vec3 aIScale;
		 in vec4 aIRotation;
		 
		 uniform mat4 uWorld;
		 uniform mat4 uViewProjection;
		 
		 out vec2 vUV;
		 out vec3 vWPos;
		 
		 flat out int vMatData;
		 
		 vec3 rotate(vec3 p, vec4 q) { 
       return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p);
     }
		 
		 void main(void) {
       vec3 pos = rotate(aPos * aIScale, aIRotation) + aIPos;
       vec3 normal = normalize(rotate(aNormal, aIRotation));
       
			 gl_Position = uViewProjection * vec4(pos, 1.0);
			 
			 vUV = aUV;
			 vWPos = pos;
			 
			 vMatData = int(aMatData);
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec2 vUV;
		 in vec3 vWPos;
		 
		 flat in int vMatData;
		 
		 out vec4 fragColor;
		 
		 void main(void) {
			 vec4 color = vec4(float(vMatData + 1) / 255.0, 0.0, 0.0, 1.0);
			 fragColor = color;
		 }
		 `;

    this.init("shader_sectors",vProgram, fProgram);
  }
}
export default ShaderSectors;
