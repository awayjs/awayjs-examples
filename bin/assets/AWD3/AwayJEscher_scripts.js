Color = require('awayjs-player/lib/adapters/AS2ColorAdapter');
System = require('awayjs-player/lib/adapters/AS2SystemAdapter');
Sound = require('awayjs-player/lib/adapters/AS2SoundAdapter');
Key = require('awayjs-player/lib/adapters/AS2KeyAdapter');
Mouse = require('awayjs-player/lib/adapters/AS2MouseAdapter');
Stage = require('awayjs-player/lib/adapters/AS2StageAdapter');
SharedObject = require('awayjs-player/lib/adapters/AS2SharedObjectAdapter');
int = function (value) { return Math.floor(value) | 0; };
string = function (value) { return value.toString(); };
getURL = function (value) { return value; };

var AwayJEscher_scripts = {

    //AnimateCC: Symbol: rose bud anim #frame: 1
    'rose bud anim_f1' : function(){
        var _this = this;
        _this.stop();
        console.log("rose frame1 ", _this.adaptee.numChildren);
    },

    //AnimateCC: Symbol: flower icon display #frame: 1
    'flower icon display_f1' : function(){
        var _this = this;
        _this.stop();
        console.log("flower_icon frame1 ", _this.adaptee.numChildren);var _this = this;
        if (_this.flowerbtn != null) {
        	_this.flowerbtn.onRelease = function () {
        	};
        }
    },

    //AnimateCC: Symbol: pause_flower_cont #frame: 1
    'pause_flower_cont_f1' : function(){
        var _this = this;
        _this.stop();
        console.log("pause_flower_cont frame1 ", _this.adaptee.numChildren);
        var _this = this;
        if (_this.unpause != null) {
        	_this.unpause.onRelease = function () {
        		
        	};
        	_this.unpause.adaptee.addEventListener("mouseDown3d", function(evt){console.log("evt = ", evt);});
        }
    },

    //AnimateCC: Symbol: pause_flower_cont #frame: 2
    'pause_flower_cont_f2' : function(){
        var _this = this;
        _this.stop();
        console.log("scene1 frame2 ", _this.adaptee.numChildren);
    },

    //AnimateCC: Symbol: Scene 1 #frame: 1
    'Scene 1_f1' : function(){
        var _this = this;
        _this.stop();
        console.log("scene frame1 ", _this.adaptee.numChildren);
    },
};
