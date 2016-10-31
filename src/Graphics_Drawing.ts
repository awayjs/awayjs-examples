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

import {View, DefaultRenderer}		        								from "awayjs-full";
import {AS2MovieClipAdapter}												from "awayjs-full/lib/adapters";
import {GraphicsFactoryHelper, CapsStyle, JointStyle}						from "awayjs-full/lib/draw";
import {MouseEvent}															from "awayjs-full/lib/events";
import {ColorTransform}														from "awayjs-full/lib/geom";
import {RequestAnimationFrame}												from "awayjs-full/lib/utils";
import {HoverController}													from "awayjs-full/lib/controllers";
import {MovieClip, Sprite, Camera}											from "awayjs-full/lib/display";
import {Graphics}															from "awayjs-full/lib/graphics";
import {SceneGraphPartition}												from "awayjs-full/lib/partition";
import {OrthographicProjection, PerspectiveProjection, CoordinateSystem}	from "awayjs-full/lib/projections";

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
	private drawingMC: Sprite;
	private _activePoint: Sprite;
	private _points: Array<Sprite>;

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
		this._view.setPartition(root_timeline, new SceneGraphPartition(root_timeline));
		root_timeline.adapter = new AS2MovieClipAdapter(root_timeline, this._view);

		// Graphics is not wired into any Displayobjects yet.
		// to have it produce geometry, for now we have to pass it a sprite when constructing it
		this.drawingMC = new Sprite(null);

		this._activePoint=null;
		// for now i did not find a way to activate this other than doing it in js (not in ts)
		// so for this example to work, after packaging the example, one have to go into the js file and activate follwing line:

		GraphicsFactoryHelper._tess_obj= null;//new TESS();
		this._view.scene.addChild(this.drawingMC );

		this._points=new Array<Sprite>();
		if (GraphicsFactoryHelper._tess_obj) GraphicsFactoryHelper._tess_obj.newTess();
		var thisCircleGraphic:Graphics=new Graphics();
		thisCircleGraphic.beginFill(0xFF0000, 1);
		thisCircleGraphic.drawCircle(0,0,30);
		thisCircleGraphic.endFill();
		if (GraphicsFactoryHelper._tess_obj) GraphicsFactoryHelper._tess_obj.deleteTess();

		if (GraphicsFactoryHelper._tess_obj) GraphicsFactoryHelper._tess_obj.newTess();
		var thisCircleGraphicsmall:Graphics = new Graphics();
		thisCircleGraphicsmall.beginFill(0xFF0000, 1);
		thisCircleGraphicsmall.drawCircle(0, 0, 10);
		thisCircleGraphicsmall.endFill();
		if (GraphicsFactoryHelper._tess_obj) GraphicsFactoryHelper._tess_obj.deleteTess();
		var batman_logo:Array<Array<any> >=[];
		var cnt=0;
		batman_logo[cnt++]=["l", 50, 50];
		batman_logo[cnt++]=["l", 290, 50];
		batman_logo[cnt++]=["c1", 290, 150];
		batman_logo[cnt++]=["c2", 450, 150];
		batman_logo[cnt++]=["l", 460, 60];
		batman_logo[cnt++]=["l", 470, 100];
		batman_logo[cnt++]=["l", 530, 100];
		batman_logo[cnt++]=["l", 540, 60];
		batman_logo[cnt++]=["l", 550, 150];
		batman_logo[cnt++]=["c1", 710, 150];
		batman_logo[cnt++]=["c2", 710, 50];
		batman_logo[cnt++]=["l", 950, 50];
		batman_logo[cnt++]=["c1", 800, 120];
		batman_logo[cnt++]=["c2", 825, 250];
		batman_logo[cnt++]=["c1", 630, 280];
		batman_logo[cnt++]=["c2", 500, 450];
		batman_logo[cnt++]=["c1", 370, 280];
		batman_logo[cnt++]=["c2", 175, 250];
		batman_logo[cnt++]=["c1", 200, 120];
		var i = 0;
		for (i = 0; i < batman_logo.length; i++) {
			this._points[i] = new Sprite();
			this._points[i].name=batman_logo[i][0];
			this._points[i].x = batman_logo[i][1];
			this._points[i].y = batman_logo[i][2];

		}
		this.draw_shape();
		for (i = 0; i <  batman_logo.length; i++) {
			var thisshape=thisCircleGraphic;
			if(this._points[i].name=="c1"){
				thisshape=thisCircleGraphicsmall;
			}
			this._points[i].graphics.copyFrom(thisshape);
			this._points[i].visible=false;
			this._view.scene.addChild(this._points[i]);
			this._points[i].addEventListener(MouseEvent.MOUSE_DOWN, function (event) { return this.onPointDown(event); });
		}

		this._view.scene.addEventListener(MouseEvent.MOUSE_MOVE, (event:MouseEvent) => this.onMouseMove(event));
		document.onmouseup = (event) => this.onMouseUp(event);
		this.draw_shape();

	}

	private onPointDown(event:MouseEvent): void{
		this._activePoint = (<Sprite> event.target);
		this._activePoint.x=event.scenePosition.x;
		this._activePoint.y=event.scenePosition.y;
	}
	private onMouseUp(event): void{
		this._activePoint = null;
		//this.draw_shape();
	}
	private onMouseMove(event:MouseEvent): void{
		if (this._activePoint){
			this._activePoint.x=event.scenePosition.x;
			this._activePoint.y=event.scenePosition.y;
		}
	}

	private draw_shape(): void{

		this.drawingMC.graphics.clear()

		if (GraphicsFactoryHelper._tess_obj) GraphicsFactoryHelper._tess_obj.newTess();

		this.drawingMC.graphics.beginFill(0xFF0000, 1);
		this.drawingMC.graphics.lineStyle(5, 0xFF0000, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);
		this.drawingMC.graphics.moveTo(this._points[0].x, this._points[0].y);
		var i = 1;
		var tmpspite:Sprite=null;
		for (i = 1; i < this._points.length; i++) {
			if(this._points[i].name=="c1"){
				tmpspite=this._points[i];
			}
			else if (this._points[i].name=="c2"){
				this.drawingMC.graphics.curveTo(tmpspite.x, tmpspite.y, this._points[i].x, this._points[i].y);
				tmpspite=null;
			}
			else if (this._points[i].name=="l") {
				this.drawingMC.graphics.lineTo(this._points[i].x, this._points[i].y);
				tmpspite=null;
			}
		}
		if(tmpspite){
			this.drawingMC.graphics.curveTo(tmpspite.x, tmpspite.y, this._points[0].x, this._points[0].y);
		}
		else{
			this.drawingMC.graphics.lineTo(this._points[0].x, this._points[0].y);
		}
		this.drawingMC.graphics.endFill();
		if (GraphicsFactoryHelper._tess_obj) GraphicsFactoryHelper._tess_obj.deleteTess();

		var new_ct:ColorTransform = this.drawingMC.transform.colorTransform || (this.drawingMC.transform.colorTransform = new ColorTransform());
		new_ct.redMultiplier = 1;
		new_ct.greenMultiplier = 1;
		new_ct.blueMultiplier = 0;
		new_ct.alphaMultiplier = 1;

		this.drawingMC.transform.invalidateColorTransform();
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
