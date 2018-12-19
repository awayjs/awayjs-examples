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

import {LoaderEvent, Vector3D, AssetLibrary, IAsset, URLRequest, RequestAnimationFrame} from "awayjs-full/lib/core";
import {BitmapImage2D} from "awayjs-full/lib/stage";
import {ElementsType, Graphics, TextureAtlas, GradientFillStyle} from "awayjs-full/lib/graphics";
import {BasicMaterial, MethodMaterial, ImageTexture2D} from "awayjs-full/lib/materials";
import {Sprite, Font, PrimitivePlanePrefab, TesselatedFontTable, TextField, TextFormat} from "awayjs-full/lib/scene";
import {View} from "awayjs-full/lib/view";
import {SceneGraphPartition} from "awayjs-full/lib/renderer";
import {Parsers, FontParser} from "awayjs-full/lib/parsers";

class Basic_Text
{
    
	private static _colorMaterials:any={};
	private static _textureMaterials:any={};
	private static _useTextureAtlasForColors:boolean=true;
	//engine variables
	private _view:View;

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
        
		//todo: better implement this in graphics (this function provides the drawing api with materials for a color / alpha)
		Graphics.get_material_for_color=function(color:number, alpha:number=1):any{
			if(color==0){
				color=0x000001;
			}
			//color=0xFF8100;
			//console.log("get color");
			//alpha=0.5;
			var texObj:any={};

			if(Basic_Text._useTextureAtlasForColors){
				texObj=TextureAtlas.getTextureForColor(color, alpha);
				if(Basic_Text._colorMaterials[texObj.bitmap.id]){
					texObj.material=Basic_Text._colorMaterials[texObj.bitmap.id];
					return texObj;
				}
				var newmat:MethodMaterial=new MethodMaterial(texObj.bitmap);
				newmat.alphaBlending=true;
				newmat.useColorTransform = true;
				newmat.bothSides = true;
				Basic_Text._colorMaterials[texObj.bitmap.id]=newmat;
				texObj.material=newmat;
				return texObj;
			}

			var colorstr:string=color+"_"+Math.round(alpha*100).toString();
			if(Basic_Text._colorMaterials[colorstr]){
				texObj.material=Basic_Text._colorMaterials[colorstr];
				return texObj;
			}
			var newmat:MethodMaterial=new MethodMaterial(color, alpha);
			newmat.alphaBlending=true;
			newmat.useColorTransform = true;
			newmat.bothSides = true;
			texObj.material=newmat;
			Basic_Text._colorMaterials[colorstr]=newmat;
			return texObj;
		};
		Graphics.get_material_for_gradient=function(gradient:GradientFillStyle):any{
			var texObj=TextureAtlas.getTextureForGradient(gradient);
			/*if(alpha==0){
			 alpha=1;
			 }*/
			//alpha=0.5;
			/*if(color==0xffffff){
			 color=0xcccccc;
			 }*/
			var lookupId:string=texObj.bitmap.id+gradient.type;
			if(Basic_Text._textureMaterials[lookupId]){
				texObj.material=Basic_Text._textureMaterials[lookupId];
				return texObj;
			}
			var newmat:MethodMaterial=new MethodMaterial(texObj.bitmap);
			newmat.useColorTransform = true;
			newmat.alphaBlending=true;
			newmat.bothSides = true;
			Basic_Text._textureMaterials[lookupId]=newmat;
			texObj.material=newmat;
			return texObj;
		};
        Parsers.enableAllBundled()
		//setup the view
		this._view = new View();
		this._view.renderer.renderableSorter = null;//new RenderableSort2D();
        this._view.backgroundColor=0xcccccc;
		//setup the camera
		this._view.camera.z = -600;
		this._view.camera.y = 500;
        this._view.camera.lookAt(new Vector3D());
        


		//setup the render loop
		window.onresize  = (event:UIEvent) => this.onResize(event);

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
        if(this._tf)
		    this._tf.rotationY += 1;

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

            if(asset.isAsset(Font)){
                console.log("loaded a font");
                var mySprite:Sprite=new Sprite();
                mySprite.partition = new SceneGraphPartition(mySprite, true);
                this._tf=new TextField();
                var newFormat:TextFormat=new TextFormat();
                this._tf.textFormat=newFormat;
                this._tf.text="";
                //this._tf.background=true;
                //this._tf.backgroundColor=0xff0000;
                this._tf.border=true;
                this._tf.borderColor=0xff0000;
                this._tf.textFormat.font=<Font>asset;
                this._tf.textFormat.color=0xff0000;
                this._tf.textFormat.size=40;
                this._tf.text="123456789";
                this._tf.invalidateElements();
                mySprite.addChild(this._tf);
                this._view.scene.addChild(mySprite);
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
	new Basic_Text();
}