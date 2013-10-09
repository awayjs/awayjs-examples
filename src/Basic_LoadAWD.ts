///<reference path="../libs/Away3D.next.d.ts" />

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

    export class Basic_LoadAWD
    {
        //engine variables
        private _view:away.containers.View3D;

        //light objects
        private _light:away.lights.DirectionalLight;
        private _lightPicker:away.materials.StaticLightPicker;
        private _direction:away.geom.Vector3D;

        //scene objects
        private _suzanne:away.entities.Mesh;

        //navigation variables
        private _timer:away.utils.RequestAnimationFrame;
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
            this._view = new away.containers.View3D();

            //set the background of the view to something suitable
            this._view.backgroundColor = 0x1e2125;

            //position the camera
            this._view.camera.z = -2000;
        }

        /**
         * Initialise the lights
         */
        private initLights():void
        {
            //create the light for the scene
            this._light = new away.lights.DirectionalLight();
            this._light.color = 0x683019;
            this._light.direction = new away.geom.Vector3D(1, 0, 0);
            this._light.ambient = 0.5;
            this._light.ambientColor = 0x30353b;
            this._light.diffuse = 2.8;
            this._light.specular = 1.8;
            this._view.scene.addChild(this._light);

            //create the lightppicker for the material
            this._lightPicker = new away.materials.StaticLightPicker([this._light]);
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
            this._view.scene.addChild(new away.entities.Mesh(new away.primitives.SphereGeometry(0)))
        }

        /**
         * Initialise the listeners
         */
        private initListeners():void
        {
            window.onresize  = (event) => this.onResize(event);

            this.onResize();

            this._timer = new away.utils.RequestAnimationFrame(this.onEnterFrame, this);
            this._timer.start();

            away.library.AssetLibrary.enableParser(away.loaders.AWDParser);

            away.library.AssetLibrary.addEventListener(away.events.AssetEvent.ASSET_COMPLETE, this.onAssetComplete, this);

            away.library.AssetLibrary.load(new away.net.URLRequest('assets/suzanne.awd'));
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
        private onAssetComplete (event:away.events.AssetEvent)
        {
            var asset:away.library.IAsset = event.asset;

            switch (asset.assetType)
            {
                case away.library.AssetType.MESH :
                    var mesh:away.entities.Mesh = <away.entities.Mesh> asset;
                    mesh.y = -300;
                    mesh.scale(900);

                    this._suzanne = mesh;
                    this._view.scene.addChild(mesh);

                    break;

                case away.library.AssetType.GEOMETRY:

                    break;

                case away.library.AssetType.MATERIAL:
                    //*
                    var material:away.materials.TextureMaterial = <away.materials.TextureMaterial> asset;
                    material.lightPicker = this._lightPicker;

                    break;
            }
        }

        /**
         * stage listener for resize events
         */
        private onResize(event = null):void
        {
            this._view.y         = 0;
            this._view.x         = 0;
            this._view.width     = window.innerWidth;
            this._view.height    = window.innerHeight;
        }
    }
}

window.onload = function ()
{
    new examples.Basic_LoadAWD();
}