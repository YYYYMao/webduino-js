+(function (factory) {
  if (typeof exports === 'undefined') {
    factory(webduino || {});
  } else {
    module.exports = factory;
  }
}(function (scope) {
  'use strict';

  var Pin = scope.Pin,
    Module = scope.Module,
    proto;

  function Led(board, pin, driveMode) {
    Module.call(this);

    this._board = board;
    this._pin = pin;
    this._driveMode = driveMode || Led.SOURCE_DRIVE;
    this._supportsPWM = undefined;
    this.stop = null;
    if (this._driveMode === Led.SOURCE_DRIVE) {
      this._onValue = 1;
      this._offValue = 0;
    } else if (this._driveMode === Led.SYNC_DRIVE) {
      this._onValue = 0;
      this._offValue = 1;
    } else {
      throw new Error('error: driveMode should be Led.SOURCE_DRIVE or Led.SYNC_DRIVE');
    }

    if (pin.capabilities[Pin.PWM]) {
      board.setDigitalPinMode(pin.number, Pin.PWM);
      this._supportsPWM = true;
    } else {
      board.setDigitalPinMode(pin.number, Pin.DOUT);
      this._supportsPWM = false;
    }
  }

  function checkPinState(self, pin, state, callback) {
    self._board.queryPinState(pin, function (pin) {
      if (pin.state === state) {
        callback.call(self);
      }
    });
  }

  Led.prototype = proto = Object.create(Module.prototype, {

    constructor: {
      value: Led
    },

    intensity: {
      get: function () {
        return this._pin.value;
      },
      set: function (val) {
        if (!this._supportsPWM) {
          if (val < 0.5) {
            val = 0;
          } else {
            val = 1;
          }
        }

        if (this._driveMode === Led.SOURCE_DRIVE) {
          this._pin.value = val;
        } else if (this._driveMode === Led.SYNC_DRIVE) {
          this._pin.value = 1 - val;
        }
      }
    }

  });


  proto.on = function (callback) {
    this.stopblink()
    this._pin.value = this._onValue;
    if (typeof callback === 'function') {
      checkPinState(this, this._pin, this._pin.value, callback);
    }
  };


  proto.off = function (callback) {

    this.stopblink()
    this._pin.value = this._offValue;
    if (typeof callback === 'function') {
      checkPinState(this, this._pin, this._pin.value, callback);
    }
  };

  proto.toggle = function (callback) {
    this.stopblink()
    this._pin.value = 1 - this._pin.value;
    if (typeof callback === 'function') {
      checkPinState(this, this._pin, this._pin.value, callback);
    }
    	
  };
  
  proto.blink = function (para,callback) {
    this.stopblink();
    var time = para?para:1000;	
    this._blink(time,callback); 

  };

  proto._blink = function (para,callback) {
    var self = this;
    var time = para?para:1000;	
    this.stop = setTimeout(function(){
	self._pin.value = 1 - self._pin.value;
	if (typeof callback === 'function') {
      		checkPinState(self, self._pin, self._pin.value, callback);
   	}
 	self._blink(time,callback);
    },time);

  };
 		
  proto.stopblink = function(callback){
     if(this.stop != null){
         clearTimeout(this.stop);
         this.stop == null;
     }
     if (typeof callback === 'function') {
      checkPinState(this, this._pin, this._pin.value, callback);
    }
  }
  
  Led.SOURCE_DRIVE = 0;
  Led.SYNC_DRIVE = 1;

  scope.module.Led = Led;
}));
