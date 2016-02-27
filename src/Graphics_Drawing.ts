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
import AS2MovieClipAdapter = require("awayjs-player/lib/adapters/AS2MovieClipAdapter");
import AssetEvent					= require("awayjs-core/lib/events/AssetEvent");
import LoaderEvent					= require("awayjs-core/lib/events/LoaderEvent");
import Vector3D						= require("awayjs-core/lib/geom/Vector3D");
import ColorTransform						= require("awayjs-core/lib/geom/ColorTransform");
import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import URLRequest					= require("awayjs-core/lib/net/URLRequest");
import OrthographicOffCenterProjection		= require("awayjs-core/lib/projections/OrthographicOffCenterProjection");
import OrthographicProjection		= require("awayjs-core/lib/projections/OrthographicProjection");
import Keyboard						= require("awayjs-core/lib/ui/Keyboard");
import RequestAnimationFrame		= require("awayjs-core/lib/utils/RequestAnimationFrame");
import HierarchicalProperties			= require("awayjs-display/lib/base/HierarchicalProperties");
import Geometry						= require("awayjs-display/lib/base/Geometry");
import Graphics						= require("awayjs-display/lib/draw/Graphics");
import SubGeometryBase				= require("awayjs-display/lib/base/SubGeometryBase");
import View							= require("awayjs-display/lib/View");
import Sprite						= require("awayjs-display/lib/display/Sprite");
import Container					= require("awayjs-display/lib/display/DisplayObjectContainer");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import ColorMaterial				= require("awayjs-display/lib/materials/BasicMaterial");

import PrimitiveCubePrefab			= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");

import AWDParser					= require("awayjs-parsers/lib/AWDParser");
import SceneGraphPartition					= require("awayjs-display/lib/partition/SceneGraphPartition");
import MovieClip							= require("awayjs-display/lib/display/MovieClip");

import CoordinateSystem						= require("awayjs-core/lib/projections/CoordinateSystem");
import PerspectiveProjection				= require("awayjs-core/lib/projections/PerspectiveProjection");
import Camera								= require("awayjs-display/lib/display/Camera");

import TextField							= require("awayjs-display/lib/display/TextField");
import TextFormat							= require("awayjs-display/lib/text/TextFormat");


import Matrix3D							= require("awayjs-core/lib/geom/Matrix3D");

class Graphics_Drawing
{
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
		this._renderer.renderableSorter = null;//new RenderableSort2D();
		this._view = new View(this._renderer);
		this._view.backgroundColor = 0x777777;
		this._stage_width = 550;
		this._stage_height = 400;

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
		var root_timeline:MovieClip=new MovieClip();
		root_timeline.partition=new SceneGraphPartition();
		root_timeline.adapter = new AS2MovieClipAdapter(root_timeline, this._view);

		// Graphics is not wired into any Displayobjects yet.
		// to have it produce geometry, for now we have to pass it a sprite when constructing it
		var drawingMC = new Sprite(null);
		var drawingGraphics = new Graphics(drawingMC);

		// for now i did not find a way to activate this other than doing it in js (not in ts)
		// so for this example to work, after packaging the example, one have to go into the js file and activate follwing line:
		//Graphics._tess_obj=new TESS();

		// color do not work yet
		drawingGraphics.beginFill(0xFF0000, 1);

		// strokes not at a showable state yet
		//drawingGraphics.lineStyle(10, 0x000000, 1);

		// draw some shape
		drawingGraphics.moveTo(100, 100);
		drawingGraphics.lineTo(200, 100);
		drawingGraphics.lineTo(200, 200);
		drawingGraphics.curveTo(150, 150, 100, 200);
		drawingGraphics.curveTo(0, 150, 100, 100);
		// draw a hole into the shape:
		drawingGraphics.moveTo(110, 110);
		drawingGraphics.lineTo(130, 110);
		drawingGraphics.lineTo(130, 130);
		drawingGraphics.lineTo(110, 130);
		drawingGraphics.moveTo(110, 110);

		drawingGraphics.beginFill(0xFF0000, 1);
		drawingGraphics.drawCircle(300, 150, 80);
		drawingGraphics.drawCircle(550, 150, 160);
		drawingGraphics.drawRect(100, 250, 50, 50);
		drawingGraphics.drawRoundRect(100, 350, 200, 100, 20);
		drawingGraphics.drawEllipse(550, 400, 200, 100);
		drawingGraphics.endFill();

		this._view.scene.addChild(drawingMC);

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
	 * Render loop
	 */
	private onEnterFrame(dt: number): void {
		this._time += dt;

		//update camera controler
		// this._cameraController.update();

		//console.log("RENDER = ");
		//update view
		this._view.render();
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
	new Graphics_Drawing();
};
