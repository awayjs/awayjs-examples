(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/Intermediate_Globe.ts":[function(require,module,exports){
/*

Globe example in Away3d

Demonstrates:

How to create a textured sphere.
How to use containers to rotate an object.
How to use the PhongBitmapMaterial.

Code by Rob Bateman
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk

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
var BitmapImage2D = require("awayjs-core/lib/data/BitmapImage2D");
var BitmapImageChannel = require("awayjs-core/lib/data/BitmapImageChannel");
var BlendMode = require("awayjs-core/lib/data/BlendMode");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var Point = require("awayjs-core/lib/geom/Point");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var LoaderContext = require("awayjs-core/lib/library/LoaderContext");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var DisplayObjectContainer = require("awayjs-display/lib/containers/DisplayObjectContainer");
var Scene = require("awayjs-display/lib/containers/Scene");
var View = require("awayjs-display/lib/containers/View");
var HoverController = require("awayjs-display/lib/controllers/HoverController");
var OrientationMode = require("awayjs-display/lib/base/OrientationMode");
var AlignmentMode = require("awayjs-display/lib/base/AlignmentMode");
var Camera = require("awayjs-display/lib/entities/Camera");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitiveSpherePrefab = require("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");
var SingleCubeTexture = require("awayjs-display/lib/textures/SingleCubeTexture");
var Single2DTexture = require("awayjs-display/lib/textures/Single2DTexture");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var DiffuseCompositeMethod = require("awayjs-methodmaterials/lib/methods/DiffuseCompositeMethod");
var SpecularCompositeMethod = require("awayjs-methodmaterials/lib/methods/SpecularCompositeMethod");
var SpecularFresnelMethod = require("awayjs-methodmaterials/lib/methods/SpecularFresnelMethod");
var SpecularPhongMethod = require("awayjs-methodmaterials/lib/methods/SpecularPhongMethod");
var Intermediate_Globe = (function () {
    /**
     * Constructor
     */
    function Intermediate_Globe() {
        this.flares = new Array(12);
        this._time = 0;
        this.move = false;
        this.mouseLockX = 0;
        this.mouseLockY = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    Intermediate_Globe.prototype.init = function () {
        this.initEngine();
        this.initLights();
        //initLensFlare();
        this.initMaterials();
        this.initObjects();
        this.initListeners();
    };
    /**
     * Initialise the engine
     */
    Intermediate_Globe.prototype.initEngine = function () {
        this.scene = new Scene();
        //setup camera for optimal skybox rendering
        this.camera = new Camera();
        this.camera.projection.far = 100000;
        this.view = new View(new DefaultRenderer());
        this.view.scene = this.scene;
        this.view.camera = this.camera;
        //setup controller to be used on the camera
        this.cameraController = new HoverController(this.camera, null, 0, 0, 600, -90, 90);
        this.cameraController.autoUpdate = false;
        this.cameraController.yFactor = 1;
    };
    /**
     * Initialise the lights
     */
    Intermediate_Globe.prototype.initLights = function () {
        this.light = new PointLight();
        this.light.x = 10000;
        this.light.ambient = 1;
        this.light.diffuse = 2;
        this.lightPicker = new StaticLightPicker([this.light]);
    };
    /*
        private initLensFlare():void
        {
            flares.push(new FlareObject(new Flare10(),  3.2, -0.01, 147.9));
            flares.push(new FlareObject(new Flare11(),  6,    0,     30.6));
            flares.push(new FlareObject(new Flare7(),   2,    0,     25.5));
            flares.push(new FlareObject(new Flare7(),   4,    0,     17.85));
            flares.push(new FlareObject(new Flare12(),  0.4,  0.32,  22.95));
            flares.push(new FlareObject(new Flare6(),   1,    0.68,  20.4));
            flares.push(new FlareObject(new Flare2(),   1.25, 1.1,   48.45));
            flares.push(new FlareObject(new Flare3(),   1.75, 1.37,   7.65));
            flares.push(new FlareObject(new Flare4(),   2.75, 1.85,  12.75));
            flares.push(new FlareObject(new Flare8(),   0.5,  2.21,  33.15));
            flares.push(new FlareObject(new Flare6(),   4,    2.5,   10.4));
            flares.push(new FlareObject(new Flare7(),   10,   2.66,  50));
        }
    */
    /**
     * Initialise the materials
     */
    Intermediate_Globe.prototype.initMaterials = function () {
        //this.cubeTexture = new BitmapCubeTexture(Cast.bitmapData(PosX), Cast.bitmapData(NegX), Cast.bitmapData(PosY), Cast.bitmapData(NegY), Cast.bitmapData(PosZ), Cast.bitmapData(NegZ));
        //adjust specular map
        //var specBitmap:BitmapImage2D = Cast.bitmapData(EarthSpecular);
        //specBitmap.colorTransform(specBitmap.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
        var specular = new SpecularFresnelMethod(true, new SpecularPhongMethod());
        specular.fresnelPower = 1;
        specular.normalReflectance = 0.1;
        this.sunMaterial = new MethodMaterial();
        this.sunMaterial.blendMode = BlendMode.ADD;
        this.groundMaterial = new MethodMaterial();
        this.groundMaterial.specularMethod = specular;
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.gloss = 5;
        this.groundMaterial.specular = 1;
        this.groundMaterial.ambient = 1;
        this.groundMaterial.diffuseMethod.multiply = false;
        this.cloudMaterial = new MethodMaterial();
        this.cloudMaterial.alphaBlending = true;
        this.cloudMaterial.lightPicker = this.lightPicker;
        this.cloudMaterial.ambientColor = 0x1b2048;
        this.cloudMaterial.specular = 0;
        this.cloudMaterial.ambient = 1;
        this.atmosphereDiffuseMethod = new DiffuseCompositeMethod(this.modulateDiffuseMethod);
        this.atmosphereSpecularMethod = new SpecularCompositeMethod(this.modulateSpecularMethod, new SpecularPhongMethod());
        this.atmosphereMaterial = new MethodMaterial();
        this.atmosphereMaterial.diffuseMethod = this.atmosphereDiffuseMethod;
        this.atmosphereMaterial.specularMethod = this.atmosphereSpecularMethod;
        this.atmosphereMaterial.blendMode = BlendMode.ADD;
        this.atmosphereMaterial.lightPicker = this.lightPicker;
        this.atmosphereMaterial.specular = 0.5;
        this.atmosphereMaterial.gloss = 5;
        this.atmosphereMaterial.ambientColor = 0;
        this.atmosphereMaterial.diffuseColor = 0x1671cc;
        this.atmosphereMaterial.ambient = 1;
    };
    Intermediate_Globe.prototype.modulateDiffuseMethod = function (shaderObject, methodVO, targetReg, regCache, sharedRegisters) {
        var viewDirFragmentReg = sharedRegisters.viewDirFragment;
        var normalFragmentReg = sharedRegisters.normalFragment;
        var code = "dp3 " + targetReg + ".w, " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" + "mul " + targetReg + ".w, " + targetReg + ".w, " + targetReg + ".w\n";
        return code;
    };
    Intermediate_Globe.prototype.modulateSpecularMethod = function (shaderObject, methodVO, targetReg, regCache, sharedRegisters) {
        var viewDirFragmentReg = sharedRegisters.viewDirFragment;
        var normalFragmentReg = sharedRegisters.normalFragment;
        var temp = regCache.getFreeFragmentSingleTemp();
        regCache.addFragmentTempUsages(temp, 1);
        var code = "dp3 " + temp + ", " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" + "neg " + temp + ", " + temp + "\n" + "mul " + targetReg + ".w, " + targetReg + ".w, " + temp + "\n";
        regCache.removeFragmentTempUsage(temp);
        return code;
    };
    /**
     * Initialise the scene objects
     */
    Intermediate_Globe.prototype.initObjects = function () {
        this.orbitContainer = new DisplayObjectContainer();
        this.orbitContainer.addChild(this.light);
        this.scene.addChild(this.orbitContainer);
        this.sun = new Billboard(this.sunMaterial);
        this.sun.width = 3000;
        this.sun.height = 3000;
        this.sun.pivot = new Vector3D(1500, 1500, 0);
        this.sun.orientationMode = OrientationMode.CAMERA_PLANE;
        this.sun.alignmentMode = AlignmentMode.PIVOT_POINT;
        this.sun.x = 10000;
        this.orbitContainer.addChild(this.sun);
        this.earth = new PrimitiveSpherePrefab(200, 200, 100).getNewObject();
        this.earth.material = this.groundMaterial;
        this.clouds = new PrimitiveSpherePrefab(202, 200, 100).getNewObject();
        this.clouds.material = this.cloudMaterial;
        this.atmosphere = new PrimitiveSpherePrefab(210, 200, 100).getNewObject();
        this.atmosphere.material = this.atmosphereMaterial;
        this.atmosphere.scaleX = -1;
        this.tiltContainer = new DisplayObjectContainer();
        this.tiltContainer.rotationX = -23;
        this.tiltContainer.addChild(this.earth);
        this.tiltContainer.addChild(this.clouds);
        this.tiltContainer.addChild(this.atmosphere);
        this.scene.addChild(this.tiltContainer);
        this.cameraController.lookAtObject = this.tiltContainer;
    };
    /**
     * Initialise the listeners
     */
    Intermediate_Globe.prototype.initListeners = function () {
        var _this = this;
        window.onresize = function (event) { return _this.onResize(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        document.onmousewheel = function (event) { return _this.onMouseWheel(event); };
        this.onResize();
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
        AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onResourceComplete(event); });
        //setup the url map for textures in the cubemap file
        var loaderContext = new LoaderContext();
        loaderContext.dependencyBaseUrl = "assets/skybox/";
        //environment texture
        AssetLibrary.load(new URLRequest("assets/skybox/space_texture.cube"), loaderContext);
        //globe textures
        AssetLibrary.load(new URLRequest("assets/globe/cloud_combined_2048.jpg"));
        AssetLibrary.load(new URLRequest("assets/globe/earth_specular_2048.jpg"));
        AssetLibrary.load(new URLRequest("assets/globe/EarthNormal.png"));
        AssetLibrary.load(new URLRequest("assets/globe/land_lights_16384.jpg"));
        AssetLibrary.load(new URLRequest("assets/globe/land_ocean_ice_2048_match.jpg"));
        //flare textures
        AssetLibrary.load(new URLRequest("assets/lensflare/flare2.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare3.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare4.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare6.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare7.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare8.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare10.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare11.jpg"));
        AssetLibrary.load(new URLRequest("assets/lensflare/flare12.jpg"));
    };
    /**
     * Navigation and render loop
     */
    Intermediate_Globe.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        this.earth.rotationY += 0.2;
        this.clouds.rotationY += 0.21;
        this.orbitContainer.rotationY += 0.02;
        this.cameraController.update();
        this.updateFlares();
        this.view.render();
    };
    Intermediate_Globe.prototype.updateFlares = function () {
        var flareVisibleOld = this.flareVisible;
        var sunScreenPosition = this.view.project(this.sun.scenePosition);
        var xOffset = sunScreenPosition.x - window.innerWidth / 2;
        var yOffset = sunScreenPosition.y - window.innerHeight / 2;
        var earthScreenPosition = this.view.project(this.earth.scenePosition);
        var earthRadius = 190 * window.innerHeight / earthScreenPosition.z;
        var flareObject;
        this.flareVisible = (sunScreenPosition.x > 0 && sunScreenPosition.x < window.innerWidth && sunScreenPosition.y > 0 && sunScreenPosition.y < window.innerHeight && sunScreenPosition.z > 0 && Math.sqrt(xOffset * xOffset + yOffset * yOffset) > earthRadius);
        //update flare visibility
        if (this.flareVisible != flareVisibleOld) {
            for (var i = 0; i < this.flares.length; i++) {
                flareObject = this.flares[i];
                if (flareObject)
                    flareObject.billboard.visible = this.flareVisible;
            }
        }
        //update flare position
        if (this.flareVisible) {
            var flareDirection = new Point(xOffset, yOffset);
            for (var i = 0; i < this.flares.length; i++) {
                flareObject = this.flares[i];
                if (flareObject)
                    flareObject.billboard.transform.position = this.view.unproject(sunScreenPosition.x - flareDirection.x * flareObject.position, sunScreenPosition.y - flareDirection.y * flareObject.position, 100 - i);
            }
        }
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Intermediate_Globe.prototype.onResourceComplete = function (event) {
        switch (event.url) {
            case 'assets/skybox/space_texture.cube':
                this.cubeTexture = new SingleCubeTexture(event.assets[0]);
                this.skyBox = new Skybox(this.cubeTexture);
                this.scene.addChild(this.skyBox);
                break;
            case "assets/globe/cloud_combined_2048.jpg":
                var cloudBitmapImage2D = new BitmapImage2D(2048, 1024, true, 0xFFFFFFFF);
                cloudBitmapImage2D.copyChannel(event.assets[0], cloudBitmapImage2D.rect, new Point(), BitmapImageChannel.RED, BitmapImageChannel.ALPHA);
                this.cloudMaterial.texture = new Single2DTexture(cloudBitmapImage2D);
                break;
            case "assets/globe/earth_specular_2048.jpg":
                var specBitmapImage2D = event.assets[0];
                specBitmapImage2D.colorTransform(specBitmapImage2D.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
                this.groundMaterial.specularMap = new Single2DTexture(specBitmapImage2D);
                break;
            case "assets/globe/EarthNormal.png":
                this.groundMaterial.normalMap = new Single2DTexture(event.assets[0]);
                break;
            case "assets/globe/land_lights_16384.jpg":
                this.groundMaterial.texture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/globe/land_ocean_ice_2048_match.jpg":
                this.groundMaterial.diffuseTexture = new Single2DTexture(event.assets[0]);
                break;
            case "assets/lensflare/flare2.jpg":
                this.flares[6] = new FlareObject(event.assets[0], 1.25, 1.1, 48.45, this.scene);
                break;
            case "assets/lensflare/flare3.jpg":
                this.flares[7] = new FlareObject(event.assets[0], 1.75, 1.37, 7.65, this.scene);
                break;
            case "assets/lensflare/flare4.jpg":
                this.flares[8] = new FlareObject(event.assets[0], 2.75, 1.85, 12.75, this.scene);
                break;
            case "assets/lensflare/flare6.jpg":
                this.flares[5] = new FlareObject(event.assets[0], 1, 0.68, 20.4, this.scene);
                this.flares[10] = new FlareObject(event.assets[0], 4, 2.5, 10.4, this.scene);
                break;
            case "assets/lensflare/flare7.jpg":
                this.flares[2] = new FlareObject(event.assets[0], 2, 0, 25.5, this.scene);
                this.flares[3] = new FlareObject(event.assets[0], 4, 0, 17.85, this.scene);
                this.flares[11] = new FlareObject(event.assets[0], 10, 2.66, 50, this.scene);
                break;
            case "assets/lensflare/flare8.jpg":
                this.flares[9] = new FlareObject(event.assets[0], 0.5, 2.21, 33.15, this.scene);
                break;
            case "assets/lensflare/flare10.jpg":
                this.sunMaterial.texture = new Single2DTexture(event.assets[0]);
                this.flares[0] = new FlareObject(event.assets[0], 3.2, -0.01, 100, this.scene);
                break;
            case "assets/lensflare/flare11.jpg":
                this.flares[1] = new FlareObject(event.assets[0], 6, 0, 30.6, this.scene);
                break;
            case "assets/lensflare/flare12.jpg":
                this.flares[4] = new FlareObject(event.assets[0], 0.4, 0.32, 22.95, this.scene);
                break;
        }
    };
    /**
     * Mouse down listener for navigation
     */
    Intermediate_Globe.prototype.onMouseDown = function (event) {
        this.lastPanAngle = this.cameraController.panAngle;
        this.lastTiltAngle = this.cameraController.tiltAngle;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Intermediate_Globe.prototype.onMouseUp = function (event) {
        this.move = false;
    };
    /**
     * Mouse move listener for mouseLock
     */
    Intermediate_Globe.prototype.onMouseMove = function (event) {
        //            if (stage.displayState == StageDisplayState.FULL_SCREEN) {
        //
        //                if (mouseLocked && (lastMouseX != 0 || lastMouseY != 0)) {
        //                    e.movementX += lastMouseX;
        //                    e.movementY += lastMouseY;
        //                    lastMouseX = 0;
        //                    lastMouseY = 0;
        //                }
        //
        //                mouseLockX += e.movementX;
        //                mouseLockY += e.movementY;
        //
        //                if (!stage.mouseLock) {
        //                    stage.mouseLock = true;
        //                    lastMouseX = stage.mouseX - stage.stageWidth/2;
        //                    lastMouseY = stage.mouseY - stage.stageHeight/2;
        //                } else if (!mouseLocked) {
        //                    mouseLocked = true;
        //                }
        //
        //                //ensure bounds for tiltAngle are not eceeded
        //                if (mouseLockY > cameraController.maxTiltAngle/0.3)
        //                    mouseLockY = cameraController.maxTiltAngle/0.3;
        //                else if (mouseLockY < cameraController.minTiltAngle/0.3)
        //                    mouseLockY = cameraController.minTiltAngle/0.3;
        //            }
        //            if (stage.mouseLock) {
        //                cameraController.panAngle = 0.3*mouseLockX;
        //                cameraController.tiltAngle = 0.3*mouseLockY;
        //            } else if (move) {
        //                cameraController.panAngle = 0.3*(stage.mouseX - lastMouseX) + lastPanAngle;
        //                cameraController.tiltAngle = 0.3*(stage.mouseY - lastMouseY) + lastTiltAngle;
        //            }
        if (this.move) {
            this.cameraController.panAngle = 0.3 * (event.clientX - this.lastMouseX) + this.lastPanAngle;
            this.cameraController.tiltAngle = 0.3 * (event.clientY - this.lastMouseY) + this.lastTiltAngle;
        }
    };
    /**
     * Mouse wheel listener for navigation
     */
    Intermediate_Globe.prototype.onMouseWheel = function (event) {
        this.cameraController.distance -= event.wheelDelta;
        if (this.cameraController.distance < 400)
            this.cameraController.distance = 400;
        else if (this.cameraController.distance > 10000)
            this.cameraController.distance = 10000;
    };
    /**
     * Key down listener for fullscreen
     */
    //        private onKeyDown(event:KeyboardEvent):void
    //        {
    //            switch (event.keyCode)
    //            {
    //                case Keyboard.SPACE:
    //                    if (stage.displayState == StageDisplayState.FULL_SCREEN) {
    //                        stage.displayState = StageDisplayState.NORMAL;
    //                    } else {
    //                        stage.displayState = StageDisplayState.FULL_SCREEN;
    //
    //                        mouseLocked = false;
    //                        mouseLockX = cameraController.panAngle/0.3;
    //                        mouseLockY = cameraController.tiltAngle/0.3;
    //                    }
    //                    break;
    //            }
    //        }
    //
    /**
     * window listener for resize events
     */
    Intermediate_Globe.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return Intermediate_Globe;
})();
var FlareObject = (function () {
    /**
     * Constructor
     */
    function FlareObject(bitmapData, size, position, opacity, scene) {
        this.flareSize = 14.4;
        var bd = new BitmapImage2D(bitmapData.width, bitmapData.height, true, 0xFFFFFFFF);
        bd.copyChannel(bitmapData, bitmapData.rect, new Point(), BitmapImageChannel.RED, BitmapImageChannel.ALPHA);
        var billboardMaterial = new MethodMaterial(new Single2DTexture(bd));
        billboardMaterial.alpha = opacity / 100;
        billboardMaterial.alphaBlending = true;
        //billboardMaterial.blendMode = BlendMode.LAYER;
        this.billboard = new Billboard(billboardMaterial);
        this.billboard.width = size * this.flareSize;
        this.billboard.height = size * this.flareSize;
        this.billboard.pivot = new Vector3D(size * this.flareSize / 2, size * this.flareSize / 2, 0);
        this.billboard.orientationMode = OrientationMode.CAMERA_PLANE;
        this.billboard.alignmentMode = AlignmentMode.PIVOT_POINT;
        this.billboard.visible = false;
        this.size = size;
        this.position = position;
        this.opacity = opacity;
        scene.addChild(this.billboard);
    }
    return FlareObject;
})();
window.onload = function () {
    new Intermediate_Globe();
};

},{"awayjs-core/lib/data/BitmapImage2D":undefined,"awayjs-core/lib/data/BitmapImageChannel":undefined,"awayjs-core/lib/data/BlendMode":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/ColorTransform":undefined,"awayjs-core/lib/geom/Point":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/library/LoaderContext":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/base/AlignmentMode":undefined,"awayjs-display/lib/base/OrientationMode":undefined,"awayjs-display/lib/containers/DisplayObjectContainer":undefined,"awayjs-display/lib/containers/Scene":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Billboard":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/PointLight":undefined,"awayjs-display/lib/entities/Skybox":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitiveSpherePrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-display/lib/textures/SingleCubeTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/methods/DiffuseCompositeMethod":undefined,"awayjs-methodmaterials/lib/methods/SpecularCompositeMethod":undefined,"awayjs-methodmaterials/lib/methods/SpecularFresnelMethod":undefined,"awayjs-methodmaterials/lib/methods/SpecularPhongMethod":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Intermediate_Globe.ts"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvSW50ZXJtZWRpYXRlX0dsb2JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsQUFxQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQURFO0FBQ0YsSUFBTyxhQUFhLFdBQWMsb0NBQW9DLENBQUMsQ0FBQztBQUV4RSxJQUFPLGtCQUFrQixXQUFhLHlDQUF5QyxDQUFDLENBQUM7QUFDakYsSUFBTyxTQUFTLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNqRSxJQUFPLFdBQVcsV0FBZSxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3ZFLElBQU8sY0FBYyxXQUFjLHFDQUFxQyxDQUFDLENBQUM7QUFDMUUsSUFBTyxRQUFRLFdBQWdCLCtCQUErQixDQUFDLENBQUM7QUFDaEUsSUFBTyxLQUFLLFdBQWdCLDRCQUE0QixDQUFDLENBQUM7QUFDMUQsSUFBTyxZQUFZLFdBQWUsc0NBQXNDLENBQUMsQ0FBQztBQUMxRSxJQUFPLGFBQWEsV0FBYyx1Q0FBdUMsQ0FBQyxDQUFDO0FBQzNFLElBQU8sVUFBVSxXQUFlLGdDQUFnQyxDQUFDLENBQUM7QUFDbEUsSUFBTyxxQkFBcUIsV0FBWSw2Q0FBNkMsQ0FBQyxDQUFDO0FBRXZGLElBQU8sc0JBQXNCLFdBQVksc0RBQXNELENBQUMsQ0FBQztBQUNqRyxJQUFPLEtBQUssV0FBZ0IscUNBQXFDLENBQUMsQ0FBQztBQUVuRSxJQUFPLElBQUksV0FBaUIsb0NBQW9DLENBQUMsQ0FBQztBQUNsRSxJQUFPLGVBQWUsV0FBYyxnREFBZ0QsQ0FBQyxDQUFDO0FBQ3RGLElBQU8sZUFBZSxXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFDL0UsSUFBTyxhQUFhLFdBQWMsdUNBQXVDLENBQUMsQ0FBQztBQUMzRSxJQUFPLE1BQU0sV0FBZ0Isb0NBQW9DLENBQUMsQ0FBQztBQUNuRSxJQUFPLFNBQVMsV0FBZSx1Q0FBdUMsQ0FBQyxDQUFDO0FBRXhFLElBQU8sVUFBVSxXQUFlLHdDQUF3QyxDQUFDLENBQUM7QUFDMUUsSUFBTyxNQUFNLFdBQWdCLG9DQUFvQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxpQkFBaUIsV0FBYSw2REFBNkQsQ0FBQyxDQUFDO0FBQ3BHLElBQU8scUJBQXFCLFdBQVksa0RBQWtELENBQUMsQ0FBQztBQUM1RixJQUFPLGlCQUFpQixXQUFhLCtDQUErQyxDQUFDLENBQUM7QUFDdEYsSUFBTyxlQUFlLFdBQWMsNkNBQTZDLENBQUMsQ0FBQztBQUduRixJQUFPLGVBQWUsV0FBYyx1Q0FBdUMsQ0FBQyxDQUFDO0FBTTdFLElBQU8sY0FBYyxXQUFjLDJDQUEyQyxDQUFDLENBQUM7QUFFaEYsSUFBTyxzQkFBc0IsV0FBWSwyREFBMkQsQ0FBQyxDQUFDO0FBQ3RHLElBQU8sdUJBQXVCLFdBQVksNERBQTRELENBQUMsQ0FBQztBQUd4RyxJQUFPLHFCQUFxQixXQUFZLDBEQUEwRCxDQUFDLENBQUM7QUFDcEcsSUFBTyxtQkFBbUIsV0FBYSx3REFBd0QsQ0FBQyxDQUFDO0FBRWpHLElBQU0sa0JBQWtCO0lBNEN2Qjs7T0FFRztJQUNILFNBL0NLLGtCQUFrQjtRQTZCZixXQUFNLEdBQWlCLElBQUksS0FBSyxDQUFjLEVBQUUsQ0FBQyxDQUFDO1FBSWxELFVBQUssR0FBVSxDQUFDLENBQUM7UUFDakIsU0FBSSxHQUFXLEtBQUssQ0FBQztRQUtyQixlQUFVLEdBQVUsQ0FBQyxDQUFDO1FBQ3RCLGVBQVUsR0FBVSxDQUFDLENBQUM7UUFTN0IsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUVEOztPQUVHO0lBQ0ssaUNBQUksR0FBWjtRQUVDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNsQixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEIsQUFDQSxrQkFEa0I7UUFDbEIsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNuQixJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDdEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssdUNBQVUsR0FBbEI7UUFFQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7UUFFekIsQUFDQSwyQ0FEMkM7UUFDM0MsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQzNCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUM7UUFFcEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLGVBQWUsRUFBRSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRS9CLEFBQ0EsMkNBRDJDO1FBQzNDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUNuRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQztRQUN6QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQ7O09BRUc7SUFDSyx1Q0FBVSxHQUFsQjtRQUVDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDckIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUV2QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQ0Y7Ozs7Ozs7Ozs7Ozs7Ozs7TUFnQkU7SUFDRDs7T0FFRztJQUNLLDBDQUFhLEdBQXJCO1FBRUMscUxBQXFMO1FBRXJMLEFBSUEscUJBSnFCO1FBQ3JCLGdFQUFnRTtRQUNoRSx5RkFBeUY7WUFFckYsUUFBUSxHQUF5QixJQUFJLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUNoRyxRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUMxQixRQUFRLENBQUMsaUJBQWlCLEdBQUcsR0FBRyxDQUFDO1FBRWpDLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO1FBRTNDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUM7UUFDOUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNuRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsY0FBYyxDQUFDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBRW5ELElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUMxQyxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFDeEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNsRCxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7UUFDM0MsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztRQUUvQixJQUFJLENBQUMsdUJBQXVCLEdBQUcsSUFBSSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsQ0FBQztRQUN0RixJQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFFcEgsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDL0MsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7UUFDckUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUM7UUFDdkUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDO1FBQ2xELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUN2RCxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUN2QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNsQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztRQUNoRCxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU8sa0RBQXFCLEdBQTdCLFVBQThCLFlBQXVCLEVBQUUsUUFBaUIsRUFBRSxTQUErQixFQUFFLFFBQTRCLEVBQUUsZUFBa0M7UUFFMUssSUFBSSxrQkFBa0IsR0FBeUIsZUFBZSxDQUFDLGVBQWUsQ0FBQztRQUMvRSxJQUFJLGlCQUFpQixHQUF5QixlQUFlLENBQUMsY0FBYyxDQUFDO1FBRTdFLElBQUksSUFBSSxHQUFVLE1BQU0sR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLGtCQUFrQixHQUFHLFFBQVEsR0FBRyxpQkFBaUIsR0FBRyxRQUFRLEdBQzNHLE1BQU0sR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLFNBQVMsR0FBRyxNQUFNLEdBQUcsU0FBUyxHQUFHLE1BQU0sQ0FBQztRQUV2RSxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVPLG1EQUFzQixHQUE5QixVQUErQixZQUF1QixFQUFFLFFBQWlCLEVBQUUsU0FBK0IsRUFBRSxRQUE0QixFQUFFLGVBQWtDO1FBRTNLLElBQUksa0JBQWtCLEdBQXlCLGVBQWUsQ0FBQyxlQUFlLENBQUM7UUFDL0UsSUFBSSxpQkFBaUIsR0FBeUIsZUFBZSxDQUFDLGNBQWMsQ0FBQztRQUM3RSxJQUFJLElBQUksR0FBeUIsUUFBUSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDdEUsUUFBUSxDQUFDLHFCQUFxQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUV4QyxJQUFJLElBQUksR0FBVSxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxrQkFBa0IsR0FBRyxRQUFRLEdBQUcsaUJBQWlCLEdBQUcsUUFBUSxHQUNwRyxNQUFNLEdBQUcsSUFBSSxHQUFHLElBQUksR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUNsQyxNQUFNLEdBQUcsU0FBUyxHQUFHLE1BQU0sR0FBRyxTQUFTLEdBQUcsTUFBTSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7UUFFaEUsUUFBUSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXZDLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDYixDQUFDO0lBRUQ7O09BRUc7SUFDSyx3Q0FBVyxHQUFuQjtRQUVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxzQkFBc0IsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFekMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUM7UUFDeEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUNuRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDbkIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRXZDLElBQUksQ0FBQyxLQUFLLEdBQVUsSUFBSSxxQkFBcUIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQzVFLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7UUFFMUMsSUFBSSxDQUFDLE1BQU0sR0FBVSxJQUFJLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDN0UsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztRQUUxQyxJQUFJLENBQUMsVUFBVSxHQUFVLElBQUkscUJBQXFCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNqRixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUM7UUFDbkQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHNCQUFzQixFQUFFLENBQUM7UUFDbEQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbkMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFN0MsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUN6RCxDQUFDO0lBRUQ7O09BRUc7SUFDSywwQ0FBYSxHQUFyQjtRQUFBLGlCQXlDQztRQXZDQSxNQUFNLENBQUMsUUFBUSxHQUFJLFVBQUMsS0FBYSxJQUFLLE9BQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQztRQUUzRCxRQUFRLENBQUMsV0FBVyxHQUFHLFVBQUMsS0FBZ0IsSUFBSyxPQUFBLEtBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEVBQXZCLENBQXVCLENBQUM7UUFDckUsUUFBUSxDQUFDLFNBQVMsR0FBRyxVQUFDLEtBQWdCLElBQUssT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxFQUFyQixDQUFxQixDQUFDO1FBQ2pFLFFBQVEsQ0FBQyxXQUFXLEdBQUcsVUFBQyxLQUFnQixJQUFLLE9BQUEsS0FBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBdkIsQ0FBdUIsQ0FBQztRQUNyRSxRQUFRLENBQUMsWUFBWSxHQUFFLFVBQUMsS0FBcUIsSUFBSyxPQUFBLEtBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQXhCLENBQXdCLENBQUM7UUFHM0UsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBRWhCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7UUFFcEIsWUFBWSxDQUFDLGdCQUFnQixDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxVQUFDLEtBQWlCLElBQUssT0FBQSxLQUFJLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLEVBQTlCLENBQThCLENBQUMsQ0FBQztRQUVwSCxBQUNBLG9EQURvRDtZQUNoRCxhQUFhLEdBQWlCLElBQUksYUFBYSxFQUFFLENBQUM7UUFDdEQsYUFBYSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1FBRW5ELEFBQ0EscUJBRHFCO1FBQ3JCLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsa0NBQWtDLENBQUMsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUVyRixBQUNBLGdCQURnQjtRQUNoQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQztRQUMxRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FBQztRQUMxRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztRQUNsRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLG9DQUFvQyxDQUFDLENBQUMsQ0FBQztRQUN4RSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDRDQUE0QyxDQUFDLENBQUMsQ0FBQztRQUVoRixBQUNBLGdCQURnQjtRQUNoQixZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQztRQUNqRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztRQUNsRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztRQUNsRSxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVSxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7O09BRUc7SUFDSyx5Q0FBWSxHQUFwQixVQUFxQixFQUFTO1FBRTdCLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO1FBRWpCLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxJQUFJLEdBQUcsQ0FBQztRQUM1QixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDO1FBRXRDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUUvQixJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUNwQixDQUFDO0lBRU8seUNBQVksR0FBcEI7UUFFQyxJQUFJLGVBQWUsR0FBVyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBRWhELElBQUksaUJBQWlCLEdBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMzRSxJQUFJLE9BQU8sR0FBVSxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUM7UUFDL0QsSUFBSSxPQUFPLEdBQVUsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUMsQ0FBQyxDQUFDO1FBRWhFLElBQUksbUJBQW1CLEdBQVksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMvRSxJQUFJLFdBQVcsR0FBVSxHQUFHLEdBQUcsTUFBTSxDQUFDLFdBQVcsR0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7UUFDeEUsSUFBSSxXQUF1QixDQUFDO1FBRTVCLElBQUksQ0FBQyxZQUFZLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLGlCQUFpQixDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxHQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxPQUFPLEdBQUcsT0FBTyxHQUFDLE9BQU8sQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1FBRTFQLEFBQ0EseUJBRHlCO1FBQ3pCLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksZUFBZSxDQUFDLENBQUMsQ0FBQztZQUMxQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDcEQsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzdCLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQztvQkFDZixXQUFXLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDO1lBQ3BELENBQUM7UUFDRixDQUFDO1FBRUQsQUFDQSx1QkFEdUI7UUFDdkIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7WUFDdkIsSUFBSSxjQUFjLEdBQVMsSUFBSSxLQUFLLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ3ZELEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO2dCQUNwRCxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDO29CQUNmLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUMsR0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxHQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQ3BNLENBQUM7UUFDRixDQUFDO0lBQ0YsQ0FBQztJQUVEOztPQUVHO0lBQ0ssK0NBQWtCLEdBQTFCLFVBQTJCLEtBQWlCO1FBRTNDLE1BQU0sQ0FBQSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBRWxCLEtBQUssa0NBQWtDO2dCQUN0QyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksaUJBQWlCLENBQW1CLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFNUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQzNDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDakMsS0FBSyxDQUFDO1lBR1AsS0FBSyxzQ0FBc0M7Z0JBQzFDLElBQUksa0JBQWtCLEdBQWlCLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2dCQUN2RixrQkFBa0IsQ0FBQyxXQUFXLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxFQUFFLElBQUksS0FBSyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsR0FBRyxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUV4SixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sR0FBRyxJQUFJLGVBQWUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNyRSxLQUFLLENBQUM7WUFDUCxLQUFLLHNDQUFzQztnQkFDMUMsSUFBSSxpQkFBaUIsR0FBaUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDdEUsaUJBQWlCLENBQUMsY0FBYyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxJQUFJLGNBQWMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNyRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRyxJQUFJLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2dCQUN6RSxLQUFLLENBQUM7WUFDUCxLQUFLLDhCQUE4QjtnQkFDbEMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEdBQUcsSUFBSSxlQUFlLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDckYsS0FBSyxDQUFDO1lBQ1AsS0FBSyxvQ0FBb0M7Z0JBQ3hDLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxHQUFHLElBQUksZUFBZSxDQUFpQixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLEtBQUssQ0FBQztZQUNQLEtBQUssNENBQTRDO2dCQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsR0FBRyxJQUFJLGVBQWUsQ0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxRixLQUFLLENBQUM7WUFHUCxLQUFLLDZCQUE2QjtnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hHLEtBQUssQ0FBQztZQUNQLEtBQUssNkJBQTZCO2dCQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFpQixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDaEcsS0FBSyxDQUFDO1lBQ1AsS0FBSyw2QkFBNkI7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqRyxLQUFLLENBQUM7WUFDUCxLQUFLLDZCQUE2QjtnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzdGLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUM3RixLQUFLLENBQUM7WUFDUCxLQUFLLDZCQUE2QjtnQkFDakMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzFGLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMzRixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFpQixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDN0YsS0FBSyxDQUFDO1lBQ1AsS0FBSyw2QkFBNkI7Z0JBQ2pDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNoRyxLQUFLLENBQUM7WUFDUCxLQUFLLDhCQUE4QjtnQkFDbEMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEdBQUcsSUFBSSxlQUFlLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDL0YsS0FBSyxDQUFDO1lBQ1AsS0FBSyw4QkFBOEI7Z0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQWlCLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUMxRixLQUFLLENBQUM7WUFDUCxLQUFLLDhCQUE4QjtnQkFDbEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBaUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ2hHLEtBQUssQ0FBQztRQUNSLENBQUM7SUFDRixDQUFDO0lBRUQ7O09BRUc7SUFDSyx3Q0FBVyxHQUFuQixVQUFvQixLQUFnQjtRQUVuQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7UUFDbkQsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDO1FBQ3JELElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDaEMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7SUFDbEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssc0NBQVMsR0FBakIsVUFBa0IsS0FBZ0I7UUFFakMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7SUFDbkIsQ0FBQztJQUVEOztPQUVHO0lBQ0ssd0NBQVcsR0FBbkIsVUFBb0IsS0FBZ0I7UUFFckMsd0VBQXdFO1FBQ3hFLEVBQUU7UUFDRiw0RUFBNEU7UUFDNUUsZ0RBQWdEO1FBQ2hELGdEQUFnRDtRQUNoRCxxQ0FBcUM7UUFDckMscUNBQXFDO1FBQ3JDLG1CQUFtQjtRQUNuQixFQUFFO1FBQ0YsNENBQTRDO1FBQzVDLDRDQUE0QztRQUM1QyxFQUFFO1FBQ0YseUNBQXlDO1FBQ3pDLDZDQUE2QztRQUM3QyxxRUFBcUU7UUFDckUsc0VBQXNFO1FBQ3RFLDRDQUE0QztRQUM1Qyx5Q0FBeUM7UUFDekMsbUJBQW1CO1FBQ25CLEVBQUU7UUFDRiwrREFBK0Q7UUFDL0QscUVBQXFFO1FBQ3JFLHFFQUFxRTtRQUNyRSwwRUFBMEU7UUFDMUUscUVBQXFFO1FBQ3JFLGVBQWU7UUFFZixBQVFFLG9DQVJrQztRQUNwQyw2REFBNkQ7UUFDN0QsOERBQThEO1FBQzlELGdDQUFnQztRQUNoQyw2RkFBNkY7UUFDN0YsK0ZBQStGO1FBQy9GLGVBQWU7UUFFYixFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEdBQUcsR0FBRyxHQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQztZQUMzRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxHQUFHLEdBQUcsR0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDOUYsQ0FBQztJQUNGLENBQUM7SUFFRDs7T0FFRztJQUNLLHlDQUFZLEdBQXBCLFVBQXFCLEtBQXFCO1FBRXpDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQztRQUVuRCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztZQUN4QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztRQUN0QyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0oscURBQXFEO0lBQ3JELFdBQVc7SUFDWCxvQ0FBb0M7SUFDcEMsZUFBZTtJQUNmLHNDQUFzQztJQUN0QyxnRkFBZ0Y7SUFDaEYsd0VBQXdFO0lBQ3hFLDhCQUE4QjtJQUM5Qiw2RUFBNkU7SUFDN0UsRUFBRTtJQUNGLDhDQUE4QztJQUM5QyxxRUFBcUU7SUFDckUsc0VBQXNFO0lBQ3RFLHVCQUF1QjtJQUN2Qiw0QkFBNEI7SUFDNUIsZUFBZTtJQUNmLFdBQVc7SUFDWCxFQUFFO0lBRUQ7O09BRUc7SUFDSyxxQ0FBUSxHQUFoQixVQUFpQixLQUFvQjtRQUFwQixxQkFBb0IsR0FBcEIsWUFBb0I7UUFFcEMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQVcsQ0FBQyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFXLENBQUMsQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBTyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFNLE1BQU0sQ0FBQyxXQUFXLENBQUM7SUFDMUMsQ0FBQztJQUNGLHlCQUFDO0FBQUQsQ0E3ZkEsQUE2ZkMsSUFBQTtBQUVELElBQU0sV0FBVztJQVloQjs7T0FFRztJQUNILFNBZkssV0FBVyxDQWVKLFVBQXdCLEVBQUUsSUFBVyxFQUFFLFFBQWUsRUFBRSxPQUFjLEVBQUUsS0FBVztRQWJ2RixjQUFTLEdBQVUsSUFBSSxDQUFDO1FBZS9CLElBQUksRUFBRSxHQUFpQixJQUFJLGFBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2hHLEVBQUUsQ0FBQyxXQUFXLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQUUsRUFBRSxrQkFBa0IsQ0FBQyxHQUFHLEVBQUUsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFM0csSUFBSSxpQkFBaUIsR0FBa0IsSUFBSSxjQUFjLENBQUMsSUFBSSxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRixpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsT0FBTyxHQUFDLEdBQUcsQ0FBQztRQUN0QyxpQkFBaUIsQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBQ3ZDLEFBRUEsZ0RBRmdEO1FBRWhELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMzQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLEdBQUMsSUFBSSxDQUFDLFNBQVMsR0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFDLElBQUksQ0FBQyxTQUFTLEdBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxZQUFZLENBQUM7UUFDOUQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFFdkIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7SUFDL0IsQ0FBQztJQUNGLGtCQUFDO0FBQUQsQ0F0Q0EsQUFzQ0MsSUFBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFFZixJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFDMUIsQ0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qXG5cbkdsb2JlIGV4YW1wbGUgaW4gQXdheTNkXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGNyZWF0ZSBhIHRleHR1cmVkIHNwaGVyZS5cbkhvdyB0byB1c2UgY29udGFpbmVycyB0byByb3RhdGUgYW4gb2JqZWN0LlxuSG93IHRvIHVzZSB0aGUgUGhvbmdCaXRtYXBNYXRlcmlhbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hblxucm9iQGluZmluaXRldHVydGxlcy5jby51a1xuaHR0cDovL3d3dy5pbmZpbml0ZXR1cnRsZXMuY28udWtcblxuVGhpcyBjb2RlIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUg4oCcU29mdHdhcmXigJ0pLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIOKAnEFTIElT4oCdLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cblxuKi9cbmltcG9ydCBCaXRtYXBJbWFnZTJEXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9CaXRtYXBJbWFnZTJEXCIpO1xuaW1wb3J0IEJpdG1hcEltYWdlQ3ViZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvQml0bWFwSW1hZ2VDdWJlXCIpO1xuaW1wb3J0IEJpdG1hcEltYWdlQ2hhbm5lbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0JpdG1hcEltYWdlQ2hhbm5lbFwiKTtcbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2RhdGEvQmxlbmRNb2RlXCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgQ29sb3JUcmFuc2Zvcm1cdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL0NvbG9yVHJhbnNmb3JtXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgUG9pbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9Qb2ludFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IExvYWRlckNvbnRleHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0xvYWRlckNvbnRleHRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTFJlcXVlc3RcIik7XG5pbXBvcnQgUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIik7XG5cbmltcG9ydCBEaXNwbGF5T2JqZWN0Q29udGFpbmVyXHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL0Rpc3BsYXlPYmplY3RDb250YWluZXJcIik7XG5pbXBvcnQgU2NlbmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9TY2VuZVwiKTtcbmltcG9ydCBMb2FkZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBIb3ZlckNvbnRyb2xsZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9Ib3ZlckNvbnRyb2xsZXJcIik7XG5pbXBvcnQgT3JpZW50YXRpb25Nb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9PcmllbnRhdGlvbk1vZGVcIik7XG5pbXBvcnQgQWxpZ25tZW50TW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQWxpZ25tZW50TW9kZVwiKTtcbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FtZXJhXCIpO1xuaW1wb3J0IEJpbGxib2FyZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQmlsbGJvYXJkXCIpO1xuaW1wb3J0IE1lc2hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IFBvaW50TGlnaHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZVByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVTcGhlcmVQcmVmYWJcIik7XG5pbXBvcnQgU2luZ2xlQ3ViZVRleHR1cmVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdGV4dHVyZXMvU2luZ2xlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgU2luZ2xlMkRUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdGV4dHVyZXMvU2luZ2xlMkRUZXh0dXJlXCIpO1xuaW1wb3J0IENhc3RcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi91dGlscy9DYXN0XCIpO1xuXG5pbXBvcnQgRGVmYXVsdFJlbmRlcmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuaW1wb3J0IFNoYWRlckJhc2VcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL3NoYWRlcnMvU2hhZGVyQmFzZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckVsZW1lbnRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL3NoYWRlcnMvU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyQ2FjaGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvc2hhZGVycy9TaGFkZXJSZWdpc3RlckNhY2hlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRGF0YVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9zaGFkZXJzL1NoYWRlclJlZ2lzdGVyRGF0YVwiKTtcblxuaW1wb3J0IE1ldGhvZE1hdGVyaWFsXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9NZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBNZXRob2RWT1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL2RhdGEvTWV0aG9kVk9cIik7XG5pbXBvcnQgRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL0RpZmZ1c2VDb21wb3NpdGVNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJDb21wb3NpdGVNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TcGVjdWxhckNvbXBvc2l0ZU1ldGhvZFwiKTtcbmltcG9ydCBEaWZmdXNlQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL0RpZmZ1c2VCYXNpY01ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhckJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TcGVjdWxhckJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyRnJlc25lbE1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NwZWN1bGFyRnJlc25lbE1ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhclBob25nTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TcGVjdWxhclBob25nTWV0aG9kXCIpO1xuXG5jbGFzcyBJbnRlcm1lZGlhdGVfR2xvYmVcbntcblx0Ly9lbmdpbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgc2NlbmU6U2NlbmU7XG5cdHByaXZhdGUgY2FtZXJhOkNhbWVyYTtcblx0cHJpdmF0ZSB2aWV3OlZpZXc7XG5cdHByaXZhdGUgY2FtZXJhQ29udHJvbGxlcjpIb3ZlckNvbnRyb2xsZXI7XG5cblx0Ly9tYXRlcmlhbCBvYmplY3RzXG5cdHByaXZhdGUgc3VuTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgZ3JvdW5kTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgY2xvdWRNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgYXRtb3NwaGVyZURpZmZ1c2VNZXRob2Q6RGlmZnVzZUJhc2ljTWV0aG9kO1xuXHRwcml2YXRlIGF0bW9zcGhlcmVTcGVjdWxhck1ldGhvZDpTcGVjdWxhckJhc2ljTWV0aG9kO1xuXHRwcml2YXRlIGN1YmVUZXh0dXJlOlNpbmdsZUN1YmVUZXh0dXJlO1xuXG5cdC8vc2NlbmUgb2JqZWN0c1xuXHRwcml2YXRlIHN1bjpCaWxsYm9hcmQ7XG5cdHByaXZhdGUgZWFydGg6TWVzaDtcblx0cHJpdmF0ZSBjbG91ZHM6TWVzaDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlOk1lc2g7XG5cdHByaXZhdGUgdGlsdENvbnRhaW5lcjpEaXNwbGF5T2JqZWN0Q29udGFpbmVyO1xuXHRwcml2YXRlIG9yYml0Q29udGFpbmVyOkRpc3BsYXlPYmplY3RDb250YWluZXI7XG5cdHByaXZhdGUgc2t5Qm94OlNreWJveDtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSBsaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIGxpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXHRwcml2YXRlIGZsYXJlczpGbGFyZU9iamVjdFtdID0gbmV3IEFycmF5PEZsYXJlT2JqZWN0PigxMik7XG5cblx0Ly9uYXZpZ2F0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3ZlOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBsYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RUaWx0QW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RNb3VzZVg6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RNb3VzZVk6bnVtYmVyO1xuXHRwcml2YXRlIG1vdXNlTG9ja1g6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3VzZUxvY2tZOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW91c2VMb2NrZWQ6Ym9vbGVhbjtcblx0cHJpdmF0ZSBmbGFyZVZpc2libGU6Ym9vbGVhbjtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHR0aGlzLmluaXRMaWdodHMoKTtcblx0XHQvL2luaXRMZW5zRmxhcmUoKTtcblx0XHR0aGlzLmluaXRNYXRlcmlhbHMoKTtcblx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnNjZW5lID0gbmV3IFNjZW5lKCk7XG5cblx0XHQvL3NldHVwIGNhbWVyYSBmb3Igb3B0aW1hbCBza3lib3ggcmVuZGVyaW5nXG5cdFx0dGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XG5cdFx0dGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIgPSAxMDAwMDA7XG5cblx0XHR0aGlzLnZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKCkpO1xuXHRcdHRoaXMudmlldy5zY2VuZSA9IHRoaXMuc2NlbmU7XG5cdFx0dGhpcy52aWV3LmNhbWVyYSA9IHRoaXMuY2FtZXJhO1xuXG5cdFx0Ly9zZXR1cCBjb250cm9sbGVyIHRvIGJlIHVzZWQgb24gdGhlIGNhbWVyYVxuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlciA9IG5ldyBIb3ZlckNvbnRyb2xsZXIodGhpcy5jYW1lcmEsIG51bGwsIDAsIDAsIDYwMCwgLTkwLCA5MCk7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmF1dG9VcGRhdGUgPSBmYWxzZTtcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIueUZhY3RvciA9IDE7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlnaHRzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHR0aGlzLmxpZ2h0LnggPSAxMDAwMDtcblx0XHR0aGlzLmxpZ2h0LmFtYmllbnQgPSAxO1xuXHRcdHRoaXMubGlnaHQuZGlmZnVzZSA9IDI7XG5cblx0XHR0aGlzLmxpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKFt0aGlzLmxpZ2h0XSk7XG5cdH1cbi8qXG5cdHByaXZhdGUgaW5pdExlbnNGbGFyZSgpOnZvaWRcblx0e1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUxMCgpLCAgMy4yLCAtMC4wMSwgMTQ3LjkpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMTEoKSwgIDYsICAgIDAsICAgICAzMC42KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICAyLCAgICAwLCAgICAgMjUuNSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgNCwgICAgMCwgICAgIDE3Ljg1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTEyKCksICAwLjQsICAwLjMyLCAgMjIuOTUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNigpLCAgIDEsICAgIDAuNjgsICAyMC40KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTIoKSwgICAxLjI1LCAxLjEsICAgNDguNDUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMygpLCAgIDEuNzUsIDEuMzcsICAgNy42NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU0KCksICAgMi43NSwgMS44NSwgIDEyLjc1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTgoKSwgICAwLjUsICAyLjIxLCAgMzMuMTUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNigpLCAgIDQsICAgIDIuNSwgICAxMC40KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICAxMCwgICAyLjY2LCAgNTApKTtcblx0fVxuKi9cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIG1hdGVyaWFsc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWxzKCk6dm9pZFxuXHR7XG5cdFx0Ly90aGlzLmN1YmVUZXh0dXJlID0gbmV3IEJpdG1hcEN1YmVUZXh0dXJlKENhc3QuYml0bWFwRGF0YShQb3NYKSwgQ2FzdC5iaXRtYXBEYXRhKE5lZ1gpLCBDYXN0LmJpdG1hcERhdGEoUG9zWSksIENhc3QuYml0bWFwRGF0YShOZWdZKSwgQ2FzdC5iaXRtYXBEYXRhKFBvc1opLCBDYXN0LmJpdG1hcERhdGEoTmVnWikpO1xuXG5cdFx0Ly9hZGp1c3Qgc3BlY3VsYXIgbWFwXG5cdFx0Ly92YXIgc3BlY0JpdG1hcDpCaXRtYXBJbWFnZTJEID0gQ2FzdC5iaXRtYXBEYXRhKEVhcnRoU3BlY3VsYXIpO1xuXHRcdC8vc3BlY0JpdG1hcC5jb2xvclRyYW5zZm9ybShzcGVjQml0bWFwLnJlY3QsIG5ldyBDb2xvclRyYW5zZm9ybSgxLCAxLCAxLCAxLCA2NCwgNjQsIDY0KSk7XG5cblx0XHR2YXIgc3BlY3VsYXI6U3BlY3VsYXJGcmVzbmVsTWV0aG9kID0gbmV3IFNwZWN1bGFyRnJlc25lbE1ldGhvZCh0cnVlLCBuZXcgU3BlY3VsYXJQaG9uZ01ldGhvZCgpKTtcblx0XHRzcGVjdWxhci5mcmVzbmVsUG93ZXIgPSAxO1xuXHRcdHNwZWN1bGFyLm5vcm1hbFJlZmxlY3RhbmNlID0gMC4xO1xuXG5cdFx0dGhpcy5zdW5NYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuc3VuTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkFERDtcblxuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kID0gc3BlY3VsYXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5nbG9zcyA9IDU7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhciA9IDE7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmRpZmZ1c2VNZXRob2QubXVsdGlwbHkgPSBmYWxzZTtcblxuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbWJpZW50Q29sb3IgPSAweDFiMjA0ODtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuc3BlY3VsYXIgPSAwO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbWJpZW50ID0gMTtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZURpZmZ1c2VNZXRob2QgPSBuZXcgRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZCh0aGlzLm1vZHVsYXRlRGlmZnVzZU1ldGhvZCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlU3BlY3VsYXJNZXRob2QgPSBuZXcgU3BlY3VsYXJDb21wb3NpdGVNZXRob2QodGhpcy5tb2R1bGF0ZVNwZWN1bGFyTWV0aG9kLCBuZXcgU3BlY3VsYXJQaG9uZ01ldGhvZCgpKTtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZGlmZnVzZU1ldGhvZCA9IHRoaXMuYXRtb3NwaGVyZURpZmZ1c2VNZXRob2Q7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuc3BlY3VsYXJNZXRob2QgPSB0aGlzLmF0bW9zcGhlcmVTcGVjdWxhck1ldGhvZDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuQUREO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5zcGVjdWxhciA9IDAuNTtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5nbG9zcyA9IDU7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYW1iaWVudENvbG9yID0gMDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSAweDE2NzFjYztcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5hbWJpZW50ID0gMTtcblx0fVxuXG5cdHByaXZhdGUgbW9kdWxhdGVEaWZmdXNlTWV0aG9kKHNoYWRlck9iamVjdDpTaGFkZXJCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgdGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgcmVnQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgdmlld0RpckZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy52aWV3RGlyRnJhZ21lbnQ7XG5cdFx0dmFyIG5vcm1hbEZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy5ub3JtYWxGcmFnbWVudDtcblxuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiZHAzIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB2aWV3RGlyRnJhZ21lbnRSZWcgKyBcIi54eXosIFwiICsgbm9ybWFsRnJhZ21lbnRSZWcgKyBcIi54eXpcXG5cIiArXG5cdFx0XHRcIm11bCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53XFxuXCI7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdHByaXZhdGUgbW9kdWxhdGVTcGVjdWxhck1ldGhvZChzaGFkZXJPYmplY3Q6U2hhZGVyQmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHRhcmdldFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHJlZ0NhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIHZpZXdEaXJGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMudmlld0RpckZyYWdtZW50O1xuXHRcdHZhciBub3JtYWxGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQ7XG5cdFx0dmFyIHRlbXA6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gcmVnQ2FjaGUuZ2V0RnJlZUZyYWdtZW50U2luZ2xlVGVtcCgpO1xuXHRcdHJlZ0NhY2hlLmFkZEZyYWdtZW50VGVtcFVzYWdlcyh0ZW1wLCAxKTtcblxuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiZHAzIFwiICsgdGVtcCArIFwiLCBcIiArIHZpZXdEaXJGcmFnbWVudFJlZyArIFwiLnh5eiwgXCIgKyBub3JtYWxGcmFnbWVudFJlZyArIFwiLnh5elxcblwiICtcblx0XHRcdFwibmVnIFwiICsgdGVtcCArIFwiLCBcIiArIHRlbXAgKyBcIlxcblwiICtcblx0XHRcdFwibXVsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRlbXAgKyBcIlxcblwiO1xuXG5cdFx0cmVnQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2UodGVtcCk7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lciA9IG5ldyBEaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmxpZ2h0KTtcblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMub3JiaXRDb250YWluZXIpO1xuXG5cdFx0dGhpcy5zdW4gPSBuZXcgQmlsbGJvYXJkKHRoaXMuc3VuTWF0ZXJpYWwpO1xuXHRcdHRoaXMuc3VuLndpZHRoID0gMzAwMDtcblx0XHR0aGlzLnN1bi5oZWlnaHQgPSAzMDAwO1xuXHRcdHRoaXMuc3VuLnBpdm90ID0gbmV3IFZlY3RvcjNEKDE1MDAsMTUwMCwwKTtcblx0XHR0aGlzLnN1bi5vcmllbnRhdGlvbk1vZGUgPSBPcmllbnRhdGlvbk1vZGUuQ0FNRVJBX1BMQU5FO1xuXHRcdHRoaXMuc3VuLmFsaWdubWVudE1vZGUgPSBBbGlnbm1lbnRNb2RlLlBJVk9UX1BPSU5UO1xuXHRcdHRoaXMuc3VuLnggPSAxMDAwMDtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuc3VuKTtcblxuXHRcdHRoaXMuZWFydGggPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMDAsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmVhcnRoLm1hdGVyaWFsID0gdGhpcy5ncm91bmRNYXRlcmlhbDtcblxuXHRcdHRoaXMuY2xvdWRzID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjAyLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5jbG91ZHMubWF0ZXJpYWwgPSB0aGlzLmNsb3VkTWF0ZXJpYWw7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmUgPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMTAsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmF0bW9zcGhlcmUubWF0ZXJpYWwgPSB0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbDtcblx0XHR0aGlzLmF0bW9zcGhlcmUuc2NhbGVYID0gLTE7XG5cblx0XHR0aGlzLnRpbHRDb250YWluZXIgPSBuZXcgRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5yb3RhdGlvblggPSAtMjM7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuZWFydGgpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmNsb3Vkcyk7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuYXRtb3NwaGVyZSk7XG5cblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMudGlsdENvbnRhaW5lcik7XG5cblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIubG9va0F0T2JqZWN0ID0gdGhpcy50aWx0Q29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKCk6dm9pZFxuXHR7XG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXdoZWVsPSAoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KSA9PiB0aGlzLm9uTW91c2VXaGVlbChldmVudCk7XG5cblxuXHRcdHRoaXMub25SZXNpemUoKTtcblxuXHRcdHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdFx0dGhpcy5fdGltZXIuc3RhcnQoKTtcblxuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG5cblx0XHQvL3NldHVwIHRoZSB1cmwgbWFwIGZvciB0ZXh0dXJlcyBpbiB0aGUgY3ViZW1hcCBmaWxlXG5cdFx0dmFyIGxvYWRlckNvbnRleHQ6TG9hZGVyQ29udGV4dCA9IG5ldyBMb2FkZXJDb250ZXh0KCk7XG5cdFx0bG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9zcGFjZV90ZXh0dXJlLmN1YmVcIiksIGxvYWRlckNvbnRleHQpO1xuXG5cdFx0Ly9nbG9iZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2Nsb3VkX2NvbWJpbmVkXzIwNDguanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9lYXJ0aF9zcGVjdWxhcl8yMDQ4LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvRWFydGhOb3JtYWwucG5nXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9sYW5kX2xpZ2h0c18xNjM4NC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2xhbmRfb2NlYW5faWNlXzIwNDhfbWF0Y2guanBnXCIpKTtcblxuXHRcdC8vZmxhcmUgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUyLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMy5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTQuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU2LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNy5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTguanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTExLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTIuanBnXCIpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0aW9uIGFuZCByZW5kZXIgbG9vcFxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZHQ6bnVtYmVyKTp2b2lkXG5cdHtcblx0XHR0aGlzLl90aW1lICs9IGR0O1xuXG5cdFx0dGhpcy5lYXJ0aC5yb3RhdGlvblkgKz0gMC4yO1xuXHRcdHRoaXMuY2xvdWRzLnJvdGF0aW9uWSArPSAwLjIxO1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIucm90YXRpb25ZICs9IDAuMDI7XG5cblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIudXBkYXRlKCk7XG5cblx0XHR0aGlzLnVwZGF0ZUZsYXJlcygpO1xuXG5cdFx0dGhpcy52aWV3LnJlbmRlcigpO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVGbGFyZXMoKTp2b2lkXG5cdHtcblx0XHR2YXIgZmxhcmVWaXNpYmxlT2xkOmJvb2xlYW4gPSB0aGlzLmZsYXJlVmlzaWJsZTtcblxuXHRcdHZhciBzdW5TY3JlZW5Qb3NpdGlvbjpWZWN0b3IzRCA9IHRoaXMudmlldy5wcm9qZWN0KHRoaXMuc3VuLnNjZW5lUG9zaXRpb24pO1xuXHRcdHZhciB4T2Zmc2V0Om51bWJlciA9IHN1blNjcmVlblBvc2l0aW9uLnggLSB3aW5kb3cuaW5uZXJXaWR0aC8yO1xuXHRcdHZhciB5T2Zmc2V0Om51bWJlciA9IHN1blNjcmVlblBvc2l0aW9uLnkgLSB3aW5kb3cuaW5uZXJIZWlnaHQvMjtcblxuXHRcdHZhciBlYXJ0aFNjcmVlblBvc2l0aW9uOlZlY3RvcjNEID0gdGhpcy52aWV3LnByb2plY3QodGhpcy5lYXJ0aC5zY2VuZVBvc2l0aW9uKTtcblx0XHR2YXIgZWFydGhSYWRpdXM6bnVtYmVyID0gMTkwICogd2luZG93LmlubmVySGVpZ2h0L2VhcnRoU2NyZWVuUG9zaXRpb24uejtcblx0XHR2YXIgZmxhcmVPYmplY3Q6RmxhcmVPYmplY3Q7XG5cblx0XHR0aGlzLmZsYXJlVmlzaWJsZSA9IChzdW5TY3JlZW5Qb3NpdGlvbi54ID4gMCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi54IDwgd2luZG93LmlubmVyV2lkdGggJiYgc3VuU2NyZWVuUG9zaXRpb24ueSA+IDAgJiYgc3VuU2NyZWVuUG9zaXRpb24ueSAgPCB3aW5kb3cuaW5uZXJIZWlnaHQgJiYgc3VuU2NyZWVuUG9zaXRpb24ueiA+IDAgJiYgTWF0aC5zcXJ0KHhPZmZzZXQqeE9mZnNldCArIHlPZmZzZXQqeU9mZnNldCkgPiBlYXJ0aFJhZGl1cyk7XG5cblx0XHQvL3VwZGF0ZSBmbGFyZSB2aXNpYmlsaXR5XG5cdFx0aWYgKHRoaXMuZmxhcmVWaXNpYmxlICE9IGZsYXJlVmlzaWJsZU9sZCkge1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgdGhpcy5mbGFyZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZmxhcmVPYmplY3QgPSB0aGlzLmZsYXJlc1tpXTtcblx0XHRcdFx0aWYgKGZsYXJlT2JqZWN0KVxuXHRcdFx0XHRcdGZsYXJlT2JqZWN0LmJpbGxib2FyZC52aXNpYmxlID0gdGhpcy5mbGFyZVZpc2libGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly91cGRhdGUgZmxhcmUgcG9zaXRpb25cblx0XHRpZiAodGhpcy5mbGFyZVZpc2libGUpIHtcblx0XHRcdHZhciBmbGFyZURpcmVjdGlvbjpQb2ludCA9IG5ldyBQb2ludCh4T2Zmc2V0LCB5T2Zmc2V0KTtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IHRoaXMuZmxhcmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGZsYXJlT2JqZWN0ID0gdGhpcy5mbGFyZXNbaV07XG5cdFx0XHRcdGlmIChmbGFyZU9iamVjdClcblx0XHRcdFx0XHRmbGFyZU9iamVjdC5iaWxsYm9hcmQudHJhbnNmb3JtLnBvc2l0aW9uID0gdGhpcy52aWV3LnVucHJvamVjdChzdW5TY3JlZW5Qb3NpdGlvbi54IC0gZmxhcmVEaXJlY3Rpb24ueCpmbGFyZU9iamVjdC5wb3NpdGlvbiwgc3VuU2NyZWVuUG9zaXRpb24ueSAtIGZsYXJlRGlyZWN0aW9uLnkqZmxhcmVPYmplY3QucG9zaXRpb24sIDEwMCAtIGkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBMaXN0ZW5lciBmdW5jdGlvbiBmb3IgcmVzb3VyY2UgY29tcGxldGUgZXZlbnQgb24gYXNzZXQgbGlicmFyeVxuXHQgKi9cblx0cHJpdmF0ZSBvblJlc291cmNlQ29tcGxldGUoZXZlbnQ6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2goZXZlbnQudXJsKSB7XG5cdFx0XHQvL2Vudmlyb25tZW50IHRleHR1cmVcblx0XHRcdGNhc2UgJ2Fzc2V0cy9za3lib3gvc3BhY2VfdGV4dHVyZS5jdWJlJzpcblx0XHRcdFx0dGhpcy5jdWJlVGV4dHVyZSA9IG5ldyBTaW5nbGVDdWJlVGV4dHVyZSg8Qml0bWFwSW1hZ2VDdWJlPiBldmVudC5hc3NldHNbMF0pO1xuXG5cdFx0XHRcdHRoaXMuc2t5Qm94ID0gbmV3IFNreWJveCh0aGlzLmN1YmVUZXh0dXJlKTtcblx0XHRcdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnNreUJveCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvL2dsb2JlIHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2Nsb3VkX2NvbWJpbmVkXzIwNDguanBnXCIgOlxuXHRcdFx0XHR2YXIgY2xvdWRCaXRtYXBJbWFnZTJEOkJpdG1hcEltYWdlMkQgPSBuZXcgQml0bWFwSW1hZ2UyRCgyMDQ4LCAxMDI0LCB0cnVlLCAweEZGRkZGRkZGKTtcblx0XHRcdFx0Y2xvdWRCaXRtYXBJbWFnZTJELmNvcHlDaGFubmVsKDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF0sIGNsb3VkQml0bWFwSW1hZ2UyRC5yZWN0LCBuZXcgUG9pbnQoKSwgQml0bWFwSW1hZ2VDaGFubmVsLlJFRCwgQml0bWFwSW1hZ2VDaGFubmVsLkFMUEhBKTtcblxuXHRcdFx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwudGV4dHVyZSA9IG5ldyBTaW5nbGUyRFRleHR1cmUoY2xvdWRCaXRtYXBJbWFnZTJEKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2VhcnRoX3NwZWN1bGFyXzIwNDguanBnXCIgOlxuXHRcdFx0XHR2YXIgc3BlY0JpdG1hcEltYWdlMkQ6Qml0bWFwSW1hZ2UyRCA9IDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF07XG5cdFx0XHRcdHNwZWNCaXRtYXBJbWFnZTJELmNvbG9yVHJhbnNmb3JtKHNwZWNCaXRtYXBJbWFnZTJELnJlY3QsIG5ldyBDb2xvclRyYW5zZm9ybSgxLCAxLCAxLCAxLCA2NCwgNjQsIDY0KSk7XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSBuZXcgU2luZ2xlMkRUZXh0dXJlKHNwZWNCaXRtYXBJbWFnZTJEKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL0VhcnRoTm9ybWFsLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5ub3JtYWxNYXAgPSBuZXcgU2luZ2xlMkRUZXh0dXJlKDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvbGFuZF9saWdodHNfMTYzODQuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnRleHR1cmUgPSBuZXcgU2luZ2xlMkRUZXh0dXJlKDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvbGFuZF9vY2Vhbl9pY2VfMjA0OF9tYXRjaC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuZGlmZnVzZVRleHR1cmUgPSBuZXcgU2luZ2xlMkRUZXh0dXJlKDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF0pO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9mbGFyZSB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUyLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbNl0gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgMS4yNSwgMS4xLCA0OC40NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUzLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbN10gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgMS43NSwgMS4zNywgNy42NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU0LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbOF0gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgMi43NSwgMS44NSwgMTIuNzUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzVdID0gbmV3IEZsYXJlT2JqZWN0KDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF0sIDEsIDAuNjgsIDIwLjQsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1sxMF0gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgNCwgMi41LCAxMC40LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTcuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1syXSA9IG5ldyBGbGFyZU9iamVjdCg8Qml0bWFwSW1hZ2UyRD4gZXZlbnQuYXNzZXRzWzBdLCAyLCAwLCAyNS41LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbM10gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgNCwgMCwgMTcuODUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1sxMV0gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgMTAsIDIuNjYsIDUwLCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTguanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s5XSA9IG5ldyBGbGFyZU9iamVjdCg8Qml0bWFwSW1hZ2UyRD4gZXZlbnQuYXNzZXRzWzBdLCAwLjUsIDIuMjEsIDMzLjE1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEwLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5zdW5NYXRlcmlhbC50ZXh0dXJlID0gbmV3IFNpbmdsZTJEVGV4dHVyZSg8Qml0bWFwSW1hZ2UyRD4gZXZlbnQuYXNzZXRzWzBdKTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbMF0gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgMy4yLCAtMC4wMSwgMTAwLCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTExLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbMV0gPSBuZXcgRmxhcmVPYmplY3QoPEJpdG1hcEltYWdlMkQ+IGV2ZW50LmFzc2V0c1swXSwgNiwgMCwgMzAuNiwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzRdID0gbmV3IEZsYXJlT2JqZWN0KDxCaXRtYXBJbWFnZTJEPiBldmVudC5hc3NldHNbMF0sIDAuNCwgMC4zMiwgMjIuOTUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgZG93biBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLmxhc3RQYW5BbmdsZSA9IHRoaXMuY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZTtcblx0XHR0aGlzLmxhc3RUaWx0QW5nbGUgPSB0aGlzLmNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMubGFzdE1vdXNlWCA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy5sYXN0TW91c2VZID0gZXZlbnQuY2xpZW50WTtcblx0XHR0aGlzLm1vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLm1vdmUgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBtb3ZlIGxpc3RlbmVyIGZvciBtb3VzZUxvY2tcblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG4vLyAgICAgICAgICAgIGlmIChzdGFnZS5kaXNwbGF5U3RhdGUgPT0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU4pIHtcbi8vXG4vLyAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NrZWQgJiYgKGxhc3RNb3VzZVggIT0gMCB8fCBsYXN0TW91c2VZICE9IDApKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgZS5tb3ZlbWVudFggKz0gbGFzdE1vdXNlWDtcbi8vICAgICAgICAgICAgICAgICAgICBlLm1vdmVtZW50WSArPSBsYXN0TW91c2VZO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVggPSAwO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVkgPSAwO1xuLy8gICAgICAgICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgICAgICAgIG1vdXNlTG9ja1ggKz0gZS5tb3ZlbWVudFg7XG4vLyAgICAgICAgICAgICAgICBtb3VzZUxvY2tZICs9IGUubW92ZW1lbnRZO1xuLy9cbi8vICAgICAgICAgICAgICAgIGlmICghc3RhZ2UubW91c2VMb2NrKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgc3RhZ2UubW91c2VMb2NrID0gdHJ1ZTtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VYID0gc3RhZ2UubW91c2VYIC0gc3RhZ2Uuc3RhZ2VXaWR0aC8yO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVkgPSBzdGFnZS5tb3VzZVkgLSBzdGFnZS5zdGFnZUhlaWdodC8yO1xuLy8gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghbW91c2VMb2NrZWQpIHtcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tlZCA9IHRydWU7XG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgLy9lbnN1cmUgYm91bmRzIGZvciB0aWx0QW5nbGUgYXJlIG5vdCBlY2VlZGVkXG4vLyAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NrWSA+IGNhbWVyYUNvbnRyb2xsZXIubWF4VGlsdEFuZ2xlLzAuMylcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci5tYXhUaWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgZWxzZSBpZiAobW91c2VMb2NrWSA8IGNhbWVyYUNvbnRyb2xsZXIubWluVGlsdEFuZ2xlLzAuMylcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci5taW5UaWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAgaWYgKHN0YWdlLm1vdXNlTG9jaykge1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyptb3VzZUxvY2tYO1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqbW91c2VMb2NrWTtcbi8vICAgICAgICAgICAgfSBlbHNlIGlmIChtb3ZlKSB7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlID0gMC4zKihzdGFnZS5tb3VzZVggLSBsYXN0TW91c2VYKSArIGxhc3RQYW5BbmdsZTtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihzdGFnZS5tb3VzZVkgLSBsYXN0TW91c2VZKSArIGxhc3RUaWx0QW5nbGU7XG4vLyAgICAgICAgICAgIH1cblxuXHRcdGlmICh0aGlzLm1vdmUpIHtcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WCAtIHRoaXMubGFzdE1vdXNlWCkgKyB0aGlzLmxhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFkgLSB0aGlzLmxhc3RNb3VzZVkpICsgdGhpcy5sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB3aGVlbCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlV2hlZWwoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KVxuXHR7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIC09IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHRpZiAodGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIDwgNDAwKVxuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gNDAwO1xuXHRcdGVsc2UgaWYgKHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA+IDEwMDAwKVxuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gMTAwMDA7XG5cdH1cblxuXHQvKipcblx0ICogS2V5IGRvd24gbGlzdGVuZXIgZm9yIGZ1bGxzY3JlZW5cblx0ICovXG4vLyAgICAgICAgcHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudCk6dm9pZFxuLy8gICAgICAgIHtcbi8vICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKVxuLy8gICAgICAgICAgICB7XG4vLyAgICAgICAgICAgICAgICBjYXNlIEtleWJvYXJkLlNQQUNFOlxuLy8gICAgICAgICAgICAgICAgICAgIGlmIChzdGFnZS5kaXNwbGF5U3RhdGUgPT0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU4pIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuTk9STUFMO1xuLy8gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlLmRpc3BsYXlTdGF0ZSA9IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOO1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrZWQgPSBmYWxzZTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWCA9IGNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAgICBicmVhaztcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIH1cbi8vXG5cblx0LyoqXG5cdCAqIHdpbmRvdyBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudDpVSUV2ZW50ID0gbnVsbCk6dm9pZFxuXHR7XG5cdFx0dGhpcy52aWV3LnkgICAgICAgICA9IDA7XG5cdFx0dGhpcy52aWV3LnggICAgICAgICA9IDA7XG5cdFx0dGhpcy52aWV3LndpZHRoICAgICA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMudmlldy5oZWlnaHQgICAgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxuY2xhc3MgRmxhcmVPYmplY3Rcbntcblx0cHJpdmF0ZSBmbGFyZVNpemU6bnVtYmVyID0gMTQuNDtcblxuXHRwdWJsaWMgYmlsbGJvYXJkOkJpbGxib2FyZDtcblxuXHRwdWJsaWMgc2l6ZTpudW1iZXI7XG5cblx0cHVibGljIHBvc2l0aW9uOm51bWJlcjtcblxuXHRwdWJsaWMgb3BhY2l0eTpudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihiaXRtYXBEYXRhOkJpdG1hcEltYWdlMkQsIHNpemU6bnVtYmVyLCBwb3NpdGlvbjpudW1iZXIsIG9wYWNpdHk6bnVtYmVyLCBzY2VuZTpTY2VuZSlcblx0e1xuXHRcdHZhciBiZDpCaXRtYXBJbWFnZTJEID0gbmV3IEJpdG1hcEltYWdlMkQoYml0bWFwRGF0YS53aWR0aCwgYml0bWFwRGF0YS5oZWlnaHQsIHRydWUsIDB4RkZGRkZGRkYpO1xuXHRcdGJkLmNvcHlDaGFubmVsKGJpdG1hcERhdGEsIGJpdG1hcERhdGEucmVjdCwgbmV3IFBvaW50KCksIEJpdG1hcEltYWdlQ2hhbm5lbC5SRUQsIEJpdG1hcEltYWdlQ2hhbm5lbC5BTFBIQSk7XG5cblx0XHR2YXIgYmlsbGJvYXJkTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwobmV3IFNpbmdsZTJEVGV4dHVyZShiZCkpO1xuXHRcdGJpbGxib2FyZE1hdGVyaWFsLmFscGhhID0gb3BhY2l0eS8xMDA7XG5cdFx0YmlsbGJvYXJkTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyA9IHRydWU7XG5cdFx0Ly9iaWxsYm9hcmRNYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuTEFZRVI7XG5cblx0XHR0aGlzLmJpbGxib2FyZCA9IG5ldyBCaWxsYm9hcmQoYmlsbGJvYXJkTWF0ZXJpYWwpO1xuXHRcdHRoaXMuYmlsbGJvYXJkLndpZHRoID0gc2l6ZSp0aGlzLmZsYXJlU2l6ZTtcblx0XHR0aGlzLmJpbGxib2FyZC5oZWlnaHQgPSBzaXplKnRoaXMuZmxhcmVTaXplO1xuXHRcdHRoaXMuYmlsbGJvYXJkLnBpdm90ID0gbmV3IFZlY3RvcjNEKHNpemUqdGhpcy5mbGFyZVNpemUvMiwgc2l6ZSp0aGlzLmZsYXJlU2l6ZS8yLCAwKTtcblx0XHR0aGlzLmJpbGxib2FyZC5vcmllbnRhdGlvbk1vZGUgPSBPcmllbnRhdGlvbk1vZGUuQ0FNRVJBX1BMQU5FO1xuXHRcdHRoaXMuYmlsbGJvYXJkLmFsaWdubWVudE1vZGUgPSBBbGlnbm1lbnRNb2RlLlBJVk9UX1BPSU5UO1xuXHRcdHRoaXMuYmlsbGJvYXJkLnZpc2libGUgPSBmYWxzZTtcblx0XHR0aGlzLnNpemUgPSBzaXplO1xuXHRcdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXG5cdFx0c2NlbmUuYWRkQ2hpbGQodGhpcy5iaWxsYm9hcmQpXG5cdH1cbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpXG57XG5cdG5ldyBJbnRlcm1lZGlhdGVfR2xvYmUoKTtcbn0iXX0=
