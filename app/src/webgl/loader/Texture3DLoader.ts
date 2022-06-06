import Renderer from '../core/Renderer';
import IAsset from "./IAsset";
import Texture3D from "../core/Texture3D";

/**
 * Created by mdavids on 30/4/2017.
 */
class Texture3DLoader extends Texture3D implements IAsset{
  private _isLoaded:boolean = false;

  private _name:string;
  private _url:string;

  constructor(renderer:Renderer, registerIndex:number, name:string, url:string, width:number, height:number, depth:number) {
    super(renderer, registerIndex);

    this._name = name;
    this._url = url;

    this.width = width;
    this.height = height;
    this.depth = depth;
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
    var image = new Image();
    //image.crossOrigin = "Anonymous";
    //image.crossOrigin = "";

    image.src =  this._url;
    if(image.complete){
      this.setImage(image, this.width, this.height, this.depth);
      //console.log("TextureLoader: image.complete", this.width );
      this._isLoaded = true;
      callback(this);
    }else{
      image.onload = () => {
        this.setImage(image, this.width, this.height, this.depth);
        //console.log("TextureLoader: image.onload", this.width );
        this._isLoaded = true;
        callback(this);
      }

      image.onerror = () => {
        console.log("Texture3DLoader: image.onload error", this._url, this.width );
        this._isLoaded = false;
        errorCallback(this);
      }
    }
  }

} export default Texture3DLoader;
