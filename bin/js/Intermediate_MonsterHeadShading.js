///<reference path="../libs/stagegl-extensions.next.d.ts" />
/*
Monster Head example in Away3d
Demonstrates:
How to use the AssetLibrary to load an internal AWD model.
How to set custom material methods on a model.
How to setup soft shadows and multiple lightsources with a multipass texture
How to use a diffuse gradient method as a cheap way to simulate sub-surface scattering
Code by Rob Bateman & David Lenaerts
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk
david.lenaerts@gmail.com
http://www.derschmale.com
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
var examples;
(function (examples) {
    var Camera = away.entities.Camera;
    var View = away.containers.View;
    var Scene = away.containers.Scene;
    var HoverController = away.controllers.HoverController;

    var AssetEvent = away.events.AssetEvent;
    var Event = away.events.Event;
    var LoaderEvent = away.events.LoaderEvent;
    var ProgressEvent = away.events.ProgressEvent;
    var Vector3D = away.geom.Vector3D;
    var AssetLibrary = away.library.AssetLibrary;
    var AssetLoaderContext = away.library.AssetLoaderContext;
    var AssetType = away.library.AssetType;
    var DirectionalLight = away.entities.DirectionalLight;
    var PointLight = away.entities.PointLight;

    var AWDParser = away.parsers.AWDParser;

    var TriangleMethodMaterial = away.materials.TriangleMethodMaterial;
    var TriangleMaterialMode = away.materials.TriangleMaterialMode;
    var StaticLightPicker = away.materials.StaticLightPicker;
    var SpecularFresnelMethod = away.materials.SpecularFresnelMethod;
    var ShadowSoftMethod = away.materials.ShadowSoftMethod;
    var URLLoader = away.net.URLLoader;
    var URLLoaderDataFormat = away.net.URLLoaderDataFormat;
    var URLRequest = away.net.URLRequest;
    var DefaultRenderer = away.render.DefaultRenderer;
    var ImageTexture = away.textures.ImageTexture;
    var SpecularBitmapTexture = away.textures.SpecularBitmapTexture;
    var Cast = away.utils.Cast;

    var Intermediate_MonsterHeadShading = (function () {
        /**
        * Constructor
        */
        function Intermediate_MonsterHeadShading() {
            //textures
            this._textureStrings = Array("monsterhead_diffuse.jpg", "monsterhead_specular.jpg", "monsterhead_normals.jpg");
            this._textureDictionary = new Object();
            this._advancedMethod = true;
            //loading variables
            this._numTextures = 0;
            this._currentTexture = 0;
            this._n = 0;
            //root filepath for asset loading
            this._assetsRoot = "assets/monsterhead/";
            //navigation variables
            this._move = false;
            this.time = 0;
            this._shadowRange = 3;
            this._lightDirection = 120 * Math.PI / 180;
            this._lightElevation = 30 * Math.PI / 180;
            this.init();
        }
        /**
        * Global initialise function
        */
        Intermediate_MonsterHeadShading.prototype.init = function () {
            this.initEngine();
            this.initLights();
            this.initListeners();

            //kickoff asset loading
            this._n = 0;
            this._numTextures = this._textureStrings.length;
            this.load(this._textureStrings[this._n]);
        };

        /**
        * Initialise the engine
        */
        Intermediate_MonsterHeadShading.prototype.initEngine = function () {
            this._scene = new Scene();

            this._camera = new Camera();
            this._camera.projection.near = 20;
            this._camera.projection.far = 1000;

            this._view = new View(new DefaultRenderer(), this._scene, this._camera);

            //setup controller to be used on the camera
            this._cameraController = new HoverController(this._camera, null, 225, 10, 800);
            this._cameraController.yFactor = 1;
        };

        /**
        * Initialise the lights in a scene
        */
        Intermediate_MonsterHeadShading.prototype.initLights = function () {
            //var initialAzimuth:number = .6;
            //var initialArc:number = 2;
            var x = Math.sin(this._lightElevation) * Math.cos(this._lightDirection);
            var y = -Math.cos(this._lightElevation);
            var z = Math.sin(this._lightElevation) * Math.sin(this._lightDirection);

            // main light casting the shadows
            this._directionalLight = new DirectionalLight(x, y, z);
            this._directionalLight.color = 0xffeedd;
            this._directionalLight.ambient = 1;
            this._directionalLight.specular = .3;
            this._directionalLight.ambientColor = 0x101025;
            this._directionalLight.castsShadows = true;
            this._directionalLight.shadowMapper.lightOffset = 1000;
            this._scene.addChild(this._directionalLight);

            // blue point light coming from the right
            this._blueLight = new PointLight();
            this._blueLight.color = 0x4080ff;
            this._blueLight.x = 3000;
            this._blueLight.z = 700;
            this._blueLight.y = 20;
            this._scene.addChild(this._blueLight);

            // red light coming from the left
            this._redLight = new PointLight();
            this._redLight.color = 0x802010;
            this._redLight.x = -2000;
            this._redLight.z = 800;
            this._redLight.y = -400;
            this._scene.addChild(this._redLight);

            this._lightPicker = new StaticLightPicker([this._directionalLight, this._blueLight, this._redLight]);
        };

        /**
        * Initialise the listeners
        */
        Intermediate_MonsterHeadShading.prototype.initListeners = function () {
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

            this.onResize();

            this.parseAWDDelegate = function (event) {
                return _this.parseAWD(event);
            };
            this.parseBitmapDelegate = function (event) {
                return _this.parseBitmap(event);
            };
            this.loadProgressDelegate = function (event) {
                return _this.loadProgress(event);
            };
            this.onBitmapCompleteDelegate = function (event) {
                return _this.onBitmapComplete(event);
            };
            this.onAssetCompleteDelegate = function (event) {
                return _this.onAssetComplete(event);
            };
            this.onResourceCompleteDelegate = function (event) {
                return _this.onResourceComplete(event);
            };

            this.timer = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            this.timer.start();
        };

        /**
        * Updates the direction of the directional lightsource
        */
        Intermediate_MonsterHeadShading.prototype.updateDirection = function () {
            this._directionalLight.direction = new Vector3D(Math.sin(this._lightElevation) * Math.cos(this._lightDirection), -Math.cos(this._lightElevation), Math.sin(this._lightElevation) * Math.sin(this._lightDirection));
        };

        Intermediate_MonsterHeadShading.prototype.updateRange = function () {
            this._softShadowMethod.range = this._shadowRange;
        };

        /**
        * Global binary file loader
        */
        Intermediate_MonsterHeadShading.prototype.load = function (url) {
            var loader = new URLLoader();
            switch (url.substring(url.length - 3)) {
                case "AWD":
                case "awd":
                    loader.dataFormat = URLLoaderDataFormat.ARRAY_BUFFER;
                    this._loadingText = "Loading Model";
                    loader.addEventListener(Event.COMPLETE, this.parseAWDDelegate);
                    break;
                case "png":
                case "jpg":
                    loader.dataFormat = URLLoaderDataFormat.BLOB;
                    this._currentTexture++;
                    this._loadingText = "Loading Textures";
                    loader.addEventListener(Event.COMPLETE, this.parseBitmapDelegate);
                    break;
            }

            loader.addEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
            loader.load(new URLRequest(this._assetsRoot + url));
        };

        /**
        * Display current load
        */
        Intermediate_MonsterHeadShading.prototype.loadProgress = function (e) {
            //TODO work out why the casting on ProgressEvent fails for bytesLoaded and bytesTotal properties
            var P = Math.floor(e["bytesLoaded"] / e["bytesTotal"] * 100);
            if (P != 100) {
                console.log(this._loadingText + '\n' + ((this._loadingText == "Loading Model") ? Math.floor((e["bytesLoaded"] / 1024) << 0) + 'kb | ' + Math.floor((e["bytesTotal"] / 1024) << 0) + 'kb' : this._currentTexture + ' | ' + this._numTextures));
            }
        };

        /**
        * Parses the Bitmap file
        */
        Intermediate_MonsterHeadShading.prototype.parseBitmap = function (e) {
            var urlLoader = e.target;
            var image = away.parsers.ParserUtils.blobToImage(urlLoader.data);
            image.onload = this.onBitmapCompleteDelegate;
            urlLoader.removeEventListener(Event.COMPLETE, this.parseBitmapDelegate);
            urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
            urlLoader = null;
        };

        /**
        * Parses the AWD file
        */
        Intermediate_MonsterHeadShading.prototype.parseAWD = function (e) {
            console.log("Parsing Data");
            var urlLoader = e.target;

            //setup parser
            AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
            AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, this.onResourceCompleteDelegate);
            AssetLibrary.loadData(urlLoader.data, new AssetLoaderContext(false), null, new AWDParser());

            urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
            urlLoader.removeEventListener(Event.COMPLETE, this.parseAWDDelegate);
            urlLoader = null;
        };

        /**
        * Listener for bitmap complete event on loader
        */
        Intermediate_MonsterHeadShading.prototype.onBitmapComplete = function (e) {
            var image = e.target;
            image.onload = null;

            //create bitmap texture in dictionary
            if (!this._textureDictionary[this._textureStrings[this._n]])
                this._textureDictionary[this._textureStrings[this._n]] = (this._n == 1) ? new SpecularBitmapTexture(Cast.bitmapData(image)) : new ImageTexture(image, true);

            this._n++;

            //switch to next teture set
            if (this._n < this._textureStrings.length) {
                this.load(this._textureStrings[this._n]);
            } else {
                this.load("MonsterHead.awd");
            }
        };

        /**
        * Navigation and render loop
        */
        Intermediate_MonsterHeadShading.prototype.onEnterFrame = function (dt) {
            this._view.render();
        };

        /**
        * Listener for asset complete event on loader
        */
        Intermediate_MonsterHeadShading.prototype.onAssetComplete = function (event) {
            if (event.asset.assetType == AssetType.MESH) {
                this._headModel = event.asset;
                this._headModel.geometry.scale(4);
                this._headModel.y = -20;
                this._scene.addChild(this._headModel);
            }
        };

        /**
        * Triggered once all resources are loaded
        */
        Intermediate_MonsterHeadShading.prototype.onResourceComplete = function (e) {
            AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
            AssetLibrary.removeEventListener(LoaderEvent.RESOURCE_COMPLETE, this.onResourceCompleteDelegate);

            //setup custom multipass material
            this._headMaterial = new TriangleMethodMaterial(this._textureDictionary["monsterhead_diffuse.jpg"]);
            this._headMaterial.materialMode = TriangleMaterialMode.MULTI_PASS;
            this._headMaterial.mipmap = false;
            this._headMaterial.normalMap = this._textureDictionary["monsterhead_normals.jpg"];
            this._headMaterial.lightPicker = this._lightPicker;
            this._headMaterial.ambientColor = 0x303040;

            // create soft shadows with a lot of samples for best results. With the current method setup, any more samples would fail to compile
            this._softShadowMethod = new ShadowSoftMethod(this._directionalLight, 20);
            this._softShadowMethod.range = this._shadowRange; // the sample radius defines the softness of the shadows
            this._softShadowMethod.epsilon = .1;
            this._headMaterial.shadowMethod = this._softShadowMethod;

            // create specular reflections that are stronger from the sides
            this._fresnelMethod = new SpecularFresnelMethod(true);
            this._fresnelMethod.fresnelPower = 3;
            this._headMaterial.specularMethod = this._fresnelMethod;
            this._headMaterial.specularMap = this._textureDictionary["monsterhead_specular.jpg"];
            this._headMaterial.specular = 3;
            this._headMaterial.gloss = 10;

            //apply material to head model
            var len = this._headModel.subMeshes.length;
            for (var i = 0; i < len; i++)
                this._headModel.subMeshes[i].material = this._headMaterial;

            away.library.AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, away.utils.Delegate.create(this, this.onExtraResourceComplete));

            //diffuse gradient texture
            away.library.AssetLibrary.load(new away.net.URLRequest("assets/diffuseGradient.jpg"));
        };

        /**
        * Triggered once extra resources are loaded
        */
        Intermediate_MonsterHeadShading.prototype.onExtraResourceComplete = function (event) {
            switch (event.url) {
                case "assets/diffuseGradient.jpg":
                    break;
            }
        };

        /**
        * Mouse down listener for navigation
        */
        Intermediate_MonsterHeadShading.prototype.onMouseDown = function (event) {
            this._lastPanAngle = this._cameraController.panAngle;
            this._lastTiltAngle = this._cameraController.tiltAngle;
            this._lastMouseX = event.clientX;
            this._lastMouseY = event.clientY;
            this._move = true;
        };

        /**
        * Mouse up listener for navigation
        */
        Intermediate_MonsterHeadShading.prototype.onMouseUp = function (event) {
            this._move = false;
        };

        /**
        * Mouse move listener for mouseLock
        */
        Intermediate_MonsterHeadShading.prototype.onMouseMove = function (event) {
            if (this._move) {
                this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
                this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
            }
        };

        /**
        * window listener for resize events
        */
        Intermediate_MonsterHeadShading.prototype.onResize = function (event) {
            if (typeof event === "undefined") { event = null; }
            this._view.y = 0;
            this._view.x = 0;
            this._view.width = window.innerWidth;
            this._view.height = window.innerHeight;
        };
        return Intermediate_MonsterHeadShading;
    })();
    examples.Intermediate_MonsterHeadShading = Intermediate_MonsterHeadShading;
})(examples || (examples = {}));

window.onload = function () {
    new examples.Intermediate_MonsterHeadShading();
};
//# sourceMappingURL=Intermediate_MonsterHeadShading.js.map
