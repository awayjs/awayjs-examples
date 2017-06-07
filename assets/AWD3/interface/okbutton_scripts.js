/*Color = require('awayjs-player/lib/adapters/AS2ColorAdapter');
System = require('awayjs-player/lib/adapters/AS2SystemAdapter');
Sound = require('awayjs-player/lib/adapters/AS2SoundAdapter');
Key = require('awayjs-player/lib/adapters/AS2KeyAdapter');
Mouse = require('awayjs-player/lib/adapters/AS2MouseAdapter');
Stage = require('awayjs-player/lib/adapters/AS2StageAdapter');
SharedObject = require('awayjs-player/lib/adapters/AS2SharedObjectAdapter');
*/int = function (value) { return Math.floor(value) | 0; };
string = function (value) { return value.toString(); };
getURL = function (value) { return value; };

var okbutton_scripts = {

    //AnimateCC: Symbol: Sprites/Jump #frame: 1
    'Sprites/Jump_f1' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		_this.gotoAndStop("out");
        		_this.trace("OKButton.xfl - disabled 'callback(com.whizz.messaging.ProfessorJumpLessonConfirm.CONFIRM);' for now");
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Jump #frame: 2
    'Sprites/Jump_f2' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onMouseDown = function () {
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onMouseUp = function () {
        		_this.gotoAndStop("out");
        		_this.trace("OKButton.xfl - disabled 'callback(com.whizz.messaging.ProfessorJumpLessonConfirm.CONFIRM);' for now");
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Jump #frame: 3
    'Sprites/Jump_f3' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onMouseDown = function () {
        		_this.gotoAndStop("out");
        		_this.trace("OKButton.xfl - disabled 'callback(com.whizz.messaging.ProfessorJumpLessonConfirm.CONFIRM);' for now");
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Jump #frame: 4
    'Sprites/Jump_f4' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("disabled_over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("disabled");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("disabled_over");
        	};
        	_this.hotspot.onRelease = function () {
        		_this.gotoAndStop("disabled");
        		_this.trace("OKButton.xfl - disabled 'callback(com.whizz.messaging.ProfessorJumpLessonConfirm.LOCKED);' for now");
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Jump #frame: 5
    'Sprites/Jump_f5' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("disabled_over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("disabled");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("disabled_over");
        	};
        	_this.hotspot.onRelease = function () {
        		_this.gotoAndStop("disabled");
        		_this.trace("OKButton.xfl - disabled 'callback(com.whizz.messaging.ProfessorJumpLessonConfirm.LOCKED);' for now");
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Skip #frame: 1
    'Sprites/Skip_f1' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		_this.gotoAndStop("out");
        		_this.myManager.skipAssessmentExercise();
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Skip #frame: 2
    'Sprites/Skip_f2' : function(){
        var _this = this;
        if (_this._parent.buttonState == "tp") {
        	_this.exColour._visible = false;
        	_this.tpColour._visible = true;
        } else {
        	_this.tpColour._visible = false;
        	_this.exColour._visible = true;
        }
        _this.stop();
    },

    //AnimateCC: Symbol: Sprites/Skip #frame: 3
    'Sprites/Skip_f3' : function(){
        var _this = this;
        _this.stop();
    },

    //AnimateCC: Symbol: Sprites/OK #frame: 1
    'Sprites/OK_f1' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        console.log("enter frame");
        if (_this.hotspot != null) {
        	console.log("hotspot is found");
        	_this.hotspot.onRollOver = function () {
        		console.log("onRollOver");
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		console.log("onRollOut");
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		console.log("onPress");
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		console.log("onRelease");
        		_this.gotoAndStop("out");
        		_this.myManager.pressOK();
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/OK #frame: 2
    'Sprites/OK_f2' : function(){
        var _this = this;
        if (_this._parent.buttonState == "tp") {
        	_this.exColour._visible = false;
        	_this.tpColour._visible = true;
        } else {
        	_this.tpColour._visible = false;
        	_this.exColour._visible = true;
        }
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        console.log("enter frame");
        if (_this.hotspot != null) {
        	console.log("hotspot is found");
        	_this.hotspot.onRollOver = function () {
        		console.log("onRollOver");
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		console.log("onRollOut");
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		console.log("onPress");
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		console.log("onRelease");
        		_this.gotoAndStop("out");
        		_this.myManager.pressOK();
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/OK #frame: 3
    'Sprites/OK_f3' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        console.log("enter frame");
        if (_this.hotspot != null) {
        	console.log("hotspot is found");
        	_this.hotspot.onRollOver = function () {
        		console.log("onRollOver");
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		console.log("onRollOut");
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		console.log("onPress");
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		console.log("onRelease");
        		_this.gotoAndStop("out");
        		_this.myManager.pressOK();
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Sprite 17 #frame: 1
    'Sprites/Sprite 17_f1' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		_this.gotoAndStop("out");
        		_this.myManager.pressLeft();
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Sprite 17 #frame: 2
    'Sprites/Sprite 17_f2' : function(){
        var _this = this;
        if (_this._parent.buttonState == "tp") {
        	_this.exColour._visible = false;
        	_this.tpColour._visible = true;
        } else {
        	_this.tpColour._visible = false;
        	_this.exColour._visible = true;
        }
        _this.stop();
    },

    //AnimateCC: Symbol: Sprites/Sprite 17 #frame: 3
    'Sprites/Sprite 17_f3' : function(){
        var _this = this;
        _this.stop();
    },

    //AnimateCC: Symbol: Sprites/Glass Arrow #frame: 1
    'Sprites/Glass Arrow_f1' : function(){
        var _this = this;
        _this.stop();
        var _this = this;
        _this.myManager = window._global.myManager;
        if (_this.hotspot != null) {
        	_this.hotspot.onRollOver = function () {
        		_this.gotoAndStop("over");
        	};
        	_this.hotspot.onRollOut = function () {
        		_this.gotoAndStop("out");
        	}
        	_this.hotspot.onPress = function () {
        		_this.gotoAndStop("down");
        	};
        	_this.hotspot.onRelease = function () {
        		_this.gotoAndStop("out");
        		_this.myManager.pressRight();
        	};
        }
    },

    //AnimateCC: Symbol: Sprites/Glass Arrow #frame: 2
    'Sprites/Glass Arrow_f2' : function(){
        var _this = this;
        if (_this._parent.buttonState == "tp") {
        	_this.exColour._visible = false;
        	_this.tpColour._visible = true;
        } else {
        	_this.tpColour._visible = false;
        	_this.exColour._visible = true;
        }
        _this.stop();
    },

    //AnimateCC: Symbol: Sprites/Glass Arrow #frame: 3
    'Sprites/Glass Arrow_f3' : function(){
        var _this = this;
        _this.stop();
    },

    //AnimateCC: Symbol: Scene 1 #frame: 1
    'Scene 1_f1' : function(){
        var _this = this;
        _this.myManager = window._global.myManager;
        
        console.log("connected to mymanager");
    },
};
