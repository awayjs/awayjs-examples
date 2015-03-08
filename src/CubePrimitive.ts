import BlendMode					= require("awayjs-core/lib/data/BlendMode");
import AwayEvent					= require("awayjs-core/lib/events/Event");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import URLLoader					= require("awayjs-core/lib/net/URLLoader");
import URLLoaderDataFormat			= require("awayjs-core/lib/net/URLLoaderDataFormat");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import ParserUtils					= require("awayjs-core/lib/parsers/ParserUtils");
import PerspectiveProjection		= require("awayjs-core/lib/projections/PerspectiveProjection");
import ImageTexture					= require("awayjs-core/lib/textures/ImageTexture");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import Scene						= require("awayjs-display/lib/containers/Scene");
import View							= require("awayjs-display/lib/containers/View");
import DirectionalLight				= require("awayjs-display/lib/entities/DirectionalLight");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PrimitiveCubePrefab			= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
import PrimitiveTorusPrefab			= require("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");

class CubePrimitive
{
	private _view:View;
	private _cube:PrimitiveCubePrefab;
	private _torus:PrimitiveTorusPrefab;
	private _mesh:Mesh;
	private _mesh2:Mesh;
	private _raf:RequestAnimationFrame;
	private _image:HTMLImageElement;
	private _cameraAxis:Vector3D;
	private _light:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	constructor()
	{
		this.initView();
		this.initCamera();
		this.initLights();
		this.initGeometry();
		this.loadResources();
	}

	/**
	 *
	 */
	private initView():void
	{
		this._view = new View(new DefaultRenderer(MethodRendererPool));
		this._view.backgroundColor = 0x000000;
		this._view.camera.x = 130;
		this._view.camera.y = 0;
		this._view.camera.z = 0;
	}

	/**
	 *
	 */
	private initGeometry():void
	{
		this._cube = new PrimitiveCubePrefab(20.0, 20.0, 20.0);
		this._torus = new PrimitiveTorusPrefab(150, 80, 32, 16, true);

		this._mesh = <Mesh> this._torus.getNewObject();
		this._mesh2 = <Mesh> this._cube.getNewObject();
		this._mesh2.x = 130;
		this._mesh2.z = 40;
	}

	/**
	 *
	 */
	private initLights():void
	{
		this._light = new DirectionalLight();
		this._light.color = 0xffffff;
		this._light.direction = new Vector3D(1, 0, 0);
		this._light.ambient = 0.4;
		this._light.ambientColor = 0x85b2cd;
		this._light.diffuse = 2.8;
		this._light.specular = 1.8;

		this._lightPicker = new StaticLightPicker([this._light]);
	}

	/**
	 *
	 */
	private initCamera():void
	{
		this._cameraAxis = new Vector3D(0, 0, 1);
		this._view.camera.projection = new PerspectiveProjection(120);
		this._view.camera.projection.near = 0.1;
	}

	/**
	 *
	 */
	private loadResources()
	{
		window.onresize = (event:UIEvent) => this.onResize(event);
		this.onResize();

		this._raf = new RequestAnimationFrame(this.render, this);
		this._raf.start();

		var urlRequest:URLRequest = new URLRequest("assets/spacy_texture.png");
		var imgLoader:URLLoader = new URLLoader();
		imgLoader.dataFormat = URLLoaderDataFormat.BLOB;

		imgLoader.addEventListener(AwayEvent.COMPLETE, (event:AwayEvent) => this.urlCompleteHandler(event));
		imgLoader.load(urlRequest);
	}

	/**
	 *
	 * @param event
	 */
	private urlCompleteHandler(event:AwayEvent)
	{
		var imageLoader:URLLoader = <URLLoader> event.target;

		this._image = ParserUtils.blobToImage(imageLoader.data);

		this._image.onload = (event:Event) => this.imageCompleteHandler(event);
	}

	/**
	 *
	 * @param e
	 */
	private imageCompleteHandler(event:Event)
	{
		var ts:ImageTexture = new ImageTexture(this._image);
		var matTx:MethodMaterial = new MethodMaterial(ts, true, true, false);
		matTx.blendMode = BlendMode.ADD;
		matTx.bothSides = true;
		matTx.lightPicker = this._lightPicker;

		this._mesh.material = matTx;
		this._mesh2.material = matTx;

		this._view.scene.addChild(this._mesh);
		this._view.scene.addChild(this._mesh2);
    }

	/**
	 *
	 * @param dt
	 */
	public render(dt:number = null):void
	{
		this._view.camera.rotate(this._cameraAxis, 1);
		this._mesh.rotationY += 1;
		this._mesh2.rotationX += 0.4;
		this._mesh2.rotationY += 0.4;
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
	new CubePrimitive();
}
