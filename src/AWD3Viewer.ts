/*

 AWD3 file loading example in AwayJS

 Demonstrates:

 How to use the Loader object to load an embedded internal awd model.

 Code by Rob Bateman
 rob@infiniteturtles.co.uk
 http://www.infiniteturtles.co.uk

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

import Geometry						= require("awayjs-core/lib/data/Geometry");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import OrthographicOffCenterProjection		= require("awayjs-core/lib/projections/OrthographicOffCenterProjection");
import OrthographicProjection		= require("awayjs-core/lib/projections/OrthographicProjection");
import Keyboard						= require("awayjs-core/lib/ui/Keyboard");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");

import View							= require("awayjs-display/lib/containers/View");
import Mesh							= require("awayjs-display/lib/entities/Mesh");
import Container					= require("awayjs-display/lib/containers/DisplayObjectContainer");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import Loader						= require("awayjs-display/lib/containers/Loader");
import ColorMaterial				= require("awayjs-display/lib/materials/BasicMaterial");
import RenderableNullSort			= require("awayjs-display/lib/sort/RenderableNullSort");
import PrimitiveCubePrefab			= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");

import Renderer2D				    = require("awayjs-player/lib/renderer/Renderer2D");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");

import AWDParser					= require("awayjs-parsers/lib/AWDParser");
import Partition2D					= require("awayjs-player/lib/partition/Partition2D");
import MovieClip					= require("awayjs-player/lib/display/MovieClip");

import CoordinateSystem				= require("awayjs-core/lib/projections/CoordinateSystem");
import PerspectiveProjection		= require("awayjs-core/lib/projections/PerspectiveProjection");
import Camera						= require("awayjs-display/lib/entities/Camera");

import TextField					= require("awayjs-display/lib/entities/TextField");
import TextFormat					= require("awayjs-display/lib/text/TextFormat");

class AWD3Viewer
{
	//engine variables
	private _view: View;

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
		this._view = new View(new Renderer2D());
		this._view.backgroundColor = 0xffffff;

		//for plugin preview-runtime:
		//this._view.backgroundColor = parseInt(document.getElementById("bgColor").innerHTML.replace("#", "0x"));
		this._stage_width = 550; //parseInt(document.getElementById("awdWidth").innerHTML);
		this._stage_height = 400; //parseInt(document.getElementById("awdHeight").innerHTML);

		this._isperspective=true;
		this._projection = new PerspectiveProjection();
		this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._projection.focalLength = 1000;
		this._projection.preserveFocalLength = true;
		this._projection.originX = 0.5;
		this._projection.originY = 0.5;
		this._camera_perspective = new Camera();
		this._camera_perspective.projection = this._projection;
		//this._projection.far = 500000;
		this._hoverControl = new HoverController(this._camera_perspective, null, 180, 0, 1000);
		this._ortho_projection = new OrthographicProjection(500);
		this._ortho_projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
		this._ortho_projection.far = 500000;
		this._ortho_projection.near = 0.1;
		this._ortho_projection.originX = 0.5;
		this._ortho_projection.originY = 0.5;
		this._camera_ortho = new Camera();
		this._camera_ortho.projection = this._ortho_projection;
		this._view.camera = this._camera_perspective;
		this._camera_ortho.x = 0;
		this._camera_ortho.y = 0;
		this._camera_ortho.scaleY = -1;
		this._camera_ortho.z = 0;
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects(): void
	{
		AssetLibrary.enableParser(AWDParser);

		//kickoff asset loading
		var loader:Loader = new Loader();
		loader.addEventListener(AssetEvent.ASSET_COMPLETE, (event: AssetEvent) => this.onAssetComplete(event));
		loader.addEventListener(LoaderEvent.RESOURCE_COMPLETE, (event: LoaderEvent) => this.onRessourceComplete(event));

		//for plugin preview-runtime:
		//loader.load(new URLRequest(document.getElementById("awdPath").innerHTML));

		//loader.load(new URLRequest("assets/AWD3/AwayJEscher.awd"));
		//loader.load(new URLRequest("assets/AWD3/Simple_text_test.awd"));
		//loader.load(new URLRequest("assets/AWD3/AwayJS_Ninja.awd"));
		//loader.load(new URLRequest("assets/AWD3/ComplexShape.awd"));
		//loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
		//loader.load(new URLRequest("assets/AWD3/Rectancle_blink_test.awd"));
		//loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
		//loader.load(new URLRequest("assets/AWD3/ScareCrow_shape_debug.awd"));
		//loader.load(new URLRequest("assets/AWD3/simple_bitmap_test.awd"));
		loader.load(new URLRequest("assets/AWD3/Simple_mask_test.awd"));
		//loader.load(new URLRequest("assets/AWD3/mask_test.awd"));
		//loader.load(new URLRequest("assets/AWD3/text_test_2.awd"));

	}

	/**
	 * Initialise the listeners
	 */
	private initListeners(): void
	{
		window.onresize  = (event) => this.onResize(event);

		document.onkeydown = (event) => this.onKeyDown(event);
		document.onmousedown = (event) => this.onMouseDown(event);
		document.onmouseup = (event) => this.onMouseUp(event);
		document.onmousemove = (event) => this.onMouseMove(event);
		document.onmousewheel = (event) => this.onMouseWheel(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();
	}

	/**
	 * loader listener for asset complete events
	 */
	private onAssetComplete(event: AssetEvent): void
	{

		if(event.asset.isAsset(TextField)) {
			//var one_textfield:TextField=<TextField> event.asset;
			//console.log("orginal textfield_text = "+one_textfield.text);
			//one_textfield.text="new text";
		}

		if(event.asset.isAsset(MovieClip)) {
			this._rootTimeLine = <MovieClip> event.asset;
			this._rootTimeLine.partition = new Partition2D(this._rootTimeLine);
		}
	}

	/**
	 * loader listener for asset complete events
	 */
	private onRessourceComplete(event: LoaderEvent): void {
		if (this._rootTimeLine) {
			//console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
			this._view.scene.addChild(this._rootTimeLine);
			this._rootTimeLine.x=-this._stage_width/2;
			this._rootTimeLine.y=-this._stage_height/2;
			// autoplay like in Flash
			//this._rootTimeLine.play();
		}
	}

	/**
	 * Render loop
	 */
	private onEnterFrame(dt: number): void {
		this._time += dt;

		//update camera controler
		// this._cameraController.update();

		if (this._rootTimeLine != undefined) {
			//console.log("RENDER = ");
			this._rootTimeLine.update(dt);
		}
		//console.log("RENDER = ");
		//update view
		this._view.render();
	}

	private onKeyDown(event): void {
		console.log("keycode = "+event.keyCode);
		if (event.keyCode == 80) {
			this._isperspective = true;
			this._view.camera = this._camera_perspective;
		}
		if (event.keyCode == 79) {
			this._isperspective = false;
			this._view.camera = this._camera_ortho;
		}
		if (event.keyCode == 81) {
			if (this._isperspective) {
				this._hoverControl.distance += 5;
			}
			else {
				this._ortho_projection.projectionHeight += 5;
			}
		}
		else if (event.keyCode == 87) {
			if (this._isperspective) {
				this._hoverControl.distance -= 5;
			}
			else {
				this._ortho_projection.projectionHeight -= 5;
			}
		}
		if (event.keyCode == 65) {
			if (this._isperspective) {
				this._hoverControl.distance += 50;
			}
			else {
				this._ortho_projection.projectionHeight += 50;
			}
		}
		else if (event.keyCode == 83) {
			if (this._isperspective) {
				this._hoverControl.distance -= 50;
			}
			else {
				this._ortho_projection.projectionHeight -= 50;
			}
		}
	}

	private onMouseDown(event): void
	{
		this._lastPanAngle = this._hoverControl.panAngle;
		this._lastTiltAngle = this._hoverControl.tiltAngle;
		this._lastMouseX = event.clientX;
		this._lastMouseY = event.clientY;
		this._move = true;
	}

	private onMouseUp(event): void
	{
		this._move = false;
	}

	private onMouseMove(event)
	{
		if (this._move) {
			if (this._isperspective) {
				this._hoverControl.panAngle = 0.3 * (event.clientX - this._lastMouseX) + this._lastPanAngle;
				this._hoverControl.tiltAngle = -0.3 * (event.clientY - this._lastMouseY) + this._lastTiltAngle;
			}
			else {
				if (event.clientX > (this._lastMouseX + 10))
					this._camera_ortho.x -= 10;
				else if (event.clientX > this._lastMouseX)
					this._camera_ortho.x--;
				else if (event.clientX < (this._lastMouseX - 10))
					this._camera_ortho.x += 10;
				else if (event.clientX < this._lastMouseX)
					this._camera_ortho.x++;
				if (event.clientY > (this._lastMouseY + 10))
					this._camera_ortho.y -= 10;
				else if (event.clientY > this._lastMouseY)
					this._camera_ortho.y--;
				else if (event.clientY < (this._lastMouseY - 10))
					this._camera_ortho.y += 10;
				else if (event.clientY < this._lastMouseY)
					this._camera_ortho.y++;
				this._lastMouseX = event.clientX;
				this._lastMouseY = event.clientY;
			}
		}
	}

	private onMouseWheel(event): void
	{

		if (this._isperspective) {
			this._hoverControl.distance -= event.wheelDelta * 5;
			if (this._hoverControl.distance < 100) {
				this._hoverControl.distance = 100;
			}
		}
		else {
			this._ortho_projection.projectionHeight -= event.wheelDelta * 5;
			if (this._ortho_projection.projectionHeight < 5) {
				this._ortho_projection.projectionHeight = 5;
			}
		}
	}

	private onResize(event = null): void
	{
		this._view.y         = 0;
		this._view.x         = 0;
		this._view.width     = window.innerWidth;
		this._view.height    = window.innerHeight;
	}

}

window.onload = function () {
	new AWD3Viewer();
};
