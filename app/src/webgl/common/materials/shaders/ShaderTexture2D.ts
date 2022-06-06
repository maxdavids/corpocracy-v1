import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 01/05/2016.
 */
class ShaderTexture2D extends Shader
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
		 uniform mat4 uViewProjection;
		 
		 out vec2 vUV;
		 out vec3 vNormal;
		 
		 void main(void) {
			 gl_Position =  uViewProjection * uWorld * vec4(aPos, 1.0);
			 
			 vUV = aUV;
			 vNormal = normalize((uWorld * vec4(aNormal, 0.0)).xyz);
		 }
		 `;

        var fProgram:string = `#version 300 es
		 precision highp float;
		 
		 uniform sampler2D uTexture1;
     uniform vec4 uColor;
		 
		 in vec2 vUV;
		 in vec3 vNormal;
		 
     layout(location=0) out vec4 fragColor;
     layout(location=1) out vec4 outNormal;
		 
		 void main(void) {
			 vec4 color = texture(uTexture1, vUV) * uColor;
			 
			 vec3 N = normalize(vNormal);
			 
			 fragColor = color;
			 outNormal = vec4(N * 0.5 + 0.5, 0.0);
		 }
		 `;

        this.init("shader_texture",vProgram, fProgram);
    }
}
export default ShaderTexture2D;
