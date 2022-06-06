import Camera from "./Camera";

/**
 * Created by mdavids on 21/4/2017.
 */
interface IRenderable {
  draw(camera:Camera):void;
  destruct():void;
}
export default IRenderable;
