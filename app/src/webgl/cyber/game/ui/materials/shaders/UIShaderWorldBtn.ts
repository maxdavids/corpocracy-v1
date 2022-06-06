import Renderer from "../../../../../core/Renderer";
import Shader from "../../../../../core/Shader";

/**
 * Created by mdavids on 9/7/2018.
 */
class UIShaderWorldBtn extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 in vec3 aNormal;
		 in vec4 aTangent;
		 in float aMatData;
		 
     in vec3 aIPos;
		 in vec3 aIScale;
		 in vec4 aIRotation;
		 
     uniform mat4 uWorldViewProj;
		 uniform mat4 uView;
		 uniform mat4 uInvProjection;
		 uniform mat4 uViewProjection;
		 
		 uniform float uSectorOwnersIds[14];
		 
		 uniform vec3 uScale;
		 
		 out vec2 vUV;
		 flat out int vIndex;
		 
		 vec3 rotate(vec3 p, vec4 q) { 
       return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p);
     }
		 
		 void main(void) {
		   vec4 worldPosProj = uWorldViewProj * vec4(aIPos, 1.0);
		   vec4 uiPos = uView * uInvProjection * vec4(worldPosProj.xyz, 1.0);
		   
       vec3 pos = rotate(aPos * aIScale * uScale, aIRotation) + uiPos.xyz;
			 gl_Position = uViewProjection * vec4(pos, 1.0);
			 
			 // float ownerId = uSectorOwnersIds[gl_InstanceID];
			 // vUV = aUV * vec2(0.5, 1.0) + vec2(ownerId * (128.0 / 256.0), 0.0);
			 
			 vUV = aUV;
			 vIndex = gl_InstanceID;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
     uniform sampler2D uTexture1;
     uniform float uFlags[14];
		 
		 in vec2 vUV;
		 
		 flat in int vIndex;
		 
		 layout(location=0) out vec4 fragColor;
		 
		 void main(void) {
			 vec4 sdfTex = texture(uTexture1, vUV);
			 vec4 color = vec4(1.0);
			 float flag = uFlags[vIndex];
			 
			 // main icon
			 float feather = length(fwidth(vUV)) * 6.0;
			 float sdf = smoothstep(0.5 - feather, 0.5 + feather, sdfTex.r);
			 color.rgb = mix(vec3(0.0), vec3(1.0), sdf);
			 
			 // lock icon & battle icon
			 feather *= 2.0;
			 sdf = smoothstep(0.25 - feather, 0.25 + feather, sdfTex.a);
			 sdf = mix(0.0, sdf, step(0.0, flag));
			 sdf = mix(sdf, smoothstep(0.5 - feather, 0.5 + feather, sdfTex.g), step(1.0, flag));
			 sdf = mix(sdf, smoothstep(0.5 - feather, 0.5 + feather, sdfTex.b), step(2.0, flag));
			 color.r = mix(color.r, 0.0, sdf);
			 color.gb = mix(vec2(0.0), color.gb, step(0.0, flag));
			 
			 float eventIndex = mix(255.0, float(vIndex), step(0.0, flag));
			 fragColor = vec4(color.rgb, eventIndex / 255.0);
		 }
		 `;

    this.init("ui_shader_world_btn",vProgram, fProgram);
  }
}
export default UIShaderWorldBtn;
