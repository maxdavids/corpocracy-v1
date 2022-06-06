import Renderer from "../../../../core/Renderer";
import Shader from "../../../../core/Shader";

/**
 * Created by mdavids on 3/7/2017.
 */
export default class ShaderDroneUI extends Shader
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
             
             // vec4 frontColor = vec4(1.0, 1.0, 1.0, 1.0);
             // vec4 frontColor = vec4(0.125, 0.952, 1.0, 1.0);
             vec4 frontColor = vec4(0.45, 0.415, 0.388, 0.2);
             // vec4 frontColor = vec4(0.45, 0.0, 0.0, 1.0);
             
             float mulFront = 0.0;
             
             mulFront += step(abs(floor(uVSize.x * 0.33) - fragCoord.x), 0.5);
             mulFront += step(abs(floor(uVSize.x * 0.66) - fragCoord.x), 0.5);
             mulFront += step(abs(floor(uVSize.y * 0.5) - fragCoord.y), 0.5);
             
             vec2 gridUV = vUV * vec2(uAspect, 1.0);
             gridUV.x -= 0.5 * uAspect - 0.5;
             
             vec2 size = vec2(0.3);
             vec2 bl = step(size, gridUV);
             vec2 tr = step(size, 1.0 - gridUV);
             float rect = bl.x * bl.y * tr.x * tr.y;
             
             bl = step(size + vec2(texelSize.y), gridUV);
             tr = step(size + vec2(texelSize.y), 1.0 - gridUV);
             rect *= 1.0 - (bl.x * bl.y * tr.x * tr.y);
             mulFront += rect;
             
             mulFront = clamp(mulFront, 0.0, 1.0);
             fragColor = vec4(vec3(frontColor.rgb * mulFront * frontColor.a), mulFront * frontColor.a);
         }
         `;

    this.init("shader_drone_ui", vProgram, fProgram);
  }
}
