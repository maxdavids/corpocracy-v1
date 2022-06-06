import Mesh from "./Mesh";
import Material from "./Material";
import Camera from "./Camera";
import Renderer from "./Renderer";
import Transform from "./Transform";
import IRenderable from "./IRenderable";

/**
 * Created by mdavids on 20/04/2016.
 */
class Renderable implements IRenderable
{
  protected _renderer:Renderer;
  protected _transform:Transform;

  protected _mesh:Mesh;
  protected _material:Material;

  constructor(renderer:Renderer, mesh:Mesh = null, material:Material = null) {
    //super();

    this._renderer = renderer;

    this._mesh = mesh;
    this._material = material;

    this._transform = new Transform();
  }

  public setMesh(mesh:Mesh):void
  {
    this._mesh = mesh;
  }

  public getMesh():Mesh
  {
    return this._mesh;
  }

  public setMaterial(material:Material):void
  {
    this._material = material;
  }

  public getMaterial():Material
  {
    return this._material;
  }

  public getTransform():Transform
  {
    return this._transform;
  }

  public draw(camera:Camera, material:Material = null) {
    this._mesh.draw(camera, material? material : this._material, this);
  }

  destruct()
  {
    if (this._mesh) {
      this._mesh.destruct();
    }

    if (this._material) {
      this._material.destruct();
    }
  }
}
export default Renderable;
