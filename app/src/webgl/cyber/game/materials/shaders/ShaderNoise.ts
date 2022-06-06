import Renderer from "../../../../core/Renderer";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 3/7/2017.
 */
class ShaderNoise extends Shader
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
         
         uniform vec4 uColor;
         uniform float uTime;
         uniform float uAspect;
         uniform vec2 uVSize;
         
         in vec2 vUV;
         
         out vec4 fragColor;
         
         vec4 hash42(vec2 p) {
            vec4 p4 = fract(vec4(p.xyxy) * vec4(443.8975, 397.2973, 491.1871, 470.7827));
            p4 += dot(p4.wzxy, p4 + 19.19);
            
            return fract(vec4(p4.x * p4.y, p4.x * p4.z, p4.y * p4.w, p4.x * p4.w));
         }

         float hash(float n) {
            return fract(sin(n) * 43758.5453123);
         }

         float n(in vec3 x) {
            vec3 p = floor(x);
            vec3 f = fract(x);
            
            f = f * f * (3.0 - 2.0 * f);
            
            float n = p.x + p.y * 57.0 + 113.0 * p.z;
            float res = mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                                mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                            mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                                mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
            return res;
         }

         float nn(vec2 p, float t, float threshold) {
            float y = p.y;
            float s = t;
            
            float v = (n(vec3(y * 0.01 + s,           1.0, 1.0)))
                     *(n(vec3(y * 0.011 + 1000.0 + s, 1.0, 1.0))) 
                     *(n(vec3(y * 0.51 + 421.0 + s,   1.0, 1.0)));
                     
            v *= hash42(vec2(p.x + t * 0.01, p.y)).x;
            v = step(threshold, v);
            
            return v;
         }
     
         void main(void) {
             // float linesY = uVSize.y * 0.75;
             float linesY = 540.0;
             vec2 uv = floor(vUV * vec2(linesY * uAspect, linesY));
        
             // float tMul = 8.0 * uHeight / 1080.0;
             float tMul = 8.0;
             float mul = clamp(nn(uv, -uTime * tMul, 0.2) + nn(uv, uTime * tMul * 0.1, 0.3) * 0.5, 0.0, 1.0);
             fragColor = uColor * mul;
         }
         `;

    this.init("shader_noise",vProgram, fProgram);
  }
}
export default ShaderNoise;
