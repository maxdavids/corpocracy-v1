import UIMaterialPlane from "./materials/UIMaterialPlane";
import Renderable from "../../../core/Renderable";
import Vector2 from "../../../core/Vector2";
import {default as TextRenderable} from "./TextRenderable";
import IUICanvas from "./IUICanvas";

class UIUtils {
  public static transformElement2D(data:any, element:Renderable, vSize:Vector2, pxSize:number):void
  {
    var pixelSizeX:number = 1 / vSize.x * 2;
    var pixelSizeY:number = 1 / vSize.y * 2;

    var scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * pxSize : data.width;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * pxSize : data.height;

    (element.getMaterial() as UIMaterialPlane).pos.x = data.x + data.pxOffX * pixelSizeX * pxSize;
    (element.getMaterial() as UIMaterialPlane).pos.y = data.y + data.pxOffY * pixelSizeY * pxSize;
    (element.getMaterial() as UIMaterialPlane).scale.x = scaleX;
    (element.getMaterial() as UIMaterialPlane).scale.y = scaleY;
    (element.getMaterial() as UIMaterialPlane).pivot.x = data.pivX;
    (element.getMaterial() as UIMaterialPlane).pivot.y = data.pivY;
  }

  public static transformTextElement2D(data:any, element:TextRenderable, vSize:Vector2, pxSize:number):void
  {
    var pixelSizeX:number = 1 / vSize.x * 2;
    var pixelSizeY:number = 1 / vSize.y * 2;
    var aspect:number = vSize.x / vSize.y;

    var posX:number = data.x + data.pxOffX * pixelSizeX * pxSize;
    var posY:number = data.y + data.pxOffY * pixelSizeY * pxSize;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * pxSize : data.height;
    var scaleX:number = scaleY / aspect;

    element.setPosition(posX, posY);
    element.setScale(scaleX, scaleY);
  }

  public static transformCanvas(data:any, element:IUICanvas, vSize:Vector2, pxSize:number):void
  {
    var pixelSizeX:number = 1 / vSize.x * 2;
    var pixelSizeY:number = 1 / vSize.y * 2;

    var scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * pxSize : data.width;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * pxSize : data.height;

    var posX:number = data.x + data.pxOffX * pixelSizeX * pxSize;
    var posY:number = data.y + data.pxOffY * pixelSizeY * pxSize;

    element.resize(vSize, new Vector2(scaleX, scaleY));
    element.translate(new Vector2(posX, posY), new Vector2(data.pivX, data.pivY));

    element.refresh();
  }

  public static transformPopUp(data:any, element:IUICanvas, vSize:Vector2, pxSize:number):void
  {
    var pixelSizeX:number = pxSize / vSize.x * 2;
    var pixelSizeY:number = pxSize / vSize.y * 2;

    var scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * pxSize : data.width;
    var scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * pxSize : data.height;

    var posX:number = data.x + data.pxOffX * pixelSizeX;
    var posY:number = data.y + data.pxOffY * pixelSizeY;

    element.resize(vSize, new Vector2(scaleX, scaleY));
    element.translate(new Vector2(posX, posY), new Vector2(data.pivX, data.pivY));

    element.refresh();
  }

  public static clampText(text:string, decimals:number = 6):string
  {
    const commaIndex:number = text.lastIndexOf(".");
    if (commaIndex > 0) {
      return text.substr(0, commaIndex + decimals);

    } else {
      return text;
    }
  }
}
export default UIUtils;
