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
        var billboardMaterial = new MethodMaterial(new BitmapTexture(bd, false));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfR2xvYmUudHMiXSwibmFtZXMiOlsiSW50ZXJtZWRpYXRlX0dsb2JlIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXQiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdEVuZ2luZSIsIkludGVybWVkaWF0ZV9HbG9iZS5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXRNYXRlcmlhbHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUubW9kdWxhdGVEaWZmdXNlTWV0aG9kIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm1vZHVsYXRlU3BlY3VsYXJNZXRob2QiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdE9iamVjdHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9HbG9iZS5vbkVudGVyRnJhbWUiLCJJbnRlcm1lZGlhdGVfR2xvYmUudXBkYXRlRmxhcmVzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlRG93biIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlVXAiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZVdoZWVsIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzaXplIiwiRmxhcmVPYmplY3QiLCJGbGFyZU9iamVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW9DRTtBQUVGLElBQU8sVUFBVSxXQUFlLGlDQUFpQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxpQkFBaUIsV0FBYSx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU8sV0FBVyxXQUFlLG9DQUFvQyxDQUFDLENBQUM7QUFDdkUsSUFBTyxjQUFjLFdBQWMs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MUVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDRDQUE0Q0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaEZBLEFBQ0FBLGdCQURnQkE7UUFDaEJBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEs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QSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDcEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoR0EsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsNkJBQTZCQTtnQkFDakNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM3RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlGQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFP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QUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxPQUFPQSxDQUFDQTtRQUV2QkEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQUE7SUFDL0JBLENBQUNBO0lBQ0ZELGtCQUFDQTtBQUFEQSxDQXRDQSxBQXNDQ0EsSUFBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUc7SUFFZixJQUFJLGtCQUFrQixFQUFFLENBQUM7QUFDMUIsQ0FBQyxDQUFBIiwiZmlsZSI6IkludGVybWVkaWF0ZV9HbG9iZS5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cbkdsb2JlIGV4YW1wbGUgaW4gQXdheTNkXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGNyZWF0ZSBhIHRleHR1cmVkIHNwaGVyZS5cbkhvdyB0byB1c2UgY29udGFpbmVycyB0byByb3RhdGUgYW4gb2JqZWN0LlxuSG93IHRvIHVzZSB0aGUgUGhvbmdCaXRtYXBNYXRlcmlhbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hblxucm9iQGluZmluaXRldHVydGxlcy5jby51a1xuaHR0cDovL3d3dy5pbmZpbml0ZXR1cnRsZXMuY28udWtcblxuVGhpcyBjb2RlIGlzIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIFRoZSBBd2F5IEZvdW5kYXRpb24gaHR0cDovL3d3dy50aGVhd2F5Zm91bmRhdGlvbi5vcmdcblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUg4oCcU29mdHdhcmXigJ0pLCB0byBkZWFsXG5pbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG50byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG5jb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbmZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG5hbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIOKAnEFTIElT4oCdLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cblxuKi9cblxuaW1wb3J0IEJpdG1hcERhdGFcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YVwiKTtcbmltcG9ydCBCaXRtYXBEYXRhQ2hhbm5lbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9iYXNlL0JpdG1hcERhdGFDaGFubmVsXCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgQ29sb3JUcmFuc2Zvcm1cdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL0NvbG9yVHJhbnNmb3JtXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgUG9pbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9Qb2ludFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyQ29udGV4dFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMUmVxdWVzdFwiKTtcbmltcG9ydCBJbWFnZUN1YmVUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJbWFnZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlVGV4dHVyZVwiKTtcbmltcG9ydCBCaXRtYXBUZXh0dXJlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvQml0bWFwVGV4dHVyZVwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcblxuaW1wb3J0IERpc3BsYXlPYmplY3RDb250YWluZXJcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvRGlzcGxheU9iamVjdENvbnRhaW5lclwiKTtcbmltcG9ydCBTY2VuZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1NjZW5lXCIpO1xuaW1wb3J0IExvYWRlclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL0xvYWRlclwiKTtcbmltcG9ydCBWaWV3XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9WaWV3XCIpO1xuaW1wb3J0IEhvdmVyQ29udHJvbGxlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRyb2xsZXJzL0hvdmVyQ29udHJvbGxlclwiKTtcbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQmxlbmRNb2RlXCIpO1xuaW1wb3J0IE9yaWVudGF0aW9uTW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvT3JpZW50YXRpb25Nb2RlXCIpO1xuaW1wb3J0IEFsaWdubWVudE1vZGVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0FsaWdubWVudE1vZGVcIik7XG5pbXBvcnQgQ2FtZXJhXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0NhbWVyYVwiKTtcbmltcG9ydCBCaWxsYm9hcmRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0JpbGxib2FyZFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Qb2ludExpZ2h0XCIpO1xuaW1wb3J0IFNreWJveFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcbmltcG9ydCBQcmltaXRpdmVTcGhlcmVQcmVmYWJcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlU3BoZXJlUHJlZmFiXCIpO1xuaW1wb3J0IENhc3RcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi91dGlscy9DYXN0XCIpO1xuXG5pbXBvcnQgRGVmYXVsdFJlbmRlcmVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuaW1wb3J0IFNoYWRlck9iamVjdEJhc2VcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9jb21waWxhdGlvbi9TaGFkZXJPYmplY3RCYXNlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRWxlbWVudFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJFbGVtZW50XCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyQ2FjaGVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJDYWNoZVwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckRhdGFcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJEYXRhXCIpO1xuXG5pbXBvcnQgTWV0aG9kTWF0ZXJpYWxcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL01ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IE1ldGhvZFJlbmRlcmVyUG9vbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL3Bvb2wvTWV0aG9kUmVuZGVyZXJQb29sXCIpO1xuaW1wb3J0IE1ldGhvZFZPXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvZGF0YS9NZXRob2RWT1wiKTtcbmltcG9ydCBEaWZmdXNlQ29tcG9zaXRlTWV0aG9kXHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvRGlmZnVzZUNvbXBvc2l0ZU1ldGhvZFwiKTtcbmltcG9ydCBTcGVjdWxhckNvbXBvc2l0ZU1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NwZWN1bGFyQ29tcG9zaXRlTWV0aG9kXCIpO1xuaW1wb3J0IERpZmZ1c2VCYXNpY01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvRGlmZnVzZUJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyQmFzaWNNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NwZWN1bGFyQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJGcmVzbmVsTWV0aG9kXHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvU3BlY3VsYXJGcmVzbmVsTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyUGhvbmdNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NwZWN1bGFyUGhvbmdNZXRob2RcIik7XG5cbmNsYXNzIEludGVybWVkaWF0ZV9HbG9iZVxue1xuXHQvL2VuZ2luZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBzY2VuZTpTY2VuZTtcblx0cHJpdmF0ZSBjYW1lcmE6Q2FtZXJhO1xuXHRwcml2YXRlIHZpZXc6Vmlldztcblx0cHJpdmF0ZSBjYW1lcmFDb250cm9sbGVyOkhvdmVyQ29udHJvbGxlcjtcblxuXHQvL21hdGVyaWFsIG9iamVjdHNcblx0cHJpdmF0ZSBzdW5NYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBncm91bmRNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBjbG91ZE1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGF0bW9zcGhlcmVNYXRlcmlhbDpNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlRGlmZnVzZU1ldGhvZDpEaWZmdXNlQmFzaWNNZXRob2Q7XG5cdHByaXZhdGUgYXRtb3NwaGVyZVNwZWN1bGFyTWV0aG9kOlNwZWN1bGFyQmFzaWNNZXRob2Q7XG5cdHByaXZhdGUgY3ViZVRleHR1cmU6SW1hZ2VDdWJlVGV4dHVyZTtcblxuXHQvL3NjZW5lIG9iamVjdHNcblx0cHJpdmF0ZSBzdW46QmlsbGJvYXJkO1xuXHRwcml2YXRlIGVhcnRoOk1lc2g7XG5cdHByaXZhdGUgY2xvdWRzOk1lc2g7XG5cdHByaXZhdGUgYXRtb3NwaGVyZTpNZXNoO1xuXHRwcml2YXRlIHRpbHRDb250YWluZXI6RGlzcGxheU9iamVjdENvbnRhaW5lcjtcblx0cHJpdmF0ZSBvcmJpdENvbnRhaW5lcjpEaXNwbGF5T2JqZWN0Q29udGFpbmVyO1xuXHRwcml2YXRlIHNreUJveDpTa3lib3g7XG5cblx0Ly9saWdodCBvYmplY3RzXG5cdHByaXZhdGUgbGlnaHQ6UG9pbnRMaWdodDtcblx0cHJpdmF0ZSBsaWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcblx0cHJpdmF0ZSBmbGFyZXM6RmxhcmVPYmplY3RbXSA9IG5ldyBBcnJheTxGbGFyZU9iamVjdD4oMTIpO1xuXG5cdC8vbmF2aWdhdGlvbiB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW92ZTpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgbGFzdFBhbkFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBsYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBsYXN0TW91c2VYOm51bWJlcjtcblx0cHJpdmF0ZSBsYXN0TW91c2VZOm51bWJlcjtcblx0cHJpdmF0ZSBtb3VzZUxvY2tYOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW91c2VMb2NrWTpudW1iZXIgPSAwO1xuXHRwcml2YXRlIG1vdXNlTG9ja2VkOmJvb2xlYW47XG5cdHByaXZhdGUgZmxhcmVWaXNpYmxlOmJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHbG9iYWwgaW5pdGlhbGlzZSBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBpbml0KCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5pbml0RW5naW5lKCk7XG5cdFx0dGhpcy5pbml0TGlnaHRzKCk7XG5cdFx0Ly9pbml0TGVuc0ZsYXJlKCk7XG5cdFx0dGhpcy5pbml0TWF0ZXJpYWxzKCk7XG5cdFx0dGhpcy5pbml0T2JqZWN0cygpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGVuZ2luZVxuXHQgKi9cblx0cHJpdmF0ZSBpbml0RW5naW5lKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5zY2VuZSA9IG5ldyBTY2VuZSgpO1xuXG5cdFx0Ly9zZXR1cCBjYW1lcmEgZm9yIG9wdGltYWwgc2t5Ym94IHJlbmRlcmluZ1xuXHRcdHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSgpO1xuXHRcdHRoaXMuY2FtZXJhLnByb2plY3Rpb24uZmFyID0gMTAwMDAwO1xuXG5cdFx0dGhpcy52aWV3ID0gbmV3IFZpZXcobmV3IERlZmF1bHRSZW5kZXJlcihNZXRob2RSZW5kZXJlclBvb2wpKTtcblx0XHR0aGlzLnZpZXcuc2NlbmUgPSB0aGlzLnNjZW5lO1xuXHRcdHRoaXMudmlldy5jYW1lcmEgPSB0aGlzLmNhbWVyYTtcblxuXHRcdC8vc2V0dXAgY29udHJvbGxlciB0byBiZSB1c2VkIG9uIHRoZSBjYW1lcmFcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIgPSBuZXcgSG92ZXJDb250cm9sbGVyKHRoaXMuY2FtZXJhLCBudWxsLCAwLCAwLCA2MDAsIC05MCwgOTApO1xuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5hdXRvVXBkYXRlID0gZmFsc2U7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnlGYWN0b3IgPSAxO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpZ2h0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5saWdodCA9IG5ldyBQb2ludExpZ2h0KCk7XG5cdFx0dGhpcy5saWdodC54ID0gMTAwMDA7XG5cdFx0dGhpcy5saWdodC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLmxpZ2h0LmRpZmZ1c2UgPSAyO1xuXG5cdFx0dGhpcy5saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcihbdGhpcy5saWdodF0pO1xuXHR9XG4vKlxuXHRwcml2YXRlIGluaXRMZW5zRmxhcmUoKTp2b2lkXG5cdHtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMTAoKSwgIDMuMiwgLTAuMDEsIDE0Ny45KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTExKCksICA2LCAgICAwLCAgICAgMzAuNikpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgMiwgICAgMCwgICAgIDI1LjUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNygpLCAgIDQsICAgIDAsICAgICAxNy44NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUxMigpLCAgMC40LCAgMC4zMiwgIDIyLjk1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTYoKSwgICAxLCAgICAwLjY4LCAgMjAuNCkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUyKCksICAgMS4yNSwgMS4xLCAgIDQ4LjQ1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTMoKSwgICAxLjc1LCAxLjM3LCAgIDcuNjUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNCgpLCAgIDIuNzUsIDEuODUsICAxMi43NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU4KCksICAgMC41LCAgMi4yMSwgIDMzLjE1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTYoKSwgICA0LCAgICAyLjUsICAgMTAuNCkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgMTAsICAgMi42NiwgIDUwKSk7XG5cdH1cbiovXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBtYXRlcmlhbHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE1hdGVyaWFscygpOnZvaWRcblx0e1xuXHRcdC8vdGhpcy5jdWJlVGV4dHVyZSA9IG5ldyBCaXRtYXBDdWJlVGV4dHVyZShDYXN0LmJpdG1hcERhdGEoUG9zWCksIENhc3QuYml0bWFwRGF0YShOZWdYKSwgQ2FzdC5iaXRtYXBEYXRhKFBvc1kpLCBDYXN0LmJpdG1hcERhdGEoTmVnWSksIENhc3QuYml0bWFwRGF0YShQb3NaKSwgQ2FzdC5iaXRtYXBEYXRhKE5lZ1opKTtcblxuXHRcdC8vYWRqdXN0IHNwZWN1bGFyIG1hcFxuXHRcdC8vdmFyIHNwZWNCaXRtYXA6Qml0bWFwRGF0YSA9IENhc3QuYml0bWFwRGF0YShFYXJ0aFNwZWN1bGFyKTtcblx0XHQvL3NwZWNCaXRtYXAuY29sb3JUcmFuc2Zvcm0oc3BlY0JpdG1hcC5yZWN0LCBuZXcgQ29sb3JUcmFuc2Zvcm0oMSwgMSwgMSwgMSwgNjQsIDY0LCA2NCkpO1xuXG5cdFx0dmFyIHNwZWN1bGFyOlNwZWN1bGFyRnJlc25lbE1ldGhvZCA9IG5ldyBTcGVjdWxhckZyZXNuZWxNZXRob2QodHJ1ZSwgbmV3IFNwZWN1bGFyUGhvbmdNZXRob2QoKSk7XG5cdFx0c3BlY3VsYXIuZnJlc25lbFBvd2VyID0gMTtcblx0XHRzcGVjdWxhci5ub3JtYWxSZWZsZWN0YW5jZSA9IDAuMTtcblxuXHRcdHRoaXMuc3VuTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLnN1bk1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5BREQ7XG5cblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhck1ldGhvZCA9IHNwZWN1bGFyO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLmxpZ2h0UGlja2VyO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuZ2xvc3MgPSA1O1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc3BlY3VsYXIgPSAxO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuYW1iaWVudCA9IDE7XG5cdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5kaWZmdXNlTWV0aG9kLm11bHRpcGx5ID0gZmFsc2U7XG5cblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyA9IHRydWU7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuYW1iaWVudENvbG9yID0gMHgxYjIwNDg7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLnNwZWN1bGFyID0gMDtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuYW1iaWVudCA9IDE7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmVEaWZmdXNlTWV0aG9kID0gbmV3IERpZmZ1c2VDb21wb3NpdGVNZXRob2QodGhpcy5tb2R1bGF0ZURpZmZ1c2VNZXRob2QpO1xuXHRcdHRoaXMuYXRtb3NwaGVyZVNwZWN1bGFyTWV0aG9kID0gbmV3IFNwZWN1bGFyQ29tcG9zaXRlTWV0aG9kKHRoaXMubW9kdWxhdGVTcGVjdWxhck1ldGhvZCwgbmV3IFNwZWN1bGFyUGhvbmdNZXRob2QoKSk7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmRpZmZ1c2VNZXRob2QgPSB0aGlzLmF0bW9zcGhlcmVEaWZmdXNlTWV0aG9kO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLnNwZWN1bGFyTWV0aG9kID0gdGhpcy5hdG1vc3BoZXJlU3BlY3VsYXJNZXRob2Q7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkFERDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMubGlnaHRQaWNrZXI7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuc3BlY3VsYXIgPSAwLjU7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZ2xvc3MgPSA1O1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmFtYmllbnRDb2xvciA9IDA7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZGlmZnVzZUNvbG9yID0gMHgxNjcxY2M7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYW1iaWVudCA9IDE7XG5cdH1cblxuXHRwcml2YXRlIG1vZHVsYXRlRGlmZnVzZU1ldGhvZChzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHRhcmdldFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHJlZ0NhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIHZpZXdEaXJGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMudmlld0RpckZyYWdtZW50O1xuXHRcdHZhciBub3JtYWxGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQ7XG5cblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcImRwMyBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdmlld0RpckZyYWdtZW50UmVnICsgXCIueHl6LCBcIiArIG5vcm1hbEZyYWdtZW50UmVnICsgXCIueHl6XFxuXCIgK1xuXHRcdFx0XCJtdWwgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIud1xcblwiO1xuXG5cdFx0cmV0dXJuIGNvZGU7XG5cdH1cblxuXHRwcml2YXRlIG1vZHVsYXRlU3BlY3VsYXJNZXRob2Qoc2hhZGVyT2JqZWN0OlNoYWRlck9iamVjdEJhc2UsIG1ldGhvZFZPOk1ldGhvZFZPLCB0YXJnZXRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50LCByZWdDYWNoZTpTaGFkZXJSZWdpc3RlckNhY2hlLCBzaGFyZWRSZWdpc3RlcnM6U2hhZGVyUmVnaXN0ZXJEYXRhKTpzdHJpbmdcblx0e1xuXHRcdHZhciB2aWV3RGlyRnJhZ21lbnRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gc2hhcmVkUmVnaXN0ZXJzLnZpZXdEaXJGcmFnbWVudDtcblx0XHR2YXIgbm9ybWFsRnJhZ21lbnRSZWc6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gc2hhcmVkUmVnaXN0ZXJzLm5vcm1hbEZyYWdtZW50O1xuXHRcdHZhciB0ZW1wOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHJlZ0NhY2hlLmdldEZyZWVGcmFnbWVudFNpbmdsZVRlbXAoKTtcblx0XHRyZWdDYWNoZS5hZGRGcmFnbWVudFRlbXBVc2FnZXModGVtcCwgMSk7XG5cblx0XHR2YXIgY29kZTpzdHJpbmcgPSBcImRwMyBcIiArIHRlbXAgKyBcIiwgXCIgKyB2aWV3RGlyRnJhZ21lbnRSZWcgKyBcIi54eXosIFwiICsgbm9ybWFsRnJhZ21lbnRSZWcgKyBcIi54eXpcXG5cIiArXG5cdFx0XHRcIm5lZyBcIiArIHRlbXAgKyBcIiwgXCIgKyB0ZW1wICsgXCJcXG5cIiArXG5cdFx0XHRcIm11bCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0ZW1wICsgXCJcXG5cIjtcblxuXHRcdHJlZ0NhY2hlLnJlbW92ZUZyYWdtZW50VGVtcFVzYWdlKHRlbXApO1xuXG5cdFx0cmV0dXJuIGNvZGU7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgc2NlbmUgb2JqZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0T2JqZWN0cygpOnZvaWRcblx0e1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIgPSBuZXcgRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuXHRcdHRoaXMub3JiaXRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5saWdodCk7XG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLm9yYml0Q29udGFpbmVyKTtcblxuXHRcdHRoaXMuc3VuID0gbmV3IEJpbGxib2FyZCh0aGlzLnN1bk1hdGVyaWFsKTtcblx0XHR0aGlzLnN1bi53aWR0aCA9IDMwMDA7XG5cdFx0dGhpcy5zdW4uaGVpZ2h0ID0gMzAwMDtcblx0XHR0aGlzLnN1bi5waXZvdCA9IG5ldyBWZWN0b3IzRCgxNTAwLDE1MDAsMCk7XG5cdFx0dGhpcy5zdW4ub3JpZW50YXRpb25Nb2RlID0gT3JpZW50YXRpb25Nb2RlLkNBTUVSQV9QTEFORTtcblx0XHR0aGlzLnN1bi5hbGlnbm1lbnRNb2RlID0gQWxpZ25tZW50TW9kZS5QSVZPVF9QT0lOVDtcblx0XHR0aGlzLnN1bi54ID0gMTAwMDA7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLnN1bik7XG5cblx0XHR0aGlzLmVhcnRoID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjAwLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5lYXJ0aC5tYXRlcmlhbCA9IHRoaXMuZ3JvdW5kTWF0ZXJpYWw7XG5cblx0XHR0aGlzLmNsb3VkcyA9IDxNZXNoPiBuZXcgUHJpbWl0aXZlU3BoZXJlUHJlZmFiKDIwMiwgMjAwLCAxMDApLmdldE5ld09iamVjdCgpO1xuXHRcdHRoaXMuY2xvdWRzLm1hdGVyaWFsID0gdGhpcy5jbG91ZE1hdGVyaWFsO1xuXG5cdFx0dGhpcy5hdG1vc3BoZXJlID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjEwLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlLm1hdGVyaWFsID0gdGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWw7XG5cdFx0dGhpcy5hdG1vc3BoZXJlLnNjYWxlWCA9IC0xO1xuXG5cdFx0dGhpcy50aWx0Q29udGFpbmVyID0gbmV3IERpc3BsYXlPYmplY3RDb250YWluZXIoKTtcblx0XHR0aGlzLnRpbHRDb250YWluZXIucm90YXRpb25YID0gLTIzO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmVhcnRoKTtcblx0XHR0aGlzLnRpbHRDb250YWluZXIuYWRkQ2hpbGQodGhpcy5jbG91ZHMpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmF0bW9zcGhlcmUpO1xuXG5cdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnRpbHRDb250YWluZXIpO1xuXG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLmxvb2tBdE9iamVjdCA9IHRoaXMudGlsdENvbnRhaW5lcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaXN0ZW5lcnNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpc3RlbmVycygpOnZvaWRcblx0e1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQ6VUlFdmVudCkgPT4gdGhpcy5vblJlc2l6ZShldmVudCk7XG5cblx0XHRkb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNldXAgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlVXAoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V3aGVlbD0gKGV2ZW50Ok1vdXNlV2hlZWxFdmVudCkgPT4gdGhpcy5vbk1vdXNlV2hlZWwoZXZlbnQpO1xuXG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cblx0XHRBc3NldExpYnJhcnkuYWRkRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgKGV2ZW50OkxvYWRlckV2ZW50KSA9PiB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9zcGFjZV90ZXh0dXJlLmN1YmVcIiksIGFzc2V0TG9hZGVyQ29udGV4dCk7XG5cblx0XHQvL2dsb2JlIHRleHR1cmVzXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvY2xvdWRfY29tYmluZWRfMjA0OC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2VhcnRoX3NwZWN1bGFyXzIwNDguanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9FYXJ0aE5vcm1hbC5wbmdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL2xhbmRfbGlnaHRzXzE2Mzg0LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvbGFuZF9vY2Vhbl9pY2VfMjA0OF9tYXRjaC5qcGdcIikpO1xuXG5cdFx0Ly9mbGFyZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTIuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUzLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTYuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU3LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlOC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEwLmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTEuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMi5qcGdcIikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpOnZvaWRcblx0e1xuXHRcdHRoaXMuX3RpbWUgKz0gZHQ7XG5cblx0XHR0aGlzLmVhcnRoLnJvdGF0aW9uWSArPSAwLjI7XG5cdFx0dGhpcy5jbG91ZHMucm90YXRpb25ZICs9IDAuMjE7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5yb3RhdGlvblkgKz0gMC4wMjtcblxuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci51cGRhdGUoKTtcblxuXHRcdHRoaXMudXBkYXRlRmxhcmVzKCk7XG5cblx0XHR0aGlzLnZpZXcucmVuZGVyKCk7XG5cdH1cblxuXHRwcml2YXRlIHVwZGF0ZUZsYXJlcygpOnZvaWRcblx0e1xuXHRcdHZhciBmbGFyZVZpc2libGVPbGQ6Ym9vbGVhbiA9IHRoaXMuZmxhcmVWaXNpYmxlO1xuXG5cdFx0dmFyIHN1blNjcmVlblBvc2l0aW9uOlZlY3RvcjNEID0gdGhpcy52aWV3LnByb2plY3QodGhpcy5zdW4uc2NlbmVQb3NpdGlvbik7XG5cdFx0dmFyIHhPZmZzZXQ6bnVtYmVyID0gc3VuU2NyZWVuUG9zaXRpb24ueCAtIHdpbmRvdy5pbm5lcldpZHRoLzI7XG5cdFx0dmFyIHlPZmZzZXQ6bnVtYmVyID0gc3VuU2NyZWVuUG9zaXRpb24ueSAtIHdpbmRvdy5pbm5lckhlaWdodC8yO1xuXG5cdFx0dmFyIGVhcnRoU2NyZWVuUG9zaXRpb246VmVjdG9yM0QgPSB0aGlzLnZpZXcucHJvamVjdCh0aGlzLmVhcnRoLnNjZW5lUG9zaXRpb24pO1xuXHRcdHZhciBlYXJ0aFJhZGl1czpudW1iZXIgPSAxOTAgKiB3aW5kb3cuaW5uZXJIZWlnaHQvZWFydGhTY3JlZW5Qb3NpdGlvbi56O1xuXHRcdHZhciBmbGFyZU9iamVjdDpGbGFyZU9iamVjdDtcblxuXHRcdHRoaXMuZmxhcmVWaXNpYmxlID0gKHN1blNjcmVlblBvc2l0aW9uLnggPiAwICYmIHN1blNjcmVlblBvc2l0aW9uLnggPCB3aW5kb3cuaW5uZXJXaWR0aCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi55ID4gMCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi55ICA8IHdpbmRvdy5pbm5lckhlaWdodCAmJiBzdW5TY3JlZW5Qb3NpdGlvbi56ID4gMCAmJiBNYXRoLnNxcnQoeE9mZnNldCp4T2Zmc2V0ICsgeU9mZnNldCp5T2Zmc2V0KSA+IGVhcnRoUmFkaXVzKTtcblxuXHRcdC8vdXBkYXRlIGZsYXJlIHZpc2liaWxpdHlcblx0XHRpZiAodGhpcy5mbGFyZVZpc2libGUgIT0gZmxhcmVWaXNpYmxlT2xkKSB7XG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLmZsYXJlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRmbGFyZU9iamVjdCA9IHRoaXMuZmxhcmVzW2ldO1xuXHRcdFx0XHRpZiAoZmxhcmVPYmplY3QpXG5cdFx0XHRcdFx0ZmxhcmVPYmplY3QuYmlsbGJvYXJkLnZpc2libGUgPSB0aGlzLmZsYXJlVmlzaWJsZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3VwZGF0ZSBmbGFyZSBwb3NpdGlvblxuXHRcdGlmICh0aGlzLmZsYXJlVmlzaWJsZSkge1xuXHRcdFx0dmFyIGZsYXJlRGlyZWN0aW9uOlBvaW50ID0gbmV3IFBvaW50KHhPZmZzZXQsIHlPZmZzZXQpO1xuXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgdGhpcy5mbGFyZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0ZmxhcmVPYmplY3QgPSB0aGlzLmZsYXJlc1tpXTtcblx0XHRcdFx0aWYgKGZsYXJlT2JqZWN0KVxuXHRcdFx0XHRcdGZsYXJlT2JqZWN0LmJpbGxib2FyZC50cmFuc2Zvcm0ucG9zaXRpb24gPSB0aGlzLnZpZXcudW5wcm9qZWN0KHN1blNjcmVlblBvc2l0aW9uLnggLSBmbGFyZURpcmVjdGlvbi54KmZsYXJlT2JqZWN0LnBvc2l0aW9uLCBzdW5TY3JlZW5Qb3NpdGlvbi55IC0gZmxhcmVEaXJlY3Rpb24ueSpmbGFyZU9iamVjdC5wb3NpdGlvbiwgMTAwIC0gaSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbmVyIGZ1bmN0aW9uIGZvciByZXNvdXJjZSBjb21wbGV0ZSBldmVudCBvbiBhc3NldCBsaWJyYXJ5XG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZShldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHN3aXRjaChldmVudC51cmwpIHtcblx0XHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdFx0Y2FzZSAnYXNzZXRzL3NreWJveC9zcGFjZV90ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHR0aGlzLmN1YmVUZXh0dXJlID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXG5cdFx0XHRcdHRoaXMuc2t5Qm94ID0gbmV3IFNreWJveCh0aGlzLmN1YmVUZXh0dXJlKTtcblx0XHRcdFx0dGhpcy5zY2VuZS5hZGRDaGlsZCh0aGlzLnNreUJveCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHQvL2dsb2JlIHRleHR1cmVzXG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2Nsb3VkX2NvbWJpbmVkXzIwNDguanBnXCIgOlxuXHRcdFx0XHR2YXIgY2xvdWRCaXRtYXBEYXRhOkJpdG1hcERhdGEgPSBuZXcgQml0bWFwRGF0YSgyMDQ4LCAxMDI0LCB0cnVlLCAweEZGRkZGRkZGKTtcblx0XHRcdFx0Y2xvdWRCaXRtYXBEYXRhLmNvcHlDaGFubmVsKENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIGNsb3VkQml0bWFwRGF0YS5yZWN0LCBuZXcgUG9pbnQoKSwgQml0bWFwRGF0YUNoYW5uZWwuUkVELCBCaXRtYXBEYXRhQ2hhbm5lbC5BTFBIQSk7XG5cblx0XHRcdFx0dGhpcy5jbG91ZE1hdGVyaWFsLnRleHR1cmUgPSBuZXcgQml0bWFwVGV4dHVyZShjbG91ZEJpdG1hcERhdGEsIGZhbHNlKTsgLy9UT0RPOiBmaXggbWlwbWFwcyBmb3IgYml0bWFwZGF0YSB0ZXh0dXJlc1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvZWFydGhfc3BlY3VsYXJfMjA0OC5qcGdcIiA6XG5cdFx0XHRcdHZhciBzcGVjQml0bWFwRGF0YTpCaXRtYXBEYXRhID0gQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKTtcblx0XHRcdFx0c3BlY0JpdG1hcERhdGEuY29sb3JUcmFuc2Zvcm0oc3BlY0JpdG1hcERhdGEucmVjdCwgbmV3IENvbG9yVHJhbnNmb3JtKDEsIDEsIDEsIDEsIDY0LCA2NCwgNjQpKTtcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5zcGVjdWxhck1hcCA9IG5ldyBCaXRtYXBUZXh0dXJlKHNwZWNCaXRtYXBEYXRhLCBmYWxzZSk7IC8vVE9ETzogZml4IG1pcG1hcHMgZm9yIGJpdG1hcGRhdGEgdGV4dHVyZXNcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL0VhcnRoTm9ybWFsLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5ub3JtYWxNYXAgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2xhbmRfbGlnaHRzXzE2Mzg0LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9sYW5kX29jZWFuX2ljZV8yMDQ4X21hdGNoLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5ncm91bmRNYXRlcmlhbC5kaWZmdXNlVGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9mbGFyZSB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUyLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbNl0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMS4yNSwgMS4xLCA0OC40NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUzLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbN10gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMS43NSwgMS4zNywgNy42NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU0LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbOF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMi43NSwgMS44NSwgMTIuNzUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzVdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDEsIDAuNjgsIDIwLjQsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1sxMF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgNCwgMi41LCAxMC40LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTcuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1syXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAyLCAwLCAyNS41LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbM10gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgNCwgMCwgMTcuODUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1sxMV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMTAsIDIuNjYsIDUwLCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTguanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s5XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAwLjUsIDIuMjEsIDMzLjE1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEwLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5zdW5NYXRlcmlhbC50ZXh0dXJlID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzBdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDMuMiwgLTAuMDEsIDEwMCwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMS5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzFdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDYsIDAsIDMwLjYsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTIuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s0XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAwLjQsIDAuMzIsIDIyLjk1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5sYXN0UGFuQW5nbGUgPSB0aGlzLmNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGU7XG5cdFx0dGhpcy5sYXN0VGlsdEFuZ2xlID0gdGhpcy5jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZTtcblx0XHR0aGlzLmxhc3RNb3VzZVggPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMubGFzdE1vdXNlWSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0dGhpcy5tb3ZlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB1cCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQ6TW91c2VFdmVudCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgbW92ZSBsaXN0ZW5lciBmb3IgbW91c2VMb2NrXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuLy8gICAgICAgICAgICBpZiAoc3RhZ2UuZGlzcGxheVN0YXRlID09IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOKSB7XG4vL1xuLy8gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9ja2VkICYmIChsYXN0TW91c2VYICE9IDAgfHwgbGFzdE1vdXNlWSAhPSAwKSkge1xuLy8gICAgICAgICAgICAgICAgICAgIGUubW92ZW1lbnRYICs9IGxhc3RNb3VzZVg7XG4vLyAgICAgICAgICAgICAgICAgICAgZS5tb3ZlbWVudFkgKz0gbGFzdE1vdXNlWTtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VYID0gMDtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VZID0gMDtcbi8vICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICBtb3VzZUxvY2tYICs9IGUubW92ZW1lbnRYO1xuLy8gICAgICAgICAgICAgICAgbW91c2VMb2NrWSArPSBlLm1vdmVtZW50WTtcbi8vXG4vLyAgICAgICAgICAgICAgICBpZiAoIXN0YWdlLm1vdXNlTG9jaykge1xuLy8gICAgICAgICAgICAgICAgICAgIHN0YWdlLm1vdXNlTG9jayA9IHRydWU7XG4vLyAgICAgICAgICAgICAgICAgICAgbGFzdE1vdXNlWCA9IHN0YWdlLm1vdXNlWCAtIHN0YWdlLnN0YWdlV2lkdGgvMjtcbi8vICAgICAgICAgICAgICAgICAgICBsYXN0TW91c2VZID0gc3RhZ2UubW91c2VZIC0gc3RhZ2Uuc3RhZ2VIZWlnaHQvMjtcbi8vICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIW1vdXNlTG9ja2VkKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrZWQgPSB0cnVlO1xuLy8gICAgICAgICAgICAgICAgfVxuLy9cbi8vICAgICAgICAgICAgICAgIC8vZW5zdXJlIGJvdW5kcyBmb3IgdGlsdEFuZ2xlIGFyZSBub3QgZWNlZWRlZFxuLy8gICAgICAgICAgICAgICAgaWYgKG1vdXNlTG9ja1kgPiBjYW1lcmFDb250cm9sbGVyLm1heFRpbHRBbmdsZS8wLjMpXG4vLyAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWSA9IGNhbWVyYUNvbnRyb2xsZXIubWF4VGlsdEFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgICAgIGVsc2UgaWYgKG1vdXNlTG9ja1kgPCBjYW1lcmFDb250cm9sbGVyLm1pblRpbHRBbmdsZS8wLjMpXG4vLyAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWSA9IGNhbWVyYUNvbnRyb2xsZXIubWluVGlsdEFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgfVxuXG4vLyAgICAgICAgICAgIGlmIChzdGFnZS5tb3VzZUxvY2spIHtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqbW91c2VMb2NrWDtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKm1vdXNlTG9ja1k7XG4vLyAgICAgICAgICAgIH0gZWxzZSBpZiAobW92ZSkge1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooc3RhZ2UubW91c2VYIC0gbGFzdE1vdXNlWCkgKyBsYXN0UGFuQW5nbGU7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZSA9IDAuMyooc3RhZ2UubW91c2VZIC0gbGFzdE1vdXNlWSkgKyBsYXN0VGlsdEFuZ2xlO1xuLy8gICAgICAgICAgICB9XG5cblx0XHRpZiAodGhpcy5tb3ZlKSB7XG5cdFx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLmxhc3RNb3VzZVgpICsgdGhpcy5sYXN0UGFuQW5nbGU7XG5cdFx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5sYXN0TW91c2VZKSArIHRoaXMubGFzdFRpbHRBbmdsZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2Ugd2hlZWwgbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZVdoZWVsKGV2ZW50Ok1vdXNlV2hlZWxFdmVudClcblx0e1xuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSAtPSBldmVudC53aGVlbERlbHRhO1xuXG5cdFx0aWYgKHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA8IDQwMClcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA9IDQwMDtcblx0XHRlbHNlIGlmICh0aGlzLmNhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPiAxMDAwMClcblx0XHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5kaXN0YW5jZSA9IDEwMDAwO1xuXHR9XG5cblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBmdWxsc2NyZWVuXG5cdCAqL1xuLy8gICAgICAgIHByaXZhdGUgb25LZXlEb3duKGV2ZW50OktleWJvYXJkRXZlbnQpOnZvaWRcbi8vICAgICAgICB7XG4vLyAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5Q29kZSlcbi8vICAgICAgICAgICAge1xuLy8gICAgICAgICAgICAgICAgY2FzZSBLZXlib2FyZC5TUEFDRTpcbi8vICAgICAgICAgICAgICAgICAgICBpZiAoc3RhZ2UuZGlzcGxheVN0YXRlID09IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdlLmRpc3BsYXlTdGF0ZSA9IFN0YWdlRGlzcGxheVN0YXRlLk5PUk1BTDtcbi8vICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBzdGFnZS5kaXNwbGF5U3RhdGUgPSBTdGFnZURpc3BsYXlTdGF0ZS5GVUxMX1NDUkVFTjtcbi8vXG4vLyAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja2VkID0gZmFsc2U7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja1ggPSBjYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgICAgICAgICAgICAgbW91c2VMb2NrWSA9IGNhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlLzAuMztcbi8vICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICB9XG4vL1xuXG5cdC8qKlxuXHQgKiB3aW5kb3cgbGlzdGVuZXIgZm9yIHJlc2l6ZSBldmVudHNcblx0ICovXG5cdHByaXZhdGUgb25SZXNpemUoZXZlbnQ6VUlFdmVudCA9IG51bGwpOnZvaWRcblx0e1xuXHRcdHRoaXMudmlldy55ICAgICAgICAgPSAwO1xuXHRcdHRoaXMudmlldy54ICAgICAgICAgPSAwO1xuXHRcdHRoaXMudmlldy53aWR0aCAgICAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLnZpZXcuaGVpZ2h0ICAgID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cbmNsYXNzIEZsYXJlT2JqZWN0XG57XG5cdHByaXZhdGUgZmxhcmVTaXplOm51bWJlciA9IDE0LjQ7XG5cblx0cHVibGljIGJpbGxib2FyZDpCaWxsYm9hcmQ7XG5cblx0cHVibGljIHNpemU6bnVtYmVyO1xuXG5cdHB1YmxpYyBwb3NpdGlvbjpudW1iZXI7XG5cblx0cHVibGljIG9wYWNpdHk6bnVtYmVyO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoYml0bWFwRGF0YTpCaXRtYXBEYXRhLCBzaXplOm51bWJlciwgcG9zaXRpb246bnVtYmVyLCBvcGFjaXR5Om51bWJlciwgc2NlbmU6U2NlbmUpXG5cdHtcblx0XHR2YXIgYmQ6Qml0bWFwRGF0YSA9IG5ldyBCaXRtYXBEYXRhKGJpdG1hcERhdGEud2lkdGgsIGJpdG1hcERhdGEuaGVpZ2h0LCB0cnVlLCAweEZGRkZGRkZGKTtcblx0XHRiZC5jb3B5Q2hhbm5lbChiaXRtYXBEYXRhLCBiaXRtYXBEYXRhLnJlY3QsIG5ldyBQb2ludCgpLCBCaXRtYXBEYXRhQ2hhbm5lbC5SRUQsIEJpdG1hcERhdGFDaGFubmVsLkFMUEhBKTtcblxuXHRcdHZhciBiaWxsYm9hcmRNYXRlcmlhbDpNZXRob2RNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbChuZXcgQml0bWFwVGV4dHVyZShiZCwgZmFsc2UpKTtcblx0XHRiaWxsYm9hcmRNYXRlcmlhbC5hbHBoYSA9IG9wYWNpdHkvMTAwO1xuXHRcdGJpbGxib2FyZE1hdGVyaWFsLmFscGhhQmxlbmRpbmcgPSB0cnVlO1xuXHRcdC8vYmlsbGJvYXJkTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkxBWUVSO1xuXG5cdFx0dGhpcy5iaWxsYm9hcmQgPSBuZXcgQmlsbGJvYXJkKGJpbGxib2FyZE1hdGVyaWFsKTtcblx0XHR0aGlzLmJpbGxib2FyZC53aWR0aCA9IHNpemUqdGhpcy5mbGFyZVNpemU7XG5cdFx0dGhpcy5iaWxsYm9hcmQuaGVpZ2h0ID0gc2l6ZSp0aGlzLmZsYXJlU2l6ZTtcblx0XHR0aGlzLmJpbGxib2FyZC5waXZvdCA9IG5ldyBWZWN0b3IzRChzaXplKnRoaXMuZmxhcmVTaXplLzIsIHNpemUqdGhpcy5mbGFyZVNpemUvMiwgMCk7XG5cdFx0dGhpcy5iaWxsYm9hcmQub3JpZW50YXRpb25Nb2RlID0gT3JpZW50YXRpb25Nb2RlLkNBTUVSQV9QTEFORTtcblx0XHR0aGlzLmJpbGxib2FyZC5hbGlnbm1lbnRNb2RlID0gQWxpZ25tZW50TW9kZS5QSVZPVF9QT0lOVDtcblx0XHR0aGlzLmJpbGxib2FyZC52aXNpYmxlID0gZmFsc2U7XG5cdFx0dGhpcy5zaXplID0gc2l6ZTtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5vcGFjaXR5ID0gb3BhY2l0eTtcblxuXHRcdHNjZW5lLmFkZENoaWxkKHRoaXMuYmlsbGJvYXJkKVxuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuXHRuZXcgSW50ZXJtZWRpYXRlX0dsb2JlKCk7XG59Il19