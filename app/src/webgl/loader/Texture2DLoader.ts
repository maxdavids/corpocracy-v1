import Texture2D from '../core/Texture2D';
import Renderer from '../core/Renderer';
import IAsset from "./IAsset";

class Texture2DLoader extends Texture2D implements IAsset{
	private _isLoaded:boolean = false;

	private _name:string;
	private _url:string;

	constructor(renderer:Renderer, registerIndex:number, name:string, url:string, mipsEnabled:boolean = false, filterLinear:boolean = true, wrapClamp:boolean = true) {
		super(renderer, registerIndex, mipsEnabled, filterLinear, wrapClamp);
		this._name = name;
		this._url = url;
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
			this.setImage(image);
			//console.log("TextureLoader: image.complete", this.width );
			this._isLoaded = true;
			callback(this);
		}else{
			image.onload = () => {
				this.setImage(image);
				//console.log("TextureLoader: image.onload", this.width );
				this._isLoaded = true;
				callback(this);
			}

			image.onerror = () => {
				console.log("TextureLoader: image.onload error", this._url, this.width );
				this._isLoaded = false;
				errorCallback(this);
			}
		}
	}

}export default Texture2DLoader;
