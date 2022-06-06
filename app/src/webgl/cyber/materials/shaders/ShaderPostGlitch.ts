import Shader from "../../../core/Shader";
import Renderer from "../../../core/Renderer";
/**
 * Created by mdavids on 13/7/2017.
 */
class ShaderPostGlitch extends Shader
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
		 
     uniform float uTime;
		 
		 in vec2 vUV;
		 
		 out vec4 fragColor;
		 
     float blendOverlay(float base, float blend) {
       return base<0.5?(2.0*base*blend):(1.0-2.0*(1.0-base)*(1.0-blend));
     }
    
     vec3 blendOverlay(vec3 base, vec3 blend) {
       return vec3(blendOverlay(base.r,blend.r),blendOverlay(base.g,blend.g),blendOverlay(base.b,blend.b));
     }
    
     vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
       return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
     }
		 
    float blendColorDodge(float base, float blend) {
      return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
    }
    
    vec3 blendColorDodge(vec3 base, vec3 blend) {
      return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
    }
    
    vec3 blendColorDodge(vec3 base, vec3 blend, float opacity) {
      return (blendColorDodge(base, blend) * opacity + base * (1.0 - opacity));
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
     
     float blendSoftLight(float base, float blend) {
       return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
     }
    
     vec3 blendSoftLight(vec3 base, vec3 blend) {
       return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
     }
    
     vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
       return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
     }
     
     float noise(float x, float y, float seed, float phase) {
       float n = x * y * phase * seed;
       return mod(n, 13.0) * mod(n, 123.0);
     }
     
     vec4 glitch(vec2 uv, float time) {
       vec4 result = texture(uTexture1, uv);
       
       vec2 line_block = floor(uv * vec2(50.0, 200.0));
       vec2 uv_noise = line_block / vec2(64.0);
       uv_noise += floor(vec2(time) * vec2(1234.0, 3543.0)) / vec2(64.0);
       
       vec2 slot_block = floor(uv * vec2(6.0, 6.0));
       vec2 uv_block_noise = slot_block / vec2(64.0);
       uv_block_noise += floor(vec2(time) * vec2(1234.0, 3543.0)) / vec2(64.0);
       
       float block_thresh = pow(fract(time * 1236.0453), 2.0) * 0.6;
       float line_thresh = pow(fract(time * 2236.0453), 1.0) * 0.3;
       
       vec2 uv_r = uv, uv_g = uv, uv_b = uv;
      
       // glitch some blocks
       if (texture(uTexture2, uv_block_noise).r < block_thresh) {
         vec2 dist = fract(uv_block_noise) - 0.5;
         uv_r += dist * 0.1;
         uv_g += dist * 0.2;
         uv_b += dist * 0.125;
       }
       
       result.r = texture(uTexture1, uv_r).r;
       result.g = texture(uTexture1, uv_g).g;
       result.b = texture(uTexture1, uv_b).b;
       
       // discolor block lines
       if (texture(uTexture2, vec2(uv_noise.y, 0.0)).b < line_thresh) {
         float lineBlockY = line_block.y / 200.0;
         vec2 lineUV = vec2(uv.x + sin(uv_noise.y * noise(1.0, lineBlockY, 123.0, 1.0) * 6.28) * 0.1, lineBlockY);
         result.rgb = texture(uTexture1, lineUV).rgb * 1.5;
       }

       return result;
     }
     
		 void main(void) {
       vec4 color = glitch(vUV, uTime * 0.002);
       
       fragColor = color;
		 }
		 `;

    this.init("shader_post_glitch", vProgram, fProgram);
  }
}
export default ShaderPostGlitch;
