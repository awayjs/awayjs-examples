webpackJsonp([17],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	"use strict";
	var LoaderEvent_1 = __webpack_require__(5);
	var ColorTransform_1 = __webpack_require__(19);
	var Vector3D_1 = __webpack_require__(18);
	var AssetLibrary_1 = __webpack_require__(305);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var Scene_1 = __webpack_require__(11);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(112);
	var Camera_1 = __webpack_require__(45);
	var Sprite_1 = __webpack_require__(57);
	var PointLight_1 = __webpack_require__(224);
	var StaticLightPicker_1 = __webpack_require__(226);
	var ElementsType_1 = __webpack_require__(232);
	var PrimitivePlanePrefab_1 = __webpack_require__(237);
	var ParticleAnimationSet_1 = __webpack_require__(333);
	var ParticleAnimator_1 = __webpack_require__(342);
	var ParticlePropertiesMode_1 = __webpack_require__(337);
	var ParticleBillboardNode_1 = __webpack_require__(343);
	var ParticleBezierCurveNode_1 = __webpack_require__(363);
	var ParticleInitialColorNode_1 = __webpack_require__(365);
	var ParticlePositionNode_1 = __webpack_require__(367);
	var DefaultRenderer_1 = __webpack_require__(130);
	var ParticleGraphicsHelper_1 = __webpack_require__(351);
	var MethodMaterial_1 = __webpack_require__(265);
	var Intermediate_ParticleExplosions = (function () {
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
	        this.scene = new Scene_1.Scene();
	        this.camera = new Camera_1.Camera();
	        this.view = new View_1.View(new DefaultRenderer_1.DefaultRenderer(), this.scene, this.camera);
	        //setup controller to be used on the camera
	        this.cameraController = new HoverController_1.HoverController(this.camera, null, 225, 10, 1000);
	    };
	    /**
	     * Initialise the lights
	     */
	    Intermediate_ParticleExplosions.prototype.initLights = function () {
	        //create a green point light
	        this.greenLight = new PointLight_1.PointLight();
	        this.greenLight.color = 0x00FF00;
	        this.greenLight.ambient = 1;
	        this.greenLight.fallOff = 600;
	        this.greenLight.radius = 100;
	        this.greenLight.specular = 2;
	        this.scene.addChild(this.greenLight);
	        //create a red pointlight
	        this.blueLight = new PointLight_1.PointLight();
	        this.blueLight.color = 0x0000FF;
	        this.blueLight.fallOff = 600;
	        this.blueLight.radius = 100;
	        this.blueLight.specular = 2;
	        this.scene.addChild(this.blueLight);
	        //create a lightpicker for the green and red light
	        this.lightPicker = new StaticLightPicker_1.StaticLightPicker([this.greenLight, this.blueLight]);
	    };
	    /**
	     * Initialise the materials
	     */
	    Intermediate_ParticleExplosions.prototype.initMaterials = function () {
	        //setup the particle material
	        this.colorMaterial = new MethodMaterial_1.MethodMaterial(0xFFFFFF);
	        this.colorMaterial.bothSides = true;
	        this.colorMaterial.lightPicker = this.lightPicker;
	    };
	    /**
	     * Initialise the particles
	     */
	    Intermediate_ParticleExplosions.prototype.initParticles = function () {
	        var i;
	        var j;
	        var point;
	        var rgb;
	        var color; /*uint*/
	        for (i = 0; i < this.chromeBitmapImage2D.width; i++) {
	            for (j = 0; j < this.chromeBitmapImage2D.height; j++) {
	                point = new Vector3D_1.Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.chromeBitmapImage2D.width / 2 - 100), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.chromeBitmapImage2D.height / 2));
	                color = this.chromeBitmapImage2D.getPixel32(i, j);
	                if (((color >> 24) & 0xff) > 0xb0) {
	                    this.colorValues.push(new Vector3D_1.Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
	                    this.colorPoints.push(point);
	                }
	            }
	        }
	        //define where one logo stops and another starts
	        this.colorChromeSeparation = this.colorPoints.length;
	        for (i = 0; i < this.firefoxBitmapImage2D.width; i++) {
	            for (j = 0; j < this.firefoxBitmapImage2D.height; j++) {
	                point = new Vector3D_1.Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.firefoxBitmapImage2D.width / 2 + 100), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.firefoxBitmapImage2D.height / 2));
	                color = this.firefoxBitmapImage2D.getPixel32(i, j);
	                if (((color >> 24) & 0xff) > 0xb0) {
	                    this.colorValues.push(new Vector3D_1.Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
	                    this.colorPoints.push(point);
	                }
	            }
	        }
	        //define where one logo stops and another starts
	        this.colorFirefoxSeparation = this.colorPoints.length;
	        for (i = 0; i < this.safariBitmapImage2D.width; i++) {
	            for (j = 0; j < this.safariBitmapImage2D.height; j++) {
	                point = new Vector3D_1.Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.safariBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.safariBitmapImage2D.height / 2), -Intermediate_ParticleExplosions.PARTICLE_SIZE * 100);
	                color = this.safariBitmapImage2D.getPixel32(i, j);
	                if (((color >> 24) & 0xff) > 0xb0) {
	                    this.colorValues.push(new Vector3D_1.Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
	                    this.colorPoints.push(point);
	                }
	            }
	        }
	        //define where one logo stops and another starts
	        this.colorSafariSeparation = this.colorPoints.length;
	        for (i = 0; i < this.ieBitmapImage2D.width; i++) {
	            for (j = 0; j < this.ieBitmapImage2D.height; j++) {
	                point = new Vector3D_1.Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.ieBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.ieBitmapImage2D.height / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * 100);
	                color = this.ieBitmapImage2D.getPixel32(i, j);
	                if (((color >> 24) & 0xff) > 0xb0) {
	                    this.colorValues.push(new Vector3D_1.Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
	                    this.colorPoints.push(point);
	                }
	            }
	        }
	        //define the particle animations and init function
	        this.colorAnimationSet = new ParticleAnimationSet_1.ParticleAnimationSet();
	        this.colorAnimationSet.addAnimation(new ParticleBillboardNode_1.ParticleBillboardNode());
	        this.colorAnimationSet.addAnimation(new ParticleBezierCurveNode_1.ParticleBezierCurveNode(ParticlePropertiesMode_1.ParticlePropertiesMode.LOCAL_STATIC));
	        this.colorAnimationSet.addAnimation(new ParticlePositionNode_1.ParticlePositionNode(ParticlePropertiesMode_1.ParticlePropertiesMode.LOCAL_STATIC));
	        this.colorAnimationSet.addAnimation(new ParticleInitialColorNode_1.ParticleInitialColorNode(ParticlePropertiesMode_1.ParticlePropertiesMode.LOCAL_STATIC, true, false, new ColorTransform_1.ColorTransform(0, 1, 0, 1)));
	        this.colorAnimationSet.initParticleFunc = this.iniColorParticleFunc;
	        this.colorAnimationSet.initParticleScope = this;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Intermediate_ParticleExplosions.prototype.initObjects = function () {
	        //setup the base graphics for one particle
	        var plane = (new PrimitivePlanePrefab_1.PrimitivePlanePrefab(null, ElementsType_1.ElementsType.TRIANGLE, Intermediate_ParticleExplosions.PARTICLE_SIZE, Intermediate_ParticleExplosions.PARTICLE_SIZE, 1, 1, false)).getNewObject();
	        //combine them into a list
	        var colorGraphicsSet = new Array();
	        var len = this.colorPoints.length;
	        for (i = 0; i < len; i++)
	            colorGraphicsSet.push(plane.graphics);
	        //create the particle sprite
	        this.colorParticleSprite = new Sprite_1.Sprite(this.colorMaterial);
	        //generate the particle geometries
	        ParticleGraphicsHelper_1.ParticleGraphicsHelper.generateGraphics(this.colorParticleSprite.graphics, colorGraphicsSet);
	        //initialise animators vectors
	        this.colorAnimators = new Array(Intermediate_ParticleExplosions.NUM_ANIMATORS);
	        var i = 0;
	        for (i = 0; i < Intermediate_ParticleExplosions.NUM_ANIMATORS; i++) {
	            //clone the particle sprite
	            this.colorParticleSprite = this.colorParticleSprite.clone();
	            this.colorParticleSprite.rotationY = 45 * (i - 1);
	            this.scene.addChild(this.colorParticleSprite);
	            //create and start the particle animator
	            this.colorAnimators[i] = new ParticleAnimator_1.ParticleAnimator(this.colorAnimationSet);
	            this.colorParticleSprite.animator = this.colorAnimators[i];
	            this.scene.addChild(this.colorParticleSprite);
	        }
	    };
	    /**
	     * Initialise the listeners
	     */
	    Intermediate_ParticleExplosions.prototype.initListeners = function () {
	        var _this = this;
	        window.onresize = function (event) { return _this.onResize(event); };
	        document.onmousedown = function (event) { return _this.onMouseDown(event); };
	        document.onmouseup = function (event) { return _this.onMouseUp(event); };
	        document.onmousemove = function (event) { return _this.onMouseMove(event); };
	        this.onResize();
	        this.timer = new RequestAnimationFrame_1.RequestAnimationFrame(this.onEnterFrame, this);
	        this.timer.start();
	        AssetLibrary_1.AssetLibrary.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        //image textures
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/firefox.png"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/chrome.png"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/safari.png"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/ie.png"));
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
	        if (properties.index < this.colorChromeSeparation)
	            properties[ParticleBezierCurveNode_1.ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D_1.Vector3D(300 * Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
	        else if (properties.index < this.colorFirefoxSeparation)
	            properties[ParticleBezierCurveNode_1.ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D_1.Vector3D(-300 * Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
	        else if (properties.index < this.colorSafariSeparation)
	            properties[ParticleBezierCurveNode_1.ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D_1.Vector3D(0, 0, 300 * Intermediate_ParticleExplosions.PARTICLE_SIZE);
	        else
	            properties[ParticleBezierCurveNode_1.ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D_1.Vector3D(0, 0, -300 * Intermediate_ParticleExplosions.PARTICLE_SIZE);
	        var rgb = this.colorValues[properties.index];
	        properties[ParticleInitialColorNode_1.ParticleInitialColorNode.COLOR_INITIAL_COLORTRANSFORM] = new ColorTransform_1.ColorTransform(rgb.x, rgb.y, rgb.z, 1);
	        properties[ParticleBezierCurveNode_1.ParticleBezierCurveNode.BEZIER_CONTROL_VECTOR3D] = new Vector3D_1.Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
	        properties[ParticlePositionNode_1.ParticlePositionNode.POSITION_VECTOR3D] = this.colorPoints[properties.index];
	    };
	    /**
	     * Navigation and render loop
	     */
	    Intermediate_ParticleExplosions.prototype.onEnterFrame = function (dt) {
	        this.time += dt;
	        //update the camera position
	        this.cameraController.panAngle += 0.2;
	        //update the particle animator playhead positions
	        var i;
	        var time;
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
	        if (event === void 0) { event = null; }
	        this.view.y = 0;
	        this.view.x = 0;
	        this.view.width = window.innerWidth;
	        this.view.height = window.innerHeight;
	    };
	    Intermediate_ParticleExplosions.PARTICLE_SIZE = 2;
	    Intermediate_ParticleExplosions.NUM_ANIMATORS = 4;
	    return Intermediate_ParticleExplosions;
	}());
	window.onload = function () {
	    new Intermediate_ParticleExplosions();
	};


/***/ }
]);
//# sourceMappingURL=Intermediate_ParticleExplosions.js.map