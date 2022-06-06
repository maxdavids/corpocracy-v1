import Mesh from "./Mesh";
import Renderer from "./Renderer";
/**
 * Created by mdavids on 19/04/2016.
 */
class MeshQuad extends Mesh
{
  constructor(renderer:Renderer) {
    super(renderer);

    var vertexData: Float32Array = new Float32Array([
      -0.5, -0.5,  0.0,
      0.5, -0.5,  0.0,
      0.5,  0.5,  0.0,
      -0.5,  0.5,  0.0,
    ]);
    this.setVertexData(vertexData);

    var uvData: Float32Array = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1
    ]);
    this.setUVData(uvData);

    var normalData: Float32Array = new Float32Array([
      0, 0, 1,
      0, 0, 1,
      0, 0, 1,
      0, 0, 1
    ]);
    this.setNormals(normalData);

    var indices: Uint16Array = new Uint16Array([
      // front
      0, 1, 2,
      2, 3, 0
    ]);

    this.setIndices(indices)
  }
}
export default MeshQuad;
