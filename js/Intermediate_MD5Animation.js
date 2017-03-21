webpackJsonp([6],{

/***/ 34:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_stage__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_parsers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7_awayjs_full_lib_view__ = __webpack_require__(2);
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








var Intermediate_MD5Animation = function () {
    /**
     * Constructor
     */
    function Intermediate_MD5Animation() {
        this.stateTransition = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__["CrossfadeTransition"](0.5);
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
        this.view = new __WEBPACK_IMPORTED_MODULE_7_awayjs_full_lib_view__["View"]();
        this.scene = this.view.scene;
        this.camera = this.view.camera;
        this.camera.projection.far = 5000;
        this.camera.z = -200;
        this.camera.y = 160;
        //setup controller to be used on the camera
        this.placeHolder = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["DisplayObjectContainer"]();
        this.placeHolder.y = 50;
        this.cameraController = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["LookAtController"](this.camera, this.placeHolder);
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
        this.redLight = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PointLight"]();
        this.redLight.x = -1000;
        this.redLight.y = 200;
        this.redLight.z = -1400;
        this.redLight.color = 0xff1111;
        this.scene.addChild(this.redLight);
        this.blueLight = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PointLight"]();
        this.blueLight.x = 1000;
        this.blueLight.y = 200;
        this.blueLight.z = 1400;
        this.blueLight.color = 0x1111ff;
        this.scene.addChild(this.blueLight);
        this.whiteLight = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["DirectionalLight"](-50, -20, 10);
        this.whiteLight.color = 0xffffee;
        this.whiteLight.castsShadows = true;
        this.whiteLight.ambient = 1;
        this.whiteLight.ambientColor = 0x303040;
        this.whiteLight.shadowMapper = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["NearDirectionalShadowMapper"](.2);
        this.scene.addChild(this.whiteLight);
        this.lightPicker = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["StaticLightPicker"]([this.redLight, this.blueLight, this.whiteLight]);
        //create a global shadow method
        this.shadowMapMethod = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["ShadowNearMethod"](new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["ShadowSoftMethod"](this.whiteLight, 15, 8));
        this.shadowMapMethod.epsilon = .1;
        //create a global fog method
        this.fogMethod = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["EffectFogMethod"](0, this.camera.projection.far * 0.5, 0x000000);
    };
    /**
     * Initialise the materials
     */
    Intermediate_MD5Animation.prototype.initMaterials = function () {
        //red light material
        this.redLightMaterial = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["MethodMaterial"]();
        this.redLightMaterial.alphaBlending = true;
        this.redLightMaterial.addEffectMethod(this.fogMethod);
        //blue light material
        this.blueLightMaterial = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["MethodMaterial"]();
        this.blueLightMaterial.alphaBlending = true;
        this.blueLightMaterial.addEffectMethod(this.fogMethod);
        //ground material
        this.groundMaterial = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["MethodMaterial"]();
        this.groundMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true);
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.shadowMethod = this.shadowMapMethod;
        this.groundMaterial.addEffectMethod(this.fogMethod);
        //body material
        this.bodyMaterial = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["MethodMaterial"]();
        this.bodyMaterial.specularMethod.gloss = 20;
        this.bodyMaterial.specularMethod.strength = 1.5;
        this.bodyMaterial.addEffectMethod(this.fogMethod);
        this.bodyMaterial.lightPicker = this.lightPicker;
        this.bodyMaterial.shadowMethod = this.shadowMapMethod;
        //gob material
        this.gobMaterial = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_materials__["MethodMaterial"]();
        this.gobMaterial.alphaBlending = true;
        this.gobMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true);
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
        var redSprite = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Billboard"](this.redLightMaterial);
        redSprite.width = 200;
        redSprite.height = 200;
        redSprite.castsShadows = false;
        var blueSprite = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Billboard"](this.blueLightMaterial);
        blueSprite.width = 200;
        blueSprite.height = 200;
        blueSprite.castsShadows = false;
        this.redLight.addChild(redSprite);
        this.blueLight.addChild(blueSprite);
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].enableParser(__WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_parsers__["MD5MeshParser"]);
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].enableParser(__WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_parsers__["MD5AnimParser"]);
        //create a rocky ground plane
        this.ground = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PrimitivePlanePrefab"](this.groundMaterial, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 50000, 50000, 1, 1).getNewObject();
        this.ground.graphics.scaleUV(200, 200);
        this.ground.castsShadows = false;
        this.scene.addChild(this.ground);
    };
    /**
     * Initialise the listeners
     */
    Intermediate_MD5Animation.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        document.onkeydown = function (event) {
            return _this.onKeyDown(event);
        };
        document.onkeyup = function (event) {
            return _this.onKeyUp(event);
        };
        this.onResize();
        this._timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
        //setup the url map for textures in the cubemap file
        var loaderContext = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderContext"]();
        loaderContext.dependencyBaseUrl = "assets/skybox/";
        //load hellknight sprite
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetEvent"].ASSET_COMPLETE, function (event) {
            return _this.onAssetComplete(event);
        });
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/hellknight/hellknight.md5mesh"), null, null, new __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_parsers__["MD5MeshParser"]());
        //load environment texture
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/skybox/grimnight_texture.cube"), loaderContext);
        //load light textures
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/redlight.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/bluelight.png"));
        //load floor textures
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/rockbase_diffuse.jpg"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/rockbase_normals.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/rockbase_specular.png"));
        //load hellknight textures
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/hellknight/hellknight_diffuse.jpg"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/hellknight/hellknight_normals.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/hellknight/hellknight_specular.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/hellknight/gob.png"));
    };
    /**
     * Navigation and render loop
     */
    Intermediate_MD5Animation.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        this.cameraController.update();
        //update character animation
        if (this.sprite) {
            this.gobStyle.uvMatrix.ty = -this._time / 2000 % 1;
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
        if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["AnimationNodeBase"])) {
            var node = event.asset;
            var name = event.asset.assetNamespace;
            node.name = name;
            this.animationSet.addAnimation(node);
            if (name == Intermediate_MD5Animation.IDLE_NAME || name == Intermediate_MD5Animation.WALK_NAME) {
                node.looping = true;
            } else {
                node.looping = false;
                node.addEventListener(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__["AnimationStateEvent"].PLAYBACK_COMPLETE, function (event) {
                    return _this.onPlaybackComplete(event);
                });
            }
            if (name == Intermediate_MD5Animation.IDLE_NAME) this.stop();
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_stage__["AnimationSetBase"])) {
            this.animationSet = event.asset;
            this.animator = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__["SkeletonAnimator"](this.animationSet, this.skeleton);
            for (var i = 0; i < Intermediate_MD5Animation.ANIM_NAMES.length; ++i) __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/hellknight/" + Intermediate_MD5Animation.ANIM_NAMES[i] + ".md5anim"), null, Intermediate_MD5Animation.ANIM_NAMES[i], new __WEBPACK_IMPORTED_MODULE_6_awayjs_full_lib_parsers__["MD5AnimParser"]());
            this.sprite.animator = this.animator;
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_renderer__["Skeleton"])) {
            this.skeleton = event.asset;
        } else if (event.asset.isAsset(__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Sprite"])) {
            //grab sprite object and assign our material object
            this.sprite = event.asset;
            this.sprite.graphics.getShapeAt(0).material = this.bodyMaterial;
            this.sprite.graphics.getShapeAt(1).material = this.sprite.graphics.getShapeAt(2).material = this.sprite.graphics.getShapeAt(3).material = this.gobMaterial;
            this.sprite.castsShadows = true;
            this.sprite.rotationY = 180;
            this.gobStyle = this.sprite.graphics.getShapeAt(1).style = this.sprite.graphics.getShapeAt(2).style = this.sprite.graphics.getShapeAt(3).style = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Style"]();
            this.gobStyle.uvMatrix = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Matrix"]();
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
                this.skyBox = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Skybox"](event.assets[0]);
                this.scene.addChild(this.skyBox);
                break;
            //entities textures
            case "assets/redlight.png":
                this.redLightMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/bluelight.png":
                this.blueLightMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            //floor textures
            case "assets/rockbase_diffuse.jpg":
                this.groundMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/rockbase_normals.png":
                this.groundMaterial.normalMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/rockbase_specular.png":
                this.groundMaterial.specularMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            //hellknight textures
            case "assets/hellknight/hellknight_diffuse.jpg":
                this.bodyMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/hellknight/hellknight_normals.png":
                this.bodyMaterial.normalMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/hellknight/hellknight_specular.png":
                this.bodyMaterial.specularMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/hellknight/gob.png":
                this.gobMaterial.specularMethod.texture = this.gobMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
        }
    };
    Intermediate_MD5Animation.prototype.onPlaybackComplete = function (event) {
        if (this.animator.activeState != event.animationState) return;
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
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].SHIFT:
                this.isRunning = true;
                if (this.isMoving) this.updateMovement(this.movementDirection);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].UP:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].W:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].Z:
                this.updateMovement(this.movementDirection = 1);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].DOWN:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].S:
                this.updateMovement(this.movementDirection = -1);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].LEFT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].A:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].Q:
                this.currentRotationInc = -Intermediate_MD5Animation.ROTATION_SPEED;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].RIGHT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].D:
                this.currentRotationInc = Intermediate_MD5Animation.ROTATION_SPEED;
                break;
        }
    };
    /**
     * Key down listener for animation
     */
    Intermediate_MD5Animation.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].SHIFT:
                this.isRunning = false;
                if (this.isMoving) this.updateMovement(this.movementDirection);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].UP:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].W:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].Z: //fr
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].DOWN:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].S:
                this.stop();
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].LEFT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].A:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].Q: //fr
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].RIGHT:
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].D:
                this.currentRotationInc = 0;
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_1:
                this.playAction(1);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_2:
                this.playAction(2);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_3:
                this.playAction(3);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_4:
                this.playAction(4);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_5:
                this.playAction(5);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_6:
                this.playAction(6);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_7:
                this.playAction(7);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_8:
                this.playAction(8);
                break;
            case __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Keyboard"].NUMBER_9:
                this.playAction(9);
                break;
        }
    };
    Intermediate_MD5Animation.prototype.updateMovement = function (dir) {
        this.isMoving = true;
        this.animator.playbackSpeed = dir * (this.isRunning ? Intermediate_MD5Animation.RUN_SPEED : Intermediate_MD5Animation.WALK_SPEED);
        if (this.currentAnim == Intermediate_MD5Animation.WALK_NAME) return;
        this.currentAnim = Intermediate_MD5Animation.WALK_NAME;
        if (this.onceAnim) return;
        //update animator
        this.animator.play(this.currentAnim, this.stateTransition);
    };
    Intermediate_MD5Animation.prototype.stop = function () {
        this.isMoving = false;
        if (this.currentAnim == Intermediate_MD5Animation.IDLE_NAME) return;
        this.currentAnim = Intermediate_MD5Animation.IDLE_NAME;
        if (this.onceAnim) return;
        //update animator
        this.animator.playbackSpeed = Intermediate_MD5Animation.IDLE_SPEED;
        this.animator.play(this.currentAnim, this.stateTransition);
    };
    /**
     * stage listener for resize events
     */
    Intermediate_MD5Animation.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return Intermediate_MD5Animation;
}();
//animation constants
Intermediate_MD5Animation.IDLE_NAME = "idle2";
Intermediate_MD5Animation.WALK_NAME = "walk7";
Intermediate_MD5Animation.ANIM_NAMES = new Array(Intermediate_MD5Animation.IDLE_NAME, Intermediate_MD5Animation.WALK_NAME, "attack3", "turret_attack", "attack2", "chest", "roar1", "leftslash", "headpain", "pain1", "pain_luparm", "range_attack2");
Intermediate_MD5Animation.ROTATION_SPEED = 3;
Intermediate_MD5Animation.RUN_SPEED = 2;
Intermediate_MD5Animation.WALK_SPEED = 1;
Intermediate_MD5Animation.IDLE_SPEED = 1;
Intermediate_MD5Animation.ACTION_SPEED = 1;
window.onload = function () {
    new Intermediate_MD5Animation();
};

/***/ }

},[34]);
//# sourceMappingURL=Intermediate_MD5Animation.js.map