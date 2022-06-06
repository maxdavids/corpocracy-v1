import WebGLRoot from "./webgl/WebGLRoot";
import DAppInterface from "./DAppInterface";

class DAppRoot
{
  private _dAppInterface:DAppInterface;

  private _canvasParent:HTMLElement;
  private _webglRoot:WebGLRoot;

  public constructor()
  {

  }

  public init():void {
    this._dAppInterface = new DAppInterface();

    this._canvasParent = document.getElementById('webgl');

    this._webglRoot = new WebGLRoot();
    this._webglRoot.init(
      this._canvasParent,
      () => {},
      () => {
        this._canvasParent.style.display = 'none';
        document.getElementById('error-message').style.visibility = 'visible';
      });
  }

  destruct()
  {
    this._webglRoot.destruct();
  }
}
export default DAppRoot;
