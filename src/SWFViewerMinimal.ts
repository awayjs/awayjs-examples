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

import {MovieClip, MouseManager} from "@awayjs/scene";

import {SWFParser, AVM1MovieClip, LoaderInfo, AVM1SceneGraphFactory, AVM1ContextImpl, SecurityDomain, AVM1Globals, AVMAwayStage} from "@awayjs/swf-viewer"


class SWFViewerMinimal
{

	private _stage: AVMAwayStage;
	private _avm1SceneGraphFactory: AVM1SceneGraphFactory;


	/**
	 * Constructor
	 */
	constructor()
	{
		
		this._stage = new AVMAwayStage(window.innerWidth / 2, window.innerHeight / 2, 0xffffff, 24, null);
		MouseManager.getInstance(this._stage.scene.renderer.pickGroup)._stage=this._stage;
        //this._getTimeCallback=null;
        this._stage.updateSize(0, 0, 550, 450);

		// create the AVM1Context and the AVM1Scenegraphfactory
        var loaderInfo=new LoaderInfo();
        loaderInfo.swfVersion=6;
		this._avm1SceneGraphFactory = new AVM1SceneGraphFactory(new AVM1ContextImpl(loaderInfo));
		this._avm1SceneGraphFactory.avm1Context.sec = new SecurityDomain();
		this._avm1SceneGraphFactory.avm1Context.setStage(this._stage, document);
        AVM1Globals._scenegraphFactory=this._avm1SceneGraphFactory;
        
        
		AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, (event: AssetEvent) => this.onAssetComplete(event));
		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event: LoaderEvent) => this.onLoadComplete(event));
		AssetLibrary.addEventListener(URLLoaderEvent.LOAD_ERROR, (event: URLLoaderEvent) => this.onLoadError(event));
		AssetLibrary.addEventListener(ParserEvent.PARSE_ERROR, (event: ParserEvent) => this.onParseError(event));
        
        AssetLibrary.load(new URLRequest("assets/SWF/Bacon_Ipsem.swf"), null, null, new SWFParser(this._avm1SceneGraphFactory));
        var myThis=this;
        window.addEventListener("keydown", function(event){
            if(event.key=="Tab"){
                MouseManager.getInstance(myThis._stage.scene.renderer.pickGroup).focusNextTab();
            }
        })
	}


	private _onAssetCompleteDelegate: (event: AssetEvent) => void;

	private onAssetComplete(event: AssetEvent): void {
        var asset: IAsset = event.asset;
		if (asset.isAsset(MovieClip)) {
			if (asset.name == "scene") {
				this._stage.getLayer(0).addChild(<MovieClip>asset);
				(<AVM1MovieClip> (<MovieClip>asset).adapter).doInitEvents();
				//console.log("loaded root mc for lesson in awayjs", event);
			}
		}
	}


	private onLoadComplete(event: LoaderEvent): void {
		AVM1Globals.lessonStartTime=new Date().getTime();
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
	new SWFViewerMinimal();
};
