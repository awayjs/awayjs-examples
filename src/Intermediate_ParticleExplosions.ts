/*

Particle explosions in Away3D using the Adobe AIR and Adobe Flash Player logos

Demonstrates:

How to split images into particles.
How to share particle geometries and animation sets between sprites and animators.
How to manually update the playhead of a particle animator using the update() function.

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

import {LoaderEvent, Vector3D, ColorTransform, AssetLibrary, URLRequest, RequestAnimationFrame} from "awayjs-full/lib/core";
import {BitmapImage2D, Graphics, ElementsType} from "awayjs-full/lib/graphics";
import {Scene, Camera, Sprite, PointLight, HoverController, StaticLightPicker, PrimitivePlanePrefab} from "awayjs-full/lib/scene";
import {ParticleAnimator, ParticleAnimationSet, ParticleProperties, ParticlePropertiesMode, ParticleBillboardNode, ParticleBezierCurveNode, ParticleInitialColorNode, ParticlePositionNode, ParticleGraphicsHelper} from "awayjs-full/lib/renderer";
import {MethodMaterial} from "awayjs-full/lib/materials";
import {View} from "awayjs-full/lib/view";

class Intermediate_ParticleExplosions
{
	private static PARTICLE_SIZE:number /*uint*/ = 2;
	private static NUM_ANIMATORS:number /*uint*/ = 4;
	
	//engine variables
	private scene:Scene;
	private camera:Camera;
	private view:View;
	private cameraController:HoverController;
	
	//light variables
	private greenLight:PointLight;
	private blueLight:PointLight;
	private lightPicker:StaticLightPicker;
	
	//data variables
	private chromeBitmapImage2D:BitmapImage2D;
	private firefoxBitmapImage2D:BitmapImage2D;
	private ieBitmapImage2D:BitmapImage2D;
	private safariBitmapImage2D:BitmapImage2D;
	private colorValues:Array<Vector3D> = new Array<Vector3D>();
	private colorPoints:Array<Vector3D> = new Array<Vector3D>();
	private colorChromeSeparation:number /*int*/;
	private colorFirefoxSeparation:number /*int*/;
	private colorSafariSeparation:number /*int*/;
	
	//material objects
	private colorMaterial:MethodMaterial;
	
	//particle objects
	private colorGraphics:Graphics;
	private colorAnimationSet:ParticleAnimationSet;
	
	//scene objects
	private colorParticleSprite:Sprite;
	private colorAnimators:Array<ParticleAnimator>;
	
	//navigation variables
	private timer:RequestAnimationFrame;
	private time:number = 0;
	private angle:number = 0;
	private move:Boolean = false;
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
		this.initListeners();
	}
	
	/**
	 * Initialise the engine
	 */
	private initEngine():void
	{
		this.scene = new Scene();

		this.camera = new Camera();

		this.view = new View(null, this.scene, this.camera);
		
		//setup controller to be used on the camera
		this.cameraController = new HoverController(this.camera, null, 225, 10, 1000);
	}
	
	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		//create a green point light
		this.greenLight = new PointLight();
		this.greenLight.color = 0x00FF00;
		this.greenLight.ambient = 1;
		this.greenLight.fallOff = 600;
		this.greenLight.radius = 100;
		this.greenLight.specular = 2;
		this.scene.addChild(this.greenLight);
		
		//create a red pointlight
		this.blueLight = new PointLight();
		this.blueLight.color = 0x0000FF;
		this.blueLight.fallOff = 600;
		this.blueLight.radius = 100;
		this.blueLight.specular = 2;
		this.scene.addChild(this.blueLight);
		
		//create a lightpicker for the green and red light
		this.lightPicker = new StaticLightPicker([this.greenLight, this.blueLight]);
	}
	
	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		//setup the particle material
		this.colorMaterial = new MethodMaterial(0xFFFFFF);
		this.colorMaterial.bothSides = true;
		this.colorMaterial.lightPicker = this.lightPicker;
	}
	
	/**
	 * Initialise the particles
	 */
	private initParticles():void
	{
		var i:number /*int*/;
		var j:number /*int*/;
		var point:Vector3D;
		var rgb:Vector3D;
		var color:number /*uint*/

		for (i = 0; i < this.chromeBitmapImage2D.width; i++) {
			for (j = 0; j < this.chromeBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this.chromeBitmapImage2D.width / 2 - 100), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this.chromeBitmapImage2D.height / 2));
				color = this.chromeBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this.colorPoints.push(point);
				}
			}
		}
		
		//define where one logo stops and another starts
		this.colorChromeSeparation = this.colorPoints.length;

		
		for (i = 0; i < this.firefoxBitmapImage2D.width; i++) {
			for (j = 0; j < this.firefoxBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this.firefoxBitmapImage2D.width / 2 + 100), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this.firefoxBitmapImage2D.height / 2));
				color = this.firefoxBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this.colorPoints.push(point);
				}
			}
		}

		//define where one logo stops and another starts
		this.colorFirefoxSeparation = this.colorPoints.length;


		for (i = 0; i < this.safariBitmapImage2D.width; i++) {
			for (j = 0; j < this.safariBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this.safariBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this.safariBitmapImage2D.height / 2), -Intermediate_ParticleExplosions.PARTICLE_SIZE*100);
				color = this.safariBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this.colorPoints.push(point);
				}
			}
		}

		//define where one logo stops and another starts
		this.colorSafariSeparation = this.colorPoints.length;


		for (i = 0; i < this.ieBitmapImage2D.width; i++) {
			for (j = 0; j < this.ieBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this.ieBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this.ieBitmapImage2D.height / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE*100);
				color = this.ieBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this.colorPoints.push(point);
				}
			}
		}

		//define the particle animations and init function
		this.colorAnimationSet = new ParticleAnimationSet();
		this.colorAnimationSet.addAnimation(new ParticleBillboardNode());
		this.colorAnimationSet.addAnimation(new ParticleBezierCurveNode(ParticlePropertiesMode.LOCAL_STATIC));
		this.colorAnimationSet.addAnimation(new ParticlePositionNode(ParticlePropertiesMode.LOCAL_STATIC));
		this.colorAnimationSet.addAnimation(new ParticleInitialColorNode(ParticlePropertiesMode.LOCAL_STATIC, true, false, new ColorTransform(0, 1, 0, 1)));
		this.colorAnimationSet.initParticleFunc = this.iniColorParticleFunc;
		this.colorAnimationSet.initParticleScope = this;
	}
	
	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		//setup the base graphics for one particle
		var plane:Sprite = <Sprite> (new PrimitivePlanePrefab(null, ElementsType.TRIANGLE, Intermediate_ParticleExplosions.PARTICLE_SIZE, Intermediate_ParticleExplosions.PARTICLE_SIZE,1,1,false)).getNewObject();

		//combine them into a list
		var colorGraphicsSet:Array<Graphics> = new Array<Graphics>();
		var len:number /*uint*/ = this.colorPoints.length;
		for (i = 0; i < len; i++)
			colorGraphicsSet.push(plane.graphics);

		//create the particle sprite
		this.colorParticleSprite = new Sprite(this.colorMaterial);

		//generate the particle geometries
		ParticleGraphicsHelper.generateGraphics(this.colorParticleSprite.graphics, colorGraphicsSet);
		
		//initialise animators vectors
		this.colorAnimators = new Array<ParticleAnimator>(Intermediate_ParticleExplosions.NUM_ANIMATORS);
		
		var i:number /*uint*/ = 0;
		for (i=0; i<Intermediate_ParticleExplosions.NUM_ANIMATORS; i++) {
			//clone the particle sprite
			this.colorParticleSprite = <Sprite> this.colorParticleSprite.clone();
			this.colorParticleSprite.rotationY = 45*(i-1);
			this.scene.addChild(this.colorParticleSprite);

			//create and start the particle animator
			this.colorAnimators[i] = new ParticleAnimator(this.colorAnimationSet);
			this.colorParticleSprite.animator = this.colorAnimators[i];
			this.scene.addChild(this.colorParticleSprite);
		}
	}
	
	/**
	 * Initialise the listeners
	 */
	private initListeners():void
	{
		window.onresize = (event:UIEvent) => this.onResize(event);

		document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
		document.onmouseup = (event:MouseEvent) => this.onMouseUp(event);
		document.onmousemove = (event:MouseEvent) => this.onMouseMove(event);


		this.onResize();


		this.timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this.timer.start();

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		//image textures
		AssetLibrary.load(new URLRequest("assets/firefox.png"));
		AssetLibrary.load(new URLRequest("assets/chrome.png"));
		AssetLibrary.load(new URLRequest("assets/safari.png"));
		AssetLibrary.load(new URLRequest("assets/ie.png"));
	}
	
	/**
	 * Initialiser for particle properties
	 */
	private iniColorParticleFunc(properties:ParticleProperties):void
	{
		properties.startTime = 0;
		properties.duration = 1;
		var degree1:number = Math.random() * Math.PI * 2;
		var degree2:number = Math.random() * Math.PI * 2;
		var r:number = 500;

		if (properties.index < this.colorChromeSeparation)
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(300*Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
		else if (properties.index < this.colorFirefoxSeparation)
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(-300*Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
		else if (properties.index < this.colorSafariSeparation)
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(0, 0, 300*Intermediate_ParticleExplosions.PARTICLE_SIZE);
		else
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(0, 0,-300*Intermediate_ParticleExplosions.PARTICLE_SIZE);

		var rgb:Vector3D = this.colorValues[properties.index];
		properties[ParticleInitialColorNode.COLOR_INITIAL_COLORTRANSFORM] = new ColorTransform(rgb.x, rgb.y, rgb.z, 1);

		properties[ParticleBezierCurveNode.BEZIER_CONTROL_VECTOR3D] = new Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
		properties[ParticlePositionNode.POSITION_VECTOR3D] = this.colorPoints[properties.index];
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this.time += dt;

		//update the camera position
		this.cameraController.panAngle += 0.2;
		
		//update the particle animator playhead positions
		var i:number /*uint*/;
		var time:number /*uint*/;

		if (this.colorAnimators) {
			for (i=0; i<this.colorAnimators.length; i++) {
				time = 1000*(Math.sin(this.time/5000 + Math.PI*i/4) + 1);
				this.colorAnimators[i].update(time);
			}
		}

		//update the light positions
		this.angle += Math.PI / 180;
		this.greenLight.x = Math.sin(this.angle) * 600;
		this.greenLight.z = Math.cos(this.angle) * 600;
		this.blueLight.x = Math.sin(this.angle + Math.PI) * 600;
		this.blueLight.z = Math.cos(this.angle + Math.PI) * 600;

		this.view.render();
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete(event:LoaderEvent)
	{
		switch (event.url) {

			//image textures
			case "assets/firefox.png" :
				this.firefoxBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;
			case "assets/chrome.png" :
				this.chromeBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;
			case "assets/ie.png" :
				this.ieBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;
			case "assets/safari.png" :
				this.safariBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;

		}

		if (this.firefoxBitmapImage2D != null && this.chromeBitmapImage2D != null && this.safariBitmapImage2D != null && this.ieBitmapImage2D != null) {
			this.initParticles();
			this.initObjects();
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
		if (this.move) {
			this.cameraController.panAngle = 0.3*(event.clientX - this.lastMouseX) + this.lastPanAngle;
			this.cameraController.tiltAngle = 0.3*(event.clientY - this.lastMouseY) + this.lastTiltAngle;
		}
	}

	/**
	 * window listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this.view.y = 0;
		this.view.x = 0;
		this.view.width = window.innerWidth;
		this.view.height = window.innerHeight;
	}
}

window.onload = function ()
{
	new Intermediate_ParticleExplosions();
}