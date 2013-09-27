///<reference path="../libs/Away3D.next.d.ts" />

module examples
{

	export class TorusPrimitive {

		private _view:away.containers.View3D;
		private _torus:away.primitives.TorusGeometry;
		private _mesh:away.entities.Mesh;
		private _raf:away.utils.RequestAnimationFrame;
		private _image:HTMLImageElement;
		private _texture:away.textures.HTMLImageElementTexture;
		private _material:away.materials.TextureMaterial;
		private _light:away.lights.DirectionalLight;
		private _lightPicker:away.materials.StaticLightPicker

		constructor ()
		{

			this.initView();
			this.loadResources (); // Start loading the resources
			window.onresize = () => this.resize (); // Add event handler for window resize
		}

		/**
		 *
		 */
		private initView()
		{
			this._view = new away.containers.View3D ();// Create the Away3D View
			this._view.backgroundColor = 0x000000;// Change the background color to black
		}
		/**
		 *
		 */
		private loadResources ()
		{
			var urlRequest:away.net.URLRequest = new away.net.URLRequest ("assets/dots.png");
			var imgLoader:away.net.IMGLoader = new away.net.IMGLoader (); // Image Loader
			imgLoader.addEventListener (away.events.Event.COMPLETE, this.imageCompleteHandler, this); // Add event listener for image complete
			imgLoader.load (urlRequest); // start loading
		}

		/**
		 *
		 */
		private initLights ():void
		{
			this._light = new away.lights.DirectionalLight (); // Create a directional light
			this._light.diffuse = .7;
			this._light.specular = 1;
			this._view.scene.addChild (this._light);
			this._lightPicker = new away.materials.StaticLightPicker ([this._light]); // Create a light picker
		}

		/**
		 *
		 */
		private initMaterial (imageLoader:away.net.IMGLoader):void
		{
			this._image = imageLoader.image;
			this._texture = new away.textures.HTMLImageElementTexture (this._image, false); // Create a texture
			this._material = new away.materials.TextureMaterial (this._texture, true, true, false); // Create a material
			this._material.lightPicker = this._lightPicker; // assign the lights to the material
		}

		/**
		 *
		 */
		private initTorus ():void
		{
			this._torus = new away.primitives.TorusGeometry (220, 80, 32, 16, false); // Create the TorusGeometry
			this._mesh = new away.entities.Mesh (this._torus, this._material); // Create the mesh with the TorusGeometry
			this._view.scene.addChild (this._mesh); // Add the mesh to the scene
		}

		/**
		 *
		 */
		private startRAF ():void
		{
			this._raf = new away.utils.RequestAnimationFrame (this.render, this);
			this._raf.start (); // Start the frame loop ( request animation frame )
		}

		/**
		 *
		 */
		private imageCompleteHandler (e)
		{
			this.initLights ();
			this.initMaterial (<away.net.IMGLoader> e.target);
			this.initTorus ();
			this.resize ();
			this.startRAF ();
		}

		/**
		 *
		 */
		public render (dt:number = null):void
		{
			this._mesh.rotationY += 1;
			this._view.render ();
		}

		/**
		 *
		 */
		public resize ()
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
	new examples.TorusPrimitive (); // Start the demo
}