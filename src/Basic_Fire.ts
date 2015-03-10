/*

Creating fire effects with particles in Away3D

Demonstrates:

How to setup a particle geometry and particle animationset in order to simulate fire.
How to stagger particle animation instances with different animator objects running on different timers.
How to apply fire lighting to a floor mesh using a multipass material.

Code by Rob Bateman & Liao Cheng
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk
liaocheng210@126.com

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

import BlendMode					= require("awayjs-core/lib/data/BlendMode");
import Geometry						= require("awayjs-core/lib/data/Geometry");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import TimerEvent					= require("awayjs-core/lib/events/TimerEvent");
import ColorTransform				= require("awayjs-core/lib/geom/ColorTransform");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import AssetLoaderContext			= require("awayjs-core/lib/library/AssetLoaderContext");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import Texture2DBase				= require("awayjs-core/lib/textures/Texture2DBase");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");
import Timer						= require("awayjs-core/lib/utils/Timer");

import Loader						= require("awayjs-display/lib/containers/Loader");
import Scene						= require("awayjs-display/lib/containers/Scene");
import View							= require("awayjs-display/lib/containers/View");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import DirectionalLight				= require("awayjs-display/lib/entities/DirectionalLight");
import Camera						= require("awayjs-display/lib/entities/Camera");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import PointLight					= require("awayjs-display/lib/entities/PointLight");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PrimitivePlanePrefab			= require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
import Cast							= require("awayjs-display/lib/utils/Cast");

import ParticleAnimationSet			= require("awayjs-renderergl/lib/animators/ParticleAnimationSet");
import ParticleAnimator				= require("awayjs-renderergl/lib/animators/ParticleAnimator");
import ParticleProperties			= require("awayjs-renderergl/lib/animators/data/ParticleProperties");
import ParticlePropertiesMode		= require("awayjs-renderergl/lib/animators/data/ParticlePropertiesMode");
import ParticleBillboardNode		= require("awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode");
import ParticleScaleNode			= require("awayjs-renderergl/lib/animators/nodes/ParticleScaleNode");
import ParticleVelocityNode			= require("awayjs-renderergl/lib/animators/nodes/ParticleVelocityNode");
import ParticleColorNode			= require("awayjs-renderergl/lib/animators/nodes/ParticleColorNode");
import ParticleGeometry				= require("awayjs-renderergl/lib/base/ParticleGeometry");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
import MethodMaterialMode			= require("awayjs-methodmaterials/lib/MethodMaterialMode");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");
import ParticleGeometryHelper		= require("awayjs-renderergl/lib/utils/ParticleGeometryHelper");

class Basic_Fire
{
	private static NUM_FIRES:number /*uint*/ = 10;

	//engine variables
	private scene:Scene;
	private camera:Camera;
	private view:View;
	private cameraController:HoverController;

	//material objects
	private planeMaterial:MethodMaterial;
	private particleMaterial:MethodMaterial;

	//light objects
	private directionalLight:DirectionalLight;
	private lightPicker:StaticLightPicker;

	//particle objects
	private fireAnimationSet:ParticleAnimationSet;
	private particleGeometry:ParticleGeometry;
	private fireTimer:Timer;

	//scene objects
	private plane:Mesh;
	private fireObjects:Array<FireVO> = new Array<FireVO>();

	//navigation variables
	private timer:RequestAnimationFrame;
	private time:number = 0;
	private move:boolean = false;
	private lastPanAngle:number;
	private lastTiltAngle:number;
	private lastMouseX:number;
	private lastMouseY:number;

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
		this.initParticles();
		this.initObjects();
		this.initListeners();
	}

	/**
	 * Initialise the engine
	 */
	private initEngine():void
	{
		this.scene = new Scene();

		this.camera = new Camera();

		this.view = new View(new DefaultRenderer(MethodRendererPool));
		//this.view.antiAlias = 4;
		this.view.scene = this.scene;
		this.view.camera = this.camera;

		//setup controller to be used on the camera
		this.cameraController = new HoverController(this.camera);
		this.cameraController.distance = 1000;
		this.cameraController.minTiltAngle = 0;
		this.cameraController.maxTiltAngle = 90;
		this.cameraController.panAngle = 45;
		this.cameraController.tiltAngle = 20;
	}

	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		this.directionalLight = new DirectionalLight(0, -1, 0);
		this.directionalLight.castsShadows = false;
		this.directionalLight.color = 0xeedddd;
		this.directionalLight.diffuse = .5;
		this.directionalLight.ambient = .5;
		this.directionalLight.specular = 0;
		this.directionalLight.ambientColor = 0x808090;
		this.view.scene.addChild(this.directionalLight);

		this.lightPicker = new StaticLightPicker([this.directionalLight]);
	}

	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		this.planeMaterial = new MethodMaterial();
		this.planeMaterial.mode = MethodMaterialMode.MULTI_PASS;
		this.planeMaterial.lightPicker = this.lightPicker;
		this.planeMaterial.repeat = true;
		this.planeMaterial.mipmap = false;
		this.planeMaterial.specular = 10;

		this.particleMaterial = new MethodMaterial();
		this.particleMaterial.blendMode = BlendMode.ADD;
	}

	/**
	 * Initialise the particles
	 */
	private initParticles():void
	{

		//create the particle animation set
		this.fireAnimationSet = new ParticleAnimationSet(true, true);

		//add some animations which can control the particles:
		//the global animations can be set directly, because they influence all the particles with the same factor
		this.fireAnimationSet.addAnimation(new ParticleBillboardNode());
		this.fireAnimationSet.addAnimation(new ParticleScaleNode(ParticlePropertiesMode.GLOBAL, false, false, 2.5, 0.5));
		this.fireAnimationSet.addAnimation(new ParticleVelocityNode(ParticlePropertiesMode.GLOBAL, new Vector3D(0, 80, 0)));
		this.fireAnimationSet.addAnimation(new ParticleColorNode(ParticlePropertiesMode.GLOBAL, true, true, false, false, new ColorTransform(0, 0, 0, 1, 0xFF, 0x33, 0x01), new ColorTransform(0, 0, 0, 1, 0x99)));

		//no need to set the local animations here, because they influence all the particle with different factors.
		this.fireAnimationSet.addAnimation(new ParticleVelocityNode(ParticlePropertiesMode.LOCAL_STATIC));

		//set the initParticleFunc. It will be invoked for the local static property initialization of every particle
		this.fireAnimationSet.initParticleFunc = this.initParticleFunc;

		//create the original particle geometry
		var particle:PrimitivePlanePrefab = new PrimitivePlanePrefab(10, 10, 1, 1, false);

		//combine them into a list
		var geometrySet:Array<Geometry> = new Array<Geometry>();
		for (var i:number /*int*/ = 0; i < 500; i++)
			geometrySet.push(particle.geometry);

		this.particleGeometry = ParticleGeometryHelper.generateGeometry(geometrySet);
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this.plane = <Mesh> new PrimitivePlanePrefab(1000, 1000).getNewObject();
		this.plane.material = this.planeMaterial;
		this.plane.geometry.scaleUV(2, 2);
		this.plane.y = -20;

		this.scene.addChild(this.plane);

		//create fire object meshes from geomtry and material, and apply particle animators to each
		for (var i:number /*int*/ = 0; i < Basic_Fire.NUM_FIRES; i++) {
			var particleMesh:Mesh = new Mesh(this.particleGeometry, this.particleMaterial);
			var animator:ParticleAnimator = new ParticleAnimator(this.fireAnimationSet);
			particleMesh.animator = animator;

			//position the mesh
			var degree:number = i / Basic_Fire.NUM_FIRES * Math.PI * 2;
			particleMesh.x = Math.sin(degree) * 400;
			particleMesh.z = Math.cos(degree) * 400;
			particleMesh.y = 5;

			//create a fire object and add it to the fire object vector
			this.fireObjects.push(new FireVO(particleMesh, animator));
			this.view.scene.addChild(particleMesh);
		}

		//setup timer for triggering each particle aniamtor
		this.fireTimer = new Timer(1000, this.fireObjects.length);
		this.fireTimer.addEventListener(TimerEvent.TIMER, (event:TimerEvent) => this.onTimer(event));
		this.fireTimer.start();
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

		this.onResize();

		this.timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this.timer.start();

		AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		//plane textures
		AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_normal.jpg"));
		AssetLibrary.load(new URLRequest("assets/floor_specular.jpg"));

		//particle texture
		AssetLibrary.load(new URLRequest("assets/blue.png"));
	}

	/**
	 * Initialiser for particle properties
	 */
	private initParticleFunc(prop:ParticleProperties):void
	{
		prop.startTime = Math.random()*5;
		prop.duration = Math.random() * 4 + 0.1;

		var degree1:number = Math.random() * Math.PI * 2;
		var degree2:number = Math.random() * Math.PI * 2;
		var r:number = 15;
		prop[ParticleVelocityNode.VELOCITY_VECTOR3D] = new Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
	}

	/**
	 * Returns an array of active lights in the scene
	 */
	private getAllLights():Array<any>
	{
		var lights:Array<any> = new Array<any>();

		lights.push(this.directionalLight);

		var fireVO:FireVO;
		for (var i:number /*uint*/ = 0; i < this.fireObjects.length; i++) {
			fireVO = this.fireObjects[i];
			if (fireVO.light)
				lights.push(fireVO.light);
		}

		return lights;
	}

	/**
	 * Timer event handler
	 */
	private onTimer(event:TimerEvent):void
	{
		var fireObject:FireVO = this.fireObjects[this.fireTimer.currentCount-1];

		//start the animator
		fireObject.animator.start();

		//create the lightsource
		var light:PointLight = new PointLight();
		light.color = 0xFF3301;
		light.diffuse = 0;
		light.specular = 0;
		light.transform.position = fireObject.mesh.transform.position;

		//add the lightsource to the fire object
		fireObject.light = light;

		//update the lightpicker
		this.lightPicker.lights = this.getAllLights();
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this.time += dt;

		//animate lights
		var fireVO:FireVO;
		for (var i:number /*uint*/ = 0; i < this.fireObjects.length; i++) {
			fireVO = this.fireObjects[i];

			//update flame light
			var light : PointLight = fireVO.light;

			if (!light)
				continue;

			if (fireVO.strength < 1)
				fireVO.strength += 0.1;

			light.fallOff = 380+Math.random()*20;
			light.radius = 200+Math.random()*30;
			light.diffuse = light.specular = fireVO.strength+Math.random()*.2;
		}

		this.view.render();
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete(event:LoaderEvent)
	{
		var assets:IAsset[] = event.assets;
		var length:number = assets.length;

		for (var c:number = 0; c < length; c++) {
			var asset:IAsset = assets[c];

			console.log(asset.name, event.url);

			switch (event.url) {
				//plane textures
				case "assets/floor_diffuse.jpg" :
					this.planeMaterial.texture = <Texture2DBase> asset;
					break;
				case "assets/floor_normal.jpg" :
					this.planeMaterial.normalMap = <Texture2DBase> asset;
					break;
				case "assets/floor_specular.jpg" :
					this.planeMaterial.specularMap = <Texture2DBase> asset;
					break;

				//particle texture
				case "assets/blue.png" :
					this.particleMaterial.texture = <Texture2DBase> asset;
					break;
			}
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

	private onMouseMove(event:MouseEvent)
	{
		if (this.move) {
			this.cameraController.panAngle = 0.3*(event.clientX - this.lastMouseX) + this.lastPanAngle;
			this.cameraController.tiltAngle = 0.3*(event.clientY - this.lastMouseY) + this.lastTiltAngle;
		}
	}

	/**
	 * stage listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this.view.y = 0;
		this.view.x = 0;
		this.view.width = window.innerWidth;
		this.view.height = window.innerHeight;
	}
}

/**
* Data class for the fire objects
*/
class FireVO
{
	public mesh:Mesh;
	public animator:ParticleAnimator;
	public light:PointLight;
	public strength:number = 0;

	constructor(mesh:Mesh, animator:ParticleAnimator)
	{
		this.mesh = mesh;
		this.animator = animator;
	}
}


window.onload = function ()
{
	new Basic_Fire();
}