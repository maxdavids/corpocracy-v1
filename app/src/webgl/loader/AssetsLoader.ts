import IAsset from "./IAsset";
/**
 * Created by mdavids on 14/12/2016.
 */
class AssetsLoader {
	public doneCallback:()=>void;
	public errorCallback:(asset:IAsset)=>void;
	public updateCallback:()=>void;

	public mustStopOnFailure:boolean = true;

	protected _pending:IAsset[] = [];
	protected _loading:IAsset[] = [];

	protected _done:{[index:string]:IAsset} = {};
	protected _doneCounter:number = 0;

	protected _isLoading:Boolean = false;

	constructor() {

	}

	public getPendingCount():number
  {
    return this._pending.length;
  }

  public getLoadingCount():number
  {
    return this._loading.length;
  }

  public getDoneCount():number
  {
    return this._doneCounter;
  }

	public push(asset:IAsset):void
	{
		if (!this._isLoading) {
			this._pending.push(asset);
		}
	}

	public loadAll():void
	{
		if (!this._isLoading) {
			this._isLoading = true;
			this.next();
		}
	}

	public removeAll():void
	{
		this._isLoading = false;

		for (let i:number = 0; i < this._loading.length; i++) {
			this._loading[i].cancel();
			this._loading[i].destruct();
		}

		for (let i:number = 0; i < this._pending.length; i++) {
			this._pending[i].destruct();
		}

		this._pending = [];
		this._loading = [];
	}

	public getIsLoading():Boolean
	{
		return this._isLoading;
	}

	public getAsset(id:string):IAsset
	{
		return this._done[id];
	}

	protected next():void
	{
		if (this._pending.length > 0) {
			var asset:IAsset = this._pending[0];
			this._pending.splice(0, 1);

			this._loading.push(asset);

			asset.load((asset:IAsset)=>this.onAssetSuccess(asset),
						(asset:IAsset)=>this.onAssetFailure(asset));

			this.updateCallback();

		} else {
			this._isLoading = false;

			this.doneCallback();
		}
	}

	protected onAssetSuccess(asset:IAsset):void
	{
		var index:number = this._loading.indexOf(asset);
		if (index >= 0) {
			this._loading.splice(index, 1);

			this._done[asset.getName()] = asset;
			this._doneCounter++;
		}

		if (this._isLoading) {
			this.next();

		} else {
			this._isLoading = false;
		}
	}

	protected onAssetFailure(asset:IAsset):void
	{
		var index:number = this._loading.indexOf(asset);
		if (index >= 0) {
			this._loading.splice(index, 1);
		}

		this.errorCallback(asset);

		if (!this.mustStopOnFailure) {
			this.next();

		} else {
			this._isLoading = false;
		}
	}

	destruct()
	{
		this.removeAll();
	}

}
export default AssetsLoader;
