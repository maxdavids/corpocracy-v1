/**
 * Created by mdavids on 24/10/2016.
 */
class Clock {
	
	private static startTime:number = 0;
	private static lastTime:number = 0;

	public static globalTime:number = 0;
	public static deltaTime:number = 0;

	public static init():void
	{
		this.startTime = new Date().getTime();
		this.lastTime = this.startTime;

		this.globalTime = 0;
		this.deltaTime = 0;
	}

	public static update():void
	{
		var currentTime:number = Date.now();
		this.globalTime = currentTime - Clock.startTime;
		this.globalTime *= 0.001;

		this.deltaTime = currentTime - this.lastTime;
		this.deltaTime *= 0.001;
		this.deltaTime = Math.min(this.deltaTime, 1.0);

		this.lastTime = currentTime;
	}
}
export default Clock;
