import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 13/2/2017.
 */
class ShaderSkybox extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
         precision mediump float;
         
         in vec3 aPos;
         in vec2 aUV;
         in vec3 aNormal;
         
         uniform mat4 uInverseProj;
         uniform mat4 uView;
         
         uniform vec2 uAspect;
         
         out vec2 vUV;
         out vec3 vNormal;
         out vec3 vEyeDir;
         
         void main(void) {
             gl_Position = vec4(aPos * 2.0, 1.0);
             vUV = aUV;
             vNormal = aNormal;
             
             mat3 viewRotMat = mat3(uView);
             vec4 pos = uInverseProj * gl_Position;
             pos.xyz /= pos.w;
             
             vEyeDir = viewRotMat * pos.xyz;
         }
         `;

    var fProgram:string = `#version 300 es
         precision mediump float;
         
         #define PI 3.14159265359
         #define TWO_PI 6.28318530718
         
         uniform sampler2D uTexture1;
         
         uniform float uYaw;
         uniform vec4 uCamParams;
         
         in vec2 vUV;
         in vec3 vNormal;
         in vec3 vEyeDir;
         
         layout(location=0) out vec4 outAlbedo;
         layout(location=1) out vec4 outNormal;
         layout(location=2) out vec4 outPos;
         
         vec2 envMapEquirect(vec3 wcNormal) {
             float phi = acos(-wcNormal.y); //negative 'cause webgl textures are flipped, (0,0) at the bottom left
             float theta = atan(wcNormal.x, wcNormal.z) + PI + uYaw;
             return vec2(theta / TWO_PI, phi / PI);
         }
         
         vec3 envColor(vec3 wcNormal, float roughness) {
           vec2 uv = envMapEquirect(wcNormal);
           
           float i = roughness * 5.0;
           return textureLod(uTexture1, uv, i).xyz;
         }
        
         void main(void) {
             // fragColor = texture(uTexture1, envMapEquirect(normalize(vEyeDir)));
             // fragColor = vec4(pow(fragColor.rgb, vec3(2.2)), 1.0);
             
             vec3 eyeDir = normalize(vEyeDir);
             
             // outAlbedo = vec4(envColor(eyeDir, 0.6), 0.15);
             outAlbedo = vec4(envColor(eyeDir, 0.0), 0.15);
             outNormal = vec4(-eyeDir * 0.5 + 0.5, 0.0);
             outPos = vec4(eyeDir * uCamParams.y, 1.0);
         }
         `;

    this.init("shader_skybox",vProgram, fProgram);
  }
}
export default ShaderSkybox;
