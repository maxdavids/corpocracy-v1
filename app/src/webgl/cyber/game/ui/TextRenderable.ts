import Mesh from "../../../core/Mesh";
import Renderer from "../../../core/Renderer";
import Renderable from "../../../core/Renderable";
import MaterialText from "./materials/MaterialText";
import Vector2 from "../../../core/Vector2";
import Vector3 from "../../../core/Vector3";
import Utils from "../../../Utils";
import Camera from "../../../core/Camera";
import Material from "../../../core/Material";

export enum TextPivot {
  LEFT,
  CENTER,
  RIGHT,
  TOP,
  BOTTOM
}

/**
 * Created by mdavids on 20/04/2016.
 */
class TextRenderable extends Renderable
{
  private static glyphCount:number = 77;
  private static glyphSize:number = 32;

  private static glyphColumns:number = 32;
  private static glyphRows:number = 3;

  private static mapping:Object = {
    "31": -1,      "32": -1,     "33": -1,     "34": -1,    "35": 66,
    "36": -1,     "37": 68,     "38": -1,     "39": -1,     "40": 70,
    "41": 71,     "42": -1,     "43": 73,     "44": 62,     "45": 74,
    "46": 63,     "47": 75,     "48": 26,     "49": 27,     "50": 28,
    "51": 29,     "52": 30,     "53": 31,     "54": 32,     "55": 33,
    "56": 34,     "57": 35,     "58": 72,     "59": -1,     "60": 64,
    "61": -1,     "62": 69,     "63": -1,     "64": -1,     "65": 0,
    "66": 1,     "67": 2,     "68": 3,     "69": 4,     "70": 5,
    "71": 6,     "72": 7,     "73": 8,     "74": 9,     "75": 10,
    "76": 11,     "77": 12,     "78": 13,     "79": 14,     "80": 15,
    "81": 16,     "82": 17,     "83": 18,     "84": 19,     "85": 20,
    "86": 21,     "87": 22,     "88": 23,     "89": 24,     "90": 25,
    "91": -1,     "92": -1,    "93": -1,     "94": -1,     "95": 65,
    "96": -1,     "97": 36,     "98": 37,     "99": 38,     "100": 39,
    "101": 40,    "102": 41,    "103": 42,    "104": 43,    "105": 44,
    "106": 45,    "107": 46,    "108": 47,    "109": 48,    "110": 49,
    "111": 50,    "112": 51,    "113": 52,    "114": 53,    "115": 54,
    "116": 55,    "117": 56,    "118": 57,    "119": 58,    "120": 59,
    "121": 60,    "122": 61,    "123": 76,    "124": -1,    "125": -1,
    "126": 67,    "127": -1
  };

  protected _textMaterial:MaterialText;

  protected _text:string[];
  protected _colors:number[];

  protected _pivotX:TextPivot = TextPivot.LEFT;
  protected _pivotY:TextPivot = TextPivot.TOP;
  protected _rawSize:Vector2 = new Vector2();
  protected _size:Vector2 = new Vector2();

  protected _spacing:Vector2 = new Vector2();
  protected _isHidden:boolean = false;

  constructor(
      renderer:Renderer,
      text:string[],
      colors:number[],
      pivotX:TextPivot,
      pivotY:TextPivot,
      xSpacing:number = 0.95,
      ySpacing:number = 0.98,
      actionID:number = 255
    ) {
    super(renderer);

    this._textMaterial = new MaterialText(renderer, actionID);
    this._textMaterial.backColor = Utils.hexToRGBA(0xff010101);
    this.setMaterial(this._textMaterial);

    this._text = text;
    this._colors = colors;
    this._pivotX = pivotX;
    this._pivotY = pivotY;

    this._spacing.x = xSpacing;
    this._spacing.y = ySpacing;

    this.create();
  }

  public getMaterial():MaterialText
  {
    return this._textMaterial;
  }

  public getRawSize():Vector2
  {
    return this._rawSize;
  }

  public setScale(scaleX:number, scaleY:number):void
  {
    this._textMaterial.scale.x = scaleX;
    this._textMaterial.scale.y = scaleY;

    this._size.x = scaleX * this._rawSize.x;
    this._size.y = scaleY * this._rawSize.y;
  }

  public getSize():Vector2
  {
    return this._size;
  }

  public setPosition(x:number, y:number):void
  {
    this._textMaterial.pos.x = x;
    this._textMaterial.pos.y = y;
  }

  public getPos():Vector3
  {
    return this._textMaterial.pos;
  }

  public setText(value:string[]):void
  {
    this._mesh.destruct();
    this._mesh = null;

    this._text = value;
    this.create();
  }

  public setColors(value:number[]):void
  {
    this._colors = value;

    this.setText(this._text);
  }

  public isHidden():boolean
  {
    return this._isHidden;
  }

  public show():void
  {
    this._isHidden = false;
  }

  public hide():void
  {
    this._isHidden = true;
  }

  public draw(camera:Camera, material:Material = null) {
    if (!this._isHidden) {
      super.draw(camera, material);
    }
  }

  destruct()
  {
    super.destruct();

    this._textMaterial = null;
  }

  private create():void
  {
    var mesh:Mesh = new Mesh(this._renderer);

    var input:string[] = this._text;
    var tableIndex:number = 0;
    var cellWidth:number = 1 / TextRenderable.glyphColumns;
    var cellHeight:number = 1 / TextRenderable.glyphRows;
    var cellOffsetX:number = 0;
    var cellOffsetY:number = 0;
    var uOffset:number = 0;
    var vOffset:number = 0;
    var vertexOffset:number = 0;
    var lineWidth:number = 0;
    var lineHeight:number = (input.length - 1) * this._spacing.y;
    var currentColorIndex:number = 0;
    var currentColor:Vector3 = new Vector3(1,1,1);
    var pivotOffsetX:number = 0;
    var pivotOffsetY:number = 0;

    pivotOffsetY = this._pivotY === TextPivot.CENTER? lineHeight * 0.5 : -0.5;
    pivotOffsetY = this._pivotY === TextPivot.BOTTOM? lineHeight : pivotOffsetY;

    var tmpVertexData: number[] = [];
    var tmpUvData: number[] = [];
    var tmpColorData: number[] = [];
    var tmpNormalData: number[] = [];
    var tmpIndices: number[] = [];

    for (let i:number = 0; i < input.length; i++) {
      lineWidth = this._colors.length > 0? input[i].length - this._colors.length : input[i].length - 1;
      lineWidth = lineWidth * this._spacing.x;

      pivotOffsetX = this._pivotX === TextPivot.CENTER? lineWidth * 0.5 + 0.25: 0.25;
      pivotOffsetX = this._pivotX === TextPivot.RIGHT? lineWidth : pivotOffsetX;
      cellOffsetY = i * this._spacing.y - pivotOffsetY;

      currentColorIndex = -1;

      for (let j:number = 0; j < input[i].length; j++) {
        if (input[i].charCodeAt(j) === 36) { // $

          currentColorIndex++;

          if (this._colors.length > 0) {
            currentColor = Utils.hexToRGB(this._colors[currentColorIndex]);
          }

          continue;
        }

        tableIndex = TextRenderable.mapping[input[i].charCodeAt(j).toString()];
        cellOffsetX = (j - currentColorIndex) * this._spacing.x - pivotOffsetX;
        uOffset = cellWidth * (tableIndex % TextRenderable.glyphColumns);
        vOffset = cellHeight * Math.floor(tableIndex / TextRenderable.glyphColumns);

        tmpVertexData.push(
          -0.5 + cellOffsetX, -0.5 - cellOffsetY,  0.0,
          0.5 + cellOffsetX, -0.5 - cellOffsetY,  0.0,
          0.5 + cellOffsetX,  0.5 - cellOffsetY,  0.0,
          -0.5 + cellOffsetX,  0.5 - cellOffsetY,  0.0
        );

        tmpUvData.push(
          0 + uOffset, 0 + vOffset,
          cellWidth + uOffset, 0 + vOffset,
          cellWidth + uOffset, cellHeight + vOffset,
          0 + uOffset, cellHeight + vOffset
        );

        tmpColorData.push(
          currentColor.x, currentColor.y, currentColor.z,
          currentColor.x, currentColor.y, currentColor.z,
          currentColor.x, currentColor.y, currentColor.z,
          currentColor.x, currentColor.y, currentColor.z,
        );

        tmpNormalData.push(
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1
        );

        tmpIndices.push(
          0 + vertexOffset, 1 + vertexOffset, 2 + vertexOffset,
          2 + vertexOffset, 3 + vertexOffset, 0 + vertexOffset
        );

        vertexOffset += 4;
      }
    }

    var vertexData: Float32Array = new Float32Array(tmpVertexData);
    var uvData: Float32Array = new Float32Array(tmpUvData);
    var colorData: Float32Array = new Float32Array(tmpColorData);
    var normalData: Float32Array = new Float32Array(tmpNormalData);
    var indices: Uint16Array = new Uint16Array(tmpIndices);

    mesh.setVertexData(vertexData);
    mesh.setUVData(uvData);
    mesh.setVertexColorData(colorData);
    mesh.setNormals(normalData);
    mesh.setIndices(indices);

    this.setMesh(mesh);

    this._rawSize = new Vector2(lineWidth, lineHeight);
  }
}
export default TextRenderable;
