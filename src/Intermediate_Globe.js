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
var DisplayObjectContainer = require("awayjs-core/lib/containers/DisplayObjectContainer");
var Scene = require("awayjs-core/lib/containers/Scene");
var View = require("awayjs-core/lib/containers/View");
var HoverController = require("awayjs-core/lib/controllers/HoverController");
var BitmapData = require("awayjs-core/lib/core/base/BitmapData");
var BitmapDataChannel = require("awayjs-core/lib/core/base/BitmapDataChannel");
var BlendMode = require("awayjs-core/lib/core/base/BlendMode");
var OrientationMode = require("awayjs-core/lib/core/base/OrientationMode");
var AlignmentMode = require("awayjs-core/lib/core/base/AlignmentMode");
var Camera = require("awayjs-core/lib/entities/Camera");
var Billboard = require("awayjs-core/lib/entities/Billboard");
var PointLight = require("awayjs-core/lib/entities/PointLight");
var Skybox = require("awayjs-core/lib/entities/Skybox");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var ColorTransform = require("awayjs-core/lib/core/geom/ColorTransform");
var Vector3D = require("awayjs-core/lib/core/geom/Vector3D");
var Point = require("awayjs-core/lib/core/geom/Point");
var AssetLibrary = require("awayjs-core/lib/core/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/core/library/AssetLoaderContext");
var URLRequest = require("awayjs-core/lib/core/net/URLRequest");
var SkyboxMaterial = require("awayjs-stagegl/lib/materials/SkyboxMaterial");
var TriangleMethodMaterial = require("awayjs-stagegl/lib/materials/TriangleMethodMaterial");
var StaticLightPicker = require("awayjs-core/lib/materials/lightpickers/StaticLightPicker");
var PrimitiveSpherePrefab = require("awayjs-core/lib/prefabs/PrimitiveSpherePrefab");
var DefaultRenderer = require("awayjs-stagegl/lib/core/render/DefaultRenderer");
var BitmapTexture = require("awayjs-core/lib/textures/BitmapTexture");
var Cast = require("awayjs-core/lib/utils/Cast");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var DiffuseCompositeMethod = require("awayjs-renderergl/lib/materials/methods/DiffuseCompositeMethod");
var SpecularCompositeMethod = require("awayjs-renderergl/lib/materials/methods/SpecularCompositeMethod");
var SpecularFresnelMethod = require("awayjs-renderergl/lib/materials/methods/SpecularFresnelMethod");
var SpecularPhongMethod = require("awayjs-renderergl/lib/materials/methods/SpecularPhongMethod");
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
        //var specBitmap:BitmapData = Cast.bitmapData(EarthSpecular);
        //specBitmap.colorTransform(specBitmap.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
        var specular = new SpecularFresnelMethod(true, new SpecularPhongMethod());
        specular.fresnelPower = 1;
        specular.normalReflectance = 0.1;
        this.sunMaterial = new TriangleMethodMaterial();
        this.sunMaterial.blendMode = BlendMode.ADD;
        this.groundMaterial = new TriangleMethodMaterial();
        this.groundMaterial.specularMethod = specular;
        this.groundMaterial.lightPicker = this.lightPicker;
        this.groundMaterial.gloss = 5;
        this.groundMaterial.specular = 1;
        this.groundMaterial.ambient = 1;
        this.groundMaterial.diffuseMethod.multiply = false;
        this.cloudMaterial = new TriangleMethodMaterial();
        this.cloudMaterial.alphaBlending = true;
        this.cloudMaterial.lightPicker = this.lightPicker;
        this.cloudMaterial.ambientColor = 0x1b2048;
        this.cloudMaterial.specular = 0;
        this.cloudMaterial.ambient = 1;
        this.atmosphereDiffuseMethod = new DiffuseCompositeMethod(this.modulateDiffuseMethod);
        this.atmosphereSpecularMethod = new SpecularCompositeMethod(this.modulateSpecularMethod, new SpecularPhongMethod());
        this.atmosphereMaterial = new TriangleMethodMaterial();
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
                this.skyBox = new Skybox(new SkyboxMaterial(this.cubeTexture));
                this.scene.addChild(this.skyBox);
                break;
            case "assets/globe/cloud_combined_2048.jpg":
                var cloudBitmapData = new BitmapData(2048, 1024, true, 0xFFFFFFFF);
                cloudBitmapData.copyChannel(Cast.bitmapData(event.assets[0]), cloudBitmapData.rect, new Point(), BitmapDataChannel.RED, BitmapDataChannel.ALPHA);
                this.cloudMaterial.texture = new BitmapTexture(cloudBitmapData, false); //TODO: fix mipmaps for bitmapdata textures
                break;
            case "assets/globe/earth_specular_2048.jpg":
                var specBitmapData = Cast.bitmapData(event.assets[0]);
                specBitmapData.colorTransform(specBitmapData.rect, new ColorTransform(1, 1, 1, 1, 64, 64, 64));
                this.groundMaterial.specularMap = new BitmapTexture(specBitmapData, false); //TODO: fix mipmaps for bitmapdata textures
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
        var billboardMaterial = new TriangleMethodMaterial(new BitmapTexture(bd, false));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfR2xvYmUudHMiXSwibmFtZXMiOlsiSW50ZXJtZWRpYXRlX0dsb2JlIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXQiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdEVuZ2luZSIsIkludGVybWVkaWF0ZV9HbG9iZS5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXRNYXRlcmlhbHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUubW9kdWxhdGVEaWZmdXNlTWV0aG9kIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm1vZHVsYXRlU3BlY3VsYXJNZXRob2QiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdE9iamVjdHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9HbG9iZS5vbkVudGVyRnJhbWUiLCJJbnRlcm1lZGlhdGVfR2xvYmUudXBkYXRlRmxhcmVzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlRG93biIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlVXAiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZVdoZWVsIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzaXplIiwiRmxhcmVPYmplY3QiLCJGbGFyZU9iamVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW9DRTtBQUVGLElBQU8sc0JBQXNCLFdBQVksbURBQW1ELENBQUMsQ0FBQztBQUM5RixJQUFPLEtBQUssV0FBZ0Isa0NBQWtDLENBQUMsQ0FBQztBQUVoRSxJQUFPLElBQUksV0FBaUIsaUNBQWlDLENBQUMsQ0FBQztBQUMvRCxJQUFPLGVBQWUsV0FB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QVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDRDQUE0Q0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaEZBLEFBQ0FBLGdCQURnQkE7UUFDaEJBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0Es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QSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDcEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoR0EsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsNkJBQTZCQTtnQkFDakNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM3RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlGQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFrQkEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7Z0JBQzVEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDN0ZBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1FBQ1JBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURaOztPQUVHQTtJQUNLQSx3Q0FBV0EsR0FBbkJBLFVBQW9CQSxLQUFnQkE7UUFFbkNhLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlB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UUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBO1FBRXZCQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFBQTtJQUMvQkEsQ0FBQ0E7SUFDRkQsa0JBQUNBO0FBQURBLENBdENBLEFBc0NDQSxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUVmLElBQUksa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixDQUFDLENBQUEiLCJmaWxlIjoiSW50ZXJtZWRpYXRlX0dsb2JlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuR2xvYmUgZXhhbXBsZSBpbiBBd2F5M2RcblxuRGVtb25zdHJhdGVzOlxuXG5Ib3cgdG8gY3JlYXRlIGEgdGV4dHVyZWQgc3BoZXJlLlxuSG93IHRvIHVzZSBjb250YWluZXJzIHRvIHJvdGF0ZSBhbiBvYmplY3QuXG5Ib3cgdG8gdXNlIHRoZSBQaG9uZ0JpdG1hcE1hdGVyaWFsLlxuXG5Db2RlIGJ5IFJvYiBCYXRlbWFuXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuXG5UaGlzIGNvZGUgaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgVGhlIEF3YXkgRm91bmRhdGlvbiBodHRwOi8vd3d3LnRoZWF3YXlmb3VuZGF0aW9uLm9yZ1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDigJxTb2Z0d2FyZeKAnSksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQg4oCcQVMgSVPigJ0sIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG5pbXBvcnQgRGlzcGxheU9iamVjdENvbnRhaW5lclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29udGFpbmVycy9EaXNwbGF5T2JqZWN0Q29udGFpbmVyXCIpO1xuaW1wb3J0IFNjZW5lXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvbnRhaW5lcnMvU2NlbmVcIik7XG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgSG92ZXJDb250cm9sbGVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29udHJvbGxlcnMvSG92ZXJDb250cm9sbGVyXCIpO1xuaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IEJpdG1hcERhdGFDaGFubmVsXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9CaXRtYXBEYXRhQ2hhbm5lbFwiKTtcbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgT3JpZW50YXRpb25Nb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9iYXNlL09yaWVudGF0aW9uTW9kZVwiKTtcbmltcG9ydCBBbGlnbm1lbnRNb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9iYXNlL0FsaWdubWVudE1vZGVcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBCaWxsYm9hcmRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2VudGl0aWVzL0JpbGxib2FyZFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9Qb2ludExpZ2h0XCIpO1xuaW1wb3J0IFNreWJveFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgTG9hZGVyRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBDb2xvclRyYW5zZm9ybVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2NvcmUvZ2VvbS9Db2xvclRyYW5zZm9ybVwiKTtcbmltcG9ydCBWZWN0b3IzRFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgUG9pbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9nZW9tL1BvaW50XCIpO1xuaW1wb3J0IEFzc2V0TGlicmFyeVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L0Fzc2V0TGlicmFyeVwiKTtcbmltcG9ydCBBc3NldExvYWRlckNvbnRleHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvY29yZS9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9jb3JlL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFNreWJveE1hdGVyaWFsXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL1NreWJveE1hdGVyaWFsXCIpO1xuaW1wb3J0IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWxcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9UcmlhbmdsZU1ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL21hdGVyaWFscy9saWdodHBpY2tlcnMvU3RhdGljTGlnaHRQaWNrZXJcIik7XG5pbXBvcnQgUHJpbWl0aXZlU3BoZXJlUHJlZmFiXHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9wcmVmYWJzL1ByaW1pdGl2ZVNwaGVyZVByZWZhYlwiKTtcbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9jb3JlL3JlbmRlci9EZWZhdWx0UmVuZGVyZXJcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSW1hZ2VUZXh0dXJlXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZVRleHR1cmVcIik7XG5pbXBvcnQgQml0bWFwVGV4dHVyZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0JpdG1hcFRleHR1cmVcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL0Nhc3RcIik7XG5pbXBvcnQgUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91dGlscy9SZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIik7XG5cbmltcG9ydCBEaWZmdXNlQ29tcG9zaXRlTWV0aG9kXHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9EaWZmdXNlQ29tcG9zaXRlTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyQ29tcG9zaXRlTWV0aG9kXHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9TcGVjdWxhckNvbXBvc2l0ZU1ldGhvZFwiKTtcbmltcG9ydCBEaWZmdXNlQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvRGlmZnVzZUJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJCYXNpY01ldGhvZFwiKTtcbmltcG9ydCBNZXRob2RWT1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vTWV0aG9kVk9cIik7XG5pbXBvcnQgU3BlY3VsYXJGcmVzbmVsTWV0aG9kXHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9TcGVjdWxhckZyZXNuZWxNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJQaG9uZ01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9TcGVjdWxhclBob25nTWV0aG9kXCIpO1xuaW1wb3J0IFNoYWRlck9iamVjdEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyT2JqZWN0QmFzZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckVsZW1lbnRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckVsZW1lbnRcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJDYWNoZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJDYWNoZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckRhdGFcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRGF0YVwiKTtcblxuY2xhc3MgSW50ZXJtZWRpYXRlX0dsb2JlXG57XG5cdC8vZW5naW5lIHZhcmlhYmxlc1xuXHRwcml2YXRlIHNjZW5lOlNjZW5lO1xuXHRwcml2YXRlIGNhbWVyYTpDYW1lcmE7XG5cdHByaXZhdGUgdmlldzpWaWV3O1xuXHRwcml2YXRlIGNhbWVyYUNvbnRyb2xsZXI6SG92ZXJDb250cm9sbGVyO1xuXG5cdC8vbWF0ZXJpYWwgb2JqZWN0c1xuXHRwcml2YXRlIHN1bk1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgZ3JvdW5kTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBjbG91ZE1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgYXRtb3NwaGVyZU1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgYXRtb3NwaGVyZURpZmZ1c2VNZXRob2Q6RGlmZnVzZUJhc2ljTWV0aG9kO1xuXHRwcml2YXRlIGF0bW9zcGhlcmVTcGVjdWxhck1ldGhvZDpTcGVjdWxhckJhc2ljTWV0aG9kO1xuXHRwcml2YXRlIGN1YmVUZXh0dXJlOkltYWdlQ3ViZVRleHR1cmU7XG5cblx0Ly9zY2VuZSBvYmplY3RzXG5cdHByaXZhdGUgc3VuOkJpbGxib2FyZDtcblx0cHJpdmF0ZSBlYXJ0aDpNZXNoO1xuXHRwcml2YXRlIGNsb3VkczpNZXNoO1xuXHRwcml2YXRlIGF0bW9zcGhlcmU6TWVzaDtcblx0cHJpdmF0ZSB0aWx0Q29udGFpbmVyOkRpc3BsYXlPYmplY3RDb250YWluZXI7XG5cdHByaXZhdGUgb3JiaXRDb250YWluZXI6RGlzcGxheU9iamVjdENvbnRhaW5lcjtcblx0cHJpdmF0ZSBza3lCb3g6U2t5Ym94O1xuXG5cdC8vbGlnaHQgb2JqZWN0c1xuXHRwcml2YXRlIGxpZ2h0OlBvaW50TGlnaHQ7XG5cdHByaXZhdGUgbGlnaHRQaWNrZXI6U3RhdGljTGlnaHRQaWNrZXI7XG5cdHByaXZhdGUgZmxhcmVzOkZsYXJlT2JqZWN0W10gPSBuZXcgQXJyYXk8RmxhcmVPYmplY3Q+KDEyKTtcblxuXHQvL25hdmlnYXRpb24gdmFyaWFibGVzXG5cdHByaXZhdGUgX3RpbWVyOlJlcXVlc3RBbmltYXRpb25GcmFtZTtcblx0cHJpdmF0ZSBfdGltZTpudW1iZXIgPSAwO1xuXHRwcml2YXRlIG1vdmU6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIGxhc3RQYW5BbmdsZTpudW1iZXI7XG5cdHByaXZhdGUgbGFzdFRpbHRBbmdsZTpudW1iZXI7XG5cdHByaXZhdGUgbGFzdE1vdXNlWDpudW1iZXI7XG5cdHByaXZhdGUgbGFzdE1vdXNlWTpudW1iZXI7XG5cdHByaXZhdGUgbW91c2VMb2NrWDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIG1vdXNlTG9ja1k6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3VzZUxvY2tlZDpib29sZWFuO1xuXHRwcml2YXRlIGZsYXJlVmlzaWJsZTpib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblxuXHQvKipcblx0ICogR2xvYmFsIGluaXRpYWxpc2UgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgaW5pdCgpOnZvaWRcblx0e1xuXHRcdHRoaXMuaW5pdEVuZ2luZSgpO1xuXHRcdHRoaXMuaW5pdExpZ2h0cygpO1xuXHRcdC8vaW5pdExlbnNGbGFyZSgpO1xuXHRcdHRoaXMuaW5pdE1hdGVyaWFscygpO1xuXHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0XHR0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcblx0ICovXG5cdHByaXZhdGUgaW5pdEVuZ2luZSgpOnZvaWRcblx0e1xuXHRcdHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoKTtcblxuXHRcdC8vc2V0dXAgY2FtZXJhIGZvciBvcHRpbWFsIHNreWJveCByZW5kZXJpbmdcblx0XHR0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEoKTtcblx0XHR0aGlzLmNhbWVyYS5wcm9qZWN0aW9uLmZhciA9IDEwMDAwMDtcblxuXHRcdHRoaXMudmlldyA9IG5ldyBWaWV3KG5ldyBEZWZhdWx0UmVuZGVyZXIoKSk7XG5cdFx0dGhpcy52aWV3LnNjZW5lID0gdGhpcy5zY2VuZTtcblx0XHR0aGlzLnZpZXcuY2FtZXJhID0gdGhpcy5jYW1lcmE7XG5cblx0XHQvL3NldHVwIGNvbnRyb2xsZXIgdG8gYmUgdXNlZCBvbiB0aGUgY2FtZXJhXG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyID0gbmV3IEhvdmVyQ29udHJvbGxlcih0aGlzLmNhbWVyYSwgbnVsbCwgMCwgMCwgNjAwLCAtOTAsIDkwKTtcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIuYXV0b1VwZGF0ZSA9IGZhbHNlO1xuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci55RmFjdG9yID0gMTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaWdodHNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpZ2h0cygpOnZvaWRcblx0e1xuXHRcdHRoaXMubGlnaHQgPSBuZXcgUG9pbnRMaWdodCgpO1xuXHRcdHRoaXMubGlnaHQueCA9IDEwMDAwO1xuXHRcdHRoaXMubGlnaHQuYW1iaWVudCA9IDE7XG5cdFx0dGhpcy5saWdodC5kaWZmdXNlID0gMjtcblxuXHRcdHRoaXMubGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIoW3RoaXMubGlnaHRdKTtcblx0fVxuLypcblx0cHJpdmF0ZSBpbml0TGVuc0ZsYXJlKCk6dm9pZFxuXHR7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTEwKCksICAzLjIsIC0wLjAxLCAxNDcuOSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUxMSgpLCAgNiwgICAgMCwgICAgIDMwLjYpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNygpLCAgIDIsICAgIDAsICAgICAyNS41KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICA0LCAgICAwLCAgICAgMTcuODUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMTIoKSwgIDAuNCwgIDAuMzIsICAyMi45NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU2KCksICAgMSwgICAgMC42OCwgIDIwLjQpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMigpLCAgIDEuMjUsIDEuMSwgICA0OC40NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUzKCksICAgMS43NSwgMS4zNywgICA3LjY1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTQoKSwgICAyLjc1LCAxLjg1LCAgMTIuNzUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlOCgpLCAgIDAuNSwgIDIuMjEsICAzMy4xNSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU2KCksICAgNCwgICAgMi41LCAgIDEwLjQpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNygpLCAgIDEwLCAgIDIuNjYsICA1MCkpO1xuXHR9XG4qL1xuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbWF0ZXJpYWxzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRNYXRlcmlhbHMoKTp2b2lkXG5cdHtcblx0XHQvL3RoaXMuY3ViZVRleHR1cmUgPSBuZXcgQml0bWFwQ3ViZVRleHR1cmUoQ2FzdC5iaXRtYXBEYXRhKFBvc1gpLCBDYXN0LmJpdG1hcERhdGEoTmVnWCksIENhc3QuYml0bWFwRGF0YShQb3NZKSwgQ2FzdC5iaXRtYXBEYXRhKE5lZ1kpLCBDYXN0LmJpdG1hcERhdGEoUG9zWiksIENhc3QuYml0bWFwRGF0YShOZWdaKSk7XG5cblx0XHQvL2FkanVzdCBzcGVjdWxhciBtYXBcblx0XHQvL3ZhciBzcGVjQml0bWFwOkJpdG1hcERhdGEgPSBDYXN0LmJpdG1hcERhdGEoRWFydGhTcGVjdWxhcik7XG5cdFx0Ly9zcGVjQml0bWFwLmNvbG9yVHJhbnNmb3JtKHNwZWNCaXRtYXAucmVjdCwgbmV3IENvbG9yVHJhbnNmb3JtKDEsIDEsIDEsIDEsIDY0LCA2NCwgNjQpKTtcblxuXHRcdHZhciBzcGVjdWxhcjpTcGVjdWxhckZyZXNuZWxNZXRob2QgPSBuZXcgU3BlY3VsYXJGcmVzbmVsTWV0aG9kKHRydWUsIG5ldyBTcGVjdWxhclBob25nTWV0aG9kKCkpO1xuXHRcdHNwZWN1bGFyLmZyZXNuZWxQb3dlciA9IDE7XG5cdFx0c3BlY3VsYXIubm9ybWFsUmVmbGVjdGFuY2UgPSAwLjE7XG5cblx0XHR0aGlzLnN1bk1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLnN1bk1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5BREQ7XG5cblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kID0gc3BlY3VsYXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5nbG9zcyA9IDU7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhciA9IDE7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmRpZmZ1c2VNZXRob2QubXVsdGlwbHkgPSBmYWxzZTtcblxuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLmFscGhhQmxlbmRpbmcgPSB0cnVlO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLmFtYmllbnRDb2xvciA9IDB4MWIyMDQ4O1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5zcGVjdWxhciA9IDA7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLmFtYmllbnQgPSAxO1xuXG5cdFx0dGhpcy5hdG1vc3BoZXJlRGlmZnVzZU1ldGhvZCA9IG5ldyBEaWZmdXNlQ29tcG9zaXRlTWV0aG9kKHRoaXMubW9kdWxhdGVEaWZmdXNlTWV0aG9kKTtcblx0XHR0aGlzLmF0bW9zcGhlcmVTcGVjdWxhck1ldGhvZCA9IG5ldyBTcGVjdWxhckNvbXBvc2l0ZU1ldGhvZCh0aGlzLm1vZHVsYXRlU3BlY3VsYXJNZXRob2QsIG5ldyBTcGVjdWxhclBob25nTWV0aG9kKCkpO1xuXG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmRpZmZ1c2VNZXRob2QgPSB0aGlzLmF0bW9zcGhlcmVEaWZmdXNlTWV0aG9kO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kID0gdGhpcy5hdG1vc3BoZXJlU3BlY3VsYXJNZXRob2Q7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkFERDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuc3BlY3VsYXIgPSAwLjU7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZ2xvc3MgPSA1O1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmFtYmllbnRDb2xvciA9IDA7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gMHgxNjcxY2M7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYW1iaWVudCA9IDE7XG5cdH1cblxuXHRwcml2YXRlIG1vZHVsYXRlRGlmZnVzZU1ldGhvZChzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHRhcmdldFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHJlZ0NhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIHZpZXdEaXJGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMudmlld0RpckZyYWdtZW50O1xuXHRcdHZhciBub3JtYWxGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQ7XG5cblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcImRwMyBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdmlld0RpckZyYWdtZW50UmVnICsgXCIueHl6LCBcIiArIG5vcm1hbEZyYWdtZW50UmVnICsgXCIueHl6XFxuXCIgK1xuXHRcdFx0XCJtdWwgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIud1xcblwiO1xuXG5cdFx0cmV0dXJuIGNvZGU7XG5cdH1cblxuXHRwcml2YXRlIG1vZHVsYXRlU3BlY3VsYXJNZXRob2Qoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCB0YXJnZXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCByZWdDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHZhciB2aWV3RGlyRnJhZ21lbnRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gc2hhcmVkUmVnaXN0ZXJzLnZpZXdEaXJGcmFnbWVudDtcblx0XHR2YXIgbm9ybWFsRnJhZ21lbnRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gc2hhcmVkUmVnaXN0ZXJzLm5vcm1hbEZyYWdtZW50O1xuXHRcdHZhciB0ZW1wOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHJlZ0NhY2hlLmdldEZyZWVGcmFnbWVudFNpbmdsZVRlbXAoKTtcblx0XHRyZWdDYWNoZS5hZGRGcmFnbWVudFRlbXBVc2FnZXModGVtcCwgMSk7XG5cblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcImRwMyBcIiArIHRlbXAgKyBcIiwgXCIgKyB2aWV3RGlyRnJhZ21lbnRSZWcgKyBcIi54eXosIFwiICsgbm9ybWFsRnJhZ21lbnRSZWcgKyBcIi54eXpcXG5cIiArXG5cdFx0XHRcIm5lZyBcIiArIHRlbXAgKyBcIiwgXCIgKyB0ZW1wICsgXCJcXG5cIiArXG5cdFx0XHRcIm11bCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0ZW1wICsgXCJcXG5cIjtcblxuXHRcdHJlZ0NhY2hlLnJlbW92ZUZyYWdtZW50VGVtcFVzYWdlKHRlbXApO1xuXG5cdFx0cmV0dXJuIGNvZGU7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgc2NlbmUgb2JqZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0T2JqZWN0cygpOnZvaWRcblx0e1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIgPSBuZXcgRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5saWdodCk7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLm9yYml0Q29udGFpbmVyKTtcblxuXHRcdHRoaXMuc3VuID0gbmV3IEJpbGxib2FyZCh0aGlzLnN1bk1hdGVyaWFsKTtcblx0XHR0aGlzLnN1bi53aWR0aCA9IDMwMDA7XG5cdFx0dGhpcy5zdW4uaGVpZ2h0ID0gMzAwMDtcblx0XHR0aGlzLnN1bi5waXZvdCA9IG5ldyBWZWN0b3IzRCgxNTAwLDE1MDAsMCk7XG5cdFx0dGhpcy5zdW4ub3JpZW50YXRpb25Nb2RlID0gT3JpZW50YXRpb25Nb2RlLkNBTUVSQV9QTEFORTtcblx0XHR0aGlzLnN1bi5hbGlnbm1lbnRNb2RlID0gQWxpZ25tZW50TW9kZS5QSVZPVF9QT0lOVDtcblx0XHR0aGlzLnN1bi54ID0gMTAwMDA7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnN1bik7XG5cblx0XHR0aGlzLmVhcnRoID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjAwLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5lYXJ0aC5tYXRlcmlhbCA9IHRoaXMuZ3JvdW5kTWF0ZXJpYWw7XG5cblx0XHR0aGlzLmNsb3VkcyA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDIwMiwgMjAwLCAxMDApLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuY2xvdWRzLm1hdGVyaWFsID0gdGhpcy5jbG91ZE1hdGVyaWFsO1xuXG5cdFx0dGhpcy5hdG1vc3BoZXJlID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjEwLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlLm1hdGVyaWFsID0gdGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWw7XG5cdFx0dGhpcy5hdG1vc3BoZXJlLnNjYWxlWCA9IC0xO1xuXG5cdFx0dGhpcy50aWx0Q29udGFpbmVyID0gbmV3IERpc3BsYXlPYmplY3RDb250YWluZXIoKTtcblx0XHR0aGlzLnRpbHRDb250YWluZXIucm90YXRpb25YID0gLTIzO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmVhcnRoKTtcblx0XHR0aGlzLnRpbHRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5jbG91ZHMpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmF0bW9zcGhlcmUpO1xuXG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnRpbHRDb250YWluZXIpO1xuXG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmxvb2tBdE9iamVjdCA9IHRoaXMudGlsdENvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaXN0ZW5lcnNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpc3RlbmVycygpOnZvaWRcblx0e1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQ6VUlFdmVudCkgPT4gdGhpcy5vblJlc2l6ZShldmVudCk7XG5cblx0XHRkb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNldXAgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlVXAoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V3aGVlbD0gKGV2ZW50Ok1vdXNlV2hlZWxFdmVudCkgPT4gdGhpcy5vbk1vdXNlV2hlZWwoZXZlbnQpO1xuXG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cblx0XHRBc3NldExpYnJhcnkuYWRkRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgKGV2ZW50OkxvYWRlckV2ZW50KSA9PiB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9zcGFjZV90ZXh0dXJlLmN1YmVcIiksIGFzc2V0TG9hZGVyQ29udGV4dCk7XG5cblx0XHQvL2dsb2JlIHRleHR1cmVzXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvY2xvdWRfY29tYmluZWRfMjA0OC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2VhcnRoX3NwZWN1bGFyXzIwNDguanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9FYXJ0aE5vcm1hbC5wbmdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2xhbmRfbGlnaHRzXzE2Mzg0LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvbGFuZF9vY2Vhbl9pY2VfMjA0OF9tYXRjaC5qcGdcIikpO1xuXG5cdFx0Ly9mbGFyZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTIuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUzLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTYuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU3LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlOC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEwLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTEuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMi5qcGdcIikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3RpbWUgKz0gZHQ7XG5cblx0XHR0aGlzLmVhcnRoLnJvdGF0aW9uWSArPSAwLjI7XG5cdFx0dGhpcy5jbG91ZHMucm90YXRpb25ZICs9IDAuMjE7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5yb3RhdGlvblkgKz0gMC4wMjtcblxuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci51cGRhdGUoKTtcblxuXHRcdHRoaXMudXBkYXRlRmxhcmVzKCk7XG5cblx0XHR0aGlzLnZpZXcucmVuZGVyKCk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUZsYXJlcygpOnZvaWRcblx0e1xuXHRcdHZhciBmbGFyZVZpc2libGVPbGQ6Ym9vbGVhbiA9IHRoaXMuZmxhcmVWaXNpYmxlO1xuXG5cdFx0dmFyIHN1blNjcmVlblBvc2l0aW9uOlZlY3RvcjNEID0gdGhpcy52aWV3LnByb2plY3QodGhpcy5zdW4uc2NlbmVQb3NpdGlvbik7XG5cdFx0dmFyIHhPZmZzZXQ6bnVtYmVyID0gc3VuU2NyZWVuUG9zaXRpb24ueCAtIHdpbmRvdy5pbm5lcldpZHRoLzI7XG5cdFx0dmFyIHlPZmZzZXQ6bnVtYmVyID0gc3VuU2NyZWVuUG9zaXRpb24ueSAtIHdpbmRvdy5pbm5lckhlaWdodC8yO1xuXG5cdFx0dmFyIGVhcnRoU2NyZWVuUG9zaXRpb246VmVjdG9yM0QgPSB0aGlzLnZpZXcucHJvamVjdCh0aGlzLmVhcnRoLnNjZW5lUG9zaXRpb24pO1xuXHRcdHZhciBlYXJ0aFJhZGl1czpudW1iZXIgPSAxOTAgKiB3aW5kb3cuaW5uZXJIZWlnaHQvZWFydGhTY3JlZW5Qb3NpdGlvbi56O1xuXHRcdHZhciBmbGFyZU9iamVjdDpGbGFyZU9iamVjdDtcblxuXHRcdHRoaXMuZmxhcmVWaXNpYmxlID0gKHN1blNjcmVlblBvc2l0aW9uLnggPiAwICYmIHN1blNjcmVlblBvc2l0aW9uLnggPCB3aW5kb3cuaW5uZXJXaWR0aCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi55ID4gMCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi55ICA8IHdpbmRvdy5pbm5lckhlaWdodCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi56ID4gMCAmJiBNYXRoLnNxcnQoeE9mZnNldCp4T2Zmc2V0ICsgeU9mZnNldCp5T2Zmc2V0KSA+IGVhcnRoUmFkaXVzKTtcblxuXHRcdC8vdXBkYXRlIGZsYXJlIHZpc2liaWxpdHlcblx0XHRpZiAodGhpcy5mbGFyZVZpc2libGUgIT0gZmxhcmVWaXNpYmxlT2xkKSB7XG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLmZsYXJlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRmbGFyZU9iamVjdCA9IHRoaXMuZmxhcmVzW2ldO1xuXHRcdFx0XHRpZiAoZmxhcmVPYmplY3QpXG5cdFx0XHRcdFx0ZmxhcmVPYmplY3QuYmlsbGJvYXJkLnZpc2libGUgPSB0aGlzLmZsYXJlVmlzaWJsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3VwZGF0ZSBmbGFyZSBwb3NpdGlvblxuXHRcdGlmICh0aGlzLmZsYXJlVmlzaWJsZSkge1xuXHRcdFx0dmFyIGZsYXJlRGlyZWN0aW9uOlBvaW50ID0gbmV3IFBvaW50KHhPZmZzZXQsIHlPZmZzZXQpO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgdGhpcy5mbGFyZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZmxhcmVPYmplY3QgPSB0aGlzLmZsYXJlc1tpXTtcblx0XHRcdFx0aWYgKGZsYXJlT2JqZWN0KVxuXHRcdFx0XHRcdGZsYXJlT2JqZWN0LmJpbGxib2FyZC50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLnZpZXcudW5wcm9qZWN0KHN1blNjcmVlblBvc2l0aW9uLnggLSBmbGFyZURpcmVjdGlvbi54KmZsYXJlT2JqZWN0LnBvc2l0aW9uLCBzdW5TY3JlZW5Qb3NpdGlvbi55IC0gZmxhcmVEaXJlY3Rpb24ueSpmbGFyZU9iamVjdC5wb3NpdGlvbiwgMTAwIC0gaSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZ1bmN0aW9uIGZvciByZXNvdXJjZSBjb21wbGV0ZSBldmVudCBvbiBhc3NldCBsaWJyYXJ5XG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZShldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHN3aXRjaChldmVudC51cmwpIHtcblx0XHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdFx0Y2FzZSAnYXNzZXRzL3NreWJveC9zcGFjZV90ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHR0aGlzLmN1YmVUZXh0dXJlID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXG5cdFx0XHRcdHRoaXMuc2t5Qm94ID0gbmV3IFNreWJveChuZXcgU2t5Ym94TWF0ZXJpYWwodGhpcy5jdWJlVGV4dHVyZSkpO1xuXHRcdFx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMuc2t5Qm94KTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdC8vZ2xvYmUgdGV4dHVyZXNcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvY2xvdWRfY29tYmluZWRfMjA0OC5qcGdcIiA6XG5cdFx0XHRcdHZhciBjbG91ZEJpdG1hcERhdGE6Qml0bWFwRGF0YSA9IG5ldyBCaXRtYXBEYXRhKDIwNDgsIDEwMjQsIHRydWUsIDB4RkZGRkZGRkYpO1xuXHRcdFx0XHRjbG91ZEJpdG1hcERhdGEuY29weUNoYW5uZWwoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgY2xvdWRCaXRtYXBEYXRhLnJlY3QsIG5ldyBQb2ludCgpLCBCaXRtYXBEYXRhQ2hhbm5lbC5SRUQsIEJpdG1hcERhdGFDaGFubmVsLkFMUEhBKTtcblxuXHRcdFx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwudGV4dHVyZSA9IG5ldyBCaXRtYXBUZXh0dXJlKGNsb3VkQml0bWFwRGF0YSwgZmFsc2UpOyAvL1RPRE86IGZpeCBtaXBtYXBzIGZvciBiaXRtYXBkYXRhIHRleHR1cmVzXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9lYXJ0aF9zcGVjdWxhcl8yMDQ4LmpwZ1wiIDpcblx0XHRcdFx0dmFyIHNwZWNCaXRtYXBEYXRhOkJpdG1hcERhdGEgPSBDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pO1xuXHRcdFx0XHRzcGVjQml0bWFwRGF0YS5jb2xvclRyYW5zZm9ybShzcGVjQml0bWFwRGF0YS5yZWN0LCBuZXcgQ29sb3JUcmFuc2Zvcm0oMSwgMSwgMSwgMSwgNjQsIDY0LCA2NCkpO1xuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnNwZWN1bGFyTWFwID0gbmV3IEJpdG1hcFRleHR1cmUoc3BlY0JpdG1hcERhdGEsIGZhbHNlKTsgLy9UT0RPOiBmaXggbWlwbWFwcyBmb3IgYml0bWFwZGF0YSB0ZXh0dXJlc1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvRWFydGhOb3JtYWwucG5nXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLm5vcm1hbE1hcCA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvbGFuZF9saWdodHNfMTYzODQuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2xhbmRfb2NlYW5faWNlXzIwNDhfbWF0Y2guanBnXCIgOlxuXHRcdFx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmRpZmZ1c2VUZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvL2ZsYXJlIHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTIuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s2XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxLjI1LCAxLjEsIDQ4LjQ1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTMuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s3XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxLjc1LCAxLjM3LCA3LjY1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTQuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s4XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAyLjc1LCAxLjg1LCAxMi43NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU2LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbNV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMSwgMC42OCwgMjAuNCwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzEwXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCA0LCAyLjUsIDEwLjQsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNy5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzJdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDIsIDAsIDI1LjUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1szXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCA0LCAwLCAxNy44NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzExXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxMCwgMi42NiwgNTAsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlOC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzldID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDAuNSwgMi4yMSwgMzMuMTUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTAuanBnXCIgOlxuXHRcdFx0XHR0aGlzLnN1bk1hdGVyaWFsLnRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbMF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMy4yLCAtMC4wMSwgMTAwLCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTExLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbMV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgNiwgMCwgMzAuNiwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzRdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDAuNCwgMC4zMiwgMjIuOTUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgZG93biBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlRG93bihldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLmxhc3RQYW5BbmdsZSA9IHRoaXMuY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZTtcblx0XHR0aGlzLmxhc3RUaWx0QW5nbGUgPSB0aGlzLmNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMubGFzdE1vdXNlWCA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy5sYXN0TW91c2VZID0gZXZlbnQuY2xpZW50WTtcblx0XHR0aGlzLm1vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcblx0XHR0aGlzLm1vdmUgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBtb3ZlIGxpc3RlbmVyIGZvciBtb3VzZUxvY2tcblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG4vLyAgICAgICAgICAgIGlmIChzdGFnZS5kaXNwbGF5U3RhdGUgPT0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU4pIHtcbi8vXG4vLyAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NrZWQgJiYgKGxhc3RNb3VzZVggIT0gMCB8fCBsYXN0TW91c2VZICE9IDApKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgZS5tb3ZlbWVudFggKz0gbGFzdE1vdXNlWDtcbi8vICAgICAgICAgICAgICAgICAgICBlLm1vdmVtZW50WSArPSBsYXN0TW91c2VZO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVggPSAwO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVkgPSAwO1xuLy8gICAgICAgICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgICAgICAgIG1vdXNlTG9ja1ggKz0gZS5tb3ZlbWVudFg7XG4vLyAgICAgICAgICAgICAgICBtb3VzZUxvY2tZICs9IGUubW92ZW1lbnRZO1xuLy9cbi8vICAgICAgICAgICAgICAgIGlmICghc3RhZ2UubW91c2VMb2NrKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgc3RhZ2UubW91c2VMb2NrID0gdHJ1ZTtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VYID0gc3RhZ2UubW91c2VYIC0gc3RhZ2Uuc3RhZ2VXaWR0aC8yO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVkgPSBzdGFnZS5tb3VzZVkgLSBzdGFnZS5zdGFnZUhlaWdodC8yO1xuLy8gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghbW91c2VMb2NrZWQpIHtcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tlZCA9IHRydWU7XG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgLy9lbnN1cmUgYm91bmRzIGZvciB0aWx0QW5nbGUgYXJlIG5vdCBlY2VlZGVkXG4vLyAgICAgICAgICAgICAgICBpZiAobW91c2VMb2NrWSA+IGNhbWVyYUNvbnRyb2xsZXIubWF4VGlsdEFuZ2xlLzAuMylcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci5tYXhUaWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgZWxzZSBpZiAobW91c2VMb2NrWSA8IGNhbWVyYUNvbnRyb2xsZXIubWluVGlsdEFuZ2xlLzAuMylcbi8vICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci5taW5UaWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICB9XG5cbi8vICAgICAgICAgICAgaWYgKHN0YWdlLm1vdXNlTG9jaykge1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyptb3VzZUxvY2tYO1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqbW91c2VMb2NrWTtcbi8vICAgICAgICAgICAgfSBlbHNlIGlmIChtb3ZlKSB7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlID0gMC4zKihzdGFnZS5tb3VzZVggLSBsYXN0TW91c2VYKSArIGxhc3RQYW5BbmdsZTtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihzdGFnZS5tb3VzZVkgLSBsYXN0TW91c2VZKSArIGxhc3RUaWx0QW5nbGU7XG4vLyAgICAgICAgICAgIH1cblxuXHRcdGlmICh0aGlzLm1vdmUpIHtcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WCAtIHRoaXMubGFzdE1vdXNlWCkgKyB0aGlzLmxhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFkgLSB0aGlzLmxhc3RNb3VzZVkpICsgdGhpcy5sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB3aGVlbCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlV2hlZWwoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KVxuXHR7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIC09IGV2ZW50LndoZWVsRGVsdGE7XG5cblx0XHRpZiAodGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlIDwgNDAwKVxuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gNDAwO1xuXHRcdGVsc2UgaWYgKHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA+IDEwMDAwKVxuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID0gMTAwMDA7XG5cdH1cblxuXHQvKipcblx0ICogS2V5IGRvd24gbGlzdGVuZXIgZm9yIGZ1bGxzY3JlZW5cblx0ICovXG4vLyAgICAgICAgcHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudCk6dm9pZFxuLy8gICAgICAgIHtcbi8vICAgICAgICAgICAgc3dpdGNoIChldmVudC5rZXlDb2RlKVxuLy8gICAgICAgICAgICB7XG4vLyAgICAgICAgICAgICAgICBjYXNlIEtleWJvYXJkLlNQQUNFOlxuLy8gICAgICAgICAgICAgICAgICAgIGlmIChzdGFnZS5kaXNwbGF5U3RhdGUgPT0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU4pIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuTk9STUFMO1xuLy8gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlLmRpc3BsYXlTdGF0ZSA9IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOO1xuLy9cbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrZWQgPSBmYWxzZTtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWCA9IGNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tZID0gY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUvMC4zO1xuLy8gICAgICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICAgICBicmVhaztcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIH1cbi8vXG5cblx0LyoqXG5cdCAqIHdpbmRvdyBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudDpVSUV2ZW50ID0gbnVsbCk6dm9pZFxuXHR7XG5cdFx0dGhpcy52aWV3LnkgICAgICAgICA9IDA7XG5cdFx0dGhpcy52aWV3LnggICAgICAgICA9IDA7XG5cdFx0dGhpcy52aWV3LndpZHRoICAgICA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMudmlldy5oZWlnaHQgICAgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxuY2xhc3MgRmxhcmVPYmplY3Rcbntcblx0cHJpdmF0ZSBmbGFyZVNpemU6bnVtYmVyID0gMTQuNDtcblxuXHRwdWJsaWMgYmlsbGJvYXJkOkJpbGxib2FyZDtcblxuXHRwdWJsaWMgc2l6ZTpudW1iZXI7XG5cblx0cHVibGljIHBvc2l0aW9uOm51bWJlcjtcblxuXHRwdWJsaWMgb3BhY2l0eTpudW1iZXI7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcihiaXRtYXBEYXRhOkJpdG1hcERhdGEsIHNpemU6bnVtYmVyLCBwb3NpdGlvbjpudW1iZXIsIG9wYWNpdHk6bnVtYmVyLCBzY2VuZTpTY2VuZSlcblx0e1xuXHRcdHZhciBiZDpCaXRtYXBEYXRhID0gbmV3IEJpdG1hcERhdGEoYml0bWFwRGF0YS53aWR0aCwgYml0bWFwRGF0YS5oZWlnaHQsIHRydWUsIDB4RkZGRkZGRkYpO1xuXHRcdGJkLmNvcHlDaGFubmVsKGJpdG1hcERhdGEsIGJpdG1hcERhdGEucmVjdCwgbmV3IFBvaW50KCksIEJpdG1hcERhdGFDaGFubmVsLlJFRCwgQml0bWFwRGF0YUNoYW5uZWwuQUxQSEEpO1xuXG5cdFx0dmFyIGJpbGxib2FyZE1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbChuZXcgQml0bWFwVGV4dHVyZShiZCwgZmFsc2UpKTtcblx0XHRiaWxsYm9hcmRNYXRlcmlhbC5hbHBoYSA9IG9wYWNpdHkvMTAwO1xuXHRcdGJpbGxib2FyZE1hdGVyaWFsLmFscGhhQmxlbmRpbmcgPSB0cnVlO1xuXHRcdC8vYmlsbGJvYXJkTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkxBWUVSO1xuXG5cdFx0dGhpcy5iaWxsYm9hcmQgPSBuZXcgQmlsbGJvYXJkKGJpbGxib2FyZE1hdGVyaWFsKTtcblx0XHR0aGlzLmJpbGxib2FyZC53aWR0aCA9IHNpemUqdGhpcy5mbGFyZVNpemU7XG5cdFx0dGhpcy5iaWxsYm9hcmQuaGVpZ2h0ID0gc2l6ZSp0aGlzLmZsYXJlU2l6ZTtcblx0XHR0aGlzLmJpbGxib2FyZC5waXZvdCA9IG5ldyBWZWN0b3IzRChzaXplKnRoaXMuZmxhcmVTaXplLzIsIHNpemUqdGhpcy5mbGFyZVNpemUvMiwgMCk7XG5cdFx0dGhpcy5iaWxsYm9hcmQub3JpZW50YXRpb25Nb2RlID0gT3JpZW50YXRpb25Nb2RlLkNBTUVSQV9QTEFORTtcblx0XHR0aGlzLmJpbGxib2FyZC5hbGlnbm1lbnRNb2RlID0gQWxpZ25tZW50TW9kZS5QSVZPVF9QT0lOVDtcblx0XHR0aGlzLmJpbGxib2FyZC52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5zaXplID0gc2l6ZTtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblxuXHRcdHNjZW5lLmFkZENoaWxkKHRoaXMuYmlsbGJvYXJkKVxuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuXHRuZXcgSW50ZXJtZWRpYXRlX0dsb2JlKCk7XG59Il19