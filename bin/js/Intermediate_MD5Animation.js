(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Intermediate_MD5Animation.ts":[function(require,module,exports){
/*

MD5 animation loading and interaction example in Away3d

Demonstrates:

How to load MD5 mesh and anim files with bones animation from embedded resources.
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
var Sampler2D = require("awayjs-core/lib/image/Sampler2D");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var Matrix = require("awayjs-core/lib/geom/Matrix");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var LoaderContext = require("awayjs-core/lib/library/LoaderContext");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var Keyboard = require("awayjs-core/lib/ui/Keyboard");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var AnimationNodeBase = require("awayjs-display/lib/animators/nodes/AnimationNodeBase");
var DisplayObjectContainer = require("awayjs-display/lib/containers/DisplayObjectContainer");
var View = require("awayjs-display/lib/containers/View");
var LookAtController = require("awayjs-display/lib/controllers/LookAtController");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var NearDirectionalShadowMapper = require("awayjs-display/lib/materials/shadowmappers/NearDirectionalShadowMapper");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var Single2DTexture = require("awayjs-display/lib/textures/Single2DTexture");
var AnimationSetBase = require("awayjs-renderergl/lib/animators/AnimationSetBase");
var SkeletonAnimator = require("awayjs-renderergl/lib/animators/SkeletonAnimator");
var Skeleton = require("awayjs-renderergl/lib/animators/data/Skeleton");
var CrossfadeTransition = require("awayjs-renderergl/lib/animators/transitions/CrossfadeTransition");
var AnimationStateEvent = require("awayjs-renderergl/lib/events/AnimationStateEvent");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var EffectFogMethod = require("awayjs-methodmaterials/lib/methods/EffectFogMethod");
var ShadowNearMethod = require("awayjs-methodmaterials/lib/methods/ShadowNearMethod");
var ShadowSoftMethod = require("awayjs-methodmaterials/lib/methods/ShadowSoftMethod");
var MD5AnimParser = require("awayjs-parsers/lib/MD5AnimParser");
var MD5MeshParser = require("awayjs-parsers/lib/MD5MeshParser");
var ElementsType = require("awayjs-display/lib/graphics/ElementsType");
var Intermediate_MD5Animation = (function () {
    /**
     * Constructor
     */
    function Intermediate_MD5Animation() {
        this.stateTransition = new CrossfadeTransition(0.5);
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
        this.view = new View(new DefaultRenderer());
        this.scene = this.view.scene;
        this.camera = this.view.camera;
        this.camera.projection.far = 5000;
        this.camera.z = -200;
        this.camera.y = 160;
        //setup controller to be used on the camera
        this.placeHolder = new DisplayObjectContainer();
        this.placeHolder.y = 50;
        this.cameraController = new LookAtController(this.camera, this.placeHolder);
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
        this.redLight = new PointLight();
        this.redLight.x = -1000;
        this.redLight.y = 200;
        this.redLight.z = -1400;
        this.redLight.color = 0xff1111;
        this.scene.addChild(this.redLight);
        this.blueLight = new PointLight();
        this.blueLight.x = 1000;
        this.blueLight.y = 200;
        this.blueLight.z = 1400;
        this.blueLight.color = 0x1111ff;
        this.scene.addChild(this.blueLight);
        this.whiteLight = new DirectionalLight(-50, -20, 10);
        this.whiteLight.color = 0xffffee;
        this.whiteLight.castsShadows = true;
        this.whiteLight.ambient = 1;
        this.whiteLight.ambientColor = 0x303040;
        this.whiteLight.shadowMapper = new NearDirectionalShadowMapper(.2);
        this.scene.addChild(this.whiteLight);
        this.lightPicker = new StaticLightPicker([this.redLight, this.blueLight, this.whiteLight]);
        //create a global shadow method
        this.shadowMapMethod = new ShadowNearMethod(new ShadowSoftMethod(this.whiteLight, 15, 8));
        this.shadowMapMethod.epsilon = .1;
        //create a global fog method
        this.fogMethod = new EffectFogMethod(0, this.camera.projection.far * 0.5, 0x000000);
    };
    /**
     * Initialise the materials
     */
    Intermediate_MD5Animation.prototype.initMaterials = function () {
        //red light material
        this.redLightMaterial = new MethodMaterial();
        this.redLightMaterial.alphaBlending = true;
        this.redLightMaterial.addEffectMethod(this.fogMethod);
        //blue light material
        this.blueLightMaterial = new MethodMaterial();
        this.blueLightMaterial.alphaBlending = true;
        this.blueLightMaterial.addEffectMethod(this.fogMethod);
        //ground material
        this.groundMaterial = new MethodMaterial();
        this.groundMaterial.style.sampler = new Sampler2D(true, true);
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.shadowMethod = this.shadowMapMethod;
        this.groundMaterial.addEffectMethod(this.fogMethod);
        //body material
        this.bodyMaterial = new MethodMaterial();
        this.bodyMaterial.specularMethod.gloss = 20;
        this.bodyMaterial.specularMethod.strength = 1.5;
        this.bodyMaterial.addEffectMethod(this.fogMethod);
        this.bodyMaterial.lightPicker = this.lightPicker;
        this.bodyMaterial.shadowMethod = this.shadowMapMethod;
        //gob material
        this.gobMaterial = new MethodMaterial();
        this.gobMaterial.alphaBlending = true;
        this.gobMaterial.style.sampler = new Sampler2D(true, true);
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
        var redSprite = new Billboard(this.redLightMaterial);
        redSprite.width = 200;
        redSprite.height = 200;
        redSprite.castsShadows = false;
        var blueSprite = new Billboard(this.blueLightMaterial);
        blueSprite.width = 200;
        blueSprite.height = 200;
        blueSprite.castsShadows = false;
        this.redLight.addChild(redSprite);
        this.blueLight.addChild(blueSprite);
        AssetLibrary.enableParser(MD5MeshParser);
        AssetLibrary.enableParser(MD5AnimParser);
        //create a rocky ground plane
        this.ground = new PrimitivePlanePrefab(this.groundMaterial, ElementsType.TRIANGLE, 50000, 50000, 1, 1).getNewObject();
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
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        //setup the url map for textures in the cubemap file
        var loaderContext = new LoaderContext();
        loaderContext.dependencyBaseUrl = "assets/skybox/";
        //load hellknight mesh
        AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
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
    };
    /**
     * Navigation and render loop
     */
    Intermediate_MD5Animation.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        this.cameraController.update();
        //update character animation
        if (this.mesh) {
            this.mesh.graphics.getGraphicAt(1).uvTransform.ty = this.mesh.graphics.getGraphicAt(2).uvTransform.ty = this.mesh.graphics.getGraphicAt(3).uvTransform.ty = (-this._time / 2000 % 1);
            this.mesh.rotationY += this.currentRotationInc;
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
        if (event.asset.isAsset(AnimationNodeBase)) {
            var node = event.asset;
            var name = event.asset.assetNamespace;
            node.name = name;
            this.animationSet.addAnimation(node);
            if (name == Intermediate_MD5Animation.IDLE_NAME || name == Intermediate_MD5Animation.WALK_NAME) {
                node.looping = true;
            }
            else {
                node.looping = false;
                node.addEventListener(AnimationStateEvent.PLAYBACK_COMPLETE, function (event) { return _this.onPlaybackComplete(event); });
            }
            if (name == Intermediate_MD5Animation.IDLE_NAME)
                this.stop();
        }
        else if (event.asset.isAsset(AnimationSetBase)) {
            this.animationSet = event.asset;
            this.animator = new SkeletonAnimator(this.animationSet, this.skeleton);
            for (var i = 0; i < Intermediate_MD5Animation.ANIM_NAMES.length; ++i)
                AssetLibrary.load(new URLRequest("assets/hellknight/" + Intermediate_MD5Animation.ANIM_NAMES[i] + ".md5anim"), null, Intermediate_MD5Animation.ANIM_NAMES[i], new MD5AnimParser());
            this.mesh.animator = this.animator;
        }
        else if (event.asset.isAsset(Skeleton)) {
            this.skeleton = event.asset;
        }
        else if (event.asset.isAsset(Mesh)) {
            //grab mesh object and assign our material object
            this.mesh = event.asset;
            this.mesh.graphics.getGraphicAt(0).material = this.bodyMaterial;
            this.mesh.graphics.getGraphicAt(1).material = this.mesh.graphics.getGraphicAt(2).material = this.mesh.graphics.getGraphicAt(3).material = this.gobMaterial;
            this.mesh.castsShadows = true;
            this.mesh.rotationY = 180;
            this.mesh.graphics.getGraphicAt(1).uvTransform = this.mesh.graphics.getGraphicAt(2).uvTransform = this.mesh.graphics.getGraphicAt(3).uvTransform = new Matrix();
            this.scene.addChild(this.mesh);
            //add our lookat object to the mesh
            this.mesh.addChild(this.placeHolder);
        }
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Intermediate_MD5Animation.prototype.onResourceComplete = function (event) {
        switch (event.url) {
            case 'assets/skybox/grimnight_texture.cube':
                this.skyBox = new Skybox(event.assets[0]);
                this.scene.addChild(this.skyBox);
                break;
            case "assets/redlight.png":
                this.redLightMaterial.ambientMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/bluelight.png":
                this.blueLightMaterial.ambientMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/rockbase_diffuse.jpg":
                this.groundMaterial.ambientMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/rockbase_normals.png":
                this.groundMaterial.normalMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/rockbase_specular.png":
                this.groundMaterial.specularMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/hellknight/hellknight_diffuse.jpg":
                this.bodyMaterial.ambientMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/hellknight/hellknight_normals.png":
                this.bodyMaterial.normalMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/hellknight/hellknight_specular.png":
                this.bodyMaterial.specularMethod.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/hellknight/gob.png":
                this.gobMaterial.specularMethod.texture = this.gobMaterial.ambientMethod.texture = new Single2DTexture(event.assets[0]);
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
            case Keyboard.SHIFT:
                this.isRunning = true;
                if (this.isMoving)
                    this.updateMovement(this.movementDirection);
                break;
            case Keyboard.UP:
            case Keyboard.W:
            case Keyboard.Z:
                this.updateMovement(this.movementDirection = 1);
                break;
            case Keyboard.DOWN:
            case Keyboard.S:
                this.updateMovement(this.movementDirection = -1);
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
            case Keyboard.Q:
                this.currentRotationInc = -Intermediate_MD5Animation.ROTATION_SPEED;
                break;
            case Keyboard.RIGHT:
            case Keyboard.D:
                this.currentRotationInc = Intermediate_MD5Animation.ROTATION_SPEED;
                break;
        }
    };
    /**
     * Key down listener for animation
     */
    Intermediate_MD5Animation.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case Keyboard.SHIFT:
                this.isRunning = false;
                if (this.isMoving)
                    this.updateMovement(this.movementDirection);
                break;
            case Keyboard.UP:
            case Keyboard.W:
            case Keyboard.Z:
            case Keyboard.DOWN:
            case Keyboard.S:
                this.stop();
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
            case Keyboard.Q:
            case Keyboard.RIGHT:
            case Keyboard.D:
                this.currentRotationInc = 0;
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
})();
window.onload = function () {
    new Intermediate_MD5Animation();
};

},{"awayjs-core/lib/events/AssetEvent":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Matrix":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/library/LoaderContext":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/ui/Keyboard":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/animators/nodes/AnimationNodeBase":undefined,"awayjs-display/lib/containers/DisplayObjectContainer":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/LookAtController":undefined,"awayjs-display/lib/entities/Billboard":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/PointLight":undefined,"awayjs-display/lib/entities/Skybox":undefined,"awayjs-display/lib/graphics/ElementsType":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/materials/shadowmappers/NearDirectionalShadowMapper":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/methods/EffectFogMethod":undefined,"awayjs-methodmaterials/lib/methods/ShadowNearMethod":undefined,"awayjs-methodmaterials/lib/methods/ShadowSoftMethod":undefined,"awayjs-parsers/lib/MD5AnimParser":undefined,"awayjs-parsers/lib/MD5MeshParser":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined,"awayjs-renderergl/lib/animators/AnimationSetBase":undefined,"awayjs-renderergl/lib/animators/SkeletonAnimator":undefined,"awayjs-renderergl/lib/animators/data/Skeleton":undefined,"awayjs-renderergl/lib/animators/transitions/CrossfadeTransition":undefined,"awayjs-renderergl/lib/events/AnimationStateEvent":undefined}]},{},["./src/Intermediate_MD5Animation.ts"])


//# sourceMappingURL=Intermediate_MD5Animation.js.map