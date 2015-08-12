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

import AssetLibrary							= require("awayjs-core/lib/library/AssetLibrary");
import AssetEvent							= require("awayjs-core/lib/events/AssetEvent");
import URLRequest							= require("awayjs-core/lib/net/URLRequest");
import LoaderEvent							= require("awayjs-core/lib/events/LoaderEvent");
import ParserEvent							= require("awayjs-core/lib/events/ParserEvent");
import Vector3D								= require("awayjs-core/lib/geom/Vector3D");
import OrthographicOffCenterProjection		= require("awayjs-core/lib/projections/OrthographicOffCenterProjection");
import OrthographicProjection				= require("awayjs-core/lib/projections/OrthographicProjection");
import Keyboard								= require("awayjs-core/lib/ui/Keyboard");
import RequestAnimationFrame				= require("awayjs-core/lib/utils/RequestAnimationFrame");
import IOErrorEvent				= require("awayjs-core/lib/events/IOErrorEvent");

import View									= require("awayjs-display/lib/containers/View");
import Mesh									= require("awayjs-display/lib/entities/Mesh");
import Billboard							= require("awayjs-display/lib/entities/Billboard");
import Container							= require("awayjs-display/lib/containers/DisplayObjectContainer");
import HoverController						= require("awayjs-display/lib/controllers/HoverController");
import Loader								= require("awayjs-display/lib/containers/Loader");
import ColorMaterial						= require("awayjs-display/lib/materials/BasicMaterial");
import RenderableSort2D 					= require("awayjs-player/lib/renderer/RenderableSort2D");
import PrimitiveCubePrefab					= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
import DisplayObject						= require("awayjs-display/lib/base/DisplayObject");

import DefaultRenderer					    = require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial						= require("awayjs-methodmaterials/lib/MethodMaterial");

import AWDParser							= require("awayjs-parsers/lib/AWDParser");
import SceneGraphPartition							= require("awayjs-display/lib/partition/SceneGraphPartition");
import MovieClip							= require("awayjs-display/lib/entities/MovieClip");

import CoordinateSystem						= require("awayjs-core/lib/projections/CoordinateSystem");
import PerspectiveProjection				= require("awayjs-core/lib/projections/PerspectiveProjection");
import Camera								= require("awayjs-display/lib/entities/Camera");

import TextField							= require("awayjs-display/lib/entities/TextField");
import TextFormat							= require("awayjs-display/lib/text/TextFormat");

class AWD3ViewerMinimal
{
    private _fps:number = 30;

    //engine variables
    private _view: View;
    private _renderer: DefaultRenderer;

    private _rootTimeLine: MovieClip;

    private _timer: RequestAnimationFrame;
    private _time: number = 0;

    //navigation
    private _lastPanAngle: number;
    private _lastTiltAngle: number;
    private _lastMouseX: number;
    private _lastMouseY: number;
    private _move: boolean;
    private _isperspective: boolean;
    private _projection: PerspectiveProjection;
    private _ortho_projection: OrthographicProjection;
    private _hoverControl: HoverController;
    private _camera_perspective: Camera;
    private _camera_ortho: Camera;
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
        this._replaced_gettext=false
        this._updated_property=false;
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
        this._renderer.renderableSorter = null;//new RenderableSort2D();
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
        this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        //this._projection.far = 500000;
        this._hoverControl = new HoverController(this._camera_perspective, null, 180, 0, 1000);
        this._view.camera = this._camera_perspective;
    }

    /**
     * Initialise the scene objects
     */
    private initObjects(): void
    {
        //kickoff asset loading
        var loader:Loader = new Loader();
        loader.addEventListener(AssetEvent.ASSET_COMPLETE, (event: AssetEvent) => this.onAssetComplete(event));
        loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event: LoaderEvent) => this.onRessourceComplete(event));
        loader.addEventListener(ParserEvent.PARSE_ERROR, (event: ParserEvent) => this.onParseError(event));
        loader.addEventListener(IOErrorEvent.IO_ERROR, (event: ParserEvent) => this.onParseError(event));

        //for plugin preview-runtime:
        //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML), null, null, new AWDParser(this._view));

        loader.load(new URLRequest("assets/AWD3/Main.awd"), null, null, new AWDParser(this._view));

        //loader.load(new URLRequest("assets/AWD3/Icycle2_Intro_2.awd"));
        //loader.load(new URLRequest("assets/AWD3/AwayJEscher.awd"));
        //loader.load(new URLRequest("assets/AWD3/SimpleSoundTest.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_text_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/AwayJS_Ninja.awd"));
        //loader.load(new URLRequest("assets/AWD3/ComplexShape.awd"));
        //loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
        //loader.load(new URLRequest("assets/AWD3/Rectancle_blink_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow_multi.awd"));
        //loader.load(new URLRequest("assets/AWD3/ScareCrow_shape_debug.awd"));
        //loader.load(new URLRequest("assets/AWD3/simple_bitmap_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/Simple_mask_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/mask_test.awd"));
        //loader.load(new URLRequest("assets/AWD3/text_test_2.awd"));
        //loader.load(new URLRequest("assets/AWD3/intro_icycle.awd"));

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

        if(event.asset.isAsset(TextField)){
            var one_textfield:TextField=<TextField> event.asset;
            if (one_textfield.name == "language_btn_tf" || one_textfield.name == "flag") {
                console.log("NAME:", one_textfield.name)
                one_textfield.mouseEnabled = false;
                one_textfield.mouseChildren = false;
            }
            //this.loaded_display_objects.push(one_textfield);
            //console.log("orginal textfield_text = "+one_textfield.text);
            //one_textfield.text="new text";
        }
        else if(event.asset.isAsset(Mesh)) {
            var one_mesh:Mesh = <Mesh> event.asset;
            //one_mesh.debugVisible = true;
            //this.loaded_display_objects.push(one_mesh);
        }
        else if(event.asset.isAsset(Billboard)) {
            var one_billboard:Billboard = <Billboard> event.asset;
            //this.loaded_display_objects.push(one_billboard);
        }
        else if(event.asset.isAsset(MovieClip)) {
            var one_mc:MovieClip = <MovieClip> event.asset;
            if (one_mc.name == "border" || one_mc.name == "dream"
                || one_mc.name == "IAP Menu"
                || one_mc.name == "language flag"
                || one_mc.name == "shoptag_shapes"
                || one_mc.name == "shoptag_cliffedges") {
                console.log("NAME:", one_mc.name)
                one_mc.mouseEnabled = false;
                one_mc.mouseChildren = false;
            }
            this._rootTimeLine = one_mc;
        }
    }


    /**
     * loader listener for asset complete events
     */
    private onLoadError(event: IOErrorEvent):void
    {
        console.log("LoadError");
    }

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
        if (this._rootTimeLine) {
            this._rootTimeLine.partition = new SceneGraphPartition(this._rootTimeLine);
            //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
            this._view.scene.addChild(this._rootTimeLine);
            //this._rootTimeLine.x=-this._stage_width/2;
            //this._rootTimeLine.y=-this._stage_height/2;
            // autoplay like in Flash
            //this._rootTimeLine.play();
        }
    }

    private getText(input_string: string): string {
        return "test getText";
    }
    /**
     * Render loop
     */
    private onEnterFrame(dt: number): void {

        var frameMarker:number = Math.floor(1000/this._fps);

        this._time += Math.min(dt, frameMarker);

        //if (this._rootTimeLine)
        //	this._rootTimeLine.logHierarchy();
        //update camera controler
        // this._cameraController.update();

        if (this._rootTimeLine != undefined) {
            //console.log("RENDER = ");
            this._rootTimeLine.update(dt);
            if(!this._replaced_gettext) {
                // getText is defined on frame 4 of root-timeline.
                // once it has been defined by framescript, we want to replace it
                if (this._rootTimeLine.adapter.hasOwnProperty("getText")) {
                    console.log("function getText found");
                    this._rootTimeLine.adapter["getText"] = this.getText;
                    console.log("function getText replaced");
                    this._replaced_gettext=true;
                }
            }
            if(!this._updated_property) {
                // getText is defined on frame 1 of root-timeline.
                // once it has been defined by framescript, we want to control it
                if (this._rootTimeLine.adapter.hasOwnProperty("IAPAVAILABLE")) {
                    console.log("property IAPAVAILABLE found = " + this._rootTimeLine.adapter["IAPAVAILABLE"]);
                    this._rootTimeLine.adapter["IAPAVAILABLE"] = false;
                    console.log("property IAPAVAILABLE changed to = " + this._rootTimeLine.adapter["IAPAVAILABLE"]);
                    this._updated_property=true;
                }
            }
        }
        //console.log("RENDER = ");
        //update view
        if (this._time >= frameMarker) {
            this._time = 0;
            this._view.render();
        }
    }

    private onResize(event = null): void
    {
        this._view.y         = 0;
        this._view.x         = 0;
        this._view.width     = window.innerWidth;
        this._view.height    = window.innerHeight;
        this._projection.fieldOfView = Math.atan(0.464/2)*360/Math.PI;
        this._projection.originX = (0.5 - 0.5*(window.innerHeight/464)*(700/window.innerWidth));
    }

}

window.onload = function () {
    new AWD3ViewerMinimal();

};
