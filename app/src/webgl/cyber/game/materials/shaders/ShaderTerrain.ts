
import Shader from "../../../../core/Shader";
import Renderer from "../../../../core/Renderer";
/**
 * Created by mdavids on 13/7/2017.
 */
class ShaderTerrain extends Shader
{
  constructor(renderer:Renderer)
  {
    super(renderer);

    var vProgram:string = `#version 300 es
		 precision highp float;
		 
		 in vec3 aPos;
		 in vec2 aUV;
		 in vec3 aNormal;
		 in vec4 aTangent;
		 in float aMatData;
		 
		 in vec3 aIPos;
		 in vec3 aIScale;
		 in vec4 aIRotation;
		 
		 uniform mat4 uViewProjection;
		 
		 uniform vec3 uCamPos;
		 
		 out vec2 vUV;
		 out vec3 vNormal;
		 out vec3 vWPos;
		 out vec3 vTangentViewDir;
		 
		 out vec3 vTangent;
		 out vec3 vBitangent;
		 
		 flat out int vMatData;
		 
		 vec3 rotate(vec3 p, vec4 q) { 
       return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p);
     }
		 
		 void main(void) {
       vec3 pos = rotate(aPos * aIScale, aIRotation) + aIPos;
       vec3 normal = normalize(rotate(aNormal, aIRotation));
       
			 gl_Position = uViewProjection * vec4(pos, 1.0);
			 
			 vUV = aUV;
			 vWPos = pos;
			 vNormal = normalize(normal);
			 vMatData = int(aMatData);
			 
       // get tangent space camera vector
       vec3 objCam = uCamPos;
       vec3 viewDir = pos.xyz - objCam.xyz;
       vec3 tangent = normalize(rotate(aTangent.xyz, aIRotation));
       vec3 bitangent = cross(normal.xyz, tangent.xyz) * aTangent.w * 1.0;
       vTangentViewDir = vec3(
          dot(viewDir, tangent.xyz),
          dot(viewDir, bitangent),
          dot(viewDir, normal)
       );
       
       vTangent = tangent;
       vBitangent = bitangent;
		 }
		 `;

    var fProgram:string = `#version 300 es
		 precision highp float;
		 
     #define PI 3.14159265359
     #define PI_2 6.28318530718
		 
		 uniform mediump sampler2DArray uTexFacade;
		 uniform sampler2D uTexIrradiance;
		 uniform sampler2D uTexBRDF;
		 
     uniform vec3 uLightDir;
     uniform vec3 uLightColor;
     uniform float uFogDensity;
     uniform float uFogMul;
     uniform float uAmbientIntensity;
     uniform float uSkyYaw;
     
     uniform vec3 uCamPos;
   
     in vec2 vUV;
     in vec3 vNormal;
     in vec3 vWPos;
     in vec3 vTangentViewDir;
     
     in vec3 vTangent;
		 in vec3 vBitangent;
     
     flat in int vMatData;
     
     layout(location=0) out vec4 fragColor;
     
     vec2 envMapEquirect(vec3 wcNormal) {
       float phi = acos(-wcNormal.y); //negative 'cause webgl textures are flipped, (0,0) at the bottom left
       float theta = atan(wcNormal.x, wcNormal.z) + PI + uSkyYaw;
       return vec2(theta / PI_2, phi / PI);
     }
     
     vec3 envColor(vec3 wcNormal, float roughness) {
       vec2 uv = envMapEquirect(wcNormal);
       
       float i = roughness * 5.0;
       return textureLod(uTexIrradiance, uv, i).xyz;
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
     
     vec3 directBRDF(vec3 F0, vec3 albedo, vec3 lightColor, float NdotV, float NdotL, float NdotH, float LdotH, float linearRoughness) {
        float energyBias = linearRoughness * 0.5;
        float Fd90 = energyBias + 2.0 * LdotH * LdotH * linearRoughness;
        float F90 = clamp(50.0 * dot(F0 , vec3(0.33)), 0.0, 1.0);
        
        float sqRoughness = linearRoughness * linearRoughness;
        
        vec3 diffTerm = albedo * disneyDiffuse(NdotV, NdotL, LdotH, linearRoughness, Fd90) / PI;
        vec3 specTerm = fresnel(F0, F90, LdotH) * distribution(sqRoughness, NdotH) * geometricAtt(sqRoughness, NdotV, NdotL) / PI;
        
        return NdotL * lightColor * (diffTerm + specTerm);
     }
     
     vec3 splitBRDF(vec3 F0, vec3 albedo, vec3 R, float NdotV, float linearRoughness, float ambientIntensity) {
        float sqRoughness = linearRoughness * linearRoughness;
        vec3 BRDF = texture(uTexBRDF, vec2(NdotV, sqRoughness)).xyz;
        vec3 Li = envColor(R, sqRoughness) * ambientIntensity;
        
        vec3 diffTerm = albedo * envColor(R, 1.0) * ambientIntensity; 
        vec3 specTerm = Li * (F0 * BRDF.x + BRDF.y);
    
        return diffTerm + specTerm;
     }
     
     void main(void) {
        vec3 N = normalize(vNormal);
			  vec3 I = normalize(uCamPos - vWPos);
			  vec3 L = normalize(uLightDir);
        vec3 H = normalize(L + I);
        vec3 R = normalize(reflect(-I, N));
        
        float NdotL = clamp(dot(N, L), 0.0, 1.0);
        float NdotV = abs(dot(N, I)) + 1e-5f;
        float LdotH = clamp(dot(L, H), 0.0, 1.0);
        float VdotH = clamp(dot(I, H), 0.0, 1.0);
        float NdotH = clamp(dot(N, H), 0.0, 1.0);
        
        vec2 uv = vWPos.xz;
        vec4 color = texture(uTexFacade, vec3(uv.x, uv.y, vMatData));
        vec4 colorAlbedo = vec4(color.r);
        vec4 colorAtts = vec4(0.0, color.g, color.b, 1.0);
        
        float metallic = colorAtts.r;
        float roughness = colorAtts.g;
        float emissive = colorAtts.b * step(0.9, N.y);
        
        vec3 F0 = mix(vec3(0.04), colorAlbedo.rgb, metallic);
        vec3 albedo = mix(colorAlbedo.rgb, vec3(0.0), metallic);
        
        vec3 totalR = directBRDF(F0, albedo, uLightColor, NdotV, NdotL, NdotH, LdotH, roughness);
        totalR += splitBRDF(F0, albedo, R, NdotV, roughness, uAmbientIntensity);
        
        totalR += colorAlbedo.rgb * emissive;
        totalR *= 1.0 - smoothstep(35.0, 70.0, length(vWPos.xz));
        totalR *= 0.8;
        
        fragColor = vec4(totalR, 1.0);
     }
		 `;

    this.init("shader_terrain",vProgram, fProgram);
  }
}
export default ShaderTerrain;
