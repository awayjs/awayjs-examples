/*

Globe example in Away3d

Demonstrates:

How to create a textured sphere.
How to use containers to rotate an object.
How to use the PhongBitmapMaterial.

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

import {LoaderEvent, ColorTransform, Vector3D, Point, AssetLibrary, LoaderContext, URLRequest, RequestAnimationFrame} from "@awayjs/core";
import {BitmapImage2D, BitmapImageCube, BitmapImageChannel, BlendMode, ImageSampler, ShaderRegisterElement, ShaderRegisterCache, ShaderRegisterData} from "@awayjs/stage";
import {ShaderBase} from "@awayjs/renderer";
import {ElementsType} from "@awayjs/graphics";
import {OrientationMode, AlignmentMode, HoverController, Sprite, Scene, Camera, DisplayObjectContainer, Skybox, Billboard, PrimitiveSpherePrefab} from "@awayjs/scene";
import {LightingShader, MethodMaterial, SpecularPhongMethod, DiffuseBasicMethod, SpecularBasicMethod, SpecularFresnelMethod, DiffuseCompositeMethod, SpecularCompositeMethod, _Shader_LightingCompositeMethod, _IShader_LightingMethod, ImageTexture2D, PointLight, StaticLightPicker} from "@awayjs/materials";
import {View} from "@awayjs/view";

class Intermediate_Globe
{
	//engine variables
	private _scene:Scene;
	private _root:DisplayObjectContainer;
	private _camera:Camera;
	private _view:View;
	private _cameraController:HoverController;

	//material objects
	private _sunMaterial:MethodMaterial;
	private _groundMaterial:MethodMaterial;
	private _cloudMaterial:MethodMaterial;
	private _atmosphereMaterial:MethodMaterial;
	private _atmosphereDiffuseMethod:SpecularGlobeMethod;
	private _atmosphereSpecularMethod:SpecularGlobeMethod;

	//scene objects
	private _sun:Billboard;
	private _earth:Sprite;
	private _clouds:Sprite;
	private _atmosphere:Sprite;
	private _tiltContainer:DisplayObjectContainer;
	private _orbitContainer:DisplayObjectContainer;
	private _skyBox:Skybox;

	//light objects
	private _light:PointLight;
	private _lightPicker:StaticLightPicker;
	private _flares:FlareObject[] = new Array<FlareObject>(12);

	//navigation variables
	private _timer:RequestAnimationFrame;
	private _time:number = 0;
	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;
	private _mouseLockX:number = 0;
	private _mouseLockY:number = 0;
	private _mouseLocked:boolean;
	private _flareVisible:boolean;

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
		//initLensFlare();
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

		//setup camera for optimal skybox rendering
		this._camera = new Camera();
		this._camera.projection.far = 100000;
		this._scene.camera = this._camera;

		this._view = this._scene.view;
		this._root = this._scene.root;

		//setup controller to be used on the camera
		this._cameraController = new HoverController(this._camera, null, 0, 0, 600, -90, 90);
		this._cameraController.autoUpdate = false;
		this._cameraController.yFactor = 1;
	}

	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		this._light = new PointLight();
		this._light.x = 10000;
		this._light.ambient = 1;
		this._light.diffuse = 2;

		this._lightPicker = new StaticLightPicker([this._light]);
	}
/*
	private initLensFlare():void
	{
		flares.push(new FlareObject(new Flare10(),  3.2, -0.01, 147.9));
		flares.push(new FlareObject(new Flare11(),  6,    0,     30.6));
		flares.push(new FlareObject(new Flare7(),   2,    0,     25.5));
		flares.push(new FlareObject(new Flare7(),   4,    0,     17.85));
		flares.push(new FlareObject(new Flare12(),  0.4,  0.32,  22.95));
		flares.push(new FlareObject(new Flare6(),   1,    0.68,  20.4));
		flares.push(new FlareObject(new Flare2(),   1.25, 1.1,   48.45));
		flares.push(new FlareObject(new Flare3(),   1.75, 1.37,   7.65));
		flares.push(new FlareObject(new Flare4(),   2.75, 1.85,  12.75));
		flares.push(new FlareObject(new Flare8(),   0.5,  2.21,  33.15));
		flares.push(new FlareObject(new Flare6(),   4,    2.5,   10.4));
		flares.push(new FlareObject(new Flare7(),   10,   2.66,  50));
	}
*/
	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		//adjust specular map
		//var specBitmap:BitmapImage2D = Cast.bitmapData(EarthSpecular);
		//specBitmap.colorTransform(specBitmap.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));

		var specular:SpecularFresnelMethod = new SpecularFresnelMethod(true, 1, 0.1, new SpecularPhongMethod());
		specular.gloss = 5;
		specular.strength = 1;

		this._sunMaterial = new MethodMaterial();
		this._sunMaterial.style.sampler = new ImageSampler(false, true, true);
		this._sunMaterial.blendMode = BlendMode.ADD;

		this._groundMaterial = new MethodMaterial();
		this._groundMaterial.style.sampler = new ImageSampler(false, true, true);
		this._groundMaterial.specularMethod = specular;
		this._groundMaterial.lightPicker = this._lightPicker;
		this._groundMaterial.ambientMethod.strength = 1;
		this._groundMaterial.diffuseMethod.multiply = false;

		this._cloudMaterial = new MethodMaterial();
		this._cloudMaterial.style.sampler = new ImageSampler(false, true, true);
		this._cloudMaterial.alphaBlending = true;
		this._cloudMaterial.lightPicker = this._lightPicker;
		this._cloudMaterial.style.color = 0x1b2048;
		this._cloudMaterial.specularMethod.strength = 0;
		this._cloudMaterial.ambientMethod.strength = 1;
		this._cloudMaterial.diffuseMethod.multiply = false;

		this._atmosphereMaterial = new MethodMaterial();
		this._atmosphereMaterial.diffuseMethod = new DiffuseGlobeMethod();
		this._atmosphereMaterial.specularMethod = new SpecularGlobeMethod(new SpecularPhongMethod());
		this._atmosphereMaterial.blendMode = BlendMode.ADD;
		this._atmosphereMaterial.lightPicker = this._lightPicker;
		this._atmosphereMaterial.specularMethod.strength = 0.5;
		this._atmosphereMaterial.specularMethod.gloss = 5;
		this._atmosphereMaterial.style.color = 0;
		this._atmosphereMaterial.diffuseMethod.color = 0x1671cc;
		this._atmosphereMaterial.ambientMethod.strength = 1;
		this._atmosphereMaterial.diffuseMethod.multiply = false;
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this._orbitContainer = new DisplayObjectContainer();
		this._root.addChild(this._orbitContainer);

		this._sun = new Billboard(this._sunMaterial);
		this._sun.width = 3000;
		this._sun.height = 3000;
		this._sun.registrationPoint = new Vector3D(1500,1500,0);
		this._sun.orientationMode = OrientationMode.CAMERA_PLANE;
		this._sun.x = 10000;
		this._orbitContainer.addChild(this._sun);

		this._earth = <Sprite> new PrimitiveSpherePrefab(this._groundMaterial, ElementsType.TRIANGLE, 200, 200, 100).getNewObject();

		this._clouds = <Sprite> new PrimitiveSpherePrefab(this._cloudMaterial, ElementsType.TRIANGLE, 202, 200, 100).getNewObject();

		this._atmosphere = <Sprite> new PrimitiveSpherePrefab(this._atmosphereMaterial, ElementsType.TRIANGLE, 210, 200, 100).getNewObject();
		this._atmosphere.scaleX = -1;

		this._tiltContainer = new DisplayObjectContainer();
		this._tiltContainer.rotationX = 23;
		this._tiltContainer.addChild(this._earth);
		this._tiltContainer.addChild(this._clouds);
		this._tiltContainer.addChild(this._atmosphere);

		this._root.addChild(this._tiltContainer);

		this._cameraController.lookAtObject = this._tiltContainer;
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

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		//setup the url map for textures in the cubemap file
		var loaderContext:LoaderContext = new LoaderContext();
		loaderContext.dependencyBaseUrl = "assets/skybox/";

		//environment texture
		AssetLibrary.load(new URLRequest("assets/skybox/space_texture.cube"), loaderContext);

		//globe textures
		AssetLibrary.load(new URLRequest("assets/globe/cloud_combined_2048.jpg"));
		AssetLibrary.load(new URLRequest("assets/globe/earth_specular_2048.jpg"));
		AssetLibrary.load(new URLRequest("assets/globe/EarthNormal.png"));
		AssetLibrary.load(new URLRequest("assets/globe/land_lights_16384.jpg"));
		AssetLibrary.load(new URLRequest("assets/globe/land_ocean_ice_2048_match.jpg"));

		//flare textures
		AssetLibrary.load(new URLRequest("assets/lensflare/flare2.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare3.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare4.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare6.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare7.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare8.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare10.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare11.jpg"));
		AssetLibrary.load(new URLRequest("assets/lensflare/flare12.jpg"));
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._time += dt;

		this._earth.rotationY -= 0.2;
		this._clouds.rotationY -= 0.21;
		this._orbitContainer.rotationY -= 0.02;

		this._cameraController.update();

		this.updateFlares();

		this._scene.render();
	}

	private updateFlares():void
	{
		var flareVisibleOld:boolean = this._flareVisible;

		var sunScreenPosition:Vector3D = this._view.project(this._sun.scenePosition);
		var xOffset:number = sunScreenPosition.x - window.innerWidth/2;
		var yOffset:number = sunScreenPosition.y - window.innerHeight/2;

		var earthScreenPosition:Vector3D = this._view.project(this._earth.scenePosition);
		var earthRadius:number = 190 * window.innerHeight/earthScreenPosition.z;
		var flareObject:FlareObject;

		this._flareVisible = (sunScreenPosition.x > 0 && sunScreenPosition.x < window.innerWidth && sunScreenPosition.y > 0 && sunScreenPosition.y  < window.innerHeight && sunScreenPosition.z > 0 && Math.sqrt(xOffset*xOffset + yOffset*yOffset) > earthRadius);

		//update flare visibility
		if (this._flareVisible != flareVisibleOld) {
			for (var i:number = 0; i < this._flares.length; i++) {
				flareObject = this._flares[i];
				if (flareObject)
					flareObject.billboard.visible = this._flareVisible;
			}
		}

		//update flare position
		if (this._flareVisible) {
			var flareDirection:Point = new Point(xOffset, yOffset);
			for (var i:number = 0; i < this._flares.length; i++) {
				flareObject = this._flares[i];
				if (flareObject) {
					var position:Vector3D = this._view.unproject(sunScreenPosition.x - flareDirection.x*flareObject.position, sunScreenPosition.y - flareDirection.y*flareObject.position, 100 - i);
					flareObject.billboard.transform.moveTo(position.x, position.y, position.z);
				}
			}
		}
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete(event:LoaderEvent)
	{
		switch(event.url) {
			//environment texture
			case 'assets/skybox/space_texture.cube':
				this._skyBox = new Skybox(<BitmapImageCube> event.assets[0]);
				this._skyBox.style.sampler = new ImageSampler(false, true);
				this._root.addChild(this._skyBox);
				break;

			//globe textures
			case "assets/globe/cloud_combined_2048.jpg" :
				var cloudBitmapImage2D:BitmapImage2D = new BitmapImage2D(2048, 1024, true, 0xFFFFFFFF);
				cloudBitmapImage2D.copyChannel(<BitmapImage2D> event.assets[0], cloudBitmapImage2D.rect, new Point(), BitmapImageChannel.RED, BitmapImageChannel.ALPHA);

				this._cloudMaterial.ambientMethod.texture = new ImageTexture2D(cloudBitmapImage2D);
				break;
			case "assets/globe/earth_specular_2048.jpg" :
				var specBitmapImage2D:BitmapImage2D = <BitmapImage2D> event.assets[0];
				specBitmapImage2D.colorTransform(specBitmapImage2D.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
				this._groundMaterial.specularMethod.texture = new ImageTexture2D(specBitmapImage2D);
				break;
			case "assets/globe/EarthNormal.png" :
				this._groundMaterial.normalMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/globe/land_lights_16384.jpg" :
				this._groundMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/globe/land_ocean_ice_2048_match.jpg" :
				this._groundMaterial.diffuseMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;

			//flare textures
			case "assets/lensflare/flare2.jpg" :
				this._flares[6] = new FlareObject(<BitmapImage2D> event.assets[0], 1.25, 1.1, 48.45, this._root);
				break;
			case "assets/lensflare/flare3.jpg" :
				this._flares[7] = new FlareObject(<BitmapImage2D> event.assets[0], 1.75, 1.37, 7.65, this._root);
				break;
			case "assets/lensflare/flare4.jpg" :
				this._flares[8] = new FlareObject(<BitmapImage2D> event.assets[0], 2.75, 1.85, 12.75, this._root);
				break;
			case "assets/lensflare/flare6.jpg" :
				this._flares[5] = new FlareObject(<BitmapImage2D> event.assets[0], 1, 0.68, 20.4, this._root);
				this._flares[10] = new FlareObject(<BitmapImage2D> event.assets[0], 4, 2.5, 10.4, this._root);
				break;
			case "assets/lensflare/flare7.jpg" :
				this._flares[2] = new FlareObject(<BitmapImage2D> event.assets[0], 2, 0, 25.5, this._root);
				this._flares[3] = new FlareObject(<BitmapImage2D> event.assets[0], 4, 0, 17.85, this._root);
				this._flares[11] = new FlareObject(<BitmapImage2D> event.assets[0], 10, 2.66, 50, this._root);
				break;
			case "assets/lensflare/flare8.jpg" :
				this._flares[9] = new FlareObject(<BitmapImage2D> event.assets[0], 0.5, 2.21, 33.15, this._root);
				break;
			case "assets/lensflare/flare10.jpg" :
				this._sunMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				this._flares[0] = new FlareObject(<BitmapImage2D> event.assets[0], 3.2, -0.01, 100, this._root);
				break;
			case "assets/lensflare/flare11.jpg" :
				this._flares[1] = new FlareObject(<BitmapImage2D> event.assets[0], 6, 0, 30.6, this._root);
				break;
			case "assets/lensflare/flare12.jpg" :
				this._flares[4] = new FlareObject(<BitmapImage2D> event.assets[0], 0.4, 0.32, 22.95, this._root);
				break;
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
	 * Mouse move listener for mouseLock
	 */
	private onMouseMove(event:MouseEvent):void
	{
//            if (stage.displayState == StageDisplayState.FULL_SCREEN) {
//
//                if (mouseLocked && (lastMouseX != 0 || lastMouseY != 0)) {
//                    e.movementX += lastMouseX;
//                    e.movementY += lastMouseY;
//                    lastMouseX = 0;
//                    lastMouseY = 0;
//                }
//
//                mouseLockX += e.movementX;
//                mouseLockY += e.movementY;
//
//                if (!stage.mouseLock) {
//                    stage.mouseLock = true;
//                    lastMouseX = stage.mouseX - stage.stageWidth/2;
//                    lastMouseY = stage.mouseY - stage.stageHeight/2;
//                } else if (!mouseLocked) {
//                    mouseLocked = true;
//                }
//
//                //ensure bounds for tiltAngle are not eceeded
//                if (mouseLockY > cameraController.maxTiltAngle/0.3)
//                    mouseLockY = cameraController.maxTiltAngle/0.3;
//                else if (mouseLockY < cameraController.minTiltAngle/0.3)
//                    mouseLockY = cameraController.minTiltAngle/0.3;
//            }

//            if (stage.mouseLock) {
//                cameraController.panAngle = 0.3*mouseLockX;
//                cameraController.tiltAngle = 0.3*mouseLockY;
//            } else if (move) {
//                cameraController.panAngle = 0.3*(stage.mouseX - lastMouseX) + lastPanAngle;
//                cameraController.tiltAngle = 0.3*(stage.mouseY - lastMouseY) + lastTiltAngle;
//            }

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

		if (this._cameraController.distance < 400)
			this._cameraController.distance = 400;
		else if (this._cameraController.distance > 10000)
			this._cameraController.distance = 10000;
	}

	/**
	 * Key down listener for fullscreen
	 */
//        private onKeyDown(event:KeyboardEvent):void
//        {
//            switch (event.keyCode)
//            {
//                case Keyboard.SPACE:
//                    if (stage.displayState == StageDisplayState.FULL_SCREEN) {
//                        stage.displayState = StageDisplayState.NORMAL;
//                    } else {
//                        stage.displayState = StageDisplayState.FULL_SCREEN;
//
//                        mouseLocked = false;
//                        mouseLockX = cameraController.panAngle/0.3;
//                        mouseLockY = cameraController.tiltAngle/0.3;
//                    }
//                    break;
//            }
//        }
//

	/**
	 * window listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y         = 0;
		this._view.x         = 0;
		this._view.width     = window.innerWidth;
		this._view.height    = window.innerHeight;
	}
}

class FlareObject
{
	private flareSize:number = 14.4;

	public billboard:Billboard;

	public size:number;

	public position:number;

	public opacity:number;

	/**
	 * Constructor
	 */
	constructor(bitmapData:BitmapImage2D, size:number, position:number, opacity:number, root:DisplayObjectContainer)
	{
		var bd:BitmapImage2D = new BitmapImage2D(bitmapData.width, bitmapData.height, true, 0xFFFFFFFF);
		bd.copyChannel(bitmapData, bitmapData.rect, new Point(), BitmapImageChannel.RED, BitmapImageChannel.ALPHA);

		var billboardMaterial:MethodMaterial = new MethodMaterial(bd);
		billboardMaterial.style.sampler = new ImageSampler(false, true);
		billboardMaterial.alpha = opacity/100;
		billboardMaterial.alphaBlending = true;
		//billboardMaterial.blendMode = BlendMode.LAYER;

		this.billboard = new Billboard(billboardMaterial);
		this.billboard.width = size*this.flareSize;
		this.billboard.height = size*this.flareSize;
		this.billboard.registrationPoint = new Vector3D(size*this.flareSize/2, size*this.flareSize/2, 0);
		this.billboard.orientationMode = OrientationMode.CAMERA_PLANE;
		this.billboard.visible = false;
		this.size = size;
		this.position = position;
		this.opacity = opacity;

		root.addChild(this.billboard)
	}
}

class DiffuseGlobeMethod extends DiffuseCompositeMethod
{
	public static assetType:string = "[asset DiffuseGlobeMethod]";

	/**
	 * @inheritDoc
	 */
	public get assetType():string
	{
		return DiffuseGlobeMethod.assetType;
	}
}

class DiffuseGlobeChunk extends _Shader_LightingCompositeMethod
{
	/**
	 * Creates a new DiffuseCelChunk object.
	 * @param levels The amount of shadow gradations.
	 * @param baseMethod An optional diffuse method on which the cartoon shading is based. If omitted, DiffuseBasicMethod is used.
	 */
	constructor(method: DiffuseGlobeMethod, shader: LightingShader)
	{
		super(method, shader);

		(<_IShader_LightingMethod> this._baseChunk)._modulateFunction = (targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData) => this.modulateDiffuseMethod(targetReg, registerCache, sharedRegisters);
	}

	private modulateDiffuseMethod(targetReg:ShaderRegisterElement, regCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var viewDirFragmentReg:ShaderRegisterElement = sharedRegisters.viewDirFragment;
		var normalFragmentReg:ShaderRegisterElement = sharedRegisters.normalFragment;

		var code:string = "dp3 " + targetReg + ".w, " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" +
			"mul " + targetReg + ".w, " + targetReg + ".w, " + targetReg + ".w\n";

		return code;
	}
}


class SpecularGlobeMethod extends SpecularCompositeMethod
{
	public static assetType:string = "[asset SpecularGlobeMethod]";

	/**
	 * @inheritDoc
	 */
	public get assetType():string
	{
		return SpecularGlobeMethod.assetType;
	}
}

class SpecularGlobeChunk extends _Shader_LightingCompositeMethod
{
	/**
	 * Creates a new DiffuseCelChunk object.
	 * @param levels The amount of shadow gradations.
	 * @param baseMethod An optional diffuse method on which the cartoon shading is based. If omitted, DiffuseBasicMethod is used.
	 */
	constructor(method: SpecularGlobeMethod, shader: LightingShader)
	{
		super(method, shader);

		(<_IShader_LightingMethod> this._baseChunk)._modulateFunction = (targetReg: ShaderRegisterElement, registerCache: ShaderRegisterCache, sharedRegisters: ShaderRegisterData) => this.modulateSpecularMethod(targetReg, registerCache, sharedRegisters);
	}


	private modulateSpecularMethod(targetReg:ShaderRegisterElement, regCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var viewDirFragmentReg:ShaderRegisterElement = sharedRegisters.viewDirFragment;
		var normalFragmentReg:ShaderRegisterElement = sharedRegisters.normalFragment;
		var temp:ShaderRegisterElement = regCache.getFreeFragmentSingleTemp();
		regCache.addFragmentTempUsages(temp, 1);

		var code:string = "dp3 " + temp + ", " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" +
			"neg " + temp + ", " + temp + "\n" +
			"mul " + targetReg + ".w, " + targetReg + ".w, " + temp + "\n";

		regCache.removeFragmentTempUsage(temp);

		return code;
	}
}

ShaderBase.registerAbstraction(DiffuseGlobeChunk, DiffuseGlobeMethod);
ShaderBase.registerAbstraction(SpecularGlobeChunk, SpecularGlobeMethod);

window.onload = function ()
{
	new Intermediate_Globe();
}