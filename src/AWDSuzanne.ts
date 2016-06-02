import {View, DefaultRenderer}		        								from "awayjs-full";
import {LoaderEvent, MouseEvent}											from "awayjs-full/lib/events";
import {Vector3D}															from "awayjs-full/lib/geom";
import {AssetLibrary, IAsset, Loader}										from "awayjs-full/lib/library";
import {URLRequest}															from "awayjs-full/lib/net";
import {JSPickingCollider}													from "awayjs-full/lib/pick";
import {RequestAnimationFrame}												from "awayjs-full/lib/utils";
import {Sprite, DirectionalLight}											from "awayjs-full/lib/display";
import {MethodMaterial, StaticLightPicker}									from "awayjs-full/lib/materials";
import {AWDParser}															from "awayjs-full/lib/parsers";


class AWDSuzanne
{

	private _renderer:DefaultRenderer;
	private _view:View;
	private _timer:RequestAnimationFrame;
	private _suzane:Sprite;
	private _light:DirectionalLight;
	private _lightPicker:StaticLightPicker;
	private _lookAtPosition:Vector3D = new Vector3D();
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
		this._renderer = new DefaultRenderer();
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

		var session:Loader = AssetLibrary.getLoader();
		session.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		session.load(new URLRequest('assets/suzanne.awd'));
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
		var loader:Loader = e.target;
		var numAssets:number = loader.baseDependency.assets.length;

		for (var i:number = 0; i < numAssets; ++i) {
			var asset:IAsset = loader.baseDependency.assets[ i ];

			switch(asset.assetType) {
				case Sprite.assetType:

					var sprite:Sprite = <Sprite> asset;

					this._suzane = sprite;
					(<MethodMaterial> this._suzane.material).lightPicker = this._lightPicker;
					this._suzane.y = -100;
					this._mouseOutMaterial = <MethodMaterial> this._suzane.material;

					for (var c:number = 0; c < 80; c++) {

						var clone:Sprite = <Sprite> sprite.clone();
						var scale:number = this.getRandom(50, 200);
						clone.x = this.getRandom(-2000, 2000);
						clone.y = this.getRandom(-2000, 2000);
						clone.z = this.getRandom(-2000, 2000);
						clone.transform.scaleTo(scale, scale, scale);
						clone.rotationY = this.getRandom (0, 360);
						clone.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onMouseOver(event));
						clone.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onMouseOut(event));
						this._view.scene.addChild(clone);
					}

					sprite.transform.scaleTo(500, 500, 500);
					sprite.pickingCollider = new JSPickingCollider();

					sprite.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onMouseOver(event));
					sprite.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onMouseOut(event));
					this._view.scene.addChild(sprite);

					break;
			}
		}
	}

	private onMouseOver(event:MouseEvent)
	{
		(<Sprite> event.entity).material = this._mouseOverMaterial;

		console.log("mouseover");
	}

	private onMouseOut(event:MouseEvent)
	{
		(<Sprite> event.entity).material = this._mouseOutMaterial;

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

