webpackJsonp([7],{

/***/ 34:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_stage__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__ = __webpack_require__(2);
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
var __extends = this && this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};






var Intermediate_Globe = function () {
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
        this.scene = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Scene"]();
        //setup camera for optimal skybox rendering
        this.camera = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Camera"]();
        this.camera.projection.far = 100000;
        this.view = new __WEBPACK_IMPORTED_MODULE_5_awayjs_full_lib_view__["View"]();
        this.view.scene = this.scene;
        this.view.camera = this.camera;
        //setup controller to be used on the camera
        this.cameraController = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["HoverController"](this.camera, null, 0, 0, 600, -90, 90);
        this.cameraController.autoUpdate = false;
        this.cameraController.yFactor = 1;
    };
    /**
     * Initialise the lights
     */
    Intermediate_Globe.prototype.initLights = function () {
        this.light = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PointLight"]();
        this.light.x = 10000;
        this.light.ambient = 1;
        this.light.diffuse = 2;
        this.lightPicker = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["StaticLightPicker"]([this.light]);
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
        //adjust specular map
        //var specBitmap:BitmapImage2D = Cast.bitmapData(EarthSpecular);
        //specBitmap.colorTransform(specBitmap.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
        var specular = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["SpecularFresnelMethod"](true, 1, 0.1, new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["SpecularPhongMethod"]());
        specular.gloss = 5;
        specular.strength = 1;
        this.sunMaterial = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["MethodMaterial"]();
        this.sunMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](false, true, true);
        this.sunMaterial.blendMode = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BlendMode"].ADD;
        this.groundMaterial = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["MethodMaterial"]();
        this.groundMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](false, true, true);
        this.groundMaterial.specularMethod = specular;
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.ambientMethod.strength = 1;
        this.groundMaterial.diffuseMethod.multiply = false;
        this.cloudMaterial = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["MethodMaterial"]();
        this.cloudMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](false, true, true);
        this.cloudMaterial.alphaBlending = true;
        this.cloudMaterial.lightPicker = this.lightPicker;
        this.cloudMaterial.style.color = 0x1b2048;
        this.cloudMaterial.specularMethod.strength = 0;
        this.cloudMaterial.ambientMethod.strength = 1;
        this.cloudMaterial.diffuseMethod.multiply = false;
        this.atmosphereMaterial = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["MethodMaterial"]();
        this.atmosphereMaterial.diffuseMethod = new DiffuseGlobeMethod();
        this.atmosphereMaterial.specularMethod = new SpecularGlobeMethod(new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["SpecularPhongMethod"]());
        this.atmosphereMaterial.blendMode = __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BlendMode"].ADD;
        this.atmosphereMaterial.lightPicker = this.lightPicker;
        this.atmosphereMaterial.specularMethod.strength = 0.5;
        this.atmosphereMaterial.specularMethod.gloss = 5;
        this.atmosphereMaterial.style.color = 0;
        this.atmosphereMaterial.diffuseMethod.color = 0x1671cc;
        this.atmosphereMaterial.ambientMethod.strength = 1;
        this.atmosphereMaterial.diffuseMethod.multiply = false;
    };
    /**
     * Initialise the scene objects
     */
    Intermediate_Globe.prototype.initObjects = function () {
        this.orbitContainer = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["DisplayObjectContainer"]();
        this.orbitContainer.addChild(this.light);
        this.scene.addChild(this.orbitContainer);
        this.sun = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Billboard"](this.sunMaterial);
        this.sun.width = 3000;
        this.sun.height = 3000;
        this.sun.registrationPoint = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Vector3D"](1500, 1500, 0);
        this.sun.orientationMode = __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["OrientationMode"].CAMERA_PLANE;
        this.sun.x = 10000;
        this.orbitContainer.addChild(this.sun);
        this.earth = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PrimitiveSpherePrefab"](this.groundMaterial, __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 200, 200, 100).getNewObject();
        this.clouds = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PrimitiveSpherePrefab"](this.cloudMaterial, __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 202, 200, 100).getNewObject();
        this.atmosphere = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["PrimitiveSpherePrefab"](this.atmosphereMaterial, __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["ElementsType"].TRIANGLE, 210, 200, 100).getNewObject();
        this.atmosphere.scaleX = -1;
        this.tiltContainer = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["DisplayObjectContainer"]();
        this.tiltContainer.rotationX = 23;
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
        document.onmousewheel = function (event) {
            return _this.onMouseWheel(event);
        };
        this.onResize();
        this._timer = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["RequestAnimationFrame"](this.onEnterFrame, this);
        this._timer.start();
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].addEventListener(__WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["LoaderEvent"].LOAD_COMPLETE, function (event) {
            return _this.onResourceComplete(event);
        });
        //setup the url map for textures in the cubemap file
        var loaderContext = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["LoaderContext"]();
        loaderContext.dependencyBaseUrl = "assets/skybox/";
        //environment texture
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/skybox/space_texture.cube"), loaderContext);
        //globe textures
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/globe/cloud_combined_2048.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/globe/earth_specular_2048.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/globe/EarthNormal.png"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/globe/land_lights_16384.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/globe/land_ocean_ice_2048_match.jpg"));
        //flare textures
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare2.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare3.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare4.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare6.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare7.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare8.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare10.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare11.jpg"));
        __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["AssetLibrary"].load(new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["URLRequest"]("assets/lensflare/flare12.jpg"));
    };
    /**
     * Navigation and render loop
     */
    Intermediate_Globe.prototype.onEnterFrame = function (dt) {
        this._time += dt;
        this.earth.rotationY -= 0.2;
        this.clouds.rotationY -= 0.21;
        this.orbitContainer.rotationY -= 0.02;
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
        this.flareVisible = sunScreenPosition.x > 0 && sunScreenPosition.x < window.innerWidth && sunScreenPosition.y > 0 && sunScreenPosition.y < window.innerHeight && sunScreenPosition.z > 0 && Math.sqrt(xOffset * xOffset + yOffset * yOffset) > earthRadius;
        //update flare visibility
        if (this.flareVisible != flareVisibleOld) {
            for (var i = 0; i < this.flares.length; i++) {
                flareObject = this.flares[i];
                if (flareObject) flareObject.billboard.visible = this.flareVisible;
            }
        }
        //update flare position
        if (this.flareVisible) {
            var flareDirection = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Point"](xOffset, yOffset);
            for (var i = 0; i < this.flares.length; i++) {
                flareObject = this.flares[i];
                if (flareObject) {
                    var position = this.view.unproject(sunScreenPosition.x - flareDirection.x * flareObject.position, sunScreenPosition.y - flareDirection.y * flareObject.position, 100 - i);
                    flareObject.billboard.transform.moveTo(position.x, position.y, position.z);
                }
            }
        }
    };
    /**
     * Listener function for resource complete event on asset library
     */
    Intermediate_Globe.prototype.onResourceComplete = function (event) {
        switch (event.url) {
            //environment texture
            case 'assets/skybox/space_texture.cube':
                this.skyBox = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Skybox"](event.assets[0]);
                this.skyBox.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](false, true);
                this.scene.addChild(this.skyBox);
                break;
            //globe textures
            case "assets/globe/cloud_combined_2048.jpg":
                var cloudBitmapImage2D = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImage2D"](2048, 1024, true, 0xFFFFFFFF);
                cloudBitmapImage2D.copyChannel(event.assets[0], cloudBitmapImage2D.rect, new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Point"](), __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImageChannel"].RED, __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImageChannel"].ALPHA);
                this.cloudMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Single2DTexture"](cloudBitmapImage2D);
                break;
            case "assets/globe/earth_specular_2048.jpg":
                var specBitmapImage2D = event.assets[0];
                specBitmapImage2D.colorTransform(specBitmapImage2D.rect, new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["ColorTransform"](1, 1, 1, 1, 64, 64, 64));
                this.groundMaterial.specularMethod.texture = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Single2DTexture"](specBitmapImage2D);
                break;
            case "assets/globe/EarthNormal.png":
                this.groundMaterial.normalMethod.texture = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/globe/land_lights_16384.jpg":
                this.groundMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            case "assets/globe/land_ocean_ice_2048_match.jpg":
                this.groundMaterial.diffuseMethod.texture = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
                break;
            //flare textures
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
                this.sunMaterial.ambientMethod.texture = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Single2DTexture"](event.assets[0]);
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
        if (this.cameraController.distance < 400) this.cameraController.distance = 400;else if (this.cameraController.distance > 10000) this.cameraController.distance = 10000;
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
        if (event === void 0) {
            event = null;
        }
        this.view.y = 0;
        this.view.x = 0;
        this.view.width = window.innerWidth;
        this.view.height = window.innerHeight;
    };
    return Intermediate_Globe;
}();
var FlareObject = function () {
    /**
     * Constructor
     */
    function FlareObject(bitmapData, size, position, opacity, scene) {
        this.flareSize = 14.4;
        var bd = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImage2D"](bitmapData.width, bitmapData.height, true, 0xFFFFFFFF);
        bd.copyChannel(bitmapData, bitmapData.rect, new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Point"](), __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImageChannel"].RED, __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["BitmapImageChannel"].ALPHA);
        var billboardMaterial = new __WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["MethodMaterial"](bd);
        billboardMaterial.style.sampler = new __WEBPACK_IMPORTED_MODULE_0_awayjs_full_lib_graphics__["Sampler2D"](false, true);
        billboardMaterial.alpha = opacity / 100;
        billboardMaterial.alphaBlending = true;
        //billboardMaterial.blendMode = BlendMode.LAYER;
        this.billboard = new __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["Billboard"](billboardMaterial);
        this.billboard.width = size * this.flareSize;
        this.billboard.height = size * this.flareSize;
        this.billboard.registrationPoint = new __WEBPACK_IMPORTED_MODULE_1_awayjs_full_lib_core__["Vector3D"](size * this.flareSize / 2, size * this.flareSize / 2, 0);
        this.billboard.orientationMode = __WEBPACK_IMPORTED_MODULE_3_awayjs_full_lib_scene__["OrientationMode"].CAMERA_PLANE;
        this.billboard.visible = false;
        this.size = size;
        this.position = position;
        this.opacity = opacity;
        scene.addChild(this.billboard);
    }
    return FlareObject;
}();
var DiffuseGlobeMethod = function (_super) {
    __extends(DiffuseGlobeMethod, _super);
    function DiffuseGlobeMethod() {
        return _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DiffuseGlobeMethod.prototype, "assetType", {
        /**
         * @inheritDoc
         */
        get: function () {
            return DiffuseGlobeMethod.assetType;
        },
        enumerable: true,
        configurable: true
    });
    return DiffuseGlobeMethod;
}(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["DiffuseCompositeMethod"]);
DiffuseGlobeMethod.assetType = "[asset DiffuseGlobeMethod]";
var DiffuseGlobeChunk = function (_super) {
    __extends(DiffuseGlobeChunk, _super);
    /**
     * Creates a new DiffuseCelChunk object.
     * @param levels The amount of shadow gradations.
     * @param baseMethod An optional diffuse method on which the cartoon shading is based. If omitted, DiffuseBasicMethod is used.
     */
    function DiffuseGlobeChunk(method, shader) {
        var _this = _super.call(this, method, shader) || this;
        _this._baseChunk._modulateFunction = function (targetReg, registerCache, sharedRegisters) {
            return _this.modulateDiffuseMethod(targetReg, registerCache, sharedRegisters);
        };
        return _this;
    }
    DiffuseGlobeChunk.prototype.modulateDiffuseMethod = function (targetReg, regCache, sharedRegisters) {
        var viewDirFragmentReg = sharedRegisters.viewDirFragment;
        var normalFragmentReg = sharedRegisters.normalFragment;
        var code = "dp3 " + targetReg + ".w, " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" + "mul " + targetReg + ".w, " + targetReg + ".w, " + targetReg + ".w\n";
        return code;
    };
    return DiffuseGlobeChunk;
}(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["LightingCompositeChunk"]);
var SpecularGlobeMethod = function (_super) {
    __extends(SpecularGlobeMethod, _super);
    function SpecularGlobeMethod() {
        return _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SpecularGlobeMethod.prototype, "assetType", {
        /**
         * @inheritDoc
         */
        get: function () {
            return SpecularGlobeMethod.assetType;
        },
        enumerable: true,
        configurable: true
    });
    return SpecularGlobeMethod;
}(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["SpecularCompositeMethod"]);
SpecularGlobeMethod.assetType = "[asset SpecularGlobeMethod]";
var SpecularGlobeChunk = function (_super) {
    __extends(SpecularGlobeChunk, _super);
    /**
     * Creates a new DiffuseCelChunk object.
     * @param levels The amount of shadow gradations.
     * @param baseMethod An optional diffuse method on which the cartoon shading is based. If omitted, DiffuseBasicMethod is used.
     */
    function SpecularGlobeChunk(method, shader) {
        var _this = _super.call(this, method, shader) || this;
        _this._baseChunk._modulateFunction = function (targetReg, registerCache, sharedRegisters) {
            return _this.modulateSpecularMethod(targetReg, registerCache, sharedRegisters);
        };
        return _this;
    }
    SpecularGlobeChunk.prototype.modulateSpecularMethod = function (targetReg, regCache, sharedRegisters) {
        var viewDirFragmentReg = sharedRegisters.viewDirFragment;
        var normalFragmentReg = sharedRegisters.normalFragment;
        var temp = regCache.getFreeFragmentSingleTemp();
        regCache.addFragmentTempUsages(temp, 1);
        var code = "dp3 " + temp + ", " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" + "neg " + temp + ", " + temp + "\n" + "mul " + targetReg + ".w, " + targetReg + ".w, " + temp + "\n";
        regCache.removeFragmentTempUsage(temp);
        return code;
    };
    return SpecularGlobeChunk;
}(__WEBPACK_IMPORTED_MODULE_4_awayjs_full_lib_materials__["LightingCompositeChunk"]);
__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_stage__["ShaderBase"].registerAbstraction(DiffuseGlobeChunk, DiffuseGlobeMethod);
__WEBPACK_IMPORTED_MODULE_2_awayjs_full_lib_stage__["ShaderBase"].registerAbstraction(SpecularGlobeChunk, SpecularGlobeMethod);
window.onload = function () {
    new Intermediate_Globe();
};

/***/ })

},[34]);
//# sourceMappingURL=Intermediate_Globe.js.map