import Utils from '../Utils';
import IMeshParser from "./IMeshParser";
var pako = require('pako');

declare function escape(s:string): string;
// declare var pako;

class BinaryReader {

  private dv;
  private offset;
  private littleEndian;

  public constructor( buffer, littleEndian )
  {
    this.dv = new DataView( buffer );
    this.offset = 0;
    this.littleEndian = ( littleEndian !== undefined ) ? littleEndian : true;
  }

  public getOffset() {
    return this.offset;
  }

  public size() {
    return this.dv.buffer.byteLength;
  }

  public skip( length ) {
    this.offset += length;
  }

  // seems like true/false representation depends on exporter.
  // true: 1 or 'Y'(=0x59), false: 0 or 'T'(=0x54)
  // then sees LSB.
  public getBoolean() {
    return ( this.getUint8() & 1 ) === 1;
  }

  public getBooleanArray( size ) {
    var a = [];
    for ( var i = 0; i < size; i ++ ) {
      a.push( this.getBoolean() );
    }

    return a;
  }

  public getUint8 () {
    var value = this.dv.getUint8( this.offset );
    this.offset += 1;
    return value;
  }

  public getInt16 () {
    var value = this.dv.getInt16( this.offset, this.littleEndian );
    this.offset += 2;
    return value;
  }

  public getInt32 () {
    var value = this.dv.getInt32( this.offset, this.littleEndian );
    this.offset += 4;
    return value;
  }

  public getInt32Array ( size ) {
    var a = [];

    for ( var i = 0; i < size; i ++ ) {
      a.push( this.getInt32() );
    }

    return a;
  }

  public getUint32 () {
    var value = this.dv.getUint32( this.offset, this.littleEndian );
    this.offset += 4;
    return value;
  }

  // JavaScript doesn't support 64-bit integer so calculate this here
  // 1 << 32 will return 1 so using multiply operation instead here.
  // There's a possibility that this method returns wrong value if the value
  // is out of the range between Number.MAX_SAFE_INTEGER and Number.MIN_SAFE_INTEGER.
  // TODO: safely handle 64-bit integer
  public getInt64 () {
    var low, high;

    if ( this.littleEndian ) {
      low = this.getUint32();
      high = this.getUint32();
    } else {
      high = this.getUint32();
      low = this.getUint32();
    }

    // calculate negative value
    if ( high & 0x80000000 ) {
      high = ~ high & 0xFFFFFFFF;
      low = ~ low & 0xFFFFFFFF;

      if ( low === 0xFFFFFFFF ) high = ( high + 1 ) & 0xFFFFFFFF;
      low = ( low + 1 ) & 0xFFFFFFFF;

      return - ( high * 0x100000000 + low );
    }

    return high * 0x100000000 + low;
  }

  public getInt64Array ( size ) {
    var a = [];
    for ( var i = 0; i < size; i ++ ) {
      a.push( this.getInt64() );
    }

    return a;
  }

  // Note: see getInt64() comment
  public getUint64 () {
    var low, high;
    if ( this.littleEndian ) {
      low = this.getUint32();
      high = this.getUint32();
    } else {
      high = this.getUint32();
      low = this.getUint32();
    }

    return high * 0x100000000 + low;
  }

  public getFloat32 () {
    var value = this.dv.getFloat32( this.offset, this.littleEndian );
    this.offset += 4;
    return value;
  }

  public getFloat32Array ( size ) {
    var a = [];
    for ( var i = 0; i < size; i ++ ) {
      a.push( this.getFloat32() );
    }

    return a;
  }

  public getFloat64 () {
    var value = this.dv.getFloat64( this.offset, this.littleEndian );
    this.offset += 8;
    return value;
  }

  public getFloat64Array ( size ) {
    var a = [];
    for ( var i = 0; i < size; i ++ ) {
      a.push( this.getFloat64() );
    }

    return a;
  }

  public getArrayBuffer ( size ) {
    var value = this.dv.buffer.slice( this.offset, this.offset + size );
    this.offset += size;
    return value;
  }

  public getString ( size ):string {
    var a = new Uint8Array( size );
    for ( var i = 0; i < size; i ++ ) {
      a[ i ] = this.getUint8();
    }

    var nullByte = a.indexOf( 0 );
    if ( nullByte >= 0 ) a = a.slice( 0, nullByte );

    return this.decodeText( a );
  }

  public decodeText( array ):string {
    // Avoid the String.fromCharCode.apply(null, array) shortcut, which
    // throws a "maximum call stack size exceeded" error for large arrays.

    var s = '';
    for ( var i = 0, il = array.length; i < il; i ++ ) {
      // Implicitly assumes little-endian.
      s += String.fromCharCode( array[ i ] );
    }

    // Merges multi-byte utf-8 characters.
    return decodeURIComponent( escape( s ) );
  }
}

class FBXTree {
  public add( key, val ) {
    this[ key ] = val;
  }
}

class BinaryParser {
  public parse(buffer):any {
    var reader = new BinaryReader(buffer, true);
    reader.skip( 23 ); // skip magic 23 bytes

    var version = reader.getUint32();
    // console.log( 'FBXLoader: FBX binary version: ' + version );

    var allNodes = new FBXTree();
    while ( ! this.endOfContent( reader ) ) {

      var node = this.parseNode( reader, version );
      if ( node !== null ) allNodes.add( node.name, node );

    }

    return allNodes;
  }

  // Check if reader has reached the end of content.
  public endOfContent (reader):boolean {

    // footer size: 160bytes + 16-byte alignment padding
    // - 16bytes: magic
    // - padding til 16-byte alignment (at least 1byte?)
    //	(seems like some exporters embed fixed 15 or 16bytes?)
    // - 4bytes: magic
    // - 4bytes: version
    // - 120bytes: zero
    // - 16bytes: magic
    if ( reader.size() % 16 === 0 ) {
      return ( ( reader.getOffset() + 160 + 16 ) & ~ 0xf ) >= reader.size();

    } else {
      return reader.getOffset() + 160 + 16 >= reader.size();
    }
  }

  // recursively parse nodes until the end of the file is reached
  public parseNode ( reader:BinaryReader, version ):any {

    var node = {};

    // The first three data sizes depends on version.
    var endOffset = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();
    var numProperties = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

    // note: do not remove this even if you get a linter warning as it moves the buffer forward
    var propertyListLen = ( version >= 7500 ) ? reader.getUint64() : reader.getUint32();

    var nameLen = reader.getUint8();
    var name = reader.getString( nameLen );

    // Regards this node as NULL-record if endOffset is zero
    if ( endOffset === 0 ) return null;

    var propertyList = [];

    for ( var i = 0; i < numProperties; i ++ ) {

      propertyList.push( this.parseProperty( reader ) );

    }

    // Regards the first three elements in propertyList as id, attrName, and attrType
    var id = propertyList.length > 0 ? propertyList[ 0 ] : '';
    var attrName = propertyList.length > 1 ? propertyList[ 1 ] : '';
    var attrType = propertyList.length > 2 ? propertyList[ 2 ] : '';

    // check if this node represents just a single property
    // like (name, 0) set or (name2, [0, 1, 2]) set of {name: 0, name2: [0, 1, 2]}
    node["singleProperty"] = ( numProperties === 1 && reader.getOffset() === endOffset );

    while ( endOffset > reader.getOffset() ) {
      var subNode = this.parseNode( reader, version );
      if ( subNode !== null ) this.parseSubNode( name, node, subNode );
    }

    node["propertyList"] = propertyList; // raw property list used by parent

    if ( typeof id === 'number' ) node["id"] = id;
    if ( attrName !== '' ) node["attrName"] = attrName;
    if ( attrType !== '' ) node["attrType"] = attrType;
    if ( name !== '' ) node["name"] = name;

    return node;
  }

  public parseSubNode ( name, node, subNode ):void {
    // special case: child node is single property
    if ( subNode.singleProperty === true ) {
      var value = subNode.propertyList[ 0 ];

      if ( Array.isArray( value ) ) {
        node[ subNode.name ] = subNode;
        subNode.a = value;

      } else {
        node[ subNode.name ] = value;
      }

    } else if ( name === 'Connections' && subNode.name === 'C' ) {

      var array = [];
      subNode.propertyList.forEach( function ( property, i ) {
        // first Connection is FBX type (OO, OP, etc.). We'll discard these
        if ( i !== 0 ) array.push( property );
      } );

      if ( node.connections === undefined ) {
        node.connections = [];
      }
      node.connections.push( array );

    } else if ( subNode.name === 'Properties70' ) {
      var keys = Object.keys( subNode );
      keys.forEach( function ( key ) {
        node[ key ] = subNode[ key ];
      } );

    } else if ( name === 'Properties70' && subNode.name === 'P' ) {
      var innerPropName = subNode.propertyList[ 0 ];
      var innerPropType1 = subNode.propertyList[ 1 ];
      var innerPropType2 = subNode.propertyList[ 2 ];
      var innerPropFlag = subNode.propertyList[ 3 ];
      var innerPropValue;

      if ( innerPropName.indexOf( 'Lcl ' ) === 0 ) innerPropName = innerPropName.replace( 'Lcl ', 'Lcl_' );
      if ( innerPropType1.indexOf( 'Lcl ' ) === 0 ) innerPropType1 = innerPropType1.replace( 'Lcl ', 'Lcl_' );

      if ( innerPropType1 === 'Color' || innerPropType1 === 'ColorRGB' || innerPropType1 === 'Vector' || innerPropType1 === 'Vector3D' || innerPropType1.indexOf( 'Lcl_' ) === 0 ) {
        innerPropValue = [
          subNode.propertyList[ 4 ],
          subNode.propertyList[ 5 ],
          subNode.propertyList[ 6 ]
        ];

      } else {
        innerPropValue = subNode.propertyList[ 4 ];
      }

      // this will be copied to parent, see above
      node[ innerPropName ] = {
        'type': innerPropType1,
        'type2': innerPropType2,
        'flag': innerPropFlag,
        'value': innerPropValue
      };

    } else if ( node[ subNode.name ] === undefined ) {
      if ( typeof subNode.id === 'number' ) {
        node[ subNode.name ] = {};
        node[ subNode.name ][ subNode.id ] = subNode;
      } else {
        node[ subNode.name ] = subNode;
      }

    } else {
      if ( subNode.name === 'PoseNode' ) {
        if ( ! Array.isArray( node[ subNode.name ] ) ) {
          node[ subNode.name ] = [ node[ subNode.name ] ];
        }
        node[ subNode.name ].push( subNode );

      } else if ( node[ subNode.name ][ subNode.id ] === undefined ) {
        node[ subNode.name ][ subNode.id ] = subNode;
      }
    }
  }

  public parseProperty ( reader ):any {
    var type = reader.getString( 1 );

    switch ( type ) {
      case 'C':
        return reader.getBoolean();

      case 'D':
        return reader.getFloat64();

      case 'F':
        return reader.getFloat32();

      case 'I':
        return reader.getInt32();

      case 'L':
        return reader.getInt64();

      case 'R':
        var length = reader.getUint32();
        return reader.getArrayBuffer( length );

      case 'S':
        var length = reader.getUint32();
        return reader.getString( length );

      case 'Y':
        return reader.getInt16();

      case 'b':
      case 'c':
      case 'd':
      case 'f':
      case 'i':
      case 'l':

        var arrayLength = reader.getUint32();
        var encoding = reader.getUint32(); // 0: non-compressed, 1: compressed
        var compressedLength = reader.getUint32();

        if ( encoding === 0 ) {
          switch ( type ) {
            case 'b':
            case 'c':
              return reader.getBooleanArray( arrayLength );
            case 'd':
              return reader.getFloat64Array( arrayLength );
            case 'f':
              return reader.getFloat32Array( arrayLength );
            case 'i':
              return reader.getInt32Array( arrayLength );
            case 'l':
              return reader.getInt64Array( arrayLength );
          }
        }

        // if ( window.Zlib === undefined ) {
        //   console.error( 'THREE.FBXLoader: External library Inflate.min.js required, obtain or import from https://github.com/imaya/zlib.js' );
        // }
        //
        // var inflate = new Zlib.Inflate( new Uint8Array( reader.getArrayBuffer( compressedLength ) ) ); // eslint-disable-line no-undef
        var inflate = pako.inflate(reader.getArrayBuffer( compressedLength ));
        // var reader2 = new BinaryReader( inflate.decompress().buffer, true );
        var reader2 = new BinaryReader(inflate.buffer, true);

        switch ( type ) {
          case 'b':
          case 'c':
            return reader2.getBooleanArray( arrayLength );
          case 'd':
            return reader2.getFloat64Array( arrayLength );
          case 'f':
            return reader2.getFloat32Array( arrayLength );
          case 'i':
            return reader2.getInt32Array( arrayLength );
          case 'l':
            return reader2.getInt64Array( arrayLength );
        }

      default:
        throw new Error( 'THREE.FBXLoader: Unknown property type ' + type );
    }
  }
}

class FBXParser implements IMeshParser {

  public rawVertices:Float32Array;
  public positions:Float32Array;
  public uvs:Float32Array;
  public normals:Float32Array;
  public materialData:Float32Array;

  public load(url) {
    Utils.loadText(url, (text:string)=>this.onLoad(text));
  }

  private onLoad(text:string):void {
    this.parse(text);
  }

  public parse(buffer):void {
    var binarParser:BinaryParser = new BinaryParser();
    var FBXTree:FBXTree = binarParser.parse( buffer );
    // console.log( FBXTree );

    var connections = this.parseConnections( FBXTree );
    // var textures = this.parseTextures( FBXTree, connections );
    var materials = this.parseMaterials( FBXTree, connections );
    var geometryMap = this.parseGeometries( FBXTree, connections, materials );
    var sceneGraph = this.parseScene( FBXTree, connections, geometryMap, materials );

    this.positions = new Float32Array(sceneGraph[0].positions);
    this.normals = new Float32Array(sceneGraph[0].normals);
    this.uvs = new Float32Array(sceneGraph[0].uvs);
    this.materialData = new Float32Array(sceneGraph[0].matData);
  }

  public parseConnections( FBXTree ):any {
    var connectionMap = new Map();

    if ( 'Connections' in FBXTree ) {
      var rawConnections = FBXTree.Connections.connections;

      rawConnections.forEach( function ( rawConnection ) {
        var fromID = rawConnection[ 0 ];
        var toID = rawConnection[ 1 ];
        var relationship = rawConnection[ 2 ];

        if ( ! connectionMap.has( fromID ) ) {
          connectionMap.set( fromID, {
            parents: [],
            children: []
          } );
        }

        var parentRelationship = { ID: toID, relationship: relationship };
        connectionMap.get( fromID ).parents.push( parentRelationship );

        if ( ! connectionMap.has( toID ) ) {
          connectionMap.set( toID, {
            parents: [],
            children: []
          } );
        }

        var childRelationship = { ID: fromID, relationship: relationship };
        connectionMap.get( toID ).children.push( childRelationship );
      } );
    }

    return connectionMap;
  }

  // Parse nodes in FBXTree.Objects.Texture
  // These contain details such as UV scaling, cropping, rotation etc and are connected
  // to images in FBXTree.Objects.Video
  public parseTextures( FBXTree, connections ) {
    var textureMap = new Map();

    if ( 'Texture' in FBXTree.Objects ) {
      var textureNodes = FBXTree.Objects.Texture;
      for ( var nodeID in textureNodes ) {

        var texture = this.parseTexture( textureNodes[ nodeID ] );
        textureMap.set( parseInt( nodeID ), texture );
      }
    }

    return textureMap;
  }

  // Parse individual node in FBXTree.Objects.Texture
  public parseTexture( textureNode ) {
    var texture = {
      ID:textureNode.id,
      name:textureNode.attrName
    };

    return texture;
  }

  // Parse nodes in FBXTree.Objects.Material
  public parseMaterials( FBXTree, connections ):any {
    var materialMap = new Map();

    if ( 'Material' in FBXTree.Objects ) {
      var materialNodes = FBXTree.Objects.Material;

      for ( var nodeID in materialNodes ) {
        var material = this.parseMaterial( FBXTree, materialNodes[ nodeID ], connections );
        if ( material !== null ) materialMap.set( parseInt( nodeID ), material );
      }
    }

    return materialMap;
  }

  // Parse single node in FBXTree.Objects.Material
  // Materials are connected to texture maps in FBXTree.Objects.Textures
  // FBX format currently only supports Lambert and Phong shading models
  public parseMaterial( FBXTree, materialNode, connections ):any {
    var ID = materialNode.id;
    var name = materialNode.attrName;
    var type = materialNode.ShadingModel;

    //Case where FBX wraps shading model in property object.
    if ( typeof type === 'object' ) {
      type = type.value;
    }

    // Ignore unused materials which don't have any connections.
    if ( ! connections.has( ID ) ) return null;

    var material = {
      id: ID,
      name: name,
      type: type
    }

    return material;
  }

  // Parse nodes in FBXTree.Objects.Geometry
  public parseGeometries( FBXTree, connections, matMap ):any {
    var geometryMap = new Map();

    if ( 'Geometry' in FBXTree.Objects ) {
      var geometryNodes = FBXTree.Objects.Geometry;

      for ( var nodeID in geometryNodes ) {
        var relationships = connections.get( parseInt( nodeID ) );
        var geo = this.parseGeometry( FBXTree, connections, relationships, geometryNodes[ nodeID ], matMap );

        geometryMap.set( parseInt( nodeID ), geo );
      }
    }

    return geometryMap;
  }

  // Parse single node in FBXTree.Objects.Geometry
  public parseGeometry( FBXTree, connections, relationships, geometryNode, matMap ):any {
    switch ( geometryNode.attrType ) {
      case 'Mesh':
        return this.parseMeshGeometry( FBXTree, connections, relationships, geometryNode, matMap );
    }
  }

  // Parse single node mesh geometry in FBXTree.Objects.Geometry
  public parseMeshGeometry( FBXTree, connections, relationships, geometryNode, materialMap ):any {
    var modelNodes = relationships.parents.map(function(parent) {
      return FBXTree.Objects.Model[parent.ID];
    });

    // don't create geometry if it is not associated with any models
    if (modelNodes.length === 0) return;

    // For now just assume one model and get the preRotations from that
    var modelNode = modelNodes[0];
    var modelRelationships = connections.get( parseInt( modelNode.id ) );

    // get geometry and materials(s) from connections
    var materials = [];
    modelRelationships.children.forEach( function ( child ) {
      if ( materialMap.has( child.ID ) ) {
        materials.push( materialMap.get( child.ID ) );
      }
    } );

    return this.genGeometry(FBXTree, modelRelationships, geometryNode, materials);
  }

  // Generate a THREE.BufferGeometry from a node in FBXTree.Objects.Geometry
  public genGeometry(FBXTree, relationships, geometryNode, materials):any {
    var vertexPositions = geometryNode.Vertices.a;
    var vertexIndices = geometryNode.PolygonVertexIndex.a;

    // create arrays to hold the final data used to build the buffergeometry
    var vertexBuffer = [];
    var normalBuffer = [];
    var uvsBuffer = [];
    var materialIndexBuffer = [];

    if (geometryNode.LayerElementMaterial) {
      var materialInfo = this.getMaterials( geometryNode.LayerElementMaterial[ 0 ] );
    }

    if (geometryNode.LayerElementNormal) {
      var normalInfo = this.getNormals( geometryNode.LayerElementNormal[ 0 ] );
    }

    if (geometryNode.LayerElementUV) {
      var uvInfo = [];
      var i = 0;

      while (geometryNode.LayerElementUV[i]) {
        uvInfo.push(this.getUVs( geometryNode.LayerElementUV[i]));
        i ++;
      }
    }

    var polygonIndex = 0;
    var faceLength = 0;

    // these will hold data for a single face
    var vertexPositionIndexes = [];
    var faceNormals = [];
    var faceUVs = [];

    vertexIndices.forEach( function ( vertexIndex, polygonVertexIndex ) {
      var endOfFace = false;

      // Face index and vertex index arrays are combined in a single array
      // A cube with quad faces looks like this:
      // PolygonVertexIndex: *24 {
      //  a: 0, 1, 3, -3, 2, 3, 5, -5, 4, 5, 7, -7, 6, 7, 1, -1, 1, 7, 5, -4, 6, 0, 2, -5
      //  }
      // Negative numbers mark the end of a face - first face here is 0, 1, 3, -3
      // to find index of last vertex multiply by -1 and subtract 1: -3 * - 1 - 1 = 2
      if (vertexIndex < 0) {
        vertexIndex = vertexIndex ^ - 1; // equivalent to ( x * -1 ) - 1
        vertexIndices[ polygonVertexIndex ] = vertexIndex;
        endOfFace = true;
      }

      vertexPositionIndexes.push(vertexIndex * 3, vertexIndex * 3 + 1, vertexIndex * 3 + 2);

      if (normalInfo) {
        var data = FBXParser.getData( polygonVertexIndex, polygonIndex, vertexIndex, normalInfo );
        faceNormals.push( data[ 0 ], data[ 1 ], data[ 2 ] );
      }

      var materialIndex = 0;
      if (materialInfo && materialInfo.mappingType !== 'AllSame') {
        materialIndex = FBXParser.getData( polygonVertexIndex, polygonIndex, vertexIndex, materialInfo )[ 0 ];
        materialIndex = parseInt(materials[materialIndex]["name"], 10);
      }

      if (uvInfo) {
        uvInfo.forEach(function(uv, i) {
          var data = FBXParser.getData(polygonVertexIndex, polygonIndex, vertexIndex, uv);
          if (faceUVs[i] === undefined) {
            faceUVs[i] = [];
          }

          faceUVs[i].push(data[0]);
          faceUVs[i].push(data[1]);
        } );
      }

      faceLength ++;

      // we have reached the end of a face - it may have 4 sides though
      // in which case the data is split to represent two 3 sided faces
      if (endOfFace) {
        for (var i = 2; i < faceLength; i++) {
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 0 ] ] );
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 1 ] ] );
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ 2 ] ] );

          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 ] ] );
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 + 1 ] ] );
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ ( i - 1 ) * 3 + 2 ] ] );

          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 ] ] );
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 + 1 ] ] );
          vertexBuffer.push( vertexPositions[ vertexPositionIndexes[ i * 3 + 2 ] ] );

          // if (materialInfo && materialInfo.mappingType !== 'AllSame') {
            materialIndexBuffer.push( materialIndex );
            materialIndexBuffer.push( materialIndex );
            materialIndexBuffer.push( materialIndex );
          // }

          if (normalInfo) {
            normalBuffer.push( faceNormals[ 0 ] );
            normalBuffer.push( faceNormals[ 1 ] );
            normalBuffer.push( faceNormals[ 2 ] );

            normalBuffer.push( faceNormals[ ( i - 1 ) * 3 ] );
            normalBuffer.push( faceNormals[ ( i - 1 ) * 3 + 1 ] );
            normalBuffer.push( faceNormals[ ( i - 1 ) * 3 + 2 ] );

            normalBuffer.push( faceNormals[ i * 3 ] );
            normalBuffer.push( faceNormals[ i * 3 + 1 ] );
            normalBuffer.push( faceNormals[ i * 3 + 2 ] );
          }

          if ( uvInfo ) {
            uvInfo.forEach( function ( uv, j ) {
              if ( uvsBuffer[ j ] === undefined ) uvsBuffer[ j ] = [];

              uvsBuffer[ j ].push( faceUVs[ j ][ 0 ] );
              uvsBuffer[ j ].push( faceUVs[ j ][ 1 ] );

              uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 ] );
              uvsBuffer[ j ].push( faceUVs[ j ][ ( i - 1 ) * 2 + 1 ] );

              uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 ] );
              uvsBuffer[ j ].push( faceUVs[ j ][ i * 2 + 1 ] );
            } );
          }
        }

        polygonIndex ++;
        faceLength = 0;

        // reset arrays for the next face
        vertexPositionIndexes = [];
        faceNormals = [];
        faceUVs = [];
      }
    } );

    // var geo = new THREE.BufferGeometry();
    // geo.name = geometryNode.name;
    //
    // var positionAttribute = new THREE.Float32BufferAttribute( vertexBuffer, 3 );
    // geo.addAttribute( 'position', positionAttribute );
    //
    // if ( normalBuffer.length > 0 ) {
    //   var normalAttribute = new THREE.Float32BufferAttribute( normalBuffer, 3 );
    //   geo.addAttribute( 'normal', normalAttribute );
    // }
    //
    // uvsBuffer.forEach( function ( uvBuffer, i ) {
    //   // subsequent uv buffers are called 'uv1', 'uv2', ...
    //   var name = 'uv' + ( i + 1 ).toString();
    //
    //   // the first uv buffer is just called 'uv'
    //   if ( i === 0 ) {
    //     name = 'uv';
    //   }
    //
    //   geo.addAttribute( name, new THREE.Float32BufferAttribute( uvsBuffer[ i ], 2 ) );
    // } );
    //
    // if ( materialInfo && materialInfo.mappingType !== 'AllSame' ) {
    //   // Convert the material indices of each vertex into rendering groups on the geometry.
    //   var prevMaterialIndex = materialIndexBuffer[ 0 ];
    //   var startIndex = 0;
    //
    //   materialIndexBuffer.forEach( function ( currentIndex, i ) {
    //
    //     if ( currentIndex !== prevMaterialIndex ) {
    //       geo.addGroup( startIndex, i - startIndex, prevMaterialIndex );
    //       prevMaterialIndex = currentIndex;
    //       startIndex = i;
    //     }
    //   } );
    //
    //   // the loop above doesn't add the last group, do that here.
    //   if ( geo.groups.length > 0 ) {
    //     var lastGroup = geo.groups[ geo.groups.length - 1 ];
    //     var lastIndex = lastGroup.start + lastGroup.count;
    //
    //     if ( lastIndex !== materialIndexBuffer.length ) {
    //       geo.addGroup( lastIndex, materialIndexBuffer.length - lastIndex, prevMaterialIndex );
    //     }
    //   }
    //
    //   // case where there are multiple materials but the whole geometry is only
    //   // using one of them
    //   if ( geo.groups.length === 0 ) {
    //     geo.addGroup( 0, materialIndexBuffer.length, materialIndexBuffer[ 0 ] );
    //   }
    // }

    var geo = {};
    geo["name"] = geometryNode.name;
    geo["positions"] = vertexBuffer;
    geo["uvs"] = uvsBuffer[0];
    geo["normals"] = normalBuffer;
    geo["matData"] = materialIndexBuffer;

    return geo;
  }

  // Parse normal from FBXTree.Objects.Geometry.LayerElementNormal if it exists
  public getNormals( NormalNode ):any {
    var mappingType = NormalNode.MappingInformationType;
    var referenceType = NormalNode.ReferenceInformationType;
    var buffer = NormalNode.Normals.a;
    var indexBuffer = [];

    if ( referenceType === 'IndexToDirect' ) {
      if ( 'NormalIndex' in NormalNode ) {
        indexBuffer = NormalNode.NormalIndex.a;

      } else if ( 'NormalsIndex' in NormalNode ) {
        indexBuffer = NormalNode.NormalsIndex.a;
      }
    }

    return {
      dataSize: 3,
      buffer: buffer,
      indices: indexBuffer,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  // Parse UVs from FBXTree.Objects.Geometry.LayerElementUV if it exists
  public getUVs( UVNode ):any {
    var mappingType = UVNode.MappingInformationType;
    var referenceType = UVNode.ReferenceInformationType;
    var buffer = UVNode.UV.a;
    var indexBuffer = [];

    if ( referenceType === 'IndexToDirect' ) {
      indexBuffer = UVNode.UVIndex.a;
    }

    return {
      dataSize: 2,
      buffer: buffer,
      indices: indexBuffer,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  // Parse mapping and material data in FBXTree.Objects.Geometry.LayerElementMaterial if it exists
  public getMaterials( MaterialNode ):any {
    var mappingType = MaterialNode.MappingInformationType;
    var referenceType = MaterialNode.ReferenceInformationType;

    if ( mappingType === 'NoMappingInformation' ) {

      return {
        dataSize: 1,
        buffer: [ 0 ],
        indices: [ 0 ],
        mappingType: 'AllSame',
        referenceType: referenceType
      };
    }

    var materialIndexBuffer = MaterialNode.Materials.a;

    // Since materials are stored as indices, there's a bit of a mismatch between FBX and what
    // we expect.So we create an intermediate buffer that points to the index in the buffer,
    // for conforming with the other functions we've written for other data.
    var materialIndices = [];

    for ( var i = 0; i < materialIndexBuffer.length; ++ i ) {
      materialIndices.push( i );
    }

    return {
      dataSize: 1,
      buffer: materialIndexBuffer,
      indices: materialIndices,
      mappingType: mappingType,
      referenceType: referenceType
    };
  }

  public static slice( b, from, to ):any {
    var result = [];

    for ( var i = from, j = 0; i < to; i ++, j ++ ) {
      result[ j ] = b[ i ];
    }

    return result;
  }

  // Functions use the infoObject and given indices to return value array of geometry.
  // Parameters:
  // 	- polygonVertexIndex - Index of vertex in drawOpaquePass order (which index of the index buffer refers to this vertex).
  // 	- polygonIndex - Index of polygon in geometry.
  // 	- vertexIndex - Index of vertex inside vertex buffer (used because some data refers to old index buffer that we don't use anymore).
  // 	- infoObject: can be materialInfo, normalInfo, UVInfo or colorInfo
  // Index type:
  //	- Direct: index is same as polygonVertexIndex
  //	- IndexToDirect: infoObject has it's own set of indices
  public static GetData = {
    ByPolygonVertex: {
      Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {
        var from = ( polygonVertexIndex * infoObject.dataSize );
        var to = ( polygonVertexIndex * infoObject.dataSize ) + infoObject.dataSize;

        return FBXParser.slice( infoObject.buffer, from, to );
      },

      IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {
        var index = infoObject.indices[ polygonVertexIndex ];
        var from = ( index * infoObject.dataSize );
        var to = ( index * infoObject.dataSize ) + infoObject.dataSize;

        return FBXParser.slice( infoObject.buffer, from, to );
      }
    },

    ByPolygon: {
      Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {
        var from = polygonIndex * infoObject.dataSize;
        var to = polygonIndex * infoObject.dataSize + infoObject.dataSize;

        return FBXParser.slice( infoObject.buffer, from, to );
      },

      IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {
        var index = infoObject.indices[ polygonIndex ];
        var from = index * infoObject.dataSize;
        var to = index * infoObject.dataSize + infoObject.dataSize;

        return FBXParser.slice( infoObject.buffer, from, to );
      }
    },

    ByVertice: {
      Direct: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {
        var from = ( vertexIndex * infoObject.dataSize );
        var to = ( vertexIndex * infoObject.dataSize ) + infoObject.dataSize;

        return FBXParser.slice( infoObject.buffer, from, to );
      }
    },

    AllSame: {
      IndexToDirect: function ( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ) {
        var from = infoObject.indices[ 0 ] * infoObject.dataSize;
        var to = infoObject.indices[ 0 ] * infoObject.dataSize + infoObject.dataSize;

        return FBXParser.slice( infoObject.buffer, from, to );
      }
    }
  }

  public static getData( polygonVertexIndex, polygonIndex, vertexIndex, infoObject ):any {
    return FBXParser.GetData[ infoObject.mappingType ][ infoObject.referenceType ]( polygonVertexIndex, polygonIndex, vertexIndex, infoObject );
  }

  // create the main THREE.Group() to be returned by the loader
  public parseScene( FBXTree, connections, geometryMap, materialMap ):any {
    var sceneGraph:any[] = [];
    var modelMap = this.parseModels( FBXTree, geometryMap, materialMap, connections );

    modelMap.forEach( function ( model ) {
        sceneGraph.push( model );
    } );

    return sceneGraph;
  }

  // parse nodes in FBXTree.Objects.Model
  public parseModels( FBXTree, geometryMap, materialMap, connections ):any {
    var modelMap = new Map();
    var modelNodes = FBXTree.Objects.Model;

    for ( var nodeID in modelNodes ) {
      var id = parseInt( nodeID );
      var node = modelNodes[ nodeID ];
      var relationships = connections.get( id );

      var model = null;

      switch ( node.attrType ) {
        case 'Mesh':
          model = this.createMesh( FBXTree, relationships, geometryMap );
          break;
        case 'LimbNode': // usually associated with a Bone, however if a Bone was not created we'll make a Group instead
        case 'Null':
        default:
          break;
      }

      // model.name = THREE.PropertyBinding.sanitizeNodeName( node.attrName );
      // model.ID = id;

      if (model) {
        modelMap.set( id, model );
      }
    }

    return modelMap;
  }

  public createMesh( FBXTree, relationships, geometryMap ):any {
    var model;
    var geometry = null;

    // get geometry and materials(s) from connections
    relationships.children.forEach( function ( child ) {
      if ( geometryMap.has( child.ID ) ) {
        geometry = geometryMap.get( child.ID );
      }
    } );

    // model = new THREE.Mesh( geometry, material );
    model = geometry;

    return model;
  }

}
export default FBXParser;
