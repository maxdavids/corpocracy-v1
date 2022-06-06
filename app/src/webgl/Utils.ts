import Vector3 from "./core/Vector3";
import Vector2 from "./core/Vector2";
import Vector4 from "./core/Vector4";
class Utils {

	private static whitespace_both_sides:string = "/^\s+|\s+$/mg";

	public static trim_string(str: string): string {
		return String.prototype.replace.call(
			str, Utils.whitespace_both_sides, '');
	}

	private static browser_prefixes = ['webkit', 'moz', 'ms', 'o'];

	public static get_prefixed_method(object, name) {
		var fn = object[name];
		if (typeof fn === 'function') {
			return fn;
		}

		name = name[0].toUpperCase() + name.substr(1);
		for (var i = 0; i < Utils.browser_prefixes.length; ++i) {
			fn = object[Utils.browser_prefixes[i] + name];
			if (typeof fn === 'function') {
				return fn.bind(object);
			}
		}
		return null;
	}

	public static loadText(path: string, callback: (text: string) => void ) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = (event) => {
			if (xhr.readyState === 4) {
				callback(xhr.responseText);
			}
		};
		xhr.open('GET', path, true);
		xhr.send();
	}

  public static loadBinary(path: string, callback: (text: ArrayBuffer) => void ) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (event) => {
      if (xhr.readyState === 4) {
        callback(xhr.response);
      }
    };
    xhr.open('GET', path, true);
    xhr.responseType = "arraybuffer";
    xhr.send();
  }

	public static loadImage(path: string, callback: (image: HTMLImageElement) => void ) {
		//LogGL.log("Utils.loadImage:load", path);
		var image = new Image();
		image.onload = (() => {
			//LogGL.log("Utils.loadImage:loaded", path);
			callback(image);
		});
		image.src = path;
	}

	public static loadMultipleImages(paths: string[], callback: (images: HTMLImageElement[]) => void ) {
		var to_go = paths.length;
		var images: HTMLImageElement[] = [];

		var receive = (i: number) => (image: HTMLImageElement) => {
			to_go--;
			images[i] = image;
			//console.log("load_many_txts: " + i + ": " + text);
			if (to_go === 0) {
				callback.call(this, images);
			}
		};

		for (var i = 0; i < paths.length; ++i) {
			Utils.loadImage (paths[i], receive(i));
		}
	}

	public static loadMultipleTexts(paths: string[], callback: (texts: string[]) => void ) {
		var to_go = paths.length;
		var texts: string[] = [];

		var receive = (i: number) => (text: string) => {
			to_go--;
			texts[i] = text;
			//console.log("loadMultipleTexts: received: " + i + ": " + text);
			//console.log("loadMultipleTexts: received: " + i);
			if (to_go === 0) {
				callback.call(this, texts);
			}
		};

		for (var i = 0; i < paths.length; ++i) {
			//console.log("loadMultipleTexts: start: " + i + ": " + paths[i]);
			Utils.loadText(paths[i], receive(i));
		}
	}

	public static posMod(x:number, m:number):number
	{
		return (x%m + m)%m;
	}

	public static fract(x:number):number
	{
		return x - Math.floor(x);
	}

	public static lerp(a: number, b: number, i: number): number {
		return ((1 - i) * a) + (i * b);
	}

	public static clamp01(x: number): number {
		return x < 0 ? 0 : (x > 1 ? 1 : x);
	}

	public static smootherStep01(x: number): number {
		return x * x * x * (x * (x * 6 - 15) + 10);
	}

	public static smoothStep01(x: number): number {
		return x*x*(3 - 2*x);
	}

	public static smoothStep(e0:number, e1:number, x: number): number {
		x = Utils.clamp((x - e0)/(e1 - e0), 0.0, 1.0);
		return x*x*(3 - 2*x);
	}

	public static RandomFloat(): number {
		return -1.0 + (Math.random() * 2.0);
	}

	public static RandomPoint(): number[] {
		return [this.RandomFloat(), this.RandomFloat(), this.RandomFloat()];
	}

	public static arrayToString(ar: Float32Array): string {
		var message: string = "";
		for (var i: number = 0; i < ar.length; i++) {
			message += ar[i];
			message += ", ";
		}
		return message;
	}

	public static logFloat32Array(ar: Float32Array) {
		console.log(Utils.arrayToString(ar));
	}

	public static componentToHex(c: number): string {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	public static rgbToHex(r: number, g: number, b: number): string {
		return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	}

	public static normalizedGreyToHex(x: number): string {
		var i: number = Math.round(x * 255);
		return this.rgbToHex(i, i, i);
	}

	public static hexToRGB(hex:number):Vector3 {
	  return new Vector3(
      ((hex >> 16) & 0xFF) / 255,
      ((hex >> 8) & 0xFF) / 255,
      ((hex) & 0xFF) / 255
    )
  }

  public static hexToRGBA(hex:number):Vector4 {
    return new Vector4(
      ((hex >> 16) & 0xFF) / 255,
      ((hex >> 8) & 0xFF) / 255,
      ((hex) & 0xFF) / 255,
      ((hex >> 24) & 0xFF) / 255,
    )
  }

	public static sign(f:number): number {
		return f > 0? 1: (f < 0 ? -1 : 0);
	}

	public static clamp(val: number, min: number, max: number) {
		return Math.min(Math.max(val, min), max);
	}

	public static degToRad(d:number):number
	{
		return d * (Math.PI/ 180);
	}

	public static radToDeg(r:number):number
	{
		return r * (180 / Math.PI);
	}

	public static getBezierPoint(out:Vector3, a:Vector3, b:Vector3, c:Vector3, d:Vector3, t:number):void
  {
    var omt:number = 1 - t;
    var omt2:number = omt * omt;
    var t2:number = t * t;

    var aw:number = omt2 * omt;
    var bw:number = 3 * omt2 * t;
    var cw:number = 3 * omt * t2;
    var dw:number = t2 * t;

    out.x = a.x * aw;
    out.y = a.y * aw;
    out.z = a.z * aw;

    out.x += b.x * bw;
    out.y += b.y * bw;
    out.z += b.z * bw;

    out.x += c.x * cw;
    out.y += c.y * cw;
    out.z += c.z * cw;

    out.x += d.x * dw;
    out.y += d.y * dw;
    out.z += d.z * dw;
  }

	public static intersectPlane(rayPosition:Vector3, rayForward:Vector3, planePos:Vector3, planeNormal:Vector3):Vector3
	{
		var result:Vector3 = new Vector3();

		if (Vector3.dot(rayForward, planeNormal) != 0) {
			var offset:Vector3 = Vector3.subtract(planePos, rayPosition);
			var d = Vector3.dot(offset, planeNormal) / Vector3.dot(rayForward, planeNormal);
			rayForward.multiplyScalar(d)
			result = Vector3.add(rayForward, rayPosition);
		}

		return result;
	}

	public static intersectRect(x:number, y:number, minX:number, maxX:number, minY:number, maxY:number):Vector2
	{
		if ((minX <= x && x <= maxX) && (minY <= y && y <= maxY)) {
		    // A bit hacky, I know
			return new Vector2(999999, 999999);
		}

		var midX:number = (minX + maxX) / 2;
		var midY:number = (minY + maxY) / 2;

		var m:number = (midY - y) / (midX - x);

		if(x <= midX) {
			var minXy = m * (minX - x) + y;
			if(minY < minXy && minXy < maxY)
				return new Vector2(minX, minXy);
		}

		if(x >= midX) {
			var maxXy = m * (maxX - x) + y;
			if(minY < maxXy && maxXy < maxY)
				return new Vector2(maxX, maxXy);
		}

		if(y <= midY) {
			var minYx = (minY - y) / m + x;
			if(minX < minYx && minYx < maxX)
				return new Vector2(minYx, minY);
		}

		if(y >= midY) {
			var maxYx = (maxY - y) / m + x;
			if(minX < maxYx && maxYx < maxX)
				return new Vector2(maxYx, maxY);
		}

		return new Vector2();
	}

  public static intersectSphere(rayPosition:Vector3, rayForward:Vector3, spherePos:Vector3, radius):Vector3
  {
    var a:number = 1;
    var b:number = 2 * rayForward.x * (rayPosition.x - spherePos.x) +  2 * rayForward.y *(rayPosition.y - spherePos.y) + 2 * rayForward.z * (rayPosition.z - spherePos.z);
    var c:number = spherePos.lengthSquared() + rayPosition.lengthSquared() - 2 * (spherePos.x * rayPosition.x + spherePos.y * rayPosition.y + spherePos.z * rayPosition.z) - radius * radius;

    var D:number = b * b - 4 * a * c;

    // No intersection
    if (D < 0) {
      return new Vector3(999999, 999999, 999999);
    }

    var t:number = (-b - Math.sqrt(D)) / (2 * a);

    return new Vector3(rayPosition.x + t * rayForward.x, rayPosition.y + t * rayForward.y, rayPosition.z + t * rayForward.z);
  }
}
export default Utils;
