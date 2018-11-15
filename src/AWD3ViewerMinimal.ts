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

import {AssetEvent, LoaderEvent, ParserEvent, URLRequest, RequestAnimationFrame, CoordinateSystem, PerspectiveProjection} from "awayjs-full/lib/core";
import {Graphics, Shape} from "awayjs-full/lib/graphics";
import {HoverController, TextField, Sprite, Billboard, Camera, LoaderContainer, MovieClip, Scene} from "awayjs-full/lib/scene";
import {MethodMaterial}	from "awayjs-full/lib/materials";
import {AWDParser} from "awayjs-full/lib/parsers";
import {DefaultRenderer, SceneGraphPartition} from  "awayjs-full/lib/renderer";
import {View} from "awayjs-full/lib/view";
import {AS2SceneGraphFactory} from "awayjs-full/lib/player";
import { IShape } from "../../@awayjs/graphics/dist/lib/renderables/IShape";

class AWD3ViewerMinimal
{
	private _fps:number = 30;
	private _view: View;
	private _scene:Scene;
	private _renderer: DefaultRenderer;
	private _rootTimeLine: MovieClip;
	private _timer: RequestAnimationFrame;
	private _time: number = 0;
	private _projection: PerspectiveProjection;
	private _hoverControl: HoverController;
	private _stage_width: number;
	private _stage_height: number;
	private _material:MethodMaterial;
	private _shapes:Array<IShape> = new Array<IShape>();

	private counter: number;


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
		this._scene = new Scene();
		this._renderer = new DefaultRenderer(new SceneGraphPartition(this._scene));
		this._renderer.renderableSorter = null;//new RenderableSort2D();
		this._scene.partition = this._renderer.partition;
		//this._renderer.viewport.preserveFocalLength = true;
		//this._renderer.viewport.focalLength = 1000;
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
		this._projection = new PerspectiveProjection();
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.originX = -1;
		this._projection.originY = 1;
		this._projection.fieldOfView = Math.atan(this._stage_height/1000/2)*360/Math.PI;

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

		//for plugin preview-runtime:
		//loader.load(new URLRequest(document.getElementById("awdPath").innerHTML), null, null, new AWDParser(this._view));

		loader.load(new URLRequest("assets/AWD3/MagnifyGlass.awd"), null, null, new AWDParser(new AS2SceneGraphFactory(this._view)));
		//loader.load(new URLRequest("assets/AWD3/TextConstructionTest.awd"), null, null, new AWDParser(this._view));
		//loader.load(new URLRequest("assets/AWD3/scarecrow_zoom_demo.awd"), null, null, new AWDParser(this._view));
		//loader.load(new URLRequest("assets/AWD3/BigBenClock.awd"));
		this._material = new MethodMaterial(0x000001);
		this._material.style.color = 0x000001;
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
		console.log("graphic: " + event.asset.assetType)
		if(event.asset.isAsset(Graphics)){
			var one_graphics:Graphics = <Graphics> event.asset;
			for (var i:number = 0; i < one_graphics.count; i++) {
				this._shapes.push(one_graphics.getShapeAt(i));
			}
		}else if(event.asset.isAsset(TextField)){
			var one_textfield:TextField=<TextField> event.asset;
			//this.loaded_display_objects.push(one_textfield);
			//console.log("orginal textfield_text = "+one_textfield.text);
			//one_textfield.text="new text";
		}
		else if(event.asset.isAsset(Sprite)) {
			var one_sprite:Sprite = <Sprite> event.asset;
			//one_sprite.debugVisible = true;
			//one_sprite.material = new BasicMaterial(0xFF0000);
			//one_sprite.material.alphaBlending = false;
			//this._view.scene.addChild(one_sprite);
			//this.loaded_display_objects.push(one_sprite);
		}
		else if(event.asset.isAsset(Billboard)) {
			var one_billboard:Billboard = <Billboard> event.asset;
			//this.loaded_display_objects.push(one_billboard);
		}
		else if(event.asset.isAsset(MovieClip)) {
			var movieClip:MovieClip=<MovieClip> event.asset;
			if (movieClip.name == "border" || movieClip.name == "dream"
				|| movieClip.name == "IAP Menu"
				|| movieClip.name == "language flag"
				|| movieClip.name == "shoptag_shapes"
				|| movieClip.name == "shoptag_cliffedges"
				|| movieClip.name ==  "languages baked"
				|| movieClip.name == "Character"
				|| movieClip.name == "free") {
				movieClip.mouseEnabled = false;
				movieClip.mouseChildren = false;
			}
			this._rootTimeLine = movieClip;
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
		if (this._rootTimeLine) {
			for (var i:number = 0; i < this._shapes.length; i++) {
				//this._shapes[i].material = this._material;
			}

			//console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
			this._scene.addChild(this._rootTimeLine);
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

			if (this._rootTimeLine != undefined)
				this._rootTimeLine.update();

			this._view.render();
		}
	}

	private onResize(event = null): void
	{
		this._view.y         = 0;
		this._view.x         = 0;
		this._view.width     = window.innerWidth;
		this._view.height    = window.innerHeight;
		this._projection.originX = -(window.innerHeight/this._stage_height)*(this._stage_width/window.innerWidth);
	}

}

window.onload = function () {
	(<HTMLElement>document.getElementsByTagName("BODY")[0]).style.overflow="hidden";
	new AWD3ViewerMinimal();

};
