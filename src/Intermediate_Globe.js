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
var BlendMode = require("awayjs-display/lib/base/BlendMode");
var OrientationMode = require("awayjs-display/lib/base/OrientationMode");
var AlignmentMode = require("awayjs-display/lib/base/AlignmentMode");
var Camera = require("awayjs-display/lib/entities/Camera");
var Billboard = require("awayjs-display/lib/entities/Billboard");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitiveSpherePrefab = require("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");
var Cast = require("awayjs-display/lib/utils/Cast");
var DefaultRenderer = require("awayjs-stagegl/lib/render/DefaultRenderer");
var SkyboxMaterial = require("awayjs-stagegl/lib/materials/SkyboxMaterial");
var TriangleMethodMaterial = require("awayjs-stagegl/lib/materials/TriangleMethodMaterial");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfR2xvYmUudHMiXSwibmFtZXMiOlsiSW50ZXJtZWRpYXRlX0dsb2JlIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXQiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdEVuZ2luZSIsIkludGVybWVkaWF0ZV9HbG9iZS5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXRNYXRlcmlhbHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUubW9kdWxhdGVEaWZmdXNlTWV0aG9kIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm1vZHVsYXRlU3BlY3VsYXJNZXRob2QiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdE9iamVjdHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9HbG9iZS5vbkVudGVyRnJhbWUiLCJJbnRlcm1lZGlhdGVfR2xvYmUudXBkYXRlRmxhcmVzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlRG93biIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlVXAiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZVdoZWVsIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzaXplIiwiRmxhcmVPYmplY3QiLCJGbGFyZU9iamVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW9DRTtBQUVGLElBQU8sVUFBVSxXQUFlLGlDQUFpQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxpQkFBaUIsV0FBYSx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU8sV0FBVyxXQUFlLG9DQUFvQyxDQUFDLENBQUM7QUFDdkUsSUFBTyxjQUFjLFdBQWMs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QVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDRDQUE0Q0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaEZBLEFBQ0FBLGdCQURnQkE7UUFDaEJBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0Es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QSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDcEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoR0EsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsNkJBQTZCQTtnQkFDakNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM3RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlGQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFrQkEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7Z0JBQzVEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDN0ZBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1FBQ1JBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURaOztPQUVHQTtJQUNLQSx3Q0FBV0EsR0FBbkJBLFVBQW9CQSxLQUFnQkE7UUFFbkNhLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlB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UUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBO1FBRXZCQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFBQTtJQUMvQkEsQ0FBQ0E7SUFDRkQsa0JBQUNBO0FBQURBLENBdENBLEFBc0NDQSxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUVmLElBQUksa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixDQUFDLENBQUEiLCJmaWxlIjoiSW50ZXJtZWRpYXRlX0dsb2JlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuR2xvYmUgZXhhbXBsZSBpbiBBd2F5M2RcblxuRGVtb25zdHJhdGVzOlxuXG5Ib3cgdG8gY3JlYXRlIGEgdGV4dHVyZWQgc3BoZXJlLlxuSG93IHRvIHVzZSBjb250YWluZXJzIHRvIHJvdGF0ZSBhbiBvYmplY3QuXG5Ib3cgdG8gdXNlIHRoZSBQaG9uZ0JpdG1hcE1hdGVyaWFsLlxuXG5Db2RlIGJ5IFJvYiBCYXRlbWFuXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuXG5UaGlzIGNvZGUgaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgVGhlIEF3YXkgRm91bmRhdGlvbiBodHRwOi8vd3d3LnRoZWF3YXlmb3VuZGF0aW9uLm9yZ1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDigJxTb2Z0d2FyZeKAnSksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQg4oCcQVMgSVPigJ0sIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG5pbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IEJpdG1hcERhdGFDaGFubmVsXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YUNoYW5uZWxcIik7XG5pbXBvcnQgTG9hZGVyRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBDb2xvclRyYW5zZm9ybVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vQ29sb3JUcmFuc2Zvcm1cIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBQb2ludFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1BvaW50XCIpO1xuaW1wb3J0IEFzc2V0TGlicmFyeVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJDb250ZXh0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMb2FkZXJDb250ZXh0XCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IEltYWdlQ3ViZVRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZUN1YmVUZXh0dXJlXCIpO1xuaW1wb3J0IEltYWdlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IEJpdG1hcFRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9CaXRtYXBUZXh0dXJlXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgRGlzcGxheU9iamVjdENvbnRhaW5lclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9EaXNwbGF5T2JqZWN0Q29udGFpbmVyXCIpO1xuaW1wb3J0IFNjZW5lXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvU2NlbmVcIik7XG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgSG92ZXJDb250cm9sbGVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udHJvbGxlcnMvSG92ZXJDb250cm9sbGVyXCIpO1xuaW1wb3J0IEJsZW5kTW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgT3JpZW50YXRpb25Nb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9PcmllbnRhdGlvbk1vZGVcIik7XG5pbXBvcnQgQWxpZ25tZW50TW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQWxpZ25tZW50TW9kZVwiKTtcbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FtZXJhXCIpO1xuaW1wb3J0IEJpbGxib2FyZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQmlsbGJvYXJkXCIpO1xuaW1wb3J0IE1lc2hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IFBvaW50TGlnaHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZVByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVTcGhlcmVQcmVmYWJcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3V0aWxzL0Nhc3RcIik7XG5cbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9yZW5kZXIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuaW1wb3J0IFNreWJveE1hdGVyaWFsXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL1NreWJveE1hdGVyaWFsXCIpO1xuaW1wb3J0IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWxcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9UcmlhbmdsZU1ldGhvZE1hdGVyaWFsXCIpO1xuXG5pbXBvcnQgRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhckNvbXBvc2l0ZU1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJDb21wb3NpdGVNZXRob2RcIik7XG5pbXBvcnQgRGlmZnVzZUJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL0RpZmZ1c2VCYXNpY01ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhckJhc2ljTWV0aG9kXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL1NwZWN1bGFyQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgTWV0aG9kVk9cdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL01ldGhvZFZPXCIpO1xuaW1wb3J0IFNwZWN1bGFyRnJlc25lbE1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJGcmVzbmVsTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyUGhvbmdNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJQaG9uZ01ldGhvZFwiKTtcbmltcG9ydCBTaGFkZXJPYmplY3RCYXNlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlck9iamVjdEJhc2VcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJFbGVtZW50XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyQ2FjaGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtc3RhZ2VnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyQ2FjaGVcIik7XG5pbXBvcnQgU2hhZGVyUmVnaXN0ZXJEYXRhXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckRhdGFcIik7XG5cbmNsYXNzIEludGVybWVkaWF0ZV9HbG9iZVxue1xuXHQvL2VuZ2luZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBzY2VuZTpTY2VuZTtcblx0cHJpdmF0ZSBjYW1lcmE6Q2FtZXJhO1xuXHRwcml2YXRlIHZpZXc6Vmlldztcblx0cHJpdmF0ZSBjYW1lcmFDb250cm9sbGVyOkhvdmVyQ29udHJvbGxlcjtcblxuXHQvL21hdGVyaWFsIG9iamVjdHNcblx0cHJpdmF0ZSBzdW5NYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGdyb3VuZE1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgY2xvdWRNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGF0bW9zcGhlcmVNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGF0bW9zcGhlcmVEaWZmdXNlTWV0aG9kOkRpZmZ1c2VCYXNpY01ldGhvZDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlU3BlY3VsYXJNZXRob2Q6U3BlY3VsYXJCYXNpY01ldGhvZDtcblx0cHJpdmF0ZSBjdWJlVGV4dHVyZTpJbWFnZUN1YmVUZXh0dXJlO1xuXG5cdC8vc2NlbmUgb2JqZWN0c1xuXHRwcml2YXRlIHN1bjpCaWxsYm9hcmQ7XG5cdHByaXZhdGUgZWFydGg6TWVzaDtcblx0cHJpdmF0ZSBjbG91ZHM6TWVzaDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlOk1lc2g7XG5cdHByaXZhdGUgdGlsdENvbnRhaW5lcjpEaXNwbGF5T2JqZWN0Q29udGFpbmVyO1xuXHRwcml2YXRlIG9yYml0Q29udGFpbmVyOkRpc3BsYXlPYmplY3RDb250YWluZXI7XG5cdHByaXZhdGUgc2t5Qm94OlNreWJveDtcblxuXHQvL2xpZ2h0IG9iamVjdHNcblx0cHJpdmF0ZSBsaWdodDpQb2ludExpZ2h0O1xuXHRwcml2YXRlIGxpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXHRwcml2YXRlIGZsYXJlczpGbGFyZU9iamVjdFtdID0gbmV3IEFycmF5PEZsYXJlT2JqZWN0PigxMik7XG5cblx0Ly9uYXZpZ2F0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3ZlOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBsYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RUaWx0QW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RNb3VzZVg6bnVtYmVyO1xuXHRwcml2YXRlIGxhc3RNb3VzZVk6bnVtYmVyO1xuXHRwcml2YXRlIG1vdXNlTG9ja1g6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBtb3VzZUxvY2tZOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW91c2VMb2NrZWQ6Ym9vbGVhbjtcblx0cHJpdmF0ZSBmbGFyZVZpc2libGU6Ym9vbGVhbjtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHR0aGlzLmluaXRMaWdodHMoKTtcblx0XHQvL2luaXRMZW5zRmxhcmUoKTtcblx0XHR0aGlzLmluaXRNYXRlcmlhbHMoKTtcblx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKTp2b2lkXG5cdHtcblx0XHR0aGlzLnNjZW5lID0gbmV3IFNjZW5lKCk7XG5cblx0XHQvL3NldHVwIGNhbWVyYSBmb3Igb3B0aW1hbCBza3lib3ggcmVuZGVyaW5nXG5cdFx0dGhpcy5jYW1lcmEgPSBuZXcgQ2FtZXJhKCk7XG5cdFx0dGhpcy5jYW1lcmEucHJvamVjdGlvbi5mYXIgPSAxMDAwMDA7XG5cblx0XHR0aGlzLnZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKCkpO1xuXHRcdHRoaXMudmlldy5zY2VuZSA9IHRoaXMuc2NlbmU7XG5cdFx0dGhpcy52aWV3LmNhbWVyYSA9IHRoaXMuY2FtZXJhO1xuXG5cdFx0Ly9zZXR1cCBjb250cm9sbGVyIHRvIGJlIHVzZWQgb24gdGhlIGNhbWVyYVxuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlciA9IG5ldyBIb3ZlckNvbnRyb2xsZXIodGhpcy5jYW1lcmEsIG51bGwsIDAsIDAsIDYwMCwgLTkwLCA5MCk7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmF1dG9VcGRhdGUgPSBmYWxzZTtcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIueUZhY3RvciA9IDE7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlnaHRzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKTp2b2lkXG5cdHtcblx0XHR0aGlzLmxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHR0aGlzLmxpZ2h0LnggPSAxMDAwMDtcblx0XHR0aGlzLmxpZ2h0LmFtYmllbnQgPSAxO1xuXHRcdHRoaXMubGlnaHQuZGlmZnVzZSA9IDI7XG5cblx0XHR0aGlzLmxpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKFt0aGlzLmxpZ2h0XSk7XG5cdH1cbi8qXG5cdHByaXZhdGUgaW5pdExlbnNGbGFyZSgpOnZvaWRcblx0e1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUxMCgpLCAgMy4yLCAtMC4wMSwgMTQ3LjkpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMTEoKSwgIDYsICAgIDAsICAgICAzMC42KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICAyLCAgICAwLCAgICAgMjUuNSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgNCwgICAgMCwgICAgIDE3Ljg1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTEyKCksICAwLjQsICAwLjMyLCAgMjIuOTUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNigpLCAgIDEsICAgIDAuNjgsICAyMC40KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTIoKSwgICAxLjI1LCAxLjEsICAgNDguNDUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMygpLCAgIDEuNzUsIDEuMzcsICAgNy42NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU0KCksICAgMi43NSwgMS44NSwgIDEyLjc1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTgoKSwgICAwLjUsICAyLjIxLCAgMzMuMTUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNigpLCAgIDQsICAgIDIuNSwgICAxMC40KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTcoKSwgICAxMCwgICAyLjY2LCAgNTApKTtcblx0fVxuKi9cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIG1hdGVyaWFsc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TWF0ZXJpYWxzKCk6dm9pZFxuXHR7XG5cdFx0Ly90aGlzLmN1YmVUZXh0dXJlID0gbmV3IEJpdG1hcEN1YmVUZXh0dXJlKENhc3QuYml0bWFwRGF0YShQb3NYKSwgQ2FzdC5iaXRtYXBEYXRhKE5lZ1gpLCBDYXN0LmJpdG1hcERhdGEoUG9zWSksIENhc3QuYml0bWFwRGF0YShOZWdZKSwgQ2FzdC5iaXRtYXBEYXRhKFBvc1opLCBDYXN0LmJpdG1hcERhdGEoTmVnWikpO1xuXG5cdFx0Ly9hZGp1c3Qgc3BlY3VsYXIgbWFwXG5cdFx0Ly92YXIgc3BlY0JpdG1hcDpCaXRtYXBEYXRhID0gQ2FzdC5iaXRtYXBEYXRhKEVhcnRoU3BlY3VsYXIpO1xuXHRcdC8vc3BlY0JpdG1hcC5jb2xvclRyYW5zZm9ybShzcGVjQml0bWFwLnJlY3QsIG5ldyBDb2xvclRyYW5zZm9ybSgxLCAxLCAxLCAxLCA2NCwgNjQsIDY0KSk7XG5cblx0XHR2YXIgc3BlY3VsYXI6U3BlY3VsYXJGcmVzbmVsTWV0aG9kID0gbmV3IFNwZWN1bGFyRnJlc25lbE1ldGhvZCh0cnVlLCBuZXcgU3BlY3VsYXJQaG9uZ01ldGhvZCgpKTtcblx0XHRzcGVjdWxhci5mcmVzbmVsUG93ZXIgPSAxO1xuXHRcdHNwZWN1bGFyLm5vcm1hbFJlZmxlY3RhbmNlID0gMC4xO1xuXG5cdFx0dGhpcy5zdW5NYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5zdW5NYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuQUREO1xuXG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhck1ldGhvZCA9IHNwZWN1bGFyO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuZ2xvc3MgPSA1O1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc3BlY3VsYXIgPSAxO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuYW1iaWVudCA9IDE7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5kaWZmdXNlTWV0aG9kLm11bHRpcGx5ID0gZmFsc2U7XG5cblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbWJpZW50Q29sb3IgPSAweDFiMjA0ODtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuc3BlY3VsYXIgPSAwO1xuXHRcdHRoaXMuY2xvdWRNYXRlcmlhbC5hbWJpZW50ID0gMTtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZURpZmZ1c2VNZXRob2QgPSBuZXcgRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZCh0aGlzLm1vZHVsYXRlRGlmZnVzZU1ldGhvZCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlU3BlY3VsYXJNZXRob2QgPSBuZXcgU3BlY3VsYXJDb21wb3NpdGVNZXRob2QodGhpcy5tb2R1bGF0ZVNwZWN1bGFyTWV0aG9kLCBuZXcgU3BlY3VsYXJQaG9uZ01ldGhvZCgpKTtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5kaWZmdXNlTWV0aG9kID0gdGhpcy5hdG1vc3BoZXJlRGlmZnVzZU1ldGhvZDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5zcGVjdWxhck1ldGhvZCA9IHRoaXMuYXRtb3NwaGVyZVNwZWN1bGFyTWV0aG9kO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5BREQ7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLnNwZWN1bGFyID0gMC41O1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmdsb3NzID0gNTtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5hbWJpZW50Q29sb3IgPSAwO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmRpZmZ1c2VDb2xvciA9IDB4MTY3MWNjO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmFtYmllbnQgPSAxO1xuXHR9XG5cblx0cHJpdmF0ZSBtb2R1bGF0ZURpZmZ1c2VNZXRob2Qoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCB0YXJnZXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCByZWdDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHZhciB2aWV3RGlyRnJhZ21lbnRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gc2hhcmVkUmVnaXN0ZXJzLnZpZXdEaXJGcmFnbWVudDtcblx0XHR2YXIgbm9ybWFsRnJhZ21lbnRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gc2hhcmVkUmVnaXN0ZXJzLm5vcm1hbEZyYWdtZW50O1xuXG5cdFx0dmFyIGNvZGU6c3RyaW5nID0gXCJkcDMgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHZpZXdEaXJGcmFnbWVudFJlZyArIFwiLnh5eiwgXCIgKyBub3JtYWxGcmFnbWVudFJlZyArIFwiLnh5elxcblwiICtcblx0XHRcdFwibXVsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRhcmdldFJlZyArIFwiLndcXG5cIjtcblxuXHRcdHJldHVybiBjb2RlO1xuXHR9XG5cblx0cHJpdmF0ZSBtb2R1bGF0ZVNwZWN1bGFyTWV0aG9kKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgdGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgcmVnQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgdmlld0RpckZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy52aWV3RGlyRnJhZ21lbnQ7XG5cdFx0dmFyIG5vcm1hbEZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy5ub3JtYWxGcmFnbWVudDtcblx0XHR2YXIgdGVtcDpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSByZWdDYWNoZS5nZXRGcmVlRnJhZ21lbnRTaW5nbGVUZW1wKCk7XG5cdFx0cmVnQ2FjaGUuYWRkRnJhZ21lbnRUZW1wVXNhZ2VzKHRlbXAsIDEpO1xuXG5cdFx0dmFyIGNvZGU6c3RyaW5nID0gXCJkcDMgXCIgKyB0ZW1wICsgXCIsIFwiICsgdmlld0RpckZyYWdtZW50UmVnICsgXCIueHl6LCBcIiArIG5vcm1hbEZyYWdtZW50UmVnICsgXCIueHl6XFxuXCIgK1xuXHRcdFx0XCJuZWcgXCIgKyB0ZW1wICsgXCIsIFwiICsgdGVtcCArIFwiXFxuXCIgK1xuXHRcdFx0XCJtdWwgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGVtcCArIFwiXFxuXCI7XG5cblx0XHRyZWdDYWNoZS5yZW1vdmVGcmFnbWVudFRlbXBVc2FnZSh0ZW1wKTtcblxuXHRcdHJldHVybiBjb2RlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIHNjZW5lIG9iamVjdHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE9iamVjdHMoKTp2b2lkXG5cdHtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyID0gbmV3IERpc3BsYXlPYmplY3RDb250YWluZXIoKTtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMubGlnaHQpO1xuXHRcdHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5vcmJpdENvbnRhaW5lcik7XG5cblx0XHR0aGlzLnN1biA9IG5ldyBCaWxsYm9hcmQodGhpcy5zdW5NYXRlcmlhbCk7XG5cdFx0dGhpcy5zdW4ud2lkdGggPSAzMDAwO1xuXHRcdHRoaXMuc3VuLmhlaWdodCA9IDMwMDA7XG5cdFx0dGhpcy5zdW4ucGl2b3QgPSBuZXcgVmVjdG9yM0QoMTUwMCwxNTAwLDApO1xuXHRcdHRoaXMuc3VuLm9yaWVudGF0aW9uTW9kZSA9IE9yaWVudGF0aW9uTW9kZS5DQU1FUkFfUExBTkU7XG5cdFx0dGhpcy5zdW4uYWxpZ25tZW50TW9kZSA9IEFsaWdubWVudE1vZGUuUElWT1RfUE9JTlQ7XG5cdFx0dGhpcy5zdW4ueCA9IDEwMDAwO1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5zdW4pO1xuXG5cdFx0dGhpcy5lYXJ0aCA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDIwMCwgMjAwLCAxMDApLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuZWFydGgubWF0ZXJpYWwgPSB0aGlzLmdyb3VuZE1hdGVyaWFsO1xuXG5cdFx0dGhpcy5jbG91ZHMgPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMDIsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmNsb3Vkcy5tYXRlcmlhbCA9IHRoaXMuY2xvdWRNYXRlcmlhbDtcblxuXHRcdHRoaXMuYXRtb3NwaGVyZSA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDIxMCwgMjAwLCAxMDApLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuYXRtb3NwaGVyZS5tYXRlcmlhbCA9IHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsO1xuXHRcdHRoaXMuYXRtb3NwaGVyZS5zY2FsZVggPSAtMTtcblxuXHRcdHRoaXMudGlsdENvbnRhaW5lciA9IG5ldyBEaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLnJvdGF0aW9uWCA9IC0yMztcblx0XHR0aGlzLnRpbHRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5lYXJ0aCk7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuY2xvdWRzKTtcblx0XHR0aGlzLnRpbHRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5hdG1vc3BoZXJlKTtcblxuXHRcdHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy50aWx0Q29udGFpbmVyKTtcblxuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5sb29rQXRPYmplY3QgPSB0aGlzLnRpbHRDb250YWluZXI7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlzdGVuZXJzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaXN0ZW5lcnMoKTp2b2lkXG5cdHtcblx0XHR3aW5kb3cub25yZXNpemUgID0gKGV2ZW50OlVJRXZlbnQpID0+IHRoaXMub25SZXNpemUoZXZlbnQpO1xuXG5cdFx0ZG9jdW1lbnQub25tb3VzZWRvd24gPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlRG93bihldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXVwID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZVVwKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNlbW92ZSA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNld2hlZWw9IChldmVudDpNb3VzZVdoZWVsRXZlbnQpID0+IHRoaXMub25Nb3VzZVdoZWVsKGV2ZW50KTtcblxuXG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXG5cdFx0dGhpcy5fdGltZXIgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25FbnRlckZyYW1lLCB0aGlzKTtcblx0XHR0aGlzLl90aW1lci5zdGFydCgpO1xuXG5cdFx0QXNzZXRMaWJyYXJ5LmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vblJlc291cmNlQ29tcGxldGUoZXZlbnQpKTtcblxuXHRcdC8vc2V0dXAgdGhlIHVybCBtYXAgZm9yIHRleHR1cmVzIGluIHRoZSBjdWJlbWFwIGZpbGVcblx0XHR2YXIgYXNzZXRMb2FkZXJDb250ZXh0OkFzc2V0TG9hZGVyQ29udGV4dCA9IG5ldyBBc3NldExvYWRlckNvbnRleHQoKTtcblx0XHRhc3NldExvYWRlckNvbnRleHQuZGVwZW5kZW5jeUJhc2VVcmwgPSBcImFzc2V0cy9za3lib3gvXCI7XG5cblx0XHQvL2Vudmlyb25tZW50IHRleHR1cmVcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9za3lib3gvc3BhY2VfdGV4dHVyZS5jdWJlXCIpLCBhc3NldExvYWRlckNvbnRleHQpO1xuXG5cdFx0Ly9nbG9iZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2Nsb3VkX2NvbWJpbmVkXzIwNDguanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9lYXJ0aF9zcGVjdWxhcl8yMDQ4LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvRWFydGhOb3JtYWwucG5nXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9sYW5kX2xpZ2h0c18xNjM4NC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2xhbmRfb2NlYW5faWNlXzIwNDhfbWF0Y2guanBnXCIpKTtcblxuXHRcdC8vZmxhcmUgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUyLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMy5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTQuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU2LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNy5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTguanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTExLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTIuanBnXCIpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0aW9uIGFuZCByZW5kZXIgbG9vcFxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZHQ6bnVtYmVyKTp2b2lkXG5cdHtcblx0XHR0aGlzLl90aW1lICs9IGR0O1xuXG5cdFx0dGhpcy5lYXJ0aC5yb3RhdGlvblkgKz0gMC4yO1xuXHRcdHRoaXMuY2xvdWRzLnJvdGF0aW9uWSArPSAwLjIxO1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIucm90YXRpb25ZICs9IDAuMDI7XG5cblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIudXBkYXRlKCk7XG5cblx0XHR0aGlzLnVwZGF0ZUZsYXJlcygpO1xuXG5cdFx0dGhpcy52aWV3LnJlbmRlcigpO1xuXHR9XG5cblx0cHJpdmF0ZSB1cGRhdGVGbGFyZXMoKTp2b2lkXG5cdHtcblx0XHR2YXIgZmxhcmVWaXNpYmxlT2xkOmJvb2xlYW4gPSB0aGlzLmZsYXJlVmlzaWJsZTtcblxuXHRcdHZhciBzdW5TY3JlZW5Qb3NpdGlvbjpWZWN0b3IzRCA9IHRoaXMudmlldy5wcm9qZWN0KHRoaXMuc3VuLnNjZW5lUG9zaXRpb24pO1xuXHRcdHZhciB4T2Zmc2V0Om51bWJlciA9IHN1blNjcmVlblBvc2l0aW9uLnggLSB3aW5kb3cuaW5uZXJXaWR0aC8yO1xuXHRcdHZhciB5T2Zmc2V0Om51bWJlciA9IHN1blNjcmVlblBvc2l0aW9uLnkgLSB3aW5kb3cuaW5uZXJIZWlnaHQvMjtcblxuXHRcdHZhciBlYXJ0aFNjcmVlblBvc2l0aW9uOlZlY3RvcjNEID0gdGhpcy52aWV3LnByb2plY3QodGhpcy5lYXJ0aC5zY2VuZVBvc2l0aW9uKTtcblx0XHR2YXIgZWFydGhSYWRpdXM6bnVtYmVyID0gMTkwICogd2luZG93LmlubmVySGVpZ2h0L2VhcnRoU2NyZWVuUG9zaXRpb24uejtcblx0XHR2YXIgZmxhcmVPYmplY3Q6RmxhcmVPYmplY3Q7XG5cblx0XHR0aGlzLmZsYXJlVmlzaWJsZSA9IChzdW5TY3JlZW5Qb3NpdGlvbi54ID4gMCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi54IDwgd2luZG93LmlubmVyV2lkdGggJiYgc3VuU2NyZWVuUG9zaXRpb24ueSA+IDAgJiYgc3VuU2NyZWVuUG9zaXRpb24ueSAgPCB3aW5kb3cuaW5uZXJIZWlnaHQgJiYgc3VuU2NyZWVuUG9zaXRpb24ueiA+IDAgJiYgTWF0aC5zcXJ0KHhPZmZzZXQqeE9mZnNldCArIHlPZmZzZXQqeU9mZnNldCkgPiBlYXJ0aFJhZGl1cyk7XG5cblx0XHQvL3VwZGF0ZSBmbGFyZSB2aXNpYmlsaXR5XG5cdFx0aWYgKHRoaXMuZmxhcmVWaXNpYmxlICE9IGZsYXJlVmlzaWJsZU9sZCkge1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgdGhpcy5mbGFyZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZmxhcmVPYmplY3QgPSB0aGlzLmZsYXJlc1tpXTtcblx0XHRcdFx0aWYgKGZsYXJlT2JqZWN0KVxuXHRcdFx0XHRcdGZsYXJlT2JqZWN0LmJpbGxib2FyZC52aXNpYmxlID0gdGhpcy5mbGFyZVZpc2libGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly91cGRhdGUgZmxhcmUgcG9zaXRpb25cblx0XHRpZiAodGhpcy5mbGFyZVZpc2libGUpIHtcblx0XHRcdHZhciBmbGFyZURpcmVjdGlvbjpQb2ludCA9IG5ldyBQb2ludCh4T2Zmc2V0LCB5T2Zmc2V0KTtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IHRoaXMuZmxhcmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGZsYXJlT2JqZWN0ID0gdGhpcy5mbGFyZXNbaV07XG5cdFx0XHRcdGlmIChmbGFyZU9iamVjdClcblx0XHRcdFx0XHRmbGFyZU9iamVjdC5iaWxsYm9hcmQudHJhbnNmb3JtLnBvc2l0aW9uID0gdGhpcy52aWV3LnVucHJvamVjdChzdW5TY3JlZW5Qb3NpdGlvbi54IC0gZmxhcmVEaXJlY3Rpb24ueCpmbGFyZU9iamVjdC5wb3NpdGlvbiwgc3VuU2NyZWVuUG9zaXRpb24ueSAtIGZsYXJlRGlyZWN0aW9uLnkqZmxhcmVPYmplY3QucG9zaXRpb24sIDEwMCAtIGkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBMaXN0ZW5lciBmdW5jdGlvbiBmb3IgcmVzb3VyY2UgY29tcGxldGUgZXZlbnQgb24gYXNzZXQgbGlicmFyeVxuXHQgKi9cblx0cHJpdmF0ZSBvblJlc291cmNlQ29tcGxldGUoZXZlbnQ6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2goZXZlbnQudXJsKSB7XG5cdFx0XHQvL2Vudmlyb25tZW50IHRleHR1cmVcblx0XHRcdGNhc2UgJ2Fzc2V0cy9za3lib3gvc3BhY2VfdGV4dHVyZS5jdWJlJzpcblx0XHRcdFx0dGhpcy5jdWJlVGV4dHVyZSA9IDxJbWFnZUN1YmVUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblxuXHRcdFx0XHR0aGlzLnNreUJveCA9IG5ldyBTa3lib3gobmV3IFNreWJveE1hdGVyaWFsKHRoaXMuY3ViZVRleHR1cmUpKTtcblx0XHRcdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnNreUJveCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvL2dsb2JlIHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2Nsb3VkX2NvbWJpbmVkXzIwNDguanBnXCIgOlxuXHRcdFx0XHR2YXIgY2xvdWRCaXRtYXBEYXRhOkJpdG1hcERhdGEgPSBuZXcgQml0bWFwRGF0YSgyMDQ4LCAxMDI0LCB0cnVlLCAweEZGRkZGRkZGKTtcblx0XHRcdFx0Y2xvdWRCaXRtYXBEYXRhLmNvcHlDaGFubmVsKENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIGNsb3VkQml0bWFwRGF0YS5yZWN0LCBuZXcgUG9pbnQoKSwgQml0bWFwRGF0YUNoYW5uZWwuUkVELCBCaXRtYXBEYXRhQ2hhbm5lbC5BTFBIQSk7XG5cblx0XHRcdFx0dGhpcy5jbG91ZE1hdGVyaWFsLnRleHR1cmUgPSBuZXcgQml0bWFwVGV4dHVyZShjbG91ZEJpdG1hcERhdGEsIGZhbHNlKTsgLy9UT0RPOiBmaXggbWlwbWFwcyBmb3IgYml0bWFwZGF0YSB0ZXh0dXJlc1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvZWFydGhfc3BlY3VsYXJfMjA0OC5qcGdcIiA6XG5cdFx0XHRcdHZhciBzcGVjQml0bWFwRGF0YTpCaXRtYXBEYXRhID0gQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKTtcblx0XHRcdFx0c3BlY0JpdG1hcERhdGEuY29sb3JUcmFuc2Zvcm0oc3BlY0JpdG1hcERhdGEucmVjdCwgbmV3IENvbG9yVHJhbnNmb3JtKDEsIDEsIDEsIDEsIDY0LCA2NCwgNjQpKTtcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhck1hcCA9IG5ldyBCaXRtYXBUZXh0dXJlKHNwZWNCaXRtYXBEYXRhLCBmYWxzZSk7IC8vVE9ETzogZml4IG1pcG1hcHMgZm9yIGJpdG1hcGRhdGEgdGV4dHVyZXNcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL0VhcnRoTm9ybWFsLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5ub3JtYWxNYXAgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2xhbmRfbGlnaHRzXzE2Mzg0LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9sYW5kX29jZWFuX2ljZV8yMDQ4X21hdGNoLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5kaWZmdXNlVGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9mbGFyZSB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUyLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbNl0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMS4yNSwgMS4xLCA0OC40NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUzLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbN10gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMS43NSwgMS4zNywgNy42NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU0LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbOF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMi43NSwgMS44NSwgMTIuNzUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzVdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDEsIDAuNjgsIDIwLjQsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1sxMF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgNCwgMi41LCAxMC40LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTcuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1syXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAyLCAwLCAyNS41LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbM10gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgNCwgMCwgMTcuODUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1sxMV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMTAsIDIuNjYsIDUwLCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTguanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s5XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAwLjUsIDIuMjEsIDMzLjE1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEwLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5zdW5NYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzBdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDMuMiwgLTAuMDEsIDEwMCwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMS5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzFdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDYsIDAsIDMwLjYsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTIuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s0XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAwLjQsIDAuMzIsIDIyLjk1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5sYXN0UGFuQW5nbGUgPSB0aGlzLmNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGU7XG5cdFx0dGhpcy5sYXN0VGlsdEFuZ2xlID0gdGhpcy5jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZTtcblx0XHR0aGlzLmxhc3RNb3VzZVggPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMubGFzdE1vdXNlWSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0dGhpcy5tb3ZlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB1cCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgbW92ZSBsaXN0ZW5lciBmb3IgbW91c2VMb2NrXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuLy8gICAgICAgICAgICBpZiAoc3RhZ2UuZGlzcGxheVN0YXRlID09IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOKSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9ja2VkICYmIChsYXN0TW91c2VYICE9IDAgfHwgbGFzdE1vdXNlWSAhPSAwKSkge1xuLy8gICAgICAgICAgICAgICAgICAgIGUubW92ZW1lbnRYICs9IGxhc3RNb3VzZVg7XG4vLyAgICAgICAgICAgICAgICAgICAgZS5tb3ZlbWVudFkgKz0gbGFzdE1vdXNlWTtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VYID0gMDtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VZID0gMDtcbi8vICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICBtb3VzZUxvY2tYICs9IGUubW92ZW1lbnRYO1xuLy8gICAgICAgICAgICAgICAgbW91c2VMb2NrWSArPSBlLm1vdmVtZW50WTtcbi8vXG4vLyAgICAgICAgICAgICAgICBpZiAoIXN0YWdlLm1vdXNlTG9jaykge1xuLy8gICAgICAgICAgICAgICAgICAgIHN0YWdlLm1vdXNlTG9jayA9IHRydWU7XG4vLyAgICAgICAgICAgICAgICAgICAgbGFzdE1vdXNlWCA9IHN0YWdlLm1vdXNlWCAtIHN0YWdlLnN0YWdlV2lkdGgvMjtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VZID0gc3RhZ2UubW91c2VZIC0gc3RhZ2Uuc3RhZ2VIZWlnaHQvMjtcbi8vICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIW1vdXNlTG9ja2VkKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrZWQgPSB0cnVlO1xuLy8gICAgICAgICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgICAgICAgIC8vZW5zdXJlIGJvdW5kcyBmb3IgdGlsdEFuZ2xlIGFyZSBub3QgZWNlZWRlZFxuLy8gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9ja1kgPiBjYW1lcmFDb250cm9sbGVyLm1heFRpbHRBbmdsZS8wLjMpXG4vLyAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWSA9IGNhbWVyYUNvbnRyb2xsZXIubWF4VGlsdEFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1vdXNlTG9ja1kgPCBjYW1lcmFDb250cm9sbGVyLm1pblRpbHRBbmdsZS8wLjMpXG4vLyAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWSA9IGNhbWVyYUNvbnRyb2xsZXIubWluVGlsdEFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgfVxuXG4vLyAgICAgICAgICAgIGlmIChzdGFnZS5tb3VzZUxvY2spIHtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqbW91c2VMb2NrWDtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKm1vdXNlTG9ja1k7XG4vLyAgICAgICAgICAgIH0gZWxzZSBpZiAobW92ZSkge1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooc3RhZ2UubW91c2VYIC0gbGFzdE1vdXNlWCkgKyBsYXN0UGFuQW5nbGU7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZSA9IDAuMyooc3RhZ2UubW91c2VZIC0gbGFzdE1vdXNlWSkgKyBsYXN0VGlsdEFuZ2xlO1xuLy8gICAgICAgICAgICB9XG5cblx0XHRpZiAodGhpcy5tb3ZlKSB7XG5cdFx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLmxhc3RNb3VzZVgpICsgdGhpcy5sYXN0UGFuQW5nbGU7XG5cdFx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5sYXN0TW91c2VZKSArIHRoaXMubGFzdFRpbHRBbmdsZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2Ugd2hlZWwgbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZVdoZWVsKGV2ZW50Ok1vdXNlV2hlZWxFdmVudClcblx0e1xuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSAtPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0aWYgKHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA8IDQwMClcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA9IDQwMDtcblx0XHRlbHNlIGlmICh0aGlzLmNhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPiAxMDAwMClcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA9IDEwMDAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBmdWxsc2NyZWVuXG5cdCAqL1xuLy8gICAgICAgIHByaXZhdGUgb25LZXlEb3duKGV2ZW50OktleWJvYXJkRXZlbnQpOnZvaWRcbi8vICAgICAgICB7XG4vLyAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSlcbi8vICAgICAgICAgICAge1xuLy8gICAgICAgICAgICAgICAgY2FzZSBLZXlib2FyZC5TUEFDRTpcbi8vICAgICAgICAgICAgICAgICAgICBpZiAoc3RhZ2UuZGlzcGxheVN0YXRlID09IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlLmRpc3BsYXlTdGF0ZSA9IFN0YWdlRGlzcGxheVN0YXRlLk5PUk1BTDtcbi8vICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBzdGFnZS5kaXNwbGF5U3RhdGUgPSBTdGFnZURpc3BsYXlTdGF0ZS5GVUxMX1NDUkVFTjtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja2VkID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja1ggPSBjYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWSA9IGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICB9XG4vL1xuXG5cdC8qKlxuXHQgKiB3aW5kb3cgbGlzdGVuZXIgZm9yIHJlc2l6ZSBldmVudHNcblx0ICovXG5cdHByaXZhdGUgb25SZXNpemUoZXZlbnQ6VUlFdmVudCA9IG51bGwpOnZvaWRcblx0e1xuXHRcdHRoaXMudmlldy55ICAgICAgICAgPSAwO1xuXHRcdHRoaXMudmlldy54ICAgICAgICAgPSAwO1xuXHRcdHRoaXMudmlldy53aWR0aCAgICAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLnZpZXcuaGVpZ2h0ICAgID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cbmNsYXNzIEZsYXJlT2JqZWN0XG57XG5cdHByaXZhdGUgZmxhcmVTaXplOm51bWJlciA9IDE0LjQ7XG5cblx0cHVibGljIGJpbGxib2FyZDpCaWxsYm9hcmQ7XG5cblx0cHVibGljIHNpemU6bnVtYmVyO1xuXG5cdHB1YmxpYyBwb3NpdGlvbjpudW1iZXI7XG5cblx0cHVibGljIG9wYWNpdHk6bnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoYml0bWFwRGF0YTpCaXRtYXBEYXRhLCBzaXplOm51bWJlciwgcG9zaXRpb246bnVtYmVyLCBvcGFjaXR5Om51bWJlciwgc2NlbmU6U2NlbmUpXG5cdHtcblx0XHR2YXIgYmQ6Qml0bWFwRGF0YSA9IG5ldyBCaXRtYXBEYXRhKGJpdG1hcERhdGEud2lkdGgsIGJpdG1hcERhdGEuaGVpZ2h0LCB0cnVlLCAweEZGRkZGRkZGKTtcblx0XHRiZC5jb3B5Q2hhbm5lbChiaXRtYXBEYXRhLCBiaXRtYXBEYXRhLnJlY3QsIG5ldyBQb2ludCgpLCBCaXRtYXBEYXRhQ2hhbm5lbC5SRUQsIEJpdG1hcERhdGFDaGFubmVsLkFMUEhBKTtcblxuXHRcdHZhciBiaWxsYm9hcmRNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwobmV3IEJpdG1hcFRleHR1cmUoYmQsIGZhbHNlKSk7XG5cdFx0YmlsbGJvYXJkTWF0ZXJpYWwuYWxwaGEgPSBvcGFjaXR5LzEwMDtcblx0XHRiaWxsYm9hcmRNYXRlcmlhbC5hbHBoYUJsZW5kaW5nID0gdHJ1ZTtcblx0XHQvL2JpbGxib2FyZE1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5MQVlFUjtcblxuXHRcdHRoaXMuYmlsbGJvYXJkID0gbmV3IEJpbGxib2FyZChiaWxsYm9hcmRNYXRlcmlhbCk7XG5cdFx0dGhpcy5iaWxsYm9hcmQud2lkdGggPSBzaXplKnRoaXMuZmxhcmVTaXplO1xuXHRcdHRoaXMuYmlsbGJvYXJkLmhlaWdodCA9IHNpemUqdGhpcy5mbGFyZVNpemU7XG5cdFx0dGhpcy5iaWxsYm9hcmQucGl2b3QgPSBuZXcgVmVjdG9yM0Qoc2l6ZSp0aGlzLmZsYXJlU2l6ZS8yLCBzaXplKnRoaXMuZmxhcmVTaXplLzIsIDApO1xuXHRcdHRoaXMuYmlsbGJvYXJkLm9yaWVudGF0aW9uTW9kZSA9IE9yaWVudGF0aW9uTW9kZS5DQU1FUkFfUExBTkU7XG5cdFx0dGhpcy5iaWxsYm9hcmQuYWxpZ25tZW50TW9kZSA9IEFsaWdubWVudE1vZGUuUElWT1RfUE9JTlQ7XG5cdFx0dGhpcy5iaWxsYm9hcmQudmlzaWJsZSA9IGZhbHNlO1xuXHRcdHRoaXMuc2l6ZSA9IHNpemU7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdHRoaXMub3BhY2l0eSA9IG9wYWNpdHk7XG5cblx0XHRzY2VuZS5hZGRDaGlsZCh0aGlzLmJpbGxib2FyZClcblx0fVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKClcbntcblx0bmV3IEludGVybWVkaWF0ZV9HbG9iZSgpO1xufSJdfQ==