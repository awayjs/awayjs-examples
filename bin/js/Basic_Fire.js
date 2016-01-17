(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Basic_Fire.ts":[function(require,module,exports){
/*

Creating fire effects with particles in Away3D

Demonstrates:

How to setup a particle geometry and particle animationset in order to simulate fire.
How to stagger particle animation instances with different animator objects running on different timers.
How to apply fire lighting to a floor mesh using a multipass material.

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
var Sampler2D = require("awayjs-core/lib/image/Sampler2D");
var BlendMode = require("awayjs-core/lib/image/BlendMode");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var TimerEvent = require("awayjs-core/lib/events/TimerEvent");
var ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Timer = require("awayjs-core/lib/utils/Timer");
var Scene = require("awayjs-display/lib/containers/Scene");
var View = require("awayjs-display/lib/containers/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var Camera = require("awayjs-display/lib/entities/Camera");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var Single2DTexture = require("awayjs-display/lib/textures/Single2DTexture");
var ParticleAnimationSet = require("awayjs-renderergl/lib/animators/ParticleAnimationSet");
var ParticleAnimator = require("awayjs-renderergl/lib/animators/ParticleAnimator");
var ParticlePropertiesMode = require("awayjs-renderergl/lib/animators/data/ParticlePropertiesMode");
var ParticleBillboardNode = require("awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode");
var ParticleScaleNode = require("awayjs-renderergl/lib/animators/nodes/ParticleScaleNode");
var ParticleVelocityNode = require("awayjs-renderergl/lib/animators/nodes/ParticleVelocityNode");
var ParticleColorNode = require("awayjs-renderergl/lib/animators/nodes/ParticleColorNode");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodMaterialMode = require("awayjs-methodmaterials/lib/MethodMaterialMode");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var ParticleGeometryHelper = require("awayjs-renderergl/lib/utils/ParticleGeometryHelper");
var Basic_Fire = (function () {
    /**
     * Constructor
     */
    function Basic_Fire() {
        this.fireObjects = new Array();
        this.time = 0;
        this.move = false;
        this.init();
    }
    /**
     * Global initialise function
     */
    Basic_Fire.prototype.init = function () {
        this.initEngine();
        this.initLights();
        this.initMaterials();
        this.initParticles();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Basic_Fire.prototype.initEngine = function () {
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
    };
    /**
     * Initialise the lights
     */
    Basic_Fire.prototype.initLights = function () {
        this.directionalLight = new DirectionalLight(0, -1, 0);
        this.directionalLight.castsShadows = false;
        this.directionalLight.color = 0xeedddd;
        this.directionalLight.diffuse = .5;
        this.directionalLight.ambient = .5;
        this.directionalLight.specular = 0;
        this.directionalLight.ambientColor = 0x808090;
        this.view.scene.addChild(this.directionalLight);
        this.lightPicker = new StaticLightPicker([this.directionalLight]);
    };
    /**
     * Initialise the materials
     */
    Basic_Fire.prototype.initMaterials = function () {
        this.planeMaterial = new MethodMaterial();
        this.planeMaterial.mode = MethodMaterialMode.MULTI_PASS;
        this.planeMaterial.lightPicker = this.lightPicker;
        this.planeMaterial.style.sampler = new Sampler2D(true, true, false);
        this.planeMaterial.specularMethod.strength = 10;
        this.particleMaterial = new MethodMaterial();
        this.particleMaterial.blendMode = BlendMode.ADD;
    };
    /**
     * Initialise the particles
     */
    Basic_Fire.prototype.initParticles = function () {
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
        var particle = new PrimitivePlanePrefab(10, 10, 1, 1, false);
        //combine them into a list
        var geometrySet = new Array();
        for (var i = 0; i < 500; i++)
            geometrySet.push(particle.geometry);
        this.particleGeometry = ParticleGeometryHelper.generateGeometry(geometrySet);
    };
    /**
     * Initialise the scene objects
     */
    Basic_Fire.prototype.initObjects = function () {
        var _this = this;
        this.plane = new PrimitivePlanePrefab(1000, 1000).getNewObject();
        this.plane.material = this.planeMaterial;
        this.plane.geometry.scaleUV(2, 2);
        this.plane.y = -20;
        this.scene.addChild(this.plane);
        for (var i = 0; i < Basic_Fire.NUM_FIRES; i++) {
            var particleMesh = new Mesh(this.particleGeometry, this.particleMaterial);
            var animator = new ParticleAnimator(this.fireAnimationSet);
            particleMesh.animator = animator;
            //position the mesh
            var degree = i / Basic_Fire.NUM_FIRES * Math.PI * 2;
            particleMesh.x = Math.sin(degree) * 400;
            particleMesh.z = Math.cos(degree) * 400;
            particleMesh.y = 5;
            //create a fire object and add it to the fire object vector
            this.fireObjects.push(new FireVO(particleMesh, animator));
            this.view.scene.addChild(particleMesh);
        }
        //setup timer for triggering each particle aniamtor
        this.fireTimer = new Timer(1000, this.fireObjects.length);
        this.fireTimer.addEventListener(TimerEvent.TIMER, function (event) { return _this.onTimer(event); });
        this.fireTimer.start();
    };
    /**
     * Initialise the listeners
     */
    Basic_Fire.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        this.onResize();
        this.timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this.timer.start();
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        //plane textures
        AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
        AssetLibrary.load(new URLRequest("assets/floor_normal.jpg"));
        AssetLibrary.load(new URLRequest("assets/floor_specular.jpg"));
        //particle texture
        AssetLibrary.load(new URLRequest("assets/blue.png"));
    };
    /**
     * Initialiser for particle properties
     */
    Basic_Fire.prototype.initParticleFunc = function (prop) {
        prop.startTime = Math.random() * 5;
        prop.duration = Math.random() * 4 + 0.1;
        var degree1 = Math.random() * Math.PI * 2;
        var degree2 = Math.random() * Math.PI * 2;
        var r = 15;
        prop[ParticleVelocityNode.VELOCITY_VECTOR3D] = new Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
    };
    /**
     * Returns an array of active lights in the scene
     */
    Basic_Fire.prototype.getAllLights = function () {
        var lights = new Array();
        lights.push(this.directionalLight);
        var fireVO;
        for (var i = 0; i < this.fireObjects.length; i++) {
            fireVO = this.fireObjects[i];
            if (fireVO.light)
                lights.push(fireVO.light);
        }
        return lights;
    };
    /**
     * Timer event handler
     */
    Basic_Fire.prototype.onTimer = function (event) {
        var fireObject = this.fireObjects[this.fireTimer.currentCount - 1];
        //start the animator
        fireObject.animator.start();
        //create the lightsource
        var light = new PointLight();
        light.color = 0xFF3301;
        light.diffuse = 0;
        light.specular = 0;
        light.transform.moveTo(fireObject.mesh.x, fireObject.mesh.y, fireObject.mesh.z);
        //add the lightsource to the fire object
        fireObject.light = light;
        //update the lightpicker
        this.lightPicker.lights = this.getAllLights();
    };
    /**
     * Navigation and render loop
     */
    Basic_Fire.prototype.onEnterFrame = function (dt) {
        this.time += dt;
        //animate lights
        var fireVO;
        for (var i = 0; i < this.fireObjects.length; i++) {
            fireVO = this.fireObjects[i];
            //update flame light
            var light = fireVO.light;
            if (!light)
                continue;
            if (fireVO.strength < 1)
                fireVO.strength += 0.1;
            light.fallOff = 380 + Math.random() * 20;
            light.radius = 200 + Math.random() * 30;
            light.diffuse = light.specular = fireVO.strength + Math.random() * .2;
        }
        this.view.render();
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Basic_Fire.prototype.onResourceComplete = function (event) {
        var assets = event.assets;
        var length = assets.length;
        for (var c = 0; c < length; c++) {
            var asset = assets[c];
            console.log(asset.name, event.url);
            switch (event.url) {
                case "assets/floor_diffuse.jpg":
                    this.planeMaterial.ambientMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/floor_normal.jpg":
                    this.planeMaterial.normalMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/floor_specular.jpg":
                    this.planeMaterial.specularMethod.texture = new Single2DTexture(asset);
                    break;
                case "assets/blue.png":
                    this.particleMaterial.ambientMethod.texture = new Single2DTexture(asset);
                    break;
            }
        }
    };
    /**
    * Mouse down listener for navigation
    */
    Basic_Fire.prototype.onMouseDown = function (event) {
        this.lastPanAngle = this.cameraController.panAngle;
        this.lastTiltAngle = this.cameraController.tiltAngle;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Basic_Fire.prototype.onMouseUp = function (event) {
        this.move = false;
    };
    Basic_Fire.prototype.onMouseMove = function (event) {
        if (this.move) {
            this.cameraController.panAngle = 0.3 * (event.clientX - this.lastMouseX) + this.lastPanAngle;
            this.cameraController.tiltAngle = 0.3 * (event.clientY - this.lastMouseY) + this.lastTiltAngle;
        }
    };
    /**
     * stage listener for resize events
     */
    Basic_Fire.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    Basic_Fire.NUM_FIRES = 10;
    return Basic_Fire;
})();
/**
* Data class for the fire objects
*/
var FireVO = (function () {
    function FireVO(mesh, animator) {
        this.strength = 0;
        this.mesh = mesh;
        this.animator = animator;
    }
    return FireVO;
})();
window.onload = function () {
    new Basic_Fire();
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/events/TimerEvent":undefined,"awayjs-core/lib/geom/ColorTransform":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/image/BlendMode":undefined,"awayjs-core/lib/image/Sampler2D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-core/lib/utils/Timer":undefined,"awayjs-display/lib/containers/Scene":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/PointLight":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/MethodMaterialMode":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined,"awayjs-renderergl/lib/animators/ParticleAnimationSet":undefined,"awayjs-renderergl/lib/animators/ParticleAnimator":undefined,"awayjs-renderergl/lib/animators/data/ParticlePropertiesMode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleColorNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleScaleNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleVelocityNode":undefined,"awayjs-renderergl/lib/utils/ParticleGeometryHelper":undefined}]},{},["./src/Basic_Fire.ts"])


//# sourceMappingURL=Basic_Fire.js.map