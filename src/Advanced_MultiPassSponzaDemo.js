/*

Crytek Sponza demo using multipass materials in Away3D

Demonstrates:

How to apply Multipass materials to a model
How to enable cascading shadow maps on a multipass material.
How to setup multiple lightsources, shadows and fog effects all in the same scene.
How to apply specular, normal and diffuse maps to an AWD model.

Code by Rob Bateman & David Lenaerts
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk
david.lenaerts@gmail.com
http://www.derschmale.com

Model re-modeled by Frank Meinl at Crytek with inspiration from Marko Dabrovic's original, converted to AWD by LoTH
contact@crytek.com
http://www.crytek.com/cryengine/cryengine3/downloads
3dflashlo@gmail.com
http://3dflashlo.wordpress.com

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
var Event = require("awayjs-core/lib/events/Event");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var ProgressEvent = require("awayjs-core/lib/events/ProgressEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var UVTransform = require("awayjs-core/lib/geom/UVTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/library/AssetLoaderContext");
var AssetType = require("awayjs-core/lib/library/AssetType");
var URLLoader = require("awayjs-core/lib/net/URLLoader");
var URLLoaderDataFormat = require("awayjs-core/lib/net/URLLoaderDataFormat");
var URLRequest = require("awayjs-core/lib/net/URLRequest");
var ParserUtils = require("awayjs-core/lib/parsers/ParserUtils");
var ImageTexture = require("awayjs-core/lib/textures/ImageTexture");
var SpecularBitmapTexture = require("awayjs-core/lib/textures/SpecularBitmapTexture");
var Keyboard = require("awayjs-core/lib/ui/Keyboard");
var RequestAnimationFrame = require("awayjs-core/lib/utils/RequestAnimationFrame");
var Loader = require("awayjs-display/lib/containers/Loader");
var View = require("awayjs-display/lib/containers/View");
var FirstPersonController = require("awayjs-display/lib/controllers/FirstPersonController");
var Geometry = require("awayjs-display/lib/base/Geometry");
var BlendMode = require("awayjs-display/lib/base/BlendMode");
var Mesh = require("awayjs-display/lib/entities/Mesh");
var Skybox = require("awayjs-display/lib/entities/Skybox");
var DirectionalLight = require("awayjs-display/lib/entities/DirectionalLight");
var PointLight = require("awayjs-display/lib/entities/PointLight");
var StaticLightPicker = require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
var PrimitivePlanePrefab = require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
var Cast = require("awayjs-display/lib/utils/Cast");
var Merge = require("awayjs-renderergl/lib/tools/commands/Merge");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var MethodMaterial = require("awayjs-methodmaterials/lib/MethodMaterial");
var MethodMaterialMode = require("awayjs-methodmaterials/lib/MethodMaterialMode");
var MethodRendererPool = require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
var ShadowSoftMethod = require("awayjs-methodmaterials/lib/methods/ShadowSoftMethod");
var EffectFogMethod = require("awayjs-methodmaterials/lib/methods/EffectFogMethod");
var AWDParser = require("awayjs-parsers/lib/AWDParser");
var Advanced_MultiPassSponzaDemo = (function () {
    /**
     * Constructor
     */
    function Advanced_MultiPassSponzaDemo() {
        //root filepath for asset loading
        this._assetsRoot = "assets/";
        //default material data strings
        this._materialNameStrings = Array("arch", "Material__298", "bricks", "ceiling", "chain", "column_a", "column_b", "column_c", "fabric_g", "fabric_c", "fabric_f", "details", "fabric_d", "fabric_a", "fabric_e", "flagpole", "floor", "16___Default", "Material__25", "roof", "leaf", "vase", "vase_hanging", "Material__57", "vase_round");
        //private const diffuseTextureStrings:Array<string> = Array<string>(["arch_diff.atf", "background.atf", "bricks_a_diff.atf", "ceiling_a_diff.atf", "chain_texture.png", "column_a_diff.atf", "column_b_diff.atf", "column_c_diff.atf", "curtain_blue_diff.atf", "curtain_diff.atf", "curtain_green_diff.atf", "details_diff.atf", "fabric_blue_diff.atf", "fabric_diff.atf", "fabric_green_diff.atf", "flagpole_diff.atf", "floor_a_diff.atf", "gi_flag.atf", "lion.atf", "roof_diff.atf", "thorn_diff.png", "vase_dif.atf", "vase_hanging.atf", "vase_plant.png", "vase_round.atf"]);
        //private const normalTextureStrings:Array<string> = Array<string>(["arch_ddn.atf", "background_ddn.atf", "bricks_a_ddn.atf", null,                "chain_texture_ddn.atf", "column_a_ddn.atf", "column_b_ddn.atf", "column_c_ddn.atf", null,                   null,               null,                     null,               null,                   null,              null,                    null,                null,               null,          "lion2_ddn.atf", null,       "thorn_ddn.atf", "vase_ddn.atf",  null,               null,             "vase_round_ddn.atf"]);
        //private const specularTextureStrings:Array<string> = Array<string>(["arch_spec.atf", null,            "bricks_a_spec.atf", "ceiling_a_spec.atf", null,                "column_a_spec.atf", "column_b_spec.atf", "column_c_spec.atf", "curtain_spec.atf",      "curtain_spec.atf", "curtain_spec.atf",       "details_spec.atf", "fabric_spec.atf",      "fabric_spec.atf", "fabric_spec.atf",       "flagpole_spec.atf", "floor_a_spec.atf", null,          null,       null,            "thorn_spec.atf", null,           null,               "vase_plant_spec.atf", "vase_round_spec.atf"]);
        this._diffuseTextureStrings = Array("arch_diff.jpg", "background.jpg", "bricks_a_diff.jpg", "ceiling_a_diff.jpg", "chain_texture.png", "column_a_diff.jpg", "column_b_diff.jpg", "column_c_diff.jpg", "curtain_blue_diff.jpg", "curtain_diff.jpg", "curtain_green_diff.jpg", "details_diff.jpg", "fabric_blue_diff.jpg", "fabric_diff.jpg", "fabric_green_diff.jpg", "flagpole_diff.jpg", "floor_a_diff.jpg", "gi_flag.jpg", "lion.jpg", "roof_diff.jpg", "thorn_diff.png", "vase_dif.jpg", "vase_hanging.jpg", "vase_plant.png", "vase_round.jpg");
        this._normalTextureStrings = Array("arch_ddn.jpg", "background_ddn.jpg", "bricks_a_ddn.jpg", null, "chain_texture_ddn.jpg", "column_a_ddn.jpg", "column_b_ddn.jpg", "column_c_ddn.jpg", null, null, null, null, null, null, null, null, null, null, "lion2_ddn.jpg", null, "thorn_ddn.jpg", "vase_ddn.jpg", null, null, "vase_round_ddn.jpg");
        this._specularTextureStrings = Array("arch_spec.jpg", null, "bricks_a_spec.jpg", "ceiling_a_spec.jpg", null, "column_a_spec.jpg", "column_b_spec.jpg", "column_c_spec.jpg", "curtain_spec.jpg", "curtain_spec.jpg", "curtain_spec.jpg", "details_spec.jpg", "fabric_spec.jpg", "fabric_spec.jpg", "fabric_spec.jpg", "flagpole_spec.jpg", "floor_a_spec.jpg", null, null, null, "thorn_spec.jpg", null, null, "vase_plant_spec.jpg", "vase_round_spec.jpg");
        this._numTexStrings = Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        this._meshReference = new Array(25);
        //flame data objects
        this._flameData = Array(new FlameVO(new Vector3D(-625, 165, 219), 0xffaa44), new FlameVO(new Vector3D(485, 165, 219), 0xffaa44), new FlameVO(new Vector3D(-625, 165, -148), 0xffaa44), new FlameVO(new Vector3D(485, 165, -148), 0xffaa44));
        //material dictionaries to hold instances
        this._textureDictionary = new Object();
        this._multiMaterialDictionary = new Object();
        this._singleMaterialDictionary = new Object();
        //private meshDictionary:Dictionary = new Dictionary();
        this.vaseMeshes = new Array();
        this.poleMeshes = new Array();
        this.colMeshes = new Array();
        //gui variables
        this._singlePassMaterial = false;
        this._multiPassMaterial = true;
        this._cascadeLevels = 3;
        this._shadowOptions = "PCF";
        this._depthMapSize = 2048;
        this._lightDirection = Math.PI / 2;
        this._lightElevation = Math.PI / 18;
        this._lights = new Array();
        this._numTextures = 0;
        this._currentTexture = 0;
        this._n = 0;
        //scene variables
        this._meshes = new Array();
        //rotation variables
        this._move = false;
        //movement variables
        this._drag = 0.5;
        this._walkIncrement = 10;
        this._strafeIncrement = 10;
        this._walkSpeed = 0;
        this._strafeSpeed = 0;
        this._walkAcceleration = 0;
        this._strafeAcceleration = 0;
        this._time = 0;
        this.init();
    }
    /**
     * Global initialise function
     */
    Advanced_MultiPassSponzaDemo.prototype.init = function () {
        this.initEngine();
        this.initLights();
        this.initListeners();
        //count textures
        this._n = 0;
        this._loadingTextureStrings = this._diffuseTextureStrings;
        this.countNumTextures();
        //kickoff asset loading
        this._n = 0;
        this._loadingTextureStrings = this._diffuseTextureStrings;
        this.load(this._loadingTextureStrings[this._n]);
    };
    /**
     * Initialise the engine
     */
    Advanced_MultiPassSponzaDemo.prototype.initEngine = function () {
        //create the view
        this._view = new View(new DefaultRenderer(MethodRendererPool));
        this._view.camera.y = 150;
        this._view.camera.z = 0;
        //setup controller to be used on the camera
        this._cameraController = new FirstPersonController(this._view.camera, 90, 0, -80, 80);
    };
    /**
     * Initialise the lights
     */
    Advanced_MultiPassSponzaDemo.prototype.initLights = function () {
        //create lights array
        this._lights = new Array();
        //create global directional light
        //			this._cascadeShadowMapper = new CascadeShadowMapper(3);
        //			this._cascadeShadowMapper.lightOffset = 20000;
        this._directionalLight = new DirectionalLight(-1, -15, 1);
        //			this._directionalLight.shadowMapper = this._cascadeShadowMapper;
        this._directionalLight.color = 0xeedddd;
        this._directionalLight.ambient = .35;
        this._directionalLight.ambientColor = 0x808090;
        this._view.scene.addChild(this._directionalLight);
        this._lights.push(this._directionalLight);
        this.updateDirection();
        //create flame lights
        var flameVO;
        var len = this._flameData.length;
        for (var i = 0; i < len; i++) {
            flameVO = this._flameData[i];
            var light = flameVO.light = new PointLight();
            light.radius = 200;
            light.fallOff = 600;
            light.color = flameVO.color;
            light.y = 10;
            this._lights.push(light);
        }
        //create our global light picker
        this._lightPicker = new StaticLightPicker(this._lights);
        this._baseShadowMethod = new ShadowSoftMethod(this._directionalLight, 10, 5);
        //			this._baseShadowMethod = new ShadowFilteredMethod(this._directionalLight);
        //create our global fog method
        this._fogMethod = new EffectFogMethod(0, 4000, 0x9090e7);
        //			this._cascadeMethod = new ShadowCascadeMethod(this._baseShadowMethod);
    };
    /**
     * Initialise the scene objects
     */
    Advanced_MultiPassSponzaDemo.prototype.initObjects = function () {
        //create skybox
        this._view.scene.addChild(new Skybox(this._skyMap));
        //create flame meshes
        this._flameGeometry = new PrimitivePlanePrefab(40, 80, 1, 1, false, true);
        var flameVO;
        var len = this._flameData.length;
        for (var i = 0; i < len; i++) {
            flameVO = this._flameData[i];
            var mesh = flameVO.mesh = this._flameGeometry.getNewObject();
            mesh.material = this._flameMaterial;
            mesh.transform.position = flameVO.position;
            mesh.subMeshes[0].uvTransform = new UVTransform();
            mesh.subMeshes[0].uvTransform.scaleU = 1 / 16;
            this._view.scene.addChild(mesh);
            mesh.addChild(flameVO.light);
        }
    };
    /**
     * Initialise the listeners
     */
    Advanced_MultiPassSponzaDemo.prototype.initListeners = function () {
        var _this = this;
        //add listeners
        window.onresize = function (event) { return _this.onResize(event); };
        document.onmousedown = function (event) { return _this.onMouseDown(event); };
        document.onmouseup = function (event) { return _this.onMouseUp(event); };
        document.onmousemove = function (event) { return _this.onMouseMove(event); };
        document.onkeydown = function (event) { return _this.onKeyDown(event); };
        document.onkeyup = function (event) { return _this.onKeyUp(event); };
        this.onResize();
        this.parseAWDDelegate = function (event) { return _this.parseAWD(event); };
        this.parseBitmapDelegate = function (event) { return _this.parseBitmap(event); };
        this.loadProgressDelegate = function (event) { return _this.loadProgress(event); };
        this.onBitmapCompleteDelegate = function (event) { return _this.onBitmapComplete(event); };
        this.onAssetCompleteDelegate = function (event) { return _this.onAssetComplete(event); };
        this.onResourceCompleteDelegate = function (event) { return _this.onResourceComplete(event); };
        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    };
    /**
     * Updates the material mode between single pass and multi pass
     */
    //		private updateMaterialPass(materialDictionary:Dictionary)
    //		{
    //			var mesh:Mesh;
    //			var name:string;
    //			var len:number = this._meshes.length;
    //			for (var i:number = 0; i < len; i++) {
    //				mesh = this._meshes[i];
    //				if (mesh.name == "sponza_04" || mesh.name == "sponza_379")
    //					continue;
    //				name = mesh.material.name;
    //				var textureIndex:number = this._materialNameStrings.indexOf(name);
    //				if (textureIndex == -1 || textureIndex >= this._materialNameStrings.length)
    //					continue;
    //
    //				mesh.material = materialDictionary[name];
    //			}
    //		}
    /**
     * Updates the direction of the directional lightsource
     */
    Advanced_MultiPassSponzaDemo.prototype.updateDirection = function () {
        this._directionalLight.direction = new Vector3D(Math.sin(this._lightElevation) * Math.cos(this._lightDirection), -Math.cos(this._lightElevation), Math.sin(this._lightElevation) * Math.sin(this._lightDirection));
    };
    /**
     * Count the total number of textures to be loaded
     */
    Advanced_MultiPassSponzaDemo.prototype.countNumTextures = function () {
        this._numTextures++;
        while (this._n++ < this._loadingTextureStrings.length - 1)
            if (this._loadingTextureStrings[this._n])
                break;
        //switch to next teture set
        if (this._n < this._loadingTextureStrings.length) {
            this.countNumTextures();
        }
        else if (this._loadingTextureStrings == this._diffuseTextureStrings) {
            this._n = 0;
            this._loadingTextureStrings = this._normalTextureStrings;
            this.countNumTextures();
        }
        else if (this._loadingTextureStrings == this._normalTextureStrings) {
            this._n = 0;
            this._loadingTextureStrings = this._specularTextureStrings;
            this.countNumTextures();
        }
    };
    /**
     * Global binary file loader
     */
    Advanced_MultiPassSponzaDemo.prototype.load = function (url) {
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
                url = "sponza/" + url;
                break;
        }
        loader.addEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
        var urlReq = new URLRequest(this._assetsRoot + url);
        loader.load(urlReq);
    };
    /**
     * Display current load
     */
    Advanced_MultiPassSponzaDemo.prototype.loadProgress = function (e) {
        //TODO work out why the casting on ProgressEvent fails for bytesLoaded and bytesTotal properties
        var P = Math.floor(e["bytesLoaded"] / e["bytesTotal"] * 100);
        if (P != 100) {
            console.log(this._loadingText + '\n' + ((this._loadingText == "Loading Model") ? Math.floor((e["bytesLoaded"] / 1024) << 0) + 'kb | ' + Math.floor((e["bytesTotal"] / 1024) << 0) + 'kb' : this._currentTexture + ' | ' + this._numTextures));
        }
    };
    /**
     * Parses the ATF file
     */
    //		private onATFComplete(e:Event)
    //		{
    //            var loader:URLLoader = URLLoader(e.target);
    //            loader.removeEventListener(Event.COMPLETE, this.onATFComplete);
    //
    //			if (!this._textureDictionary[this._loadingTextureStrings[this._n]])
    //			{
    //				this._textureDictionary[this._loadingTextureStrings[this._n]] = new ATFTexture(loader.data);
    //			}
    //
    //            loader.data = null;
    //            loader.close();
    //			loader = null;
    //
    //
    //			//skip null textures
    //			while (this._n++ < this._loadingTextureStrings.length - 1)
    //				if (this._loadingTextureStrings[this._n])
    //					break;
    //
    //			//switch to next teture set
    //            if (this._n < this._loadingTextureStrings.length) {
    //				this.load(this._loadingTextureStrings[this._n]);
    //			} else if (this._loadingTextureStrings == this._diffuseTextureStrings) {
    //				this._n = 0;
    //				this._loadingTextureStrings = this._normalTextureStrings;
    //				this.load(this._loadingTextureStrings[this._n]);
    //			} else if (this._loadingTextureStrings == this._normalTextureStrings) {
    //				this._n = 0;
    //				this._loadingTextureStrings = this._specularTextureStrings;
    //				this.load(this._loadingTextureStrings[this._n]);
    //			} else {
    //				this.load("sponza/sponza.awd");
    //            }
    //        }
    /**
     * Parses the Bitmap file
     */
    Advanced_MultiPassSponzaDemo.prototype.parseBitmap = function (e) {
        var urlLoader = e.target;
        var image = ParserUtils.blobToImage(urlLoader.data);
        image.onload = this.onBitmapCompleteDelegate;
        urlLoader.removeEventListener(Event.COMPLETE, this.parseBitmapDelegate);
        urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
        urlLoader = null;
    };
    /**
     * Listener for bitmap complete event on loader
     */
    Advanced_MultiPassSponzaDemo.prototype.onBitmapComplete = function (e) {
        var image = e.target;
        image.onload = null;
        //create bitmap texture in dictionary
        if (!this._textureDictionary[this._loadingTextureStrings[this._n]])
            this._textureDictionary[this._loadingTextureStrings[this._n]] = (this._loadingTextureStrings == this._specularTextureStrings) ? new SpecularBitmapTexture(Cast.bitmapData(image)) : new ImageTexture(image);
        while (this._n++ < this._loadingTextureStrings.length - 1)
            if (this._loadingTextureStrings[this._n])
                break;
        //switch to next teture set
        if (this._n < this._loadingTextureStrings.length) {
            this.load(this._loadingTextureStrings[this._n]);
        }
        else if (this._loadingTextureStrings == this._diffuseTextureStrings) {
            this._n = 0;
            this._loadingTextureStrings = this._normalTextureStrings;
            this.load(this._loadingTextureStrings[this._n]);
        }
        else if (this._loadingTextureStrings == this._normalTextureStrings) {
            this._n = 0;
            this._loadingTextureStrings = this._specularTextureStrings;
            this.load(this._loadingTextureStrings[this._n]);
        }
        else {
            this.load("sponza/sponza.awd");
        }
    };
    /**
     * Parses the AWD file
     */
    Advanced_MultiPassSponzaDemo.prototype.parseAWD = function (e) {
        console.log("Parsing Data");
        var urlLoader = e.target;
        var loader = new Loader(false);
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, this.onResourceCompleteDelegate);
        loader.loadData(urlLoader.data, new AssetLoaderContext(false), null, new AWDParser());
        urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
        urlLoader.removeEventListener(Event.COMPLETE, this.parseAWDDelegate);
        urlLoader = null;
    };
    /**
     * Listener for asset complete event on loader
     */
    Advanced_MultiPassSponzaDemo.prototype.onAssetComplete = function (event) {
        if (event.asset.assetType == AssetType.MESH) {
            //store meshes
            this._meshes.push(event.asset);
        }
    };
    /**
     * Triggered once all resources are loaded
     */
    Advanced_MultiPassSponzaDemo.prototype.onResourceComplete = function (e) {
        var _this = this;
        var merge = new Merge(false, false, true);
        var loader = e.target;
        loader.removeEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
        loader.removeEventListener(LoaderEvent.RESOURCE_COMPLETE, this.onResourceCompleteDelegate);
        //reassign materials
        var mesh;
        var name;
        var len = this._meshes.length;
        for (var i = 0; i < len; i++) {
            mesh = this._meshes[i];
            if (mesh.name == "sponza_04" || mesh.name == "sponza_379")
                continue;
            var num = Number(mesh.name.substring(7));
            name = mesh.material.name;
            if (name == "column_c" && (num < 22 || num > 33))
                continue;
            var colNum = (num - 125);
            if (name == "column_b") {
                if (colNum >= 0 && colNum < 132 && (colNum % 11) < 10) {
                    this.colMeshes.push(mesh);
                    continue;
                }
                else {
                    this.colMeshes.push(mesh);
                    var colMerge = new Merge();
                    var colMesh = new Mesh(new Geometry());
                    colMerge.applyToMeshes(colMesh, this.colMeshes);
                    mesh = colMesh;
                    this.colMeshes = new Array();
                }
            }
            var vaseNum = (num - 334);
            if (name == "vase_hanging" && (vaseNum % 9) < 5) {
                if (vaseNum >= 0 && vaseNum < 370 && (vaseNum % 9) < 4) {
                    this.vaseMeshes.push(mesh);
                    continue;
                }
                else {
                    this.vaseMeshes.push(mesh);
                    var vaseMerge = new Merge();
                    var vaseMesh = new Mesh(new Geometry());
                    vaseMerge.applyToMeshes(vaseMesh, this.vaseMeshes);
                    mesh = vaseMesh;
                    this.vaseMeshes = new Array();
                }
            }
            var poleNum = num - 290;
            if (name == "flagpole") {
                if (poleNum >= 0 && poleNum < 320 && (poleNum % 3) < 2) {
                    this.poleMeshes.push(mesh);
                    continue;
                }
                else if (poleNum >= 0) {
                    this.poleMeshes.push(mesh);
                    var poleMerge = new Merge();
                    var poleMesh = new Mesh(new Geometry());
                    poleMerge.applyToMeshes(poleMesh, this.poleMeshes);
                    mesh = poleMesh;
                    this.poleMeshes = new Array();
                }
            }
            if (name == "flagpole" && (num == 260 || num == 261 || num == 263 || num == 265 || num == 268 || num == 269 || num == 271 || num == 273))
                continue;
            var textureIndex = this._materialNameStrings.indexOf(name);
            if (textureIndex == -1 || textureIndex >= this._materialNameStrings.length)
                continue;
            this._numTexStrings[textureIndex]++;
            var textureName = this._diffuseTextureStrings[textureIndex];
            var normalTextureName;
            var specularTextureName;
            //				//store single pass materials for use later
            //				var singleMaterial:MethodMaterial = this._singleMaterialDictionary[name];
            //
            //				if (!singleMaterial) {
            //
            //					//create singlepass material
            //					singleMaterial = new MethodMaterial(this._textureDictionary[textureName]);
            //
            //					singleMaterial.name = name;
            //					singleMaterial.lightPicker = this._lightPicker;
            //					singleMaterial.addMethod(this._fogMethod);
            //					singleMaterial.mipmap = true;
            //					singleMaterial.repeat = true;
            //					singleMaterial.specular = 2;
            //
            //					//use alpha transparancy if texture is png
            //					if (textureName.substring(textureName.length - 3) == "png")
            //						singleMaterial.alphaThreshold = 0.5;
            //
            //					//add normal map if it exists
            //					normalTextureName = this._normalTextureStrings[textureIndex];
            //					if (normalTextureName)
            //						singleMaterial.normalMap = this._textureDictionary[normalTextureName];
            //
            //					//add specular map if it exists
            //					specularTextureName = this._specularTextureStrings[textureIndex];
            //					if (specularTextureName)
            //						singleMaterial.specularMap = this._textureDictionary[specularTextureName];
            //
            //					this._singleMaterialDictionary[name] = singleMaterial;
            //
            //				}
            //store multi pass materials for use later
            var multiMaterial = this._multiMaterialDictionary[name];
            if (!multiMaterial) {
                //create multipass material
                multiMaterial = new MethodMaterial(this._textureDictionary[textureName]);
                multiMaterial.mode = MethodMaterialMode.MULTI_PASS;
                multiMaterial.name = name;
                multiMaterial.lightPicker = this._lightPicker;
                //					multiMaterial.shadowMethod = this._cascadeMethod;
                multiMaterial.shadowMethod = this._baseShadowMethod;
                multiMaterial.addEffectMethod(this._fogMethod);
                multiMaterial.repeat = true;
                multiMaterial.specular = 2;
                //use alpha transparancy if texture is png
                if (textureName.substring(textureName.length - 3) == "png")
                    multiMaterial.alphaThreshold = 0.5;
                //add normal map if it exists
                normalTextureName = this._normalTextureStrings[textureIndex];
                if (normalTextureName)
                    multiMaterial.normalMap = this._textureDictionary[normalTextureName];
                //add specular map if it exists
                specularTextureName = this._specularTextureStrings[textureIndex];
                if (specularTextureName)
                    multiMaterial.specularMap = this._textureDictionary[specularTextureName];
                //add to material dictionary
                this._multiMaterialDictionary[name] = multiMaterial;
            }
            /*
            if (_meshReference[textureIndex]) {
                var m:Mesh = mesh.clone() as Mesh;
                m.material = multiMaterial;
                _view.scene.addChild(m);
                continue;
            }
            */
            //default to multipass material
            mesh.material = multiMaterial;
            this._view.scene.addChild(mesh);
            this._meshReference[textureIndex] = mesh;
        }
        var z = 0;
        while (z < this._numTexStrings.length) {
            console.log(this._diffuseTextureStrings[z], this._numTexStrings[z]);
            z++;
        }
        //load skybox and flame texture
        AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, function (event) { return _this.onExtraResourceComplete(event); });
        //setup the url map for textures in the cubemap file
        var assetLoaderContext = new AssetLoaderContext();
        assetLoaderContext.dependencyBaseUrl = "assets/skybox/";
        //environment texture
        AssetLibrary.load(new URLRequest("assets/skybox/hourglass_texture.cube"), assetLoaderContext);
        //globe textures
        AssetLibrary.load(new URLRequest("assets/fire.png"));
    };
    /**
     * Triggered once extra resources are loaded
     */
    Advanced_MultiPassSponzaDemo.prototype.onExtraResourceComplete = function (event) {
        switch (event.url) {
            case 'assets/skybox/hourglass_texture.cube':
                //create skybox texture map
                this._skyMap = event.assets[0];
                break;
            case "assets/fire.png":
                this._flameMaterial = new MethodMaterial(event.assets[0]);
                this._flameMaterial.blendMode = BlendMode.ADD;
                this._flameMaterial.animateUVs = true;
                break;
        }
        if (this._skyMap && this._flameMaterial)
            this.initObjects();
    };
    /**
     * Navigation and render loop
     */
    Advanced_MultiPassSponzaDemo.prototype.onEnterFrame = function (dt) {
        if (this._walkSpeed || this._walkAcceleration) {
            this._walkSpeed = (this._walkSpeed + this._walkAcceleration) * this._drag;
            if (Math.abs(this._walkSpeed) < 0.01)
                this._walkSpeed = 0;
            this._cameraController.incrementWalk(this._walkSpeed);
        }
        if (this._strafeSpeed || this._strafeAcceleration) {
            this._strafeSpeed = (this._strafeSpeed + this._strafeAcceleration) * this._drag;
            if (Math.abs(this._strafeSpeed) < 0.01)
                this._strafeSpeed = 0;
            this._cameraController.incrementStrafe(this._strafeSpeed);
        }
        //animate flames
        var flameVO;
        var len = this._flameData.length;
        for (var i = 0; i < len; i++) {
            flameVO = this._flameData[i];
            //update flame light
            var light = flameVO.light;
            if (!light)
                continue;
            light.fallOff = 380 + Math.random() * 20;
            light.radius = 200 + Math.random() * 30;
            light.diffuse = .9 + Math.random() * .1;
            //update flame mesh
            var mesh = flameVO.mesh;
            if (!mesh)
                continue;
            var subMesh = mesh.subMeshes[0];
            subMesh.uvTransform.offsetU += 1 / 16;
            subMesh.uvTransform.offsetU %= 1;
            mesh.rotationY = Math.atan2(mesh.x - this._view.camera.x, mesh.z - this._view.camera.z) * 180 / Math.PI;
        }
        this._view.render();
    };
    /**
     * Key down listener for camera control
     */
    Advanced_MultiPassSponzaDemo.prototype.onKeyDown = function (event) {
        switch (event.keyCode) {
            case Keyboard.UP:
            case Keyboard.W:
                this._walkAcceleration = this._walkIncrement;
                break;
            case Keyboard.DOWN:
            case Keyboard.S:
                this._walkAcceleration = -this._walkIncrement;
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
                this._strafeAcceleration = -this._strafeIncrement;
                break;
            case Keyboard.RIGHT:
            case Keyboard.D:
                this._strafeAcceleration = this._strafeIncrement;
                break;
            case Keyboard.F:
                break;
            case Keyboard.C:
                this._cameraController.fly = !this._cameraController.fly;
        }
    };
    /**
     * Key up listener for camera control
     */
    Advanced_MultiPassSponzaDemo.prototype.onKeyUp = function (event) {
        switch (event.keyCode) {
            case Keyboard.UP:
            case Keyboard.W:
            case Keyboard.DOWN:
            case Keyboard.S:
                this._walkAcceleration = 0;
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
            case Keyboard.RIGHT:
            case Keyboard.D:
                this._strafeAcceleration = 0;
                break;
        }
    };
    /**
     * Mouse down listener for navigation
     */
    Advanced_MultiPassSponzaDemo.prototype.onMouseDown = function (event) {
        this._lastPanAngle = this._cameraController.panAngle;
        this._lastTiltAngle = this._cameraController.tiltAngle;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
        this._move = true;
    };
    /**
     * Mouse up listener for navigation
     */
    Advanced_MultiPassSponzaDemo.prototype.onMouseUp = function (event) {
        this._move = false;
    };
    Advanced_MultiPassSponzaDemo.prototype.onMouseMove = function (event) {
        if (this._move) {
            this._cameraController.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
            this._cameraController.tiltAngle = 0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
        }
    };
    /**
     * stage listener for resize events
     */
    Advanced_MultiPassSponzaDemo.prototype.onResize = function (event) {
        if (event === void 0) { event = null; }
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    };
    return Advanced_MultiPassSponzaDemo;
})();
/**
* Data class for the Flame objects
*/
var FlameVO = (function () {
    function FlameVO(position, color /*uint*/) {
        this.position = position;
        this.color = color;
    }
    return FlameVO;
})();
window.onload = function () {
    new Advanced_MultiPassSponzaDemo();
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnRzIl0sIm5hbWVzIjpbIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0IiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0RW5naW5lIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0TGlnaHRzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0T2JqZWN0cyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8uaW5pdExpc3RlbmVycyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8udXBkYXRlRGlyZWN0aW9uIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5jb3VudE51bVRleHR1cmVzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkUHJvZ3Jlc3MiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnBhcnNlQml0bWFwIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkJpdG1hcENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5wYXJzZUFXRCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Bc3NldENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vblJlc291cmNlQ29tcGxldGUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkVudGVyRnJhbWUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uS2V5RG93biIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25LZXlVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZURvd24iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uTW91c2VVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZU1vdmUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uUmVzaXplIiwiRmxhbWVWTyIsIkZsYW1lVk8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2Q0U7QUFFRixJQUFPLEtBQUssV0FBaUIsOEJBQThCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUN0RSxJQUFPLGFBQWEsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sV0FBVyxXQUFnQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hFLElBQU8sV0FBVyxXQUFnQixrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3RFLElBQU8sUUFBUSxXQUFpQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2pFLElBQU8sWUFBWSxXQUFnQixzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sa0JBQWtCLFdBQWMsNENBQTRDLENBQUMsQ0FBQztBQUNyRixJQUFPLFNBQVMsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFNBQVMsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNqRSxJQUFPLG1CQUFtQixXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFDbkYsSUFBTyxVQUFVLFdBQWdCLGdDQUFnQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxXQUFXLFdBQWdCLHFDQUFxQyxDQUFDLENBQUM7QUFFekUsSUFBTyxZQUFZLFdBQWdCLHVDQUF1QyxDQUFDLENBQUM7QUFDNUUsSUFBTyxxQkFBcUIsV0FBYSxnREFBZ0QsQ0FBQyxDQUFDO0FBQzNGLElBQU8sUUFBUSxXQUFpQiw2QkFBNkIsQ0FBQyxDQUFDO0FBQy9ELElBQU8scUJBQXFCLFdBQWEsNkNBQTZDLENBQUMsQ0FBQztBQUV4RixJQUFPLE1BQU0sV0FBaUIsc0NBQXNDLENBQUMsQ0FBQztBQUN0RSxJQUFPLElBQUksV0FBa0Isb0NBQW9DLENBQUMsQ0FBQztBQUNuRSxJQUFPLHFCQUFxQixXQUFhLHNEQUFzRCxDQUFDLENBQUM7QUFDakcsSUFBTyxRQUFRLFdBQWlCLGtDQUFrQyxDQUFDLENBQUM7QUFFcEUsSUFBTyxTQUFTLFdBQWdCLG1DQUFtQyxDQUFDLENBQUM7QUFDckUsSUFBTyxJQUFJLFdBQWtCLGtDQUFrQyxDQUFDLENBQUM7QUFDakUsSUFBTyxNQUFNLFdBQWlCLG9DQUFvQyxDQUFDLENBQUM7QUFDcEUsSUFBTyxnQkFBZ0IsV0FBZSw4Q0FBOEMsQ0FBQyxDQUFDO0FBQ3RGLElBQU8sVUFBVSxXQUFnQix3Q0FBd0MsQ0FBQyxDQUFDO0FBRzNFLElBQU8saUJBQWlCLFdBQWMsNkRBQTZELENBQUMsQ0FBQztBQUNyRyxJQUFPLG9CQUFvQixXQUFjLGlEQUFpRCxDQUFDLENBQUM7QUFDNUYsSUFBTyxJQUFJLFdBQWtCLCtCQUErQixDQUFDLENBQUM7QUFFOUQsSUFBTyxLQUFLLFdBQWlCLDRDQUE0QyxDQUFDLENBQUM7QUFDM0UsSUFBTyxlQUFlLFdBQWUsdUNBQXVDLENBQUMsQ0FBQztBQUU5RSxJQUFPLGNBQWMsV0FBZSwyQ0FBMkMsQ0FBQyxDQUFDO0FBQ2pGLElBQU8sa0JBQWtCLFdBQWMsK0NBQStDLENBQUMsQ0FBQztBQUN4RixJQUFPLGtCQUFrQixXQUFjLG9EQUFvRCxDQUFDLENBQUM7QUFFN0YsSUFBTyxnQkFBZ0IsV0FBZSxxREFBcUQsQ0FBQyxDQUFDO0FBQzdGLElBQU8sZUFBZSxXQUFlLG9EQUFvRCxDQUFDLENBQUM7QUFFM0YsSUFBTyxTQUFTLFdBQWdCLDhCQUE4QixDQUFDLENBQUM7QUFFaEUsSUFBTSw0QkFBNEI7SUEyRmpDQTs7T0FFR0E7SUFDSEEsU0E5RktBLDRCQUE0QkE7UUFFakNDLGlDQUFpQ0E7UUFDekJBLGdCQUFXQSxHQUFVQSxTQUFTQSxDQUFDQTtRQUV2Q0EsK0JBQStCQTtRQUN2QkEseUJBQW9CQSxHQUFpQkEsS0FBS0EsQ0FBU0EsTUFBTUEsRUFBYUEsZUFBZUEsRUFBR0EsUUFBUUEsRUFBYUEsU0FBU0EsRUFBYUEsT0FBT0EsRUFBY0EsVUFBVUEsRUFBV0EsVUFBVUEsRUFBV0EsVUFBVUEsRUFBV0EsVUFBVUEsRUFBZUEsVUFBVUEsRUFBVUEsVUFBVUEsRUFBZ0JBLFNBQVNBLEVBQVdBLFVBQVVBLEVBQWNBLFVBQVVBLEVBQVNBLFVBQVVBLEVBQWVBLFVBQVVBLEVBQVdBLE9BQU9BLEVBQWFBLGNBQWNBLEVBQUNBLGNBQWNBLEVBQUNBLE1BQU1BLEVBQVFBLE1BQU1BLEVBQVlBLE1BQU1BLEVBQVVBLGNBQWNBLEVBQU1BLGNBQWNBLEVBQUlBLFlBQVlBLENBQUNBLENBQUNBO1FBRXppQkEsc2pCQUFzakJBO1FBQ3RqQkEsMGpCQUEwakJBO1FBQzFqQkEsZ2tCQUFna0JBO1FBRXhqQkEsMkJBQXNCQSxHQUFpQkEsS0FBS0EsQ0FBU0EsZUFBZUEsRUFBRUEsZ0JBQWdCQSxFQUFFQSxtQkFBbUJBLEVBQUVBLG9CQUFvQkEsRUFBRUEsbUJBQW1CQSxFQUFFQSxtQkFBbUJBLEVBQUVBLG1CQUFtQkEsRUFBRUEsbUJBQW1CQSxFQUFFQSx1QkFBdUJBLEVBQUVBLGtCQUFrQkEsRUFBRUEsd0JBQXdCQSxFQUFFQSxrQkFBa0JBLEVBQUVBLHNCQUFzQkEsRUFBRUEsaUJBQWlCQSxFQUFFQSx1QkFBdUJBLEVBQUVBLG1CQUFtQkEsRUFBRUEsa0JBQWtCQSxFQUFFQSxhQUFhQSxFQUFFQSxVQUFVQSxFQUFFQSxlQUFlQSxFQUFFQSxnQkFBZ0JBLEVBQUVBLGNBQWNBLEVBQUVBLGtCQUFrQkEsRUFBRUEsZ0JBQWdCQSxFQUFFQSxnQkFBZ0JBLENBQUNBLENBQUNBO1FBQ3JpQkEsMEJBQXFCQSxHQUFpQkEsS0FBS0EsQ0FBU0EsY0FBY0EsRUFBRUEsb0JBQW9CQSxFQUFFQSxrQkFBa0JBLEVBQUVBLElBQUlBLEVBQWlCQSx1QkFBdUJBLEVBQUVBLGtCQUFrQkEsRUFBRUEsa0JBQWtCQSxFQUFFQSxrQkFBa0JBLEVBQUVBLElBQUlBLEVBQW9CQSxJQUFJQSxFQUFnQkEsSUFBSUEsRUFBc0JBLElBQUlBLEVBQWdCQSxJQUFJQSxFQUFvQkEsSUFBSUEsRUFBZUEsSUFBSUEsRUFBcUJBLElBQUlBLEVBQWlCQSxJQUFJQSxFQUFnQkEsSUFBSUEsRUFBV0EsZUFBZUEsRUFBRUEsSUFBSUEsRUFBUUEsZUFBZUEsRUFBRUEsY0FBY0EsRUFBR0EsSUFBSUEsRUFBZ0JBLElBQUlBLEVBQWNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFDemlCQSw0QkFBdUJBLEdBQWlCQSxLQUFLQSxDQUFTQSxlQUFlQSxFQUFFQSxJQUFJQSxFQUFhQSxtQkFBbUJBLEVBQUVBLG9CQUFvQkEsRUFBRUEsSUFBSUEsRUFBaUJBLG1CQUFtQkEsRUFBRUEsbUJBQW1CQSxFQUFFQSxtQkFBbUJBLEVBQUVBLGtCQUFrQkEsRUFBT0Esa0JBQWtCQSxFQUFFQSxrQkFBa0JBLEVBQVFBLGtCQUFrQkEsRUFBRUEsaUJBQWlCQSxFQUFPQSxpQkFBaUJBLEVBQUVBLGlCQUFpQkEsRUFBUUEsbUJBQW1CQSxFQUFFQSxrQkFBa0JBLEVBQUVBLElBQUlBLEVBQVdBLElBQUlBLEVBQVFBLElBQUlBLEVBQWFBLGdCQUFnQkEsRUFBRUEsSUFBSUEsRUFBWUEsSUFBSUEsRUFBZ0JBLHFCQUFxQkEsRUFBRUEscUJBQXFCQSxDQUFDQSxDQUFDQTtRQUMvaUJBLG1CQUFjQSxHQUEwQkEsS0FBS0EsQ0FBa0JBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUdBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO1FBQzNJQSxtQkFBY0EsR0FBVUEsSUFBSUEsS0FBS0EsQ0FBT0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFFcERBLG9CQUFvQkE7UUFDWkEsZUFBVUEsR0FBa0JBLEtBQUtBLENBQVVBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEVBQUVBLFFBQVFBLENBQUNBLEVBQUVBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLEdBQUdBLENBQUNBLEVBQUVBLFFBQVFBLENBQUNBLEVBQUVBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLFFBQVFBLENBQUNBLEVBQUVBLElBQUlBLE9BQU9BLENBQUNBLElBQUlBLFFBQVFBLENBQUNBLEdBQUdBLEVBQUVBLEdBQUdBLEVBQUVBLENBQUNBLEdBQUdBLENBQUNBLEVBQUVBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO1FBRXZRQSx5Q0FBeUNBO1FBQ2pDQSx1QkFBa0JBLEdBQVVBLElBQUlBLE1BQU1BLEVBQUVBLENBQUNBO1FBQ3pDQSw2QkFBd0JBLEdBQVVBLElBQUlBLE1BQU1BLEVBQUVBLENBQUNBO1FBQy9DQSw4QkFBeUJBLEdBQVVBLElBQUlBLE1BQU1BLEVBQUVBLENBQUNBO1FBRXhEQSx1REFBdURBO1FBQy9DQSxlQUFVQSxHQUFlQSxJQUFJQSxLQUFLQSxFQUFRQSxDQUFDQTtRQUMzQ0EsZUFBVUEsR0FBZUEsSUFBSUEsS0FBS0EsRUFBUUEsQ0FBQ0E7UUFDM0NBLGNBQVNBLEdBQWVBLElBQUlBLEtBQUtBLEVBQVFBLENBQUNBO1FBTWxEQSxlQUFlQTtRQUNQQSx3QkFBbUJBLEdBQVdBLEtBQUtBLENBQUNBO1FBQ3BDQSx1QkFBa0JBLEdBQVdBLElBQUlBLENBQUNBO1FBQ2xDQSxtQkFBY0EsR0FBbUJBLENBQUNBLENBQUNBO1FBQ25DQSxtQkFBY0EsR0FBVUEsS0FBS0EsQ0FBQ0E7UUFDOUJBLGtCQUFhQSxHQUFtQkEsSUFBSUEsQ0FBQ0E7UUFDckNBLG9CQUFlQSxHQUFVQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFDQSxDQUFDQSxDQUFDQTtRQUNuQ0Esb0JBQWVBLEdBQVVBLElBQUlBLENBQUNBLEVBQUVBLEdBQUNBLEVBQUVBLENBQUNBO1FBU3BDQSxZQUFPQSxHQUFjQSxJQUFJQSxLQUFLQSxFQUFPQSxDQUFDQTtRQUt0Q0EsaUJBQVlBLEdBQW1CQSxDQUFDQSxDQUFDQTtRQUNqQ0Esb0JBQWVBLEdBQW1CQSxDQUFDQSxDQUFDQTtRQUVwQ0EsT0FBRUEsR0FBbUJBLENBQUNBLENBQUNBO1FBRy9CQSxpQkFBaUJBO1FBQ1RBLFlBQU9BLEdBQWVBLElBQUlBLEtBQUtBLEVBQVFBLENBQUNBO1FBR2hEQSxvQkFBb0JBO1FBQ1pBLFVBQUtBLEdBQVdBLEtBQUtBLENBQUNBO1FBTTlCQSxvQkFBb0JBO1FBQ1pBLFVBQUtBLEdBQVVBLEdBQUdBLENBQUNBO1FBQ25CQSxtQkFBY0EsR0FBVUEsRUFBRUEsQ0FBQ0E7UUFDM0JBLHFCQUFnQkEsR0FBVUEsRUFBRUEsQ0FBQ0E7UUFDN0JBLGVBQVVBLEdBQVVBLENBQUNBLENBQUNBO1FBQ3RCQSxpQkFBWUEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFDeEJBLHNCQUFpQkEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFDN0JBLHdCQUFtQkEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUFHL0JBLFVBQUtBLEdBQVVBLENBQUNBLENBQUNBO1FBYXhCQSxJQUFJQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQTtJQUNiQSxDQUFDQTtJQUVERDs7T0FFR0E7SUFDS0EsMkNBQUlBLEdBQVpBO1FBRUNFLElBQUlBLENBQUNBLFVBQVVBLEVBQUVBLENBQUNBO1FBQ2xCQSxJQUFJQSxDQUFDQSxVQUFVQSxFQUFFQSxDQUFDQTtRQUNsQkEsSUFBSUEsQ0FBQ0EsYUFBYUEsRUFBRUEsQ0FBQ0E7UUFHckJBLEFBQ0FBLGdCQURnQkE7UUFDaEJBLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1FBQ1pBLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQTtRQUMxREEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUV4QkEsQUFDQUEsdUJBRHVCQTtRQUN2QkEsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDWkEsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxHQUFHQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBO1FBQzFEQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pEQSxDQUFDQTtJQUVERjs7T0FFR0E7SUFDS0EsaURBQVVBLEdBQWxCQTtRQUVDRyxBQUNBQSxpQkFEaUJBO1FBQ2pCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxJQUFJQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBO1FBQy9EQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUMxQkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFeEJBLEFBQ0FBLDJDQUQyQ0E7UUFDM0NBLElBQUlBLENBQUNBLGlCQUFpQkEsR0FBR0EsSUFBSUEscUJBQXFCQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtJQUN2RkEsQ0FBQ0E7SUFFREg7O09BRUdBO0lBQ0tBLGlEQUFVQSxHQUFsQkE7UUFFQ0ksQUFDQUEscUJBRHFCQTtRQUNyQkEsSUFBSUEsQ0FBQ0EsT0FBT0EsR0FBR0EsSUFBSUEsS0FBS0EsRUFBT0EsQ0FBQ0E7UUFFaENBLEFBR0FBLGlDQUhpQ0E7UUFDbkNBLDREQUE0REE7UUFDNURBLG1EQUFtREE7UUFDakRBLElBQUlBLENBQUNBLGlCQUFpQkEsR0FBR0EsSUFBSUEsZ0JBQWdCQSxDQUFDQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUM1REEsQUFDRUEscUVBRG1FQTtRQUNuRUEsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxLQUFLQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUN4Q0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxPQUFPQSxHQUFHQSxHQUFHQSxDQUFDQTtRQUNyQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxZQUFZQSxHQUFHQSxRQUFRQSxDQUFDQTtRQUMvQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUNsREEsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQTtRQUUxQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBRUEsQ0FBQ0E7UUFFdkJBLEFBQ0FBLHFCQURxQkE7WUFDakJBLE9BQWVBLENBQUNBO1FBQ3BCQSxJQUFJQSxHQUFHQSxHQUFVQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUN4Q0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBR0EsR0FBR0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0E7WUFDckNBLE9BQU9BLEdBQUdBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzdCQSxJQUFJQSxLQUFLQSxHQUFnQkEsT0FBT0EsQ0FBQ0EsS0FBS0EsR0FBR0EsSUFBSUEsVUFBVUEsRUFBRUEsQ0FBQ0E7WUFDMURBLEtBQUtBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBO1lBQ25CQSxLQUFLQSxDQUFDQSxPQUFPQSxHQUFHQSxHQUFHQSxDQUFDQTtZQUNwQkEsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDNUJBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2JBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBQzFCQSxDQUFDQTtRQUVEQSxBQUNBQSxnQ0FEZ0NBO1FBQ2hDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxpQkFBaUJBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO1FBQ3hEQSxJQUFJQSxDQUFDQSxpQkFBaUJBLEdBQUdBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsaUJBQWlCQSxFQUFHQSxFQUFFQSxFQUFHQSxDQUFDQSxDQUFFQSxDQUFDQTtRQUNsRkEsQUFHRUEsK0VBSDZFQTtRQUU3RUEsOEJBQThCQTtRQUM5QkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsZUFBZUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsSUFBSUEsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLDJFQUEyRUE7SUFDMUVBLENBQUNBO0lBRURKOztPQUVHQTtJQUNLQSxrREFBV0EsR0FBbkJBO1FBRUNLLEFBQ0FBLGVBRGVBO1FBQ2ZBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLElBQUlBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBLENBQUNBO1FBRXBEQSxBQUNBQSxxQkFEcUJBO1FBQ3JCQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxJQUFJQSxvQkFBb0JBLENBQUNBLEVBQUVBLEVBQUVBLEVBQUVBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLENBQUNBO1FBQzFFQSxJQUFJQSxPQUFlQSxDQUFDQTtRQUNwQkEsSUFBSUEsR0FBR0EsR0FBVUEsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0E7UUFDeENBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLENBQUNBLEdBQVVBLENBQUNBLEVBQUVBLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBO1lBQ3JDQSxPQUFPQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsSUFBSUEsR0FBUUEsT0FBT0EsQ0FBQ0EsSUFBSUEsR0FBVUEsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7WUFDekVBLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1lBQ3BDQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxRQUFRQSxHQUFHQSxPQUFPQSxDQUFDQSxRQUFRQSxDQUFDQTtZQUMzQ0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsV0FBV0EsR0FBR0EsSUFBSUEsV0FBV0EsRUFBRUEsQ0FBQUE7WUFDakRBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLEdBQUNBLEVBQUVBLENBQUNBO1lBQzVDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7UUFDOUJBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURMOztPQUVHQTtJQUNLQSxvREFBYUEsR0FBckJBO1FBQUFNLGlCQXNCQ0E7UUFwQkFBLEFBQ0FBLGVBRGVBO1FBQ2ZBLE1BQU1BLENBQUNBLFFBQVFBLEdBQUlBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLEVBQXBCQSxDQUFvQkEsQ0FBQ0E7UUFFbkRBLFFBQVFBLENBQUNBLFdBQVdBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLENBQUNBLEVBQXZCQSxDQUF1QkEsQ0FBQ0E7UUFDMURBLFFBQVFBLENBQUNBLFNBQVNBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEVBQXJCQSxDQUFxQkEsQ0FBQ0E7UUFDdERBLFFBQVFBLENBQUNBLFdBQVdBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLENBQUNBLEVBQXZCQSxDQUF1QkEsQ0FBQ0E7UUFDMURBLFFBQVFBLENBQUNBLFNBQVNBLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLEVBQXJCQSxDQUFxQkEsQ0FBQ0E7UUFDdERBLFFBQVFBLENBQUNBLE9BQU9BLEdBQUdBLFVBQUNBLEtBQUtBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLE9BQU9BLENBQUNBLEtBQUtBLENBQUNBLEVBQW5CQSxDQUFtQkEsQ0FBQ0E7UUFFbERBLElBQUlBLENBQUNBLFFBQVFBLEVBQUVBLENBQUNBO1FBRWhCQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEdBQUdBLFVBQUNBLEtBQVdBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLEVBQXBCQSxDQUFvQkEsQ0FBQ0E7UUFDOURBLElBQUlBLENBQUNBLG1CQUFtQkEsR0FBR0EsVUFBQ0EsS0FBS0EsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBdkJBLENBQXVCQSxDQUFDQTtRQUM5REEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxHQUFHQSxVQUFDQSxLQUFtQkEsSUFBS0EsT0FBQUEsS0FBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBeEJBLENBQXdCQSxDQUFDQTtRQUM5RUEsSUFBSUEsQ0FBQ0Esd0JBQXdCQSxHQUFHQSxVQUFDQSxLQUFLQSxJQUFLQSxPQUFBQSxLQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLEtBQUtBLENBQUNBLEVBQTVCQSxDQUE0QkEsQ0FBQ0E7UUFDeEVBLElBQUlBLENBQUNBLHVCQUF1QkEsR0FBR0EsVUFBQ0EsS0FBZ0JBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGVBQWVBLENBQUNBLEtBQUtBLENBQUNBLEVBQTNCQSxDQUEyQkEsQ0FBQ0E7UUFDakZBLElBQUlBLENBQUNBLDBCQUEwQkEsR0FBR0EsVUFBQ0EsS0FBaUJBLElBQUtBLE9BQUFBLEtBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsRUFBOUJBLENBQThCQSxDQUFDQTtRQUV4RkEsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEscUJBQXFCQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUNqRUEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0E7SUFDckJBLENBQUNBO0lBRUROOztPQUVHQTtJQUNKQSw2REFBNkRBO0lBQzdEQSxLQUFLQTtJQUNMQSxtQkFBbUJBO0lBQ25CQSxxQkFBcUJBO0lBQ3JCQSwwQ0FBMENBO0lBQzFDQSwyQ0FBMkNBO0lBQzNDQSw2QkFBNkJBO0lBQzdCQSxnRUFBZ0VBO0lBQ2hFQSxnQkFBZ0JBO0lBQ2hCQSxnQ0FBZ0NBO0lBQ2hDQSx3RUFBd0VBO0lBQ3hFQSxpRkFBaUZBO0lBQ2pGQSxnQkFBZ0JBO0lBQ2hCQSxFQUFFQTtJQUNGQSwrQ0FBK0NBO0lBQy9DQSxNQUFNQTtJQUNOQSxLQUFLQTtJQUVKQTs7T0FFR0E7SUFDS0Esc0RBQWVBLEdBQXZCQTtRQUVDTyxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLFNBQVNBLEdBQUdBLElBQUlBLFFBQVFBLENBQzlDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxHQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxDQUFDQSxFQUM3REEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsRUFDL0JBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLEdBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLENBQzdEQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVEUDs7T0FFR0E7SUFDS0EsdURBQWdCQSxHQUF4QkE7UUFFQ1EsSUFBSUEsQ0FBQ0EsWUFBWUEsRUFBRUEsQ0FBQ0E7UUFHcEJBLE9BQU9BLElBQUlBLENBQUNBLEVBQUVBLEVBQUVBLEdBQUdBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0E7WUFDeERBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hDQSxLQUFLQSxDQUFDQTtRQUVSQSxBQUNBQSwyQkFEMkJBO1FBQzNCQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLENBQUNBO1lBQ2xEQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLENBQUNBO1FBQ3pCQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLElBQUlBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDdkVBLElBQUlBLENBQUNBLEVBQUVBLEdBQUdBLENBQUNBLENBQUNBO1lBQ1pBLElBQUlBLENBQUNBLHNCQUFzQkEsR0FBR0EsSUFBSUEsQ0FBQ0EscUJBQXFCQSxDQUFDQTtZQUN6REEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxFQUFFQSxDQUFDQTtRQUN6QkEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxJQUFJQSxJQUFJQSxDQUFDQSxxQkFBcUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RFQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNaQSxJQUFJQSxDQUFDQSxzQkFBc0JBLEdBQUdBLElBQUlBLENBQUNBLHVCQUF1QkEsQ0FBQ0E7WUFDM0RBLElBQUlBLENBQUNBLGdCQUFnQkEsRUFBRUEsQ0FBQ0E7UUFDekJBLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURSOztPQUVHQTtJQUNLQSwyQ0FBSUEsR0FBWkEsVUFBYUEsR0FBVUE7UUFFdEJTLElBQUlBLE1BQU1BLEdBQWFBLElBQUlBLFNBQVNBLEVBQUVBLENBQUNBO1FBQ3ZDQSxNQUFNQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxHQUFHQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2Q0EsS0FBS0EsS0FBS0EsQ0FBQ0E7WUFDWEEsS0FBS0EsS0FBS0E7Z0JBQ1RBLE1BQU1BLENBQUNBLFVBQVVBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0E7Z0JBQ3JEQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxlQUFlQSxDQUFDQTtnQkFDcENBLE1BQU1BLENBQUNBLGdCQUFnQkEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxDQUFDQTtnQkFDL0RBLEtBQUtBLENBQUNBO1lBQ1BBLEtBQUtBLEtBQUtBLENBQUNBO1lBQ1hBLEtBQUtBLEtBQUtBO2dCQUNUQSxNQUFNQSxDQUFDQSxVQUFVQSxHQUFHQSxtQkFBbUJBLENBQUNBLElBQUlBLENBQUNBO2dCQUM3Q0EsSUFBSUEsQ0FBQ0EsZUFBZUEsRUFBRUEsQ0FBQ0E7Z0JBQ3ZCQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxrQkFBa0JBLENBQUNBO2dCQUN2Q0EsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBO2dCQUNsRUEsR0FBR0EsR0FBR0EsU0FBU0EsR0FBR0EsR0FBR0EsQ0FBQ0E7Z0JBQ3RCQSxLQUFLQSxDQUFDQTtRQU9SQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxnQkFBZ0JBLENBQUNBLGFBQWFBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0E7UUFDM0VBLElBQUlBLE1BQU1BLEdBQWNBLElBQUlBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLEdBQUNBLEdBQUdBLENBQUNBLENBQUNBO1FBQzdEQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtJQUVyQkEsQ0FBQ0E7SUFFRFQ7O09BRUdBO0lBQ0tBLG1EQUFZQSxHQUFwQkEsVUFBcUJBLENBQWVBO1FBRW5DVSxBQUNBQSxnR0FEZ0dBO1lBQzVGQSxDQUFDQSxHQUFVQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDZEEsT0FBT0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsSUFBSUEsZUFBZUEsQ0FBQ0EsR0FBRUEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsT0FBT0EsR0FBR0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsWUFBWUEsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsQ0FBQ0EsZUFBZUEsR0FBR0EsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDOU9BLENBQUNBO0lBQ0ZBLENBQUNBO0lBRURWOztPQUVHQTtJQUNKQSxrQ0FBa0NBO0lBQ2xDQSxLQUFLQTtJQUNMQSx5REFBeURBO0lBQ3pEQSw2RUFBNkVBO0lBQzdFQSxFQUFFQTtJQUNGQSx3RUFBd0VBO0lBQ3hFQSxNQUFNQTtJQUNOQSxrR0FBa0dBO0lBQ2xHQSxNQUFNQTtJQUNOQSxFQUFFQTtJQUNGQSxpQ0FBaUNBO0lBQ2pDQSw2QkFBNkJBO0lBQzdCQSxtQkFBbUJBO0lBQ25CQSxFQUFFQTtJQUNGQSxFQUFFQTtJQUNGQSx5QkFBeUJBO0lBQ3pCQSwrREFBK0RBO0lBQy9EQSwrQ0FBK0NBO0lBQy9DQSxhQUFhQTtJQUNiQSxFQUFFQTtJQUNGQSxnQ0FBZ0NBO0lBQ2hDQSxpRUFBaUVBO0lBQ2pFQSxzREFBc0RBO0lBQ3REQSw2RUFBNkVBO0lBQzdFQSxrQkFBa0JBO0lBQ2xCQSwrREFBK0RBO0lBQy9EQSxzREFBc0RBO0lBQ3REQSw0RUFBNEVBO0lBQzVFQSxrQkFBa0JBO0lBQ2xCQSxpRUFBaUVBO0lBQ2pFQSxzREFBc0RBO0lBQ3REQSxhQUFhQTtJQUNiQSxxQ0FBcUNBO0lBQ3JDQSxlQUFlQTtJQUNmQSxXQUFXQTtJQUdWQTs7T0FFR0E7SUFDS0Esa0RBQVdBLEdBQW5CQSxVQUFvQkEsQ0FBQ0E7UUFFcEJXLElBQUlBLFNBQVNBLEdBQXlCQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUMvQ0EsSUFBSUEsS0FBS0EsR0FBb0JBLFdBQVdBLENBQUNBLFdBQVdBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3JFQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSx3QkFBd0JBLENBQUNBO1FBQzdDQSxTQUFTQSxDQUFDQSxtQkFBbUJBLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLEVBQUVBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0E7UUFDeEVBLFNBQVNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsUUFBUUEsRUFBRUEsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUNqRkEsU0FBU0EsR0FBR0EsSUFBSUEsQ0FBQ0E7SUFDbEJBLENBQUNBO0lBRURYOztPQUVHQTtJQUNLQSx1REFBZ0JBLEdBQXhCQSxVQUF5QkEsQ0FBT0E7UUFFL0JZLElBQUlBLEtBQUtBLEdBQXVDQSxDQUFDQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUN6REEsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFFcEJBLEFBQ0FBLHFDQURxQ0E7UUFDckNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLGtCQUFrQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsRUEsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsSUFBSUEsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxHQUFFQSxJQUFJQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFlBQVlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBRzVNQSxPQUFPQSxJQUFJQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO2dCQUN4Q0EsS0FBS0EsQ0FBQ0E7UUFFUkEsQUFDQUEsMkJBRDJCQTtRQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxJQUFJQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNaQSxJQUFJQSxDQUFDQSxzQkFBc0JBLEdBQUdBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0E7WUFDekRBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNB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SUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7b0JBQzNCQSxRQUFRQSxDQUFDQTtnQkFDVkEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNQQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDM0JBLElBQUlBLFNBQVNBLEdBQVNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBO29CQUNsQ0EsSUFBSUEsUUFBUUEsR0FBUUEsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzdDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtvQkFDbkRBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBO29CQUNoQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsS0FBS0EsRUFBUUEsQ0FBQ0E7Z0JBQ3JDQSxDQUFDQTtZQUNGQSxDQUFDQTtZQUVEQSxJQUFJQSxPQUFPQSxHQUFVQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtZQUMvQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFHQSxDQUFDQSxJQUFJQSxPQUFPQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdkRBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUMzQkEsUUFBUUEsQ0FBQ0E7Z0JBQ1ZBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFD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QSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxJQUFJQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLENBQUNBLENBQUNBO1lBQy9DQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLEdBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1lBQ3hFQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtnQkFDcENBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLENBQUNBLENBQUNBO1lBQ3JCQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxJQUFJQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBO1lBQ25EQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxHQUFHQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLEdBQUNBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1lBQzlFQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxZQUFZQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQTtnQkFDdENBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLENBQUNBO1lBQ3ZCQSxJQUFJQSxDQUFDQSxpQkFBaUJBLENBQUNBLGVBQWVBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLENBQUNBO1FBQzNEQSxDQUFDQTtRQUVEQSxBQUNBQSxnQkFEZ0JBO1lBQ1pBLE9BQWVBLENBQUNBO1FBQ3BCQSxJQUFJQSxHQUFHQSxH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QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQVdBLENBQUNBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFPQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtRQUN6Q0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsR0FBTUEsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7SUFDM0NBLENBQUNBO0lBQ0Z2QixtQ0FBQ0E7QUFBREEsQ0FyeUJBLEFBcXlCQ0EsSUFBQTtBQUVELEFBR0E7O0VBREU7SUFDSSxPQUFPO0lBT1p3QixTQVBLQSxPQUFPQSxDQU9BQSxRQUFpQkEsRUFBRUEsS0FBS0EsQ0FBUUEsUUFBREEsQUFBU0E7UUFFbkRDLElBQUlBLENBQUNBLFFBQVFBLEdBQUdBLFFBQVFBLENBQUNBO1FBQ3pCQSxJQUFJQSxDQUFDQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNwQkEsQ0FBQ0E7SUFDRkQsY0FBQ0E7QUFBREEsQ0FaQSxBQVlDQSxJQUFBO0FBRUQsTUFBTSxDQUFDLE1BQU0sR0FBRztJQUVmLElBQUksNEJBQTRCLEVBQUUsQ0FBQztBQUNwQyxDQUFDLENBQUEiLCJmaWxlIjoiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5qcyIsInNvdXJjZVJvb3QiOiIuLyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cbkNyeXRlayBTcG9uemEgZGVtbyB1c2luZyBtdWx0aXBhc3MgbWF0ZXJpYWxzIGluIEF3YXkzRFxuXG5EZW1vbnN0cmF0ZXM6XG5cbkhvdyB0byBhcHBseSBNdWx0aXBhc3MgbWF0ZXJpYWxzIHRvIGEgbW9kZWxcbkhvdyB0byBlbmFibGUgY2FzY2FkaW5nIHNoYWRvdyBtYXBzIG9uIGEgbXVsdGlwYXNzIG1hdGVyaWFsLlxuSG93IHRvIHNldHVwIG11bHRpcGxlIGxpZ2h0c291cmNlcywgc2hhZG93cyBhbmQgZm9nIGVmZmVjdHMgYWxsIGluIHRoZSBzYW1lIHNjZW5lLlxuSG93IHRvIGFwcGx5IHNwZWN1bGFyLCBub3JtYWwgYW5kIGRpZmZ1c2UgbWFwcyB0byBhbiBBV0QgbW9kZWwuXG5cbkNvZGUgYnkgUm9iIEJhdGVtYW4gJiBEYXZpZCBMZW5hZXJ0c1xucm9iQGluZmluaXRldHVydGxlcy5jby51a1xuaHR0cDovL3d3dy5pbmZpbml0ZXR1cnRsZXMuY28udWtcbmRhdmlkLmxlbmFlcnRzQGdtYWlsLmNvbVxuaHR0cDovL3d3dy5kZXJzY2htYWxlLmNvbVxuXG5Nb2RlbCByZS1tb2RlbGVkIGJ5IEZyYW5rIE1laW5sIGF0IENyeXRlayB3aXRoIGluc3BpcmF0aW9uIGZyb20gTWFya28gRGFicm92aWMncyBvcmlnaW5hbCwgY29udmVydGVkIHRvIEFXRCBieSBMb1RIXG5jb250YWN0QGNyeXRlay5jb21cbmh0dHA6Ly93d3cuY3J5dGVrLmNvbS9jcnllbmdpbmUvY3J5ZW5naW5lMy9kb3dubG9hZHNcbjNkZmxhc2hsb0BnbWFpbC5jb21cbmh0dHA6Ly8zZGZsYXNobG8ud29yZHByZXNzLmNvbVxuXG5UaGlzIGNvZGUgaXMgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlXG5cbkNvcHlyaWdodCAoYykgVGhlIEF3YXkgRm91bmRhdGlvbiBodHRwOi8vd3d3LnRoZWF3YXlmb3VuZGF0aW9uLm9yZ1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG5vZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSDigJxTb2Z0d2FyZeKAnSksIHRvIGRlYWxcbmluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbnRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbmNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQg4oCcQVMgSVPigJ0sIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbklNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG5BVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG5MSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG5pbXBvcnQgRXZlbnRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvRXZlbnRcIik7XG5pbXBvcnQgQXNzZXRFdmVudFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvQXNzZXRFdmVudFwiKTtcbmltcG9ydCBQcm9ncmVzc0V2ZW50XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvUHJvZ3Jlc3NFdmVudFwiKTtcbmltcG9ydCBMb2FkZXJFdmVudFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9ldmVudHMvTG9hZGVyRXZlbnRcIik7XG5pbXBvcnQgVVZUcmFuc2Zvcm1cdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9VVlRyYW5zZm9ybVwiKTtcbmltcG9ydCBWZWN0b3IzRFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVmVjdG9yM0RcIik7XG5pbXBvcnQgQXNzZXRMaWJyYXJ5XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMaWJyYXJ5XCIpO1xuaW1wb3J0IEFzc2V0TG9hZGVyQ29udGV4dFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRMb2FkZXJDb250ZXh0XCIpO1xuaW1wb3J0IEFzc2V0VHlwZVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0VHlwZVwiKTtcbmltcG9ydCBVUkxMb2FkZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTExvYWRlclwiKTtcbmltcG9ydCBVUkxMb2FkZXJEYXRhRm9ybWF0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTExvYWRlckRhdGFGb3JtYXRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMUmVxdWVzdFwiKTtcbmltcG9ydCBQYXJzZXJVdGlsc1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9wYXJzZXJzL1BhcnNlclV0aWxzXCIpO1xuaW1wb3J0IEltYWdlQ3ViZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSW1hZ2VUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlVGV4dHVyZVwiKTtcbmltcG9ydCBTcGVjdWxhckJpdG1hcFRleHR1cmVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvU3BlY3VsYXJCaXRtYXBUZXh0dXJlXCIpO1xuaW1wb3J0IEtleWJvYXJkXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdWkvS2V5Ym9hcmRcIik7XG5pbXBvcnQgUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcblxuaW1wb3J0IExvYWRlclx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBGaXJzdFBlcnNvbkNvbnRyb2xsZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udHJvbGxlcnMvRmlyc3RQZXJzb25Db250cm9sbGVyXCIpO1xuaW1wb3J0IEdlb21ldHJ5XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9HZW9tZXRyeVwiKTtcbmltcG9ydCBJU3ViTWVzaFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvSVN1Yk1lc2hcIik7XG5pbXBvcnQgQmxlbmRNb2RlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvQmxlbmRNb2RlXCIpO1xuaW1wb3J0IE1lc2hcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL01lc2hcIik7XG5pbXBvcnQgU2t5Ym94XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvU2t5Ym94XCIpO1xuaW1wb3J0IERpcmVjdGlvbmFsTGlnaHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0RpcmVjdGlvbmFsTGlnaHRcIik7XG5pbXBvcnQgUG9pbnRMaWdodFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Qb2ludExpZ2h0XCIpO1xuLy9cdGltcG9ydCBDYXNjYWRlU2hhZG93TWFwcGVyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvQ2FzY2FkZVNoYWRvd01hcHBlclwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbFNoYWRvd01hcHBlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvc2hhZG93bWFwcGVycy9EaXJlY3Rpb25hbFNoYWRvd01hcHBlclwiKTtcbmltcG9ydCBTdGF0aWNMaWdodFBpY2tlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9saWdodHBpY2tlcnMvU3RhdGljTGlnaHRQaWNrZXJcIik7XG5pbXBvcnQgUHJpbWl0aXZlUGxhbmVQcmVmYWJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9wcmVmYWJzL1ByaW1pdGl2ZVBsYW5lUHJlZmFiXCIpO1xuaW1wb3J0IENhc3RcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3V0aWxzL0Nhc3RcIik7XG5cbmltcG9ydCBNZXJnZVx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL3Rvb2xzL2NvbW1hbmRzL01lcmdlXCIpO1xuaW1wb3J0IERlZmF1bHRSZW5kZXJlclx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuXG5pbXBvcnQgTWV0aG9kTWF0ZXJpYWxcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvTWV0aG9kTWF0ZXJpYWxcIik7XG5pbXBvcnQgTWV0aG9kTWF0ZXJpYWxNb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9NZXRob2RNYXRlcmlhbE1vZGVcIik7XG5pbXBvcnQgTWV0aG9kUmVuZGVyZXJQb29sXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9wb29sL01ldGhvZFJlbmRlcmVyUG9vbFwiKTtcbmltcG9ydCBTaGFkb3dDYXNjYWRlTWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NoYWRvd0Nhc2NhZGVNZXRob2RcIik7XG5pbXBvcnQgU2hhZG93U29mdE1ldGhvZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NoYWRvd1NvZnRNZXRob2RcIik7XG5pbXBvcnQgRWZmZWN0Rm9nTWV0aG9kXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvRWZmZWN0Rm9nTWV0aG9kXCIpO1xuXG5pbXBvcnQgQVdEUGFyc2VyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL0FXRFBhcnNlclwiKTtcblxuY2xhc3MgQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtb1xue1xuXHQvL3Jvb3QgZmlsZXBhdGggZm9yIGFzc2V0IGxvYWRpbmdcblx0cHJpdmF0ZSBfYXNzZXRzUm9vdDpzdHJpbmcgPSBcImFzc2V0cy9cIjtcblx0XG5cdC8vZGVmYXVsdCBtYXRlcmlhbCBkYXRhIHN0cmluZ3Ncblx0cHJpdmF0ZSBfbWF0ZXJpYWxOYW1lU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hcIiwgICAgICAgICAgICBcIk1hdGVyaWFsX18yOThcIiwgIFwiYnJpY2tzXCIsICAgICAgICAgICAgXCJjZWlsaW5nXCIsICAgICAgICAgICAgXCJjaGFpblwiLCAgICAgICAgICAgICBcImNvbHVtbl9hXCIsICAgICAgICAgIFwiY29sdW1uX2JcIiwgICAgICAgICAgXCJjb2x1bW5fY1wiLCAgICAgICAgICBcImZhYnJpY19nXCIsICAgICAgICAgICAgICBcImZhYnJpY19jXCIsICAgICAgICAgXCJmYWJyaWNfZlwiLCAgICAgICAgICAgICAgIFwiZGV0YWlsc1wiLCAgICAgICAgICBcImZhYnJpY19kXCIsICAgICAgICAgICAgIFwiZmFicmljX2FcIiwgICAgICAgIFwiZmFicmljX2VcIiwgICAgICAgICAgICAgIFwiZmxhZ3BvbGVcIiwgICAgICAgICAgXCJmbG9vclwiLCAgICAgICAgICAgIFwiMTZfX19EZWZhdWx0XCIsXCJNYXRlcmlhbF9fMjVcIixcInJvb2ZcIiwgICAgICAgXCJsZWFmXCIsICAgICAgICAgICBcInZhc2VcIiwgICAgICAgICBcInZhc2VfaGFuZ2luZ1wiLCAgICAgXCJNYXRlcmlhbF9fNTdcIiwgICBcInZhc2Vfcm91bmRcIik7XG5cdFxuXHQvL3ByaXZhdGUgY29uc3QgZGlmZnVzZVRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFtcImFyY2hfZGlmZi5hdGZcIiwgXCJiYWNrZ3JvdW5kLmF0ZlwiLCBcImJyaWNrc19hX2RpZmYuYXRmXCIsIFwiY2VpbGluZ19hX2RpZmYuYXRmXCIsIFwiY2hhaW5fdGV4dHVyZS5wbmdcIiwgXCJjb2x1bW5fYV9kaWZmLmF0ZlwiLCBcImNvbHVtbl9iX2RpZmYuYXRmXCIsIFwiY29sdW1uX2NfZGlmZi5hdGZcIiwgXCJjdXJ0YWluX2JsdWVfZGlmZi5hdGZcIiwgXCJjdXJ0YWluX2RpZmYuYXRmXCIsIFwiY3VydGFpbl9ncmVlbl9kaWZmLmF0ZlwiLCBcImRldGFpbHNfZGlmZi5hdGZcIiwgXCJmYWJyaWNfYmx1ZV9kaWZmLmF0ZlwiLCBcImZhYnJpY19kaWZmLmF0ZlwiLCBcImZhYnJpY19ncmVlbl9kaWZmLmF0ZlwiLCBcImZsYWdwb2xlX2RpZmYuYXRmXCIsIFwiZmxvb3JfYV9kaWZmLmF0ZlwiLCBcImdpX2ZsYWcuYXRmXCIsIFwibGlvbi5hdGZcIiwgXCJyb29mX2RpZmYuYXRmXCIsIFwidGhvcm5fZGlmZi5wbmdcIiwgXCJ2YXNlX2RpZi5hdGZcIiwgXCJ2YXNlX2hhbmdpbmcuYXRmXCIsIFwidmFzZV9wbGFudC5wbmdcIiwgXCJ2YXNlX3JvdW5kLmF0ZlwiXSk7XG5cdC8vcHJpdmF0ZSBjb25zdCBub3JtYWxUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihbXCJhcmNoX2Rkbi5hdGZcIiwgXCJiYWNrZ3JvdW5kX2Rkbi5hdGZcIiwgXCJicmlja3NfYV9kZG4uYXRmXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY2hhaW5fdGV4dHVyZV9kZG4uYXRmXCIsIFwiY29sdW1uX2FfZGRuLmF0ZlwiLCBcImNvbHVtbl9iX2Rkbi5hdGZcIiwgXCJjb2x1bW5fY19kZG4uYXRmXCIsIG51bGwsICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICBcImxpb24yX2Rkbi5hdGZcIiwgbnVsbCwgICAgICAgXCJ0aG9ybl9kZG4uYXRmXCIsIFwidmFzZV9kZG4uYXRmXCIsICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgIFwidmFzZV9yb3VuZF9kZG4uYXRmXCJdKTtcblx0Ly9wcml2YXRlIGNvbnN0IHNwZWN1bGFyVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oW1wiYXJjaF9zcGVjLmF0ZlwiLCBudWxsLCAgICAgICAgICAgIFwiYnJpY2tzX2Ffc3BlYy5hdGZcIiwgXCJjZWlsaW5nX2Ffc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgICAgICAgXCJjb2x1bW5fYV9zcGVjLmF0ZlwiLCBcImNvbHVtbl9iX3NwZWMuYXRmXCIsIFwiY29sdW1uX2Nfc3BlYy5hdGZcIiwgXCJjdXJ0YWluX3NwZWMuYXRmXCIsICAgICAgXCJjdXJ0YWluX3NwZWMuYXRmXCIsIFwiY3VydGFpbl9zcGVjLmF0ZlwiLCAgICAgICBcImRldGFpbHNfc3BlYy5hdGZcIiwgXCJmYWJyaWNfc3BlYy5hdGZcIiwgICAgICBcImZhYnJpY19zcGVjLmF0ZlwiLCBcImZhYnJpY19zcGVjLmF0ZlwiLCAgICAgICBcImZsYWdwb2xlX3NwZWMuYXRmXCIsIFwiZmxvb3JfYV9zcGVjLmF0ZlwiLCBudWxsLCAgICAgICAgICBudWxsLCAgICAgICBudWxsLCAgICAgICAgICAgIFwidGhvcm5fc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgXCJ2YXNlX3BsYW50X3NwZWMuYXRmXCIsIFwidmFzZV9yb3VuZF9zcGVjLmF0ZlwiXSk7XG5cdFxuXHRwcml2YXRlIF9kaWZmdXNlVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoX2RpZmYuanBnXCIsIFwiYmFja2dyb3VuZC5qcGdcIiwgXCJicmlja3NfYV9kaWZmLmpwZ1wiLCBcImNlaWxpbmdfYV9kaWZmLmpwZ1wiLCBcImNoYWluX3RleHR1cmUucG5nXCIsIFwiY29sdW1uX2FfZGlmZi5qcGdcIiwgXCJjb2x1bW5fYl9kaWZmLmpwZ1wiLCBcImNvbHVtbl9jX2RpZmYuanBnXCIsIFwiY3VydGFpbl9ibHVlX2RpZmYuanBnXCIsIFwiY3VydGFpbl9kaWZmLmpwZ1wiLCBcImN1cnRhaW5fZ3JlZW5fZGlmZi5qcGdcIiwgXCJkZXRhaWxzX2RpZmYuanBnXCIsIFwiZmFicmljX2JsdWVfZGlmZi5qcGdcIiwgXCJmYWJyaWNfZGlmZi5qcGdcIiwgXCJmYWJyaWNfZ3JlZW5fZGlmZi5qcGdcIiwgXCJmbGFncG9sZV9kaWZmLmpwZ1wiLCBcImZsb29yX2FfZGlmZi5qcGdcIiwgXCJnaV9mbGFnLmpwZ1wiLCBcImxpb24uanBnXCIsIFwicm9vZl9kaWZmLmpwZ1wiLCBcInRob3JuX2RpZmYucG5nXCIsIFwidmFzZV9kaWYuanBnXCIsIFwidmFzZV9oYW5naW5nLmpwZ1wiLCBcInZhc2VfcGxhbnQucG5nXCIsIFwidmFzZV9yb3VuZC5qcGdcIik7XG5cdHByaXZhdGUgX25vcm1hbFRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFwiYXJjaF9kZG4uanBnXCIsIFwiYmFja2dyb3VuZF9kZG4uanBnXCIsIFwiYnJpY2tzX2FfZGRuLmpwZ1wiLCBudWxsLCAgICAgICAgICAgICAgICBcImNoYWluX3RleHR1cmVfZGRuLmpwZ1wiLCBcImNvbHVtbl9hX2Rkbi5qcGdcIiwgXCJjb2x1bW5fYl9kZG4uanBnXCIsIFwiY29sdW1uX2NfZGRuLmpwZ1wiLCBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgXCJsaW9uMl9kZG4uanBnXCIsIG51bGwsICAgICAgIFwidGhvcm5fZGRuLmpwZ1wiLCBcInZhc2VfZGRuLmpwZ1wiLCAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICBcInZhc2Vfcm91bmRfZGRuLmpwZ1wiKTtcblx0cHJpdmF0ZSBfc3BlY3VsYXJUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hfc3BlYy5qcGdcIiwgbnVsbCwgICAgICAgICAgICBcImJyaWNrc19hX3NwZWMuanBnXCIsIFwiY2VpbGluZ19hX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY29sdW1uX2Ffc3BlYy5qcGdcIiwgXCJjb2x1bW5fYl9zcGVjLmpwZ1wiLCBcImNvbHVtbl9jX3NwZWMuanBnXCIsIFwiY3VydGFpbl9zcGVjLmpwZ1wiLCAgICAgIFwiY3VydGFpbl9zcGVjLmpwZ1wiLCBcImN1cnRhaW5fc3BlYy5qcGdcIiwgICAgICAgXCJkZXRhaWxzX3NwZWMuanBnXCIsIFwiZmFicmljX3NwZWMuanBnXCIsICAgICAgXCJmYWJyaWNfc3BlYy5qcGdcIiwgXCJmYWJyaWNfc3BlYy5qcGdcIiwgICAgICAgXCJmbGFncG9sZV9zcGVjLmpwZ1wiLCBcImZsb29yX2Ffc3BlYy5qcGdcIiwgbnVsbCwgICAgICAgICAgbnVsbCwgICAgICAgbnVsbCwgICAgICAgICAgICBcInRob3JuX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIFwidmFzZV9wbGFudF9zcGVjLmpwZ1wiLCBcInZhc2Vfcm91bmRfc3BlYy5qcGdcIik7XG5cdHByaXZhdGUgX251bVRleFN0cmluZ3M6QXJyYXk8bnVtYmVyIC8qdWludCovPiA9IEFycmF5PG51bWJlciAvKnVpbnQqLz4oMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuXHRwcml2YXRlIF9tZXNoUmVmZXJlbmNlOk1lc2hbXSA9IG5ldyBBcnJheTxNZXNoPigyNSk7XG5cdFxuXHQvL2ZsYW1lIGRhdGEgb2JqZWN0c1xuXHRwcml2YXRlIF9mbGFtZURhdGE6QXJyYXk8RmxhbWVWTz4gPSBBcnJheTxGbGFtZVZPPihuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoLTYyNSwgMTY1LCAyMTkpLCAweGZmYWE0NCksIG5ldyBGbGFtZVZPKG5ldyBWZWN0b3IzRCg0ODUsIDE2NSwgMjE5KSwgMHhmZmFhNDQpLCBuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoLTYyNSwgMTY1LCAtMTQ4KSwgMHhmZmFhNDQpLCBuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoNDg1LCAxNjUsIC0xNDgpLCAweGZmYWE0NCkpO1xuXHRcblx0Ly9tYXRlcmlhbCBkaWN0aW9uYXJpZXMgdG8gaG9sZCBpbnN0YW5jZXNcblx0cHJpdmF0ZSBfdGV4dHVyZURpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9tdWx0aU1hdGVyaWFsRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHByaXZhdGUgX3NpbmdsZU1hdGVyaWFsRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdFxuXHQvL3ByaXZhdGUgbWVzaERpY3Rpb25hcnk6RGljdGlvbmFyeSA9IG5ldyBEaWN0aW9uYXJ5KCk7XG5cdHByaXZhdGUgdmFzZU1lc2hlczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRwcml2YXRlIHBvbGVNZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHJpdmF0ZSBjb2xNZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0XG5cdC8vZW5naWVuIHZhcmlhYmxlc1xuXHRwcml2YXRlIF92aWV3OlZpZXc7XG5cdHByaXZhdGUgX2NhbWVyYUNvbnRyb2xsZXI6Rmlyc3RQZXJzb25Db250cm9sbGVyO1xuXHRcblx0Ly9ndWkgdmFyaWFibGVzXG5cdHByaXZhdGUgX3NpbmdsZVBhc3NNYXRlcmlhbDpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX211bHRpUGFzc01hdGVyaWFsOmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9jYXNjYWRlTGV2ZWxzOm51bWJlciAvKnVpbnQqLyA9IDM7XG5cdHByaXZhdGUgX3NoYWRvd09wdGlvbnM6c3RyaW5nID0gXCJQQ0ZcIjtcblx0cHJpdmF0ZSBfZGVwdGhNYXBTaXplOm51bWJlciAvKnVpbnQqLyA9IDIwNDg7XG5cdHByaXZhdGUgX2xpZ2h0RGlyZWN0aW9uOm51bWJlciA9IE1hdGguUEkvMjtcblx0cHJpdmF0ZSBfbGlnaHRFbGV2YXRpb246bnVtYmVyID0gTWF0aC5QSS8xODtcblx0XG5cdC8vbGlnaHQgdmFyaWFibGVzXG5cdHByaXZhdGUgX2xpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXHRwcml2YXRlIF9iYXNlU2hhZG93TWV0aG9kOlNoYWRvd1NvZnRNZXRob2Q7XG5cdHByaXZhdGUgX2Nhc2NhZGVNZXRob2Q6U2hhZG93Q2FzY2FkZU1ldGhvZDtcblx0cHJpdmF0ZSBfZm9nTWV0aG9kIDogRWZmZWN0Rm9nTWV0aG9kO1xuXHRwcml2YXRlIF9jYXNjYWRlU2hhZG93TWFwcGVyOkRpcmVjdGlvbmFsU2hhZG93TWFwcGVyO1xuXHRwcml2YXRlIF9kaXJlY3Rpb25hbExpZ2h0OkRpcmVjdGlvbmFsTGlnaHQ7XG5cdHByaXZhdGUgX2xpZ2h0czpBcnJheTxhbnk+ID0gbmV3IEFycmF5PGFueT4oKTtcblx0XG5cdC8vbWF0ZXJpYWwgdmFyaWFibGVzXG5cdHByaXZhdGUgX3NreU1hcDpJbWFnZUN1YmVUZXh0dXJlO1xuXHRwcml2YXRlIF9mbGFtZU1hdGVyaWFsOk1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIF9udW1UZXh0dXJlczpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRwcml2YXRlIF9jdXJyZW50VGV4dHVyZTpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRwcml2YXRlIF9sb2FkaW5nVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPjtcblx0cHJpdmF0ZSBfbjpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRwcml2YXRlIF9sb2FkaW5nVGV4dDpzdHJpbmc7XG5cdFxuXHQvL3NjZW5lIHZhcmlhYmxlc1xuXHRwcml2YXRlIF9tZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHJpdmF0ZSBfZmxhbWVHZW9tZXRyeTpQcmltaXRpdmVQbGFuZVByZWZhYjtcblx0XHRcdFxuXHQvL3JvdGF0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIF9tb3ZlOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGFzdFBhbkFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdFRpbHRBbmdsZTpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVg6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0TW91c2VZOm51bWJlcjtcblx0XG5cdC8vbW92ZW1lbnQgdmFyaWFibGVzXG5cdHByaXZhdGUgX2RyYWc6bnVtYmVyID0gMC41O1xuXHRwcml2YXRlIF93YWxrSW5jcmVtZW50Om51bWJlciA9IDEwO1xuXHRwcml2YXRlIF9zdHJhZmVJbmNyZW1lbnQ6bnVtYmVyID0gMTA7XG5cdHByaXZhdGUgX3dhbGtTcGVlZDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9zdHJhZmVTcGVlZDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF93YWxrQWNjZWxlcmF0aW9uOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3N0cmFmZUFjY2VsZXJhdGlvbjpudW1iZXIgPSAwO1xuXG5cdHByaXZhdGUgX3RpbWVyOlJlcXVlc3RBbmltYXRpb25GcmFtZTtcblx0cHJpdmF0ZSBfdGltZTpudW1iZXIgPSAwO1xuXHRwcml2YXRlIHBhcnNlQVdERGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIHBhcnNlQml0bWFwRGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIGxvYWRQcm9ncmVzc0RlbGVnYXRlOihldmVudDpQcm9ncmVzc0V2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIG9uQml0bWFwQ29tcGxldGVEZWxlZ2F0ZTooZXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlRGVsZWdhdGU6KGV2ZW50OkFzc2V0RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGU6KGV2ZW50OkxvYWRlckV2ZW50KSA9PiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBHbG9iYWwgaW5pdGlhbGlzZSBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBpbml0KClcblx0e1xuXHRcdHRoaXMuaW5pdEVuZ2luZSgpO1xuXHRcdHRoaXMuaW5pdExpZ2h0cygpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHRcdFxuXHRcdFxuXHRcdC8vY291bnQgdGV4dHVyZXNcblx0XHR0aGlzLl9uID0gMDtcblx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3M7XG5cdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0XG5cdFx0Ly9raWNrb2ZmIGFzc2V0IGxvYWRpbmdcblx0XHR0aGlzLl9uID0gMDtcblx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3M7XG5cdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcblx0ICovXG5cdHByaXZhdGUgaW5pdEVuZ2luZSgpXG5cdHtcblx0XHQvL2NyZWF0ZSB0aGUgdmlld1xuXHRcdHRoaXMuX3ZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKE1ldGhvZFJlbmRlcmVyUG9vbCkpO1xuXHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnkgPSAxNTA7XG5cdFx0dGhpcy5fdmlldy5jYW1lcmEueiA9IDA7XG5cdFx0XG5cdFx0Ly9zZXR1cCBjb250cm9sbGVyIHRvIGJlIHVzZWQgb24gdGhlIGNhbWVyYVxuXHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIgPSBuZXcgRmlyc3RQZXJzb25Db250cm9sbGVyKHRoaXMuX3ZpZXcuY2FtZXJhLCA5MCwgMCwgLTgwLCA4MCk7XHRcdFx0XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaWdodHNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpZ2h0cygpXG5cdHtcblx0XHQvL2NyZWF0ZSBsaWdodHMgYXJyYXlcblx0XHR0aGlzLl9saWdodHMgPSBuZXcgQXJyYXk8YW55PigpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIGdsb2JhbCBkaXJlY3Rpb25hbCBsaWdodFxuLy9cdFx0XHR0aGlzLl9jYXNjYWRlU2hhZG93TWFwcGVyID0gbmV3IENhc2NhZGVTaGFkb3dNYXBwZXIoMyk7XG4vL1x0XHRcdHRoaXMuX2Nhc2NhZGVTaGFkb3dNYXBwZXIubGlnaHRPZmZzZXQgPSAyMDAwMDtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0ID0gbmV3IERpcmVjdGlvbmFsTGlnaHQoLTEsIC0xNSwgMSk7XG4vL1x0XHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuc2hhZG93TWFwcGVyID0gdGhpcy5fY2FzY2FkZVNoYWRvd01hcHBlcjtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmNvbG9yID0gMHhlZWRkZGQ7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5hbWJpZW50ID0gLjM1O1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuYW1iaWVudENvbG9yID0gMHg4MDgwOTA7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0KTtcblx0XHR0aGlzLl9saWdodHMucHVzaCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0KTtcblxuXHRcdHRoaXMudXBkYXRlRGlyZWN0aW9uKCk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgZmxhbWUgbGlnaHRzXG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHR2YXIgbGlnaHQgOiBQb2ludExpZ2h0ID0gZmxhbWVWTy5saWdodCA9IG5ldyBQb2ludExpZ2h0KCk7XG5cdFx0XHRsaWdodC5yYWRpdXMgPSAyMDA7XG5cdFx0XHRsaWdodC5mYWxsT2ZmID0gNjAwO1xuXHRcdFx0bGlnaHQuY29sb3IgPSBmbGFtZVZPLmNvbG9yO1xuXHRcdFx0bGlnaHQueSA9IDEwO1xuXHRcdFx0dGhpcy5fbGlnaHRzLnB1c2gobGlnaHQpO1xuXHRcdH1cblx0XHRcblx0XHQvL2NyZWF0ZSBvdXIgZ2xvYmFsIGxpZ2h0IHBpY2tlclxuXHRcdHRoaXMuX2xpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKHRoaXMuX2xpZ2h0cyk7XG5cdFx0dGhpcy5fYmFzZVNoYWRvd01ldGhvZCA9IG5ldyBTaGFkb3dTb2Z0TWV0aG9kKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQgLCAxMCAsIDUgKTtcbi8vXHRcdFx0dGhpcy5fYmFzZVNoYWRvd01ldGhvZCA9IG5ldyBTaGFkb3dGaWx0ZXJlZE1ldGhvZCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0KTtcblx0XHRcblx0XHQvL2NyZWF0ZSBvdXIgZ2xvYmFsIGZvZyBtZXRob2Rcblx0XHR0aGlzLl9mb2dNZXRob2QgPSBuZXcgRWZmZWN0Rm9nTWV0aG9kKDAsIDQwMDAsIDB4OTA5MGU3KTtcbi8vXHRcdFx0dGhpcy5fY2FzY2FkZU1ldGhvZCA9IG5ldyBTaGFkb3dDYXNjYWRlTWV0aG9kKHRoaXMuX2Jhc2VTaGFkb3dNZXRob2QpO1xuXHR9XG5cdFx0XHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIHNjZW5lIG9iamVjdHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE9iamVjdHMoKVxuXHR7XG5cdFx0Ly9jcmVhdGUgc2t5Ym94XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChuZXcgU2t5Ym94KHRoaXMuX3NreU1hcCkpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIGZsYW1lIG1lc2hlc1xuXHRcdHRoaXMuX2ZsYW1lR2VvbWV0cnkgPSBuZXcgUHJpbWl0aXZlUGxhbmVQcmVmYWIoNDAsIDgwLCAxLCAxLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHR2YXIgbWVzaDpNZXNoID0gZmxhbWVWTy5tZXNoID0gPE1lc2g+IHRoaXMuX2ZsYW1lR2VvbWV0cnkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0XHRtZXNoLm1hdGVyaWFsID0gdGhpcy5fZmxhbWVNYXRlcmlhbDtcblx0XHRcdG1lc2gudHJhbnNmb3JtLnBvc2l0aW9uID0gZmxhbWVWTy5wb3NpdGlvbjtcblx0XHRcdG1lc2guc3ViTWVzaGVzWzBdLnV2VHJhbnNmb3JtID0gbmV3IFVWVHJhbnNmb3JtKClcblx0XHRcdG1lc2guc3ViTWVzaGVzWzBdLnV2VHJhbnNmb3JtLnNjYWxlVSA9IDEvMTY7XG5cdFx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG1lc2gpO1xuXHRcdFx0bWVzaC5hZGRDaGlsZChmbGFtZVZPLmxpZ2h0KTtcblx0XHR9XG5cdH1cblx0XHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKClcblx0e1xuXHRcdC8vYWRkIGxpc3RlbmVyc1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQpID0+IHRoaXMub25SZXNpemUoZXZlbnQpO1xuXG5cdFx0ZG9jdW1lbnQub25tb3VzZWRvd24gPSAoZXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudCkgPT4gdGhpcy5vbk1vdXNlVXAoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKGV2ZW50KSA9PiB0aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleWRvd24gPSAoZXZlbnQpID0+IHRoaXMub25LZXlEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleXVwID0gKGV2ZW50KSA9PiB0aGlzLm9uS2V5VXAoZXZlbnQpO1xuXG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXG5cdFx0dGhpcy5wYXJzZUFXRERlbGVnYXRlID0gKGV2ZW50OkV2ZW50KSA9PiB0aGlzLnBhcnNlQVdEKGV2ZW50KTtcblx0XHR0aGlzLnBhcnNlQml0bWFwRGVsZWdhdGUgPSAoZXZlbnQpID0+IHRoaXMucGFyc2VCaXRtYXAoZXZlbnQpO1xuXHRcdHRoaXMubG9hZFByb2dyZXNzRGVsZWdhdGUgPSAoZXZlbnQ6UHJvZ3Jlc3NFdmVudCkgPT4gdGhpcy5sb2FkUHJvZ3Jlc3MoZXZlbnQpO1xuXHRcdHRoaXMub25CaXRtYXBDb21wbGV0ZURlbGVnYXRlID0gKGV2ZW50KSA9PiB0aGlzLm9uQml0bWFwQ29tcGxldGUoZXZlbnQpO1xuXHRcdHRoaXMub25Bc3NldENvbXBsZXRlRGVsZWdhdGUgPSAoZXZlbnQ6QXNzZXRFdmVudCkgPT4gdGhpcy5vbkFzc2V0Q29tcGxldGUoZXZlbnQpO1xuXHRcdHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUgPSAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KTtcblxuXHRcdHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdFx0dGhpcy5fdGltZXIuc3RhcnQoKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIG1hdGVyaWFsIG1vZGUgYmV0d2VlbiBzaW5nbGUgcGFzcyBhbmQgbXVsdGkgcGFzc1xuXHQgKi9cbi8vXHRcdHByaXZhdGUgdXBkYXRlTWF0ZXJpYWxQYXNzKG1hdGVyaWFsRGljdGlvbmFyeTpEaWN0aW9uYXJ5KVxuLy9cdFx0e1xuLy9cdFx0XHR2YXIgbWVzaDpNZXNoO1xuLy9cdFx0XHR2YXIgbmFtZTpzdHJpbmc7XG4vL1x0XHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fbWVzaGVzLmxlbmd0aDtcbi8vXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcbi8vXHRcdFx0XHRtZXNoID0gdGhpcy5fbWVzaGVzW2ldO1xuLy9cdFx0XHRcdGlmIChtZXNoLm5hbWUgPT0gXCJzcG9uemFfMDRcIiB8fCBtZXNoLm5hbWUgPT0gXCJzcG9uemFfMzc5XCIpXG4vL1x0XHRcdFx0XHRjb250aW51ZTtcbi8vXHRcdFx0XHRuYW1lID0gbWVzaC5tYXRlcmlhbC5uYW1lO1xuLy9cdFx0XHRcdHZhciB0ZXh0dXJlSW5kZXg6bnVtYmVyID0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5pbmRleE9mKG5hbWUpO1xuLy9cdFx0XHRcdGlmICh0ZXh0dXJlSW5kZXggPT0gLTEgfHwgdGV4dHVyZUluZGV4ID49IHRoaXMuX21hdGVyaWFsTmFtZVN0cmluZ3MubGVuZ3RoKVxuLy9cdFx0XHRcdFx0Y29udGludWU7XG4vL1xuLy9cdFx0XHRcdG1lc2gubWF0ZXJpYWwgPSBtYXRlcmlhbERpY3Rpb25hcnlbbmFtZV07XG4vL1x0XHRcdH1cbi8vXHRcdH1cblx0XG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBkaXJlY3Rpb24gb2YgdGhlIGRpcmVjdGlvbmFsIGxpZ2h0c291cmNlXG5cdCAqL1xuXHRwcml2YXRlIHVwZGF0ZURpcmVjdGlvbigpXG5cdHtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmRpcmVjdGlvbiA9IG5ldyBWZWN0b3IzRChcblx0XHRcdE1hdGguc2luKHRoaXMuX2xpZ2h0RWxldmF0aW9uKSpNYXRoLmNvcyh0aGlzLl9saWdodERpcmVjdGlvbiksXG5cdFx0XHQtTWF0aC5jb3ModGhpcy5fbGlnaHRFbGV2YXRpb24pLFxuXHRcdFx0TWF0aC5zaW4odGhpcy5fbGlnaHRFbGV2YXRpb24pKk1hdGguc2luKHRoaXMuX2xpZ2h0RGlyZWN0aW9uKVxuXHRcdCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBDb3VudCB0aGUgdG90YWwgbnVtYmVyIG9mIHRleHR1cmVzIHRvIGJlIGxvYWRlZFxuXHQgKi9cblx0cHJpdmF0ZSBjb3VudE51bVRleHR1cmVzKClcblx0e1xuXHRcdHRoaXMuX251bVRleHR1cmVzKys7XG5cdFx0XG5cdFx0Ly9za2lwIG51bGwgdGV4dHVyZXNcblx0XHR3aGlsZSAodGhpcy5fbisrIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCAtIDEpXG5cdFx0XHRpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKVxuXHRcdFx0XHRicmVhaztcblx0XHRcblx0XHQvL3N3aXRjaCB0byBuZXh0IHRldHVyZSBzZXRcblx0XHRpZiAodGhpcy5fbiA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmNvdW50TnVtVGV4dHVyZXMoKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBHbG9iYWwgYmluYXJ5IGZpbGUgbG9hZGVyXG5cdCAqL1xuXHRwcml2YXRlIGxvYWQodXJsOnN0cmluZylcblx0e1xuXHRcdHZhciBsb2FkZXI6VVJMTG9hZGVyID0gbmV3IFVSTExvYWRlcigpO1xuXHRcdHN3aXRjaCAodXJsLnN1YnN0cmluZyh1cmwubGVuZ3RoIC0gMykpIHtcblx0XHRcdGNhc2UgXCJBV0RcIjogXG5cdFx0XHRjYXNlIFwiYXdkXCI6XG5cdFx0XHRcdGxvYWRlci5kYXRhRm9ybWF0ID0gVVJMTG9hZGVyRGF0YUZvcm1hdC5BUlJBWV9CVUZGRVI7XG5cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0ID0gXCJMb2FkaW5nIE1vZGVsXCI7XG5cdFx0XHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLnBhcnNlQVdERGVsZWdhdGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJwbmdcIjogXG5cdFx0XHRjYXNlIFwianBnXCI6XG5cdFx0XHRcdGxvYWRlci5kYXRhRm9ybWF0ID0gVVJMTG9hZGVyRGF0YUZvcm1hdC5CTE9CO1xuXHRcdFx0XHR0aGlzLl9jdXJyZW50VGV4dHVyZSsrO1xuXHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dCA9IFwiTG9hZGluZyBUZXh0dXJlc1wiO1xuXHRcdFx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUJpdG1hcERlbGVnYXRlKTtcblx0XHRcdFx0dXJsID0gXCJzcG9uemEvXCIgKyB1cmw7XG5cdFx0XHRcdGJyZWFrO1xuLy9cdFx0XHRcdGNhc2UgXCJhdGZcIjpcbi8vXHRcdFx0XHRcdHRoaXMuX2N1cnJlbnRUZXh0dXJlKys7XG4vL1x0XHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dCA9IFwiTG9hZGluZyBUZXh0dXJlc1wiO1xuLy8gICAgICAgICAgICAgICAgICAgIGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCAoZXZlbnQ6RXZlbnQpID0+IHRoaXMub25BVEZDb21wbGV0ZShldmVudCkpO1xuLy9cdFx0XHRcdFx0dXJsID0gXCJzcG9uemEvYXRmL1wiICsgdXJsO1xuLy8gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXHRcdH1cblx0XHRcblx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihQcm9ncmVzc0V2ZW50LlBST0dSRVNTLCB0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlKTtcblx0XHR2YXIgdXJsUmVxOlVSTFJlcXVlc3QgPSBuZXcgVVJMUmVxdWVzdCh0aGlzLl9hc3NldHNSb290K3VybCk7XG5cdFx0bG9hZGVyLmxvYWQodXJsUmVxKTtcblx0XHRcblx0fVxuXHRcblx0LyoqXG5cdCAqIERpc3BsYXkgY3VycmVudCBsb2FkXG5cdCAqL1xuXHRwcml2YXRlIGxvYWRQcm9ncmVzcyhlOlByb2dyZXNzRXZlbnQpXG5cdHtcblx0XHQvL1RPRE8gd29yayBvdXQgd2h5IHRoZSBjYXN0aW5nIG9uIFByb2dyZXNzRXZlbnQgZmFpbHMgZm9yIGJ5dGVzTG9hZGVkIGFuZCBieXRlc1RvdGFsIHByb3BlcnRpZXNcblx0XHR2YXIgUDpudW1iZXIgPSBNYXRoLmZsb29yKGVbXCJieXRlc0xvYWRlZFwiXSAvIGVbXCJieXRlc1RvdGFsXCJdICogMTAwKTtcblx0XHRpZiAoUCAhPSAxMDApIHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuX2xvYWRpbmdUZXh0ICsgJ1xcbicgKyAoKHRoaXMuX2xvYWRpbmdUZXh0ID09IFwiTG9hZGluZyBNb2RlbFwiKT8gTWF0aC5mbG9vcigoZVtcImJ5dGVzTG9hZGVkXCJdIC8gMTAyNCkgPDwgMCkgKyAna2IgfCAnICsgTWF0aC5mbG9vcigoZVtcImJ5dGVzVG90YWxcIl0gLyAxMDI0KSA8PCAwKSArICdrYicgOiB0aGlzLl9jdXJyZW50VGV4dHVyZSArICcgfCAnICsgdGhpcy5fbnVtVGV4dHVyZXMpKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIEFURiBmaWxlXG5cdCAqL1xuLy9cdFx0cHJpdmF0ZSBvbkFURkNvbXBsZXRlKGU6RXZlbnQpXG4vL1x0XHR7XG4vLyAgICAgICAgICAgIHZhciBsb2FkZXI6VVJMTG9hZGVyID0gVVJMTG9hZGVyKGUudGFyZ2V0KTtcbi8vICAgICAgICAgICAgbG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMub25BVEZDb21wbGV0ZSk7XG4vL1xuLy9cdFx0XHRpZiAoIXRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0pXG4vL1x0XHRcdHtcbi8vXHRcdFx0XHR0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dID0gbmV3IEFURlRleHR1cmUobG9hZGVyLmRhdGEpO1xuLy9cdFx0XHR9XG4vL1xuLy8gICAgICAgICAgICBsb2FkZXIuZGF0YSA9IG51bGw7XG4vLyAgICAgICAgICAgIGxvYWRlci5jbG9zZSgpO1xuLy9cdFx0XHRsb2FkZXIgPSBudWxsO1xuLy9cbi8vXG4vL1x0XHRcdC8vc2tpcCBudWxsIHRleHR1cmVzXG4vL1x0XHRcdHdoaWxlICh0aGlzLl9uKysgPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoIC0gMSlcbi8vXHRcdFx0XHRpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKVxuLy9cdFx0XHRcdFx0YnJlYWs7XG4vL1xuLy9cdFx0XHQvL3N3aXRjaCB0byBuZXh0IHRldHVyZSBzZXRcbi8vICAgICAgICAgICAgaWYgKHRoaXMuX24gPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoKSB7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG4vL1x0XHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncykge1xuLy9cdFx0XHRcdHRoaXMuX24gPSAwO1xuLy9cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzO1xuLy9cdFx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuLy9cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncykge1xuLy9cdFx0XHRcdHRoaXMuX24gPSAwO1xuLy9cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG4vL1x0XHRcdH0gZWxzZSB7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKFwic3BvbnphL3Nwb256YS5hd2RcIik7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICB9XG5cdFxuXHRcblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgQml0bWFwIGZpbGVcblx0ICovXG5cdHByaXZhdGUgcGFyc2VCaXRtYXAoZSlcblx0e1xuXHRcdHZhciB1cmxMb2FkZXI6VVJMTG9hZGVyID0gPFVSTExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0dmFyIGltYWdlOkhUTUxJbWFnZUVsZW1lbnQgPSBQYXJzZXJVdGlscy5ibG9iVG9JbWFnZSh1cmxMb2FkZXIuZGF0YSk7XG5cdFx0aW1hZ2Uub25sb2FkID0gdGhpcy5vbkJpdG1hcENvbXBsZXRlRGVsZWdhdGU7XG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VCaXRtYXBEZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoUHJvZ3Jlc3NFdmVudC5QUk9HUkVTUywgdGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyID0gbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBiaXRtYXAgY29tcGxldGUgZXZlbnQgb24gbG9hZGVyXG5cdCAqL1xuXHRwcml2YXRlIG9uQml0bWFwQ29tcGxldGUoZTpFdmVudClcblx0e1xuXHRcdHZhciBpbWFnZTpIVE1MSW1hZ2VFbGVtZW50ID0gPEhUTUxJbWFnZUVsZW1lbnQ+IGUudGFyZ2V0O1xuXHRcdGltYWdlLm9ubG9hZCA9IG51bGw7XG5cblx0XHQvL2NyZWF0ZSBiaXRtYXAgdGV4dHVyZSBpbiBkaWN0aW9uYXJ5XG5cdFx0aWYgKCF0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dKVxuXHRcdFx0dGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dXSA9ICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncyk/IG5ldyBTcGVjdWxhckJpdG1hcFRleHR1cmUoQ2FzdC5iaXRtYXBEYXRhKGltYWdlKSkgOiBuZXcgSW1hZ2VUZXh0dXJlKGltYWdlKTtcblxuXHRcdC8vc2tpcCBudWxsIHRleHR1cmVzXG5cdFx0d2hpbGUgKHRoaXMuX24rKyA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGggLSAxKVxuXHRcdFx0aWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSlcblx0XHRcdFx0YnJlYWs7XG5cdFx0XG5cdFx0Ly9zd2l0Y2ggdG8gbmV4dCB0ZXR1cmUgc2V0XG5cdFx0aWYgKHRoaXMuX24gPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3MpIHtcblx0XHRcdHRoaXMuX24gPSAwO1xuXHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzO1xuXHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9hZChcInNwb256YS9zcG9uemEuYXdkXCIpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgQVdEIGZpbGVcblx0ICovXG5cdHByaXZhdGUgcGFyc2VBV0QoZSlcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwiUGFyc2luZyBEYXRhXCIpO1xuXHRcdHZhciB1cmxMb2FkZXI6VVJMTG9hZGVyID0gPFVSTExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0dmFyIGxvYWRlcjpMb2FkZXIgPSBuZXcgTG9hZGVyKGZhbHNlKTtcblxuXHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEFzc2V0RXZlbnQuQVNTRVRfQ09NUExFVEUsIHRoaXMub25Bc3NldENvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZURlbGVnYXRlKTtcblx0XHRsb2FkZXIubG9hZERhdGEodXJsTG9hZGVyLmRhdGEsIG5ldyBBc3NldExvYWRlckNvbnRleHQoZmFsc2UpLCBudWxsLCBuZXcgQVdEUGFyc2VyKCkpO1xuXG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoUHJvZ3Jlc3NFdmVudC5QUk9HUkVTUywgdGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VBV0REZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyID0gbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlKGV2ZW50OkFzc2V0RXZlbnQpXG5cdHtcblx0XHRpZiAoZXZlbnQuYXNzZXQuYXNzZXRUeXBlID09IEFzc2V0VHlwZS5NRVNIKSB7XG5cdFx0XHQvL3N0b3JlIG1lc2hlc1xuXHRcdFx0dGhpcy5fbWVzaGVzLnB1c2goPE1lc2g+IGV2ZW50LmFzc2V0KTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgb25jZSBhbGwgcmVzb3VyY2VzIGFyZSBsb2FkZWRcblx0ICovXG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlKGU6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHR2YXIgbWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoZmFsc2UsIGZhbHNlLCB0cnVlKTtcblxuXHRcdHZhciBsb2FkZXI6TG9hZGVyID0gPExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0bG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgdGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0bG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdFxuXHRcdC8vcmVhc3NpZ24gbWF0ZXJpYWxzXG5cdFx0dmFyIG1lc2g6TWVzaDtcblx0XHR2YXIgbmFtZTpzdHJpbmc7XG5cblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX21lc2hlcy5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdG1lc2ggPSB0aGlzLl9tZXNoZXNbaV07XG5cdFx0XHRpZiAobWVzaC5uYW1lID09IFwic3BvbnphXzA0XCIgfHwgbWVzaC5uYW1lID09IFwic3BvbnphXzM3OVwiKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dmFyIG51bTpudW1iZXIgPSBOdW1iZXIobWVzaC5uYW1lLnN1YnN0cmluZyg3KSk7XG5cblx0XHRcdG5hbWUgPSBtZXNoLm1hdGVyaWFsLm5hbWU7XG5cblx0XHRcdGlmIChuYW1lID09IFwiY29sdW1uX2NcIiAmJiAobnVtIDwgMjIgfHwgbnVtID4gMzMpKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dmFyIGNvbE51bTpudW1iZXIgPSAobnVtIC0gMTI1KTtcblx0XHRcdGlmIChuYW1lID09IFwiY29sdW1uX2JcIikge1xuXHRcdFx0XHRpZiAoY29sTnVtICA+PTAgJiYgY29sTnVtIDwgMTMyICYmIChjb2xOdW0gJSAxMSkgPCAxMCkge1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5jb2xNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgY29sTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgY29sTWVzaDpNZXNoID0gbmV3IE1lc2gobmV3IEdlb21ldHJ5KCkpO1xuXHRcdFx0XHRcdGNvbE1lcmdlLmFwcGx5VG9NZXNoZXMoY29sTWVzaCwgdGhpcy5jb2xNZXNoZXMpO1xuXHRcdFx0XHRcdG1lc2ggPSBjb2xNZXNoO1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHZhc2VOdW06bnVtYmVyID0gKG51bSAtIDMzNCk7XG5cdFx0XHRpZiAobmFtZSA9PSBcInZhc2VfaGFuZ2luZ1wiICYmICh2YXNlTnVtICUgOSkgPCA1KSB7XG5cdFx0XHRcdGlmICh2YXNlTnVtICA+PTAgJiYgdmFzZU51bSA8IDM3MCAmJiAodmFzZU51bSAlIDkpIDwgNCkge1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdHZhciB2YXNlTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgdmFzZU1lc2g6TWVzaCA9IG5ldyBNZXNoKG5ldyBHZW9tZXRyeSgpKTtcblx0XHRcdFx0XHR2YXNlTWVyZ2UuYXBwbHlUb01lc2hlcyh2YXNlTWVzaCwgdGhpcy52YXNlTWVzaGVzKTtcblx0XHRcdFx0XHRtZXNoID0gdmFzZU1lc2g7XG5cdFx0XHRcdFx0dGhpcy52YXNlTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHBvbGVOdW06bnVtYmVyID0gbnVtIC0gMjkwO1xuXHRcdFx0aWYgKG5hbWUgPT0gXCJmbGFncG9sZVwiKSB7XG5cdFx0XHRcdGlmIChwb2xlTnVtID49MCAmJiBwb2xlTnVtIDwgMzIwICYmIChwb2xlTnVtICUgMykgPCAyKSB7XG5cdFx0XHRcdFx0dGhpcy5wb2xlTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocG9sZU51bSA+PTApIHtcblx0XHRcdFx0XHR0aGlzLnBvbGVNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgcG9sZU1lcmdlOk1lcmdlID0gbmV3IE1lcmdlKCk7XG5cdFx0XHRcdFx0dmFyIHBvbGVNZXNoOk1lc2ggPSBuZXcgTWVzaChuZXcgR2VvbWV0cnkoKSk7XG5cdFx0XHRcdFx0cG9sZU1lcmdlLmFwcGx5VG9NZXNoZXMocG9sZU1lc2gsIHRoaXMucG9sZU1lc2hlcyk7XG5cdFx0XHRcdFx0bWVzaCA9IHBvbGVNZXNoO1xuXHRcdFx0XHRcdHRoaXMucG9sZU1lc2hlcyA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChuYW1lID09IFwiZmxhZ3BvbGVcIiAmJiAobnVtID09IDI2MCB8fCBudW0gPT0gMjYxIHx8IG51bSA9PSAyNjMgfHwgbnVtID09IDI2NSB8fCBudW0gPT0gMjY4IHx8IG51bSA9PSAyNjkgfHwgbnVtID09IDI3MSB8fCBudW0gPT0gMjczKSlcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciB0ZXh0dXJlSW5kZXg6bnVtYmVyID0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5pbmRleE9mKG5hbWUpO1xuXHRcdFx0aWYgKHRleHR1cmVJbmRleCA9PSAtMSB8fCB0ZXh0dXJlSW5kZXggPj0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5sZW5ndGgpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHR0aGlzLl9udW1UZXhTdHJpbmdzW3RleHR1cmVJbmRleF0rKztcblx0XHRcdFxuXHRcdFx0dmFyIHRleHR1cmVOYW1lOnN0cmluZyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuXHRcdFx0dmFyIG5vcm1hbFRleHR1cmVOYW1lOnN0cmluZztcblx0XHRcdHZhciBzcGVjdWxhclRleHR1cmVOYW1lOnN0cmluZztcblx0XHRcdFxuLy9cdFx0XHRcdC8vc3RvcmUgc2luZ2xlIHBhc3MgbWF0ZXJpYWxzIGZvciB1c2UgbGF0ZXJcbi8vXHRcdFx0XHR2YXIgc2luZ2xlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWwgPSB0aGlzLl9zaW5nbGVNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV07XG4vL1xuLy9cdFx0XHRcdGlmICghc2luZ2xlTWF0ZXJpYWwpIHtcbi8vXG4vL1x0XHRcdFx0XHQvL2NyZWF0ZSBzaW5nbGVwYXNzIG1hdGVyaWFsXG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCh0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0ZXh0dXJlTmFtZV0pO1xuLy9cbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm5hbWUgPSBuYW1lO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmFkZE1ldGhvZCh0aGlzLl9mb2dNZXRob2QpO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubWlwbWFwID0gdHJ1ZTtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5zcGVjdWxhciA9IDI7XG4vL1xuLy9cdFx0XHRcdFx0Ly91c2UgYWxwaGEgdHJhbnNwYXJhbmN5IGlmIHRleHR1cmUgaXMgcG5nXG4vL1x0XHRcdFx0XHRpZiAodGV4dHVyZU5hbWUuc3Vic3RyaW5nKHRleHR1cmVOYW1lLmxlbmd0aCAtIDMpID09IFwicG5nXCIpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmFscGhhVGhyZXNob2xkID0gMC41O1xuLy9cbi8vXHRcdFx0XHRcdC8vYWRkIG5vcm1hbCBtYXAgaWYgaXQgZXhpc3RzXG4vL1x0XHRcdFx0XHRub3JtYWxUZXh0dXJlTmFtZSA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG4vL1x0XHRcdFx0XHRpZiAobm9ybWFsVGV4dHVyZU5hbWUpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm5vcm1hbE1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W25vcm1hbFRleHR1cmVOYW1lXTtcbi8vXG4vL1x0XHRcdFx0XHQvL2FkZCBzcGVjdWxhciBtYXAgaWYgaXQgZXhpc3RzXG4vL1x0XHRcdFx0XHRzcGVjdWxhclRleHR1cmVOYW1lID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuLy9cdFx0XHRcdFx0aWYgKHNwZWN1bGFyVGV4dHVyZU5hbWUpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnNwZWN1bGFyTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbc3BlY3VsYXJUZXh0dXJlTmFtZV07XG4vL1xuLy9cdFx0XHRcdFx0dGhpcy5fc2luZ2xlTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdID0gc2luZ2xlTWF0ZXJpYWw7XG4vL1xuLy9cdFx0XHRcdH1cblxuXHRcdFx0Ly9zdG9yZSBtdWx0aSBwYXNzIG1hdGVyaWFscyBmb3IgdXNlIGxhdGVyXG5cdFx0XHR2YXIgbXVsdGlNYXRlcmlhbDpNZXRob2RNYXRlcmlhbCA9IHRoaXMuX211bHRpTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdO1xuXG5cdFx0XHRpZiAoIW11bHRpTWF0ZXJpYWwpIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vY3JlYXRlIG11bHRpcGFzcyBtYXRlcmlhbFxuXHRcdFx0XHRtdWx0aU1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RleHR1cmVOYW1lXSk7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwubW9kZSA9IE1ldGhvZE1hdGVyaWFsTW9kZS5NVUxUSV9QQVNTO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLm5hbWUgPSBuYW1lO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG4vL1x0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNoYWRvd01ldGhvZCA9IHRoaXMuX2Nhc2NhZGVNZXRob2Q7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwuc2hhZG93TWV0aG9kID0gdGhpcy5fYmFzZVNoYWRvd01ldGhvZDtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5hZGRFZmZlY3RNZXRob2QodGhpcy5fZm9nTWV0aG9kKTtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5yZXBlYXQgPSB0cnVlO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNwZWN1bGFyID0gMjtcblx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3VzZSBhbHBoYSB0cmFuc3BhcmFuY3kgaWYgdGV4dHVyZSBpcyBwbmdcblx0XHRcdFx0aWYgKHRleHR1cmVOYW1lLnN1YnN0cmluZyh0ZXh0dXJlTmFtZS5sZW5ndGggLSAzKSA9PSBcInBuZ1wiKVxuXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwuYWxwaGFUaHJlc2hvbGQgPSAwLjU7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL2FkZCBub3JtYWwgbWFwIGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRub3JtYWxUZXh0dXJlTmFtZSA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG5cdFx0XHRcdGlmIChub3JtYWxUZXh0dXJlTmFtZSlcblx0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLm5vcm1hbE1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W25vcm1hbFRleHR1cmVOYW1lXTtcblxuXHRcdFx0XHQvL2FkZCBzcGVjdWxhciBtYXAgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdHNwZWN1bGFyVGV4dHVyZU5hbWUgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG5cdFx0XHRcdGlmIChzcGVjdWxhclRleHR1cmVOYW1lKVxuXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSB0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVtzcGVjdWxhclRleHR1cmVOYW1lXTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vYWRkIHRvIG1hdGVyaWFsIGRpY3Rpb25hcnlcblx0XHRcdFx0dGhpcy5fbXVsdGlNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV0gPSBtdWx0aU1hdGVyaWFsO1xuXHRcdFx0fVxuXHRcdFx0Lypcblx0XHRcdGlmIChfbWVzaFJlZmVyZW5jZVt0ZXh0dXJlSW5kZXhdKSB7XG5cdFx0XHRcdHZhciBtOk1lc2ggPSBtZXNoLmNsb25lKCkgYXMgTWVzaDtcblx0XHRcdFx0bS5tYXRlcmlhbCA9IG11bHRpTWF0ZXJpYWw7XG5cdFx0XHRcdF92aWV3LnNjZW5lLmFkZENoaWxkKG0pO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdCovXG5cdFx0XHQvL2RlZmF1bHQgdG8gbXVsdGlwYXNzIG1hdGVyaWFsXG5cdFx0XHRtZXNoLm1hdGVyaWFsID0gbXVsdGlNYXRlcmlhbDtcblxuXHRcdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChtZXNoKTtcblxuXHRcdFx0dGhpcy5fbWVzaFJlZmVyZW5jZVt0ZXh0dXJlSW5kZXhdID0gbWVzaDtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIHo6bnVtYmVyIC8qdWludCovID0gMDtcblx0XHRcblx0XHR3aGlsZSAoeiA8IHRoaXMuX251bVRleFN0cmluZ3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5nc1t6XSwgdGhpcy5fbnVtVGV4U3RyaW5nc1t6XSk7XG5cdFx0XHR6Kys7XG5cdFx0fVxuXG5cdFx0Ly9sb2FkIHNreWJveCBhbmQgZmxhbWUgdGV4dHVyZVxuXG5cdFx0QXNzZXRMaWJyYXJ5LmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vbkV4dHJhUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9ob3VyZ2xhc3NfdGV4dHVyZS5jdWJlXCIpLCBhc3NldExvYWRlckNvbnRleHQpO1xuXG5cdFx0Ly9nbG9iZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2ZpcmUucG5nXCIpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgb25jZSBleHRyYSByZXNvdXJjZXMgYXJlIGxvYWRlZFxuXHQgKi9cblx0cHJpdmF0ZSBvbkV4dHJhUmVzb3VyY2VDb21wbGV0ZShldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHN3aXRjaCggZXZlbnQudXJsIClcblx0XHR7XG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L2hvdXJnbGFzc190ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHQvL2NyZWF0ZSBza3lib3ggdGV4dHVyZSBtYXBcblx0XHRcdFx0dGhpcy5fc2t5TWFwID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZmlyZS5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF0pO1xuXHRcdFx0XHR0aGlzLl9mbGFtZU1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5BREQ7XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwuYW5pbWF0ZVVWcyA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9za3lNYXAgJiYgdGhpcy5fZmxhbWVNYXRlcmlhbClcblx0XHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpXG5cdHtcdFxuXHRcdGlmICh0aGlzLl93YWxrU3BlZWQgfHwgdGhpcy5fd2Fsa0FjY2VsZXJhdGlvbikge1xuXHRcdFx0dGhpcy5fd2Fsa1NwZWVkID0gKHRoaXMuX3dhbGtTcGVlZCArIHRoaXMuX3dhbGtBY2NlbGVyYXRpb24pKnRoaXMuX2RyYWc7XG5cdFx0XHRpZiAoTWF0aC5hYnModGhpcy5fd2Fsa1NwZWVkKSA8IDAuMDEpXG5cdFx0XHRcdHRoaXMuX3dhbGtTcGVlZCA9IDA7XG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmluY3JlbWVudFdhbGsodGhpcy5fd2Fsa1NwZWVkKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHRoaXMuX3N0cmFmZVNwZWVkIHx8IHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbikge1xuXHRcdFx0dGhpcy5fc3RyYWZlU3BlZWQgPSAodGhpcy5fc3RyYWZlU3BlZWQgKyB0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24pKnRoaXMuX2RyYWc7XG5cdFx0XHRpZiAoTWF0aC5hYnModGhpcy5fc3RyYWZlU3BlZWQpIDwgMC4wMSlcblx0XHRcdFx0dGhpcy5fc3RyYWZlU3BlZWQgPSAwO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5pbmNyZW1lbnRTdHJhZmUodGhpcy5fc3RyYWZlU3BlZWQpO1xuXHRcdH1cblx0XHRcblx0XHQvL2FuaW1hdGUgZmxhbWVzXG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHQvL3VwZGF0ZSBmbGFtZSBsaWdodFxuXHRcdFx0dmFyIGxpZ2h0IDogUG9pbnRMaWdodCA9IGZsYW1lVk8ubGlnaHQ7XG5cdFx0XHRcblx0XHRcdGlmICghbGlnaHQpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRsaWdodC5mYWxsT2ZmID0gMzgwK01hdGgucmFuZG9tKCkqMjA7XG5cdFx0XHRsaWdodC5yYWRpdXMgPSAyMDArTWF0aC5yYW5kb20oKSozMDtcblx0XHRcdGxpZ2h0LmRpZmZ1c2UgPSAuOStNYXRoLnJhbmRvbSgpKi4xO1xuXHRcdFx0XG5cdFx0XHQvL3VwZGF0ZSBmbGFtZSBtZXNoXG5cdFx0XHR2YXIgbWVzaCA6IE1lc2ggPSBmbGFtZVZPLm1lc2g7XG5cdFx0XHRcblx0XHRcdGlmICghbWVzaClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciBzdWJNZXNoOklTdWJNZXNoID0gbWVzaC5zdWJNZXNoZXNbMF07XG5cdFx0XHRzdWJNZXNoLnV2VHJhbnNmb3JtLm9mZnNldFUgKz0gMS8xNjtcblx0XHRcdHN1Yk1lc2gudXZUcmFuc2Zvcm0ub2Zmc2V0VSAlPSAxO1xuXHRcdFx0bWVzaC5yb3RhdGlvblkgPSBNYXRoLmF0YW4yKG1lc2gueCAtIHRoaXMuX3ZpZXcuY2FtZXJhLngsIG1lc2gueiAtIHRoaXMuX3ZpZXcuY2FtZXJhLnopKjE4MC9NYXRoLlBJO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ZpZXcucmVuZGVyKCk7XG5cdFx0XG5cdH1cblx0XG5cdFx0XHRcblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBjYW1lcmEgY29udHJvbFxuXHQgKi9cblx0cHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IHRoaXMuX3dhbGtJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLl93YWxrQWNjZWxlcmF0aW9uID0gLXRoaXMuX3dhbGtJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0XHR0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24gPSAtdGhpcy5fc3RyYWZlSW5jcmVtZW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbiA9IHRoaXMuX3N0cmFmZUluY3JlbWVudDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkY6XG5cdFx0XHRcdC8vc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU47XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5DOlxuXHRcdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmZseSA9ICF0aGlzLl9jYW1lcmFDb250cm9sbGVyLmZseTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBLZXkgdXAgbGlzdGVuZXIgZm9yIGNhbWVyYSBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIG9uS2V5VXAoZXZlbnQ6S2V5Ym9hcmRFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQpXG5cdHtcblx0XHR0aGlzLl9sYXN0UGFuQW5nbGUgPSB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RUaWx0QW5nbGUgPSB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZTtcblx0XHR0aGlzLl9sYXN0TW91c2VYID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLl9sYXN0TW91c2VZID0gZXZlbnQuY2xpZW50WTtcblx0XHR0aGlzLl9tb3ZlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB1cCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQpXG5cdHtcblx0XHR0aGlzLl9tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50KVxuXHR7XG5cdFx0aWYgKHRoaXMuX21vdmUpIHtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLl9sYXN0TW91c2VYKSArIHRoaXMuX2xhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5fbGFzdE1vdXNlWSkgKyB0aGlzLl9sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBzdGFnZSBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudCA9IG51bGwpXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgICAgICAgICA9IDA7XG5cdFx0dGhpcy5fdmlldy54ICAgICAgICAgPSAwO1xuXHRcdHRoaXMuX3ZpZXcud2lkdGggICAgID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5fdmlldy5oZWlnaHQgICAgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxuLyoqXG4qIERhdGEgY2xhc3MgZm9yIHRoZSBGbGFtZSBvYmplY3RzXG4qL1xuY2xhc3MgRmxhbWVWT1xue1xuXHRwdWJsaWMgcG9zaXRpb246VmVjdG9yM0Q7XG5cdHB1YmxpYyBjb2xvcjpudW1iZXIgLyp1aW50Ki87XG5cdHB1YmxpYyBtZXNoOk1lc2g7XG5cdHB1YmxpYyBsaWdodDpQb2ludExpZ2h0O1xuXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOlZlY3RvcjNELCBjb2xvcjpudW1iZXIgLyp1aW50Ki8pXG5cdHtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yO1xuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuXHRuZXcgQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtbygpO1xufSJdfQ==