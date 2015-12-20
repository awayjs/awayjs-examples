import URLLoaderEvent				= require("awayjs-core/lib/events/URLLoaderEvent");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import URLLoader					= require("awayjs-core/lib/net/URLLoader");
import URLLoaderDataFormat			= require("awayjs-core/lib/net/URLLoaderDataFormat");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import ParserUtils					= require("awayjs-core/lib/parsers/ParserUtils");
import PerspectiveProjection		= require("awayjs-core/lib/projections/PerspectiveProjection");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import View							= require("awayjs-display/lib/containers/View");
import DirectionalLight				= require("awayjs-display/lib/entities/DirectionalLight");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import Skybox						= require("awayjs-display/lib/entities/Skybox");
import PrimitiveTorusPrefab			= require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import Single2DTexture				= require("awayjs-display/lib/textures/Single2DTexture");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");

class TorusPrimitive
{
	private _view:View;
	private _torus:PrimitiveTorusPrefab;
	private _mesh:Mesh;
	private _raf:RequestAnimationFrame;
	private _image:HTMLImageElement;
	private _texture:Single2DTexture;
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
		this._texture = new Single2DTexture(ParserUtils.imageToBitmapImage2D(image));

		this._material = new MethodMaterial(this._texture, true, true, false);
		this._material.lightPicker = this._lightPicker;
	}

	/**
	 *
	 */
	private initTorus()
	{
		this._torus = new PrimitiveTorusPrefab(220, 80, 32, 16, false);

		this._mesh = <Mesh> this._torus.getNewObject();
		this._mesh.material = this._material;

		this._view.scene.addChild(this._mesh);
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
		if (this._mesh)
			this._mesh.rotationY += 1;

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