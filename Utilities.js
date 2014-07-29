(function(){

  var Dudley = (window.Dudley = window.Dudley || function(){});

  Dudley.Utils = {

    /**
     * Checks the class of target object.
     *
     * @param {Object} thing
     * @param {String} klass
     * @return {Boolean}
     */
    isClass: function(thing, klass) {
      var real_klass;
      real_klass = Object.prototype.toString.call(thing).match(/\[object\s(.*)\]/)[1];
      return klass.toLowerCase() === real_klass.toLowerCase();
    },

    /**
     * Returns the current time in milliseconds since the epoch.
     *
     * @return {Number}
     */
    dateNow: function(){
      return Date.now ? Date.now() : +new Date;
    },

    /**
     * Loads an image and fires the callback depending on the return status.
     *
     * @param {String} url The path to the test image.
     * @param {Function} callback A function to be called based on loading result.
     * @param {Number} [timeout] Milliseconds to wait until firing timeout callback.
     */
    testImage: function(url, callback, timeout) {
      timeout = timeout || 15000;
      var timedOut = false, timer;
      var img = new Image();
      img.onerror = img.onabort = function() {
        if (!timedOut) {
          clearTimeout(timer);
          callback('error');
        }
      };
      img.onload = function() {
        if (!timedOut) {
          clearTimeout(timer);
          if(img.height === 1 && img.width === 1) {
            callback('success');
          } else {
            callback('error');
          }
        }
      };
      img.src = url;
      timer = setTimeout(function() {
        timedOut = true;
        callback('timeout');
      }, timeout);
    }
  };

})();


(function(){

  var Dudley = (window.Dudley = window.Dudley || function(){});

  function getUrlFromElement(element){
    return element.src || element.href || element.cite
  }

  /*!
   * 
   * Modified from jQuery.deparam source provided by Ben Alman
   * http://benalman.com/code/projects/jquery-bbq/examples/deparam/
   * 
   * Copyright (c) 2010 "Cowboy" Ben Alman
   * Dual licensed under the MIT and GPL licenses.
   * http://benalman.com/about/license/
   */

  function deparam(params, coerce) {
    var coerce_types, cur, i, j, key, keys, keys_last, obj, param, v, val, _i, _len, _ref;
    obj = {};
    coerce_types = {
      "true": !0,
      "false": !1,
      "null": null
    };
    _ref = params.replace(/^\?/, "").replace(/\+/g, " ").split("&");
    for (j = _i = 0, _len = _ref.length; _i < _len; j = ++_i) {
      v = _ref[j];
      param = v.split("=");
      key = decodeURIComponent(param[0]);
      val = void 0;
      cur = obj;
      i = 0;
      keys = key.split("][");
      keys_last = keys.length - 1;
      if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
        keys[keys_last] = keys[keys_last].replace(/\]$/, "");
        keys = keys.shift().split("[").concat(keys);
        keys_last = keys.length - 1;
      } else {
        keys_last = 0;
      }
      if (param.length === 2) {
        val = decodeURIComponent(param[1]);
        if (coerce) {
          val = (val && !isNaN(val) ? +val : (val === "undefined" ? undefined : (coerce_types[val] !== undefined ? coerce_types[val] : val)));
        }
        if (keys_last) {
          while (i <= keys_last) {
            key = (keys[i] === "" ? cur.length : keys[i]);
            cur = cur[key] = (i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val);
            i++;
          }
        } else {
          if (Dudley.Utils.isClass(obj[key], 'array')) {
            obj[key].push(val);
          } else if (obj[key] !== undefined) {
            obj[key] = [obj[key], val];
          } else {
            obj[key] = val;
          }
        }
      } else {
        if (key) {
          obj[key] = (coerce ? undefined : "");
        }
      }
    }
    return obj;
  }

  function parseQuery(query_string) {
    try {
      return deparam(query_string);
    } catch (e) {
      return {};
    }
  }

  function parseUrl(url){
    var a;
    try {
      a  = document.createElement('a');
      a.href = url;
      return {
        pathname: a.pathname || '',
        protocol: a.protocol || '',
        hostname: a.hostname || '',
        port: a.port || '',
        search: a.search || '',
        hash: a.hash || ''
      };
    } catch(e){}
  }

  Dudley.URI = (function() {

      URI.DEFAULT_PORTS = {
        'https': 443,
        'http': 80
      };

      function URI(urlOrElement) {
        var t = this, _ = this._ = {};
        if(urlOrElement instanceof HTMLElement){
          _.original_url = getUrlFromElement(urlOrElement);
        } else if (typeof urlOrElement == 'string'){
          _.original_url = urlOrElement;
        } else {
          _.original_url = '';
        }

        var parsedUrl = parseUrl(_.original_url);

        _.path = parsedUrl.pathname;
        _.scheme = parsedUrl.protocol.replace(':', '') || 'http';
        _.hostname = parsedUrl.hostname;
        if(parsedUrl.port){ _.port = parseInt(parsedUrl.port); }
        _.fragment = parsedUrl.hash.replace('#', '');
        _.query_string = parsedUrl.search.replace('?', '');
        _.query_object = parseQuery(_.query_string);
        _.userInfo = void 0;
      }

      URI.prototype.query = function() {
        var t = this;
        return t._.query_object;
      };

      URI.prototype.scheme = function() {
        var t = this;
        return t._.scheme;
      };

      URI.prototype.userInfo = function() {
        var t = this;
        return t._.userInfo;
      };

      URI.prototype.hostname = function() {
        var t = this;
        return t._.hostname;
      };

      URI.prototype.host = function() {
        var t = this, str;
        str = t.hostname();
        if (t.port() && !t.isDefaultPort()) {
          str += ':';
          str += t.port();
        }
        return str;
      };

      URI.prototype.port = function() {
        var t = this;
        return t._.port || '';
      };

      URI.prototype.path = function() {
        var t = this, _ = t._, normalized_path;
        normalized_path = _.path.replace(/^\//, '');
        return "/" + normalized_path;
      };

      URI.prototype.fragment = function() {
        var t = this;
        return t._.fragment;
      };

      URI.prototype.isDefaultPort = function() {
        return this.constructor.DEFAULT_PORTS[this.scheme] === this.port;
      };

      URI.prototype.query_string = function() {
//        return Dudley.Utils.query_string(this.query);
        return this._.query_string;
      };

      URI.prototype.origin = function() {
        var t=this, str;
        str = '';
        if (t.scheme()) {
          str += t.scheme();
          str += ':';
        }
        if (t.host()) {
          str += '//';
        }
        if (t.userInfo()) {
          str += t.userInfo();
          str += '@';
        }
        if (t.host()) {
          str += t.host();
        }
        return str;
      };

      URI.prototype.url = function() {
        var t=this, str;
        str = t.origin();
        if (t.path()) {
          str += t.path();
        }
        if (this.query_string()) {
          str += '?';
          str += this.query_string();
        }
        if (t.fragment()) {
          str += '#';
          str += t.fragment();
        }
        if (str === 'http:/') {
          str = void 0;
        }
        return str;
      };

      URI.prototype.toString = function() {
        return this.url();
      };

      return URI;

    })();

})();


(function(){

  // If the JSON object does not yet have a safeParse method, give it one.
  if (JSON && typeof JSON.safeParse !== 'function') {
    JSON.safeParse = function (text) {

      // The safeParse method takes a text parameter and returns
      // a JavaScript value if the text is a valid JSON text.
      // Unlike the standard parse method, if the string cannot be parsed
      // it will return back the original string instead of throwing an error
      var parsed;
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        return text;
      }
      return parsed;
    }
  }

  var Dudley = (window.Dudley = window.Dudley || function(){});

  if(!Dudley.prototype.PostMessage){

    Dudley.prototype.PostMessage = (function(){

      PostMessage.listeners = {};
      PostMessage.initialized = false;

      function PostMessage() {}

      PostMessage.initialize = function(){
        var t = this;
        if(!PostMessage.initialized){
          PostMessage.initialized = true;
          Dudley.Able.bind(window, 'message', function(e){ t.dispatch.call(t,e); });
          return true;
        }
        return false;
      };

      /**
       * Compiles a message and posts it to the target window.
       *
       * @return {Boolean}
       */
      PostMessage.send = function(name, message, target, domain){
        target = target || parent;
        domain = domain || '*';

        var data = {
          name: name,
          message: JSON.safeParse(message)
        };
        target.postMessage(JSON.stringify(data), domain);
        return true;
      };

      /**
       * Registers a PostMessage listener with the listener pool.
       *
       * @return {Boolean}
       */
      PostMessage.listen = function(name, options){
        var t = this;
        t.listeners[name] = {
          once: options.once,
          callback: function(response, source){
            response = JSON.safeParse(response);
            if(response.status){
              if(response.status == 200){
                options.success && options.success(response.responseText, source);
              } else {
                options.failure && options.failure(response, source);
              }
            } else {
              options.success && options.success(response, source);
            }
          }
        };
        PostMessage.initialize();
        return true;
      };

      /**
       * Dispatches a PostMessage callback from the listener pool.
       *
       * @return {Boolean}
       */
      PostMessage.dispatch = function(event){
        var t = this, listener,
          data = JSON.safeParse(event.data);

        try {
          if(listener = t.listeners[data.name]){
            if(listener.callback){ listener.callback(data.message, event.source); }
            if(listener.once){ delete t.listeners[data.name] }
            return true;
          }
        } catch (e) {
          return false;
        }
      };

      return PostMessage;

    })();

  }

})();


// FrameHelper

(function(){

  var Dudley = (window.Dudley = window.Dudley || function(){});

  if(!Dudley.prototype.FrameHelper){

    Dudley.prototype.FrameHelper = (function(){

      function FrameHelper() {}

      FrameHelper.load = function(){
        var t = this;
        t.setupFrameListeners();
        t.reportDocumentHeight();
      };

      /**
       * Gets the height of the current document.
       *
       * @return {Number} Document Height.
       */
      FrameHelper.getDocumentHeight = function(){
        var body = document.body,
          html = document.documentElement;

        return Math.max( body.scrollHeight, body.offsetHeight,
          html.clientHeight, html.scrollHeight, html.offsetHeight );
      };


      /**
       * Gets the element of the provided frame window object.
       *
       * @param {Window} iframeWindow
       * @return {Element} Frame element.
       */
      FrameHelper.getFrameElementByWindow = function(iframeWindow){
        var frames = document.getElementsByTagName('iframe');
        for(var _i=0; _i<frames.length; _i++){
          var frame = frames[_i];
          if(frame.contentWindow == iframeWindow){ return frame }
        }
        return false;
      };


      // ##################################
      //    From Parent Window to Frame
      // ##################################

      /**
       * Sends a PostMessage to the target iframe element to request document height.
       *
       * @param {Window} iframeElement
       * @return {Boolean}.
       */
      FrameHelper.requestDocumentHeight = function(iframeElement){
        Dudley.prototype.PostMessage.send('requestFrameDocumentHeight', '', iframeElement.contentWindow);
        return true;
      };


      // ##################################
      //    From Frame to Parent Window
      // ##################################

      /**
       * Sends a PostMessage to the parent window with the current height of the document.
       *
       * @return {Boolean}.
       */
      FrameHelper.reportDocumentHeight = function(){
        Dudley.prototype.PostMessage.send('frameDocumentHeight', { height: Dudley.prototype.FrameHelper.getDocumentHeight() } );
        return true;
      };

      // ###########################
      //    Listeners
      // ###########################

      /**
       * Registers PostMessage listeners to handle incoming requests.
       *
       * @return {Boolean}.
       */
      FrameHelper.setupFrameListeners = function(){
        var t = this;

        // ##################################
        //    From Frame to Parent Window
        // ##################################

        Dudley.prototype.PostMessage.listen('frameDocumentHeight', {
          success: function(data, frameWindow){
            var frameElement;
            if(frameElement = Dudley.prototype.FrameHelper.getFrameElementByWindow(frameWindow)){
              frameElement.height = data.height;
              frameElement.style.height = data.height + 'px';
            }
          }
        });

        // ##################################
        //    From Parent Window to Frame
        // ##################################

        Dudley.prototype.PostMessage.listen('requestFrameDocumentHeight', {
          success: function(data, window){
            Dudley.prototype.FrameHelper.reportDocumentHeight()
          }
        });

        return true;

      };



      return FrameHelper;

    })();

    Dudley.prototype.FrameHelper.load()

  }

})();