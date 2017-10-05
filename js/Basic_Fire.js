webpackJsonp([16],{

/***/ 25:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__ = __webpack_require__(7);
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






var Basic_Fire = function () {
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
        this.scene = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Scene"]();
        this.camera = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Camera"]();
        this.view = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_view__["View"]();
        //this.view.antiAlias = 4;
        this.view.scene = this.scene;
        this.view.camera = this.camera;
        //setup controller to be used on the camera
        this.cameraController = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["HoverController"](this.camera);
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
        this.directionalLight = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["DirectionalLight"](0, -1, 0);
        this.directionalLight.castsShadows = false;
        this.directionalLight.color = 0xeedddd;
        this.directionalLight.diffuse = .5;
        this.directionalLight.ambient = .5;
        this.directionalLight.specular = 0;
        this.directionalLight.ambientColor = 0x808090;
        this.view.scene.addChild(this.directionalLight);
        this.lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this.directionalLight]);
    };
    /**
     * Initialise the materials
     */
    Basic_Fire.prototype.initMaterials = function () {
        this.planeMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"]();
        this.planeMaterial.mode = __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterialMode"].MULTI_PASS;
        this.planeMaterial.lightPicker = this.lightPicker;
        this.planeMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Sampler2D"](true, true, false);
        this.planeMaterial.specularMethod.strength = 10;
        this.particleMaterial = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_materials__["MethodMaterial"]();
        this.particleMaterial.blendMode = __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["BlendMode"].ADD;
    };
    /**
     * Initialise the particles
     */
    Basic_Fire.prototype.initParticles = function () {
        //create the particle animation set
        this.fireAnimationSet = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleAnimationSet"](true, true);
        //add some animations which can control the particles:
        //the global animations can be set directly, because they influence all the particles with the same factor
        this.fireAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleBillboardNode"]());
        this.fireAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleScaleNode"](__WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticlePropertiesMode"].GLOBAL, false, false, 2.5, 0.5));
        this.fireAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleVelocityNode"](__WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticlePropertiesMode"].GLOBAL, new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](0, 80, 0)));
        this.fireAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleColorNode"](__WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticlePropertiesMode"].GLOBAL, true, true, false, false, new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ColorTransform"](0, 0, 0, 1, 0xFF, 0x33, 0x01), new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ColorTransform"](0, 0, 0, 1, 0x99)));
        //no need to set the local animations here, because they influence all the particle with different factors.
        this.fireAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleVelocityNode"](__WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticlePropertiesMode"].LOCAL_STATIC));
        //set the initParticleFunc. It will be invoked for the local static property initialization of every particle
        this.fireAnimationSet.initParticleFunc = this.initParticleFunc;
        //create the original particle geometry
        var particle = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitivePlanePrefab"](null, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 10, 10, 1, 1, false).getNewObject();
        //combine them into a list
        var graphicsSet = new Array();
        for (var i = 0; i < 500; i++) graphicsSet.push(particle.graphics);
        this.particleSprite = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"](this.particleMaterial);
        __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleGraphicsHelper"].generateGraphics(this.particleSprite.graphics, graphicsSet);
    };
    /**
     * Initialise the scene objects
     */
    Basic_Fire.prototype.initObjects = function () {
        var _this = this;
        this.plane = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitivePlanePrefab"](this.planeMaterial, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 1000, 1000).getNewObject();
        this.plane.material = this.planeMaterial;
        this.plane.graphics.scaleUV(2, 2);
        this.plane.y = -20;
        this.scene.addChild(this.plane);
        //create fire object sprites from geomtry and material, and apply particle animators to each
        for (var i = 0; i < Basic_Fire.NUM_FIRES; i++) {
            var particleSprite = this.particleSprite.clone();
            var animator = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleAnimator"](this.fireAnimationSet);
            particleSprite.animator = animator;
            //position the sprite
            var degree = i / Basic_Fire.NUM_FIRES * Math.PI * 2;
            particleSprite.x = Math.sin(degree) * 400;
            particleSprite.z = Math.cos(degree) * 400;
            particleSprite.y = 5;
            //create a fire object and add it to the fire object vector
            this.fireObjects.push(new FireVO(particleSprite, animator));
            this.view.scene.addChild(particleSprite);
        }
        //setup timer for triggering each particle aniamtor
        this.fireTimer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Timer"](1000, this.fireObjects.length);
        this.fireTimer.addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["TimerEvent"].TIMER, function (event) {
            return _this.onTimer(event);
        });
        this.fireTimer.start();
    };
    /**
     * Initialise the listeners
     */
    Basic_Fire.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) {
            return _this.onResize(event);
        };
        document.onmousedown = function (event) {
            return _this.onMouseDown(event);
        };
        document.onmouseup = function (event) {
            return _this.onMouseUp(event);
        };
        document.onmousemove = function (event) {
            return _this.onMouseMove(event);
        };
        this.onResize();
        this.timer = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this.timer.start();
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].addEventListener(__WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        //plane textures
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/floor_diffuse.jpg"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/floor_normal.jpg"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/floor_specular.jpg"));
        //particle texture
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/blue.png"));
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
        prop[__WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_renderer__["ParticleVelocityNode"].VELOCITY_VECTOR3D] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
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
            if (fireVO.light) lights.push(fireVO.light);
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
        var light = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PointLight"]();
        light.color = 0xFF3301;
        light.diffuse = 0;
        light.specular = 0;
        light.transform.moveTo(fireObject.sprite.x, fireObject.sprite.y, fireObject.sprite.z);
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
            if (!light) continue;
            if (fireVO.strength < 1) fireVO.strength += 0.1;
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
                //plane textures
                case "assets/floor_diffuse.jpg":
                    this.planeMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](asset);
                    break;
                case "assets/floor_normal.jpg":
                    this.planeMaterial.normalMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](asset);
                    break;
                case "assets/floor_specular.jpg":
                    this.planeMaterial.specularMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](asset);
                    break;
                //particle texture
                case "assets/blue.png":
                    this.particleMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["Single2DTexture"](asset);
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
        if (event === void 0) {
            event = null;
        }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return Basic_Fire;
}();
Basic_Fire.NUM_FIRES = 10;
/**
* Data class for the fire objects
*/
var FireVO = function () {
    function FireVO(sprite, animator) {
        this.strength = 0;
        this.sprite = sprite;
        this.animator = animator;
    }
    return FireVO;
}();
window.onload = function () {
    new Basic_Fire();
};

/***/ })

},[25]);
//# sourceMappingURL=Basic_Fire.js.map