import Mesh from "./Mesh";
import Renderer from "./Renderer";
/**
 * Created by mdavids on 22/11/2016.
 */
class MeshSphere extends Mesh
{
	constructor(renderer:Renderer, segments:number = 36, rings:number = 15) {
		super(renderer);

		var bufferSize:number = segments * rings;
		var vertexData: Float32Array = new Float32Array(bufferSize * 3);
		var uvData: Float32Array = new Float32Array(bufferSize * 2);
		var normalData: Float32Array = new Float32Array(bufferSize * 3);
		var indices: Uint16Array = new Uint16Array(bufferSize * 6);

		var R:number = 1 / (rings - 1);
		var S:number = 1 / (segments - 1);

		var PI2:number = Math.PI * 0.5;
		var radius:number = 1;
		var v:number = 0;

		for (let i:number = 0; i < rings; i++)
		{
			for (let j:number = 0; j < segments; j++)
			{
				var y:number = Math.sin(-PI2 + Math.PI * i * R);
				var x:number = Math.cos(2 * Math.PI * j * S) * Math.sin(Math.PI * i * R);
				var z:number = Math.sin(2 * Math.PI * j * S) * Math.sin(Math.PI * i * R);

				vertexData[v * 3] = x * radius;
				vertexData[v * 3 + 1] = y * radius;
				vertexData[v * 3 + 2] = z * radius;

				uvData[v * 2] = j * S;
				uvData[v * 2 + 1] = i * R;

				normalData[v * 3] = x;
				normalData[v * 3 + 1] = y;
				normalData[v * 3 + 2] = z;

				v++;
			}
		}

		v = 0;
		for (let i:number = 0; i < rings - 1; i++)
		{
			for (let j:number = 0; j < segments - 1; j++)
			{
				indices[v * 6] = i * segments + j;
				indices[v * 6 + 2] = i * segments + (j + 1);
				indices[v * 6 + 1] = (i + 1) * segments + (j + 1);

				indices[v * 6 + 3] = i * segments + j;
				indices[v * 6 + 5] = (i + 1) * segments + (j + 1);
				indices[v * 6 + 4] = (i + 1) * segments + j;
				v++;
			}
		}

		this.setVertexData(vertexData);
		this.setUVData(uvData);
		this.setNormals(normalData);
		this.setIndices(indices)
	}
}
export default MeshSphere;
