import Renderer from "../core/Renderer";
import ObjParser from './ObjParser';
import Utils from "../Utils";
import IAsset from "./IAsset";

/**
 * Created by mdavids on 26/4/2017.
 */
class TextLoader implements IAsset {
  private _url:string;
  private _name:string;

  private _text:string;

  private _isLoaded:boolean = false;

  constructor(name:string, url:string) {
    this._name = name;
    this._url = url;
  }

  public getName():string
  {
    return this._name;
  }

  public getText():string
  {
    return this._text;
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
    Utils.loadText(this._url, (text:string)=> {
      this._text = text;

      this._isLoaded = true;

      callback(this);
    });
  }

  public destruct():void
  {

  }
}
export default TextLoader;
