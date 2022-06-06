import Renderer from "../../../core/Renderer";
import Shader from "../../../core/Shader";

/**
 * Created by mdavids on 04/10/2016.
 */
class ShaderBlurGaussian extends Shader
{
	constructor(renderer:Renderer)
	{
		super(renderer);

		var vProgram:string = `
         precision mediump float;
         
         attribute vec3 aPos;
         attribute vec2 aUV;
         attribute vec3 aNormal;
         
         varying vec2 vUV;
         varying vec3 vNormal;
         
         void main(void) {
             gl_Position = vec4(aPos * 2.0, 1.0);
             vUV = aUV;
             vNormal = aNormal;
         }
         `;

		var fProgram:string = `
         precision mediump float;
         
         #define MSIZE 11
         #define KSIZE 5
         
         uniform sampler2D uTexture1;
         uniform vec2 _ScreenSize;
         
         uniform float _Kernel[MSIZE];
         uniform float _Z;
         
         varying vec2 vUV;
         
         void main(void) {
			vec4 color = texture2D(uTexture1, vUV);
			vec3 acc = vec3(0.0);
			
			for (int i = -KSIZE; i <= KSIZE; ++i) {
				for (int j = -KSIZE; j <= KSIZE; ++j) {
					acc += _Kernel[KSIZE + j] * _Kernel[KSIZE + i] * texture2D(uTexture1, (vUV + vec2(float(i), float(j)) / _ScreenSize)).rgb;
				}
			}
			
			gl_FragColor = vec4(acc/(_Z * _Z), color.a);
         }
         `;

		this.init("shader_blur_gaussian",vProgram, fProgram);
	}
}
export default ShaderBlurGaussian;
