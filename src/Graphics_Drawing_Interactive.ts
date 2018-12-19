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

import { RequestAnimationFrame, ColorUtils,  ColorTransform, OrthographicProjection, PerspectiveProjection, CoordinateSystem, Box, Vector3D } from "awayjs-full/lib/core";
import { DefaultRenderer, SceneGraphPartition, PickEntity, PickGroup } from "awayjs-full/lib/renderer";
import { CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle } from "awayjs-full/lib/graphics";
import { MouseEvent, HoverController, MovieClip, Sprite, Camera, Scene, OrientationMode, AlignmentMode } from "awayjs-full/lib/scene";
import { View, MouseManager } from "awayjs-full/lib/view";
import { AS2MovieClipAdapter } from "awayjs-full/lib/player";
import { MethodMaterial } from "awayjs-full/lib/materials";

class Graphics_Drawing_Interactive {
    //engine variables
    private _view: View;
    private _renderer: DefaultRenderer;

    private _isMouseDown: boolean = false;

    private _timer: RequestAnimationFrame;

    //navigation
    private _projection: PerspectiveProjection;
    private _camera_perspective: Camera;

    private _shape: Sprite;
    private _circleGraphic: Sprite;
    private _drawing_path: any[];
    private _drawing_points: any[];

    
    private static _colorMaterials: Object = {};
    private static _textureMaterials: Object = {};

	/**
	 * Constructor
	 */
    constructor() {
        this.init();
    }

	/**
	 * Global initialise function
	 */
    private init(): void {
        this.initEngine();
        this.initMaterials();
        this.initObjects();
        this.initListeners();
    }

	/**
	 * Initialise the engine
	 */
    private initEngine(): void {
        //create the view
        this._renderer = new DefaultRenderer(new SceneGraphPartition(new Scene()));

        MouseManager.getInstance(PickGroup.getInstance(this._renderer.viewport)).eventBubbling = true;


        this._renderer.renderableSorter = null;//new RenderableSort2D();
        this._view = new View(this._renderer);
        this._view.backgroundColor = 0x777777;
        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._projection.fieldOfView = 30;
        this._projection.originX = -1;
        this._projection.originY = 1;
        this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        this._view.camera = this._camera_perspective;
    }

    /**
 * Initialise the engine
 */
    private initMaterials(): void {
        Graphics.get_material_for_color = function (color: number, alpha: number = 1): any {
            if (color == 0) {
                color = 0x000001;
            }
            //color=0xFF8100;
            //console.log("get color");
            //alpha=0.5;
            var texObj: any = TextureAtlas.getTextureForColor(color, alpha);
            if (Graphics_Drawing_Interactive._colorMaterials[texObj.bitmap.id]) {
                texObj.material = Graphics_Drawing_Interactive._colorMaterials[texObj.bitmap.id];
                return texObj;
            }

            var newmat: MethodMaterial = new MethodMaterial(texObj.bitmap);
            newmat.alphaBlending = true;
            newmat.useColorTransform = true;
            newmat.bothSides = true;
            Graphics_Drawing_Interactive._colorMaterials[texObj.bitmap.id] = newmat;
            texObj.material = newmat;
            return texObj;
        };
        Graphics.get_material_for_gradient = function (gradient: GradientFillStyle): any {
            var texObj = TextureAtlas.getTextureForGradient(gradient);
			/*if(alpha==0){
			 alpha=1;
			 }*/
            //alpha=0.5;
			/*if(color==0xffffff){
			 color=0xcccccc;
			 }*/
            var lookupId: string = texObj.bitmap.id + gradient.type;
            if (Graphics_Drawing_Interactive._textureMaterials[lookupId]) {
                texObj.material = Graphics_Drawing_Interactive._textureMaterials[lookupId];
                return texObj;
            }
            var newmat: MethodMaterial = new MethodMaterial(texObj.bitmap);
            newmat.useColorTransform = true;
            newmat.alphaBlending = true;
            newmat.bothSides = true;
            Graphics_Drawing_Interactive._textureMaterials[lookupId] = newmat;
            texObj.material = newmat;
            return texObj;
        };
    }

	/**
	 * Initialise the scene objects
	 */
    private initObjects(): void {

        this._drawing_path = [];
        this._drawing_points = [];

        this._shape = new Sprite(null);

        var bgSprite = new Sprite(null);
        bgSprite.graphics.beginFill(0xdddddd, 1);
        bgSprite.graphics.drawRect(0, 0, window.innerWidth, window.innerHeight);
        bgSprite.graphics.endFill();


        this._circleGraphic = new Sprite(null);
        this._circleGraphic.graphics.beginFill(0xFF0000, 1);
        this._circleGraphic.graphics.drawCircle(0, 0, 30);
        this._circleGraphic.graphics.endFill();


        this._view.scene.addChild(bgSprite);
        this._view.scene.addChild(this._shape);
        this._view.scene.addChild(this._circleGraphic);

    }

    private onMouseDown(event: MouseEvent): void {
        this._circleGraphic.x = event.scenePosition.x;
        this._circleGraphic.y = event.scenePosition.y;
        this._circleGraphic.alpha = 1;
        this._circleGraphic.scaleX = this._circleGraphic.scaleY = 1;

        this._drawing_path[this._drawing_path.length] = {
            cmd: "l",
            x: event.scenePosition.x,
            y: event.scenePosition.y
        }
        if (this._drawing_path.length == 2)
            return;
        this.draw_shape();
        this._isMouseDown = true;
    }
    private onMouseUp(event: MouseEvent): void {
        this.updateNewPointForMousePosition(event);
        this._isMouseDown = false;
    }

    private onMouseMove(event: MouseEvent): void {
        this.updateNewPointForMousePosition(event);
    }

    private updateNewPointForMousePosition(event: MouseEvent) {
        if (this._isMouseDown) {
            var deltaX: number = event.scenePosition.x - this._drawing_path[this._drawing_path.length - 1].x;
            var deltaY: number = event.scenePosition.y - this._drawing_path[this._drawing_path.length - 1].y;
            var distance: number = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            if (distance > 20) {
                this._drawing_path[this._drawing_path.length - 1].cmd = "c";
                this._drawing_path[this._drawing_path.length - 1].cx = this._drawing_path[this._drawing_path.length - 1].x - deltaX;
                this._drawing_path[this._drawing_path.length - 1].cy = this._drawing_path[this._drawing_path.length - 1].y - deltaY;
            }
            else {
                this._drawing_path[this._drawing_path.length - 1].cmd = "l";
            }
            this.draw_shape();
        }
    }

    private draw_shape(): void {

        
        this._shape.graphics.clear()

        this._shape.graphics.beginFill(0xFFFFFF, 1);
        this._shape.graphics.lineStyle(5, 0xFF0000, 1, false, null, CapsStyle.ROUND, JointStyle.MITER, 1.8);

        if (this._drawing_path.length == 0)
            return;
        this._shape.graphics.moveTo(this._drawing_path[0].x, this._drawing_path[0].y);
        var i = 1;
        for (i = 1; i < this._drawing_path.length; i++) {
            if (this._drawing_path[i].cmd == "l") {
                this._shape.graphics.lineTo(this._drawing_path[i].x, this._drawing_path[i].y);
            }
            else if (this._drawing_path[i].cmd == "c") {
                this._shape.graphics.curveTo(this._drawing_path[i].cx, this._drawing_path[i].cy, this._drawing_path[i].x, this._drawing_path[i].y);
            }
        }
        this._shape.graphics.endFill();
        
    }
	/**
	 * Initialise the listeners
	 */
    private initListeners(): void {

        
        this._view.scene.addEventListener(MouseEvent.MOUSE_DOWN, (event: MouseEvent) => this.onMouseDown(event));
        this._view.scene.addEventListener(MouseEvent.MOUSE_MOVE, (event: MouseEvent) => this.onMouseMove(event));
        this._view.scene.addEventListener(MouseEvent.MOUSE_UP, (event: MouseEvent) => this.onMouseUp(event));
        this._view.scene.addEventListener(MouseEvent.MOUSE_UP_OUTSIDE, (event: MouseEvent) => this.onMouseUp(event));

        window.onresize = (event) => this.onResize(event);


        this.onResize();

        this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
        this._timer.start();
    }


	/**
	 * Render loop
	 */
    private onEnterFrame(dt: number): void {

        if (this._circleGraphic.alpha > 0) {
            this._circleGraphic.alpha -= 0.05;
        }
        if (this._circleGraphic.scaleX > 0.1) {
            this._circleGraphic.scaleX-=0.05;
            this._circleGraphic.scaleY-=0.05;
        }
        //update view
        this._view.render();
    }


    private onResize(event = null): void {
        this._view.y = 0;
        this._view.x = 0;
        this._view.width = window.innerWidth;
        this._view.height = window.innerHeight;
    }

}

window.onload = function () {
    new Graphics_Drawing_Interactive();
};
