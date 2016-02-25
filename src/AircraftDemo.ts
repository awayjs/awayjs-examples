import BitmapImage2D				= require("awayjs-core/lib/image/BitmapImage2D");
import BitmapImageCube				= require("awayjs-core/lib/image/BitmapImageCube");
import Sampler2D					= require("awayjs-core/lib/image/Sampler2D");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import Matrix				       	= require("awayjs-core/lib/geom/Matrix");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import Loader			        	= require("awayjs-core/lib/library/Loader");
import LoaderContext			    = require("awayjs-core/lib/library/LoaderContext");
import IAsset						= require("awayjs-core/lib/library/IAsset");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import Debug                		= require("awayjs-core/lib/utils/Debug");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import DisplayObjectContainer		= require("awayjs-display/lib/display/DisplayObjectContainer");
import View							= require("awayjs-display/lib/View");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import DirectionalLight				= require("awayjs-display/lib/display/DirectionalLight");
import Mesh							= require("awayjs-display/lib/display/Mesh");
import Skybox						= require("awayjs-display/lib/display/Skybox");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");
import StaticLightPicker			= require("awayjs-display/lib/materials/lightpickers/StaticLightPicker");
import PrimitivePlanePrefab			= require("awayjs-display/lib/prefabs/PrimitivePlanePrefab");
import SingleCubeTexture			= require("awayjs-display/lib/textures/SingleCubeTexture");
import Single2DTexture				= require("awayjs-display/lib/textures/Single2DTexture");
import ElementsType                 = require("awayjs-display/lib/graphics/ElementsType");
import Style                        = require("awayjs-display/lib/base/Style");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
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
    private _seaNormalImage:BitmapImage2D;
    private _seaInitialized:boolean = false;
    private _seaMaterial:MethodMaterial;
    //}
    
    //{ f14
    private _f14Geom:DisplayObjectContainer;
    private _f14Initialized:boolean = false;
    //}
    
    //{ skybox
    private _waterMethod:NormalSimpleWaterMethod;
    private _skyboxImageCube:BitmapImageCube;
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
    
    private loadAssets()
    {
        this.loadAsset('assets/sea_normals.jpg');
        this.loadAsset('assets/f14/f14d.obj');
        this.loadAsset('assets/skybox/CubeTextureTest.cube');
    }
    
    private loadAsset(path:string)
    {
        var session:Loader = AssetLibrary.getLoader();
        session.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));
        session.load(new URLRequest(path));
    }
    
    private initParsers()
    {
        AssetLibrary.enableParser(OBJParser);
    }
    
    private initAnimation()
    {
        this._timer = new RequestAnimationFrame( this.render, this );
    }

    private initView()
    {
        this._view = new View(new DefaultRenderer());
        this._view.camera.z	= -500;
        this._view.camera.y	= 250;
        this._view.camera.rotationX	= 20;
        this._view.camera.projection.near = 0.5;
        this._view.camera.projection.far = 14000;
        this._view.backgroundColor = 0x2c2c32;

        this.onResize();
    }
    
    private initializeScene()
    {
        if(this._skyboxImageCube && this._f14Geom && this._seaNormalImage) {
            this.initF14();
            this.initSea();
            this._timer.start();
        }
    }
    
    private initLights()
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
    
    private initF14()
    {
        this._f14Initialized = true;
        
        var f14Material: MethodMaterial = new MethodMaterial(this._seaNormalImage); // will be the cubemap
        f14Material.style.sampler = new Sampler2D(true, true, false);
        f14Material.lightPicker = this._lightPicker;
        
        this._view.scene.addChild(this._f14Geom);
        this._f14Geom.transform.scaleTo(20, 20, 20);
        this._f14Geom.rotationX = 90;
        this._f14Geom.y = 200;
        this._view.camera.lookAt(this._f14Geom.transform.position);
        
        document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
    }

    private initSea()
    {
        this._seaMaterial = new MethodMaterial(this._seaNormalImage); // will be the cubemap
        this._seaMaterial.style.sampler = new Sampler2D(true, true, false)
        this._waterMethod = new NormalSimpleWaterMethod(new Single2DTexture(this._seaNormalImage), new Single2DTexture(this._seaNormalImage));
        var fresnelMethod:SpecularFresnelMethod  = new SpecularFresnelMethod();
        fresnelMethod.normalReflectance = .3;
        fresnelMethod.gloss = 10;
        fresnelMethod.strength = 1;
        
        this._seaMaterial.alphaBlending = true;
        this._seaMaterial.lightPicker = this._lightPicker;
        this._seaMaterial.style.sampler = new Sampler2D(true);
        this._seaMaterial.animateUVs = true;
        this._seaMaterial.normalMethod = this._waterMethod ;
        this._seaMaterial.addEffectMethod(new EffectEnvMapMethod(new SingleCubeTexture(this._skyboxImageCube)));
        this._seaMaterial.specularMethod = fresnelMethod;
        
        this._seaGeom = new PrimitivePlanePrefab(this._seaMaterial, ElementsType.TRIANGLE, 50000, 50000, 1, 1, true, false );
        this._seaMesh = <Mesh> this._seaGeom.getNewObject();
        this._seaMesh.graphics.scaleUV( 100, 100 );
        this._seaMesh.style = new Style();
        this._seaMesh.style.uvMatrix = new Matrix();
        this._view.scene.addChild( new Skybox(this._skyboxImageCube));
        this._view.scene.addChild( this._seaMesh );
    }
    
    public onResourceComplete(event:LoaderEvent)
    {
        var loader:Loader = event.target;
        var numAssets:number = loader.baseDependency.assets.length;
        var i:number = 0;
        
        switch (event.url) {
            case "assets/sea_normals.jpg":
                this._seaNormalImage = <BitmapImage2D> loader.baseDependency.assets[0];
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
                    }
                }
                break;
            case 'assets/skybox/CubeTextureTest.cube':
                this._skyboxImageCube = <BitmapImageCube> loader.baseDependency.assets[0];
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
            this._seaMesh.style.uvMatrix.ty -= 0.04;
            
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