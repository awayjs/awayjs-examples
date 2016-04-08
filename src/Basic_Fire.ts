/*

Creating fire effects with particles in Away3D

Demonstrates:

How to setup a particle geometry and particle animationset in order to simulate fire.
How to stagger particle animation instances with different animator objects running on different timers.
How to apply fire lighting to a floor sprite using a multipass material.

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

import BitmapImage2D				from "awayjs-core/lib/image/BitmapImage2D";
import Sampler2D					from "awayjs-core/lib/image/Sampler2D";
import BlendMode					from "awayjs-core/lib/image/BlendMode";
import LoaderEvent					from "awayjs-core/lib/events/LoaderEvent";
import TimerEvent					from "awayjs-core/lib/events/TimerEvent";
import ColorTransform				from "awayjs-core/lib/geom/ColorTransform";
import Vector3D						from "awayjs-core/lib/geom/Vector3D";
import AssetLibrary					from "awayjs-core/lib/library/AssetLibrary";
import IAsset						from "awayjs-core/lib/library/IAsset";
import URLRequest					from "awayjs-core/lib/net/URLRequest";
import RequestAnimationFrame		from "awayjs-core/lib/utils/RequestAnimationFrame";
import Timer						from "awayjs-core/lib/utils/Timer";

import Graphics						from "awayjs-display/lib/graphics/Graphics";
import Scene						from "awayjs-display/lib/display/Scene";
import View							from "awayjs-display/lib/View";
import HoverController				from "awayjs-display/lib/controllers/HoverController";
import DirectionalLight				from "awayjs-display/lib/display/DirectionalLight";
import Camera						from "awayjs-display/lib/display/Camera";
import Sprite						from "awayjs-display/lib/display/Sprite";
import PointLight					from "awayjs-display/lib/display/PointLight";
import ElementsType					from "awayjs-display/lib/graphics/ElementsType";
import StaticLightPicker			from "awayjs-display/lib/materials/lightpickers/StaticLightPicker";
import PrimitivePlanePrefab			from "awayjs-display/lib/prefabs/PrimitivePlanePrefab";
import Single2DTexture				from "awayjs-display/lib/textures/Single2DTexture";

import ParticleAnimationSet			from "awayjs-renderergl/lib/animators/ParticleAnimationSet";
import ParticleAnimator				from "awayjs-renderergl/lib/animators/ParticleAnimator";
import ParticleProperties			from "awayjs-renderergl/lib/animators/data/ParticleProperties";
import ParticlePropertiesMode		from "awayjs-renderergl/lib/animators/data/ParticlePropertiesMode";
import ParticleBillboardNode		from "awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode";
import ParticleScaleNode			from "awayjs-renderergl/lib/animators/nodes/ParticleScaleNode";
import ParticleVelocityNode			from "awayjs-renderergl/lib/animators/nodes/ParticleVelocityNode";
import ParticleColorNode			from "awayjs-renderergl/lib/animators/nodes/ParticleColorNode";

import MethodMaterial				from "awayjs-methodmaterials/lib/MethodMaterial";
import MethodMaterialMode			from "awayjs-methodmaterials/lib/MethodMaterialMode";

import DefaultRenderer				from "awayjs-renderergl/lib/DefaultRenderer";
import ParticleGraphicsHelper		from "awayjs-renderergl/lib/utils/ParticleGraphicsHelper";

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
	private particleSprite:Sprite;
	private fireTimer:Timer;

	//scene objects
	private plane:Sprite;
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

		this.view = new View(new DefaultRenderer());
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
		this.planeMaterial.style.sampler = new Sampler2D(true, true, false);
		this.planeMaterial.specularMethod.strength = 10;

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
		var particle:Sprite = <Sprite> (new PrimitivePlanePrefab(null, ElementsType.TRIANGLE, 10, 10, 1, 1, false)).getNewObject();

		//combine them into a list
		var graphicsSet:Array<Graphics> = new Array<Graphics>();
		for (var i:number /*int*/ = 0; i < 500; i++)
			graphicsSet.push(particle.graphics);

		this.particleSprite = new Sprite(this.particleMaterial);
		ParticleGraphicsHelper.generateGraphics(this.particleSprite.graphics, graphicsSet);
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this.plane = <Sprite> new PrimitivePlanePrefab(this.planeMaterial, ElementsType.TRIANGLE, 1000, 1000).getNewObject();
		this.plane.material = this.planeMaterial;
		this.plane.graphics.scaleUV(2, 2);
		this.plane.y = -20;

		this.scene.addChild(this.plane);

		//create fire object sprites from geomtry and material, and apply particle animators to each
		for (var i:number /*int*/ = 0; i < Basic_Fire.NUM_FIRES; i++) {
			var particleSprite:Sprite = this.particleSprite.clone();
			var animator:ParticleAnimator = new ParticleAnimator(this.fireAnimationSet);
			particleSprite.animator = animator;

			//position the sprite
			var degree:number = i / Basic_Fire.NUM_FIRES * Math.PI * 2;
			particleSprite.x = Math.sin(degree) * 400;
			particleSprite.z = Math.cos(degree) * 400;
			particleSprite.y = 5;

			//create a fire object and add it to the fire object vector
			this.fireObjects.push(new FireVO(particleSprite, animator));
			this.view.scene.addChild(particleSprite);
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

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

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
		light.transform.moveTo(fireObject.sprite.x, fireObject.sprite.y, fireObject.sprite.z);

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
					this.planeMaterial.ambientMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/floor_normal.jpg" :
					this.planeMaterial.normalMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
				case "assets/floor_specular.jpg" :
					this.planeMaterial.specularMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;

				//particle texture
				case "assets/blue.png" :
					this.particleMaterial.ambientMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
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
	public sprite:Sprite;
	public animator:ParticleAnimator;
	public light:PointLight;
	public strength:number = 0;

	constructor(sprite:Sprite, animator:ParticleAnimator)
	{
		this.sprite = sprite;
		this.animator = animator;
	}
}


window.onload = function ()
{
	new Basic_Fire();
}