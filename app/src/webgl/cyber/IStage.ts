import RenderTexture from "../core/RenderTexture";

/**
 * Created by mdavids on 21/4/2017.
 */
interface IStage {
  resize(width:number, height:number):void;

  update():void;
  draw(toTarget:RenderTexture):void;

  destruct():void;
}
export default IStage;
