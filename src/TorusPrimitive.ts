import {URLLoaderEvent, URLLoader, URLRequest, URLLoaderDataFormat, ParserUtils, RequestAnimationFrame} from "awayjs-full/lib/core";
import {ElementsType, Sampler2D, ImageUtils} from "awayjs-full/lib/graphics";
import {Sprite, DirectionalLight, StaticLightPicker, PrimitiveTorusPrefab} from "awayjs-full/lib/display";
import {MethodMaterial} from "awayjs-full/lib/materials";
import {View} from "awayjs-full/lib/view";

class TorusPrimitive
{
	private _view:View;
	private _torus:PrimitiveTorusPrefab;
	private _sprite:Sprite;
	private _raf:RequestAnimationFrame;
	private _image:HTMLImageElement;
	private _material:MethodMaterial;
	private _light:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	constructor ()
	{
		this.initView();

		this._raf = new RequestAnimationFrame(this.render, this);
		this._raf.start();

		this.loadResources();
		window.onresize = (event:UIEvent) => this.onResize(event);

		this.onResize();
	}

	/**
	 *
	 */
	private initView()
	{
		this._view = new View();// Create the Away3D View
		this._view.backgroundColor = 0x000000;// Change the background color to black
	}

	/**
	 *
	 */
	private loadResources()
	{
		var imgLoader:URLLoader = new URLLoader();
		imgLoader.dataFormat = URLLoaderDataFormat.BLOB;
		imgLoader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, (event:URLLoaderEvent) => this.urlCompleteHandler(event));
		imgLoader.load(new URLRequest("assets/dots.png"));
	}

	/**
	 *
	 * @param event
	 */
	private urlCompleteHandler (event:URLLoaderEvent)
	{
		this._image = ParserUtils.blobToImage((<URLLoader> event.target).data);
		this._image.onload = (event:Event) => this.imageCompleteHandler(event);
	}

	/**
	 *
	 */
	private initLights()
	{
		this._light = new DirectionalLight();
		this._light.diffuse = .7;
		this._light.specular = 1;
		this._view.scene.addChild(this._light);

		this._lightPicker = new StaticLightPicker([this._light]);
	}

	/**
	 *
	 */
	private initMaterial(image:HTMLImageElement)
	{
		this._material = new MethodMaterial(ImageUtils.imageToBitmapImage2D(image));
		this._material.style.sampler = new Sampler2D(true, true, false);
		this._material.lightPicker = this._lightPicker;
	}

	/**
	 *
	 */
	private initTorus()
	{
		this._torus = new PrimitiveTorusPrefab(this._material, ElementsType.TRIANGLE, 220, 80, 32, 16, false);

		this._sprite = <Sprite> this._torus.getNewObject();

		this._view.scene.addChild(this._sprite);
	}

	/**
	 *
	 */
	private imageCompleteHandler(event:Event)
	{
		this.initLights ();
		this.initMaterial(<HTMLImageElement> event.target);
		this.initTorus ();
	}

	/**
	 *
	 */
	public render(dt:number = null)
	{
		if (this._sprite)
			this._sprite.rotationY += 1;

		this._view.render();
	}

	/**
	 *
	 */
	public onResize(event:UIEvent = null)
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}

window.onload = function()
{
	new TorusPrimitive();
}