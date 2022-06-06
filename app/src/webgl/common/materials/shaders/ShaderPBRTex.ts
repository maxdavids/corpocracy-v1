import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 11/4/2017.
 */
class ShaderPBRTex extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 in vec3 aNormal;
		 //in vec4 aTangent;
		 
		 uniform mat4 uWorld;
		 uniform mat4 uView;
		 uniform mat4 uViewProjection;
		 
		 uniform vec2 uUVScale;
		 
		 uniform vec3 uLightDir;
		 uniform vec3 uCamPos;
		 
		 out vec2 vUV;
		 out vec3 vT;
		 out vec3 vB;
		 out vec3 vN;
		 
		 out vec3 vI;
		 out vec3 vH;
		 out vec3 vL;
		 
		 out mat3 vTBN;
		 
		 out vec3 vWPos;
		 
		 void main(void) {
			 gl_Position = uViewProjection * uWorld * vec4(aPos, 1.0);
			 
			 vUV = aUV * uUVScale;
		   vN = normalize((uWorld * vec4(aNormal, 0.0)).xyz);
       //vT = normalize((uWorld * vec4(aTangent.xyz, 0.0)).xyz);
       //vB = normalize((uWorld * vec4(cross(aNormal, aTangent.xyz) * aTangent.w, 0.0)).xyz);
       
       vTBN = mat3(vT, vB, vN);
			 
			 vec3 worldVertex = (uWorld * vec4(aPos, 1.0)).xyz;
			 //vec3 lightPos = vec3(0.0, 8.0, 10.0);
			 
			 vI = normalize(uCamPos - worldVertex);
			 //vL = lightPos - worldVertex;
			 //vL = normalize(lightPos);
			 vL = normalize(uLightDir);
			 vH = normalize(vL + vI);
			 
			 vWPos = worldVertex;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
     #define PI 3.14159265359
     #define PI_2 6.28318530718
     #define PI_8 25.1327412287
     #define INV_PI 0.31830988618
		 
		 uniform sampler2D uTexture1;
		 uniform sampler2D uTexture2;
		 uniform sampler2D uTexture3;
		 uniform sampler2D uTexture4;
		 uniform sampler2D uTexture5;
		 
     uniform float uMetallic;
     uniform vec2 uTexelSize;
     
     uniform mat4 uWorld;
     uniform vec3 uLightColor;
     uniform vec3 uCamPos;
     
     uniform float uAmbientIntensity;
     uniform float uHumidity;
     uniform float uFogDensity;
     uniform float uFogColorMul;
   
     in vec2 vUV;
     in vec3 vT;
     in vec3 vB;
     in vec3 vN;
     
     in vec3 vI;
     in vec3 vH;
     in vec3 vL;
     
     in mat3 vTBN;
     
     in vec3 vWPos;
     
     out vec4 fragColor;
     
     vec2 envMapEquirect(vec3 wcNormal) {
       float phi = acos(-wcNormal.y); //negative 'cause webgl textures are flipped, (0,0) at the bottom left
       float theta = atan(wcNormal.x, wcNormal.z) + PI;
       return vec2(theta / PI_2, phi / PI);
     }
     
     vec3 envColor(vec3 wcNormal, float roughness) {
       vec2 uv = envMapEquirect(wcNormal);
       
       float i = roughness * 5.0;
       return pow(textureLod(uTexture1, uv, i).xyz, vec3(2.2)) * uAmbientIntensity;
     }
     
     vec3 fresnel(vec3 spec, vec3 L, vec3 H) {
        // schilck approx
        return spec + (1.0 - spec) * pow(1.0 - max(dot(L, H), 0.0), 5.0);
     }
     
     float distribution(float specPower, vec3 N, vec3 H) {
        // blinn-phong
        return ((specPower + 2.0) / PI_2) * pow(max(dot(N, H), 0.0), specPower);
     }
     
     float geometricAtt(float m, vec3 N, vec3 L, vec3 V) {
        // smith, schilck approx
        float k = m * 0.7978845608; //sqr(2.0/PI)
        float NdotL = max(dot(N, L), 0.0);
        float NdotV = max(dot(N, V), 0.0);
        return (NdotL / (NdotL * (1.0 - k) + k)) * (NdotV / (NdotV * (1.0 - k) + k)); 
     }
     
     
     
     
     mat3 cotangent_frame(vec3 N, vec3 p, vec2 uv)
     {
        /* get edge vectors of the pixel triangle */
        vec3 dp1 = dFdx( p );
        vec3 dp2 = dFdy( p );
        vec2 duv1 = dFdx( uv );
        vec2 duv2 = dFdy( uv );
        
        /* solve the linear system */
        vec3 dp2perp = cross( dp2, N );
        vec3 dp1perp = cross( N, dp1 );
        vec3 T = dp2perp * duv1.x + dp1perp * duv2.x;
        vec3 B = dp2perp * duv1.y + dp1perp * duv2.y;
        
        /* construct a scale-invariant frame */
        float invmax = inversesqrt( max( dot(T,T), dot(B,B) ) );
        return mat3( T * invmax, B * invmax, N );
     }
     
     
     
     
     void main(void) {
        vec3 I = normalize(vI);
        vec3 L = normalize(vL);
        vec3 H = normalize(vH);
        vec3 N = normalize(vN);
        
        
        
        
        vec3 fragNormal = texture(uTexture5, vUV).xyz;
        fragNormal = normalize(fragNormal * 2.0 - 1.0);
        
        //mat3 TBN = mat3(normalize(vT), normalize(vB), N);
        //N = TBN * normalize(fragNormal * 2.0 - 1.0);
        
        mat3 TBN = cotangent_frame(N, -I, vUV);
        N = normalize(TBN * fragNormal);
        
        
        
        
        vec3 R = normalize(reflect(-I, N));
        vec4 color = texture(uTexture1, envMapEquirect(R));
        
        vec4 albedoColor = pow(texture(uTexture3, vUV), vec4(2.2));
        vec4 attsColor = texture(uTexture4, vUV);
        
        float roughness = clamp(max(attsColor.r, 0.001) - uHumidity, 0.0, 1.0);  
        float ao = attsColor.g;
        
        vec3 F0 = mix(vec3(0.04), albedoColor.rgb, uMetallic);
        vec3 albedo = mix(albedoColor.rgb , vec3(0.0), uMetallic);
        
        float NdotL = max(dot(N, L), 0.0);
        float NdotI = max(dot(N, I), 0.0);
        
        //vec3 diffuse = albedo * NdotL * INV_PI;
        vec3 diffuse = albedo / PI;
        vec3 specular = vec3(0.0);
        
        float specPower = pow(2.0, 10.0 * (1.0 - roughness) + 1.0);
        //specular = (fresnel(F0, L, H) * distribution(specPower, N, H) * geometricAtt(roughness, N, L, I)) / (4.0 * NdotL * NdotI);
        specular = fresnel(F0, L, H) * distribution(specPower, N, H) * geometricAtt(roughness, N, L, I);
        
        vec3 totalR = uLightColor * NdotL * mix(diffuse, specular, fresnel(F0, L, H));
        //vec3 totalR = NdotL * diffuse * (1.0 - F0) + specular;
        //totalR = vec3(0.0);
        
        
        
        
        float NdotV = clamp(dot(N, I), 0.0, 1.0);
        //vec3 BRDF = pow(texture(uTexture2, vec2(NdotV, roughness)).xyz, vec3(2.2));
        vec3 BRDF = texture(uTexture2, vec2(NdotV, roughness)).xyz;
    
        //Diffuse Term
        vec3 diffTerm = albedo * envColor(R, 1.0); 
    
        //Specular Term
        vec3 Li = envColor(R, roughness);
        vec3 specTerm = Li * (F0 * BRDF.x + BRDF.y); 
    
        totalR += specTerm + diffTerm * ao;
        //totalR = mix(diffTerm, specTerm, fresnel(F0, L, H));
        //totalR = F0 * BRDF.x + BRDF.y;
        
        
        
        float fogDist = abs(length(uCamPos - vWPos));
        float fogWeight = 1.0 - clamp(1.0 / exp((fogDist * uFogDensity) * (fogDist * uFogDensity)), 0.0, 1.0);
        totalR = mix(totalR, envColor(-I, 0.2) * uFogColorMul, fogWeight);
        
        
        
        color.rgb = pow(totalR, vec3(1.0 / 2.2));
        fragColor = color;
     }
		 `;

    this.init("shader_pbr_tex",vProgram, fProgram);
  }
}
export default ShaderPBRTex;
