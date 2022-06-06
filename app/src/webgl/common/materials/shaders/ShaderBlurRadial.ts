import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 02/11/2016.
 */
class ShaderBlurRadial extends Shader
{
	constructor(renderer:Renderer)
	{
		super(renderer);

		var vProgram:string = `
		 precision highp float;
		 
		 attribute vec3 aPos;
		 attribute vec2 aUV;
		 
		 varying vec2 vUV;
		 
		 void main(void) {
			 gl_Position = vec4(aPos * 2.0, 1.0);
			 vUV = aUV;
		 }
		 `;

		var fProgram:string = `
		 precision highp float;
		 
		 #define SAMPLES 7
		 
		 uniform sampler2D _Texture1;
		 uniform vec2 _CoordMul;
         uniform float _Weight;
         uniform float _RadialWeight;
		 
		 varying vec2 vUV;
		 
		 void main(void) {
            vec2 coord = vUV;
            vec4 fragColor = texture2D(_Texture1, coord);
            vec4 sum = fragColor;
            
		    vec2 circle = vec2(vUV - 0.5) * 2.0;
            vec2 deltaTextCoord = circle * _CoordMul * _RadialWeight * 4.0;
            
			for(int i = 0; i < SAMPLES ; i++) {
                coord -= deltaTextCoord;
                sum += texture2D(_Texture1, coord);
            }
            
		    sum *= 1.0 / 7.0;
            fragColor = sum * _Weight;
            fragColor.a = _Weight;
            
            gl_FragColor = fragColor;
		 }
		 `;

		this.init("shader_blur_radial", vProgram, fProgram);
	}
}
export default ShaderBlurRadial;
