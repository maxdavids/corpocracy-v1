import Renderer from "../../../core/Renderer";
import AssetsLoader from "../../../loader/AssetsLoader";
import {UIActionIndex} from "../LayerGameUI";
import UIButton from "./UIButton";
import UIMaterialPlane from "./materials/UIMaterialPlane";
import Utils from "../../../Utils";
import Vector4 from "../../../core/Vector4";
import UIGlobals from "./UIGlobals";

/**
 * Created by mdavids on 9/7/2017.
 */
class UIButtonTab extends UIButton {

  constructor(renderer:Renderer, loader:AssetsLoader, actionId:UIActionIndex, text:string[], textColors:number[], textSize:number = 10, autoWidth:boolean = false, icon:string = null)
  {
    super(renderer, loader, actionId, text, textColors, textSize, autoWidth, icon);
  }

  protected build():void
  {
    super.build();

    const colorHightlight:Vector4 = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    colorHightlight.w = 0;

    (this._frame.getMaterial() as UIMaterialPlane).borderColorHighlight = colorHightlight;
  }

  public resetColors():void
  {
    super.resetColors();

    const colorHightlight:Vector4 = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    colorHightlight.w = 0;

    (this._frame.getMaterial() as UIMaterialPlane).borderColorHighlight = colorHightlight;
  }

  public select():void
  {
    (this._frame.getMaterial() as UIMaterialPlane).borderSize.w = 3;
    (this._frame.getMaterial() as UIMaterialPlane).borderColorHighlight.w = 1;
  }

  public unselect():void
  {
    (this._frame.getMaterial() as UIMaterialPlane).borderSize.w = 1;
    (this._frame.getMaterial() as UIMaterialPlane).borderColorHighlight.w = 0;
  }

  destruct()
  {
    super.destruct();
  }

}
export default UIButtonTab;
