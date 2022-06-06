import Mesh from "./Mesh";
import Renderer from "./Renderer";
/**
 * Created by mdavids on 19/04/2016.
 */
class MeshCube extends Mesh
{
  constructor(renderer:Renderer) {
    super(renderer);

    var vertexData: Float32Array = new Float32Array([
      -0.5, -0.5,  0.5,
      0.5, -0.5,  0.5,
      0.5,  0.5,  0.5,
      -0.5,  0.5,  0.5,

      -0.5, -0.5,  -0.5,
      0.5, -0.5,  -0.5,
      0.5,  0.5,  -0.5,
      -0.5,  0.5,  -0.5,

      -0.5, -0.5,  -0.5,
      -0.5, -0.5,  0.5,
      -0.5,  0.5,  0.5,
      -0.5,  0.5,  -0.5,

      0.5, -0.5,  -0.5,
      0.5, -0.5,  0.5,
      0.5,  0.5,  0.5,
      0.5,  0.5,  -0.5,

      -0.5, 0.5,  0.5,
      0.5,  0.5,  0.5,
      0.5,  0.5,  -0.5,
      -0.5, 0.5,  -0.5,

      -0.5, -0.5,  0.5,
      0.5,  -0.5,  0.5,
      0.5,  -0.5,  -0.5,
      -0.5, -0.5,  -0.5
    ]);
    this.setVertexData(vertexData);

    var uvData: Float32Array = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1,

      1, 0,
      0, 0,
      0, 1,
      1, 1,

      0, 0,
      1, 0,
      1, 1,
      0, 1,

      1, 0,
      0, 0,
      0, 1,
      1, 1,

      0, 0,
      1, 0,
      1, 1,
      0, 1,

      0, 1,
      1, 1,
      1, 0,
      0, 0
    ]);
    this.setUVData(uvData);

    var normalData: Float32Array = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,

      0, 0, -1,
      0, 0, -1,
      0, 0, -1,
      0, 0, -1,

      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,
      -1, 0, 0,

      1, 0, 0,
      1, 0, 0,
      1, 0, 0,
      1, 0, 0,

      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,

      0, -1, 0,
      0, -1, 0,
      0, -1, 0,
      0, -1, 0
    ]);
    this.setNormals(normalData);

    var indices: Uint16Array = new Uint16Array([
      0, 1, 2,
      2, 3, 0,

      1+4, 0+4, 3+4,
      3+4, 2+4, 1+4,

      0+8, 1+8, 2+8,
      2+8, 3+8, 0+8,

      1+12, 0+12, 3+12,
      3+12, 2+12, 1+12,

      0+16, 1+16, 2+16,
      2+16, 3+16, 0+16,

      3+20, 2+20, 1+20,
      1+20, 0+20, 3+20
    ]);

    this.setIndices(indices);
  }
}
export default MeshCube;
