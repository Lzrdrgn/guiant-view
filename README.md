# guiant-view
Simple and small view class with minimal magic that can be used to:

- Access elements as properties.
- Update array of subviews into containers.
- Replace a placeholder with a subview.
- Listen dom events.

### Example
See the [ example.html ].
```sh
function ExampleView() { 
  this._init();
  this._subViewA = new ExampleSubView('A');
  this._subViewB = new ExampleSubView('B');
  this._subViewC = new ExampleSubView('C');
  
  this._header.textContent = 'Hello world';
  this._placeholder.update(this._subViewA);
  this._container.update([this._subViewB, this._subViewC]);
}
ExampleView.prototype = Object.create(View.prototype);

ExampleView.prototype._template = View.parse(
  '<div>\
     <h3 data-el="_header"></h3>\
     <div data-container="_container"></div>\
     <div data-placeholder="_placeholder"></div>\
     <button data-onclick="_onClick">button</button>
   </div>');
   
ExampleView.prototype._onClick = function(e, el) {
  console.log('header clicked', this, e, el);
};

function ExampleSubView(text) { 
  this._init();
  this.el.textContent = text;
}
ExampleSubView.prototype = Object.create(View.prototype);

var exampleView = new ExampleView();
document.body.appendChild(exampleView.el);
```
### Usage overview
1. Inherit from guiant-view.
2. Create and set the view template.
3. Call this._init() in the inherited view constructor.

### Template attributes
Template is parsed from a string containing any html. Special attributes can be used to add elements, containers, placeholders and event listeners into a view using the template.

##### data-el="[propName]"
 Makes an element available in the view with the specified [propName].
 
##### data-container="[propName]"
Creates a Container where array of subviews can be added with the specified [propName].

##### data-placeholder="[propName]"
Creates a placeholder that can be replaced with a subview with the specified [propName].

##### data-on[eventType]="[funcName]"
Adds an event listener of event type [eventType] attached to function named [funcName] which is called with the signature:
``` sh
onEvent: function(event, el) {
  // event is the original dom event.
  // el is the element which has the data-on* -attribute.
  // 'this' is the view instance.
}
```
Event delegation -technique is used internally for better performance which means that this won't work for events which do not bubble, for example 'blur' and 'focus'. See 'capture' phase -events described below.

##### data-on[eventType]-capture="[funcName]"
Adds an event listener in the 'capture' -phase of event type [eventType] attached to function named [funcName]. Use this for non-bubbling events such as 'blur' and 'focus'.

### Reference
``` sh
class GuiantView
  _init: function():void // creates elements, containers and placeholders and 
  _template:Object
  el:Element
  (static) parse: function(templateHtml:String):Object
  ```
  
  ``` sh
class Container
  update: function(subViews:Array):void
  el    : Element
  ```
  
``` sh
class Placeholder:
  update: function(subView:IElementWrapper):void
    // If the given subView is null, a html comment node is used. 
```

``` sh
// Means any object that has a property 'el' referencing a dom element. 
// This is only described here for sake of clarity in the documentation.
"interface" IElementWrapper
  el: Element
 ```

[example.html]:http://htmlpreview.github.io/?https://github.com/Lzrdrgn/guiant-view/blob/master/example.html


