import Renderer from "../../../core/Renderer";
import Camera from "../../../core/Camera";
import AssetsLoader from "../../../loader/AssetsLoader";
import Renderable from "../../../core/Renderable";
import Mesh from "../../../core/Mesh";
import MeshQuad from "../../../core/MeshQuad";
import UIShaderPlane from "../ui/materials/shaders/UIShaderPlane";
import UIMaterialPlane from "../ui/materials/UIMaterialPlane";
import Texture2DLoader from "../../../loader/Texture2DLoader";
import {TextPivot, default as TextRenderable} from "./TextRenderable";
import Utils from "../../../Utils";
import Vector4 from "../../../core/Vector4";
import IUIWidget from "./IUIWidget";
import Vector2 from "../../../core/Vector2";
import IUIScreen from "./IUIScreen";
import DAppInterface from "../../../../DAppInterface";
import Quaternion from "../../../core/Quaternion";
import Vector3 from "../../../core/Vector3";
import UITokenInvestment from "./UITokenInvestment";
import UIButton from "./UIButton";
import {default as LayerGameUI, UIActionIndex} from "../LayerGameUI";
import UIShaderPlaneSDF from "./materials/shaders/UIShaderPlaneSDF";
import UIGlobals from "./UIGlobals";

const BigNumber = require("bignumber.js");

/**
 * Created by mdavids on 20/8/2018.
 */
class UIPopUpProfile implements IUIScreen {

  public ATTRIBUTES:any = {
    x:-1,
    y:1,
    pivX:-0.5,
    pivY:0.5,
    pxOffX:209,
    pxOffY:-140,
    pxWidth:540,
    pxHeight:740
  };

  protected _pivot:Vector2 = new Vector2(0, 0);
  protected _pos:Vector2 = new Vector2();
  protected _scale:Vector2 = new Vector2(1, 1);

  protected _renderer:Renderer;
  protected _assetsLoader:AssetsLoader;
  protected _layer:LayerGameUI;

  protected _shaderPlane:UIShaderPlane;
  protected _shaderPlaneSDF:UIShaderPlaneSDF;

  protected _vSize:Vector2 = new Vector2();
  protected _vAspect:number = 0;

  protected _renderables:Renderable[] = [];
  protected _widgets:IUIWidget[] = [];

  protected _label:TextRenderable;
  protected _labelIndex:TextRenderable;
  protected _labelPlus:TextRenderable;
  protected _labelArrow:TextRenderable;
  protected _labelDividendsTitle:TextRenderable;
  protected _labelDividends:TextRenderable;
  protected _labelReferralTitle:TextRenderable;
  protected _labelReferral:TextRenderable;
  protected _labelTokens:TextRenderable;
  protected _labelInvestments:TextRenderable;
  protected _labelClaim:TextRenderable;
  protected _labelWithdraw:TextRenderable;

  protected _frame:Renderable;
  protected _frameDot:Renderable;
  protected _square:Renderable;
  protected _iconDividends:Renderable;
  protected _iconReferral:Renderable;
  protected _iconTokens:Renderable;

  protected _line1:Renderable;
  protected _line2:Renderable;
  protected _line3:Renderable;
  protected _line4:Renderable;
  protected _line5:Renderable;
  protected _line6:Renderable;
  protected _line7:Renderable;
  protected _line8:Renderable;
  protected _line9:Renderable;

  protected _investments:UITokenInvestment[] = [];

  protected _btnClaim:UIButton;
  protected _btnWithdraw:UIButton;

  protected _uiData:any = {
    frame:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:0, pxOffY:0, pxWidth:240, pxHeight:60 },
    frame_dot:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:83, pxOffY:11, pxWidth:3, pxHeight:3 },
    square:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-206, pxWidth:11, pxHeight:11 },

    label:{ x:-1, y:1, pxOffX:70, pxOffY:-40, pxHeight:20 },
    label_index:{ x:-1, y:1, pxOffX:40, pxOffY:-60, pxHeight:11 },
    label_plus:{ x:1, y:1, pxOffX:-40, pxOffY:-38, pxHeight:16 },
    label_arrow:{ x:1, y:-1, pxOffX:-45, pxOffY:40, pxHeight:11 },

    label_tokens:{ x:-1, y:1, pxOffX:90, pxOffY:-135, pxHeight:11 },
    label_investments:{ x:-1, y:1, pxOffX:65, pxOffY:-205, pxHeight:14 },

    label_claim:{ x:-1, y:1, pxOffX:300, pxOffY:-405, pxHeight:11 },
    label_withdraw:{ x:-1, y:1, pxOffX:300, pxOffY:-615, pxHeight:11 },

    label_dividends_title:{ x:-1, y:1, pxOffX:90, pxOffY:-530, pxHeight:11 },
    label_dividends:{ x:-1, y:1, pxOffX:90, pxOffY:-555, pxHeight:11 },

    label_referral_title:{ x:-1, y:1, pxOffX:345, pxOffY:-530, pxHeight:11 },
    label_referral:{ x:-1, y:1, pxOffX:345, pxOffY:-555, pxHeight:11 },

    icon_tokens:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:25, pxOffY:-104, pxWidth:60, pxHeight:60 },
    icon_dividends:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:25, pxOffY:-514, pxWidth:60, pxHeight:60 },
    icon_referral:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:285, pxOffY:-514, pxWidth:60, pxHeight:60 },

    line_1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-90, pxWidth:460, pxHeight:1 },

    line_2:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:268, pxOffY:-515, pxWidth:1, pxHeight:60 },
    line_3:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-590, pxWidth:460, pxHeight:1 },

    line_4:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-175, pxWidth:460, pxHeight:1 },
    line_5:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:268, pxOffY:-235, pxWidth:1, pxHeight:120 },
    line_6:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-295, pxWidth:460, pxHeight:1 },
    line_7:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-380, pxWidth:460, pxHeight:1 },

    line_8:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-490, pxWidth:460, pxHeight:5 },

    line_9:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-700, pxWidth:460, pxHeight:1 },

    investment0:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-252, pxWidth:200, pxHeight:60 },
    investment1:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:300, pxOffY:-252, pxWidth:200, pxHeight:60 },
    investment2:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-322, pxWidth:200, pxHeight:60 },
    investment3:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:300, pxOffY:-322, pxWidth:200, pxHeight:60 },

    btn_claim:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-406, pxWidth:200, pxHeight:50 },
    btn_withdraw:{ x:-1, y:1, pivX:-0.5, pivY:0.5, pxOffX:40, pxOffY:-616, pxWidth:200, pxHeight:50 },
  };

  constructor(renderer:Renderer, loader:AssetsLoader, layer:LayerGameUI, width:number = 1, height:number = 1) {
    this._renderer = renderer;
    this._assetsLoader = loader;
    this._layer = layer;

    this._shaderPlane = new UIShaderPlane(this._renderer);
    this._shaderPlaneSDF = new UIShaderPlaneSDF(this._renderer);

    this._vSize.x = width;
    this._vSize.y = height;

    this.build();
  }

  protected build():void
  {
    const mesh: Mesh = new MeshQuad(this._renderer);

    this._frame = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._frame.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frame);

    this._frameDot = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._frameDot.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._frameDot);

    this._square = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._square.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._square);

    this._line1 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line1);

    this._line2 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line2.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff211f1e);
    (this._line2.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff211f1e);
    (this._line2.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line2);

    this._line3 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line3.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff211f1e);
    (this._line3.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff211f1e);
    (this._line3.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line3);

    this._line4 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line4.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff211f1e);
    (this._line4.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff211f1e);
    (this._line4.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line4);

    this._line5 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line5.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff211f1e);
    (this._line5.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff211f1e);
    (this._line5.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line5);

    this._line6 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line6.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff211f1e);
    (this._line6.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff211f1e);
    (this._line6.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line6);

    this._line7 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line7.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(0xff211f1e);
    (this._line7.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff211f1e);
    (this._line7.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line7);

    this._line8 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line8.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._line8.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line8.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 1, 0, 1);
    this._renderables.push(this._line8);

    this._line9 = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlane));
    (this._line9.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line9.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line9.getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._renderables.push(this._line9);

    this._iconDividends = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF));
    this._iconDividends.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_dividends") as Texture2DLoader);
    (this._iconDividends.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconDividends.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._iconDividends.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);
    this._renderables.push(this._iconDividends);

    this._iconReferral = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF));
    this._iconReferral.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_referral") as Texture2DLoader);
    (this._iconReferral.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconReferral.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._iconReferral.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);
    this._renderables.push(this._iconReferral);

    this._iconTokens = new Renderable(this._renderer, mesh, new UIMaterialPlane(this._renderer, this._shaderPlaneSDF));
    this._iconTokens.getMaterial().setTexture(this._assetsLoader.getAsset("tex_icon_tokens") as Texture2DLoader);
    (this._iconTokens.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderSize = new Vector4(0, 0, 0, 0);
    this._renderables.push(this._iconTokens);

    this._label = new TextRenderable(this._renderer, ["$_USER PROFILE"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP);
    this._label.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._label);

    this._labelIndex = new TextRenderable(this._renderer, ["$02"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.85);
    this._labelIndex.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelIndex.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._labelIndex.getMaterial().rotation = Quaternion.fromEuler(new Vector3(0, 0, Math.PI * 0.5));
    this._renderables.push(this._labelIndex);

    this._labelPlus = new TextRenderable(this._renderer, ["$+"], [UIGlobals.CURRENT_COLOR2], TextPivot.RIGHT, TextPivot.TOP);
    this._labelPlus.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelPlus.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelPlus);

    this._labelArrow = new TextRenderable(this._renderer, ["$ {"], [UIGlobals.CURRENT_COLOR3], TextPivot.RIGHT, TextPivot.CENTER);
    this._labelArrow.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelArrow.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelArrow);

    this._labelDividendsTitle = new TextRenderable(this._renderer, ["$DIVIDENDS"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP);
    this._labelDividendsTitle.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelDividendsTitle.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelDividendsTitle);

    this._labelDividends = new TextRenderable(this._renderer, ["$0#"], [0xfff0f0f0], TextPivot.LEFT, TextPivot.BOTTOM);
    this._labelDividends.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelDividends.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelDividends);

    this._labelReferralTitle = new TextRenderable(this._renderer, ["$REFERRAL BONUS"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP);
    this._labelReferralTitle.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelReferralTitle.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelReferralTitle);

    this._labelReferral = new TextRenderable(this._renderer, ["$0#"], [0xfff0f0f0], TextPivot.LEFT, TextPivot.BOTTOM);
    this._labelReferral.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelReferral.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelReferral);

    this._labelTokens = new TextRenderable(this._renderer, ["$TOKENS > $0"], [UIGlobals.CURRENT_COLOR2, 0xfff0f0f0], TextPivot.LEFT, TextPivot.CENTER);
    this._labelTokens.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelTokens.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelTokens);

    this._labelInvestments = new TextRenderable(this._renderer, ["$_INVESTMENTS / 1 Ready to claim"], [UIGlobals.CURRENT_COLOR2], TextPivot.LEFT, TextPivot.TOP, 0.75);
    this._labelInvestments.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelInvestments.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelInvestments);

    this._labelClaim = new TextRenderable(this._renderer, ["$You have tokens to claim","00000","","<","<"], [0xff696766], TextPivot.LEFT, TextPivot.TOP, 0.65);
    this._labelClaim.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelClaim.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelClaim);

    this._labelWithdraw = new TextRenderable(this._renderer, ["$You have ether to withdraw","00000#","","<","<"], [0xff696766], TextPivot.LEFT, TextPivot.TOP, 0.65);
    this._labelWithdraw.getMaterial().setTexture(this._assetsLoader.getAsset("tex_glyphs") as Texture2DLoader);
    this._labelWithdraw.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._renderables.push(this._labelWithdraw);

    for (let i:number = 3; i >= 0; i--) {
      let raidId:string = DAppInterface.instance.playerData["raidIds"][i].toFixed();
      let investment:UITokenInvestment = new UITokenInvestment(this._renderer, this._assetsLoader, i);
      investment.setData(DAppInterface.instance.raidsData[raidId]);
      this._investments.push(investment);
      this._widgets.push(investment);
    }

    this._btnClaim = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.CLAIM_TOKENS, ["$CLAIM TOKENS"], [0xff615e5e], 10, false);
    (this._btnClaim.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._btnClaim.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    (this._btnClaim.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnClaim.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._widgets.push(this._btnClaim);

    this._btnWithdraw = new UIButton(this._renderer, this._assetsLoader, UIActionIndex.WITHDRAW_ETHER, ["$WITHDRAW ETHER"], [0xff615e5e], 10, false);
    (this._btnWithdraw.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._btnWithdraw.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    (this._btnWithdraw.getFrame().getMaterial() as UIMaterialPlane).borderSize = new Vector4(1, 1, 1, 1);
    this._btnWithdraw.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._widgets.push(this._btnWithdraw);


    // actions
    this._layer.addAction(UIActionIndex.CLAIM_TOKENS, ()=>this.onClaimTokens());
    this._layer.addAction(UIActionIndex.WITHDRAW_ETHER, ()=>this.onWithdrawEther());


    // this.refresh();
    // this.resize(this._vSize, this._scale);
  }

  public open():void
  {

  }

  public close():void
  {

  }

  public loseFocus():void
  {

  }

  public regainFocus():void
  {

  }

  public resize(vSize:Vector2, scale:Vector2):void
  {
    this._vSize.x = vSize.x;
    this._vSize.y = vSize.y;
    this._vAspect = this._vSize.x / this._vSize.y;

    this._scale = scale == null? this._scale : scale;
    this._scale.x /= UIGlobals.PIXEL_SIZE;
    this._scale.y /= UIGlobals.PIXEL_SIZE;

    this.transformElements();
  }

  public translate(pos:Vector2, pivot:Vector2):void
  {
    this._pivot = pivot;
    this._pos = pos;

    const tmpOffset:Vector2 = new Vector2();
    tmpOffset.x = this._scale.x * (this._pivot.x + 0.5) * 2;
    tmpOffset.y = this._scale.y * (this._pivot.y + 0.5) * 2;

    this._pos.subtract(tmpOffset);
  }

  public transformElements():void
  {
    const frameData:any = this._uiData["frame"];
    frameData.pxWidth = this._scale.x * this._vSize.x / UIGlobals.PIXEL_SIZE;
    frameData.pxHeight = this._scale.y * this._vSize.y / UIGlobals.PIXEL_SIZE;

    this.transformElement2D("frame", this._frame);
    this.transformElement2D("frame_dot", this._frameDot);
    this.transformElement2D("square", this._square);
    this.transformElement2D("icon_dividends", this._iconDividends);
    this.transformElement2D("icon_referral", this._iconReferral);
    this.transformElement2D("icon_tokens", this._iconTokens);

    this.transformElement2D("line_1", this._line1);
    this.transformElement2D("line_2", this._line2);
    this.transformElement2D("line_3", this._line3);
    this.transformElement2D("line_4", this._line4);
    this.transformElement2D("line_5", this._line5);
    this.transformElement2D("line_6", this._line6);
    this.transformElement2D("line_7", this._line7);
    this.transformElement2D("line_8", this._line8);
    this.transformElement2D("line_9", this._line9);

    this.transformTextElement2D("label", this._label);
    this.transformTextElement2D("label_index", this._labelIndex);
    this.transformTextElement2D("label_plus", this._labelPlus);
    this.transformTextElement2D("label_arrow", this._labelArrow);
    this.transformTextElement2D("label_dividends_title", this._labelDividendsTitle);
    this.transformTextElement2D("label_dividends", this._labelDividends);
    this.transformTextElement2D("label_referral_title", this._labelReferralTitle);
    this.transformTextElement2D("label_referral", this._labelReferral);
    this.transformTextElement2D("label_tokens", this._labelTokens);
    this.transformTextElement2D("label_investments", this._labelInvestments);
    this.transformTextElement2D("label_claim", this._labelClaim);
    this.transformTextElement2D("label_withdraw", this._labelWithdraw);

    for (let i:number = 0; i < 4; i++) {
      this.transformWidget("investment" + i.toFixed(), this._investments[i]);
    }

    this.transformWidget("btn_claim", this._btnClaim);
    this.transformWidget("btn_withdraw", this._btnWithdraw);
  }

  private transformElement2D(dataId:string, element:Renderable):void
  {
    const pixelSizeX:number = 1 / this._vSize.x * 2;
    const pixelSizeY:number = 1 / this._vSize.y * 2;

    const data:any = this._uiData[dataId];

    const scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * UIGlobals.PIXEL_SIZE : data.width;
    const scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;

    (element.getMaterial() as UIMaterialPlane).pos.x = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    (element.getMaterial() as UIMaterialPlane).pos.y = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;
    (element.getMaterial() as UIMaterialPlane).scale.x = scaleX;
    (element.getMaterial() as UIMaterialPlane).scale.y = scaleY;
    (element.getMaterial() as UIMaterialPlane).pivot.x = data.pivX;
    (element.getMaterial() as UIMaterialPlane).pivot.y = data.pivY;
  }

  private transformTextElement2D(dataId:string, element:TextRenderable):void
  {
    const pixelSizeX:number = 1 / this._vSize.x * 2;
    const pixelSizeY:number = 1 / this._vSize.y * 2;

    const data:any = this._uiData[dataId];

    const posX:number = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    const posY:number = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;
    const scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;
    const scaleX:number = scaleY / this._vAspect;

    element.setPosition(posX, posY);
    element.setScale(scaleX, scaleY);
  }

  private transformWidget(dataId:string, element:IUIWidget):void
  {
    const pixelSizeX:number = 1 / this._vSize.x * 2;
    const pixelSizeY:number = 1 / this._vSize.y * 2;

    const data:any = this._uiData[dataId];

    const scaleX:number = (data.pxWidth)? data.pxWidth * pixelSizeX * 0.5 * UIGlobals.PIXEL_SIZE : data.width;
    const scaleY:number = (data.pxHeight)? data.pxHeight * pixelSizeY * 0.5 * UIGlobals.PIXEL_SIZE : data.height;

    const posX:number = this._pos.x + this._scale.x * (data.x * 0.5 + 0.5) * 2 + data.pxOffX * pixelSizeX * UIGlobals.PIXEL_SIZE;
    const posY:number = this._pos.y + this._scale.y * (data.y * 0.5 + 0.5) * 2 + data.pxOffY * pixelSizeY * UIGlobals.PIXEL_SIZE;

    element.resize(this._vSize, new Vector2(scaleX, scaleY));
    element.translate(new Vector2(posX, posY), new Vector2(data.pivX, data.pivY));

    element.refresh();
  }

  public includesPoint(point:Vector2):boolean
  {
    return (this._pos.x <= point.x &&
      this._pos.y <= point.y &&
      this._pos.x + this._scale.x * 2 >= point.x &&
      this._pos.y + this._scale.y * 2 >= point.y);
  }

  public update():void
  {

  }

  public draw(camera:Camera):void
  {
    for (let i:number = 0; i < this._renderables.length; i++) {
      this._renderables[i].draw(camera);
    }

    for (let i:number = 0; i < this._widgets.length; i++) {
      this._widgets[i].draw(camera);
    }
  }

  destruct()
  {

  }

  public refresh():void
  {
    const playerData:any = DAppInterface.instance.playerData;
    const raidsData:any = DAppInterface.instance.raidsData;

    const tokenBalance:any = playerData["tokenBalance"];
    const dividends:any = playerData["dividends"];
    const referralBalance:any = playerData["referralBalance"];

    let dividendsTxt:string = dividends.toFixed();
    const commaIndex:number = dividendsTxt.lastIndexOf(".");
    dividendsTxt = dividendsTxt.substr(0, commaIndex + 10);

    this._labelTokens.setText(["$TOKENS > $" + tokenBalance.toFixed()]);
    this._labelDividends.setText(["$" + dividendsTxt + "#"]);
    this._labelReferral.setText(["$" + referralBalance.toFixed() + "#"]);

    let unclaimedRaidStakes:any = new BigNumber('0');
    let readyToClaimCount:number = 0;

    for (let i:number = 3; i >= 0; i--) {
      const raidId:any = playerData["raidIds"][i];
      const raid:any = raidsData[raidId.toFixed()];

      this._investments[3 - i].setData(raid);

      // console.log(raidId.toFixed(), raid["hasEnded"], playerData["raidStakes"][i].toFixed());

      if (raidId.gt(0)) {
        if (raid["hasBeenRevealed"]) {
          const stakesToClaim:any = playerData["raidStakes"][i];
          unclaimedRaidStakes = unclaimedRaidStakes.plus(stakesToClaim);
          readyToClaimCount++;
        }
      }
    }

    if (unclaimedRaidStakes.gt(0)) {
      this._labelInvestments.setText(["$_INVESTMENTS / " + readyToClaimCount.toFixed() + " Ready to claim"]);

      this._labelClaim.setText(["$You have tokens to claim",unclaimedRaidStakes.toFixed(),"","<","<"]);
      this._labelClaim.setColors([0xfff0f0f0]);

      this._btnClaim.enable();
      (this._btnClaim.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xfff0f0f0);

    } else {
      this._labelInvestments.setText(["$_INVESTMENTS"]);

      this._labelClaim.setText(["$You have no tokens to claim","","","<","<"]);
      this._labelClaim.setColors([0xff696766]);

      this._btnClaim.disable();
      (this._btnClaim.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    }

    let etherToWithdraw:any = dividends.plus(referralBalance);
    if (etherToWithdraw.gt(0)) {
      this._labelWithdraw.setText(["$You have ether to withdraw",etherToWithdraw.toFixed() + "#","","<","<"]);
      this._labelWithdraw.setColors([0xfff0f0f0]);

      this._btnWithdraw.enable();
      (this._btnWithdraw.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xfff0f0f0);

    } else {
      this._labelWithdraw.setText(["$You have no ether to withdraw","","","<","<"]);
      this._labelWithdraw.setColors([0xff696766]);

      this._btnWithdraw.disable();
      (this._btnWithdraw.getFrame().getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(0xff615e5e);
    }

    this.refreshUIColors();
    this.transformElements();
  }

  protected refreshUIColors():void
  {
    (this._frame.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._frame.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._frameDot.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._frameDot.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._square.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);
    (this._square.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._line1.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);
    (this._line1.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line8.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._line8.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR1);

    (this._line9.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);
    (this._line9.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR3);

    (this._iconDividends.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconDividends.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._iconReferral.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconReferral.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    (this._iconTokens.getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    (this._iconTokens.getMaterial() as UIMaterialPlane).borderColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR2);

    this._label.setColors([UIGlobals.CURRENT_COLOR2]);
    this._label.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelIndex.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelIndex.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelPlus.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelPlus.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelArrow.setColors([UIGlobals.CURRENT_COLOR3]);
    this._labelArrow.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelDividendsTitle.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelDividendsTitle.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelReferralTitle.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelReferralTitle.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelTokens.setColors([UIGlobals.CURRENT_COLOR2, 0xfff0f0f0]);
    this._labelTokens.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    this._labelInvestments.setColors([UIGlobals.CURRENT_COLOR2]);
    this._labelInvestments.getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    for (let i:number = 3; i >= 0; i--) {
      this._investments[i].resetColors();
    }

    (this._btnClaim.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._btnClaim.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);

    (this._btnWithdraw.getFrame().getMaterial() as UIMaterialPlane).fillColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
    this._btnWithdraw.getLabel().getMaterial().backColor = Utils.hexToRGBA(UIGlobals.CURRENT_COLOR0);
  }

  private onClaimTokens():void
  {
    // console.log("onClaimTokens");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    if (playerData.initialized) {
      this._btnClaim.disable();
      dAppInstance.claimTokens(
        (hash:string) => this._btnClaim.enable(),
        (receipt:any) => {},
        (error:any) => this._btnClaim.enable()
      );
    }
  }

  private onWithdrawEther():void
  {
    // console.log("onWithdrawEther");

    const dAppInstance:DAppInterface = DAppInterface.instance;
    const playerData:any = dAppInstance.playerData;

    if (playerData.initialized) {
      this._btnWithdraw.disable();
      dAppInstance.withdrawEther(
        (hash:string) => this._btnWithdraw.enable(),
        (receipt:any) => {},
        (error:any) => this._btnWithdraw.enable()
      );
    }
  }
}
export default UIPopUpProfile;
