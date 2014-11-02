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
var SkyboxMaterial = require("awayjs-renderergl/lib/materials/SkyboxMaterial");
var TriangleMethodMaterial = require("awayjs-renderergl/lib/materials/TriangleMethodMaterial");
var DiffuseCompositeMethod = require("awayjs-renderergl/lib/materials/methods/DiffuseCompositeMethod");
var SpecularCompositeMethod = require("awayjs-renderergl/lib/materials/methods/SpecularCompositeMethod");
var SpecularFresnelMethod = require("awayjs-renderergl/lib/materials/methods/SpecularFresnelMethod");
var SpecularPhongMethod = require("awayjs-renderergl/lib/materials/methods/SpecularPhongMethod");
var DefaultRenderer = require("awayjs-renderergl/lib/render/DefaultRenderer");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9JbnRlcm1lZGlhdGVfR2xvYmUudHMiXSwibmFtZXMiOlsiSW50ZXJtZWRpYXRlX0dsb2JlIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmNvbnN0cnVjdG9yIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXQiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdEVuZ2luZSIsIkludGVybWVkaWF0ZV9HbG9iZS5pbml0TGlnaHRzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLmluaXRNYXRlcmlhbHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUubW9kdWxhdGVEaWZmdXNlTWV0aG9kIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm1vZHVsYXRlU3BlY3VsYXJNZXRob2QiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdE9iamVjdHMiLCJJbnRlcm1lZGlhdGVfR2xvYmUuaW5pdExpc3RlbmVycyIsIkludGVybWVkaWF0ZV9HbG9iZS5vbkVudGVyRnJhbWUiLCJJbnRlcm1lZGlhdGVfR2xvYmUudXBkYXRlRmxhcmVzIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzb3VyY2VDb21wbGV0ZSIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlRG93biIsIkludGVybWVkaWF0ZV9HbG9iZS5vbk1vdXNlVXAiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZU1vdmUiLCJJbnRlcm1lZGlhdGVfR2xvYmUub25Nb3VzZVdoZWVsIiwiSW50ZXJtZWRpYXRlX0dsb2JlLm9uUmVzaXplIiwiRmxhcmVPYmplY3QiLCJGbGFyZU9iamVjdC5jb25zdHJ1Y3RvciJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW9DRTtBQUVGLElBQU8sVUFBVSxXQUFlLGlDQUFpQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxpQkFBaUIsV0FBYSx3Q0FBd0MsQ0FBQyxDQUFDO0FBQy9FLElBQU8sV0FBVyxXQUFlLG9DQUFvQyxDQUFDLENBQUM7QUFDdkUsSUFBTyxjQUFjLFdBQWMs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QVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLHNDQUFzQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDMUVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLG9DQUFvQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDRDQUE0Q0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaEZBLEFBQ0FBLGdCQURnQkE7UUFDaEJBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDZCQUE2QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDakVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbEVBLFlBQVlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLFVBQVVBLENBQUNBLDhCQUE4QkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDbkVBLENBQUNBO0lBRURUOztPQUVHQTtJQUNLQSx5Q0FBWUEsR0FBcEJBLFVBQXFCQSxFQUFTQTtRQUU3QlUsSUFBSUEsQ0FBQ0EsS0FBS0EsSUFBSUEsRUFBRUEsQ0FBQ0E7UUFFakJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLElBQUlBLEdBQUdBLENBQUNBO1FBQzVCQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUM5QkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsSUFBSUEsSUFBSUEsQ0FBQ0E7UUFFdENBLElBQUlBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7UUFFL0JBLElBQUlBLENBQUNBLFlBQVlBLEVBQUVBLENBQUNBO1FBRXBCQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQTtJQUNwQkEsQ0FBQ0E7SUFFT1YseUNBQVlBLEdBQXBCQTtRQUVDVyxJQUFJQSxlQUFlQSxHQUFXQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQTtRQUVoREEsSUFBSUEsaUJBQWlCQSxHQUFZQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUMzRUEsSUFBSUEsT0FBT0EsR0FBVUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxVQUFVQSxHQUFDQSxDQUFDQSxDQUFDQTtRQUMvREEsSUFBSUEsT0FBT0EsR0FBVUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxXQUFXQSxHQUFDQSxDQUFDQSxDQUFDQTtRQUVoRUEsSUFBSUEsbUJBQW1CQSxHQUFZQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQTtRQUMvRUEsSUFBSUEsV0FBV0EsR0FBVUEsR0FBR0EsR0FBR0EsTUFBTUEsQ0FBQ0EsV0FBV0EsR0FBQ0EsbUJBQW1CQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUN4RUEsSUFBSUEsV0FBdUJBLENBQUNBO1FBRTVCQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsVUFBVUEsSUFBSUEsaUJBQWlCQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxpQkFBaUJBLENBQUNBLENBQUNBLEdBQUlBLE1BQU1BLENBQUNBLFdBQVdBLElBQUlBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBQ0EsT0FBT0EsR0FBR0EsT0FBT0EsR0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsV0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFFMVBBLEFBQ0FBLHlCQUR5QkE7UUFDekJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLElBQUlBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1lBQzFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFVQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtnQkFDcERBLFdBQVdBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUM3QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsV0FBV0EsQ0FBQ0E7b0JBQ2ZBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBO1lBQ3BEQSxDQUFDQTtRQUNGQSxDQUFDQTtRQUVEQSxBQUNBQSx1QkFEdUJBO1FBQ3ZCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsSUFBSUEsY0FBY0EsR0FBU0EsSUFBSUEsS0FBS0EsQ0FBQ0EsT0FBT0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7WUFDdkRBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO2dCQUNwREEsV0FBV0EsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzdCQSxFQUFFQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQTtvQkFDZkEsV0FBV0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsUUFBUUEsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxHQUFHQSxjQUFjQSxDQUFDQSxDQUFDQSxHQUFDQSxXQUFXQSxDQUFDQSxRQUFRQSxFQUFFQSxpQkFBaUJBLENBQUNBLENBQUNBLEdBQUdBLGNBQWNBLENBQUNBLENBQUNBLEdBQUNBLFdBQVdBLENBQUNBLFFBQVFBLEVBQUVBLEdBQUdBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQ3BNQSxDQUFDQTtRQUNGQSxDQUFDQTtJQUNGQSxDQUFDQTtJQUVEWDs7T0FFR0E7SUFDS0EsK0NBQWtCQSxHQUExQkEsVUFBMkJBLEtBQWlCQTtRQUUzQ1ksTUFBTUEsQ0FBQUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFFbEJBLEtBQUtBLGtDQUFrQ0E7Z0JBQ3RDQSxJQUFJQSxDQUFDQSxXQUFXQSxHQUFzQkEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7Z0JBRXhEQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxNQUFNQSxDQUFDQSxJQUFJQSxjQUFjQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDL0RBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBO2dCQUNqQ0EsS0FBS0EsQ0FBQ0E7WUFHUEEsS0FBS0Esc0NBQXNDQTtnQkFDMUNBLElBQUlBLGVBQWVBLEdBQWNBLElBQUlBLFVBQVVBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLEVBQUVBLFVBQVVBLENBQUNBLENBQUNBO2dCQUM5RUEsZUFBZUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsZUFBZUEsQ0FBQ0EsSUFBSUEsRUFBRUEsSUFBSUEsS0FBS0EsRUFBRUEsRUFBRUEsaUJBQWlCQSxDQUFDQSxHQUFHQSxFQUFFQSxpQkFBaUJBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUVuSkEsSUFBSUEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsYUFBYUEsQ0FBQ0EsZUFBZUEsRUFBRUEsS0FBS0EsQ0FBQ0EsRUFBRUEsMkNBQTJDQTtnQkFDbkhBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLHNDQUFzQ0E7Z0JBQzFDQSxJQUFJQSxjQUFjQSxHQUFjQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxDQUFDQTtnQkFDbkVBLGNBQWNBLENBQUNBLGNBQWNBLENBQUNBLGNBQWNBLENBQUNBLElBQUlBLEVBQUVBLElBQUlBLGNBQWNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO2dCQUMvRkEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsYUFBYUEsQ0FBQ0EsY0FBY0EsRUFBRUEsS0FBS0EsQ0FBQ0EsRUFBRUEsMkNBQTJDQTtnQkFDdkhBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQSxTQUFTQSxHQUFrQkEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7Z0JBQ2pFQSxLQUFLQSxDQUFDQTtZQUNQQSxLQUFLQSxvQ0FBb0NBO2dCQUN4Q0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsT0FBT0EsR0FBa0JBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBO2dCQUMvREEsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsNENBQTRDQTtnQkFDaERBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBLGNBQWNBLEdBQWtCQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQTtnQkFDdEVBLEtBQUtBLENBQUNBO1lBR1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDcEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEdBQUdBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUNoR0EsS0FBS0EsQ0FBQ0E7WUFDUEEsS0FBS0EsNkJBQTZCQTtnQkFDakNBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFdBQVdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUVBLENBQUNBLENBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLElBQUlBLEVBQUVBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO2dCQUM3RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsV0FBV0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzlGQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxFQUFFQSxFQUFFQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDaEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDZCQUE2QkE7Z0JBQ2pDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxHQUFrQkEsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBRUEsQ0FBQ0EsQ0FBRUEsQ0FBQ0E7Z0JBQzVEQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbEdBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxJQUFJQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDN0ZBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLDhCQUE4QkE7Z0JBQ2xDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxXQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFFQSxDQUFDQSxDQUFFQSxDQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxJQUFJQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtnQkFDbkdBLEtBQUtBLENBQUNBO1FBQ1JBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURaOztPQUVHQTtJQUNLQSx3Q0FBV0EsR0FBbkJBLFVBQW9CQSxLQUFnQkE7UUFFbkNhLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlB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UUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLE9BQU9BLEdBQUdBLE9BQU9BLENBQUNBO1FBRXZCQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFBQTtJQUMvQkEsQ0FBQ0E7SUFDRkQsa0JBQUNBO0FBQURBLENBdENBLEFBc0NDQSxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUVmLElBQUksa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixDQUFDLENBQUEiLCJmaWxlIjoiSW50ZXJtZWRpYXRlX0dsb2JlLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuR2xvYmUgZXhhbXBsZSBpbiBBd2F5M2RcblxuRGVtb25zdHJhdGVzOlxuXG5Ib3cgdG8gY3JlYXRlIGEgdGV4dHVyZWQgc3BoZXJlLlxuSG93IHRvIHVzZSBjb250YWluZXJzIHRvIHJvdGF0ZSBhbiBvYmplY3QuXG5Ib3cgdG8gdXNlIHRoZSBQaG9uZ0JpdG1hcE1hdGVyaWFsLlxuXG5Db2RlIGJ5IFJvYiBCYXRlbWFuXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuXG5UaGlzIGNvZGUgaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgVGhlIEF3YXkgRm91bmRhdGlvbiBodHRwOi8vd3d3LnRoZWF3YXlmb3VuZGF0aW9uLm9yZ1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDigJxTb2Z0d2FyZeKAnSksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQg4oCcQVMgSVPigJ0sIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG5pbXBvcnQgQml0bWFwRGF0YVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvYmFzZS9CaXRtYXBEYXRhXCIpO1xuaW1wb3J0IEJpdG1hcERhdGFDaGFubmVsXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2Jhc2UvQml0bWFwRGF0YUNoYW5uZWxcIik7XG5pbXBvcnQgTG9hZGVyRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBDb2xvclRyYW5zZm9ybVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vQ29sb3JUcmFuc2Zvcm1cIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBQb2ludFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1BvaW50XCIpO1xuaW1wb3J0IEFzc2V0TGlicmFyeVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJDb250ZXh0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMb2FkZXJDb250ZXh0XCIpO1xuaW1wb3J0IFVSTFJlcXVlc3RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IEltYWdlQ3ViZVRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9JbWFnZUN1YmVUZXh0dXJlXCIpO1xuaW1wb3J0IEltYWdlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IEJpdG1hcFRleHR1cmVcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9CaXRtYXBUZXh0dXJlXCIpO1xuaW1wb3J0IFJlcXVlc3RBbmltYXRpb25GcmFtZVx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgRGlzcGxheU9iamVjdENvbnRhaW5lclx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9EaXNwbGF5T2JqZWN0Q29udGFpbmVyXCIpO1xuaW1wb3J0IFNjZW5lXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvU2NlbmVcIik7XG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250YWluZXJzL1ZpZXdcIik7XG5pbXBvcnQgSG92ZXJDb250cm9sbGVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udHJvbGxlcnMvSG92ZXJDb250cm9sbGVyXCIpO1xuaW1wb3J0IEJsZW5kTW9kZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgT3JpZW50YXRpb25Nb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9PcmllbnRhdGlvbk1vZGVcIik7XG5pbXBvcnQgQWxpZ25tZW50TW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQWxpZ25tZW50TW9kZVwiKTtcbmltcG9ydCBDYW1lcmFcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FtZXJhXCIpO1xuaW1wb3J0IEJpbGxib2FyZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQmlsbGJvYXJkXCIpO1xuaW1wb3J0IE1lc2hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IFBvaW50TGlnaHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVNwaGVyZVByZWZhYlx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVTcGhlcmVQcmVmYWJcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3V0aWxzL0Nhc3RcIik7XG5cbmltcG9ydCBTa3lib3hNYXRlcmlhbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9Ta3lib3hNYXRlcmlhbFwiKTtcbmltcG9ydCBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsXHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvVHJpYW5nbGVNZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBNZXRob2RWT1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vTWV0aG9kVk9cIik7XG5pbXBvcnQgU2hhZGVyT2JqZWN0QmFzZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJPYmplY3RCYXNlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRWxlbWVudFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL2NvbXBpbGF0aW9uL1NoYWRlclJlZ2lzdGVyRWxlbWVudFwiKTtcbmltcG9ydCBTaGFkZXJSZWdpc3RlckNhY2hlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9jb21waWxhdGlvbi9TaGFkZXJSZWdpc3RlckNhY2hlXCIpO1xuaW1wb3J0IFNoYWRlclJlZ2lzdGVyRGF0YVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvY29tcGlsYXRpb24vU2hhZGVyUmVnaXN0ZXJEYXRhXCIpO1xuaW1wb3J0IERpZmZ1c2VDb21wb3NpdGVNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL0RpZmZ1c2VDb21wb3NpdGVNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJDb21wb3NpdGVNZXRob2RcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL1NwZWN1bGFyQ29tcG9zaXRlTWV0aG9kXCIpO1xuaW1wb3J0IERpZmZ1c2VCYXNpY01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9EaWZmdXNlQmFzaWNNZXRob2RcIik7XG5pbXBvcnQgU3BlY3VsYXJCYXNpY01ldGhvZFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9TcGVjdWxhckJhc2ljTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyRnJlc25lbE1ldGhvZFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJGcmVzbmVsTWV0aG9kXCIpO1xuaW1wb3J0IFNwZWN1bGFyUGhvbmdNZXRob2RcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU3BlY3VsYXJQaG9uZ01ldGhvZFwiKTtcbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9yZW5kZXIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuXG5jbGFzcyBJbnRlcm1lZGlhdGVfR2xvYmVcbntcblx0Ly9lbmdpbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgc2NlbmU6U2NlbmU7XG5cdHByaXZhdGUgY2FtZXJhOkNhbWVyYTtcblx0cHJpdmF0ZSB2aWV3OlZpZXc7XG5cdHByaXZhdGUgY2FtZXJhQ29udHJvbGxlcjpIb3ZlckNvbnRyb2xsZXI7XG5cblx0Ly9tYXRlcmlhbCBvYmplY3RzXG5cdHByaXZhdGUgc3VuTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBncm91bmRNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIGNsb3VkTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBhdG1vc3BoZXJlRGlmZnVzZU1ldGhvZDpEaWZmdXNlQmFzaWNNZXRob2Q7XG5cdHByaXZhdGUgYXRtb3NwaGVyZVNwZWN1bGFyTWV0aG9kOlNwZWN1bGFyQmFzaWNNZXRob2Q7XG5cdHByaXZhdGUgY3ViZVRleHR1cmU6SW1hZ2VDdWJlVGV4dHVyZTtcblxuXHQvL3NjZW5lIG9iamVjdHNcblx0cHJpdmF0ZSBzdW46QmlsbGJvYXJkO1xuXHRwcml2YXRlIGVhcnRoOk1lc2g7XG5cdHByaXZhdGUgY2xvdWRzOk1lc2g7XG5cdHByaXZhdGUgYXRtb3NwaGVyZTpNZXNoO1xuXHRwcml2YXRlIHRpbHRDb250YWluZXI6RGlzcGxheU9iamVjdENvbnRhaW5lcjtcblx0cHJpdmF0ZSBvcmJpdENvbnRhaW5lcjpEaXNwbGF5T2JqZWN0Q29udGFpbmVyO1xuXHRwcml2YXRlIHNreUJveDpTa3lib3g7XG5cblx0Ly9saWdodCBvYmplY3RzXG5cdHByaXZhdGUgbGlnaHQ6UG9pbnRMaWdodDtcblx0cHJpdmF0ZSBsaWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcblx0cHJpdmF0ZSBmbGFyZXM6RmxhcmVPYmplY3RbXSA9IG5ldyBBcnJheTxGbGFyZU9iamVjdD4oMTIpO1xuXG5cdC8vbmF2aWdhdGlvbiB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW92ZTpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgbGFzdFBhbkFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBsYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBsYXN0TW91c2VYOm51bWJlcjtcblx0cHJpdmF0ZSBsYXN0TW91c2VZOm51bWJlcjtcblx0cHJpdmF0ZSBtb3VzZUxvY2tYOm51bWJlciA9IDA7XG5cdHByaXZhdGUgbW91c2VMb2NrWTpudW1iZXIgPSAwO1xuXHRwcml2YXRlIG1vdXNlTG9ja2VkOmJvb2xlYW47XG5cdHByaXZhdGUgZmxhcmVWaXNpYmxlOmJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHbG9iYWwgaW5pdGlhbGlzZSBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBpbml0KCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5pbml0RW5naW5lKCk7XG5cdFx0dGhpcy5pbml0TGlnaHRzKCk7XG5cdFx0Ly9pbml0TGVuc0ZsYXJlKCk7XG5cdFx0dGhpcy5pbml0TWF0ZXJpYWxzKCk7XG5cdFx0dGhpcy5pbml0T2JqZWN0cygpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGVuZ2luZVxuXHQgKi9cblx0cHJpdmF0ZSBpbml0RW5naW5lKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5zY2VuZSA9IG5ldyBTY2VuZSgpO1xuXG5cdFx0Ly9zZXR1cCBjYW1lcmEgZm9yIG9wdGltYWwgc2t5Ym94IHJlbmRlcmluZ1xuXHRcdHRoaXMuY2FtZXJhID0gbmV3IENhbWVyYSgpO1xuXHRcdHRoaXMuY2FtZXJhLnByb2plY3Rpb24uZmFyID0gMTAwMDAwO1xuXG5cdFx0dGhpcy52aWV3ID0gbmV3IFZpZXcobmV3IERlZmF1bHRSZW5kZXJlcigpKTtcblx0XHR0aGlzLnZpZXcuc2NlbmUgPSB0aGlzLnNjZW5lO1xuXHRcdHRoaXMudmlldy5jYW1lcmEgPSB0aGlzLmNhbWVyYTtcblxuXHRcdC8vc2V0dXAgY29udHJvbGxlciB0byBiZSB1c2VkIG9uIHRoZSBjYW1lcmFcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIgPSBuZXcgSG92ZXJDb250cm9sbGVyKHRoaXMuY2FtZXJhLCBudWxsLCAwLCAwLCA2MDAsIC05MCwgOTApO1xuXHRcdHRoaXMuY2FtZXJhQ29udHJvbGxlci5hdXRvVXBkYXRlID0gZmFsc2U7XG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnlGYWN0b3IgPSAxO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpZ2h0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5saWdodCA9IG5ldyBQb2ludExpZ2h0KCk7XG5cdFx0dGhpcy5saWdodC54ID0gMTAwMDA7XG5cdFx0dGhpcy5saWdodC5hbWJpZW50ID0gMTtcblx0XHR0aGlzLmxpZ2h0LmRpZmZ1c2UgPSAyO1xuXG5cdFx0dGhpcy5saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcihbdGhpcy5saWdodF0pO1xuXHR9XG4vKlxuXHRwcml2YXRlIGluaXRMZW5zRmxhcmUoKTp2b2lkXG5cdHtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlMTAoKSwgIDMuMiwgLTAuMDEsIDE0Ny45KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTExKCksICA2LCAgICAwLCAgICAgMzAuNikpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgMiwgICAgMCwgICAgIDI1LjUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNygpLCAgIDQsICAgIDAsICAgICAxNy44NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUxMigpLCAgMC40LCAgMC4zMiwgIDIyLjk1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTYoKSwgICAxLCAgICAwLjY4LCAgMjAuNCkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmUyKCksICAgMS4yNSwgMS4xLCAgIDQ4LjQ1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTMoKSwgICAxLjc1LCAxLjM3LCAgIDcuNjUpKTtcblx0XHRmbGFyZXMucHVzaChuZXcgRmxhcmVPYmplY3QobmV3IEZsYXJlNCgpLCAgIDIuNzUsIDEuODUsICAxMi43NSkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU4KCksICAgMC41LCAgMi4yMSwgIDMzLjE1KSk7XG5cdFx0ZmxhcmVzLnB1c2gobmV3IEZsYXJlT2JqZWN0KG5ldyBGbGFyZTYoKSwgICA0LCAgICAyLjUsICAgMTAuNCkpO1xuXHRcdGZsYXJlcy5wdXNoKG5ldyBGbGFyZU9iamVjdChuZXcgRmxhcmU3KCksICAgMTAsICAgMi42NiwgIDUwKSk7XG5cdH1cbiovXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBtYXRlcmlhbHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE1hdGVyaWFscygpOnZvaWRcblx0e1xuXHRcdC8vdGhpcy5jdWJlVGV4dHVyZSA9IG5ldyBCaXRtYXBDdWJlVGV4dHVyZShDYXN0LmJpdG1hcERhdGEoUG9zWCksIENhc3QuYml0bWFwRGF0YShOZWdYKSwgQ2FzdC5iaXRtYXBEYXRhKFBvc1kpLCBDYXN0LmJpdG1hcERhdGEoTmVnWSksIENhc3QuYml0bWFwRGF0YShQb3NaKSwgQ2FzdC5iaXRtYXBEYXRhKE5lZ1opKTtcblxuXHRcdC8vYWRqdXN0IHNwZWN1bGFyIG1hcFxuXHRcdC8vdmFyIHNwZWNCaXRtYXA6Qml0bWFwRGF0YSA9IENhc3QuYml0bWFwRGF0YShFYXJ0aFNwZWN1bGFyKTtcblx0XHQvL3NwZWNCaXRtYXAuY29sb3JUcmFuc2Zvcm0oc3BlY0JpdG1hcC5yZWN0LCBuZXcgQ29sb3JUcmFuc2Zvcm0oMSwgMSwgMSwgMSwgNjQsIDY0LCA2NCkpO1xuXG5cdFx0dmFyIHNwZWN1bGFyOlNwZWN1bGFyRnJlc25lbE1ldGhvZCA9IG5ldyBTcGVjdWxhckZyZXNuZWxNZXRob2QodHJ1ZSwgbmV3IFNwZWN1bGFyUGhvbmdNZXRob2QoKSk7XG5cdFx0c3BlY3VsYXIuZnJlc25lbFBvd2VyID0gMTtcblx0XHRzcGVjdWxhci5ub3JtYWxSZWZsZWN0YW5jZSA9IDAuMTtcblxuXHRcdHRoaXMuc3VuTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuc3VuTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkFERDtcblxuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCgpO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc3BlY3VsYXJNZXRob2QgPSBzcGVjdWxhcjtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmdsb3NzID0gNTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLnNwZWN1bGFyID0gMTtcblx0XHR0aGlzLmdyb3VuZE1hdGVyaWFsLmFtYmllbnQgPSAxO1xuXHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuZGlmZnVzZU1ldGhvZC5tdWx0aXBseSA9IGZhbHNlO1xuXG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwoKTtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyA9IHRydWU7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuYW1iaWVudENvbG9yID0gMHgxYjIwNDg7XG5cdFx0dGhpcy5jbG91ZE1hdGVyaWFsLnNwZWN1bGFyID0gMDtcblx0XHR0aGlzLmNsb3VkTWF0ZXJpYWwuYW1iaWVudCA9IDE7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmVEaWZmdXNlTWV0aG9kID0gbmV3IERpZmZ1c2VDb21wb3NpdGVNZXRob2QodGhpcy5tb2R1bGF0ZURpZmZ1c2VNZXRob2QpO1xuXHRcdHRoaXMuYXRtb3NwaGVyZVNwZWN1bGFyTWV0aG9kID0gbmV3IFNwZWN1bGFyQ29tcG9zaXRlTWV0aG9kKHRoaXMubW9kdWxhdGVTcGVjdWxhck1ldGhvZCwgbmV3IFNwZWN1bGFyUGhvbmdNZXRob2QoKSk7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKCk7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuZGlmZnVzZU1ldGhvZCA9IHRoaXMuYXRtb3NwaGVyZURpZmZ1c2VNZXRob2Q7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuc3BlY3VsYXJNZXRob2QgPSB0aGlzLmF0bW9zcGhlcmVTcGVjdWxhck1ldGhvZDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuQUREO1xuXHRcdHRoaXMuYXRtb3NwaGVyZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5saWdodFBpY2tlcjtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5zcGVjdWxhciA9IDAuNTtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5nbG9zcyA9IDU7XG5cdFx0dGhpcy5hdG1vc3BoZXJlTWF0ZXJpYWwuYW1iaWVudENvbG9yID0gMDtcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5kaWZmdXNlQ29sb3IgPSAweDE2NzFjYztcblx0XHR0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbC5hbWJpZW50ID0gMTtcblx0fVxuXG5cdHByaXZhdGUgbW9kdWxhdGVEaWZmdXNlTWV0aG9kKHNoYWRlck9iamVjdDpTaGFkZXJPYmplY3RCYXNlLCBtZXRob2RWTzpNZXRob2RWTywgdGFyZ2V0UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCwgcmVnQ2FjaGU6U2hhZGVyUmVnaXN0ZXJDYWNoZSwgc2hhcmVkUmVnaXN0ZXJzOlNoYWRlclJlZ2lzdGVyRGF0YSk6c3RyaW5nXG5cdHtcblx0XHR2YXIgdmlld0RpckZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy52aWV3RGlyRnJhZ21lbnQ7XG5cdFx0dmFyIG5vcm1hbEZyYWdtZW50UmVnOlNoYWRlclJlZ2lzdGVyRWxlbWVudCA9IHNoYXJlZFJlZ2lzdGVycy5ub3JtYWxGcmFnbWVudDtcblxuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiZHAzIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB2aWV3RGlyRnJhZ21lbnRSZWcgKyBcIi54eXosIFwiICsgbm9ybWFsRnJhZ21lbnRSZWcgKyBcIi54eXpcXG5cIiArXG5cdFx0XHRcIm11bCBcIiArIHRhcmdldFJlZyArIFwiLncsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53XFxuXCI7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdHByaXZhdGUgbW9kdWxhdGVTcGVjdWxhck1ldGhvZChzaGFkZXJPYmplY3Q6U2hhZGVyT2JqZWN0QmFzZSwgbWV0aG9kVk86TWV0aG9kVk8sIHRhcmdldFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQsIHJlZ0NhY2hlOlNoYWRlclJlZ2lzdGVyQ2FjaGUsIHNoYXJlZFJlZ2lzdGVyczpTaGFkZXJSZWdpc3RlckRhdGEpOnN0cmluZ1xuXHR7XG5cdFx0dmFyIHZpZXdEaXJGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMudmlld0RpckZyYWdtZW50O1xuXHRcdHZhciBub3JtYWxGcmFnbWVudFJlZzpTaGFkZXJSZWdpc3RlckVsZW1lbnQgPSBzaGFyZWRSZWdpc3RlcnMubm9ybWFsRnJhZ21lbnQ7XG5cdFx0dmFyIHRlbXA6U2hhZGVyUmVnaXN0ZXJFbGVtZW50ID0gcmVnQ2FjaGUuZ2V0RnJlZUZyYWdtZW50U2luZ2xlVGVtcCgpO1xuXHRcdHJlZ0NhY2hlLmFkZEZyYWdtZW50VGVtcFVzYWdlcyh0ZW1wLCAxKTtcblxuXHRcdHZhciBjb2RlOnN0cmluZyA9IFwiZHAzIFwiICsgdGVtcCArIFwiLCBcIiArIHZpZXdEaXJGcmFnbWVudFJlZyArIFwiLnh5eiwgXCIgKyBub3JtYWxGcmFnbWVudFJlZyArIFwiLnh5elxcblwiICtcblx0XHRcdFwibmVnIFwiICsgdGVtcCArIFwiLCBcIiArIHRlbXAgKyBcIlxcblwiICtcblx0XHRcdFwibXVsIFwiICsgdGFyZ2V0UmVnICsgXCIudywgXCIgKyB0YXJnZXRSZWcgKyBcIi53LCBcIiArIHRlbXAgKyBcIlxcblwiO1xuXG5cdFx0cmVnQ2FjaGUucmVtb3ZlRnJhZ21lbnRUZW1wVXNhZ2UodGVtcCk7XG5cblx0XHRyZXR1cm4gY29kZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKCk6dm9pZFxuXHR7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lciA9IG5ldyBEaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG5cdFx0dGhpcy5vcmJpdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmxpZ2h0KTtcblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMub3JiaXRDb250YWluZXIpO1xuXG5cdFx0dGhpcy5zdW4gPSBuZXcgQmlsbGJvYXJkKHRoaXMuc3VuTWF0ZXJpYWwpO1xuXHRcdHRoaXMuc3VuLndpZHRoID0gMzAwMDtcblx0XHR0aGlzLnN1bi5oZWlnaHQgPSAzMDAwO1xuXHRcdHRoaXMuc3VuLnBpdm90ID0gbmV3IFZlY3RvcjNEKDE1MDAsMTUwMCwwKTtcblx0XHR0aGlzLnN1bi5vcmllbnRhdGlvbk1vZGUgPSBPcmllbnRhdGlvbk1vZGUuQ0FNRVJBX1BMQU5FO1xuXHRcdHRoaXMuc3VuLmFsaWdubWVudE1vZGUgPSBBbGlnbm1lbnRNb2RlLlBJVk9UX1BPSU5UO1xuXHRcdHRoaXMuc3VuLnggPSAxMDAwMDtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuc3VuKTtcblxuXHRcdHRoaXMuZWFydGggPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMDAsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmVhcnRoLm1hdGVyaWFsID0gdGhpcy5ncm91bmRNYXRlcmlhbDtcblxuXHRcdHRoaXMuY2xvdWRzID0gPE1lc2g+IG5ldyBQcmltaXRpdmVTcGhlcmVQcmVmYWIoMjAyLCAyMDAsIDEwMCkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0dGhpcy5jbG91ZHMubWF0ZXJpYWwgPSB0aGlzLmNsb3VkTWF0ZXJpYWw7XG5cblx0XHR0aGlzLmF0bW9zcGhlcmUgPSA8TWVzaD4gbmV3IFByaW1pdGl2ZVNwaGVyZVByZWZhYigyMTAsIDIwMCwgMTAwKS5nZXROZXdPYmplY3QoKTtcblx0XHR0aGlzLmF0bW9zcGhlcmUubWF0ZXJpYWwgPSB0aGlzLmF0bW9zcGhlcmVNYXRlcmlhbDtcblx0XHR0aGlzLmF0bW9zcGhlcmUuc2NhbGVYID0gLTE7XG5cblx0XHR0aGlzLnRpbHRDb250YWluZXIgPSBuZXcgRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5yb3RhdGlvblggPSAtMjM7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuZWFydGgpO1xuXHRcdHRoaXMudGlsdENvbnRhaW5lci5hZGRDaGlsZCh0aGlzLmNsb3Vkcyk7XG5cdFx0dGhpcy50aWx0Q29udGFpbmVyLmFkZENoaWxkKHRoaXMuYXRtb3NwaGVyZSk7XG5cblx0XHR0aGlzLnNjZW5lLmFkZENoaWxkKHRoaXMudGlsdENvbnRhaW5lcik7XG5cblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIubG9va0F0T2JqZWN0ID0gdGhpcy50aWx0Q29udGFpbmVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKCk6dm9pZFxuXHR7XG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudDpVSUV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50Ok1vdXNlRXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudDpNb3VzZUV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQ6TW91c2VFdmVudCkgPT4gdGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXdoZWVsPSAoZXZlbnQ6TW91c2VXaGVlbEV2ZW50KSA9PiB0aGlzLm9uTW91c2VXaGVlbChldmVudCk7XG5cblxuXHRcdHRoaXMub25SZXNpemUoKTtcblxuXHRcdHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdFx0dGhpcy5fdGltZXIuc3RhcnQoKTtcblxuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG5cblx0XHQvL3NldHVwIHRoZSB1cmwgbWFwIGZvciB0ZXh0dXJlcyBpbiB0aGUgY3ViZW1hcCBmaWxlXG5cdFx0dmFyIGFzc2V0TG9hZGVyQ29udGV4dDpBc3NldExvYWRlckNvbnRleHQgPSBuZXcgQXNzZXRMb2FkZXJDb250ZXh0KCk7XG5cdFx0YXNzZXRMb2FkZXJDb250ZXh0LmRlcGVuZGVuY3lCYXNlVXJsID0gXCJhc3NldHMvc2t5Ym94L1wiO1xuXG5cdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvc2t5Ym94L3NwYWNlX3RleHR1cmUuY3ViZVwiKSwgYXNzZXRMb2FkZXJDb250ZXh0KTtcblxuXHRcdC8vZ2xvYmUgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9jbG91ZF9jb21iaW5lZF8yMDQ4LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvZWFydGhfc3BlY3VsYXJfMjA0OC5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2dsb2JlL0VhcnRoTm9ybWFsLnBuZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZ2xvYmUvbGFuZF9saWdodHNfMTYzODQuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9nbG9iZS9sYW5kX29jZWFuX2ljZV8yMDQ4X21hdGNoLmpwZ1wiKSk7XG5cblx0XHQvL2ZsYXJlIHRleHR1cmVzXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMi5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTMuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU0LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNi5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTcuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU4LmpwZ1wiKSk7XG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTAuanBnXCIpKTtcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMS5qcGdcIikpO1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEyLmpwZ1wiKSk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGlvbiBhbmQgcmVuZGVyIGxvb3Bcblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGR0Om51bWJlcik6dm9pZFxuXHR7XG5cdFx0dGhpcy5fdGltZSArPSBkdDtcblxuXHRcdHRoaXMuZWFydGgucm90YXRpb25ZICs9IDAuMjtcblx0XHR0aGlzLmNsb3Vkcy5yb3RhdGlvblkgKz0gMC4yMTtcblx0XHR0aGlzLm9yYml0Q29udGFpbmVyLnJvdGF0aW9uWSArPSAwLjAyO1xuXG5cdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnVwZGF0ZSgpO1xuXG5cdFx0dGhpcy51cGRhdGVGbGFyZXMoKTtcblxuXHRcdHRoaXMudmlldy5yZW5kZXIoKTtcblx0fVxuXG5cdHByaXZhdGUgdXBkYXRlRmxhcmVzKCk6dm9pZFxuXHR7XG5cdFx0dmFyIGZsYXJlVmlzaWJsZU9sZDpib29sZWFuID0gdGhpcy5mbGFyZVZpc2libGU7XG5cblx0XHR2YXIgc3VuU2NyZWVuUG9zaXRpb246VmVjdG9yM0QgPSB0aGlzLnZpZXcucHJvamVjdCh0aGlzLnN1bi5zY2VuZVBvc2l0aW9uKTtcblx0XHR2YXIgeE9mZnNldDpudW1iZXIgPSBzdW5TY3JlZW5Qb3NpdGlvbi54IC0gd2luZG93LmlubmVyV2lkdGgvMjtcblx0XHR2YXIgeU9mZnNldDpudW1iZXIgPSBzdW5TY3JlZW5Qb3NpdGlvbi55IC0gd2luZG93LmlubmVySGVpZ2h0LzI7XG5cblx0XHR2YXIgZWFydGhTY3JlZW5Qb3NpdGlvbjpWZWN0b3IzRCA9IHRoaXMudmlldy5wcm9qZWN0KHRoaXMuZWFydGguc2NlbmVQb3NpdGlvbik7XG5cdFx0dmFyIGVhcnRoUmFkaXVzOm51bWJlciA9IDE5MCAqIHdpbmRvdy5pbm5lckhlaWdodC9lYXJ0aFNjcmVlblBvc2l0aW9uLno7XG5cdFx0dmFyIGZsYXJlT2JqZWN0OkZsYXJlT2JqZWN0O1xuXG5cdFx0dGhpcy5mbGFyZVZpc2libGUgPSAoc3VuU2NyZWVuUG9zaXRpb24ueCA+IDAgJiYgc3VuU2NyZWVuUG9zaXRpb24ueCA8IHdpbmRvdy5pbm5lcldpZHRoICYmIHN1blNjcmVlblBvc2l0aW9uLnkgPiAwICYmIHN1blNjcmVlblBvc2l0aW9uLnkgIDwgd2luZG93LmlubmVySGVpZ2h0ICYmIHN1blNjcmVlblBvc2l0aW9uLnogPiAwICYmIE1hdGguc3FydCh4T2Zmc2V0KnhPZmZzZXQgKyB5T2Zmc2V0KnlPZmZzZXQpID4gZWFydGhSYWRpdXMpO1xuXG5cdFx0Ly91cGRhdGUgZmxhcmUgdmlzaWJpbGl0eVxuXHRcdGlmICh0aGlzLmZsYXJlVmlzaWJsZSAhPSBmbGFyZVZpc2libGVPbGQpIHtcblx0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IHRoaXMuZmxhcmVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGZsYXJlT2JqZWN0ID0gdGhpcy5mbGFyZXNbaV07XG5cdFx0XHRcdGlmIChmbGFyZU9iamVjdClcblx0XHRcdFx0XHRmbGFyZU9iamVjdC5iaWxsYm9hcmQudmlzaWJsZSA9IHRoaXMuZmxhcmVWaXNpYmxlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vdXBkYXRlIGZsYXJlIHBvc2l0aW9uXG5cdFx0aWYgKHRoaXMuZmxhcmVWaXNpYmxlKSB7XG5cdFx0XHR2YXIgZmxhcmVEaXJlY3Rpb246UG9pbnQgPSBuZXcgUG9pbnQoeE9mZnNldCwgeU9mZnNldCk7XG5cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCB0aGlzLmZsYXJlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRmbGFyZU9iamVjdCA9IHRoaXMuZmxhcmVzW2ldO1xuXHRcdFx0XHRpZiAoZmxhcmVPYmplY3QpXG5cdFx0XHRcdFx0ZmxhcmVPYmplY3QuYmlsbGJvYXJkLnRyYW5zZm9ybS5wb3NpdGlvbiA9IHRoaXMudmlldy51bnByb2plY3Qoc3VuU2NyZWVuUG9zaXRpb24ueCAtIGZsYXJlRGlyZWN0aW9uLngqZmxhcmVPYmplY3QucG9zaXRpb24sIHN1blNjcmVlblBvc2l0aW9uLnkgLSBmbGFyZURpcmVjdGlvbi55KmZsYXJlT2JqZWN0LnBvc2l0aW9uLCAxMDAgLSBpKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVuZXIgZnVuY3Rpb24gZm9yIHJlc291cmNlIGNvbXBsZXRlIGV2ZW50IG9uIGFzc2V0IGxpYnJhcnlcblx0ICovXG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50OkxvYWRlckV2ZW50KVxuXHR7XG5cdFx0c3dpdGNoKGV2ZW50LnVybCkge1xuXHRcdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L3NwYWNlX3RleHR1cmUuY3ViZSc6XG5cdFx0XHRcdHRoaXMuY3ViZVRleHR1cmUgPSA8SW1hZ2VDdWJlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cblx0XHRcdFx0dGhpcy5za3lCb3ggPSBuZXcgU2t5Ym94KG5ldyBTa3lib3hNYXRlcmlhbCh0aGlzLmN1YmVUZXh0dXJlKSk7XG5cdFx0XHRcdHRoaXMuc2NlbmUuYWRkQ2hpbGQodGhpcy5za3lCb3gpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Ly9nbG9iZSB0ZXh0dXJlc1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9jbG91ZF9jb21iaW5lZF8yMDQ4LmpwZ1wiIDpcblx0XHRcdFx0dmFyIGNsb3VkQml0bWFwRGF0YTpCaXRtYXBEYXRhID0gbmV3IEJpdG1hcERhdGEoMjA0OCwgMTAyNCwgdHJ1ZSwgMHhGRkZGRkZGRik7XG5cdFx0XHRcdGNsb3VkQml0bWFwRGF0YS5jb3B5Q2hhbm5lbChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCBjbG91ZEJpdG1hcERhdGEucmVjdCwgbmV3IFBvaW50KCksIEJpdG1hcERhdGFDaGFubmVsLlJFRCwgQml0bWFwRGF0YUNoYW5uZWwuQUxQSEEpO1xuXG5cdFx0XHRcdHRoaXMuY2xvdWRNYXRlcmlhbC50ZXh0dXJlID0gbmV3IEJpdG1hcFRleHR1cmUoY2xvdWRCaXRtYXBEYXRhLCBmYWxzZSk7IC8vVE9ETzogZml4IG1pcG1hcHMgZm9yIGJpdG1hcGRhdGEgdGV4dHVyZXNcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2dsb2JlL2VhcnRoX3NwZWN1bGFyXzIwNDguanBnXCIgOlxuXHRcdFx0XHR2YXIgc3BlY0JpdG1hcERhdGE6Qml0bWFwRGF0YSA9IENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSk7XG5cdFx0XHRcdHNwZWNCaXRtYXBEYXRhLmNvbG9yVHJhbnNmb3JtKHNwZWNCaXRtYXBEYXRhLnJlY3QsIG5ldyBDb2xvclRyYW5zZm9ybSgxLCAxLCAxLCAxLCA2NCwgNjQsIDY0KSk7XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSBuZXcgQml0bWFwVGV4dHVyZShzcGVjQml0bWFwRGF0YSwgZmFsc2UpOyAvL1RPRE86IGZpeCBtaXBtYXBzIGZvciBiaXRtYXBkYXRhIHRleHR1cmVzXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9FYXJ0aE5vcm1hbC5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwubm9ybWFsTWFwID0gPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9nbG9iZS9sYW5kX2xpZ2h0c18xNjM4NC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwudGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZ2xvYmUvbGFuZF9vY2Vhbl9pY2VfMjA0OF9tYXRjaC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZ3JvdW5kTWF0ZXJpYWwuZGlmZnVzZVRleHR1cmUgPSA8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdC8vZmxhcmUgdGV4dHVyZXNcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMi5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzZdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDEuMjUsIDEuMSwgNDguNDUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMy5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzddID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDEuNzUsIDEuMzcsIDcuNjUsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlNC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzhdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDIuNzUsIDEuODUsIDEyLjc1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTYuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1s1XSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAxLCAwLjY4LCAyMC40LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbMTBdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDQsIDIuNSwgMTAuNCwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU3LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbMl0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMiwgMCwgMjUuNSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdHRoaXMuZmxhcmVzWzNdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDQsIDAsIDE3Ljg1LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0dGhpcy5mbGFyZXNbMTFdID0gbmV3IEZsYXJlT2JqZWN0KENhc3QuYml0bWFwRGF0YShldmVudC5hc3NldHNbIDAgXSksIDEwLCAyLjY2LCA1MCwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmU4LmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbOV0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMC41LCAyLjIxLCAzMy4xNSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9sZW5zZmxhcmUvZmxhcmUxMC5qcGdcIiA6XG5cdFx0XHRcdHRoaXMuc3VuTWF0ZXJpYWwudGV4dHVyZSA9IDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHR0aGlzLmZsYXJlc1swXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCAzLjIsIC0wLjAxLCAxMDAsIHRoaXMuc2NlbmUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvbGVuc2ZsYXJlL2ZsYXJlMTEuanBnXCIgOlxuXHRcdFx0XHR0aGlzLmZsYXJlc1sxXSA9IG5ldyBGbGFyZU9iamVjdChDYXN0LmJpdG1hcERhdGEoZXZlbnQuYXNzZXRzWyAwIF0pLCA2LCAwLCAzMC42LCB0aGlzLnNjZW5lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2xlbnNmbGFyZS9mbGFyZTEyLmpwZ1wiIDpcblx0XHRcdFx0dGhpcy5mbGFyZXNbNF0gPSBuZXcgRmxhcmVPYmplY3QoQ2FzdC5iaXRtYXBEYXRhKGV2ZW50LmFzc2V0c1sgMCBdKSwgMC40LCAwLjMyLCAyMi45NSwgdGhpcy5zY2VuZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBkb3duIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHRoaXMubGFzdFBhbkFuZ2xlID0gdGhpcy5jYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlO1xuXHRcdHRoaXMubGFzdFRpbHRBbmdsZSA9IHRoaXMuY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGU7XG5cdFx0dGhpcy5sYXN0TW91c2VYID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLmxhc3RNb3VzZVkgPSBldmVudC5jbGllbnRZO1xuXHRcdHRoaXMubW92ZSA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgdXAgbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50Ok1vdXNlRXZlbnQpOnZvaWRcblx0e1xuXHRcdHRoaXMubW92ZSA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIG1vdmUgbGlzdGVuZXIgZm9yIG1vdXNlTG9ja1xuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudDpNb3VzZUV2ZW50KTp2b2lkXG5cdHtcbi8vICAgICAgICAgICAgaWYgKHN0YWdlLmRpc3BsYXlTdGF0ZSA9PSBTdGFnZURpc3BsYXlTdGF0ZS5GVUxMX1NDUkVFTikge1xuLy9cbi8vICAgICAgICAgICAgICAgIGlmIChtb3VzZUxvY2tlZCAmJiAobGFzdE1vdXNlWCAhPSAwIHx8IGxhc3RNb3VzZVkgIT0gMCkpIHtcbi8vICAgICAgICAgICAgICAgICAgICBlLm1vdmVtZW50WCArPSBsYXN0TW91c2VYO1xuLy8gICAgICAgICAgICAgICAgICAgIGUubW92ZW1lbnRZICs9IGxhc3RNb3VzZVk7XG4vLyAgICAgICAgICAgICAgICAgICAgbGFzdE1vdXNlWCA9IDA7XG4vLyAgICAgICAgICAgICAgICAgICAgbGFzdE1vdXNlWSA9IDA7XG4vLyAgICAgICAgICAgICAgICB9XG4vL1xuLy8gICAgICAgICAgICAgICAgbW91c2VMb2NrWCArPSBlLm1vdmVtZW50WDtcbi8vICAgICAgICAgICAgICAgIG1vdXNlTG9ja1kgKz0gZS5tb3ZlbWVudFk7XG4vL1xuLy8gICAgICAgICAgICAgICAgaWYgKCFzdGFnZS5tb3VzZUxvY2spIHtcbi8vICAgICAgICAgICAgICAgICAgICBzdGFnZS5tb3VzZUxvY2sgPSB0cnVlO1xuLy8gICAgICAgICAgICAgICAgICAgIGxhc3RNb3VzZVggPSBzdGFnZS5tb3VzZVggLSBzdGFnZS5zdGFnZVdpZHRoLzI7XG4vLyAgICAgICAgICAgICAgICAgICAgbGFzdE1vdXNlWSA9IHN0YWdlLm1vdXNlWSAtIHN0YWdlLnN0YWdlSGVpZ2h0LzI7XG4vLyAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFtb3VzZUxvY2tlZCkge1xuLy8gICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja2VkID0gdHJ1ZTtcbi8vICAgICAgICAgICAgICAgIH1cbi8vXG4vLyAgICAgICAgICAgICAgICAvL2Vuc3VyZSBib3VuZHMgZm9yIHRpbHRBbmdsZSBhcmUgbm90IGVjZWVkZWRcbi8vICAgICAgICAgICAgICAgIGlmIChtb3VzZUxvY2tZID4gY2FtZXJhQ29udHJvbGxlci5tYXhUaWx0QW5nbGUvMC4zKVxuLy8gICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja1kgPSBjYW1lcmFDb250cm9sbGVyLm1heFRpbHRBbmdsZS8wLjM7XG4vLyAgICAgICAgICAgICAgICBlbHNlIGlmIChtb3VzZUxvY2tZIDwgY2FtZXJhQ29udHJvbGxlci5taW5UaWx0QW5nbGUvMC4zKVxuLy8gICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja1kgPSBjYW1lcmFDb250cm9sbGVyLm1pblRpbHRBbmdsZS8wLjM7XG4vLyAgICAgICAgICAgIH1cblxuLy8gICAgICAgICAgICBpZiAoc3RhZ2UubW91c2VMb2NrKSB7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlID0gMC4zKm1vdXNlTG9ja1g7XG4vLyAgICAgICAgICAgICAgICBjYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZSA9IDAuMyptb3VzZUxvY2tZO1xuLy8gICAgICAgICAgICB9IGVsc2UgaWYgKG1vdmUpIHtcbi8vICAgICAgICAgICAgICAgIGNhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKHN0YWdlLm1vdXNlWCAtIGxhc3RNb3VzZVgpICsgbGFzdFBhbkFuZ2xlO1xuLy8gICAgICAgICAgICAgICAgY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKHN0YWdlLm1vdXNlWSAtIGxhc3RNb3VzZVkpICsgbGFzdFRpbHRBbmdsZTtcbi8vICAgICAgICAgICAgfVxuXG5cdFx0aWYgKHRoaXMubW92ZSkge1xuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlID0gMC4zKihldmVudC5jbGllbnRYIC0gdGhpcy5sYXN0TW91c2VYKSArIHRoaXMubGFzdFBhbkFuZ2xlO1xuXHRcdFx0dGhpcy5jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WSAtIHRoaXMubGFzdE1vdXNlWSkgKyB0aGlzLmxhc3RUaWx0QW5nbGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHdoZWVsIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VXaGVlbChldmVudDpNb3VzZVdoZWVsRXZlbnQpXG5cdHtcblx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgLT0gZXZlbnQud2hlZWxEZWx0YTtcblxuXHRcdGlmICh0aGlzLmNhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPCA0MDApXG5cdFx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPSA0MDA7XG5cdFx0ZWxzZSBpZiAodGhpcy5jYW1lcmFDb250cm9sbGVyLmRpc3RhbmNlID4gMTAwMDApXG5cdFx0XHR0aGlzLmNhbWVyYUNvbnRyb2xsZXIuZGlzdGFuY2UgPSAxMDAwMDtcblx0fVxuXG5cdC8qKlxuXHQgKiBLZXkgZG93biBsaXN0ZW5lciBmb3IgZnVsbHNjcmVlblxuXHQgKi9cbi8vICAgICAgICBwcml2YXRlIG9uS2V5RG93bihldmVudDpLZXlib2FyZEV2ZW50KTp2b2lkXG4vLyAgICAgICAge1xuLy8gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleUNvZGUpXG4vLyAgICAgICAgICAgIHtcbi8vICAgICAgICAgICAgICAgIGNhc2UgS2V5Ym9hcmQuU1BBQ0U6XG4vLyAgICAgICAgICAgICAgICAgICAgaWYgKHN0YWdlLmRpc3BsYXlTdGF0ZSA9PSBTdGFnZURpc3BsYXlTdGF0ZS5GVUxMX1NDUkVFTikge1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBzdGFnZS5kaXNwbGF5U3RhdGUgPSBTdGFnZURpc3BsYXlTdGF0ZS5OT1JNQUw7XG4vLyAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU47XG4vL1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tlZCA9IGZhbHNlO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICBtb3VzZUxvY2tYID0gY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZS8wLjM7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgIG1vdXNlTG9ja1kgPSBjYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZS8wLjM7XG4vLyAgICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgfVxuLy9cblxuXHQvKipcblx0ICogd2luZG93IGxpc3RlbmVyIGZvciByZXNpemUgZXZlbnRzXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzaXplKGV2ZW50OlVJRXZlbnQgPSBudWxsKTp2b2lkXG5cdHtcblx0XHR0aGlzLnZpZXcueSAgICAgICAgID0gMDtcblx0XHR0aGlzLnZpZXcueCAgICAgICAgID0gMDtcblx0XHR0aGlzLnZpZXcud2lkdGggICAgID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy52aWV3LmhlaWdodCAgICA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0fVxufVxuXG5jbGFzcyBGbGFyZU9iamVjdFxue1xuXHRwcml2YXRlIGZsYXJlU2l6ZTpudW1iZXIgPSAxNC40O1xuXG5cdHB1YmxpYyBiaWxsYm9hcmQ6QmlsbGJvYXJkO1xuXG5cdHB1YmxpYyBzaXplOm51bWJlcjtcblxuXHRwdWJsaWMgcG9zaXRpb246bnVtYmVyO1xuXG5cdHB1YmxpYyBvcGFjaXR5Om51bWJlcjtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKGJpdG1hcERhdGE6Qml0bWFwRGF0YSwgc2l6ZTpudW1iZXIsIHBvc2l0aW9uOm51bWJlciwgb3BhY2l0eTpudW1iZXIsIHNjZW5lOlNjZW5lKVxuXHR7XG5cdFx0dmFyIGJkOkJpdG1hcERhdGEgPSBuZXcgQml0bWFwRGF0YShiaXRtYXBEYXRhLndpZHRoLCBiaXRtYXBEYXRhLmhlaWdodCwgdHJ1ZSwgMHhGRkZGRkZGRik7XG5cdFx0YmQuY29weUNoYW5uZWwoYml0bWFwRGF0YSwgYml0bWFwRGF0YS5yZWN0LCBuZXcgUG9pbnQoKSwgQml0bWFwRGF0YUNoYW5uZWwuUkVELCBCaXRtYXBEYXRhQ2hhbm5lbC5BTFBIQSk7XG5cblx0XHR2YXIgYmlsbGJvYXJkTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKG5ldyBCaXRtYXBUZXh0dXJlKGJkLCBmYWxzZSkpO1xuXHRcdGJpbGxib2FyZE1hdGVyaWFsLmFscGhhID0gb3BhY2l0eS8xMDA7XG5cdFx0YmlsbGJvYXJkTWF0ZXJpYWwuYWxwaGFCbGVuZGluZyA9IHRydWU7XG5cdFx0Ly9iaWxsYm9hcmRNYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuTEFZRVI7XG5cblx0XHR0aGlzLmJpbGxib2FyZCA9IG5ldyBCaWxsYm9hcmQoYmlsbGJvYXJkTWF0ZXJpYWwpO1xuXHRcdHRoaXMuYmlsbGJvYXJkLndpZHRoID0gc2l6ZSp0aGlzLmZsYXJlU2l6ZTtcblx0XHR0aGlzLmJpbGxib2FyZC5oZWlnaHQgPSBzaXplKnRoaXMuZmxhcmVTaXplO1xuXHRcdHRoaXMuYmlsbGJvYXJkLnBpdm90ID0gbmV3IFZlY3RvcjNEKHNpemUqdGhpcy5mbGFyZVNpemUvMiwgc2l6ZSp0aGlzLmZsYXJlU2l6ZS8yLCAwKTtcblx0XHR0aGlzLmJpbGxib2FyZC5vcmllbnRhdGlvbk1vZGUgPSBPcmllbnRhdGlvbk1vZGUuQ0FNRVJBX1BMQU5FO1xuXHRcdHRoaXMuYmlsbGJvYXJkLmFsaWdubWVudE1vZGUgPSBBbGlnbm1lbnRNb2RlLlBJVk9UX1BPSU5UO1xuXHRcdHRoaXMuYmlsbGJvYXJkLnZpc2libGUgPSBmYWxzZTtcblx0XHR0aGlzLnNpemUgPSBzaXplO1xuXHRcdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHR0aGlzLm9wYWNpdHkgPSBvcGFjaXR5O1xuXG5cdFx0c2NlbmUuYWRkQ2hpbGQodGhpcy5iaWxsYm9hcmQpXG5cdH1cbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpXG57XG5cdG5ldyBJbnRlcm1lZGlhdGVfR2xvYmUoKTtcbn0iXX0=