(function e(i,r,a){function t(s,o){if(!r[s]){if(!i[s]){var l=typeof require=="function"&&require;if(!o&&l)return l(s,!0);if(n)return n(s,!0);var d=new Error("Cannot find module '"+s+"'");throw d.code="MODULE_NOT_FOUND",d}var u=r[s]={exports:{}};i[s][0].call(u.exports,function(e){var r=i[s][1][e];return t(r?r:e)},u,u.exports,e,i,r,a)}return r[s].exports}var n=typeof require=="function"&&require;for(var s=0;s<a.length;s++)t(a[s]);return t})({"./src/Basic_View.ts":[function(e,i,r){var a=e("awayjs-core/lib/events/LoaderEvent");var t=e("awayjs-core/lib/geom/Vector3D");var n=e("awayjs-core/lib/library/AssetLibrary");var s=e("awayjs-core/lib/net/URLRequest");var o=e("awayjs-core/lib/utils/RequestAnimationFrame");var l=e("awayjs-display/lib/containers/View");var d=e("awayjs-display/lib/prefabs/PrimitivePlanePrefab");var u=e("awayjs-display/lib/textures/Single2DTexture");var w=e("awayjs-renderergl/lib/DefaultRenderer");var f=e("awayjs-methodmaterials/lib/MethodMaterial");var c=e("awayjs-methodmaterials/lib/pool/MethodRendererPool");var h=function(){function e(){var e=this;this._view=new l(new w(c));this._view.camera.z=-600;this._view.camera.y=500;this._view.camera.lookAt(new t);this._planeMaterial=new f;this._plane=new d(700,700).getNewObject();this._plane.material=this._planeMaterial;this._view.scene.addChild(this._plane);window.onresize=function(i){return e.onResize(i)};this.onResize();this._timer=new o(this.onEnterFrame,this);this._timer.start();n.addEventListener(a.RESOURCE_COMPLETE,function(i){return e.onResourceComplete(i)});n.load(new s("assets/floor_diffuse.jpg"))}e.prototype.onEnterFrame=function(e){this._plane.rotationY+=1;this._view.render()};e.prototype.onResourceComplete=function(e){var i=e.assets;var r=i.length;for(var a=0;a<r;a++){var t=i[a];console.log(t.name,e.url);switch(e.url){case"assets/floor_diffuse.jpg":this._planeMaterial.texture=new u(t);break}}};e.prototype.onResize=function(e){if(e===void 0){e=null}this._view.y=0;this._view.x=0;this._view.width=window.innerWidth;this._view.height=window.innerHeight};return e}();window.onload=function(){new h}},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Basic_View.ts"]);

//# sourceMappingURL=Basic_View.js.map