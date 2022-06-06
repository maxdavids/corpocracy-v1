import Renderer from '../core/Renderer';
import IAsset from "./IAsset";
import Texture2DArray from "../core/Texture2DArray";

class Texture2DArrayLoader extends Texture2DArray implements IAsset {
  private _isLoaded:boolean = false;

  private _name:string;
  private _urls:string[];
  private _pending:number = 0;

  private _currentUrlIndex:number = -1;

  constructor(renderer:Renderer, registerIndex:number, name:string, urls:string[]) {
    super(renderer, registerIndex, urls.length);

    this._name = name;
    this._urls = urls;

    this._pending = this._urls.length - 1;
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
    this.loadNextSlice(callback, errorCallback);
  }

  private loadNextSlice(callback:(asset:IAsset)=>void, errorCallback:(asset:IAsset)=>void):void
  {
    this._currentUrlIndex++;
    // console.log(this._currentUrlIndex);

    var image = new Image();
    //image.crossOrigin = "Anonymous";
    //image.crossOrigin = "";

    image.src =  this._urls[this._currentUrlIndex];
    if(image.complete){
      this.setLevel(image, this._currentUrlIndex);
      //console.log("TextureLoader: image.complete", this.width );

      if (this._pending <= this._currentUrlIndex){
        this._isLoaded = true;

        this.generateMips();
        callback(this);

      } else {
        this.loadNextSlice(callback, errorCallback);
      }
    }else{
      image.onload = () => {
        this.setLevel(image, this._currentUrlIndex);
        //console.log("TextureLoader: image.complete", this.width );

        if (this._pending <= this._currentUrlIndex){
          this._isLoaded = true;

          this.generateMips();
          callback(this);

        } else {
          this.loadNextSlice(callback, errorCallback);
        }
      }

      image.onerror = () => {
        console.log("TextureArrayLoader: image.onload error", this._urls[this._currentUrlIndex], this.width);
        this._isLoaded = false;
        errorCallback(this);
      }
    }
  }

}export default Texture2DArrayLoader;
