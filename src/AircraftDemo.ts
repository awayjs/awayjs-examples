import Geometry						= require("awayjs-core/lib/data/Geometry");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import UVTransform					= require("awayjs-core/lib/geom/UVTransform");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import AssetLoader					= require("awayjs-core/lib/library/AssetLoader");
import AssetLoaderContext			= require("awayjs-core/lib/library/AssetLoaderContext");
import AssetLoaderToken				= require("awayjs-core/lib/library/AssetLoaderToken");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import ImageCubeTexture				= require("awayjs-core/lib/textures/ImageCubeTexture");
import ImageTexture					= require("awayjs-core/lib/textures/ImageTexture");
import Debug                		= require("awayjs-core/lib/utils/Debug");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import DisplayObjectContainer		= require("awayjs-display/lib/containers/DisplayObjectContainer");
import View							= require("awayjs-display/lib/containers/View");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import DirectionalLight				= require("awayjs-display/lib/entities/DirectionalLight");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import Skybox						= require("awayjs-display/lib/entities/Skybox");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PrimitivePlanePrefab			= require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");
import EffectEnvMapMethod   		= require("awayjs-methodmaterials/lib/methods/EffectEnvMapMethod");
import NormalSimpleWaterMethod		= require("awayjs-methodmaterials/lib/methods/NormalSimpleWaterMethod");
import SpecularFresnelMethod		= require("awayjs-methodmaterials/lib/methods/SpecularFresnelMethod");

import AWDParser					= require("awayjs-parsers/lib/AWDParser");
import OBJParser					= require("awayjs-parsers/lib/OBJParser");

class AircraftDemo
{
    //{ state
    private _maxStates:number = 2;
    private _cameraIncrement:number = 0;
    private _rollIncrement:number = 0;
    private _loopIncrement:number = 0;
    private _state:number = 0;
    private _appTime:number = 0;
    //}
    
    private _lightPicker:StaticLightPicker;
    private _view:View;
    private _timer:RequestAnimationFrame;
    
    //{ sea
    private _seaGeom:PrimitivePlanePrefab;
    private _seaMesh:Mesh;
    private _seaNormalTexture:ImageTexture;
    private _seaInitialized:boolean = false;
    private _seaMaterial:MethodMaterial;
    //}
    
    //{ f14
    private _f14Geom:DisplayObjectContainer;
    private _f14Initialized:boolean = false;
    //}
    
    //{ skybox
    private _waterMethod:NormalSimpleWaterMethod;
    private _skyboxCubeTexture:ImageCubeTexture;
    private _skyboxInitialized:boolean = false;
    //}
    
    constructor()
    {
        Debug.LOG_PI_ERRORS = false;
        Debug.THROW_ERRORS = false;
        
        this.initView();
        this.initLights();
        this.initAnimation();
        this.initParsers();
        this.loadAssets();
        
        window.onresize = (event:UIEvent) => this.onResize(event);
    }
    
    private loadAssets():void
    {
        this.loadAsset('assets/sea_normals.jpg');
        this.loadAsset('assets/f14/f14d.obj');
        this.loadAsset('assets/skybox/CubeTextureTest.cube');
    }
    
    private loadAsset(path:string):void
    {
        var token:AssetLoaderToken = AssetLibrary.load(new URLRequest(path));
        token.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
    }
    
    private initParsers():void
    {
        AssetLibrary.enableParser(OBJParser);
    }
    
    private initAnimation():void
    {
        this._timer = new RequestAnimationFrame( this.render, this );
    }

    private initView():void
    {
        this._view = new View(new DefaultRenderer(MethodRendererPool));
        this._view.camera.z	= -500;
        this._view.camera.y	= 250;
        this._view.camera.rotationX	= 20;
        this._view.camera.projection.near = 0.5;
        this._view.camera.projection.far = 14000;
        this._view.backgroundColor = 0x2c2c32;

        this.onResize();
    }
    
    private initializeScene():void
    {
        if(this._skyboxCubeTexture && this._f14Geom && this._seaNormalTexture) {
            this.initF14();
            this.initSea();
            this._timer.start();
        }
    }
    
    private initLights():void
    {
        var light:DirectionalLight = new DirectionalLight();
        light.color	= 0x974523;
        light.direction	= new Vector3D(-300, -300, -5000);
        light.ambient = 1;
        light.ambientColor = 0x7196ac;
        light.diffuse = 1.2;
        light.specular = 1.1;
        this._view.scene.addChild(light);
        
        this._lightPicker = new StaticLightPicker([light]);
    }
    
    private initF14():void
    {
        this._f14Initialized = true;
        
        var f14Material: MethodMaterial = new MethodMaterial(this._seaNormalTexture, true, true, false); // will be the cubemap
        f14Material.lightPicker = this._lightPicker;
        
        this._view.scene.addChild(this._f14Geom);
        this._f14Geom.transform.scale = new Vector3D(20, 20, 20);
        this._f14Geom.rotationX = 90;
        this._f14Geom.y = 200;
        this._view.camera.lookAt(this._f14Geom.transform.position);
        
        document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
    }

    private initSea():void
    {
        this._seaMaterial = new MethodMaterial(this._seaNormalTexture, true, true, false); // will be the cubemap
        this._waterMethod = new NormalSimpleWaterMethod(this._seaNormalTexture, this._seaNormalTexture);
        var fresnelMethod:SpecularFresnelMethod  = new SpecularFresnelMethod();
        fresnelMethod.normalReflectance = .3;
        
        this._seaMaterial.alphaBlending = true;
        this._seaMaterial.lightPicker = this._lightPicker;
        this._seaMaterial.repeat = true;
        this._seaMaterial.animateUVs = true;
        this._seaMaterial.normalMethod = this._waterMethod ;
        this._seaMaterial.addEffectMethod(new EffectEnvMapMethod(this._skyboxCubeTexture));
        this._seaMaterial.specularMethod = fresnelMethod;
        this._seaMaterial.gloss = 100;
        this._seaMaterial.specular = 1;
        
        this._seaGeom = new PrimitivePlanePrefab( 50000, 50000, 1, 1, true, false );
        this._seaMesh = <Mesh> this._seaGeom.getNewObject();
        this._seaGeom.geometry.scaleUV( 100, 100 );
        this._seaMesh.subMeshes[0].uvTransform = new UVTransform();
        this._seaMesh.material = this._seaMaterial;
        this._view.scene.addChild( new Skybox(this._skyboxCubeTexture));
        this._view.scene.addChild( this._seaMesh );
    }
    
    public onResourceComplete(event:LoaderEvent)
    {
        var loader:AssetLoader = <AssetLoader> event.target;
        var numAssets:number = loader.baseDependency.assets.length;
        var i:number = 0;
        
        switch (event.url) {
            case "assets/sea_normals.jpg":
                this._seaNormalTexture = <ImageTexture> loader.baseDependency.assets[0];
                break;
            case 'assets/f14/f14d.obj':
                this._f14Geom = new DisplayObjectContainer();
                for (i = 0; i < numAssets; ++i) {
                    var asset:IAsset = loader.baseDependency.assets[i];
                    switch (asset.assetType) {
                        case Mesh.assetType:
                            var mesh:Mesh = <Mesh> asset;
                            this._f14Geom.addChild(mesh);
                            break;
                        case Geometry.assetType:
                            break;
                        case MaterialBase.assetType:
                            break;
                    }
                }
                break;
            case 'assets/skybox/CubeTextureTest.cube':
                this._skyboxCubeTexture = <ImageCubeTexture> loader.baseDependency.assets[0];
                break;
        }
        
        this.initializeScene();
    }
    
    private render(dt:number) //animate based on dt for firefox
    {
        if (this._f14Geom) {
            this._rollIncrement += 0.02;
            
            switch (this._state) {
                case 0 :
                    this._f14Geom.rotationZ = Math.sin(this._rollIncrement)*25;
                    break;
                case 1 :
                    this._loopIncrement += 0.05;
                    this._f14Geom.z += Math.cos(this._loopIncrement)*20;
                    this._f14Geom.y += Math.sin(this._loopIncrement)*20;
                    this._f14Geom.rotationX += -1*((Math.PI/180)*Math.atan2(this._f14Geom.z, this._f14Geom.y));//* 20;
                    this._f14Geom.rotationZ = Math.sin(this._rollIncrement)*25;
                    
                    if (this._loopIncrement > (Math.PI*2)) {
                        this._loopIncrement = 0;
                        this._state = 0;
                    }
                    break;
            }
        }
        
        if (this._f14Geom) {
            this._view.camera.lookAt(this._f14Geom.transform.position);
        }
        
        if (this._view.camera) {
            this._cameraIncrement += 0.01;
            this._view.camera.x = Math.cos(this._cameraIncrement)*400;
            this._view.camera.z = Math.sin(this._cameraIncrement)*400;
        }
        
        if ( this._f14Geom ) {
            this._view.camera.lookAt(this._f14Geom.transform.position);
        }
        
        if (this._seaMaterial) {
            this._seaMesh.subMeshes[0].uvTransform.offsetV -= 0.04;
            
            /*
             this.waterMethod.water1OffsetX += .001;
             this.waterMethod.water1OffsetY += .1;
             this.waterMethod.water2OffsetX += .0007;
             this.waterMethod.water2OffsetY += .6;
             //*/
        }
        
        this._appTime += dt;
        this._view.render();
    }
    
    public onResize(event:UIEvent = null)
    {
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    }
    
    private onMouseDown(event:MouseEvent)
    {
        this._state++;
        
        if (this._state >= this._maxStates)
            this._state = 0;
    }
}

window.onload = function ()
{
    new AircraftDemo();
}