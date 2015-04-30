(function e(i,t,a){function r(s,o){if(!t[s]){if(!i[s]){var l=typeof require=="function"&&require;if(!o&&l)return l(s,!0);if(n)return n(s,!0);var d=new Error("Cannot find module '"+s+"'");throw d.code="MODULE_NOT_FOUND",d}var h=t[s]={exports:{}};i[s][0].call(h.exports,function(e){var t=i[s][1][e];return r(t?t:e)},h,h.exports,e,i,t,a)}return t[s].exports}var n=typeof require=="function"&&require;for(var s=0;s<a.length;s++)r(a[s]);return r})({"./src/Basic_Fire.ts":[function(e,i,t){var a=e("awayjs-core/lib/data/BlendMode");var r=e("awayjs-core/lib/events/LoaderEvent");var n=e("awayjs-core/lib/events/TimerEvent");var s=e("awayjs-core/lib/geom/ColorTransform");var o=e("awayjs-core/lib/geom/Vector3D");var l=e("awayjs-core/lib/library/AssetLibrary");var d=e("awayjs-core/lib/net/URLRequest");var h=e("awayjs-core/lib/utils/RequestAnimationFrame");var c=e("awayjs-core/lib/utils/Timer");var u=e("awayjs-display/lib/containers/Scene");var f=e("awayjs-display/lib/containers/View");var m=e("awayjs-display/lib/controllers/HoverController");var w=e("awayjs-display/lib/entities/DirectionalLight");var p=e("awayjs-display/lib/entities/Camera");var y=e("awayjs-display/lib/entities/Mesh");var g=e("awayjs-display/lib/entities/PointLight");var v=e("awayjs-display/lib/materials/lightpickers/StaticLightPicker");var b=e("awayjs-display/lib/prefabs/PrimitivePlanePrefab");var j=e("awayjs-display/lib/textures/Single2DTexture");var M=e("awayjs-renderergl/lib/animators/ParticleAnimationSet");var P=e("awayjs-renderergl/lib/animators/ParticleAnimator");var A=e("awayjs-renderergl/lib/animators/data/ParticlePropertiesMode");var L=e("awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode");var C=e("awayjs-renderergl/lib/animators/nodes/ParticleScaleNode");var T=e("awayjs-renderergl/lib/animators/nodes/ParticleVelocityNode");var S=e("awayjs-renderergl/lib/animators/nodes/ParticleColorNode");var O=e("awayjs-methodmaterials/lib/MethodMaterial");var E=e("awayjs-methodmaterials/lib/pool/MethodRendererPool");var R=e("awayjs-methodmaterials/lib/MethodMaterialMode");var _=e("awayjs-renderergl/lib/DefaultRenderer");var D=e("awayjs-renderergl/lib/utils/ParticleGeometryHelper");var N=function(){function e(){this.fireObjects=new Array;this.time=0;this.move=false;this.init()}e.prototype.init=function(){this.initEngine();this.initLights();this.initMaterials();this.initParticles();this.initObjects();this.initListeners()};e.prototype.initEngine=function(){this.scene=new u;this.camera=new p;this.view=new f(new _(E));this.view.scene=this.scene;this.view.camera=this.camera;this.cameraController=new m(this.camera);this.cameraController.distance=1e3;this.cameraController.minTiltAngle=0;this.cameraController.maxTiltAngle=90;this.cameraController.panAngle=45;this.cameraController.tiltAngle=20};e.prototype.initLights=function(){this.directionalLight=new w(0,-1,0);this.directionalLight.castsShadows=false;this.directionalLight.color=15654365;this.directionalLight.diffuse=.5;this.directionalLight.ambient=.5;this.directionalLight.specular=0;this.directionalLight.ambientColor=8421520;this.view.scene.addChild(this.directionalLight);this.lightPicker=new v([this.directionalLight])};e.prototype.initMaterials=function(){this.planeMaterial=new O;this.planeMaterial.mode=R.MULTI_PASS;this.planeMaterial.lightPicker=this.lightPicker;this.planeMaterial.repeat=true;this.planeMaterial.mipmap=false;this.planeMaterial.specular=10;this.particleMaterial=new O;this.particleMaterial.blendMode=a.ADD};e.prototype.initParticles=function(){this.fireAnimationSet=new M(true,true);this.fireAnimationSet.addAnimation(new L);this.fireAnimationSet.addAnimation(new C(A.GLOBAL,false,false,2.5,.5));this.fireAnimationSet.addAnimation(new T(A.GLOBAL,new o(0,80,0)));this.fireAnimationSet.addAnimation(new S(A.GLOBAL,true,true,false,false,new s(0,0,0,1,255,51,1),new s(0,0,0,1,153)));this.fireAnimationSet.addAnimation(new T(A.LOCAL_STATIC));this.fireAnimationSet.initParticleFunc=this.initParticleFunc;var e=new b(10,10,1,1,false);var i=new Array;for(var t=0;t<500;t++)i.push(e.geometry);this.particleGeometry=D.generateGeometry(i)};e.prototype.initObjects=function(){var i=this;this.plane=new b(1e3,1e3).getNewObject();this.plane.material=this.planeMaterial;this.plane.geometry.scaleUV(2,2);this.plane.y=-20;this.scene.addChild(this.plane);for(var t=0;t<e.NUM_FIRES;t++){var a=new y(this.particleGeometry,this.particleMaterial);var r=new P(this.fireAnimationSet);a.animator=r;var s=t/e.NUM_FIRES*Math.PI*2;a.x=Math.sin(s)*400;a.z=Math.cos(s)*400;a.y=5;this.fireObjects.push(new x(a,r));this.view.scene.addChild(a)}this.fireTimer=new c(1e3,this.fireObjects.length);this.fireTimer.addEventListener(n.TIMER,function(e){return i.onTimer(e)});this.fireTimer.start()};e.prototype.initListeners=function(){var e=this;window.onresize=function(i){return e.onResize(i)};document.onmousedown=function(i){return e.onMouseDown(i)};document.onmouseup=function(i){return e.onMouseUp(i)};document.onmousemove=function(i){return e.onMouseMove(i)};this.onResize();this.timer=new h(this.onEnterFrame,this);this.timer.start();l.addEventListener(r.RESOURCE_COMPLETE,function(i){return e.onResourceComplete(i)});l.load(new d("assets/floor_diffuse.jpg"));l.load(new d("assets/floor_normal.jpg"));l.load(new d("assets/floor_specular.jpg"));l.load(new d("assets/blue.png"))};e.prototype.initParticleFunc=function(e){e.startTime=Math.random()*5;e.duration=Math.random()*4+.1;var i=Math.random()*Math.PI*2;var t=Math.random()*Math.PI*2;var a=15;e[T.VELOCITY_VECTOR3D]=new o(a*Math.sin(i)*Math.cos(t),a*Math.cos(i)*Math.cos(t),a*Math.sin(t))};e.prototype.getAllLights=function(){var e=new Array;e.push(this.directionalLight);var i;for(var t=0;t<this.fireObjects.length;t++){i=this.fireObjects[t];if(i.light)e.push(i.light)}return e};e.prototype.onTimer=function(e){var i=this.fireObjects[this.fireTimer.currentCount-1];i.animator.start();var t=new g;t.color=16724737;t.diffuse=0;t.specular=0;t.transform.position=i.mesh.transform.position;i.light=t;this.lightPicker.lights=this.getAllLights()};e.prototype.onEnterFrame=function(e){this.time+=e;var i;for(var t=0;t<this.fireObjects.length;t++){i=this.fireObjects[t];var a=i.light;if(!a)continue;if(i.strength<1)i.strength+=.1;a.fallOff=380+Math.random()*20;a.radius=200+Math.random()*30;a.diffuse=a.specular=i.strength+Math.random()*.2}this.view.render()};e.prototype.onResourceComplete=function(e){var i=e.assets;var t=i.length;for(var a=0;a<t;a++){var r=i[a];console.log(r.name,e.url);switch(e.url){case"assets/floor_diffuse.jpg":this.planeMaterial.texture=new j(r);break;case"assets/floor_normal.jpg":this.planeMaterial.normalMap=new j(r);break;case"assets/floor_specular.jpg":this.planeMaterial.specularMap=new j(r);break;case"assets/blue.png":this.particleMaterial.texture=new j(r);break}}};e.prototype.onMouseDown=function(e){this.lastPanAngle=this.cameraController.panAngle;this.lastTiltAngle=this.cameraController.tiltAngle;this.lastMouseX=e.clientX;this.lastMouseY=e.clientY;this.move=true};e.prototype.onMouseUp=function(e){this.move=false};e.prototype.onMouseMove=function(e){if(this.move){this.cameraController.panAngle=.3*(e.clientX-this.lastMouseX)+this.lastPanAngle;this.cameraController.tiltAngle=.3*(e.clientY-this.lastMouseY)+this.lastTiltAngle}};e.prototype.onResize=function(e){if(e===void 0){e=null}this.view.y=0;this.view.x=0;this.view.width=window.innerWidth;this.view.height=window.innerHeight};e.NUM_FIRES=10;return e}();var x=function(){function e(e,i){this.strength=0;this.mesh=e;this.animator=i}return e}();window.onload=function(){new N}},{"awayjs-core/lib/data/BlendMode":undefined,"awayjs-core/lib/events/LoaderEvent":undefined,"awayjs-core/lib/events/TimerEvent":undefined,"awayjs-core/lib/geom/ColorTransform":undefined,"awayjs-core/lib/geom/Vector3D":undefined,"awayjs-core/lib/library/AssetLibrary":undefined,"awayjs-core/lib/net/URLRequest":undefined,"awayjs-core/lib/utils/RequestAnimationFrame":undefined,"awayjs-core/lib/utils/Timer":undefined,"awayjs-display/lib/containers/Scene":undefined,"awayjs-display/lib/containers/View":undefined,"awayjs-display/lib/controllers/HoverController":undefined,"awayjs-display/lib/entities/Camera":undefined,"awayjs-display/lib/entities/DirectionalLight":undefined,"awayjs-display/lib/entities/Mesh":undefined,"awayjs-display/lib/entities/PointLight":undefined,"awayjs-display/lib/materials/lightpickers/StaticLightPicker":undefined,"awayjs-display/lib/prefabs/PrimitivePlanePrefab":undefined,"awayjs-display/lib/textures/Single2DTexture":undefined,"awayjs-methodmaterials/lib/MethodMaterial":undefined,"awayjs-methodmaterials/lib/MethodMaterialMode":undefined,"awayjs-methodmaterials/lib/pool/MethodRendererPool":undefined,"awayjs-renderergl/lib/DefaultRenderer":undefined,"awayjs-renderergl/lib/animators/ParticleAnimationSet":undefined,"awayjs-renderergl/lib/animators/ParticleAnimator":undefined,"awayjs-renderergl/lib/animators/data/ParticlePropertiesMode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleBillboardNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleColorNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleScaleNode":undefined,"awayjs-renderergl/lib/animators/nodes/ParticleVelocityNode":undefined,"awayjs-renderergl/lib/utils/ParticleGeometryHelper":undefined}]},{},["./src/Basic_Fire.ts"]);

//# sourceMappingURL=Basic_Fire.js.map