import Renderer from "../../../../../core/Renderer";
import Shader from "../../../../../core/Shader";

/**
 * Created by mdavids on 14/9/2018.
 */
class UIShaderPlaneSDF extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 
		 uniform vec3 uPivot;
		 uniform vec3 uPos;
		 uniform vec3 uScale;
		 uniform vec4 uRotation;
		 
		 out vec4 vNDCAtts;
		 out vec2 vUV;
		 
		 vec3 rotate(vec3 p, vec4 q) { 
       return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p);
     }
		 
		 void main(void) {
			 gl_Position = vec4(rotate((aPos - uPivot), uRotation) * uScale * 2.0 + uPos, 1.0);
			 
			 vec2 posAtOri = ((vec2(-0.5, -0.5) - uPivot.xy) * uScale.xy * 2.0 + uPos.xy) * 0.5 + 0.5;
			 vec2 posAtCorner = ((vec2(0.5, 0.5) - uPivot.xy) * uScale.xy * 2.0 + uPos.xy) * 0.5 + 0.5;
			 vNDCAtts = vec4(posAtOri.x, posAtOri.y, posAtCorner.x, posAtCorner.y);
			  
			 vUV = aUV;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
     uniform sampler2D uTexture1;
     uniform vec4 uFillColor;
     uniform vec4 uBorderColor;
     uniform vec4 uBorderColorHighlight;
     
     uniform vec4 uBorderSize;
     uniform float uDiagonal;
     
     uniform float uPreserveAlpha;
     uniform float uIndex;
     uniform vec2 uVSize;
		 
		 in vec4 vNDCAtts;
		 in vec2 vUV;
		 
		 layout(location=0) out vec4 fragColor;
		 
		 void main(void) {
		   vec2 st = gl_FragCoord.xy;
		   vec2 sPosOri = vNDCAtts.xy * uVSize - 0.5 / uVSize;
		   vec2 sPosCorner = vNDCAtts.zw * uVSize - 0.5 / uVSize;
		   
			 vec4 color = texture(uTexture1, vUV);
			 float feather = length(fwidth(vUV)) * 6.0;
			 float sdf = smoothstep(0.5 - feather, 0.5 + feather, color.r);
			 vec4 result = mix(uFillColor, uBorderColor, sdf);
			 
       // border
       vec2 bl = step(sPosOri + uBorderSize.xw, st);
       vec2 tr = vec2(1.0) - step(sPosCorner - uBorderSize.yz, st);
       float pct = bl.x * bl.y * tr.x * tr.y;
       
       float width = length(fwidth(vUV));
       vec2 diag = vec2(1.0) - fract(vUV);
       diag.y = 1.0 - diag.y;
       float diagDF = smoothstep(diag.x - width, diag.x, diag.y) - smoothstep(diag.x, diag.x + width, diag.y);
       pct -= clamp(diagDF, 0.0, 1.0) * uDiagonal;
       
       result = mix(result, uBorderColor, (1.0 - pct) * uBorderColor.a);
       result = mix(result, uBorderColorHighlight, (1.0 - bl.y) * uBorderColorHighlight.a);
			 
			 float alpha = mix(uIndex / 255.0, result.a, uPreserveAlpha);
			 fragColor = vec4(result.rgb, alpha);
		 }
		 `;

    this.init("ui_shader_plane_sdf",vProgram, fProgram);
  }
}
export default UIShaderPlaneSDF;
