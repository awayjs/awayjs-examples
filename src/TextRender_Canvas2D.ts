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

import {View, DefaultRenderer}		        					from "awayjs-full";
import {HoverController}										from "awayjs-full/lib/controllers";
import {LoaderContainer, TextFieldMultiRender}                  from "awayjs-full/lib/display";
import {AssetEvent, LoaderEvent, ParserEvent}					from "awayjs-full/lib/events";
import {URLRequest}					                            from "awayjs-full/lib/net";
import {Parsers}												from "awayjs-full/lib/parsers";
import {Font, TextFormat, BitmapFontTable}						from "awayjs-full/lib/text";
import {RequestAnimationFrame}		                            from "awayjs-full/lib/utils";

class TextRender_Canvas2D
{
    private _fps:number = 30;

    private _timer: RequestAnimationFrame;
    private _time: number = 0;

    private _stage_width: number;
    private _stage_height: number;

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
    private initEngine(): void {
        this._stage_width = 550;
        this._stage_height = 400;
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
        loader.load(new URLRequest("assets/FNTFont/tstfont.fnt"));

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
            new_format.size=36;
            new_tf.textFormat= new_format;
            new_tf.textWidth=900;
            new_tf.y=50;
            new_tf.text="test bitmapfonts (fnt) on Canvas2D";
            new_tf.reConstruct(true);
            //ctx.font = "30px Arial";
            //ctx.fillText("Hello World",10,50);
            console.log("new_format.font_table "+new_format.font_table.assetType);
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
            //this._view.render();
        }
    }

    private onResize(event = null): void
    {
    }

}

window.onload = function () {
    new TextRender_Canvas2D();

};
