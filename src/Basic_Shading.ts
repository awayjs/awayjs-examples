/*

Shading example in Away3d

Demonstrates:

How to create multiple entitiesources in a scene.
How to apply specular maps, normals maps and diffuse texture maps to a material.

Code by Rob Bateman
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk

This code is distributed under the MIT License

Copyright (c) The Away Foundation http://www.theawayfoundation.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

import {LoaderEvent, Vector3D, AssetLibrary, IAsset, URLRequest, RequestAnimationFrame} from "awayjs-full/lib/core";
import {BitmapImage2D, Sampler2D, ElementsType, DefaultMaterialManager, Single2DTexture} from "awayjs-full/lib/graphics";
import {HoverController, Sprite, Scene, Camera, DirectionalLight, PrimitiveCubePrefab, PrimitivePlanePrefab, PrimitiveSpherePrefab, PrimitiveTorusPrefab, StaticLightPicker} from "awayjs-full/lib/display";
import {MethodMaterial} from "awayjs-full/lib/materials";
import {View} from "awayjs-full/lib/view";
/**
 *
 */
class Basic_Shading
{
	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _view:View;
	private _cameraController:HoverController;

	//material objects
	private _planeMaterial:MethodMaterial;
	private _sphereMaterial:MethodMaterial;
	private _cubeMaterial:MethodMaterial;
	private _torusMaterial:MethodMaterial;

	//light objects
	private _light1:DirectionalLight;
	private _light2:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	//scene objects
	private _plane:Sprite;
	private _sphere:Sprite;
	private _cube:Sprite;
	private _torus:Sprite;

	//navigation variables
	private _timer:RequestAnimationFrame;
	private _time:number = 0;
	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;

	/**
	 * Constructor
	 */
	constructor()
	{
		this.init();
	}

	/**
	 * Global initialise function
	 */
	private init():void
	{
		this.initEngine();
		this.initLights();
		this.initMaterials();
		this.initObjects();
		this.initListeners();
	}

	/**
	 * Initialise the engine
	 */
	private initEngine():void
	{
		this._scene = new Scene();

		this._camera = new Camera();

		this._view = new View();
		this._view.scene = this._scene;
		this._view.camera = this._camera;

		//setup controller to be used on the camera
		this._cameraController = new HoverController(this._camera);
		this._cameraController.distance = 1000;
		this._cameraController.minTiltAngle = 0;
		this._cameraController.maxTiltAngle = 90;
		this._cameraController.panAngle = 45;
		this._cameraController.tiltAngle = 20;
	}

	/**
	 * Initialise the entities
	 */
	private initLights():void
	{
		this._light1 = new DirectionalLight();
		this._light1.direction = new Vector3D(0, -1, 0);
		this._light1.ambient = 0.1;
		this._light1.diffuse = 0.7;

		this._scene.addChild(this._light1);

		this._light2 = new DirectionalLight();
		this._light2.direction = new Vector3D(0, -1, 0);
		this._light2.color = 0x00FFFF;
		this._light2.ambient = 0.1;
		this._light2.diffuse = 0.7;

		this._scene.addChild(this._light2);

		this._lightPicker = new StaticLightPicker([this._light1, this._light2]);
	}

	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		this._planeMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
		this._planeMaterial.lightPicker = this._lightPicker;
		this._planeMaterial.style.sampler = new Sampler2D(true, true, true);

		this._sphereMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
		this._sphereMaterial.lightPicker = this._lightPicker;

		this._cubeMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
		this._cubeMaterial.lightPicker = this._lightPicker;
		this._cubeMaterial.style.sampler = new Sampler2D(true, true);

		this._torusMaterial = new MethodMaterial(DefaultMaterialManager.getDefaultImage2D());
		this._torusMaterial.lightPicker = this._lightPicker;
		this._torusMaterial.style.sampler = new Sampler2D(true, true, true);
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this._plane = <Sprite> new PrimitivePlanePrefab(this._planeMaterial, ElementsType.TRIANGLE, 1000, 1000).getNewObject();
		this._plane.graphics.scaleUV(2, 2);
		this._plane.y = -20;

		this._scene.addChild(this._plane);

		this._sphere = <Sprite> new PrimitiveSpherePrefab(this._sphereMaterial, ElementsType.TRIANGLE, 150, 40, 20).getNewObject();
		this._sphere.x = 300;
		this._sphere.y = 160;
		this._sphere.z = 300;

		this._scene.addChild(this._sphere);

		this._cube = <Sprite> new PrimitiveCubePrefab(this._cubeMaterial, ElementsType.TRIANGLE, 200, 200, 200, 1, 1, 1, false).getNewObject();
		this._cube.x = 300;
		this._cube.y = 160;
		this._cube.z = -250;

		this._scene.addChild(this._cube);

		this._torus = <Sprite> new PrimitiveTorusPrefab(this._torusMaterial, ElementsType.TRIANGLE, 150, 60, 40, 20).getNewObject();
		this._torus.graphics.scaleUV(10, 5);
		this._torus.x = -250;
		this._torus.y = 160;
		this._torus.z = -250;

		this._scene.addChild(this._torus);
	}

	/**
	 * Initialise the listeners
	 */
	private initListeners():void
	{
		window.onresize  = (event:UIEvent) => this.onResize(event);

		document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
		document.onmouseup = (event:MouseEvent) => this.onMouseUp(event);
		document.onmousemove = (event:MouseEvent) => this.onMouseMove(event);
		document.onmousewheel= (event:WheelEvent) => this.onMouseWheel(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onLoadComplete(event));

		//plane textures
		AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_normal.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_specular.jpg"));

		//sphere textures
		AssetLibrary.load(new URLRequest("assets/beachball_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/beachball_specular.jpg"));

		//cube textures
		AssetLibrary.load(new URLRequest("assets/trinket_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/trinket_normal.jpg"));
		AssetLibrary.load(new URLRequest("assets/trinket_specular.jpg"));

		//torus textures
		AssetLibrary.load(new URLRequest("assets/weave_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/weave_normal.jpg"));
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._time += dt;

		this._light1.direction = new Vector3D(Math.sin(this._time/10000)*150000, -1000, Math.cos(this._time/10000)*150000);

		this._view.render();
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onLoadComplete(event:LoaderEvent)
	{
		var assets:Array<IAsset> = event.assets;
		var length:number = assets.length;

		for (var c:number = 0; c < length; c ++) {
			var asset:IAsset = assets[c];

			console.log(asset.name, event.url);

			switch (event.url)
			{
				//plane textures
				case "assets/floor_diffuse.jpg" :
					this._planeMaterial.style.image = <BitmapImage2D> asset;
					break;
				case "assets/floor_normal.jpg" :
					this._planeMaterial.normalMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/floor_specular.jpg" :
					this._planeMaterial.specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;

				//sphere textures
				case "assets/beachball_diffuse.jpg" :
					this._sphereMaterial.style.image = <BitmapImage2D> asset;
					break;
				case "assets/beachball_specular.jpg" :
					this._sphereMaterial.specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;

				//cube textures
				case "assets/trinket_diffuse.jpg" :
					this._cubeMaterial.style.image = <BitmapImage2D> asset;
					break;
				case "assets/trinket_normal.jpg" :
					this._cubeMaterial.normalMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/trinket_specular.jpg" :
					this._cubeMaterial.specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;

				//torus textures
				case "assets/weave_diffuse.jpg" :
					this._torusMaterial.style.image = <BitmapImage2D> asset;
					break;
				case "assets/weave_normal.jpg" :
					this._torusMaterial.normalMethod.texture = this._torusMaterial.specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
			}
		}
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event:MouseEvent):void
	{
		this._lastPanAngle = this._cameraController.panAngle;
		this._lastTiltAngle = this._cameraController.tiltAngle;
		this._lastMouseX = event.clientX;
		this._lastMouseY = event.clientY;
		this._move = true;
	}

	/**
	 * Mouse up listener for navigation
	 */
	private onMouseUp(event:MouseEvent):void
	{
		this._move = false;
	}

	/**
	 * Mouse move listener for navigation
	 */
	private onMouseMove(event:MouseEvent)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * Mouse wheel listener for navigation
	 */
	private onMouseWheel(event:WheelEvent)
	{
		this._cameraController.distance -= event.wheelDelta;

		if (this._cameraController.distance < 100)
			this._cameraController.distance = 100;
		else if (this._cameraController.distance > 2000)
			this._cameraController.distance = 2000;
	}

	/**
	 * window listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}

window.onload = function ()
{
	new Basic_Shading();
}