/*

Basic 3D scene example in Away3D

Demonstrates:

How to setup a view and add 3D objects.
How to apply materials to a 3D object and dynamically load textures
How to create a frame tick that updates the contents of the scene

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

import {BitmapImage2D}				from "awayjs-core/lib/image/BitmapImage2D";
import {LoaderEvent}					from "awayjs-core/lib/events/LoaderEvent";
import {Vector3D}						from "awayjs-core/lib/geom/Vector3D";
import {AssetLibrary}					from "awayjs-core/lib/library/AssetLibrary";
import {IAsset}						from "awayjs-core/lib/library/IAsset";
import {URLRequest}					from "awayjs-core/lib/net/URLRequest";
import {RequestAnimationFrame}		from "awayjs-core/lib/utils/RequestAnimationFrame";

import {View}							from "awayjs-display/lib/View";
import {Sprite}						from "awayjs-display/lib/display/Sprite";
import {PrimitivePlanePrefab}			from "awayjs-display/lib/prefabs/PrimitivePlanePrefab";
import {Single2DTexture}				from "awayjs-display/lib/textures/Single2DTexture";

import {DefaultRenderer}				from "awayjs-renderergl/lib/DefaultRenderer";

import {BasicMaterial}				from "awayjs-display/lib/materials/BasicMaterial";
import {ElementsType}					from "awayjs-display/lib/graphics/ElementsType";

class Basic_View
{
	//engine variables
	private _view:View;

	//material objects
	private _planeMaterial:BasicMaterial;

	//scene objects
	private _plane:Sprite;

	//tick for frame update
	private _timer:RequestAnimationFrame;

	/**
	 * Constructor
	 */
	constructor()
	{
		//setup the view
		this._view = new View(new DefaultRenderer());

		//setup the camera
		this._view.camera.z = -600;
		this._view.camera.y = 500;
		this._view.camera.lookAt(new Vector3D());

		//setup the materials
		this._planeMaterial = new BasicMaterial();

		//setup the scene
		this._plane = <Sprite> new PrimitivePlanePrefab(this._planeMaterial, ElementsType.TRIANGLE, 700, 700).getNewObject();
		this._view.scene.addChild(this._plane);

		//setup the render loop
		window.onresize  = (event:UIEvent) => this.onResize(event);

		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		//plane textures
		AssetLibrary.load(new URLRequest("assets/floor_diffuse.jpg"));
	}

	/**
	 * render loop
	 */
	private onEnterFrame(dt:number):void
	{
		this._plane.rotationY += 1;

		this._view.render();
	}

	/**
	 * Listener function for resource complete event on asset library
	 */
	private onResourceComplete (event:LoaderEvent)
	{
		var assets:Array<IAsset> = event.assets;
		var length:number = assets.length;

		for (var c:number = 0; c < length; c++) {
			var asset:IAsset = assets[c];

			console.log(asset.name, event.url);

			switch (event.url) {
				//plane textures
				case "assets/floor_diffuse.jpg" :
					this._planeMaterial.texture = new Single2DTexture(<BitmapImage2D> asset);
					break;
			}
		}
	}

	/**
	 * stage listener for resize events
	 */
	private onResize(event:UIEvent = null):void
	{
		this._view.y = 0;
		this._view.x = 0;
		this._view.width = window.innerWidth;
		this._view.height = window.innerHeight;
	}
}

window.onload = function()
{
	new Basic_View();
}