class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = null, y: number = null) {
    this.x = x ? x : 0;
    this.y = y ? y : 0;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public copy(v:Vector2): void {
    this.x = v.x;
    this.y = v.y;
  }

  public add(v:Vector2): void {
    this.x += v.x;
    this.y += v.y;
  }

  public subtract(v:Vector2): void {
    this.x -= v.x;
    this.y -= v.y;
  }

  public normalize(): Vector2 {
    var l: number = this.length();
    this.x /= l;
    this.y /= l;
    return this;
  }

  public length(): number {
    return Math.sqrt((this.x * this.x) + (this.y * this.y));
  }

  public setTo(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public mulScalar(f: number) {
    this.x *= f;
    this.y *= f;
  }

  public cross():void
  {
    var tmp:number = this.x;
    this.x = -this.y;
    this.y = tmp;
  }

  public setFromDegrees(degrees:number):void
  {
    this.setFromRadians((degrees /180) * Math.PI);
  }

  public setFromRadians(radians:number):void
  {
    this.x = Math.sin(radians);
    this.y = Math.cos(radians);
  }

  public static lerp(a:Vector2, b:Vector2, c:number):Vector2
  {
    return new Vector2(a.x * (1 - c) + b.x * c, a.y * (1 - c) + b.y * c);
  }

  public static subtract(a:Vector2, b:Vector2):Vector2
  {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  public static subtractRef(a:Vector2, b:Vector2, refOut:Vector2):void
  {
    refOut.x = a.x - b.x;
    refOut.y = a.y - b.y;
  }

  public static multiply(a:Vector2, b:Vector2):Vector2
  {
    return new Vector2(a.x * b.x, a.y * b.y);
  }

  public static cross(v:Vector2):Vector2
  {
    return new Vector2( -v.y, v.x);
  }

  public static distance(a:Vector2, b:Vector2):number
  {
    var dx:number = a.x - b.x;
    var dy:number = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  public static dot(a:Vector2, b:Vector2):number
  {
    return a.x * b.x + a.y * b.y;
  }

  public static fromDegrees(r:number):Vector2
  {
    return this.fromRadians((r/180)*Math.PI);
  }

  public static fromRadians(r:number):Vector2
  {
    return new Vector2( Math.sin(r), Math.cos(r));
  }

  public toString():string{
    return this.x + "," + this.y + ",";
  }
}

export default Vector2;
