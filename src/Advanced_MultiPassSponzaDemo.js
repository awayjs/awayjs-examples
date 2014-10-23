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
var SkyboxMaterial = require("awayjs-stagegl/lib/materials/SkyboxMaterial");
var TriangleMethodMaterial = require("awayjs-stagegl/lib/materials/TriangleMethodMaterial");
var TriangleMaterialMode = require("awayjs-stagegl/lib/materials/TriangleMaterialMode");
var DefaultRenderer = require("awayjs-stagegl/lib/render/DefaultRenderer");
var AWDParser = require("awayjs-renderergl/lib/parsers/AWDParser");
var ShadowSoftMethod = require("awayjs-renderergl/lib/materials/methods/ShadowSoftMethod");
var EffectFogMethod = require("awayjs-renderergl/lib/materials/methods/EffectFogMethod");
var Merge = require("awayjs-renderergl/lib/tools/commands/Merge");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnRzIl0sIm5hbWVzIjpbIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0IiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0RW5naW5lIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0TGlnaHRzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0T2JqZWN0cyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8uaW5pdExpc3RlbmVycyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8udXBkYXRlRGlyZWN0aW9uIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5jb3VudE51bVRleHR1cmVzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkUHJvZ3Jlc3MiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnBhcnNlQml0bWFwIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkJpdG1hcENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5wYXJzZUFXRCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Bc3NldENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vblJlc291cmNlQ29tcGxldGUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkVudGVyRnJhbWUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uS2V5RG93biIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25LZXlVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZURvd24iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uTW91c2VVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZU1vdmUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uUmVzaXplIiwiRmxhbWVWTyIsIkZsYW1lVk8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2Q0U7QUFFRixJQUFPLEtBQUssV0FBaUIsOEJBQThCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUN0RSxJQUFPLGFBQWEsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sV0FBVyxXQUFnQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hFLElBQU8sV0FBVyxXQUFnQixrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3RFLElBQU8sUUFBUSxXQUFpQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2pFLElBQU8sWUFBWSxXQUFnQixzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sa0JBQWtCLFdBQWMsNENBQTRDLENBQUMsQ0FBQztBQUNyRixJQUFPLFNBQVMsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFNBQVMsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNqRSxJQUFPLG1CQUFtQixXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFDbkYsSUFBTyxVQUFVLFdBQWdCLGdDQUFnQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxXQUFXLFdBQWdCLHFDQUFxQyxDQUFDLENBQUM7QUFFekUsSUFBTyxZQUFZLFdBQWdCLHVDQUF1QyxDQUFDLENBQUM7QUFDNUUsSUFBTyxxQkFBcUIsV0FBYSxnREFBZ0QsQ0FBQyxDQUFDO0FBQzNGLElBQU8s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QTtRQUU3QmlCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLElBQUlBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLElBQUlBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUN0Q0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLENBQUNBO1FBRURBLEFBQ0FBLGdCQURnQkE7WUFDWkEsT0FBZUEsQ0FBQ0E7UUFDcEJB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QVpBLFlBQVlBO1FBRTVCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQU9BLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFNQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDRnZCLG1DQUFDQTtBQUFEQSxDQXJ5QkEsQUFxeUJDQSxJQUFBO0FBRUQsQUFHQTs7RUFERTtJQUNJLE9BQU87SUFPWndCLFNBUEtBLE9BQU9BLENBT0FBLFFBQWlCQSxFQUFFQSxLQUFLQSxDQUFRQSxRQUFEQSxBQUFTQTtRQUVuREMsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUNGRCxjQUFDQTtBQUFEQSxDQVpBLEFBWUNBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSw0QkFBNEIsRUFBRSxDQUFDO0FBQ3BDLENBQUMsQ0FBQSIsImZpbGUiOiJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuQ3J5dGVrIFNwb256YSBkZW1vIHVzaW5nIG11bHRpcGFzcyBtYXRlcmlhbHMgaW4gQXdheTNEXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGFwcGx5IE11bHRpcGFzcyBtYXRlcmlhbHMgdG8gYSBtb2RlbFxuSG93IHRvIGVuYWJsZSBjYXNjYWRpbmcgc2hhZG93IG1hcHMgb24gYSBtdWx0aXBhc3MgbWF0ZXJpYWwuXG5Ib3cgdG8gc2V0dXAgbXVsdGlwbGUgbGlnaHRzb3VyY2VzLCBzaGFkb3dzIGFuZCBmb2cgZWZmZWN0cyBhbGwgaW4gdGhlIHNhbWUgc2NlbmUuXG5Ib3cgdG8gYXBwbHkgc3BlY3VsYXIsIG5vcm1hbCBhbmQgZGlmZnVzZSBtYXBzIHRvIGFuIEFXRCBtb2RlbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hbiAmIERhdmlkIExlbmFlcnRzXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuZGF2aWQubGVuYWVydHNAZ21haWwuY29tXG5odHRwOi8vd3d3LmRlcnNjaG1hbGUuY29tXG5cbk1vZGVsIHJlLW1vZGVsZWQgYnkgRnJhbmsgTWVpbmwgYXQgQ3J5dGVrIHdpdGggaW5zcGlyYXRpb24gZnJvbSBNYXJrbyBEYWJyb3ZpYydzIG9yaWdpbmFsLCBjb252ZXJ0ZWQgdG8gQVdEIGJ5IExvVEhcbmNvbnRhY3RAY3J5dGVrLmNvbVxuaHR0cDovL3d3dy5jcnl0ZWsuY29tL2NyeWVuZ2luZS9jcnllbmdpbmUzL2Rvd25sb2Fkc1xuM2RmbGFzaGxvQGdtYWlsLmNvbVxuaHR0cDovLzNkZmxhc2hsby53b3JkcHJlc3MuY29tXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbmltcG9ydCBFdmVudFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcbmltcG9ydCBBc3NldEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IFByb2dyZXNzRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Qcm9ncmVzc0V2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBVVlRyYW5zZm9ybVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1VWVHJhbnNmb3JtXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJDb250ZXh0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlckNvbnRleHRcIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IFVSTExvYWRlclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMTG9hZGVyXCIpO1xuaW1wb3J0IFVSTExvYWRlckRhdGFGb3JtYXRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMTG9hZGVyRGF0YUZvcm1hdFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFBhcnNlclV0aWxzXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3BhcnNlcnMvUGFyc2VyVXRpbHNcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJbWFnZVRleHR1cmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IFNwZWN1bGFyQml0bWFwVGV4dHVyZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9TcGVjdWxhckJpdG1hcFRleHR1cmVcIik7XG5pbXBvcnQgS2V5Ym9hcmRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91aS9LZXlib2FyZFwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9WaWV3XCIpO1xuaW1wb3J0IEZpcnN0UGVyc29uQ29udHJvbGxlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9GaXJzdFBlcnNvbkNvbnRyb2xsZXJcIik7XG5pbXBvcnQgR2VvbWV0cnlcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0dlb21ldHJ5XCIpO1xuaW1wb3J0IElTdWJNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9JU3ViTWVzaFwiKTtcbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBTa3lib3hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgRGlyZWN0aW9uYWxMaWdodFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG4vL1x0aW1wb3J0IENhc2NhZGVTaGFkb3dNYXBwZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYXNjYWRlU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IERpcmVjdGlvbmFsU2hhZG93TWFwcGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9zaGFkb3dtYXBwZXJzL0RpcmVjdGlvbmFsU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcbmltcG9ydCBQcmltaXRpdmVQbGFuZVByZWZhYlx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlUGxhbmVQcmVmYWJcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdXRpbHMvQ2FzdFwiKTtcblxuaW1wb3J0IFNreWJveE1hdGVyaWFsXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvU2t5Ym94TWF0ZXJpYWxcIik7XG5pbXBvcnQgVHJpYW5nbGVNZXRob2RNYXRlcmlhbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1zdGFnZWdsL2xpYi9tYXRlcmlhbHMvVHJpYW5nbGVNZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBUcmlhbmdsZU1hdGVyaWFsTW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL21hdGVyaWFscy9UcmlhbmdsZU1hdGVyaWFsTW9kZVwiKTtcbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXN0YWdlZ2wvbGliL3JlbmRlci9EZWZhdWx0UmVuZGVyZXJcIik7XG5cbmltcG9ydCBBV0RQYXJzZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvcGFyc2Vycy9BV0RQYXJzZXJcIik7XG5pbXBvcnQgU2hhZG93Q2FzY2FkZU1ldGhvZFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL1NoYWRvd0Nhc2NhZGVNZXRob2RcIik7XG5pbXBvcnQgU2hhZG93U29mdE1ldGhvZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU2hhZG93U29mdE1ldGhvZFwiKTtcbmltcG9ydCBFZmZlY3RGb2dNZXRob2RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9tZXRob2RzL0VmZmVjdEZvZ01ldGhvZFwiKTtcbmltcG9ydCBNZXJnZVx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL3Rvb2xzL2NvbW1hbmRzL01lcmdlXCIpO1xuXG5cbmNsYXNzIEFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW9cbntcblx0Ly9yb290IGZpbGVwYXRoIGZvciBhc3NldCBsb2FkaW5nXG5cdHByaXZhdGUgX2Fzc2V0c1Jvb3Q6c3RyaW5nID0gXCJhc3NldHMvXCI7XG5cdFxuXHQvL2RlZmF1bHQgbWF0ZXJpYWwgZGF0YSBzdHJpbmdzXG5cdHByaXZhdGUgX21hdGVyaWFsTmFtZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoXCIsICAgICAgICAgICAgXCJNYXRlcmlhbF9fMjk4XCIsICBcImJyaWNrc1wiLCAgICAgICAgICAgIFwiY2VpbGluZ1wiLCAgICAgICAgICAgIFwiY2hhaW5cIiwgICAgICAgICAgICAgXCJjb2x1bW5fYVwiLCAgICAgICAgICBcImNvbHVtbl9iXCIsICAgICAgICAgIFwiY29sdW1uX2NcIiwgICAgICAgICAgXCJmYWJyaWNfZ1wiLCAgICAgICAgICAgICAgXCJmYWJyaWNfY1wiLCAgICAgICAgIFwiZmFicmljX2ZcIiwgICAgICAgICAgICAgICBcImRldGFpbHNcIiwgICAgICAgICAgXCJmYWJyaWNfZFwiLCAgICAgICAgICAgICBcImZhYnJpY19hXCIsICAgICAgICBcImZhYnJpY19lXCIsICAgICAgICAgICAgICBcImZsYWdwb2xlXCIsICAgICAgICAgIFwiZmxvb3JcIiwgICAgICAgICAgICBcIjE2X19fRGVmYXVsdFwiLFwiTWF0ZXJpYWxfXzI1XCIsXCJyb29mXCIsICAgICAgIFwibGVhZlwiLCAgICAgICAgICAgXCJ2YXNlXCIsICAgICAgICAgXCJ2YXNlX2hhbmdpbmdcIiwgICAgIFwiTWF0ZXJpYWxfXzU3XCIsICAgXCJ2YXNlX3JvdW5kXCIpO1xuXHRcblx0Ly9wcml2YXRlIGNvbnN0IGRpZmZ1c2VUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihbXCJhcmNoX2RpZmYuYXRmXCIsIFwiYmFja2dyb3VuZC5hdGZcIiwgXCJicmlja3NfYV9kaWZmLmF0ZlwiLCBcImNlaWxpbmdfYV9kaWZmLmF0ZlwiLCBcImNoYWluX3RleHR1cmUucG5nXCIsIFwiY29sdW1uX2FfZGlmZi5hdGZcIiwgXCJjb2x1bW5fYl9kaWZmLmF0ZlwiLCBcImNvbHVtbl9jX2RpZmYuYXRmXCIsIFwiY3VydGFpbl9ibHVlX2RpZmYuYXRmXCIsIFwiY3VydGFpbl9kaWZmLmF0ZlwiLCBcImN1cnRhaW5fZ3JlZW5fZGlmZi5hdGZcIiwgXCJkZXRhaWxzX2RpZmYuYXRmXCIsIFwiZmFicmljX2JsdWVfZGlmZi5hdGZcIiwgXCJmYWJyaWNfZGlmZi5hdGZcIiwgXCJmYWJyaWNfZ3JlZW5fZGlmZi5hdGZcIiwgXCJmbGFncG9sZV9kaWZmLmF0ZlwiLCBcImZsb29yX2FfZGlmZi5hdGZcIiwgXCJnaV9mbGFnLmF0ZlwiLCBcImxpb24uYXRmXCIsIFwicm9vZl9kaWZmLmF0ZlwiLCBcInRob3JuX2RpZmYucG5nXCIsIFwidmFzZV9kaWYuYXRmXCIsIFwidmFzZV9oYW5naW5nLmF0ZlwiLCBcInZhc2VfcGxhbnQucG5nXCIsIFwidmFzZV9yb3VuZC5hdGZcIl0pO1xuXHQvL3ByaXZhdGUgY29uc3Qgbm9ybWFsVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oW1wiYXJjaF9kZG4uYXRmXCIsIFwiYmFja2dyb3VuZF9kZG4uYXRmXCIsIFwiYnJpY2tzX2FfZGRuLmF0ZlwiLCBudWxsLCAgICAgICAgICAgICAgICBcImNoYWluX3RleHR1cmVfZGRuLmF0ZlwiLCBcImNvbHVtbl9hX2Rkbi5hdGZcIiwgXCJjb2x1bW5fYl9kZG4uYXRmXCIsIFwiY29sdW1uX2NfZGRuLmF0ZlwiLCBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgXCJsaW9uMl9kZG4uYXRmXCIsIG51bGwsICAgICAgIFwidGhvcm5fZGRuLmF0ZlwiLCBcInZhc2VfZGRuLmF0ZlwiLCAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICBcInZhc2Vfcm91bmRfZGRuLmF0ZlwiXSk7XG5cdC8vcHJpdmF0ZSBjb25zdCBzcGVjdWxhclRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFtcImFyY2hfc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgICBcImJyaWNrc19hX3NwZWMuYXRmXCIsIFwiY2VpbGluZ19hX3NwZWMuYXRmXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY29sdW1uX2Ffc3BlYy5hdGZcIiwgXCJjb2x1bW5fYl9zcGVjLmF0ZlwiLCBcImNvbHVtbl9jX3NwZWMuYXRmXCIsIFwiY3VydGFpbl9zcGVjLmF0ZlwiLCAgICAgIFwiY3VydGFpbl9zcGVjLmF0ZlwiLCBcImN1cnRhaW5fc3BlYy5hdGZcIiwgICAgICAgXCJkZXRhaWxzX3NwZWMuYXRmXCIsIFwiZmFicmljX3NwZWMuYXRmXCIsICAgICAgXCJmYWJyaWNfc3BlYy5hdGZcIiwgXCJmYWJyaWNfc3BlYy5hdGZcIiwgICAgICAgXCJmbGFncG9sZV9zcGVjLmF0ZlwiLCBcImZsb29yX2Ffc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgbnVsbCwgICAgICAgbnVsbCwgICAgICAgICAgICBcInRob3JuX3NwZWMuYXRmXCIsIG51bGwsICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIFwidmFzZV9wbGFudF9zcGVjLmF0ZlwiLCBcInZhc2Vfcm91bmRfc3BlYy5hdGZcIl0pO1xuXHRcblx0cHJpdmF0ZSBfZGlmZnVzZVRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFwiYXJjaF9kaWZmLmpwZ1wiLCBcImJhY2tncm91bmQuanBnXCIsIFwiYnJpY2tzX2FfZGlmZi5qcGdcIiwgXCJjZWlsaW5nX2FfZGlmZi5qcGdcIiwgXCJjaGFpbl90ZXh0dXJlLnBuZ1wiLCBcImNvbHVtbl9hX2RpZmYuanBnXCIsIFwiY29sdW1uX2JfZGlmZi5qcGdcIiwgXCJjb2x1bW5fY19kaWZmLmpwZ1wiLCBcImN1cnRhaW5fYmx1ZV9kaWZmLmpwZ1wiLCBcImN1cnRhaW5fZGlmZi5qcGdcIiwgXCJjdXJ0YWluX2dyZWVuX2RpZmYuanBnXCIsIFwiZGV0YWlsc19kaWZmLmpwZ1wiLCBcImZhYnJpY19ibHVlX2RpZmYuanBnXCIsIFwiZmFicmljX2RpZmYuanBnXCIsIFwiZmFicmljX2dyZWVuX2RpZmYuanBnXCIsIFwiZmxhZ3BvbGVfZGlmZi5qcGdcIiwgXCJmbG9vcl9hX2RpZmYuanBnXCIsIFwiZ2lfZmxhZy5qcGdcIiwgXCJsaW9uLmpwZ1wiLCBcInJvb2ZfZGlmZi5qcGdcIiwgXCJ0aG9ybl9kaWZmLnBuZ1wiLCBcInZhc2VfZGlmLmpwZ1wiLCBcInZhc2VfaGFuZ2luZy5qcGdcIiwgXCJ2YXNlX3BsYW50LnBuZ1wiLCBcInZhc2Vfcm91bmQuanBnXCIpO1xuXHRwcml2YXRlIF9ub3JtYWxUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hfZGRuLmpwZ1wiLCBcImJhY2tncm91bmRfZGRuLmpwZ1wiLCBcImJyaWNrc19hX2Rkbi5qcGdcIiwgbnVsbCwgICAgICAgICAgICAgICAgXCJjaGFpbl90ZXh0dXJlX2Rkbi5qcGdcIiwgXCJjb2x1bW5fYV9kZG4uanBnXCIsIFwiY29sdW1uX2JfZGRuLmpwZ1wiLCBcImNvbHVtbl9jX2Rkbi5qcGdcIiwgbnVsbCwgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgIFwibGlvbjJfZGRuLmpwZ1wiLCBudWxsLCAgICAgICBcInRob3JuX2Rkbi5qcGdcIiwgXCJ2YXNlX2Rkbi5qcGdcIiwgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgXCJ2YXNlX3JvdW5kX2Rkbi5qcGdcIik7XG5cdHByaXZhdGUgX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgICAgXCJicmlja3NfYV9zcGVjLmpwZ1wiLCBcImNlaWxpbmdfYV9zcGVjLmpwZ1wiLCBudWxsLCAgICAgICAgICAgICAgICBcImNvbHVtbl9hX3NwZWMuanBnXCIsIFwiY29sdW1uX2Jfc3BlYy5qcGdcIiwgXCJjb2x1bW5fY19zcGVjLmpwZ1wiLCBcImN1cnRhaW5fc3BlYy5qcGdcIiwgICAgICBcImN1cnRhaW5fc3BlYy5qcGdcIiwgXCJjdXJ0YWluX3NwZWMuanBnXCIsICAgICAgIFwiZGV0YWlsc19zcGVjLmpwZ1wiLCBcImZhYnJpY19zcGVjLmpwZ1wiLCAgICAgIFwiZmFicmljX3NwZWMuanBnXCIsIFwiZmFicmljX3NwZWMuanBnXCIsICAgICAgIFwiZmxhZ3BvbGVfc3BlYy5qcGdcIiwgXCJmbG9vcl9hX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgIG51bGwsICAgICAgIG51bGwsICAgICAgICAgICAgXCJ0aG9ybl9zcGVjLmpwZ1wiLCBudWxsLCAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBcInZhc2VfcGxhbnRfc3BlYy5qcGdcIiwgXCJ2YXNlX3JvdW5kX3NwZWMuanBnXCIpO1xuXHRwcml2YXRlIF9udW1UZXhTdHJpbmdzOkFycmF5PG51bWJlciAvKnVpbnQqLz4gPSBBcnJheTxudW1iZXIgLyp1aW50Ki8+KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcblx0cHJpdmF0ZSBfbWVzaFJlZmVyZW5jZTpNZXNoW10gPSBuZXcgQXJyYXk8TWVzaD4oMjUpO1xuXHRcblx0Ly9mbGFtZSBkYXRhIG9iamVjdHNcblx0cHJpdmF0ZSBfZmxhbWVEYXRhOkFycmF5PEZsYW1lVk8+ID0gQXJyYXk8RmxhbWVWTz4obmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKC02MjUsIDE2NSwgMjE5KSwgMHhmZmFhNDQpLCBuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoNDg1LCAxNjUsIDIxOSksIDB4ZmZhYTQ0KSwgbmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKC02MjUsIDE2NSwgLTE0OCksIDB4ZmZhYTQ0KSwgbmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKDQ4NSwgMTY1LCAtMTQ4KSwgMHhmZmFhNDQpKTtcblx0XG5cdC8vbWF0ZXJpYWwgZGljdGlvbmFyaWVzIHRvIGhvbGQgaW5zdGFuY2VzXG5cdHByaXZhdGUgX3RleHR1cmVEaWN0aW9uYXJ5Ok9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0cHJpdmF0ZSBfbXVsdGlNYXRlcmlhbERpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9zaW5nbGVNYXRlcmlhbERpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRcblx0Ly9wcml2YXRlIG1lc2hEaWN0aW9uYXJ5OkRpY3Rpb25hcnkgPSBuZXcgRGljdGlvbmFyeSgpO1xuXHRwcml2YXRlIHZhc2VNZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHJpdmF0ZSBwb2xlTWVzaGVzOkFycmF5PE1lc2g+ID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdHByaXZhdGUgY29sTWVzaGVzOkFycmF5PE1lc2g+ID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFxuXHQvL2VuZ2llbiB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfdmlldzpWaWV3O1xuXHRwcml2YXRlIF9jYW1lcmFDb250cm9sbGVyOkZpcnN0UGVyc29uQ29udHJvbGxlcjtcblx0XG5cdC8vZ3VpIHZhcmlhYmxlc1xuXHRwcml2YXRlIF9zaW5nbGVQYXNzTWF0ZXJpYWw6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9tdWx0aVBhc3NNYXRlcmlhbDpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfY2FzY2FkZUxldmVsczpudW1iZXIgLyp1aW50Ki8gPSAzO1xuXHRwcml2YXRlIF9zaGFkb3dPcHRpb25zOnN0cmluZyA9IFwiUENGXCI7XG5cdHByaXZhdGUgX2RlcHRoTWFwU2l6ZTpudW1iZXIgLyp1aW50Ki8gPSAyMDQ4O1xuXHRwcml2YXRlIF9saWdodERpcmVjdGlvbjpudW1iZXIgPSBNYXRoLlBJLzI7XG5cdHByaXZhdGUgX2xpZ2h0RWxldmF0aW9uOm51bWJlciA9IE1hdGguUEkvMTg7XG5cdFxuXHQvL2xpZ2h0IHZhcmlhYmxlc1xuXHRwcml2YXRlIF9saWdodFBpY2tlcjpTdGF0aWNMaWdodFBpY2tlcjtcblx0cHJpdmF0ZSBfYmFzZVNoYWRvd01ldGhvZDpTaGFkb3dTb2Z0TWV0aG9kO1xuXHRwcml2YXRlIF9jYXNjYWRlTWV0aG9kOlNoYWRvd0Nhc2NhZGVNZXRob2Q7XG5cdHByaXZhdGUgX2ZvZ01ldGhvZCA6IEVmZmVjdEZvZ01ldGhvZDtcblx0cHJpdmF0ZSBfY2FzY2FkZVNoYWRvd01hcHBlcjpEaXJlY3Rpb25hbFNoYWRvd01hcHBlcjtcblx0cHJpdmF0ZSBfZGlyZWN0aW9uYWxMaWdodDpEaXJlY3Rpb25hbExpZ2h0O1xuXHRwcml2YXRlIF9saWdodHM6QXJyYXk8YW55PiA9IG5ldyBBcnJheTxhbnk+KCk7XG5cdFxuXHQvL21hdGVyaWFsIHZhcmlhYmxlc1xuXHRwcml2YXRlIF9za3lNYXA6SW1hZ2VDdWJlVGV4dHVyZTtcblx0cHJpdmF0ZSBfZmxhbWVNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsO1xuXHRwcml2YXRlIF9udW1UZXh0dXJlczpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRwcml2YXRlIF9jdXJyZW50VGV4dHVyZTpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRwcml2YXRlIF9sb2FkaW5nVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPjtcblx0cHJpdmF0ZSBfbjpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRwcml2YXRlIF9sb2FkaW5nVGV4dDpzdHJpbmc7XG5cdFxuXHQvL3NjZW5lIHZhcmlhYmxlc1xuXHRwcml2YXRlIF9tZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHJpdmF0ZSBfZmxhbWVHZW9tZXRyeTpQcmltaXRpdmVQbGFuZVByZWZhYjtcblx0XHRcdFxuXHQvL3JvdGF0aW9uIHZhcmlhYmxlc1xuXHRwcml2YXRlIF9tb3ZlOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbGFzdFBhbkFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdFRpbHRBbmdsZTpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVg6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0TW91c2VZOm51bWJlcjtcblx0XG5cdC8vbW92ZW1lbnQgdmFyaWFibGVzXG5cdHByaXZhdGUgX2RyYWc6bnVtYmVyID0gMC41O1xuXHRwcml2YXRlIF93YWxrSW5jcmVtZW50Om51bWJlciA9IDEwO1xuXHRwcml2YXRlIF9zdHJhZmVJbmNyZW1lbnQ6bnVtYmVyID0gMTA7XG5cdHByaXZhdGUgX3dhbGtTcGVlZDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9zdHJhZmVTcGVlZDpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF93YWxrQWNjZWxlcmF0aW9uOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3N0cmFmZUFjY2VsZXJhdGlvbjpudW1iZXIgPSAwO1xuXG5cdHByaXZhdGUgX3RpbWVyOlJlcXVlc3RBbmltYXRpb25GcmFtZTtcblx0cHJpdmF0ZSBfdGltZTpudW1iZXIgPSAwO1xuXHRwcml2YXRlIHBhcnNlQVdERGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIHBhcnNlQml0bWFwRGVsZWdhdGU6KGV2ZW50OkV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIGxvYWRQcm9ncmVzc0RlbGVnYXRlOihldmVudDpQcm9ncmVzc0V2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIG9uQml0bWFwQ29tcGxldGVEZWxlZ2F0ZTooZXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlRGVsZWdhdGU6KGV2ZW50OkFzc2V0RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGU6KGV2ZW50OkxvYWRlckV2ZW50KSA9PiB2b2lkO1xuXG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3RvclxuXHQgKi9cblx0Y29uc3RydWN0b3IoKVxuXHR7XG5cdFx0dGhpcy5pbml0KCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBHbG9iYWwgaW5pdGlhbGlzZSBmdW5jdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBpbml0KClcblx0e1xuXHRcdHRoaXMuaW5pdEVuZ2luZSgpO1xuXHRcdHRoaXMuaW5pdExpZ2h0cygpO1xuXHRcdHRoaXMuaW5pdExpc3RlbmVycygpO1xuXHRcdFxuXHRcdFxuXHRcdC8vY291bnQgdGV4dHVyZXNcblx0XHR0aGlzLl9uID0gMDtcblx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3M7XG5cdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0XG5cdFx0Ly9raWNrb2ZmIGFzc2V0IGxvYWRpbmdcblx0XHR0aGlzLl9uID0gMDtcblx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3M7XG5cdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBlbmdpbmVcblx0ICovXG5cdHByaXZhdGUgaW5pdEVuZ2luZSgpXG5cdHtcblx0XHQvL2NyZWF0ZSB0aGUgdmlld1xuXHRcdHRoaXMuX3ZpZXcgPSBuZXcgVmlldyhuZXcgRGVmYXVsdFJlbmRlcmVyKCkpO1xuXHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnkgPSAxNTA7XG5cdFx0dGhpcy5fdmlldy5jYW1lcmEueiA9IDA7XG5cdFx0XG5cdFx0Ly9zZXR1cCBjb250cm9sbGVyIHRvIGJlIHVzZWQgb24gdGhlIGNhbWVyYVxuXHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIgPSBuZXcgRmlyc3RQZXJzb25Db250cm9sbGVyKHRoaXMuX3ZpZXcuY2FtZXJhLCA5MCwgMCwgLTgwLCA4MCk7XHRcdFx0XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBsaWdodHNcblx0ICovXG5cdHByaXZhdGUgaW5pdExpZ2h0cygpXG5cdHtcblx0XHQvL2NyZWF0ZSBsaWdodHMgYXJyYXlcblx0XHR0aGlzLl9saWdodHMgPSBuZXcgQXJyYXk8YW55PigpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIGdsb2JhbCBkaXJlY3Rpb25hbCBsaWdodFxuLy9cdFx0XHR0aGlzLl9jYXNjYWRlU2hhZG93TWFwcGVyID0gbmV3IENhc2NhZGVTaGFkb3dNYXBwZXIoMyk7XG4vL1x0XHRcdHRoaXMuX2Nhc2NhZGVTaGFkb3dNYXBwZXIubGlnaHRPZmZzZXQgPSAyMDAwMDtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0ID0gbmV3IERpcmVjdGlvbmFsTGlnaHQoLTEsIC0xNSwgMSk7XG4vL1x0XHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuc2hhZG93TWFwcGVyID0gdGhpcy5fY2FzY2FkZVNoYWRvd01hcHBlcjtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmNvbG9yID0gMHhlZWRkZGQ7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5hbWJpZW50ID0gLjM1O1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuYW1iaWVudENvbG9yID0gMHg4MDgwOTA7XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0KTtcblx0XHR0aGlzLl9saWdodHMucHVzaCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0KTtcblxuXHRcdHRoaXMudXBkYXRlRGlyZWN0aW9uKCk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgZmxhbWUgbGlnaHRzXG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHR2YXIgbGlnaHQgOiBQb2ludExpZ2h0ID0gZmxhbWVWTy5saWdodCA9IG5ldyBQb2ludExpZ2h0KCk7XG5cdFx0XHRsaWdodC5yYWRpdXMgPSAyMDA7XG5cdFx0XHRsaWdodC5mYWxsT2ZmID0gNjAwO1xuXHRcdFx0bGlnaHQuY29sb3IgPSBmbGFtZVZPLmNvbG9yO1xuXHRcdFx0bGlnaHQueSA9IDEwO1xuXHRcdFx0dGhpcy5fbGlnaHRzLnB1c2gobGlnaHQpO1xuXHRcdH1cblx0XHRcblx0XHQvL2NyZWF0ZSBvdXIgZ2xvYmFsIGxpZ2h0IHBpY2tlclxuXHRcdHRoaXMuX2xpZ2h0UGlja2VyID0gbmV3IFN0YXRpY0xpZ2h0UGlja2VyKHRoaXMuX2xpZ2h0cyk7XG5cdFx0dGhpcy5fYmFzZVNoYWRvd01ldGhvZCA9IG5ldyBTaGFkb3dTb2Z0TWV0aG9kKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQgLCAxMCAsIDUgKTtcbi8vXHRcdFx0dGhpcy5fYmFzZVNoYWRvd01ldGhvZCA9IG5ldyBTaGFkb3dGaWx0ZXJlZE1ldGhvZCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0KTtcblx0XHRcblx0XHQvL2NyZWF0ZSBvdXIgZ2xvYmFsIGZvZyBtZXRob2Rcblx0XHR0aGlzLl9mb2dNZXRob2QgPSBuZXcgRWZmZWN0Rm9nTWV0aG9kKDAsIDQwMDAsIDB4OTA5MGU3KTtcbi8vXHRcdFx0dGhpcy5fY2FzY2FkZU1ldGhvZCA9IG5ldyBTaGFkb3dDYXNjYWRlTWV0aG9kKHRoaXMuX2Jhc2VTaGFkb3dNZXRob2QpO1xuXHR9XG5cdFx0XHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIHNjZW5lIG9iamVjdHNcblx0ICovXG5cdHByaXZhdGUgaW5pdE9iamVjdHMoKVxuXHR7XG5cdFx0Ly9jcmVhdGUgc2t5Ym94XG5cdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChuZXcgU2t5Ym94KG5ldyBTa3lib3hNYXRlcmlhbCh0aGlzLl9za3lNYXApKSk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgZmxhbWUgbWVzaGVzXG5cdFx0dGhpcy5fZmxhbWVHZW9tZXRyeSA9IG5ldyBQcmltaXRpdmVQbGFuZVByZWZhYig0MCwgODAsIDEsIDEsIGZhbHNlLCB0cnVlKTtcblx0XHR2YXIgZmxhbWVWTzpGbGFtZVZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fZmxhbWVEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0ZmxhbWVWTyA9IHRoaXMuX2ZsYW1lRGF0YVtpXTtcblx0XHRcdHZhciBtZXNoOk1lc2ggPSBmbGFtZVZPLm1lc2ggPSA8TWVzaD4gdGhpcy5fZmxhbWVHZW9tZXRyeS5nZXROZXdPYmplY3QoKTtcblx0XHRcdG1lc2gubWF0ZXJpYWwgPSB0aGlzLl9mbGFtZU1hdGVyaWFsO1xuXHRcdFx0bWVzaC50cmFuc2Zvcm0ucG9zaXRpb24gPSBmbGFtZVZPLnBvc2l0aW9uO1xuXHRcdFx0bWVzaC5zdWJNZXNoZXNbMF0udXZUcmFuc2Zvcm0gPSBuZXcgVVZUcmFuc2Zvcm0oKVxuXHRcdFx0bWVzaC5zdWJNZXNoZXNbMF0udXZUcmFuc2Zvcm0uc2NhbGVVID0gMS8xNjtcblx0XHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobWVzaCk7XG5cdFx0XHRtZXNoLmFkZENoaWxkKGZsYW1lVk8ubGlnaHQpO1xuXHRcdH1cblx0fVxuXHRcdFxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlzdGVuZXJzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaXN0ZW5lcnMoKVxuXHR7XG5cdFx0Ly9hZGQgbGlzdGVuZXJzXG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudCkgPT4gdGhpcy5vblJlc2l6ZShldmVudCk7XG5cblx0XHRkb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudCkgPT4gdGhpcy5vbk1vdXNlRG93bihldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXVwID0gKGV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQpID0+IHRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5ZG93biA9IChldmVudCkgPT4gdGhpcy5vbktleURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5dXAgPSAoZXZlbnQpID0+IHRoaXMub25LZXlVcChldmVudCk7XG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLnBhcnNlQVdERGVsZWdhdGUgPSAoZXZlbnQ6RXZlbnQpID0+IHRoaXMucGFyc2VBV0QoZXZlbnQpO1xuXHRcdHRoaXMucGFyc2VCaXRtYXBEZWxlZ2F0ZSA9IChldmVudCkgPT4gdGhpcy5wYXJzZUJpdG1hcChldmVudCk7XG5cdFx0dGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSA9IChldmVudDpQcm9ncmVzc0V2ZW50KSA9PiB0aGlzLmxvYWRQcm9ncmVzcyhldmVudCk7XG5cdFx0dGhpcy5vbkJpdG1hcENvbXBsZXRlRGVsZWdhdGUgPSAoZXZlbnQpID0+IHRoaXMub25CaXRtYXBDb21wbGV0ZShldmVudCk7XG5cdFx0dGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSA9IChldmVudDpBc3NldEV2ZW50KSA9PiB0aGlzLm9uQXNzZXRDb21wbGV0ZShldmVudCk7XG5cdFx0dGhpcy5vblJlc291cmNlQ29tcGxldGVEZWxlZ2F0ZSA9IChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vblJlc291cmNlQ29tcGxldGUoZXZlbnQpO1xuXG5cdFx0dGhpcy5fdGltZXIgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25FbnRlckZyYW1lLCB0aGlzKTtcblx0XHR0aGlzLl90aW1lci5zdGFydCgpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgbWF0ZXJpYWwgbW9kZSBiZXR3ZWVuIHNpbmdsZSBwYXNzIGFuZCBtdWx0aSBwYXNzXG5cdCAqL1xuLy9cdFx0cHJpdmF0ZSB1cGRhdGVNYXRlcmlhbFBhc3MobWF0ZXJpYWxEaWN0aW9uYXJ5OkRpY3Rpb25hcnkpXG4vL1x0XHR7XG4vL1x0XHRcdHZhciBtZXNoOk1lc2g7XG4vL1x0XHRcdHZhciBuYW1lOnN0cmluZztcbi8vXHRcdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9tZXNoZXMubGVuZ3RoO1xuLy9cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuLy9cdFx0XHRcdG1lc2ggPSB0aGlzLl9tZXNoZXNbaV07XG4vL1x0XHRcdFx0aWYgKG1lc2gubmFtZSA9PSBcInNwb256YV8wNFwiIHx8IG1lc2gubmFtZSA9PSBcInNwb256YV8zNzlcIilcbi8vXHRcdFx0XHRcdGNvbnRpbnVlO1xuLy9cdFx0XHRcdG5hbWUgPSBtZXNoLm1hdGVyaWFsLm5hbWU7XG4vL1x0XHRcdFx0dmFyIHRleHR1cmVJbmRleDpudW1iZXIgPSB0aGlzLl9tYXRlcmlhbE5hbWVTdHJpbmdzLmluZGV4T2YobmFtZSk7XG4vL1x0XHRcdFx0aWYgKHRleHR1cmVJbmRleCA9PSAtMSB8fCB0ZXh0dXJlSW5kZXggPj0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5sZW5ndGgpXG4vL1x0XHRcdFx0XHRjb250aW51ZTtcbi8vXG4vL1x0XHRcdFx0bWVzaC5tYXRlcmlhbCA9IG1hdGVyaWFsRGljdGlvbmFyeVtuYW1lXTtcbi8vXHRcdFx0fVxuLy9cdFx0fVxuXHRcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgZGlyZWN0aW9uYWwgbGlnaHRzb3VyY2Vcblx0ICovXG5cdHByaXZhdGUgdXBkYXRlRGlyZWN0aW9uKClcblx0e1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuZGlyZWN0aW9uID0gbmV3IFZlY3RvcjNEKFxuXHRcdFx0TWF0aC5zaW4odGhpcy5fbGlnaHRFbGV2YXRpb24pKk1hdGguY29zKHRoaXMuX2xpZ2h0RGlyZWN0aW9uKSxcblx0XHRcdC1NYXRoLmNvcyh0aGlzLl9saWdodEVsZXZhdGlvbiksXG5cdFx0XHRNYXRoLnNpbih0aGlzLl9saWdodEVsZXZhdGlvbikqTWF0aC5zaW4odGhpcy5fbGlnaHREaXJlY3Rpb24pXG5cdFx0KTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIENvdW50IHRoZSB0b3RhbCBudW1iZXIgb2YgdGV4dHVyZXMgdG8gYmUgbG9hZGVkXG5cdCAqL1xuXHRwcml2YXRlIGNvdW50TnVtVGV4dHVyZXMoKVxuXHR7XG5cdFx0dGhpcy5fbnVtVGV4dHVyZXMrKztcblx0XHRcblx0XHQvL3NraXAgbnVsbCB0ZXh0dXJlc1xuXHRcdHdoaWxlICh0aGlzLl9uKysgPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoIC0gMSlcblx0XHRcdGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFxuXHRcdC8vc3dpdGNoIHRvIG5leHQgdGV0dXJlIHNldFxuXHRcdGlmICh0aGlzLl9uIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzO1xuXHRcdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3MpIHtcblx0XHRcdHRoaXMuX24gPSAwO1xuXHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIEdsb2JhbCBiaW5hcnkgZmlsZSBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgbG9hZCh1cmw6c3RyaW5nKVxuXHR7XG5cdFx0dmFyIGxvYWRlcjpVUkxMb2FkZXIgPSBuZXcgVVJMTG9hZGVyKCk7XG5cdFx0c3dpdGNoICh1cmwuc3Vic3RyaW5nKHVybC5sZW5ndGggLSAzKSkge1xuXHRcdFx0Y2FzZSBcIkFXRFwiOiBcblx0XHRcdGNhc2UgXCJhd2RcIjpcblx0XHRcdFx0bG9hZGVyLmRhdGFGb3JtYXQgPSBVUkxMb2FkZXJEYXRhRm9ybWF0LkFSUkFZX0JVRkZFUjtcblx0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHQgPSBcIkxvYWRpbmcgTW9kZWxcIjtcblx0XHRcdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VBV0REZWxlZ2F0ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInBuZ1wiOiBcblx0XHRcdGNhc2UgXCJqcGdcIjpcblx0XHRcdFx0bG9hZGVyLmRhdGFGb3JtYXQgPSBVUkxMb2FkZXJEYXRhRm9ybWF0LkJMT0I7XG5cdFx0XHRcdHRoaXMuX2N1cnJlbnRUZXh0dXJlKys7XG5cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0ID0gXCJMb2FkaW5nIFRleHR1cmVzXCI7XG5cdFx0XHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLnBhcnNlQml0bWFwRGVsZWdhdGUpO1xuXHRcdFx0XHR1cmwgPSBcInNwb256YS9cIiArIHVybDtcblx0XHRcdFx0YnJlYWs7XG4vL1x0XHRcdFx0Y2FzZSBcImF0ZlwiOlxuLy9cdFx0XHRcdFx0dGhpcy5fY3VycmVudFRleHR1cmUrKztcbi8vXHRcdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0ID0gXCJMb2FkaW5nIFRleHR1cmVzXCI7XG4vLyAgICAgICAgICAgICAgICAgICAgbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIChldmVudDpFdmVudCkgPT4gdGhpcy5vbkFURkNvbXBsZXRlKGV2ZW50KSk7XG4vL1x0XHRcdFx0XHR1cmwgPSBcInNwb256YS9hdGYvXCIgKyB1cmw7XG4vLyAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cdFx0fVxuXHRcdFxuXHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKFByb2dyZXNzRXZlbnQuUFJPR1JFU1MsIHRoaXMubG9hZFByb2dyZXNzRGVsZWdhdGUpO1xuXHRcdHZhciB1cmxSZXE6VVJMUmVxdWVzdCA9IG5ldyBVUkxSZXF1ZXN0KHRoaXMuX2Fzc2V0c1Jvb3QrdXJsKTtcblx0XHRsb2FkZXIubG9hZCh1cmxSZXEpO1xuXHRcdFxuXHR9XG5cdFxuXHQvKipcblx0ICogRGlzcGxheSBjdXJyZW50IGxvYWRcblx0ICovXG5cdHByaXZhdGUgbG9hZFByb2dyZXNzKGU6UHJvZ3Jlc3NFdmVudClcblx0e1xuXHRcdC8vVE9ETyB3b3JrIG91dCB3aHkgdGhlIGNhc3Rpbmcgb24gUHJvZ3Jlc3NFdmVudCBmYWlscyBmb3IgYnl0ZXNMb2FkZWQgYW5kIGJ5dGVzVG90YWwgcHJvcGVydGllc1xuXHRcdHZhciBQOm51bWJlciA9IE1hdGguZmxvb3IoZVtcImJ5dGVzTG9hZGVkXCJdIC8gZVtcImJ5dGVzVG90YWxcIl0gKiAxMDApO1xuXHRcdGlmIChQICE9IDEwMCkge1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5fbG9hZGluZ1RleHQgKyAnXFxuJyArICgodGhpcy5fbG9hZGluZ1RleHQgPT0gXCJMb2FkaW5nIE1vZGVsXCIpPyBNYXRoLmZsb29yKChlW1wiYnl0ZXNMb2FkZWRcIl0gLyAxMDI0KSA8PCAwKSArICdrYiB8ICcgKyBNYXRoLmZsb29yKChlW1wiYnl0ZXNUb3RhbFwiXSAvIDEwMjQpIDw8IDApICsgJ2tiJyA6IHRoaXMuX2N1cnJlbnRUZXh0dXJlICsgJyB8ICcgKyB0aGlzLl9udW1UZXh0dXJlcykpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgQVRGIGZpbGVcblx0ICovXG4vL1x0XHRwcml2YXRlIG9uQVRGQ29tcGxldGUoZTpFdmVudClcbi8vXHRcdHtcbi8vICAgICAgICAgICAgdmFyIGxvYWRlcjpVUkxMb2FkZXIgPSBVUkxMb2FkZXIoZS50YXJnZXQpO1xuLy8gICAgICAgICAgICBsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5vbkFURkNvbXBsZXRlKTtcbi8vXG4vL1x0XHRcdGlmICghdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dXSlcbi8vXHRcdFx0e1xuLy9cdFx0XHRcdHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0gPSBuZXcgQVRGVGV4dHVyZShsb2FkZXIuZGF0YSk7XG4vL1x0XHRcdH1cbi8vXG4vLyAgICAgICAgICAgIGxvYWRlci5kYXRhID0gbnVsbDtcbi8vICAgICAgICAgICAgbG9hZGVyLmNsb3NlKCk7XG4vL1x0XHRcdGxvYWRlciA9IG51bGw7XG4vL1xuLy9cbi8vXHRcdFx0Ly9za2lwIG51bGwgdGV4dHVyZXNcbi8vXHRcdFx0d2hpbGUgKHRoaXMuX24rKyA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGggLSAxKVxuLy9cdFx0XHRcdGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pXG4vL1x0XHRcdFx0XHRicmVhaztcbi8vXG4vL1x0XHRcdC8vc3dpdGNoIHRvIG5leHQgdGV0dXJlIHNldFxuLy8gICAgICAgICAgICBpZiAodGhpcy5fbiA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGgpIHtcbi8vXHRcdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcbi8vXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzKSB7XG4vL1x0XHRcdFx0dGhpcy5fbiA9IDA7XG4vL1x0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3M7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG4vL1x0XHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzKSB7XG4vL1x0XHRcdFx0dGhpcy5fbiA9IDA7XG4vL1x0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncztcbi8vXHRcdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcbi8vXHRcdFx0fSBlbHNlIHtcbi8vXHRcdFx0XHR0aGlzLmxvYWQoXCJzcG9uemEvc3BvbnphLmF3ZFwiKTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIH1cblx0XG5cdFxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBCaXRtYXAgZmlsZVxuXHQgKi9cblx0cHJpdmF0ZSBwYXJzZUJpdG1hcChlKVxuXHR7XG5cdFx0dmFyIHVybExvYWRlcjpVUkxMb2FkZXIgPSA8VVJMTG9hZGVyPiBlLnRhcmdldDtcblx0XHR2YXIgaW1hZ2U6SFRNTEltYWdlRWxlbWVudCA9IFBhcnNlclV0aWxzLmJsb2JUb0ltYWdlKHVybExvYWRlci5kYXRhKTtcblx0XHRpbWFnZS5vbmxvYWQgPSB0aGlzLm9uQml0bWFwQ29tcGxldGVEZWxlZ2F0ZTtcblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUJpdG1hcERlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihQcm9ncmVzc0V2ZW50LlBST0dSRVNTLCB0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIgPSBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogTGlzdGVuZXIgZm9yIGJpdG1hcCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25CaXRtYXBDb21wbGV0ZShlOkV2ZW50KVxuXHR7XG5cdFx0dmFyIGltYWdlOkhUTUxJbWFnZUVsZW1lbnQgPSA8SFRNTEltYWdlRWxlbWVudD4gZS50YXJnZXQ7XG5cdFx0aW1hZ2Uub25sb2FkID0gbnVsbDtcblxuXHRcdC8vY3JlYXRlIGJpdG1hcCB0ZXh0dXJlIGluIGRpY3Rpb25hcnlcblx0XHRpZiAoIXRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0pXG5cdFx0XHR0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dID0gKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzKT8gbmV3IFNwZWN1bGFyQml0bWFwVGV4dHVyZShDYXN0LmJpdG1hcERhdGEoaW1hZ2UpKSA6IG5ldyBJbWFnZVRleHR1cmUoaW1hZ2UpO1xuXG5cdFx0Ly9za2lwIG51bGwgdGV4dHVyZXNcblx0XHR3aGlsZSAodGhpcy5fbisrIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCAtIDEpXG5cdFx0XHRpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKVxuXHRcdFx0XHRicmVhaztcblx0XHRcblx0XHQvL3N3aXRjaCB0byBuZXh0IHRldHVyZSBzZXRcblx0XHRpZiAodGhpcy5fbiA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGgpIHtcblx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sb2FkKFwic3BvbnphL3Nwb256YS5hd2RcIik7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBBV0QgZmlsZVxuXHQgKi9cblx0cHJpdmF0ZSBwYXJzZUFXRChlKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJQYXJzaW5nIERhdGFcIik7XG5cdFx0dmFyIHVybExvYWRlcjpVUkxMb2FkZXIgPSA8VVJMTG9hZGVyPiBlLnRhcmdldDtcblx0XHR2YXIgbG9hZGVyOkxvYWRlciA9IG5ldyBMb2FkZXIoZmFsc2UpO1xuXG5cdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgdGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdGxvYWRlci5sb2FkRGF0YSh1cmxMb2FkZXIuZGF0YSwgbmV3IEFzc2V0TG9hZGVyQ29udGV4dChmYWxzZSksIG51bGwsIG5ldyBBV0RQYXJzZXIoKSk7XG5cblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihQcm9ncmVzc0V2ZW50LlBST0dSRVNTLCB0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUFXRERlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIgPSBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogTGlzdGVuZXIgZm9yIGFzc2V0IGNvbXBsZXRlIGV2ZW50IG9uIGxvYWRlclxuXHQgKi9cblx0cHJpdmF0ZSBvbkFzc2V0Q29tcGxldGUoZXZlbnQ6QXNzZXRFdmVudClcblx0e1xuXHRcdGlmIChldmVudC5hc3NldC5hc3NldFR5cGUgPT0gQXNzZXRUeXBlLk1FU0gpIHtcblx0XHRcdC8vc3RvcmUgbWVzaGVzXG5cdFx0XHR0aGlzLl9tZXNoZXMucHVzaCg8TWVzaD4gZXZlbnQuYXNzZXQpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFRyaWdnZXJlZCBvbmNlIGFsbCByZXNvdXJjZXMgYXJlIGxvYWRlZFxuXHQgKi9cblx0cHJpdmF0ZSBvblJlc291cmNlQ29tcGxldGUoZTpMb2FkZXJFdmVudClcblx0e1xuXHRcdHZhciBtZXJnZTpNZXJnZSA9IG5ldyBNZXJnZShmYWxzZSwgZmFsc2UsIHRydWUpO1xuXG5cdFx0dmFyIGxvYWRlcjpMb2FkZXIgPSA8TG9hZGVyPiBlLnRhcmdldDtcblx0XHRsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihBc3NldEV2ZW50LkFTU0VUX0NPTVBMRVRFLCB0aGlzLm9uQXNzZXRDb21wbGV0ZURlbGVnYXRlKTtcblx0XHRsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgdGhpcy5vblJlc291cmNlQ29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0XG5cdFx0Ly9yZWFzc2lnbiBtYXRlcmlhbHNcblx0XHR2YXIgbWVzaDpNZXNoO1xuXHRcdHZhciBuYW1lOnN0cmluZztcblxuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fbWVzaGVzLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0bWVzaCA9IHRoaXMuX21lc2hlc1tpXTtcblx0XHRcdGlmIChtZXNoLm5hbWUgPT0gXCJzcG9uemFfMDRcIiB8fCBtZXNoLm5hbWUgPT0gXCJzcG9uemFfMzc5XCIpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHR2YXIgbnVtOm51bWJlciA9IE51bWJlcihtZXNoLm5hbWUuc3Vic3RyaW5nKDcpKTtcblxuXHRcdFx0bmFtZSA9IG1lc2gubWF0ZXJpYWwubmFtZTtcblxuXHRcdFx0aWYgKG5hbWUgPT0gXCJjb2x1bW5fY1wiICYmIChudW0gPCAyMiB8fCBudW0gPiAzMykpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHR2YXIgY29sTnVtOm51bWJlciA9IChudW0gLSAxMjUpO1xuXHRcdFx0aWYgKG5hbWUgPT0gXCJjb2x1bW5fYlwiKSB7XG5cdFx0XHRcdGlmIChjb2xOdW0gID49MCAmJiBjb2xOdW0gPCAxMzIgJiYgKGNvbE51bSAlIDExKSA8IDEwKSB7XG5cdFx0XHRcdFx0dGhpcy5jb2xNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGlzLmNvbE1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdHZhciBjb2xNZXJnZTpNZXJnZSA9IG5ldyBNZXJnZSgpO1xuXHRcdFx0XHRcdHZhciBjb2xNZXNoOk1lc2ggPSBuZXcgTWVzaChuZXcgR2VvbWV0cnkoKSk7XG5cdFx0XHRcdFx0Y29sTWVyZ2UuYXBwbHlUb01lc2hlcyhjb2xNZXNoLCB0aGlzLmNvbE1lc2hlcyk7XG5cdFx0XHRcdFx0bWVzaCA9IGNvbE1lc2g7XG5cdFx0XHRcdFx0dGhpcy5jb2xNZXNoZXMgPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdmFzZU51bTpudW1iZXIgPSAobnVtIC0gMzM0KTtcblx0XHRcdGlmIChuYW1lID09IFwidmFzZV9oYW5naW5nXCIgJiYgKHZhc2VOdW0gJSA5KSA8IDUpIHtcblx0XHRcdFx0aWYgKHZhc2VOdW0gID49MCAmJiB2YXNlTnVtIDwgMzcwICYmICh2YXNlTnVtICUgOSkgPCA0KSB7XG5cdFx0XHRcdFx0dGhpcy52YXNlTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy52YXNlTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0dmFyIHZhc2VNZXJnZTpNZXJnZSA9IG5ldyBNZXJnZSgpO1xuXHRcdFx0XHRcdHZhciB2YXNlTWVzaDpNZXNoID0gbmV3IE1lc2gobmV3IEdlb21ldHJ5KCkpO1xuXHRcdFx0XHRcdHZhc2VNZXJnZS5hcHBseVRvTWVzaGVzKHZhc2VNZXNoLCB0aGlzLnZhc2VNZXNoZXMpO1xuXHRcdFx0XHRcdG1lc2ggPSB2YXNlTWVzaDtcblx0XHRcdFx0XHR0aGlzLnZhc2VNZXNoZXMgPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR2YXIgcG9sZU51bTpudW1iZXIgPSBudW0gLSAyOTA7XG5cdFx0XHRpZiAobmFtZSA9PSBcImZsYWdwb2xlXCIpIHtcblx0XHRcdFx0aWYgKHBvbGVOdW0gPj0wICYmIHBvbGVOdW0gPCAzMjAgJiYgKHBvbGVOdW0gJSAzKSA8IDIpIHtcblx0XHRcdFx0XHR0aGlzLnBvbGVNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fSBlbHNlIGlmIChwb2xlTnVtID49MCkge1xuXHRcdFx0XHRcdHRoaXMucG9sZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdHZhciBwb2xlTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgcG9sZU1lc2g6TWVzaCA9IG5ldyBNZXNoKG5ldyBHZW9tZXRyeSgpKTtcblx0XHRcdFx0XHRwb2xlTWVyZ2UuYXBwbHlUb01lc2hlcyhwb2xlTWVzaCwgdGhpcy5wb2xlTWVzaGVzKTtcblx0XHRcdFx0XHRtZXNoID0gcG9sZU1lc2g7XG5cdFx0XHRcdFx0dGhpcy5wb2xlTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0aWYgKG5hbWUgPT0gXCJmbGFncG9sZVwiICYmIChudW0gPT0gMjYwIHx8IG51bSA9PSAyNjEgfHwgbnVtID09IDI2MyB8fCBudW0gPT0gMjY1IHx8IG51bSA9PSAyNjggfHwgbnVtID09IDI2OSB8fCBudW0gPT0gMjcxIHx8IG51bSA9PSAyNzMpKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0dmFyIHRleHR1cmVJbmRleDpudW1iZXIgPSB0aGlzLl9tYXRlcmlhbE5hbWVTdHJpbmdzLmluZGV4T2YobmFtZSk7XG5cdFx0XHRpZiAodGV4dHVyZUluZGV4ID09IC0xIHx8IHRleHR1cmVJbmRleCA+PSB0aGlzLl9tYXRlcmlhbE5hbWVTdHJpbmdzLmxlbmd0aClcblx0XHRcdFx0Y29udGludWU7XG5cblx0XHRcdHRoaXMuX251bVRleFN0cmluZ3NbdGV4dHVyZUluZGV4XSsrO1xuXHRcdFx0XG5cdFx0XHR2YXIgdGV4dHVyZU5hbWU6c3RyaW5nID0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG5cdFx0XHR2YXIgbm9ybWFsVGV4dHVyZU5hbWU6c3RyaW5nO1xuXHRcdFx0dmFyIHNwZWN1bGFyVGV4dHVyZU5hbWU6c3RyaW5nO1xuXHRcdFx0XG4vL1x0XHRcdFx0Ly9zdG9yZSBzaW5nbGUgcGFzcyBtYXRlcmlhbHMgZm9yIHVzZSBsYXRlclxuLy9cdFx0XHRcdHZhciBzaW5nbGVNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsID0gdGhpcy5fc2luZ2xlTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdO1xuLy9cbi8vXHRcdFx0XHRpZiAoIXNpbmdsZU1hdGVyaWFsKSB7XG4vL1xuLy9cdFx0XHRcdFx0Ly9jcmVhdGUgc2luZ2xlcGFzcyBtYXRlcmlhbFxuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCh0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0ZXh0dXJlTmFtZV0pO1xuLy9cbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm5hbWUgPSBuYW1lO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmFkZE1ldGhvZCh0aGlzLl9mb2dNZXRob2QpO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubWlwbWFwID0gdHJ1ZTtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5zcGVjdWxhciA9IDI7XG4vL1xuLy9cdFx0XHRcdFx0Ly91c2UgYWxwaGEgdHJhbnNwYXJhbmN5IGlmIHRleHR1cmUgaXMgcG5nXG4vL1x0XHRcdFx0XHRpZiAodGV4dHVyZU5hbWUuc3Vic3RyaW5nKHRleHR1cmVOYW1lLmxlbmd0aCAtIDMpID09IFwicG5nXCIpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmFscGhhVGhyZXNob2xkID0gMC41O1xuLy9cbi8vXHRcdFx0XHRcdC8vYWRkIG5vcm1hbCBtYXAgaWYgaXQgZXhpc3RzXG4vL1x0XHRcdFx0XHRub3JtYWxUZXh0dXJlTmFtZSA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG4vL1x0XHRcdFx0XHRpZiAobm9ybWFsVGV4dHVyZU5hbWUpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm5vcm1hbE1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W25vcm1hbFRleHR1cmVOYW1lXTtcbi8vXG4vL1x0XHRcdFx0XHQvL2FkZCBzcGVjdWxhciBtYXAgaWYgaXQgZXhpc3RzXG4vL1x0XHRcdFx0XHRzcGVjdWxhclRleHR1cmVOYW1lID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuLy9cdFx0XHRcdFx0aWYgKHNwZWN1bGFyVGV4dHVyZU5hbWUpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnNwZWN1bGFyTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbc3BlY3VsYXJUZXh0dXJlTmFtZV07XG4vL1xuLy9cdFx0XHRcdFx0dGhpcy5fc2luZ2xlTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdID0gc2luZ2xlTWF0ZXJpYWw7XG4vL1xuLy9cdFx0XHRcdH1cblxuXHRcdFx0Ly9zdG9yZSBtdWx0aSBwYXNzIG1hdGVyaWFscyBmb3IgdXNlIGxhdGVyXG5cdFx0XHR2YXIgbXVsdGlNYXRlcmlhbDpUcmlhbmdsZU1ldGhvZE1hdGVyaWFsID0gdGhpcy5fbXVsdGlNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV07XG5cblx0XHRcdGlmICghbXVsdGlNYXRlcmlhbCkge1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9jcmVhdGUgbXVsdGlwYXNzIG1hdGVyaWFsXG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCh0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0ZXh0dXJlTmFtZV0pO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLm1hdGVyaWFsTW9kZSA9IFRyaWFuZ2xlTWF0ZXJpYWxNb2RlLk1VTFRJX1BBU1M7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwubmFtZSA9IG5hbWU7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcbi8vXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwuc2hhZG93TWV0aG9kID0gdGhpcy5fY2FzY2FkZU1ldGhvZDtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5zaGFkb3dNZXRob2QgPSB0aGlzLl9iYXNlU2hhZG93TWV0aG9kO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLmFkZEVmZmVjdE1ldGhvZCh0aGlzLl9mb2dNZXRob2QpO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwuc3BlY3VsYXIgPSAyO1xuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdC8vdXNlIGFscGhhIHRyYW5zcGFyYW5jeSBpZiB0ZXh0dXJlIGlzIHBuZ1xuXHRcdFx0XHRpZiAodGV4dHVyZU5hbWUuc3Vic3RyaW5nKHRleHR1cmVOYW1lLmxlbmd0aCAtIDMpID09IFwicG5nXCIpXG5cdFx0XHRcdFx0bXVsdGlNYXRlcmlhbC5hbHBoYVRocmVzaG9sZCA9IDAuNTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vYWRkIG5vcm1hbCBtYXAgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdG5vcm1hbFRleHR1cmVOYW1lID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcblx0XHRcdFx0aWYgKG5vcm1hbFRleHR1cmVOYW1lKVxuXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwubm9ybWFsTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbbm9ybWFsVGV4dHVyZU5hbWVdO1xuXG5cdFx0XHRcdC8vYWRkIHNwZWN1bGFyIG1hcCBpZiBpdCBleGlzdHNcblx0XHRcdFx0c3BlY3VsYXJUZXh0dXJlTmFtZSA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcblx0XHRcdFx0aWYgKHNwZWN1bGFyVGV4dHVyZU5hbWUpXG5cdFx0XHRcdFx0bXVsdGlNYXRlcmlhbC5zcGVjdWxhck1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3NwZWN1bGFyVGV4dHVyZU5hbWVdO1xuXHRcdFx0XHRcblx0XHRcdFx0Ly9hZGQgdG8gbWF0ZXJpYWwgZGljdGlvbmFyeVxuXHRcdFx0XHR0aGlzLl9tdWx0aU1hdGVyaWFsRGljdGlvbmFyeVtuYW1lXSA9IG11bHRpTWF0ZXJpYWw7XG5cdFx0XHR9XG5cdFx0XHQvKlxuXHRcdFx0aWYgKF9tZXNoUmVmZXJlbmNlW3RleHR1cmVJbmRleF0pIHtcblx0XHRcdFx0dmFyIG06TWVzaCA9IG1lc2guY2xvbmUoKSBhcyBNZXNoO1xuXHRcdFx0XHRtLm1hdGVyaWFsID0gbXVsdGlNYXRlcmlhbDtcblx0XHRcdFx0X3ZpZXcuc2NlbmUuYWRkQ2hpbGQobSk7XG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHRcdC8vZGVmYXVsdCB0byBtdWx0aXBhc3MgbWF0ZXJpYWxcblx0XHRcdG1lc2gubWF0ZXJpYWwgPSBtdWx0aU1hdGVyaWFsO1xuXG5cdFx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG1lc2gpO1xuXG5cdFx0XHR0aGlzLl9tZXNoUmVmZXJlbmNlW3RleHR1cmVJbmRleF0gPSBtZXNoO1xuXHRcdH1cblx0XHRcblx0XHR2YXIgejpudW1iZXIgLyp1aW50Ki8gPSAwO1xuXHRcdFxuXHRcdHdoaWxlICh6IDwgdGhpcy5fbnVtVGV4U3RyaW5ncy5sZW5ndGgpXG5cdFx0e1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzW3pdLCB0aGlzLl9udW1UZXhTdHJpbmdzW3pdKTtcblx0XHRcdHorKztcblx0XHR9XG5cblx0XHQvL2xvYWQgc2t5Ym94IGFuZCBmbGFtZSB0ZXh0dXJlXG5cblx0XHRBc3NldExpYnJhcnkuYWRkRXZlbnRMaXN0ZW5lcihMb2FkZXJFdmVudC5SRVNPVVJDRV9DT01QTEVURSwgKGV2ZW50OkxvYWRlckV2ZW50KSA9PiB0aGlzLm9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlKGV2ZW50KSk7XG5cblx0XHQvL3NldHVwIHRoZSB1cmwgbWFwIGZvciB0ZXh0dXJlcyBpbiB0aGUgY3ViZW1hcCBmaWxlXG5cdFx0dmFyIGFzc2V0TG9hZGVyQ29udGV4dDpBc3NldExvYWRlckNvbnRleHQgPSBuZXcgQXNzZXRMb2FkZXJDb250ZXh0KCk7XG5cdFx0YXNzZXRMb2FkZXJDb250ZXh0LmRlcGVuZGVuY3lCYXNlVXJsID0gXCJhc3NldHMvc2t5Ym94L1wiO1xuXG5cdFx0Ly9lbnZpcm9ubWVudCB0ZXh0dXJlXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvc2t5Ym94L2hvdXJnbGFzc190ZXh0dXJlLmN1YmVcIiksIGFzc2V0TG9hZGVyQ29udGV4dCk7XG5cblx0XHQvL2dsb2JlIHRleHR1cmVzXG5cdFx0QXNzZXRMaWJyYXJ5LmxvYWQobmV3IFVSTFJlcXVlc3QoXCJhc3NldHMvZmlyZS5wbmdcIikpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJlZCBvbmNlIGV4dHJhIHJlc291cmNlcyBhcmUgbG9hZGVkXG5cdCAqL1xuXHRwcml2YXRlIG9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlKGV2ZW50OkxvYWRlckV2ZW50KVxuXHR7XG5cdFx0c3dpdGNoKCBldmVudC51cmwgKVxuXHRcdHtcblx0XHRcdGNhc2UgJ2Fzc2V0cy9za3lib3gvaG91cmdsYXNzX3RleHR1cmUuY3ViZSc6XG5cdFx0XHRcdC8vY3JlYXRlIHNreWJveCB0ZXh0dXJlIG1hcFxuXHRcdFx0XHR0aGlzLl9za3lNYXAgPSA8SW1hZ2VDdWJlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImFzc2V0cy9maXJlLnBuZ1wiIDpcblx0XHRcdFx0dGhpcy5fZmxhbWVNYXRlcmlhbCA9IG5ldyBUcmlhbmdsZU1ldGhvZE1hdGVyaWFsKDxJbWFnZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdKTtcblx0XHRcdFx0dGhpcy5fZmxhbWVNYXRlcmlhbC5ibGVuZE1vZGUgPSBCbGVuZE1vZGUuQUREO1xuXHRcdFx0XHR0aGlzLl9mbGFtZU1hdGVyaWFsLmFuaW1hdGVVVnMgPSB0cnVlO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRpZiAodGhpcy5fc2t5TWFwICYmIHRoaXMuX2ZsYW1lTWF0ZXJpYWwpXG5cdFx0XHR0aGlzLmluaXRPYmplY3RzKCk7XG5cdH1cblxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0aW9uIGFuZCByZW5kZXIgbG9vcFxuXHQgKi9cblx0cHJpdmF0ZSBvbkVudGVyRnJhbWUoZHQ6bnVtYmVyKVxuXHR7XHRcblx0XHRpZiAodGhpcy5fd2Fsa1NwZWVkIHx8IHRoaXMuX3dhbGtBY2NlbGVyYXRpb24pIHtcblx0XHRcdHRoaXMuX3dhbGtTcGVlZCA9ICh0aGlzLl93YWxrU3BlZWQgKyB0aGlzLl93YWxrQWNjZWxlcmF0aW9uKSp0aGlzLl9kcmFnO1xuXHRcdFx0aWYgKE1hdGguYWJzKHRoaXMuX3dhbGtTcGVlZCkgPCAwLjAxKVxuXHRcdFx0XHR0aGlzLl93YWxrU3BlZWQgPSAwO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5pbmNyZW1lbnRXYWxrKHRoaXMuX3dhbGtTcGVlZCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmICh0aGlzLl9zdHJhZmVTcGVlZCB8fCB0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24pIHtcblx0XHRcdHRoaXMuX3N0cmFmZVNwZWVkID0gKHRoaXMuX3N0cmFmZVNwZWVkICsgdGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uKSp0aGlzLl9kcmFnO1xuXHRcdFx0aWYgKE1hdGguYWJzKHRoaXMuX3N0cmFmZVNwZWVkKSA8IDAuMDEpXG5cdFx0XHRcdHRoaXMuX3N0cmFmZVNwZWVkID0gMDtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuaW5jcmVtZW50U3RyYWZlKHRoaXMuX3N0cmFmZVNwZWVkKTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9hbmltYXRlIGZsYW1lc1xuXHRcdHZhciBmbGFtZVZPOkZsYW1lVk87XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9mbGFtZURhdGEubGVuZ3RoO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRmbGFtZVZPID0gdGhpcy5fZmxhbWVEYXRhW2ldO1xuXHRcdFx0Ly91cGRhdGUgZmxhbWUgbGlnaHRcblx0XHRcdHZhciBsaWdodCA6IFBvaW50TGlnaHQgPSBmbGFtZVZPLmxpZ2h0O1xuXHRcdFx0XG5cdFx0XHRpZiAoIWxpZ2h0KVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0bGlnaHQuZmFsbE9mZiA9IDM4MCtNYXRoLnJhbmRvbSgpKjIwO1xuXHRcdFx0bGlnaHQucmFkaXVzID0gMjAwK01hdGgucmFuZG9tKCkqMzA7XG5cdFx0XHRsaWdodC5kaWZmdXNlID0gLjkrTWF0aC5yYW5kb20oKSouMTtcblx0XHRcdFxuXHRcdFx0Ly91cGRhdGUgZmxhbWUgbWVzaFxuXHRcdFx0dmFyIG1lc2ggOiBNZXNoID0gZmxhbWVWTy5tZXNoO1xuXHRcdFx0XG5cdFx0XHRpZiAoIW1lc2gpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHR2YXIgc3ViTWVzaDpJU3ViTWVzaCA9IG1lc2guc3ViTWVzaGVzWzBdO1xuXHRcdFx0c3ViTWVzaC51dlRyYW5zZm9ybS5vZmZzZXRVICs9IDEvMTY7XG5cdFx0XHRzdWJNZXNoLnV2VHJhbnNmb3JtLm9mZnNldFUgJT0gMTtcblx0XHRcdG1lc2gucm90YXRpb25ZID0gTWF0aC5hdGFuMihtZXNoLnggLSB0aGlzLl92aWV3LmNhbWVyYS54LCBtZXNoLnogLSB0aGlzLl92aWV3LmNhbWVyYS56KSoxODAvTWF0aC5QSTtcblx0XHR9XG5cblx0XHR0aGlzLl92aWV3LnJlbmRlcigpO1xuXHRcdFxuXHR9XG5cdFxuXHRcdFx0XG5cdC8qKlxuXHQgKiBLZXkgZG93biBsaXN0ZW5lciBmb3IgY2FtZXJhIGNvbnRyb2xcblx0ICovXG5cdHByaXZhdGUgb25LZXlEb3duKGV2ZW50OktleWJvYXJkRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVVA6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlc6XG5cdFx0XHRcdHRoaXMuX3dhbGtBY2NlbGVyYXRpb24gPSB0aGlzLl93YWxrSW5jcmVtZW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IC10aGlzLl93YWxrSW5jcmVtZW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTEVGVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuQTpcblx0XHRcdFx0dGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uID0gLXRoaXMuX3N0cmFmZUluY3JlbWVudDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlJJR0hUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5EOlxuXHRcdFx0XHR0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24gPSB0aGlzLl9zdHJhZmVJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5GOlxuXHRcdFx0XHQvL3N0YWdlLmRpc3BsYXlTdGF0ZSA9IFN0YWdlRGlzcGxheVN0YXRlLkZVTExfU0NSRUVOO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuQzpcblx0XHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5mbHkgPSAhdGhpcy5fY2FtZXJhQ29udHJvbGxlci5mbHk7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogS2V5IHVwIGxpc3RlbmVyIGZvciBjYW1lcmEgY29udHJvbFxuXHQgKi9cblx0cHJpdmF0ZSBvbktleVVwKGV2ZW50OktleWJvYXJkRXZlbnQpXG5cdHtcblx0XHRzd2l0Y2ggKGV2ZW50LmtleUNvZGUpIHtcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVVA6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlc6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkRPV046XG5cdFx0XHRjYXNlIEtleWJvYXJkLlM6XG5cdFx0XHRcdHRoaXMuX3dhbGtBY2NlbGVyYXRpb24gPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuTEVGVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuQTpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbiA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSBkb3duIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VEb3duKGV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fbGFzdFBhbkFuZ2xlID0gdGhpcy5fY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZTtcblx0XHR0aGlzLl9sYXN0VGlsdEFuZ2xlID0gdGhpcy5fY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGU7XG5cdFx0dGhpcy5fbGFzdE1vdXNlWCA9IGV2ZW50LmNsaWVudFg7XG5cdFx0dGhpcy5fbGFzdE1vdXNlWSA9IGV2ZW50LmNsaWVudFk7XG5cdFx0dGhpcy5fbW92ZSA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgdXAgbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZVVwKGV2ZW50KVxuXHR7XG5cdFx0dGhpcy5fbW92ZSA9IGZhbHNlO1xuXHR9XG5cblx0cHJpdmF0ZSBvbk1vdXNlTW92ZShldmVudClcblx0e1xuXHRcdGlmICh0aGlzLl9tb3ZlKSB7XG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlID0gMC4zKihldmVudC5jbGllbnRYIC0gdGhpcy5fbGFzdE1vdXNlWCkgKyB0aGlzLl9sYXN0UGFuQW5nbGU7XG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WSAtIHRoaXMuX2xhc3RNb3VzZVkpICsgdGhpcy5fbGFzdFRpbHRBbmdsZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogc3RhZ2UgbGlzdGVuZXIgZm9yIHJlc2l6ZSBldmVudHNcblx0ICovXG5cdHByaXZhdGUgb25SZXNpemUoZXZlbnQgPSBudWxsKVxuXHR7XG5cdFx0dGhpcy5fdmlldy55ICAgICAgICAgPSAwO1xuXHRcdHRoaXMuX3ZpZXcueCAgICAgICAgID0gMDtcblx0XHR0aGlzLl92aWV3LndpZHRoICAgICA9IHdpbmRvdy5pbm5lcldpZHRoO1xuXHRcdHRoaXMuX3ZpZXcuaGVpZ2h0ICAgID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHR9XG59XG5cbi8qKlxuKiBEYXRhIGNsYXNzIGZvciB0aGUgRmxhbWUgb2JqZWN0c1xuKi9cbmNsYXNzIEZsYW1lVk9cbntcblx0cHVibGljIHBvc2l0aW9uOlZlY3RvcjNEO1xuXHRwdWJsaWMgY29sb3I6bnVtYmVyIC8qdWludCovO1xuXHRwdWJsaWMgbWVzaDpNZXNoO1xuXHRwdWJsaWMgbGlnaHQ6UG9pbnRMaWdodDtcblxuXHRjb25zdHJ1Y3Rvcihwb3NpdGlvbjpWZWN0b3IzRCwgY29sb3I6bnVtYmVyIC8qdWludCovKVxuXHR7XG5cdFx0dGhpcy5wb3NpdGlvbiA9IHBvc2l0aW9uO1xuXHRcdHRoaXMuY29sb3IgPSBjb2xvcjtcblx0fVxufVxuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKClcbntcblx0bmV3IEFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8oKTtcbn0iXX0=