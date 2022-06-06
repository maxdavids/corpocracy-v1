import Renderer from "./Renderer";
//import Destructible from "../../../temple/core/Destructible";

/**
 * Created by mdavids on 19/04/2016.
 */
class Shader /*extends Destructible*/{

  public uniforms:{};
  public attributes:{};

  public _program: WebGLProgram;
  protected _name: string;
  protected _renderer:Renderer;
  protected _vsText:string;
  protected _fsText:string;

  public constructor(renderer:Renderer)
  {
    //super();
    this._renderer = renderer;
  }

  public init (name:string, vsText:string, fsText:string) {
    this._name = name;

    this._vsText = vsText;
    this._fsText = fsText;

    this.compile();
  }

  public compile():void
  {
    var vsText:string = this._vsText;
    var fsText:string = this._fsText;

    var gl = this._renderer.context;
    var vs:WebGLShader = this.compileShader(gl, vsText, gl.VERTEX_SHADER);
    var fs:WebGLShader = this.compileShader(gl, fsText, gl.FRAGMENT_SHADER);

    this._program = this.LinkProgram(gl, vs, fs);

    this.getAttributes();
    this.getUniforms();
  }

  public getProgram():WebGLProgram {
    return this._program;
  }

  public setActive() {
    this._renderer.setProgram(this._program);
  }

  private compileShader(gl:WebGLRenderingContext, src:string, type:number):WebGLShader {
    //console.log("Shader::compileShader")
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      return shader;
    } else {
      throw new Error('CompileShader: error: ' + this._name + '\n' +
          gl.getShaderInfoLog(shader));
    }
  }

  private LinkProgram(gl:WebGLRenderingContext, vs:WebGLShader, fs:WebGLShader):WebGLProgram {
    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
      return program;
    } else {
      throw new Error('Program link error: ' + this._name + '\n' +
        gl.getProgramInfoLog(program));
    }
  }

  private getUniforms():void {
    var gl = this._renderer.context;
    var activeUniforms = gl.getProgramParameter(this._program, gl.ACTIVE_UNIFORMS);

    this.uniforms = {};

    for (var i=0; i < activeUniforms; i++) {
      var uniform:WebGLActiveInfo = gl.getActiveUniform(this._program, i);

      var loc:WebGLUniformLocation = gl.getUniformLocation(this._program, uniform.name);
      this.uniforms[uniform.name] = loc;
    }
  }

  private getAttributes():void{
    var gl = this._renderer.context;
    var activeAttributes = gl.getProgramParameter(this._program, gl.ACTIVE_ATTRIBUTES);

    this.attributes = {};

    for (var i=0; i < activeAttributes; i++) {
      var attribute:WebGLActiveInfo = gl.getActiveAttrib(this._program, i);
      var loc:number = gl.getAttribLocation(this._program, attribute.name);
      this.attributes[attribute.name] = loc;
    }
  }

  destruct()
  {
    this._program = null;
    this._renderer = null;

    //super.destruct();
  }

}

export default Shader;
