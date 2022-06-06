import Shader from "../../../core/Shader";
import Renderer from "../../../core/Renderer";
/**
 * Created by mdavids on 13/7/2017.
 */
class ShaderPostBlendUI extends Shader
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
		 
     float noise(float x, float y, float seed, float phase) {
       float n = x * y * phase * seed;
       return mod(n, 13.0) * mod(n, 123.0);
     }
     
     vec4 glitch(sampler2D tex, vec2 uv, float time) {
       vec4 result = texture(tex, uv);
       vec4 temp = result;
       
       vec2 line_block = floor(uv * vec2(50.0, 50.0));
       vec2 uv_noise = line_block / vec2(64.0);
       uv_noise += floor(vec2(time) * vec2(1234.0, 3543.0)) / vec2(64.0);
       
       vec2 slot_block = floor(uv * vec2(50.0, 50.0));
       vec2 uv_block_noise = slot_block / vec2(64.0);
       uv_block_noise += floor(vec2(time) * vec2(1234.0, 3543.0)) / vec2(64.0);
       
       float block_thresh = pow(fract(time * 1236.0453), 2.0) * 0.6;
       float line_thresh = pow(fract(time * 2236.0453), 1.0) * 0.93;
       
       float weight = 0.0;
       // vec2 uv_r = uv, uv_g = uv, uv_b = uv;
        
       // glitch some blocks
       // vec2 dist = fract(uv_block_noise) - 0.5;
       // uv_r += dist * 0.1;
       // uv_g += dist * 0.2;
       // uv_b += dist * 0.125;
       //
       // temp.r = texture(tex, uv_r).r;
       // temp.g = texture(tex, uv_g).g;
       // temp.b = texture(tex, uv_b).b;
       //
       // weight = step(block_thresh, fract(noise(uv_block_noise.x, uv_block_noise.y, 321.0, 1.0)));
       // result = mix(temp, result, weight);
       
       // discolor block lines
       float lineBlockY = line_block.y / 50.0;
       vec2 lineUV = vec2(uv.x + sin(uv_noise.y * noise(1.0, lineBlockY, 123.0, 1.0) * 6.28) * 0.01, lineBlockY);
       temp.rgb = texture(tex, lineUV).rgb * 0.5;
       
       weight = step(line_thresh, fract(noise(1.0, lineBlockY, 123.0, 1.0)));
       result = mix(temp, result, weight);

       return result;
     }
		 
		 void main(void) {
       vec4 color1 = texture(uTexture1, vUV);
       vec4 color2 = texture(uTexture2, vUV);
       
       // vec4 glitch = glitch(uTexture2, vUV, uTime * 0.002);
       vec4 glitch = glitch(uTexture2, vUV, 0.05);
       color2 = mix(glitch, color2, step(0.1, uTime));
       
       float weight = color2.x + color2.y + color2.z;
       vec4 result = mix(color1, color2, step(0.001, weight));
       
       fragColor = result;
		 }
		 `;

    this.init("shader_post_blend_ui", vProgram, fProgram);
  }
}
export default ShaderPostBlendUI;
