import Vector2 from "../../../core/Vector2";
import IRenderable from "../../../core/IRenderable";

/**
 * Created by mdavids on 21/4/2017.
 */
interface IUICanvas extends IRenderable {
  translate(pos:Vector2, pivot:Vector2):void;
  resize(vSize:Vector2, scale:Vector2):void;

  refresh():void;

  update():void;

  includesPoint(point:Vector2):boolean;
}
export default IUICanvas;
