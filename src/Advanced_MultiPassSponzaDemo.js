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
var TriangleMethodMaterial = require("awayjs-renderergl/lib/materials/TriangleMethodMaterial");
var TriangleMaterialMode = require("awayjs-renderergl/lib/materials/TriangleMaterialMode");
var ShadowSoftMethod = require("awayjs-renderergl/lib/materials/methods/ShadowSoftMethod");
var EffectFogMethod = require("awayjs-renderergl/lib/materials/methods/EffectFogMethod");
var Merge = require("awayjs-renderergl/lib/tools/commands/Merge");
var DefaultRenderer = require("awayjs-renderergl/lib/render/DefaultRenderer");
var AWDParser = require("awayjs-renderergl/lib/parsers/AWDParser");
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnRzIl0sIm5hbWVzIjpbIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0IiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0RW5naW5lIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0TGlnaHRzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0T2JqZWN0cyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8uaW5pdExpc3RlbmVycyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8udXBkYXRlRGlyZWN0aW9uIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5jb3VudE51bVRleHR1cmVzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkUHJvZ3Jlc3MiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnBhcnNlQml0bWFwIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkJpdG1hcENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5wYXJzZUFXRCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Bc3NldENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vblJlc291cmNlQ29tcGxldGUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkVudGVyRnJhbWUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uS2V5RG93biIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25LZXlVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZURvd24iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uTW91c2VVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZU1vdmUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uUmVzaXplIiwiRmxhbWVWTyIsIkZsYW1lVk8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2Q0U7QUFFRixJQUFPLEtBQUssV0FBaUIsOEJBQThCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUN0RSxJQUFPLGFBQWEsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sV0FBVyxXQUFnQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hFLElBQU8sV0FBVyxXQUFnQixrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3RFLElBQU8sUUFBUSxXQUFpQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2pFLElBQU8sWUFBWSxXQUFnQixzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sa0JBQWtCLFdBQWMsNENBQTRDLENBQUMsQ0FBQztBQUNyRixJQUFPLFNBQVMsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUNyRSxJQUFPLFNBQVMsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNqRSxJQUFPLG1CQUFtQixXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFDbkYsSUFBTyxVQUFVLFdBQWdCLGdDQUFnQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxXQUFXLFdBQWdCLHFDQUFxQyxDQUFDLENBQUM7QUFFekUsSUFBTyxZQUFZLFdBQWdCLHVDQUF1QyxDQUFDLENBQUM7QUFDNUUsSUFBTyxxQkFBcUIsV0FBYSxnREFBZ0QsQ0FBQyxDQUFDO0FBQzNGLElBQU8s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QTtRQUU3QmlCLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLElBQUlBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLElBQUlBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUN0Q0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLENBQUNBO1FBRURBLEFBQ0FBLGdCQURnQkE7WUFDWkEsT0FBZUEsQ0FBQ0E7UUFDcEJB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QVpBLFlBQVlBO1FBRTVCQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQU9BLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFNQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDRnZCLG1DQUFDQTtBQUFEQSxDQXJ5QkEsQUFxeUJDQSxJQUFBO0FBRUQsQUFHQTs7RUFERTtJQUNJLE9BQU87SUFPWndCLFNBUEtBLE9BQU9BLENBT0FBLFFBQWlCQSxFQUFFQSxLQUFLQSxDQUFRQSxRQUFEQSxBQUFTQTtRQUVuREMsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUNGRCxjQUFDQTtBQUFEQSxDQVpBLEFBWUNBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSw0QkFBNEIsRUFBRSxDQUFDO0FBQ3BDLENBQUMsQ0FBQSIsImZpbGUiOiJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuQ3J5dGVrIFNwb256YSBkZW1vIHVzaW5nIG11bHRpcGFzcyBtYXRlcmlhbHMgaW4gQXdheTNEXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGFwcGx5IE11bHRpcGFzcyBtYXRlcmlhbHMgdG8gYSBtb2RlbFxuSG93IHRvIGVuYWJsZSBjYXNjYWRpbmcgc2hhZG93IG1hcHMgb24gYSBtdWx0aXBhc3MgbWF0ZXJpYWwuXG5Ib3cgdG8gc2V0dXAgbXVsdGlwbGUgbGlnaHRzb3VyY2VzLCBzaGFkb3dzIGFuZCBmb2cgZWZmZWN0cyBhbGwgaW4gdGhlIHNhbWUgc2NlbmUuXG5Ib3cgdG8gYXBwbHkgc3BlY3VsYXIsIG5vcm1hbCBhbmQgZGlmZnVzZSBtYXBzIHRvIGFuIEFXRCBtb2RlbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hbiAmIERhdmlkIExlbmFlcnRzXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuZGF2aWQubGVuYWVydHNAZ21haWwuY29tXG5odHRwOi8vd3d3LmRlcnNjaG1hbGUuY29tXG5cbk1vZGVsIHJlLW1vZGVsZWQgYnkgRnJhbmsgTWVpbmwgYXQgQ3J5dGVrIHdpdGggaW5zcGlyYXRpb24gZnJvbSBNYXJrbyBEYWJyb3ZpYydzIG9yaWdpbmFsLCBjb252ZXJ0ZWQgdG8gQVdEIGJ5IExvVEhcbmNvbnRhY3RAY3J5dGVrLmNvbVxuaHR0cDovL3d3dy5jcnl0ZWsuY29tL2NyeWVuZ2luZS9jcnllbmdpbmUzL2Rvd25sb2Fkc1xuM2RmbGFzaGxvQGdtYWlsLmNvbVxuaHR0cDovLzNkZmxhc2hsby53b3JkcHJlc3MuY29tXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbmltcG9ydCBFdmVudFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9FdmVudFwiKTtcbmltcG9ydCBBc3NldEV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Bc3NldEV2ZW50XCIpO1xuaW1wb3J0IFByb2dyZXNzRXZlbnRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Qcm9ncmVzc0V2ZW50XCIpO1xuaW1wb3J0IExvYWRlckV2ZW50XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2V2ZW50cy9Mb2FkZXJFdmVudFwiKTtcbmltcG9ydCBVVlRyYW5zZm9ybVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1VWVHJhbnNmb3JtXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZ2VvbS9WZWN0b3IzRFwiKTtcbmltcG9ydCBBc3NldExpYnJhcnlcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExpYnJhcnlcIik7XG5pbXBvcnQgQXNzZXRMb2FkZXJDb250ZXh0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbGlicmFyeS9Bc3NldExvYWRlckNvbnRleHRcIik7XG5pbXBvcnQgQXNzZXRUeXBlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2xpYnJhcnkvQXNzZXRUeXBlXCIpO1xuaW1wb3J0IFVSTExvYWRlclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMTG9hZGVyXCIpO1xuaW1wb3J0IFVSTExvYWRlckRhdGFGb3JtYXRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMTG9hZGVyRGF0YUZvcm1hdFwiKTtcbmltcG9ydCBVUkxSZXF1ZXN0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL25ldC9VUkxSZXF1ZXN0XCIpO1xuaW1wb3J0IFBhcnNlclV0aWxzXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3BhcnNlcnMvUGFyc2VyVXRpbHNcIik7XG5pbXBvcnQgSW1hZ2VDdWJlVGV4dHVyZVx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VDdWJlVGV4dHVyZVwiKTtcbmltcG9ydCBJbWFnZVRleHR1cmVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvSW1hZ2VUZXh0dXJlXCIpO1xuaW1wb3J0IFNwZWN1bGFyQml0bWFwVGV4dHVyZVx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi90ZXh0dXJlcy9TcGVjdWxhckJpdG1hcFRleHR1cmVcIik7XG5pbXBvcnQgS2V5Ym9hcmRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi91aS9LZXlib2FyZFwiKTtcbmltcG9ydCBSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdXRpbHMvUmVxdWVzdEFuaW1hdGlvbkZyYW1lXCIpO1xuXG5pbXBvcnQgTG9hZGVyXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9Mb2FkZXJcIik7XG5pbXBvcnQgVmlld1x0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udGFpbmVycy9WaWV3XCIpO1xuaW1wb3J0IEZpcnN0UGVyc29uQ29udHJvbGxlclx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9jb250cm9sbGVycy9GaXJzdFBlcnNvbkNvbnRyb2xsZXJcIik7XG5pbXBvcnQgR2VvbWV0cnlcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0dlb21ldHJ5XCIpO1xuaW1wb3J0IElTdWJNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9JU3ViTWVzaFwiKTtcbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgTWVzaFx0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvTWVzaFwiKTtcbmltcG9ydCBTa3lib3hcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9Ta3lib3hcIik7XG5pbXBvcnQgRGlyZWN0aW9uYWxMaWdodFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvRGlyZWN0aW9uYWxMaWdodFwiKTtcbmltcG9ydCBQb2ludExpZ2h0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1BvaW50TGlnaHRcIik7XG4vL1x0aW1wb3J0IENhc2NhZGVTaGFkb3dNYXBwZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9DYXNjYWRlU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IERpcmVjdGlvbmFsU2hhZG93TWFwcGVyXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL21hdGVyaWFscy9zaGFkb3dtYXBwZXJzL0RpcmVjdGlvbmFsU2hhZG93TWFwcGVyXCIpO1xuaW1wb3J0IFN0YXRpY0xpZ2h0UGlja2VyXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL2xpZ2h0cGlja2Vycy9TdGF0aWNMaWdodFBpY2tlclwiKTtcbmltcG9ydCBQcmltaXRpdmVQbGFuZVByZWZhYlx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL3ByZWZhYnMvUHJpbWl0aXZlUGxhbmVQcmVmYWJcIik7XG5pbXBvcnQgQ2FzdFx0XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvdXRpbHMvQ2FzdFwiKTtcblxuaW1wb3J0IFNreWJveE1hdGVyaWFsXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvU2t5Ym94TWF0ZXJpYWxcIik7XG5pbXBvcnQgVHJpYW5nbGVNZXRob2RNYXRlcmlhbFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvVHJpYW5nbGVNZXRob2RNYXRlcmlhbFwiKTtcbmltcG9ydCBUcmlhbmdsZU1hdGVyaWFsTW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL21hdGVyaWFscy9UcmlhbmdsZU1hdGVyaWFsTW9kZVwiKTtcbmltcG9ydCBTaGFkb3dDYXNjYWRlTWV0aG9kXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvU2hhZG93Q2FzY2FkZU1ldGhvZFwiKTtcbmltcG9ydCBTaGFkb3dTb2Z0TWV0aG9kXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9tYXRlcmlhbHMvbWV0aG9kcy9TaGFkb3dTb2Z0TWV0aG9kXCIpO1xuaW1wb3J0IEVmZmVjdEZvZ01ldGhvZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvbWF0ZXJpYWxzL21ldGhvZHMvRWZmZWN0Rm9nTWV0aG9kXCIpO1xuaW1wb3J0IE1lcmdlXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtcmVuZGVyZXJnbC9saWIvdG9vbHMvY29tbWFuZHMvTWVyZ2VcIik7XG5pbXBvcnQgRGVmYXVsdFJlbmRlcmVyXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi9yZW5kZXIvRGVmYXVsdFJlbmRlcmVyXCIpO1xuXG5pbXBvcnQgQVdEUGFyc2VyXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL3BhcnNlcnMvQVdEUGFyc2VyXCIpO1xuXG5jbGFzcyBBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vXG57XG5cdC8vcm9vdCBmaWxlcGF0aCBmb3IgYXNzZXQgbG9hZGluZ1xuXHRwcml2YXRlIF9hc3NldHNSb290OnN0cmluZyA9IFwiYXNzZXRzL1wiO1xuXHRcblx0Ly9kZWZhdWx0IG1hdGVyaWFsIGRhdGEgc3RyaW5nc1xuXHRwcml2YXRlIF9tYXRlcmlhbE5hbWVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFwiYXJjaFwiLCAgICAgICAgICAgIFwiTWF0ZXJpYWxfXzI5OFwiLCAgXCJicmlja3NcIiwgICAgICAgICAgICBcImNlaWxpbmdcIiwgICAgICAgICAgICBcImNoYWluXCIsICAgICAgICAgICAgIFwiY29sdW1uX2FcIiwgICAgICAgICAgXCJjb2x1bW5fYlwiLCAgICAgICAgICBcImNvbHVtbl9jXCIsICAgICAgICAgIFwiZmFicmljX2dcIiwgICAgICAgICAgICAgIFwiZmFicmljX2NcIiwgICAgICAgICBcImZhYnJpY19mXCIsICAgICAgICAgICAgICAgXCJkZXRhaWxzXCIsICAgICAgICAgIFwiZmFicmljX2RcIiwgICAgICAgICAgICAgXCJmYWJyaWNfYVwiLCAgICAgICAgXCJmYWJyaWNfZVwiLCAgICAgICAgICAgICAgXCJmbGFncG9sZVwiLCAgICAgICAgICBcImZsb29yXCIsICAgICAgICAgICAgXCIxNl9fX0RlZmF1bHRcIixcIk1hdGVyaWFsX18yNVwiLFwicm9vZlwiLCAgICAgICBcImxlYWZcIiwgICAgICAgICAgIFwidmFzZVwiLCAgICAgICAgIFwidmFzZV9oYW5naW5nXCIsICAgICBcIk1hdGVyaWFsX181N1wiLCAgIFwidmFzZV9yb3VuZFwiKTtcblx0XG5cdC8vcHJpdmF0ZSBjb25zdCBkaWZmdXNlVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oW1wiYXJjaF9kaWZmLmF0ZlwiLCBcImJhY2tncm91bmQuYXRmXCIsIFwiYnJpY2tzX2FfZGlmZi5hdGZcIiwgXCJjZWlsaW5nX2FfZGlmZi5hdGZcIiwgXCJjaGFpbl90ZXh0dXJlLnBuZ1wiLCBcImNvbHVtbl9hX2RpZmYuYXRmXCIsIFwiY29sdW1uX2JfZGlmZi5hdGZcIiwgXCJjb2x1bW5fY19kaWZmLmF0ZlwiLCBcImN1cnRhaW5fYmx1ZV9kaWZmLmF0ZlwiLCBcImN1cnRhaW5fZGlmZi5hdGZcIiwgXCJjdXJ0YWluX2dyZWVuX2RpZmYuYXRmXCIsIFwiZGV0YWlsc19kaWZmLmF0ZlwiLCBcImZhYnJpY19ibHVlX2RpZmYuYXRmXCIsIFwiZmFicmljX2RpZmYuYXRmXCIsIFwiZmFicmljX2dyZWVuX2RpZmYuYXRmXCIsIFwiZmxhZ3BvbGVfZGlmZi5hdGZcIiwgXCJmbG9vcl9hX2RpZmYuYXRmXCIsIFwiZ2lfZmxhZy5hdGZcIiwgXCJsaW9uLmF0ZlwiLCBcInJvb2ZfZGlmZi5hdGZcIiwgXCJ0aG9ybl9kaWZmLnBuZ1wiLCBcInZhc2VfZGlmLmF0ZlwiLCBcInZhc2VfaGFuZ2luZy5hdGZcIiwgXCJ2YXNlX3BsYW50LnBuZ1wiLCBcInZhc2Vfcm91bmQuYXRmXCJdKTtcblx0Ly9wcml2YXRlIGNvbnN0IG5vcm1hbFRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFtcImFyY2hfZGRuLmF0ZlwiLCBcImJhY2tncm91bmRfZGRuLmF0ZlwiLCBcImJyaWNrc19hX2Rkbi5hdGZcIiwgbnVsbCwgICAgICAgICAgICAgICAgXCJjaGFpbl90ZXh0dXJlX2Rkbi5hdGZcIiwgXCJjb2x1bW5fYV9kZG4uYXRmXCIsIFwiY29sdW1uX2JfZGRuLmF0ZlwiLCBcImNvbHVtbl9jX2Rkbi5hdGZcIiwgbnVsbCwgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgIFwibGlvbjJfZGRuLmF0ZlwiLCBudWxsLCAgICAgICBcInRob3JuX2Rkbi5hdGZcIiwgXCJ2YXNlX2Rkbi5hdGZcIiwgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgXCJ2YXNlX3JvdW5kX2Rkbi5hdGZcIl0pO1xuXHQvL3ByaXZhdGUgY29uc3Qgc3BlY3VsYXJUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihbXCJhcmNoX3NwZWMuYXRmXCIsIG51bGwsICAgICAgICAgICAgXCJicmlja3NfYV9zcGVjLmF0ZlwiLCBcImNlaWxpbmdfYV9zcGVjLmF0ZlwiLCBudWxsLCAgICAgICAgICAgICAgICBcImNvbHVtbl9hX3NwZWMuYXRmXCIsIFwiY29sdW1uX2Jfc3BlYy5hdGZcIiwgXCJjb2x1bW5fY19zcGVjLmF0ZlwiLCBcImN1cnRhaW5fc3BlYy5hdGZcIiwgICAgICBcImN1cnRhaW5fc3BlYy5hdGZcIiwgXCJjdXJ0YWluX3NwZWMuYXRmXCIsICAgICAgIFwiZGV0YWlsc19zcGVjLmF0ZlwiLCBcImZhYnJpY19zcGVjLmF0ZlwiLCAgICAgIFwiZmFicmljX3NwZWMuYXRmXCIsIFwiZmFicmljX3NwZWMuYXRmXCIsICAgICAgIFwiZmxhZ3BvbGVfc3BlYy5hdGZcIiwgXCJmbG9vcl9hX3NwZWMuYXRmXCIsIG51bGwsICAgICAgICAgIG51bGwsICAgICAgIG51bGwsICAgICAgICAgICAgXCJ0aG9ybl9zcGVjLmF0ZlwiLCBudWxsLCAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBcInZhc2VfcGxhbnRfc3BlYy5hdGZcIiwgXCJ2YXNlX3JvdW5kX3NwZWMuYXRmXCJdKTtcblx0XG5cdHByaXZhdGUgX2RpZmZ1c2VUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hfZGlmZi5qcGdcIiwgXCJiYWNrZ3JvdW5kLmpwZ1wiLCBcImJyaWNrc19hX2RpZmYuanBnXCIsIFwiY2VpbGluZ19hX2RpZmYuanBnXCIsIFwiY2hhaW5fdGV4dHVyZS5wbmdcIiwgXCJjb2x1bW5fYV9kaWZmLmpwZ1wiLCBcImNvbHVtbl9iX2RpZmYuanBnXCIsIFwiY29sdW1uX2NfZGlmZi5qcGdcIiwgXCJjdXJ0YWluX2JsdWVfZGlmZi5qcGdcIiwgXCJjdXJ0YWluX2RpZmYuanBnXCIsIFwiY3VydGFpbl9ncmVlbl9kaWZmLmpwZ1wiLCBcImRldGFpbHNfZGlmZi5qcGdcIiwgXCJmYWJyaWNfYmx1ZV9kaWZmLmpwZ1wiLCBcImZhYnJpY19kaWZmLmpwZ1wiLCBcImZhYnJpY19ncmVlbl9kaWZmLmpwZ1wiLCBcImZsYWdwb2xlX2RpZmYuanBnXCIsIFwiZmxvb3JfYV9kaWZmLmpwZ1wiLCBcImdpX2ZsYWcuanBnXCIsIFwibGlvbi5qcGdcIiwgXCJyb29mX2RpZmYuanBnXCIsIFwidGhvcm5fZGlmZi5wbmdcIiwgXCJ2YXNlX2RpZi5qcGdcIiwgXCJ2YXNlX2hhbmdpbmcuanBnXCIsIFwidmFzZV9wbGFudC5wbmdcIiwgXCJ2YXNlX3JvdW5kLmpwZ1wiKTtcblx0cHJpdmF0ZSBfbm9ybWFsVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoX2Rkbi5qcGdcIiwgXCJiYWNrZ3JvdW5kX2Rkbi5qcGdcIiwgXCJicmlja3NfYV9kZG4uanBnXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY2hhaW5fdGV4dHVyZV9kZG4uanBnXCIsIFwiY29sdW1uX2FfZGRuLmpwZ1wiLCBcImNvbHVtbl9iX2Rkbi5qcGdcIiwgXCJjb2x1bW5fY19kZG4uanBnXCIsIG51bGwsICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICBcImxpb24yX2Rkbi5qcGdcIiwgbnVsbCwgICAgICAgXCJ0aG9ybl9kZG4uanBnXCIsIFwidmFzZV9kZG4uanBnXCIsICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgIFwidmFzZV9yb3VuZF9kZG4uanBnXCIpO1xuXHRwcml2YXRlIF9zcGVjdWxhclRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFwiYXJjaF9zcGVjLmpwZ1wiLCBudWxsLCAgICAgICAgICAgIFwiYnJpY2tzX2Ffc3BlYy5qcGdcIiwgXCJjZWlsaW5nX2Ffc3BlYy5qcGdcIiwgbnVsbCwgICAgICAgICAgICAgICAgXCJjb2x1bW5fYV9zcGVjLmpwZ1wiLCBcImNvbHVtbl9iX3NwZWMuanBnXCIsIFwiY29sdW1uX2Nfc3BlYy5qcGdcIiwgXCJjdXJ0YWluX3NwZWMuanBnXCIsICAgICAgXCJjdXJ0YWluX3NwZWMuanBnXCIsIFwiY3VydGFpbl9zcGVjLmpwZ1wiLCAgICAgICBcImRldGFpbHNfc3BlYy5qcGdcIiwgXCJmYWJyaWNfc3BlYy5qcGdcIiwgICAgICBcImZhYnJpY19zcGVjLmpwZ1wiLCBcImZhYnJpY19zcGVjLmpwZ1wiLCAgICAgICBcImZsYWdwb2xlX3NwZWMuanBnXCIsIFwiZmxvb3JfYV9zcGVjLmpwZ1wiLCBudWxsLCAgICAgICAgICBudWxsLCAgICAgICBudWxsLCAgICAgICAgICAgIFwidGhvcm5fc3BlYy5qcGdcIiwgbnVsbCwgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgXCJ2YXNlX3BsYW50X3NwZWMuanBnXCIsIFwidmFzZV9yb3VuZF9zcGVjLmpwZ1wiKTtcblx0cHJpdmF0ZSBfbnVtVGV4U3RyaW5nczpBcnJheTxudW1iZXIgLyp1aW50Ki8+ID0gQXJyYXk8bnVtYmVyIC8qdWludCovPigwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCk7XG5cdHByaXZhdGUgX21lc2hSZWZlcmVuY2U6TWVzaFtdID0gbmV3IEFycmF5PE1lc2g+KDI1KTtcblx0XG5cdC8vZmxhbWUgZGF0YSBvYmplY3RzXG5cdHByaXZhdGUgX2ZsYW1lRGF0YTpBcnJheTxGbGFtZVZPPiA9IEFycmF5PEZsYW1lVk8+KG5ldyBGbGFtZVZPKG5ldyBWZWN0b3IzRCgtNjI1LCAxNjUsIDIxOSksIDB4ZmZhYTQ0KSwgbmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKDQ4NSwgMTY1LCAyMTkpLCAweGZmYWE0NCksIG5ldyBGbGFtZVZPKG5ldyBWZWN0b3IzRCgtNjI1LCAxNjUsIC0xNDgpLCAweGZmYWE0NCksIG5ldyBGbGFtZVZPKG5ldyBWZWN0b3IzRCg0ODUsIDE2NSwgLTE0OCksIDB4ZmZhYTQ0KSk7XG5cdFxuXHQvL21hdGVyaWFsIGRpY3Rpb25hcmllcyB0byBob2xkIGluc3RhbmNlc1xuXHRwcml2YXRlIF90ZXh0dXJlRGljdGlvbmFyeTpPYmplY3QgPSBuZXcgT2JqZWN0KCk7XG5cdHByaXZhdGUgX211bHRpTWF0ZXJpYWxEaWN0aW9uYXJ5Ok9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0cHJpdmF0ZSBfc2luZ2xlTWF0ZXJpYWxEaWN0aW9uYXJ5Ok9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0XG5cdC8vcHJpdmF0ZSBtZXNoRGljdGlvbmFyeTpEaWN0aW9uYXJ5ID0gbmV3IERpY3Rpb25hcnkoKTtcblx0cHJpdmF0ZSB2YXNlTWVzaGVzOkFycmF5PE1lc2g+ID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdHByaXZhdGUgcG9sZU1lc2hlczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRwcml2YXRlIGNvbE1lc2hlczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRcblx0Ly9lbmdpZW4gdmFyaWFibGVzXG5cdHByaXZhdGUgX3ZpZXc6Vmlldztcblx0cHJpdmF0ZSBfY2FtZXJhQ29udHJvbGxlcjpGaXJzdFBlcnNvbkNvbnRyb2xsZXI7XG5cdFxuXHQvL2d1aSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfc2luZ2xlUGFzc01hdGVyaWFsOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbXVsdGlQYXNzTWF0ZXJpYWw6Ym9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2Nhc2NhZGVMZXZlbHM6bnVtYmVyIC8qdWludCovID0gMztcblx0cHJpdmF0ZSBfc2hhZG93T3B0aW9uczpzdHJpbmcgPSBcIlBDRlwiO1xuXHRwcml2YXRlIF9kZXB0aE1hcFNpemU6bnVtYmVyIC8qdWludCovID0gMjA0ODtcblx0cHJpdmF0ZSBfbGlnaHREaXJlY3Rpb246bnVtYmVyID0gTWF0aC5QSS8yO1xuXHRwcml2YXRlIF9saWdodEVsZXZhdGlvbjpudW1iZXIgPSBNYXRoLlBJLzE4O1xuXHRcblx0Ly9saWdodCB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfbGlnaHRQaWNrZXI6U3RhdGljTGlnaHRQaWNrZXI7XG5cdHByaXZhdGUgX2Jhc2VTaGFkb3dNZXRob2Q6U2hhZG93U29mdE1ldGhvZDtcblx0cHJpdmF0ZSBfY2FzY2FkZU1ldGhvZDpTaGFkb3dDYXNjYWRlTWV0aG9kO1xuXHRwcml2YXRlIF9mb2dNZXRob2QgOiBFZmZlY3RGb2dNZXRob2Q7XG5cdHByaXZhdGUgX2Nhc2NhZGVTaGFkb3dNYXBwZXI6RGlyZWN0aW9uYWxTaGFkb3dNYXBwZXI7XG5cdHByaXZhdGUgX2RpcmVjdGlvbmFsTGlnaHQ6RGlyZWN0aW9uYWxMaWdodDtcblx0cHJpdmF0ZSBfbGlnaHRzOkFycmF5PGFueT4gPSBuZXcgQXJyYXk8YW55PigpO1xuXHRcblx0Ly9tYXRlcmlhbCB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfc2t5TWFwOkltYWdlQ3ViZVRleHR1cmU7XG5cdHByaXZhdGUgX2ZsYW1lTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbDtcblx0cHJpdmF0ZSBfbnVtVGV4dHVyZXM6bnVtYmVyIC8qdWludCovID0gMDtcblx0cHJpdmF0ZSBfY3VycmVudFRleHR1cmU6bnVtYmVyIC8qdWludCovID0gMDtcblx0cHJpdmF0ZSBfbG9hZGluZ1RleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz47XG5cdHByaXZhdGUgX246bnVtYmVyIC8qdWludCovID0gMDtcblx0cHJpdmF0ZSBfbG9hZGluZ1RleHQ6c3RyaW5nO1xuXHRcblx0Ly9zY2VuZSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfbWVzaGVzOkFycmF5PE1lc2g+ID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdHByaXZhdGUgX2ZsYW1lR2VvbWV0cnk6UHJpbWl0aXZlUGxhbmVQcmVmYWI7XG5cdFx0XHRcblx0Ly9yb3RhdGlvbiB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfbW92ZTpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX2xhc3RQYW5BbmdsZTpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RUaWx0QW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0TW91c2VYOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWTpudW1iZXI7XG5cdFxuXHQvL21vdmVtZW50IHZhcmlhYmxlc1xuXHRwcml2YXRlIF9kcmFnOm51bWJlciA9IDAuNTtcblx0cHJpdmF0ZSBfd2Fsa0luY3JlbWVudDpudW1iZXIgPSAxMDtcblx0cHJpdmF0ZSBfc3RyYWZlSW5jcmVtZW50Om51bWJlciA9IDEwO1xuXHRwcml2YXRlIF93YWxrU3BlZWQ6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfc3RyYWZlU3BlZWQ6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfd2Fsa0FjY2VsZXJhdGlvbjpudW1iZXIgPSAwO1xuXHRwcml2YXRlIF9zdHJhZmVBY2NlbGVyYXRpb246bnVtYmVyID0gMDtcblxuXHRwcml2YXRlIF90aW1lcjpSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cdHByaXZhdGUgX3RpbWU6bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBwYXJzZUFXRERlbGVnYXRlOihldmVudDpFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBwYXJzZUJpdG1hcERlbGVnYXRlOihldmVudDpFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBsb2FkUHJvZ3Jlc3NEZWxlZ2F0ZTooZXZlbnQ6UHJvZ3Jlc3NFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBvbkJpdG1hcENvbXBsZXRlRGVsZWdhdGU6KGV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIG9uQXNzZXRDb21wbGV0ZURlbGVnYXRlOihldmVudDpBc3NldEV2ZW50KSA9PiB2b2lkO1xuXHRwcml2YXRlIG9uUmVzb3VyY2VDb21wbGV0ZURlbGVnYXRlOihldmVudDpMb2FkZXJFdmVudCkgPT4gdm9pZDtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3Jcblx0ICovXG5cdGNvbnN0cnVjdG9yKClcblx0e1xuXHRcdHRoaXMuaW5pdCgpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogR2xvYmFsIGluaXRpYWxpc2UgZnVuY3Rpb25cblx0ICovXG5cdHByaXZhdGUgaW5pdCgpXG5cdHtcblx0XHR0aGlzLmluaXRFbmdpbmUoKTtcblx0XHR0aGlzLmluaXRMaWdodHMoKTtcblx0XHR0aGlzLmluaXRMaXN0ZW5lcnMoKTtcblx0XHRcblx0XHRcblx0XHQvL2NvdW50IHRleHR1cmVzXG5cdFx0dGhpcy5fbiA9IDA7XG5cdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzO1xuXHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdFxuXHRcdC8va2lja29mZiBhc3NldCBsb2FkaW5nXG5cdFx0dGhpcy5fbiA9IDA7XG5cdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzO1xuXHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuXHR9XG5cdFxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgZW5naW5lXG5cdCAqL1xuXHRwcml2YXRlIGluaXRFbmdpbmUoKVxuXHR7XG5cdFx0Ly9jcmVhdGUgdGhlIHZpZXdcblx0XHR0aGlzLl92aWV3ID0gbmV3IFZpZXcobmV3IERlZmF1bHRSZW5kZXJlcigpKTtcblx0XHR0aGlzLl92aWV3LmNhbWVyYS55ID0gMTUwO1xuXHRcdHRoaXMuX3ZpZXcuY2FtZXJhLnogPSAwO1xuXHRcdFxuXHRcdC8vc2V0dXAgY29udHJvbGxlciB0byBiZSB1c2VkIG9uIHRoZSBjYW1lcmFcblx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyID0gbmV3IEZpcnN0UGVyc29uQ29udHJvbGxlcih0aGlzLl92aWV3LmNhbWVyYSwgOTAsIDAsIC04MCwgODApO1x0XHRcdFxuXHR9XG5cdFxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlnaHRzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaWdodHMoKVxuXHR7XG5cdFx0Ly9jcmVhdGUgbGlnaHRzIGFycmF5XG5cdFx0dGhpcy5fbGlnaHRzID0gbmV3IEFycmF5PGFueT4oKTtcblx0XHRcblx0XHQvL2NyZWF0ZSBnbG9iYWwgZGlyZWN0aW9uYWwgbGlnaHRcbi8vXHRcdFx0dGhpcy5fY2FzY2FkZVNoYWRvd01hcHBlciA9IG5ldyBDYXNjYWRlU2hhZG93TWFwcGVyKDMpO1xuLy9cdFx0XHR0aGlzLl9jYXNjYWRlU2hhZG93TWFwcGVyLmxpZ2h0T2Zmc2V0ID0gMjAwMDA7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodCA9IG5ldyBEaXJlY3Rpb25hbExpZ2h0KC0xLCAtMTUsIDEpO1xuLy9cdFx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LnNoYWRvd01hcHBlciA9IHRoaXMuX2Nhc2NhZGVTaGFkb3dNYXBwZXI7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5jb2xvciA9IDB4ZWVkZGRkO1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuYW1iaWVudCA9IC4zNTtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmFtYmllbnRDb2xvciA9IDB4ODA4MDkwO1xuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQodGhpcy5fZGlyZWN0aW9uYWxMaWdodCk7XG5cdFx0dGhpcy5fbGlnaHRzLnB1c2godGhpcy5fZGlyZWN0aW9uYWxMaWdodCk7XG5cblx0XHR0aGlzLnVwZGF0ZURpcmVjdGlvbigpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIGZsYW1lIGxpZ2h0c1xuXHRcdHZhciBmbGFtZVZPOkZsYW1lVk87XG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9mbGFtZURhdGEubGVuZ3RoO1xuXHRcdGZvciAodmFyIGk6bnVtYmVyID0gMDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHRmbGFtZVZPID0gdGhpcy5fZmxhbWVEYXRhW2ldO1xuXHRcdFx0dmFyIGxpZ2h0IDogUG9pbnRMaWdodCA9IGZsYW1lVk8ubGlnaHQgPSBuZXcgUG9pbnRMaWdodCgpO1xuXHRcdFx0bGlnaHQucmFkaXVzID0gMjAwO1xuXHRcdFx0bGlnaHQuZmFsbE9mZiA9IDYwMDtcblx0XHRcdGxpZ2h0LmNvbG9yID0gZmxhbWVWTy5jb2xvcjtcblx0XHRcdGxpZ2h0LnkgPSAxMDtcblx0XHRcdHRoaXMuX2xpZ2h0cy5wdXNoKGxpZ2h0KTtcblx0XHR9XG5cdFx0XG5cdFx0Ly9jcmVhdGUgb3VyIGdsb2JhbCBsaWdodCBwaWNrZXJcblx0XHR0aGlzLl9saWdodFBpY2tlciA9IG5ldyBTdGF0aWNMaWdodFBpY2tlcih0aGlzLl9saWdodHMpO1xuXHRcdHRoaXMuX2Jhc2VTaGFkb3dNZXRob2QgPSBuZXcgU2hhZG93U29mdE1ldGhvZCh0aGlzLl9kaXJlY3Rpb25hbExpZ2h0ICwgMTAgLCA1ICk7XG4vL1x0XHRcdHRoaXMuX2Jhc2VTaGFkb3dNZXRob2QgPSBuZXcgU2hhZG93RmlsdGVyZWRNZXRob2QodGhpcy5fZGlyZWN0aW9uYWxMaWdodCk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgb3VyIGdsb2JhbCBmb2cgbWV0aG9kXG5cdFx0dGhpcy5fZm9nTWV0aG9kID0gbmV3IEVmZmVjdEZvZ01ldGhvZCgwLCA0MDAwLCAweDkwOTBlNyk7XG4vL1x0XHRcdHRoaXMuX2Nhc2NhZGVNZXRob2QgPSBuZXcgU2hhZG93Q2FzY2FkZU1ldGhvZCh0aGlzLl9iYXNlU2hhZG93TWV0aG9kKTtcblx0fVxuXHRcdFx0XG5cdC8qKlxuXHQgKiBJbml0aWFsaXNlIHRoZSBzY2VuZSBvYmplY3RzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRPYmplY3RzKClcblx0e1xuXHRcdC8vY3JlYXRlIHNreWJveFxuXHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobmV3IFNreWJveChuZXcgU2t5Ym94TWF0ZXJpYWwodGhpcy5fc2t5TWFwKSkpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIGZsYW1lIG1lc2hlc1xuXHRcdHRoaXMuX2ZsYW1lR2VvbWV0cnkgPSBuZXcgUHJpbWl0aXZlUGxhbmVQcmVmYWIoNDAsIDgwLCAxLCAxLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHR2YXIgbWVzaDpNZXNoID0gZmxhbWVWTy5tZXNoID0gPE1lc2g+IHRoaXMuX2ZsYW1lR2VvbWV0cnkuZ2V0TmV3T2JqZWN0KCk7XG5cdFx0XHRtZXNoLm1hdGVyaWFsID0gdGhpcy5fZmxhbWVNYXRlcmlhbDtcblx0XHRcdG1lc2gudHJhbnNmb3JtLnBvc2l0aW9uID0gZmxhbWVWTy5wb3NpdGlvbjtcblx0XHRcdG1lc2guc3ViTWVzaGVzWzBdLnV2VHJhbnNmb3JtID0gbmV3IFVWVHJhbnNmb3JtKClcblx0XHRcdG1lc2guc3ViTWVzaGVzWzBdLnV2VHJhbnNmb3JtLnNjYWxlVSA9IDEvMTY7XG5cdFx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG1lc2gpO1xuXHRcdFx0bWVzaC5hZGRDaGlsZChmbGFtZVZPLmxpZ2h0KTtcblx0XHR9XG5cdH1cblx0XHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpc3RlbmVyc1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlzdGVuZXJzKClcblx0e1xuXHRcdC8vYWRkIGxpc3RlbmVyc1xuXHRcdHdpbmRvdy5vbnJlc2l6ZSAgPSAoZXZlbnQpID0+IHRoaXMub25SZXNpemUoZXZlbnQpO1xuXG5cdFx0ZG9jdW1lbnQub25tb3VzZWRvd24gPSAoZXZlbnQpID0+IHRoaXMub25Nb3VzZURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2V1cCA9IChldmVudCkgPT4gdGhpcy5vbk1vdXNlVXAoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ubW91c2Vtb3ZlID0gKGV2ZW50KSA9PiB0aGlzLm9uTW91c2VNb3ZlKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleWRvd24gPSAoZXZlbnQpID0+IHRoaXMub25LZXlEb3duKGV2ZW50KTtcblx0XHRkb2N1bWVudC5vbmtleXVwID0gKGV2ZW50KSA9PiB0aGlzLm9uS2V5VXAoZXZlbnQpO1xuXG5cdFx0dGhpcy5vblJlc2l6ZSgpO1xuXG5cdFx0dGhpcy5wYXJzZUFXRERlbGVnYXRlID0gKGV2ZW50OkV2ZW50KSA9PiB0aGlzLnBhcnNlQVdEKGV2ZW50KTtcblx0XHR0aGlzLnBhcnNlQml0bWFwRGVsZWdhdGUgPSAoZXZlbnQpID0+IHRoaXMucGFyc2VCaXRtYXAoZXZlbnQpO1xuXHRcdHRoaXMubG9hZFByb2dyZXNzRGVsZWdhdGUgPSAoZXZlbnQ6UHJvZ3Jlc3NFdmVudCkgPT4gdGhpcy5sb2FkUHJvZ3Jlc3MoZXZlbnQpO1xuXHRcdHRoaXMub25CaXRtYXBDb21wbGV0ZURlbGVnYXRlID0gKGV2ZW50KSA9PiB0aGlzLm9uQml0bWFwQ29tcGxldGUoZXZlbnQpO1xuXHRcdHRoaXMub25Bc3NldENvbXBsZXRlRGVsZWdhdGUgPSAoZXZlbnQ6QXNzZXRFdmVudCkgPT4gdGhpcy5vbkFzc2V0Q29tcGxldGUoZXZlbnQpO1xuXHRcdHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUgPSAoZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHRoaXMub25SZXNvdXJjZUNvbXBsZXRlKGV2ZW50KTtcblxuXHRcdHRoaXMuX3RpbWVyID0gbmV3IFJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLm9uRW50ZXJGcmFtZSwgdGhpcyk7XG5cdFx0dGhpcy5fdGltZXIuc3RhcnQoKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIG1hdGVyaWFsIG1vZGUgYmV0d2VlbiBzaW5nbGUgcGFzcyBhbmQgbXVsdGkgcGFzc1xuXHQgKi9cbi8vXHRcdHByaXZhdGUgdXBkYXRlTWF0ZXJpYWxQYXNzKG1hdGVyaWFsRGljdGlvbmFyeTpEaWN0aW9uYXJ5KVxuLy9cdFx0e1xuLy9cdFx0XHR2YXIgbWVzaDpNZXNoO1xuLy9cdFx0XHR2YXIgbmFtZTpzdHJpbmc7XG4vL1x0XHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fbWVzaGVzLmxlbmd0aDtcbi8vXHRcdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcbi8vXHRcdFx0XHRtZXNoID0gdGhpcy5fbWVzaGVzW2ldO1xuLy9cdFx0XHRcdGlmIChtZXNoLm5hbWUgPT0gXCJzcG9uemFfMDRcIiB8fCBtZXNoLm5hbWUgPT0gXCJzcG9uemFfMzc5XCIpXG4vL1x0XHRcdFx0XHRjb250aW51ZTtcbi8vXHRcdFx0XHRuYW1lID0gbWVzaC5tYXRlcmlhbC5uYW1lO1xuLy9cdFx0XHRcdHZhciB0ZXh0dXJlSW5kZXg6bnVtYmVyID0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5pbmRleE9mKG5hbWUpO1xuLy9cdFx0XHRcdGlmICh0ZXh0dXJlSW5kZXggPT0gLTEgfHwgdGV4dHVyZUluZGV4ID49IHRoaXMuX21hdGVyaWFsTmFtZVN0cmluZ3MubGVuZ3RoKVxuLy9cdFx0XHRcdFx0Y29udGludWU7XG4vL1xuLy9cdFx0XHRcdG1lc2gubWF0ZXJpYWwgPSBtYXRlcmlhbERpY3Rpb25hcnlbbmFtZV07XG4vL1x0XHRcdH1cbi8vXHRcdH1cblx0XG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBkaXJlY3Rpb24gb2YgdGhlIGRpcmVjdGlvbmFsIGxpZ2h0c291cmNlXG5cdCAqL1xuXHRwcml2YXRlIHVwZGF0ZURpcmVjdGlvbigpXG5cdHtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmRpcmVjdGlvbiA9IG5ldyBWZWN0b3IzRChcblx0XHRcdE1hdGguc2luKHRoaXMuX2xpZ2h0RWxldmF0aW9uKSpNYXRoLmNvcyh0aGlzLl9saWdodERpcmVjdGlvbiksXG5cdFx0XHQtTWF0aC5jb3ModGhpcy5fbGlnaHRFbGV2YXRpb24pLFxuXHRcdFx0TWF0aC5zaW4odGhpcy5fbGlnaHRFbGV2YXRpb24pKk1hdGguc2luKHRoaXMuX2xpZ2h0RGlyZWN0aW9uKVxuXHRcdCk7XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBDb3VudCB0aGUgdG90YWwgbnVtYmVyIG9mIHRleHR1cmVzIHRvIGJlIGxvYWRlZFxuXHQgKi9cblx0cHJpdmF0ZSBjb3VudE51bVRleHR1cmVzKClcblx0e1xuXHRcdHRoaXMuX251bVRleHR1cmVzKys7XG5cdFx0XG5cdFx0Ly9za2lwIG51bGwgdGV4dHVyZXNcblx0XHR3aGlsZSAodGhpcy5fbisrIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCAtIDEpXG5cdFx0XHRpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKVxuXHRcdFx0XHRicmVhaztcblx0XHRcblx0XHQvL3N3aXRjaCB0byBuZXh0IHRldHVyZSBzZXRcblx0XHRpZiAodGhpcy5fbiA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGgpIHtcblx0XHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmNvdW50TnVtVGV4dHVyZXMoKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBHbG9iYWwgYmluYXJ5IGZpbGUgbG9hZGVyXG5cdCAqL1xuXHRwcml2YXRlIGxvYWQodXJsOnN0cmluZylcblx0e1xuXHRcdHZhciBsb2FkZXI6VVJMTG9hZGVyID0gbmV3IFVSTExvYWRlcigpO1xuXHRcdHN3aXRjaCAodXJsLnN1YnN0cmluZyh1cmwubGVuZ3RoIC0gMykpIHtcblx0XHRcdGNhc2UgXCJBV0RcIjogXG5cdFx0XHRjYXNlIFwiYXdkXCI6XG5cdFx0XHRcdGxvYWRlci5kYXRhRm9ybWF0ID0gVVJMTG9hZGVyRGF0YUZvcm1hdC5BUlJBWV9CVUZGRVI7XG5cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0ID0gXCJMb2FkaW5nIE1vZGVsXCI7XG5cdFx0XHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLnBhcnNlQVdERGVsZWdhdGUpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJwbmdcIjogXG5cdFx0XHRjYXNlIFwianBnXCI6XG5cdFx0XHRcdGxvYWRlci5kYXRhRm9ybWF0ID0gVVJMTG9hZGVyRGF0YUZvcm1hdC5CTE9CO1xuXHRcdFx0XHR0aGlzLl9jdXJyZW50VGV4dHVyZSsrO1xuXHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dCA9IFwiTG9hZGluZyBUZXh0dXJlc1wiO1xuXHRcdFx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUJpdG1hcERlbGVnYXRlKTtcblx0XHRcdFx0dXJsID0gXCJzcG9uemEvXCIgKyB1cmw7XG5cdFx0XHRcdGJyZWFrO1xuLy9cdFx0XHRcdGNhc2UgXCJhdGZcIjpcbi8vXHRcdFx0XHRcdHRoaXMuX2N1cnJlbnRUZXh0dXJlKys7XG4vL1x0XHRcdFx0XHR0aGlzLl9sb2FkaW5nVGV4dCA9IFwiTG9hZGluZyBUZXh0dXJlc1wiO1xuLy8gICAgICAgICAgICAgICAgICAgIGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCAoZXZlbnQ6RXZlbnQpID0+IHRoaXMub25BVEZDb21wbGV0ZShldmVudCkpO1xuLy9cdFx0XHRcdFx0dXJsID0gXCJzcG9uemEvYXRmL1wiICsgdXJsO1xuLy8gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXHRcdH1cblx0XHRcblx0XHRsb2FkZXIuYWRkRXZlbnRMaXN0ZW5lcihQcm9ncmVzc0V2ZW50LlBST0dSRVNTLCB0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlKTtcblx0XHR2YXIgdXJsUmVxOlVSTFJlcXVlc3QgPSBuZXcgVVJMUmVxdWVzdCh0aGlzLl9hc3NldHNSb290K3VybCk7XG5cdFx0bG9hZGVyLmxvYWQodXJsUmVxKTtcblx0XHRcblx0fVxuXHRcblx0LyoqXG5cdCAqIERpc3BsYXkgY3VycmVudCBsb2FkXG5cdCAqL1xuXHRwcml2YXRlIGxvYWRQcm9ncmVzcyhlOlByb2dyZXNzRXZlbnQpXG5cdHtcblx0XHQvL1RPRE8gd29yayBvdXQgd2h5IHRoZSBjYXN0aW5nIG9uIFByb2dyZXNzRXZlbnQgZmFpbHMgZm9yIGJ5dGVzTG9hZGVkIGFuZCBieXRlc1RvdGFsIHByb3BlcnRpZXNcblx0XHR2YXIgUDpudW1iZXIgPSBNYXRoLmZsb29yKGVbXCJieXRlc0xvYWRlZFwiXSAvIGVbXCJieXRlc1RvdGFsXCJdICogMTAwKTtcblx0XHRpZiAoUCAhPSAxMDApIHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuX2xvYWRpbmdUZXh0ICsgJ1xcbicgKyAoKHRoaXMuX2xvYWRpbmdUZXh0ID09IFwiTG9hZGluZyBNb2RlbFwiKT8gTWF0aC5mbG9vcigoZVtcImJ5dGVzTG9hZGVkXCJdIC8gMTAyNCkgPDwgMCkgKyAna2IgfCAnICsgTWF0aC5mbG9vcigoZVtcImJ5dGVzVG90YWxcIl0gLyAxMDI0KSA8PCAwKSArICdrYicgOiB0aGlzLl9jdXJyZW50VGV4dHVyZSArICcgfCAnICsgdGhpcy5fbnVtVGV4dHVyZXMpKTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIEFURiBmaWxlXG5cdCAqL1xuLy9cdFx0cHJpdmF0ZSBvbkFURkNvbXBsZXRlKGU6RXZlbnQpXG4vL1x0XHR7XG4vLyAgICAgICAgICAgIHZhciBsb2FkZXI6VVJMTG9hZGVyID0gVVJMTG9hZGVyKGUudGFyZ2V0KTtcbi8vICAgICAgICAgICAgbG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMub25BVEZDb21wbGV0ZSk7XG4vL1xuLy9cdFx0XHRpZiAoIXRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0pXG4vL1x0XHRcdHtcbi8vXHRcdFx0XHR0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dID0gbmV3IEFURlRleHR1cmUobG9hZGVyLmRhdGEpO1xuLy9cdFx0XHR9XG4vL1xuLy8gICAgICAgICAgICBsb2FkZXIuZGF0YSA9IG51bGw7XG4vLyAgICAgICAgICAgIGxvYWRlci5jbG9zZSgpO1xuLy9cdFx0XHRsb2FkZXIgPSBudWxsO1xuLy9cbi8vXG4vL1x0XHRcdC8vc2tpcCBudWxsIHRleHR1cmVzXG4vL1x0XHRcdHdoaWxlICh0aGlzLl9uKysgPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoIC0gMSlcbi8vXHRcdFx0XHRpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKVxuLy9cdFx0XHRcdFx0YnJlYWs7XG4vL1xuLy9cdFx0XHQvL3N3aXRjaCB0byBuZXh0IHRldHVyZSBzZXRcbi8vICAgICAgICAgICAgaWYgKHRoaXMuX24gPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoKSB7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG4vL1x0XHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncykge1xuLy9cdFx0XHRcdHRoaXMuX24gPSAwO1xuLy9cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzO1xuLy9cdFx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuLy9cdFx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncykge1xuLy9cdFx0XHRcdHRoaXMuX24gPSAwO1xuLy9cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG4vL1x0XHRcdH0gZWxzZSB7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKFwic3BvbnphL3Nwb256YS5hd2RcIik7XG4vLyAgICAgICAgICAgIH1cbi8vICAgICAgICB9XG5cdFxuXHRcblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgQml0bWFwIGZpbGVcblx0ICovXG5cdHByaXZhdGUgcGFyc2VCaXRtYXAoZSlcblx0e1xuXHRcdHZhciB1cmxMb2FkZXI6VVJMTG9hZGVyID0gPFVSTExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0dmFyIGltYWdlOkhUTUxJbWFnZUVsZW1lbnQgPSBQYXJzZXJVdGlscy5ibG9iVG9JbWFnZSh1cmxMb2FkZXIuZGF0YSk7XG5cdFx0aW1hZ2Uub25sb2FkID0gdGhpcy5vbkJpdG1hcENvbXBsZXRlRGVsZWdhdGU7XG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VCaXRtYXBEZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoUHJvZ3Jlc3NFdmVudC5QUk9HUkVTUywgdGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyID0gbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBiaXRtYXAgY29tcGxldGUgZXZlbnQgb24gbG9hZGVyXG5cdCAqL1xuXHRwcml2YXRlIG9uQml0bWFwQ29tcGxldGUoZTpFdmVudClcblx0e1xuXHRcdHZhciBpbWFnZTpIVE1MSW1hZ2VFbGVtZW50ID0gPEhUTUxJbWFnZUVsZW1lbnQ+IGUudGFyZ2V0O1xuXHRcdGltYWdlLm9ubG9hZCA9IG51bGw7XG5cblx0XHQvL2NyZWF0ZSBiaXRtYXAgdGV4dHVyZSBpbiBkaWN0aW9uYXJ5XG5cdFx0aWYgKCF0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dKVxuXHRcdFx0dGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dXSA9ICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncyk/IG5ldyBTcGVjdWxhckJpdG1hcFRleHR1cmUoQ2FzdC5iaXRtYXBEYXRhKGltYWdlKSkgOiBuZXcgSW1hZ2VUZXh0dXJlKGltYWdlKTtcblxuXHRcdC8vc2tpcCBudWxsIHRleHR1cmVzXG5cdFx0d2hpbGUgKHRoaXMuX24rKyA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGggLSAxKVxuXHRcdFx0aWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSlcblx0XHRcdFx0YnJlYWs7XG5cdFx0XG5cdFx0Ly9zd2l0Y2ggdG8gbmV4dCB0ZXR1cmUgc2V0XG5cdFx0aWYgKHRoaXMuX24gPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoKSB7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9kaWZmdXNlVGV4dHVyZVN0cmluZ3MpIHtcblx0XHRcdHRoaXMuX24gPSAwO1xuXHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzO1xuXHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubG9hZChcInNwb256YS9zcG9uemEuYXdkXCIpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgQVdEIGZpbGVcblx0ICovXG5cdHByaXZhdGUgcGFyc2VBV0QoZSlcblx0e1xuXHRcdGNvbnNvbGUubG9nKFwiUGFyc2luZyBEYXRhXCIpO1xuXHRcdHZhciB1cmxMb2FkZXI6VVJMTG9hZGVyID0gPFVSTExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0dmFyIGxvYWRlcjpMb2FkZXIgPSBuZXcgTG9hZGVyKGZhbHNlKTtcblxuXHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEFzc2V0RXZlbnQuQVNTRVRfQ09NUExFVEUsIHRoaXMub25Bc3NldENvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKExvYWRlckV2ZW50LlJFU09VUkNFX0NPTVBMRVRFLCB0aGlzLm9uUmVzb3VyY2VDb21wbGV0ZURlbGVnYXRlKTtcblx0XHRsb2FkZXIubG9hZERhdGEodXJsTG9hZGVyLmRhdGEsIG5ldyBBc3NldExvYWRlckNvbnRleHQoZmFsc2UpLCBudWxsLCBuZXcgQVdEUGFyc2VyKCkpO1xuXG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoUHJvZ3Jlc3NFdmVudC5QUk9HUkVTUywgdGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VBV0REZWxlZ2F0ZSk7XG5cdFx0dXJsTG9hZGVyID0gbnVsbDtcblx0fVxuXHRcblx0LyoqXG5cdCAqIExpc3RlbmVyIGZvciBhc3NldCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25Bc3NldENvbXBsZXRlKGV2ZW50OkFzc2V0RXZlbnQpXG5cdHtcblx0XHRpZiAoZXZlbnQuYXNzZXQuYXNzZXRUeXBlID09IEFzc2V0VHlwZS5NRVNIKSB7XG5cdFx0XHQvL3N0b3JlIG1lc2hlc1xuXHRcdFx0dGhpcy5fbWVzaGVzLnB1c2goPE1lc2g+IGV2ZW50LmFzc2V0KTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgb25jZSBhbGwgcmVzb3VyY2VzIGFyZSBsb2FkZWRcblx0ICovXG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlKGU6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHR2YXIgbWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoZmFsc2UsIGZhbHNlLCB0cnVlKTtcblxuXHRcdHZhciBsb2FkZXI6TG9hZGVyID0gPExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0bG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgdGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0bG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdFxuXHRcdC8vcmVhc3NpZ24gbWF0ZXJpYWxzXG5cdFx0dmFyIG1lc2g6TWVzaDtcblx0XHR2YXIgbmFtZTpzdHJpbmc7XG5cblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX21lc2hlcy5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdG1lc2ggPSB0aGlzLl9tZXNoZXNbaV07XG5cdFx0XHRpZiAobWVzaC5uYW1lID09IFwic3BvbnphXzA0XCIgfHwgbWVzaC5uYW1lID09IFwic3BvbnphXzM3OVwiKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dmFyIG51bTpudW1iZXIgPSBOdW1iZXIobWVzaC5uYW1lLnN1YnN0cmluZyg3KSk7XG5cblx0XHRcdG5hbWUgPSBtZXNoLm1hdGVyaWFsLm5hbWU7XG5cblx0XHRcdGlmIChuYW1lID09IFwiY29sdW1uX2NcIiAmJiAobnVtIDwgMjIgfHwgbnVtID4gMzMpKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dmFyIGNvbE51bTpudW1iZXIgPSAobnVtIC0gMTI1KTtcblx0XHRcdGlmIChuYW1lID09IFwiY29sdW1uX2JcIikge1xuXHRcdFx0XHRpZiAoY29sTnVtICA+PTAgJiYgY29sTnVtIDwgMTMyICYmIChjb2xOdW0gJSAxMSkgPCAxMCkge1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5jb2xNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgY29sTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgY29sTWVzaDpNZXNoID0gbmV3IE1lc2gobmV3IEdlb21ldHJ5KCkpO1xuXHRcdFx0XHRcdGNvbE1lcmdlLmFwcGx5VG9NZXNoZXMoY29sTWVzaCwgdGhpcy5jb2xNZXNoZXMpO1xuXHRcdFx0XHRcdG1lc2ggPSBjb2xNZXNoO1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHZhc2VOdW06bnVtYmVyID0gKG51bSAtIDMzNCk7XG5cdFx0XHRpZiAobmFtZSA9PSBcInZhc2VfaGFuZ2luZ1wiICYmICh2YXNlTnVtICUgOSkgPCA1KSB7XG5cdFx0XHRcdGlmICh2YXNlTnVtICA+PTAgJiYgdmFzZU51bSA8IDM3MCAmJiAodmFzZU51bSAlIDkpIDwgNCkge1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdHZhciB2YXNlTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgdmFzZU1lc2g6TWVzaCA9IG5ldyBNZXNoKG5ldyBHZW9tZXRyeSgpKTtcblx0XHRcdFx0XHR2YXNlTWVyZ2UuYXBwbHlUb01lc2hlcyh2YXNlTWVzaCwgdGhpcy52YXNlTWVzaGVzKTtcblx0XHRcdFx0XHRtZXNoID0gdmFzZU1lc2g7XG5cdFx0XHRcdFx0dGhpcy52YXNlTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHBvbGVOdW06bnVtYmVyID0gbnVtIC0gMjkwO1xuXHRcdFx0aWYgKG5hbWUgPT0gXCJmbGFncG9sZVwiKSB7XG5cdFx0XHRcdGlmIChwb2xlTnVtID49MCAmJiBwb2xlTnVtIDwgMzIwICYmIChwb2xlTnVtICUgMykgPCAyKSB7XG5cdFx0XHRcdFx0dGhpcy5wb2xlTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocG9sZU51bSA+PTApIHtcblx0XHRcdFx0XHR0aGlzLnBvbGVNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgcG9sZU1lcmdlOk1lcmdlID0gbmV3IE1lcmdlKCk7XG5cdFx0XHRcdFx0dmFyIHBvbGVNZXNoOk1lc2ggPSBuZXcgTWVzaChuZXcgR2VvbWV0cnkoKSk7XG5cdFx0XHRcdFx0cG9sZU1lcmdlLmFwcGx5VG9NZXNoZXMocG9sZU1lc2gsIHRoaXMucG9sZU1lc2hlcyk7XG5cdFx0XHRcdFx0bWVzaCA9IHBvbGVNZXNoO1xuXHRcdFx0XHRcdHRoaXMucG9sZU1lc2hlcyA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChuYW1lID09IFwiZmxhZ3BvbGVcIiAmJiAobnVtID09IDI2MCB8fCBudW0gPT0gMjYxIHx8IG51bSA9PSAyNjMgfHwgbnVtID09IDI2NSB8fCBudW0gPT0gMjY4IHx8IG51bSA9PSAyNjkgfHwgbnVtID09IDI3MSB8fCBudW0gPT0gMjczKSlcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciB0ZXh0dXJlSW5kZXg6bnVtYmVyID0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5pbmRleE9mKG5hbWUpO1xuXHRcdFx0aWYgKHRleHR1cmVJbmRleCA9PSAtMSB8fCB0ZXh0dXJlSW5kZXggPj0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5sZW5ndGgpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHR0aGlzLl9udW1UZXhTdHJpbmdzW3RleHR1cmVJbmRleF0rKztcblx0XHRcdFxuXHRcdFx0dmFyIHRleHR1cmVOYW1lOnN0cmluZyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuXHRcdFx0dmFyIG5vcm1hbFRleHR1cmVOYW1lOnN0cmluZztcblx0XHRcdHZhciBzcGVjdWxhclRleHR1cmVOYW1lOnN0cmluZztcblx0XHRcdFxuLy9cdFx0XHRcdC8vc3RvcmUgc2luZ2xlIHBhc3MgbWF0ZXJpYWxzIGZvciB1c2UgbGF0ZXJcbi8vXHRcdFx0XHR2YXIgc2luZ2xlTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbCA9IHRoaXMuX3NpbmdsZU1hdGVyaWFsRGljdGlvbmFyeVtuYW1lXTtcbi8vXG4vL1x0XHRcdFx0aWYgKCFzaW5nbGVNYXRlcmlhbCkge1xuLy9cbi8vXHRcdFx0XHRcdC8vY3JlYXRlIHNpbmdsZXBhc3MgbWF0ZXJpYWxcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwodGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGV4dHVyZU5hbWVdKTtcbi8vXG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5uYW1lID0gbmFtZTtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5hZGRNZXRob2QodGhpcy5fZm9nTWV0aG9kKTtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm1pcG1hcCA9IHRydWU7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5yZXBlYXQgPSB0cnVlO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwuc3BlY3VsYXIgPSAyO1xuLy9cbi8vXHRcdFx0XHRcdC8vdXNlIGFscGhhIHRyYW5zcGFyYW5jeSBpZiB0ZXh0dXJlIGlzIHBuZ1xuLy9cdFx0XHRcdFx0aWYgKHRleHR1cmVOYW1lLnN1YnN0cmluZyh0ZXh0dXJlTmFtZS5sZW5ndGggLSAzKSA9PSBcInBuZ1wiKVxuLy9cdFx0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5hbHBoYVRocmVzaG9sZCA9IDAuNTtcbi8vXG4vL1x0XHRcdFx0XHQvL2FkZCBub3JtYWwgbWFwIGlmIGl0IGV4aXN0c1xuLy9cdFx0XHRcdFx0bm9ybWFsVGV4dHVyZU5hbWUgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuLy9cdFx0XHRcdFx0aWYgKG5vcm1hbFRleHR1cmVOYW1lKVxuLy9cdFx0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5ub3JtYWxNYXAgPSB0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVtub3JtYWxUZXh0dXJlTmFtZV07XG4vL1xuLy9cdFx0XHRcdFx0Ly9hZGQgc3BlY3VsYXIgbWFwIGlmIGl0IGV4aXN0c1xuLy9cdFx0XHRcdFx0c3BlY3VsYXJUZXh0dXJlTmFtZSA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcbi8vXHRcdFx0XHRcdGlmIChzcGVjdWxhclRleHR1cmVOYW1lKVxuLy9cdFx0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5zcGVjdWxhck1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3NwZWN1bGFyVGV4dHVyZU5hbWVdO1xuLy9cbi8vXHRcdFx0XHRcdHRoaXMuX3NpbmdsZU1hdGVyaWFsRGljdGlvbmFyeVtuYW1lXSA9IHNpbmdsZU1hdGVyaWFsO1xuLy9cbi8vXHRcdFx0XHR9XG5cblx0XHRcdC8vc3RvcmUgbXVsdGkgcGFzcyBtYXRlcmlhbHMgZm9yIHVzZSBsYXRlclxuXHRcdFx0dmFyIG11bHRpTWF0ZXJpYWw6VHJpYW5nbGVNZXRob2RNYXRlcmlhbCA9IHRoaXMuX211bHRpTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdO1xuXG5cdFx0XHRpZiAoIW11bHRpTWF0ZXJpYWwpIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vY3JlYXRlIG11bHRpcGFzcyBtYXRlcmlhbFxuXHRcdFx0XHRtdWx0aU1hdGVyaWFsID0gbmV3IFRyaWFuZ2xlTWV0aG9kTWF0ZXJpYWwodGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGV4dHVyZU5hbWVdKTtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5tYXRlcmlhbE1vZGUgPSBUcmlhbmdsZU1hdGVyaWFsTW9kZS5NVUxUSV9QQVNTO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLm5hbWUgPSBuYW1lO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG4vL1x0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNoYWRvd01ldGhvZCA9IHRoaXMuX2Nhc2NhZGVNZXRob2Q7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwuc2hhZG93TWV0aG9kID0gdGhpcy5fYmFzZVNoYWRvd01ldGhvZDtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5hZGRFZmZlY3RNZXRob2QodGhpcy5fZm9nTWV0aG9kKTtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5yZXBlYXQgPSB0cnVlO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNwZWN1bGFyID0gMjtcblx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHQvL3VzZSBhbHBoYSB0cmFuc3BhcmFuY3kgaWYgdGV4dHVyZSBpcyBwbmdcblx0XHRcdFx0aWYgKHRleHR1cmVOYW1lLnN1YnN0cmluZyh0ZXh0dXJlTmFtZS5sZW5ndGggLSAzKSA9PSBcInBuZ1wiKVxuXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwuYWxwaGFUaHJlc2hvbGQgPSAwLjU7XG5cdFx0XHRcdFxuXHRcdFx0XHQvL2FkZCBub3JtYWwgbWFwIGlmIGl0IGV4aXN0c1xuXHRcdFx0XHRub3JtYWxUZXh0dXJlTmFtZSA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG5cdFx0XHRcdGlmIChub3JtYWxUZXh0dXJlTmFtZSlcblx0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLm5vcm1hbE1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W25vcm1hbFRleHR1cmVOYW1lXTtcblxuXHRcdFx0XHQvL2FkZCBzcGVjdWxhciBtYXAgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdHNwZWN1bGFyVGV4dHVyZU5hbWUgPSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG5cdFx0XHRcdGlmIChzcGVjdWxhclRleHR1cmVOYW1lKVxuXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwuc3BlY3VsYXJNYXAgPSB0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVtzcGVjdWxhclRleHR1cmVOYW1lXTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vYWRkIHRvIG1hdGVyaWFsIGRpY3Rpb25hcnlcblx0XHRcdFx0dGhpcy5fbXVsdGlNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV0gPSBtdWx0aU1hdGVyaWFsO1xuXHRcdFx0fVxuXHRcdFx0Lypcblx0XHRcdGlmIChfbWVzaFJlZmVyZW5jZVt0ZXh0dXJlSW5kZXhdKSB7XG5cdFx0XHRcdHZhciBtOk1lc2ggPSBtZXNoLmNsb25lKCkgYXMgTWVzaDtcblx0XHRcdFx0bS5tYXRlcmlhbCA9IG11bHRpTWF0ZXJpYWw7XG5cdFx0XHRcdF92aWV3LnNjZW5lLmFkZENoaWxkKG0pO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdCovXG5cdFx0XHQvL2RlZmF1bHQgdG8gbXVsdGlwYXNzIG1hdGVyaWFsXG5cdFx0XHRtZXNoLm1hdGVyaWFsID0gbXVsdGlNYXRlcmlhbDtcblxuXHRcdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChtZXNoKTtcblxuXHRcdFx0dGhpcy5fbWVzaFJlZmVyZW5jZVt0ZXh0dXJlSW5kZXhdID0gbWVzaDtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIHo6bnVtYmVyIC8qdWludCovID0gMDtcblx0XHRcblx0XHR3aGlsZSAoeiA8IHRoaXMuX251bVRleFN0cmluZ3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5nc1t6XSwgdGhpcy5fbnVtVGV4U3RyaW5nc1t6XSk7XG5cdFx0XHR6Kys7XG5cdFx0fVxuXG5cdFx0Ly9sb2FkIHNreWJveCBhbmQgZmxhbWUgdGV4dHVyZVxuXG5cdFx0QXNzZXRMaWJyYXJ5LmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vbkV4dHJhUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9ob3VyZ2xhc3NfdGV4dHVyZS5jdWJlXCIpLCBhc3NldExvYWRlckNvbnRleHQpO1xuXG5cdFx0Ly9nbG9iZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2ZpcmUucG5nXCIpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgb25jZSBleHRyYSByZXNvdXJjZXMgYXJlIGxvYWRlZFxuXHQgKi9cblx0cHJpdmF0ZSBvbkV4dHJhUmVzb3VyY2VDb21wbGV0ZShldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHN3aXRjaCggZXZlbnQudXJsIClcblx0XHR7XG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L2hvdXJnbGFzc190ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHQvL2NyZWF0ZSBza3lib3ggdGV4dHVyZSBtYXBcblx0XHRcdFx0dGhpcy5fc2t5TWFwID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZmlyZS5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwgPSBuZXcgVHJpYW5nbGVNZXRob2RNYXRlcmlhbCg8SW1hZ2VUZXh0dXJlPiBldmVudC5hc3NldHNbIDAgXSk7XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwuYmxlbmRNb2RlID0gQmxlbmRNb2RlLkFERDtcblx0XHRcdFx0dGhpcy5fZmxhbWVNYXRlcmlhbC5hbmltYXRlVVZzID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuX3NreU1hcCAmJiB0aGlzLl9mbGFtZU1hdGVyaWFsKVxuXHRcdFx0dGhpcy5pbml0T2JqZWN0cygpO1xuXHR9XG5cblxuXHQvKipcblx0ICogTmF2aWdhdGlvbiBhbmQgcmVuZGVyIGxvb3Bcblx0ICovXG5cdHByaXZhdGUgb25FbnRlckZyYW1lKGR0Om51bWJlcilcblx0e1x0XG5cdFx0aWYgKHRoaXMuX3dhbGtTcGVlZCB8fCB0aGlzLl93YWxrQWNjZWxlcmF0aW9uKSB7XG5cdFx0XHR0aGlzLl93YWxrU3BlZWQgPSAodGhpcy5fd2Fsa1NwZWVkICsgdGhpcy5fd2Fsa0FjY2VsZXJhdGlvbikqdGhpcy5fZHJhZztcblx0XHRcdGlmIChNYXRoLmFicyh0aGlzLl93YWxrU3BlZWQpIDwgMC4wMSlcblx0XHRcdFx0dGhpcy5fd2Fsa1NwZWVkID0gMDtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuaW5jcmVtZW50V2Fsayh0aGlzLl93YWxrU3BlZWQpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAodGhpcy5fc3RyYWZlU3BlZWQgfHwgdGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uKSB7XG5cdFx0XHR0aGlzLl9zdHJhZmVTcGVlZCA9ICh0aGlzLl9zdHJhZmVTcGVlZCArIHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbikqdGhpcy5fZHJhZztcblx0XHRcdGlmIChNYXRoLmFicyh0aGlzLl9zdHJhZmVTcGVlZCkgPCAwLjAxKVxuXHRcdFx0XHR0aGlzLl9zdHJhZmVTcGVlZCA9IDA7XG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmluY3JlbWVudFN0cmFmZSh0aGlzLl9zdHJhZmVTcGVlZCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vYW5pbWF0ZSBmbGFtZXNcblx0XHR2YXIgZmxhbWVWTzpGbGFtZVZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fZmxhbWVEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0ZmxhbWVWTyA9IHRoaXMuX2ZsYW1lRGF0YVtpXTtcblx0XHRcdC8vdXBkYXRlIGZsYW1lIGxpZ2h0XG5cdFx0XHR2YXIgbGlnaHQgOiBQb2ludExpZ2h0ID0gZmxhbWVWTy5saWdodDtcblx0XHRcdFxuXHRcdFx0aWYgKCFsaWdodClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdGxpZ2h0LmZhbGxPZmYgPSAzODArTWF0aC5yYW5kb20oKSoyMDtcblx0XHRcdGxpZ2h0LnJhZGl1cyA9IDIwMCtNYXRoLnJhbmRvbSgpKjMwO1xuXHRcdFx0bGlnaHQuZGlmZnVzZSA9IC45K01hdGgucmFuZG9tKCkqLjE7XG5cdFx0XHRcblx0XHRcdC8vdXBkYXRlIGZsYW1lIG1lc2hcblx0XHRcdHZhciBtZXNoIDogTWVzaCA9IGZsYW1lVk8ubWVzaDtcblx0XHRcdFxuXHRcdFx0aWYgKCFtZXNoKVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFxuXHRcdFx0dmFyIHN1Yk1lc2g6SVN1Yk1lc2ggPSBtZXNoLnN1Yk1lc2hlc1swXTtcblx0XHRcdHN1Yk1lc2gudXZUcmFuc2Zvcm0ub2Zmc2V0VSArPSAxLzE2O1xuXHRcdFx0c3ViTWVzaC51dlRyYW5zZm9ybS5vZmZzZXRVICU9IDE7XG5cdFx0XHRtZXNoLnJvdGF0aW9uWSA9IE1hdGguYXRhbjIobWVzaC54IC0gdGhpcy5fdmlldy5jYW1lcmEueCwgbWVzaC56IC0gdGhpcy5fdmlldy5jYW1lcmEueikqMTgwL01hdGguUEk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fdmlldy5yZW5kZXIoKTtcblx0XHRcblx0fVxuXHRcblx0XHRcdFxuXHQvKipcblx0ICogS2V5IGRvd24gbGlzdGVuZXIgZm9yIGNhbWVyYSBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIG9uS2V5RG93bihldmVudDpLZXlib2FyZEV2ZW50KVxuXHR7XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlVQOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5XOlxuXHRcdFx0XHR0aGlzLl93YWxrQWNjZWxlcmF0aW9uID0gdGhpcy5fd2Fsa0luY3JlbWVudDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkRPV046XG5cdFx0XHRjYXNlIEtleWJvYXJkLlM6XG5cdFx0XHRcdHRoaXMuX3dhbGtBY2NlbGVyYXRpb24gPSAtdGhpcy5fd2Fsa0luY3JlbWVudDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkxFRlQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkE6XG5cdFx0XHRcdHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbiA9IC10aGlzLl9zdHJhZmVJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uID0gdGhpcy5fc3RyYWZlSW5jcmVtZW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRjpcblx0XHRcdFx0Ly9zdGFnZS5kaXNwbGF5U3RhdGUgPSBTdGFnZURpc3BsYXlTdGF0ZS5GVUxMX1NDUkVFTjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkM6XG5cdFx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZmx5ID0gIXRoaXMuX2NhbWVyYUNvbnRyb2xsZXIuZmx5O1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIEtleSB1cCBsaXN0ZW5lciBmb3IgY2FtZXJhIGNvbnRyb2xcblx0ICovXG5cdHByaXZhdGUgb25LZXlVcChldmVudDpLZXlib2FyZEV2ZW50KVxuXHR7XG5cdFx0c3dpdGNoIChldmVudC5rZXlDb2RlKSB7XG5cdFx0XHRjYXNlIEtleWJvYXJkLlVQOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5XOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLl93YWxrQWNjZWxlcmF0aW9uID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkxFRlQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkE6XG5cdFx0XHRjYXNlIEtleWJvYXJkLlJJR0hUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5EOlxuXHRcdFx0XHR0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24gPSAwO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogTW91c2UgZG93biBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlRG93bihldmVudClcblx0e1xuXHRcdHRoaXMuX2xhc3RQYW5BbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGU7XG5cdFx0dGhpcy5fbGFzdFRpbHRBbmdsZSA9IHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVggPSBldmVudC5jbGllbnRYO1xuXHRcdHRoaXMuX2xhc3RNb3VzZVkgPSBldmVudC5jbGllbnRZO1xuXHRcdHRoaXMuX21vdmUgPSB0cnVlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIHVwIGxpc3RlbmVyIGZvciBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRwcml2YXRlIG9uTW91c2VVcChldmVudClcblx0e1xuXHRcdHRoaXMuX21vdmUgPSBmYWxzZTtcblx0fVxuXG5cdHByaXZhdGUgb25Nb3VzZU1vdmUoZXZlbnQpXG5cdHtcblx0XHRpZiAodGhpcy5fbW92ZSkge1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5wYW5BbmdsZSA9IDAuMyooZXZlbnQuY2xpZW50WCAtIHRoaXMuX2xhc3RNb3VzZVgpICsgdGhpcy5fbGFzdFBhbkFuZ2xlO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci50aWx0QW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFkgLSB0aGlzLl9sYXN0TW91c2VZKSArIHRoaXMuX2xhc3RUaWx0QW5nbGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIHN0YWdlIGxpc3RlbmVyIGZvciByZXNpemUgZXZlbnRzXG5cdCAqL1xuXHRwcml2YXRlIG9uUmVzaXplKGV2ZW50ID0gbnVsbClcblx0e1xuXHRcdHRoaXMuX3ZpZXcueSAgICAgICAgID0gMDtcblx0XHR0aGlzLl92aWV3LnggICAgICAgICA9IDA7XG5cdFx0dGhpcy5fdmlldy53aWR0aCAgICAgPSB3aW5kb3cuaW5uZXJXaWR0aDtcblx0XHR0aGlzLl92aWV3LmhlaWdodCAgICA9IHdpbmRvdy5pbm5lckhlaWdodDtcblx0fVxufVxuXG4vKipcbiogRGF0YSBjbGFzcyBmb3IgdGhlIEZsYW1lIG9iamVjdHNcbiovXG5jbGFzcyBGbGFtZVZPXG57XG5cdHB1YmxpYyBwb3NpdGlvbjpWZWN0b3IzRDtcblx0cHVibGljIGNvbG9yOm51bWJlciAvKnVpbnQqLztcblx0cHVibGljIG1lc2g6TWVzaDtcblx0cHVibGljIGxpZ2h0OlBvaW50TGlnaHQ7XG5cblx0Y29uc3RydWN0b3IocG9zaXRpb246VmVjdG9yM0QsIGNvbG9yOm51bWJlciAvKnVpbnQqLylcblx0e1xuXHRcdHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcblx0XHR0aGlzLmNvbG9yID0gY29sb3I7XG5cdH1cbn1cblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uICgpXG57XG5cdG5ldyBBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vKCk7XG59Il19