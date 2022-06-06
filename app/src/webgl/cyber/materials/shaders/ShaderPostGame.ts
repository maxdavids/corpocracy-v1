import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 27/01/2018.
 */
export default class ShaderPostGame extends Shader
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
		 uniform mediump sampler3D uTextureLut;
		 uniform sampler2D uTextureNoise;
		 uniform sampler2D uTextureBlur;
		 
		 uniform vec2 uTexelSize;
		 uniform float uAspect;
     uniform float uTime;
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
		 
     float blendSoftLight(float base, float blend) {
       return (blend<0.5)?(2.0*base*blend+base*base*(1.0-2.0*blend)):(sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend));
     }
    
     vec3 blendSoftLight(vec3 base, vec3 blend) {
       return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
     }
    
     vec3 blendSoftLight(vec3 base, vec3 blend, float opacity) {
       return (blendSoftLight(base, blend) * opacity + base * (1.0 - opacity));
     }
     
     vec2 aberration(vec2 uv, float k, float m) {
       float r2 = pow(uv.x - 0.5, 2.0) + pow(uv.y - 0.5, 2.0);
       float f = 1.0 + clamp(r2 * k, -m, m);
       return vec2(f * (uv - 0.5) + 0.5);
     }
     
     float noise(float x, float y, float seed, float phase) {
       float n = x * y * phase * seed;
       return mod(n, 13.0) * mod(n, 123.0);
     }
     
		 void main(void) {
       vec4 color = texture(uTexture1, vUV);
       vec4 blur = texture(uTextureBlur, vUV);
       
       vec3 result = color.rgb;
       
       // glow
       result = blendScreen(result, blur.rgb, 0.4);
       
       // aberration
       // float red = texture(uTexture1, aberration(vUV, -0.1, 0.002)).r;
       // float green = texture(uTexture1, vUV).g;
       // float blue = texture(uTexture1, aberration(vUV, 0.1, 0.002)).b;
       // result = mix(result.rgb, vec3(red, green, blue), 0.75);
       
       
       
       vec2 coord = vUV * 2.0 - 1.0;
       float cellSize = 6.0 * 0.5;
       float circleSize = 6.0 * 1.0;
       vec2 cell = vec2(floor(coord.x * cellSize * uAspect) + 0.5, floor(coord.y * cellSize) + 0.5);

       float dist = clamp(length(cell * vec2(0.55, 1.0) - vec2(0.0, -1.0)) / circleSize, 0.0, 1.0);
       float cellWeight = step(0.1, 1.0 - dist);

       // float phase = abs(floor(uCellSeed + 1.0)) / 3.14;
       float phase = abs(floor(0.437 + 1.0)) / 3.14;
       float n = noise(cell.x, cell.y, 4321.0, phase);
       float dx = mod(n, 0.01) * 100.0;

       // result = result * mix(1.0, dx * 0.5 + 0.5, step(0.7, dist));
       // result = result * cellWeight * mix(1.0, dx * 0.5 + 0.5, step(0.7, dist));
       result = result * cellWeight * mix(1.0, step(0.5, dx) * (1.0 - dist) * 0.5 + 0.5, step(0.7, dist));
       // result = result * cellWeight;

       result = result * (1.0 - step(8.0 * 1.0, abs(cell.x)));
       result = result * (1.0 - step(3.0 * 1.0, abs(cell.y)));
       
       
       
       // to gamma
       // result = pow(result, vec3(1.0 / 2.2));
       
       // vignette
       // float vignette = smoothstep(0.8, 0.23 * 0.799, distance(vUV, vec2(0.5)) * (0.842 + 0.23));
       // float vignette = smoothstep(0.8, 0.23 * 0.799, distance(vUV, vec2(0.5)) * (1.0 + 0.23));
       float vignette = smoothstep(0.8, 0.23 * 0.799, distance(vUV, vec2(0.5)) * (0.4 + 0.23));
       result = blendSoftLight(result, vec3(0.0), 1.0 - clamp(vignette, 0.0, 1.0));
       
       // color correction
       // scale = 15.0 / 16.0, offset = 0.5 / 16.0
       result = texture(uTextureLut, 0.9375 * clamp(result.rgb, 0.0, 1.0) + 0.03125).rgb;
       
       fragColor = vec4(result, 1.0);
		 }
		 `;

    this.init("shader_post_game", vProgram, fProgram);
  }
}

