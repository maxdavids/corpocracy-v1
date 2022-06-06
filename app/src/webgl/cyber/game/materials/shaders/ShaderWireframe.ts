import Renderer from "../../../../core/Renderer";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 3/7/2017.
 */
class ShaderWireframe extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
     in vec3 aNormal;
		 // in vec3 aBC;
		 in float aMatData;
		 
		 in vec3 aIPos;
		 in vec3 aIScale;
		 in vec4 aIRotation;
		 
		 uniform mat4 uWorld;
		 uniform mat4 uViewProjection;
		 uniform mat4 uSectorsViewProj;
		 
		 out vec2 vUV;
		 out vec3 vNormal;
		 out vec2 vSectorsUV;
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
			 vNormal = normalize(normal);
			 vWPos = pos;
			 
			 vMatData = int(aMatData);
			 
			 vec4 sectorsPos = uSectorsViewProj * vec4(pos, 1.0);
			 vSectorsUV = sectorsPos.xy * 0.5 + 0.5;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec2 vUV;
		 in vec3 vNormal;
		 in vec2 vSectorsUV;
		 in vec3 vWPos;
		 
		 flat in int vMatData;
		 
		 uniform sampler2D uTexture1;
		 
		 uniform float uSectorOwnersIds[14];
		 
		 out vec4 fragColor;
		 
		 void main(void) {
		   vec3 N = normalize(vNormal);
		   
       vec4 colorSectors = texture(uTexture1, vSectorsUV);
       float index = floor(colorSectors.r * 255.0);
       float indexZero = clamp(index - 1.0, 0.0, 13.0);
       float ownerId = uSectorOwnersIds[int(indexZero)];
       
       vec3 color1 = vec3(0.04);
       vec3 color2 = vec3(0.06);
       
			 float weight = smoothstep(0.35, 0.36, fract(vWPos.y * 4.0)); 
			 vec3 color = color1 * clamp(vWPos.y, 0.0, 1.0) + color2 * (1.0 - weight) * (1.0 - step(0.9, N.y)) + color2 * step(0.9, N.y);
			 
			 // vec3 tint = mix(vec3(1.0, 0.4, 0.4), vec3(0.4, 0.6, 1.0), ownerId);
			 vec3 tint = mix(vec3(1.0, 0.4, 0.4), vec3(0.2, 0.8, 0.7), ownerId);
			 tint = mix(vec3(0.4), tint, step(0.1, index));
			 
			 color *= tint * (1.0 - smoothstep(40.0, 70.0, length(vWPos.xz)));
			 
			 fragColor = vec4(color, 1.0);
		 }
		 `;

    this.init("shader_wireframe",vProgram, fProgram);
  }
}
export default ShaderWireframe;
