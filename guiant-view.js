var GuiantView = (function(window) {

  // ---------------------------------------------------------------------------------------
  // 'static' variables
  // ---------------------------------------------------------------------------------------
  
  var doc = window.document;
  var dataPrefix = 'data-';
  var elAttrName = dataPrefix + 'el';
  var contAttrName = dataPrefix + 'container';
  var phAttrName = dataPrefix + 'placeholder';
  var eventAttrPrefix = dataPrefix + 'on';
  var captureStr = 'capture';
  var captureSuffix = '-' + captureStr;
  var emptyArray = [];
  
  var ELS = 1, CONTAINERS = 2, PLACEHOLDERS = 4;
  
  // ---------------------------------------------------------------------------------------
  // Shorthands
  // ---------------------------------------------------------------------------------------
  
  var getAttr = function(flags, flag, el, name) {
    return flags & flag ? el.getAttribute(name) : null;
  };

  // ---------------------------------------------------------------------------------------
  // ContainerView
  // ---------------------------------------------------------------------------------------
  
  var ContainerView = function(el) { this.el = el; };
  
  ContainerView.prototype.update = function(views) {
    var el = this.el;
    var newLen = views.length;
    var curEls = el.childNodes;
    var i, newEl;
    for (i=0; i < newLen; i++) {
      newEl = views[i].el;
      curEl = curEls[i];
      if (newEl !== curEl) {
        if (curEl) { el.insertBefore(newEl, curEl); }
        else { el.appendChild(newEl); }
      }
    }
    for (i = curEls.length - 1; i >= newLen; i--) {
      el.removeChild(curEls[i]);
    }
  };
  
  // ---------------------------------------------------------------------------------------
  // PlaceHolderView
  // ---------------------------------------------------------------------------------------

  var PlaceHolderView = function(el) { 
    this.el = el;
    this._view = {el: el};
    this._nullEl = null;
  };

  PlaceHolderView.prototype.update = function(view) {
    if (view !== this._view) {
      var el = view ? view.el : (this._nullEl || (this._nullEl = doc.createComment('@')));
      this.el.parentNode.replaceChild(el, this.el);
      this.el = el;
      this._view = view;
    }
  };
  
  // ---------------------------------------------------------------------------------------
  // GuiantView
  // ---------------------------------------------------------------------------------------

  var GuiantView = function() {};
  
  GuiantView.parse = function(templateHTML) {
    var templateDiv = doc.createElement('div');
    templateDiv.innerHTML = templateHTML;
    var div = templateDiv.firstElementChild;
    var els = [].concat.apply([div], div.querySelectorAll('*'));
    var el, attr, attrName, i = 0, j;
    var map = {}, ar = [], k = 0;
    var flags = 0, selector, selectors;
    var evt;
    
    while (el = els[i++]) {
      for (j = 0; attr = el.attributes[j++];) {
        attrName = attr.name;
        
        if (attrName === phAttrName) { flags |= PLACEHOLDERS; } 
        else if (attrName === contAttrName)  { flags |= CONTAINERS; } 
        else if (attrName === elAttrName)    { flags |= ELS; }
        
        if (!attrName.indexOf(eventAttrPrefix) && !map[attrName]) {
          evt = attrName.substr(7).split('-');
          ar[k++] = map[attrName] = [evt[0], evt[1] === captureStr];
        }
      }
    }
    div.dataset.view = true;
    
    j = 0;
    selectors = [];
    if (flags & PLACEHOLDERS) { selectors[j++] = phAttrName; }
    if (flags & CONTAINERS) { selectors[j++] = contAttrName; }
    if (flags & ELS) { selectors[j++] = elAttrName; }
    selector = String(selectors.map(function(a) { return '['+a+']'; }));
    
    return { el: div, events: ar, flags: flags, selector: selector };
  };
  
  GuiantView.prototype._template = View.parse('<div></div>');
  
  GuiantView.prototype._init = function() {
    var template = this._template;
    var el = this.el = template.el.cloneNode(true);
    var flags = template.flags;
    var nodes = flags ? el.querySelectorAll(template.selector) : emptyArray;
    var events = template.events;
    var eventHandler = this._handleEvent.bind(this);
    var i, node, attr;
    
    for (i=0; i<nodes.length; i++) {
      node = nodes[i];
      if (attr = getAttr(flags, PLACEHOLDERS, node, phAttrName)) {
        this[attr] = new PlaceHolderView(node);
      } else if (attr = getAttr(flags, CONTAINERS, node, contAttrName)) {
        this[attr] = new ContainerView(node);
      } else if (attr = getAttr(flags, ELS, node, elAttrName)) {
        this[attr] = node;
      }
    }
    
    for (i=0; i<events.length; i++) {
      el.addEventListener(events[i][0], eventHandler, events[i][1]);
    }
  };
  
  GuiantView.prototype._handleEvent = function(e) {
    var i = 0, j = 0;
    var els = [], events = [];
    var el = e.target;
    var toEl = this.el;
    var attrName = eventAttrPrefix + e.type + (e.eventPhase === 1 ? captureSuffix : '');
    var handlerName;
    
    for (; el !== null && el !== toEl; el = el.parentNode) { els[i++] = el; }
    
    if (el === toEl) {
      els[i++] = toEl;

      for (; i-- ;) {
        el = els[i];
        if (el !== toEl && el.dataset && el.dataset.view) { break; }
        handlerName = el.getAttribute(attrName);
        if (handlerName) { events[j++] = [handlerName, el]; }
      }
      
      for (; j--;) {
        handlerName = events[j][0];
        el = events[j][1];
        if (this[handlerName](e, el) === false) { return; }
      }
    }
  };

  return GuiantView;

})(this);

// module.exports = GuiantView
