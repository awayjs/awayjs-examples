import Geometry						= require("awayjs-core/lib/data/Geometry");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import AssetLoader					= require("awayjs-core/lib/library/AssetLoader");
import AssetLoaderContext			= require("awayjs-core/lib/library/AssetLoaderContext");
import AssetLoaderToken				= require("awayjs-core/lib/library/AssetLoaderToken");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import View							= require("awayjs-display/lib/containers/View");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import DirectionalLight				= require("awayjs-display/lib/entities/DirectionalLight");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import MouseEvent					= require("awayjs-display/lib/events/MouseEvent");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");
import JSPickingCollider			= require("awayjs-renderergl/lib/pick/JSPickingCollider");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
import AWDParser					= require("awayjs-parsers/lib/AWDParser");

class AWDSuzanne
{

	private _renderer:DefaultRenderer;
	private _view:View;
	private _token:AssetLoaderToken;
	private _timer:RequestAnimationFrame;
	private _suzane:Mesh;
	private _light:DirectionalLight;
	private _lightPicker:StaticLightPicker;
	private _lookAtPosition:Vector3D = new Vector3D ();
	private _cameraIncrement:number = 0;
	private _mouseOverMaterial:MethodMaterial = new MethodMaterial(0xFF0000);
	private _mouseOutMaterial:MethodMaterial;

	constructor()
	{
		this.initView();
		this.loadAssets();
		this.initLights();

		window.onresize  = (event:UIEvent) => this.onResize(event);

		this.onResize();
	}

	/**
	 *
	 */
	private initView():void
	{
		this._renderer = new DefaultRenderer(MethodRendererPool)
		this._view = new View(this._renderer);
		this._view.camera.projection.far = 6000;
		this._view.forceMouseMove = true;
	}

	/**
	 *
	 */
	private loadAssets():void
	{
		this._timer = new RequestAnimationFrame(this.render, this);
		this._timer.start();

		AssetLibrary.enableParser(AWDParser);

		this._token = AssetLibrary.load(new URLRequest('assets/suzanne.awd'));
		this._token.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
	}

	/**
	 *
	 */
	private initLights():void
	{
		this._light = new DirectionalLight();
		this._light.color = 0x683019;
		this._light.direction = new Vector3D(1, 0, 0);
		this._light.ambient = 0.1;
		this._light.ambientColor = 0x85b2cd;
		this._light.diffuse = 2.8;
		this._light.specular = 1.8;
		this._view.scene.addChild(this._light);
		this._lightPicker = new StaticLightPicker([this._light]);
	}

	/**
	 *
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}

	/**
	 *
	 * @param dt
	 */
	private render(dt:number) //animate based on dt for firefox
	{
		if (this._view.camera) {
			this._view.camera.lookAt(this._lookAtPosition);
			this._cameraIncrement += 0.01;
			this._view.camera.x = Math.cos(this._cameraIncrement)*1400;
			this._view.camera.z = Math.sin(this._cameraIncrement)*1400;

			this._light.x = Math.cos(this._cameraIncrement)*1400;
			this._light.y = Math.sin(this._cameraIncrement)*1400;

		}

		this._view.render();
	}

	/**
	 *
	 * @param e
	 */
	public onResourceComplete(e:LoaderEvent)
	{
		var loader:AssetLoader = <AssetLoader> e.target;
		var numAssets:number = loader.baseDependency.assets.length;

		for (var i:number = 0; i < numAssets; ++i) {
			var asset:IAsset = loader.baseDependency.assets[ i ];

			switch(asset.assetType) {
				case Mesh.assetType:

					var mesh:Mesh = <Mesh> asset;

					this._suzane = mesh;
					(<MethodMaterial> this._suzane.material).lightPicker = this._lightPicker;
					this._suzane.y = -100;
					this._mouseOutMaterial = <MethodMaterial> this._suzane.material;

					for (var c:number = 0; c < 80; c++) {

						var clone:Mesh = <Mesh> mesh.clone();
						var scale:number = this.getRandom(50, 200);
						clone.x = this.getRandom(-2000, 2000);
						clone.y = this.getRandom(-2000, 2000);
						clone.z = this.getRandom(-2000, 2000);
						clone.transform.scale = new Vector3D(scale, scale, scale);
						clone.rotationY = this.getRandom (0, 360);
						clone.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onMouseOver(event));
						clone.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onMouseOut(event));
						this._view.scene.addChild(clone);
					}

					mesh.transform.scale = new Vector3D(500, 500, 500);
					mesh.pickingCollider = new JSPickingCollider(this._renderer.stage);

					mesh.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onMouseOver(event));
					mesh.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onMouseOut(event));
					this._view.scene.addChild(mesh);

					break;

				case Geometry.assetType:
					break;

				case MaterialBase.assetType:
					break;
			}
		}
	}

	private onMouseOver(event:MouseEvent)
	{
		(<Mesh> event.object).material = this._mouseOverMaterial;

		console.log("mouseover");
	}

	private onMouseOut(event:MouseEvent)
	{
		(<Mesh> event.object).material = this._mouseOutMaterial;

		console.log("mouseout");
	}

	/**
	 *
	 * @param min
	 * @param max
	 * @returns {number}
	 */
	private getRandom(min:number, max:number):number
	{
		return Math.random()*(max - min) + min;
	}
}

window.onload = function()
{
	new AWDSuzanne();
}

