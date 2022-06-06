import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 22/2/2017.
 */
class ShaderEnvPreFilter extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `
		 precision highp float;
		 
		 attribute vec3 aPos;
		 attribute vec2 aUV;
		 attribute vec3 aNormal;
		 
     uniform vec2 uSize;
     uniform vec2 uOffset;
		 
		 varying vec2 vUV;
		 varying vec3 vNormal;
		 
		 void main(void) {
       gl_Position = vec4(aPos * 2.0, 1.0);
       vUV = aUV * uSize;
		 }
		 `;

    var fProgram:string = `
		 precision highp float;
		 
     #define SAMPLES 1024
     #define PI 3.14159265359
     #define PI_2 6.28318530718
		 
		 uniform sampler2D uTexture1;
		 
     uniform mat4 uInvViewProjection;
     uniform float uRoughness;
     
     uniform vec2 uSize;
     uniform vec2 uOffset;

     varying vec2 vUV;
     varying vec3 vNormal;
		 
     vec2 envMapEquirect(vec3 wcNormal) {
       float phi = acos(-wcNormal.y); //negative 'cause webgl textures are flipped, (0,0) at the bottom left
       float theta = atan(wcNormal.x, wcNormal.z) + PI;
       return vec2(theta / PI_2, phi / PI);
     }
     
     vec3 invEnvMapEquirect(vec2 uv) {
       //float y = -cos(uv.y * PI);
       //float x = cos(uv.x * PI_2 - PI * 0.5);
       //float z = sin(uv.x * PI_2 - PI * 0.5);
       
       float y = sin(-PI * 0.5 + PI * uv.y);
       float x = cos(-PI * 0.5 + 2.0 * PI * uv.x) * sin(PI * uv.y);
       float z = sin(-PI * 0.5 + 2.0 * PI * uv.x) * sin(PI * uv.y);
       
       return vec3(-x, y, z);
     }
     
     float random(vec3 scale, float seed) {
       return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
     }
     
     vec3 ImportanceSampleGGX( vec2 Xi, float roughness, vec3 N ) {
        float a = roughness * roughness;
    
        float Phi = 2.0 * PI * Xi.x;
    
        float CosTheta = sqrt( (1.0 - Xi.y) / ( 1.0 + (a * a - 1.0) * Xi.y ) );
        float SinTheta = sqrt( 1.0 - CosTheta * CosTheta );
    
        vec3 H;
        H.x = SinTheta * cos( Phi );
        H.y = SinTheta * sin( Phi );
        H.z = CosTheta;
    
        vec3 UpVector = abs(N.z) < 0.999999 ? vec3(0.0,0.0,1.0) : vec3(1.0,0.0,0.0);
        vec3 TangentX = normalize( cross( UpVector, N ) );
        vec3 TangentY = cross( N, TangentX );
    
        // Tangent to world space
        return TangentX * H.x + TangentY * H.y + N * H.z;
     }
      
     vec2 RandomSamples(float seed) {
       float u = random(vec3(12.9898, 78.233, 151.7182), seed);
       float v = random(vec3(63.7264, 10.873, 623.6736), seed);
       return vec2(u, v);
     }
     
     // Special fake Hammersley variant for WebGL and ESSL, since WebGL and ESSL do not support uint and bit operations
     vec2 Hammersley(const in int index, const in int numSamples){
       vec2 r = fract(vec2(float(index) * 5.3983, float(int(int(2147483647.0) - index)) * 5.4427));
       r += dot(r.yx, r.xy + vec2(21.5351, 14.3137));
       return fract(vec2(float(index) / float(numSamples), (r.x * r.y) * 95.4337));
     }
     
     vec3 PrefilterEnvMap(vec3 R, float roughness, vec3 V,vec3 N) {
       vec3 PrefilteredColor = vec3(0.0);
       float TotalWeight = 0.0;
       const int NumSamples = SAMPLES;
       vec3 dir;
       
       for(int i = 0; i < NumSamples; i++){
           vec2 Xi = Hammersley( i, NumSamples );
           vec3 H  = ImportanceSampleGGX( Xi, roughness, N );
           vec3 L  = 2.0 * dot( V, H ) * H - V;
           float NdotL = clamp( dot( N, L ), 0.0, 1.0 );
           if(NdotL > 0.0){
             PrefilteredColor += NdotL * pow(texture2D(uTexture1, envMapEquirect(L)).xyz, vec3(2.2));
             TotalWeight += NdotL;
           }
       }
       
       return PrefilteredColor / TotalWeight;
     }
     
     void main(void) {
       //float weight = mix(1.0, 0.0, step(uOffset.x + 1.0, vUV.x)) * mix(0.0, 1.0, step(uOffset.x, vUV.x));
       //weight *= mix(1.0, 0.0, step(uOffset.y + 1.0, vUV.y)) * mix(0.0, 1.0, step(uOffset.y, vUV.y));
       
       //if (weight < 1.0) discard;
     
       vec3 R = invEnvMapEquirect(vUV);
       //vec3 color = PrefilterEnvMap(R, uRoughness, R, R) * weight;
       vec3 color = PrefilterEnvMap(R, uRoughness, R, R);
       // gl_FragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.0);
       gl_FragColor = vec4(color, 1.0);
     }
		 `;

    this.init("shader_env_pre_filter", vProgram, fProgram);
  }
}
export default ShaderEnvPreFilter;
