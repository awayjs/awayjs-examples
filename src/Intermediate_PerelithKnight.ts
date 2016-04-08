/*

Vertex animation example in Away3d using the MD2 format

Demonstrates:

How to use the AssetLibrary class to load an embedded internal md2 model.
How to clone an asset from the AssetLibrary and apply different mateirals.
How to load animations into an animation set and apply to individual sprites.

Code by Rob Bateman
rob@infiniteturtles.co.uk
http://www.infiniteturtles.co.uk

Perelith Knight, by James Green (no email given)

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

import BitmapImage2D				from "awayjs-core/lib/image/BitmapImage2D";
import Sampler2D					from "awayjs-core/lib/image/Sampler2D";
import AssetEvent					from "awayjs-core/lib/events/AssetEvent";
import LoaderEvent					from "awayjs-core/lib/events/LoaderEvent";
import Vector3D						from "awayjs-core/lib/geom/Vector3D";
import AssetLibrary					from "awayjs-core/lib/library/AssetLibrary";
import IAsset   					from "awayjs-core/lib/library/IAsset";
import URLRequest					from "awayjs-core/lib/net/URLRequest";
import Keyboard 					from "awayjs-core/lib/ui/Keyboard";
import RequestAnimationFrame		from "awayjs-core/lib/utils/RequestAnimationFrame";

import View							from "awayjs-display/lib/View";
import HoverController				from "awayjs-display/lib/controllers/HoverController";
import DirectionalLight				from "awayjs-display/lib/display/DirectionalLight";
import Sprite						from "awayjs-display/lib/display/Sprite";
import ElementsType                 from "awayjs-display/lib/graphics/ElementsType";
import StaticLightPicker			from "awayjs-display/lib/materials/lightpickers/StaticLightPicker";
import PrimitivePlanePrefab			from "awayjs-display/lib/prefabs/PrimitivePlanePrefab";
import Single2DTexture				from "awayjs-display/lib/textures/Single2DTexture";

import AnimationSetBase				from "awayjs-renderergl/lib/animators/AnimationSetBase";
import VertexAnimationSet			from "awayjs-renderergl/lib/animators/VertexAnimationSet";
import VertexAnimator				from "awayjs-renderergl/lib/animators/VertexAnimator";

import DefaultRenderer				from "awayjs-renderergl/lib/DefaultRenderer";

import MethodMaterial				from "awayjs-methodmaterials/lib/MethodMaterial";
import ShadowFilteredMethod			from "awayjs-methodmaterials/lib/methods/ShadowFilteredMethod";

import MD2Parser					from "awayjs-parsers/lib/MD2Parser";

class Intermediate_PerelithKnight
{

    private _spriteInitialised:boolean = false;
    private _animationSetInitialised:boolean = false;
    private _sceneInitialised:boolean = false;

    //array of materials for random sampling
    private _pKnightTextures:Array<string> = new Array<string>("assets/pknight1.png", "assets/pknight2.png", "assets/pknight3.png", "assets/pknight4.png");
    private _pKnightMaterials:Array<MethodMaterial> = new Array<MethodMaterial>();

    //engine variables
    private _view:View;
    private _cameraController:HoverController;

    //stats
    //private _stats:AwayStats;

    //light objects
    private _light:DirectionalLight;
    private _lightPicker:StaticLightPicker;

    //material objects
    private _floorMaterial:MethodMaterial;
    private _shadowMapMethod:ShadowFilteredMethod;

    //scene objects
    private _floor:Sprite;
    private _sprite:Sprite;

    //navigation variables
    private _timer:RequestAnimationFrame;
    private _time:number = 0;
    private _move:boolean = false;
    private _lastPanAngle:number;
    private _lastTiltAngle:number;
    private _lastMouseX:number;
    private _lastMouseY:number;
    private _keyUp:boolean;
    private _keyDown:boolean;
    private _keyLeft:boolean;
    private _keyRight:boolean;
    private _lookAtPosition:Vector3D = new Vector3D();
    private _animationSet:VertexAnimationSet;

    /**
     * Constructor
     */
    constructor()
    {
        //setup the view
        this._view = new View(new DefaultRenderer());

        //setup the camera for optimal rendering
        this._view.camera.projection.far = 5000;

        //setup controller to be used on the camera
        this._cameraController = new HoverController(this._view.camera, null, 45, 20, 2000, 5);

        //setup the help text
        /*
        var text:TextField = new TextField();
        text.defaultTextFormat = new TextFormat("Verdana", 11, 0xFFFFFF);
        text.embedFonts = true;
        text.antiAliasType = AntiAliasType.ADVANCED;
        text.gridFitType = GridFitType.PIXEL;
        text.width = 240;
        text.height = 100;
        text.selectable = false;
        text.mouseEnabled = false;
        text.text = "Click and drag - rotate\n" +
            "Cursor keys / WSAD / ZSQD - move\n" +
            "Scroll wheel - zoom";

        text.filters = [new DropShadowFilter(1, 45, 0x0, 1, 0, 0)];

        addChild(text);
        */

        //setup the lights for the scene
        this._light = new DirectionalLight(-0.5, -1, -1);
        this._light.ambient = 0.4;
        this._lightPicker = new StaticLightPicker([this._light]);
        this._view.scene.addChild(this._light);

        //setup listeners on AssetLibrary
        AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));
        AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

        //load perilith knight textures
        AssetLibrary.load(new URLRequest("assets/pknight1.png"));
        AssetLibrary.load(new URLRequest("assets/pknight2.png"));
        AssetLibrary.load(new URLRequest("assets/pknight3.png"));
        AssetLibrary.load(new URLRequest("assets/pknight4.png"));

        //load floor texture
        AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));

        //load perelith knight data
        AssetLibrary.load(new URLRequest("assets/pknight.md2"), null, null, new MD2Parser());

        //create a global shadow map method
        this._shadowMapMethod = new ShadowFilteredMethod(this._light);
        this._shadowMapMethod.epsilon = 0.2;

        //setup floor material
        this._floorMaterial = new MethodMaterial();
        this._floorMaterial.lightPicker = this._lightPicker;
        this._floorMaterial.specularMethod.strength = 0;
        this._floorMaterial.ambientMethod.strength = 1;
        this._floorMaterial.shadowMethod = this._shadowMapMethod;
        this._floorMaterial.style.sampler = new Sampler2D(true);

        //setup knight materials
        for (var i:number /*uint*/  = 0; i < this._pKnightTextures.length; i++) {
            var knightMaterial:MethodMaterial = new MethodMaterial();
            //knightMaterial.normalMap = Cast.bitmapTexture(BitmapFilterEffects.normalMap(bitmapData));
            //knightMaterial.specularMap = Cast.bitmapTexture(BitmapFilterEffects.outline(bitmapData));
            knightMaterial.lightPicker = this._lightPicker;
            knightMaterial.specularMethod.gloss = 30;
            knightMaterial.specularMethod.strength = 1;
            knightMaterial.ambientMethod.strength = 1;
            knightMaterial.shadowMethod = this._shadowMapMethod;
            this._pKnightMaterials.push(knightMaterial);
        }

        //setup the floor
        this._floor = <Sprite> new PrimitivePlanePrefab(this._floorMaterial, ElementsType.TRIANGLE, 5000, 5000).getNewObject();
        this._floor.graphics.scaleUV(5, 5);

        //setup the scene
        this._view.scene.addChild(this._floor);

        //add stats panel
        //addChild(_stats = new AwayStats(_view));

        //add listeners
        window.onresize  = (event:UIEvent) => this.onResize(event);

        document.onmousedown = (event:MouseEvent) => this.onMouseDown(event);
        document.onmouseup = (event:MouseEvent) => this.onMouseUp(event);
        document.onmousemove = (event:MouseEvent) => this.onMouseMove(event);
        document.onmousewheel = (event:MouseWheelEvent) => this.onMouseWheel(event);
        document.onkeydown = (event:KeyboardEvent) => this.onKeyDown(event);
        document.onkeyup = (event:KeyboardEvent) => this.onKeyUp(event);
        this.onResize();

        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    }

    /**
     * Navigation and render loop
     */
    private onEnterFrame(dt:number):void
    {
        this._time += dt;

        if (this._keyUp)
            this._lookAtPosition.x -= 10;
        if (this._keyDown)
            this._lookAtPosition.x += 10;
        if (this._keyLeft)
            this._lookAtPosition.z -= 10;
        if (this._keyRight)
            this._lookAtPosition.z += 10;

        this._cameraController.lookAtPosition = this._lookAtPosition;

        this._view.render();
    }

    /**
     * Listener for asset complete event on loader
     */
    private onAssetComplete(event:AssetEvent):void
    {
        var asset:IAsset = event.asset;

        switch (asset.assetType)
        {
            case Sprite.assetType :
                this._sprite = <Sprite> event.asset;

                //adjust the sprite
                this._sprite.y = 120;
                this._sprite.transform.scaleTo(5, 5, 5);

                this._spriteInitialised = true;


                break;
            case AnimationSetBase.assetType :
                this._animationSet = <VertexAnimationSet> event.asset;
                this._animationSetInitialised = true;
                break;
        }

        if ( this._animationSetInitialised && this._spriteInitialised && ! this._sceneInitialised)
        {
            this._sceneInitialised = true;
            //create 20 x 20 different clones of the knight
            var numWide:number = 20;
            var numDeep:number = 20;
            var k:number /*uint*/ = 0;
            for (var i:number /*uint*/  = 0; i < numWide; i++) {
                for (var j:number /*uint*/  = 0; j < numDeep; j++) {
                    //clone sprite
                    var clone:Sprite = <Sprite> this._sprite.clone();
                    clone.x = (i-(numWide-1)/2)*5000/numWide;
                    clone.z = (j-(numDeep-1)/2)*5000/numDeep;
                    clone.castsShadows = true;
                    clone.material = this._pKnightMaterials[Math.floor(Math.random()*this._pKnightMaterials.length)];
                    this._view.scene.addChild(clone);

                    //create animator
                    var vertexAnimator:VertexAnimator = new VertexAnimator(this._animationSet);

                    //play specified state
                    vertexAnimator.play(this._animationSet.animationNames[Math.floor(Math.random()*this._animationSet.animationNames.length)], null, Math.random()*1000);
                    clone.animator = vertexAnimator;
                    k++;
                }
            }
        }

    }

    /**
     * Listener function for resource complete event on asset library
     */
    private onResourceComplete(event:LoaderEvent)
    {
        var assets:Array<IAsset> = event.assets;
        var length:number = assets.length;

        for ( var c : number = 0 ; c < length ; c ++ )
        {
            var asset:IAsset = assets[c];

            console.log(asset.name, event.url);

            switch (event.url)
            {
                //floor texture
                case "assets/floor_diffuse.jpg" :
                    this._floorMaterial.ambientMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
                    break;

                //knight textures
                case "assets/pknight1.png" :
                case "assets/pknight2.png" :
                case "assets/pknight3.png" :
                case "assets/pknight4.png" :
                    this._pKnightMaterials[this._pKnightTextures.indexOf(event.url)].ambientMethod.texture = new Single2DTexture(<BitmapImage2D> asset);
                    break;

                //knight data
                case "assets/pknight.md2" :

                    break;
            }
        }
    }

    /**
     * Key down listener for animation
     */
    private onKeyDown(event:KeyboardEvent):void
    {
        switch (event.keyCode) {
            case Keyboard.UP:
            case Keyboard.W:
            case Keyboard.Z: //fr
                this._keyUp = true;
                break;
            case Keyboard.DOWN:
            case Keyboard.S:
                this._keyDown = true;
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
            case Keyboard.Q: //fr
                this._keyLeft = true;
                break;
            case Keyboard.RIGHT:
            case Keyboard.D:
                this._keyRight = true;
                break;
        }
    }

    /**
     * Key up listener
     */
    private onKeyUp(event:KeyboardEvent):void
    {
        switch (event.keyCode) {
            case Keyboard.UP:
            case Keyboard.W:
            case Keyboard.Z: //fr
                this._keyUp = false;
                break;
            case Keyboard.DOWN:
            case Keyboard.S:
                this._keyDown = false;
                break;
            case Keyboard.LEFT:
            case Keyboard.A:
            case Keyboard.Q: //fr
                this._keyLeft = false;
                break;
            case Keyboard.RIGHT:
            case Keyboard.D:
                this._keyRight = false;
                break;
        }
    }

    /**
     * Mouse down listener for navigation
     */
    private onMouseDown(event:MouseEvent):void
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
    private onMouseUp(event:MouseEvent):void
    {
        this._move = false;
    }

    private onMouseMove(event:MouseEvent)
    {
        if (this._move) {
            this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
            this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
        }
    }

    /**
     * Mouse wheel listener for navigation
     */
    private onMouseWheel(event:MouseWheelEvent):void
    {
        this._cameraController.distance -= event.wheelDelta;

        if (this._cameraController.distance < 100)
            this._cameraController.distance = 100;
        else if (this._cameraController.distance > 2000)
            this._cameraController.distance = 2000;
    }

    /**
     * Stage listener for resize events
     */
    private onResize(event:UIEvent = null):void
    {
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    }
}

window.onload = function ()
{
    new Intermediate_PerelithKnight();
}