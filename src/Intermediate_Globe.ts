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
import BitmapData					= require("awayjs-core/lib/data/BitmapData");
import BitmapDataChannel			= require("awayjs-core/lib/data/BitmapDataChannel");
import BlendMode					= require("awayjs-core/lib/data/BlendMode");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import ColorTransform				= require("awayjs-core/lib/geom/ColorTransform");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import Point						= require("awayjs-core/lib/geom/Point");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import AssetLoaderContext			= require("awayjs-core/lib/library/AssetLoaderContext");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import ImageCubeTexture				= require("awayjs-core/lib/textures/ImageCubeTexture");
import ImageTexture					= require("awayjs-core/lib/textures/ImageTexture");
import BitmapTexture				= require("awayjs-core/lib/textures/BitmapTexture");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import DisplayObjectContainer		= require("awayjs-display/lib/containers/DisplayObjectContainer");
import Scene						= require("awayjs-display/lib/containers/Scene");
import Loader						= require("awayjs-display/lib/containers/Loader");
import View							= require("awayjs-display/lib/containers/View");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import OrientationMode				= require("awayjs-display/lib/base/OrientationMode");
import AlignmentMode				= require("awayjs-display/lib/base/AlignmentMode");
import Camera						= require("awayjs-display/lib/entities/Camera");
import Billboard					= require("awayjs-display/lib/entities/Billboard");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import PointLight					= require("awayjs-display/lib/entities/PointLight");
import Skybox						= require("awayjs-display/lib/entities/Skybox");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PrimitiveSpherePrefab		= require("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");
import Cast							= require("awayjs-display/lib/utils/Cast");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");
import ShaderObjectBase				= require("awayjs-renderergl/lib/compilation/ShaderObjectBase");
import ShaderRegisterElement		= require("awayjs-renderergl/lib/compilation/ShaderRegisterElement");
import ShaderRegisterCache			= require("awayjs-renderergl/lib/compilation/ShaderRegisterCache");
import ShaderRegisterData			= require("awayjs-renderergl/lib/compilation/ShaderRegisterData");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
import MethodVO						= require("awayjs-methodmaterials/lib/data/MethodVO");
import DiffuseCompositeMethod		= require("awayjs-methodmaterials/lib/methods/DiffuseCompositeMethod");
import SpecularCompositeMethod		= require("awayjs-methodmaterials/lib/methods/SpecularCompositeMethod");
import DiffuseBasicMethod			= require("awayjs-methodmaterials/lib/methods/DiffuseBasicMethod");
import SpecularBasicMethod			= require("awayjs-methodmaterials/lib/methods/SpecularBasicMethod");
import SpecularFresnelMethod		= require("awayjs-methodmaterials/lib/methods/SpecularFresnelMethod");
import SpecularPhongMethod			= require("awayjs-methodmaterials/lib/methods/SpecularPhongMethod");

class Intermediate_Globe
{
	//engine variables
	private scene:Scene;
	private camera:Camera;
	private view:View;
	private cameraController:HoverController;

	//material objects
	private sunMaterial:MethodMaterial;
	private groundMaterial:MethodMaterial;
	private cloudMaterial:MethodMaterial;
	private atmosphereMaterial:MethodMaterial;
	private atmosphereDiffuseMethod:DiffuseBasicMethod;
	private atmosphereSpecularMethod:SpecularBasicMethod;
	private cubeTexture:ImageCubeTexture;

	//scene objects
	private sun:Billboard;
	private earth:Mesh;
	private clouds:Mesh;
	private atmosphere:Mesh;
	private tiltContainer:DisplayObjectContainer;
	private orbitContainer:DisplayObjectContainer;
	private skyBox:Skybox;

	//light objects
	private light:PointLight;
	private lightPicker:StaticLightPicker;
	private flares:FlareObject[] = new Array<FlareObject>(12);

	//navigation variables
	private _timer:RequestAnimationFrame;
	private _time:number = 0;
	private move:boolean = false;
	private lastPanAngle:number;
	private lastTiltAngle:number;
	private lastMouseX:number;
	private lastMouseY:number;
	private mouseLockX:number = 0;
	private mouseLockY:number = 0;
	private mouseLocked:boolean;
	private flareVisible:boolean;

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
		this.scene = new Scene();

		//setup camera for optimal skybox rendering
		this.camera = new Camera();
		this.camera.projection.far = 100000;

		this.view = new View(new DefaultRenderer(MethodRendererPool));
		this.view.scene = this.scene;
		this.view.camera = this.camera;

		//setup controller to be used on the camera
		this.cameraController = new HoverController(this.camera, null, 0, 0, 600, -90, 90);
		this.cameraController.autoUpdate = false;
		this.cameraController.yFactor = 1;
	}

	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		this.light = new PointLight();
		this.light.x = 10000;
		this.light.ambient = 1;
		this.light.diffuse = 2;

		this.lightPicker = new StaticLightPicker([this.light]);
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
		//this.cubeTexture = new BitmapCubeTexture(Cast.bitmapData(PosX), Cast.bitmapData(NegX), Cast.bitmapData(PosY), Cast.bitmapData(NegY), Cast.bitmapData(PosZ), Cast.bitmapData(NegZ));

		//adjust specular map
		//var specBitmap:BitmapData = Cast.bitmapData(EarthSpecular);
		//specBitmap.colorTransform(specBitmap.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));

		var specular:SpecularFresnelMethod = new SpecularFresnelMethod(true, new SpecularPhongMethod());
		specular.fresnelPower = 1;
		specular.normalReflectance = 0.1;

		this.sunMaterial = new MethodMaterial();
		this.sunMaterial.blendMode = BlendMode.ADD;

		this.groundMaterial = new MethodMaterial();
		this.groundMaterial.specularMethod = specular;
		this.groundMaterial.lightPicker = this.lightPicker;
		this.groundMaterial.gloss = 5;
		this.groundMaterial.specular = 1;
		this.groundMaterial.ambient = 1;
		this.groundMaterial.diffuseMethod.multiply = false;

		this.cloudMaterial = new MethodMaterial();
		this.cloudMaterial.alphaBlending = true;
		this.cloudMaterial.lightPicker = this.lightPicker;
		this.cloudMaterial.ambientColor = 0x1b2048;
		this.cloudMaterial.specular = 0;
		this.cloudMaterial.ambient = 1;

		this.atmosphereDiffuseMethod = new DiffuseCompositeMethod(this.modulateDiffuseMethod);
		this.atmosphereSpecularMethod = new SpecularCompositeMethod(this.modulateSpecularMethod, new SpecularPhongMethod());

		this.atmosphereMaterial = new MethodMaterial();
		this.atmosphereMaterial.diffuseMethod = this.atmosphereDiffuseMethod;
		this.atmosphereMaterial.specularMethod = this.atmosphereSpecularMethod;
		this.atmosphereMaterial.blendMode = BlendMode.ADD;
		this.atmosphereMaterial.lightPicker = this.lightPicker;
		this.atmosphereMaterial.specular = 0.5;
		this.atmosphereMaterial.gloss = 5;
		this.atmosphereMaterial.ambientColor = 0;
		this.atmosphereMaterial.diffuseColor = 0x1671cc;
		this.atmosphereMaterial.ambient = 1;
	}

	private modulateDiffuseMethod(shaderObject:ShaderObjectBase, methodVO:MethodVO, targetReg:ShaderRegisterElement, regCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
	{
		var viewDirFragmentReg:ShaderRegisterElement = sharedRegisters.viewDirFragment;
		var normalFragmentReg:ShaderRegisterElement = sharedRegisters.normalFragment;

		var code:string = "dp3 " + targetReg + ".w, " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" +
			"mul " + targetReg + ".w, " + targetReg + ".w, " + targetReg + ".w\n";

		return code;
	}

	private modulateSpecularMethod(shaderObject:ShaderObjectBase, methodVO:MethodVO, targetReg:ShaderRegisterElement, regCache:ShaderRegisterCache, sharedRegisters:ShaderRegisterData):string
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

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this.orbitContainer = new DisplayObjectContainer();
		this.orbitContainer.addChild(this.light);
		this.scene.addChild(this.orbitContainer);

		this.sun = new Billboard(this.sunMaterial);
		this.sun.width = 3000;
		this.sun.height = 3000;
		this.sun.pivot = new Vector3D(1500,1500,0);
		this.sun.orientationMode = OrientationMode.CAMERA_PLANE;
		this.sun.alignmentMode = AlignmentMode.PIVOT_POINT;
		this.sun.x = 10000;
		this.orbitContainer.addChild(this.sun);

		this.earth = <Mesh> new PrimitiveSpherePrefab(200, 200, 100).getNewObject();
		this.earth.material = this.groundMaterial;

		this.clouds = <Mesh> new PrimitiveSpherePrefab(202, 200, 100).getNewObject();
		this.clouds.material = this.cloudMaterial;

		this.atmosphere = <Mesh> new PrimitiveSpherePrefab(210, 200, 100).getNewObject();
		this.atmosphere.material = this.atmosphereMaterial;
		this.atmosphere.scaleX = -1;

		this.tiltContainer = new DisplayObjectContainer();
		this.tiltContainer.rotationX = -23;
		this.tiltContainer.addChild(this.earth);
		this.tiltContainer.addChild(this.clouds);
		this.tiltContainer.addChild(this.atmosphere);

		this.scene.addChild(this.tiltContainer);

		this.cameraController.lookAtObject = this.tiltContainer;
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
		document.onmousewheel= (event:MouseWheelEvent) => this.onMouseWheel(event);


		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		//setup the url map for textures in the cubemap file
		var assetLoaderContext:AssetLoaderContext = new AssetLoaderContext();
		assetLoaderContext.dependencyBaseUrl = "assets/skybox/";

		//environment texture
		AssetLibrary.load(new URLRequest("assets/skybox/space_texture.cube"), assetLoaderContext);

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

		this.earth.rotationY += 0.2;
		this.clouds.rotationY += 0.21;
		this.orbitContainer.rotationY += 0.02;

		this.cameraController.update();

		this.updateFlares();

		this.view.render();
	}

	private updateFlares():void
	{
		var flareVisibleOld:boolean = this.flareVisible;

		var sunScreenPosition:Vector3D = this.view.project(this.sun.scenePosition);
		var xOffset:number = sunScreenPosition.x - window.innerWidth/2;
		var yOffset:number = sunScreenPosition.y - window.innerHeight/2;

		var earthScreenPosition:Vector3D = this.view.project(this.earth.scenePosition);
		var earthRadius:number = 190 * window.innerHeight/earthScreenPosition.z;
		var flareObject:FlareObject;

		this.flareVisible = (sunScreenPosition.x > 0 && sunScreenPosition.x < window.innerWidth && sunScreenPosition.y > 0 && sunScreenPosition.y  < window.innerHeight && sunScreenPosition.z > 0 && Math.sqrt(xOffset*xOffset + yOffset*yOffset) > earthRadius);

		//update flare visibility
		if (this.flareVisible != flareVisibleOld) {
			for (var i:number = 0; i < this.flares.length; i++) {
				flareObject = this.flares[i];
				if (flareObject)
					flareObject.billboard.visible = this.flareVisible;
			}
		}

		//update flare position
		if (this.flareVisible) {
			var flareDirection:Point = new Point(xOffset, yOffset);
			for (var i:number = 0; i < this.flares.length; i++) {
				flareObject = this.flares[i];
				if (flareObject)
					flareObject.billboard.transform.position = this.view.unproject(sunScreenPosition.x - flareDirection.x*flareObject.position, sunScreenPosition.y - flareDirection.y*flareObject.position, 100 - i);
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
				this.cubeTexture = <ImageCubeTexture> event.assets[ 0 ];

				this.skyBox = new Skybox(this.cubeTexture);
				this.scene.addChild(this.skyBox);
				break;

			//globe textures
			case "assets/globe/cloud_combined_2048.jpg" :
				var cloudBitmapData:BitmapData = new BitmapData(2048, 1024, true, 0xFFFFFFFF);
				cloudBitmapData.copyChannel(Cast.bitmapData(event.assets[ 0 ]), cloudBitmapData.rect, new Point(), BitmapDataChannel.RED, BitmapDataChannel.ALPHA);

				this.cloudMaterial.texture = new BitmapTexture(cloudBitmapData);
				break;
			case "assets/globe/earth_specular_2048.jpg" :
				var specBitmapData:BitmapData = Cast.bitmapData(event.assets[ 0 ]);
				specBitmapData.colorTransform(specBitmapData.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
				this.groundMaterial.specularMap = new BitmapTexture(specBitmapData);
				break;
			case "assets/globe/EarthNormal.png" :
				this.groundMaterial.normalMap = <ImageTexture> event.assets[ 0 ];
				break;
			case "assets/globe/land_lights_16384.jpg" :
				this.groundMaterial.texture = <ImageTexture> event.assets[ 0 ];
				break;
			case "assets/globe/land_ocean_ice_2048_match.jpg" :
				this.groundMaterial.diffuseTexture = <ImageTexture> event.assets[ 0 ];
				break;

			//flare textures
			case "assets/lensflare/flare2.jpg" :
				this.flares[6] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 1.25, 1.1, 48.45, this.scene);
				break;
			case "assets/lensflare/flare3.jpg" :
				this.flares[7] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 1.75, 1.37, 7.65, this.scene);
				break;
			case "assets/lensflare/flare4.jpg" :
				this.flares[8] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 2.75, 1.85, 12.75, this.scene);
				break;
			case "assets/lensflare/flare6.jpg" :
				this.flares[5] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 1, 0.68, 20.4, this.scene);
				this.flares[10] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 4, 2.5, 10.4, this.scene);
				break;
			case "assets/lensflare/flare7.jpg" :
				this.flares[2] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 2, 0, 25.5, this.scene);
				this.flares[3] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 4, 0, 17.85, this.scene);
				this.flares[11] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 10, 2.66, 50, this.scene);
				break;
			case "assets/lensflare/flare8.jpg" :
				this.flares[9] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 0.5, 2.21, 33.15, this.scene);
				break;
			case "assets/lensflare/flare10.jpg" :
				this.sunMaterial.texture = <ImageTexture> event.assets[ 0 ];
				this.flares[0] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 3.2, -0.01, 100, this.scene);
				break;
			case "assets/lensflare/flare11.jpg" :
				this.flares[1] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 6, 0, 30.6, this.scene);
				break;
			case "assets/lensflare/flare12.jpg" :
				this.flares[4] = new FlareObject(Cast.bitmapData(event.assets[ 0 ]), 0.4, 0.32, 22.95, this.scene);
				break;
		}
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event:MouseEvent):void
	{
		this.lastPanAngle = this.cameraController.panAngle;
		this.lastTiltAngle = this.cameraController.tiltAngle;
		this.lastMouseX = event.clientX;
		this.lastMouseY = event.clientY;
		this.move = true;
	}

	/**
	 * Mouse up listener for navigation
	 */
	private onMouseUp(event:MouseEvent):void
	{
		this.move = false;
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

		if (this.move) {
			this.cameraController.panAngle = 0.3*(event.clientX - this.lastMouseX) + this.lastPanAngle;
			this.cameraController.tiltAngle = 0.3*(event.clientY - this.lastMouseY) + this.lastTiltAngle;
		}
	}

	/**
	 * Mouse wheel listener for navigation
	 */
	private onMouseWheel(event:MouseWheelEvent)
	{
		this.cameraController.distance -= event.wheelDelta;

		if (this.cameraController.distance < 400)
			this.cameraController.distance = 400;
		else if (this.cameraController.distance > 10000)
			this.cameraController.distance = 10000;
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
		this.view.y         = 0;
		this.view.x         = 0;
		this.view.width     = window.innerWidth;
		this.view.height    = window.innerHeight;
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
	constructor(bitmapData:BitmapData, size:number, position:number, opacity:number, scene:Scene)
	{
		var bd:BitmapData = new BitmapData(bitmapData.width, bitmapData.height, true, 0xFFFFFFFF);
		bd.copyChannel(bitmapData, bitmapData.rect, new Point(), BitmapDataChannel.RED, BitmapDataChannel.ALPHA);

		var billboardMaterial:MethodMaterial = new MethodMaterial(new BitmapTexture(bd));
		billboardMaterial.alpha = opacity/100;
		billboardMaterial.alphaBlending = true;
		//billboardMaterial.blendMode = BlendMode.LAYER;

		this.billboard = new Billboard(billboardMaterial);
		this.billboard.width = size*this.flareSize;
		this.billboard.height = size*this.flareSize;
		this.billboard.pivot = new Vector3D(size*this.flareSize/2, size*this.flareSize/2, 0);
		this.billboard.orientationMode = OrientationMode.CAMERA_PLANE;
		this.billboard.alignmentMode = AlignmentMode.PIVOT_POINT;
		this.billboard.visible = false;
		this.size = size;
		this.position = position;
		this.opacity = opacity;

		scene.addChild(this.billboard)
	}
}

window.onload = function ()
{
	new Intermediate_Globe();
}