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

import {AssetEvent, AssetLibrary, URLLoaderEvent, IAsset, LoaderEvent, ParserEvent, URLRequest} from "@awayjs/core";

import {MovieClip, Sprite, Font, TextField, TextFormat, TextFormatAlign, TextFieldAutoSize, MouseManager} from "@awayjs/scene";

import {SWFParser} from "@awayfl/swf-loader";
import { AVM1MovieClip, LoaderInfo, AVM1SceneGraphFactory, AVM1ContextImpl, SecurityDomain, AVM1Globals, AVMAwayStage} from "@awayfl/avm1";

import { FontParser} from "@awayjs/parsers";

class BSWFViewerMinimal_text
{

	private _stage: AVMAwayStage;
	private _avm1SceneGraphFactory: AVM1SceneGraphFactory;


	/**
	 * Constructor
	 */
	constructor()
	{
		
		this._stage = new AVMAwayStage(window.innerWidth / 2, window.innerHeight / 2, 0xcccccc, 24, null);
		this._stage.scene.mouseManager._stage=this._stage;
        //this._getTimeCallback=null;
        this._stage.updateSize((window.innerWidth-550)/2, (window.innerHeight-450)/2, 550, 450);

		// create the AVM1Context and the AVM1Scenegraphfactory
        var loaderInfo=new LoaderInfo();
        loaderInfo.swfVersion=6;
		this._avm1SceneGraphFactory = new AVM1SceneGraphFactory(new AVM1ContextImpl(loaderInfo));
		this._avm1SceneGraphFactory.avm1Context.sec = new SecurityDomain();
		this._avm1SceneGraphFactory.avm1Context.setStage(this._stage, document);
        AVM1Globals._scenegraphFactory=this._avm1SceneGraphFactory;
        
        this._onAssetCompleteDelegate=(event: AssetEvent) => this.onAssetComplete(event);
		AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event: LoaderEvent) => this.onLoadComplete(event));
		AssetLibrary.addEventListener(URLLoaderEvent.LOAD_ERROR, (event: URLLoaderEvent) => this.onLoadError(event));
		AssetLibrary.addEventListener(ParserEvent.PARSE_ERROR, (event: ParserEvent) => this.onParseError(event));
        
		AssetLibrary.load(new URLRequest("assets/georgia.ttf"),null, null, new FontParser(true) );
        var myThis=this;
        window.addEventListener("keydown", function(event){
            if(event.key=="Tab"){
                myThis._stage.scene.mouseManager.focusNextTab();
            }
        })
	}


	private _onAssetCompleteDelegate: (event: AssetEvent) => void;

	private onAssetComplete2(event: AssetEvent): void {
        var asset: IAsset = event.asset;
		if (asset.isAsset(MovieClip)) {
			if (asset.name == "scene") {
				this._stage.getLayer(0).addChild(<MovieClip>asset);
                (<AVM1MovieClip> (<MovieClip>asset).adapter).initAdapter();
                (<MovieClip>asset).alpha=0.5;
				//console.log("loaded root mc for lesson in awayjs", event);
			}
        }
    }
	private onAssetComplete(event: AssetEvent): void {
        var asset: IAsset = event.asset;
        if(asset.isAsset(Font)){
            console.log("loaded a font");
            var mySprite:Sprite=new Sprite();
            var _tf=new TextField();
            var newFormat:TextFormat=new TextFormat();
            _tf.textFormat=newFormat;
            //_tf.background=true;
            //_tf.backgroundColor=0xff0000;
            _tf.border=true;
            _tf.x=25;
            _tf.y=25;
            _tf.width=440;
            _tf.height=355;

            _tf.borderColor=0xff0000;
            _tf.textFormat.font=<Font>asset;
            _tf.textFormat.color=0xff0000;
            _tf.textFormat.size=72;
            _tf.textFormat.align=TextFormatAlign.CENTER;
            _tf.autoSize=TextFieldAutoSize.NONE;
            _tf.text="AwayJS\ntext-test\nSWF VS TTF";
            mySprite.addChild(_tf);
            //mySprite.x=250;
            this._stage.getLayer(0).addChild(mySprite);
        }
	}

    private cnt:number=0;

	private onLoadComplete(event: LoaderEvent): void {
		AssetLibrary.removeEventListener(AssetEvent.ASSET_COMPLETE, this._onAssetCompleteDelegate);
		AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, (event: AssetEvent) => this.onAssetComplete2(event));
        if(this.cnt==0)
            AssetLibrary.load(new URLRequest("assets/SWF/text_test.swf"), null, null, new SWFParser(this._avm1SceneGraphFactory));
        this.cnt++;
		//AVM1Globals.lessonStartTime=new Date().getTime();
	}

	private onLoadError(event: URLLoaderEvent): void {
        console.log("Loading error", event);
	}
	private onParseError(event: ParserEvent): void {
        console.log("Parsing error", event);
	}

}

window.onload = function () {
	(<HTMLElement>document.getElementsByTagName("BODY")[0]).style.overflow="hidden";
	new BSWFViewerMinimal_text();
};
