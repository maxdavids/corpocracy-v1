
import Shader from "../../../../core/Shader";
import Renderer from "../../../../core/Renderer";

/**
 * Created by mdavids on 13/7/2017.
 */
class ShaderColorOpaque extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 in vec3 aNormal;
		 
		 uniform mat4 uWorld;
		 uniform mat4 uInvWorld;
		 uniform mat4 uViewProjection;
		 
		 uniform vec3 uLightDir;
		 uniform vec3 uCamPos;
		 
		 uniform vec2 uUVScale;
		 
		 out vec2 vUV;
		 out vec3 vI;
		 out vec3 vL;
		 out vec3 vNormal;
		 out vec3 vWPos;
		 
		 void main(void) {
			 gl_Position =  uViewProjection * uWorld * vec4(aPos, 1.0);
			 
			 vUV = aUV;
			 vNormal = normalize((uWorld * vec4(aNormal, 0.0)).xyz);

			 vWPos = (uWorld * vec4(aPos, 1.0)).xyz;
			 vI = uCamPos - vWPos;
			 vL = normalize(uLightDir);
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
		 
		 uniform float uMetallic;
		 uniform float uRoughness;
     uniform vec4 uColor;
     uniform vec3 uLightColor;
     uniform float uLightSpecularity;
     uniform float uFogDensity;
     uniform float uFogMul;
     uniform float uAmbientIntensity;
     uniform mat4 uWorld;
     
     uniform float uSkyYaw;
     
     uniform vec3 uCamPos;
     uniform vec2 uTexelSize;
   
     in vec2 vUV;
     in vec3 vI;
     in vec3 vL;
     in vec3 vNormal;
     in vec3 vWPos;
		 in vec3 vTangent;
     
     layout(location=0) out vec4 fragColor;
     layout(location=1) out vec4 outNormal;
     
     vec2 envMapEquirect(vec3 wcNormal) {
       float phi = acos(-wcNormal.y); //negative 'cause webgl textures are flipped, (0,0) at the bottom left
       float theta = atan(wcNormal.x, wcNormal.z) + PI + uSkyYaw;
       return vec2(theta / PI_2, phi / PI);
     }
     
     vec3 envColor(vec3 wcNormal, float roughness) {
       vec2 uv = envMapEquirect(wcNormal);
       
       float i = roughness * 5.0;
       return pow(textureLod(uTexture1, uv, i).xyz, vec3(2.2));
     }
     
     vec3 fresnel(vec3 f0, float f90, float u) {
       return f0 + (f90 - f0) * pow(1.0 - u, 5.0);
     }
     
     float distribution(float m, float NdotH) {
       float m2 = m * m;
       float f = (NdotH * m2 - NdotH) * NdotH + 1.0;
       return m2 / (f * f);
     }
     
     float geometricAtt(float alphaG, float NdotV, float NdotL) {
       float alphaG2 = alphaG * alphaG;
        
       float Lambda_GGXV = NdotL * sqrt((-NdotV * alphaG2 + NdotV) * NdotV + alphaG2);
       float Lambda_GGXL = NdotV * sqrt((-NdotL * alphaG2 + NdotL) * NdotL + alphaG2);
       return 0.5 / (( Lambda_GGXV + Lambda_GGXL + 1e-5f ));
     }
     
     float disneyDiffuse(float NdotV , float NdotL , float LdotH , float linearRoughness, float Fd90) {
       float energyFactor = mix(1.0, 1.0 / 1.51, linearRoughness);
       vec3 f0 = vec3(1.0, 1.0, 1.0);
       float lightScatter = fresnel(f0, Fd90 , NdotL).r;
       float viewScatter = fresnel(f0, Fd90 , NdotV).r;
      
       return lightScatter * viewScatter * energyFactor;
     }
     
     vec3 directBRDF(vec3 F0, vec3 albedo, vec3 lightColor, float specularity, float NdotV, float NdotL, float NdotH, float LdotH, float linearRoughness) {
        float energyBias = linearRoughness * 0.5;
        float Fd90 = energyBias + 2.0 * LdotH * LdotH * linearRoughness;
        float F90 = clamp(50.0 * dot(F0 , vec3(0.33)), 0.0, 1.0);
        
        float sqRoughness = linearRoughness * linearRoughness;
        
        vec3 diffTerm = albedo * disneyDiffuse(NdotV, NdotL, LdotH, linearRoughness, Fd90) / PI;
        vec3 specTerm = specularity * fresnel(F0, F90, LdotH) * distribution(sqRoughness, NdotH) * geometricAtt(sqRoughness, NdotV, NdotL) / PI;
        
        return NdotL * lightColor * (diffTerm + specTerm);
     }
     
     vec3 splitBRDF(vec3 F0, vec3 albedo, vec3 R, float NdotV, float linearRoughness, float ambientIntensity, float specWeight) {
        float sqRoughness = linearRoughness * linearRoughness;
        
        vec3 BRDF = texture(uTexture2, vec2(NdotV, sqRoughness)).xyz;
        vec3 Li = envColor(R, sqRoughness) * ambientIntensity;
        
        vec3 diffTerm = albedo * envColor(R, 1.0) * ambientIntensity; 
        vec3 specTerm = Li * (F0 * BRDF.x + BRDF.y); 
    
        return diffTerm + specTerm * specWeight;
     }
     
     void main(void) {
        vec3 I = normalize(vI);
        vec3 L = normalize(vL);
        vec3 H = normalize(L + I);
        vec3 N = normalize(vNormal);
        
        vec4 colorAlbedo = uColor;
        
        vec3 R = normalize(reflect(-I, N));
        vec4 color = texture(uTexture1, envMapEquirect(R));
        
        vec3 F0 = mix(vec3(0.04), colorAlbedo.rgb, uMetallic);
        vec3 albedo = mix(colorAlbedo.rgb, vec3(0.0), uMetallic);
        
        float NdotL = clamp(dot(N, L), 0.0, 1.0);
        float NdotV = abs(dot(N, I)) + 1e-5f;
        float LdotH = clamp(dot(L, H), 0.0, 1.0);
        float VdotH = clamp(dot(I, H), 0.0, 1.0);
        float NdotH = clamp(dot(N, H), 0.0, 1.0);
        
        float roughness = uRoughness;
        
        vec3 totalR = directBRDF(F0, albedo, uLightColor, uLightSpecularity, NdotV, NdotL, NdotH, LdotH, roughness);
        totalR += splitBRDF(F0, albedo, R, NdotV, roughness, uAmbientIntensity, uLightSpecularity);
        
        
        float fogDist = abs(length(uCamPos - vWPos));
        float fogWeight = 1.0 - clamp(1.0 / exp(fogDist * uFogDensity * fogDist * uFogDensity), 0.0, 1.0);
        totalR = mix(totalR, envColor(-I, 0.0) * uFogMul, fogWeight);
        
        
        // color.rgb = pow(totalR, vec3(1.0 / 2.2));
        // fragColor = vec4(color.rgb, 1.0);
        fragColor = vec4(pow(totalR, vec3(1.0 / 2.2)), 1.0);
        
        outNormal = vec4(N * 0.5 + 0.5, 0.0);
     }
		 `;

    this.init("shader_color_opaque",vProgram, fProgram);
  }
}
export default ShaderColorOpaque;
