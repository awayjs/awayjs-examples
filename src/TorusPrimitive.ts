import {Sampler2D}					from "awayjs-core/lib/image/Sampler2D";
import {URLLoaderEvent}				from "awayjs-core/lib/events/URLLoaderEvent";
import {URLLoader}					from "awayjs-core/lib/net/URLLoader";
import {URLLoaderDataFormat}			from "awayjs-core/lib/net/URLLoaderDataFormat";
import {URLRequest}					from "awayjs-core/lib/net/URLRequest";
import {ParserUtils}					from "awayjs-core/lib/parsers/ParserUtils";
import {RequestAnimationFrame}		from "awayjs-core/lib/utils/RequestAnimationFrame";

import {View}							from "awayjs-display/lib/View";
import {DirectionalLight}				from "awayjs-display/lib/display/DirectionalLight";
import {Sprite}						from "awayjs-display/lib/display/Sprite";
import {ElementsType}					from "awayjs-display/lib/graphics/ElementsType";
import {PrimitiveTorusPrefab}			from "awayjs-display/lib/prefabs/PrimitiveTorusPrefab";
import {StaticLightPicker}			from "awayjs-display/lib/materials/lightpickers/StaticLightPicker";

import {DefaultRenderer}				from "awayjs-renderergl/lib/DefaultRenderer";

import {MethodMaterial}				from "awayjs-methodmaterials/lib/MethodMaterial";

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
		this._view = new View(new DefaultRenderer());// Create the Away3D View
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
		this._material = new MethodMaterial(ParserUtils.imageToBitmapImage2D(image));
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