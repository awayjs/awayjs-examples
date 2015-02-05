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
var BitmapData = require("awayjs-core/lib/base/BitmapData");
var BitmapDataChannel = require("awayjs-core/lib/base/BitmapDataChannel");
var BlendMode = require("awayjs-core/lib/base/BlendMode");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var ColorTransform = require("awayjs-core/lib/geom/ColorTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var Point = require("awayjs-core/lib/geom/Point");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/library/AssetLoaderContext");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var BitmapTexture = require("awayjs-core/lib/textures/BitmapTexture");
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
var Cast = require("awayjs-display/lib/utils/Cast");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
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
        this.view = new View(new DefaultRenderer(MethodRendererPool));
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
        //var specBitmap:BitmapData = Cast.bitmapData(EarthSpecular);
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
        var assetLoaderContext = new AssetLoaderContext();
        assetLoaderContext.dependencyBaseUrl = "assets/skybox/";
        //environment texture
        AssetLibrary.load(new URLRequest("assets/skybox/space_texture.cube"), assetLoaderContext);
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
                this.cubeTexture = event.assets[0];
                this.skyBox = new Skybox(this.cubeTexture);
                this.scene.addChild(this.skyBox);
                break;
            case "assets/globe/cloud_combined_2048.jpg":
                var cloudBitmapData = new BitmapData(2048, 1024, true, 0xFFFFFFFF);
                cloudBitmapData.copyChannel(Cast.bitmapData(event.assets[0]), cloudBitmapData.rect, new Point(), BitmapDataChannel.RED, BitmapDataChannel.ALPHA);
                this.cloudMaterial.texture = new BitmapTexture(cloudBitmapData);
                break;
            case "assets/globe/earth_specular_2048.jpg":
                var specBitmapData = Cast.bitmapData(event.assets[0]);
                specBitmapData.colorTransform(specBitmapData.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
                this.groundMaterial.specularMap = new BitmapTexture(specBitmapData);
                break;
            case "assets/globe/EarthNormal.png":
                this.groundMaterial.normalMap = event.assets[0];
                break;
            case "assets/globe/land_lights_16384.jpg":
                this.groundMaterial.texture = event.assets[0];
                break;
            case "assets/globe/land_ocean_ice_2048_match.jpg":
                this.groundMaterial.diffuseTexture = event.assets[0];
                break;
            case "assets/lensflare/flare2.jpg":
                this.flares[6] = new FlareObject(Cast.bitmapData(event.assets[0]), 1.25, 1.1, 48.45, this.scene);
                break;
            case "assets/lensflare/flare3.jpg":
                this.flares[7] = new FlareObject(Cast.bitmapData(event.assets[0]), 1.75, 1.37, 7.65, this.scene);
                break;
            case "assets/lensflare/flare4.jpg":
                this.flares[8] = new FlareObject(Cast.bitmapData(event.assets[0]), 2.75, 1.85, 12.75, this.scene);
                break;
            case "assets/lensflare/flare6.jpg":
                this.flares[5] = new FlareObject(Cast.bitmapData(event.assets[0]), 1, 0.68, 20.4, this.scene);
                this.flares[10] = new FlareObject(Cast.bitmapData(event.assets[0]), 4, 2.5, 10.4, this.scene);
                break;
            case "assets/lensflare/flare7.jpg":
                this.flares[2] = new FlareObject(Cast.bitmapData(event.assets[0]), 2, 0, 25.5, this.scene);
                this.flares[3] = new FlareObject(Cast.bitmapData(event.assets[0]), 4, 0, 17.85, this.scene);
                this.flares[11] = new FlareObject(Cast.bitmapData(event.assets[0]), 10, 2.66, 50, this.scene);
                break;
            case "assets/lensflare/flare8.jpg":
                this.flares[9] = new FlareObject(Cast.bitmapData(event.assets[0]), 0.5, 2.21, 33.15, this.scene);
                break;
            case "assets/lensflare/flare10.jpg":
                this.sunMaterial.texture = event.assets[0];
                this.flares[0] = new FlareObject(Cast.bitmapData(event.assets[0]), 3.2, -0.01, 100, this.scene);
                break;
            case "assets/lensflare/flare11.jpg":
                this.flares[1] = new FlareObject(Cast.bitmapData(event.assets[0]), 6, 0, 30.6, this.scene);
                break;
            case "assets/lensflare/flare12.jpg":
                this.flares[4] = new FlareObject(Cast.bitmapData(event.assets[0]), 0.4, 0.32, 22.95, this.scene);
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
        var bd = new BitmapData(bitmapData.width, bitmapData.height, true, 0xFFFFFFFF);
        bd.copyChannel(bitmapData, bitmapData.rect, new Point(), BitmapDataChannel.RED, BitmapDataChannel.ALPHA);
        var billboardMaterial = new MethodMaterial(new BitmapTexture(bd));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfR2xvYmUudHMiXSwibmFtZXMiOlsiSW50ZXJtZWRpYXRlX0dsb2JlIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXQiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdEVuZ2luZSIsIkludGVybWVkaWF0ZV9HbG9iZS5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXRNYXRlcmlhbHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUubW9kdWxhdGVEaWZmdXNlTWV0aG9kIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm1vZHVsYXRlU3BlY3VsYXJNZXRob2QiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdE9iamVjdHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9HbG9iZS5vbkVudGVyRnJhbWUiLCJJbnRlcm1lZGlhdGVfR2xvYmUudXBkYXRlRmxhcmVzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlRG93biIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlVXAiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZVdoZWVsIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzaXplIiwiRmxhcmVPYmplY3QiLCJGbGFyZU9iamVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUEsQUFxQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQURFO0FBQ0YsSUFBTyxVQUFVLFdBQWUsaUNBQWlDLENBQUMsQ0FBQztBQUNuRSxJQUFPLGlCQUFpQixXQUFhLHdDQUF3QyxDQUFDLENBQUM7QUFDL0UsSUFBTyxTQUFTLFdBQWUsZ0NBQWdDLENBQUMsQ0FBQztBQUNqRSxJQUFPLFdBQVcs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QTtRQUMxRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0Esc0NBQXNDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMxRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsOEJBQThCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNsRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0Esb0NBQW9DQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4RUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNENBQTRDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUVoRkEsQUFDQUEsZ0JBRGdCQTtRQUNoQkEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsNkJBQTZCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsOEJBQThCQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNsRUEsWUFBWUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsVUFBVUEsQ0FBQ0EsOEJB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Q0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25HQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSw2QkFBNkJBO2dCQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BHQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSw2QkFBNkJBO2dCQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDN0ZBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM5RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsRUFBRUEsSUFBSUEsRUFBRUEsRUFBRUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2hHQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSw2QkFBNkJBO2dCQUNqQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25HQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSw4QkFBOEJBO2dCQUNsQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsR0FBa0JBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBO2dCQUM1REEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xHQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSw4QkFBOEJBO2dCQUNsQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzdGQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSw4QkFBOEJBO2dCQUNsQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsR0FBR0EsRUFBRUEsSUFBSUEsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ25HQSxLQUFLQSxDQUFDQTtRQUNSQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEWjs7T0FFR0E7SUFDS0Esd0NBQVdBLEdBQW5CQSxVQUFvQkEsS0FBZ0JBO1FBRW5DYSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLFFBQVFBLENBQUNBO1FBQ25EQSxJQUFJQSxDQUFDQSxh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UUFFdkJBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUFBO0lBQy9CQSxDQUFDQTtJQUNGRCxrQkFBQ0E7QUFBREEsQ0F0Q0EsQUFzQ0NBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSxrQkFBa0IsRUFBRSxDQUFDO0FBQzFCLENBQUMsQ0FBQSIsImZpbGUiOiJJbnRlcm1lZGlhdGVfR2xvYmUuanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuXG5HbG9iZSBleGFtcGxlIGluIEF3YXkzZFxuXG5EZW1vbnN0cmF0ZXM6XG5cbkhvdyB0byBjcmVhdGUgYSB0ZXh0dXJlZCBzcGhlcmUuXG5Ib3cgdG8gdXNlIGNvbnRhaW5lcnMgdG8gcm90YXRlIGFuIG9iamVjdC5cbkhvdyB0byB1c2UgdGhlIFBob25nQml0bWFwTWF0ZXJpYWwuXG5cbkNvZGUgYnkgUm9iIEJhdGVtYW5cbnJvYkBpbmZpbml0ZXR1cnRsZXMuY28udWtcbmh0dHA6Ly93d3cuaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5pbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IEJpdG1hcERhdGFDaGFubmVsXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YUNoYW5uZWxcIik7XG5pbXBvcnQgQmxlbmRNb2RlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9iYXNlL0JsZW5kTW9kZVwiKTtcbmltcG9ydCBMb2FkZXJFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0xvYWRlckV2ZW50XCIpO1xuaW1wb3J0IENvbG9yVHJhbnNmb3JtXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9Db2xvclRyYW5zZm9ybVwiKTtcbmltcG9ydCBWZWN0b3IzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IFBvaW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vUG9pbnRcIik7XG5pbXBvcnQgQXNzZXRMaWJyYXJ5XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TGlicmFyeVwiKTtcbmltcG9ydCBBc3NldExvYWRlckNvbnRleHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlckNvbnRleHRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTFJlcXVlc3RcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSW1hZ2VUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZVRleHR1cmVcIik7XG5pbXBvcnQgQml0bWFwVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0JpdG1hcFRleHR1cmVcIik7XG5pbXBvcnQgUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIik7XG5cbmltcG9ydCBEaXNwbGF5T2JqZWN0Q29udGFpbmVyXHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL0Rpc3BsYXlPYmplY3RDb250YWluZXJcIik7XG5pbXBvcnQgU2NlbmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9TY2VuZVwiKTtcbmltcG9ydCBMb2FkZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBIb3ZlckNvbnRyb2xsZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9Ib3ZlckNvbnRyb2xsZXJcIik7XG5pbXBvcnQgT3JpZW50YXRpb25Nb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9PcmllbnRhdGlvbk1vZGVcIik7XG5pbXBvcnQgQWxpZ25tZW50TW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQWxpZ25tZW50TW9kZVwiKTtcbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FtZXJhXCIpO1xuaW1wb3J0IEJpbGxib2FyZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQmlsbGJvYXJkXCIpO1xuaW1wb3J0IE1lc2hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IFBvaW50TGlnaHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZVByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVTcGhlcmVQcmVmYWJcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3V0aWxzL0Nhc3RcIik7XG5cbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9EZWZhdWx0UmVuZGVyZXJcIik7XG5pbXBvcnQgU2hhZGVyT2JqZWN0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL2NvbXBpbGF0aW9uL1NoYWRlck9iamVjdEJhc2VcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJFbGVtZW50XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckVsZW1lbnRcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJDYWNoZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckNhY2hlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRGF0YVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckRhdGFcIik7XG5cbmltcG9ydCBNZXRob2RNYXRlcmlhbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvTWV0aG9kTWF0ZXJpYWxcIik7XG5pbXBvcnQgTWV0aG9kUmVuZGVyZXJQb29sXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvcG9vbC9NZXRob2RSZW5kZXJlclBvb2xcIik7XG5pbXBvcnQgTWV0aG9kVk9cdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9kYXRhL01ldGhvZFZPXCIpO1xuaW1wb3J0IERpZmZ1c2VDb21wb3NpdGVNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9EaWZmdXNlQ29tcG9zaXRlTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyQ29tcG9zaXRlTWV0aG9kXHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvU3BlY3VsYXJDb21wb3NpdGVNZXRob2RcIik7XG5pbXBvcnQgRGlmZnVzZUJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9EaWZmdXNlQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJCYXNpY01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvU3BlY3VsYXJCYXNpY01ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhckZyZXNuZWxNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TcGVjdWxhckZyZXNuZWxNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJQaG9uZ01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvU3BlY3VsYXJQaG9uZ01ldGhvZFwiKTtcblxuY2xhc3MgSW50ZXJtZWRpYXRlX0dsb2JlXG57XG5cdC8vZW5naW5lIHZhcmlhYmxlc1xuXHRwcml2YXRlIHNjZW5lOlNjZW5lO1xuXHRwcml2YXRlIGNhbWVyYTpDYW1lcmE7XG5cdHByaXZhdGUgdmlldzpWaWV3O1xuXHRwcml2YXRlIGNhbWVyYUNvbnRyb2xsZXI6SG92ZXJDb250cm9sbGVyO1xuXG5cdC8vbWF0ZXJpYWwgb2JqZWN0c1xuXHRwcml2YXRlIHN1bk1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGdyb3VuZE1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGNsb3VkTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgYXRtb3NwaGVyZU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGF0bW9zcGhlcmVEaWZmdXNlTWV0aG9kOkRpZmZ1c2VCYXNpY01ldGhvZDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlU3BlY3VsYXJNZXRob2Q6U3BlY3VsYXJCYXNpY01ldGhvZDtcblx0cHJpdmF0ZSBjdWJlVGV4dHVyZTpJbWFnZUN1YmVUZXh0dXJlO1xuXG5cdC8vc2NlbmUgb2JqZWN0c1xuXHRwcml2YXRlIHN1bjpCaWxsYm9hcmQ7XG5cdHByaXZhdGUgZWFydGg6TWVzaDtcblx0cHJpdmF0ZSBjbG91ZHM6TWVzaDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlOk1lc2g7XG5cdHByaXZhdGUgdGlsdENvbnRhaW5lcjpEaXNwbGF5T2JqZWN0Q29udGFpbmVyO1xuXHRwcml2YXRlIG9yYml0Q29udGFpbmVyOkRpc3BsYXlPYmplY3RDb250YWluZXI7XG5cdHByaXZhdGUgc2t5Qm94OlNreWJveDtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSBsaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIGxpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXHRwcml2YXRlIGZsYXJlczpGbGFyZU9iamVjdFtdID0gbmV3IEFycmF5PEZsYXJlT2JqZWN0PigxMik7XG5cblx0Ly9uYXZpZ2F0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3ZlOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBsYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RUaWx0QW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RNb3VzZVg6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RNb3VzZVk6bnVtYmVyO1xuXHRwcml2YXRlIG1vdXNlTG9ja1g6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3VzZUxvY2tZOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW91c2VMb2NrZWQ6Ym9vbGVhbjtcblx0cHJpdmF0ZSBmbGFyZVZpc2libGU6Ym9vbGVhbjtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHR0aGlzLmluaXRMaWdodHMoKTtcblx0XHQvL2luaXRMZW5zRmxhcmUoKTtcblx0XHR0aGlzLmluaXRNYXRlcmlhbHMoKTtcblx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnNjZW5lID0gbmV3IFNjZW5lKCk7XG5cblx0XHQvL3NldHVwIGNhbWVyYSBmb3Igb3B0aW1hbCBza3lib3ggcmVuZGVyaW5nXG5cdFx0dGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XG5cdFx0dGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIgPSAxMDAwMDA7XG5cblx0XHR0aGlzLnZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKE1ldGhvZFJlbmRlcmVyUG9vbCkpO1xuXHRcdHRoaXMudmlldy5zY2VuZSA9IHRoaXMuc2NlbmU7XG5cdFx0dGhpcy52aWV3LmNhbWVyYSA9IHRoaXMuY2FtZXJhO1xuXG5cdFx0Ly9zZXR1cCBjb250cm9sbGVyIHRvIGJlIHVzZWQgb24gdGhlIGNhbWVyYVxuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlciA9IG5ldyBIb3ZlckNvbnRyb2xsZXIodGhpcy5jYW1lcmEsIG51bGwsIDAsIDAsIDYwMCwgLTkwLCA5MCk7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmF1dG9VcGRhdGUgPSBmYWxzZTtcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIueUZhY3RvciA9IDE7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlnaHRzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHR0aGlzLmxpZ2h0LnggPSAxMDAwMDtcblx0XHR0aGlzLmxpZ2h0LmFtYmllbnQgPSAxO1xuXHRcdHRoaXMubGlnaHQuZGlmZnVzZSA9IDI7XG5cblx0XHR0aGlzLmxpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKFt0aGlzLmxpZ2h0XSk7XG5cdH1cbi8qXG5cdHByaXZhdGUgaW5pdExlbnNGbGFyZSgpOnZvaWRcblx0e1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUxMCgpLCAgMy4yLCAtMC4wMSwgMTQ3LjkpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMTEoKSwgIDYsICAgIDAsICAgICAzMC42KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICAyLCAgICAwLCAgICAgMjUuNSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgNCwgICAgMCwgICAgIDE3Ljg1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTEyKCksICAwLjQsICAwLjMyLCAgMjIuOTUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNigpLCAgIDEsICAgIDAuNjgsICAyMC40KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTIoKSwgICAxLjI1LCAxLjEsICAgNDguNDUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMygpLCAgIDEuNzUsIDEuMzcsICAgNy42NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU0KCksICAgMi43NSwgMS44NSwgIDEyLjc1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTgoKSwgICAwLjUsICAyLjIxLCAgMzMuMTUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNigpLCAgIDQsICAgIDIuNSwgICAxMC40KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICAxMCwgICAyLjY2LCAgNTApKTtcblx0fVxuKi9cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIG1hdGVyaWFsc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWxzKCk6dm9pZFxuXHR7XG5cdFx0Ly90aGlzLmN1YmVUZXh0dXJlID0gbmV3IEJpdG1hcEN1YmVUZXh0dXJlKENhc3QuYml0bWFwRGF0YShQb3NYKSwgQ2FzdC5iaXRtYXBEYXRhKE5lZ1gpLCBDYXN0LmJpdG1hcERhdGEoUG9zWSksIENhc3QuYml0bWFwRGF0YShOZWdZKSwgQ2FzdC5iaXRtYXBEYXRhKFBvc1opLCBDYXN0LmJpdG1hcERhdGEoTmVnWikpO1xuXG5cdFx0Ly9hZGp1c3Qgc3BlY3VsYXIgbWFwXG5cdFx0Ly92YXIgc3BlY0JpdG1hcDpCaXRtYXBEYXRhID0gQ2FzdC5iaXRtYXBEYXRhKEVhcnRoU3BlY3VsYXIpO1xuXHRcdC8vc3BlY0JpdG1hcC5jb2xvclRyYW5zZm9ybShzcGVjQml0bWFwLnJlY3QsIG5ldyBDb2xvclRyYW5zZm9ybSgxLCAxLCAxLCAxLCA2NCwgNjQsIDY0KSk7XG5cblx0XHR2YXIgc3BlY3VsYXI6U3BlY3VsYXJGcmVzbmVsTWV0aG9kID0gbmV3IFNwZWN1bGFyRnJlc25lbE1ldGhvZCh0cnVlLCBuZXcgU3BlY3VsYXJQaG9uZ01ldGhvZCgpKTtcblx0XHRzcGVjdWxhci5mcmVzbmVsUG93ZXIgPSAxO1xuXHRcdHNwZWN1bGFyLm5vcm1hbFJlZmxlY3RhbmNlID0gMC4xO1xuXG5cdFx0dGhpcy5zdW5NYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuc3VuTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkFERDtcblxuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kID0gc3BlY3VsYXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5nbG9zcyA9IDU7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhciA9IDE7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmRpZmZ1c2VNZXRob2QubXVsdGlwbHkgPSBmYWxzZTtcblxuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbWJpZW50Q29sb3IgPSAweDFiMjA0ODtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuc3BlY3VsYXIgPSAwO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbWJpZW50ID0gMTtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZURpZmZ1c2VNZXRob2QgPSBuZXcgRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZCh0aGlzLm1vZHVsYXRlRGlmZnVzZU1ldGhvZCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlU3BlY3VsYXJNZXRob2QgPSBuZXcgU3BlY3VsYXJDb21wb3NpdGVNZXRob2QodGhpcy5tb2R1bGF0ZVNwZWN1bGFyTWV0aG9kLCBuZXcgU3BlY3VsYXJQaG9uZ01ldGhvZCgpKTtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZGlmZnVzZU1ldGhvZCA9IHRoaXMuYXRtb3NwaGVyZURpZmZ1c2VNZXRob2Q7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuc3BlY3VsYXJNZXRob2QgPSB0aGlzLmF0bW9zcGhlcmVTcGVjdWxhck1ldGhvZDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuQUREO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5zcGVjdWxhciA9IDAuNTtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5nbG9zcyA9IDU7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYW1iaWVudENvbG9yID0gMDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSAweDE2NzFjYztcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5hbWJpZW50ID0gMTtcblx0fVxuXG5cdHByaXZhdGUgbW9kdWxhdGVEaWZmdXNlTWV0aG9kKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgdGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgcmVnQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgdmlld0RpckZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy52aWV3RGlyRnJhZ21lbnQ7XG5cdFx0dmFyIG5vcm1hbEZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy5ub3JtYWxGcmFnbWVudDtcblxuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiZHAzIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB2aWV3RGlyRnJhZ21lbnRSZWcgKyBcIi54eXosIFwiICsgbm9ybWFsRnJhZ21lbnRSZWcgKyBcIi54eXpcXG5cIiArXG5cdFx0XHRcIm11bCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53XFxuXCI7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdHByaXZhdGUgbW9kdWxhdGVTcGVjdWxhck1ldGhvZChzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHRhcmdldFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHJlZ0NhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIHZpZXdEaXJGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMudmlld0RpckZyYWdtZW50O1xuXHRcdHZhciBub3JtYWxGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQ7XG5cdFx0dmFyIHRlbXA6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gcmVnQ2FjaGUuZ2V0RnJlZUZyYWdtZW50U2luZ2xlVGVtcCgpO1xuXHRcdHJlZ0NhY2hlLmFkZEZyYWdtZW50VGVtcFVzYWdlcyh0ZW1wLCAxKTtcblxuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiZHAzIFwiICsgdGVtcCArIFwiLCBcIiArIHZpZXdEaXJGcmFnbWVudFJlZyArIFwiLnh5eiwgXCIgKyBub3JtYWxGcmFnbWVudFJlZyArIFwiLnh5elxcblwiICtcblx0XHRcdFwibmVnIFwiICsgdGVtcCArIFwiLCBcIiArIHRlbXAgKyBcIlxcblwiICtcblx0XHRcdFwibXVsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRlbXAgKyBcIlxcblwiO1xuXG5cdFx0cmVnQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2UodGVtcCk7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lciA9IG5ldyBEaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmxpZ2h0KTtcblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMub3JiaXRDb250YWluZXIpO1xuXG5cdFx0dGhpcy5zdW4gPSBuZXcgQmlsbGJvYXJkKHRoaXMuc3VuTWF0ZXJpYWwpO1xuXHRcdHRoaXMuc3VuLndpZHRoID0gMzAwMDtcblx0XHR0aGlzLnN1bi5oZWlnaHQgPSAzMDAwO1xuXHRcdHRoaXMuc3VuLnBpdm90ID0gbmV3IFZlY3RvcjNEKDE1MDAsMTUwMCwwKTtcblx0XHR0aGlzLnN1bi5vcmllbnRhdGlvbk1vZGUgPSBPcmllbnRhdGlvbk1vZGUuQ0FNRVJBX1BMQU5FO1xuXHRcdHRoaXMuc3VuLmFsaWdubWVudE1vZGUgPSBBbGlnbm1lbnRNb2RlLlBJVk9UX1BPSU5UO1xuXHRcdHRoaXMuc3VuLnggPSAxMDAwMDtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuc3VuKTtcblxuXHRcdHRoaXMuZWFydGggPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMDAsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmVhcnRoLm1hdGVyaWFsID0gdGhpcy5ncm91bmRNYXRlcmlhbDtcblxuXHRcdHRoaXMuY2xvdWRzID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjAyLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5jbG91ZHMubWF0ZXJpYWwgPSB0aGlzLmNsb3VkTWF0ZXJpYWw7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmUgPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMTAsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmF0bW9zcGhlcmUubWF0ZXJpYWwgPSB0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbDtcblx0XHR0aGlzLmF0bW9zcGhlcmUuc2NhbGVYID0gLTE7XG5cblx0XHR0aGlzLnRpbHRDb250YWluZXIgPSBuZXcgRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5yb3RhdGlvblggPSAtMjM7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuZWFydGgpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmNsb3Vkcyk7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuYXRtb3NwaGVyZSk7XG5cblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMudGlsdENvbnRhaW5lcik7XG5cblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIubG9va0F0T2JqZWN0ID0gdGhpcy50aWx0Q29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKCk6dm9pZFxuXHR7XG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXdoZWVsPSAoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KSA9PiB0aGlzLm9uTW91c2VXaGVlbChldmVudCk7XG5cblxuXHRcdHRoaXMub25SZXNpemUoKTtcblxuXHRcdHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdFx0dGhpcy5fdGltZXIuc3RhcnQoKTtcblxuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG5cblx0XHQvL3NldHVwIHRoZSB1cmwgbWFwIGZvciB0ZXh0dXJlcyBpbiB0aGUgY3ViZW1hcCBmaWxlXG5cdFx0dmFyIGFzc2V0TG9hZGVyQ29udGV4dDpBc3NldExvYWRlckNvbnRleHQgPSBuZXcgQXNzZXRMb2FkZXJDb250ZXh0KCk7XG5cdFx0YXNzZXRMb2FkZXJDb250ZXh0LmRlcGVuZGVuY3lCYXNlVXJsID0gXCJhc3NldHMvc2t5Ym94L1wiO1xuXG5cdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvc2t5Ym94L3NwYWNlX3RleHR1cmUuY3ViZVwiKSwgYXNzZXRMb2FkZXJDb250ZXh0KTtcblxuXHRcdC8vZ2xvYmUgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9jbG91ZF9jb21iaW5lZF8yMDQ4LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvZWFydGhfc3BlY3VsYXJfMjA0OC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL0VhcnRoTm9ybWFsLnBuZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvbGFuZF9saWdodHNfMTYzODQuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9sYW5kX29jZWFuX2ljZV8yMDQ4X21hdGNoLmpwZ1wiKSk7XG5cblx0XHQvL2ZsYXJlIHRleHR1cmVzXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMi5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTMuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU0LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNi5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTcuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU4LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTAuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMS5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEyLmpwZ1wiKSk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGlvbiBhbmQgcmVuZGVyIGxvb3Bcblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGR0Om51bWJlcik6dm9pZFxuXHR7XG5cdFx0dGhpcy5fdGltZSArPSBkdDtcblxuXHRcdHRoaXMuZWFydGgucm90YXRpb25ZICs9IDAuMjtcblx0XHR0aGlzLmNsb3Vkcy5yb3RhdGlvblkgKz0gMC4yMTtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyLnJvdGF0aW9uWSArPSAwLjAyO1xuXG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnVwZGF0ZSgpO1xuXG5cdFx0dGhpcy51cGRhdGVGbGFyZXMoKTtcblxuXHRcdHRoaXMudmlldy5yZW5kZXIoKTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRmxhcmVzKCk6dm9pZFxuXHR7XG5cdFx0dmFyIGZsYXJlVmlzaWJsZU9sZDpib29sZWFuID0gdGhpcy5mbGFyZVZpc2libGU7XG5cblx0XHR2YXIgc3VuU2NyZWVuUG9zaXRpb246VmVjdG9yM0QgPSB0aGlzLnZpZXcucHJvamVjdCh0aGlzLnN1bi5zY2VuZVBvc2l0aW9uKTtcblx0XHR2YXIgeE9mZnNldDpudW1iZXIgPSBzdW5TY3JlZW5Qb3NpdGlvbi54IC0gd2luZG93LmlubmVyV2lkdGgvMjtcblx0XHR2YXIgeU9mZnNldDpudW1iZXIgPSBzdW5TY3JlZW5Qb3NpdGlvbi55IC0gd2luZG93LmlubmVySGVpZ2h0LzI7XG5cblx0XHR2YXIgZWFydGhTY3JlZW5Qb3NpdGlvbjpWZWN0b3IzRCA9IHRoaXMudmlldy5wcm9qZWN0KHRoaXMuZWFydGguc2NlbmVQb3NpdGlvbik7XG5cdFx0dmFyIGVhcnRoUmFkaXVzOm51bWJlciA9IDE5MCAqIHdpbmRvdy5pbm5lckhlaWdodC9lYXJ0aFNjcmVlblBvc2l0aW9uLno7XG5cdFx0dmFyIGZsYXJlT2JqZWN0OkZsYXJlT2JqZWN0O1xuXG5cdFx0dGhpcy5mbGFyZVZpc2libGUgPSAoc3VuU2NyZWVuUG9zaXRpb24ueCA+IDAgJiYgc3VuU2NyZWVuUG9zaXRpb24ueCA8IHdpbmRvdy5pbm5lcldpZHRoICYmIHN1blNjcmVlblBvc2l0aW9uLnkgPiAwICYmIHN1blNjcmVlblBvc2l0aW9uLnkgIDwgd2luZG93LmlubmVySGVpZ2h0ICYmIHN1blNjcmVlblBvc2l0aW9uLnogPiAwICYmIE1hdGguc3FydCh4T2Zmc2V0KnhPZmZzZXQgKyB5T2Zmc2V0KnlPZmZzZXQpID4gZWFydGhSYWRpdXMpO1xuXG5cdFx0Ly91cGRhdGUgZmxhcmUgdmlzaWJpbGl0eVxuXHRcdGlmICh0aGlzLmZsYXJlVmlzaWJsZSAhPSBmbGFyZVZpc2libGVPbGQpIHtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IHRoaXMuZmxhcmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGZsYXJlT2JqZWN0ID0gdGhpcy5mbGFyZXNbaV07XG5cdFx0XHRcdGlmIChmbGFyZU9iamVjdClcblx0XHRcdFx0XHRmbGFyZU9iamVjdC5iaWxsYm9hcmQudmlzaWJsZSA9IHRoaXMuZmxhcmVWaXNpYmxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vdXBkYXRlIGZsYXJlIHBvc2l0aW9uXG5cdFx0aWYgKHRoaXMuZmxhcmVWaXNpYmxlKSB7XG5cdFx0XHR2YXIgZmxhcmVEaXJlY3Rpb246UG9pbnQgPSBuZXcgUG9pbnQoeE9mZnNldCwgeU9mZnNldCk7XG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLmZsYXJlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRmbGFyZU9iamVjdCA9IHRoaXMuZmxhcmVzW2ldO1xuXHRcdFx0XHRpZiAoZmxhcmVPYmplY3QpXG5cdFx0XHRcdFx0ZmxhcmVPYmplY3QuYmlsbGJvYXJkLnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMudmlldy51bnByb2plY3Qoc3VuU2NyZWVuUG9zaXRpb24ueCAtIGZsYXJlRGlyZWN0aW9uLngqZmxhcmVPYmplY3QucG9zaXRpb24sIHN1blNjcmVlblBvc2l0aW9uLnkgLSBmbGFyZURpcmVjdGlvbi55KmZsYXJlT2JqZWN0LnBvc2l0aW9uLCAxMDAgLSBpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVuZXIgZnVuY3Rpb24gZm9yIHJlc291cmNlIGNvbXBsZXRlIGV2ZW50IG9uIGFzc2V0IGxpYnJhcnlcblx0ICovXG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50OkxvYWRlckV2ZW50KVxuXHR7XG5cdFx0c3dpdGNoKGV2ZW50LnVybCkge1xuXHRcdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L3NwYWNlX3RleHR1cmUuY3ViZSc6XG5cdFx0XHRcdHRoaXMuY3ViZVRleHR1cmUgPSA8SW1hZ2VDdWJlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cblx0XHRcdFx0dGhpcy5za3lCb3ggPSBuZXcgU2t5Ym94KHRoaXMuY3ViZVRleHR1cmUpO1xuXHRcdFx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuc2t5Qm94KTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdC8vZ2xvYmUgdGV4dHVyZXNcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvY2xvdWRfY29tYmluZWRfMjA0OC5qcGdcIiA6XG5cdFx0XHRcdHZhciBjbG91ZEJpdG1hcERhdGE6Qml0bWFwRGF0YSA9IG5ldyBCaXRtYXBEYXRhKDIwNDgsIDEwMjQsIHRydWUsIDB4RkZGRkZGRkYpO1xuXHRcdFx0XHRjbG91ZEJpdG1hcERhdGEuY29weUNoYW5uZWwoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgY2xvdWRCaXRtYXBEYXRhLnJlY3QsIG5ldyBQb2ludCgpLCBCaXRtYXBEYXRhQ2hhbm5lbC5SRUQsIEJpdG1hcERhdGFDaGFubmVsLkFMUEhBKTtcblxuXHRcdFx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwudGV4dHVyZSA9IG5ldyBCaXRtYXBUZXh0dXJlKGNsb3VkQml0bWFwRGF0YSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9lYXJ0aF9zcGVjdWxhcl8yMDQ4LmpwZ1wiIDpcblx0XHRcdFx0dmFyIHNwZWNCaXRtYXBEYXRhOkJpdG1hcERhdGEgPSBDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pO1xuXHRcdFx0XHRzcGVjQml0bWFwRGF0YS5jb2xvclRyYW5zZm9ybShzcGVjQml0bWFwRGF0YS5yZWN0LCBuZXcgQ29sb3JUcmFuc2Zvcm0oMSwgMSwgMSwgMSwgNjQsIDY0LCA2NCkpO1xuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnNwZWN1bGFyTWFwID0gbmV3IEJpdG1hcFRleHR1cmUoc3BlY0JpdG1hcERhdGEpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvRWFydGhOb3JtYWwucG5nXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLm5vcm1hbE1hcCA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvbGFuZF9saWdodHNfMTYzODQuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2xhbmRfb2NlYW5faWNlXzIwNDhfbWF0Y2guanBnXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvL2ZsYXJlIHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTIuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s2XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxLjI1LCAxLjEsIDQ4LjQ1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTMuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s3XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxLjc1LCAxLjM3LCA3LjY1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTQuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s4XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAyLjc1LCAxLjg1LCAxMi43NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU2LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbNV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMSwgMC42OCwgMjAuNCwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzEwXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCA0LCAyLjUsIDEwLjQsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNy5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzJdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDIsIDAsIDI1LjUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1szXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCA0LCAwLCAxNy44NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzExXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxMCwgMi42NiwgNTAsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlOC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzldID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDAuNSwgMi4yMSwgMzMuMTUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTAuanBnXCIgOlxuXHRcdFx0XHR0aGlzLnN1bk1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbMF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMy4yLCAtMC4wMSwgMTAwLCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTExLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbMV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgNiwgMCwgMzAuNiwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzRdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDAuNCwgMC4zMiwgMjIuOTUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgZG93biBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLmxhc3RQYW5BbmdsZSA9IHRoaXMuY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZTtcblx0XHR0aGlzLmxhc3RUaWx0QW5nbGUgPSB0aGlzLmNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMubGFzdE1vdXNlWCA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy5sYXN0TW91c2VZID0gZXZlbnQuY2xpZW50WTtcblx0XHR0aGlzLm1vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLm1vdmUgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBtb3ZlIGxpc3RlbmVyIGZvciBtb3VzZUxvY2tcblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG4vLyAgICAgICAgICAgIGlmIChzdGFnZS5kaXNwbGF5U3RhdGUgPT0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU4pIHtcbi8vXG4vLyAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NrZWQgJiYgKGxhc3RNb3VzZVggIT0gMCB8fCBsYXN0TW91c2VZICE9IDApKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgZS5tb3ZlbWVudFggKz0gbGFzdE1vdXNlWDtcbi8vICAgICAgICAgICAgICAgICAgICBlLm1vdmVtZW50WSArPSBsYXN0TW91c2VZO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVggPSAwO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVkgPSAwO1xuLy8gICAgICAgICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgICAgICAgIG1vdXNlTG9ja1ggKz0gZS5tb3ZlbWVudFg7XG4vLyAgICAgICAgICAgICAgICBtb3VzZUxvY2tZICs9IGUubW92ZW1lbnRZO1xuLy9cbi8vICAgICAgICAgICAgICAgIGlmICghc3RhZ2UubW91c2VMb2NrKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgc3RhZ2UubW91c2VMb2NrID0gdHJ1ZTtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VYID0gc3RhZ2UubW91c2VYIC0gc3RhZ2Uuc3RhZ2VXaWR0aC8yO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVkgPSBzdGFnZS5tb3VzZVkgLSBzdGFnZS5zdGFnZUhlaWdodC8yO1xuLy8gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghbW91c2VMb2NrZWQpIHtcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tlZCA9IHRydWU7XG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgLy9lbnN1cmUgYm91bmRzIGZvciB0aWx0QW5nbGUgYXJlIG5vdCBlY2VlZGVkXG4vLyAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NrWSA+IGNhbWVyYUNvbnRyb2xsZXIubWF4VGlsdEFuZ2xlLzAuMylcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci5tYXhUaWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgZWxzZSBpZiAobW91c2VMb2NrWSA8IGNhbWVyYUNvbnRyb2xsZXIubWluVGlsdEFuZ2xlLzAuMylcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci5taW5UaWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAgaWYgKHN0YWdlLm1vdXNlTG9jaykge1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyptb3VzZUxvY2tYO1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqbW91c2VMb2NrWTtcbi8vICAgICAgICAgICAgfSBlbHNlIGlmIChtb3ZlKSB7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlID0gMC4zKihzdGFnZS5tb3VzZVggLSBsYXN0TW91c2VYKSArIGxhc3RQYW5BbmdsZTtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihzdGFnZS5tb3VzZVkgLSBsYXN0TW91c2VZKSArIGxhc3RUaWx0QW5nbGU7XG4vLyAgICAgICAgICAgIH1cblxuXHRcdGlmICh0aGlzLm1vdmUpIHtcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WCAtIHRoaXMubGFzdE1vdXNlWCkgKyB0aGlzLmxhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFkgLSB0aGlzLmxhc3RNb3VzZVkpICsgdGhpcy5sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB3aGVlbCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlV2hlZWwoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KVxuXHR7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIC09IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHRpZiAodGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIDwgNDAwKVxuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gNDAwO1xuXHRcdGVsc2UgaWYgKHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA+IDEwMDAwKVxuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gMTAwMDA7XG5cdH1cblxuXHQvKipcblx0ICogS2V5IGRvd24gbGlzdGVuZXIgZm9yIGZ1bGxzY3JlZW5cblx0ICovXG4vLyAgICAgICAgcHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudCk6dm9pZFxuLy8gICAgICAgIHtcbi8vICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKVxuLy8gICAgICAgICAgICB7XG4vLyAgICAgICAgICAgICAgICBjYXNlIEtleWJvYXJkLlNQQUNFOlxuLy8gICAgICAgICAgICAgICAgICAgIGlmIChzdGFnZS5kaXNwbGF5U3RhdGUgPT0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU4pIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuTk9STUFMO1xuLy8gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlLmRpc3BsYXlTdGF0ZSA9IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOO1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrZWQgPSBmYWxzZTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWCA9IGNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAgICBicmVhaztcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIH1cbi8vXG5cblx0LyoqXG5cdCAqIHdpbmRvdyBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudDpVSUV2ZW50ID0gbnVsbCk6dm9pZFxuXHR7XG5cdFx0dGhpcy52aWV3LnkgICAgICAgICA9IDA7XG5cdFx0dGhpcy52aWV3LnggICAgICAgICA9IDA7XG5cdFx0dGhpcy52aWV3LndpZHRoICAgICA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMudmlldy5oZWlnaHQgICAgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxuY2xhc3MgRmxhcmVPYmplY3Rcbntcblx0cHJpdmF0ZSBmbGFyZVNpemU6bnVtYmVyID0gMTQuNDtcblxuXHRwdWJsaWMgYmlsbGJvYXJkOkJpbGxib2FyZDtcblxuXHRwdWJsaWMgc2l6ZTpudW1iZXI7XG5cblx0cHVibGljIHBvc2l0aW9uOm51bWJlcjtcblxuXHRwdWJsaWMgb3BhY2l0eTpudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihiaXRtYXBEYXRhOkJpdG1hcERhdGEsIHNpemU6bnVtYmVyLCBwb3NpdGlvbjpudW1iZXIsIG9wYWNpdHk6bnVtYmVyLCBzY2VuZTpTY2VuZSlcblx0e1xuXHRcdHZhciBiZDpCaXRtYXBEYXRhID0gbmV3IEJpdG1hcERhdGEoYml0bWFwRGF0YS53aWR0aCwgYml0bWFwRGF0YS5oZWlnaHQsIHRydWUsIDB4RkZGRkZGRkYpO1xuXHRcdGJkLmNvcHlDaGFubmVsKGJpdG1hcERhdGEsIGJpdG1hcERhdGEucmVjdCwgbmV3IFBvaW50KCksIEJpdG1hcERhdGFDaGFubmVsLlJFRCwgQml0bWFwRGF0YUNoYW5uZWwuQUxQSEEpO1xuXG5cdFx0dmFyIGJpbGxib2FyZE1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKG5ldyBCaXRtYXBUZXh0dXJlKGJkKSk7XG5cdFx0YmlsbGJvYXJkTWF0ZXJpYWwuYWxwaGEgPSBvcGFjaXR5LzEwMDtcblx0XHRiaWxsYm9hcmRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHQvL2JpbGxib2FyZE1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5MQVlFUjtcblxuXHRcdHRoaXMuYmlsbGJvYXJkID0gbmV3IEJpbGxib2FyZChiaWxsYm9hcmRNYXRlcmlhbCk7XG5cdFx0dGhpcy5iaWxsYm9hcmQud2lkdGggPSBzaXplKnRoaXMuZmxhcmVTaXplO1xuXHRcdHRoaXMuYmlsbGJvYXJkLmhlaWdodCA9IHNpemUqdGhpcy5mbGFyZVNpemU7XG5cdFx0dGhpcy5iaWxsYm9hcmQucGl2b3QgPSBuZXcgVmVjdG9yM0Qoc2l6ZSp0aGlzLmZsYXJlU2l6ZS8yLCBzaXplKnRoaXMuZmxhcmVTaXplLzIsIDApO1xuXHRcdHRoaXMuYmlsbGJvYXJkLm9yaWVudGF0aW9uTW9kZSA9IE9yaWVudGF0aW9uTW9kZS5DQU1FUkFfUExBTkU7XG5cdFx0dGhpcy5iaWxsYm9hcmQuYWxpZ25tZW50TW9kZSA9IEFsaWdubWVudE1vZGUuUElWT1RfUE9JTlQ7XG5cdFx0dGhpcy5iaWxsYm9hcmQudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuc2l6ZSA9IHNpemU7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cblx0XHRzY2VuZS5hZGRDaGlsZCh0aGlzLmJpbGxib2FyZClcblx0fVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKClcbntcblx0bmV3IEludGVybWVkaWF0ZV9HbG9iZSgpO1xufSJdfQ==