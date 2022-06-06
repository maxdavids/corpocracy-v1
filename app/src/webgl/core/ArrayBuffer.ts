import Renderer from "./Renderer";
import Shader from "./Shader";

/**
 * Created by mdavids on 26/04/2017.
 */
class ArrayBuffer {
  public data:Float32Array;
  public buffer:WebGLBuffer;
  public elementSize:number;

  public name:string;

  private _attribute:string;
  private _size:number = 0;
  private _divisor:number = 0;

  private _renderer:Renderer;

  constructor(renderer:Renderer, data:Float32Array, attribute:string, size:number, divisor:number = 0)
  {
    this.name = attribute;

    this._renderer = renderer;
    this._attribute = attribute;
    this._size = size;
    this._divisor = divisor;

    var gl:WebGL2RenderingContext = this._renderer.context;
    this.buffer = gl.createBuffer();
    this.setData(data);
  }

  public setData(data: Float32Array)
  {
    this.data = data;
    if(data.length == 0){
      throw ("ArrayBuffer: No data");
    }
    var gl: WebGL2RenderingContext = this._renderer.context;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data.byteLength, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);

    this.elementSize = data.BYTES_PER_ELEMENT;
  }

  public getBufferLength():number
  {
    var gl: WebGL2RenderingContext = this._renderer.context;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    return gl.getBufferParameter(gl.ARRAY_BUFFER, gl.BUFFER_SIZE) / 4;
  }

  public enableFor(shader:Shader):void
  {
    if (shader.attributes[this._attribute] != undefined) {
      let gl: WebGL2RenderingContext = this._renderer.context;
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

      let aLoc:number = shader.attributes[this._attribute];
      gl.enableVertexAttribArray(aLoc);
      gl.vertexAttribPointer(aLoc, this._size, gl.FLOAT, false, this._size * this.elementSize, 0);
      gl.vertexAttribDivisor(aLoc, this._divisor);
    }
  }

  destruct()
  {
    var gl:WebGL2RenderingContext = this._renderer.context;
    gl.deleteBuffer(this.buffer);

    this.buffer = null;
    this.data = null;

    this._renderer = null;
  }
}

export default ArrayBuffer;
