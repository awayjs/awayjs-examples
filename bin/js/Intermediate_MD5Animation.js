webpackJsonp([14],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	"use strict";
	var Sampler2D_1 = __webpack_require__(72);
	var AssetEvent_1 = __webpack_require__(1);
	var LoaderEvent_1 = __webpack_require__(5);
	var Matrix_1 = __webpack_require__(81);
	var AssetLibrary_1 = __webpack_require__(305);
	var LoaderContext_1 = __webpack_require__(327);
	var URLRequest_1 = __webpack_require__(3);
	var Keyboard_1 = __webpack_require__(328);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var AnimationNodeBase_1 = __webpack_require__(258);
	var DisplayObjectContainer_1 = __webpack_require__(12);
	var View_1 = __webpack_require__(9);
	var LookAtController_1 = __webpack_require__(113);
	var DirectionalLight_1 = __webpack_require__(218);
	var Billboard_1 = __webpack_require__(111);
	var Sprite_1 = __webpack_require__(57);
	var PointLight_1 = __webpack_require__(224);
	var Skybox_1 = __webpack_require__(96);
	var ElementsType_1 = __webpack_require__(232);
	var Style_1 = __webpack_require__(101);
	var NearDirectionalShadowMapper_1 = __webpack_require__(359);
	var StaticLightPicker_1 = __webpack_require__(226);
	var PrimitivePlanePrefab_1 = __webpack_require__(237);
	var Single2DTexture_1 = __webpack_require__(104);
	var AnimationSetBase_1 = __webpack_require__(241);
	var SkeletonAnimator_1 = __webpack_require__(249);
	var Skeleton_1 = __webpack_require__(254);
	var CrossfadeTransition_1 = __webpack_require__(354);
	var AnimationStateEvent_1 = __webpack_require__(253);
	var DefaultRenderer_1 = __webpack_require__(130);
	var MethodMaterial_1 = __webpack_require__(265);
	var EffectFogMethod_1 = __webpack_require__(285);
	var ShadowNearMethod_1 = __webpack_require__(300);
	var ShadowSoftMethod_1 = __webpack_require__(301);
	var MD5AnimParser_1 = __webpack_require__(360);
	var MD5MeshParser_1 = __webpack_require__(361);
	var Intermediate_MD5Animation = (function () {
	    /**
	     * Constructor
	     */
	    function Intermediate_MD5Animation() {
	        this.stateTransition = new CrossfadeTransition_1.default(0.5);
	        this.currentRotationInc = 0;
	        this.count = 0;
	        this._time = 0;
	        this.init();
	    }
	    /**
	     * Global initialise function
	     */
	    Intermediate_MD5Animation.prototype.init = function () {
	        this.initEngine();
	        //this.initText();
	        this.initLights();
	        this.initMaterials();
	        this.initObjects();
	        this.initListeners();
	    };
	    /**
	     * Initialise the engine
	     */
	    Intermediate_MD5Animation.prototype.initEngine = function () {
	        this.view = new View_1.default(new DefaultRenderer_1.default());
	        this.scene = this.view.scene;
	        this.camera = this.view.camera;
	        this.camera.projection.far = 5000;
	        this.camera.z = -200;
	        this.camera.y = 160;
	        //setup controller to be used on the camera
	        this.placeHolder = new DisplayObjectContainer_1.default();
	        this.placeHolder.y = 50;
	        this.cameraController = new LookAtController_1.default(this.camera, this.placeHolder);
	    };
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
	    Intermediate_MD5Animation.prototype.initLights = function () {
	        //create a light for shadows that mimics the sun's position in the skybox
	        this.redLight = new PointLight_1.default();
	        this.redLight.x = -1000;
	        this.redLight.y = 200;
	        this.redLight.z = -1400;
	        this.redLight.color = 0xff1111;
	        this.scene.addChild(this.redLight);
	        this.blueLight = new PointLight_1.default();
	        this.blueLight.x = 1000;
	        this.blueLight.y = 200;
	        this.blueLight.z = 1400;
	        this.blueLight.color = 0x1111ff;
	        this.scene.addChild(this.blueLight);
	        this.whiteLight = new DirectionalLight_1.default(-50, -20, 10);
	        this.whiteLight.color = 0xffffee;
	        this.whiteLight.castsShadows = true;
	        this.whiteLight.ambient = 1;
	        this.whiteLight.ambientColor = 0x303040;
	        this.whiteLight.shadowMapper = new NearDirectionalShadowMapper_1.default(.2);
	        this.scene.addChild(this.whiteLight);
	        this.lightPicker = new StaticLightPicker_1.default([this.redLight, this.blueLight, this.whiteLight]);
	        //create a global shadow method
	        this.shadowMapMethod = new ShadowNearMethod_1.default(new ShadowSoftMethod_1.default(this.whiteLight, 15, 8));
	        this.shadowMapMethod.epsilon = .1;
	        //create a global fog method
	        this.fogMethod = new EffectFogMethod_1.default(0, this.camera.projection.far * 0.5, 0x000000);
	    };
	    /**
	     * Initialise the materials
	     */
	    Intermediate_MD5Animation.prototype.initMaterials = function () {
	        //red light material
	        this.redLightMaterial = new MethodMaterial_1.default();
	        this.redLightMaterial.alphaBlending = true;
	        this.redLightMaterial.addEffectMethod(this.fogMethod);
	        //blue light material
	        this.blueLightMaterial = new MethodMaterial_1.default();
	        this.blueLightMaterial.alphaBlending = true;
	        this.blueLightMaterial.addEffectMethod(this.fogMethod);
	        //ground material
	        this.groundMaterial = new MethodMaterial_1.default();
	        this.groundMaterial.style.sampler = new Sampler2D_1.default(true, true);
	        this.groundMaterial.lightPicker = this.lightPicker;
	        this.groundMaterial.shadowMethod = this.shadowMapMethod;
	        this.groundMaterial.addEffectMethod(this.fogMethod);
	        //body material
	        this.bodyMaterial = new MethodMaterial_1.default();
	        this.bodyMaterial.specularMethod.gloss = 20;
	        this.bodyMaterial.specularMethod.strength = 1.5;
	        this.bodyMaterial.addEffectMethod(this.fogMethod);
	        this.bodyMaterial.lightPicker = this.lightPicker;
	        this.bodyMaterial.shadowMethod = this.shadowMapMethod;
	        //gob material
	        this.gobMaterial = new MethodMaterial_1.default();
	        this.gobMaterial.alphaBlending = true;
	        this.gobMaterial.style.sampler = new Sampler2D_1.default(true, true);
	        this.gobMaterial.animateUVs = true;
	        this.gobMaterial.addEffectMethod(this.fogMethod);
	        this.gobMaterial.lightPicker = this.lightPicker;
	        this.gobMaterial.shadowMethod = this.shadowMapMethod;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Intermediate_MD5Animation.prototype.initObjects = function () {
	        //create light billboards
	        var redSprite = new Billboard_1.default(this.redLightMaterial);
	        redSprite.width = 200;
	        redSprite.height = 200;
	        redSprite.castsShadows = false;
	        var blueSprite = new Billboard_1.default(this.blueLightMaterial);
	        blueSprite.width = 200;
	        blueSprite.height = 200;
	        blueSprite.castsShadows = false;
	        this.redLight.addChild(redSprite);
	        this.blueLight.addChild(blueSprite);
	        AssetLibrary_1.default.enableParser(MD5MeshParser_1.default);
	        AssetLibrary_1.default.enableParser(MD5AnimParser_1.default);
	        //create a rocky ground plane
	        this.ground = new PrimitivePlanePrefab_1.default(this.groundMaterial, ElementsType_1.default.TRIANGLE, 50000, 50000, 1, 1).getNewObject();
	        this.ground.graphics.scaleUV(200, 200);
	        this.ground.castsShadows = false;
	        this.scene.addChild(this.ground);
	    };
	    /**
	     * Initialise the listeners
	     */
	    Intermediate_MD5Animation.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onkeydown = function (event) { return _this.onKeyDown(event); };
	        document.onkeyup = function (event) { return _this.onKeyUp(event); };
	        this.onResize();
	        this._timer = new RequestAnimationFrame_1.default(this.onEnterFrame, this);
	        this._timer.start();
	        //setup the url map for textures in the cubemap file
	        var loaderContext = new LoaderContext_1.default();
	        loaderContext.dependencyBaseUrl = "assets/skybox/";
	        //load hellknight sprite
	        AssetLibrary_1.default.addEventListener(AssetEvent_1.default.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
	        AssetLibrary_1.default.addEventListener(LoaderEvent_1.default.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/hellknight/hellknight.md5mesh"), null, null, new MD5MeshParser_1.default());
	        //load environment texture
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/skybox/grimnight_texture.cube"), loaderContext);
	        //load light textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/redlight.png"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/bluelight.png"));
	        //load floor textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/rockbase_diffuse.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/rockbase_normals.png"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/rockbase_specular.png"));
	        //load hellknight textures
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/hellknight/hellknight_diffuse.jpg"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/hellknight/hellknight_normals.png"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/hellknight/hellknight_specular.png"));
	        AssetLibrary_1.default.load(new URLRequest_1.default("assets/hellknight/gob.png"));
	    };
	    /**
	     * Navigation and render loop
	     */
	    Intermediate_MD5Animation.prototype.onEnterFrame = function (dt) {
	        this._time += dt;
	        this.cameraController.update();
	        //update character animation
	        if (this.sprite) {
	            this.gobStyle.uvMatrix.ty = (-this._time / 2000 % 1);
	            this.sprite.rotationY += this.currentRotationInc;
	        }
	        this.count += 0.01;
	        this.redLight.x = Math.sin(this.count) * 1500;
	        this.redLight.y = 250 + Math.sin(this.count * 0.54) * 200;
	        this.redLight.z = Math.cos(this.count * 0.7) * 1500;
	        this.blueLight.x = -Math.sin(this.count * 0.8) * 1500;
	        this.blueLight.y = 250 - Math.sin(this.count * .65) * 200;
	        this.blueLight.z = -Math.cos(this.count * 0.9) * 1500;
	        this.view.render();
	    };
	    /**
	     * Listener for asset complete event on loader
	     */
	    Intermediate_MD5Animation.prototype.onAssetComplete = function (event) {
	        var _this = this;
	        if (event.asset.isAsset(AnimationNodeBase_1.default)) {
	            var node = event.asset;
	            var name = event.asset.assetNamespace;
	            node.name = name;
	            this.animationSet.addAnimation(node);
	            if (name == Intermediate_MD5Animation.IDLE_NAME || name == Intermediate_MD5Animation.WALK_NAME) {
	                node.looping = true;
	            }
	            else {
	                node.looping = false;
	                node.addEventListener(AnimationStateEvent_1.default.PLAYBACK_COMPLETE, function (event) { return _this.onPlaybackComplete(event); });
	            }
	            if (name == Intermediate_MD5Animation.IDLE_NAME)
	                this.stop();
	        }
	        else if (event.asset.isAsset(AnimationSetBase_1.default)) {
	            this.animationSet = event.asset;
	            this.animator = new SkeletonAnimator_1.default(this.animationSet, this.skeleton);
	            for (var i = 0; i < Intermediate_MD5Animation.ANIM_NAMES.length; ++i)
	                AssetLibrary_1.default.load(new URLRequest_1.default("assets/hellknight/" + Intermediate_MD5Animation.ANIM_NAMES[i] + ".md5anim"), null, Intermediate_MD5Animation.ANIM_NAMES[i], new MD5AnimParser_1.default());
	            this.sprite.animator = this.animator;
	        }
	        else if (event.asset.isAsset(Skeleton_1.default)) {
	            this.skeleton = event.asset;
	        }
	        else if (event.asset.isAsset(Sprite_1.default)) {
	            //grab sprite object and assign our material object
	            this.sprite = event.asset;
	            this.sprite.graphics.getGraphicAt(0).material = this.bodyMaterial;
	            this.sprite.graphics.getGraphicAt(1).material = this.sprite.graphics.getGraphicAt(2).material = this.sprite.graphics.getGraphicAt(3).material = this.gobMaterial;
	            this.sprite.castsShadows = true;
	            this.sprite.rotationY = 180;
	            this.gobStyle = this.sprite.graphics.getGraphicAt(1).style = this.sprite.graphics.getGraphicAt(2).style = this.sprite.graphics.getGraphicAt(3).style = new Style_1.default();
	            this.gobStyle.uvMatrix = new Matrix_1.default();
	            this.scene.addChild(this.sprite);
	            //add our lookat object to the sprite
	            this.sprite.addChild(this.placeHolder);
	        }
	    };
	    /**
	     * Listener function for resource complete event on asset library
	     */
	    Intermediate_MD5Animation.prototype.onResourceComplete = function (event) {
	        switch (event.url) {
	            //environment texture
	            case 'assets/skybox/grimnight_texture.cube':
	                this.skyBox = new Skybox_1.default(event.assets[0]);
	                this.scene.addChild(this.skyBox);
	                break;
	            //entities textures
	            case "assets/redlight.png":
	                this.redLightMaterial.ambientMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            case "assets/bluelight.png":
	                this.blueLightMaterial.ambientMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            //floor textures
	            case "assets/rockbase_diffuse.jpg":
	                this.groundMaterial.ambientMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            case "assets/rockbase_normals.png":
	                this.groundMaterial.normalMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            case "assets/rockbase_specular.png":
	                this.groundMaterial.specularMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            //hellknight textures
	            case "assets/hellknight/hellknight_diffuse.jpg":
	                this.bodyMaterial.ambientMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            case "assets/hellknight/hellknight_normals.png":
	                this.bodyMaterial.normalMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            case "assets/hellknight/hellknight_specular.png":
	                this.bodyMaterial.specularMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	            case "assets/hellknight/gob.png":
	                this.gobMaterial.specularMethod.texture = this.gobMaterial.ambientMethod.texture = new Single2DTexture_1.default(event.assets[0]);
	                break;
	        }
	    };
	    Intermediate_MD5Animation.prototype.onPlaybackComplete = function (event) {
	        if (this.animator.activeState != event.animationState)
	            return;
	        this.onceAnim = null;
	        this.animator.play(this.currentAnim, this.stateTransition);
	        this.animator.playbackSpeed = this.isMoving ? this.movementDirection * (this.isRunning ? Intermediate_MD5Animation.RUN_SPEED : Intermediate_MD5Animation.WALK_SPEED) : Intermediate_MD5Animation.IDLE_SPEED;
	    };
	    Intermediate_MD5Animation.prototype.playAction = function (val /*uint*/) {
	        this.onceAnim = Intermediate_MD5Animation.ANIM_NAMES[val + 2];
	        this.animator.playbackSpeed = Intermediate_MD5Animation.ACTION_SPEED;
	        this.animator.play(this.onceAnim, this.stateTransition, 0);
	    };
	    /**
	     * Key up listener
	     */
	    Intermediate_MD5Animation.prototype.onKeyDown = function (event) {
	        switch (event.keyCode) {
	            case Keyboard_1.default.SHIFT:
	                this.isRunning = true;
	                if (this.isMoving)
	                    this.updateMovement(this.movementDirection);
	                break;
	            case Keyboard_1.default.UP:
	            case Keyboard_1.default.W:
	            case Keyboard_1.default.Z:
	                this.updateMovement(this.movementDirection = 1);
	                break;
	            case Keyboard_1.default.DOWN:
	            case Keyboard_1.default.S:
	                this.updateMovement(this.movementDirection = -1);
	                break;
	            case Keyboard_1.default.LEFT:
	            case Keyboard_1.default.A:
	            case Keyboard_1.default.Q:
	                this.currentRotationInc = -Intermediate_MD5Animation.ROTATION_SPEED;
	                break;
	            case Keyboard_1.default.RIGHT:
	            case Keyboard_1.default.D:
	                this.currentRotationInc = Intermediate_MD5Animation.ROTATION_SPEED;
	                break;
	        }
	    };
	    /**
	     * Key down listener for animation
	     */
	    Intermediate_MD5Animation.prototype.onKeyUp = function (event) {
	        switch (event.keyCode) {
	            case Keyboard_1.default.SHIFT:
	                this.isRunning = false;
	                if (this.isMoving)
	                    this.updateMovement(this.movementDirection);
	                break;
	            case Keyboard_1.default.UP:
	            case Keyboard_1.default.W:
	            case Keyboard_1.default.Z: //fr
	            case Keyboard_1.default.DOWN:
	            case Keyboard_1.default.S:
	                this.stop();
	                break;
	            case Keyboard_1.default.LEFT:
	            case Keyboard_1.default.A:
	            case Keyboard_1.default.Q: //fr
	            case Keyboard_1.default.RIGHT:
	            case Keyboard_1.default.D:
	                this.currentRotationInc = 0;
	                break;
	            case Keyboard_1.default.NUMBER_1:
	                this.playAction(1);
	                break;
	            case Keyboard_1.default.NUMBER_2:
	                this.playAction(2);
	                break;
	            case Keyboard_1.default.NUMBER_3:
	                this.playAction(3);
	                break;
	            case Keyboard_1.default.NUMBER_4:
	                this.playAction(4);
	                break;
	            case Keyboard_1.default.NUMBER_5:
	                this.playAction(5);
	                break;
	            case Keyboard_1.default.NUMBER_6:
	                this.playAction(6);
	                break;
	            case Keyboard_1.default.NUMBER_7:
	                this.playAction(7);
	                break;
	            case Keyboard_1.default.NUMBER_8:
	                this.playAction(8);
	                break;
	            case Keyboard_1.default.NUMBER_9:
	                this.playAction(9);
	                break;
	        }
	    };
	    Intermediate_MD5Animation.prototype.updateMovement = function (dir) {
	        this.isMoving = true;
	        this.animator.playbackSpeed = dir * (this.isRunning ? Intermediate_MD5Animation.RUN_SPEED : Intermediate_MD5Animation.WALK_SPEED);
	        if (this.currentAnim == Intermediate_MD5Animation.WALK_NAME)
	            return;
	        this.currentAnim = Intermediate_MD5Animation.WALK_NAME;
	        if (this.onceAnim)
	            return;
	        //update animator
	        this.animator.play(this.currentAnim, this.stateTransition);
	    };
	    Intermediate_MD5Animation.prototype.stop = function () {
	        this.isMoving = false;
	        if (this.currentAnim == Intermediate_MD5Animation.IDLE_NAME)
	            return;
	        this.currentAnim = Intermediate_MD5Animation.IDLE_NAME;
	        if (this.onceAnim)
	            return;
	        //update animator
	        this.animator.playbackSpeed = Intermediate_MD5Animation.IDLE_SPEED;
	        this.animator.play(this.currentAnim, this.stateTransition);
	    };
	    /**
	     * stage listener for resize events
	     */
	    Intermediate_MD5Animation.prototype.onResize = function (event) {
	        if (event === void 0) { event = null; }
	        this.view.width = window.innerWidth;
	        this.view.height = window.innerHeight;
	    };
	    //animation constants
	    Intermediate_MD5Animation.IDLE_NAME = "idle2";
	    Intermediate_MD5Animation.WALK_NAME = "walk7";
	    Intermediate_MD5Animation.ANIM_NAMES = new Array(Intermediate_MD5Animation.IDLE_NAME, Intermediate_MD5Animation.WALK_NAME, "attack3", "turret_attack", "attack2", "chest", "roar1", "leftslash", "headpain", "pain1", "pain_luparm", "range_attack2");
	    Intermediate_MD5Animation.ROTATION_SPEED = 3;
	    Intermediate_MD5Animation.RUN_SPEED = 2;
	    Intermediate_MD5Animation.WALK_SPEED = 1;
	    Intermediate_MD5Animation.IDLE_SPEED = 1;
	    Intermediate_MD5Animation.ACTION_SPEED = 1;
	    return Intermediate_MD5Animation;
	}());
	window.onload = function () {
	    new Intermediate_MD5Animation();
	};


/***/ }
]);
//# sourceMappingURL=Intermediate_MD5Animation.js.map