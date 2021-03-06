function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var classCallCheck = _classCallCheck;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}
var createClass = _createClass;

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }
function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }
  return _typeof(obj);
}
module.exports = _typeof;
});

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
var assertThisInitialized = _assertThisInitialized;

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
    return call;
  }
  return assertThisInitialized(self);
}
var possibleConstructorReturn = _possibleConstructorReturn;

var getPrototypeOf = createCommonjsModule(function (module) {
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
module.exports = _getPrototypeOf;
});

var setPrototypeOf = createCommonjsModule(function (module) {
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
module.exports = _setPrototypeOf;
});

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}
var inherits = _inherits;

var Event =
/*#__PURE__*/
function () {
  function Event() {
    classCallCheck(this, Event);

    this._listener = Object.create(null);
  }

  createClass(Event, [{
    key: "on",
    value: function on(event, fn) {
      if (typeof fn === 'function') {
        var fnQueue = getEventFnQueue(this, event);
        fnQueue.normal.push(fn);
        return true;
      }

      return false;
    }
  }, {
    key: "once",
    value: function once(event, fn) {
      if (typeof fn === 'function') {
        var fnQueue = getEventFnQueue(this, event);
        fnQueue.once.push(fn);
        return true;
      }

      return false;
    }
  }, {
    key: "off",
    value: function off(event, fn) {
      var _this = this;

      if (this._listener[event]) {
        if (typeof fn === 'function') {
          var remove = function remove(name) {
            var array = _this._listener[event][name];
            var index = array.indexOf(fn);
            ~index && array.splice(index, 1);
          };

          remove('once');
          remove('normal');
          return true;
        }

        if (fn === undefined) {
          this._listener[event].once = [];
          this._listener[event].normal = [];
          return true;
        }
      }

      return false;
    }
  }, {
    key: "offAll",
    value: function offAll() {
      this._listener = Object.create(null);
    }
  }, {
    key: "dispatch",
    value: function dispatch(event, data) {
      if (this._listener[event]) {
        this._listener[event].once.forEach(function (fn) {
          return fn(data);
        });

        this._listener[event].once = [];

        this._listener[event].normal.forEach(function (fn) {
          return fn(data);
        });

        return true;
      }

      return false;
    }
  }]);

  return Event;
}();

function getEventFnQueue(Event_, event) {
  if (!Event_._listener[event]) {
    Event_._listener[event] = {
      normal: [],
      once: []
    };
  }

  return Event_._listener[event];
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
var arrayWithHoles = _arrayWithHoles;

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
var iterableToArrayLimit = _iterableToArrayLimit;

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}
var nonIterableRest = _nonIterableRest;

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
}
var slicedToArray = _slicedToArray;

var RATE = 1;
var DELAY = 0;
var VOLUME = 1;
var FFTSIZE = 16;
var CROSSORIGIN = true;

var isType = function isType(v, type) {
  return Object.prototype.toString.call(v) === "[object ".concat(type, "]");
};
var isUndef = function isUndef(v) {
  return v === undefined || v === null;
};
var isNumber = function isNumber(v) {
  return typeof v === 'number' && !isNaN(v);
};
var isObject = function isObject(v) {
  return v && _typeof_1(v) === 'object';
};
var isArrayBuffer = function isArrayBuffer(v) {
  return isType(v, 'ArrayBuffer');
};
var isAudioBuffer = function isAudioBuffer(v) {
  return isType(v, 'AudioBuffer');
};
var range = function range(min, max, val) {
  return Math.max(Math.min(val, max), min);
};
function random() {
  var max = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000000;
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var fractionDigits = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  return Number(Math.random() * (max - min) + min).toFixed(fractionDigits);
}
function once(fn) {
  var called = false;
  return function () {
    if (!called) {
      called = true;
      return fn.apply(this, arguments);
    }
  };
}
function each(obj, cb) {
  var keys = Object.keys(obj);
  if (keys.length === 0) return;

  for (var i = 0, len = keys.length; i < len; i++) {
    cb(obj[keys[i]], keys[i]);
  }
}
function createAudioContext(Constructor) {
  if (!Constructor.AudioCtx) {
    Constructor.AudioCtx = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext)();
  }

  return Constructor.AudioCtx;
}
function inlineWorker(fn) {
  var fnBody = fn.toString().trim().match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1];
  var url = window.URL.createObjectURL(new window.Blob([fnBody], {
    type: 'text/javascript'
  }));
  return new window.Worker(url);
}
function ready(Instance, cb) {
  if (typeof cb === 'function') {
    Instance.AudioCtx.state === 'running' ? Promise.resolve().then(function () {
      return cb(Instance);
    }) : Instance.AudioCtx.resume().then(function () {
      return cb(Instance);
    });
  }
}
function filterOptions(options) {
  var loop = !!options.loop;
  var mute = !!options.mute;
  var delay = isNumber(options.delay) ? options.delay : DELAY;
  var rate = isNumber(options.rate) ? options.rate : RATE;
  var volume = isNumber(options.volume) ? options.volume : VOLUME;
  var crossOrigin = isUndef(options.crossOrigin) ? CROSSORIGIN : options.crossOrigin;
  var fftSize = isNumber(options.fftSize) ? options.fftSize : FFTSIZE;
  return {
    mute: mute,
    rate: rate,
    delay: delay,
    loop: loop,
    volume: volume,
    fftSize: fftSize,
    crossOrigin: crossOrigin
  };
}

var Panner =
/*#__PURE__*/
function () {
  function Panner(SoundInstance) {
    classCallCheck(this, Panner);

    this.Sound = SoundInstance;
    this.pannerPosition = {
      x: 0,
      y: 0,
      z: 0
    };
    this.pannerOrientation = {
      x: 0,
      y: 0,
      z: 0
    };
    this.listenerPosition = {
      x: 0,
      y: 0,
      z: 0
    };
    this.listenerOrientation = {
      fx: 0,
      fy: 0,
      fz: -1,
      ux: 0,
      uy: 1,
      uz: 0
    };
    this.coneAngle = {
      inner: 360,
      outer: 0
    };
  }

  createClass(Panner, [{
    key: "setPosition",
    value: function setPosition(x, y, z) {
      var pannerNode = this.pannerNode,
          AudioCtx = this.AudioCtx,
          pannerPosition = this.pannerPosition;
      x = dealWithArg(x, pannerPosition, 'x');
      y = dealWithArg(y, pannerPosition, 'y');
      z = dealWithArg(z, pannerPosition, 'z');

      if (pannerNode) {
        if (pannerNode.positionX) {
          pannerNode.positionX.setValueAtTime(x, AudioCtx.currentTime);
          pannerNode.positionY.setValueAtTime(y, AudioCtx.currentTime);
          pannerNode.positionZ.setValueAtTime(z, AudioCtx.currentTime);
        } else {
          pannerNode.setPosition(x, y, z);
        }
      }
    }
  }, {
    key: "setOrientation",
    value: function setOrientation(x, y, z) {
      var pannerNode = this.pannerNode,
          AudioCtx = this.AudioCtx,
          pannerOrientation = this.pannerOrientation;
      x = dealWithArg(x, pannerOrientation, 'x');
      y = dealWithArg(y, pannerOrientation, 'y');
      z = dealWithArg(z, pannerOrientation, 'z');

      if (pannerNode) {
        if (pannerNode.orientationX) {
          pannerNode.orientationX.setValueAtTime(x, AudioCtx.currentTime);
          pannerNode.orientationY.setValueAtTime(y, AudioCtx.currentTime);
          pannerNode.orientationZ.setValueAtTime(z, AudioCtx.currentTime);
        } else {
          pannerNode.setOrientation(x, y, z);
        }
      }
    }
  }, {
    key: "setConeAngle",
    value: function setConeAngle(inner, outer) {
      var pannerNode = this.pannerNode,
          coneAngle = this.coneAngle;
      inner = dealWithArg(inner, coneAngle, 'inner');
      outer = dealWithArg(inner, coneAngle, 'outer');

      if (pannerNode) {
        pannerNode.coneInnerAngle = inner;
        pannerNode.coneOuterAngle = outer;
      }
    }
  }, {
    key: "setListenerOrientation",
    value: function setListenerOrientation(fx, fy, fz, ux, uy, uz) {
      var AudioCtx = this.AudioCtx;
      var listener = AudioCtx.listener;
      var defaultArgs = this.listenerOrientation;
      fx = dealWithArg(fx, defaultArgs, 'fx');
      fy = dealWithArg(fy, defaultArgs, 'fy');
      fz = dealWithArg(fz, defaultArgs, 'fz');
      ux = dealWithArg(ux, defaultArgs, 'ux');
      uy = dealWithArg(uy, defaultArgs, 'uy');
      uz = dealWithArg(uz, defaultArgs, 'uz');

      if (listener.forwardX) {
        listener.forwardX.setValueAtTime(fx, AudioCtx.currentTime);
        listener.forwardY.setValueAtTime(fy, AudioCtx.currentTime);
        listener.forwardZ.setValueAtTime(fz, AudioCtx.currentTime);
        listener.upX.setValueAtTime(ux, AudioCtx.currentTime);
        listener.upY.setValueAtTime(uy, AudioCtx.currentTime);
        listener.upZ.setValueAtTime(uz, AudioCtx.currentTime);
      } else {
        listener.setOrientation(fx, fy, fz, ux, uy, uz);
      }
    }
  }, {
    key: "setListenerPosition",
    value: function setListenerPosition(x, y, z) {
      var AudioCtx = this.AudioCtx;
      var listener = AudioCtx.listener;
      var defaultArgs = this.listenerPosition;
      x = dealWithArg(x, defaultArgs, 'x');
      y = dealWithArg(y, defaultArgs, 'y');
      z = dealWithArg(z, defaultArgs, 'z');

      if (listener.positionX) {
        listener.positionX.setValueAtTime(x, AudioCtx.currentTime);
        listener.positionY.setValueAtTime(y, AudioCtx.currentTime);
        listener.positionZ.setValueAtTime(z, AudioCtx.currentTime);
      } else {
        listener.setPosition(x, y, z);
      }
    }
  }, {
    key: "resumeState",
    value: function resumeState() {
      this.setPosition();
      this.setConeAngle();
      this.setOrientation();
      this.setListenerPosition();
      this.setListenerOrientation();
    }
  }, {
    key: "setDefault",
    value: function setDefault() {
      this.setPosition(0, 0, 0);
      this.setConeAngle(360, 0);
      this.setOrientation(0, 0, 0);
      this.setListenerPosition(0, 0, 0);
      this.setListenerOrientation(0, 0, -1, 0, 1, 0);
    }
  }, {
    key: "setChannel",
    value: function setChannel(val) {
      isNumber(val) && this.setPosition(val, 0, 0);
    }
  }, {
    key: "AudioCtx",
    get: function get() {
      return this.Sound.AudioCtx;
    }
  }, {
    key: "pannerNode",
    get: function get() {
      return this.Sound.nodes && this.Sound.nodes.panner;
    }
  }]);

  return Panner;
}();

function dealWithArg(arg, defaultArgs, name) {
  return isNumber(arg) ? defaultArgs[name] = arg : defaultArgs[name];
}

var INIT = function INIT() {};

var Filter =
/*#__PURE__*/
function () {
  function Filter(SoundInstance) {
    classCallCheck(this, Filter);

    this.zoom = 1.5;
    this.passFilter = null;
    this.filterStyle = null;
    this.Sound = SoundInstance;
    this.hertz = null;
    this.styles = null;
    this.filterNodes = Object.create(null);
  }

  createClass(Filter, [{
    key: "isExist",
    value: function isExist() {
      return !!(this.hertz && this.styles);
    }
  }, {
    key: "setHertz",
    value: function setHertz(hertz) {
      if (Array.isArray(hertz)) {
        this.hertz = hertz;
      }
    }
  }, {
    key: "updateStyles",
    value: function updateStyles(styles) {
      if (isObject(styles)) {
        this.styles = styles;
      }
    }
  }, {
    key: "setFilter",
    value: function setFilter(hz, val) {
      var Sound = this.Sound,
          filterNodes = this.filterNodes;

      if (!Object.keys(filterNodes).length) {
        Sound.disconnectNodes();
        Sound.connectNodes();
      }

      this.passFilter = null;
      this.filterStyle = null;
      var nowFilter = this.filterNodes[hz];

      if (nowFilter) {
        nowFilter.gain.setValueAtTime(val, this.AudioCtx.currentTime);
      }
    }
  }, {
    key: "setStyle",
    value: function setStyle(styleName) {
      if (styleName !== this.filterStyle) {
        styleName = styleName || this.filterStyle;

        if (styleName) {
          this.filterStyle = styleName;
          var styles = this.styles,
              Sound = this.Sound,
              filterNodes = this.filterNodes;

          if (this.isExist()) {
            var data = styleName === INIT ? INIT : styles[styleName];

            if (data) {
              if (!Object.keys(filterNodes).length) {
                Sound.disconnectNodes();
                Sound.connectNodes();
              }

              if (Object.keys(filterNodes).length) {
                filterAssignment(this, data);
              }

              this.passFilter = null;
              this.filterStyle = styleName;
            }
          }
        }
      }
    }
  }, {
    key: "setType",
    value: function setType(type) {
      if (type && typeof type === 'string') {
        var keys = Object.keys(this.filterNodes);

        if (!keys.length) {
          this.Sound.disconnectNodes();
          this.Sound.connectNodes();
          keys = Object.keys(this.filterNodes);
        }

        if (!keys.length) return;

        for (var i = 0, len = keys.length; i < len; i++) {
          var node = this.filterNodes[keys[i]];
          node.type = type;
        }

        this.passFilter = null;
      }
    }
  }, {
    key: "setHighPassFilter",
    value: function setHighPassFilter(hz, peak) {
      return setHighOrLowPassFilter(this, 'highpass', hz, peak);
    }
  }, {
    key: "setLowPassFilter",
    value: function setLowPassFilter(hz, peak) {
      return setHighOrLowPassFilter(this, 'lowpass', hz, peak);
    }
  }, {
    key: "setDefaultPassFilter",
    value: function setDefaultPassFilter() {
      setHighOrLowPassFilter(this, 'peaking', 16000, 1);
    }
  }, {
    key: "setDefaultStyle",
    value: function setDefaultStyle() {
      this.setStyle(INIT);
    }
  }, {
    key: "setDefault",
    value: function setDefault() {
      this.setDefaultPassFilter();
      this.setDefaultStyle();
    }
  }, {
    key: "resumeState",
    value: function resumeState() {
      if (this.passFilter) {
        var _this$passFilter = this.passFilter,
            type = _this$passFilter.type,
            hz = _this$passFilter.hz,
            peak = _this$passFilter.peak;
        type === 'highpass' ? this.setHighPassFilter(hz, peak) : this.setLowPassFilter(hz, peak);
      } else {
        this.setStyle();
      }
    }
  }, {
    key: "AudioCtx",
    get: function get() {
      return this.Sound.AudioCtx;
    }
  }, {
    key: "passFilterNode",
    get: function get() {
      return this.Sound.nodes && this.Sound.nodes.passFilterNode;
    }
  }]);

  return Filter;
}();

function filterAssignment(Instance, data) {
  var zoom = Instance.zoom,
      hertz = Instance.hertz,
      AudioCtx = Instance.AudioCtx,
      filterNodes = Instance.filterNodes;

  var getVal = function getVal(i) {
    return data === INIT ? 0 : data[i];
  };

  for (var i = 0, len = hertz.length; i < len; i++) {
    var hz = hertz[i];
    var filterNode = filterNodes[hz];

    if (filterNode) {
      var val = getVal(i) * (zoom || 1);
      filterNode.Q.value = 1;
      filterNode.type = 'peaking';
      filterNode.frequency.value = hz;
      filterNode.gain.setValueAtTime(val, AudioCtx.currentTime);
    }
  }
}

function setHighOrLowPassFilter(Instance, type, hz, peak) {
  var passFilter = Instance.passFilter,
      passFilterNode = Instance.passFilterNode;

  if (passFilterNode) {
    if (passFilter) {
      hz = isNumber(hz) ? hz : passFilter.hz;
      peak = isNumber(peak) ? peak : passFilter.peak;
    } else {
      hz = isNumber(hz) ? hz : null;
      peak = isNumber(peak) ? peak : null;
    }

    passFilterNode.type = type;
    peak && (passFilterNode.Q.value = peak);
    hz && (passFilterNode.frequency.value = hz);
    passFilter = passFilter || {};
    passFilter.hz = hz;
    passFilter.type = type;
    passFilter.peak = peak;
  }
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
var defineProperty = _defineProperty;

var Convolver =
/*#__PURE__*/
function () {
  function Convolver(SoundInstance) {
    classCallCheck(this, Convolver);

    this.style = null;
    this.Sound = SoundInstance;
    this.audioBufferList = {};
  }

  createClass(Convolver, [{
    key: "setStyle",
    value: function setStyle(style) {
      if (style !== this.style) {
        style = style || this.style;

        if (style) {
          var buffer = this.audioBufferList[style];

          if (buffer && this.convolverNode) {
            var existOfOriginBuffer = !!this.convolverNode.buffer;
            this.style = style;
            this.convolverNode.buffer = buffer;

            if (!existOfOriginBuffer) {
              this.Sound.disconnectNodes();
              this.Sound.connectNodes();
            }
          }
        }
      }
    }
  }, {
    key: "appendBuffer",
    value: function appendBuffer(style, buffer) {
      var _this = this;

      return new Promise(function (resolve) {
        if (typeof style !== 'string') {
          resolve(false);
        } else if (isArrayBuffer(buffer)) {
          _this.AudioCtx.decodeAudioData(buffer, function (audiobuffer) {
            _this.audioBufferList[style] = audiobuffer;
            resolve(true);
          });
        } else if (isAudioBuffer(buffer)) {
          _this.audioBufferList[style] = audiobuffer;
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }
  }, {
    key: "appendBufferList",
    value: function appendBufferList(bufferList) {
      var _this2 = this;

      if (isObject(bufferList)) {
        var promiseAll = [];
        each(bufferList, function (buffer, style) {
          promiseAll.push(_this2.appendBuffer(style, buffer).then(function (result) {
            return defineProperty({}, style, result);
          }));
        });
        return Promise.all(promiseAll);
      }

      return Promise.resolve(false);
    }
  }, {
    key: "clean",
    value: function clean() {
      if (this.convolverNode) {
        this.convolverNode.buffer = null;
        this.Sound.connectNodes();
      }

      this.style = null;
    }
  }, {
    key: "remove",
    value: function remove(style, noClean) {
      if (style) {
        var list = this.audioBufferList;

        if (list[style]) {
          if (!noClean && style === this.style) {
            style === this.style && this.clean();
          }

          list[style] = null;
        }
      }
    }
  }, {
    key: "resumeState",
    value: function resumeState() {
      this.setStyle();
    }
  }, {
    key: "AudioCtx",
    get: function get() {
      return this.Sound.AudioCtx;
    }
  }, {
    key: "convolverNode",
    get: function get() {
      return this.Sound.nodes && this.Sound.nodes.convolver;
    }
  }]);

  return Convolver;
}();

function createProcessingNode(Pitch, AudioCtx, fn) {
  var channels = Pitch.channels,
      frameSize = Pitch.frameSize;
  var scriptNode = AudioCtx.createScriptProcessor ? AudioCtx.createScriptProcessor(frameSize, channels, channels) : AudioCtx.createJavaScriptNode(frameSize, channels, channels);

  scriptNode.onaudioprocess = function (e) {
    fn(Pitch, e.inputBuffer, e.outputBuffer);
  };

  return scriptNode;
}
function mallocFloat(FLOAT, l) {
  var key = Math.floor(Math.log2(l));
  var cache = FLOAT[key];
  return cache && cache.length > 0 ? cache.pop() : new Float32Array(l);
}
function freeFloat(FLOAT, array) {
  var key = Math.floor(Math.log2(array.length));
  FLOAT[key] ? FLOAT[key].push(array) : FLOAT[key] = [array];
}

var Pitch =
/*#__PURE__*/
function (_Event) {
  inherits(Pitch, _Event);

  function Pitch(pitchShift, options) {
    var _this;

    classCallCheck(this, Pitch);

    _this = possibleConstructorReturn(this, getPrototypeOf(Pitch).call(this));

    if (isUndef(pitchShift)) {
      throw new Error('Missing "pitch-shift" library, see "https://www.npmjs.com/package/pitch-shift"');
    }

    _this.queue = [];
    _this.node = null;
    _this.Sound = null;
    _this._skip = false;
    _this.pitchValue = 1.0;
    _this.cache = Object.create(null);

    if (pitchShift === false) {
      _this.channels = 2;
      _this.frameSize = 2048;
      _this.useOutLib = false;
      _this.shiftBuffer = null;
      return possibleConstructorReturn(_this);
    }

    options.frameSize = options.frameSize || 2048;
    _this.useOutLib = true;
    _this.frameSize = options.frameSize;
    _this.channels = options.channels || 2;
    _this.shiftBuffer = pitchShift(function (data) {
      return onData(assertThisInitialized(assertThisInitialized(_this)), data);
    }, function () {
      return _this.pitchValue;
    }, options);
    return _this;
  }

  createClass(Pitch, [{
    key: "receiveMainLib",
    value: function receiveMainLib(Sound) {
      this.Sound = Sound;
    }
  }, {
    key: "connect",
    value: function connect(preNode) {
      this.clear();
      this.disconnect();
      this.createNode(preNode.context);
      this.node.connect(preNode);
    }
  }, {
    key: "disconnect",
    value: function disconnect() {
      this.node && this.node.disconnect();
    }
  }, {
    key: "createNode",
    value: function createNode(AudioCtx) {
      this.node = createProcessingNode(this, AudioCtx, operationalBuffer);
    }
  }, {
    key: "clear",
    value: function clear() {
      this.queue = [];
      this.cache = Object.create(null);
    }
  }, {
    key: "_process",
    value: function _process(inputData, outputData, isInsertPitch) {
      this.shiftBuffer(inputData);
      var resData = this.queue.shift();

      if (resData) {
        outputData.set(resData);
        isInsertPitch && freeFloat(this.cache, resData);
      }
    }
  }, {
    key: "value",
    get: function get() {
      return this.pitchValue;
    },
    set: function set(v) {
      if (isNumber(v)) {
        this.pitchValue = v;
        this.dispatch('change', v);
      } else {
        console.warn('pitch value is not Number');
      }
    }
  }, {
    key: "skip",
    get: function get() {
      return this._skip;
    },
    set: function set(v) {
      v = !!v;
      this._skip = v;
      this.dispatch('skipChanged', v);

      if (this.Sound) {
        this.Sound.disconnectNodes();
        this.Sound.connectNodes();
      }
    }
  }]);

  return Pitch;
}(Event);

function operationalBuffer(Pitch, input, output) {
  var process;

  if (!Pitch.useOutLib) {
    if (Pitch.process) {
      process = Pitch.process;
    } else {
      throw new Error('must defined "process" method');
    }
  } else {
    process = typeof Pitch.process === 'function' ? Pitch.process : Pitch._process;
  }

  for (var i = 0; i < Pitch.channels; i++) {
    var inputData = input.getChannelData(i);
    var outputData = output.getChannelData(i);
    process.call(Pitch, inputData, outputData, true);
  }
}

function onData(Pitch, data) {
  var buffer = mallocFloat(Pitch.cache, data.length);
  buffer.set(data);
  Pitch.queue.push(buffer);
}

var mediaElementNodes = new WeakMap();
function createNodes(audioCtx, options, needMedia, audioElment) {
  var nodes = Object.create(null);
  nodes.delay = audioCtx.createDelay(179.9);
  nodes.panner = audioCtx.createPanner();
  nodes.gainNode = createGainNode(audioCtx);
  nodes.convolver = audioCtx.createConvolver();
  nodes.passFilterNode = createFilter(audioCtx);
  nodes.analyser = createAnalyser(audioCtx, options);

  if (needMedia) {
    nodes.mediaSource = saveMediaSource(audioCtx, audioElment);
  } else {
    nodes.bufferSource = audioCtx.createBufferSource();
  }

  return nodes;
}
function createFilter(audioCtx) {
  var ra = audioCtx.createBiquadFilter();
  ra.type = 'peaking';
  return ra;
}

function createAnalyser(audioCtx, options) {
  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = options.fftSize * 2;
  return analyser;
}

function createGainNode(audioCtx) {
  var ac = audioCtx;
  return ac[ac.createGain ? 'createGain' : 'createGainNode']();
}

function saveMediaSource(audioCtx, audio) {
  if (mediaElementNodes.has(audio)) {
    return mediaElementNodes.get(audio);
  } else {
    var source = audioCtx.createMediaElementSource(audio);
    mediaElementNodes.set(audio, source);
    return source;
  }
}

function connect(Instance, cb) {
  var preNode;
  var nodes = Instance.nodes,
      filter = Instance.filter,
      AudioCtx = Instance.AudioCtx,
      connectOrder = Instance.connectOrder;

  for (var i = 0, len = connectOrder.length; i < len; i++) {
    var name = connectOrder[i];

    if (i === 0) {
      nodes[name].connect(AudioCtx.destination);
      preNode = nodes[name];
    } else {
      if (name === 'filterNode') {
        if (filter.isExist()) {
          preNode = connectFilterNodes(AudioCtx, filter.hertz, preNode, cb);
        }
      } else {
        if (name === 'convolver') {
          if (nodes[name].buffer === null) {
            continue;
          }
        }

        if (name === 'bufferSource' || name === 'mediaSource') {
          var next = function next(toNode) {
            if (toNode) {
              if (toNode instanceof Pitch && toNode.node) {
                preNode = toNode.node;
              } else {
                preNode = toNode;
              }
            }
          };

          Instance.dispatch('connect', [preNode, next]);
        }

        nodes[name].connect(preNode);
        preNode = nodes[name];
      }
    }
  }
}
function connectFilterNodes(audioCtx, hertz, preNode, cb) {
  if (!hertz) return preNode;

  for (var i = 0, len = hertz.length; i < len; i++) {
    var hz = hertz[i];
    var filterNode = createFilter(audioCtx, hz);
    filterNode.connect(preNode);
    preNode = filterNode;
    cb && cb(hz, filterNode);
  }

  return preNode;
}

var BasicSupport =
/*#__PURE__*/
function (_Event) {
  inherits(BasicSupport, _Event);

  function BasicSupport() {
    var _this;

    classCallCheck(this, BasicSupport);

    _this = possibleConstructorReturn(this, getPrototypeOf(BasicSupport).call(this));
    _this.nodes = null;
    _this.libs = new Map();
    _this.audioBuffer = null;
    _this.panner = new Panner(assertThisInitialized(assertThisInitialized(_this)));
    _this.filter = new Filter(assertThisInitialized(assertThisInitialized(_this)));
    _this.convolver = new Convolver(assertThisInitialized(assertThisInitialized(_this)));
    _this.mode = assertThisInitialized(assertThisInitialized(_this)) instanceof SingleHearken ? 'Buffer' : 'Media';
    return _this;
  }

  createClass(BasicSupport, [{
    key: "connect",
    value: function connect$$1(lib) {
      if (lib && !this.libs.has(lib)) {
        this.libs.set(lib);
        this.on('connect', function (_ref) {
          var _ref2 = slicedToArray(_ref, 2),
              node = _ref2[0],
              connect$$1 = _ref2[1];

          if (lib.skip) return;
          lib.connect(node);
          connect$$1(lib);
        });

        if (typeof lib.receiveMainLib === 'function') {
          lib.receiveMainLib(this);
        }
      }
    }
  }, {
    key: "connectNodes",
    value: function connectNodes() {
      var _this2 = this;

      if (this.nodes) {
        connect(this, function (hz, nowFilter) {
          _this2.filter.filterNodes[hz] = nowFilter;
        });
      }
    }
  }, {
    key: "disconnectNodes",
    value: function disconnectNodes() {
      var nodes = this.nodes;
      var filterNodes = this.filter.filterNodes;
      each(nodes, function (node) {
        return node.disconnect();
      });
      each(filterNodes, function (node) {
        return node.disconnect();
      });
    }
  }, {
    key: "getNomalTimeAndDuration",
    value: function getNomalTimeAndDuration(time, duration) {
      if (!isNumber(time) || time < 0) {
        time = 0;
      }

      duration = isNumber(duration) ? duration > 0 ? duration : 0 : undefined;
      return {
        time: time,
        duration: duration
      };
    }
  }, {
    key: "resetContainer",
    value: function resetContainer(audio) {
      this.nodes = createNodes(this.AudioCtx, this.options, !!audio, audio);
    }
  }, {
    key: "getVisualizerData",
    value: function getVisualizerData() {
      var analyser = this.nodes && this.nodes.analyser;
      if (!analyser) return [];
      var array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      return array;
    }
  }, {
    key: "setfftSize",
    value: function setfftSize(size) {
      if (isNumber(size)) {
        this.options.fftSize = size;
      }
    }
  }, {
    key: "setVolume",
    value: function setVolume(volume) {
      if (volume !== this.options.volume) {
        var nodes = this.nodes,
            AudioCtx = this.AudioCtx,
            options = this.options;
        var gainNode = nodes && nodes.gainNode;
        volume = isNumber(volume) ? volume : options.volume;
        options.volume = volume;

        if (gainNode) {
          gainNode.gain.setValueAtTime(volume, AudioCtx.currentTime);
        }
      }
    }
  }, {
    key: "resumeState",
    value: function resumeState() {
      var _this3 = this;

      this.setMute && this.setMute();
      this.setRate && this.setRate();
      this.setDelay && this.setDelay();
      this.setVolume && this.setVolume();
      this.panner.resumeState();
      this.convolver.resumeState();
      this.once('start', function () {
        _this3.filter.resumeState();
      });
    }
  }]);

  return BasicSupport;
}(Event);

function startCoreFn(Instance, time, duration) {
  var nodes = Instance.nodes,
      options = Instance.options,
      audioBuffer = Instance.audioBuffer,
      playRecordingSound = Instance.playRecordingSound;
  var bufferSource = nodes.bufferSource;

  if (bufferSource.buffer) {
    console.warn('bufferSource is non-null');
    return;
  }

  if (!playRecordingSound && duration !== Instance.duration) {
    Instance.duration = isUndef(duration) ? audioBuffer.duration : range(0, audioBuffer.duration, duration);
  }

  if (time !== Instance.whenPlayTime) {
    var _duration = Instance.duration;
    Instance.whenPlayTime = _duration ? time > _duration ? _duration : time : time;
  }

  Instance.dispatch('startBefore');
  Instance.resumeState();
  Instance.connectNodes();
  bufferSource.buffer = audioBuffer;

  bufferSource.onended = function (e) {
    if (options.loop && !Instance.callStop) {
      Instance.startTime = null;
      Instance.start(time, duration, true);
      return;
    }

    Instance.dispatch('ended', e);
  };

  var playMusic = bufferSource.start ? bufferSource.start : bufferSource.noteOn;
  playMusic.call(bufferSource, 0, time, duration);
  Instance.playingTime = 0;
  Instance.starting = true;
  Instance.startTime = Date.now();
  Instance.dispatch('start');
}
function callChildMethod(children, allowCb, cb) {
  var length = children.length;

  var call = function call(child) {
    typeof allowCb === 'function' ? allowCb(child) !== false && cb(child) : cb(child);
  };

  switch (length) {
    case 0:
      break;

    case 1:
      call(children[0]);
      break;

    default:
      for (var i = 0; i < length; i++) {
        call(children[i]);
      }

  }
}
function registerEvent(Hearken, Instance) {
  Hearken.on('play', function () {
    var playing = Instance.playing,
        starting = Instance.starting;
    var canContinue = !playing && starting;

    if (canContinue) {
      Instance.playingTime = Instance.getCurrentTime() * 1000;
      Instance.startTime = Date.now();
      Instance.playing = true;
    }

    Instance.dispatch('play');
  });
  Hearken.on('pause', function () {
    Instance.playingTime = Instance.getCurrentTime() * 1000;
    Instance.startTime = 0;
    Instance.playing = false;
    Instance.dispatch('pause');
  });
}

var SingleHearken =
/*#__PURE__*/
function (_BasicSupport) {
  inherits(SingleHearken, _BasicSupport);

  function SingleHearken(Hearken, buffer, options) {
    var _this;

    classCallCheck(this, SingleHearken);

    _this = possibleConstructorReturn(this, getPrototypeOf(SingleHearken).call(this));
    _this.buffer = isArrayBuffer(buffer) ? buffer : null;
    _this.audioBuffer = isAudioBuffer(buffer) ? buffer : null;
    _this.options = options;
    _this.Hearken = Hearken;
    _this.AudioCtx = Hearken.AudioCtx;
    _this.duration = null;
    _this.whenPlayTime = 0;
    _this.playRecordingSound = false;
    _this.startTime = null;
    _this.playingTime = 0;
    _this.starting = false;
    _this.playing = false;
    _this.callStop = false;
    registerEvent(Hearken, assertThisInitialized(assertThisInitialized(_this)));
    _this.connectOrder = ['panner', 'delay', 'gainNode', 'convolver', 'analyser', 'passFilterNode', 'filterNode', 'bufferSource'];
    return _this;
  }

  createClass(SingleHearken, [{
    key: "getDuration",
    value: function getDuration(needFix) {
      var options = this.options,
          duration = this.duration,
          audioBuffer = this.audioBuffer;
      var result = duration ? duration : audioBuffer ? audioBuffer.duration : null;
      return needFix ? result - options.delay * options.rate : result;
    }
  }, {
    key: "getCurrentTime",
    value: function getCurrentTime(needFix) {
      var duration = this.getDuration();
      var startTime = this.startTime,
          options = this.options,
          playingTime = this.playingTime,
          whenPlayTime = this.whenPlayTime;
      var timeChunk = startTime ? Date.now() - startTime : 0;
      var currentTime;

      if (needFix) {
        currentTime = ((playingTime + timeChunk) / 1000 - options.delay) * options.rate + whenPlayTime;
      } else {
        currentTime = (playingTime + timeChunk) / 1000 * options.rate + whenPlayTime;
      }

      if (currentTime < 0) {
        currentTime = 0;
      }

      if (duration && currentTime > duration) {
        currentTime = 0;
        this.startTime = Date.now();
        this.playingTime = 0;
      }

      return currentTime;
    }
  }, {
    key: "getPercent",
    value: function getPercent(needFix) {
      var duration = this.getDuration(needFix);
      if (!duration) return null;
      var currentTime = this.getCurrentTime(needFix);
      var percent = currentTime / duration;
      return range(0, 1, percent);
    }
  }, {
    key: "playing",
    value: function playing() {
      return this.AudioCtx.state === 'suspended' ? false : this.starting;
    }
  }, {
    key: "setRate",
    value: function setRate(rate) {
      if (rate !== this.options.rate) {
        var nodes = this.nodes,
            AudioCtx = this.AudioCtx,
            options = this.options;
        rate = isNumber(rate) ? rate : options.rate;
        options.rate = rate;
        var bufferSource = nodes && nodes.bufferSource;

        if (bufferSource) {
          bufferSource.playbackRate.setValueAtTime(rate, AudioCtx.currentTime);
        }
      }
    }
  }, {
    key: "setMute",
    value: function setMute(isMute) {
      if (isMute !== this.options.mute) {
        var nodes = this.nodes,
            AudioCtx = this.AudioCtx,
            options = this.options;
        var gainNode = nodes && nodes.gainNode;
        var mute = isUndef(isMute) ? options.mute : !!isMute;
        options.mute = mute;

        if (gainNode) {
          var volume = mute ? 0 : isUndef(options.volume) ? 1 : options.volume;
          gainNode.gain.setValueAtTime(volume, AudioCtx.currentTime);
          this.dispatch('mute', mute);
        }
      }
    }
  }, {
    key: "setDelay",
    value: function setDelay(time) {
      time = time || this.options.delay;

      if (isNumber(time)) {
        this.options.delay = time;
        var delayNode = this.nodes && this.nodes.delay;

        if (delayNode) {
          delayNode.delayTime.setValueAtTime(time, this.AudioCtx.currentTime);
        }
      }
    }
  }, {
    key: "fadeStop",
    value: function fadeStop(time) {
      var _this2 = this;

      if (isNumber(time)) {
        var nodes = this.nodes,
            AudioCtx = this.AudioCtx;
        var gainNode = nodes && nodes.gainNode;

        if (gainNode) {
          setTimeout(function () {
            return _this2.stop();
          }, time * 990);
          gainNode.gain.linearRampToValueAtTime(0, AudioCtx.currentTime + time);
        }
      } else {
        this.stop();
      }
    }
  }, {
    key: "fadeStart",
    value: function fadeStart(time, t, d) {
      var _this3 = this;

      if (isNumber(time)) {
        return new Promise(function (resolve) {
          var AudioCtx = _this3.AudioCtx,
              options = _this3.options;
          var originVolume = options.volume;
          options.volume = 0;

          _this3.start(t, d).then(function (result) {
            var gainNode = _this3.nodes && _this3.nodes.gainNode;

            if (gainNode && result !== false) {
              gainNode.gain.linearRampToValueAtTime(originVolume, AudioCtx.currentTime + time);
              resolve(true);
            } else {
              resolve(false);
            }

            options.volume = originVolume;
          });
        });
      }

      return this.start(t, d);
    }
  }, {
    key: "echo",
    value: function echo(time) {
      var _this4 = this;

      return new Promise(function (resolve) {
        if (isNumber(time)) {
          _this4.start().then(function (result) {
            var gainNode = _this4.nodes && _this4.nodes.gainNode;

            if (gainNode && result !== false) {
              setTimeout(function () {
                return _this4.stop();
              }, time * 990);
              gainNode.gain.exponentialRampToValueAtTime(0.001, _this4.AudioCtx.currentTime + time);
              resolve(true);
            } else {
              resolve(false);
            }
          });

          return;
        }

        resolve(false);
      });
    }
  }, {
    key: "replaceBuffer",
    value: function replaceBuffer(buffer) {
      if (isArrayBuffer(buffer)) {
        this.audioBuffer = null;
        this.buffer = buffer;
        this.dispatch('replaceBuffer');
      } else if (isAudioBuffer(buffer)) {
        this.buffer = null;
        this.audioBuffer = buffer;
        this.dispatch('replaceBuffer');
      }
    }
  }, {
    key: "clone",
    value: function clone(buffer) {
      buffer = buffer || this.audioBuffer || this.buffer;
      var child = new SingleHearken(this.Hearken, buffer, this.options);
      this.Hearken.children.push(child);
      return child;
    }
  }, {
    key: "start",
    value: function start(t, d, noStop) {
      var _this5 = this;

      return new Promise(function (resolve) {
        if (!_this5.buffer && !_this5.audioBuffer && !_this5.playRecordingSound) {
          throw new Error('The resource must be of type arraybuffer or audiobuffer, can\'t play');
        }

        if (_this5.AudioCtx.state === 'suspended') {
          _this5.starting = false;
          resolve(false);
          return;
        }

        if (_this5.nodes && !noStop) {
          _this5.stop();
        }

        _this5.resetContainer();

        _this5.callStop = false;

        if (_this5.playRecordingSound) {
          startCoreFn(_this5, 0, undefined);
          resolve(true);
        } else {
          var _this5$getNomalTimeAn = _this5.getNomalTimeAndDuration(t, d),
              time = _this5$getNomalTimeAn.time,
              duration = _this5$getNomalTimeAn.duration;

          if (_this5.audioBuffer) {
            startCoreFn(_this5, time, duration);
            resolve(true);
          } else if (_this5.buffer) {
            _this5.AudioCtx.decodeAudioData(_this5.buffer, function (audioBuffer) {
              _this5.buffer = null;
              _this5.audioBuffer = audioBuffer;
              startCoreFn(_this5, time, duration);
              resolve(true);
            });
          }
        }
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      if (this.nodes && this.starting) {
        this.dispatch('stopBefore');
        var bufferSource = this.nodes.bufferSource;
        var stopMusic = bufferSource.stop ? bufferSource.stop : bufferSource.noteOff;
        bufferSource.onended = null;
        stopMusic.call(bufferSource);
        this.nodes = null;
        this.startTime = null;
        this.playingTime = 0;
        this.starting = false;
        this.callStop = true;
        this.filter.filterNodes = Object.create(null);
        this.dispatch('stop');
      }
    }
  }]);

  return SingleHearken;
}(BasicSupport);

var Hearken =
/*#__PURE__*/
function (_Event) {
  inherits(Hearken, _Event);

  function Hearken(options) {
    var _this;

    classCallCheck(this, Hearken);

    _this = possibleConstructorReturn(this, getPrototypeOf(Hearken).call(this));
    _this.children = [];
    _this.options = filterOptions(options || {});
    _this.AudioCtx = createAudioContext(Hearken);
    return _this;
  }

  createClass(Hearken, [{
    key: "create",
    value: function create(buffer) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      Object.setPrototypeOf(options, this.options);
      var child = new SingleHearken(this, buffer, options);
      this.children.push(child);
      return child;
    }
  }, {
    key: "play",
    value: function play() {
      var _this2 = this;

      if (this.AudioCtx.state === 'suspended') {
        return this.AudioCtx.resume().then(function () {
          _this2.dispatch('play');
        });
      }

      return Promise.resolve(false);
    }
  }, {
    key: "pause",
    value: function pause() {
      var _this3 = this;

      if (this.AudioCtx.state === 'running') {
        return this.AudioCtx.suspend().then(function () {
          _this3.dispatch('pause');
        });
      }

      return Promise.resolve(false);
    }
  }, {
    key: "setVolume",
    value: function setVolume(volume, cb) {
      callChildMethod(this.children, cb, function (child) {
        child.setVolume(volume);
      });
      this.options.volume = volume;
    }
  }, {
    key: "setMute",
    value: function setMute(isMute, cb) {
      callChildMethod(this.children, cb, function (child) {
        child.setMute(isMute);
      });
      this.options.mute = !!isMute;
    }
  }, {
    key: "each",
    value: function each$$1(cb) {
      if (typeof cb === 'function') {
        callChildMethod(this.children, null, cb);
      }
    }
  }, {
    key: "ready",
    value: function ready$$1(cb) {
      ready(this, cb);
    }
  }]);

  return Hearken;
}(Event);

function workerBody() {
  var _self = this;

  var bufferUtil = {
    data: [],
    collect: function collect(_ref) {
      var buffers = _ref.buffers,
          channels = _ref.channels;

      for (var i = 0; i < channels; i++) {
        !this.data[i] ? this.data[i] = [buffers[i]] : this.data[i].push(buffers[i]);
      }
    },
    getData: function getData(_ref2) {
      var channels = _ref2.channels,
          frameSize = _ref2.frameSize;

      if (this.data.length > 0) {
        var buffers = [];

        for (var i = 0; i < channels; i++) {
          buffers.push(this.merge(this.data[i], frameSize));
        }

        var length = buffers[0].length + buffers[1].length;
        var result = new Float32Array(length);
        var index = 0;
        var inputIndex = 0;

        while (index < length) {
          result[index++] = buffers[0][inputIndex];
          result[index++] = buffers[1][inputIndex];
          inputIndex++;
        }

        return result;
      }

      return null;
    },
    merge: function merge(buffers, frameSize) {
      var result = new Float32Array(frameSize * buffers.length);

      for (var i = 0, offset = 0; i < buffers.length; i++) {
        result.set(buffers[i], offset);
        offset += buffers[i].length;
      }

      return result;
    }
  };
  var fileUtil = {
    encodeWAV: function encodeWAV(_ref3) {
      var sampleRate = _ref3.sampleRate,
          channels = _ref3.channels,
          samples = _ref3.samples;
      var dataLength = samples.length * channels;
      var buffer = new ArrayBuffer(dataLength + 44);
      var view = new DataView(buffer);
      this.writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + dataLength, true);
      this.writeString(view, 8, 'WAVE');
      this.writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, channels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * channels * 2, true);
      view.setUint16(32, channels * 2, true);
      view.setUint16(34, 16, true);
      this.writeString(view, 36, 'data');
      view.setUint32(40, dataLength, true);
      this.floatTo16BitPCM(view, 44, samples);
      return view;
    },
    floatTo16BitPCM: function floatTo16BitPCM(output, offset, input) {
      for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    },
    writeString: function writeString(view, offset, string) {
      for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    }
  };

  function send(command, value) {
    _self.postMessage({
      command: command,
      value: value
    });
  }

  _self.onmessage = function (e) {
    var gfl = 'getFile';
    var app = 'appendBuffer';
    var exp = 'exportBuffer';

    switch (e.data.command) {
      case gfl:
        send(gfl, fileUtil.encodeWAV(e.data.value));
        break;

      case app:
        bufferUtil.collect(e.data.value);
        break;

      case exp:
        send(exp, bufferUtil.getData(e.data.value));
        bufferUtil.data = [];
        break;
    }
  };
}

function connectRecordDevice(Record) {
  return navigator.mediaDevices.getUserMedia({
    audio: true
  }).catch(function () {
    var info = 'Unable to use recording device';
    console.warn(info);
    Record.dispatch('error', info);
  });
}
function createProcessingNode$1(Record, fn) {
  var AudioCtx = Record.AudioCtx,
      frameSize = Record.frameSize,
      channels = Record.channels;
  var scriptNode = AudioCtx.createScriptProcessor ? AudioCtx.createScriptProcessor(frameSize, channels, channels) : AudioCtx.createJavaScriptNode(frameSize, channels, channels);

  scriptNode.onaudioprocess = function (e) {
    fn(Record, e.inputBuffer, e.outputBuffer);
  };

  return scriptNode;
}
function operationalBuffer$1(Record, input, output) {
  var buffers = [];
  var canCall = typeof Record.process === 'function';

  for (var i = 0; i < Record.channels; i++) {
    var inputData = input.getChannelData(i);
    var outputData = output.getChannelData(i);
    canCall && Record.process(inputData, outputData);
    Record._process && Record._process(inputData, outputData);
    buffers.push(!canCall || Record.collectPureData ? inputData : outputData);
  }

  Record.send('appendBuffer', {
    buffers: buffers,
    channels: Record.channels
  });
}
function workerEvent(Record) {
  return function (e) {
    switch (e.data.command) {
      case 'getFile':
        Record.dispatch('_getFile', e.data.value);
        break;

      case 'exportBuffer':
        var typeArrData = e.data.value;
        var buffer = typeArrData && typeArrData.buffer;
        Record.buffer = buffer;
        Record.float32Array = typeArrData;
        Record.dispatch('_exportBuffer', buffer);
        break;
    }
  };
}

var Record =
/*#__PURE__*/
function (_Event) {
  inherits(Record, _Event);

  function Record(frameSize, channels, AudioCtx, collectPureData) {
    var _this;

    classCallCheck(this, Record);

    _this = possibleConstructorReturn(this, getPrototypeOf(Record).call(this));

    if (!window.Worker) {
      throw new Error('Worker is undefined, can\'t record');
    }

    _this.node = null;
    _this.stream = null;
    _this.worker = null;
    _this.buffer = null;
    _this.player = null;
    _this.process = null;
    _this._process = null;
    _this.recording = false;
    _this.playerEvtFn = null;
    _this.float32Array = null;
    _this.initCompleted = false;
    _this.channels = channels || 2;
    _this.frameSize = frameSize || 2048;
    _this.collectPureData = !!collectPureData;
    _this.AudioCtx = AudioCtx || createAudioContext(Record);
    return _this;
  }

  createClass(Record, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      if (this.initCompleted) {
        throw new Error('Cannot be initialized repeatedly');
      }

      return connectRecordDevice(this).then(function (stream) {
        if (!stream) {
          throw new Error('Unable to use recording device');
        }

        _this2.initCompleted = true;
        _this2.worker = inlineWorker(workerBody);
        _this2.node = createProcessingNode$1(_this2, operationalBuffer$1);
        _this2.stream = _this2.AudioCtx.createMediaStreamSource(stream);
        _this2.worker.onmessage = workerEvent(_this2);

        _this2.worker.onerror = function (err) {
          throw new Error(err);
        };
      });
    }
  }, {
    key: "start",
    value: function start() {
      var _this3 = this;

      return new Promise(function (resolve) {
        if (!_this3.recording) {
          var core = function core() {
            _this3.stream.connect(_this3.node);

            if (_this3.player) {
              _this3.playerEvtFn = function (_ref) {
                var _ref2 = slicedToArray(_ref, 2),
                    node = _ref2[0],
                    connect = _ref2[1];

                _this3.node.connect(node);

                connect(_this3.node);
              };

              _this3.player.on('connect', _this3.playerEvtFn);

              _this3.player.Hearken.ready(_this3.player.start());
            } else {
              _this3.node.connect(_this3.AudioCtx.destination);
            }

            resolve(true);
          };

          _this3.recording = true;
          _this3.initCompleted ? core() : _this3.init().then(core);
        } else {
          resolve(false);
        }
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      var _this4 = this;

      return new Promise(function (resolve) {
        if (_this4.recording) {
          _this4.once('_exportBuffer', function (buffer) {
            _this4.recording = false;
            resolve(buffer);
          });

          _this4.node.disconnect();

          _this4.stream.disconnect();

          _this4.send('exportBuffer', {
            channels: _this4.channels,
            frameSize: _this4.frameSize
          });

          if (_this4.player) {
            _this4.player.off('connect', _this4.playerEvtFn);

            _this4.playerEvtFn = null;

            _this4.player.stop();
          }
        } else {
          resolve(false);
        }
      });
    }
  }, {
    key: "getFile",
    value: function getFile() {
      var _this5 = this;

      var sampleRate = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;

      if (!this.worker) {
        throw new Error('you must initialization environment and record data');
      }

      if (!this.float32Array) {
        throw new Error('the record data is null');
      }

      return new Promise(function (resolve) {
        _this5.once('_getFile', function (data) {
          resolve(new Blob([data], {
            type: 'audio/wav'
          }));
        });

        _this5.send('getFile', {
          sampleRate: sampleRate,
          channels: _this5.channels,
          samples: _this5.float32Array
        });
      });
    }
  }, {
    key: "download",
    value: function download(filename, sampleRate) {
      this.getFile(sampleRate).then(function (data) {
        var url = window.URL.createObjectURL(data);
        var link = window.document.createElement('a');
        var event = document.createEvent('MouseEvents');
        link.href = url;
        link.download = filename + '.wav';
        event.initMouseEvent('click', true, true);
        link.dispatchEvent(event);
      });
    }
  }, {
    key: "send",
    value: function send(command, value) {
      this.worker.postMessage({
        command: command,
        value: value
      });
    }
  }, {
    key: "connect",
    value: function connect(plugin) {
      var _this6 = this;

      var match = function match(attr) {
        if (plugin[attr] !== _this6[attr]) {
          throw new Error("The \"".concat(attr, "\" of ").concat(plugin.constructor.name, " must match the record"));
        }
      };

      if (plugin instanceof SingleHearken) {
        match('AudioCtx');
        this.player = plugin;
        plugin.playRecordingSound = true;

        if (!this.process) {
          this.process = function (inputData, outputData) {
            outputData.set(inputData);
          };
        }
      }

      if (plugin instanceof Pitch) {
        match('channels');
        match('frameSize');

        var fn = function fn(skip) {
          if (skip) {
            _this6._process = null;
          } else {
            _this6._process = function (inputData, outputData) {
              (plugin.process || plugin._process).call(plugin, inputData, outputData, true);
            };
          }
        };

        plugin.off('skipChanged', plugin._fn);
        plugin.on('skipChanged', fn);
        plugin._fn = fn;
        fn(plugin.skip);
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.node.disconnect();
      this.stream.disconnect();
      this.node = null;
      this.worker = null;
      this.stream = null;
      this.buffer = null;
      this.player = null;
      this.float32Array = null;
      this.recording = false;
      this.initCompleted = false;
      this.off('_getFile');
      this.off('_exportBuffer');
    }
  }]);

  return Record;
}(Event);

var Queue =
/*#__PURE__*/
function () {
  function Queue() {
    classCallCheck(this, Queue);

    this.fx = [];
    this.init = true;
    this.lock = false;
  }

  createClass(Queue, [{
    key: "register",
    value: function register(fn) {
      if (typeof fn === 'function') {
        this.fx.push(fn);

        if (this.init) {
          this.lock = false;
          this.init = false;
          this.dispatch();
        }
      }
    }
  }, {
    key: "dispatch",
    value: function dispatch(data) {
      var _this = this;

      if (!this.lock) {
        if (this.fx.length === 0) {
          if (typeof this.end === 'function') {
            this.end(data);
          }

          this.init = true;
        }

        var fn = this.fx.shift();

        if (typeof fn === 'function') {
          var next = function next(data) {
            _this.lock = false;

            _this.dispatch(data);
          };

          this.lock = true;
          fn.call(null, next, data);
        }
      }
    }
  }, {
    key: "remove",
    value: function remove(start) {
      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      this.fx.splice(start, end);
    }
  }, {
    key: "clean",
    value: function clean() {
      this.fx = [];
      this.init = true;
      this.lock = false;
    }
  }]);

  return Queue;
}();

var Stream =
/*#__PURE__*/
function (_Event) {
  inherits(Stream, _Event);

  function Stream(mime) {
    var _this;

    classCallCheck(this, Stream);

    _this = possibleConstructorReturn(this, getPrototypeOf(Stream).call(this));
    _this.mime = mime;
    _this.lock = false;
    _this.id = random();
    _this.canPlay = false;
    _this.sourceBuffer = null;

    _this.init();

    return _this;
  }

  createClass(Stream, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      this.queue = new Queue();
      this.mediaSource = new MediaSource();

      this.mediaSource.onsourceopen = function () {
        var sourceBuffer = _this2.mediaSource.addSourceBuffer(_this2.mime);

        sourceBuffer.onupdateend = once(function () {
          _this2.canPlay = true;

          _this2.dispatch('canPlay');
        });
        _this2.sourceBuffer = sourceBuffer;

        _this2.dispatch('open');
      };

      this.mediaSource.onsourceclose = function () {
        _this2.dispatch('close');
      };
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.state === 'open' && !this.removed) {
        this.sourceBuffer.abort();
      }

      this.mediaSource.onsourceopen = null;
      this.mediaSource.onsourceclose = null;
      this.canPlay = false;
      this.mediaSource = null;
      this.sourceBuffer = null;
      this.off('open');
      this.off('close');
      this.off('canPlay');
      this.queue = null;
    }
  }, {
    key: "end",
    value: function end() {
      var _this3 = this;

      this.ready(function () {
        _this3.queue.register(function () {
          if (_this3.state === 'open') {
            if (_this3.sourceBuffer.updating) {
              var fn = function fn() {
                _this3.mediaSource.endOfStream();

                _this3.dispatch('end');

                _this3.sourceBuffer.removeEventListener('updateend', fn);
              };

              _this3.sourceBuffer.addEventListener('updateend', fn);
            } else {
              _this3.mediaSource.endOfStream();

              _this3.dispatch('end');
            }

            _this3.queue.clean();
          }
        });
      });
    }
  }, {
    key: "append",
    value: function append(buffer) {
      var _this4 = this;

      if (isArrayBuffer(buffer)) {
        this.ready(function () {
          _this4.queue.register(function (next) {
            _this4.ready(function () {
              if (_this4.sourceBuffer.updating) {
                var addfn = function addfn() {
                  !_this4.removed && _this4.sourceBuffer.appendBuffer(buffer);

                  _this4.sourceBuffer.removeEventListener('updateend', addfn);

                  next();
                };

                _this4.sourceBuffer.addEventListener('updateend', addfn);
              } else {
                !_this4.removed && _this4.sourceBuffer.appendBuffer(buffer);
                next();
              }
            });
          });
        });
      }
    }
  }, {
    key: "awaitAppend",
    value: function awaitAppend(buffer) {
      var _this5 = this;

      return new Promise(function (resolve) {
        if (isArrayBuffer(buffer)) {
          _this5.ready(function () {
            if (_this5.sourceBuffer.updating) {
              var addfn = function addfn() {
                !_this5.removed && _this5.sourceBuffer.appendBuffer(buffer);

                _this5.sourceBuffer.removeEventListener('updateend', addfn);

                resolve(true);
              };

              _this5.sourceBuffer.addEventListener('updateend', addfn);
            } else {
              !_this5.removed && _this5.sourceBuffer.appendBuffer(buffer);
              resolve(true);
            }
          });
        } else {
          resolve(false);
        }
      });
    }
  }, {
    key: "ready",
    value: function ready$$1(cb) {
      if (typeof cb === 'function') {
        this.sourceBuffer ? cb() : this.once('open', cb);
      }
    }
  }, {
    key: "state",
    get: function get() {
      return this.mediaSource ? this.mediaSource.readyState : null;
    }
  }, {
    key: "removed",
    get: function get() {
      var buffers = this.mediaSource.sourceBuffers;
      return !~[].indexOf.call(buffers, this.sourceBuffer);
    }
  }]);

  return Stream;
}(Event);

function startCoreFn$1(Instance, time, duration, cb) {
  var audio = Instance.audio,
      options = Instance.options;

  if (duration > audio.duration) {
    duration = audio.duration;
  }

  if (duration !== Instance.duration) {
    Instance.duration = duration;
  }

  delayPlay(Instance, function () {
    var playEnd = once(function () {
      if (Instance.endTimer && Instance.endTimer.t) {
        clearTimeout(Instance.endTimer.t);
        Instance.endTimer = null;
      }

      if (Instance.state !== 'pause') {
        audio.pause();
        Instance.state === 'pause';

        if (options.loop) {
          startCoreFn$1(Instance, time, duration);
          return;
        }
      }

      Instance.state = null;
      Instance.dispatch('ended', function () {
        return startCoreFn$1(Instance, time, duration);
      });
    });
    Instance.dispatch('startBefore');
    Instance.connectNodes();
    audio.loop = options.loop;
    audio.onended = playEnd;

    if (isNumber(time)) {
      audio.currentTime = time;
    }

    var success = function success() {
      if (isNumber(duration)) {
        var delayTime = duration * 1000;
        Instance.endTimer = {
          delayTime: delayTime,
          now: Date.now(),
          t: setTimeout(playEnd, delayTime)
        };
      }

      Instance.state = 'playing';
      Instance.dispatch('start');
      Instance.resumeState();
      typeof cb === 'function' && cb(true);
    };

    var error = function error(err) {
      typeof cb === 'function' && cb(false);
      Instance.dispatch('playerror', err);
      return err;
    };

    audio.play().then(success, error);
  });
}
function delayPlay(Instance, cb) {
  var delay = Instance.options.delay;

  if (isNumber(delay) && delay !== 0) {
    Instance.delayTimer = setTimeout(function () {
      clearTimeout(Instance.delayPlay);
      Instance.delayTimer = null;
      cb();
    }, delay * 1000);
  } else {
    cb();
  }
}
function fadeStartOrPlay(Instance, type, time, url, t, d) {
  if (isNumber(time)) {
    return new Promise(function (resolve) {
      var originVolume = Instance.options.volume;
      Instance.setVolume(0);
      Instance[type](url, t, d).then(function (result) {
        var nodes = Instance.nodes,
            AudioCtx = Instance.AudioCtx;
        var gainNode = nodes && nodes.gainNode;

        if (gainNode && result !== false) {
          gainNode.gain.linearRampToValueAtTime(originVolume, AudioCtx.currentTime + time);
          resolve(true);
        } else {
          resolve(false);
        }

        Instance.options.volume = originVolume;
      });
    });
  } else {
    return Instance[type]();
  }
}
function fadeStopOrPause(Instance, type, time) {
  if (isNumber(time)) {
    var nodes = Instance.nodes,
        AudioCtx = Instance.AudioCtx;
    var gainNode = nodes && nodes.gainNode;

    if (gainNode) {
      setTimeout(function () {
        return Instance[type]();
      }, time * 990);
      gainNode.gain.linearRampToValueAtTime(0, AudioCtx.currentTime + time);
    }
  } else {
    Instance[type]();
  }
}

var MediaElement =
/*#__PURE__*/
function (_BasicSupport) {
  inherits(MediaElement, _BasicSupport);

  function MediaElement() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    classCallCheck(this, MediaElement);

    _this = possibleConstructorReturn(this, getPrototypeOf(MediaElement).call(this));
    _this.state = null;
    _this.endTimer = null;
    _this.duration = null;
    _this.delayTimer = null;
    _this.startInfor = null;
    _this.options = filterOptions(options);
    _this.audio = options.audio || new Audio();
    _this.AudioCtx = createAudioContext(MediaElement);
    _this.preload = true;

    if (_this.options.crossOrigin) {
      _this.audio.crossOrigin = 'anonymous';
    }

    _this.connectOrder = ['panner', 'gainNode', 'convolver', 'analyser', 'passFilterNode', 'filterNode', 'mediaSource'];
    return _this;
  }

  createClass(MediaElement, [{
    key: "ready",
    value: function ready$$1(cb) {
      ready(this, cb);
    }
  }, {
    key: "playing",
    value: function playing() {
      return this.state === 'playing';
    }
  }, {
    key: "fadeStart",
    value: function fadeStart(time, url, t, d) {
      return fadeStartOrPlay(this, 'start', time, url, t, d);
    }
  }, {
    key: "fadePlay",
    value: function fadePlay(time) {
      return fadeStartOrPlay(this, 'play', time);
    }
  }, {
    key: "fadeStop",
    value: function fadeStop(time) {
      fadeStopOrPause(this, 'stop', time);
    }
  }, {
    key: "fadePause",
    value: function fadePause(time) {
      fadeStopOrPause(this, 'pause', time);
    }
  }, {
    key: "clone",
    value: function clone() {
      return new MediaElement(this.options);
    }
  }, {
    key: "restart",
    value: function restart(fadeTime) {
      if (this.startInfor) {
        var _this$startInfor = this.startInfor,
            url = _this$startInfor.url,
            time = _this$startInfor.time,
            duration = _this$startInfor.duration;
        return isNumber(fadeTime) ? this.fadeStart(fadeTime, url, time, duration) : this.start(url, time, duration);
      }

      return Promise.resolve(false);
    }
  }, {
    key: "setRate",
    value: function setRate(rate) {
      if (rate !== this.options.rate) {
        var audio = this.audio,
            options = this.options;
        rate = isNumber(rate) ? rate : options.rate;
        options.rate = rate;

        if (this.nodes) {
          audio.playbackRate = rate;
        }
      }
    }
  }, {
    key: "setMute",
    value: function setMute(isMute) {
      if (isMute !== this.options.mute) {
        var audio = this.audio,
            options = this.options;
        var mute = isUndef(isMute) ? options.mute : !!isMute;
        options.mute = mute;
        audio.muted = mute;
        this.dispatch('mute', mute);
      }
    }
  }, {
    key: "setCurrentTime",
    value: function setCurrentTime(time) {
      if (time === range(0, this.getDuration(), time)) {
        this.audio.currentTime = time;
      }
    }
  }, {
    key: "setDelay",
    value: function setDelay(time) {
      if (isNumber(time) && time !== this.options.delay) {
        this.options.delay = time;
      }
    }
  }, {
    key: "getCurrentTime",
    value: function getCurrentTime() {
      return this.audio.currentTime;
    }
  }, {
    key: "getPercent",
    value: function getPercent() {
      var duration = this.getDuration();

      if (isUndef(duration) || !isFinite(duration)) {
        return 0;
      }

      var percent = this.audio.currentTime / duration;
      return range(0, 1, percent);
    }
  }, {
    key: "getLoading",
    value: function getLoading(duration) {
      var buffered = this.audio.buffered;
      if (buffered.length === 0) return 0;
      duration = duration || this.getDuration();
      var loadingTime = buffered.end(buffered.length - 1);
      return range(0, 1, loadingTime / duration);
    }
  }, {
    key: "getDuration",
    value: function getDuration() {
      var audio = this.audio,
          duration = this.duration,
          startInfor = this.startInfor;

      if (!audio._src) {
        return null;
      }

      var result = null;

      if (audio._src instanceof Stream) {
        var stream = audio._src;
        var mediaSource = stream.mediaSource,
            sourceBuffer = stream.sourceBuffer;

        if (isFinite(mediaSource.duration)) {
          result = isNumber(duration) && mediaSource.duration > duration ? duration : mediaSource.duration;
        } else if (sourceBuffer) {
          var timestampOffset = sourceBuffer.timestampOffset;
          result = isNumber(duration) && timestampOffset > duration ? duration : timestampOffset;
        }
      } else {
        result = isNumber(duration) && audio.duration > duration ? duration : audio.duration;
      }

      if (startInfor && startInfor.time) {
        result = result ? result + startInfor.time : startInfor.time;
      }

      return result;
    }
  }, {
    key: "start",
    value: function start(url, t, d) {
      var _this2 = this;

      return new Promise(function (resolve) {
        if (isUndef(url)) return resolve(false);
        var audio = _this2.audio,
            getNomalTimeAndDuration = _this2.getNomalTimeAndDuration;

        var _getNomalTimeAndDurat = getNomalTimeAndDuration(t, d),
            time = _getNomalTimeAndDurat.time,
            duration = _getNomalTimeAndDurat.duration;

        _this2.stop();

        _this2.resetContainer(audio);

        _this2.startInfor = {
          url: url,
          time: time,
          duration: duration
        };

        var sameExists = function sameExists(url) {
          if (audio._src && audio._src === url) {
            startCoreFn$1(_this2, time, duration, resolve);
            return true;
          }

          return false;
        };

        if (url instanceof Stream) {
          if (!sameExists(url)) {
            var stream = url;
            stream.off('canPlay');
            audio._src = stream;
            audio.src = URL.createObjectURL(stream.mediaSource);
            stream.canPlay ? startCoreFn$1(_this2, time, duration, resolve) : stream.once('canPlay', function () {
              return startCoreFn$1(_this2, time, duration, resolve);
            });
          }
        } else {
          if (!sameExists(url)) {
            audio.src = url;
            audio._src = url;
            startCoreFn$1(_this2, time, duration, resolve);
          }
        }
      });
    }
  }, {
    key: "stop",
    value: function stop() {
      var state = this.state,
          audio = this.audio,
          nodes = this.nodes,
          endTimer = this.endTimer,
          delayTimer = this.delayTimer;
      this.dispatch('stopBefore');
      if (state === 'playing') audio.pause();
      if (nodes) this.disconnectNodes();
      if (delayTimer) clearTimeout(delayTimer);
      if (endTimer && endTimer.t) clearTimeout(endTimer.t);
      this.id = null;
      this.state = null;
      this.endTimer = null;
      this.delayTimer = null;
      this.audio.currentTime = 0;
      this.dispatch('stop');
    }
  }, {
    key: "play",
    value: function play() {
      var _this3 = this;

      var state = this.state,
          audio = this.audio,
          endTimer = this.endTimer;

      if (state === 'pause') {
        return audio.play().then(function () {
          if (endTimer) {
            var playEnd = _this3.audio.onended;

            if (typeof playEnd === 'function') {
              endTimer.t = setTimeout(playEnd, endTimer.delayTime);
            }

            endTimer.now = Date.now();
          }

          _this3.state = 'playing';

          _this3.dispatch('play');

          return true;
        });
      }

      return Promise.resolve(false);
    }
  }, {
    key: "pause",
    value: function pause() {
      var state = this.state,
          audio = this.audio,
          endTimer = this.endTimer;

      if (state === 'playing') {
        audio.pause();

        if (endTimer && endTimer.t) {
          var t = endTimer.t,
              now = endTimer.now;
          clearTimeout(t);
          endTimer.t = null;
          endTimer.delayTime -= Date.now() - now;
        }

        this.state = 'pause';
        this.dispatch('pause');
      }
    }
  }, {
    key: "forward",
    value: function forward(time) {
      if (isNumber(time)) {
        var duration = this.getDuration();

        if (duration) {
          time = range(0, duration, time);
          this.audio.currentTime = time;
          return true;
        }
      }

      return false;
    }
  }]);

  return MediaElement;
}(BasicSupport);

Hearken.Pitch = Pitch;
Hearken.Record = Record;
Hearken.Stream = Stream;
Hearken.Media = MediaElement;
console.log('dev hearken');

export default Hearken;
export { Pitch, Record, Stream, MediaElement as Media };
