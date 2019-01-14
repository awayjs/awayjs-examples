/*

MD5 animation loading and interaction example in Away3d

Demonstrates:

How to load MD5 sprite and anim files with bones animation from embedded resources.
How to map animation data after loading in order to playback an animation sequence.
How to control the movement of a game character using keys.

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

import {AssetEvent, LoaderEvent, Matrix, AssetLibrary, LoaderContext, URLRequest, RequestAnimationFrame, Keyboard, Vector3D} from "@awayjs/core";
import {BitmapImage2D, BitmapImageCube, ImageSampler} from "@awayjs/stage";
import {AnimationSetBase, ElementsType, SkeletonAnimationSet, SkeletonAnimator, Skeleton, SkeletonClipNode, CrossfadeTransition, AnimationStateEvent} from "@awayjs/graphics";
import {LookAtController, Sprite, Scene, Camera, DisplayObjectContainer, Skybox, Billboard, PrimitivePlanePrefab} from "@awayjs/scene";
import {AnimationNodeBase, Style} from "@awayjs/renderer";
import {ImageTexture2D, MethodMaterial, EffectFogMethod, ShadowSoftMethod, PointLight, DirectionalLight, StaticLightPicker, NearDirectionalShadowMapper} from "@awayjs/materials";
import {MD5AnimParser, MD5MeshParser} from "@awayjs/parsers";
import {View} from "@awayjs/view";

class Intermediate_MD5Animation
{
	//engine variables
	private _scene:Scene;
	private _camera:Camera;
	private _view:View;
	private _root:DisplayObjectContainer;
	private _cameraController:LookAtController;

	//animation variables
	private _animator:SkeletonAnimator;
	private _animationSet:SkeletonAnimationSet;
	private _stateTransition:CrossfadeTransition = new CrossfadeTransition(0.5);
	private _skeleton:Skeleton;
	private _isRunning:Boolean;
	private _isMoving:Boolean;
	private _movementDirection:number;
	private _onceAnim:string;
	private _currentAnim:string;
	private _currentRotationInc:number = 0;

	//animation constants
	private static IDLE_NAME:string = "idle2";
	private static WALK_NAME:string = "walk7";
	private static ANIM_NAMES:Array<string> = new Array<string>(Intermediate_MD5Animation.IDLE_NAME, Intermediate_MD5Animation.WALK_NAME, "attack3", "turret_attack", "attack2", "chest", "roar1", "leftslash", "headpain", "pain1", "pain_luparm", "range_attack2");
	private static ROTATION_SPEED:number = 3;
	private static RUN_SPEED:number = 2;
	private static WALK_SPEED:number = 1;
	private static IDLE_SPEED:number = 1;
	private static ACTION_SPEED:number = 1;

	//light objects
	private _redLight:PointLight;
	private _blueLight:PointLight;
	private _whiteLight:DirectionalLight;
	private _lightPicker:StaticLightPicker;
	private _shadowMapMethod:ShadowSoftMethod;
	private _fogMethod:EffectFogMethod;
	private _count:number = 0;

	//material objects
	private _redLightMaterial:MethodMaterial;
	private _blueLightMaterial:MethodMaterial;
	private _groundMaterial:MethodMaterial;
	private _bodyMaterial:MethodMaterial;
	private _gobMaterial:MethodMaterial;

	//scene objects
	private _placeHolder:DisplayObjectContainer;
	private _sprite:Sprite;
	private _gobStyle:Style;
	private _ground:Sprite;
	private _skyBox:Skybox;

	private _timer:RequestAnimationFrame;
	private _time:number = 0;

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
		//this.initText();
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
		this._camera = this._scene.camera;
		this._view = this._scene.view;
		this._root = this._scene.root;

		this._camera.projection.far = 5000;
		this._camera.z = -200;
		this._camera.y = 160;

		//setup controller to be used on the camera
		this._placeHolder = new DisplayObjectContainer();
		this._placeHolder.y = 50;
		this._cameraController = new LookAtController(this._camera, this._placeHolder);
	}

	/**
	 * Create an instructions overlay
	 */
//		private initText():void
//		{
//			text = new TextField();
//			text.defaultTextFormat = new TextFormat("Verdana", 11, 0xFFFFFF);
//			text.width = 240;
//			text.height = 100;
//			text.selectable = false;
//			text.mouseEnabled = false;
//			text.text = "Cursor keys / WSAD - move\n";
//			text.appendText("SHIFT - hold down to run\n");
//			text.appendText("numbers 1-9 - Attack\n");
//			text.filters = [new DropShadowFilter(1, 45, 0x0, 1, 0, 0)];
//
//			addChild(text);
//		}

	/**
	 * Initialise the entities
	 */
	private initLights():void
	{
		//create a light for shadows that mimics the sun's position in the skybox
		this._redLight = new PointLight();
		this._redLight.x = -1000;
		this._redLight.y = 200;
		this._redLight.z = -1400;
		this._redLight.color = 0xff1111;

		this._blueLight = new PointLight();
		this._blueLight.x = 1000;
		this._blueLight.y = 200;
		this._blueLight.z = 1400;
		this._blueLight.color = 0x1111ff;

		this._whiteLight = new DirectionalLight(new Vector3D(-50, -20, 10));
		this._whiteLight.color = 0xffffee;
		this._whiteLight.ambient = 1;
		this._whiteLight.ambientColor = 0x303040;
		this._whiteLight.shadowMapper = new NearDirectionalShadowMapper(null, .2);
        this._whiteLight.shadowMapper.epsilon = .1;

		this._lightPicker = new StaticLightPicker([this._redLight, this._blueLight, this._whiteLight]);


		//create a global shadow method
		this._shadowMapMethod = new ShadowSoftMethod(this._whiteLight, 15, 8);

		//create a global fog method
		this._fogMethod = new EffectFogMethod(0, this._camera.projection.far*0.5, 0x000000);
	}

	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		//red light material
		this._redLightMaterial = new MethodMaterial();
		this._redLightMaterial.alphaBlending = true;
		this._redLightMaterial.addEffectMethod(this._fogMethod);

		//blue light material
		this._blueLightMaterial = new MethodMaterial();
		this._blueLightMaterial.alphaBlending = true;
		this._blueLightMaterial.addEffectMethod(this._fogMethod);

		//ground material
		this._groundMaterial = new MethodMaterial();
		this._groundMaterial.style.sampler = new ImageSampler(true, true);
		this._groundMaterial.lightPicker = this._lightPicker;
		this._groundMaterial.shadowMethod = this._shadowMapMethod;
		this._groundMaterial.addEffectMethod(this._fogMethod);

		//body material
		this._bodyMaterial = new MethodMaterial();
		this._bodyMaterial.specularMethod.gloss = 20;
		this._bodyMaterial.specularMethod.strength = 1.5;
		this._bodyMaterial.addEffectMethod(this._fogMethod);
		this._bodyMaterial.lightPicker = this._lightPicker;
		this._bodyMaterial.shadowMethod = this._shadowMapMethod;

		//gob material
		this._gobMaterial = new MethodMaterial();
		this._gobMaterial.alphaBlending = true;
		this._gobMaterial.style.sampler = new ImageSampler(true, true);
		this._gobMaterial.animateUVs = true;
		this._gobMaterial.addEffectMethod(this._fogMethod);
		this._gobMaterial.lightPicker = this._lightPicker;
		this._gobMaterial.shadowMethod = this._shadowMapMethod;
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		//create light billboards
		var redSprite:Billboard = new Billboard(this._redLightMaterial);
		redSprite.width = 200;
		redSprite.height = 200;
		redSprite.castsShadows = false;
		var blueSprite:Billboard = new Billboard(this._blueLightMaterial);
		blueSprite.width = 200;
		blueSprite.height = 200;
		blueSprite.castsShadows = false;
		this._redLight.transform = redSprite.transform;
		this._blueLight.transform = blueSprite.transform;

		AssetLibrary.enableParser(MD5MeshParser);
		AssetLibrary.enableParser(MD5AnimParser);

		//create a rocky ground plane
		this._ground = <Sprite> new PrimitivePlanePrefab(this._groundMaterial, ElementsType.TRIANGLE, 50000, 50000, 1, 1).getNewObject();
		this._ground.graphics.scaleUV(200, 200);
		this._ground.castsShadows = false;
		this._root.addChild(this._ground);
	}

	/**
	 * Initialise the listeners
	 */
	private initListeners():void
	{
		window.onresize  = (event) => this.onResize(event);
		document.onkeydown = (event) => this.onKeyDown(event);
		document.onkeyup = (event) => this.onKeyUp(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		//setup the url map for textures in the cubemap file
		var loaderContext:LoaderContext = new LoaderContext();
		loaderContext.dependencyBaseUrl = "assets/skybox/";

		//load hellknight sprite
		AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));
		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
		AssetLibrary.load(new URLRequest("assets/hellknight/hellknight.md5mesh"), null, null, new MD5MeshParser());

		//load environment texture
		AssetLibrary.load(new URLRequest("assets/skybox/grimnight_texture.cube"), loaderContext);

		//load light textures
		AssetLibrary.load(new URLRequest("assets/redlight.png"));
		AssetLibrary.load(new URLRequest("assets/bluelight.png"));

		//load floor textures
		AssetLibrary.load(new URLRequest("assets/rockbase_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/rockbase_normals.png"));
		AssetLibrary.load(new URLRequest("assets/rockbase_specular.png"));

		//load hellknight textures
		AssetLibrary.load(new URLRequest("assets/hellknight/hellknight_diffuse.jpg"));
		AssetLibrary.load(new URLRequest("assets/hellknight/hellknight_normals.png"));
		AssetLibrary.load(new URLRequest("assets/hellknight/hellknight_specular.png"));
		AssetLibrary.load(new URLRequest("assets/hellknight/gob.png"));
	}

	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._time += dt;

		this._cameraController.update();

		//update character animation
		if (this._sprite) {
			this._gobStyle.uvMatrix.ty = (-this._time/2000 % 1);
			this._sprite.rotationY += this._currentRotationInc;
		}

		this._count += 0.01;

		this._redLight.x = Math.sin(this._count)*1500;
		this._redLight.y = 250 + Math.sin(this._count*0.54)*200;
		this._redLight.z = Math.cos(this._count*0.7)*1500;
		this._blueLight.x = -Math.sin(this._count*0.8)*1500;
		this._blueLight.y = 250 - Math.sin(this._count*.65)*200;
		this._blueLight.z = -Math.cos(this._count*0.9)*1500;

		this._scene.render();
	}

	/**
	 * Listener for asset complete event on loader
	 */
	private onAssetComplete(event:AssetEvent):void
	{
		if (event.asset.isAsset(AnimationNodeBase)) {

			var node:SkeletonClipNode = <SkeletonClipNode> event.asset;
			var name:string = event.asset.assetNamespace;

			node.name = name;
			this._animationSet.addAnimation(node);

			if (name == Intermediate_MD5Animation.IDLE_NAME || name == Intermediate_MD5Animation.WALK_NAME) {
				node.looping = true;
			} else {
				node.looping = false;
				node.addEventListener(AnimationStateEvent.PLAYBACK_COMPLETE, (event:AnimationStateEvent) => this.onPlaybackComplete(event));
			}

			if (name == Intermediate_MD5Animation.IDLE_NAME)
				this.stop();
		} else if (event.asset.isAsset(AnimationSetBase)) {
			this._animationSet = <SkeletonAnimationSet> event.asset;
			this._animator = new SkeletonAnimator(this._animationSet, this._skeleton);
			for (var i:number /*uint*/ = 0; i < Intermediate_MD5Animation.ANIM_NAMES.length; ++i)
				AssetLibrary.load(new URLRequest("assets/hellknight/" + Intermediate_MD5Animation.ANIM_NAMES[i] + ".md5anim"), null, Intermediate_MD5Animation.ANIM_NAMES[i], new MD5AnimParser());

			this._sprite.animator = this._animator;
		} else if (event.asset.isAsset(Skeleton)) {
			this._skeleton = <Skeleton> event.asset;
		} else if (event.asset.isAsset(Sprite)) {
			//grab sprite object and assign our material object
			this._sprite = <Sprite> event.asset;
			this._sprite.graphics.getShapeAt(0).material = this._bodyMaterial;
			this._sprite.graphics.getShapeAt(1).material = this._sprite.graphics.getShapeAt(2).material = this._sprite.graphics.getShapeAt(3).material = this._gobMaterial;
			this._sprite.castsShadows = true;
			this._sprite.rotationY = 180;
			this._gobStyle = this._sprite.graphics.getShapeAt(1).style = this._sprite.graphics.getShapeAt(2).style = this._sprite.graphics.getShapeAt(3).style = new Style();
			this._gobStyle.uvMatrix = new Matrix();
			this._root.addChild(this._sprite);

			//add our lookat object to the sprite
			this._sprite.addChild(this._placeHolder);
		}
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete (event:LoaderEvent)
	{
		switch( event.url )
		{
			//environment texture
			case 'assets/skybox/grimnight_texture.cube':
				this._skyBox = new Skybox(<BitmapImageCube> event.assets[0]);
				this._root.addChild(this._skyBox);
				break;

			//entities textures
			case "assets/redlight.png" :
				this._redLightMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/bluelight.png" :
				this._blueLightMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;

			//floor textures
			case "assets/rockbase_diffuse.jpg" :
				this._groundMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/rockbase_normals.png" :
				this._groundMaterial.normalMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/rockbase_specular.png" :
				this._groundMaterial.specularMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;

			//hellknight textures
			case "assets/hellknight/hellknight_diffuse.jpg" :
				this._bodyMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/hellknight/hellknight_normals.png" :
				this._bodyMaterial.normalMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/hellknight/hellknight_specular.png" :
				this._bodyMaterial.specularMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
			case "assets/hellknight/gob.png" :
				this._gobMaterial.specularMethod.texture = this._gobMaterial.ambientMethod.texture = new ImageTexture2D(<BitmapImage2D> event.assets[0]);
				break;
		}
	}

	private onPlaybackComplete(event:AnimationStateEvent):void
	{
		if (this._animator.activeState != event.animationState)
			return;

		this._onceAnim = null;

		this._animator.play(this._currentAnim, this._stateTransition);
		this._animator.playbackSpeed = this._isMoving? this._movementDirection*(this._isRunning? Intermediate_MD5Animation.RUN_SPEED : Intermediate_MD5Animation.WALK_SPEED) : Intermediate_MD5Animation.IDLE_SPEED;
	}

	private playAction(val:number /*uint*/):void
	{
		this._onceAnim = Intermediate_MD5Animation.ANIM_NAMES[val + 2];
		this._animator.playbackSpeed = Intermediate_MD5Animation.ACTION_SPEED;
		this._animator.play(this._onceAnim, this._stateTransition, 0);
	}

	/**
	 * Key up listener
	 */
	private onKeyDown(event):void
	{
		switch (event.keyCode) {
			case Keyboard.SHIFT:
				this._isRunning = true;
				if (this._isMoving)
					this.updateMovement(this._movementDirection);
				break;
			case Keyboard.UP:
			case Keyboard.W:
			case Keyboard.Z: //fr
				this.updateMovement(this._movementDirection = 1);
				break;
			case Keyboard.DOWN:
			case Keyboard.S:
				this.updateMovement(this._movementDirection = -1);
				break;
			case Keyboard.LEFT:
			case Keyboard.A:
			case Keyboard.Q: //fr
				this._currentRotationInc = -Intermediate_MD5Animation.ROTATION_SPEED;
				break;
			case Keyboard.RIGHT:
			case Keyboard.D:
				this._currentRotationInc = Intermediate_MD5Animation.ROTATION_SPEED;
				break;
		}
	}

	/**
	 * Key down listener for animation
	 */
	private onKeyUp(event):void
	{
		switch (event.keyCode) {
			case Keyboard.SHIFT:
				this._isRunning = false;
				if (this._isMoving)
					this.updateMovement(this._movementDirection);
				break;
			case Keyboard.UP:
			case Keyboard.W:
			case Keyboard.Z: //fr
			case Keyboard.DOWN:
			case Keyboard.S:
				this.stop();
				break;
			case Keyboard.LEFT:
			case Keyboard.A:
			case Keyboard.Q: //fr
			case Keyboard.RIGHT:
			case Keyboard.D:
				this._currentRotationInc = 0;
				break;
			case Keyboard.NUMBER_1:
				this.playAction(1);
				break;
			case Keyboard.NUMBER_2:
				this.playAction(2);
				break;
			case Keyboard.NUMBER_3:
				this.playAction(3);
				break;
			case Keyboard.NUMBER_4:
				this.playAction(4);
				break;
			case Keyboard.NUMBER_5:
				this.playAction(5);
				break;
			case Keyboard.NUMBER_6:
				this.playAction(6);
				break;
			case Keyboard.NUMBER_7:
				this.playAction(7);
				break;
			case Keyboard.NUMBER_8:
				this.playAction(8);
				break;
			case Keyboard.NUMBER_9:
				this.playAction(9);
				break;
		}
	}

	private updateMovement(dir:number):void
	{
		this._isMoving = true;
		this._animator.playbackSpeed = dir*(this._isRunning? Intermediate_MD5Animation.RUN_SPEED : Intermediate_MD5Animation.WALK_SPEED);

		if (this._currentAnim == Intermediate_MD5Animation.WALK_NAME)
			return;

		this._currentAnim = Intermediate_MD5Animation.WALK_NAME;

		if (this._onceAnim)
			return;

		//update animator
		this._animator.play(this._currentAnim, this._stateTransition);
	}

	private stop():void
	{
		this._isMoving = false;

		if (this._currentAnim == Intermediate_MD5Animation.IDLE_NAME)
			return;

		this._currentAnim = Intermediate_MD5Animation.IDLE_NAME;

		if (this._onceAnim)
			return;

		//update animator
		this._animator.playbackSpeed = Intermediate_MD5Animation.IDLE_SPEED;
		this._animator.play(this._currentAnim, this._stateTransition);
	}

	/**
	 * stage listener for resize events
	 */
	private onResize(event:Event = null):void
	{
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}


window.onload = function ()
{
	new Intermediate_MD5Animation();
}

