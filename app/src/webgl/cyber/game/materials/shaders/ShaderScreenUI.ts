import Renderer from "../../../../core/Renderer";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 28/01/2018.
 */
export default class ShaderScreenUI extends Shader
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
         
         void main(void) {
             vec2 texelSize = 1.0 / uVSize;
             vec2 fragCoord = vUV * uVSize;
             
             vec4 backColor = vec4(0.0, 0.0, 0.0, 1.0);
             vec4 frontColor = vec4(1.0, 1.0, 1.0, 1.0);
             // vec4 frontColor = vec4(0.125, 0.952, 1.0, 1.0);
             
             float frame = 30.0;
             
             float mulBack = 0.0;
             // mulBack += step(fragCoord.y, frame * 2.0);
             // mulBack += step(uVSize.y - fragCoord.y, frame * 3.0);
             // mulBack += step(fragCoord.x, frame);
             // mulBack += step(uVSize.x - fragCoord.x, frame);
             // mulBack = clamp(mulBack, 0.0, 1.0);
             
             
             float mulFront = 0.0;
             mulFront += step(abs(frame - fragCoord.y), 0.5);
             mulFront += step(abs((uVSize.y - frame * 2.0) - fragCoord.y), 0.5);
             
             
             // vec2 gridUV = vUV;
             // vec2 sizeUV = vec2(1.0, frame / uVSize.y * 0.5);
             // vec2 size = vec2(1.0 - sizeUV) * 0.5;
             //
             // gridUV.y -= 0.5 - sizeUV.y;
             //
             // vec2 bl = step(size, gridUV);
             // vec2 tr = step(size, 1.0 - gridUV);
             // float rect = bl.x * bl.y * tr.x * tr.y;
             // mulFront += rect;
             //
             //
             //
             // gridUV = vUV;
             // size = vec2(frame / uVSize.x, frame / uVSize.y * 2.0);
             // bl = step(size, gridUV);
             // tr = step(size, 1.0 - gridUV);
             // rect = bl.x * bl.y * tr.x * tr.y;
             //
             // bl = step(size + texelSize, gridUV);
             // tr = step(size + texelSize, 1.0 - gridUV);
             // rect *= 1.0 - (bl.x * bl.y * tr.x * tr.y); 
             // mulFront += rect;
             
             
             mulFront *= 1.0 - step(fragCoord.x, frame);
             mulFront *= 1.0 - step(uVSize.x - fragCoord.x, frame);
             mulFront = clamp(mulFront, 0.0, 1.0);
             
             vec4 result = mix(backColor, frontColor, mulFront * frontColor.a);
             result.a = clamp(mulBack * backColor.a + mulFront * frontColor.a, 0.0, 1.0);
             
             fragColor = vec4(result.rgb * result.a, result.a);
             // fragColor = vec4(vec3(uColor.rgb * mul * uColor.a), mul * uColor.a);
         }
         `;

    this.init("shader_screen_ui", vProgram, fProgram);
  }
}
