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
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var UVTransform = require("awayjs-core/lib/geom/UVTransform");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/library/AssetLoaderContext");
var AssetType = require("awayjs-core/lib/library/AssetType");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var Keyboard = require("awayjs-core/lib/ui/Keyboard");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var DisplayObjectContainer = require("awayjs-display/lib/containers/DisplayObjectContainer");
var View = require("awayjs-display/lib/containers/View");
var LookAtController = require("awayjs-display/lib/controllers/LookAtController");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var NearDirectionalShadowMapper = require("awayjs-display/lib/materials/shadowmappers/NearDirectionalShadowMapper");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var SkeletonAnimator = require("awayjs-renderergl/lib/animators/SkeletonAnimator");
var CrossfadeTransition = require("awayjs-renderergl/lib/animators/transitions/CrossfadeTransition");
var AnimationStateEvent = require("awayjs-renderergl/lib/events/AnimationStateEvent");
var SkyboxMaterial = require("awayjs-renderergl/lib/materials/SkyboxMaterial");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var TriangleMethodMaterial = require("awayjs-methodmaterials/lib/TriangleMethodMaterial");
var EffectFogMethod = require("awayjs-methodmaterials/lib/methods/EffectFogMethod");
var ShadowNearMethod = require("awayjs-methodmaterials/lib/methods/ShadowNearMethod");
var ShadowSoftMethod = require("awayjs-methodmaterials/lib/methods/ShadowSoftMethod");
var MD5AnimParser = require("awayjs-parsers/lib/MD5AnimParser");
var MD5MeshParser = require("awayjs-parsers/lib/MD5MeshParser");
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
        this.redLightMaterial = new TriangleMethodMaterial();
        this.redLightMaterial.alphaBlending = true;
        this.redLightMaterial.addEffectMethod(this.fogMethod);
        //blue light material
        this.blueLightMaterial = new TriangleMethodMaterial();
        this.blueLightMaterial.alphaBlending = true;
        this.blueLightMaterial.addEffectMethod(this.fogMethod);
        //ground material
        this.groundMaterial = new TriangleMethodMaterial();
        this.groundMaterial.smooth = true;
        this.groundMaterial.repeat = true;
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.shadowMethod = this.shadowMapMethod;
        this.groundMaterial.addEffectMethod(this.fogMethod);
        //body material
        this.bodyMaterial = new TriangleMethodMaterial();
        this.bodyMaterial.gloss = 20;
        this.bodyMaterial.specular = 1.5;
        this.bodyMaterial.addEffectMethod(this.fogMethod);
        this.bodyMaterial.lightPicker = this.lightPicker;
        this.bodyMaterial.shadowMethod = this.shadowMapMethod;
        //gob material
        this.gobMaterial = new TriangleMethodMaterial();
        this.gobMaterial.alphaBlending = true;
        this.gobMaterial.smooth = true;
        this.gobMaterial.repeat = true;
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
        this.ground = new PrimitivePlanePrefab(50000, 50000, 1, 1).getNewObject();
        this.ground.material = this.groundMaterial;
        this.ground.geometry.scaleUV(200, 200);
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
        var assetLoaderContext = new AssetLoaderContext();
        assetLoaderContext.dependencyBaseUrl = "assets/skybox/";
        //load hellknight mesh
        AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, function (event) { return _this.onAssetComplete(event); });
        AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        AssetLibrary.load(new URLRequest("assets/hellknight/hellknight.md5mesh"), null, null, new MD5MeshParser());
        //load environment texture
        AssetLibrary.load(new URLRequest("assets/skybox/grimnight_texture.cube"), assetLoaderContext);
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
            this.mesh.subMeshes[1].uvTransform.offsetV = this.mesh.subMeshes[2].uvTransform.offsetV = this.mesh.subMeshes[3].uvTransform.offsetV = (-this._time / 2000 % 1);
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
        if (event.asset.assetType == AssetType.ANIMATION_NODE) {
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
        else if (event.asset.assetType == AssetType.ANIMATION_SET) {
            this.animationSet = event.asset;
            this.animator = new SkeletonAnimator(this.animationSet, this.skeleton);
            for (var i = 0; i < Intermediate_MD5Animation.ANIM_NAMES.length; ++i)
                AssetLibrary.load(new URLRequest("assets/hellknight/" + Intermediate_MD5Animation.ANIM_NAMES[i] + ".md5anim"), null, Intermediate_MD5Animation.ANIM_NAMES[i], new MD5AnimParser());
            this.mesh.animator = this.animator;
        }
        else if (event.asset.assetType == AssetType.SKELETON) {
            this.skeleton = event.asset;
        }
        else if (event.asset.assetType == AssetType.MESH) {
            //grab mesh object and assign our material object
            this.mesh = event.asset;
            this.mesh.subMeshes[0].material = this.bodyMaterial;
            this.mesh.subMeshes[1].material = this.mesh.subMeshes[2].material = this.mesh.subMeshes[3].material = this.gobMaterial;
            this.mesh.castsShadows = true;
            this.mesh.rotationY = 180;
            this.mesh.subMeshes[1].uvTransform = this.mesh.subMeshes[2].uvTransform = this.mesh.subMeshes[3].uvTransform = new UVTransform();
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
                this.cubeTexture = event.assets[0];
                this.skyBox = new Skybox(new SkyboxMaterial(this.cubeTexture));
                break;
            case "assets/redlight.png":
                this.redLightMaterial.texture = event.assets[0];
                break;
            case "assets/bluelight.png":
                this.blueLightMaterial.texture = event.assets[0];
                break;
            case "assets/rockbase_diffuse.jpg":
                this.groundMaterial.texture = event.assets[0];
                break;
            case "assets/rockbase_normals.png":
                this.groundMaterial.normalMap = event.assets[0];
                break;
            case "assets/rockbase_specular.png":
                this.groundMaterial.specularMap = event.assets[0];
                break;
            case "assets/hellknight/hellknight_diffuse.jpg":
                this.bodyMaterial.texture = event.assets[0];
                break;
            case "assets/hellknight/hellknight_normals.png":
                this.bodyMaterial.normalMap = event.assets[0];
                break;
            case "assets/hellknight/hellknight_specular.png":
                this.bodyMaterial.specularMap = event.assets[0];
                break;
            case "assets/hellknight/gob.png":
                this.bodyMaterial.specularMap = this.gobMaterial.texture = event.assets[0];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24iLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0IiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0RW5naW5lIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0TWF0ZXJpYWxzIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0T2JqZWN0cyIsIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24ub25FbnRlckZyYW1lIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5vbkFzc2V0Q29tcGxldGUiLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24ub25QbGF5YmFja0NvbXBsZXRlIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5wbGF5QWN0aW9uIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5vbktleURvd24iLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLm9uS2V5VXAiLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLnVwZGF0ZU1vdmVtZW50IiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5zdG9wIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5vblJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBc0NFO0FBRUYsSUFBTyxVQUFVLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFdBQVcsV0FBZSxvQ0FB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QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7UUFDdEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUMvQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFFbkNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLFVBQVVBLEVBQUVBLENBQUNBO1FBQ2xDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUN4QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsQ0FBQ0E7UUFDdkJBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUNoQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFFcENBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ2pDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtRQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDNUJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLFlBQVlBLEdBQUdB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a0JBLENBQUNBLEtBQUtBLENBQUNBLEVBQTlCQSxDQUE4QkEsQ0FBQ0EsQ0FBQ0E7UUFDcEhBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsYUFBYUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFM0dBLEFBQ0FBLDBCQUQwQkE7UUFDMUJBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsRUFBRUEsa0JBQWtCQSxDQUFDQSxDQUFDQTtRQUU5RkEsQUFDQUEscUJBRHFCQTtRQUNyQkEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EscUJBQXFCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN6REEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUUxREEsQUFDQUEscUJBRHFCQTtRQUNyQkEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsOEJBQThCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVsRUEsQUFDQUEsMEJBRDBCQTtRQUMxQkEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsMENBQTBDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5RUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsMENBQTBDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM5RUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsMkNBQTJDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMvRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNoRUEsQ0FBQ0E7SUFFRFA7O09BRUdBO0lBQ0tBLGdEQUFZQSxHQUFwQkEsVUFBcUJBLEVBQVNBO1FBRTdCUSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxFQUFFQSxDQUFDQTtRQUVqQkEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtRQUUvQkEsQUFDQUEsNEJBRDRCQTtRQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUpBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLElBQUlBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0E7UUFDaERBLENBQUNBO1FBRURBLElBQUlBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBO1FBRW5CQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFDQSxJQUFJQSxDQUFDQTtRQUM1Q0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDdERBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUNBLEdBQUdBLENBQUNBLEdBQUNBLElBQUlBLENBQUNBO1FBQ2hEQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFDQSxHQUFHQSxDQUFDQSxHQUFDQSxJQUFJQSxDQUFDQTtRQUNsREEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBQ0EsR0FBR0EsQ0FBQ0E7UUFDdERBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUNBLEdBQUdBLENBQUNBLEdBQUNBLElBQUlBLENBQUNBO1FBRWxEQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtJQUNwQkEsQ0FBQ0E7SUFFRFI7O09BRUdBO0lBQ0tBLG1EQUFlQSxHQUF2QkEsVUFBd0JBLEtBQWdCQTtRQUF4Q1MsaUJBeUNDQTtRQXZDQUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsSUFBSUEsU0FBU0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFdkRBLElBQUlBLElBQUlBLEdBQXVDQSxLQUFLQSxDQUFDQSxLQUFLQSxD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LElBQUlBLENBQUNBLFlBQVlBLENBQUNBO1lBQ3BEQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxRQUFRQSxHQUFHQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQTtZQUN2SEEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDOUJBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLEdBQUdBLEdBQUdBLENBQUNBO1lBQzFCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxXQUFXQSxHQUFHQSxJQUFJQSxXQUFXQSxFQUFFQSxDQUFDQTtZQUNqSUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFFL0JBLEFBQ0FBLG1DQURtQ0E7WUFDbkNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1FBQ3RDQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEVDs7T0FFR0E7SUFDS0Esc0RBQWtCQSxHQUExQkEsVUFBNEJBLEtBQWlCQTtRQUU1Q1UsTUFBTUEsQ0FBQUEsQ0FBRUEsS0FBS0EsQ0FBQ0EsR0FBSUEsQ0FBQ0EsQ0FDbkJBLENBQUNBO1lBRUFB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bUNBQVNBLEdBQVVBLE9BQU9BLENBQUNBO0lBQzNCQSxtQ0FBU0EsR0FBVUEsT0FBT0EsQ0FBQ0E7SUFDM0JBLG9DQUFVQSxHQUFpQkEsSUFBSUEsS0FBS0EsQ0FBU0EseUJBQXlCQSxDQUFDQSxTQUFTQSxFQUFFQSx5QkFBeUJBLENBQUNBLFNBQVNBLEVBQUVBLFNBQVNBLEVBQUVBLGVBQWVBLEVBQUVBLFNBQVNBLEVBQUVBLE9BQU9BLEVBQUVBLE9BQU9BLEVBQUVBLFdBQVdBLEVBQUVBLFVBQVVBLEVBQUVBLE9BQU9BLEVBQUVBLGFBQWFBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO0lBQ2xQQSx3Q0FBY0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7SUFDMUJBLG1DQUFTQSxHQUFVQSxDQUFDQSxDQUFDQTtJQUNyQkEsb0NBQVVBLEdBQVVBLENBQUNBLENBQUNBO0lBQ3RCQSxvQ0FBVUEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7SUFDdEJBLHNDQUFZQSxHQUFVQSxDQUFDQSxDQUFDQTtJQTRmeENBLGdDQUFDQTtBQUFEQSxDQXhoQkEsQUF3aEJDQSxJQUFBO0FBR0QsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUVmLElBQUkseUJBQXlCLEVBQUUsQ0FBQztBQUNqQyxDQUFDLENBQUEiLCJmaWxlIjoiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXNDb250ZW50IjpbIu+7vy8qXG5cbk1ENSBhbmltYXRpb24gbG9hZGluZyBhbmQgaW50ZXJhY3Rpb24gZXhhbXBsZSBpbiBBd2F5M2RcblxuRGVtb25zdHJhdGVzOlxuXG5Ib3cgdG8gbG9hZCBNRDUgbWVzaCBhbmQgYW5pbSBmaWxlcyB3aXRoIGJvbmVzIGFuaW1hdGlvbiBmcm9tIGVtYmVkZGVkIHJlc291cmNlcy5cbkhvdyB0byBtYXAgYW5pbWF0aW9uIGRhdGEgYWZ0ZXIgbG9hZGluZyBpbiBvcmRlciB0byBwbGF5YmFjayBhbiBhbmltYXRpb24gc2VxdWVuY2UuXG5Ib3cgdG8gY29udHJvbCB0aGUgbW92ZW1lbnQgb2YgYSBnYW1lIGNoYXJhY3RlciB1c2luZyBrZXlzLlxuXG5Db2RlIGJ5IFJvYiBCYXRlbWFuICYgRGF2aWQgTGVuYWVydHNcbnJvYkBpbmZpbml0ZXR1cnRsZXMuY28udWtcbmh0dHA6Ly93d3cuaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5kYXZpZC5sZW5hZXJ0c0BnbWFpbC5jb21cbmh0dHA6Ly93d3cuZGVyc2NobWFsZS5jb21cblxuVGhpcyBjb2RlIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUg4oCcU29mdHdhcmXigJ0pLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIOKAnEFTIElT4oCdLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cblxuKi9cblxuaW1wb3J0IEFzc2V0RXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBVVlRyYW5zZm9ybVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9VVlRyYW5zZm9ybVwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyQ29udGV4dFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBBc3NldFR5cGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IEtleWJvYXJkXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3VpL0tleWJvYXJkXCIpO1xuaW1wb3J0IEltYWdlQ3ViZVRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZUN1YmVUZXh0dXJlXCIpO1xuaW1wb3J0IEltYWdlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgRGlzcGxheU9iamVjdENvbnRhaW5lclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9EaXNwbGF5T2JqZWN0Q29udGFpbmVyXCIpO1xuaW1wb3J0IFNjZW5lXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvU2NlbmVcIik7XG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgTG9va0F0Q29udHJvbGxlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRyb2xsZXJzL0xvb2tBdENvbnRyb2xsZXJcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBCaWxsYm9hcmRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0JpbGxib2FyZFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Qb2ludExpZ2h0XCIpO1xuaW1wb3J0IFNreWJveFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgTmVhckRpcmVjdGlvbmFsU2hhZG93TWFwcGVyXHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL3NoYWRvd21hcHBlcnMvTmVhckRpcmVjdGlvbmFsU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9saWdodHBpY2tlcnMvU3RhdGljTGlnaHRQaWNrZXJcIik7XG5pbXBvcnQgUHJpbWl0aXZlUGxhbmVQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVQbGFuZVByZWZhYlwiKTtcblxuaW1wb3J0IFNrZWxldG9uQW5pbWF0aW9uU2V0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL2FuaW1hdG9ycy9Ta2VsZXRvbkFuaW1hdGlvblNldFwiKTtcbmltcG9ydCBTa2VsZXRvbkFuaW1hdG9yXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvYW5pbWF0b3JzL1NrZWxldG9uQW5pbWF0b3JcIik7XG5pbXBvcnQgU2tlbGV0b25cdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvYW5pbWF0b3JzL2RhdGEvU2tlbGV0b25cIik7XG5pbXBvcnQgU2tlbGV0b25DbGlwTm9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL2FuaW1hdG9ycy9ub2Rlcy9Ta2VsZXRvbkNsaXBOb2RlXCIpO1xuaW1wb3J0IENyb3NzZmFkZVRyYW5zaXRpb25cdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvYW5pbWF0b3JzL3RyYW5zaXRpb25zL0Nyb3NzZmFkZVRyYW5zaXRpb25cIik7XG5pbXBvcnQgQW5pbWF0aW9uU3RhdGVFdmVudFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9ldmVudHMvQW5pbWF0aW9uU3RhdGVFdmVudFwiKTtcbmltcG9ydCBTa3lib3hNYXRlcmlhbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9Ta3lib3hNYXRlcmlhbFwiKTtcblxuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcblxuaW1wb3J0IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWxcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvVHJpYW5nbGVNZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBFZmZlY3RGb2dNZXRob2RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvRWZmZWN0Rm9nTWV0aG9kXCIpO1xuaW1wb3J0IFNoYWRvd05lYXJNZXRob2RcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvU2hhZG93TmVhck1ldGhvZFwiKTtcbmltcG9ydCBTaGFkb3dTb2Z0TWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NoYWRvd1NvZnRNZXRob2RcIik7XG5cbmltcG9ydCBNRDVBbmltUGFyc2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcGFyc2Vycy9saWIvTUQ1QW5pbVBhcnNlclwiKTtcbmltcG9ydCBNRDVNZXNoUGFyc2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcGFyc2Vycy9saWIvTUQ1TWVzaFBhcnNlclwiKTtcblxuY2xhc3MgSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvblxue1xuXHQvL2VuZ2luZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBzY2VuZTpTY2VuZTtcblx0cHJpdmF0ZSBjYW1lcmE6Q2FtZXJhO1xuXHRwcml2YXRlIHZpZXc6Vmlldztcblx0cHJpdmF0ZSBjYW1lcmFDb250cm9sbGVyOkxvb2tBdENvbnRyb2xsZXI7XG5cblx0Ly9hbmltYXRpb24gdmFyaWFibGVzXG5cdHByaXZhdGUgYW5pbWF0b3I6U2tlbGV0b25BbmltYXRvcjtcblx0cHJpdmF0ZSBhbmltYXRpb25TZXQ6U2tlbGV0b25BbmltYXRpb25TZXQ7XG5cdHByaXZhdGUgc3RhdGVUcmFuc2l0aW9uOkNyb3NzZmFkZVRyYW5zaXRpb24gPSBuZXcgQ3Jvc3NmYWRlVHJhbnNpdGlvbigwLjUpO1xuXHRwcml2YXRlIHNrZWxldG9uOlNrZWxldG9uO1xuXHRwcml2YXRlIGlzUnVubmluZzpCb29sZWFuO1xuXHRwcml2YXRlIGlzTW92aW5nOkJvb2xlYW47XG5cdHByaXZhdGUgbW92ZW1lbnREaXJlY3Rpb246bnVtYmVyO1xuXHRwcml2YXRlIG9uY2VBbmltOnN0cmluZztcblx0cHJpdmF0ZSBjdXJyZW50QW5pbTpzdHJpbmc7XG5cdHByaXZhdGUgY3VycmVudFJvdGF0aW9uSW5jOm51bWJlciA9IDA7XG5cblx0Ly9hbmltYXRpb24gY29uc3RhbnRzXG5cdHByaXZhdGUgc3RhdGljIElETEVfTkFNRTpzdHJpbmcgPSBcImlkbGUyXCI7XG5cdHByaXZhdGUgc3RhdGljIFdBTEtfTkFNRTpzdHJpbmcgPSBcIndhbGs3XCI7XG5cdHByaXZhdGUgc3RhdGljIEFOSU1fTkFNRVM6QXJyYXk8c3RyaW5nPiA9IG5ldyBBcnJheTxzdHJpbmc+KEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uSURMRV9OQU1FLCBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfTkFNRSwgXCJhdHRhY2szXCIsIFwidHVycmV0X2F0dGFja1wiLCBcImF0dGFjazJcIiwgXCJjaGVzdFwiLCBcInJvYXIxXCIsIFwibGVmdHNsYXNoXCIsIFwiaGVhZHBhaW5cIiwgXCJwYWluMVwiLCBcInBhaW5fbHVwYXJtXCIsIFwicmFuZ2VfYXR0YWNrMlwiKTtcblx0cHJpdmF0ZSBzdGF0aWMgUk9UQVRJT05fU1BFRUQ6bnVtYmVyID0gMztcblx0cHJpdmF0ZSBzdGF0aWMgUlVOX1NQRUVEOm51bWJlciA9IDI7XG5cdHByaXZhdGUgc3RhdGljIFdBTEtfU1BFRUQ6bnVtYmVyID0gMTtcblx0cHJpdmF0ZSBzdGF0aWMgSURMRV9TUEVFRDpudW1iZXIgPSAxO1xuXHRwcml2YXRlIHN0YXRpYyBBQ1RJT05fU1BFRUQ6bnVtYmVyID0gMTtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSByZWRMaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIGJsdWVMaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIHdoaXRlTGlnaHQ6RGlyZWN0aW9uYWxMaWdodDtcblx0cHJpdmF0ZSBsaWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcblx0cHJpdmF0ZSBzaGFkb3dNYXBNZXRob2Q6U2hhZG93TmVhck1ldGhvZDtcblx0cHJpdmF0ZSBmb2dNZXRob2Q6RWZmZWN0Rm9nTWV0aG9kO1xuXHRwcml2YXRlIGNvdW50Om51bWJlciA9IDA7XG5cblx0Ly9tYXRlcmlhbCBvYmplY3RzXG5cdHByaXZhdGUgcmVkTGlnaHRNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGJsdWVMaWdodE1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgZ3JvdW5kTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBib2R5TWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBnb2JNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGN1YmVUZXh0dXJlOkltYWdlQ3ViZVRleHR1cmU7XG5cblx0Ly9zY2VuZSBvYmplY3RzXG5cdHByaXZhdGUgcGxhY2VIb2xkZXI6RGlzcGxheU9iamVjdENvbnRhaW5lcjtcblx0cHJpdmF0ZSBtZXNoOk1lc2g7XG5cdHByaXZhdGUgZ3JvdW5kOk1lc2g7XG5cdHByaXZhdGUgc2t5Qm94OlNreWJveDtcblxuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHQvL3RoaXMuaW5pdFRleHQoKTtcblx0XHR0aGlzLmluaXRMaWdodHMoKTtcblx0XHR0aGlzLmluaXRNYXRlcmlhbHMoKTtcblx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKCkpO1xuXHRcdHRoaXMuc2NlbmUgPSB0aGlzLnZpZXcuc2NlbmU7XG5cdFx0dGhpcy5jYW1lcmEgPSB0aGlzLnZpZXcuY2FtZXJhO1xuXG5cdFx0dGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIgPSA1MDAwO1xuXHRcdHRoaXMuY2FtZXJhLnogPSAtMjAwO1xuXHRcdHRoaXMuY2FtZXJhLnkgPSAxNjA7XG5cblx0XHQvL3NldHVwIGNvbnRyb2xsZXIgdG8gYmUgdXNlZCBvbiB0aGUgY2FtZXJhXG5cdFx0dGhpcy5wbGFjZUhvbGRlciA9IG5ldyBEaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG5cdFx0dGhpcy5wbGFjZUhvbGRlci55ID0gNTA7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyID0gbmV3IExvb2tBdENvbnRyb2xsZXIodGhpcy5jYW1lcmEsIHRoaXMucGxhY2VIb2xkZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhbiBpbnN0cnVjdGlvbnMgb3ZlcmxheVxuXHQgKi9cbi8vXHRcdHByaXZhdGUgaW5pdFRleHQoKTp2b2lkXG4vL1x0XHR7XG4vL1x0XHRcdHRleHQgPSBuZXcgVGV4dEZpZWxkKCk7XG4vL1x0XHRcdHRleHQuZGVmYXVsdFRleHRGb3JtYXQgPSBuZXcgVGV4dEZvcm1hdChcIlZlcmRhbmFcIiwgMTEsIDB4RkZGRkZGKTtcbi8vXHRcdFx0dGV4dC53aWR0aCA9IDI0MDtcbi8vXHRcdFx0dGV4dC5oZWlnaHQgPSAxMDA7XG4vL1x0XHRcdHRleHQuc2VsZWN0YWJsZSA9IGZhbHNlO1xuLy9cdFx0XHR0ZXh0Lm1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuLy9cdFx0XHR0ZXh0LnRleHQgPSBcIkN1cnNvciBrZXlzIC8gV1NBRCAtIG1vdmVcXG5cIjtcbi8vXHRcdFx0dGV4dC5hcHBlbmRUZXh0KFwiU0hJRlQgLSBob2xkIGRvd24gdG8gcnVuXFxuXCIpO1xuLy9cdFx0XHR0ZXh0LmFwcGVuZFRleHQoXCJudW1iZXJzIDEtOSAtIEF0dGFja1xcblwiKTtcbi8vXHRcdFx0dGV4dC5maWx0ZXJzID0gW25ldyBEcm9wU2hhZG93RmlsdGVyKDEsIDQ1LCAweDAsIDEsIDAsIDApXTtcbi8vXG4vL1x0XHRcdGFkZENoaWxkKHRleHQpO1xuLy9cdFx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbnRpdGllc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKCk6dm9pZFxuXHR7XG5cdFx0Ly9jcmVhdGUgYSBsaWdodCBmb3Igc2hhZG93cyB0aGF0IG1pbWljcyB0aGUgc3VuJ3MgcG9zaXRpb24gaW4gdGhlIHNreWJveFxuXHRcdHRoaXMucmVkTGlnaHQgPSBuZXcgUG9pbnRMaWdodCgpO1xuXHRcdHRoaXMucmVkTGlnaHQueCA9IC0xMDAwO1xuXHRcdHRoaXMucmVkTGlnaHQueSA9IDIwMDtcblx0XHR0aGlzLnJlZExpZ2h0LnogPSAtMTQwMDtcblx0XHR0aGlzLnJlZExpZ2h0LmNvbG9yID0gMHhmZjExMTE7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnJlZExpZ2h0KTtcblxuXHRcdHRoaXMuYmx1ZUxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHR0aGlzLmJsdWVMaWdodC54ID0gMTAwMDtcblx0XHR0aGlzLmJsdWVMaWdodC55ID0gMjAwO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LnogPSAxNDAwO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LmNvbG9yID0gMHgxMTExZmY7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLmJsdWVMaWdodCk7XG5cblx0XHR0aGlzLndoaXRlTGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgtNTAsIC0yMCwgMTApO1xuXHRcdHRoaXMud2hpdGVMaWdodC5jb2xvciA9IDB4ZmZmZmVlO1xuXHRcdHRoaXMud2hpdGVMaWdodC5jYXN0c1NoYWRvd3MgPSB0cnVlO1xuXHRcdHRoaXMud2hpdGVMaWdodC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLndoaXRlTGlnaHQuYW1iaWVudENvbG9yID0gMHgzMDMwNDA7XG5cdFx0dGhpcy53aGl0ZUxpZ2h0LnNoYWRvd01hcHBlciA9IG5ldyBOZWFyRGlyZWN0aW9uYWxTaGFkb3dNYXBwZXIoLjIpO1xuXHRcdHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy53aGl0ZUxpZ2h0KTtcblxuXHRcdHRoaXMubGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIoW3RoaXMucmVkTGlnaHQsIHRoaXMuYmx1ZUxpZ2h0LCB0aGlzLndoaXRlTGlnaHRdKTtcblxuXG5cdFx0Ly9jcmVhdGUgYSBnbG9iYWwgc2hhZG93IG1ldGhvZFxuXHRcdHRoaXMuc2hhZG93TWFwTWV0aG9kID0gbmV3IFNoYWRvd05lYXJNZXRob2QobmV3IFNoYWRvd1NvZnRNZXRob2QodGhpcy53aGl0ZUxpZ2h0LCAxNSwgOCkpO1xuXHRcdHRoaXMuc2hhZG93TWFwTWV0aG9kLmVwc2lsb24gPSAuMTtcblxuXHRcdC8vY3JlYXRlIGEgZ2xvYmFsIGZvZyBtZXRob2Rcblx0XHR0aGlzLmZvZ01ldGhvZCA9IG5ldyBFZmZlY3RGb2dNZXRob2QoMCwgdGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIqMC41LCAweDAwMDAwMCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbWF0ZXJpYWxzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRNYXRlcmlhbHMoKTp2b2lkXG5cdHtcblx0XHQvL3JlZCBsaWdodCBtYXRlcmlhbFxuXHRcdHRoaXMucmVkTGlnaHRNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5yZWRMaWdodE1hdGVyaWFsLmFscGhhQmxlbmRpbmcgPSB0cnVlO1xuXHRcdHRoaXMucmVkTGlnaHRNYXRlcmlhbC5hZGRFZmZlY3RNZXRob2QodGhpcy5mb2dNZXRob2QpO1xuXG5cdFx0Ly9ibHVlIGxpZ2h0IG1hdGVyaWFsXG5cdFx0dGhpcy5ibHVlTGlnaHRNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5ibHVlTGlnaHRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmJsdWVMaWdodE1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCh0aGlzLmZvZ01ldGhvZCk7XG5cblx0XHQvL2dyb3VuZCBtYXRlcmlhbFxuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc21vb3RoID0gdHJ1ZTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zaGFkb3dNZXRob2QgPSB0aGlzLnNoYWRvd01hcE1ldGhvZDtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCh0aGlzLmZvZ01ldGhvZCk7XG5cblx0XHQvL2JvZHkgbWF0ZXJpYWxcblx0XHR0aGlzLmJvZHlNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5ib2R5TWF0ZXJpYWwuZ2xvc3MgPSAyMDtcblx0XHR0aGlzLmJvZHlNYXRlcmlhbC5zcGVjdWxhciA9IDEuNTtcblx0XHR0aGlzLmJvZHlNYXRlcmlhbC5hZGRFZmZlY3RNZXRob2QodGhpcy5mb2dNZXRob2QpO1xuXHRcdHRoaXMuYm9keU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmJvZHlNYXRlcmlhbC5zaGFkb3dNZXRob2QgPSB0aGlzLnNoYWRvd01hcE1ldGhvZDtcblxuXHRcdC8vZ29iIG1hdGVyaWFsXG5cdFx0dGhpcy5nb2JNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5nb2JNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmdvYk1hdGVyaWFsLnNtb290aCA9IHRydWU7XG5cdFx0dGhpcy5nb2JNYXRlcmlhbC5yZXBlYXQgPSB0cnVlO1xuXHRcdHRoaXMuZ29iTWF0ZXJpYWwuYW5pbWF0ZVVWcyA9IHRydWU7XG5cdFx0dGhpcy5nb2JNYXRlcmlhbC5hZGRFZmZlY3RNZXRob2QodGhpcy5mb2dNZXRob2QpO1xuXHRcdHRoaXMuZ29iTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuZ29iTWF0ZXJpYWwuc2hhZG93TWV0aG9kID0gdGhpcy5zaGFkb3dNYXBNZXRob2Q7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgc2NlbmUgb2JqZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0T2JqZWN0cygpOnZvaWRcblx0e1xuXHRcdC8vY3JlYXRlIGxpZ2h0IGJpbGxib2FyZHNcblx0XHR2YXIgcmVkU3ByaXRlOkJpbGxib2FyZCA9IG5ldyBCaWxsYm9hcmQodGhpcy5yZWRMaWdodE1hdGVyaWFsKTtcblx0XHRyZWRTcHJpdGUud2lkdGggPSAyMDA7XG5cdFx0cmVkU3ByaXRlLmhlaWdodCA9IDIwMDtcblx0XHRyZWRTcHJpdGUuY2FzdHNTaGFkb3dzID0gZmFsc2U7XG5cdFx0dmFyIGJsdWVTcHJpdGU6QmlsbGJvYXJkID0gbmV3IEJpbGxib2FyZCh0aGlzLmJsdWVMaWdodE1hdGVyaWFsKTtcblx0XHRibHVlU3ByaXRlLndpZHRoID0gMjAwO1xuXHRcdGJsdWVTcHJpdGUuaGVpZ2h0ID0gMjAwO1xuXHRcdGJsdWVTcHJpdGUuY2FzdHNTaGFkb3dzID0gZmFsc2U7XG5cdFx0dGhpcy5yZWRMaWdodC5hZGRDaGlsZChyZWRTcHJpdGUpO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LmFkZENoaWxkKGJsdWVTcHJpdGUpO1xuXG5cdFx0QXNzZXRMaWJyYXJ5LmVuYWJsZVBhcnNlcihNRDVNZXNoUGFyc2VyKTtcblx0XHRBc3NldExpYnJhcnkuZW5hYmxlUGFyc2VyKE1ENUFuaW1QYXJzZXIpO1xuXG5cdFx0Ly9jcmVhdGUgYSByb2NreSBncm91bmQgcGxhbmVcblx0XHR0aGlzLmdyb3VuZCA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlUGxhbmVQcmVmYWIoNTAwMDAsIDUwMDAwLCAxLCAxKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmdyb3VuZC5tYXRlcmlhbCA9IHRoaXMuZ3JvdW5kTWF0ZXJpYWw7XG5cdFx0dGhpcy5ncm91bmQuZ2VvbWV0cnkuc2NhbGVVVigyMDAsIDIwMCk7XG5cdFx0dGhpcy5ncm91bmQuY2FzdHNTaGFkb3dzID0gZmFsc2U7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLmdyb3VuZCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlzdGVuZXJzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaXN0ZW5lcnMoKTp2b2lkXG5cdHtcblx0XHR3aW5kb3cub25yZXNpemUgID0gKGV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleWRvd24gPSAoZXZlbnQpID0+IHRoaXMub25LZXlEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleXVwID0gKGV2ZW50KSA9PiB0aGlzLm9uS2V5VXAoZXZlbnQpO1xuXG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXG5cdFx0dGhpcy5fdGltZXIgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25FbnRlckZyYW1lLCB0aGlzKTtcblx0XHR0aGlzLl90aW1lci5zdGFydCgpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vbG9hZCBoZWxsa25pZ2h0IG1lc2hcblx0XHRBc3NldExpYnJhcnkuYWRkRXZlbnRMaXN0ZW5lcihBc3NldEV2ZW50LkFTU0VUX0NPTVBMRVRFLCAoZXZlbnQ6QXNzZXRFdmVudCkgPT4gdGhpcy5vbkFzc2V0Q29tcGxldGUoZXZlbnQpKTtcblx0XHRBc3NldExpYnJhcnkuYWRkRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgKGV2ZW50OkxvYWRlckV2ZW50KSA9PiB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2hlbGxrbmlnaHQvaGVsbGtuaWdodC5tZDVtZXNoXCIpLCBudWxsLCBudWxsLCBuZXcgTUQ1TWVzaFBhcnNlcigpKTtcblxuXHRcdC8vbG9hZCBlbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvc2t5Ym94L2dyaW1uaWdodF90ZXh0dXJlLmN1YmVcIiksIGFzc2V0TG9hZGVyQ29udGV4dCk7XG5cblx0XHQvL2xvYWQgbGlnaHQgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9yZWRsaWdodC5wbmdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2JsdWVsaWdodC5wbmdcIikpO1xuXG5cdFx0Ly9sb2FkIGZsb29yIHRleHR1cmVzXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvcm9ja2Jhc2VfZGlmZnVzZS5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3JvY2tiYXNlX25vcm1hbHMucG5nXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9yb2NrYmFzZV9zcGVjdWxhci5wbmdcIikpO1xuXG5cdFx0Ly9sb2FkIGhlbGxrbmlnaHQgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9oZWxsa25pZ2h0L2hlbGxrbmlnaHRfZGlmZnVzZS5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2hlbGxrbmlnaHQvaGVsbGtuaWdodF9ub3JtYWxzLnBuZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvaGVsbGtuaWdodC9oZWxsa25pZ2h0X3NwZWN1bGFyLnBuZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvaGVsbGtuaWdodC9nb2IucG5nXCIpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0aW9uIGFuZCByZW5kZXIgbG9vcFxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZHQ6bnVtYmVyKTp2b2lkXG5cdHtcblx0XHR0aGlzLl90aW1lICs9IGR0O1xuXG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnVwZGF0ZSgpO1xuXG5cdFx0Ly91cGRhdGUgY2hhcmFjdGVyIGFuaW1hdGlvblxuXHRcdGlmICh0aGlzLm1lc2gpIHtcblx0XHRcdHRoaXMubWVzaC5zdWJNZXNoZXNbMV0udXZUcmFuc2Zvcm0ub2Zmc2V0ViA9IHRoaXMubWVzaC5zdWJNZXNoZXNbMl0udXZUcmFuc2Zvcm0ub2Zmc2V0ViA9IHRoaXMubWVzaC5zdWJNZXNoZXNbM10udXZUcmFuc2Zvcm0ub2Zmc2V0ViA9ICgtdGhpcy5fdGltZS8yMDAwICUgMSk7XG5cdFx0XHR0aGlzLm1lc2gucm90YXRpb25ZICs9IHRoaXMuY3VycmVudFJvdGF0aW9uSW5jO1xuXHRcdH1cblxuXHRcdHRoaXMuY291bnQgKz0gMC4wMTtcblxuXHRcdHRoaXMucmVkTGlnaHQueCA9IE1hdGguc2luKHRoaXMuY291bnQpKjE1MDA7XG5cdFx0dGhpcy5yZWRMaWdodC55ID0gMjUwICsgTWF0aC5zaW4odGhpcy5jb3VudCowLjU0KSoyMDA7XG5cdFx0dGhpcy5yZWRMaWdodC56ID0gTWF0aC5jb3ModGhpcy5jb3VudCowLjcpKjE1MDA7XG5cdFx0dGhpcy5ibHVlTGlnaHQueCA9IC1NYXRoLnNpbih0aGlzLmNvdW50KjAuOCkqMTUwMDtcblx0XHR0aGlzLmJsdWVMaWdodC55ID0gMjUwIC0gTWF0aC5zaW4odGhpcy5jb3VudCouNjUpKjIwMDtcblx0XHR0aGlzLmJsdWVMaWdodC56ID0gLU1hdGguY29zKHRoaXMuY291bnQqMC45KSoxNTAwO1xuXG5cdFx0dGhpcy52aWV3LnJlbmRlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlKGV2ZW50OkFzc2V0RXZlbnQpOnZvaWRcblx0e1xuXHRcdGlmIChldmVudC5hc3NldC5hc3NldFR5cGUgPT0gQXNzZXRUeXBlLkFOSU1BVElPTl9OT0RFKSB7XG5cblx0XHRcdHZhciBub2RlOlNrZWxldG9uQ2xpcE5vZGUgPSA8U2tlbGV0b25DbGlwTm9kZT4gZXZlbnQuYXNzZXQ7XG5cdFx0XHR2YXIgbmFtZTpzdHJpbmcgPSBldmVudC5hc3NldC5hc3NldE5hbWVzcGFjZTtcblxuXHRcdFx0bm9kZS5uYW1lID0gbmFtZTtcblx0XHRcdHRoaXMuYW5pbWF0aW9uU2V0LmFkZEFuaW1hdGlvbihub2RlKTtcblxuXHRcdFx0aWYgKG5hbWUgPT0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX05BTUUgfHwgbmFtZSA9PSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfTkFNRSkge1xuXHRcdFx0XHRub2RlLmxvb3BpbmcgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9kZS5sb29waW5nID0gZmFsc2U7XG5cdFx0XHRcdG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihBbmltYXRpb25TdGF0ZUV2ZW50LlBMQVlCQUNLX0NPTVBMRVRFLCAoZXZlbnQ6QW5pbWF0aW9uU3RhdGVFdmVudCkgPT4gdGhpcy5vblBsYXliYWNrQ29tcGxldGUoZXZlbnQpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5hbWUgPT0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX05BTUUpXG5cdFx0XHRcdHRoaXMuc3RvcCgpO1xuXHRcdH0gZWxzZSBpZiAoZXZlbnQuYXNzZXQuYXNzZXRUeXBlID09IEFzc2V0VHlwZS5BTklNQVRJT05fU0VUKSB7XG5cdFx0XHR0aGlzLmFuaW1hdGlvblNldCA9IDxTa2VsZXRvbkFuaW1hdGlvblNldD4gZXZlbnQuYXNzZXQ7XG5cdFx0XHR0aGlzLmFuaW1hdG9yID0gbmV3IFNrZWxldG9uQW5pbWF0b3IodGhpcy5hbmltYXRpb25TZXQsIHRoaXMuc2tlbGV0b24pO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgLyp1aW50Ki8gPSAwOyBpIDwgSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5BTklNX05BTUVTLmxlbmd0aDsgKytpKVxuXHRcdFx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9oZWxsa25pZ2h0L1wiICsgSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5BTklNX05BTUVTW2ldICsgXCIubWQ1YW5pbVwiKSwgbnVsbCwgSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5BTklNX05BTUVTW2ldLCBuZXcgTUQ1QW5pbVBhcnNlcigpKTtcblxuXHRcdFx0dGhpcy5tZXNoLmFuaW1hdG9yID0gdGhpcy5hbmltYXRvcjtcblx0XHR9IGVsc2UgaWYgKGV2ZW50LmFzc2V0LmFzc2V0VHlwZSA9PSBBc3NldFR5cGUuU0tFTEVUT04pIHtcblx0XHRcdHRoaXMuc2tlbGV0b24gPSA8U2tlbGV0b24+IGV2ZW50LmFzc2V0O1xuXHRcdH0gZWxzZSBpZiAoZXZlbnQuYXNzZXQuYXNzZXRUeXBlID09IEFzc2V0VHlwZS5NRVNIKSB7XG5cdFx0XHQvL2dyYWIgbWVzaCBvYmplY3QgYW5kIGFzc2lnbiBvdXIgbWF0ZXJpYWwgb2JqZWN0XG5cdFx0XHR0aGlzLm1lc2ggPSA8TWVzaD4gZXZlbnQuYXNzZXQ7XG5cdFx0XHR0aGlzLm1lc2guc3ViTWVzaGVzWzBdLm1hdGVyaWFsID0gdGhpcy5ib2R5TWF0ZXJpYWw7XG5cdFx0XHR0aGlzLm1lc2guc3ViTWVzaGVzWzFdLm1hdGVyaWFsID0gdGhpcy5tZXNoLnN1Yk1lc2hlc1syXS5tYXRlcmlhbCA9IHRoaXMubWVzaC5zdWJNZXNoZXNbM10ubWF0ZXJpYWwgPSB0aGlzLmdvYk1hdGVyaWFsO1xuXHRcdFx0dGhpcy5tZXNoLmNhc3RzU2hhZG93cyA9IHRydWU7XG5cdFx0XHR0aGlzLm1lc2gucm90YXRpb25ZID0gMTgwO1xuXHRcdFx0dGhpcy5tZXNoLnN1Yk1lc2hlc1sxXS51dlRyYW5zZm9ybSA9IHRoaXMubWVzaC5zdWJNZXNoZXNbMl0udXZUcmFuc2Zvcm0gPSB0aGlzLm1lc2guc3ViTWVzaGVzWzNdLnV2VHJhbnNmb3JtID0gbmV3IFVWVHJhbnNmb3JtKCk7XG5cdFx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMubWVzaCk7XG5cblx0XHRcdC8vYWRkIG91ciBsb29rYXQgb2JqZWN0IHRvIHRoZSBtZXNoXG5cdFx0XHR0aGlzLm1lc2guYWRkQ2hpbGQodGhpcy5wbGFjZUhvbGRlcik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZ1bmN0aW9uIGZvciByZXNvdXJjZSBjb21wbGV0ZSBldmVudCBvbiBhc3NldCBsaWJyYXJ5XG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZSAoZXZlbnQ6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2goIGV2ZW50LnVybCApXG5cdFx0e1xuXHRcdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L2dyaW1uaWdodF90ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHR0aGlzLmN1YmVUZXh0dXJlID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXG5cdFx0XHRcdHRoaXMuc2t5Qm94ID0gbmV3IFNreWJveChuZXcgU2t5Ym94TWF0ZXJpYWwodGhpcy5jdWJlVGV4dHVyZSkpO1xuXHRcdFx0XHQvL3RoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5za3lCb3gpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9lbnRpdGllcyB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9yZWRsaWdodC5wbmdcIiA6XG5cdFx0XHRcdHRoaXMucmVkTGlnaHRNYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9ibHVlbGlnaHQucG5nXCIgOlxuXHRcdFx0XHR0aGlzLmJsdWVMaWdodE1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdC8vZmxvb3IgdGV4dHVyZXNcblx0XHRcdGNhc2UgXCJhc3NldHMvcm9ja2Jhc2VfZGlmZnVzZS5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwudGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvcm9ja2Jhc2Vfbm9ybWFscy5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwubm9ybWFsTWFwID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9yb2NrYmFzZV9zcGVjdWxhci5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdC8vaGVsbGtuaWdodCB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9oZWxsa25pZ2h0L2hlbGxrbmlnaHRfZGlmZnVzZS5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuYm9keU1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2hlbGxrbmlnaHQvaGVsbGtuaWdodF9ub3JtYWxzLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5ib2R5TWF0ZXJpYWwubm9ybWFsTWFwID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9oZWxsa25pZ2h0L2hlbGxrbmlnaHRfc3BlY3VsYXIucG5nXCIgOlxuXHRcdFx0XHR0aGlzLmJvZHlNYXRlcmlhbC5zcGVjdWxhck1hcCA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvaGVsbGtuaWdodC9nb2IucG5nXCIgOlxuXHRcdFx0XHR0aGlzLmJvZHlNYXRlcmlhbC5zcGVjdWxhck1hcCA9IHRoaXMuZ29iTWF0ZXJpYWwudGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIG9uUGxheWJhY2tDb21wbGV0ZShldmVudDpBbmltYXRpb25TdGF0ZUV2ZW50KTp2b2lkXG5cdHtcblx0XHRpZiAodGhpcy5hbmltYXRvci5hY3RpdmVTdGF0ZSAhPSBldmVudC5hbmltYXRpb25TdGF0ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMub25jZUFuaW0gPSBudWxsO1xuXG5cdFx0dGhpcy5hbmltYXRvci5wbGF5KHRoaXMuY3VycmVudEFuaW0sIHRoaXMuc3RhdGVUcmFuc2l0aW9uKTtcblx0XHR0aGlzLmFuaW1hdG9yLnBsYXliYWNrU3BlZWQgPSB0aGlzLmlzTW92aW5nPyB0aGlzLm1vdmVtZW50RGlyZWN0aW9uKih0aGlzLmlzUnVubmluZz8gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5SVU5fU1BFRUQgOiBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfU1BFRUQpIDogSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX1NQRUVEO1xuXHR9XG5cblx0cHJpdmF0ZSBwbGF5QWN0aW9uKHZhbDpudW1iZXIgLyp1aW50Ki8pOnZvaWRcblx0e1xuXHRcdHRoaXMub25jZUFuaW0gPSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLkFOSU1fTkFNRVNbdmFsICsgMl07XG5cdFx0dGhpcy5hbmltYXRvci5wbGF5YmFja1NwZWVkID0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5BQ1RJT05fU1BFRUQ7XG5cdFx0dGhpcy5hbmltYXRvci5wbGF5KHRoaXMub25jZUFuaW0sIHRoaXMuc3RhdGVUcmFuc2l0aW9uLCAwKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBLZXkgdXAgbGlzdGVuZXJcblx0ICovXG5cdHByaXZhdGUgb25LZXlEb3duKGV2ZW50KTp2b2lkXG5cdHtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgS2V5Ym9hcmQuU0hJRlQ6XG5cdFx0XHRcdHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcblx0XHRcdFx0aWYgKHRoaXMuaXNNb3ZpbmcpXG5cdFx0XHRcdFx0dGhpcy51cGRhdGVNb3ZlbWVudCh0aGlzLm1vdmVtZW50RGlyZWN0aW9uKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlVQOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5XOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5aOiAvL2ZyXG5cdFx0XHRcdHRoaXMudXBkYXRlTW92ZW1lbnQodGhpcy5tb3ZlbWVudERpcmVjdGlvbiA9IDEpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy51cGRhdGVNb3ZlbWVudCh0aGlzLm1vdmVtZW50RGlyZWN0aW9uID0gLTEpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTEVGVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuQTpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUTogLy9mclxuXHRcdFx0XHR0aGlzLmN1cnJlbnRSb3RhdGlvbkluYyA9IC1JbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLlJPVEFUSU9OX1NQRUVEO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuY3VycmVudFJvdGF0aW9uSW5jID0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5ST1RBVElPTl9TUEVFRDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBhbmltYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25LZXlVcChldmVudCk6dm9pZFxuXHR7XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlNISUZUOlxuXHRcdFx0XHR0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXHRcdFx0XHRpZiAodGhpcy5pc01vdmluZylcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZU1vdmVtZW50KHRoaXMubW92ZW1lbnREaXJlY3Rpb24pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVVA6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlc6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlo6IC8vZnJcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5zdG9wKCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5ROiAvL2ZyXG5cdFx0XHRjYXNlIEtleWJvYXJkLlJJR0hUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5EOlxuXHRcdFx0XHR0aGlzLmN1cnJlbnRSb3RhdGlvbkluYyA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5OVU1CRVJfMTpcblx0XHRcdFx0dGhpcy5wbGF5QWN0aW9uKDEpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTlVNQkVSXzI6XG5cdFx0XHRcdHRoaXMucGxheUFjdGlvbigyKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLk5VTUJFUl8zOlxuXHRcdFx0XHR0aGlzLnBsYXlBY3Rpb24oMyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5OVU1CRVJfNDpcblx0XHRcdFx0dGhpcy5wbGF5QWN0aW9uKDQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTlVNQkVSXzU6XG5cdFx0XHRcdHRoaXMucGxheUFjdGlvbig1KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLk5VTUJFUl82OlxuXHRcdFx0XHR0aGlzLnBsYXlBY3Rpb24oNik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5OVU1CRVJfNzpcblx0XHRcdFx0dGhpcy5wbGF5QWN0aW9uKDcpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTlVNQkVSXzg6XG5cdFx0XHRcdHRoaXMucGxheUFjdGlvbig4KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLk5VTUJFUl85OlxuXHRcdFx0XHR0aGlzLnBsYXlBY3Rpb24oOSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlTW92ZW1lbnQoZGlyOm51bWJlcik6dm9pZFxuXHR7XG5cdFx0dGhpcy5pc01vdmluZyA9IHRydWU7XG5cdFx0dGhpcy5hbmltYXRvci5wbGF5YmFja1NwZWVkID0gZGlyKih0aGlzLmlzUnVubmluZz8gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5SVU5fU1BFRUQgOiBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfU1BFRUQpO1xuXG5cdFx0aWYgKHRoaXMuY3VycmVudEFuaW0gPT0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5XQUxLX05BTUUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLmN1cnJlbnRBbmltID0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5XQUxLX05BTUU7XG5cblx0XHRpZiAodGhpcy5vbmNlQW5pbSlcblx0XHRcdHJldHVybjtcblxuXHRcdC8vdXBkYXRlIGFuaW1hdG9yXG5cdFx0dGhpcy5hbmltYXRvci5wbGF5KHRoaXMuY3VycmVudEFuaW0sIHRoaXMuc3RhdGVUcmFuc2l0aW9uKTtcblx0fVxuXG5cdHByaXZhdGUgc3RvcCgpOnZvaWRcblx0e1xuXHRcdHRoaXMuaXNNb3ZpbmcgPSBmYWxzZTtcblxuXHRcdGlmICh0aGlzLmN1cnJlbnRBbmltID09IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uSURMRV9OQU1FKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5jdXJyZW50QW5pbSA9IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uSURMRV9OQU1FO1xuXG5cdFx0aWYgKHRoaXMub25jZUFuaW0pXG5cdFx0XHRyZXR1cm47XG5cblx0XHQvL3VwZGF0ZSBhbmltYXRvclxuXHRcdHRoaXMuYW5pbWF0b3IucGxheWJhY2tTcGVlZCA9IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uSURMRV9TUEVFRDtcblx0XHR0aGlzLmFuaW1hdG9yLnBsYXkodGhpcy5jdXJyZW50QW5pbSwgdGhpcy5zdGF0ZVRyYW5zaXRpb24pO1xuXHR9XG5cblx0LyoqXG5cdCAqIHN0YWdlIGxpc3RlbmVyIGZvciByZXNpemUgZXZlbnRzXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzaXplKGV2ZW50OkV2ZW50ID0gbnVsbCk6dm9pZFxuXHR7XG5cdFx0dGhpcy52aWV3LndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy52aWV3LmhlaWdodCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0fVxufVxuXG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuXHRuZXcgSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbigpO1xufVxuXG4iXX0=