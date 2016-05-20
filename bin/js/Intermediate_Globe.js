webpackJsonp([13],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
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
	var BitmapImage2D_1 = __webpack_require__(74);
	var BitmapImageChannel_1 = __webpack_require__(326);
	var BlendMode_1 = __webpack_require__(97);
	var LoaderEvent_1 = __webpack_require__(5);
	var ColorTransform_1 = __webpack_require__(19);
	var Vector3D_1 = __webpack_require__(18);
	var Point_1 = __webpack_require__(26);
	var AssetLibrary_1 = __webpack_require__(305);
	var LoaderContext_1 = __webpack_require__(327);
	var URLRequest_1 = __webpack_require__(3);
	var RequestAnimationFrame_1 = __webpack_require__(7);
	var DisplayObjectContainer_1 = __webpack_require__(12);
	var Scene_1 = __webpack_require__(11);
	var View_1 = __webpack_require__(9);
	var HoverController_1 = __webpack_require__(112);
	var OrientationMode_1 = __webpack_require__(33);
	var AlignmentMode_1 = __webpack_require__(32);
	var Camera_1 = __webpack_require__(45);
	var Billboard_1 = __webpack_require__(111);
	var PointLight_1 = __webpack_require__(224);
	var Skybox_1 = __webpack_require__(96);
	var ElementsType_1 = __webpack_require__(232);
	var StaticLightPicker_1 = __webpack_require__(226);
	var PrimitiveSpherePrefab_1 = __webpack_require__(238);
	var Single2DTexture_1 = __webpack_require__(104);
	var DefaultRenderer_1 = __webpack_require__(130);
	var MethodMaterial_1 = __webpack_require__(265);
	var DiffuseCompositeMethod_1 = __webpack_require__(276);
	var SpecularCompositeMethod_1 = __webpack_require__(295);
	var SpecularFresnelMethod_1 = __webpack_require__(294);
	var SpecularPhongMethod_1 = __webpack_require__(299);
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
	        this.scene = new Scene_1.Scene();
	        //setup camera for optimal skybox rendering
	        this.camera = new Camera_1.Camera();
	        this.camera.projection.far = 100000;
	        this.view = new View_1.View(new DefaultRenderer_1.DefaultRenderer());
	        this.view.scene = this.scene;
	        this.view.camera = this.camera;
	        //setup controller to be used on the camera
	        this.cameraController = new HoverController_1.HoverController(this.camera, null, 0, 0, 600, -90, 90);
	        this.cameraController.autoUpdate = false;
	        this.cameraController.yFactor = 1;
	    };
	    /**
	     * Initialise the lights
	     */
	    Intermediate_Globe.prototype.initLights = function () {
	        this.light = new PointLight_1.PointLight();
	        this.light.x = 10000;
	        this.light.ambient = 1;
	        this.light.diffuse = 2;
	        this.lightPicker = new StaticLightPicker_1.StaticLightPicker([this.light]);
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
	        var specular = new SpecularFresnelMethod_1.SpecularFresnelMethod(true, new SpecularPhongMethod_1.SpecularPhongMethod());
	        specular.fresnelPower = 1;
	        specular.normalReflectance = 0.1;
	        specular.gloss = 5;
	        specular.strength = 1;
	        this.sunMaterial = new MethodMaterial_1.MethodMaterial();
	        this.sunMaterial.blendMode = BlendMode_1.BlendMode.ADD;
	        this.groundMaterial = new MethodMaterial_1.MethodMaterial();
	        this.groundMaterial.specularMethod = specular;
	        this.groundMaterial.lightPicker = this.lightPicker;
	        this.groundMaterial.ambientMethod.strength = 1;
	        this.groundMaterial.diffuseMethod.multiply = false;
	        this.cloudMaterial = new MethodMaterial_1.MethodMaterial();
	        this.cloudMaterial.alphaBlending = true;
	        this.cloudMaterial.lightPicker = this.lightPicker;
	        this.cloudMaterial.style.color = 0x1b2048;
	        this.cloudMaterial.specularMethod.strength = 0;
	        this.cloudMaterial.ambientMethod.strength = 1;
	        this.cloudMaterial.diffuseMethod.multiply = false;
	        this.atmosphereDiffuseMethod = new DiffuseCompositeMethod_1.DiffuseCompositeMethod(this.modulateDiffuseMethod);
	        this.atmosphereSpecularMethod = new SpecularCompositeMethod_1.SpecularCompositeMethod(this.modulateSpecularMethod, new SpecularPhongMethod_1.SpecularPhongMethod());
	        this.atmosphereMaterial = new MethodMaterial_1.MethodMaterial();
	        this.atmosphereMaterial.diffuseMethod = this.atmosphereDiffuseMethod;
	        this.atmosphereMaterial.specularMethod = this.atmosphereSpecularMethod;
	        this.atmosphereMaterial.blendMode = BlendMode_1.BlendMode.ADD;
	        this.atmosphereMaterial.lightPicker = this.lightPicker;
	        this.atmosphereMaterial.specularMethod.strength = 0.5;
	        this.atmosphereMaterial.specularMethod.gloss = 5;
	        this.atmosphereMaterial.style.color = 0;
	        this.atmosphereMaterial.diffuseMethod.color = 0x1671cc;
	        this.atmosphereMaterial.ambientMethod.strength = 1;
	        this.atmosphereMaterial.diffuseMethod.multiply = false;
	    };
	    Intermediate_Globe.prototype.modulateDiffuseMethod = function (shaderObject, methodVO, targetReg, regCache, sharedRegisters) {
	        var viewDirFragmentReg = sharedRegisters.viewDirFragment;
	        var normalFragmentReg = sharedRegisters.normalFragment;
	        var code = "dp3 " + targetReg + ".w, " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" +
	            "mul " + targetReg + ".w, " + targetReg + ".w, " + targetReg + ".w\n";
	        return code;
	    };
	    Intermediate_Globe.prototype.modulateSpecularMethod = function (shaderObject, methodVO, targetReg, regCache, sharedRegisters) {
	        var viewDirFragmentReg = sharedRegisters.viewDirFragment;
	        var normalFragmentReg = sharedRegisters.normalFragment;
	        var temp = regCache.getFreeFragmentSingleTemp();
	        regCache.addFragmentTempUsages(temp, 1);
	        var code = "dp3 " + temp + ", " + viewDirFragmentReg + ".xyz, " + normalFragmentReg + ".xyz\n" +
	            "neg " + temp + ", " + temp + "\n" +
	            "mul " + targetReg + ".w, " + targetReg + ".w, " + temp + "\n";
	        regCache.removeFragmentTempUsage(temp);
	        return code;
	    };
	    /**
	     * Initialise the scene objects
	     */
	    Intermediate_Globe.prototype.initObjects = function () {
	        this.orbitContainer = new DisplayObjectContainer_1.DisplayObjectContainer();
	        this.orbitContainer.addChild(this.light);
	        this.scene.addChild(this.orbitContainer);
	        this.sun = new Billboard_1.Billboard(this.sunMaterial);
	        this.sun.width = 3000;
	        this.sun.height = 3000;
	        this.sun.pivot = new Vector3D_1.Vector3D(1500, 1500, 0);
	        this.sun.orientationMode = OrientationMode_1.OrientationMode.CAMERA_PLANE;
	        this.sun.alignmentMode = AlignmentMode_1.AlignmentMode.PIVOT_POINT;
	        this.sun.x = 10000;
	        this.orbitContainer.addChild(this.sun);
	        this.earth = new PrimitiveSpherePrefab_1.PrimitiveSpherePrefab(this.groundMaterial, ElementsType_1.ElementsType.TRIANGLE, 200, 200, 100).getNewObject();
	        this.clouds = new PrimitiveSpherePrefab_1.PrimitiveSpherePrefab(this.cloudMaterial, ElementsType_1.ElementsType.TRIANGLE, 202, 200, 100).getNewObject();
	        this.atmosphere = new PrimitiveSpherePrefab_1.PrimitiveSpherePrefab(this.atmosphereMaterial, ElementsType_1.ElementsType.TRIANGLE, 210, 200, 100).getNewObject();
	        this.atmosphere.scaleX = -1;
	        this.tiltContainer = new DisplayObjectContainer_1.DisplayObjectContainer();
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
	        this._timer = new RequestAnimationFrame_1.RequestAnimationFrame(this.onEnterFrame, this);
	        this._timer.start();
	        AssetLibrary_1.AssetLibrary.addEventListener(LoaderEvent_1.LoaderEvent.LOAD_COMPLETE, function (event) { return _this.onResourceComplete(event); });
	        //setup the url map for textures in the cubemap file
	        var loaderContext = new LoaderContext_1.LoaderContext();
	        loaderContext.dependencyBaseUrl = "assets/skybox/";
	        //environment texture
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/skybox/space_texture.cube"), loaderContext);
	        //globe textures
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/globe/cloud_combined_2048.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/globe/earth_specular_2048.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/globe/EarthNormal.png"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/globe/land_lights_16384.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/globe/land_ocean_ice_2048_match.jpg"));
	        //flare textures
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare2.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare3.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare4.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare6.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare7.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare8.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare10.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare11.jpg"));
	        AssetLibrary_1.AssetLibrary.load(new URLRequest_1.URLRequest("assets/lensflare/flare12.jpg"));
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
	            var flareDirection = new Point_1.Point(xOffset, yOffset);
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
	                this.skyBox = new Skybox_1.Skybox(event.assets[0]);
	                this.scene.addChild(this.skyBox);
	                break;
	            //globe textures
	            case "assets/globe/cloud_combined_2048.jpg":
	                var cloudBitmapImage2D = new BitmapImage2D_1.BitmapImage2D(2048, 1024, true, 0xFFFFFFFF);
	                cloudBitmapImage2D.copyChannel(event.assets[0], cloudBitmapImage2D.rect, new Point_1.Point(), BitmapImageChannel_1.BitmapImageChannel.RED, BitmapImageChannel_1.BitmapImageChannel.ALPHA);
	                this.cloudMaterial.ambientMethod.texture = new Single2DTexture_1.Single2DTexture(cloudBitmapImage2D);
	                break;
	            case "assets/globe/earth_specular_2048.jpg":
	                var specBitmapImage2D = event.assets[0];
	                specBitmapImage2D.colorTransform(specBitmapImage2D.rect, new ColorTransform_1.ColorTransform(1, 1, 1, 1, 64, 64, 64));
	                this.groundMaterial.specularMethod.texture = new Single2DTexture_1.Single2DTexture(specBitmapImage2D);
	                break;
	            case "assets/globe/EarthNormal.png":
	                this.groundMaterial.normalMethod.texture = new Single2DTexture_1.Single2DTexture(event.assets[0]);
	                break;
	            case "assets/globe/land_lights_16384.jpg":
	                this.groundMaterial.ambientMethod.texture = new Single2DTexture_1.Single2DTexture(event.assets[0]);
	                break;
	            case "assets/globe/land_ocean_ice_2048_match.jpg":
	                this.groundMaterial.diffuseMethod.texture = new Single2DTexture_1.Single2DTexture(event.assets[0]);
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
	                this.sunMaterial.ambientMethod.texture = new Single2DTexture_1.Single2DTexture(event.assets[0]);
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
	}());
	var FlareObject = (function () {
	    /**
	     * Constructor
	     */
	    function FlareObject(bitmapData, size, position, opacity, scene) {
	        this.flareSize = 14.4;
	        var bd = new BitmapImage2D_1.BitmapImage2D(bitmapData.width, bitmapData.height, true, 0xFFFFFFFF);
	        bd.copyChannel(bitmapData, bitmapData.rect, new Point_1.Point(), BitmapImageChannel_1.BitmapImageChannel.RED, BitmapImageChannel_1.BitmapImageChannel.ALPHA);
	        var billboardMaterial = new MethodMaterial_1.MethodMaterial(bd);
	        billboardMaterial.alpha = opacity / 100;
	        billboardMaterial.alphaBlending = true;
	        //billboardMaterial.blendMode = BlendMode.LAYER;
	        this.billboard = new Billboard_1.Billboard(billboardMaterial);
	        this.billboard.width = size * this.flareSize;
	        this.billboard.height = size * this.flareSize;
	        this.billboard.pivot = new Vector3D_1.Vector3D(size * this.flareSize / 2, size * this.flareSize / 2, 0);
	        this.billboard.orientationMode = OrientationMode_1.OrientationMode.CAMERA_PLANE;
	        this.billboard.alignmentMode = AlignmentMode_1.AlignmentMode.PIVOT_POINT;
	        this.billboard.visible = false;
	        this.size = size;
	        this.position = position;
	        this.opacity = opacity;
	        scene.addChild(this.billboard);
	    }
	    return FlareObject;
	}());
	window.onload = function () {
	    new Intermediate_Globe();
	};


/***/ }
]);
//# sourceMappingURL=Intermediate_Globe.js.map