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

import { RequestAnimationFrame, PerspectiveProjection, CoordinateSystem } from "@awayjs/core";
import { DefaultRenderer } from "@awayjs/renderer";
import { CapsStyle, JointStyle, Graphics, TextureAtlas, GradientFillStyle } from "@awayjs/graphics";
import { MouseEvent, Sprite, Camera, Scene, MouseManager, SceneGraphPartition, DisplayObjectContainer } from "@awayjs/scene";
import { View, PickGroup } from "@awayjs/view";
import { MethodMaterial } from "@awayjs/materials";

class Graphics_Drawing_Interactive {
    //engine variables
    private _scene: Scene;
    private _view: View;
    private _root: DisplayObjectContainer;

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
        //create the scene
        this._root = new DisplayObjectContainer();
        this._scene = new Scene(new SceneGraphPartition(this._root));
        this._scene.renderer.renderableSorter = null;//new RenderableSort2D();

        this._view = this._scene.view;
        this._view.backgroundColor = 0x777777;

        this._scene.mouseManager.eventBubbling = true;

        this._projection = new PerspectiveProjection();
        this._projection.coordinateSystem = CoordinateSystem.RIGHT_HANDED;
        this._projection.fieldOfView = 30;
        this._projection.originX = -1;
        this._projection.originY = 1;
        this._camera_perspective = new Camera();
        this._camera_perspective.projection = this._projection;
        this._scene.camera = this._camera_perspective;
    }

/**
 * Initialise the engine
 */
    private initMaterials(): void {

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


        this._root.addChild(bgSprite);
        this._root.addChild(this._shape);
        this._root.addChild(this._circleGraphic);

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

        
        this._root.addEventListener(MouseEvent.MOUSE_DOWN, (event: MouseEvent) => this.onMouseDown(event));
        this._root.addEventListener(MouseEvent.MOUSE_MOVE, (event: MouseEvent) => this.onMouseMove(event));
        this._root.addEventListener(MouseEvent.MOUSE_UP, (event: MouseEvent) => this.onMouseUp(event));
        this._root.addEventListener(MouseEvent.MOUSE_UP_OUTSIDE, (event: MouseEvent) => this.onMouseUp(event));

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
        this._scene.render();
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
