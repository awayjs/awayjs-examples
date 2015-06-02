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

import AssetLibrary							= require("awayjs-core/lib/library/AssetLibrary");
import AssetEvent							= require("awayjs-core/lib/events/AssetEvent");
import URLRequest							= require("awayjs-core/lib/net/URLRequest");
import LoaderEvent							= require("awayjs-core/lib/events/LoaderEvent");
import Vector3D								= require("awayjs-core/lib/geom/Vector3D");
import OrthographicOffCenterProjection		= require("awayjs-core/lib/projections/OrthographicOffCenterProjection");
import OrthographicProjection				= require("awayjs-core/lib/projections/OrthographicProjection");
import Keyboard								= require("awayjs-core/lib/ui/Keyboard");
import RequestAnimationFrame				= require("awayjs-core/lib/utils/RequestAnimationFrame");

import View									= require("awayjs-display/lib/containers/View");
import Mesh									= require("awayjs-display/lib/entities/Mesh");
import Billboard							= require("awayjs-display/lib/entities/Billboard");
import Container							= require("awayjs-display/lib/containers/DisplayObjectContainer");
import HoverController						= require("awayjs-display/lib/controllers/HoverController");
import Loader								= require("awayjs-display/lib/containers/Loader");
import ColorMaterial						= require("awayjs-display/lib/materials/BasicMaterial");
import RenderableNullSort					= require("awayjs-display/lib/sort/RenderableNullSort");
import PrimitiveCubePrefab					= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");
import DisplayObject						= require("awayjs-display/lib/base/DisplayObject");

import Renderer2D						    = require("awayjs-player/lib/renderer/Renderer2D");

import MethodMaterial						= require("awayjs-methodmaterials/lib/MethodMaterial");

import AWDParser							= require("awayjs-parsers/lib/AWDParser");
import Partition2D							= require("awayjs-player/lib/partition/Partition2D");
import MovieClip							= require("awayjs-player/lib/display/MovieClip");

import CoordinateSystem						= require("awayjs-core/lib/projections/CoordinateSystem");
import PerspectiveProjection				= require("awayjs-core/lib/projections/PerspectiveProjection");
import Camera								= require("awayjs-display/lib/entities/Camera");

import TextField							= require("awayjs-display/lib/entities/TextField");
import TextFormat							= require("awayjs-display/lib/text/TextFormat");

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
	private _stage_height: number
	private dropDown: HTMLSelectElement;
	private playBtn: HTMLButtonElement;
	private previousBtn: HTMLButtonElement;
	private nextBtn: HTMLButtonElement;
	private stopBtn: HTMLButtonElement;

	private counter: number;
	private loaded_display_objects: Array<MovieClip>;

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
		var testSelector : HTMLDivElement   = <HTMLDivElement> document.createElement( 'div' );
		testSelector.style.cssFloat     = 'none';
		testSelector.style.position     = 'absolute';
		testSelector.style.bottom       = '30px';
		testSelector.style.width        = '600px';
		testSelector.style.left         = '50%';
		testSelector.style.marginLeft   = '-300px';
		testSelector.style.padding    = '20px';
		testSelector.style.textAlign    = 'center';
		var testSelector2 : HTMLDivElement   = <HTMLDivElement> document.createElement( 'div' );
		testSelector2.style.cssFloat     = 'none';
		testSelector2.style.position     = 'absolute';
		testSelector2.style.bottom       = '0px';
		testSelector2.style.width        = '600px';
		testSelector2.style.left         = '50%';
		testSelector2.style.marginLeft   = '-300px';
		testSelector2.style.padding    = '20px';
		testSelector2.style.textAlign    = 'center';

		this.loaded_display_objects= new Array<MovieClip>();

		this.dropDown                       = <HTMLSelectElement> document.createElement( 'select' );
		this.dropDown.name                  = "selectTestDropDown"
		this.dropDown.id                    = "selectTest"

		this.previousBtn                    = <HTMLButtonElement> document.createElement( 'button' );
		this.previousBtn.innerHTML          = '<<';
		this.previousBtn.id                 = 'previous';

		this.nextBtn                        = <HTMLButtonElement> document.createElement( 'button' );
		this.nextBtn.innerHTML              = '>>';
		this.nextBtn.id                     = 'next';

		this.playBtn                      = <HTMLButtonElement> document.createElement( 'button' );
		this.playBtn.innerHTML            = '||';
		this.playBtn.id                   = 'previous';

		this.stopBtn                      = <HTMLButtonElement> document.createElement( 'button' );
		this.stopBtn.innerHTML            = 'stop';
		this.stopBtn.id                   = 'previous';


		testSelector.appendChild( this.previousBtn );
		testSelector.appendChild( this.dropDown );
		testSelector.appendChild( this.nextBtn );
		testSelector2.appendChild( this.playBtn );
		testSelector2.appendChild( this.stopBtn );
		document.body.appendChild( testSelector );
		document.body.appendChild( testSelector2 );
		this.dropDown.onchange      = ( e ) => this.dropDownChange( e );
		this.previousBtn.onclick   = () => this.nagigateBy( -1 );
		this.nextBtn.onclick       = () => this.nagigateBy( 1 );
		this.playBtn.onclick       = () => this.toggle_playback( );
		this.stopBtn.onclick       = () => this.stop_playback( );
		this.initObjects();
		this.initListeners();


	}

	/*
	 * Dropbox event handler
	 *
	 * @param e
	 */
	private dropDownChange( e ) : void {
		this.dropDown.options[this.dropDown.selectedIndex].value
		this.counter = this.dropDown.selectedIndex;
		var dataIndex:number = parseInt(this.dropDown.options[this.dropDown.selectedIndex].value);

		if (!isNaN(dataIndex)) {
			this.navigateToSection(this.loaded_display_objects[dataIndex]);
		}
	}
	private stop_playback() : void {
		this.playBtn.innerHTML="play";
		this._rootTimeLine.stop();
		this._rootTimeLine.currentFrameIndex=0;
	}
	private toggle_playback() : void {
		if(this.playBtn.innerHTML=="||"){
			this.playBtn.innerHTML="play";
			this._rootTimeLine.stop();
		}
		else if(this.playBtn.innerHTML=="play"){
			this.playBtn.innerHTML="||";
			this._rootTimeLine.play();
		}
	}
	private nagigateBy( direction : number = 1 ) : void
	{

		var l : number  = this.loaded_display_objects.length;
		var nextCounter = this.counter + direction;

		if ( nextCounter < 0 )
		{
			nextCounter = this.loaded_display_objects.length - 1;
		}
		else if ( nextCounter > this.loaded_display_objects.length - 1 )
		{
			nextCounter = 0;
		}

		var testData : MovieClip = this.loaded_display_objects[nextCounter];

		this.navigateToSection( testData );
		this.dropDown.selectedIndex = nextCounter;
		this.counter = nextCounter;


	}
	private navigateToSection(object:MovieClip): void
	{
		this.playBtn.innerHTML="||";
		console.log(object.name);
		var childcnt=this._view.scene.numChildren;
		while(childcnt--){
			this._view.scene.removeChildAt(childcnt);
		}
		this._view.scene.addChild(object);
		object.visible=true;
		object.currentFrameIndex=0;
		object.play();
		//todo: bounds object is not set
		//var bounds = object.getBounds(object);
		//object.x=-bounds.width/2;
		//object.y=-bounds.height/2;
		this._rootTimeLine=object;
		console.log("added child = ", object.name)

	}
	private init_dropDown(): void {

		for ( var c : number = 0 ; c < this.loaded_display_objects.length ; c ++  )
		{
			var option : HTMLOptionElement = <HTMLOptionElement> new Option(this.loaded_display_objects[c].name, String( c ) );
			this.dropDown.add( option );
		}
		this.counter=this.loaded_display_objects.length-1;
		this.dropDown.selectedIndex=this.loaded_display_objects.length-1;

	}

	/**
	 * Initialise the engine
	 */
	private initEngine(): void
	{
		//create the view
		this._view = new View(new Renderer2D());
		this._view.backgroundColor = 0xffffff;
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

		loader.load(new URLRequest("assets/AWD3/flicker.awd"));
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

		if(event.asset.isAsset(TextField)){
			var one_textfield:TextField=<TextField> event.asset;
			//this.loaded_display_objects.push(one_textfield);
			//console.log("orginal textfield_text = "+one_textfield.text);
			//one_textfield.text="new text";
		}
		else if(event.asset.isAsset(Mesh)) {
			var one_mesh:Mesh = <Mesh> event.asset;
			//this.loaded_display_objects.push(one_mesh);
		}
		else if(event.asset.isAsset(Billboard)) {
			var one_billboard:Billboard = <Billboard> event.asset;
			//this.loaded_display_objects.push(one_billboard);
		}
		else if(event.asset.isAsset(MovieClip)) {
			var one_mc:MovieClip = <MovieClip> event.asset;
			this.loaded_display_objects.push(one_mc);
			this._rootTimeLine = one_mc;
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
		this.init_dropDown();
	}

	/**
	 * Render loop
	 */
	private onEnterFrame(dt: number): void {
		this._time += dt;

		//if (this._rootTimeLine)
		//	this._rootTimeLine.logHierarchy();
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
