import {LoaderEvent, Vector3D, AssetLibrary, IAsset, Loader, URLRequest, RequestAnimationFrame} from "@awayjs/core";
import {MouseEvent, Sprite, Scene} from "@awayjs/scene";
import {MethodMaterial, DirectionalLight, StaticLightPicker} from "@awayjs/materials";
import {AWDParser} from "@awayjs/parsers";
import { BasicPartition } from "@awayjs/view";

class AWDSuzanne
{
	private _scene:Scene;
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
		this.initScene();
		this.loadAssets();
		this.initLights();

		window.onresize  = (event:UIEvent) => this.onResize(event);

		this.onResize();
	}

	/**
	 *
	 */
	private initScene():void
	{
		this._scene = new Scene();
		this._scene.camera.projection.far = 6000;
		this._scene.forceMouseMove = true;
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
		this._lightPicker = new StaticLightPicker([this._light]);
	}

	/**
	 *
	 */
	private onResize(event:UIEvent = null):void
	{
		this._scene.view.y = 0;
		this._scene.view.x = 0;
		this._scene.view.width = window.innerWidth;
		this._scene.view.height = window.innerHeight;
	}

	/**
	 *
	 * @param dt
	 */
	private render(dt:number) //animate based on dt for firefox
	{
		if (this._scene.camera) {
			this._scene.camera.lookAt(this._lookAtPosition);
			this._cameraIncrement += 0.01;
			this._scene.camera.x = Math.cos(this._cameraIncrement)*1400;
			this._scene.camera.z = Math.sin(this._cameraIncrement)*1400;

			this._light.direction = new Vector3D(-Math.cos(-this._cameraIncrement)*1400, 0, -Math.sin(this._cameraIncrement)*1400);

		}

		this._scene.render();
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
						clone.partition = new BasicPartition(clone);
						clone.x = this.getRandom(-2000, 2000);
						clone.y = this.getRandom(-2000, 2000);
						clone.z = this.getRandom(-2000, 2000);
						clone.transform.scaleTo(scale, scale, scale);
						clone.rotationY = this.getRandom (0, 360);
						clone.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onMouseOver(event));
						clone.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onMouseOut(event));
						this._scene.root.addChild(clone);
					}

					this._scene.renderer.pickGroup.getAbstraction(sprite).shapeFlag = true;
					sprite.partition = new BasicPartition(sprite);
					sprite.transform.scaleTo(500, 500, 500);
					sprite.addEventListener(MouseEvent.MOUSE_OVER, (event:MouseEvent) => this.onMouseOver(event));
					sprite.addEventListener(MouseEvent.MOUSE_OUT, (event:MouseEvent) => this.onMouseOut(event));
					this._scene.root.addChild(sprite);

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

