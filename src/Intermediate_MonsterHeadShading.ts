/*

Monster Head example in Away3d

Demonstrates:

How to use the AssetLibrary to load an internal AWD model.
How to set custom material methods on a model.
How to setup soft shadows and multiple lightsources with a multipass texture
How to use a diffuse gradient method as a cheap way to simulate sub-surface scattering

Code by Rob Bateman & David Lenaerts
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk
david.lenaerts@gmail.com
http://www.derschmale.com

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

import {AssetEvent, LoaderEvent, URLLoaderEvent, Vector3D, AssetLibrary, LoaderContext, URLRequest, URLLoader, URLLoaderDataFormat, RequestAnimationFrame, ParserUtils} from "awayjs-full/lib/core";
import {SpecularImage2D, ImageSampler, ImageUtils} from "awayjs-full/lib/stage";
import {HoverController, Sprite, Scene, Camera}	from "awayjs-full/lib/scene";
import {ImageTexture2D, MethodMaterial, MethodMaterialMode, SpecularFresnelMethod, ShadowSoftMethod, PointLight, DirectionalLight, StaticLightPicker, DirectionalShadowMapper}	from "awayjs-full/lib/materials";
import {AWDParser} from "awayjs-full/lib/parsers";
import {View} from "awayjs-full/lib/view";

class Intermediate_MonsterHeadShading
{
	//textures
	private _textureStrings:Array<string> = Array<string>("monsterhead_diffuse.jpg", "monsterhead_specular.jpg", "monsterhead_normals.jpg");
	private _textureDictionary:Object = new Object();

	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _view:View;
	private _cameraController:HoverController;

	//material objects
	private _headMaterial:MethodMaterial;
	private _softShadowMethod:ShadowSoftMethod;
	private _fresnelMethod:SpecularFresnelMethod;
	//private _diffuseMethod:BasicDiffuseMethod;
	//private _specularMethod:BasicSpecularMethod;

	//scene objects
	private _blueLight:PointLight;
	private _redLight:PointLight;
	private _directionalLight:DirectionalLight;
	private _lightPicker:StaticLightPicker;
	private _headModel:Sprite;
	private _advancedMethod:Boolean = true;

	//loading variables
	private _numTextures:number /*uint*/ = 0;
	private _currentTexture:number /*uint*/ = 0;
	private _n:number /*uint*/ = 0;
	private _loadingText:string;

	//root filepath for asset loading
	private _assetsRoot:string = "assets/monsterhead/";

	//navigation variables
	private _move:Boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;
	private timer:RequestAnimationFrame;
	private time:number = 0;

	private parseAWDDelegate:(event:URLLoaderEvent) => void;
	private parseBitmapDelegate:(event:URLLoaderEvent) => void;
	private loadProgressDelegate:(event:URLLoaderEvent) => void;
	private onBitmapCompleteDelegate:(event:Event) => void;
	private onAssetCompleteDelegate:(event:AssetEvent) => void;
	private onResourceCompleteDelegate:(event:LoaderEvent) => void;

	private _shadowRange:number = 3;
	private _lightDirection:number = 120*Math.PI/180;
	private _lightElevation:number = 30*Math.PI/180;

	/**
	 * Constructor
	 */
	public constructor()
	{
		this.init();
	}

	/**
	 * Global initialise function
	 */
	private init()
	{
		this.initEngine();
		this.initLights();
		this.initListeners();

		//kickoff asset loading
		this._n = 0;
		this._numTextures = this._textureStrings.length;
		this.load(this._textureStrings[this._n]);
	}

	/**
	 * Initialise the engine
	 */
	private initEngine()
	{
		this._scene = new Scene();

		this._camera = new Camera();
		this._camera.projection.near = 20;
		this._camera.projection.far = 1000;

		this._view = new View(null, this._scene, this._camera);

		//setup controller to be used on the camera
		this._cameraController = new HoverController(this._camera, null, 225, 10, 800);
		this._cameraController.yFactor = 1;
	}

	/**
	 * Initialise the lights in a scene
	 */
	private initLights()
	{
		//var initialAzimuth:number = .6;
		//var initialArc:number = 2;
		var x:number = Math.sin(this._lightElevation)*Math.cos(this._lightDirection);
		var y:number = -Math.cos(this._lightElevation);
		var z:number = Math.sin(this._lightElevation)*Math.sin(this._lightDirection);

		// main light casting the shadows
		this._directionalLight = new DirectionalLight(new Vector3D(x, y, z));
		this._directionalLight.color = 0xffeedd;
		this._directionalLight.ambient = 1;
		this._directionalLight.specular = .3;
		this._directionalLight.ambientColor = 0x101025;
		this._directionalLight.shadowsEnabled = true;
        this._directionalLight.shadowMapper.epsilon = 0.2;
		(<DirectionalShadowMapper> this._directionalLight.shadowMapper).lightOffset = 1000;

		// blue point light coming from the right
		this._blueLight = new PointLight();
		this._blueLight.color = 0x4080ff;
		this._blueLight.x = 3000;
		this._blueLight.z = 700;
		this._blueLight.y = 20;

		// red light coming from the left
		this._redLight = new PointLight();
		this._redLight.color = 0x802010;
		this._redLight.x = -2000;
		this._redLight.z = 800;
		this._redLight.y = -400;

		this._lightPicker = new StaticLightPicker([this._directionalLight, this._blueLight, this._redLight]);

	}

	/**
	 * Initialise the listeners
	 */
	private initListeners()
	{
		window.onresize  = (event:UIEvent) => this.onResize(event);

		document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
		document.onmouseup = (event:MouseEvent) => this.onMouseUp(event);
		document.onmousemove = (event:MouseEvent) => this.onMouseMove(event);

		this.onResize();

		this.parseAWDDelegate = (event:URLLoaderEvent) => this.parseAWD(event);
		this.parseBitmapDelegate = (event:URLLoaderEvent) => this.parseBitmap(event);
		this.loadProgressDelegate = (event:URLLoaderEvent) => this.loadProgress(event);
		this.onBitmapCompleteDelegate = (event:Event) => this.onBitmapComplete(event);
		this.onAssetCompleteDelegate = (event:AssetEvent) => this.onAssetComplete(event);
		this.onResourceCompleteDelegate = (event:LoaderEvent) => this.onResourceComplete(event);

		this.timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this.timer.start();
	}

	/**
	 * Updates the direction of the directional lightsource
	 */
	private updateDirection()
	{
		this._directionalLight.direction = new Vector3D(
			Math.sin(this._lightElevation)*Math.cos(this._lightDirection),
			-Math.cos(this._lightElevation),
			Math.sin(this._lightElevation)*Math.sin(this._lightDirection)
		);
	}

	private updateRange()
	{
		this._softShadowMethod.range = this._shadowRange;
	}

	/**
	 * Global binary file loader
	 */
	private load(url:string)
	{
		var loader:URLLoader = new URLLoader();
		switch (url.substring(url.length - 3)) {
			case "AWD":
			case "awd":
				loader.dataFormat = URLLoaderDataFormat.ARRAY_BUFFER;
				this._loadingText = "Loading Model";
				loader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseAWDDelegate);
				break;
			case "png":
			case "jpg":
				loader.dataFormat = URLLoaderDataFormat.BLOB;
				this._currentTexture++;
				this._loadingText = "Loading Textures";
				loader.addEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseBitmapDelegate);
				break;
		}

		loader.addEventListener(URLLoaderEvent.LOAD_PROGRESS, this.loadProgressDelegate);
		loader.load(new URLRequest(this._assetsRoot+url));
	}

	/**
	 * Display current load
	 */
	private loadProgress(event:URLLoaderEvent)
	{
		//TODO work out why the casting on URLLoaderEvent fails for bytesLoaded and bytesTotal properties
		var P:number = Math.floor(event["bytesLoaded"] / event["bytesTotal"] * 100);
		if (P != 100) {
			console.log(this._loadingText + '\n' + ((this._loadingText == "Loading Model")? Math.floor((event["bytesLoaded"] / 1024) << 0) + 'kb | ' + Math.floor((event["bytesTotal"] / 1024) << 0) + 'kb' : this._currentTexture + ' | ' + this._numTextures));
		}
	}

	/**
	 * Parses the Bitmap file
	 */
	private parseBitmap(event:URLLoaderEvent)
	{
		var urlLoader:URLLoader = <URLLoader> event.target;
		var image:HTMLImageElement = ParserUtils.blobToImage(urlLoader.data);
		image.onload = this.onBitmapCompleteDelegate;
		urlLoader.removeEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseBitmapDelegate);
		urlLoader.removeEventListener(URLLoaderEvent.LOAD_PROGRESS, this.loadProgressDelegate);
		urlLoader = null;
	}

	/**
	 * Parses the AWD file
	 */
	private parseAWD(event:URLLoaderEvent)
	{
		console.log("Parsing Data");
		var urlLoader:URLLoader = <URLLoader> event.target;

		//setup parser
		AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, this.onResourceCompleteDelegate);
		AssetLibrary.loadData(urlLoader.data, new LoaderContext(false), null, new AWDParser());

		urlLoader.removeEventListener(URLLoaderEvent.LOAD_PROGRESS, this.loadProgressDelegate);
		urlLoader.removeEventListener(URLLoaderEvent.LOAD_COMPLETE, this.parseAWDDelegate);
		urlLoader = null;
	}

	/**
	 * Listener for bitmap complete event on loader
	 */
	private onBitmapComplete(event:Event)
	{
		var image:HTMLImageElement = <HTMLImageElement> event.target;
		image.onload = null;
		//create bitmap texture in dictionary
		if (!this._textureDictionary[this._textureStrings[this._n]])
			this._textureDictionary[this._textureStrings[this._n]] = new ImageTexture2D((this._n == 1)? new SpecularImage2D(ImageUtils.imageToBitmapImage2D(image)) : ImageUtils.imageToBitmapImage2D(image));

		this._n++;

		//switch to next teture set
		if (this._n < this._textureStrings.length) {
			this.load(this._textureStrings[this._n]);
		} else {
			this.load("MonsterHead.awd");
		}
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number)
	{
		this._view.render();
	}

	/**
	 * Listener for asset complete event on loader
	 */
	private onAssetComplete(event:AssetEvent)
	{
		if (event.asset.isAsset(Sprite)) {
			this._headModel = <Sprite> event.asset;
			this._headModel.graphics.scale(4);
			this._headModel.y = -20;
			this._scene.addChild(this._headModel);
		}
	}

	/**
	 * Triggered once all resources are loaded
	 */
	private onResourceComplete(e:LoaderEvent)
	{
		AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
		AssetLibrary.removeEventListener(LoaderEvent.LOAD_COMPLETE, this.onResourceCompleteDelegate);

		var material:MethodMaterial = new MethodMaterial(this._textureDictionary["monsterhead_diffuse.jpg"]);
		material.shadowMethod = new ShadowSoftMethod(this._directionalLight , 10 , 5 );
		material.lightPicker = this._lightPicker;
		material.specularMethod.gloss = 30;
		material.specularMethod.strength = 1;
		material.style.color = 0x303040;
		material.ambientMethod.strength = 1;

		//setup custom multipass material
		this._headMaterial = new MethodMaterial();
		this._headMaterial.ambientMethod.texture = this._textureDictionary["monsterhead_diffuse.jpg"];
		this._headMaterial.mode = MethodMaterialMode.MULTI_PASS;
		this._headMaterial.style.sampler = new ImageSampler(true, true);
		this._headMaterial.normalMethod.texture = this._textureDictionary["monsterhead_normals.jpg"];
		this._headMaterial.lightPicker = this._lightPicker;
		this._headMaterial.style.color = 0x303040;
		this._headMaterial.diffuseMethod.multiply = false;

		// create soft shadows with a lot of samples for best results. With the current method setup, any more samples would fail to compile
		this._softShadowMethod = new ShadowSoftMethod(this._directionalLight, 20);
		this._softShadowMethod.range = this._shadowRange;	// the sample radius defines the softness of the shadows
		this._headMaterial.shadowMethod = this._softShadowMethod;

		// create specular reflections that are stronger from the sides
		this._fresnelMethod = new SpecularFresnelMethod(true);
		this._fresnelMethod.fresnelPower = 3;
		this._headMaterial.specularMethod = this._fresnelMethod;
		this._headMaterial.specularMethod.texture = this._textureDictionary["monsterhead_specular.jpg"];
		this._headMaterial.specularMethod.strength = 3;
		this._headMaterial.specularMethod.gloss = 10;

		//apply material to head model
		var len:number = this._headModel.graphics.count;
		for (var i:number = 0; i < len; i++)
			this._headModel.graphics.getShapeAt(i).material = this._headMaterial;

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onExtraResourceComplete(event));

		//diffuse gradient texture
		AssetLibrary.load(new URLRequest("assets/diffuseGradient.jpg"));
	}


	/**
	 * Triggered once extra resources are loaded
	 */
	private onExtraResourceComplete(event:LoaderEvent)
	{
		switch (event.url) {
			case "assets/diffuseGradient.jpg" :
				// very low-cost and crude subsurface scattering for diffuse shading
				//this._headMaterial.diffuseMethod = new DiffuseGradientMethod(<ImageTexture2D> event.assets[ 0 ]);
				break;
		}
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event:MouseEvent)
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
	private onMouseUp(event:MouseEvent)
	{
		this._move = false;
	}

	/**
	 * Mouse move listener for mouseLock
	 */
	private onMouseMove(event:MouseEvent)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * window listener for resize events
	 */
	private onResize(event:UIEvent = null)
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}

window.onload = function ()
{
	new Intermediate_MonsterHeadShading();
}