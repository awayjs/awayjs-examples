(function e(t,i,a){function s(n,l){if(!i[n]){if(!t[n]){var o=typeof require=="function"&&require;if(!l&&o)return o(n,!0);if(r)return r(n,!0);var h=new Error("Cannot find module '"+n+"'");throw h.code="MODULE_NOT_FOUND",h}var u=i[n]={exports:{}};t[n][0].call(u.exports,function(e){var i=t[n][1][e];return s(i?i:e)},u,u.exports,e,t,i,a)}return i[n].exports}var r=typeof require=="function"&&require;for(var n=0;n<a.length;n++)s(a[n]);return s})({"./src/Basic_Shading.ts":[function(e,t,i){var a=e("awayjs-core/lib/events/LoaderEvent");var s=e("awayjs-core/lib/geom/Vector3D");var r=e("awayjs-core/lib/library/AssetLibrary");var n=e("awayjs-core/lib/net/URLRequest");var l=e("awayjs-core/lib/utils/RequestAnimationFrame");var o=e("awayjs-display/lib/containers/Scene");var h=e("awayjs-display/lib/containers/View");var u=e("awayjs-display/lib/controllers/HoverController");var c=e("awayjs-display/lib/entities/Camera");var d=e("awayjs-display/lib/entities/DirectionalLight");var _=e("awayjs-display/lib/managers/DefaultMaterialManager");var p=e("awayjs-display/lib/materials/lightpickers/StaticLightPicker");var w=e("awayjs-display/lib/prefabs/PrimitiveCubePrefab");var f=e("awayjs-display/lib/prefabs/PrimitivePlanePrefab");var b=e("awayjs-display/lib/prefabs/PrimitiveSpherePrefab");var m=e("awayjs-display/lib/prefabs/PrimitiveTorusPrefab");var g=e("awayjs-display/lib/textures/Single2DTexture");var y=e("awayjs-renderergl/lib/DefaultRenderer");var v=e("awayjs-methodmaterials/lib/MethodMaterial");var j=e("awayjs-methodmaterials/lib/pool/MethodRendererPool");var M=function(){function e(){this._time=0;this._move=false;this.init()}e.prototype.init=function(){this.initEngine();this.initLights();this.initMaterials();this.initObjects();this.initListeners()};e.prototype.initEngine=function(){this._scene=new o;this._camera=new c;this._view=new h(new y(j));this._view.scene=this._scene;this._view.camera=this._camera;this._cameraController=new u(this._camera);this._cameraController.distance=1e3;this._cameraController.minTiltAngle=0;this._cameraController.maxTiltAngle=90;this._cameraController.panAngle=45;this._cameraController.tiltAngle=20};e.prototype.initLights=function(){this._light1=new d;this._light1.direction=new s(0,-1,0);this._light1.ambient=.1;this._light1.diffuse=.7;this._scene.addChild(this._light1);this._light2=new d;this._light2.direction=new s(0,-1,0);this._light2.color=65535;this._light2.ambient=.1;this._light2.diffuse=.7;this._scene.addChild(this._light2);this._lightPicker=new p([this._light1,this._light2])};e.prototype.initMaterials=function(){this._planeMaterial=new v(_.getDefaultTexture());this._planeMaterial.lightPicker=this._lightPicker;this._planeMaterial.repeat=true;this._sphereMaterial=new v(_.getDefaultTexture());this._sphereMaterial.lightPicker=this._lightPicker;this._cubeMaterial=new v(_.getDefaultTexture());this._cubeMaterial.lightPicker=this._lightPicker;this._cubeMaterial.mipmap=false;this._torusMaterial=new v(_.getDefaultTexture());this._torusMaterial.lightPicker=this._lightPicker;this._torusMaterial.repeat=true};e.prototype.initObjects=function(){this._plane=new f(1e3,1e3).getNewObject();this._plane.material=this._planeMaterial;this._plane.geometry.scaleUV(2,2);this._plane.y=-20;this._scene.addChild(this._plane);this._sphere=new b(150,40,20).getNewObject();this._sphere.material=this._sphereMaterial;this._sphere.x=300;this._sphere.y=160;this._sphere.z=300;this._scene.addChild(this._sphere);this._cube=new w(200,200,200,1,1,1,false).getNewObject();this._cube.material=this._cubeMaterial;this._cube.x=300;this._cube.y=160;this._cube.z=-250;this._scene.addChild(this._cube);this._torus=new m(150,60,40,20).getNewObject();this._torus.material=this._torusMaterial;this._torus.geometry.scaleUV(10,5);this._torus.x=-250;this._torus.y=160;this._torus.z=-250;this._scene.addChild(this._torus)};e.prototype.initListeners=function(){var e=this;window.onresize=function(t){return e.onResize(t)};document.onmousedown=function(t){return e.onMouseDown(t)};document.onmouseup=function(t){return e.onMouseUp(t)};document.onmousemove=function(t){return e.onMouseMove(t)};document.onmousewheel=function(t){return e.onMouseWheel(t)};this.onResize();this._timer=new l(this.onEnterFrame,this);this._timer.start();r.addEventListener(a.RESOURCE_COMPLETE,function(t){return e.onResourceComplete(t)});r.load(new n("assets/floor_diffuse.jpg"));r.load(new n("assets/floor_normal.jpg"));r.load(new n("assets/floor_specular.jpg"));r.load(new n("assets/beachball_diffuse.jpg"));r.load(new n("assets/beachball_specular.jpg"));r.load(new n("assets/trinket_diffuse.jpg"));r.load(new n("assets/trinket_normal.jpg"));r.load(new n("assets/trinket_specular.jpg"));r.load(new n("assets/weave_diffuse.jpg"));r.load(new n("assets/weave_normal.jpg"))};e.prototype.onEnterFrame=function(e){this._time+=e;this._light1.direction=new s(Math.sin(this._time/1e4)*15e4,-1e3,Math.cos(this._time/1e4)*15e4);this._view.render()};e.prototype.onResourceComplete=function(e){var t=e.assets;var i=t.length;for(var a=0;a<i;a++){var s=t[a];console.log(s.name,e.url);switch(e.url){case"assets/floor_diffuse.jpg":this._planeMaterial.texture=new g(s);break;case"assets/floor_normal.jpg":this._planeMaterial.normalMap=new g(s);break;case"assets/floor_specular.jpg":this._planeMaterial.specularMap=new g(s);break;case"assets/beachball_diffuse.jpg":this._sphereMaterial.texture=new g(s);break;case"assets/beachball_specular.jpg":this._sphereMaterial.specularMap=new g(s);break;case"assets/trinket_diffuse.jpg":this._cubeMaterial.texture=new g(s);break;case"assets/trinket_normal.jpg":this._cubeMaterial.normalMap=new g(s);break;case"assets/trinket_specular.jpg":this._cubeMaterial.specularMap=new g(s);break;case"assets/weave_diffuse.jpg":this._torusMaterial.texture=new g(s);break;case"assets/weave_normal.jpg":this._torusMaterial.normalMap=this._torusMaterial.specularMap=new g(s);break}}};e.prototype.onMouseDown=function(e){this._lastPanAngle=this._cameraController.panAngle;this._lastTiltAngle=this._cameraController.tiltAngle;this._lastMouseX=e.clientX;this._lastMouseY=e.clientY;this._move=true};e.prototype.onMouseUp=function(e){this._move=false};e.prototype.onMouseMove=function(e){if(this._move){this._cameraController.panAngle=.3*(e.clientX-this._lastMouseX)+this._lastPanAngle;this._cameraController.tiltAngle=.3*(e.clientY-this._lastMouseY)+this._lastTiltAngle}};e.prototype.onMouseWheel=function(e){this._cameraController.distance-=e.wheelDelta;if(this._cameraController.distance<100)this._cameraController.distance=100;else if(this._cameraController.distance>2e3)this._cameraController.distance=2e3};e.prototype.onResize=function(e){if(e===void 0){e=null}this._view.y=0;this._view.x=0;this._view.width=window.innerWidth;this._view.height=window.innerHeight};return e}();window.onload=function(){new M}},{"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-display/lib/containers/Scene":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/managers/DefaultMaterialManager":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitiveCubePrefab":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/prefabs/PrimitiveSpherePrefab":undefined,"awayjs-display/lib/prefabs/PrimitiveTorusPrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined}]},{},["./src/Basic_Shading.ts"]);

//# sourceMappingURL=Basic_Shading.js.map