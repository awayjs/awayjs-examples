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

import BlendMode						= require("awayjs-core/lib/data/BlendMode");
import Geometry							= require("awayjs-core/lib/data/Geometry");
import Event							= require("awayjs-core/lib/events/Event");
import AssetEvent						= require("awayjs-core/lib/events/AssetEvent");
import ProgressEvent					= require("awayjs-core/lib/events/ProgressEvent");
import LoaderEvent						= require("awayjs-core/lib/events/LoaderEvent");
import UVTransform						= require("awayjs-core/lib/geom/UVTransform");
import Vector3D							= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary						= require("awayjs-core/lib/library/AssetLibrary");
import AssetLoaderContext				= require("awayjs-core/lib/library/AssetLoaderContext");
import URLLoader						= require("awayjs-core/lib/net/URLLoader");
import URLLoaderDataFormat				= require("awayjs-core/lib/net/URLLoaderDataFormat");
import URLRequest						= require("awayjs-core/lib/net/URLRequest");
import ParserUtils						= require("awayjs-core/lib/parsers/ParserUtils");
import ImageCubeTexture					= require("awayjs-core/lib/textures/ImageCubeTexture");
import ImageTexture						= require("awayjs-core/lib/textures/ImageTexture");
import SpecularBitmapTexture			= require("awayjs-core/lib/textures/SpecularBitmapTexture");
import Keyboard							= require("awayjs-core/lib/ui/Keyboard");
import RequestAnimationFrame			= require("awayjs-core/lib/utils/RequestAnimationFrame");

import Loader							= require("awayjs-display/lib/containers/Loader");
import View								= require("awayjs-display/lib/containers/View");
import FirstPersonController			= require("awayjs-display/lib/controllers/FirstPersonController");
import ISubMesh							= require("awayjs-display/lib/base/ISubMesh");
import Mesh								= require("awayjs-display/lib/entities/Mesh");
import Skybox							= require("awayjs-display/lib/entities/Skybox");
import DirectionalLight					= require("awayjs-display/lib/entities/DirectionalLight");
import PointLight						= require("awayjs-display/lib/entities/PointLight");
//	import CascadeShadowMapper				= require("awayjs-display/lib/entities/CascadeShadowMapper");
import DirectionalShadowMapper			= require("awayjs-display/lib/materials/shadowmappers/DirectionalShadowMapper");
import StaticLightPicker				= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PrimitivePlanePrefab				= require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
import Cast								= require("awayjs-display/lib/utils/Cast");

import Merge							= require("awayjs-renderergl/lib/tools/commands/Merge");
import DefaultRenderer					= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial					= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodMaterialMode				= require("awayjs-methodmaterials/lib/MethodMaterialMode");
import MethodRendererPool				= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
import ShadowCascadeMethod				= require("awayjs-methodmaterials/lib/methods/ShadowCascadeMethod");
import ShadowSoftMethod					= require("awayjs-methodmaterials/lib/methods/ShadowSoftMethod");
import EffectFogMethod					= require("awayjs-methodmaterials/lib/methods/EffectFogMethod");

import AWDParser						= require("awayjs-parsers/lib/AWDParser");

class Advanced_MultiPassSponzaDemo
{
	//root filepath for asset loading
	private _assetsRoot:string = "assets/";
	
	//default material data strings
	private _materialNameStrings:Array<string> = Array<string>("arch",            "Material__298",  "bricks",            "ceiling",            "chain",             "column_a",          "column_b",          "column_c",          "fabric_g",              "fabric_c",         "fabric_f",               "details",          "fabric_d",             "fabric_a",        "fabric_e",              "flagpole",          "floor",            "16___Default","Material__25","roof",       "leaf",           "vase",         "vase_hanging",     "Material__57",   "vase_round");
	
	//private const diffuseTextureStrings:Array<string> = Array<string>(["arch_diff.atf", "background.atf", "bricks_a_diff.atf", "ceiling_a_diff.atf", "chain_texture.png", "column_a_diff.atf", "column_b_diff.atf", "column_c_diff.atf", "curtain_blue_diff.atf", "curtain_diff.atf", "curtain_green_diff.atf", "details_diff.atf", "fabric_blue_diff.atf", "fabric_diff.atf", "fabric_green_diff.atf", "flagpole_diff.atf", "floor_a_diff.atf", "gi_flag.atf", "lion.atf", "roof_diff.atf", "thorn_diff.png", "vase_dif.atf", "vase_hanging.atf", "vase_plant.png", "vase_round.atf"]);
	//private const normalTextureStrings:Array<string> = Array<string>(["arch_ddn.atf", "background_ddn.atf", "bricks_a_ddn.atf", null,                "chain_texture_ddn.atf", "column_a_ddn.atf", "column_b_ddn.atf", "column_c_ddn.atf", null,                   null,               null,                     null,               null,                   null,              null,                    null,                null,               null,          "lion2_ddn.atf", null,       "thorn_ddn.atf", "vase_ddn.atf",  null,               null,             "vase_round_ddn.atf"]);
	//private const specularTextureStrings:Array<string> = Array<string>(["arch_spec.atf", null,            "bricks_a_spec.atf", "ceiling_a_spec.atf", null,                "column_a_spec.atf", "column_b_spec.atf", "column_c_spec.atf", "curtain_spec.atf",      "curtain_spec.atf", "curtain_spec.atf",       "details_spec.atf", "fabric_spec.atf",      "fabric_spec.atf", "fabric_spec.atf",       "flagpole_spec.atf", "floor_a_spec.atf", null,          null,       null,            "thorn_spec.atf", null,           null,               "vase_plant_spec.atf", "vase_round_spec.atf"]);
	
	private _diffuseTextureStrings:Array<string> = Array<string>("arch_diff.jpg", "background.jpg", "bricks_a_diff.jpg", "ceiling_a_diff.jpg", "chain_texture.png", "column_a_diff.jpg", "column_b_diff.jpg", "column_c_diff.jpg", "curtain_blue_diff.jpg", "curtain_diff.jpg", "curtain_green_diff.jpg", "details_diff.jpg", "fabric_blue_diff.jpg", "fabric_diff.jpg", "fabric_green_diff.jpg", "flagpole_diff.jpg", "floor_a_diff.jpg", "gi_flag.jpg", "lion.jpg", "roof_diff.jpg", "thorn_diff.png", "vase_dif.jpg", "vase_hanging.jpg", "vase_plant.png", "vase_round.jpg");
	private _normalTextureStrings:Array<string> = Array<string>("arch_ddn.jpg", "background_ddn.jpg", "bricks_a_ddn.jpg", null,                "chain_texture_ddn.jpg", "column_a_ddn.jpg", "column_b_ddn.jpg", "column_c_ddn.jpg", null,                   null,               null,                     null,               null,                   null,              null,                    null,                null,               null,          "lion2_ddn.jpg", null,       "thorn_ddn.jpg", "vase_ddn.jpg",  null,               null,             "vase_round_ddn.jpg");
	private _specularTextureStrings:Array<string> = Array<string>("arch_spec.jpg", null,            "bricks_a_spec.jpg", "ceiling_a_spec.jpg", null,                "column_a_spec.jpg", "column_b_spec.jpg", "column_c_spec.jpg", "curtain_spec.jpg",      "curtain_spec.jpg", "curtain_spec.jpg",       "details_spec.jpg", "fabric_spec.jpg",      "fabric_spec.jpg", "fabric_spec.jpg",       "flagpole_spec.jpg", "floor_a_spec.jpg", null,          null,       null,            "thorn_spec.jpg", null,           null,               "vase_plant_spec.jpg", "vase_round_spec.jpg");
	private _numTexStrings:Array<number /*uint*/> = Array<number /*uint*/>(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,  0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
	private _meshReference:Mesh[] = new Array<Mesh>(25);
	
	//flame data objects
	private _flameData:Array<FlameVO> = Array<FlameVO>(new FlameVO(new Vector3D(-625, 165, 219), 0xffaa44), new FlameVO(new Vector3D(485, 165, 219), 0xffaa44), new FlameVO(new Vector3D(-625, 165, -148), 0xffaa44), new FlameVO(new Vector3D(485, 165, -148), 0xffaa44));
	
	//material dictionaries to hold instances
	private _textureDictionary:Object = new Object();
	private _multiMaterialDictionary:Object = new Object();
	private _singleMaterialDictionary:Object = new Object();
	
	//private meshDictionary:Dictionary = new Dictionary();
	private vaseMeshes:Array<Mesh> = new Array<Mesh>();
	private poleMeshes:Array<Mesh> = new Array<Mesh>();
	private colMeshes:Array<Mesh> = new Array<Mesh>();
	
	//engien variablesf
	private _view:View;
	private _cameraController:FirstPersonController;
	
	//gui variables
	private _singlePassMaterial:boolean = false;
	private _multiPassMaterial:boolean = true;
	private _cascadeLevels:number /*uint*/ = 3;
	private _shadowOptions:string = "PCF";
	private _depthMapSize:number /*uint*/ = 2048;
	private _lightDirection:number = Math.PI/2;
	private _lightElevation:number = Math.PI/18;
	
	//light variables
	private _lightPicker:StaticLightPicker;
	private _baseShadowMethod:ShadowSoftMethod;
	private _cascadeMethod:ShadowCascadeMethod;
	private _fogMethod : EffectFogMethod;
	private _cascadeShadowMapper:DirectionalShadowMapper;
	private _directionalLight:DirectionalLight;
	private _lights:Array<any> = new Array<any>();
	
	//material variables
	private _skyMap:ImageCubeTexture;
	private _flameMaterial:MethodMaterial;
	private _numTextures:number /*uint*/ = 0;
	private _currentTexture:number /*uint*/ = 0;
	private _loadingTextureStrings:Array<string>;
	private _n:number /*uint*/ = 0;
	private _loadingText:string;
	
	//scene variables
	private _meshes:Array<Mesh> = new Array<Mesh>();
	private _flameGeometry:PrimitivePlanePrefab;
			
	//rotation variables
	private _move:boolean = false;
	private _lastPanAngle:number;
	private _lastTiltAngle:number;
	private _lastMouseX:number;
	private _lastMouseY:number;
	
	//movement variables
	private _drag:number = 0.5;
	private _walkIncrement:number = 10;
	private _strafeIncrement:number = 10;
	private _walkSpeed:number = 0;
	private _strafeSpeed:number = 0;
	private _walkAcceleration:number = 0;
	private _strafeAcceleration:number = 0;

	private _timer:RequestAnimationFrame;
	private _time:number = 0;
	private parseAWDDelegate:(event:Event) => void;
	private parseBitmapDelegate:(event:Event) => void;
	private loadProgressDelegate:(event:ProgressEvent) => void;
	private onBitmapCompleteDelegate:(event) => void;
	private onAssetCompleteDelegate:(event:AssetEvent) => void;
	private onResourceCompleteDelegate:(event:LoaderEvent) => void;

	/**
	 * Constructor
	 */
	constructor()
	{
		this.init();
	}
	
	/**
	 * Global initialise function
	 */
	private init()
	{
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
	}
	
	/**
	 * Initialise the engine
	 */
	private initEngine()
	{
		//create the view
		this._view = new View(new DefaultRenderer(MethodRendererPool));
		this._view.camera.y = 150;
		this._view.camera.z = 0;
		
		//setup controller to be used on the camera
		this._cameraController = new FirstPersonController(this._view.camera, 90, 0, -80, 80);			
	}
	
	/**
	 * Initialise the lights
	 */
	private initLights()
	{
		//create lights array
		this._lights = new Array<any>();
		
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
		var flameVO:FlameVO;
		var len:number = this._flameData.length;
		for (var i:number = 0; i < len; i++) {
			flameVO = this._flameData[i];
			var light : PointLight = flameVO.light = new PointLight();
			light.radius = 200;
			light.fallOff = 600;
			light.color = flameVO.color;
			light.y = 10;
			this._lights.push(light);
		}
		
		//create our global light picker
		this._lightPicker = new StaticLightPicker(this._lights);
		this._baseShadowMethod = new ShadowSoftMethod(this._directionalLight , 10 , 5 );
//			this._baseShadowMethod = new ShadowFilteredMethod(this._directionalLight);
		
		//create our global fog method
		this._fogMethod = new EffectFogMethod(0, 4000, 0x9090e7);
//			this._cascadeMethod = new ShadowCascadeMethod(this._baseShadowMethod);
	}
			
	/**
	 * Initialise the scene objects
	 */
	private initObjects()
	{
		//create skybox
		this._view.scene.addChild(new Skybox(this._skyMap));
		
		//create flame meshes
		this._flameGeometry = new PrimitivePlanePrefab(40, 80, 1, 1, false, true);
		var flameVO:FlameVO;
		var len:number = this._flameData.length;
		for (var i:number = 0; i < len; i++) {
			flameVO = this._flameData[i];
			var mesh:Mesh = flameVO.mesh = <Mesh> this._flameGeometry.getNewObject();
			mesh.material = this._flameMaterial;
			mesh.transform.position = flameVO.position;
			mesh.subMeshes[0].uvTransform = new UVTransform()
			mesh.subMeshes[0].uvTransform.scaleU = 1/16;
			this._view.scene.addChild(mesh);
			mesh.addChild(flameVO.light);
		}
	}
		
	/**
	 * Initialise the listeners
	 */
	private initListeners()
	{
		//add listeners
		window.onresize  = (event) => this.onResize(event);

		document.onmousedown = (event) => this.onMouseDown(event);
		document.onmouseup = (event) => this.onMouseUp(event);
		document.onmousemove = (event) => this.onMouseMove(event);
		document.onkeydown = (event) => this.onKeyDown(event);
		document.onkeyup = (event) => this.onKeyUp(event);

		this.onResize();

		this.parseAWDDelegate = (event:Event) => this.parseAWD(event);
		this.parseBitmapDelegate = (event) => this.parseBitmap(event);
		this.loadProgressDelegate = (event:ProgressEvent) => this.loadProgress(event);
		this.onBitmapCompleteDelegate = (event) => this.onBitmapComplete(event);
		this.onAssetCompleteDelegate = (event:AssetEvent) => this.onAssetComplete(event);
		this.onResourceCompleteDelegate = (event:LoaderEvent) => this.onResourceComplete(event);

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
	}
	
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
	private updateDirection()
	{
		this._directionalLight.direction = new Vector3D(
			Math.sin(this._lightElevation)*Math.cos(this._lightDirection),
			-Math.cos(this._lightElevation),
			Math.sin(this._lightElevation)*Math.sin(this._lightDirection)
		);
	}
	
	/**
	 * Count the total number of textures to be loaded
	 */
	private countNumTextures()
	{
		this._numTextures++;
		
		//skip null textures
		while (this._n++ < this._loadingTextureStrings.length - 1)
			if (this._loadingTextureStrings[this._n])
				break;
		
		//switch to next teture set
		if (this._n < this._loadingTextureStrings.length) {
			this.countNumTextures();
		} else if (this._loadingTextureStrings == this._diffuseTextureStrings) {
			this._n = 0;
			this._loadingTextureStrings = this._normalTextureStrings;
			this.countNumTextures();
		} else if (this._loadingTextureStrings == this._normalTextureStrings) {
			this._n = 0;
			this._loadingTextureStrings = this._specularTextureStrings;
			this.countNumTextures();
		}
	}
	
	/**
	 * Global binary file loader
	 */
	private load(url:string)
	{
		var loader:URLLoader = new URLLoader();
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
//				case "atf":
//					this._currentTexture++;
//					this._loadingText = "Loading Textures";
//                    loader.addEventListener(Event.COMPLETE, (event:Event) => this.onATFComplete(event));
//					url = "sponza/atf/" + url;
//                    break;
		}
		
		loader.addEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
		var urlReq:URLRequest = new URLRequest(this._assetsRoot+url);
		loader.load(urlReq);
		
	}
	
	/**
	 * Display current load
	 */
	private loadProgress(e:ProgressEvent)
	{
		//TODO work out why the casting on ProgressEvent fails for bytesLoaded and bytesTotal properties
		var P:number = Math.floor(e["bytesLoaded"] / e["bytesTotal"] * 100);
		if (P != 100) {
			console.log(this._loadingText + '\n' + ((this._loadingText == "Loading Model")? Math.floor((e["bytesLoaded"] / 1024) << 0) + 'kb | ' + Math.floor((e["bytesTotal"] / 1024) << 0) + 'kb' : this._currentTexture + ' | ' + this._numTextures));
		}
	}
	
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
	private parseBitmap(e)
	{
		var urlLoader:URLLoader = <URLLoader> e.target;
		var image:HTMLImageElement = ParserUtils.blobToImage(urlLoader.data);
		image.onload = this.onBitmapCompleteDelegate;
		urlLoader.removeEventListener(Event.COMPLETE, this.parseBitmapDelegate);
		urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
		urlLoader = null;
	}
	
	/**
	 * Listener for bitmap complete event on loader
	 */
	private onBitmapComplete(e:Event)
	{
		var image:HTMLImageElement = <HTMLImageElement> e.target;
		image.onload = null;

		//create bitmap texture in dictionary
		if (!this._textureDictionary[this._loadingTextureStrings[this._n]])
			this._textureDictionary[this._loadingTextureStrings[this._n]] = (this._loadingTextureStrings == this._specularTextureStrings)? new SpecularBitmapTexture(Cast.bitmapData(image)) : new ImageTexture(image);

		//skip null textures
		while (this._n++ < this._loadingTextureStrings.length - 1)
			if (this._loadingTextureStrings[this._n])
				break;
		
		//switch to next teture set
		if (this._n < this._loadingTextureStrings.length) {
			this.load(this._loadingTextureStrings[this._n]);
		} else if (this._loadingTextureStrings == this._diffuseTextureStrings) {
			this._n = 0;
			this._loadingTextureStrings = this._normalTextureStrings;
			this.load(this._loadingTextureStrings[this._n]);
		} else if (this._loadingTextureStrings == this._normalTextureStrings) {
			this._n = 0;
			this._loadingTextureStrings = this._specularTextureStrings;
			this.load(this._loadingTextureStrings[this._n]);
		} else {
			this.load("sponza/sponza.awd");
		}
	}
	
	/**
	 * Parses the AWD file
	 */
	private parseAWD(e)
	{
		console.log("Parsing Data");
		var urlLoader:URLLoader = <URLLoader> e.target;
		var loader:Loader = new Loader(false);

		loader.addEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
		loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, this.onResourceCompleteDelegate);
		loader.loadData(urlLoader.data, new AssetLoaderContext(false), null, new AWDParser());

		urlLoader.removeEventListener(ProgressEvent.PROGRESS, this.loadProgressDelegate);
		urlLoader.removeEventListener(Event.COMPLETE, this.parseAWDDelegate);
		urlLoader = null;
	}
	
	/**
	 * Listener for asset complete event on loader
	 */
	private onAssetComplete(event:AssetEvent)
	{
		if (event.asset.isAsset(Mesh)) {
			//store meshes
			this._meshes.push(<Mesh> event.asset);
		}
	}
	
	/**
	 * Triggered once all resources are loaded
	 */
	private onResourceComplete(e:LoaderEvent)
	{
		var merge:Merge = new Merge(false, false, true);

		var loader:Loader = <Loader> e.target;
		loader.removeEventListener(AssetEvent.ASSET_COMPLETE, this.onAssetCompleteDelegate);
		loader.removeEventListener(LoaderEvent.RESOURCE_COMPLETE, this.onResourceCompleteDelegate);
		
		//reassign materials
		var mesh:Mesh;
		var name:string;

		var len:number = this._meshes.length;
		for (var i:number = 0; i < len; i++) {
			mesh = this._meshes[i];
			if (mesh.name == "sponza_04" || mesh.name == "sponza_379")
				continue;

			var num:number = Number(mesh.name.substring(7));

			name = mesh.material.name;

			if (name == "column_c" && (num < 22 || num > 33))
				continue;

			var colNum:number = (num - 125);
			if (name == "column_b") {
				if (colNum  >=0 && colNum < 132 && (colNum % 11) < 10) {
					this.colMeshes.push(mesh);
					continue;
				} else {
					this.colMeshes.push(mesh);
					var colMerge:Merge = new Merge();
					var colMesh:Mesh = new Mesh(new Geometry());
					colMerge.applyToMeshes(colMesh, this.colMeshes);
					mesh = colMesh;
					this.colMeshes = new Array<Mesh>();
				}
			}

			var vaseNum:number = (num - 334);
			if (name == "vase_hanging" && (vaseNum % 9) < 5) {
				if (vaseNum  >=0 && vaseNum < 370 && (vaseNum % 9) < 4) {
					this.vaseMeshes.push(mesh);
					continue;
				} else {
					this.vaseMeshes.push(mesh);
					var vaseMerge:Merge = new Merge();
					var vaseMesh:Mesh = new Mesh(new Geometry());
					vaseMerge.applyToMeshes(vaseMesh, this.vaseMeshes);
					mesh = vaseMesh;
					this.vaseMeshes = new Array<Mesh>();
				}
			}

			var poleNum:number = num - 290;
			if (name == "flagpole") {
				if (poleNum >=0 && poleNum < 320 && (poleNum % 3) < 2) {
					this.poleMeshes.push(mesh);
					continue;
				} else if (poleNum >=0) {
					this.poleMeshes.push(mesh);
					var poleMerge:Merge = new Merge();
					var poleMesh:Mesh = new Mesh(new Geometry());
					poleMerge.applyToMeshes(poleMesh, this.poleMeshes);
					mesh = poleMesh;
					this.poleMeshes = new Array<Mesh>();
				}
			}
			
			if (name == "flagpole" && (num == 260 || num == 261 || num == 263 || num == 265 || num == 268 || num == 269 || num == 271 || num == 273))
				continue;
			
			var textureIndex:number = this._materialNameStrings.indexOf(name);
			if (textureIndex == -1 || textureIndex >= this._materialNameStrings.length)
				continue;

			this._numTexStrings[textureIndex]++;
			
			var textureName:string = this._diffuseTextureStrings[textureIndex];
			var normalTextureName:string;
			var specularTextureName:string;
			
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
			var multiMaterial:MethodMaterial = this._multiMaterialDictionary[name];

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
		
		var z:number /*uint*/ = 0;
		
		while (z < this._numTexStrings.length)
		{
			console.log(this._diffuseTextureStrings[z], this._numTexStrings[z]);
			z++;
		}

		//load skybox and flame texture

		AssetLibrary.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event:LoaderEvent) => this.onExtraResourceComplete(event));

		//setup the url map for textures in the cubemap file
		var assetLoaderContext:AssetLoaderContext = new AssetLoaderContext();
		assetLoaderContext.dependencyBaseUrl = "assets/skybox/";

		//environment texture
		AssetLibrary.load(new URLRequest("assets/skybox/hourglass_texture.cube"), assetLoaderContext);

		//globe textures
		AssetLibrary.load(new URLRequest("assets/fire.png"));
	}

	/**
	 * Triggered once extra resources are loaded
	 */
	private onExtraResourceComplete(event:LoaderEvent)
	{
		switch( event.url )
		{
			case 'assets/skybox/hourglass_texture.cube':
				//create skybox texture map
				this._skyMap = <ImageCubeTexture> event.assets[ 0 ];
				break;
			case "assets/fire.png" :
				this._flameMaterial = new MethodMaterial(<ImageTexture> event.assets[ 0 ]);
				this._flameMaterial.blendMode = BlendMode.ADD;
				this._flameMaterial.animateUVs = true;
				break;
		}

		if (this._skyMap && this._flameMaterial)
			this.initObjects();
	}


	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number)
	{	
		if (this._walkSpeed || this._walkAcceleration) {
			this._walkSpeed = (this._walkSpeed + this._walkAcceleration)*this._drag;
			if (Math.abs(this._walkSpeed) < 0.01)
				this._walkSpeed = 0;
			this._cameraController.incrementWalk(this._walkSpeed);
		}
		
		if (this._strafeSpeed || this._strafeAcceleration) {
			this._strafeSpeed = (this._strafeSpeed + this._strafeAcceleration)*this._drag;
			if (Math.abs(this._strafeSpeed) < 0.01)
				this._strafeSpeed = 0;
			this._cameraController.incrementStrafe(this._strafeSpeed);
		}
		
		//animate flames
		var flameVO:FlameVO;
		var len:number = this._flameData.length;
		for (var i:number = 0; i < len; i++) {
			flameVO = this._flameData[i];
			//update flame light
			var light : PointLight = flameVO.light;
			
			if (!light)
				continue;
			
			light.fallOff = 380+Math.random()*20;
			light.radius = 200+Math.random()*30;
			light.diffuse = .9+Math.random()*.1;
			
			//update flame mesh
			var mesh : Mesh = flameVO.mesh;
			
			if (!mesh)
				continue;
			
			var subMesh:ISubMesh = mesh.subMeshes[0];
			subMesh.uvTransform.offsetU += 1/16;
			subMesh.uvTransform.offsetU %= 1;
			mesh.rotationY = Math.atan2(mesh.x - this._view.camera.x, mesh.z - this._view.camera.z)*180/Math.PI;
		}

		this._view.render();
		
	}
	
			
	/**
	 * Key down listener for camera control
	 */
	private onKeyDown(event:KeyboardEvent)
	{
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
				//stage.displayState = StageDisplayState.FULL_SCREEN;
				break;
			case Keyboard.C:
				this._cameraController.fly = !this._cameraController.fly;
		}
	}
	
	/**
	 * Key up listener for camera control
	 */
	private onKeyUp(event:KeyboardEvent)
	{
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
	}

	/**
	 * Mouse down listener for navigation
	 */
	private onMouseDown(event)
	{
		this._lastPanAngle = this._cameraController.panAngle;
		this._lastTiltAngle = this._cameraController.tiltAngle;
		this._lastMouseX = event.clientX;
		this._lastMouseY = event.clientY;
		this._move = true;
	}

	/**
	 * Mouse up listener for navigation
	 */
	private onMouseUp(event)
	{
		this._move = false;
	}

	private onMouseMove(event)
	{
		if (this._move) {
			this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
			this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
		}
	}

	/**
	 * stage listener for resize events
	 */
	private onResize(event = null)
	{
		this._view.y         = 0;
		this._view.x         = 0;
		this._view.width     = window.innerWidth;
		this._view.height    = window.innerHeight;
	}
}

/**
* Data class for the Flame objects
*/
class FlameVO
{
	public position:Vector3D;
	public color:number /*uint*/;
	public mesh:Mesh;
	public light:PointLight;

	constructor(position:Vector3D, color:number /*uint*/)
	{
		this.position = position;
		this.color = color;
	}
}

window.onload = function ()
{
	new Advanced_MultiPassSponzaDemo();
}