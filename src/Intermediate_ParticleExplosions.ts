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

import {LoaderEvent, Vector3D, ColorTransform, AssetLibrary, URLRequest, RequestAnimationFrame} from "@awayjs/core";
import {BitmapImage2D} from "@awayjs/stage";
import {Graphics, ElementsType, ParticleAnimator, ParticleAnimationSet, ParticleProperties, ParticlePropertiesMode, ParticleBillboardNode, ParticleBezierCurveNode, ParticleInitialColorNode, ParticlePositionNode, ParticleGraphicsHelper} from "@awayjs/graphics";
import {Scene, Camera, Sprite, HoverController, PrimitivePlanePrefab, DisplayObjectContainer} from "@awayjs/scene";
import {PointLight, StaticLightPicker, MethodMaterial} from "@awayjs/materials";
import {View} from "@awayjs/view";

class Intermediate_ParticleExplosions
{
	private static PARTICLE_SIZE:number /*uint*/ = 2;
	private static NUM_ANIMATORS:number /*uint*/ = 4;
	
	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _view:View;
	private _root:DisplayObjectContainer;
	private _cameraController:HoverController;
	
	//light variables
	private _greenLight:PointLight;
	private _blueLight:PointLight;
	private _lightPicker:StaticLightPicker;
	
	//data variables
	private _chromeBitmapImage2D:BitmapImage2D;
	private _firefoxBitmapImage2D:BitmapImage2D;
	private _ieBitmapImage2D:BitmapImage2D;
	private _safariBitmapImage2D:BitmapImage2D;
	private _colorValues:Array<Vector3D> = new Array<Vector3D>();
	private _colorPoints:Array<Vector3D> = new Array<Vector3D>();
	private _colorChromeSeparation:number /*int*/;
	private _colorFirefoxSeparation:number /*int*/;
	private _colorSafariSeparation:number /*int*/;
	
	//material objects
	private _colorMaterial:MethodMaterial;
	
	//particle objects
	private _colorGraphics:Graphics;
	private _colorAnimationSet:ParticleAnimationSet;
	
	//scene objects
	private _colorParticleSprite:Sprite;
	private _colorAnimators:Array<ParticleAnimator>;
	
	//navigation variables
	private _timer:RequestAnimationFrame;
	private _time:number = 0;
	private _angle:number = 0;
	private _move:Boolean = false;
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
		this.initListeners();
	}
	
	/**
	 * Initialise the engine
	 */
	private initEngine():void
	{
		this._camera = new Camera();
		this._scene = new Scene(null, this._camera);

		this._view = this._scene.view;
		this._root = this._scene.root;
		
		//setup controller to be used on the camera
		this._cameraController = new HoverController(this._camera, null, 225, 10, 1000);
	}
	
	/**
	 * Initialise the lights
	 */
	private initLights():void
	{
		//create a green point light
		this._greenLight = new PointLight();
		this._greenLight.color = 0x00FF00;
		this._greenLight.ambient = 1;
		this._greenLight.fallOff = 600;
		this._greenLight.radius = 100;
		this._greenLight.specular = 2;
		
		//create a red pointlight
		this._blueLight = new PointLight();
		this._blueLight.color = 0x0000FF;
		this._blueLight.fallOff = 600;
		this._blueLight.radius = 100;
		this._blueLight.specular = 2;
		
		//create a lightpicker for the green and red light
		this._lightPicker = new StaticLightPicker([this._greenLight, this._blueLight]);
	}
	
	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		//setup the particle material
		this._colorMaterial = new MethodMaterial(0xFFFFFF);
		this._colorMaterial.bothSides = true;
		this._colorMaterial.lightPicker = this._lightPicker;
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

		for (i = 0; i < this._chromeBitmapImage2D.width; i++) {
			for (j = 0; j < this._chromeBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this._chromeBitmapImage2D.width / 2 - 100), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this._chromeBitmapImage2D.height / 2));
				color = this._chromeBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this._colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this._colorPoints.push(point);
				}
			}
		}
		
		//define where one logo stops and another starts
		this._colorChromeSeparation = this._colorPoints.length;

		
		for (i = 0; i < this._firefoxBitmapImage2D.width; i++) {
			for (j = 0; j < this._firefoxBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this._firefoxBitmapImage2D.width / 2 + 100), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this._firefoxBitmapImage2D.height / 2));
				color = this._firefoxBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this._colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this._colorPoints.push(point);
				}
			}
		}

		//define where one logo stops and another starts
		this._colorFirefoxSeparation = this._colorPoints.length;


		for (i = 0; i < this._safariBitmapImage2D.width; i++) {
			for (j = 0; j < this._safariBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this._safariBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this._safariBitmapImage2D.height / 2), -Intermediate_ParticleExplosions.PARTICLE_SIZE*100);
				color = this._safariBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this._colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this._colorPoints.push(point);
				}
			}
		}

		//define where one logo stops and another starts
		this._colorSafariSeparation = this._colorPoints.length;


		for (i = 0; i < this._ieBitmapImage2D.width; i++) {
			for (j = 0; j < this._ieBitmapImage2D.height; j++) {
				point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE*(i - this._ieBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE*( -j + this._ieBitmapImage2D.height / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE*100);
				color = this._ieBitmapImage2D.getPixel32(i, j);
				if (((color >> 24) & 0xff) > 0xb0) {
					this._colorValues.push(new Vector3D(((color & 0xff0000) >> 16)/255, ((color & 0xff00) >> 8)/255, (color & 0xff)/255));
					this._colorPoints.push(point);
				}
			}
		}

		//define the particle animations and init function
		this._colorAnimationSet = new ParticleAnimationSet();
		this._colorAnimationSet.addAnimation(new ParticleBillboardNode());
		this._colorAnimationSet.addAnimation(new ParticleBezierCurveNode(ParticlePropertiesMode.LOCAL_STATIC));
		this._colorAnimationSet.addAnimation(new ParticlePositionNode(ParticlePropertiesMode.LOCAL_STATIC));
		this._colorAnimationSet.addAnimation(new ParticleInitialColorNode(ParticlePropertiesMode.LOCAL_STATIC, true, false, new ColorTransform(0, 1, 0, 1)));
		this._colorAnimationSet.initParticleFunc = this.iniColorParticleFunc;
		this._colorAnimationSet.initParticleScope = this;
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
		var len:number /*uint*/ = this._colorPoints.length;
		for (i = 0; i < len; i++)
			colorGraphicsSet.push(plane.graphics);

		//create the particle sprite
		this._colorParticleSprite = new Sprite(null, this._colorMaterial);

		//generate the particle geometries
		ParticleGraphicsHelper.generateGraphics(this._colorParticleSprite.graphics, colorGraphicsSet);
		
		//initialise animators vectors
		this._colorAnimators = new Array<ParticleAnimator>(Intermediate_ParticleExplosions.NUM_ANIMATORS);
		
		var i:number /*uint*/ = 0;
		for (i=0; i<Intermediate_ParticleExplosions.NUM_ANIMATORS; i++) {
			//clone the particle sprite
			this._colorParticleSprite = <Sprite> this._colorParticleSprite.clone();
			this._colorParticleSprite.rotationY = 45*(i-1);
			this._root.addChild(this._colorParticleSprite);

			//create and start the particle animator
			this._colorAnimators[i] = new ParticleAnimator(this._colorAnimationSet);
			this._colorParticleSprite.animator = this._colorAnimators[i];
			this._root.addChild(this._colorParticleSprite);
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


		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

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

		if (properties.index < this._colorChromeSeparation)
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(300*Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
		else if (properties.index < this._colorFirefoxSeparation)
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(-300*Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
		else if (properties.index < this._colorSafariSeparation)
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(0, 0, 300*Intermediate_ParticleExplosions.PARTICLE_SIZE);
		else
			properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(0, 0,-300*Intermediate_ParticleExplosions.PARTICLE_SIZE);

		var rgb:Vector3D = this._colorValues[properties.index];
		properties[ParticleInitialColorNode.COLOR_INITIAL_COLORTRANSFORM] = new ColorTransform(rgb.x, rgb.y, rgb.z, 1);

		properties[ParticleBezierCurveNode.BEZIER_CONTROL_VECTOR3D] = new Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
		properties[ParticlePositionNode.POSITION_VECTOR3D] = this._colorPoints[properties.index];
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._time += dt;

		//update the camera position
		this._cameraController.panAngle += 0.2;
		
		//update the particle animator playhead positions
		var i:number /*uint*/;
		var time:number /*uint*/;

		if (this._colorAnimators) {
			for (i=0; i<this._colorAnimators.length; i++) {
				time = 1000*(Math.sin(this._time/5000 + Math.PI*i/4) + 1);
				this._colorAnimators[i].update(time);
			}
		}

		//update the light positions
		this._angle += Math.PI / 180;
		this._greenLight.x = Math.sin(this._angle) * 600;
		this._greenLight.z = Math.cos(this._angle) * 600;
		this._blueLight.x = Math.sin(this._angle + Math.PI) * 600;
		this._blueLight.z = Math.cos(this._angle + Math.PI) * 600;

		this._scene.render();
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete(event:LoaderEvent)
	{
		switch (event.url) {

			//image textures
			case "assets/firefox.png" :
				this._firefoxBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;
			case "assets/chrome.png" :
				this._chromeBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;
			case "assets/ie.png" :
				this._ieBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;
			case "assets/safari.png" :
				this._safariBitmapImage2D = <BitmapImage2D> event.assets[0];
				break;

		}

		if (this._firefoxBitmapImage2D != null && this._chromeBitmapImage2D != null && this._safariBitmapImage2D != null && this._ieBitmapImage2D != null) {
			this.initParticles();
			this.initObjects();
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
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
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
	new Intermediate_ParticleExplosions();
}