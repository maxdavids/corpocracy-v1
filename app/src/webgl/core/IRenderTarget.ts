/**
 * Created by mdavids on 21/4/2017.
 */
interface IRenderTarget {
  frameBuffer:WebGLFramebuffer;
  sizeMultiplier:number;

  width:number;
  height:number;

  setSize(width:number, height:number):void;
  setAsTarget():void;

  getScaleToCanvas():boolean;

  destruct():void;
}
export default IRenderTarget;
