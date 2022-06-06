import Mesh from "../core/Mesh";
import Renderer from "../core/Renderer";
import ObjParser from './ObjParser';
import Material from "../core/Material";
import Camera from "../core/Camera";
import Renderable from "../core/Renderable";
import Utils from "../Utils";
import IAsset from "./IAsset";
import Vector3 from "../core/Vector3";
import Vector2 from "../core/Vector2";
import IMeshParser from "./IMeshParser";
import FBXParser from "./FBXParser";

/**
 * Created by mdavids
 */
class MeshLoader extends Mesh implements IAsset {
	private _url:string;
	private _name:string;

	private _scaleToFitMaxSize:number[];
	private _scaleToFit:boolean;

	private _isPointCloud:boolean = false;

	private _isLoaded:boolean = false;

	constructor(renderer:Renderer, name:string, url:string, isPointCloud:boolean = false) {
		super(renderer);
		this._name = name;
		this._url = url;

		this._scaleToFitMaxSize = [0, 0, 0];
		this._scaleToFit = false;

		this._isPointCloud = isPointCloud;
	}

	public getName():string
	{
		return this._name;
	}

	public getIsLoaded():boolean
	{
		return this._isLoaded;
	}

	public cancel():void
	{

	}

	public load(callback:(asset:IAsset)=>void, errorCallback:(asset:IAsset)=>void):void
	{
    var extension:string = this._url.substr(this._url.lastIndexOf(".") + 1);
    if (extension === "fbx") {
      Utils.loadBinary(this._url, (arrayBuffer:ArrayBuffer)=> {
        // console.log(this._url);

        var obj:IMeshParser = new FBXParser();
        obj.parse(arrayBuffer);

        this._isLoaded = true;

        this.setOBJ(obj);
        callback(this);
      });

    } else {
      Utils.loadText(this._url, (text:string)=> {
        // console.log(this._url);

        var obj:IMeshParser = new ObjParser();
        obj.parse(text);

        this._isLoaded = true;

        this.setOBJ(obj);
        callback(this);
      });
    }
	}

	private setOBJ(obj:IMeshParser):void {
		if (!this._isPointCloud) {
			this.setVertexData(obj.positions);
			if (obj.uvs.length > 0)this.setUVData(obj.uvs);
			if (obj.normals.length > 0)this.setNormals(obj.normals);
			// this.calculateNormals(obj.positions);
      if (obj.uvs.length > 0 && obj.normals.length > 0) this.getTangentSpace(obj.positions, obj.uvs, obj.normals);
      if (obj.materialData.length) this.addArrayBuffer(obj.materialData, "aMatData", 1);

		} else {
			this.setVertexData(obj.rawVertices);
		}
	}

	public draw(camera:Camera, material:Material, renderable:Renderable) {
		if (!this._isLoaded) return;

		super.draw(camera, material, renderable);
	}

	private calculateNormals(vertices:Float32Array):void
  {
    var tmpNormals:number[] = [];
    var normals:Float32Array;

    var vertexCount:number = vertices.length / 3;
    var triangleCount:number = vertexCount / 3;

    var normalX:number = 0;
    var normalY:number = 0;
    var normalZ:number = 0;

    for (let i = 0; i < triangleCount; i++) {
      let offset:number = i * 3 * 3;
      let v1:Vector3 = new Vector3(vertices[offset + 0], vertices[offset + 1], vertices[offset + 2]);
      let v2:Vector3 = new Vector3(vertices[offset + 3], vertices[offset + 4], vertices[offset + 5]);
      let v3:Vector3 = new Vector3(vertices[offset + 6], vertices[offset + 7], vertices[offset + 8]);

      let u:Vector3 = Vector3.subtract(v2, v1);
      let v:Vector3 = Vector3.subtract(v3, v1);

      normalX = u.y * v.z - u.z * v.y;
      normalY = u.z * v.x - u.x * v.z;
      normalZ = u.x * v.y - u.y * v.x;

      tmpNormals.push(
        normalX, normalY, normalZ,
        normalX, normalY, normalZ,
        normalX, normalY, normalZ
      );
    }

    normals = new Float32Array(tmpNormals);
    this.setNormals(normals);
  }

  private getTangentSpace(vertices:Float32Array, uvs:Float32Array, normals:Float32Array):void
  {
    var vertexCount:number = vertices.length / 3;
    var triangleCount:number = vertexCount / 3;

    var tan1:Vector3[] = [];
    for (let i = 0; i < vertexCount; i++)tan1[i] = new Vector3();

    var tan2:Vector3[] = [];
    for (let i = 0; i < vertexCount; i++)tan2[i] = new Vector3();

    for (let i = 0; i < triangleCount; i++) {
      let offset:number = i * 3 * 3;
      let v1:Vector3 = new Vector3(vertices[offset + 0], vertices[offset + 1], vertices[offset + 2]);
      let v2:Vector3 = new Vector3(vertices[offset + 3], vertices[offset + 4], vertices[offset + 5]);
      let v3:Vector3 = new Vector3(vertices[offset + 6], vertices[offset + 7], vertices[offset + 8]);

      offset = i * 3 * 2;
      let w1:Vector2 = new Vector2(uvs[offset + 0], uvs[offset + 1]);
      let w2:Vector2 = new Vector2(uvs[offset + 2], uvs[offset + 3]);
      let w3:Vector2 = new Vector2(uvs[offset + 4], uvs[offset + 5]);

      let x1 = v2.x - v1.x;
      let x2 = v3.x - v1.x;
      let y1 = v2.y - v1.y;
      let y2 = v3.y - v1.y;
      let z1 = v2.z - v1.z;
      let z2 = v3.z - v1.z;

      let s1 = w2.x - w1.x;
      let s2 = w3.x - w1.x;
      let t1 = w2.y - w1.y;
      let t2 = w3.y - w1.y;

      let r = 1.0 / (s1 * t2 - s2 * t1);
      let sdir:Vector3 = new Vector3((t2 * x1 - t1 * x2) * r, (t2 * y1 - t1 * y2) * r, (t2 * z1 - t1 * z2) * r);
      let tdir:Vector3 = new Vector3((s1 * x2 - s2 * x1) * r, (s1 * y2 - s2 * y1) * r, (s1 * z2 - s2 * z1) * r);

      tan1[i * 3 + 0].add(sdir);
      tan1[i * 3 + 1].add(sdir);
      tan1[i * 3 + 2].add(sdir);

      tan2[i * 3 + 0].add(tdir);
      tan2[i * 3 + 1].add(tdir);
      tan2[i * 3 + 2].add(tdir);
    }

    var tangent:Vector3 = new Vector3();
    var tangentData:Float32Array = new Float32Array(vertexCount * 4);
    var ti:number = 0;
    for (let i = 0; i < vertexCount; i++) {
      //let n:Vector3 = normals[i];
      let n:Vector3 = new Vector3(normals[i * 3 + 0], normals[i * 3 + 1], normals[i * 3 + 2]);
      let nClone:Vector3 = n.clone();
      let t:Vector3 = tan1[i];


      // Gram-Schmidt orthogonalize
      //tangent[a] = (t - n * Dot(n, t)).Normalize();

      // Calculate handedness
      //tangent[a].w = (Dot(Cross(n, t), tan2[a]) < 0.0F) ? -1.0F : 1.0F;


      /*Vector3.subtractRef(t, n, tangent);
       let dot = Vector3.dot(n, t);
       tangent.multiplyScalar(dot);
       tangent.normalize();*/

      let dot = Vector3.dot(n, t);
      nClone.multiplyScalar(dot);
      Vector3.subtractRef(t, nClone, tangent);
      tangent.normalize();

      tangentData[ti++] = tangent.x;
      tangentData[ti++] = tangent.y;
      tangentData[ti++] = tangent.z;
      tangentData[ti++] = (Vector3.dot(Vector3.cross(n, t), tan2[i]) < 0.0) ? -1.0 : 1.0;
      //console.log(Vector3.dot(Vector3.cross(n, t), tan2[i]));
    }

    this.setTangents(tangentData);
  }
}
export default MeshLoader;
