import Utils from '../Utils';
import IMeshParser from "./IMeshParser";

/**
 * @author mrdoob / http://mrdoob.com/
 */

class ObjParser implements IMeshParser {

	private _tmpPositions:number[];
	private _tmpUvs:number[];
	private _tmpNormals:number[];
  private _tmpMatData = [];

	public rawVertices:Float32Array;
	public positions:Float32Array;
	public uvs:Float32Array;
	public normals:Float32Array;
	public materialData:Float32Array;

	public faceCount:number = 0;

	public load(url) {
		Utils.loadText(url, (text:string)=>this.onLoad(text));
	}

	private onLoad(text:string):void {
		this.parse(text);
	}

	public parse(text):void {
		if (/^o /gm.test(text) === false) {
			//console.log("no objects in text");
		}

		this._tmpPositions = [];
		this._tmpUvs = [];
		this._tmpNormals = [];
		this._tmpMatData = [];

		var vertices = [];
		var normals = [];
		var uvs = [];

    var foundObjects = false;
    var objectIndex:number = 0;

		// v float float float

		var vertex_pattern = /v( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// vn float float float

		var normal_pattern = /vn( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// vt float float

		var uv_pattern = /vt( +[\d|\.|\+|\-|e|E]+)( +[\d|\.|\+|\-|e|E]+)/;

		// f vertex vertex vertex ...

		var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

		// f vertex/uv vertex/uv vertex/uv ...

		var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

		var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

		// f vertex//normal vertex//normal vertex//normal ...

		var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/;

    var object_pattern = /^[og]\s*(.+)?/;

		//

		var lines = text.split('\n');

		for (var i = 0; i < lines.length; i++) {

			var line = lines[i];
			line = line.trim();

			var result;

			if (line.length === 0 || line.charAt(0) === '#') {

				continue;

			} else if (( result = vertex_pattern.exec(line) ) !== null) {

				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				vertices.push(
					parseFloat(result[1]),
					parseFloat(result[2]),
					parseFloat(result[3])
				);

			} else if (( result = normal_pattern.exec(line) ) !== null) {

				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

				normals.push(
					parseFloat(result[1]),
					parseFloat(result[2]),
					parseFloat(result[3])
				);

			} else if (( result = uv_pattern.exec(line) ) !== null) {

				// ["vt 0.1 0.2", "0.1", "0.2"]

				uvs.push(
					parseFloat(result[1]),
					parseFloat(result[2])
				);

			} else if (( result = face_pattern1.exec(line) ) !== null) {

				// ["f 1 2 3", "1", "2", "3", undefined]

				this.addFace(
					vertices, normals, uvs, objectIndex,
					result[1], result[2], result[3], result[4]
				);

			} else if (( result = face_pattern2.exec(line) ) !== null) {

				// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

				this.addFace(
					vertices, normals, uvs, objectIndex,
					result[2], result[5], result[8], result[11],
					result[3], result[6], result[9], result[12]
				);

			} else if (( result = face_pattern3.exec(line) ) !== null) {

				// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

				this.addFace(
					vertices, normals, uvs, objectIndex,
					result[2], result[6], result[10], result[14],
					result[3], result[7], result[11], result[15],
					result[4], result[8], result[12], result[16]
				);

			} else if (( result = face_pattern4.exec(line) ) !== null) {

				// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

				this.addFace(
					vertices, normals, uvs, objectIndex,
					result[2], result[5], result[8], result[11],
					undefined, undefined, undefined, undefined,
					result[3], result[6], result[9], result[12]
				);

			} else if ( ( result = object_pattern.exec( line ) ) !== null ) {

        // o object_name
        // or
        // g group_name

        var name = result[0].substr(1).trim();

        if (foundObjects === false) {
          foundObjects = true;

        } else {
          if (Number(name)) {
            objectIndex = Number(name);

          } else {
            console.log("failed " + name);
            objectIndex++;
          }

          // addObject( name );
        }
			}
		}

		this.rawVertices = new Float32Array(vertices);

		this.positions = new Float32Array(this._tmpPositions);
		//console.log ("positions", this.positions);
		//console.log ("positions", this.positions.length / 3);

		this.normals = new Float32Array(this._tmpNormals);
		//console.log ("normals", this.normals.length / 3);

		this.uvs = new Float32Array(this._tmpUvs);
		//console.log ("uvs", this.uvs.length / 2);

		//console.log ("triangles", this.positions.length / 9);

    this.materialData = new Float32Array(this._tmpMatData);
	}

	private parseVertexIndex(vertices, value) {
		var index = parseInt(value);
		return ( index >= 0 ? index - 1 : index + vertices.length / 3 ) * 3;
	}

	private parseNormalIndex(normals, value) {
		var index = parseInt(value);
		return ( index >= 0 ? index - 1 : index + normals.length / 3 ) * 3;
	}

	private parseUVIndex(uvs, value) {
		var index = parseInt(value);
		return ( index >= 0 ? index - 1 : index + uvs.length / 2 ) * 2;
	}

	private addVertex(positions, a, b, c, objectIndex) {
		this._tmpPositions.push(
			positions[a], positions[a + 1], positions[a + 2],
			positions[b], positions[b + 1], positions[b + 2],
			positions[c], positions[c + 1], positions[c + 2]
		);

		this._tmpMatData.push(
		  objectIndex,
      objectIndex,
      objectIndex
    );
	}

	private addNormal(normals, a, b, c) {
		this._tmpNormals.push(
			normals[a], normals[a + 1], normals[a + 2],
			normals[b], normals[b + 1], normals[b + 2],
			normals[c], normals[c + 1], normals[c + 2]
		);

	}

	private addUV(uvs, a, b, c) {
		this._tmpUvs.push(
			uvs[a], uvs[a + 1],
			uvs[b], uvs[b + 1],
			uvs[c], uvs[c + 1]
		);

	}

	private addFace(positions, normals, uvs, objectIndex, a, b, c, d, ua = null, ub = null, uc = null, ud = null, na = null, nb = null, nc = null, nd = null) {

		var ia = this.parseVertexIndex(positions, a);
		var ib = this.parseVertexIndex(positions, b);
		var ic = this.parseVertexIndex(positions, c);
		var id;

		this.faceCount++;

		if (d === undefined) {

			this.addVertex(positions, ia, ib, ic, objectIndex);

		} else {

			id = this.parseVertexIndex(positions, d);

			this.addVertex(positions, ia, ib, id, objectIndex);
			this.addVertex(positions, ib, ic, id, objectIndex);

		}

		if (ua !== undefined) {

			ia = this.parseUVIndex(uvs, ua);
			ib = this.parseUVIndex(uvs, ub);
			ic = this.parseUVIndex(uvs, uc);

			if (d === undefined) {

				this.addUV(uvs, ia, ib, ic);

			} else {

				id = this.parseUVIndex(uvs, ud);

				this.addUV(uvs, ia, ib, id);
				this.addUV(uvs, ib, ic, id);

			}

		}

		if (na !== undefined) {

			ia = this.parseNormalIndex(normals, na);
			ib = this.parseNormalIndex(normals, nb);
			ic = this.parseNormalIndex(normals, nc);

			if (d === undefined) {

				this.addNormal(normals, ia, ib, ic);

			} else {

				id = this.parseNormalIndex(normals, nd);

				this.addNormal(normals, ia, ib, id);
				this.addNormal(normals, ib, ic, id);

			}

		}

	}


}
export default ObjParser;
