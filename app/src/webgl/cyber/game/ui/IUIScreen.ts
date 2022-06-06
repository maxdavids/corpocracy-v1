import IUICanvas from "./IUICanvas";

/**
 * Created by mdavids on 21/4/2017.
 */
interface IUIScreen extends IUICanvas{
  ATTRIBUTES:any;

  open():void;
  close():void;

  loseFocus():void;
  regainFocus():void;

  refresh():void;
}
export default IUIScreen;
