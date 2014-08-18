///<reference path="../libs/stagegl-extensions.next.d.ts" />

/*

 AWD file loading example in Away3d

 Demonstrates:

 How to use the Loader3D object to load an embedded internal 3ds model.
 How to map an external asset reference inside a file to an internal embedded asset.
 How to extract material data and use it to set custom material properties on a model.

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

module examples
{
	import View							= away.containers.View;
	import HoverController				= away.controllers.HoverController;
	import Loader						= away.containers.Loader;
	import Mesh							= away.entities.Mesh;
	import AssetEvent					= away.events.AssetEvent;
	import Vector3D						= away.geom.Vector3D;
	import AssetLibrary					= away.library.AssetLibrary;
	import AssetType					= away.library.AssetType;
	import IAsset						= away.library.IAsset;
	import DirectionalLight				= away.entities.DirectionalLight;
	import StaticLightPicker			= away.materials.StaticLightPicker;
	import TriangleMethodMaterial		= away.materials.TriangleMethodMaterial;
	import URLRequest					= away.net.URLRequest;
	import DefaultRenderer				= away.render.DefaultRenderer;
	import RequestAnimationFrame		= away.utils.RequestAnimationFrame;

    export class Basic_LoadAWD
    {
        //engine variables
        private _view:View;

        //light objects
        private _light:DirectionalLight;
        private _lightPicker:StaticLightPicker;

        //scene objects
        private _suzanne:Mesh;

        //navigation variables
        private _timer:RequestAnimationFrame;
        private _time:number = 0;

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
            this.initLights();
            this.initMaterials();
            this.initObjects();
            this.initListeners();
        }

        /**
         * Initialise the engine
         */
        private initEngine():void
        {
            this._view = new View(new DefaultRenderer());

            //set the background of the view to something suitable
            this._view.backgroundColor = 0x1e2125;

            //position the camera
            this._view.camera.z = -2000;
        }

        /**
         * Initialise the entities
         */
        private initLights():void
        {
            //create the light for the scene
            this._light = new DirectionalLight();
            this._light.color = 0x683019;
            this._light.direction = new Vector3D(1, 0, 0);
            this._light.ambient = 0.5;
            this._light.ambientColor = 0x30353b;
            this._light.diffuse = 2.8;
            this._light.specular = 1.8;
            this._view.scene.addChild(this._light);

            //create the light picker for the material
            this._lightPicker = new StaticLightPicker([this._light]);
        }

        /**
         * Initialise the materials
         */
        private initMaterials():void
        {
        }

        /**
         * Initialise the scene objects
         */
        private initObjects():void
        {
        }

        /**
         * Initialise the listeners
         */
        private initListeners():void
        {
            window.onresize  = (event:UIEvent) => this.onResize(event);

            this.onResize();

            this._timer = new RequestAnimationFrame(this.onEnterFrame, this);
            this._timer.start();

            AssetLibrary.enableParser(away.parsers.AWDParser);

            AssetLibrary.addEventListener(AssetEvent.ASSET_COMPLETE, (event:AssetEvent) => this.onAssetComplete(event));
            AssetLibrary.load(new URLRequest('assets/suzanne.awd'));
        }

        /**
         * Navigation and render loop
         */
        private onEnterFrame(dt:number):void
        {
            this._time += dt;

            if (this._suzanne)
                this._suzanne.rotationY += 1;

            this._view.render();
        }

        /**
         * Listener function for asset complete event on loader
         */
        private onAssetComplete(event:AssetEvent)
        {
            var asset:IAsset = event.asset;

            switch (asset.assetType)
            {
                case AssetType.MESH :
                    var mesh:Mesh = <Mesh> asset;
                    mesh.y = -300;
                    mesh.transform.scale = new Vector3D(900, 900, 900);

                    this._suzanne = mesh;
                    this._view.scene.addChild(mesh);
                    break;
                case AssetType.MATERIAL:
                    var material:TriangleMethodMaterial = <TriangleMethodMaterial> asset;
                    material.lightPicker = this._lightPicker;
                    break;
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
}

window.onload = function ()
{
    new examples.Basic_LoadAWD();
}