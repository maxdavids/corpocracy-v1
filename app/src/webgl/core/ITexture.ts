/**
 * Created by mdavids on 21/4/2017.
 */
interface ITexture {
  registerIndex:number;

  width:number;
  height:number;
  aspect:number;

  bind();
  destruct():void;
}
export default ITexture;
