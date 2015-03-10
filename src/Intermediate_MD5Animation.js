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
var AnimationSetBase = require("awayjs-renderergl/lib/animators/AnimationSetBase");
var SkeletonAnimator = require("awayjs-renderergl/lib/animators/SkeletonAnimator");
var Skeleton = require("awayjs-renderergl/lib/animators/data/Skeleton");
var CrossfadeTransition = require("awayjs-renderergl/lib/animators/transitions/CrossfadeTransition");
var AnimationStateEvent = require("awayjs-renderergl/lib/events/AnimationStateEvent");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
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
        this.view = new View(new DefaultRenderer(MethodRendererPool));
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
        this.groundMaterial.smooth = true;
        this.groundMaterial.repeat = true;
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.shadowMethod = this.shadowMapMethod;
        this.groundMaterial.addEffectMethod(this.fogMethod);
        //body material
        this.bodyMaterial = new MethodMaterial();
        this.bodyMaterial.gloss = 20;
        this.bodyMaterial.specular = 1.5;
        this.bodyMaterial.addEffectMethod(this.fogMethod);
        this.bodyMaterial.lightPicker = this.lightPicker;
        this.bodyMaterial.shadowMethod = this.shadowMapMethod;
        //gob material
        this.gobMaterial = new MethodMaterial();
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
                this.skyBox = new Skybox(this.cubeTexture);
                this.scene.addChild(this.skyBox);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLnRzIl0sIm5hbWVzIjpbIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24iLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0IiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0RW5naW5lIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0TWF0ZXJpYWxzIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5pbml0T2JqZWN0cyIsIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24ub25FbnRlckZyYW1lIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5vbkFzc2V0Q29tcGxldGUiLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24ub25QbGF5YmFja0NvbXBsZXRlIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5wbGF5QWN0aW9uIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5vbktleURvd24iLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLm9uS2V5VXAiLCJJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLnVwZGF0ZU1vdmVtZW50IiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5zdG9wIiwiSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5vblJlc2l6ZSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBc0NFO0FBRUYsSUFBTyxVQUFVLFdBQWUsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFdBQVcsV0FBZSxvQ0FB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QUFDQUEseUVBRHlFQTtRQUN6RUEsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDakNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUN0QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDeEJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBO1FBQy9CQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQTtRQUVuQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsSUFBSUEsVUFBVUEsRUFBRUEsQ0FBQ0E7UUFDbENBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3hCQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUN2QkEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDeEJBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ2hDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUVwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsZ0JBQWdCQSxDQUFDQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNyREEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDakNBLElBQUlBLENBQUNB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QSxDQUFDQTtRQUVuQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDNUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUNBLElBQUlBLENBQUNBLEdBQUNBLEdBQUdBLENBQUNBO1FBQ3REQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFDQSxHQUFHQSxDQUFDQSxHQUFDQSxJQUFJQSxDQUFDQTtRQUNoREEsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBQ0EsR0FBR0EsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDbERBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEdBQUNBLEdBQUdBLENBQUNBLEdBQUNBLEdBQUdBLENBQUNBO1FBQ3REQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFDQSxHQUFHQSxDQUFDQSxHQUFDQSxJQUFJQSxDQUFDQTtRQUVsREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7SUFDcEJBLENBQUNBO0lBRURSOztPQUVHQTtJQUNLQSxtREFBZUEsR0FBdkJBLFVBQXdCQSxLQUFnQkE7UUFBeENTLGlCQXlDQ0E7UUF2Q0FBLEVBQUVBLENBQUNB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QSxHQUFVQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQTtZQUMvQkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7WUFDcERBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBO1lBQ3ZIQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQTtZQUM5QkEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0E7WUFDMUJBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLEdBQUdBLElBQUlBLFdBQVdBLEVBQUVBLENBQUNBO1lBQ2pJQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUUvQkEsQUFDQUEsbUNBRG1DQTtZQUNuQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDdENBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURUOztPQUVH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QUNBLENBQUNBLENBQUNBO2dCQUNuQkEsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsUUFBUUEsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLFFBQVFBLENBQUNBLFFBQVFBO2dCQUNyQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSxRQUFRQSxDQUFDQSxRQUFRQTtnQkFDckJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsUUFBUUEsQ0FBQ0EsUUFBUUE7Z0JBQ3JCQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkJBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLFFBQVFBLENBQUNBLFFBQVFBO2dCQUNyQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25CQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSxRQUFRQSxDQUFDQSxRQUFRQTtnQkFDckJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUNuQkEsS0FBS0EsQ0FBQ0E7UUFDUkEsQ0FBQ0E7SUFDRkEsQ0FBQ0E7SUFFT2Qsa0RBQWNBLEdBQXRCQSxVQUF1QkEsR0FBVUE7UUFFaENlLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBO1FBQ3JCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxhQUFhQSxHQUFHQSxHQUFHQSxHQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFFQSx5QkFBeUJBLENBQUNBLFNBQVNBLEdBQUdBLHlCQUF5QkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFL0hBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLElBQUlBLHlCQUF5QkEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7WUFDM0RBLE1BQU1BLENBQUNBO1FBRVJBLElBQUlBLENBQUNBLFdBQVdBLEdBQUdBLHlCQUF5QkEsQ0FBQ0EsU0FBU0EsQ0FBQ0E7UUFFdkRBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBO1lBQ2pCQSxNQUFNQSxDQUFDQTtRQUVSQSxBQUNBQSxpQkFEaUJBO1FBQ2pCQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUM1REEsQ0FBQ0E7SUFFT2Ysd0NBQUlBLEdBQVpBO1FBRUNnQixJQUFJQSxDQUFDQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQTtRQUV0QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsSUFBSUEseUJBQXlCQSxDQUFDQSxTQUFTQSxDQUFDQTtZQUMzREEsTUFBTUEsQ0FBQ0E7UUFFUkEsSUFBSUEsQ0FBQ0EsV0FBV0EsR0FBR0EseUJBQXlCQSxDQUFDQSxTQUFTQSxDQUFDQTtRQUV2REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0E7WUFDakJBLE1BQU1BLENBQUNBO1FBRVJBLEFBQ0FBLGlCQURpQkE7UUFDakJBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGFBQWFBLEdBQUdBLHlCQUF5QkEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDbkVBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEVBQUVBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO0lBQzVEQSxDQUFDQTtJQUVEaEI7O09BRUdBO0lBQ0tBLDRDQUFRQSxHQUFoQkEsVUFBaUJBLEtBQWtCQTtRQUFsQmlCLHFCQUFrQkEsR0FBbEJBLFlBQWtCQTtRQUVsQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0E7UUFDcENBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLEdBQUdBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3ZDQSxDQUFDQTtJQW5nQkRqQixxQkFBcUJBO0lBQ05BLG1DQUFTQSxHQUFVQSxPQUFPQSxDQUFDQTtJQUMzQkEsbUNBQVNBLEdBQVVBLE9BQU9BLENBQUNBO0lBQzNCQSxvQ0FBVUEsR0FBaUJBLElBQUlBLEtBQUtBLENBQVNBLHlCQUF5QkEsQ0FBQ0EsU0FBU0EsRUFBRUEseUJBQXlCQSxDQUFDQSxTQUFTQSxFQUFFQSxTQUFTQSxFQUFFQSxlQUFlQSxFQUFFQSxTQUFTQSxFQUFFQSxPQUFPQSxFQUFFQSxPQUFPQSxFQUFFQSxXQUFXQSxFQUFFQSxVQUFVQSxFQUFFQSxPQUFPQSxFQUFFQSxhQUFhQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtJQUNsUEEsd0NBQWNBLEdBQVVBLENBQUNBLENBQUNBO0lBQzFCQSxtQ0FBU0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7SUFDckJBLG9DQUFVQSxHQUFVQSxDQUFDQSxDQUFDQTtJQUN0QkEsb0NBQVVBLEdBQVVBLENBQUNBLENBQUNBO0lBQ3RCQSxzQ0FBWUEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7SUE0ZnhDQSxnQ0FBQ0E7QUFBREEsQ0F4aEJBLEFBd2hCQ0EsSUFBQTtBQUdELE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFFZixJQUFJLHlCQUF5QixFQUFFLENBQUM7QUFDakMsQ0FBQyxDQUFBIiwiZmlsZSI6IkludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzQ29udGVudCI6WyLvu78vKlxuXG5NRDUgYW5pbWF0aW9uIGxvYWRpbmcgYW5kIGludGVyYWN0aW9uIGV4YW1wbGUgaW4gQXdheTNkXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGxvYWQgTUQ1IG1lc2ggYW5kIGFuaW0gZmlsZXMgd2l0aCBib25lcyBhbmltYXRpb24gZnJvbSBlbWJlZGRlZCByZXNvdXJjZXMuXG5Ib3cgdG8gbWFwIGFuaW1hdGlvbiBkYXRhIGFmdGVyIGxvYWRpbmcgaW4gb3JkZXIgdG8gcGxheWJhY2sgYW4gYW5pbWF0aW9uIHNlcXVlbmNlLlxuSG93IHRvIGNvbnRyb2wgdGhlIG1vdmVtZW50IG9mIGEgZ2FtZSBjaGFyYWN0ZXIgdXNpbmcga2V5cy5cblxuQ29kZSBieSBSb2IgQmF0ZW1hbiAmIERhdmlkIExlbmFlcnRzXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuZGF2aWQubGVuYWVydHNAZ21haWwuY29tXG5odHRwOi8vd3d3LmRlcnNjaG1hbGUuY29tXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbmltcG9ydCBBc3NldEV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvQXNzZXRFdmVudFwiKTtcbmltcG9ydCBMb2FkZXJFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0xvYWRlckV2ZW50XCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgVVZUcmFuc2Zvcm1cdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVVZUcmFuc2Zvcm1cIik7XG5pbXBvcnQgQXNzZXRMaWJyYXJ5XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TGlicmFyeVwiKTtcbmltcG9ydCBBc3NldExvYWRlckNvbnRleHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlckNvbnRleHRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTFJlcXVlc3RcIik7XG5pbXBvcnQgS2V5Ym9hcmRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdWkvS2V5Ym9hcmRcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSW1hZ2VUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZVRleHR1cmVcIik7XG5pbXBvcnQgUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIik7XG5cbmltcG9ydCBBbmltYXRpb25Ob2RlQmFzZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9hbmltYXRvcnMvbm9kZXMvQW5pbWF0aW9uTm9kZUJhc2VcIik7XG5pbXBvcnQgRGlzcGxheU9iamVjdENvbnRhaW5lclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9EaXNwbGF5T2JqZWN0Q29udGFpbmVyXCIpO1xuaW1wb3J0IFNjZW5lXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvU2NlbmVcIik7XG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgTG9va0F0Q29udHJvbGxlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRyb2xsZXJzL0xvb2tBdENvbnRyb2xsZXJcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBCaWxsYm9hcmRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0JpbGxib2FyZFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Qb2ludExpZ2h0XCIpO1xuaW1wb3J0IFNreWJveFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgTmVhckRpcmVjdGlvbmFsU2hhZG93TWFwcGVyXHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL3NoYWRvd21hcHBlcnMvTmVhckRpcmVjdGlvbmFsU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9saWdodHBpY2tlcnMvU3RhdGljTGlnaHRQaWNrZXJcIik7XG5pbXBvcnQgUHJpbWl0aXZlUGxhbmVQcmVmYWJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVQbGFuZVByZWZhYlwiKTtcblxuaW1wb3J0IEFuaW1hdGlvblNldEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9hbmltYXRvcnMvQW5pbWF0aW9uU2V0QmFzZVwiKTtcbmltcG9ydCBTa2VsZXRvbkFuaW1hdGlvblNldFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9hbmltYXRvcnMvU2tlbGV0b25BbmltYXRpb25TZXRcIik7XG5pbXBvcnQgU2tlbGV0b25BbmltYXRvclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL2FuaW1hdG9ycy9Ta2VsZXRvbkFuaW1hdG9yXCIpO1xuaW1wb3J0IFNrZWxldG9uXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL2FuaW1hdG9ycy9kYXRhL1NrZWxldG9uXCIpO1xuaW1wb3J0IFNrZWxldG9uQ2xpcE5vZGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9hbmltYXRvcnMvbm9kZXMvU2tlbGV0b25DbGlwTm9kZVwiKTtcbmltcG9ydCBDcm9zc2ZhZGVUcmFuc2l0aW9uXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL2FuaW1hdG9ycy90cmFuc2l0aW9ucy9Dcm9zc2ZhZGVUcmFuc2l0aW9uXCIpO1xuaW1wb3J0IEFuaW1hdGlvblN0YXRlRXZlbnRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvZXZlbnRzL0FuaW1hdGlvblN0YXRlRXZlbnRcIik7XG5cbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9EZWZhdWx0UmVuZGVyZXJcIik7XG5cbmltcG9ydCBNZXRob2RNYXRlcmlhbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvTWV0aG9kTWF0ZXJpYWxcIik7XG5pbXBvcnQgTWV0aG9kUmVuZGVyZXJQb29sXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvcG9vbC9NZXRob2RSZW5kZXJlclBvb2xcIik7XG5pbXBvcnQgRWZmZWN0Rm9nTWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL0VmZmVjdEZvZ01ldGhvZFwiKTtcbmltcG9ydCBTaGFkb3dOZWFyTWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NoYWRvd05lYXJNZXRob2RcIik7XG5pbXBvcnQgU2hhZG93U29mdE1ldGhvZFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TaGFkb3dTb2Z0TWV0aG9kXCIpO1xuXG5pbXBvcnQgTUQ1QW5pbVBhcnNlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL01ENUFuaW1QYXJzZXJcIik7XG5pbXBvcnQgTUQ1TWVzaFBhcnNlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL01ENU1lc2hQYXJzZXJcIik7XG5cbmNsYXNzIEludGVybWVkaWF0ZV9NRDVBbmltYXRpb25cbntcblx0Ly9lbmdpbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgc2NlbmU6U2NlbmU7XG5cdHByaXZhdGUgY2FtZXJhOkNhbWVyYTtcblx0cHJpdmF0ZSB2aWV3OlZpZXc7XG5cdHByaXZhdGUgY2FtZXJhQ29udHJvbGxlcjpMb29rQXRDb250cm9sbGVyO1xuXG5cdC8vYW5pbWF0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIGFuaW1hdG9yOlNrZWxldG9uQW5pbWF0b3I7XG5cdHByaXZhdGUgYW5pbWF0aW9uU2V0OlNrZWxldG9uQW5pbWF0aW9uU2V0O1xuXHRwcml2YXRlIHN0YXRlVHJhbnNpdGlvbjpDcm9zc2ZhZGVUcmFuc2l0aW9uID0gbmV3IENyb3NzZmFkZVRyYW5zaXRpb24oMC41KTtcblx0cHJpdmF0ZSBza2VsZXRvbjpTa2VsZXRvbjtcblx0cHJpdmF0ZSBpc1J1bm5pbmc6Qm9vbGVhbjtcblx0cHJpdmF0ZSBpc01vdmluZzpCb29sZWFuO1xuXHRwcml2YXRlIG1vdmVtZW50RGlyZWN0aW9uOm51bWJlcjtcblx0cHJpdmF0ZSBvbmNlQW5pbTpzdHJpbmc7XG5cdHByaXZhdGUgY3VycmVudEFuaW06c3RyaW5nO1xuXHRwcml2YXRlIGN1cnJlbnRSb3RhdGlvbkluYzpudW1iZXIgPSAwO1xuXG5cdC8vYW5pbWF0aW9uIGNvbnN0YW50c1xuXHRwcml2YXRlIHN0YXRpYyBJRExFX05BTUU6c3RyaW5nID0gXCJpZGxlMlwiO1xuXHRwcml2YXRlIHN0YXRpYyBXQUxLX05BTUU6c3RyaW5nID0gXCJ3YWxrN1wiO1xuXHRwcml2YXRlIHN0YXRpYyBBTklNX05BTUVTOkFycmF5PHN0cmluZz4gPSBuZXcgQXJyYXk8c3RyaW5nPihJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLklETEVfTkFNRSwgSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5XQUxLX05BTUUsIFwiYXR0YWNrM1wiLCBcInR1cnJldF9hdHRhY2tcIiwgXCJhdHRhY2syXCIsIFwiY2hlc3RcIiwgXCJyb2FyMVwiLCBcImxlZnRzbGFzaFwiLCBcImhlYWRwYWluXCIsIFwicGFpbjFcIiwgXCJwYWluX2x1cGFybVwiLCBcInJhbmdlX2F0dGFjazJcIik7XG5cdHByaXZhdGUgc3RhdGljIFJPVEFUSU9OX1NQRUVEOm51bWJlciA9IDM7XG5cdHByaXZhdGUgc3RhdGljIFJVTl9TUEVFRDpudW1iZXIgPSAyO1xuXHRwcml2YXRlIHN0YXRpYyBXQUxLX1NQRUVEOm51bWJlciA9IDE7XG5cdHByaXZhdGUgc3RhdGljIElETEVfU1BFRUQ6bnVtYmVyID0gMTtcblx0cHJpdmF0ZSBzdGF0aWMgQUNUSU9OX1NQRUVEOm51bWJlciA9IDE7XG5cblx0Ly9saWdodCBvYmplY3RzXG5cdHByaXZhdGUgcmVkTGlnaHQ6UG9pbnRMaWdodDtcblx0cHJpdmF0ZSBibHVlTGlnaHQ6UG9pbnRMaWdodDtcblx0cHJpdmF0ZSB3aGl0ZUxpZ2h0OkRpcmVjdGlvbmFsTGlnaHQ7XG5cdHByaXZhdGUgbGlnaHRQaWNrZXI6U3RhdGljTGlnaHRQaWNrZXI7XG5cdHByaXZhdGUgc2hhZG93TWFwTWV0aG9kOlNoYWRvd05lYXJNZXRob2Q7XG5cdHByaXZhdGUgZm9nTWV0aG9kOkVmZmVjdEZvZ01ldGhvZDtcblx0cHJpdmF0ZSBjb3VudDpudW1iZXIgPSAwO1xuXG5cdC8vbWF0ZXJpYWwgb2JqZWN0c1xuXHRwcml2YXRlIHJlZExpZ2h0TWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgYmx1ZUxpZ2h0TWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgZ3JvdW5kTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgYm9keU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGdvYk1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGN1YmVUZXh0dXJlOkltYWdlQ3ViZVRleHR1cmU7XG5cblx0Ly9zY2VuZSBvYmplY3RzXG5cdHByaXZhdGUgcGxhY2VIb2xkZXI6RGlzcGxheU9iamVjdENvbnRhaW5lcjtcblx0cHJpdmF0ZSBtZXNoOk1lc2g7XG5cdHByaXZhdGUgZ3JvdW5kOk1lc2g7XG5cdHByaXZhdGUgc2t5Qm94OlNreWJveDtcblxuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHQvL3RoaXMuaW5pdFRleHQoKTtcblx0XHR0aGlzLmluaXRMaWdodHMoKTtcblx0XHR0aGlzLmluaXRNYXRlcmlhbHMoKTtcblx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKE1ldGhvZFJlbmRlcmVyUG9vbCkpO1xuXHRcdHRoaXMuc2NlbmUgPSB0aGlzLnZpZXcuc2NlbmU7XG5cdFx0dGhpcy5jYW1lcmEgPSB0aGlzLnZpZXcuY2FtZXJhO1xuXG5cdFx0dGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIgPSA1MDAwO1xuXHRcdHRoaXMuY2FtZXJhLnogPSAtMjAwO1xuXHRcdHRoaXMuY2FtZXJhLnkgPSAxNjA7XG5cblx0XHQvL3NldHVwIGNvbnRyb2xsZXIgdG8gYmUgdXNlZCBvbiB0aGUgY2FtZXJhXG5cdFx0dGhpcy5wbGFjZUhvbGRlciA9IG5ldyBEaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG5cdFx0dGhpcy5wbGFjZUhvbGRlci55ID0gNTA7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyID0gbmV3IExvb2tBdENvbnRyb2xsZXIodGhpcy5jYW1lcmEsIHRoaXMucGxhY2VIb2xkZXIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhbiBpbnN0cnVjdGlvbnMgb3ZlcmxheVxuXHQgKi9cbi8vXHRcdHByaXZhdGUgaW5pdFRleHQoKTp2b2lkXG4vL1x0XHR7XG4vL1x0XHRcdHRleHQgPSBuZXcgVGV4dEZpZWxkKCk7XG4vL1x0XHRcdHRleHQuZGVmYXVsdFRleHRGb3JtYXQgPSBuZXcgVGV4dEZvcm1hdChcIlZlcmRhbmFcIiwgMTEsIDB4RkZGRkZGKTtcbi8vXHRcdFx0dGV4dC53aWR0aCA9IDI0MDtcbi8vXHRcdFx0dGV4dC5oZWlnaHQgPSAxMDA7XG4vL1x0XHRcdHRleHQuc2VsZWN0YWJsZSA9IGZhbHNlO1xuLy9cdFx0XHR0ZXh0Lm1vdXNlRW5hYmxlZCA9IGZhbHNlO1xuLy9cdFx0XHR0ZXh0LnRleHQgPSBcIkN1cnNvciBrZXlzIC8gV1NBRCAtIG1vdmVcXG5cIjtcbi8vXHRcdFx0dGV4dC5hcHBlbmRUZXh0KFwiU0hJRlQgLSBob2xkIGRvd24gdG8gcnVuXFxuXCIpO1xuLy9cdFx0XHR0ZXh0LmFwcGVuZFRleHQoXCJudW1iZXJzIDEtOSAtIEF0dGFja1xcblwiKTtcbi8vXHRcdFx0dGV4dC5maWx0ZXJzID0gW25ldyBEcm9wU2hhZG93RmlsdGVyKDEsIDQ1LCAweDAsIDEsIDAsIDApXTtcbi8vXG4vL1x0XHRcdGFkZENoaWxkKHRleHQpO1xuLy9cdFx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbnRpdGllc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKCk6dm9pZFxuXHR7XG5cdFx0Ly9jcmVhdGUgYSBsaWdodCBmb3Igc2hhZG93cyB0aGF0IG1pbWljcyB0aGUgc3VuJ3MgcG9zaXRpb24gaW4gdGhlIHNreWJveFxuXHRcdHRoaXMucmVkTGlnaHQgPSBuZXcgUG9pbnRMaWdodCgpO1xuXHRcdHRoaXMucmVkTGlnaHQueCA9IC0xMDAwO1xuXHRcdHRoaXMucmVkTGlnaHQueSA9IDIwMDtcblx0XHR0aGlzLnJlZExpZ2h0LnogPSAtMTQwMDtcblx0XHR0aGlzLnJlZExpZ2h0LmNvbG9yID0gMHhmZjExMTE7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnJlZExpZ2h0KTtcblxuXHRcdHRoaXMuYmx1ZUxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHR0aGlzLmJsdWVMaWdodC54ID0gMTAwMDtcblx0XHR0aGlzLmJsdWVMaWdodC55ID0gMjAwO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LnogPSAxNDAwO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LmNvbG9yID0gMHgxMTExZmY7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLmJsdWVMaWdodCk7XG5cblx0XHR0aGlzLndoaXRlTGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgtNTAsIC0yMCwgMTApO1xuXHRcdHRoaXMud2hpdGVMaWdodC5jb2xvciA9IDB4ZmZmZmVlO1xuXHRcdHRoaXMud2hpdGVMaWdodC5jYXN0c1NoYWRvd3MgPSB0cnVlO1xuXHRcdHRoaXMud2hpdGVMaWdodC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLndoaXRlTGlnaHQuYW1iaWVudENvbG9yID0gMHgzMDMwNDA7XG5cdFx0dGhpcy53aGl0ZUxpZ2h0LnNoYWRvd01hcHBlciA9IG5ldyBOZWFyRGlyZWN0aW9uYWxTaGFkb3dNYXBwZXIoLjIpO1xuXHRcdHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy53aGl0ZUxpZ2h0KTtcblxuXHRcdHRoaXMubGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIoW3RoaXMucmVkTGlnaHQsIHRoaXMuYmx1ZUxpZ2h0LCB0aGlzLndoaXRlTGlnaHRdKTtcblxuXG5cdFx0Ly9jcmVhdGUgYSBnbG9iYWwgc2hhZG93IG1ldGhvZFxuXHRcdHRoaXMuc2hhZG93TWFwTWV0aG9kID0gbmV3IFNoYWRvd05lYXJNZXRob2QobmV3IFNoYWRvd1NvZnRNZXRob2QodGhpcy53aGl0ZUxpZ2h0LCAxNSwgOCkpO1xuXHRcdHRoaXMuc2hhZG93TWFwTWV0aG9kLmVwc2lsb24gPSAuMTtcblxuXHRcdC8vY3JlYXRlIGEgZ2xvYmFsIGZvZyBtZXRob2Rcblx0XHR0aGlzLmZvZ01ldGhvZCA9IG5ldyBFZmZlY3RGb2dNZXRob2QoMCwgdGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIqMC41LCAweDAwMDAwMCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbWF0ZXJpYWxzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRNYXRlcmlhbHMoKTp2b2lkXG5cdHtcblx0XHQvL3JlZCBsaWdodCBtYXRlcmlhbFxuXHRcdHRoaXMucmVkTGlnaHRNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMucmVkTGlnaHRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHR0aGlzLnJlZExpZ2h0TWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kKHRoaXMuZm9nTWV0aG9kKTtcblxuXHRcdC8vYmx1ZSBsaWdodCBtYXRlcmlhbFxuXHRcdHRoaXMuYmx1ZUxpZ2h0TWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmJsdWVMaWdodE1hdGVyaWFsLmFscGhhQmxlbmRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0TWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kKHRoaXMuZm9nTWV0aG9kKTtcblxuXHRcdC8vZ3JvdW5kIG1hdGVyaWFsXG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc21vb3RoID0gdHJ1ZTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zaGFkb3dNZXRob2QgPSB0aGlzLnNoYWRvd01hcE1ldGhvZDtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCh0aGlzLmZvZ01ldGhvZCk7XG5cblx0XHQvL2JvZHkgbWF0ZXJpYWxcblx0XHR0aGlzLmJvZHlNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuYm9keU1hdGVyaWFsLmdsb3NzID0gMjA7XG5cdFx0dGhpcy5ib2R5TWF0ZXJpYWwuc3BlY3VsYXIgPSAxLjU7XG5cdFx0dGhpcy5ib2R5TWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kKHRoaXMuZm9nTWV0aG9kKTtcblx0XHR0aGlzLmJvZHlNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5ib2R5TWF0ZXJpYWwuc2hhZG93TWV0aG9kID0gdGhpcy5zaGFkb3dNYXBNZXRob2Q7XG5cblx0XHQvL2dvYiBtYXRlcmlhbFxuXHRcdHRoaXMuZ29iTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmdvYk1hdGVyaWFsLmFscGhhQmxlbmRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuZ29iTWF0ZXJpYWwuc21vb3RoID0gdHJ1ZTtcblx0XHR0aGlzLmdvYk1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG5cdFx0dGhpcy5nb2JNYXRlcmlhbC5hbmltYXRlVVZzID0gdHJ1ZTtcblx0XHR0aGlzLmdvYk1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCh0aGlzLmZvZ01ldGhvZCk7XG5cdFx0dGhpcy5nb2JNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5nb2JNYXRlcmlhbC5zaGFkb3dNZXRob2QgPSB0aGlzLnNoYWRvd01hcE1ldGhvZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0Ly9jcmVhdGUgbGlnaHQgYmlsbGJvYXJkc1xuXHRcdHZhciByZWRTcHJpdGU6QmlsbGJvYXJkID0gbmV3IEJpbGxib2FyZCh0aGlzLnJlZExpZ2h0TWF0ZXJpYWwpO1xuXHRcdHJlZFNwcml0ZS53aWR0aCA9IDIwMDtcblx0XHRyZWRTcHJpdGUuaGVpZ2h0ID0gMjAwO1xuXHRcdHJlZFNwcml0ZS5jYXN0c1NoYWRvd3MgPSBmYWxzZTtcblx0XHR2YXIgYmx1ZVNwcml0ZTpCaWxsYm9hcmQgPSBuZXcgQmlsbGJvYXJkKHRoaXMuYmx1ZUxpZ2h0TWF0ZXJpYWwpO1xuXHRcdGJsdWVTcHJpdGUud2lkdGggPSAyMDA7XG5cdFx0Ymx1ZVNwcml0ZS5oZWlnaHQgPSAyMDA7XG5cdFx0Ymx1ZVNwcml0ZS5jYXN0c1NoYWRvd3MgPSBmYWxzZTtcblx0XHR0aGlzLnJlZExpZ2h0LmFkZENoaWxkKHJlZFNwcml0ZSk7XG5cdFx0dGhpcy5ibHVlTGlnaHQuYWRkQ2hpbGQoYmx1ZVNwcml0ZSk7XG5cblx0XHRBc3NldExpYnJhcnkuZW5hYmxlUGFyc2VyKE1ENU1lc2hQYXJzZXIpO1xuXHRcdEFzc2V0TGlicmFyeS5lbmFibGVQYXJzZXIoTUQ1QW5pbVBhcnNlcik7XG5cblx0XHQvL2NyZWF0ZSBhIHJvY2t5IGdyb3VuZCBwbGFuZVxuXHRcdHRoaXMuZ3JvdW5kID0gPE1lc2g+IG5ldyBQcmltaXRpdmVQbGFuZVByZWZhYig1MDAwMCwgNTAwMDAsIDEsIDEpLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuZ3JvdW5kLm1hdGVyaWFsID0gdGhpcy5ncm91bmRNYXRlcmlhbDtcblx0XHR0aGlzLmdyb3VuZC5nZW9tZXRyeS5zY2FsZVVWKDIwMCwgMjAwKTtcblx0XHR0aGlzLmdyb3VuZC5jYXN0c1NoYWRvd3MgPSBmYWxzZTtcblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuZ3JvdW5kKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaXN0ZW5lcnNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpc3RlbmVycygpOnZvaWRcblx0e1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQpID0+IHRoaXMub25SZXNpemUoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5ZG93biA9IChldmVudCkgPT4gdGhpcy5vbktleURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5dXAgPSAoZXZlbnQpID0+IHRoaXMub25LZXlVcChldmVudCk7XG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cblx0XHQvL3NldHVwIHRoZSB1cmwgbWFwIGZvciB0ZXh0dXJlcyBpbiB0aGUgY3ViZW1hcCBmaWxlXG5cdFx0dmFyIGFzc2V0TG9hZGVyQ29udGV4dDpBc3NldExvYWRlckNvbnRleHQgPSBuZXcgQXNzZXRMb2FkZXJDb250ZXh0KCk7XG5cdFx0YXNzZXRMb2FkZXJDb250ZXh0LmRlcGVuZGVuY3lCYXNlVXJsID0gXCJhc3NldHMvc2t5Ym94L1wiO1xuXG5cdFx0Ly9sb2FkIGhlbGxrbmlnaHQgbWVzaFxuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKEFzc2V0RXZlbnQuQVNTRVRfQ09NUExFVEUsIChldmVudDpBc3NldEV2ZW50KSA9PiB0aGlzLm9uQXNzZXRDb21wbGV0ZShldmVudCkpO1xuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvaGVsbGtuaWdodC9oZWxsa25pZ2h0Lm1kNW1lc2hcIiksIG51bGwsIG51bGwsIG5ldyBNRDVNZXNoUGFyc2VyKCkpO1xuXG5cdFx0Ly9sb2FkIGVudmlyb25tZW50IHRleHR1cmVcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9za3lib3gvZ3JpbW5pZ2h0X3RleHR1cmUuY3ViZVwiKSwgYXNzZXRMb2FkZXJDb250ZXh0KTtcblxuXHRcdC8vbG9hZCBsaWdodCB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3JlZGxpZ2h0LnBuZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvYmx1ZWxpZ2h0LnBuZ1wiKSk7XG5cblx0XHQvL2xvYWQgZmxvb3IgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9yb2NrYmFzZV9kaWZmdXNlLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvcm9ja2Jhc2Vfbm9ybWFscy5wbmdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3JvY2tiYXNlX3NwZWN1bGFyLnBuZ1wiKSk7XG5cblx0XHQvL2xvYWQgaGVsbGtuaWdodCB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2hlbGxrbmlnaHQvaGVsbGtuaWdodF9kaWZmdXNlLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvaGVsbGtuaWdodC9oZWxsa25pZ2h0X25vcm1hbHMucG5nXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9oZWxsa25pZ2h0L2hlbGxrbmlnaHRfc3BlY3VsYXIucG5nXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9oZWxsa25pZ2h0L2dvYi5wbmdcIikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3RpbWUgKz0gZHQ7XG5cblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIudXBkYXRlKCk7XG5cblx0XHQvL3VwZGF0ZSBjaGFyYWN0ZXIgYW5pbWF0aW9uXG5cdFx0aWYgKHRoaXMubWVzaCkge1xuXHRcdFx0dGhpcy5tZXNoLnN1Yk1lc2hlc1sxXS51dlRyYW5zZm9ybS5vZmZzZXRWID0gdGhpcy5tZXNoLnN1Yk1lc2hlc1syXS51dlRyYW5zZm9ybS5vZmZzZXRWID0gdGhpcy5tZXNoLnN1Yk1lc2hlc1szXS51dlRyYW5zZm9ybS5vZmZzZXRWID0gKC10aGlzLl90aW1lLzIwMDAgJSAxKTtcblx0XHRcdHRoaXMubWVzaC5yb3RhdGlvblkgKz0gdGhpcy5jdXJyZW50Um90YXRpb25JbmM7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb3VudCArPSAwLjAxO1xuXG5cdFx0dGhpcy5yZWRMaWdodC54ID0gTWF0aC5zaW4odGhpcy5jb3VudCkqMTUwMDtcblx0XHR0aGlzLnJlZExpZ2h0LnkgPSAyNTAgKyBNYXRoLnNpbih0aGlzLmNvdW50KjAuNTQpKjIwMDtcblx0XHR0aGlzLnJlZExpZ2h0LnogPSBNYXRoLmNvcyh0aGlzLmNvdW50KjAuNykqMTUwMDtcblx0XHR0aGlzLmJsdWVMaWdodC54ID0gLU1hdGguc2luKHRoaXMuY291bnQqMC44KSoxNTAwO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LnkgPSAyNTAgLSBNYXRoLnNpbih0aGlzLmNvdW50Ki42NSkqMjAwO1xuXHRcdHRoaXMuYmx1ZUxpZ2h0LnogPSAtTWF0aC5jb3ModGhpcy5jb3VudCowLjkpKjE1MDA7XG5cblx0XHR0aGlzLnZpZXcucmVuZGVyKCk7XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVuZXIgZm9yIGFzc2V0IGNvbXBsZXRlIGV2ZW50IG9uIGxvYWRlclxuXHQgKi9cblx0cHJpdmF0ZSBvbkFzc2V0Q29tcGxldGUoZXZlbnQ6QXNzZXRFdmVudCk6dm9pZFxuXHR7XG5cdFx0aWYgKGV2ZW50LmFzc2V0LmlzQXNzZXQoQW5pbWF0aW9uTm9kZUJhc2UpKSB7XG5cblx0XHRcdHZhciBub2RlOlNrZWxldG9uQ2xpcE5vZGUgPSA8U2tlbGV0b25DbGlwTm9kZT4gZXZlbnQuYXNzZXQ7XG5cdFx0XHR2YXIgbmFtZTpzdHJpbmcgPSBldmVudC5hc3NldC5hc3NldE5hbWVzcGFjZTtcblxuXHRcdFx0bm9kZS5uYW1lID0gbmFtZTtcblx0XHRcdHRoaXMuYW5pbWF0aW9uU2V0LmFkZEFuaW1hdGlvbihub2RlKTtcblxuXHRcdFx0aWYgKG5hbWUgPT0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX05BTUUgfHwgbmFtZSA9PSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfTkFNRSkge1xuXHRcdFx0XHRub2RlLmxvb3BpbmcgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bm9kZS5sb29waW5nID0gZmFsc2U7XG5cdFx0XHRcdG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihBbmltYXRpb25TdGF0ZUV2ZW50LlBMQVlCQUNLX0NPTVBMRVRFLCAoZXZlbnQ6QW5pbWF0aW9uU3RhdGVFdmVudCkgPT4gdGhpcy5vblBsYXliYWNrQ29tcGxldGUoZXZlbnQpKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG5hbWUgPT0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX05BTUUpXG5cdFx0XHRcdHRoaXMuc3RvcCgpO1xuXHRcdH0gZWxzZSBpZiAoZXZlbnQuYXNzZXQuaXNBc3NldChBbmltYXRpb25TZXRCYXNlKSkge1xuXHRcdFx0dGhpcy5hbmltYXRpb25TZXQgPSA8U2tlbGV0b25BbmltYXRpb25TZXQ+IGV2ZW50LmFzc2V0O1xuXHRcdFx0dGhpcy5hbmltYXRvciA9IG5ldyBTa2VsZXRvbkFuaW1hdG9yKHRoaXMuYW5pbWF0aW9uU2V0LCB0aGlzLnNrZWxldG9uKTtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyIC8qdWludCovID0gMDsgaSA8IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uQU5JTV9OQU1FUy5sZW5ndGg7ICsraSlcblx0XHRcdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvaGVsbGtuaWdodC9cIiArIEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uQU5JTV9OQU1FU1tpXSArIFwiLm1kNWFuaW1cIiksIG51bGwsIEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uQU5JTV9OQU1FU1tpXSwgbmV3IE1ENUFuaW1QYXJzZXIoKSk7XG5cblx0XHRcdHRoaXMubWVzaC5hbmltYXRvciA9IHRoaXMuYW5pbWF0b3I7XG5cdFx0fSBlbHNlIGlmIChldmVudC5hc3NldC5pc0Fzc2V0KFNrZWxldG9uKSkge1xuXHRcdFx0dGhpcy5za2VsZXRvbiA9IDxTa2VsZXRvbj4gZXZlbnQuYXNzZXQ7XG5cdFx0fSBlbHNlIGlmIChldmVudC5hc3NldC5pc0Fzc2V0KE1lc2gpKSB7XG5cdFx0XHQvL2dyYWIgbWVzaCBvYmplY3QgYW5kIGFzc2lnbiBvdXIgbWF0ZXJpYWwgb2JqZWN0XG5cdFx0XHR0aGlzLm1lc2ggPSA8TWVzaD4gZXZlbnQuYXNzZXQ7XG5cdFx0XHR0aGlzLm1lc2guc3ViTWVzaGVzWzBdLm1hdGVyaWFsID0gdGhpcy5ib2R5TWF0ZXJpYWw7XG5cdFx0XHR0aGlzLm1lc2guc3ViTWVzaGVzWzFdLm1hdGVyaWFsID0gdGhpcy5tZXNoLnN1Yk1lc2hlc1syXS5tYXRlcmlhbCA9IHRoaXMubWVzaC5zdWJNZXNoZXNbM10ubWF0ZXJpYWwgPSB0aGlzLmdvYk1hdGVyaWFsO1xuXHRcdFx0dGhpcy5tZXNoLmNhc3RzU2hhZG93cyA9IHRydWU7XG5cdFx0XHR0aGlzLm1lc2gucm90YXRpb25ZID0gMTgwO1xuXHRcdFx0dGhpcy5tZXNoLnN1Yk1lc2hlc1sxXS51dlRyYW5zZm9ybSA9IHRoaXMubWVzaC5zdWJNZXNoZXNbMl0udXZUcmFuc2Zvcm0gPSB0aGlzLm1lc2guc3ViTWVzaGVzWzNdLnV2VHJhbnNmb3JtID0gbmV3IFVWVHJhbnNmb3JtKCk7XG5cdFx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMubWVzaCk7XG5cblx0XHRcdC8vYWRkIG91ciBsb29rYXQgb2JqZWN0IHRvIHRoZSBtZXNoXG5cdFx0XHR0aGlzLm1lc2guYWRkQ2hpbGQodGhpcy5wbGFjZUhvbGRlcik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZ1bmN0aW9uIGZvciByZXNvdXJjZSBjb21wbGV0ZSBldmVudCBvbiBhc3NldCBsaWJyYXJ5XG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZSAoZXZlbnQ6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2goIGV2ZW50LnVybCApXG5cdFx0e1xuXHRcdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L2dyaW1uaWdodF90ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHR0aGlzLmN1YmVUZXh0dXJlID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXG5cdFx0XHRcdHRoaXMuc2t5Qm94ID0gbmV3IFNreWJveCh0aGlzLmN1YmVUZXh0dXJlKTtcblx0XHRcdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnNreUJveCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvL2VudGl0aWVzIHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL3JlZGxpZ2h0LnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5yZWRMaWdodE1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2JsdWVsaWdodC5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuYmx1ZUxpZ2h0TWF0ZXJpYWwudGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9mbG9vciB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9yb2NrYmFzZV9kaWZmdXNlLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9yb2NrYmFzZV9ub3JtYWxzLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5ub3JtYWxNYXAgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL3JvY2tiYXNlX3NwZWN1bGFyLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhck1hcCA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9oZWxsa25pZ2h0IHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL2hlbGxrbmlnaHQvaGVsbGtuaWdodF9kaWZmdXNlLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5ib2R5TWF0ZXJpYWwudGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvaGVsbGtuaWdodC9oZWxsa25pZ2h0X25vcm1hbHMucG5nXCIgOlxuXHRcdFx0XHR0aGlzLmJvZHlNYXRlcmlhbC5ub3JtYWxNYXAgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2hlbGxrbmlnaHQvaGVsbGtuaWdodF9zcGVjdWxhci5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuYm9keU1hdGVyaWFsLnNwZWN1bGFyTWFwID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9oZWxsa25pZ2h0L2dvYi5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuYm9keU1hdGVyaWFsLnNwZWN1bGFyTWFwID0gdGhpcy5nb2JNYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdHByaXZhdGUgb25QbGF5YmFja0NvbXBsZXRlKGV2ZW50OkFuaW1hdGlvblN0YXRlRXZlbnQpOnZvaWRcblx0e1xuXHRcdGlmICh0aGlzLmFuaW1hdG9yLmFjdGl2ZVN0YXRlICE9IGV2ZW50LmFuaW1hdGlvblN0YXRlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5vbmNlQW5pbSA9IG51bGw7XG5cblx0XHR0aGlzLmFuaW1hdG9yLnBsYXkodGhpcy5jdXJyZW50QW5pbSwgdGhpcy5zdGF0ZVRyYW5zaXRpb24pO1xuXHRcdHRoaXMuYW5pbWF0b3IucGxheWJhY2tTcGVlZCA9IHRoaXMuaXNNb3Zpbmc/IHRoaXMubW92ZW1lbnREaXJlY3Rpb24qKHRoaXMuaXNSdW5uaW5nPyBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLlJVTl9TUEVFRCA6IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uV0FMS19TUEVFRCkgOiBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLklETEVfU1BFRUQ7XG5cdH1cblxuXHRwcml2YXRlIHBsYXlBY3Rpb24odmFsOm51bWJlciAvKnVpbnQqLyk6dm9pZFxuXHR7XG5cdFx0dGhpcy5vbmNlQW5pbSA9IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uQU5JTV9OQU1FU1t2YWwgKyAyXTtcblx0XHR0aGlzLmFuaW1hdG9yLnBsYXliYWNrU3BlZWQgPSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLkFDVElPTl9TUEVFRDtcblx0XHR0aGlzLmFuaW1hdG9yLnBsYXkodGhpcy5vbmNlQW5pbSwgdGhpcy5zdGF0ZVRyYW5zaXRpb24sIDApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEtleSB1cCBsaXN0ZW5lclxuXHQgKi9cblx0cHJpdmF0ZSBvbktleURvd24oZXZlbnQpOnZvaWRcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5TSElGVDpcblx0XHRcdFx0dGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuXHRcdFx0XHRpZiAodGhpcy5pc01vdmluZylcblx0XHRcdFx0XHR0aGlzLnVwZGF0ZU1vdmVtZW50KHRoaXMubW92ZW1lbnREaXJlY3Rpb24pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVVA6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlc6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlo6IC8vZnJcblx0XHRcdFx0dGhpcy51cGRhdGVNb3ZlbWVudCh0aGlzLm1vdmVtZW50RGlyZWN0aW9uID0gMSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLnVwZGF0ZU1vdmVtZW50KHRoaXMubW92ZW1lbnREaXJlY3Rpb24gPSAtMSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5ROiAvL2ZyXG5cdFx0XHRcdHRoaXMuY3VycmVudFJvdGF0aW9uSW5jID0gLUludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uUk9UQVRJT05fU1BFRUQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5jdXJyZW50Um90YXRpb25JbmMgPSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLlJPVEFUSU9OX1NQRUVEO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogS2V5IGRvd24gbGlzdGVuZXIgZm9yIGFuaW1hdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbktleVVwKGV2ZW50KTp2b2lkXG5cdHtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgS2V5Ym9hcmQuU0hJRlQ6XG5cdFx0XHRcdHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdGlmICh0aGlzLmlzTW92aW5nKVxuXHRcdFx0XHRcdHRoaXMudXBkYXRlTW92ZW1lbnQodGhpcy5tb3ZlbWVudERpcmVjdGlvbik7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuWjogLy9mclxuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLnN0b3AoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkxFRlQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkE6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlE6IC8vZnJcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuY3VycmVudFJvdGF0aW9uSW5jID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLk5VTUJFUl8xOlxuXHRcdFx0XHR0aGlzLnBsYXlBY3Rpb24oMSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5OVU1CRVJfMjpcblx0XHRcdFx0dGhpcy5wbGF5QWN0aW9uKDIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTlVNQkVSXzM6XG5cdFx0XHRcdHRoaXMucGxheUFjdGlvbigzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLk5VTUJFUl80OlxuXHRcdFx0XHR0aGlzLnBsYXlBY3Rpb24oNCk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5OVU1CRVJfNTpcblx0XHRcdFx0dGhpcy5wbGF5QWN0aW9uKDUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTlVNQkVSXzY6XG5cdFx0XHRcdHRoaXMucGxheUFjdGlvbig2KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLk5VTUJFUl83OlxuXHRcdFx0XHR0aGlzLnBsYXlBY3Rpb24oNyk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5OVU1CRVJfODpcblx0XHRcdFx0dGhpcy5wbGF5QWN0aW9uKDgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTlVNQkVSXzk6XG5cdFx0XHRcdHRoaXMucGxheUFjdGlvbig5KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVNb3ZlbWVudChkaXI6bnVtYmVyKTp2b2lkXG5cdHtcblx0XHR0aGlzLmlzTW92aW5nID0gdHJ1ZTtcblx0XHR0aGlzLmFuaW1hdG9yLnBsYXliYWNrU3BlZWQgPSBkaXIqKHRoaXMuaXNSdW5uaW5nPyBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLlJVTl9TUEVFRCA6IEludGVybWVkaWF0ZV9NRDVBbmltYXRpb24uV0FMS19TUEVFRCk7XG5cblx0XHRpZiAodGhpcy5jdXJyZW50QW5pbSA9PSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfTkFNRSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuY3VycmVudEFuaW0gPSBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uLldBTEtfTkFNRTtcblxuXHRcdGlmICh0aGlzLm9uY2VBbmltKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly91cGRhdGUgYW5pbWF0b3Jcblx0XHR0aGlzLmFuaW1hdG9yLnBsYXkodGhpcy5jdXJyZW50QW5pbSwgdGhpcy5zdGF0ZVRyYW5zaXRpb24pO1xuXHR9XG5cblx0cHJpdmF0ZSBzdG9wKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5pc01vdmluZyA9IGZhbHNlO1xuXG5cdFx0aWYgKHRoaXMuY3VycmVudEFuaW0gPT0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX05BTUUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLmN1cnJlbnRBbmltID0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX05BTUU7XG5cblx0XHRpZiAodGhpcy5vbmNlQW5pbSlcblx0XHRcdHJldHVybjtcblxuXHRcdC8vdXBkYXRlIGFuaW1hdG9yXG5cdFx0dGhpcy5hbmltYXRvci5wbGF5YmFja1NwZWVkID0gSW50ZXJtZWRpYXRlX01ENUFuaW1hdGlvbi5JRExFX1NQRUVEO1xuXHRcdHRoaXMuYW5pbWF0b3IucGxheSh0aGlzLmN1cnJlbnRBbmltLCB0aGlzLnN0YXRlVHJhbnNpdGlvbik7XG5cdH1cblxuXHQvKipcblx0ICogc3RhZ2UgbGlzdGVuZXIgZm9yIHJlc2l6ZSBldmVudHNcblx0ICovXG5cdHByaXZhdGUgb25SZXNpemUoZXZlbnQ6RXZlbnQgPSBudWxsKTp2b2lkXG5cdHtcblx0XHR0aGlzLnZpZXcud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLnZpZXcuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpXG57XG5cdG5ldyBJbnRlcm1lZGlhdGVfTUQ1QW5pbWF0aW9uKCk7XG59XG5cbiJdfQ==