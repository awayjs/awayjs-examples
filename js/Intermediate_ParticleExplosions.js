webpackJsonp([3],{

/***/ 37:
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__ = __webpack_require__(2);
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






var Intermediate_ParticleExplosions = function () {
    /**
     * Constructor
     */
    function Intermediate_ParticleExplosions() {
        this.colorValues = new Array();
        this.colorPoints = new Array();
        this.time = 0;
        this.angle = 0;
        this.move = false;
        this.init();
    }
    /**
     * Global initialise function
     */
    Intermediate_ParticleExplosions.prototype.init = function () {
        this.initEngine();
        this.initLights();
        this.initMaterials();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Intermediate_ParticleExplosions.prototype.initEngine = function () {
        this.scene = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Scene"]();
        this.camera = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Camera"]();
        this.view = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["View"](null, this.scene, this.camera);
        //setup controller to be used on the camera
        this.cameraController = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["HoverController"](this.camera, null, 225, 10, 1000);
    };
    /**
     * Initialise the lights
     */
    Intermediate_ParticleExplosions.prototype.initLights = function () {
        //create a green point light
        this.greenLight = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PointLight"]();
        this.greenLight.color = 0x00FF00;
        this.greenLight.ambient = 1;
        this.greenLight.fallOff = 600;
        this.greenLight.radius = 100;
        this.greenLight.specular = 2;
        this.scene.addChild(this.greenLight);
        //create a red pointlight
        this.blueLight = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PointLight"]();
        this.blueLight.color = 0x0000FF;
        this.blueLight.fallOff = 600;
        this.blueLight.radius = 100;
        this.blueLight.specular = 2;
        this.scene.addChild(this.blueLight);
        //create a lightpicker for the green and red light
        this.lightPicker = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["StaticLightPicker"]([this.greenLight, this.blueLight]);
    };
    /**
     * Initialise the materials
     */
    Intermediate_ParticleExplosions.prototype.initMaterials = function () {
        //setup the particle material
        this.colorMaterial = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["MethodMaterial"](0xFFFFFF);
        this.colorMaterial.bothSides = true;
        this.colorMaterial.lightPicker = this.lightPicker;
    };
    /**
     * Initialise the particles
     */
    Intermediate_ParticleExplosions.prototype.initParticles = function () {
        var i /*int*/;
        var j /*int*/;
        var point;
        var rgb;
        var color; /*uint*/
        for (i = 0; i < this.chromeBitmapImage2D.width; i++) {
            for (j = 0; j < this.chromeBitmapImage2D.height; j++) {
                point = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.chromeBitmapImage2D.width / 2 - 100), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.chromeBitmapImage2D.height / 2));
                color = this.chromeBitmapImage2D.getPixel32(i, j);
                if ((color >> 24 & 0xff) > 0xb0) {
                    this.colorValues.push(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define where one logo stops and another starts
        this.colorChromeSeparation = this.colorPoints.length;
        for (i = 0; i < this.firefoxBitmapImage2D.width; i++) {
            for (j = 0; j < this.firefoxBitmapImage2D.height; j++) {
                point = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.firefoxBitmapImage2D.width / 2 + 100), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.firefoxBitmapImage2D.height / 2));
                color = this.firefoxBitmapImage2D.getPixel32(i, j);
                if ((color >> 24 & 0xff) > 0xb0) {
                    this.colorValues.push(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define where one logo stops and another starts
        this.colorFirefoxSeparation = this.colorPoints.length;
        for (i = 0; i < this.safariBitmapImage2D.width; i++) {
            for (j = 0; j < this.safariBitmapImage2D.height; j++) {
                point = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.safariBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.safariBitmapImage2D.height / 2), -Intermediate_ParticleExplosions.PARTICLE_SIZE * 100);
                color = this.safariBitmapImage2D.getPixel32(i, j);
                if ((color >> 24 & 0xff) > 0xb0) {
                    this.colorValues.push(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define where one logo stops and another starts
        this.colorSafariSeparation = this.colorPoints.length;
        for (i = 0; i < this.ieBitmapImage2D.width; i++) {
            for (j = 0; j < this.ieBitmapImage2D.height; j++) {
                point = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.ieBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.ieBitmapImage2D.height / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * 100);
                color = this.ieBitmapImage2D.getPixel32(i, j);
                if ((color >> 24 & 0xff) > 0xb0) {
                    this.colorValues.push(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define the particle animations and init function
        this.colorAnimationSet = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleAnimationSet"]();
        this.colorAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBillboardNode"]());
        this.colorAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBezierCurveNode"](__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticlePropertiesMode"].LOCAL_STATIC));
        this.colorAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticlePositionNode"](__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticlePropertiesMode"].LOCAL_STATIC));
        this.colorAnimationSet.addAnimation(new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleInitialColorNode"](__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticlePropertiesMode"].LOCAL_STATIC, true, false, new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ColorTransform"](0, 1, 0, 1)));
        this.colorAnimationSet.initParticleFunc = this.iniColorParticleFunc;
        this.colorAnimationSet.initParticleScope = this;
    };
    /**
     * Initialise the scene objects
     */
    Intermediate_ParticleExplosions.prototype.initObjects = function () {
        //setup the base graphics for one particle
        var plane = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["PrimitivePlanePrefab"](null, __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, Intermediate_ParticleExplosions.PARTICLE_SIZE, Intermediate_ParticleExplosions.PARTICLE_SIZE, 1, 1, false).getNewObject();
        //combine them into a list
        var colorGraphicsSet = new Array();
        var len = this.colorPoints.length;
        for (i = 0; i < len; i++) colorGraphicsSet.push(plane.graphics);
        //create the particle sprite
        this.colorParticleSprite = new __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_scene__["Sprite"](this.colorMaterial);
        //generate the particle geometries
        __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleGraphicsHelper"].generateGraphics(this.colorParticleSprite.graphics, colorGraphicsSet);
        //initialise animators vectors
        this.colorAnimators = new Array(Intermediate_ParticleExplosions.NUM_ANIMATORS);
        var i = 0;
        for (i = 0; i < Intermediate_ParticleExplosions.NUM_ANIMATORS; i++) {
            //clone the particle sprite
            this.colorParticleSprite = this.colorParticleSprite.clone();
            this.colorParticleSprite.rotationY = 45 * (i - 1);
            this.scene.addChild(this.colorParticleSprite);
            //create and start the particle animator
            this.colorAnimators[i] = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleAnimator"](this.colorAnimationSet);
            this.colorParticleSprite.animator = this.colorAnimators[i];
            this.scene.addChild(this.colorParticleSprite);
        }
    };
    /**
     * Initialise the listeners
     */
    Intermediate_ParticleExplosions.prototype.initListeners = function () {
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
        //image textures
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/firefox.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/chrome.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/safari.png"));
        __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["URLRequest"]("assets/ie.png"));
    };
    /**
     * Initialiser for particle properties
     */
    Intermediate_ParticleExplosions.prototype.iniColorParticleFunc = function (properties) {
        properties.startTime = 0;
        properties.duration = 1;
        var degree1 = Math.random() * Math.PI * 2;
        var degree2 = Math.random() * Math.PI * 2;
        var r = 500;
        if (properties.index < this.colorChromeSeparation) properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBezierCurveNode"].BEZIER_END_VECTOR3D] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](300 * Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);else if (properties.index < this.colorFirefoxSeparation) properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBezierCurveNode"].BEZIER_END_VECTOR3D] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](-300 * Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);else if (properties.index < this.colorSafariSeparation) properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBezierCurveNode"].BEZIER_END_VECTOR3D] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](0, 0, 300 * Intermediate_ParticleExplosions.PARTICLE_SIZE);else properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBezierCurveNode"].BEZIER_END_VECTOR3D] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](0, 0, -300 * Intermediate_ParticleExplosions.PARTICLE_SIZE);
        var rgb = this.colorValues[properties.index];
        properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleInitialColorNode"].COLOR_INITIAL_COLORTRANSFORM] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["ColorTransform"](rgb.x, rgb.y, rgb.z, 1);
        properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticleBezierCurveNode"].BEZIER_CONTROL_VECTOR3D] = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_core__["Vector3D"](r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
        properties[__WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_renderer__["ParticlePositionNode"].POSITION_VECTOR3D] = this.colorPoints[properties.index];
    };
    /**
     * Navigation and render loop
     */
    Intermediate_ParticleExplosions.prototype.onEnterFrame = function (dt) {
        this.time += dt;
        //update the camera position
        this.cameraController.panAngle += 0.2;
        //update the particle animator playhead positions
        var i /*uint*/;
        var time /*uint*/;
        if (this.colorAnimators) {
            for (i = 0; i < this.colorAnimators.length; i++) {
                time = 1000 * (Math.sin(this.time / 5000 + Math.PI * i / 4) + 1);
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
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Intermediate_ParticleExplosions.prototype.onResourceComplete = function (event) {
        switch (event.url) {
            //image textures
            case "assets/firefox.png":
                this.firefoxBitmapImage2D = event.assets[0];
                break;
            case "assets/chrome.png":
                this.chromeBitmapImage2D = event.assets[0];
                break;
            case "assets/ie.png":
                this.ieBitmapImage2D = event.assets[0];
                break;
            case "assets/safari.png":
                this.safariBitmapImage2D = event.assets[0];
                break;
        }
        if (this.firefoxBitmapImage2D != null && this.chromeBitmapImage2D != null && this.safariBitmapImage2D != null && this.ieBitmapImage2D != null) {
            this.initParticles();
            this.initObjects();
        }
    };
    /**
     * Mouse down listener for navigation
     */
    Intermediate_ParticleExplosions.prototype.onMouseDown = function (event) {
        this.lastPanAngle = this.cameraController.panAngle;
        this.lastTiltAngle = this.cameraController.tiltAngle;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Intermediate_ParticleExplosions.prototype.onMouseUp = function (event) {
        this.move = false;
    };
    /**
     * Mouse move listener for mouseLock
     */
    Intermediate_ParticleExplosions.prototype.onMouseMove = function (event) {
        if (this.move) {
            this.cameraController.panAngle = 0.3 * (event.clientX - this.lastMouseX) + this.lastPanAngle;
            this.cameraController.tiltAngle = 0.3 * (event.clientY - this.lastMouseY) + this.lastTiltAngle;
        }
    };
    /**
     * window listener for resize events
     */
    Intermediate_ParticleExplosions.prototype.onResize = function (event) {
        if (event === void 0) {
            event = null;
        }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return Intermediate_ParticleExplosions;
}();
Intermediate_ParticleExplosions.PARTICLE_SIZE = 2;
Intermediate_ParticleExplosions.NUM_ANIMATORS = 4;
window.onload = function () {
    new Intermediate_ParticleExplosions();
};

/***/ }

},[37]);
//# sourceMappingURL=Intermediate_ParticleExplosions.js.map