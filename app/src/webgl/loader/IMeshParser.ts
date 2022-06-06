/**
 * Created by mdavids on 14/12/2016.
 */
interface IMeshParser {
  rawVertices:Float32Array;
  positions:Float32Array;
  uvs:Float32Array;
  normals:Float32Array;
  materialData:Float32Array;

  parse(text):void;
}
export default IMeshParser;
