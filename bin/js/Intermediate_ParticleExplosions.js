(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Intermediate_ParticleExplosions.ts":[function(require,module,exports){
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
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Scene = require("awayjs-display/lib/display/Scene");
var View = require("awayjs-display/lib/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var Camera = require("awayjs-display/lib/display/Camera");
var Sprite = require("awayjs-display/lib/display/Sprite");
var PointLight = require("awayjs-display/lib/display/PointLight");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var ParticleAnimationSet = require("awayjs-renderergl/lib/animators/ParticleAnimationSet");
var ParticleAnimator = require("awayjs-renderergl/lib/animators/ParticleAnimator");
var ParticlePropertiesMode = require("awayjs-renderergl/lib/animators/data/ParticlePropertiesMode");
var ParticleBillboardNode = require("awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode");
var ParticleBezierCurveNode = require("awayjs-renderergl/lib/animators/nodes/ParticleBezierCurveNode");
var ParticleInitialColorNode = require("awayjs-renderergl/lib/animators/nodes/ParticleInitialColorNode");
var ParticlePositionNode = require("awayjs-renderergl/lib/animators/nodes/ParticlePositionNode");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var ParticleGraphicsHelper = require("awayjs-renderergl/lib/utils/ParticleGraphicsHelper");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var ElementsType = require("awayjs-display/lib/graphics/ElementsType");
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
        this.scene = new Scene();
        this.camera = new Camera();
        this.view = new View(new DefaultRenderer(), this.scene, this.camera);
        //setup controller to be used on the camera
        this.cameraController = new HoverController(this.camera, null, 225, 10, 1000);
    };
    /**
     * Initialise the lights
     */
    Intermediate_ParticleExplosions.prototype.initLights = function () {
        //create a green point light
        this.greenLight = new PointLight();
        this.greenLight.color = 0x00FF00;
        this.greenLight.ambient = 1;
        this.greenLight.fallOff = 600;
        this.greenLight.radius = 100;
        this.greenLight.specular = 2;
        this.scene.addChild(this.greenLight);
        //create a red pointlight
        this.blueLight = new PointLight();
        this.blueLight.color = 0x0000FF;
        this.blueLight.fallOff = 600;
        this.blueLight.radius = 100;
        this.blueLight.specular = 2;
        this.scene.addChild(this.blueLight);
        //create a lightpicker for the green and red light
        this.lightPicker = new StaticLightPicker([this.greenLight, this.blueLight]);
    };
    /**
     * Initialise the materials
     */
    Intermediate_ParticleExplosions.prototype.initMaterials = function () {
        //setup the particle material
        this.colorMaterial = new MethodMaterial(0xFFFFFF);
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
                point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.chromeBitmapImage2D.width / 2 - 100), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.chromeBitmapImage2D.height / 2));
                color = this.chromeBitmapImage2D.getPixel32(i, j);
                if (((color >> 24) & 0xff) > 0xb0) {
                    this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define where one logo stops and another starts
        this.colorChromeSeparation = this.colorPoints.length;
        for (i = 0; i < this.firefoxBitmapImage2D.width; i++) {
            for (j = 0; j < this.firefoxBitmapImage2D.height; j++) {
                point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.firefoxBitmapImage2D.width / 2 + 100), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.firefoxBitmapImage2D.height / 2));
                color = this.firefoxBitmapImage2D.getPixel32(i, j);
                if (((color >> 24) & 0xff) > 0xb0) {
                    this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define where one logo stops and another starts
        this.colorFirefoxSeparation = this.colorPoints.length;
        for (i = 0; i < this.safariBitmapImage2D.width; i++) {
            for (j = 0; j < this.safariBitmapImage2D.height; j++) {
                point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.safariBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.safariBitmapImage2D.height / 2), -Intermediate_ParticleExplosions.PARTICLE_SIZE * 100);
                color = this.safariBitmapImage2D.getPixel32(i, j);
                if (((color >> 24) & 0xff) > 0xb0) {
                    this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define where one logo stops and another starts
        this.colorSafariSeparation = this.colorPoints.length;
        for (i = 0; i < this.ieBitmapImage2D.width; i++) {
            for (j = 0; j < this.ieBitmapImage2D.height; j++) {
                point = new Vector3D(Intermediate_ParticleExplosions.PARTICLE_SIZE * (i - this.ieBitmapImage2D.width / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * (-j + this.ieBitmapImage2D.height / 2), Intermediate_ParticleExplosions.PARTICLE_SIZE * 100);
                color = this.ieBitmapImage2D.getPixel32(i, j);
                if (((color >> 24) & 0xff) > 0xb0) {
                    this.colorValues.push(new Vector3D(((color & 0xff0000) >> 16) / 255, ((color & 0xff00) >> 8) / 255, (color & 0xff) / 255));
                    this.colorPoints.push(point);
                }
            }
        }
        //define the particle animations and init function
        this.colorAnimationSet = new ParticleAnimationSet();
        this.colorAnimationSet.addAnimation(new ParticleBillboardNode());
        this.colorAnimationSet.addAnimation(new ParticleBezierCurveNode(ParticlePropertiesMode.LOCAL_STATIC));
        this.colorAnimationSet.addAnimation(new ParticlePositionNode(ParticlePropertiesMode.LOCAL_STATIC));
        this.colorAnimationSet.addAnimation(new ParticleInitialColorNode(ParticlePropertiesMode.LOCAL_STATIC, true, false, new ColorTransform(0, 1, 0, 1)));
        this.colorAnimationSet.initParticleFunc = this.iniColorParticleFunc;
        this.colorAnimationSet.initParticleScope = this;
    };
    /**
     * Initialise the scene objects
     */
    Intermediate_ParticleExplosions.prototype.initObjects = function () {
        //setup the base graphics for one particle
        var plane = (new PrimitivePlanePrefab(null, ElementsType.TRIANGLE, Intermediate_ParticleExplosions.PARTICLE_SIZE, Intermediate_ParticleExplosions.PARTICLE_SIZE, 1, 1, false)).getNewObject();
        //combine them into a list
        var colorGraphicsSet = new Array();
        var len = this.colorPoints.length;
        for (i = 0; i < len; i++)
            colorGraphicsSet.push(plane.graphics);
        //create the particle sprite
        this.colorParticleSprite = new Sprite(this.colorMaterial);
        //generate the particle geometries
        ParticleGraphicsHelper.generateGraphics(this.colorParticleSprite.graphics, colorGraphicsSet);
        //initialise animators vectors
        this.colorAnimators = new Array(Intermediate_ParticleExplosions.NUM_ANIMATORS);
        var i = 0;
        for (i = 0; i < Intermediate_ParticleExplosions.NUM_ANIMATORS; i++) {
            //clone the particle sprite
            this.colorParticleSprite = this.colorParticleSprite.clone();
            this.colorParticleSprite.rotationY = 45 * (i - 1);
            this.scene.addChild(this.colorParticleSprite);
            //create and start the particle animator
            this.colorAnimators[i] = new ParticleAnimator(this.colorAnimationSet);
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
        this.timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this.timer.start();
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        //image textures
        AssetLibrary.load(new URLRequest("assets/firefox.png"));
        AssetLibrary.load(new URLRequest("assets/chrome.png"));
        AssetLibrary.load(new URLRequest("assets/safari.png"));
        AssetLibrary.load(new URLRequest("assets/ie.png"));
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
            properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(300 * Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
        else if (properties.index < this.colorFirefoxSeparation)
            properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(-300 * Intermediate_ParticleExplosions.PARTICLE_SIZE, 0, 0);
        else if (properties.index < this.colorSafariSeparation)
            properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(0, 0, 300 * Intermediate_ParticleExplosions.PARTICLE_SIZE);
        else
            properties[ParticleBezierCurveNode.BEZIER_END_VECTOR3D] = new Vector3D(0, 0, -300 * Intermediate_ParticleExplosions.PARTICLE_SIZE);
        var rgb = this.colorValues[properties.index];
        properties[ParticleInitialColorNode.COLOR_INITIAL_COLORTRANSFORM] = new ColorTransform(rgb.x, rgb.y, rgb.z, 1);
        properties[ParticleBezierCurveNode.BEZIER_CONTROL_VECTOR3D] = new Vector3D(r * Math.sin(degree1) * Math.cos(degree2), r * Math.cos(degree1) * Math.cos(degree2), r * Math.sin(degree2));
        properties[ParticlePositionNode.POSITION_VECTOR3D] = this.colorPoints[properties.index];
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
})();
window.onload = function () {
    new Intermediate_ParticleExplosions();
};

},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/ColorTransform":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/display/Camera":undefined,"awayjs-display/lib/display/PointLight":undefined,"awayjs-display/lib/display/Scene":undefined,"awayjs-display/lib/display/Sprite":undefined,"awayjs-display/lib/graphics/ElementsType":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined,"awayjs-renderergl/lib/animators/ParticleAnimationSet":undefined,"awayjs-renderergl/lib/animators/ParticleAnimator":undefined,"awayjs-renderergl/lib/animators/data/ParticlePropertiesMode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleBezierCurveNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleInitialColorNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticlePositionNode":undefined,"awayjs-renderergl/lib/utils/ParticleGraphicsHelper":undefined}]},{},["./src/Intermediate_ParticleExplosions.ts"])


//# sourceMappingURL=Intermediate_ParticleExplosions.js.map