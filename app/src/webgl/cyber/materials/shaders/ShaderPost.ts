import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 28/4/2017.
 */
class ShaderPost extends Shader
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
		 uniform mediump sampler3D uTexture3;
		 uniform sampler2D uTextureNoise;
		 
		 uniform vec2 uTexelSize;
     uniform float uStrength;
     uniform float uClamp;
     uniform float uTime;
     uniform float uNoise;
		 
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
		 
     float blendOverlay(float base, float blend) {
       return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
     }
    
     vec3 blendOverlay(vec3 base, vec3 blend) {
       return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
     }
    
     vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
       return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
     }
     
     float blendSoftLight(float base, float blend) {
       return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
     }
    
     vec3 blendSoftLight(vec3 base, vec3 blend) {
       return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
     }
    
     vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
       return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
     }
     
     float blendLighten(float base, float blend) {
       return max(blend,base);
     }
    
     vec3 blendLighten(vec3 base, vec3 blend) {
       return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
     }
    
     vec3 blendLighten(vec3 base, vec3 blend, float opacity) {
       return (blendLighten(base, blend) * opacity + base * (1.0 - opacity));
     }
     
     vec2 aberration(vec2 uv, float k) {
       float r2 = pow(uv.x - 0.5, 2.0) + pow(uv.y - 0.5, 2.0);
       float f = 1.0 + r2 * k;
       return vec2(f * (uv - 0.5) + 0.5);
     }
          
     float noise(float x, float y, float seed, float phase) {
       float n = x * y * phase * seed;
       return mod(n, 13.0) * mod(n, 123.0);
     }
     
		 void main(void) {
       vec4 color = texture(uTexture1, vUV);
       
       // aberration
       // float red = texture(uTexture1, vUV + uTexelSize).r;
       // float green = texture(uTexture1, vUV).g;
       // float blue = texture(uTexture1, vUV - uTexelSize).b;
       //
       // color.rgb = mix(color.rgb, vec3(red, green, blue), 0.75);
       
       // sharpening
       vec4 sharpBlur = texture(uTexture1, vUV + vec2(0.5 * uTexelSize.x, -uTexelSize.y));
       sharpBlur += texture(uTexture1, vUV + vec2(-uTexelSize.x, 0.5 * -uTexelSize.y));
       sharpBlur += texture(uTexture1, vUV + vec2(uTexelSize.x, 0.5 * uTexelSize.y));
       sharpBlur += texture(uTexture1, vUV + vec2(0.5 * -uTexelSize.x, uTexelSize.y));
       sharpBlur /= 4.0;

       vec4 lumaStrength = vec4(0.2126, 0.7152, 0.0722, 0.0) * uStrength * 0.7;
       vec4 sharp = color - sharpBlur;
       color += clamp(dot(sharp, lumaStrength), -uClamp, uClamp);
       
       // noise
       float n = noise(vUV.x, vUV.y, 1234.0, uTime);
       float dx = mod(n, 0.01);
       vec3 result = color.rgb + color.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);
       result = color.rgb + uNoise * (result - color.rgb);
       
       // color correction
       // scale = 15.0 / 16.0, offset = 0.5 / 16.0
       result = texture(uTexture3, 0.9375 * clamp(result.rgb, 0.0, 1.0) + 0.03125).rgb;
       
       // vignette
       float vignette = smoothstep(0.8, 0.23 * 0.799, distance(vUV, vec2(0.5)) * (0.842 + 0.23));
       result = blendSoftLight(result, vec3(0.0), 1.0 - clamp(vignette, 0.0, 1.0));
       
       fragColor = vec4(result, 1.0);
		 }
		 `;

    this.init("shader_post", vProgram, fProgram);
  }
}
export default ShaderPost;
