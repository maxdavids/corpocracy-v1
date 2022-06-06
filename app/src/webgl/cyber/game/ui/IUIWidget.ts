import IUICanvas from "./IUICanvas";

/**
 * Created by mdavids on 21/4/2017.
 */
interface IUIWidget extends IUICanvas {
  show():void;
  hide():void;
}
export default IUIWidget;
