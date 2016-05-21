/*

 AWD3 file loading example in

 Demonstrates:

 How to use the Loader object to load an embedded internal awd model.

 Code by Rob Bateman
 rob@infiniteturtles.co.uk
 http://www.infiniteturtles.co.uk

 This code is distributed under the MIT License

 Copyright (c) The Away Foundation http://www.theawayfoundation.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the �Software�), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED �AS IS�, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 */

import {AssetEvent}							from "awayjs-core/lib/events/AssetEvent";
import {URLRequest}							from "awayjs-core/lib/net/URLRequest";
import {LoaderEvent}							from "awayjs-core/lib/events/LoaderEvent";
import {ParserEvent}							from "awayjs-core/lib/events/ParserEvent";
import {OrthographicProjection}				from "awayjs-core/lib/projections/OrthographicProjection";
import {RequestAnimationFrame}				from "awayjs-core/lib/utils/RequestAnimationFrame";

import {View}									from "awayjs-display/lib/View";
import {Sprite}								from "awayjs-display/lib/display/Sprite";
import {Billboard}							from "awayjs-display/lib/display/Billboard";
import {HoverController}						from "awayjs-display/lib/controllers/HoverController";
import {LoaderContainer}								from "awayjs-display/lib/display/LoaderContainer";

import {DefaultRenderer}					    from "awayjs-renderergl/lib/DefaultRenderer";


import {AWDParser}							from "awayjs-parsers/lib/AWDParser";
import {Parsers}							    from "awayjs-parsers/lib/Parsers";
import {SceneGraphPartition}					from "awayjs-display/lib/partition/SceneGraphPartition";
import {MovieClip}							from "awayjs-display/lib/display/MovieClip";

import {CoordinateSystem}						from "awayjs-core/lib/projections/CoordinateSystem";
import {PerspectiveProjection}				from "awayjs-core/lib/projections/PerspectiveProjection";
import {Camera}								from "awayjs-display/lib/display/Camera";

import {TextFieldMultiRender}							from "awayjs-display/lib/display/TextFieldMultiRender";
import {Font}						            from "awayjs-display/lib/text/Font";
import {TextFormat}						    from "awayjs-display/lib/text/TextFormat";

class TextRender_Canvas3D
{
    private _fps:number = 30;

    //engine variables
    private _view: View;
    private _renderer: DefaultRenderer;

    private _rootTimeLine: MovieClip;

    private _timer: RequestAnimationFrame;
    private _time: number = 0;

    //navigation
    private _isperspective: boolean;
    private _projection: PerspectiveProjection;
    private _hoverControl: HoverController;
    private _stage_width: number;
    private _stage_height: number;

    private counter: number;


    private _replaced_gettext:boolean;
    private _updated_property:boolean;

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
    private init(): void
    {

        this.initEngine();
        this.initObjects();
        this.initListeners();


    }


    /**
     * Initialise the engine
     */
    private initEngine(): void
    {
        //create the view
        this._renderer = new DefaultRenderer();
        this._renderer.renderableSorter = null;
        this._view = new View(this._renderer);
        this._view.backgroundColor = 0x000000;
        this._stage_width = 550;
        this._stage_height = 400;

        //for plugin preview-runtime:
/*
         this._view.backgroundColor = parseInt(document.getElementById("bgColor").innerHTML.replace("#", "0x"));
         this._stage_width = parseInt(document.getElementById("awdWidth").innerHTML);
         this._stage_height = parseInt(document.getElementById("awdHeight").innerHTML);
*/
        this._isperspective=true;
        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._projection.fieldOfView = 30;
        this._projection.originX = 0;
        this._projection.originY = 0;
        var camera:Camera = new Camera();
        camera.projection = this._projection;

        this._hoverControl = new HoverController(camera, null, 180, 0, 1000);
        this._view.camera = camera;
    }

    /**
     * Initialise the scene objects
     */
    private initObjects(): void
    {
        //kickoff asset loading
        var loader:LoaderContainer = new LoaderContainer();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, (event: AssetEvent) => this.onAssetComplete(event));
        loader.addEventListener(LoaderEvent.LOAD_COMPLETE, (event: LoaderEvent) => this.onRessourceComplete(event));
        loader.addEventListener(ParserEvent.PARSE_ERROR, (event: ParserEvent) => this.onParseError(event));
        //loader.addEventListener(IOErrorEvent.IO_ERROR, (event: ParserEvent) => this.onParseError(event));

        Parsers.enableAllBundled();
        loader.load(new URLRequest("assets/FNTfont/tstfont.fnt"));

    }

    /**
     * Initialise the listeners
     */
    private initListeners(): void
    {
        window.onresize  = (event) => this.onResize(event);
        this.onResize();

        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    }

    /**
     * loader listener for asset complete events
     */
    private onAssetComplete(event: AssetEvent): void
    {
        if(event.asset.isAsset(Font)){
            console.log("Parsed and loaded a Font");
            var this_font:Font=<Font>event.asset;
            var new_tf:TextFieldMultiRender=new TextFieldMultiRender();
            var new_format:TextFormat= new TextFormat();
            new_format.font_table = this_font.font_styles[0];
            new_format.size=24;
            new_tf.textFormat= new_format;
            new_tf.textWidth=900;
            new_tf.y=50;
            console.log("new_format.font_table "+new_format.font_table.assetType);
            var mySprite:Sprite=new Sprite();
            mySprite.partition = new SceneGraphPartition();
            this._view.scene.addChild(mySprite);
            mySprite.addChild(new_tf);
            new_tf.text="test bitmapfonts (fnt) on webgl";
        }
    }


    /**
     * loader listener for asset complete events
     */
    /*
    private onLoadError(event: IOErrorEvent):void
    {
        console.log("LoadError");
    }
    */

    /**
     * loader listener for asset complete events
     */
    private onParseError(event: ParserEvent): void {
        console.log(event.message);
    }

    /**
     * loader listener for asset complete events
     */
    private onRessourceComplete(event: LoaderEvent): void {
    }

    /**
     * Render loop
     */
    private onEnterFrame(dt: number): void
    {
        var frameMarker:number = Math.floor(1000/this._fps);

        this._time += Math.min(dt, frameMarker);

        //if (this._rootTimeLine)
        //	this._rootTimeLine.logHierarchy();
        //update camera controler
        // this._cameraController.update();


        if (this._time >= frameMarker) {
            this._time -= frameMarker;
            this._view.render();
        }
    }

    private onResize(event = null): void
    {
        this._view.y         = 0;
        this._view.x         = 0;
        this._view.width     = window.innerWidth;
        this._view.height    = window.innerHeight;
        this._projection.fieldOfView = Math.atan(this._stage_height / 2000)*360/Math.PI;
        this._projection.originX = (0.5 - 0.5*(window.innerHeight/this._stage_height)*(this._stage_width/window.innerWidth));
    }

}

window.onload = function () {
    new TextRender_Canvas3D();

};
