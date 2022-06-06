import Shader from "../../../../core/Shader";
import Renderer from "../../../../core/Renderer";

/**
 * Created by mdavids on 13/7/2017.
 */
class ShaderHoloBlend extends Shader
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
		 uniform mediump sampler3D uTextureLut;
		 
     uniform vec2 uTexelSize;
		 uniform float uAspect;
		 uniform float uCellSeed;
		 
		 in vec2 vUV;
		 
		 out vec4 fragColor;
		 
     float blendScreen(float base, float blend) {
       return 1.0-((1.0-base)*(1.0-blend));
     }
    
     vec3 blendScreen(vec3 base, vec3 blend) {
       return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
     }
    
     vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
       return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
     }
     
     float noise(float x, float y, float seed, float phase) {
       float n = x * y * phase * seed;
       return mod(n, 13.0) * mod(n, 123.0);
     }
		 
		 void main(void) {
       vec4 color1 = texture(uTexture1, vUV);
       vec4 color2 = texture(uTexture2, vUV);
       
       vec3 result = vec3(0.0);
       
       // color aberration
       // float red = texture(uTexture2, vUV - uTexelSize).r;
       float red = color2.r;
       float green = color2.g;
       float blue = texture(uTexture2, vUV + uTexelSize).b;
       // color2.rgb = vec3(red, green, blue);
       
       // sharpening
       vec4 sharpBlur = texture(uTexture2, vUV + vec2(0.5 * uTexelSize.x, -uTexelSize.y));
       sharpBlur += texture(uTexture2, vUV + vec2(-uTexelSize.x, 0.5 * -uTexelSize.y));
       sharpBlur += texture(uTexture2, vUV + vec2(uTexelSize.x, 0.5 * uTexelSize.y));
       sharpBlur += texture(uTexture2, vUV + vec2(0.5 * -uTexelSize.x, uTexelSize.y));
       sharpBlur /= 4.0;

       vec4 lumaStrength = vec4(0.2126, 0.7152, 0.0722, 0.0) * 0.35 * 0.7;
       vec4 sharp = color2 - sharpBlur;
       color2 += clamp(dot(sharp, lumaStrength), -0.5, 0.5);
       
       // noise
       float n = noise(vUV.x, vUV.y, 1234.0, 1.0);
       float dx = mod(n, 0.01);
       vec3 noised = color2.rgb + color2.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);
       result = color2.rgb + 1.0 * (noised - color2.rgb);
       
       // color correction
       // scale = 15.0 / 16.0, offset = 0.5 / 16.0
       result = texture(uTextureLut, 0.9375 * clamp(result.rgb, 0.0, 1.0) + 0.03125).rgb;
       
       
       
       vec2 coord = vUV * 2.0 - 1.0;
       float cellSize = 12.0 * 0.5;
       float circleSize = 6.0 * 2.0;
       vec2 cell = vec2(floor(coord.x * cellSize * uAspect) + 0.5, floor(coord.y * cellSize) + 0.5);

       float dist = clamp(length(cell * vec2(0.75, 1.0) - vec2(0.0, 1.0)) / circleSize, 0.0, 1.0);
       float cellWeight = step(0.1, 1.0 - dist);

       // float phase = abs(floor(uCellSeed * 10.0) / 10.0) / 3.14;
       float phase = abs(floor(1.118 * 10.0) / 10.0) / 3.14;
       // float phase = 0.3126;
       n = noise(cell.x, cell.y, 1234.0, phase);
       dx = smoothstep(0.2, 0.5, mod(n, 0.01) * 100.0);

       result = result * cellWeight * mix(1.0, dx, step(0.8, dist));
       // result = result * cellWeight;
       
       
       
       // blending
       // result = blendScreen(color1.rgb, result, 0.8);
       result = blendScreen(color1.rgb, result, 1.3);
       
       fragColor = vec4(result, 1.0);
		 }
		 `;

    this.init("shader_holo_blend", vProgram, fProgram);
  }
}
export default ShaderHoloBlend;
