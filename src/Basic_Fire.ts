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

import {LoaderEvent, TimerEvent, Vector3D, ColorTransform, AssetLibrary, IAsset, URLRequest, RequestAnimationFrame, Timer} from "@awayjs/core";
import {BitmapImage2D, ImageSampler, BlendMode} from "@awayjs/stage";
import {ElementsType, Graphics, ParticleAnimationSet, ParticleAnimator, ParticleProperties, ParticlePropertiesMode, ParticleBillboardNode, ParticleScaleNode, ParticleVelocityNode, ParticleColorNode, ParticleGraphicsHelper} from "@awayjs/graphics";
import {HoverController, Sprite, Scene, Camera, PrimitivePlanePrefab} from "@awayjs/scene";
import {MethodMaterial, MethodMaterialMode, PointLight, DirectionalLight, StaticLightPicker, ImageTexture2D}	from "@awayjs/materials";
import {View} from "@awayjs/view";

class Basic_Fire
{
	private static NUM_FIRES:number /*uint*/ = 10;

	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _cameraController:HoverController;

	//material objects
	private _planeMaterial:MethodMaterial;
	private _particleMaterial:MethodMaterial;

	//light objects
	private _directionalLight:DirectionalLight;
	private _lightPicker:StaticLightPicker;

	//particle objects
	private _fireAnimationSet:ParticleAnimationSet;
	private _particleSprite:Sprite;
	private _fireTimer:Timer;

	//scene objects
	private _plane:Sprite;
	private _fireObjects:Array<FireVO> = new Array<FireVO>();

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
		this.initParticles();
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

		//this.view.antiAlias = 4;
		this._scene.camera = this._camera;

		//setup controller to be used on the camera
		this._cameraController = new HoverController(this._camera);
		this._cameraController.distance = 1000;
		this._cameraController.minTiltAngle = 0;
		this._cameraController.maxTiltAngle = 90;
		this._cameraController.panAngle = 45;
		this._cameraController.tiltAngle = 20;
	}

	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		this._directionalLight = new DirectionalLight(new Vector3D(0, -1, 0));
		this._directionalLight.color = 0xeedddd;
		this._directionalLight.diffuse = .5;
		this._directionalLight.ambient = .5;
		this._directionalLight.specular = 0;
		this._directionalLight.ambientColor = 0x808090;

		this._lightPicker = new StaticLightPicker([this._directionalLight]);
	}

	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		this._planeMaterial = new MethodMaterial();
		this._planeMaterial.mode = MethodMaterialMode.MULTI_PASS;
		this._planeMaterial.lightPicker = this._lightPicker;
		this._planeMaterial.style.sampler = new ImageSampler(true, true, false);
		this._planeMaterial.specularMethod.strength = 10;

		this._particleMaterial = new MethodMaterial();
		this._particleMaterial.blendMode = BlendMode.ADD;
	}

	/**
	 * Initialise the particles
	 */
	private initParticles():void
	{

		//create the particle animation set
		this._fireAnimationSet = new ParticleAnimationSet(true, true);

		//add some animations which can control the particles:
		//the global animations can be set directly, because they influence all the particles with the same factor
		this._fireAnimationSet.addAnimation(new ParticleBillboardNode());
		this._fireAnimationSet.addAnimation(new ParticleScaleNode(ParticlePropertiesMode.GLOBAL, false, false, 2.5, 0.5));
		this._fireAnimationSet.addAnimation(new ParticleVelocityNode(ParticlePropertiesMode.GLOBAL, new Vector3D(0, 80, 0)));
		this._fireAnimationSet.addAnimation(new ParticleColorNode(ParticlePropertiesMode.GLOBAL, true, true, false, false, new ColorTransform(0, 0, 0, 1, 0xFF, 0x33, 0x01), new ColorTransform(0, 0, 0, 1, 0x99)));

		//no need to set the local animations here, because they influence all the particle with different factors.
		this._fireAnimationSet.addAnimation(new ParticleVelocityNode(ParticlePropertiesMode.LOCAL_STATIC));

		//set the initParticleFunc. It will be invoked for the local static property initialization of every particle
		this._fireAnimationSet.initParticleFunc = this.initParticleFunc;

		//create the original particle geometry
		var particle:Sprite = <Sprite> (new PrimitivePlanePrefab(null, ElementsType.TRIANGLE, 10, 10, 1, 1, false)).getNewObject();

		//combine them into a list
		var graphicsSet:Array<Graphics> = new Array<Graphics>();
		for (var i:number /*int*/ = 0; i < 500; i++)
			graphicsSet.push(particle.graphics);

		this._particleSprite = new Sprite(this._particleMaterial);
		ParticleGraphicsHelper.generateGraphics(this._particleSprite.graphics, graphicsSet);
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this._plane = <Sprite> new PrimitivePlanePrefab(this._planeMaterial, ElementsType.TRIANGLE, 1000, 1000).getNewObject();
		this._plane.material = this._planeMaterial;
		this._plane.graphics.scaleUV(2, 2);
		this._plane.y = -20;

		this._scene.root.addChild(this._plane);

		//create fire object sprites from geomtry and material, and apply particle animators to each
		for (var i:number /*int*/ = 0; i < Basic_Fire.NUM_FIRES; i++) {
			var particleSprite:Sprite = this._particleSprite.clone();
			var animator:ParticleAnimator = new ParticleAnimator(this._fireAnimationSet);
			particleSprite.animator = animator;

			//position the sprite
			var degree:number = i / Basic_Fire.NUM_FIRES * Math.PI * 2;
			particleSprite.x = Math.sin(degree) * 400;
			particleSprite.z = Math.cos(degree) * 400;
			particleSprite.y = 5;

			//create a fire object and add it to the fire object vector
			this._fireObjects.push(new FireVO(particleSprite, animator));
			this._scene.root.addChild(particleSprite);
		}

		//setup timer for triggering each particle aniamtor
		this._fireTimer = new Timer(1000, this._fireObjects.length);
		this._fireTimer.addEventListener(TimerEvent.TIMER, (event:TimerEvent) => this.onTimer(event));
		this._fireTimer.start();
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

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

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

		lights.push(this._directionalLight);

		var fireVO:FireVO;
		for (var i:number /*uint*/ = 0; i < this._fireObjects.length; i++) {
			fireVO = this._fireObjects[i];
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
		var fireObject:FireVO = this._fireObjects[this._fireTimer.currentCount-1];

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
		this._lightPicker.lights = this.getAllLights();
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._time += dt;

		//animate lights
		var fireVO:FireVO;
		for (var i:number /*uint*/ = 0; i < this._fireObjects.length; i++) {
			fireVO = this._fireObjects[i];

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

		this._scene.render();
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
					this._planeMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> asset);
					break;
				case "assets/floor_normal.jpg" :
					this._planeMaterial.normalMethod.texture = new ImageTexture2D(<BitmapImage2D> asset);
					break;
				case "assets/floor_specular.jpg" :
					this._planeMaterial.specularMethod.texture = new ImageTexture2D(<BitmapImage2D> asset);
					break;

				//particle texture
				case "assets/blue.png" :
					this._particleMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> asset);
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

	private onMouseMove(event:MouseEvent)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * stage listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._scene.view.y = 0;
		this._scene.view.x = 0;
		this._scene.view.width = window.innerWidth;
		this._scene.view.height = window.innerHeight;
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