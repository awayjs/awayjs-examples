/*

Basic Text example in Away3D


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

import {LoaderEvent, Vector3D, AssetLibrary, IAsset, URLRequest, RequestAnimationFrame, CoordinateSystem, PerspectiveProjection} from "@awayjs/core";
import {BitmapImage2D} from "@awayjs/stage";
import {ElementsType, Graphics, TextureAtlas, GradientFillStyle} from "@awayjs/graphics";
import {BasicMaterial, MethodMaterial, ImageTexture2D} from "@awayjs/materials";
import {Sprite, Font, PrimitivePlanePrefab, TesselatedFontTable, TextField, TextFormat, TextFieldType, Scene, MouseManager, SceneGraphPartition, DisplayObjectContainer} from "@awayjs/scene";
import {View} from "@awayjs/view";
import {DefaultRenderer} from "@awayjs/renderer";
import {Parsers, FontParser} from "@awayjs/parsers";

class Basic_Text
{
    
	private static _colorMaterials:any={};
	private static _textureMaterials:any={};
	private static _useTextureAtlasForColors:boolean=true;
	//engine variables
	private _scene:Scene;

	//material objects
	private _planeMaterial:BasicMaterial;

	//scene objects
	private _tf:TextField;

	//tick for frame update
	private _timer:RequestAnimationFrame;

	/**
	 * Constructor
	 */
	constructor()
	{
        

        Parsers.enableAllBundled()
		//setup the view
		this._scene = new Scene(new SceneGraphPartition(new DisplayObjectContainer()));
		this._scene.renderer.renderableSorter = null;//new RenderableSort2D();

		this._scene.view.projection.scale = 1;
		this._scene.view.projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._scene.view.backgroundColor=0xcccccc;
		//setup the camera
		// this._scene.camera.z = -600;
		// this._scene.camera.y = 500;
        // this._scene.camera.lookAt(new Vector3D());
        

		window.onwheel = (event:WheelEvent) => this.onMouseWheel(event);
		
		//setup the render loop
		window.onresize  = (event:UIEvent) => this.onResize(event);

		window.onwheel
		window.addEventListener("keydown", (event:KeyboardEvent) => this.onKeyDown(event))
		
		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		AssetLibrary.addEventListener(LoaderEvent.LOAD_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

		AssetLibrary.load(new URLRequest("assets/georgia.ttf"),null, null, new FontParser(true) );
	}

	/**
	 * render loop
	 */
	private onEnterFrame(dt:number):void
	{
        // if(textfield)
		//     textfield.rotationY += 1;

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

            if(asset.isAsset(Font)){
                console.log("loaded a font");
				var textFormat:TextFormat = new TextFormat();
				textFormat.font = <Font>asset;
				textFormat.color = 0xff0000;
				textFormat.size = 40;
				
				var textfield:TextField = new TextField();
				textfield.textFormat = textFormat;
                textfield.background = true;
                textfield.border = true;
                textfield.borderColor = 0xff0000;
                textfield.multiline = true;
				textfield.text="12345\n67890";
				textfield.selectable = true;
				textfield.type = TextFieldType.INPUT;

				for (var i:number = 0; i < 30; i++) {
					var tf:TextField = textfield.clone();
					tf.x = (Math.random() - 0.5)*1000*window.innerWidth/window.innerHeight;
					tf.y = (Math.random() - 0.5)*1000;
					this._scene.root.addChild(tf);
				}
            }
            /*
			switch (event.url) {
				//plane textures
				case "assets/floor_diffuse.jpg" :
					this._planeMaterial.texture = new ImageTexture2D(<BitmapImage2D> asset);
					break;
			}*/
		}
	}

	private onKeyDown(event:KeyboardEvent = null):void
	{
		if(event.key=="Tab"){
			this._scene.mouseManager.focusNextTab();
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

	/**
	 * Mouse wheel listener for navigation
	 */
	private onMouseWheel(event:WheelEvent)
	{
		event.preventDefault();
		if (event.ctrlKey) {
			this._scene.camera.z -= event.deltaY;


			if (this._scene.camera.z > -100)
				this._scene.camera.z = -100;
			else if (this._scene.camera.z < -2000)
				this._scene.camera.z = -2000;
		} else {
			this._scene.camera.x += event.deltaX;

			this._scene.camera.y += event.deltaY;
		}

	}
}

window.onload = function()
{
	new Basic_Text();
}