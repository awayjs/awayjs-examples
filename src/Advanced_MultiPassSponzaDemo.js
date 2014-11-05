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
var SkyboxMaterial = require("awayjs-renderergl/lib/materials/SkyboxMaterial");
var Merge = require("awayjs-renderergl/lib/tools/commands/Merge");
var DefaultRenderer = require("awayjs-renderergl/lib/DefaultRenderer");
var TriangleMethodMaterial = require("awayjs-methodmaterials/lib/TriangleMethodMaterial");
var TriangleMaterialMode = require("awayjs-methodmaterials/lib/TriangleMaterialMode");
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
        this._view = new View(new DefaultRenderer());
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
        this._view.scene.addChild(new Skybox(new SkyboxMaterial(this._skyMap)));
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
            //				var singleMaterial:TriangleMethodMaterial = this._singleMaterialDictionary[name];
            //
            //				if (!singleMaterial) {
            //
            //					//create singlepass material
            //					singleMaterial = new TriangleMethodMaterial(this._textureDictionary[textureName]);
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
                multiMaterial = new TriangleMethodMaterial(this._textureDictionary[textureName]);
                multiMaterial.materialMode = TriangleMaterialMode.MULTI_PASS;
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
                this._flameMaterial = new TriangleMethodMaterial(event.assets[0]);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnRzIl0sIm5hbWVzIjpbIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0IiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0RW5naW5lIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0TGlnaHRzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0T2JqZWN0cyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8uaW5pdExpc3RlbmVycyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8udXBkYXRlRGlyZWN0aW9uIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5jb3VudE51bVRleHR1cmVzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkUHJvZ3Jlc3MiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnBhcnNlQml0bWFwIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkJpdG1hcENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5wYXJzZUFXRCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Bc3NldENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vblJlc291cmNlQ29tcGxldGUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkVudGVyRnJhbWUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uS2V5RG93biIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25LZXlVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZURvd24iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uTW91c2VVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZU1vdmUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uUmVzaXplIiwiRmxhbWVWTyIsIkZsYW1lVk8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2Q0U7QUFFRixJQUFPLEtBQUssV0FBaUIsOEJBQThCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUN0RSxJQUFPLGFBQWEsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sV0FBVyxXQUFnQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hFLElBQU8sV0FBVyxXQUFnQixrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3RFLElBQU8sUUFBUSxXQUFpQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2pFLElBQU8sWUFBWSxXQUFnQixzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sa0JBQWtCLFdBQWMsNENBQTRDLENBQUMsQ0FBQztBQUNyRixJQUFPLFNBQVMsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFNBQVMsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNqRSxJQUFPLG1CQUFtQixXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFDbkYsSUFBTyxVQUFVLFdBQWdCLGdDQUFnQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxXQUFXLFdBQWdCLHFDQUFxQyxDQUFDLENBQUM7QUFFekUsSUFBTyxZQUFZLFdBQWdCLHVDQUF1QyxDQUFDLENBQUM7QUFDNUUsSUFBTyxxQkFBcUIsV0FBYSxnREFBZ0QsQ0FBQyxDQUFDO0FBQzNGLElBQU8s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QTtRQUU3QmlCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLElBQUlBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLElBQUlBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUN0Q0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLENBQUNBO1FBRURBLEFBQ0FBLGdCQURnQkE7WUFDWkEsT0FBZUEsQ0FBQ0E7UUFDcEJB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QVpBLFlBQVlBO1FBRTVCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQU9BLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFNQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDRnZCLG1DQUFDQTtBQUFEQSxDQXJ5QkEsQUFxeUJDQSxJQUFBO0FBRUQsQUFHQTs7RUFERTtJQUNJLE9BQU87SUFPWndCLFNBUEtBLE9BQU9BLENBT0FBLFFBQWlCQSxFQUFFQSxLQUFLQSxDQUFRQSxRQUFEQSxBQUFTQTtRQUVuREMsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUNGRCxjQUFDQTtBQUFEQSxDQVpBLEFBWUNBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSw0QkFBNEIsRUFBRSxDQUFDO0FBQ3BDLENBQUMsQ0FBQSIsImZpbGUiOiJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuQ3J5dGVrIFNwb256YSBkZW1vIHVzaW5nIG11bHRpcGFzcyBtYXRlcmlhbHMgaW4gQXdheTNEXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGFwcGx5IE11bHRpcGFzcyBtYXRlcmlhbHMgdG8gYSBtb2RlbFxuSG93IHRvIGVuYWJsZSBjYXNjYWRpbmcgc2hhZG93IG1hcHMgb24gYSBtdWx0aXBhc3MgbWF0ZXJpYWwuXG5Ib3cgdG8gc2V0dXAgbXVsdGlwbGUgbGlnaHRzb3VyY2VzLCBzaGFkb3dzIGFuZCBmb2cgZWZmZWN0cyBhbGwgaW4gdGhlIHNhbWUgc2NlbmUuXG5Ib3cgdG8gYXBwbHkgc3BlY3VsYXIsIG5vcm1hbCBhbmQgZGlmZnVzZSBtYXBzIHRvIGFuIEFXRCBtb2RlbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hbiAmIERhdmlkIExlbmFlcnRzXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuZGF2aWQubGVuYWVydHNAZ21haWwuY29tXG5odHRwOi8vd3d3LmRlcnNjaG1hbGUuY29tXG5cbk1vZGVsIHJlLW1vZGVsZWQgYnkgRnJhbmsgTWVpbmwgYXQgQ3J5dGVrIHdpdGggaW5zcGlyYXRpb24gZnJvbSBNYXJrbyBEYWJyb3ZpYydzIG9yaWdpbmFsLCBjb252ZXJ0ZWQgdG8gQVdEIGJ5IExvVEhcbmNvbnRhY3RAY3J5dGVrLmNvbVxuaHR0cDovL3d3dy5jcnl0ZWsuY29tL2NyeWVuZ2luZS9jcnllbmdpbmUzL2Rvd25sb2Fkc1xuM2RmbGFzaGxvQGdtYWlsLmNvbVxuaHR0cDovLzNkZmxhc2hsby53b3JkcHJlc3MuY29tXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbmltcG9ydCBFdmVudFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcbmltcG9ydCBBc3NldEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IFByb2dyZXNzRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Qcm9ncmVzc0V2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBVVlRyYW5zZm9ybVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1VWVHJhbnNmb3JtXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJDb250ZXh0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlckNvbnRleHRcIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IFVSTExvYWRlclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMTG9hZGVyXCIpO1xuaW1wb3J0IFVSTExvYWRlckRhdGFGb3JtYXRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMTG9hZGVyRGF0YUZvcm1hdFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFBhcnNlclV0aWxzXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3BhcnNlcnMvUGFyc2VyVXRpbHNcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJbWFnZVRleHR1cmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IFNwZWN1bGFyQml0bWFwVGV4dHVyZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9TcGVjdWxhckJpdG1hcFRleHR1cmVcIik7XG5pbXBvcnQgS2V5Ym9hcmRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91aS9LZXlib2FyZFwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9WaWV3XCIpO1xuaW1wb3J0IEZpcnN0UGVyc29uQ29udHJvbGxlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9GaXJzdFBlcnNvbkNvbnRyb2xsZXJcIik7XG5pbXBvcnQgR2VvbWV0cnlcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0dlb21ldHJ5XCIpO1xuaW1wb3J0IElTdWJNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9JU3ViTWVzaFwiKTtcbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBTa3lib3hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgRGlyZWN0aW9uYWxMaWdodFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG4vL1x0aW1wb3J0IENhc2NhZGVTaGFkb3dNYXBwZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYXNjYWRlU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IERpcmVjdGlvbmFsU2hhZG93TWFwcGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9zaGFkb3dtYXBwZXJzL0RpcmVjdGlvbmFsU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcbmltcG9ydCBQcmltaXRpdmVQbGFuZVByZWZhYlx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlUGxhbmVQcmVmYWJcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdXRpbHMvQ2FzdFwiKTtcblxuaW1wb3J0IFNreWJveE1hdGVyaWFsXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvU2t5Ym94TWF0ZXJpYWxcIik7XG5pbXBvcnQgTWVyZ2VcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi90b29scy9jb21tYW5kcy9NZXJnZVwiKTtcbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcblxuaW1wb3J0IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWxcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9UcmlhbmdsZU1ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9UcmlhbmdsZU1hdGVyaWFsTW9kZVwiKTtcbmltcG9ydCBTaGFkb3dDYXNjYWRlTWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NoYWRvd0Nhc2NhZGVNZXRob2RcIik7XG5pbXBvcnQgU2hhZG93U29mdE1ldGhvZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL1NoYWRvd1NvZnRNZXRob2RcIik7XG5pbXBvcnQgRWZmZWN0Rm9nTWV0aG9kXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL21ldGhvZHMvRWZmZWN0Rm9nTWV0aG9kXCIpO1xuXG5pbXBvcnQgQVdEUGFyc2VyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXBhcnNlcnMvbGliL0FXRFBhcnNlclwiKTtcblxuY2xhc3MgQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtb1xue1xuXHQvL3Jvb3QgZmlsZXBhdGggZm9yIGFzc2V0IGxvYWRpbmdcblx0cHJpdmF0ZSBfYXNzZXRzUm9vdDpzdHJpbmcgPSBcImFzc2V0cy9cIjtcblx0XG5cdC8vZGVmYXVsdCBtYXRlcmlhbCBkYXRhIHN0cmluZ3Ncblx0cHJpdmF0ZSBfbWF0ZXJpYWxOYW1lU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hcIiwgICAgICAgICAgICBcIk1hdGVyaWFsX18yOThcIiwgIFwiYnJpY2tzXCIsICAgICAgICAgICAgXCJjZWlsaW5nXCIsICAgICAgICAgICAgXCJjaGFpblwiLCAgICAgICAgICAgICBcImNvbHVtbl9hXCIsICAgICAgICAgIFwiY29sdW1uX2JcIiwgICAgICAgICAgXCJjb2x1bW5fY1wiLCAgICAgICAgICBcImZhYnJpY19nXCIsICAgICAgICAgICAgICBcImZhYnJpY19jXCIsICAgICAgICAgXCJmYWJyaWNfZlwiLCAgICAgICAgICAgICAgIFwiZGV0YWlsc1wiLCAgICAgICAgICBcImZhYnJpY19kXCIsICAgICAgICAgICAgIFwiZmFicmljX2FcIiwgICAgICAgIFwiZmFicmljX2VcIiwgICAgICAgICAgICAgIFwiZmxhZ3BvbGVcIiwgICAgICAgICAgXCJmbG9vclwiLCAgICAgICAgICAgIFwiMTZfX19EZWZhdWx0XCIsXCJNYXRlcmlhbF9fMjVcIixcInJvb2ZcIiwgICAgICAgXCJsZWFmXCIsICAgICAgICAgICBcInZhc2VcIiwgICAgICAgICBcInZhc2VfaGFuZ2luZ1wiLCAgICAgXCJNYXRlcmlhbF9fNTdcIiwgICBcInZhc2Vfcm91bmRcIik7XG5cdFxuXHQvL3ByaXZhdGUgY29uc3QgZGlmZnVzZVRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFtcImFyY2hfZGlmZi5hdGZcIiwgXCJiYWNrZ3JvdW5kLmF0ZlwiLCBcImJyaWNrc19hX2RpZmYuYXRmXCIsIFwiY2VpbGluZ19hX2RpZmYuYXRmXCIsIFwiY2hhaW5fdGV4dHVyZS5wbmdcIiwgXCJjb2x1bW5fYV9kaWZmLmF0ZlwiLCBcImNvbHVtbl9iX2RpZmYuYXRmXCIsIFwiY29sdW1uX2NfZGlmZi5hdGZcIiwgXCJjdXJ0YWluX2JsdWVfZGlmZi5hdGZcIiwgXCJjdXJ0YWluX2RpZmYuYXRmXCIsIFwiY3VydGFpbl9ncmVlbl9kaWZmLmF0ZlwiLCBcImRldGFpbHNfZGlmZi5hdGZcIiwgXCJmYWJyaWNfYmx1ZV9kaWZmLmF0ZlwiLCBcImZhYnJpY19kaWZmLmF0ZlwiLCBcImZhYnJpY19ncmVlbl9kaWZmLmF0ZlwiLCBcImZsYWdwb2xlX2RpZmYuYXRmXCIsIFwiZmxvb3JfYV9kaWZmLmF0ZlwiLCBcImdpX2ZsYWcuYXRmXCIsIFwibGlvbi5hdGZcIiwgXCJyb29mX2RpZmYuYXRmXCIsIFwidGhvcm5fZGlmZi5wbmdcIiwgXCJ2YXNlX2RpZi5hdGZcIiwgXCJ2YXNlX2hhbmdpbmcuYXRmXCIsIFwidmFzZV9wbGFudC5wbmdcIiwgXCJ2YXNlX3JvdW5kLmF0ZlwiXSk7XG5cdC8vcHJpdmF0ZSBjb25zdCBub3JtYWxUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihbXCJhcmNoX2Rkbi5hdGZcIiwgXCJiYWNrZ3JvdW5kX2Rkbi5hdGZcIiwgXCJicmlja3NfYV9kZG4uYXRmXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY2hhaW5fdGV4dHVyZV9kZG4uYXRmXCIsIFwiY29sdW1uX2FfZGRuLmF0ZlwiLCBcImNvbHVtbl9iX2Rkbi5hdGZcIiwgXCJjb2x1bW5fY19kZG4uYXRmXCIsIG51bGwsICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICBcImxpb24yX2Rkbi5hdGZcIiwgbnVsbCwgICAgICAgXCJ0aG9ybl9kZG4uYXRmXCIsIFwidmFzZV9kZG4uYXRmXCIsICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgIFwidmFzZV9yb3VuZF9kZG4uYXRmXCJdKTtcblx0Ly9wcml2YXRlIGNvbnN0IHNwZWN1bGFyVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oW1wiYXJjaF9zcGVjLmF0ZlwiLCBudWxsLCAgICAgICAgICAgIFwiYnJpY2tzX2Ffc3BlYy5hdGZcIiwgXCJjZWlsaW5nX2Ffc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgICAgICAgXCJjb2x1bW5fYV9zcGVjLmF0ZlwiLCBcImNvbHVtbl9iX3NwZWMuYXRmXCIsIFwiY29sdW1uX2Nfc3BlYy5hdGZcIiwgXCJjdXJ0YWluX3NwZWMuYXRmXCIsICAgICAgXCJjdXJ0YWluX3NwZWMuYXRmXCIsIFwiY3VydGFpbl9zcGVjLmF0ZlwiLCAgICAgICBcImRldGFpbHNfc3BlYy5hdGZcIiwgXCJmYWJyaWNfc3BlYy5hdGZcIiwgICAgICBcImZhYnJpY19zcGVjLmF0ZlwiLCBcImZhYnJpY19zcGVjLmF0ZlwiLCAgICAgICBcImZsYWdwb2xlX3NwZWMuYXRmXCIsIFwiZmxvb3JfYV9zcGVjLmF0ZlwiLCBudWxsLCAgICAgICAgICBudWxsLCAgICAgICBudWxsLCAgICAgICAgICAgIFwidGhvcm5fc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgXCJ2YXNlX3BsYW50X3NwZWMuYXRmXCIsIFwidmFzZV9yb3VuZF9zcGVjLmF0ZlwiXSk7XG5cdFxuXHRwcml2YXRlIF9kaWZmdXNlVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoX2RpZmYuanBnXCIsIFwiYmFja2dyb3VuZC5qcGdcIiwgXCJicmlja3NfYV9kaWZmLmpwZ1wiLCBcImNlaWxpbmdfYV9kaWZmLmpwZ1wiLCBcImNoYWluX3RleHR1cmUucG5nXCIsIFwiY29sdW1uX2FfZGlmZi5qcGdcIiwgXCJjb2x1bW5fYl9kaWZmLmpwZ1wiLCBcImNvbHVtbl9jX2RpZmYuanBnXCIsIFwiY3VydGFpbl9ibHVlX2RpZmYuanBnXCIsIFwiY3VydGFpbl9kaWZmLmpwZ1wiLCBcImN1cnRhaW5fZ3JlZW5fZGlmZi5qcGdcIiwgXCJkZXRhaWxzX2RpZmYuanBnXCIsIFwiZmFicmljX2JsdWVfZGlmZi5qcGdcIiwgXCJmYWJyaWNfZGlmZi5qcGdcIiwgXCJmYWJyaWNfZ3JlZW5fZGlmZi5qcGdcIiwgXCJmbGFncG9sZV9kaWZmLmpwZ1wiLCBcImZsb29yX2FfZGlmZi5qcGdcIiwgXCJnaV9mbGFnLmpwZ1wiLCBcImxpb24uanBnXCIsIFwicm9vZl9kaWZmLmpwZ1wiLCBcInRob3JuX2RpZmYucG5nXCIsIFwidmFzZV9kaWYuanBnXCIsIFwidmFzZV9oYW5naW5nLmpwZ1wiLCBcInZhc2VfcGxhbnQucG5nXCIsIFwidmFzZV9yb3VuZC5qcGdcIik7XG5cdHByaXZhdGUgX25vcm1hbFRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFwiYXJjaF9kZG4uanBnXCIsIFwiYmFja2dyb3VuZF9kZG4uanBnXCIsIFwiYnJpY2tzX2FfZGRuLmpwZ1wiLCBudWxsLCAgICAgICAgICAgICAgICBcImNoYWluX3RleHR1cmVfZGRuLmpwZ1wiLCBcImNvbHVtbl9hX2Rkbi5qcGdcIiwgXCJjb2x1bW5fYl9kZG4uanBnXCIsIFwiY29sdW1uX2NfZGRuLmpwZ1wiLCBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgXCJsaW9uMl9kZG4uanBnXCIsIG51bGwsICAgICAgIFwidGhvcm5fZGRuLmpwZ1wiLCBcInZhc2VfZGRuLmpwZ1wiLCAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICBcInZhc2Vfcm91bmRfZGRuLmpwZ1wiKTtcblx0cHJpdmF0ZSBfc3BlY3VsYXJUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hfc3BlYy5qcGdcIiwgbnVsbCwgICAgICAgICAgICBcImJyaWNrc19hX3NwZWMuanBnXCIsIFwiY2VpbGluZ19hX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY29sdW1uX2Ffc3BlYy5qcGdcIiwgXCJjb2x1bW5fYl9zcGVjLmpwZ1wiLCBcImNvbHVtbl9jX3NwZWMuanBnXCIsIFwiY3VydGFpbl9zcGVjLmpwZ1wiLCAgICAgIFwiY3VydGFpbl9zcGVjLmpwZ1wiLCBcImN1cnRhaW5fc3BlYy5qcGdcIiwgICAgICAgXCJkZXRhaWxzX3NwZWMuanBnXCIsIFwiZmFicmljX3NwZWMuanBnXCIsICAgICAgXCJmYWJyaWNfc3BlYy5qcGdcIiwgXCJmYWJyaWNfc3BlYy5qcGdcIiwgICAgICAgXCJmbGFncG9sZV9zcGVjLmpwZ1wiLCBcImZsb29yX2Ffc3BlYy5qcGdcIiwgbnVsbCwgICAgICAgICAgbnVsbCwgICAgICAgbnVsbCwgICAgICAgICAgICBcInRob3JuX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIFwidmFzZV9wbGFudF9zcGVjLmpwZ1wiLCBcInZhc2Vfcm91bmRfc3BlYy5qcGdcIik7XG5cdHByaXZhdGUgX251bVRleFN0cmluZ3M6QXJyYXk8bnVtYmVyIC8qdWludCovPiA9IEFycmF5PG51bWJlciAvKnVpbnQqLz4oMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDApO1xuXHRwcml2YXRlIF9tZXNoUmVmZXJlbmNlOk1lc2hbXSA9IG5ldyBBcnJheTxNZXNoPigyNSk7XG5cdFxuXHQvL2ZsYW1lIGRhdGEgb2JqZWN0c1xuXHRwcml2YXRlIF9mbGFtZURhdGE6QXJyYXk8RmxhbWVWTz4gPSBBcnJheTxGbGFtZVZPPihuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoLTYyNSwgMTY1LCAyMTkpLCAweGZmYWE0NCksIG5ldyBGbGFtZVZPKG5ldyBWZWN0b3IzRCg0ODUsIDE2NSwgMjE5KSwgMHhmZmFhNDQpLCBuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoLTYyNSwgMTY1LCAtMTQ4KSwgMHhmZmFhNDQpLCBuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoNDg1LCAxNjUsIC0xNDgpLCAweGZmYWE0NCkpO1xuXHRcblx0Ly9tYXRlcmlhbCBkaWN0aW9uYXJpZXMgdG8gaG9sZCBpbnN0YW5jZXNcblx0cHJpdmF0ZSBfdGV4dHVyZURpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9tdWx0aU1hdGVyaWFsRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHByaXZhdGUgX3NpbmdsZU1hdGVyaWFsRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdFxuXHQvL3ByaXZhdGUgbWVzaERpY3Rpb25hcnk6RGljdGlvbmFyeSA9IG5ldyBEaWN0aW9uYXJ5KCk7XG5cdHByaXZhdGUgdmFzZU1lc2hlczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRwcml2YXRlIHBvbGVNZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHJpdmF0ZSBjb2xNZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0XG5cdC8vZW5naWVuIHZhcmlhYmxlc1xuXHRwcml2YXRlIF92aWV3OlZpZXc7XG5cdHByaXZhdGUgX2NhbWVyYUNvbnRyb2xsZXI6Rmlyc3RQZXJzb25Db250cm9sbGVyO1xuXHRcblx0Ly9ndWkgdmFyaWFibGVzXG5cdHByaXZhdGUgX3NpbmdsZVBhc3NNYXRlcmlhbDpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX211bHRpUGFzc01hdGVyaWFsOmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9jYXNjYWRlTGV2ZWxzOm51bWJlciAvKnVpbnQqLyA9IDM7XG5cdHByaXZhdGUgX3NoYWRvd09wdGlvbnM6c3RyaW5nID0gXCJQQ0ZcIjtcblx0cHJpdmF0ZSBfZGVwdGhNYXBTaXplOm51bWJlciAvKnVpbnQqLyA9IDIwNDg7XG5cdHByaXZhdGUgX2xpZ2h0RGlyZWN0aW9uOm51bWJlciA9IE1hdGguUEkvMjtcblx0cHJpdmF0ZSBfbGlnaHRFbGV2YXRpb246bnVtYmVyID0gTWF0aC5QSS8xODtcblx0XG5cdC8vbGlnaHQgdmFyaWFibGVzXG5cdHByaXZhdGUgX2xpZ2h0UGlja2VyOlN0YXRpY0xpZ2h0UGlja2VyO1xuXHRwcml2YXRlIF9iYXNlU2hhZG93TWV0aG9kOlNoYWRvd1NvZnRNZXRob2Q7XG5cdHByaXZhdGUgX2Nhc2NhZGVNZXRob2Q6U2hhZG93Q2FzY2FkZU1ldGhvZDtcblx0cHJpdmF0ZSBfZm9nTWV0aG9kIDogRWZmZWN0Rm9nTWV0aG9kO1xuXHRwcml2YXRlIF9jYXNjYWRlU2hhZG93TWFwcGVyOkRpcmVjdGlvbmFsU2hhZG93TWFwcGVyO1xuXHRwcml2YXRlIF9kaXJlY3Rpb25hbExpZ2h0OkRpcmVjdGlvbmFsTGlnaHQ7XG5cdHByaXZhdGUgX2xpZ2h0czpBcnJheTxhbnk+ID0gbmV3IEFycmF5PGFueT4oKTtcblx0XG5cdC8vbWF0ZXJpYWwgdmFyaWFibGVzXG5cdHByaXZhdGUgX3NreU1hcDpJbWFnZUN1YmVUZXh0dXJlO1xuXHRwcml2YXRlIF9mbGFtZU1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX251bVRleHR1cmVzOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnRUZXh0dXJlOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdHByaXZhdGUgX2xvYWRpbmdUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+O1xuXHRwcml2YXRlIF9uOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdHByaXZhdGUgX2xvYWRpbmdUZXh0OnN0cmluZztcblx0XG5cdC8vc2NlbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgX21lc2hlczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRwcml2YXRlIF9mbGFtZUdlb21ldHJ5OlByaW1pdGl2ZVBsYW5lUHJlZmFiO1xuXHRcdFx0XG5cdC8vcm90YXRpb24gdmFyaWFibGVzXG5cdHByaXZhdGUgX21vdmU6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9sYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWDpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVk6bnVtYmVyO1xuXHRcblx0Ly9tb3ZlbWVudCB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfZHJhZzpudW1iZXIgPSAwLjU7XG5cdHByaXZhdGUgX3dhbGtJbmNyZW1lbnQ6bnVtYmVyID0gMTA7XG5cdHByaXZhdGUgX3N0cmFmZUluY3JlbWVudDpudW1iZXIgPSAxMDtcblx0cHJpdmF0ZSBfd2Fsa1NwZWVkOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3N0cmFmZVNwZWVkOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3dhbGtBY2NlbGVyYXRpb246bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfc3RyYWZlQWNjZWxlcmF0aW9uOm51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cdHByaXZhdGUgcGFyc2VBV0REZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcGFyc2VCaXRtYXBEZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgbG9hZFByb2dyZXNzRGVsZWdhdGU6KGV2ZW50OlByb2dyZXNzRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgb25CaXRtYXBDb21wbGV0ZURlbGVnYXRlOihldmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBvbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZTooZXZlbnQ6QXNzZXRFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBvblJlc291cmNlQ29tcGxldGVEZWxlZ2F0ZTooZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKVxuXHR7XG5cdFx0dGhpcy5pbml0RW5naW5lKCk7XG5cdFx0dGhpcy5pbml0TGlnaHRzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdFx0XG5cdFx0XG5cdFx0Ly9jb3VudCB0ZXh0dXJlc1xuXHRcdHRoaXMuX24gPSAwO1xuXHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncztcblx0XHR0aGlzLmNvdW50TnVtVGV4dHVyZXMoKTtcblx0XHRcblx0XHQvL2tpY2tvZmYgYXNzZXQgbG9hZGluZ1xuXHRcdHRoaXMuX24gPSAwO1xuXHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncztcblx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGVuZ2luZVxuXHQgKi9cblx0cHJpdmF0ZSBpbml0RW5naW5lKClcblx0e1xuXHRcdC8vY3JlYXRlIHRoZSB2aWV3XG5cdFx0dGhpcy5fdmlldyA9IG5ldyBWaWV3KG5ldyBEZWZhdWx0UmVuZGVyZXIoKSk7XG5cdFx0dGhpcy5fdmlldy5jYW1lcmEueSA9IDE1MDtcblx0XHR0aGlzLl92aWV3LmNhbWVyYS56ID0gMDtcblx0XHRcblx0XHQvL3NldHVwIGNvbnRyb2xsZXIgdG8gYmUgdXNlZCBvbiB0aGUgY2FtZXJhXG5cdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlciA9IG5ldyBGaXJzdFBlcnNvbkNvbnRyb2xsZXIodGhpcy5fdmlldy5jYW1lcmEsIDkwLCAwLCAtODAsIDgwKTtcdFx0XHRcblx0fVxuXHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpZ2h0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKClcblx0e1xuXHRcdC8vY3JlYXRlIGxpZ2h0cyBhcnJheVxuXHRcdHRoaXMuX2xpZ2h0cyA9IG5ldyBBcnJheTxhbnk+KCk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgZ2xvYmFsIGRpcmVjdGlvbmFsIGxpZ2h0XG4vL1x0XHRcdHRoaXMuX2Nhc2NhZGVTaGFkb3dNYXBwZXIgPSBuZXcgQ2FzY2FkZVNoYWRvd01hcHBlcigzKTtcbi8vXHRcdFx0dGhpcy5fY2FzY2FkZVNoYWRvd01hcHBlci5saWdodE9mZnNldCA9IDIwMDAwO1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgtMSwgLTE1LCAxKTtcbi8vXHRcdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5zaGFkb3dNYXBwZXIgPSB0aGlzLl9jYXNjYWRlU2hhZG93TWFwcGVyO1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuY29sb3IgPSAweGVlZGRkZDtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmFtYmllbnQgPSAuMzU7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5hbWJpZW50Q29sb3IgPSAweDgwODA5MDtcblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQpO1xuXHRcdHRoaXMuX2xpZ2h0cy5wdXNoKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQpO1xuXG5cdFx0dGhpcy51cGRhdGVEaXJlY3Rpb24oKTtcblx0XHRcblx0XHQvL2NyZWF0ZSBmbGFtZSBsaWdodHNcblx0XHR2YXIgZmxhbWVWTzpGbGFtZVZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fZmxhbWVEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0ZmxhbWVWTyA9IHRoaXMuX2ZsYW1lRGF0YVtpXTtcblx0XHRcdHZhciBsaWdodCA6IFBvaW50TGlnaHQgPSBmbGFtZVZPLmxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHRcdGxpZ2h0LnJhZGl1cyA9IDIwMDtcblx0XHRcdGxpZ2h0LmZhbGxPZmYgPSA2MDA7XG5cdFx0XHRsaWdodC5jb2xvciA9IGZsYW1lVk8uY29sb3I7XG5cdFx0XHRsaWdodC55ID0gMTA7XG5cdFx0XHR0aGlzLl9saWdodHMucHVzaChsaWdodCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vY3JlYXRlIG91ciBnbG9iYWwgbGlnaHQgcGlja2VyXG5cdFx0dGhpcy5fbGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIodGhpcy5fbGlnaHRzKTtcblx0XHR0aGlzLl9iYXNlU2hhZG93TWV0aG9kID0gbmV3IFNoYWRvd1NvZnRNZXRob2QodGhpcy5fZGlyZWN0aW9uYWxMaWdodCAsIDEwICwgNSApO1xuLy9cdFx0XHR0aGlzLl9iYXNlU2hhZG93TWV0aG9kID0gbmV3IFNoYWRvd0ZpbHRlcmVkTWV0aG9kKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIG91ciBnbG9iYWwgZm9nIG1ldGhvZFxuXHRcdHRoaXMuX2ZvZ01ldGhvZCA9IG5ldyBFZmZlY3RGb2dNZXRob2QoMCwgNDAwMCwgMHg5MDkwZTcpO1xuLy9cdFx0XHR0aGlzLl9jYXNjYWRlTWV0aG9kID0gbmV3IFNoYWRvd0Nhc2NhZGVNZXRob2QodGhpcy5fYmFzZVNoYWRvd01ldGhvZCk7XG5cdH1cblx0XHRcdFxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgc2NlbmUgb2JqZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0T2JqZWN0cygpXG5cdHtcblx0XHQvL2NyZWF0ZSBza3lib3hcblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG5ldyBTa3lib3gobmV3IFNreWJveE1hdGVyaWFsKHRoaXMuX3NreU1hcCkpKTtcblx0XHRcblx0XHQvL2NyZWF0ZSBmbGFtZSBtZXNoZXNcblx0XHR0aGlzLl9mbGFtZUdlb21ldHJ5ID0gbmV3IFByaW1pdGl2ZVBsYW5lUHJlZmFiKDQwLCA4MCwgMSwgMSwgZmFsc2UsIHRydWUpO1xuXHRcdHZhciBmbGFtZVZPOkZsYW1lVk87XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9mbGFtZURhdGEubGVuZ3RoO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRmbGFtZVZPID0gdGhpcy5fZmxhbWVEYXRhW2ldO1xuXHRcdFx0dmFyIG1lc2g6TWVzaCA9IGZsYW1lVk8ubWVzaCA9IDxNZXNoPiB0aGlzLl9mbGFtZUdlb21ldHJ5LmdldE5ld09iamVjdCgpO1xuXHRcdFx0bWVzaC5tYXRlcmlhbCA9IHRoaXMuX2ZsYW1lTWF0ZXJpYWw7XG5cdFx0XHRtZXNoLnRyYW5zZm9ybS5wb3NpdGlvbiA9IGZsYW1lVk8ucG9zaXRpb247XG5cdFx0XHRtZXNoLnN1Yk1lc2hlc1swXS51dlRyYW5zZm9ybSA9IG5ldyBVVlRyYW5zZm9ybSgpXG5cdFx0XHRtZXNoLnN1Yk1lc2hlc1swXS51dlRyYW5zZm9ybS5zY2FsZVUgPSAxLzE2O1xuXHRcdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChtZXNoKTtcblx0XHRcdG1lc2guYWRkQ2hpbGQoZmxhbWVWTy5saWdodCk7XG5cdFx0fVxuXHR9XG5cdFx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaXN0ZW5lcnNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpc3RlbmVycygpXG5cdHtcblx0XHQvL2FkZCBsaXN0ZW5lcnNcblx0XHR3aW5kb3cub25yZXNpemUgID0gKGV2ZW50KSA9PiB0aGlzLm9uUmVzaXplKGV2ZW50KTtcblxuXHRcdGRvY3VtZW50Lm9ubW91c2Vkb3duID0gKGV2ZW50KSA9PiB0aGlzLm9uTW91c2VEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNldXAgPSAoZXZlbnQpID0+IHRoaXMub25Nb3VzZVVwKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbm1vdXNlbW92ZSA9IChldmVudCkgPT4gdGhpcy5vbk1vdXNlTW92ZShldmVudCk7XG5cdFx0ZG9jdW1lbnQub25rZXlkb3duID0gKGV2ZW50KSA9PiB0aGlzLm9uS2V5RG93bihldmVudCk7XG5cdFx0ZG9jdW1lbnQub25rZXl1cCA9IChldmVudCkgPT4gdGhpcy5vbktleVVwKGV2ZW50KTtcblxuXHRcdHRoaXMub25SZXNpemUoKTtcblxuXHRcdHRoaXMucGFyc2VBV0REZWxlZ2F0ZSA9IChldmVudDpFdmVudCkgPT4gdGhpcy5wYXJzZUFXRChldmVudCk7XG5cdFx0dGhpcy5wYXJzZUJpdG1hcERlbGVnYXRlID0gKGV2ZW50KSA9PiB0aGlzLnBhcnNlQml0bWFwKGV2ZW50KTtcblx0XHR0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlID0gKGV2ZW50OlByb2dyZXNzRXZlbnQpID0+IHRoaXMubG9hZFByb2dyZXNzKGV2ZW50KTtcblx0XHR0aGlzLm9uQml0bWFwQ29tcGxldGVEZWxlZ2F0ZSA9IChldmVudCkgPT4gdGhpcy5vbkJpdG1hcENvbXBsZXRlKGV2ZW50KTtcblx0XHR0aGlzLm9uQXNzZXRDb21wbGV0ZURlbGVnYXRlID0gKGV2ZW50OkFzc2V0RXZlbnQpID0+IHRoaXMub25Bc3NldENvbXBsZXRlKGV2ZW50KTtcblx0XHR0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZURlbGVnYXRlID0gKGV2ZW50OkxvYWRlckV2ZW50KSA9PiB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZShldmVudCk7XG5cblx0XHR0aGlzLl90aW1lciA9IG5ldyBSZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5vbkVudGVyRnJhbWUsIHRoaXMpO1xuXHRcdHRoaXMuX3RpbWVyLnN0YXJ0KCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBtYXRlcmlhbCBtb2RlIGJldHdlZW4gc2luZ2xlIHBhc3MgYW5kIG11bHRpIHBhc3Ncblx0ICovXG4vL1x0XHRwcml2YXRlIHVwZGF0ZU1hdGVyaWFsUGFzcyhtYXRlcmlhbERpY3Rpb25hcnk6RGljdGlvbmFyeSlcbi8vXHRcdHtcbi8vXHRcdFx0dmFyIG1lc2g6TWVzaDtcbi8vXHRcdFx0dmFyIG5hbWU6c3RyaW5nO1xuLy9cdFx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX21lc2hlcy5sZW5ndGg7XG4vL1x0XHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4vL1x0XHRcdFx0bWVzaCA9IHRoaXMuX21lc2hlc1tpXTtcbi8vXHRcdFx0XHRpZiAobWVzaC5uYW1lID09IFwic3BvbnphXzA0XCIgfHwgbWVzaC5uYW1lID09IFwic3BvbnphXzM3OVwiKVxuLy9cdFx0XHRcdFx0Y29udGludWU7XG4vL1x0XHRcdFx0bmFtZSA9IG1lc2gubWF0ZXJpYWwubmFtZTtcbi8vXHRcdFx0XHR2YXIgdGV4dHVyZUluZGV4Om51bWJlciA9IHRoaXMuX21hdGVyaWFsTmFtZVN0cmluZ3MuaW5kZXhPZihuYW1lKTtcbi8vXHRcdFx0XHRpZiAodGV4dHVyZUluZGV4ID09IC0xIHx8IHRleHR1cmVJbmRleCA+PSB0aGlzLl9tYXRlcmlhbE5hbWVTdHJpbmdzLmxlbmd0aClcbi8vXHRcdFx0XHRcdGNvbnRpbnVlO1xuLy9cbi8vXHRcdFx0XHRtZXNoLm1hdGVyaWFsID0gbWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdO1xuLy9cdFx0XHR9XG4vL1x0XHR9XG5cdFxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZGlyZWN0aW9uIG9mIHRoZSBkaXJlY3Rpb25hbCBsaWdodHNvdXJjZVxuXHQgKi9cblx0cHJpdmF0ZSB1cGRhdGVEaXJlY3Rpb24oKVxuXHR7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5kaXJlY3Rpb24gPSBuZXcgVmVjdG9yM0QoXG5cdFx0XHRNYXRoLnNpbih0aGlzLl9saWdodEVsZXZhdGlvbikqTWF0aC5jb3ModGhpcy5fbGlnaHREaXJlY3Rpb24pLFxuXHRcdFx0LU1hdGguY29zKHRoaXMuX2xpZ2h0RWxldmF0aW9uKSxcblx0XHRcdE1hdGguc2luKHRoaXMuX2xpZ2h0RWxldmF0aW9uKSpNYXRoLnNpbih0aGlzLl9saWdodERpcmVjdGlvbilcblx0XHQpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogQ291bnQgdGhlIHRvdGFsIG51bWJlciBvZiB0ZXh0dXJlcyB0byBiZSBsb2FkZWRcblx0ICovXG5cdHByaXZhdGUgY291bnROdW1UZXh0dXJlcygpXG5cdHtcblx0XHR0aGlzLl9udW1UZXh0dXJlcysrO1xuXHRcdFxuXHRcdC8vc2tpcCBudWxsIHRleHR1cmVzXG5cdFx0d2hpbGUgKHRoaXMuX24rKyA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGggLSAxKVxuXHRcdFx0aWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSlcblx0XHRcdFx0YnJlYWs7XG5cdFx0XG5cdFx0Ly9zd2l0Y2ggdG8gbmV4dCB0ZXR1cmUgc2V0XG5cdFx0aWYgKHRoaXMuX24gPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmNvdW50TnVtVGV4dHVyZXMoKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3MpIHtcblx0XHRcdHRoaXMuX24gPSAwO1xuXHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmNvdW50TnVtVGV4dHVyZXMoKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzO1xuXHRcdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogR2xvYmFsIGJpbmFyeSBmaWxlIGxvYWRlclxuXHQgKi9cblx0cHJpdmF0ZSBsb2FkKHVybDpzdHJpbmcpXG5cdHtcblx0XHR2YXIgbG9hZGVyOlVSTExvYWRlciA9IG5ldyBVUkxMb2FkZXIoKTtcblx0XHRzd2l0Y2ggKHVybC5zdWJzdHJpbmcodXJsLmxlbmd0aCAtIDMpKSB7XG5cdFx0XHRjYXNlIFwiQVdEXCI6IFxuXHRcdFx0Y2FzZSBcImF3ZFwiOlxuXHRcdFx0XHRsb2FkZXIuZGF0YUZvcm1hdCA9IFVSTExvYWRlckRhdGFGb3JtYXQuQVJSQVlfQlVGRkVSO1xuXHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dCA9IFwiTG9hZGluZyBNb2RlbFwiO1xuXHRcdFx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUFXRERlbGVnYXRlKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwicG5nXCI6IFxuXHRcdFx0Y2FzZSBcImpwZ1wiOlxuXHRcdFx0XHRsb2FkZXIuZGF0YUZvcm1hdCA9IFVSTExvYWRlckRhdGFGb3JtYXQuQkxPQjtcblx0XHRcdFx0dGhpcy5fY3VycmVudFRleHR1cmUrKztcblx0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHQgPSBcIkxvYWRpbmcgVGV4dHVyZXNcIjtcblx0XHRcdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VCaXRtYXBEZWxlZ2F0ZSk7XG5cdFx0XHRcdHVybCA9IFwic3BvbnphL1wiICsgdXJsO1xuXHRcdFx0XHRicmVhaztcbi8vXHRcdFx0XHRjYXNlIFwiYXRmXCI6XG4vL1x0XHRcdFx0XHR0aGlzLl9jdXJyZW50VGV4dHVyZSsrO1xuLy9cdFx0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHQgPSBcIkxvYWRpbmcgVGV4dHVyZXNcIjtcbi8vICAgICAgICAgICAgICAgICAgICBsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgKGV2ZW50OkV2ZW50KSA9PiB0aGlzLm9uQVRGQ29tcGxldGUoZXZlbnQpKTtcbi8vXHRcdFx0XHRcdHVybCA9IFwic3BvbnphL2F0Zi9cIiArIHVybDtcbi8vICAgICAgICAgICAgICAgICAgICBicmVhaztcblx0XHR9XG5cdFx0XG5cdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoUHJvZ3Jlc3NFdmVudC5QUk9HUkVTUywgdGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSk7XG5cdFx0dmFyIHVybFJlcTpVUkxSZXF1ZXN0ID0gbmV3IFVSTFJlcXVlc3QodGhpcy5fYXNzZXRzUm9vdCt1cmwpO1xuXHRcdGxvYWRlci5sb2FkKHVybFJlcSk7XG5cdFx0XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBEaXNwbGF5IGN1cnJlbnQgbG9hZFxuXHQgKi9cblx0cHJpdmF0ZSBsb2FkUHJvZ3Jlc3MoZTpQcm9ncmVzc0V2ZW50KVxuXHR7XG5cdFx0Ly9UT0RPIHdvcmsgb3V0IHdoeSB0aGUgY2FzdGluZyBvbiBQcm9ncmVzc0V2ZW50IGZhaWxzIGZvciBieXRlc0xvYWRlZCBhbmQgYnl0ZXNUb3RhbCBwcm9wZXJ0aWVzXG5cdFx0dmFyIFA6bnVtYmVyID0gTWF0aC5mbG9vcihlW1wiYnl0ZXNMb2FkZWRcIl0gLyBlW1wiYnl0ZXNUb3RhbFwiXSAqIDEwMCk7XG5cdFx0aWYgKFAgIT0gMTAwKSB7XG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLl9sb2FkaW5nVGV4dCArICdcXG4nICsgKCh0aGlzLl9sb2FkaW5nVGV4dCA9PSBcIkxvYWRpbmcgTW9kZWxcIik/IE1hdGguZmxvb3IoKGVbXCJieXRlc0xvYWRlZFwiXSAvIDEwMjQpIDw8IDApICsgJ2tiIHwgJyArIE1hdGguZmxvb3IoKGVbXCJieXRlc1RvdGFsXCJdIC8gMTAyNCkgPDwgMCkgKyAna2InIDogdGhpcy5fY3VycmVudFRleHR1cmUgKyAnIHwgJyArIHRoaXMuX251bVRleHR1cmVzKSk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBBVEYgZmlsZVxuXHQgKi9cbi8vXHRcdHByaXZhdGUgb25BVEZDb21wbGV0ZShlOkV2ZW50KVxuLy9cdFx0e1xuLy8gICAgICAgICAgICB2YXIgbG9hZGVyOlVSTExvYWRlciA9IFVSTExvYWRlcihlLnRhcmdldCk7XG4vLyAgICAgICAgICAgIGxvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLm9uQVRGQ29tcGxldGUpO1xuLy9cbi8vXHRcdFx0aWYgKCF0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dKVxuLy9cdFx0XHR7XG4vL1x0XHRcdFx0dGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dXSA9IG5ldyBBVEZUZXh0dXJlKGxvYWRlci5kYXRhKTtcbi8vXHRcdFx0fVxuLy9cbi8vICAgICAgICAgICAgbG9hZGVyLmRhdGEgPSBudWxsO1xuLy8gICAgICAgICAgICBsb2FkZXIuY2xvc2UoKTtcbi8vXHRcdFx0bG9hZGVyID0gbnVsbDtcbi8vXG4vL1xuLy9cdFx0XHQvL3NraXAgbnVsbCB0ZXh0dXJlc1xuLy9cdFx0XHR3aGlsZSAodGhpcy5fbisrIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCAtIDEpXG4vL1x0XHRcdFx0aWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSlcbi8vXHRcdFx0XHRcdGJyZWFrO1xuLy9cbi8vXHRcdFx0Ly9zd2l0Y2ggdG8gbmV4dCB0ZXR1cmUgc2V0XG4vLyAgICAgICAgICAgIGlmICh0aGlzLl9uIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCkge1xuLy9cdFx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuLy9cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3MpIHtcbi8vXHRcdFx0XHR0aGlzLl9uID0gMDtcbi8vXHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncztcbi8vXHRcdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcbi8vXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3MpIHtcbi8vXHRcdFx0XHR0aGlzLl9uID0gMDtcbi8vXHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzO1xuLy9cdFx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuLy9cdFx0XHR9IGVsc2Uge1xuLy9cdFx0XHRcdHRoaXMubG9hZChcInNwb256YS9zcG9uemEuYXdkXCIpO1xuLy8gICAgICAgICAgICB9XG4vLyAgICAgICAgfVxuXHRcblx0XG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIEJpdG1hcCBmaWxlXG5cdCAqL1xuXHRwcml2YXRlIHBhcnNlQml0bWFwKGUpXG5cdHtcblx0XHR2YXIgdXJsTG9hZGVyOlVSTExvYWRlciA9IDxVUkxMb2FkZXI+IGUudGFyZ2V0O1xuXHRcdHZhciBpbWFnZTpIVE1MSW1hZ2VFbGVtZW50ID0gUGFyc2VyVXRpbHMuYmxvYlRvSW1hZ2UodXJsTG9hZGVyLmRhdGEpO1xuXHRcdGltYWdlLm9ubG9hZCA9IHRoaXMub25CaXRtYXBDb21wbGV0ZURlbGVnYXRlO1xuXHRcdHVybExvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLnBhcnNlQml0bWFwRGVsZWdhdGUpO1xuXHRcdHVybExvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKFByb2dyZXNzRXZlbnQuUFJPR1JFU1MsIHRoaXMubG9hZFByb2dyZXNzRGVsZWdhdGUpO1xuXHRcdHVybExvYWRlciA9IG51bGw7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBMaXN0ZW5lciBmb3IgYml0bWFwIGNvbXBsZXRlIGV2ZW50IG9uIGxvYWRlclxuXHQgKi9cblx0cHJpdmF0ZSBvbkJpdG1hcENvbXBsZXRlKGU6RXZlbnQpXG5cdHtcblx0XHR2YXIgaW1hZ2U6SFRNTEltYWdlRWxlbWVudCA9IDxIVE1MSW1hZ2VFbGVtZW50PiBlLnRhcmdldDtcblx0XHRpbWFnZS5vbmxvYWQgPSBudWxsO1xuXG5cdFx0Ly9jcmVhdGUgYml0bWFwIHRleHR1cmUgaW4gZGljdGlvbmFyeVxuXHRcdGlmICghdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dXSlcblx0XHRcdHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0gPSAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3MpPyBuZXcgU3BlY3VsYXJCaXRtYXBUZXh0dXJlKENhc3QuYml0bWFwRGF0YShpbWFnZSkpIDogbmV3IEltYWdlVGV4dHVyZShpbWFnZSk7XG5cblx0XHQvL3NraXAgbnVsbCB0ZXh0dXJlc1xuXHRcdHdoaWxlICh0aGlzLl9uKysgPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoIC0gMSlcblx0XHRcdGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFxuXHRcdC8vc3dpdGNoIHRvIG5leHQgdGV0dXJlIHNldFxuXHRcdGlmICh0aGlzLl9uIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzO1xuXHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3MpIHtcblx0XHRcdHRoaXMuX24gPSAwO1xuXHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmxvYWQoXCJzcG9uemEvc3BvbnphLmF3ZFwiKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIEFXRCBmaWxlXG5cdCAqL1xuXHRwcml2YXRlIHBhcnNlQVdEKGUpXG5cdHtcblx0XHRjb25zb2xlLmxvZyhcIlBhcnNpbmcgRGF0YVwiKTtcblx0XHR2YXIgdXJsTG9hZGVyOlVSTExvYWRlciA9IDxVUkxMb2FkZXI+IGUudGFyZ2V0O1xuXHRcdHZhciBsb2FkZXI6TG9hZGVyID0gbmV3IExvYWRlcihmYWxzZSk7XG5cblx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihBc3NldEV2ZW50LkFTU0VUX0NPTVBMRVRFLCB0aGlzLm9uQXNzZXRDb21wbGV0ZURlbGVnYXRlKTtcblx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgdGhpcy5vblJlc291cmNlQ29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0bG9hZGVyLmxvYWREYXRhKHVybExvYWRlci5kYXRhLCBuZXcgQXNzZXRMb2FkZXJDb250ZXh0KGZhbHNlKSwgbnVsbCwgbmV3IEFXRFBhcnNlcigpKTtcblxuXHRcdHVybExvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKFByb2dyZXNzRXZlbnQuUFJPR1JFU1MsIHRoaXMubG9hZFByb2dyZXNzRGVsZWdhdGUpO1xuXHRcdHVybExvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLnBhcnNlQVdERGVsZWdhdGUpO1xuXHRcdHVybExvYWRlciA9IG51bGw7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBMaXN0ZW5lciBmb3IgYXNzZXQgY29tcGxldGUgZXZlbnQgb24gbG9hZGVyXG5cdCAqL1xuXHRwcml2YXRlIG9uQXNzZXRDb21wbGV0ZShldmVudDpBc3NldEV2ZW50KVxuXHR7XG5cdFx0aWYgKGV2ZW50LmFzc2V0LmFzc2V0VHlwZSA9PSBBc3NldFR5cGUuTUVTSCkge1xuXHRcdFx0Ly9zdG9yZSBtZXNoZXNcblx0XHRcdHRoaXMuX21lc2hlcy5wdXNoKDxNZXNoPiBldmVudC5hc3NldCk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogVHJpZ2dlcmVkIG9uY2UgYWxsIHJlc291cmNlcyBhcmUgbG9hZGVkXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZShlOkxvYWRlckV2ZW50KVxuXHR7XG5cdFx0dmFyIG1lcmdlOk1lcmdlID0gbmV3IE1lcmdlKGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG5cblx0XHR2YXIgbG9hZGVyOkxvYWRlciA9IDxMb2FkZXI+IGUudGFyZ2V0O1xuXHRcdGxvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKEFzc2V0RXZlbnQuQVNTRVRfQ09NUExFVEUsIHRoaXMub25Bc3NldENvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdGxvYWRlci5yZW1vdmVFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZURlbGVnYXRlKTtcblx0XHRcblx0XHQvL3JlYXNzaWduIG1hdGVyaWFsc1xuXHRcdHZhciBtZXNoOk1lc2g7XG5cdFx0dmFyIG5hbWU6c3RyaW5nO1xuXG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9tZXNoZXMubGVuZ3RoO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRtZXNoID0gdGhpcy5fbWVzaGVzW2ldO1xuXHRcdFx0aWYgKG1lc2gubmFtZSA9PSBcInNwb256YV8wNFwiIHx8IG1lc2gubmFtZSA9PSBcInNwb256YV8zNzlcIilcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdHZhciBudW06bnVtYmVyID0gTnVtYmVyKG1lc2gubmFtZS5zdWJzdHJpbmcoNykpO1xuXG5cdFx0XHRuYW1lID0gbWVzaC5tYXRlcmlhbC5uYW1lO1xuXG5cdFx0XHRpZiAobmFtZSA9PSBcImNvbHVtbl9jXCIgJiYgKG51bSA8IDIyIHx8IG51bSA+IDMzKSlcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdHZhciBjb2xOdW06bnVtYmVyID0gKG51bSAtIDEyNSk7XG5cdFx0XHRpZiAobmFtZSA9PSBcImNvbHVtbl9iXCIpIHtcblx0XHRcdFx0aWYgKGNvbE51bSAgPj0wICYmIGNvbE51bSA8IDEzMiAmJiAoY29sTnVtICUgMTEpIDwgMTApIHtcblx0XHRcdFx0XHR0aGlzLmNvbE1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0dmFyIGNvbE1lcmdlOk1lcmdlID0gbmV3IE1lcmdlKCk7XG5cdFx0XHRcdFx0dmFyIGNvbE1lc2g6TWVzaCA9IG5ldyBNZXNoKG5ldyBHZW9tZXRyeSgpKTtcblx0XHRcdFx0XHRjb2xNZXJnZS5hcHBseVRvTWVzaGVzKGNvbE1lc2gsIHRoaXMuY29sTWVzaGVzKTtcblx0XHRcdFx0XHRtZXNoID0gY29sTWVzaDtcblx0XHRcdFx0XHR0aGlzLmNvbE1lc2hlcyA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHZhciB2YXNlTnVtOm51bWJlciA9IChudW0gLSAzMzQpO1xuXHRcdFx0aWYgKG5hbWUgPT0gXCJ2YXNlX2hhbmdpbmdcIiAmJiAodmFzZU51bSAlIDkpIDwgNSkge1xuXHRcdFx0XHRpZiAodmFzZU51bSAgPj0wICYmIHZhc2VOdW0gPCAzNzAgJiYgKHZhc2VOdW0gJSA5KSA8IDQpIHtcblx0XHRcdFx0XHR0aGlzLnZhc2VNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLnZhc2VNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgdmFzZU1lcmdlOk1lcmdlID0gbmV3IE1lcmdlKCk7XG5cdFx0XHRcdFx0dmFyIHZhc2VNZXNoOk1lc2ggPSBuZXcgTWVzaChuZXcgR2VvbWV0cnkoKSk7XG5cdFx0XHRcdFx0dmFzZU1lcmdlLmFwcGx5VG9NZXNoZXModmFzZU1lc2gsIHRoaXMudmFzZU1lc2hlcyk7XG5cdFx0XHRcdFx0bWVzaCA9IHZhc2VNZXNoO1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcyA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHZhciBwb2xlTnVtOm51bWJlciA9IG51bSAtIDI5MDtcblx0XHRcdGlmIChuYW1lID09IFwiZmxhZ3BvbGVcIikge1xuXHRcdFx0XHRpZiAocG9sZU51bSA+PTAgJiYgcG9sZU51bSA8IDMyMCAmJiAocG9sZU51bSAlIDMpIDwgMikge1xuXHRcdFx0XHRcdHRoaXMucG9sZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHBvbGVOdW0gPj0wKSB7XG5cdFx0XHRcdFx0dGhpcy5wb2xlTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0dmFyIHBvbGVNZXJnZTpNZXJnZSA9IG5ldyBNZXJnZSgpO1xuXHRcdFx0XHRcdHZhciBwb2xlTWVzaDpNZXNoID0gbmV3IE1lc2gobmV3IEdlb21ldHJ5KCkpO1xuXHRcdFx0XHRcdHBvbGVNZXJnZS5hcHBseVRvTWVzaGVzKHBvbGVNZXNoLCB0aGlzLnBvbGVNZXNoZXMpO1xuXHRcdFx0XHRcdG1lc2ggPSBwb2xlTWVzaDtcblx0XHRcdFx0XHR0aGlzLnBvbGVNZXNoZXMgPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRpZiAobmFtZSA9PSBcImZsYWdwb2xlXCIgJiYgKG51bSA9PSAyNjAgfHwgbnVtID09IDI2MSB8fCBudW0gPT0gMjYzIHx8IG51bSA9PSAyNjUgfHwgbnVtID09IDI2OCB8fCBudW0gPT0gMjY5IHx8IG51bSA9PSAyNzEgfHwgbnVtID09IDI3MykpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgdGV4dHVyZUluZGV4Om51bWJlciA9IHRoaXMuX21hdGVyaWFsTmFtZVN0cmluZ3MuaW5kZXhPZihuYW1lKTtcblx0XHRcdGlmICh0ZXh0dXJlSW5kZXggPT0gLTEgfHwgdGV4dHVyZUluZGV4ID49IHRoaXMuX21hdGVyaWFsTmFtZVN0cmluZ3MubGVuZ3RoKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dGhpcy5fbnVtVGV4U3RyaW5nc1t0ZXh0dXJlSW5kZXhdKys7XG5cdFx0XHRcblx0XHRcdHZhciB0ZXh0dXJlTmFtZTpzdHJpbmcgPSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcblx0XHRcdHZhciBub3JtYWxUZXh0dXJlTmFtZTpzdHJpbmc7XG5cdFx0XHR2YXIgc3BlY3VsYXJUZXh0dXJlTmFtZTpzdHJpbmc7XG5cdFx0XHRcbi8vXHRcdFx0XHQvL3N0b3JlIHNpbmdsZSBwYXNzIG1hdGVyaWFscyBmb3IgdXNlIGxhdGVyXG4vL1x0XHRcdFx0dmFyIHNpbmdsZU1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwgPSB0aGlzLl9zaW5nbGVNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV07XG4vL1xuLy9cdFx0XHRcdGlmICghc2luZ2xlTWF0ZXJpYWwpIHtcbi8vXG4vL1x0XHRcdFx0XHQvL2NyZWF0ZSBzaW5nbGVwYXNzIG1hdGVyaWFsXG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RleHR1cmVOYW1lXSk7XG4vL1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubmFtZSA9IG5hbWU7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwuYWRkTWV0aG9kKHRoaXMuX2ZvZ01ldGhvZCk7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5taXBtYXAgPSB0cnVlO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwucmVwZWF0ID0gdHJ1ZTtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnNwZWN1bGFyID0gMjtcbi8vXG4vL1x0XHRcdFx0XHQvL3VzZSBhbHBoYSB0cmFuc3BhcmFuY3kgaWYgdGV4dHVyZSBpcyBwbmdcbi8vXHRcdFx0XHRcdGlmICh0ZXh0dXJlTmFtZS5zdWJzdHJpbmcodGV4dHVyZU5hbWUubGVuZ3RoIC0gMykgPT0gXCJwbmdcIilcbi8vXHRcdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwuYWxwaGFUaHJlc2hvbGQgPSAwLjU7XG4vL1xuLy9cdFx0XHRcdFx0Ly9hZGQgbm9ybWFsIG1hcCBpZiBpdCBleGlzdHNcbi8vXHRcdFx0XHRcdG5vcm1hbFRleHR1cmVOYW1lID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcbi8vXHRcdFx0XHRcdGlmIChub3JtYWxUZXh0dXJlTmFtZSlcbi8vXHRcdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubm9ybWFsTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbbm9ybWFsVGV4dHVyZU5hbWVdO1xuLy9cbi8vXHRcdFx0XHRcdC8vYWRkIHNwZWN1bGFyIG1hcCBpZiBpdCBleGlzdHNcbi8vXHRcdFx0XHRcdHNwZWN1bGFyVGV4dHVyZU5hbWUgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG4vL1x0XHRcdFx0XHRpZiAoc3BlY3VsYXJUZXh0dXJlTmFtZSlcbi8vXHRcdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSB0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVtzcGVjdWxhclRleHR1cmVOYW1lXTtcbi8vXG4vL1x0XHRcdFx0XHR0aGlzLl9zaW5nbGVNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV0gPSBzaW5nbGVNYXRlcmlhbDtcbi8vXG4vL1x0XHRcdFx0fVxuXG5cdFx0XHQvL3N0b3JlIG11bHRpIHBhc3MgbWF0ZXJpYWxzIGZvciB1c2UgbGF0ZXJcblx0XHRcdHZhciBtdWx0aU1hdGVyaWFsOlRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwgPSB0aGlzLl9tdWx0aU1hdGVyaWFsRGljdGlvbmFyeVtuYW1lXTtcblxuXHRcdFx0aWYgKCFtdWx0aU1hdGVyaWFsKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL2NyZWF0ZSBtdWx0aXBhc3MgbWF0ZXJpYWxcblx0XHRcdFx0bXVsdGlNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RleHR1cmVOYW1lXSk7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwubWF0ZXJpYWxNb2RlID0gVHJpYW5nbGVNYXRlcmlhbE1vZGUuTVVMVElfUEFTUztcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5uYW1lID0gbmFtZTtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5saWdodFBpY2tlciA9IHRoaXMuX2xpZ2h0UGlja2VyO1xuLy9cdFx0XHRcdFx0bXVsdGlNYXRlcmlhbC5zaGFkb3dNZXRob2QgPSB0aGlzLl9jYXNjYWRlTWV0aG9kO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNoYWRvd01ldGhvZCA9IHRoaXMuX2Jhc2VTaGFkb3dNZXRob2Q7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwuYWRkRWZmZWN0TWV0aG9kKHRoaXMuX2ZvZ01ldGhvZCk7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwucmVwZWF0ID0gdHJ1ZTtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5zcGVjdWxhciA9IDI7XG5cdFx0XHRcdFxuXHRcdFx0XHRcblx0XHRcdFx0Ly91c2UgYWxwaGEgdHJhbnNwYXJhbmN5IGlmIHRleHR1cmUgaXMgcG5nXG5cdFx0XHRcdGlmICh0ZXh0dXJlTmFtZS5zdWJzdHJpbmcodGV4dHVyZU5hbWUubGVuZ3RoIC0gMykgPT0gXCJwbmdcIilcblx0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLmFscGhhVGhyZXNob2xkID0gMC41O1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9hZGQgbm9ybWFsIG1hcCBpZiBpdCBleGlzdHNcblx0XHRcdFx0bm9ybWFsVGV4dHVyZU5hbWUgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuXHRcdFx0XHRpZiAobm9ybWFsVGV4dHVyZU5hbWUpXG5cdFx0XHRcdFx0bXVsdGlNYXRlcmlhbC5ub3JtYWxNYXAgPSB0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVtub3JtYWxUZXh0dXJlTmFtZV07XG5cblx0XHRcdFx0Ly9hZGQgc3BlY3VsYXIgbWFwIGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRzcGVjdWxhclRleHR1cmVOYW1lID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuXHRcdFx0XHRpZiAoc3BlY3VsYXJUZXh0dXJlTmFtZSlcblx0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNwZWN1bGFyTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbc3BlY3VsYXJUZXh0dXJlTmFtZV07XG5cdFx0XHRcdFxuXHRcdFx0XHQvL2FkZCB0byBtYXRlcmlhbCBkaWN0aW9uYXJ5XG5cdFx0XHRcdHRoaXMuX211bHRpTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdID0gbXVsdGlNYXRlcmlhbDtcblx0XHRcdH1cblx0XHRcdC8qXG5cdFx0XHRpZiAoX21lc2hSZWZlcmVuY2VbdGV4dHVyZUluZGV4XSkge1xuXHRcdFx0XHR2YXIgbTpNZXNoID0gbWVzaC5jbG9uZSgpIGFzIE1lc2g7XG5cdFx0XHRcdG0ubWF0ZXJpYWwgPSBtdWx0aU1hdGVyaWFsO1xuXHRcdFx0XHRfdmlldy5zY2VuZS5hZGRDaGlsZChtKTtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHQqL1xuXHRcdFx0Ly9kZWZhdWx0IHRvIG11bHRpcGFzcyBtYXRlcmlhbFxuXHRcdFx0bWVzaC5tYXRlcmlhbCA9IG11bHRpTWF0ZXJpYWw7XG5cblx0XHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobWVzaCk7XG5cblx0XHRcdHRoaXMuX21lc2hSZWZlcmVuY2VbdGV4dHVyZUluZGV4XSA9IG1lc2g7XG5cdFx0fVxuXHRcdFxuXHRcdHZhciB6Om51bWJlciAvKnVpbnQqLyA9IDA7XG5cdFx0XG5cdFx0d2hpbGUgKHogPCB0aGlzLl9udW1UZXhTdHJpbmdzLmxlbmd0aClcblx0XHR7XG5cdFx0XHRjb25zb2xlLmxvZyh0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3Nbel0sIHRoaXMuX251bVRleFN0cmluZ3Nbel0pO1xuXHRcdFx0eisrO1xuXHRcdH1cblxuXHRcdC8vbG9hZCBza3lib3ggYW5kIGZsYW1lIHRleHR1cmVcblxuXHRcdEFzc2V0TGlicmFyeS5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25FeHRyYVJlc291cmNlQ29tcGxldGUoZXZlbnQpKTtcblxuXHRcdC8vc2V0dXAgdGhlIHVybCBtYXAgZm9yIHRleHR1cmVzIGluIHRoZSBjdWJlbWFwIGZpbGVcblx0XHR2YXIgYXNzZXRMb2FkZXJDb250ZXh0OkFzc2V0TG9hZGVyQ29udGV4dCA9IG5ldyBBc3NldExvYWRlckNvbnRleHQoKTtcblx0XHRhc3NldExvYWRlckNvbnRleHQuZGVwZW5kZW5jeUJhc2VVcmwgPSBcImFzc2V0cy9za3lib3gvXCI7XG5cblx0XHQvL2Vudmlyb25tZW50IHRleHR1cmVcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9za3lib3gvaG91cmdsYXNzX3RleHR1cmUuY3ViZVwiKSwgYXNzZXRMb2FkZXJDb250ZXh0KTtcblxuXHRcdC8vZ2xvYmUgdGV4dHVyZXNcblx0XHRBc3NldExpYnJhcnkubG9hZChuZXcgVVJMUmVxdWVzdChcImFzc2V0cy9maXJlLnBuZ1wiKSk7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcmVkIG9uY2UgZXh0cmEgcmVzb3VyY2VzIGFyZSBsb2FkZWRcblx0ICovXG5cdHByaXZhdGUgb25FeHRyYVJlc291cmNlQ29tcGxldGUoZXZlbnQ6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2goIGV2ZW50LnVybCApXG5cdFx0e1xuXHRcdFx0Y2FzZSAnYXNzZXRzL3NreWJveC9ob3VyZ2xhc3NfdGV4dHVyZS5jdWJlJzpcblx0XHRcdFx0Ly9jcmVhdGUgc2t5Ym94IHRleHR1cmUgbWFwXG5cdFx0XHRcdHRoaXMuX3NreU1hcCA9IDxJbWFnZUN1YmVUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiYXNzZXRzL2ZpcmUucG5nXCIgOlxuXHRcdFx0XHR0aGlzLl9mbGFtZU1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwoPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF0pO1xuXHRcdFx0XHR0aGlzLl9mbGFtZU1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5BREQ7XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwuYW5pbWF0ZVVWcyA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9za3lNYXAgJiYgdGhpcy5fZmxhbWVNYXRlcmlhbClcblx0XHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpXG5cdHtcdFxuXHRcdGlmICh0aGlzLl93YWxrU3BlZWQgfHwgdGhpcy5fd2Fsa0FjY2VsZXJhdGlvbikge1xuXHRcdFx0dGhpcy5fd2Fsa1NwZWVkID0gKHRoaXMuX3dhbGtTcGVlZCArIHRoaXMuX3dhbGtBY2NlbGVyYXRpb24pKnRoaXMuX2RyYWc7XG5cdFx0XHRpZiAoTWF0aC5hYnModGhpcy5fd2Fsa1NwZWVkKSA8IDAuMDEpXG5cdFx0XHRcdHRoaXMuX3dhbGtTcGVlZCA9IDA7XG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmluY3JlbWVudFdhbGsodGhpcy5fd2Fsa1NwZWVkKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHRoaXMuX3N0cmFmZVNwZWVkIHx8IHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbikge1xuXHRcdFx0dGhpcy5fc3RyYWZlU3BlZWQgPSAodGhpcy5fc3RyYWZlU3BlZWQgKyB0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24pKnRoaXMuX2RyYWc7XG5cdFx0XHRpZiAoTWF0aC5hYnModGhpcy5fc3RyYWZlU3BlZWQpIDwgMC4wMSlcblx0XHRcdFx0dGhpcy5fc3RyYWZlU3BlZWQgPSAwO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5pbmNyZW1lbnRTdHJhZmUodGhpcy5fc3RyYWZlU3BlZWQpO1xuXHRcdH1cblx0XHRcblx0XHQvL2FuaW1hdGUgZmxhbWVzXG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHQvL3VwZGF0ZSBmbGFtZSBsaWdodFxuXHRcdFx0dmFyIGxpZ2h0IDogUG9pbnRMaWdodCA9IGZsYW1lVk8ubGlnaHQ7XG5cdFx0XHRcblx0XHRcdGlmICghbGlnaHQpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRsaWdodC5mYWxsT2ZmID0gMzgwK01hdGgucmFuZG9tKCkqMjA7XG5cdFx0XHRsaWdodC5yYWRpdXMgPSAyMDArTWF0aC5yYW5kb20oKSozMDtcblx0XHRcdGxpZ2h0LmRpZmZ1c2UgPSAuOStNYXRoLnJhbmRvbSgpKi4xO1xuXHRcdFx0XG5cdFx0XHQvL3VwZGF0ZSBmbGFtZSBtZXNoXG5cdFx0XHR2YXIgbWVzaCA6IE1lc2ggPSBmbGFtZVZPLm1lc2g7XG5cdFx0XHRcblx0XHRcdGlmICghbWVzaClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciBzdWJNZXNoOklTdWJNZXNoID0gbWVzaC5zdWJNZXNoZXNbMF07XG5cdFx0XHRzdWJNZXNoLnV2VHJhbnNmb3JtLm9mZnNldFUgKz0gMS8xNjtcblx0XHRcdHN1Yk1lc2gudXZUcmFuc2Zvcm0ub2Zmc2V0VSAlPSAxO1xuXHRcdFx0bWVzaC5yb3RhdGlvblkgPSBNYXRoLmF0YW4yKG1lc2gueCAtIHRoaXMuX3ZpZXcuY2FtZXJhLngsIG1lc2gueiAtIHRoaXMuX3ZpZXcuY2FtZXJhLnopKjE4MC9NYXRoLlBJO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ZpZXcucmVuZGVyKCk7XG5cdFx0XG5cdH1cblx0XG5cdFx0XHRcblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBjYW1lcmEgY29udHJvbFxuXHQgKi9cblx0cHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IHRoaXMuX3dhbGtJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLl93YWxrQWNjZWxlcmF0aW9uID0gLXRoaXMuX3dhbGtJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0XHR0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24gPSAtdGhpcy5fc3RyYWZlSW5jcmVtZW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbiA9IHRoaXMuX3N0cmFmZUluY3JlbWVudDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkY6XG5cdFx0XHRcdC8vc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU47XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5DOlxuXHRcdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmZseSA9ICF0aGlzLl9jYW1lcmFDb250cm9sbGVyLmZseTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBLZXkgdXAgbGlzdGVuZXIgZm9yIGNhbWVyYSBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIG9uS2V5VXAoZXZlbnQ6S2V5Ym9hcmRFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQpXG5cdHtcblx0XHR0aGlzLl9sYXN0UGFuQW5nbGUgPSB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RUaWx0QW5nbGUgPSB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZTtcblx0XHR0aGlzLl9sYXN0TW91c2VYID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLl9sYXN0TW91c2VZID0gZXZlbnQuY2xpZW50WTtcblx0XHR0aGlzLl9tb3ZlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB1cCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQpXG5cdHtcblx0XHR0aGlzLl9tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50KVxuXHR7XG5cdFx0aWYgKHRoaXMuX21vdmUpIHtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLl9sYXN0TW91c2VYKSArIHRoaXMuX2xhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5fbGFzdE1vdXNlWSkgKyB0aGlzLl9sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBzdGFnZSBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudCA9IG51bGwpXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgICAgICAgICA9IDA7XG5cdFx0dGhpcy5fdmlldy54ICAgICAgICAgPSAwO1xuXHRcdHRoaXMuX3ZpZXcud2lkdGggICAgID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5fdmlldy5oZWlnaHQgICAgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxuLyoqXG4qIERhdGEgY2xhc3MgZm9yIHRoZSBGbGFtZSBvYmplY3RzXG4qL1xuY2xhc3MgRmxhbWVWT1xue1xuXHRwdWJsaWMgcG9zaXRpb246VmVjdG9yM0Q7XG5cdHB1YmxpYyBjb2xvcjpudW1iZXIgLyp1aW50Ki87XG5cdHB1YmxpYyBtZXNoOk1lc2g7XG5cdHB1YmxpYyBsaWdodDpQb2ludExpZ2h0O1xuXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOlZlY3RvcjNELCBjb2xvcjpudW1iZXIgLyp1aW50Ki8pXG5cdHtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yO1xuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuXHRuZXcgQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtbygpO1xufSJdfQ==