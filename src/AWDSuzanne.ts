///<reference path="../libs/away3d.next.d.ts" />

module examples {

	export class AWDSuzanne {

		private _view:away.containers.View;
		private _token:away.net.AssetLoaderToken;
		private _timer:away.utils.RequestAnimationFrame;
		private _suzane:away.entities.Mesh;
		private _light:away.lights.DirectionalLight;
		private _lightPicker:away.materials.StaticLightPicker;
		private _lookAtPosition:away.geom.Vector3D = new away.geom.Vector3D ();
		private _cameraIncrement:number = 0;

		constructor ()
		{

			this.initView ();
			this.loadAssets ();
			this.initLights ();

			window.onresize = () => this.resize ();
			this.resize ();
		}

		/**
		 *
		 */
		private initView ():void
		{
			this._view = new away.containers.View(new away.render.DefaultRenderer());
			this._view.camera.projection.far = 6000;
		}

		/**
		 *
		 */
		private loadAssets ():void
		{
			this._timer = new away.utils.RequestAnimationFrame (this.render, this);
			this._timer.start ();

			away.library.AssetLibrary.enableParser (away.parsers.AWDParser);

			this._token = away.library.AssetLibrary.load (new away.net.URLRequest ('assets/suzanne.awd'));
			this._token.addEventListener (away.events.LoaderEvent.RESOURCE_COMPLETE, (event:away.events.LoaderEvent) => this.onResourceComplete(event));

		}

		/**
		 *
		 */
		private initLights ():void
		{
			this._light = new away.lights.DirectionalLight ();
			this._light.color = 0x683019;
			this._light.direction = new away.geom.Vector3D (1, 0, 0);
			this._light.ambient = 0.1;
			this._light.ambientColor = 0x85b2cd;
			this._light.diffuse = 2.8;
			this._light.specular = 1.8;
			this._view.scene.addChild (this._light);
			this._lightPicker = new away.materials.StaticLightPicker ([this._light]);
		}

		/**
		 *
		 */
		private resize ()
		{
			this._view.y = 0;
			this._view.x = 0;
			this._view.width = window.innerWidth;
			this._view.height = window.innerHeight;
		}

		/**
		 *
		 * @param dt
		 */
		private render (dt:number) //animate based on dt for firefox
		{

			if (this._view.camera)
			{
				this._view.camera.lookAt (this._lookAtPosition);
				this._cameraIncrement += 0.01;
				this._view.camera.x = Math.cos (this._cameraIncrement) * 1400;
				this._view.camera.z = Math.sin (this._cameraIncrement) * 1400;

				this._light.x = Math.cos (this._cameraIncrement) * 1400;
				this._light.y = Math.sin (this._cameraIncrement) * 1400;

			}

			this._view.render ();

		}

		/**
		 *
		 * @param e
		 */
		public onResourceComplete (e:away.events.LoaderEvent)
		{

			var loader:away.net.AssetLoader = <away.net.AssetLoader> e.target;
			var numAssets:number = loader.baseDependency.assets.length;

			for (var i:number = 0; i < numAssets; ++i)
			{
				var asset:away.library.IAsset = loader.baseDependency.assets[ i ];

				switch (asset.assetType)
				{
					case away.library.AssetType.MESH:

						var mesh:away.entities.Mesh = <away.entities.Mesh> asset;

						this._suzane = mesh;
						this._suzane.material.lightPicker = this._lightPicker;
						this._suzane.y = -100;

						for (var c:number = 0; c < 80; c++)
						{

							var clone:away.entities.Mesh = <away.entities.Mesh> mesh.clone ();
							var scale:number = this.getRandom (50, 200)
							clone.x = this.getRandom (-2000, 2000);
							clone.y = this.getRandom (-2000, 2000);
							clone.z = this.getRandom (-2000, 2000);
							clone.transform.scale = new away.geom.Vector3D(scale, scale, scale);
							clone.rotationY = this.getRandom (0, 360);
							this._view.scene.addChild (clone);

						}

						mesh.transform.scale = new away.geom.Vector3D(500, 500, 500);
						this._view.scene.addChild (mesh);

						break;

					case away.library.AssetType.GEOMETRY:
						break;

					case away.library.AssetType.MATERIAL:
						break;

				}

			}

		}

		/**
		 *
		 * @param min
		 * @param max
		 * @returns {number}
		 */
		private getRandom (min:number, max:number):number
		{
			return Math.random () * (max - min) + min;
		}

	}

}

window.onload = function()
{
	new examples.AWDSuzanne();
}

