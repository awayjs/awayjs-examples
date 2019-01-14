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

import {LoaderEvent, Vector3D, AssetLibrary, IAsset, URLRequest, RequestAnimationFrame, Loader} from "@awayjs/core";
import {BitmapImage2D, Image2DParser, ImageCubeParser, TextureAtlasParser} from "@awayjs/stage";
import {ElementsType} from "@awayjs/graphics";
import {BasicMaterial, ImageTexture2D} from "@awayjs/materials";
import {Scene, Sprite, PrimitivePlanePrefab} from "@awayjs/scene";

Loader.enableParser(Image2DParser);
Loader.enableParser(ImageCubeParser);
Loader.enableParser(TextureAtlasParser);

class Basic_View
{
	//engine variables
	private _scene:Scene;

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
		this._scene = new Scene();

		//setup the camera
		this._scene.camera.z = -600;
		this._scene.camera.y = 500;
		this._scene.camera.lookAt(new Vector3D());

		//setup the materials
		this._planeMaterial = new BasicMaterial();

		//setup the scene
		this._plane = <Sprite> new PrimitivePlanePrefab(this._planeMaterial, ElementsType.TRIANGLE, 700, 700).getNewObject();
		this._scene.root.addChild(this._plane);

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

		this._scene.render();
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
					this._planeMaterial.texture = new ImageTexture2D(<BitmapImage2D> asset);
					break;
			}
		}
	}

	/**
	 * stage listener for resize events
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
	new Basic_View();
}