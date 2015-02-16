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

import AssetLibrary					= require("awayjs-core/lib/library/AssetLibrary");
import AssetType					= require("awayjs-core/lib/library/AssetType");
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
import Geometry						= require("awayjs-display/lib/base/Geometry");
import HoverController				= require("awayjs-display/lib/controllers/HoverController");
import Loader						= require("awayjs-display/lib/containers/Loader");
import ColorMaterial				= require("awayjs-display/lib/materials/BasicMaterial");
import PrimitiveCubePrefab			= require("awayjs-display/lib/prefabs/PrimitiveCubePrefab");

import DefaultRenderer				= require("awayjs-renderergl/lib/DefaultRenderer");

import MethodMaterial				= require("awayjs-methodmaterials/lib/MethodMaterial");
import MethodRendererPool			= require("awayjs-methodmaterials/lib/pool/MethodRendererPool");

import AWDParser					= require("awayjs-parsers/lib/AWDParser");
import MovieClip					= require("awayjs-player/lib/fl/display/MovieClip");

class AWD3Viewer
{
  //engine variables
  private _view: View;
  private _cameraController: HoverController;

  private _rootTimeLine: MovieClip;

  private _timer: RequestAnimationFrame;
  private _time: number = 0;

  //navigation
  private _lastPanAngle: number;
  private _lastTiltAngle: number;
  private _lastMouseX: number;
  private _lastMouseY: number;
  private _move: boolean;

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
    this._view = new View(new DefaultRenderer(MethodRendererPool));
    this._view.backgroundColor = 0xffffff;

      this._view.camera.projection = new OrthographicProjection(500);
      this._view.camera.projection.far = 500000;
      this._view.camera.projection.near = 0.1;
      this._view.camera.x=0;
      this._view.camera.y=0;
      this._view.camera.z=300;
      this._view.camera.rotationX=-180;
      this._view.camera.rotationY=0;
      this._view.camera.rotationZ=-180;
    //create custom lens
   // this._view.camera.projection = new OrthographicOffCenterProjection(0, 550, -400, 0);
  //  this._view.camera.projection.far = 500000;
  //  this._view.camera.projection.near = 0.1;

/*
    //setup controller to be used on the camera
    this._cameraController = new HoverController(this._view.camera, null, 0, 0, 300, 10, 90);
    this._cameraController.lookAtPosition = new Vector3D(0, 50, 0);
    this._cameraController.tiltAngle = 0;
    this._cameraController.panAngle = 0;
    this._cameraController.minTiltAngle = 5;
    this._cameraController.maxTiltAngle = 60;
    this._cameraController.autoUpdate = false;
*/
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


    //loader.load(new URLRequest(document.getElementById("awdPath").innerHTML));
    loader.load(new URLRequest("assets/AWD3/ScareCrow.awd"));
    //loader.load(new URLRequest("assets/AWD3/NestedTween.awd"));
    //loader.load(new URLRequest("assets/AWD3/SimpleShape.awd"));
    //loader.load(new URLRequest("assets/AWD3/ComplexShape.awd"));
    //loader.load(new URLRequest("assets/AWD3/Simple_mask_test.awd"));
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
    if(event.asset.assetType == AssetType.TIMELINE) {
      this._rootTimeLine = <MovieClip> event.asset;
    }
  }

  /**
   * loader listener for asset complete events
   */
  private onRessourceComplete(event: LoaderEvent): void {
    if (this._rootTimeLine) {
      //console.log("LOADING A ROOT name = " + this._rootTimeLine.name + " duration=" + this._rootTimeLine.duration);
      this._view.scene.addChild(this._rootTimeLine);
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
        if(event.keyCode==109){
            var test:OrthographicProjection = <OrthographicProjection> this._view.camera.projection;
            test.projectionHeight+=5;
        }
        else if(event.keyCode==107){
            var test:OrthographicProjection = <OrthographicProjection> this._view.camera.projection;
            test.projectionHeight-=5;
        }
    }

  private onMouseDown(event): void
  {
  /*  this._lastPanAngle = this._cameraController.panAngle;
    this._lastTiltAngle = this._cameraController.tiltAngle;
    this._move = true;*/
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
        if ( event.clientX>(this._lastMouseX+10))
            this._view.camera.x+=10;
        else if ( event.clientX>this._lastMouseX)
            this._view.camera.x++;
        else if ( event.clientX<(this._lastMouseX-10))
            this._view.camera.x-=10;
        else if ( event.clientX<this._lastMouseX)
            this._view.camera.x--;
        if ( event.clientY>(this._lastMouseY+10))
            this._view.camera.y+=10;
        else if ( event.clientY>this._lastMouseY)
            this._view.camera.y++;
        else if ( event.clientY<(this._lastMouseY-10))
            this._view.camera.y-=10;
        else if ( event.clientY<this._lastMouseY)
            this._view.camera.y--;
        this._lastMouseX = event.clientX;
        this._lastMouseY = event.clientY;
      //this._cameraController.panAngle = 0.3*(event.clientX - this._lastMouseX) + this._lastPanAngle;
      //this._cameraController.tiltAngle = 0.3*(event.clientY - this._lastMouseY) + this._lastTiltAngle;
    }
  }

  private onMouseWheel(event): void
  {

   /* this._cameraController.distance -= event.wheelDelta * 5;

    if (this._cameraController.distance < 100) {
      this._cameraController.distance = 100;
    } else if (this._cameraController.distance > 2000) {
      this._cameraController.distance = 2000;
    }
    */
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
