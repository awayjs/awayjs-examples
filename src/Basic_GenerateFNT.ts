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
import {ElementsType, Graphics, TextureAtlas, GradientFillStyle, Shape} from "@awayjs/graphics";
import {BasicMaterial, MethodMaterial, ImageTexture2D} from "@awayjs/materials";
import {Sprite, Font, FNTGenerator, PrimitivePlanePrefab, TesselatedFontTable, 
	TextField, TextFormat, TextFieldType, Scene, MouseManager, 
	SceneGraphPartition, DisplayObjectContainer, TextFieldAutoSize} from "@awayjs/scene";
import {View} from "@awayjs/view";
import {DefaultRenderer} from "@awayjs/renderer";
import {Parsers, FontParser} from "@awayjs/parsers";
import { PickGroup } from '@awayjs/view';

class Basic_GenerateFNT
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
	private _fntRenderer:FNTGenerator;

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
		
		this._fntRenderer=new FNTGenerator(this._scene.renderer.stage);
		/*bitmap.x=0;
		bitmap.y=0;
		this._scene.root.addChild(bitmap);*/
	/*	var htmlImage=bitmap.getCanvas();
		htmlImage.style.position = "absolute";
		htmlImage.style.top = "0px";
		htmlImage.style.left = "0px";
		htmlImage.style.width = "100%";*/
		//document.body.appendChild(htmlImage);
		//setup the camera
		// this._scene.camera.z = -600;
		// this._scene.camera.y = 500;
        // this._scene.camera.lookAt(new Vector3D());
        

		window.onwheel = (event:WheelEvent) => this.onMouseWheel(event);
		
		//setup the render loop
		window.onresize  = (event:UIEvent) => this.onResize(event);

		window.addEventListener("keydown", (event:KeyboardEvent) => this.onKeyDown(event))
		
		this.onResize();

		this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
		this._timer.start();

		AssetLibrary.addEventListener(LoaderEvent.LOADER_COMPLETE, (event:LoaderEvent) => this.onResourceComplete(event));

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

	private showGeneratedBitmaps(bitmaps:BitmapImage2D[], pixelRatio:number){

		for (var b:number = 0; b < bitmaps.length; b++) {
			var htmlWrapper:HTMLDivElement=document.createElement("div");
			var bitmap:BitmapImage2D = bitmaps[b];
			var htmlImage = document.createElement("canvas");
			htmlImage.width = bitmap.width;
			htmlImage.height = bitmap.height;
			//htmlImage.style.position = "absolute";
			//htmlImage.style.top = "0px";
			//htmlImage.style.right = "0px";
			htmlImage.style.transform = "scaleY(-1)";
			htmlImage.style.width = bitmap.width/pixelRatio + "px";
			htmlImage.style.height = bitmap.height/pixelRatio + "px";

			var context:CanvasRenderingContext2D = htmlImage.getContext("2d");
			var imageData:ImageData = context.getImageData(0, 0, bitmap.width, bitmap.height);
			imageData.data.set(bitmap.data);
			context.putImageData(imageData, 0, 0);
			htmlWrapper.appendChild(htmlImage);
			document.body.appendChild(htmlWrapper);
			for(var m:number=0;m<bitmap.mipLevels.length;m++){
				
				var bitmap2:BitmapImage2D = bitmap.mipLevels[m];
				var htmlImage2 = document.createElement("canvas");
				htmlImage2.width = bitmap2.width;
				htmlImage2.height = bitmap2.height;
				//htmlImage.style.position = "absolute";
				//htmlImage.style.top = "0px";
				//htmlImage.style.right = "0px";
				htmlImage2.style.transform = "scaleY(-1)";
				htmlImage2.style.width = bitmap.mipLevels[m].width/pixelRatio + "px";
				htmlImage2.style.height = bitmap.mipLevels[m].height/pixelRatio + "px";

				var context2:CanvasRenderingContext2D = htmlImage2.getContext("2d");
				var imageData2:ImageData = context2.getImageData(0, 0, bitmap2.width, bitmap2.height);
				imageData2.data.set(bitmap2.data);
				context2.putImageData(imageData2, 0, 0);	
				htmlWrapper.appendChild(htmlImage2);
			}
		}
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
				var bitmaps:BitmapImage2D[] = this._fntRenderer.generate(<Font>asset, 2048, 128, 5);
				//this.showGeneratedBitmaps(bitmaps, this._scene.view.stage.context.pixelRatio);
				
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
				textfield.selectable = true;
				textfield.type = TextFieldType.INPUT;
				textfield.autoSize=TextFieldAutoSize.RIGHT;

				for (var i:number = 0; i < 300; i++) {
					var tf:TextField = textfield.clone();
					var tfclone:TextFormat=textFormat.clone();
					tfclone.size=Math.round(10+Math.random()*100);
					tf.textFormat = tfclone;
					tf.x = (Math.random() - 0.5)*1000*window.innerWidth/window.innerHeight;
					tf.y = (Math.random() - 0.5)*1000;
					tf.text="12345\n67890";
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
	new Basic_GenerateFNT();
}