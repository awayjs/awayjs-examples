///<reference path="../libs/stagegl-renderer.next.d.ts" />

module examples
{
	import View							= away.containers.View;
	import DirectionalLight				= away.entities.DirectionalLight;
	import Mesh							= away.entities.Mesh;
	import Skybox						= away.entities.Skybox;
	import LoaderEvent					= away.events.LoaderEvent;
	import Vector3D						= away.geom.Vector3D;
	import AssetLibrary					= away.library.AssetLibrary;
	import AssetLoaderContext			= away.library.AssetLoaderContext;
	import AssetType					= away.library.AssetType;
	import IAsset						= away.library.IAsset;
	import StaticLightPicker			= away.materials.StaticLightPicker;
	import TriangleMaterial				= away.materials.TriangleMaterial;
	import URLLoader					= away.net.URLLoader;
	import URLLoaderDataFormat			= away.net.URLLoaderDataFormat;
	import URLRequest					= away.net.URLRequest;
	import PrimitiveTorusPrefab			= away.prefabs.PrimitiveTorusPrefab;
	import PerspectiveProjection		= away.projections.PerspectiveProjection;
	import DefaultRenderer				= away.render.DefaultRenderer;
	import ImageTexture					= away.textures.ImageTexture;
	import RequestAnimationFrame		= away.utils.RequestAnimationFrame;

	export class TorusPrimitive {

		private _view:View;
		private _torus:PrimitiveTorusPrefab;
		private _mesh:Mesh;
		private _raf:RequestAnimationFrame;
		private _image:HTMLImageElement;
		private _texture:ImageTexture;
		private _material:TriangleMaterial;
		private _light:DirectionalLight;
		private _lightPicker:StaticLightPicker;

		constructor ()
		{

			this.initView();

			this._raf = new RequestAnimationFrame(this.render, this);
			this._raf.start(); // Start the frame loop ( request animation frame )

			this.loadResources(); // Start loading the resources
			window.onresize = (event:UIEvent) => this.resize(event); // Add event handler for window resize

			this.resize();
		}

		/**
		 *
		 */
		private initView()
		{
			this._view = new View (new DefaultRenderer());// Create the Away3D View
			this._view.backgroundColor = 0x000000;// Change the background color to black
		}

		/**
		 *
		 */
		private loadResources()
		{
			var urlRequest:URLRequest = new URLRequest ("assets/dots.png");
			var imgLoader:URLLoader = new URLLoader(); // Image Loader
			imgLoader.dataFormat = URLLoaderDataFormat.BLOB;

			imgLoader.addEventListener (away.events.Event.COMPLETE, (event:away.events.Event) => this.urlCompleteHandler(event)); // Add event listener for image complete
			imgLoader.load(urlRequest); // start loading
		}

		/**
		 *
		 * @param event
		 */
		private urlCompleteHandler (event:away.events.Event)
		{
			var imageLoader:URLLoader = <URLLoader> event.target
			this._image = away.parsers.ParserUtils.blobToImage(imageLoader.data);
			this._image.onload = (event:Event) => this.imageCompleteHandler(event);
		}

		/**
		 *
		 */
		private initLights()
		{
			this._light = new DirectionalLight(); // Create a directional light
			this._light.diffuse = .7;
			this._light.specular = 1;
			this._view.scene.addChild(this._light);
			this._lightPicker = new StaticLightPicker([this._light]); // Create a light picker
		}

		/**
		 *
		 */
		private initMaterial(image:HTMLImageElement)
		{
			this._texture = new ImageTexture(image, false); // Create a texture
			this._material = new TriangleMaterial (this._texture, true, true, false); // Create a material
			this._material.lightPicker = this._lightPicker; // assign the lights to the material
		}

		/**
		 *
		 */
		private initTorus()
		{
			this._torus = new PrimitiveTorusPrefab(220, 80, 32, 16, false); // Create the Torus prefab
			this._mesh = <Mesh> this._torus.getNewObject(); //Create the mesh
			this._mesh.material = this._material; //apply the material
			this._view.scene.addChild(this._mesh); // Add the mesh to the scene
		}

		/**
		 *
		 */
		private imageCompleteHandler(event:Event)
		{
			this.initLights ();
			this.initMaterial(<HTMLImageElement> event.target);
			this.initTorus ();
		}

		/**
		 *
		 */
		public render(dt:number = null)
		{
			if (this._mesh)
				this._mesh.rotationY += 1;

			this._view.render ();
		}

		/**
		 *
		 */
		public resize(event:UIEvent = null)
		{
			this._view.y = 0;
			this._view.x = 0;
			this._view.width = window.innerWidth;
			this._view.height = window.innerHeight;
		}
	}
}

window.onload = function()
{
	new examples.TorusPrimitive(); // Start the demo
}