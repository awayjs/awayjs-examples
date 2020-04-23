/*

SkyBox example in Away3d

Demonstrates:

How to use a CubeTexture to create a SkyBox object.
How to apply a CubeTexture to a material as an environment map.

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

import {LoaderEvent, Vector3D, AssetLibrary, LoaderContext, URLRequest, RequestAnimationFrame, PerspectiveProjection} from "@awayjs/core";
import {BitmapImageCube, ImageSampler} from "@awayjs/stage";
import {ElementsType} from "@awayjs/graphics";
import {Sprite, Skybox, PrimitiveTorusPrefab, Scene} from "@awayjs/scene";
import {MethodMaterial, ImageTextureCube, EffectEnvMapMethod} from "@awayjs/materials";

import {View} from "@awayjs/view";

class Basic_SkyBox
{
	//engine variables
	private _scene:Scene;

	//material objects
	private _cubeTexture:ImageTextureCube;
	private _torusMaterial:MethodMaterial;

	//scene objects
	private _skyBox:Skybox;
	private _torus:Sprite;

	//navigation variables
	private _timer:RequestAnimationFrame;
	private _time:number = 0;
	private _mouseX:number;
	private _mouseY:number;

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
	private init():void
	{
		this.initEngine();
		this.initMaterials();
		this.initObjects();
		this.initListeners();
	}

	/**
	 * Initialise the engine
	 */
	private initEngine():void
	{
		//setup the view
		this._scene = new Scene();

		//setup the camera
		this._scene.camera.z = -600;
		this._scene.camera.y = 0;
		this._scene.camera.lookAt(new Vector3D());
		this._scene.camera.projection = new PerspectiveProjection(90);
		this._scene.view.backgroundColor = 0xFFFF00;
		this._mouseX = window.innerWidth/2;
	}

	/**
	 * Initialise the materials
	 */
	private initMaterials():void
	{
		//setup the torus material
		this._torusMaterial = new MethodMaterial(0xFFFFFF, 1);
		this._torusMaterial.style.color = 0x111199;
		this._torusMaterial.style.sampler = new ImageSampler(false, true, true);
		this._torusMaterial.specularMethod.strength = 0.5;
		this._torusMaterial.ambientMethod.strength = 1;
	}

	/**
	 * Initialise the scene objects
	 */
	private initObjects():void
	{
		this._torus = <Sprite> new PrimitiveTorusPrefab(this._torusMaterial, ElementsType.TRIANGLE, 150, 60, 40, 20).getNewObject();
		this._torus.boundsVisible = true;
		this._scene.root.addChild(this._torus);
	}

	/**
	 * Initialise the listeners
	 */
	private initListeners():void
	{
		document.onmousemove = (event:MouseEvent) => this.onMouseMove(event);

		window.onresize  = (event:UIEvent) => this.onResize(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		AssetLibrary.addEventListener(LoaderEvent.LOADER_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		//setup the url map for textures in the cubemap file
		var loaderContext:LoaderContext = new LoaderContext();
		loaderContext.dependencyBaseUrl = "assets/skybox/";

		//environment texture
		AssetLibrary.load(new URLRequest("assets/skybox/snow_texture.cube"), loaderContext);
	}


	/**
	 * Navigation and render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._torus.rotationX += 2;
		this._torus.rotationY += 1;

		this._scene.camera.transform.moveTo(0, 0, 0);
		this._scene.camera.rotationY += 0.5*(this._mouseX - window.innerWidth/2)/800;
		this._scene.camera.transform.moveBackward(600);
		this._scene.render();
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete(event:LoaderEvent)
	{
		switch (event.url)
		{
			case 'assets/skybox/snow_texture.cube':
				this._cubeTexture = new ImageTextureCube(<BitmapImageCube> event.assets[0]);

				this._skyBox = new Skybox(<BitmapImageCube> event.assets[0]);
				this._scene.root.addChild(this._skyBox);

				this._torusMaterial.addEffectMethod(new EffectEnvMapMethod(this._cubeTexture, 1));

				break;
		}
	}

	/**
	 * Mouse move listener for navigation
	 */
	private onMouseMove(event:MouseEvent)
	{
		this._mouseX = event.clientX;
		this._mouseY = event.clientY;
	}

	/**
	 * window listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._scene.view.y = 0;
		this._scene.view.x = 0;
		this._scene.view.width = window.innerWidth;
		this._scene.view.height = window.innerHeight;
	}
}

window.onload = function()
{
	new Basic_SkyBox();
}