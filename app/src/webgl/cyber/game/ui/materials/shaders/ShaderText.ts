import Renderer from "../../../../../core/Renderer";
import Shader from "../../../../../core/Shader";

/**
 * Created by mdavids on 3/7/2017.
 */
class ShaderText extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
         precision mediump float;
         
         in vec3 aPos;
         in vec2 aUV;
         in vec3 aColor;
         
         uniform vec3 uPivot;
         uniform vec3 uPos;
         uniform vec3 uScale;
         uniform vec4 uRotation;
         
         uniform vec2 uOffset;
         
         uniform vec2 uTexelSize;
         
         out vec2 vUV;
         out vec3 vColor;
         
         vec3 rotate(vec3 p, vec4 q) { 
            return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p);
         }
         
         void main(void) {
            gl_Position = vec4((rotate(aPos + vec3(uOffset, 0.0), uRotation) * uScale) * 2.0 + uPos, 1.0);
            
            vUV = aUV;
            vColor = aColor;
         }
         `;

    var fProgram:string = `#version 300 es
         precision mediump float;
         
         uniform sampler2D uTexture1;
         
         uniform vec4 uBackColor;
         uniform vec2 uMSDFUnit;
         uniform float uIndex;

         in vec2 vUV;
         in vec3 vColor;
         
         out vec4 fragColor;

         float median(float r, float g, float b) {
            return max(min(r, g), min(max(r, g), b));
         }

         void main() {
            vec3 msdf = texture(uTexture1, vUV).rgb;
            float sigDist = median(msdf.r, msdf.g, msdf.b) - 0.5;
            sigDist *= dot(uMSDFUnit, 0.5 / fwidth(vUV));
            float opacity = clamp(sigDist + 0.5, 0.0, 1.0);
            
            
            // ivec2 sz = textureSize(uTexture1, 0);
            // float dx = dFdx(vUV.x) * float(sz.x);
            // float dy = dFdy(vUV.y) * float(sz.y);
            // float toPixels = 8.0 * inversesqrt(dx * dx + dy * dy);
            // float sigDist = median(msdf.r, msdf.g, msdf.b) - 0.5;
            // float opacity = clamp(sigDist * toPixels + 0.5, 0.0, 1.0);
            
            
            vec3 color = mix(uBackColor.rgb, vColor, opacity);
            float alpha = uIndex / 255.0;
            
            fragColor = vec4(color, alpha);
            
            // fragColor = vec4(uColor.rgb * uColor.a * opacity, uColor.a * opacity);
            // fragColor = vec4(vColor * opacity, opacity);
            // fragColor = vec4(vColor * opacity, opacity);
         }
         `;

    this.init("shader_text",vProgram, fProgram);
  }
}
export default ShaderText;
