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
var BlendMode = require("awayjs-core/lib/data/BlendMode");
var Geometry = require("awayjs-core/lib/data/Geometry");
var Event = require("awayjs-core/lib/events/Event");
var AssetEvent = require("awayjs-core/lib/events/AssetEvent");
var ProgressEvent = require("awayjs-core/lib/events/ProgressEvent");
var LoaderEvent = require("awayjs-core/lib/events/LoaderEvent");
var UVTransform = require("awayjs-core/lib/geom/UVTransform");
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var AssetLibrary = require("awayjs-core/lib/library/AssetLibrary");
var AssetLoaderContext = require("awayjs-core/lib/library/AssetLoaderContext");
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
        if (event.asset.isAsset(Mesh)) {
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
                multiMaterial.mipmap = true;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9BZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnRzIl0sIm5hbWVzIjpbIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmNvbnN0cnVjdG9yIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0IiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0RW5naW5lIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0TGlnaHRzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5pbml0T2JqZWN0cyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8uaW5pdExpc3RlbmVycyIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8udXBkYXRlRGlyZWN0aW9uIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5jb3VudE51bVRleHR1cmVzIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5sb2FkUHJvZ3Jlc3MiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLnBhcnNlQml0bWFwIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkJpdG1hcENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5wYXJzZUFXRCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Bc3NldENvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vblJlc291cmNlQ29tcGxldGUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uRXh0cmFSZXNvdXJjZUNvbXBsZXRlIiwiQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtby5vbkVudGVyRnJhbWUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uS2V5RG93biIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25LZXlVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZURvd24iLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uTW91c2VVcCIsIkFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW8ub25Nb3VzZU1vdmUiLCJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLm9uUmVzaXplIiwiRmxhbWVWTyIsIkZsYW1lVk8uY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUE2Q0U7QUFFRixJQUFPLFNBQVMsV0FBZ0IsZ0NBQWdDLENBQUMsQ0FBQztBQUNsRSxJQUFPLFFBQVEsV0FBaUIsK0JBQStCLENBQUMsQ0FBQztBQUNqRSxJQUFPLEtBQUssV0FBaUIsOEJBQThCLENBQUMsQ0FBQztBQUM3RCxJQUFPLFVBQVUsV0FBZ0IsbUNBQW1DLENBQUMsQ0FBQztBQUN0RSxJQUFPLGFBQWEsV0FBZSxzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sV0FBVyxXQUFnQixvQ0FBb0MsQ0FBQyxDQUFDO0FBQ3hFLElBQU8sV0FBVyxXQUFnQixrQ0FBa0MsQ0FBQyxDQUFDO0FBQ3RFLElBQU8sUUFBUSxXQUFpQiwrQkFBK0IsQ0FBQyxDQUFDO0FBQ2pFLElBQU8sWUFBWSxXQUFnQixzQ0FBc0MsQ0FBQyxDQUFDO0FBQzNFLElBQU8sa0JBQWtCLFdBQWMsNENBQTRDLENBQUMsQ0FBQztBQUNyRixJQUFPLFNBQVMsV0FBZ0IsK0JBQStCLENBQUMsQ0FBQztBQUNqRSxJQUFPLG1CQUFtQixXQUFjLHlDQUF5QyxDQUFDLENBQUM7QUFDbkYsSUFBTyxVQUFVLFdBQWdCLGdDQUFnQyxDQUFDLENBQUM7QUFDbkUsSUFBTyxXQUFXLFdBQWdCLHFDQUFxQyxDQUFDLENBQUM7QUFFekUsSUFBTyxZQUFZLFdBQWdCLHVDQUF1QyxDQUFDLENBQUM7QUFDNUUsSUFBTyxx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LElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsSUFBSUEsSUFBSUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxHQUFFQSxJQUFJQSxxQkFBcUJBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLFlBQVlBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1FBRzVNQSxPQUFPQSxJQUFJQSxDQUFDQSxFQUFFQSxFQUFFQSxHQUFHQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBO1lBQ3hEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO2dCQUN4Q0EsS0FBS0EsQ0FBQ0E7UUFFUkEsQUFDQUEsMkJBRDJCQTtRQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsR0FBR0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsREEsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNqREEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esc0JBQXNCQSxJQUFJQSxJQUFJQSxDQUFDQSxzQkFBc0JBLENBQUNBLENBQUNBLENBQUNBO1lBQ3ZFQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNaQSxJQUFJQSxDQUFDQSxzQkFBc0JBLEdBQUdBLElBQUlBLENBQUNBLHFCQUFxQkEsQ0FBQ0E7WUFDekRBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLHNCQUFzQkEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0Es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Q0EsQ0FBQ0E7b0JBQzNCQSxRQUFRQSxDQUFDQTtnQkFDVkEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNQQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtvQkFDM0JBLElBQUlBLFNBQVNBLEdBQVNBLElBQUlBLEtBQUtBLEVBQUVBLENBQUNBO29CQUNsQ0EsSUFBSUEsUUFBUUEsR0FBUUEsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsUUFBUUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7b0JBQzdDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQSxRQUFRQSxFQUFFQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxDQUFDQTtvQkFDbkRBLElBQUlBLEdBQUdBLFFBQVFBLENBQUNBO29CQUNoQkEsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsSUFBSUEsS0FBS0EsRUFBUUEsQ0FBQ0E7Z0JBQ3JDQSxDQUFDQTtZQUNGQSxDQUFDQTtZQUVEQSxJQUFJQSxPQUFPQSxHQUFVQSxHQUFHQSxHQUFHQSxHQUFHQSxDQUFDQTtZQUMvQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsSUFBSUEsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3hCQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFHQSxDQUFDQSxJQUFJQSxPQUFPQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDdkRBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUMzQkEsUUFBUUEsQ0FBQ0E7Z0JBQ1ZBLENBQUNBO2dCQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxPQUFPQSxJQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDeEJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLElBQUlBLENBQUNBLElBQUlB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LENBQUNBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLElBQUlBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDeEVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUNwQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDckJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFDdkRBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLElBQUlBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbkRBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsR0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFDOUVBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLEdBQUdBLENBQUNBLElBQUlBLENBQUNBLFlBQVlBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBO2dCQUN0Q0EsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsQ0FBQ0EsQ0FBQ0E7WUFDdkJBLElBQUlBLENBQUNBLGlCQUFpQkEsQ0FBQ0EsZUFBZUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLENBQUNBO1FBRURBLEFBQ0FBLGdCQURnQkE7WUFDWkEsT0FBZUEsQ0FBQ0E7UUFDcEJBLElBQUlBLEdBQUdBLEdB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QSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFXQSxDQUFDQSxDQUFDQTtRQUN6QkEsSUFBSUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0EsR0FBV0EsQ0FBQ0EsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQU9BLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO1FBQ3pDQSxJQUFJQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxHQUFNQSxNQUFNQSxDQUFDQSxXQUFXQSxDQUFDQTtJQUMzQ0EsQ0FBQ0E7SUFDRnZCLG1DQUFDQTtBQUFEQSxDQXR5QkEsQUFzeUJDQSxJQUFBO0FBRUQsQUFHQTs7RUFERTtJQUNJLE9BQU87SUFPWndCLFNBUEtBLE9BQU9BLENBT0FBLFFBQWlCQSxFQUFFQSxLQUFLQSxDQUFRQSxRQUFEQSxBQUFTQTtRQUVuREMsSUFBSUEsQ0FBQ0EsUUFBUUEsR0FBR0EsUUFBUUEsQ0FBQ0E7UUFDekJBLElBQUlBLENBQUNBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ3BCQSxDQUFDQTtJQUNGRCxjQUFDQTtBQUFEQSxDQVpBLEFBWUNBLElBQUE7QUFFRCxNQUFNLENBQUMsTUFBTSxHQUFHO0lBRWYsSUFBSSw0QkFBNEIsRUFBRSxDQUFDO0FBQ3BDLENBQUMsQ0FBQSIsImZpbGUiOiJBZHZhbmNlZF9NdWx0aVBhc3NTcG9uemFEZW1vLmpzIiwic291cmNlUm9vdCI6Ii4vIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuQ3J5dGVrIFNwb256YSBkZW1vIHVzaW5nIG11bHRpcGFzcyBtYXRlcmlhbHMgaW4gQXdheTNEXG5cbkRlbW9uc3RyYXRlczpcblxuSG93IHRvIGFwcGx5IE11bHRpcGFzcyBtYXRlcmlhbHMgdG8gYSBtb2RlbFxuSG93IHRvIGVuYWJsZSBjYXNjYWRpbmcgc2hhZG93IG1hcHMgb24gYSBtdWx0aXBhc3MgbWF0ZXJpYWwuXG5Ib3cgdG8gc2V0dXAgbXVsdGlwbGUgbGlnaHRzb3VyY2VzLCBzaGFkb3dzIGFuZCBmb2cgZWZmZWN0cyBhbGwgaW4gdGhlIHNhbWUgc2NlbmUuXG5Ib3cgdG8gYXBwbHkgc3BlY3VsYXIsIG5vcm1hbCBhbmQgZGlmZnVzZSBtYXBzIHRvIGFuIEFXRCBtb2RlbC5cblxuQ29kZSBieSBSb2IgQmF0ZW1hbiAmIERhdmlkIExlbmFlcnRzXG5yb2JAaW5maW5pdGV0dXJ0bGVzLmNvLnVrXG5odHRwOi8vd3d3LmluZmluaXRldHVydGxlcy5jby51a1xuZGF2aWQubGVuYWVydHNAZ21haWwuY29tXG5odHRwOi8vd3d3LmRlcnNjaG1hbGUuY29tXG5cbk1vZGVsIHJlLW1vZGVsZWQgYnkgRnJhbmsgTWVpbmwgYXQgQ3J5dGVrIHdpdGggaW5zcGlyYXRpb24gZnJvbSBNYXJrbyBEYWJyb3ZpYydzIG9yaWdpbmFsLCBjb252ZXJ0ZWQgdG8gQVdEIGJ5IExvVEhcbmNvbnRhY3RAY3J5dGVrLmNvbVxuaHR0cDovL3d3dy5jcnl0ZWsuY29tL2NyeWVuZ2luZS9jcnllbmdpbmUzL2Rvd25sb2Fkc1xuM2RmbGFzaGxvQGdtYWlsLmNvbVxuaHR0cDovLzNkZmxhc2hsby53b3JkcHJlc3MuY29tXG5cblRoaXMgY29kZSBpcyBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2VcblxuQ29weXJpZ2h0IChjKSBUaGUgQXdheSBGb3VuZGF0aW9uIGh0dHA6Ly93d3cudGhlYXdheWZvdW5kYXRpb24ub3JnXG5cblBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbm9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIOKAnFNvZnR3YXJl4oCdKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCDigJxBUyBJU+KAnSwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG5GSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbkFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbkxJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG5PVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG5USEUgU09GVFdBUkUuXG5cbiovXG5cbmltcG9ydCBCbGVuZE1vZGVcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZGF0YS9CbGVuZE1vZGVcIik7XG5pbXBvcnQgR2VvbWV0cnlcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9kYXRhL0dlb21ldHJ5XCIpO1xuaW1wb3J0IEV2ZW50XHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0V2ZW50XCIpO1xuaW1wb3J0IEFzc2V0RXZlbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0Fzc2V0RXZlbnRcIik7XG5pbXBvcnQgUHJvZ3Jlc3NFdmVudFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL1Byb2dyZXNzRXZlbnRcIik7XG5pbXBvcnQgTG9hZGVyRXZlbnRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvZXZlbnRzL0xvYWRlckV2ZW50XCIpO1xuaW1wb3J0IFVWVHJhbnNmb3JtXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL2dlb20vVVZUcmFuc2Zvcm1cIik7XG5pbXBvcnQgVmVjdG9yM0RcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1ZlY3RvcjNEXCIpO1xuaW1wb3J0IEFzc2V0TGlicmFyeVx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TGlicmFyeVwiKTtcbmltcG9ydCBBc3NldExvYWRlckNvbnRleHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9saWJyYXJ5L0Fzc2V0TG9hZGVyQ29udGV4dFwiKTtcbmltcG9ydCBVUkxMb2FkZXJcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTExvYWRlclwiKTtcbmltcG9ydCBVUkxMb2FkZXJEYXRhRm9ybWF0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvbmV0L1VSTExvYWRlckRhdGFGb3JtYXRcIik7XG5pbXBvcnQgVVJMUmVxdWVzdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9uZXQvVVJMUmVxdWVzdFwiKTtcbmltcG9ydCBQYXJzZXJVdGlsc1x0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9wYXJzZXJzL1BhcnNlclV0aWxzXCIpO1xuaW1wb3J0IEltYWdlQ3ViZVRleHR1cmVcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlQ3ViZVRleHR1cmVcIik7XG5pbXBvcnQgSW1hZ2VUZXh0dXJlXHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3RleHR1cmVzL0ltYWdlVGV4dHVyZVwiKTtcbmltcG9ydCBTcGVjdWxhckJpdG1hcFRleHR1cmVcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdGV4dHVyZXMvU3BlY3VsYXJCaXRtYXBUZXh0dXJlXCIpO1xuaW1wb3J0IEtleWJvYXJkXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtY29yZS9saWIvdWkvS2V5Ym9hcmRcIik7XG5pbXBvcnQgUmVxdWVzdEFuaW1hdGlvbkZyYW1lXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWNvcmUvbGliL3V0aWxzL1JlcXVlc3RBbmltYXRpb25GcmFtZVwiKTtcblxuaW1wb3J0IExvYWRlclx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvTG9hZGVyXCIpO1xuaW1wb3J0IFZpZXdcdFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2NvbnRhaW5lcnMvVmlld1wiKTtcbmltcG9ydCBGaXJzdFBlcnNvbkNvbnRyb2xsZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvY29udHJvbGxlcnMvRmlyc3RQZXJzb25Db250cm9sbGVyXCIpO1xuaW1wb3J0IElTdWJNZXNoXHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9JU3ViTWVzaFwiKTtcbmltcG9ydCBNZXNoXHRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9NZXNoXCIpO1xuaW1wb3J0IFNreWJveFx0XHRcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL1NreWJveFwiKTtcbmltcG9ydCBEaXJlY3Rpb25hbExpZ2h0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9lbnRpdGllcy9EaXJlY3Rpb25hbExpZ2h0XCIpO1xuaW1wb3J0IFBvaW50TGlnaHRcdFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvZW50aXRpZXMvUG9pbnRMaWdodFwiKTtcbi8vXHRpbXBvcnQgQ2FzY2FkZVNoYWRvd01hcHBlclx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2VudGl0aWVzL0Nhc2NhZGVTaGFkb3dNYXBwZXJcIik7XG5pbXBvcnQgRGlyZWN0aW9uYWxTaGFkb3dNYXBwZXJcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvbWF0ZXJpYWxzL3NoYWRvd21hcHBlcnMvRGlyZWN0aW9uYWxTaGFkb3dNYXBwZXJcIik7XG5pbXBvcnQgU3RhdGljTGlnaHRQaWNrZXJcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9tYXRlcmlhbHMvbGlnaHRwaWNrZXJzL1N0YXRpY0xpZ2h0UGlja2VyXCIpO1xuaW1wb3J0IFByaW1pdGl2ZVBsYW5lUHJlZmFiXHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvcHJlZmFicy9QcmltaXRpdmVQbGFuZVByZWZhYlwiKTtcbmltcG9ydCBDYXN0XHRcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi91dGlscy9DYXN0XCIpO1xuXG5pbXBvcnQgTWVyZ2VcdFx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1yZW5kZXJlcmdsL2xpYi90b29scy9jb21tYW5kcy9NZXJnZVwiKTtcbmltcG9ydCBEZWZhdWx0UmVuZGVyZXJcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLXJlbmRlcmVyZ2wvbGliL0RlZmF1bHRSZW5kZXJlclwiKTtcblxuaW1wb3J0IE1ldGhvZE1hdGVyaWFsXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1tZXRob2RtYXRlcmlhbHMvbGliL01ldGhvZE1hdGVyaWFsXCIpO1xuaW1wb3J0IE1ldGhvZE1hdGVyaWFsTW9kZVx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvTWV0aG9kTWF0ZXJpYWxNb2RlXCIpO1xuaW1wb3J0IE1ldGhvZFJlbmRlcmVyUG9vbFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvcG9vbC9NZXRob2RSZW5kZXJlclBvb2xcIik7XG5pbXBvcnQgU2hhZG93Q2FzY2FkZU1ldGhvZFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TaGFkb3dDYXNjYWRlTWV0aG9kXCIpO1xuaW1wb3J0IFNoYWRvd1NvZnRNZXRob2RcdFx0XHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLW1ldGhvZG1hdGVyaWFscy9saWIvbWV0aG9kcy9TaGFkb3dTb2Z0TWV0aG9kXCIpO1xuaW1wb3J0IEVmZmVjdEZvZ01ldGhvZFx0XHRcdFx0XHQ9IHJlcXVpcmUoXCJhd2F5anMtbWV0aG9kbWF0ZXJpYWxzL2xpYi9tZXRob2RzL0VmZmVjdEZvZ01ldGhvZFwiKTtcblxuaW1wb3J0IEFXRFBhcnNlclx0XHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1wYXJzZXJzL2xpYi9BV0RQYXJzZXJcIik7XG5cbmNsYXNzIEFkdmFuY2VkX011bHRpUGFzc1Nwb256YURlbW9cbntcblx0Ly9yb290IGZpbGVwYXRoIGZvciBhc3NldCBsb2FkaW5nXG5cdHByaXZhdGUgX2Fzc2V0c1Jvb3Q6c3RyaW5nID0gXCJhc3NldHMvXCI7XG5cdFxuXHQvL2RlZmF1bHQgbWF0ZXJpYWwgZGF0YSBzdHJpbmdzXG5cdHByaXZhdGUgX21hdGVyaWFsTmFtZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoXCIsICAgICAgICAgICAgXCJNYXRlcmlhbF9fMjk4XCIsICBcImJyaWNrc1wiLCAgICAgICAgICAgIFwiY2VpbGluZ1wiLCAgICAgICAgICAgIFwiY2hhaW5cIiwgICAgICAgICAgICAgXCJjb2x1bW5fYVwiLCAgICAgICAgICBcImNvbHVtbl9iXCIsICAgICAgICAgIFwiY29sdW1uX2NcIiwgICAgICAgICAgXCJmYWJyaWNfZ1wiLCAgICAgICAgICAgICAgXCJmYWJyaWNfY1wiLCAgICAgICAgIFwiZmFicmljX2ZcIiwgICAgICAgICAgICAgICBcImRldGFpbHNcIiwgICAgICAgICAgXCJmYWJyaWNfZFwiLCAgICAgICAgICAgICBcImZhYnJpY19hXCIsICAgICAgICBcImZhYnJpY19lXCIsICAgICAgICAgICAgICBcImZsYWdwb2xlXCIsICAgICAgICAgIFwiZmxvb3JcIiwgICAgICAgICAgICBcIjE2X19fRGVmYXVsdFwiLFwiTWF0ZXJpYWxfXzI1XCIsXCJyb29mXCIsICAgICAgIFwibGVhZlwiLCAgICAgICAgICAgXCJ2YXNlXCIsICAgICAgICAgXCJ2YXNlX2hhbmdpbmdcIiwgICAgIFwiTWF0ZXJpYWxfXzU3XCIsICAgXCJ2YXNlX3JvdW5kXCIpO1xuXHRcblx0Ly9wcml2YXRlIGNvbnN0IGRpZmZ1c2VUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihbXCJhcmNoX2RpZmYuYXRmXCIsIFwiYmFja2dyb3VuZC5hdGZcIiwgXCJicmlja3NfYV9kaWZmLmF0ZlwiLCBcImNlaWxpbmdfYV9kaWZmLmF0ZlwiLCBcImNoYWluX3RleHR1cmUucG5nXCIsIFwiY29sdW1uX2FfZGlmZi5hdGZcIiwgXCJjb2x1bW5fYl9kaWZmLmF0ZlwiLCBcImNvbHVtbl9jX2RpZmYuYXRmXCIsIFwiY3VydGFpbl9ibHVlX2RpZmYuYXRmXCIsIFwiY3VydGFpbl9kaWZmLmF0ZlwiLCBcImN1cnRhaW5fZ3JlZW5fZGlmZi5hdGZcIiwgXCJkZXRhaWxzX2RpZmYuYXRmXCIsIFwiZmFicmljX2JsdWVfZGlmZi5hdGZcIiwgXCJmYWJyaWNfZGlmZi5hdGZcIiwgXCJmYWJyaWNfZ3JlZW5fZGlmZi5hdGZcIiwgXCJmbGFncG9sZV9kaWZmLmF0ZlwiLCBcImZsb29yX2FfZGlmZi5hdGZcIiwgXCJnaV9mbGFnLmF0ZlwiLCBcImxpb24uYXRmXCIsIFwicm9vZl9kaWZmLmF0ZlwiLCBcInRob3JuX2RpZmYucG5nXCIsIFwidmFzZV9kaWYuYXRmXCIsIFwidmFzZV9oYW5naW5nLmF0ZlwiLCBcInZhc2VfcGxhbnQucG5nXCIsIFwidmFzZV9yb3VuZC5hdGZcIl0pO1xuXHQvL3ByaXZhdGUgY29uc3Qgbm9ybWFsVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oW1wiYXJjaF9kZG4uYXRmXCIsIFwiYmFja2dyb3VuZF9kZG4uYXRmXCIsIFwiYnJpY2tzX2FfZGRuLmF0ZlwiLCBudWxsLCAgICAgICAgICAgICAgICBcImNoYWluX3RleHR1cmVfZGRuLmF0ZlwiLCBcImNvbHVtbl9hX2Rkbi5hdGZcIiwgXCJjb2x1bW5fYl9kZG4uYXRmXCIsIFwiY29sdW1uX2NfZGRuLmF0ZlwiLCBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgXCJsaW9uMl9kZG4uYXRmXCIsIG51bGwsICAgICAgIFwidGhvcm5fZGRuLmF0ZlwiLCBcInZhc2VfZGRuLmF0ZlwiLCAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICBcInZhc2Vfcm91bmRfZGRuLmF0ZlwiXSk7XG5cdC8vcHJpdmF0ZSBjb25zdCBzcGVjdWxhclRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFtcImFyY2hfc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgICBcImJyaWNrc19hX3NwZWMuYXRmXCIsIFwiY2VpbGluZ19hX3NwZWMuYXRmXCIsIG51bGwsICAgICAgICAgICAgICAgIFwiY29sdW1uX2Ffc3BlYy5hdGZcIiwgXCJjb2x1bW5fYl9zcGVjLmF0ZlwiLCBcImNvbHVtbl9jX3NwZWMuYXRmXCIsIFwiY3VydGFpbl9zcGVjLmF0ZlwiLCAgICAgIFwiY3VydGFpbl9zcGVjLmF0ZlwiLCBcImN1cnRhaW5fc3BlYy5hdGZcIiwgICAgICAgXCJkZXRhaWxzX3NwZWMuYXRmXCIsIFwiZmFicmljX3NwZWMuYXRmXCIsICAgICAgXCJmYWJyaWNfc3BlYy5hdGZcIiwgXCJmYWJyaWNfc3BlYy5hdGZcIiwgICAgICAgXCJmbGFncG9sZV9zcGVjLmF0ZlwiLCBcImZsb29yX2Ffc3BlYy5hdGZcIiwgbnVsbCwgICAgICAgICAgbnVsbCwgICAgICAgbnVsbCwgICAgICAgICAgICBcInRob3JuX3NwZWMuYXRmXCIsIG51bGwsICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIFwidmFzZV9wbGFudF9zcGVjLmF0ZlwiLCBcInZhc2Vfcm91bmRfc3BlYy5hdGZcIl0pO1xuXHRcblx0cHJpdmF0ZSBfZGlmZnVzZVRleHR1cmVTdHJpbmdzOkFycmF5PHN0cmluZz4gPSBBcnJheTxzdHJpbmc+KFwiYXJjaF9kaWZmLmpwZ1wiLCBcImJhY2tncm91bmQuanBnXCIsIFwiYnJpY2tzX2FfZGlmZi5qcGdcIiwgXCJjZWlsaW5nX2FfZGlmZi5qcGdcIiwgXCJjaGFpbl90ZXh0dXJlLnBuZ1wiLCBcImNvbHVtbl9hX2RpZmYuanBnXCIsIFwiY29sdW1uX2JfZGlmZi5qcGdcIiwgXCJjb2x1bW5fY19kaWZmLmpwZ1wiLCBcImN1cnRhaW5fYmx1ZV9kaWZmLmpwZ1wiLCBcImN1cnRhaW5fZGlmZi5qcGdcIiwgXCJjdXJ0YWluX2dyZWVuX2RpZmYuanBnXCIsIFwiZGV0YWlsc19kaWZmLmpwZ1wiLCBcImZhYnJpY19ibHVlX2RpZmYuanBnXCIsIFwiZmFicmljX2RpZmYuanBnXCIsIFwiZmFicmljX2dyZWVuX2RpZmYuanBnXCIsIFwiZmxhZ3BvbGVfZGlmZi5qcGdcIiwgXCJmbG9vcl9hX2RpZmYuanBnXCIsIFwiZ2lfZmxhZy5qcGdcIiwgXCJsaW9uLmpwZ1wiLCBcInJvb2ZfZGlmZi5qcGdcIiwgXCJ0aG9ybl9kaWZmLnBuZ1wiLCBcInZhc2VfZGlmLmpwZ1wiLCBcInZhc2VfaGFuZ2luZy5qcGdcIiwgXCJ2YXNlX3BsYW50LnBuZ1wiLCBcInZhc2Vfcm91bmQuanBnXCIpO1xuXHRwcml2YXRlIF9ub3JtYWxUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+ID0gQXJyYXk8c3RyaW5nPihcImFyY2hfZGRuLmpwZ1wiLCBcImJhY2tncm91bmRfZGRuLmpwZ1wiLCBcImJyaWNrc19hX2Rkbi5qcGdcIiwgbnVsbCwgICAgICAgICAgICAgICAgXCJjaGFpbl90ZXh0dXJlX2Rkbi5qcGdcIiwgXCJjb2x1bW5fYV9kZG4uanBnXCIsIFwiY29sdW1uX2JfZGRuLmpwZ1wiLCBcImNvbHVtbl9jX2Rkbi5qcGdcIiwgbnVsbCwgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgIG51bGwsICAgICAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgICBudWxsLCAgICAgICAgICAgICAgIG51bGwsICAgICAgICAgIFwibGlvbjJfZGRuLmpwZ1wiLCBudWxsLCAgICAgICBcInRob3JuX2Rkbi5qcGdcIiwgXCJ2YXNlX2Rkbi5qcGdcIiwgIG51bGwsICAgICAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgXCJ2YXNlX3JvdW5kX2Rkbi5qcGdcIik7XG5cdHByaXZhdGUgX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M6QXJyYXk8c3RyaW5nPiA9IEFycmF5PHN0cmluZz4oXCJhcmNoX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgICAgXCJicmlja3NfYV9zcGVjLmpwZ1wiLCBcImNlaWxpbmdfYV9zcGVjLmpwZ1wiLCBudWxsLCAgICAgICAgICAgICAgICBcImNvbHVtbl9hX3NwZWMuanBnXCIsIFwiY29sdW1uX2Jfc3BlYy5qcGdcIiwgXCJjb2x1bW5fY19zcGVjLmpwZ1wiLCBcImN1cnRhaW5fc3BlYy5qcGdcIiwgICAgICBcImN1cnRhaW5fc3BlYy5qcGdcIiwgXCJjdXJ0YWluX3NwZWMuanBnXCIsICAgICAgIFwiZGV0YWlsc19zcGVjLmpwZ1wiLCBcImZhYnJpY19zcGVjLmpwZ1wiLCAgICAgIFwiZmFicmljX3NwZWMuanBnXCIsIFwiZmFicmljX3NwZWMuanBnXCIsICAgICAgIFwiZmxhZ3BvbGVfc3BlYy5qcGdcIiwgXCJmbG9vcl9hX3NwZWMuanBnXCIsIG51bGwsICAgICAgICAgIG51bGwsICAgICAgIG51bGwsICAgICAgICAgICAgXCJ0aG9ybl9zcGVjLmpwZ1wiLCBudWxsLCAgICAgICAgICAgbnVsbCwgICAgICAgICAgICAgICBcInZhc2VfcGxhbnRfc3BlYy5qcGdcIiwgXCJ2YXNlX3JvdW5kX3NwZWMuanBnXCIpO1xuXHRwcml2YXRlIF9udW1UZXhTdHJpbmdzOkFycmF5PG51bWJlciAvKnVpbnQqLz4gPSBBcnJheTxudW1iZXIgLyp1aW50Ki8+KDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwKTtcblx0cHJpdmF0ZSBfbWVzaFJlZmVyZW5jZTpNZXNoW10gPSBuZXcgQXJyYXk8TWVzaD4oMjUpO1xuXHRcblx0Ly9mbGFtZSBkYXRhIG9iamVjdHNcblx0cHJpdmF0ZSBfZmxhbWVEYXRhOkFycmF5PEZsYW1lVk8+ID0gQXJyYXk8RmxhbWVWTz4obmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKC02MjUsIDE2NSwgMjE5KSwgMHhmZmFhNDQpLCBuZXcgRmxhbWVWTyhuZXcgVmVjdG9yM0QoNDg1LCAxNjUsIDIxOSksIDB4ZmZhYTQ0KSwgbmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKC02MjUsIDE2NSwgLTE0OCksIDB4ZmZhYTQ0KSwgbmV3IEZsYW1lVk8obmV3IFZlY3RvcjNEKDQ4NSwgMTY1LCAtMTQ4KSwgMHhmZmFhNDQpKTtcblx0XG5cdC8vbWF0ZXJpYWwgZGljdGlvbmFyaWVzIHRvIGhvbGQgaW5zdGFuY2VzXG5cdHByaXZhdGUgX3RleHR1cmVEaWN0aW9uYXJ5Ok9iamVjdCA9IG5ldyBPYmplY3QoKTtcblx0cHJpdmF0ZSBfbXVsdGlNYXRlcmlhbERpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRwcml2YXRlIF9zaW5nbGVNYXRlcmlhbERpY3Rpb25hcnk6T2JqZWN0ID0gbmV3IE9iamVjdCgpO1xuXHRcblx0Ly9wcml2YXRlIG1lc2hEaWN0aW9uYXJ5OkRpY3Rpb25hcnkgPSBuZXcgRGljdGlvbmFyeSgpO1xuXHRwcml2YXRlIHZhc2VNZXNoZXM6QXJyYXk8TWVzaD4gPSBuZXcgQXJyYXk8TWVzaD4oKTtcblx0cHJpdmF0ZSBwb2xlTWVzaGVzOkFycmF5PE1lc2g+ID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdHByaXZhdGUgY29sTWVzaGVzOkFycmF5PE1lc2g+ID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFxuXHQvL2VuZ2llbiB2YXJpYWJsZXNmXG5cdHByaXZhdGUgX3ZpZXc6Vmlldztcblx0cHJpdmF0ZSBfY2FtZXJhQ29udHJvbGxlcjpGaXJzdFBlcnNvbkNvbnRyb2xsZXI7XG5cdFxuXHQvL2d1aSB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfc2luZ2xlUGFzc01hdGVyaWFsOmJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBfbXVsdGlQYXNzTWF0ZXJpYWw6Ym9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2Nhc2NhZGVMZXZlbHM6bnVtYmVyIC8qdWludCovID0gMztcblx0cHJpdmF0ZSBfc2hhZG93T3B0aW9uczpzdHJpbmcgPSBcIlBDRlwiO1xuXHRwcml2YXRlIF9kZXB0aE1hcFNpemU6bnVtYmVyIC8qdWludCovID0gMjA0ODtcblx0cHJpdmF0ZSBfbGlnaHREaXJlY3Rpb246bnVtYmVyID0gTWF0aC5QSS8yO1xuXHRwcml2YXRlIF9saWdodEVsZXZhdGlvbjpudW1iZXIgPSBNYXRoLlBJLzE4O1xuXHRcblx0Ly9saWdodCB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfbGlnaHRQaWNrZXI6U3RhdGljTGlnaHRQaWNrZXI7XG5cdHByaXZhdGUgX2Jhc2VTaGFkb3dNZXRob2Q6U2hhZG93U29mdE1ldGhvZDtcblx0cHJpdmF0ZSBfY2FzY2FkZU1ldGhvZDpTaGFkb3dDYXNjYWRlTWV0aG9kO1xuXHRwcml2YXRlIF9mb2dNZXRob2QgOiBFZmZlY3RGb2dNZXRob2Q7XG5cdHByaXZhdGUgX2Nhc2NhZGVTaGFkb3dNYXBwZXI6RGlyZWN0aW9uYWxTaGFkb3dNYXBwZXI7XG5cdHByaXZhdGUgX2RpcmVjdGlvbmFsTGlnaHQ6RGlyZWN0aW9uYWxMaWdodDtcblx0cHJpdmF0ZSBfbGlnaHRzOkFycmF5PGFueT4gPSBuZXcgQXJyYXk8YW55PigpO1xuXHRcblx0Ly9tYXRlcmlhbCB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfc2t5TWFwOkltYWdlQ3ViZVRleHR1cmU7XG5cdHByaXZhdGUgX2ZsYW1lTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWw7XG5cdHByaXZhdGUgX251bVRleHR1cmVzOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdHByaXZhdGUgX2N1cnJlbnRUZXh0dXJlOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdHByaXZhdGUgX2xvYWRpbmdUZXh0dXJlU3RyaW5nczpBcnJheTxzdHJpbmc+O1xuXHRwcml2YXRlIF9uOm51bWJlciAvKnVpbnQqLyA9IDA7XG5cdHByaXZhdGUgX2xvYWRpbmdUZXh0OnN0cmluZztcblx0XG5cdC8vc2NlbmUgdmFyaWFibGVzXG5cdHByaXZhdGUgX21lc2hlczpBcnJheTxNZXNoPiA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRwcml2YXRlIF9mbGFtZUdlb21ldHJ5OlByaW1pdGl2ZVBsYW5lUHJlZmFiO1xuXHRcdFx0XG5cdC8vcm90YXRpb24gdmFyaWFibGVzXG5cdHByaXZhdGUgX21vdmU6Ym9vbGVhbiA9IGZhbHNlO1xuXHRwcml2YXRlIF9sYXN0UGFuQW5nbGU6bnVtYmVyO1xuXHRwcml2YXRlIF9sYXN0VGlsdEFuZ2xlOm51bWJlcjtcblx0cHJpdmF0ZSBfbGFzdE1vdXNlWDpudW1iZXI7XG5cdHByaXZhdGUgX2xhc3RNb3VzZVk6bnVtYmVyO1xuXHRcblx0Ly9tb3ZlbWVudCB2YXJpYWJsZXNcblx0cHJpdmF0ZSBfZHJhZzpudW1iZXIgPSAwLjU7XG5cdHByaXZhdGUgX3dhbGtJbmNyZW1lbnQ6bnVtYmVyID0gMTA7XG5cdHByaXZhdGUgX3N0cmFmZUluY3JlbWVudDpudW1iZXIgPSAxMDtcblx0cHJpdmF0ZSBfd2Fsa1NwZWVkOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3N0cmFmZVNwZWVkOm51bWJlciA9IDA7XG5cdHByaXZhdGUgX3dhbGtBY2NlbGVyYXRpb246bnVtYmVyID0gMDtcblx0cHJpdmF0ZSBfc3RyYWZlQWNjZWxlcmF0aW9uOm51bWJlciA9IDA7XG5cblx0cHJpdmF0ZSBfdGltZXI6UmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXHRwcml2YXRlIF90aW1lOm51bWJlciA9IDA7XG5cdHByaXZhdGUgcGFyc2VBV0REZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgcGFyc2VCaXRtYXBEZWxlZ2F0ZTooZXZlbnQ6RXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgbG9hZFByb2dyZXNzRGVsZWdhdGU6KGV2ZW50OlByb2dyZXNzRXZlbnQpID0+IHZvaWQ7XG5cdHByaXZhdGUgb25CaXRtYXBDb21wbGV0ZURlbGVnYXRlOihldmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBvbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZTooZXZlbnQ6QXNzZXRFdmVudCkgPT4gdm9pZDtcblx0cHJpdmF0ZSBvblJlc291cmNlQ29tcGxldGVEZWxlZ2F0ZTooZXZlbnQ6TG9hZGVyRXZlbnQpID0+IHZvaWQ7XG5cblx0LyoqXG5cdCAqIENvbnN0cnVjdG9yXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpXG5cdHtcblx0XHR0aGlzLmluaXQoKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEdsb2JhbCBpbml0aWFsaXNlIGZ1bmN0aW9uXG5cdCAqL1xuXHRwcml2YXRlIGluaXQoKVxuXHR7XG5cdFx0dGhpcy5pbml0RW5naW5lKCk7XG5cdFx0dGhpcy5pbml0TGlnaHRzKCk7XG5cdFx0dGhpcy5pbml0TGlzdGVuZXJzKCk7XG5cdFx0XG5cdFx0XG5cdFx0Ly9jb3VudCB0ZXh0dXJlc1xuXHRcdHRoaXMuX24gPSAwO1xuXHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncztcblx0XHR0aGlzLmNvdW50TnVtVGV4dHVyZXMoKTtcblx0XHRcblx0XHQvL2tpY2tvZmYgYXNzZXQgbG9hZGluZ1xuXHRcdHRoaXMuX24gPSAwO1xuXHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncztcblx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGVuZ2luZVxuXHQgKi9cblx0cHJpdmF0ZSBpbml0RW5naW5lKClcblx0e1xuXHRcdC8vY3JlYXRlIHRoZSB2aWV3XG5cdFx0dGhpcy5fdmlldyA9IG5ldyBWaWV3KG5ldyBEZWZhdWx0UmVuZGVyZXIoTWV0aG9kUmVuZGVyZXJQb29sKSk7XG5cdFx0dGhpcy5fdmlldy5jYW1lcmEueSA9IDE1MDtcblx0XHR0aGlzLl92aWV3LmNhbWVyYS56ID0gMDtcblx0XHRcblx0XHQvL3NldHVwIGNvbnRyb2xsZXIgdG8gYmUgdXNlZCBvbiB0aGUgY2FtZXJhXG5cdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlciA9IG5ldyBGaXJzdFBlcnNvbkNvbnRyb2xsZXIodGhpcy5fdmlldy5jYW1lcmEsIDkwLCAwLCAtODAsIDgwKTtcdFx0XHRcblx0fVxuXHRcblx0LyoqXG5cdCAqIEluaXRpYWxpc2UgdGhlIGxpZ2h0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0TGlnaHRzKClcblx0e1xuXHRcdC8vY3JlYXRlIGxpZ2h0cyBhcnJheVxuXHRcdHRoaXMuX2xpZ2h0cyA9IG5ldyBBcnJheTxhbnk+KCk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgZ2xvYmFsIGRpcmVjdGlvbmFsIGxpZ2h0XG4vL1x0XHRcdHRoaXMuX2Nhc2NhZGVTaGFkb3dNYXBwZXIgPSBuZXcgQ2FzY2FkZVNoYWRvd01hcHBlcigzKTtcbi8vXHRcdFx0dGhpcy5fY2FzY2FkZVNoYWRvd01hcHBlci5saWdodE9mZnNldCA9IDIwMDAwO1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQgPSBuZXcgRGlyZWN0aW9uYWxMaWdodCgtMSwgLTE1LCAxKTtcbi8vXHRcdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5zaGFkb3dNYXBwZXIgPSB0aGlzLl9jYXNjYWRlU2hhZG93TWFwcGVyO1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuY29sb3IgPSAweGVlZGRkZDtcblx0XHR0aGlzLl9kaXJlY3Rpb25hbExpZ2h0LmFtYmllbnQgPSAuMzU7XG5cdFx0dGhpcy5fZGlyZWN0aW9uYWxMaWdodC5hbWJpZW50Q29sb3IgPSAweDgwODA5MDtcblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQpO1xuXHRcdHRoaXMuX2xpZ2h0cy5wdXNoKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQpO1xuXG5cdFx0dGhpcy51cGRhdGVEaXJlY3Rpb24oKTtcblx0XHRcblx0XHQvL2NyZWF0ZSBmbGFtZSBsaWdodHNcblx0XHR2YXIgZmxhbWVWTzpGbGFtZVZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fZmxhbWVEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0ZmxhbWVWTyA9IHRoaXMuX2ZsYW1lRGF0YVtpXTtcblx0XHRcdHZhciBsaWdodCA6IFBvaW50TGlnaHQgPSBmbGFtZVZPLmxpZ2h0ID0gbmV3IFBvaW50TGlnaHQoKTtcblx0XHRcdGxpZ2h0LnJhZGl1cyA9IDIwMDtcblx0XHRcdGxpZ2h0LmZhbGxPZmYgPSA2MDA7XG5cdFx0XHRsaWdodC5jb2xvciA9IGZsYW1lVk8uY29sb3I7XG5cdFx0XHRsaWdodC55ID0gMTA7XG5cdFx0XHR0aGlzLl9saWdodHMucHVzaChsaWdodCk7XG5cdFx0fVxuXHRcdFxuXHRcdC8vY3JlYXRlIG91ciBnbG9iYWwgbGlnaHQgcGlja2VyXG5cdFx0dGhpcy5fbGlnaHRQaWNrZXIgPSBuZXcgU3RhdGljTGlnaHRQaWNrZXIodGhpcy5fbGlnaHRzKTtcblx0XHR0aGlzLl9iYXNlU2hhZG93TWV0aG9kID0gbmV3IFNoYWRvd1NvZnRNZXRob2QodGhpcy5fZGlyZWN0aW9uYWxMaWdodCAsIDEwICwgNSApO1xuLy9cdFx0XHR0aGlzLl9iYXNlU2hhZG93TWV0aG9kID0gbmV3IFNoYWRvd0ZpbHRlcmVkTWV0aG9kKHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQpO1xuXHRcdFxuXHRcdC8vY3JlYXRlIG91ciBnbG9iYWwgZm9nIG1ldGhvZFxuXHRcdHRoaXMuX2ZvZ01ldGhvZCA9IG5ldyBFZmZlY3RGb2dNZXRob2QoMCwgNDAwMCwgMHg5MDkwZTcpO1xuLy9cdFx0XHR0aGlzLl9jYXNjYWRlTWV0aG9kID0gbmV3IFNoYWRvd0Nhc2NhZGVNZXRob2QodGhpcy5fYmFzZVNoYWRvd01ldGhvZCk7XG5cdH1cblx0XHRcdFxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgc2NlbmUgb2JqZWN0c1xuXHQgKi9cblx0cHJpdmF0ZSBpbml0T2JqZWN0cygpXG5cdHtcblx0XHQvL2NyZWF0ZSBza3lib3hcblx0XHR0aGlzLl92aWV3LnNjZW5lLmFkZENoaWxkKG5ldyBTa3lib3godGhpcy5fc2t5TWFwKSk7XG5cdFx0XG5cdFx0Ly9jcmVhdGUgZmxhbWUgbWVzaGVzXG5cdFx0dGhpcy5fZmxhbWVHZW9tZXRyeSA9IG5ldyBQcmltaXRpdmVQbGFuZVByZWZhYig0MCwgODAsIDEsIDEsIGZhbHNlLCB0cnVlKTtcblx0XHR2YXIgZmxhbWVWTzpGbGFtZVZPO1xuXHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fZmxhbWVEYXRhLmxlbmd0aDtcblx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0ZmxhbWVWTyA9IHRoaXMuX2ZsYW1lRGF0YVtpXTtcblx0XHRcdHZhciBtZXNoOk1lc2ggPSBmbGFtZVZPLm1lc2ggPSA8TWVzaD4gdGhpcy5fZmxhbWVHZW9tZXRyeS5nZXROZXdPYmplY3QoKTtcblx0XHRcdG1lc2gubWF0ZXJpYWwgPSB0aGlzLl9mbGFtZU1hdGVyaWFsO1xuXHRcdFx0bWVzaC50cmFuc2Zvcm0ucG9zaXRpb24gPSBmbGFtZVZPLnBvc2l0aW9uO1xuXHRcdFx0bWVzaC5zdWJNZXNoZXNbMF0udXZUcmFuc2Zvcm0gPSBuZXcgVVZUcmFuc2Zvcm0oKVxuXHRcdFx0bWVzaC5zdWJNZXNoZXNbMF0udXZUcmFuc2Zvcm0uc2NhbGVVID0gMS8xNjtcblx0XHRcdHRoaXMuX3ZpZXcuc2NlbmUuYWRkQ2hpbGQobWVzaCk7XG5cdFx0XHRtZXNoLmFkZENoaWxkKGZsYW1lVk8ubGlnaHQpO1xuXHRcdH1cblx0fVxuXHRcdFxuXHQvKipcblx0ICogSW5pdGlhbGlzZSB0aGUgbGlzdGVuZXJzXG5cdCAqL1xuXHRwcml2YXRlIGluaXRMaXN0ZW5lcnMoKVxuXHR7XG5cdFx0Ly9hZGQgbGlzdGVuZXJzXG5cdFx0d2luZG93Lm9ucmVzaXplICA9IChldmVudCkgPT4gdGhpcy5vblJlc2l6ZShldmVudCk7XG5cblx0XHRkb2N1bWVudC5vbm1vdXNlZG93biA9IChldmVudCkgPT4gdGhpcy5vbk1vdXNlRG93bihldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZXVwID0gKGV2ZW50KSA9PiB0aGlzLm9uTW91c2VVcChldmVudCk7XG5cdFx0ZG9jdW1lbnQub25tb3VzZW1vdmUgPSAoZXZlbnQpID0+IHRoaXMub25Nb3VzZU1vdmUoZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5ZG93biA9IChldmVudCkgPT4gdGhpcy5vbktleURvd24oZXZlbnQpO1xuXHRcdGRvY3VtZW50Lm9ua2V5dXAgPSAoZXZlbnQpID0+IHRoaXMub25LZXlVcChldmVudCk7XG5cblx0XHR0aGlzLm9uUmVzaXplKCk7XG5cblx0XHR0aGlzLnBhcnNlQVdERGVsZWdhdGUgPSAoZXZlbnQ6RXZlbnQpID0+IHRoaXMucGFyc2VBV0QoZXZlbnQpO1xuXHRcdHRoaXMucGFyc2VCaXRtYXBEZWxlZ2F0ZSA9IChldmVudCkgPT4gdGhpcy5wYXJzZUJpdG1hcChldmVudCk7XG5cdFx0dGhpcy5sb2FkUHJvZ3Jlc3NEZWxlZ2F0ZSA9IChldmVudDpQcm9ncmVzc0V2ZW50KSA9PiB0aGlzLmxvYWRQcm9ncmVzcyhldmVudCk7XG5cdFx0dGhpcy5vbkJpdG1hcENvbXBsZXRlRGVsZWdhdGUgPSAoZXZlbnQpID0+IHRoaXMub25CaXRtYXBDb21wbGV0ZShldmVudCk7XG5cdFx0dGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSA9IChldmVudDpBc3NldEV2ZW50KSA9PiB0aGlzLm9uQXNzZXRDb21wbGV0ZShldmVudCk7XG5cdFx0dGhpcy5vblJlc291cmNlQ29tcGxldGVEZWxlZ2F0ZSA9IChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vblJlc291cmNlQ29tcGxldGUoZXZlbnQpO1xuXG5cdFx0dGhpcy5fdGltZXIgPSBuZXcgUmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMub25FbnRlckZyYW1lLCB0aGlzKTtcblx0XHR0aGlzLl90aW1lci5zdGFydCgpO1xuXHR9XG5cdFxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgbWF0ZXJpYWwgbW9kZSBiZXR3ZWVuIHNpbmdsZSBwYXNzIGFuZCBtdWx0aSBwYXNzXG5cdCAqL1xuLy9cdFx0cHJpdmF0ZSB1cGRhdGVNYXRlcmlhbFBhc3MobWF0ZXJpYWxEaWN0aW9uYXJ5OkRpY3Rpb25hcnkpXG4vL1x0XHR7XG4vL1x0XHRcdHZhciBtZXNoOk1lc2g7XG4vL1x0XHRcdHZhciBuYW1lOnN0cmluZztcbi8vXHRcdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9tZXNoZXMubGVuZ3RoO1xuLy9cdFx0XHRmb3IgKHZhciBpOm51bWJlciA9IDA7IGkgPCBsZW47IGkrKykge1xuLy9cdFx0XHRcdG1lc2ggPSB0aGlzLl9tZXNoZXNbaV07XG4vL1x0XHRcdFx0aWYgKG1lc2gubmFtZSA9PSBcInNwb256YV8wNFwiIHx8IG1lc2gubmFtZSA9PSBcInNwb256YV8zNzlcIilcbi8vXHRcdFx0XHRcdGNvbnRpbnVlO1xuLy9cdFx0XHRcdG5hbWUgPSBtZXNoLm1hdGVyaWFsLm5hbWU7XG4vL1x0XHRcdFx0dmFyIHRleHR1cmVJbmRleDpudW1iZXIgPSB0aGlzLl9tYXRlcmlhbE5hbWVTdHJpbmdzLmluZGV4T2YobmFtZSk7XG4vL1x0XHRcdFx0aWYgKHRleHR1cmVJbmRleCA9PSAtMSB8fCB0ZXh0dXJlSW5kZXggPj0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5sZW5ndGgpXG4vL1x0XHRcdFx0XHRjb250aW51ZTtcbi8vXG4vL1x0XHRcdFx0bWVzaC5tYXRlcmlhbCA9IG1hdGVyaWFsRGljdGlvbmFyeVtuYW1lXTtcbi8vXHRcdFx0fVxuLy9cdFx0fVxuXHRcblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGRpcmVjdGlvbiBvZiB0aGUgZGlyZWN0aW9uYWwgbGlnaHRzb3VyY2Vcblx0ICovXG5cdHByaXZhdGUgdXBkYXRlRGlyZWN0aW9uKClcblx0e1xuXHRcdHRoaXMuX2RpcmVjdGlvbmFsTGlnaHQuZGlyZWN0aW9uID0gbmV3IFZlY3RvcjNEKFxuXHRcdFx0TWF0aC5zaW4odGhpcy5fbGlnaHRFbGV2YXRpb24pKk1hdGguY29zKHRoaXMuX2xpZ2h0RGlyZWN0aW9uKSxcblx0XHRcdC1NYXRoLmNvcyh0aGlzLl9saWdodEVsZXZhdGlvbiksXG5cdFx0XHRNYXRoLnNpbih0aGlzLl9saWdodEVsZXZhdGlvbikqTWF0aC5zaW4odGhpcy5fbGlnaHREaXJlY3Rpb24pXG5cdFx0KTtcblx0fVxuXHRcblx0LyoqXG5cdCAqIENvdW50IHRoZSB0b3RhbCBudW1iZXIgb2YgdGV4dHVyZXMgdG8gYmUgbG9hZGVkXG5cdCAqL1xuXHRwcml2YXRlIGNvdW50TnVtVGV4dHVyZXMoKVxuXHR7XG5cdFx0dGhpcy5fbnVtVGV4dHVyZXMrKztcblx0XHRcblx0XHQvL3NraXAgbnVsbCB0ZXh0dXJlc1xuXHRcdHdoaWxlICh0aGlzLl9uKysgPCB0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MubGVuZ3RoIC0gMSlcblx0XHRcdGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pXG5cdFx0XHRcdGJyZWFrO1xuXHRcdFxuXHRcdC8vc3dpdGNoIHRvIG5leHQgdGV0dXJlIHNldFxuXHRcdGlmICh0aGlzLl9uIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCkge1xuXHRcdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzO1xuXHRcdFx0dGhpcy5jb3VudE51bVRleHR1cmVzKCk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3MpIHtcblx0XHRcdHRoaXMuX24gPSAwO1xuXHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMuY291bnROdW1UZXh0dXJlcygpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIEdsb2JhbCBiaW5hcnkgZmlsZSBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgbG9hZCh1cmw6c3RyaW5nKVxuXHR7XG5cdFx0dmFyIGxvYWRlcjpVUkxMb2FkZXIgPSBuZXcgVVJMTG9hZGVyKCk7XG5cdFx0c3dpdGNoICh1cmwuc3Vic3RyaW5nKHVybC5sZW5ndGggLSAzKSkge1xuXHRcdFx0Y2FzZSBcIkFXRFwiOiBcblx0XHRcdGNhc2UgXCJhd2RcIjpcblx0XHRcdFx0bG9hZGVyLmRhdGFGb3JtYXQgPSBVUkxMb2FkZXJEYXRhRm9ybWF0LkFSUkFZX0JVRkZFUjtcblx0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHQgPSBcIkxvYWRpbmcgTW9kZWxcIjtcblx0XHRcdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIHRoaXMucGFyc2VBV0REZWxlZ2F0ZSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInBuZ1wiOiBcblx0XHRcdGNhc2UgXCJqcGdcIjpcblx0XHRcdFx0bG9hZGVyLmRhdGFGb3JtYXQgPSBVUkxMb2FkZXJEYXRhRm9ybWF0LkJMT0I7XG5cdFx0XHRcdHRoaXMuX2N1cnJlbnRUZXh0dXJlKys7XG5cdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0ID0gXCJMb2FkaW5nIFRleHR1cmVzXCI7XG5cdFx0XHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKEV2ZW50LkNPTVBMRVRFLCB0aGlzLnBhcnNlQml0bWFwRGVsZWdhdGUpO1xuXHRcdFx0XHR1cmwgPSBcInNwb256YS9cIiArIHVybDtcblx0XHRcdFx0YnJlYWs7XG4vL1x0XHRcdFx0Y2FzZSBcImF0ZlwiOlxuLy9cdFx0XHRcdFx0dGhpcy5fY3VycmVudFRleHR1cmUrKztcbi8vXHRcdFx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0ID0gXCJMb2FkaW5nIFRleHR1cmVzXCI7XG4vLyAgICAgICAgICAgICAgICAgICAgbG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoRXZlbnQuQ09NUExFVEUsIChldmVudDpFdmVudCkgPT4gdGhpcy5vbkFURkNvbXBsZXRlKGV2ZW50KSk7XG4vL1x0XHRcdFx0XHR1cmwgPSBcInNwb256YS9hdGYvXCIgKyB1cmw7XG4vLyAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cdFx0fVxuXHRcdFxuXHRcdGxvYWRlci5hZGRFdmVudExpc3RlbmVyKFByb2dyZXNzRXZlbnQuUFJPR1JFU1MsIHRoaXMubG9hZFByb2dyZXNzRGVsZWdhdGUpO1xuXHRcdHZhciB1cmxSZXE6VVJMUmVxdWVzdCA9IG5ldyBVUkxSZXF1ZXN0KHRoaXMuX2Fzc2V0c1Jvb3QrdXJsKTtcblx0XHRsb2FkZXIubG9hZCh1cmxSZXEpO1xuXHRcdFxuXHR9XG5cdFxuXHQvKipcblx0ICogRGlzcGxheSBjdXJyZW50IGxvYWRcblx0ICovXG5cdHByaXZhdGUgbG9hZFByb2dyZXNzKGU6UHJvZ3Jlc3NFdmVudClcblx0e1xuXHRcdC8vVE9ETyB3b3JrIG91dCB3aHkgdGhlIGNhc3Rpbmcgb24gUHJvZ3Jlc3NFdmVudCBmYWlscyBmb3IgYnl0ZXNMb2FkZWQgYW5kIGJ5dGVzVG90YWwgcHJvcGVydGllc1xuXHRcdHZhciBQOm51bWJlciA9IE1hdGguZmxvb3IoZVtcImJ5dGVzTG9hZGVkXCJdIC8gZVtcImJ5dGVzVG90YWxcIl0gKiAxMDApO1xuXHRcdGlmIChQICE9IDEwMCkge1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5fbG9hZGluZ1RleHQgKyAnXFxuJyArICgodGhpcy5fbG9hZGluZ1RleHQgPT0gXCJMb2FkaW5nIE1vZGVsXCIpPyBNYXRoLmZsb29yKChlW1wiYnl0ZXNMb2FkZWRcIl0gLyAxMDI0KSA8PCAwKSArICdrYiB8ICcgKyBNYXRoLmZsb29yKChlW1wiYnl0ZXNUb3RhbFwiXSAvIDEwMjQpIDw8IDApICsgJ2tiJyA6IHRoaXMuX2N1cnJlbnRUZXh0dXJlICsgJyB8ICcgKyB0aGlzLl9udW1UZXh0dXJlcykpO1xuXHRcdH1cblx0fVxuXHRcblx0LyoqXG5cdCAqIFBhcnNlcyB0aGUgQVRGIGZpbGVcblx0ICovXG4vL1x0XHRwcml2YXRlIG9uQVRGQ29tcGxldGUoZTpFdmVudClcbi8vXHRcdHtcbi8vICAgICAgICAgICAgdmFyIGxvYWRlcjpVUkxMb2FkZXIgPSBVUkxMb2FkZXIoZS50YXJnZXQpO1xuLy8gICAgICAgICAgICBsb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5vbkFURkNvbXBsZXRlKTtcbi8vXG4vL1x0XHRcdGlmICghdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dXSlcbi8vXHRcdFx0e1xuLy9cdFx0XHRcdHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0gPSBuZXcgQVRGVGV4dHVyZShsb2FkZXIuZGF0YSk7XG4vL1x0XHRcdH1cbi8vXG4vLyAgICAgICAgICAgIGxvYWRlci5kYXRhID0gbnVsbDtcbi8vICAgICAgICAgICAgbG9hZGVyLmNsb3NlKCk7XG4vL1x0XHRcdGxvYWRlciA9IG51bGw7XG4vL1xuLy9cbi8vXHRcdFx0Ly9za2lwIG51bGwgdGV4dHVyZXNcbi8vXHRcdFx0d2hpbGUgKHRoaXMuX24rKyA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGggLSAxKVxuLy9cdFx0XHRcdGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pXG4vL1x0XHRcdFx0XHRicmVhaztcbi8vXG4vL1x0XHRcdC8vc3dpdGNoIHRvIG5leHQgdGV0dXJlIHNldFxuLy8gICAgICAgICAgICBpZiAodGhpcy5fbiA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGgpIHtcbi8vXHRcdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcbi8vXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPT0gdGhpcy5fZGlmZnVzZVRleHR1cmVTdHJpbmdzKSB7XG4vL1x0XHRcdFx0dGhpcy5fbiA9IDA7XG4vL1x0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3M7XG4vL1x0XHRcdFx0dGhpcy5sb2FkKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXSk7XG4vL1x0XHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzKSB7XG4vL1x0XHRcdFx0dGhpcy5fbiA9IDA7XG4vL1x0XHRcdFx0dGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5ncztcbi8vXHRcdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcbi8vXHRcdFx0fSBlbHNlIHtcbi8vXHRcdFx0XHR0aGlzLmxvYWQoXCJzcG9uemEvc3BvbnphLmF3ZFwiKTtcbi8vICAgICAgICAgICAgfVxuLy8gICAgICAgIH1cblx0XG5cdFxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBCaXRtYXAgZmlsZVxuXHQgKi9cblx0cHJpdmF0ZSBwYXJzZUJpdG1hcChlKVxuXHR7XG5cdFx0dmFyIHVybExvYWRlcjpVUkxMb2FkZXIgPSA8VVJMTG9hZGVyPiBlLnRhcmdldDtcblx0XHR2YXIgaW1hZ2U6SFRNTEltYWdlRWxlbWVudCA9IFBhcnNlclV0aWxzLmJsb2JUb0ltYWdlKHVybExvYWRlci5kYXRhKTtcblx0XHRpbWFnZS5vbmxvYWQgPSB0aGlzLm9uQml0bWFwQ29tcGxldGVEZWxlZ2F0ZTtcblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUJpdG1hcERlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihQcm9ncmVzc0V2ZW50LlBST0dSRVNTLCB0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIgPSBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogTGlzdGVuZXIgZm9yIGJpdG1hcCBjb21wbGV0ZSBldmVudCBvbiBsb2FkZXJcblx0ICovXG5cdHByaXZhdGUgb25CaXRtYXBDb21wbGV0ZShlOkV2ZW50KVxuXHR7XG5cdFx0dmFyIGltYWdlOkhUTUxJbWFnZUVsZW1lbnQgPSA8SFRNTEltYWdlRWxlbWVudD4gZS50YXJnZXQ7XG5cdFx0aW1hZ2Uub25sb2FkID0gbnVsbDtcblxuXHRcdC8vY3JlYXRlIGJpdG1hcCB0ZXh0dXJlIGluIGRpY3Rpb25hcnlcblx0XHRpZiAoIXRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5nc1t0aGlzLl9uXV0pXG5cdFx0XHR0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl1dID0gKHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9PSB0aGlzLl9zcGVjdWxhclRleHR1cmVTdHJpbmdzKT8gbmV3IFNwZWN1bGFyQml0bWFwVGV4dHVyZShDYXN0LmJpdG1hcERhdGEoaW1hZ2UpKSA6IG5ldyBJbWFnZVRleHR1cmUoaW1hZ2UpO1xuXG5cdFx0Ly9za2lwIG51bGwgdGV4dHVyZXNcblx0XHR3aGlsZSAodGhpcy5fbisrIDwgdGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzLmxlbmd0aCAtIDEpXG5cdFx0XHRpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKVxuXHRcdFx0XHRicmVhaztcblx0XHRcblx0XHQvL3N3aXRjaCB0byBuZXh0IHRldHVyZSBzZXRcblx0XHRpZiAodGhpcy5fbiA8IHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncy5sZW5ndGgpIHtcblx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5ncykge1xuXHRcdFx0dGhpcy5fbiA9IDA7XG5cdFx0XHR0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3MgPSB0aGlzLl9ub3JtYWxUZXh0dXJlU3RyaW5ncztcblx0XHRcdHRoaXMubG9hZCh0aGlzLl9sb2FkaW5nVGV4dHVyZVN0cmluZ3NbdGhpcy5fbl0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzID09IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzKSB7XG5cdFx0XHR0aGlzLl9uID0gMDtcblx0XHRcdHRoaXMuX2xvYWRpbmdUZXh0dXJlU3RyaW5ncyA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3M7XG5cdFx0XHR0aGlzLmxvYWQodGhpcy5fbG9hZGluZ1RleHR1cmVTdHJpbmdzW3RoaXMuX25dKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5sb2FkKFwic3BvbnphL3Nwb256YS5hd2RcIik7XG5cdFx0fVxuXHR9XG5cdFxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBBV0QgZmlsZVxuXHQgKi9cblx0cHJpdmF0ZSBwYXJzZUFXRChlKVxuXHR7XG5cdFx0Y29uc29sZS5sb2coXCJQYXJzaW5nIERhdGFcIik7XG5cdFx0dmFyIHVybExvYWRlcjpVUkxMb2FkZXIgPSA8VVJMTG9hZGVyPiBlLnRhcmdldDtcblx0XHR2YXIgbG9hZGVyOkxvYWRlciA9IG5ldyBMb2FkZXIoZmFsc2UpO1xuXG5cdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgdGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0bG9hZGVyLmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdGxvYWRlci5sb2FkRGF0YSh1cmxMb2FkZXIuZGF0YSwgbmV3IEFzc2V0TG9hZGVyQ29udGV4dChmYWxzZSksIG51bGwsIG5ldyBBV0RQYXJzZXIoKSk7XG5cblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihQcm9ncmVzc0V2ZW50LlBST0dSRVNTLCB0aGlzLmxvYWRQcm9ncmVzc0RlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihFdmVudC5DT01QTEVURSwgdGhpcy5wYXJzZUFXRERlbGVnYXRlKTtcblx0XHR1cmxMb2FkZXIgPSBudWxsO1xuXHR9XG5cdFxuXHQvKipcblx0ICogTGlzdGVuZXIgZm9yIGFzc2V0IGNvbXBsZXRlIGV2ZW50IG9uIGxvYWRlclxuXHQgKi9cblx0cHJpdmF0ZSBvbkFzc2V0Q29tcGxldGUoZXZlbnQ6QXNzZXRFdmVudClcblx0e1xuXHRcdGlmIChldmVudC5hc3NldC5pc0Fzc2V0KE1lc2gpKSB7XG5cdFx0XHQvL3N0b3JlIG1lc2hlc1xuXHRcdFx0dGhpcy5fbWVzaGVzLnB1c2goPE1lc2g+IGV2ZW50LmFzc2V0KTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgb25jZSBhbGwgcmVzb3VyY2VzIGFyZSBsb2FkZWRcblx0ICovXG5cdHByaXZhdGUgb25SZXNvdXJjZUNvbXBsZXRlKGU6TG9hZGVyRXZlbnQpXG5cdHtcblx0XHR2YXIgbWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoZmFsc2UsIGZhbHNlLCB0cnVlKTtcblxuXHRcdHZhciBsb2FkZXI6TG9hZGVyID0gPExvYWRlcj4gZS50YXJnZXQ7XG5cdFx0bG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoQXNzZXRFdmVudC5BU1NFVF9DT01QTEVURSwgdGhpcy5vbkFzc2V0Q29tcGxldGVEZWxlZ2F0ZSk7XG5cdFx0bG9hZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIHRoaXMub25SZXNvdXJjZUNvbXBsZXRlRGVsZWdhdGUpO1xuXHRcdFxuXHRcdC8vcmVhc3NpZ24gbWF0ZXJpYWxzXG5cdFx0dmFyIG1lc2g6TWVzaDtcblx0XHR2YXIgbmFtZTpzdHJpbmc7XG5cblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX21lc2hlcy5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdG1lc2ggPSB0aGlzLl9tZXNoZXNbaV07XG5cdFx0XHRpZiAobWVzaC5uYW1lID09IFwic3BvbnphXzA0XCIgfHwgbWVzaC5uYW1lID09IFwic3BvbnphXzM3OVwiKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dmFyIG51bTpudW1iZXIgPSBOdW1iZXIobWVzaC5uYW1lLnN1YnN0cmluZyg3KSk7XG5cblx0XHRcdG5hbWUgPSBtZXNoLm1hdGVyaWFsLm5hbWU7XG5cblx0XHRcdGlmIChuYW1lID09IFwiY29sdW1uX2NcIiAmJiAobnVtIDwgMjIgfHwgbnVtID4gMzMpKVxuXHRcdFx0XHRjb250aW51ZTtcblxuXHRcdFx0dmFyIGNvbE51bTpudW1iZXIgPSAobnVtIC0gMTI1KTtcblx0XHRcdGlmIChuYW1lID09IFwiY29sdW1uX2JcIikge1xuXHRcdFx0XHRpZiAoY29sTnVtICA+PTAgJiYgY29sTnVtIDwgMTMyICYmIChjb2xOdW0gJSAxMSkgPCAxMCkge1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5jb2xNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgY29sTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgY29sTWVzaDpNZXNoID0gbmV3IE1lc2gobmV3IEdlb21ldHJ5KCkpO1xuXHRcdFx0XHRcdGNvbE1lcmdlLmFwcGx5VG9NZXNoZXMoY29sTWVzaCwgdGhpcy5jb2xNZXNoZXMpO1xuXHRcdFx0XHRcdG1lc2ggPSBjb2xNZXNoO1xuXHRcdFx0XHRcdHRoaXMuY29sTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHZhc2VOdW06bnVtYmVyID0gKG51bSAtIDMzNCk7XG5cdFx0XHRpZiAobmFtZSA9PSBcInZhc2VfaGFuZ2luZ1wiICYmICh2YXNlTnVtICUgOSkgPCA1KSB7XG5cdFx0XHRcdGlmICh2YXNlTnVtICA+PTAgJiYgdmFzZU51bSA8IDM3MCAmJiAodmFzZU51bSAlIDkpIDwgNCkge1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMudmFzZU1lc2hlcy5wdXNoKG1lc2gpO1xuXHRcdFx0XHRcdHZhciB2YXNlTWVyZ2U6TWVyZ2UgPSBuZXcgTWVyZ2UoKTtcblx0XHRcdFx0XHR2YXIgdmFzZU1lc2g6TWVzaCA9IG5ldyBNZXNoKG5ldyBHZW9tZXRyeSgpKTtcblx0XHRcdFx0XHR2YXNlTWVyZ2UuYXBwbHlUb01lc2hlcyh2YXNlTWVzaCwgdGhpcy52YXNlTWVzaGVzKTtcblx0XHRcdFx0XHRtZXNoID0gdmFzZU1lc2g7XG5cdFx0XHRcdFx0dGhpcy52YXNlTWVzaGVzID0gbmV3IEFycmF5PE1lc2g+KCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0dmFyIHBvbGVOdW06bnVtYmVyID0gbnVtIC0gMjkwO1xuXHRcdFx0aWYgKG5hbWUgPT0gXCJmbGFncG9sZVwiKSB7XG5cdFx0XHRcdGlmIChwb2xlTnVtID49MCAmJiBwb2xlTnVtIDwgMzIwICYmIChwb2xlTnVtICUgMykgPCAyKSB7XG5cdFx0XHRcdFx0dGhpcy5wb2xlTWVzaGVzLnB1c2gobWVzaCk7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocG9sZU51bSA+PTApIHtcblx0XHRcdFx0XHR0aGlzLnBvbGVNZXNoZXMucHVzaChtZXNoKTtcblx0XHRcdFx0XHR2YXIgcG9sZU1lcmdlOk1lcmdlID0gbmV3IE1lcmdlKCk7XG5cdFx0XHRcdFx0dmFyIHBvbGVNZXNoOk1lc2ggPSBuZXcgTWVzaChuZXcgR2VvbWV0cnkoKSk7XG5cdFx0XHRcdFx0cG9sZU1lcmdlLmFwcGx5VG9NZXNoZXMocG9sZU1lc2gsIHRoaXMucG9sZU1lc2hlcyk7XG5cdFx0XHRcdFx0bWVzaCA9IHBvbGVNZXNoO1xuXHRcdFx0XHRcdHRoaXMucG9sZU1lc2hlcyA9IG5ldyBBcnJheTxNZXNoPigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdGlmIChuYW1lID09IFwiZmxhZ3BvbGVcIiAmJiAobnVtID09IDI2MCB8fCBudW0gPT0gMjYxIHx8IG51bSA9PSAyNjMgfHwgbnVtID09IDI2NSB8fCBudW0gPT0gMjY4IHx8IG51bSA9PSAyNjkgfHwgbnVtID09IDI3MSB8fCBudW0gPT0gMjczKSlcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciB0ZXh0dXJlSW5kZXg6bnVtYmVyID0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5pbmRleE9mKG5hbWUpO1xuXHRcdFx0aWYgKHRleHR1cmVJbmRleCA9PSAtMSB8fCB0ZXh0dXJlSW5kZXggPj0gdGhpcy5fbWF0ZXJpYWxOYW1lU3RyaW5ncy5sZW5ndGgpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHR0aGlzLl9udW1UZXhTdHJpbmdzW3RleHR1cmVJbmRleF0rKztcblx0XHRcdFxuXHRcdFx0dmFyIHRleHR1cmVOYW1lOnN0cmluZyA9IHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuXHRcdFx0dmFyIG5vcm1hbFRleHR1cmVOYW1lOnN0cmluZztcblx0XHRcdHZhciBzcGVjdWxhclRleHR1cmVOYW1lOnN0cmluZztcblx0XHRcdFxuLy9cdFx0XHRcdC8vc3RvcmUgc2luZ2xlIHBhc3MgbWF0ZXJpYWxzIGZvciB1c2UgbGF0ZXJcbi8vXHRcdFx0XHR2YXIgc2luZ2xlTWF0ZXJpYWw6TWV0aG9kTWF0ZXJpYWwgPSB0aGlzLl9zaW5nbGVNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV07XG4vL1xuLy9cdFx0XHRcdGlmICghc2luZ2xlTWF0ZXJpYWwpIHtcbi8vXG4vL1x0XHRcdFx0XHQvL2NyZWF0ZSBzaW5nbGVwYXNzIG1hdGVyaWFsXG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbCA9IG5ldyBNZXRob2RNYXRlcmlhbCh0aGlzLl90ZXh0dXJlRGljdGlvbmFyeVt0ZXh0dXJlTmFtZV0pO1xuLy9cbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm5hbWUgPSBuYW1lO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubGlnaHRQaWNrZXIgPSB0aGlzLl9saWdodFBpY2tlcjtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmFkZE1ldGhvZCh0aGlzLl9mb2dNZXRob2QpO1xuLy9cdFx0XHRcdFx0c2luZ2xlTWF0ZXJpYWwubWlwbWFwID0gdHJ1ZTtcbi8vXHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnJlcGVhdCA9IHRydWU7XG4vL1x0XHRcdFx0XHRzaW5nbGVNYXRlcmlhbC5zcGVjdWxhciA9IDI7XG4vL1xuLy9cdFx0XHRcdFx0Ly91c2UgYWxwaGEgdHJhbnNwYXJhbmN5IGlmIHRleHR1cmUgaXMgcG5nXG4vL1x0XHRcdFx0XHRpZiAodGV4dHVyZU5hbWUuc3Vic3RyaW5nKHRleHR1cmVOYW1lLmxlbmd0aCAtIDMpID09IFwicG5nXCIpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLmFscGhhVGhyZXNob2xkID0gMC41O1xuLy9cbi8vXHRcdFx0XHRcdC8vYWRkIG5vcm1hbCBtYXAgaWYgaXQgZXhpc3RzXG4vL1x0XHRcdFx0XHRub3JtYWxUZXh0dXJlTmFtZSA9IHRoaXMuX25vcm1hbFRleHR1cmVTdHJpbmdzW3RleHR1cmVJbmRleF07XG4vL1x0XHRcdFx0XHRpZiAobm9ybWFsVGV4dHVyZU5hbWUpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLm5vcm1hbE1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W25vcm1hbFRleHR1cmVOYW1lXTtcbi8vXG4vL1x0XHRcdFx0XHQvL2FkZCBzcGVjdWxhciBtYXAgaWYgaXQgZXhpc3RzXG4vL1x0XHRcdFx0XHRzcGVjdWxhclRleHR1cmVOYW1lID0gdGhpcy5fc3BlY3VsYXJUZXh0dXJlU3RyaW5nc1t0ZXh0dXJlSW5kZXhdO1xuLy9cdFx0XHRcdFx0aWYgKHNwZWN1bGFyVGV4dHVyZU5hbWUpXG4vL1x0XHRcdFx0XHRcdHNpbmdsZU1hdGVyaWFsLnNwZWN1bGFyTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbc3BlY3VsYXJUZXh0dXJlTmFtZV07XG4vL1xuLy9cdFx0XHRcdFx0dGhpcy5fc2luZ2xlTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdID0gc2luZ2xlTWF0ZXJpYWw7XG4vL1xuLy9cdFx0XHRcdH1cblxuXHRcdFx0Ly9zdG9yZSBtdWx0aSBwYXNzIG1hdGVyaWFscyBmb3IgdXNlIGxhdGVyXG5cdFx0XHR2YXIgbXVsdGlNYXRlcmlhbDpNZXRob2RNYXRlcmlhbCA9IHRoaXMuX211bHRpTWF0ZXJpYWxEaWN0aW9uYXJ5W25hbWVdO1xuXG5cdFx0XHRpZiAoIW11bHRpTWF0ZXJpYWwpIHtcblx0XHRcdFx0XG5cdFx0XHRcdC8vY3JlYXRlIG11bHRpcGFzcyBtYXRlcmlhbFxuXHRcdFx0XHRtdWx0aU1hdGVyaWFsID0gbmV3IE1ldGhvZE1hdGVyaWFsKHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3RleHR1cmVOYW1lXSk7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwubW9kZSA9IE1ldGhvZE1hdGVyaWFsTW9kZS5NVUxUSV9QQVNTO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLm5hbWUgPSBuYW1lO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLmxpZ2h0UGlja2VyID0gdGhpcy5fbGlnaHRQaWNrZXI7XG4vL1x0XHRcdFx0XHRtdWx0aU1hdGVyaWFsLnNoYWRvd01ldGhvZCA9IHRoaXMuX2Nhc2NhZGVNZXRob2Q7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwuc2hhZG93TWV0aG9kID0gdGhpcy5fYmFzZVNoYWRvd01ldGhvZDtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5hZGRFZmZlY3RNZXRob2QodGhpcy5fZm9nTWV0aG9kKTtcblx0XHRcdFx0bXVsdGlNYXRlcmlhbC5yZXBlYXQgPSB0cnVlO1xuXHRcdFx0XHRtdWx0aU1hdGVyaWFsLm1pcG1hcCA9IHRydWU7XG5cdFx0XHRcdG11bHRpTWF0ZXJpYWwuc3BlY3VsYXIgPSAyO1xuXHRcdFx0XHRcblx0XHRcdFx0XG5cdFx0XHRcdC8vdXNlIGFscGhhIHRyYW5zcGFyYW5jeSBpZiB0ZXh0dXJlIGlzIHBuZ1xuXHRcdFx0XHRpZiAodGV4dHVyZU5hbWUuc3Vic3RyaW5nKHRleHR1cmVOYW1lLmxlbmd0aCAtIDMpID09IFwicG5nXCIpXG5cdFx0XHRcdFx0bXVsdGlNYXRlcmlhbC5hbHBoYVRocmVzaG9sZCA9IDAuNTtcblx0XHRcdFx0XG5cdFx0XHRcdC8vYWRkIG5vcm1hbCBtYXAgaWYgaXQgZXhpc3RzXG5cdFx0XHRcdG5vcm1hbFRleHR1cmVOYW1lID0gdGhpcy5fbm9ybWFsVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcblx0XHRcdFx0aWYgKG5vcm1hbFRleHR1cmVOYW1lKVxuXHRcdFx0XHRcdG11bHRpTWF0ZXJpYWwubm9ybWFsTWFwID0gdGhpcy5fdGV4dHVyZURpY3Rpb25hcnlbbm9ybWFsVGV4dHVyZU5hbWVdO1xuXG5cdFx0XHRcdC8vYWRkIHNwZWN1bGFyIG1hcCBpZiBpdCBleGlzdHNcblx0XHRcdFx0c3BlY3VsYXJUZXh0dXJlTmFtZSA9IHRoaXMuX3NwZWN1bGFyVGV4dHVyZVN0cmluZ3NbdGV4dHVyZUluZGV4XTtcblx0XHRcdFx0aWYgKHNwZWN1bGFyVGV4dHVyZU5hbWUpXG5cdFx0XHRcdFx0bXVsdGlNYXRlcmlhbC5zcGVjdWxhck1hcCA9IHRoaXMuX3RleHR1cmVEaWN0aW9uYXJ5W3NwZWN1bGFyVGV4dHVyZU5hbWVdO1xuXG5cdFx0XHRcdC8vYWRkIHRvIG1hdGVyaWFsIGRpY3Rpb25hcnlcblx0XHRcdFx0dGhpcy5fbXVsdGlNYXRlcmlhbERpY3Rpb25hcnlbbmFtZV0gPSBtdWx0aU1hdGVyaWFsO1xuXHRcdFx0fVxuXHRcdFx0Lypcblx0XHRcdGlmIChfbWVzaFJlZmVyZW5jZVt0ZXh0dXJlSW5kZXhdKSB7XG5cdFx0XHRcdHZhciBtOk1lc2ggPSBtZXNoLmNsb25lKCkgYXMgTWVzaDtcblx0XHRcdFx0bS5tYXRlcmlhbCA9IG11bHRpTWF0ZXJpYWw7XG5cdFx0XHRcdF92aWV3LnNjZW5lLmFkZENoaWxkKG0pO1xuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdCovXG5cdFx0XHQvL2RlZmF1bHQgdG8gbXVsdGlwYXNzIG1hdGVyaWFsXG5cdFx0XHRtZXNoLm1hdGVyaWFsID0gbXVsdGlNYXRlcmlhbDtcblxuXHRcdFx0dGhpcy5fdmlldy5zY2VuZS5hZGRDaGlsZChtZXNoKTtcblxuXHRcdFx0dGhpcy5fbWVzaFJlZmVyZW5jZVt0ZXh0dXJlSW5kZXhdID0gbWVzaDtcblx0XHR9XG5cdFx0XG5cdFx0dmFyIHo6bnVtYmVyIC8qdWludCovID0gMDtcblx0XHRcblx0XHR3aGlsZSAoeiA8IHRoaXMuX251bVRleFN0cmluZ3MubGVuZ3RoKVxuXHRcdHtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMuX2RpZmZ1c2VUZXh0dXJlU3RyaW5nc1t6XSwgdGhpcy5fbnVtVGV4U3RyaW5nc1t6XSk7XG5cdFx0XHR6Kys7XG5cdFx0fVxuXG5cdFx0Ly9sb2FkIHNreWJveCBhbmQgZmxhbWUgdGV4dHVyZVxuXG5cdFx0QXNzZXRMaWJyYXJ5LmFkZEV2ZW50TGlzdGVuZXIoTG9hZGVyRXZlbnQuUkVTT1VSQ0VfQ09NUExFVEUsIChldmVudDpMb2FkZXJFdmVudCkgPT4gdGhpcy5vbkV4dHJhUmVzb3VyY2VDb21wbGV0ZShldmVudCkpO1xuXG5cdFx0Ly9zZXR1cCB0aGUgdXJsIG1hcCBmb3IgdGV4dHVyZXMgaW4gdGhlIGN1YmVtYXAgZmlsZVxuXHRcdHZhciBhc3NldExvYWRlckNvbnRleHQ6QXNzZXRMb2FkZXJDb250ZXh0ID0gbmV3IEFzc2V0TG9hZGVyQ29udGV4dCgpO1xuXHRcdGFzc2V0TG9hZGVyQ29udGV4dC5kZXBlbmRlbmN5QmFzZVVybCA9IFwiYXNzZXRzL3NreWJveC9cIjtcblxuXHRcdC8vZW52aXJvbm1lbnQgdGV4dHVyZVxuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL3NreWJveC9ob3VyZ2xhc3NfdGV4dHVyZS5jdWJlXCIpLCBhc3NldExvYWRlckNvbnRleHQpO1xuXG5cdFx0Ly9nbG9iZSB0ZXh0dXJlc1xuXHRcdEFzc2V0TGlicmFyeS5sb2FkKG5ldyBVUkxSZXF1ZXN0KFwiYXNzZXRzL2ZpcmUucG5nXCIpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgb25jZSBleHRyYSByZXNvdXJjZXMgYXJlIGxvYWRlZFxuXHQgKi9cblx0cHJpdmF0ZSBvbkV4dHJhUmVzb3VyY2VDb21wbGV0ZShldmVudDpMb2FkZXJFdmVudClcblx0e1xuXHRcdHN3aXRjaCggZXZlbnQudXJsIClcblx0XHR7XG5cdFx0XHRjYXNlICdhc3NldHMvc2t5Ym94L2hvdXJnbGFzc190ZXh0dXJlLmN1YmUnOlxuXHRcdFx0XHQvL2NyZWF0ZSBza3lib3ggdGV4dHVyZSBtYXBcblx0XHRcdFx0dGhpcy5fc2t5TWFwID0gPEltYWdlQ3ViZVRleHR1cmU+IGV2ZW50LmFzc2V0c1sgMCBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJhc3NldHMvZmlyZS5wbmdcIiA6XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwgPSBuZXcgTWV0aG9kTWF0ZXJpYWwoPEltYWdlVGV4dHVyZT4gZXZlbnQuYXNzZXRzWyAwIF0pO1xuXHRcdFx0XHR0aGlzLl9mbGFtZU1hdGVyaWFsLmJsZW5kTW9kZSA9IEJsZW5kTW9kZS5BREQ7XG5cdFx0XHRcdHRoaXMuX2ZsYW1lTWF0ZXJpYWwuYW5pbWF0ZVVWcyA9IHRydWU7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLl9za3lNYXAgJiYgdGhpcy5fZmxhbWVNYXRlcmlhbClcblx0XHRcdHRoaXMuaW5pdE9iamVjdHMoKTtcblx0fVxuXG5cblx0LyoqXG5cdCAqIE5hdmlnYXRpb24gYW5kIHJlbmRlciBsb29wXG5cdCAqL1xuXHRwcml2YXRlIG9uRW50ZXJGcmFtZShkdDpudW1iZXIpXG5cdHtcdFxuXHRcdGlmICh0aGlzLl93YWxrU3BlZWQgfHwgdGhpcy5fd2Fsa0FjY2VsZXJhdGlvbikge1xuXHRcdFx0dGhpcy5fd2Fsa1NwZWVkID0gKHRoaXMuX3dhbGtTcGVlZCArIHRoaXMuX3dhbGtBY2NlbGVyYXRpb24pKnRoaXMuX2RyYWc7XG5cdFx0XHRpZiAoTWF0aC5hYnModGhpcy5fd2Fsa1NwZWVkKSA8IDAuMDEpXG5cdFx0XHRcdHRoaXMuX3dhbGtTcGVlZCA9IDA7XG5cdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmluY3JlbWVudFdhbGsodGhpcy5fd2Fsa1NwZWVkKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKHRoaXMuX3N0cmFmZVNwZWVkIHx8IHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbikge1xuXHRcdFx0dGhpcy5fc3RyYWZlU3BlZWQgPSAodGhpcy5fc3RyYWZlU3BlZWQgKyB0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24pKnRoaXMuX2RyYWc7XG5cdFx0XHRpZiAoTWF0aC5hYnModGhpcy5fc3RyYWZlU3BlZWQpIDwgMC4wMSlcblx0XHRcdFx0dGhpcy5fc3RyYWZlU3BlZWQgPSAwO1xuXHRcdFx0dGhpcy5fY2FtZXJhQ29udHJvbGxlci5pbmNyZW1lbnRTdHJhZmUodGhpcy5fc3RyYWZlU3BlZWQpO1xuXHRcdH1cblx0XHRcblx0XHQvL2FuaW1hdGUgZmxhbWVzXG5cdFx0dmFyIGZsYW1lVk86RmxhbWVWTztcblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX2ZsYW1lRGF0YS5sZW5ndGg7XG5cdFx0Zm9yICh2YXIgaTpudW1iZXIgPSAwOyBpIDwgbGVuOyBpKyspIHtcblx0XHRcdGZsYW1lVk8gPSB0aGlzLl9mbGFtZURhdGFbaV07XG5cdFx0XHQvL3VwZGF0ZSBmbGFtZSBsaWdodFxuXHRcdFx0dmFyIGxpZ2h0IDogUG9pbnRMaWdodCA9IGZsYW1lVk8ubGlnaHQ7XG5cdFx0XHRcblx0XHRcdGlmICghbGlnaHQpXG5cdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XG5cdFx0XHRsaWdodC5mYWxsT2ZmID0gMzgwK01hdGgucmFuZG9tKCkqMjA7XG5cdFx0XHRsaWdodC5yYWRpdXMgPSAyMDArTWF0aC5yYW5kb20oKSozMDtcblx0XHRcdGxpZ2h0LmRpZmZ1c2UgPSAuOStNYXRoLnJhbmRvbSgpKi4xO1xuXHRcdFx0XG5cdFx0XHQvL3VwZGF0ZSBmbGFtZSBtZXNoXG5cdFx0XHR2YXIgbWVzaCA6IE1lc2ggPSBmbGFtZVZPLm1lc2g7XG5cdFx0XHRcblx0XHRcdGlmICghbWVzaClcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcblx0XHRcdHZhciBzdWJNZXNoOklTdWJNZXNoID0gbWVzaC5zdWJNZXNoZXNbMF07XG5cdFx0XHRzdWJNZXNoLnV2VHJhbnNmb3JtLm9mZnNldFUgKz0gMS8xNjtcblx0XHRcdHN1Yk1lc2gudXZUcmFuc2Zvcm0ub2Zmc2V0VSAlPSAxO1xuXHRcdFx0bWVzaC5yb3RhdGlvblkgPSBNYXRoLmF0YW4yKG1lc2gueCAtIHRoaXMuX3ZpZXcuY2FtZXJhLngsIG1lc2gueiAtIHRoaXMuX3ZpZXcuY2FtZXJhLnopKjE4MC9NYXRoLlBJO1xuXHRcdH1cblxuXHRcdHRoaXMuX3ZpZXcucmVuZGVyKCk7XG5cdFx0XG5cdH1cblx0XG5cdFx0XHRcblx0LyoqXG5cdCAqIEtleSBkb3duIGxpc3RlbmVyIGZvciBjYW1lcmEgY29udHJvbFxuXHQgKi9cblx0cHJpdmF0ZSBvbktleURvd24oZXZlbnQ6S2V5Ym9hcmRFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IHRoaXMuX3dhbGtJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5ET1dOOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5TOlxuXHRcdFx0XHR0aGlzLl93YWxrQWNjZWxlcmF0aW9uID0gLXRoaXMuX3dhbGtJbmNyZW1lbnQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0XHR0aGlzLl9zdHJhZmVBY2NlbGVyYXRpb24gPSAtdGhpcy5fc3RyYWZlSW5jcmVtZW50O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUklHSFQ6XG5cdFx0XHRjYXNlIEtleWJvYXJkLkQ6XG5cdFx0XHRcdHRoaXMuX3N0cmFmZUFjY2VsZXJhdGlvbiA9IHRoaXMuX3N0cmFmZUluY3JlbWVudDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIEtleWJvYXJkLkY6XG5cdFx0XHRcdC8vc3RhZ2UuZGlzcGxheVN0YXRlID0gU3RhZ2VEaXNwbGF5U3RhdGUuRlVMTF9TQ1JFRU47XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5DOlxuXHRcdFx0XHR0aGlzLl9jYW1lcmFDb250cm9sbGVyLmZseSA9ICF0aGlzLl9jYW1lcmFDb250cm9sbGVyLmZseTtcblx0XHR9XG5cdH1cblx0XG5cdC8qKlxuXHQgKiBLZXkgdXAgbGlzdGVuZXIgZm9yIGNhbWVyYSBjb250cm9sXG5cdCAqL1xuXHRwcml2YXRlIG9uS2V5VXAoZXZlbnQ6S2V5Ym9hcmRFdmVudClcblx0e1xuXHRcdHN3aXRjaCAoZXZlbnQua2V5Q29kZSkge1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5VUDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuVzpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRE9XTjpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuUzpcblx0XHRcdFx0dGhpcy5fd2Fsa0FjY2VsZXJhdGlvbiA9IDA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBLZXlib2FyZC5MRUZUOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5BOlxuXHRcdFx0Y2FzZSBLZXlib2FyZC5SSUdIVDpcblx0XHRcdGNhc2UgS2V5Ym9hcmQuRDpcblx0XHRcdFx0dGhpcy5fc3RyYWZlQWNjZWxlcmF0aW9uID0gMDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1vdXNlIGRvd24gbGlzdGVuZXIgZm9yIG5hdmlnYXRpb25cblx0ICovXG5cdHByaXZhdGUgb25Nb3VzZURvd24oZXZlbnQpXG5cdHtcblx0XHR0aGlzLl9sYXN0UGFuQW5nbGUgPSB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnBhbkFuZ2xlO1xuXHRcdHRoaXMuX2xhc3RUaWx0QW5nbGUgPSB0aGlzLl9jYW1lcmFDb250cm9sbGVyLnRpbHRBbmdsZTtcblx0XHR0aGlzLl9sYXN0TW91c2VYID0gZXZlbnQuY2xpZW50WDtcblx0XHR0aGlzLl9sYXN0TW91c2VZID0gZXZlbnQuY2xpZW50WTtcblx0XHR0aGlzLl9tb3ZlID0gdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBNb3VzZSB1cCBsaXN0ZW5lciBmb3IgbmF2aWdhdGlvblxuXHQgKi9cblx0cHJpdmF0ZSBvbk1vdXNlVXAoZXZlbnQpXG5cdHtcblx0XHR0aGlzLl9tb3ZlID0gZmFsc2U7XG5cdH1cblxuXHRwcml2YXRlIG9uTW91c2VNb3ZlKGV2ZW50KVxuXHR7XG5cdFx0aWYgKHRoaXMuX21vdmUpIHtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIucGFuQW5nbGUgPSAwLjMqKGV2ZW50LmNsaWVudFggLSB0aGlzLl9sYXN0TW91c2VYKSArIHRoaXMuX2xhc3RQYW5BbmdsZTtcblx0XHRcdHRoaXMuX2NhbWVyYUNvbnRyb2xsZXIudGlsdEFuZ2xlID0gMC4zKihldmVudC5jbGllbnRZIC0gdGhpcy5fbGFzdE1vdXNlWSkgKyB0aGlzLl9sYXN0VGlsdEFuZ2xlO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBzdGFnZSBsaXN0ZW5lciBmb3IgcmVzaXplIGV2ZW50c1xuXHQgKi9cblx0cHJpdmF0ZSBvblJlc2l6ZShldmVudCA9IG51bGwpXG5cdHtcblx0XHR0aGlzLl92aWV3LnkgICAgICAgICA9IDA7XG5cdFx0dGhpcy5fdmlldy54ICAgICAgICAgPSAwO1xuXHRcdHRoaXMuX3ZpZXcud2lkdGggICAgID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5fdmlldy5oZWlnaHQgICAgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cdH1cbn1cblxuLyoqXG4qIERhdGEgY2xhc3MgZm9yIHRoZSBGbGFtZSBvYmplY3RzXG4qL1xuY2xhc3MgRmxhbWVWT1xue1xuXHRwdWJsaWMgcG9zaXRpb246VmVjdG9yM0Q7XG5cdHB1YmxpYyBjb2xvcjpudW1iZXIgLyp1aW50Ki87XG5cdHB1YmxpYyBtZXNoOk1lc2g7XG5cdHB1YmxpYyBsaWdodDpQb2ludExpZ2h0O1xuXG5cdGNvbnN0cnVjdG9yKHBvc2l0aW9uOlZlY3RvcjNELCBjb2xvcjpudW1iZXIgLyp1aW50Ki8pXG5cdHtcblx0XHR0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG5cdFx0dGhpcy5jb2xvciA9IGNvbG9yO1xuXHR9XG59XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbiAoKVxue1xuXHRuZXcgQWR2YW5jZWRfTXVsdGlQYXNzU3BvbnphRGVtbygpO1xufSJdfQ==