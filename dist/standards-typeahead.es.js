function hasClass(el, name) {
  return el.className.match(new RegExp("(\\s|^)" + name + "(\\s|$)")) === null ? false : true;
}

function addClass(el, name) {
  if (!hasClass(el, name)) {
    el.className += (el.className ? ' ' : '') + name;
  }
}

function removeClass(el, name) {
  if (hasClass(el, name)) {
    el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
  }
}

function appendAfter(el, sibling) {
  if (el.nextSibling) {
      el.parentNode.insertBefore(sibling, el.nextSibling);
      return;
  }

  el.parentNode.appendChild(sibling);
}

var css = ":host {\n  display: block;\n  box-sizing: border-box;\n  font-family: var(--font-family, arial);\n}\n\ninput {\n  box-shadow: var(--input-box-shadow, inset 0 3px 0 rgba(0,0,0,0.05));\n  box-sizing: border-box;\n  border: var(--border, 1px solid #ddd);\n  border-bottom-right-radius: var(--radius, 3px);\n  border-bottom-left-radius: var(--radius, 3px);\n  border-top-right-radius: var(--radius, 3px);\n  border-top-left-radius: var(--radius, 3px);\n  color: var(--input-text-color, #444);\n  font-family: var(--font-family, arial);\n  font-size: var(--font-size, 20px);\n  outline: 0;\n  padding: var(--input-padding, 10px);\n  margin: 0;\n  width: 100%;\n}\n\n.wrapper {\n  position: relative;\n}\n\nul {\n  background: #fff;\n  margin: 0;\n  padding: 0;\n  position: absolute;\n  width: 100%;\n  z-index: 9999;\n}\n\nli {\n  border-bottom: var(--border, 1px solid #ddd);\n  border-left: var(--border, 1px solid #ddd);\n  border-right: var(--border, 1px solid #ddd);\n  color: var(--dropdown-text-color, #555);\n  font-family: var(--font-family, arial);\n  list-style-type: none;\n  padding: var(--dropdown-padding, 10px);\n}\n\nb {\n  color: var(--bold-color, blue);\n}\n\nli.highlight {\n  background-color: var(--highlight, rgb(228,240,255));\n  cursor: pointer;\n}\n\nli.hover {\n  background-color: var(--hover, rgb(228,240,244));\n  cursor: pointer;\n}\n\nli.hover span {\n  cursor: pointer;\n}\n\nli .name {\n  font-weight: bold;\n}\n\nli .name, li .type {\n  display: block;\n}\n\nli:first-child {\n  border-top: var(--border, 1px solid #555);\n}\n\n.selected-item {\n  border: 1px solid #979797;\n  background-color: #979797;\n  color: #fff;\n  padding: 4px;\n  margin: 10px 0 10px 4px;\n}\n\n.selected-item .selected-name::before {\n  content: 'X';\n  padding: 0 8px 0 4px;\n  cursor: pointer;\n}\n";

var DataStore = function DataStore() {
  this.storeMap = {};
};

// this.get(el, "hi");
DataStore.prototype.get = function get (element, key) {
  return this.getStore(element)[key] || null;
};

DataStore.prototype.getAll = function getAll () {
  console.log("this.storeMap", this.storeMap);
};

// this.set(el, "hi", {"number": 4}
DataStore.prototype.set = function set (element, key, value) {
  if (!value) { return; }
  this.getStore(element)[key] = value;
  return value;
};

// this.remove(el);
// this.remove(el, "hi");
DataStore.prototype.remove = function remove (element, key) {
  if (key) {
    var store = this.getStore(element);
    if (store[key]) { delete store[key]; }
  } else {
    var elementId = element[this.storeId];
    if (elementId) {
      delete this.storeMap[elementId];
      delete element[this.storeId];
    }
  }
};

DataStore.prototype.getStore = function getStore (element) {
  var storeId = this.storeId;
  var storeMap = this.storeMap;
  var elementId = element[storeId];

  if (!elementId) {
    elementId = element[storeId] = this.uid++;
    storeMap[elementId] = {};
  }

  return storeMap[elementId];
};

/*
 * findMatches
 * term: a string to be matched against
 * items: the list of items to filter by this search term
 * Checks whether each string in a list contains the search term.
 * "Contains" means that the search term must be at the beginning of the string
 * or at the beginning of a word in the string (so after a space)
 */
function findMatches(term, items) {
  if ( items === void 0 ) items = [];

  if (term === "") { return []; }
  return items.sort().filter(function (item, i) { return new RegExp('^' + term, 'i').test(item); });
  // return items.sort().map((item, i) => item.match(new RegExp('\\b' + term, 'gi')));
}

/*
 * generateList
 * Create the initial list display and append it after the input element.
 * Returns a reference to the div wrapper and to the ul dropdown.
 * HTML Structure:
 * <div class='wrapper'>
 *  <ul class="dropdown"></ul>
 * </div>
 */
function generateList() {
  var ul = document.createElement('ul');
  var div = document.createElement('div');

  div.classList.add('wrapper');
  ul.classList.add('dropdown');
  div.appendChild(ul);

  return {wrapper: div, dropdown: ul};
}

function isJson(str) {
  try {
    var json = JSON.parse(str);
    return json;
  } catch (e) {
    return false;
  }
}

/**
 * Class to manage URL paths
 */
var Path = function Path(f, ctx) {
  if ( ctx === void 0 ) ctx = {};

  this.ctx = ctx;
  this._path = [];
  return this.parse(f);
};

/**
 * Append to a path
 * @param {string} s path to append
 * @return {instance} for chaining
 */
Path.prototype.append = function append (s) {
  this._path.push(s);
  return this.ctx;
};

/**
 * Delete end of path
 * @param {integer} loc - segment of path to delete
 * @return {instance} for chaining
 */
Path.prototype.delete = function delete$1 (loc) {
  if (!loc) {
    this._path.pop();
    return this.ctx;
  }
};

/**
 * Get the path
 * @return {array} path as array
 */
Path.prototype.get = function get () {
  return this._path;
};

/**
 * Parse the path part of a URl
 * @param {string} f - string path
 * @return {instance} for chaining
 */
Path.prototype.parse = function parse (f) {
    if ( f === void 0 ) f = '';

  var path = decodeURIComponent(f);
  var split = path.split('/');
  if (Array.isArray(split)) {
    if(path.match(/^\//)) { split.shift(); }
    if (split.length > 1 && path.match(/\/$/)) { split.pop(); }
    this._path = split;
  }
  return this;
};

/**
 * Replace part of a path
 * @param {string} f - path replacement
 * @param {integer} loc - location to replace
 * @return {instance} for chaining
 */
Path.prototype.replace = function replace (f, loc) {
  if (loc === 'file') {
    this._path.splice(this._path.length - 1, 1, f);
    return this.ctx;
  } else if (Number.isInteger(loc)) {
    this._path.splice(loc, 1, f);
    return this.ctx;
  }
  this.parse(f);
  return this.ctx;
};

/**
 * Get string representatio of the path or the uri
 * @param {boolen} uri - if true return string represention of uri
 * @return {string} path or uri as string
 */
Path.prototype.toString = function toString (uri) {
  if (uri) { return this.ctx.toString(); }
  return Array.isArray(this._path) ? this._path.join('/') : '';
};

/**
 * Class to manage query part of URL
 */
var Query = function Query(f, ctx) {
  if ( ctx === void 0 ) ctx = {};

  Object.assign(this, ctx);
  this.ctx = ctx;
  this.set(f);
  return this;
};

/**
 * Add a query string
 * @param {object} obj {name: 'value'}
 * @return {instance} for chaining
 */
Query.prototype.add = function add (obj) {
    if ( obj === void 0 ) obj = {};

  this._query = this._convert(obj, this._query[0], this._query[1]);
  return this.ctx;
};

/**
 * Remove the query string
 * @return {instance} for chaining
 */
Query.prototype.clear = function clear () {
  this._query = [[], []];
  return this.ctx;
};

Query.prototype._convert = function _convert (obj, p, q) {
    if ( p === void 0 ) p = [];
    if ( q === void 0 ) q = [];

  for (var key in obj) {
    if (Array.isArray(obj[key])) {
      for (var i = 0; i < obj[key].length; i++) {
        var val = obj[key][i];
        p.push(key);
        q.push(val);
      }
    } else if(obj[key]) {
      p.push(key);
      q.push(obj[key]);
    }
  }
  return [p, q];
};

/**
 * Get the query string
 * @return {array} representing the query string
 */
Query.prototype.get = function get () {
  var dict = {};
  var obj = this._query;

  for (var i = 0; i < obj[0].length; i++) {
    var k = obj[0][i];
    var v = obj[1][i];
    if (dict[k]) {
      dict[k].push(v);
    } else {
      dict[k] = [v];
    }
  }
  return dict;
};

Query.prototype.getUrlTemplateQuery = function getUrlTemplateQuery () {
  return this._urlTemplateQueryString;
};

/**
 * Merge with the query string - replaces query string values if they exist
 * @param {object} obj {name: 'value'}
 * @return {instance} for chaining
 */
Query.prototype.merge = function merge (obj) {
  var p = this._query[0];
  var q = this._query[1];
  for (var key in obj) {
    var kset = false;

    for(var i=0; i < p.length; i++) {
      var xKey = p[i];
      if(key === xKey) {
        if(kset) {
          p.splice(i,1);
          q.splice(i,1);
          continue;
        }
        if (Array.isArray(obj[key])) {
          q[i] = obj[key].shift();
        } else if (typeof obj[key] === 'undefined' || obj[key] === null) {
          p.splice(i, 1);
          q.splice(i, 1);
          delete obj[key];
        } else {
          q[i] = obj[key];
          delete obj[key];
        }
        kset = true;
      }
    }
  }
  this._query = this._convert(obj, this._query[0], this._query[1]);
  return this.ctx;
};

Query.prototype._parse = function _parse (q) {
    var this$1 = this;
    if ( q === void 0 ) q = '';

  var struct = [[], []];
  var pairs = q.split(/&|;/);

  for (var j = 0; j < pairs.length; j++) {
    var name = (void 0), value = (void 0), pair = pairs[j], nPair = pair.match(this$1.qRegEx);

    if(nPair && typeof nPair[nPair.length -1] !== 'undefined') {
      nPair.shift();
      for (var i = 0; i < nPair.length; i++) {
        var p = nPair[i];
        struct[i].push(decodeURIComponent(p.replace('+', ' ', 'g')));
      }
    }
  }
  return struct;
};

/**
 * Set with the query string - replaces existing query string
 * @param {obj} or {string} ...q
 * @return {instance} for chaining
 */
Query.prototype.set = function set () {
    var q = [], len = arguments.length;
    while ( len-- ) q[ len ] = arguments[ len ];

  var args = [].concat( q );

  if (args.length === 1) {
    if (typeof args[0] === 'object') {
      this._query = this._convert(args[0]);
    } else {
      this._query = this._parse(args[0]);
    }
  } else if (args.length === 0) {
    this.clear();
  } else {
    var obj = {};
    obj[args[0]] = args[1];
    this.merge(obj);
  }
  return this.ctx;
};

/**
 * Set the url template query string vale
 * @param {string} url-template query string
 * @return {instance} for chaining
 */
Query.prototype.setUrlTemplateQuery = function setUrlTemplateQuery (s) {
  this._urlTemplateQueryString = s;
};

/**
 * Get string representatio of the path or the uri
 * @param {boolen} uri - if true return string represention of uri
 * @return {string} query or uri as string
 */
Query.prototype.toString = function toString (uri) {
  if (uri) { return this.ctx.toString(); }
  var pairs = [];
  var n = this._query[0];
  var v = this._query[1];

  for(var i = 0; i < n.length; i++) {
    pairs.push(encodeURIComponent(n[i]) + '=' + encodeURIComponent(v[i]));
  }
  return pairs.join('&');
 };

/**
 * Class to make it easier to build strings
 */
var StringBuilder = function StringBuilder(string) {
  if (!string || typeof string === 'undefined') { this.string = String(""); }
  else { this.string = String(string); }
};

/**
 * Return full string
 * @return {string} assembled string
 */
StringBuilder.prototype.toString = function toString () {
  return this.string;
};

/**
 * Append a string to an existing string
 * @param {string} val - string to be appended
 * @return {instance} for chaining
 */
StringBuilder.prototype.append = function append (val) {
  this.string += val;
  return this;
};

/**
 * Insert a string to an existing string
 * @param {integer} pos - position at which to insert value
 * @param {string} val - string to be inserted
 * @return {instance} for chaining
 */
StringBuilder.prototype.insert = function insert (pos, val) {
  var left = this.string.slice(0, pos);
  var right = this.string.slice(pos);
  this.string = left + val + right;
  return this;
};

/**
 * Uri - manipulate URLs
 */
var TinyUri = function TinyUri(uri) {
  this.uriRegEx = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  this.authRegEx = /^([^\@]+)\@/;
  this.portRegEx = /:(\d+)$/;
  this.qRegEx = /^([^=]+)(?:=(.*))?$/;
  this.urlTempQueryRegEx = /\{\?(.*?)\}/;
  return this.parse(uri);
};

/**
 * @param {string} authority - username password part of URL
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.authority = function authority (authority) {
    if ( authority === void 0 ) authority = '';

  if (authority !== '') {
    var auth = authority.match(this.authRegEx);
    this._authority = authority;
    if (auth) {
      authority = authority.replace(this.authRegEx, '');
      this.userInfo(auth[1]);
    }
    var port = authority.match(this.portRegEx);
    if(port) {
      authority = authority.replace(this.portRegEx, '');
      this.port(port[1]);
    }
    this.host(authority.replace('{', ''));
    return this;
  } else {
    var userinfo = this.userInfo();
    if (userinfo) { authority = userinfo + '@'; }
    authority += this.host();
    var port$1 = this.port();
    if (port$1) { authority += ':' + port$1; }
    return authority;
  }
};

/**
 * @param {string} f - string representation of fragment
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.fragment = function fragment (f) {
    if ( f === void 0 ) f = '';

  return this.gs(f, '_fragment');
};

TinyUri.prototype.gs = function gs (val, tar, fn) {
  if (typeof val !== 'undefined') {
    this[tar] = val;
    return this;
  }
  return fn ? fn(this[tar]) : this[tar] ? this[tar] : '';
};

/**
 * @param {string} f - string representation of host
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.host = function host (f) {
  return this.gs(f, '_host');
};

/**
 * @param {string} uri - URL
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.parse = function parse (uri) {
  var f = uri ? uri.match(this.uriRegEx) : [];
  var t = uri ? uri.match(this.urlTempQueryRegEx) : [];
  this.scheme(f[2]);
  this.authority(f[4]);
  this.path = new Path(f[5].replace(/{$/, ''), this);
  this.fragment(f[9]);
  this.query = new Query(f[7], this);
  if (t) { this.query.setUrlTemplateQuery(t[1]); }
  return this;
};

/**
 * @param {string} f - port part of URL
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.port = function port (f) {
  return this.gs(f, '_port');
};

/**
 * @param {string} f - protocol part of URL
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.protocol = function protocol (f) {
  return this.scheme.toLowerCase();
};

/**
 * @param {string} f - protocol scheme
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.scheme = function scheme (f) {
  return this.gs(f, '_scheme');
};

/**
 * @param {string} f - user info part of URL
 * @return {instance} - returns Uri instance for chaining
 */
TinyUri.prototype.userInfo = function userInfo (f) {
  return this.gs(f, '_userinfo', function (r) {
    return r ? encodeURI(r) : r;
  });
};

/**
 * @return {string} - returns string URL
 */
TinyUri.prototype.toString = function toString () {
  var q = this.query.toString();
  var p = this.path.toString();
  var f = this.fragment();
  var s = this.scheme();
  var str = new StringBuilder();
  var retStr = str.append(s ? s + '://' : "")
    .append(this.authority())
    .append('/').append(p)
    .append(q !== '' ? '?' : '')
    .append(q)
    .toString()
    .replace('/?', '?')
    .replace(/\/$/, '');
  return retStr;
};

TinyUri.clone = function clone (uri) {
  return new TinyUri(uri.toString());
};

var StringBuilder$2 = function StringBuilder(string) {
  if ( string === void 0 ) string = '';

  this.string = String(string);
};
StringBuilder$2.prototype.toString = function toString () {
  return this.string;
};
StringBuilder$2.prototype.append = function append (val) {
  this.string += val;
  return this;
};
StringBuilder$2.prototype.insert = function insert (pos, val) {
  var left = this.string.slice(0, pos);
  var right = this.string.slice(pos);
  this.string = left + val + right;
  return this;
};

var StandardsTypeahead = (function (HTMLElement) {
  function StandardsTypeahead() {
    HTMLElement.call(this);
    this.attachShadow({mode: 'open'});
  }

  if ( HTMLElement ) StandardsTypeahead.__proto__ = HTMLElement;
  StandardsTypeahead.prototype = Object.create( HTMLElement && HTMLElement.prototype );
  StandardsTypeahead.prototype.constructor = StandardsTypeahead;

  var prototypeAccessors = { options: {} };
  var staticAccessors = { observedAttributes: {} };

/**
 * Creates <li>s for each item in the items list and once they have all
 * been added to a document fragment, appends them to the dropdown.
 * Once the items have been appended to the DOM, the DataStore is updated
 * with the corresponding dataObjects. Lastly, event listeners are added
 * to each of the items.
 * @param {Array}  [items=[]]  [a list of strings]
 * @param {[type]} dataObjects [a list of objects corresponding to the labels]
 * @returns {[Void]} []
 */
 StandardsTypeahead.prototype.addItems = function addItems (items, dataObjects) {
   var this$1 = this;
   if ( items === void 0 ) items = [];

   var bs = '<b>';
   var be = '</b>';
   var fragment = document.createDocumentFragment();
   var li, text, type;
   var error = items[0].error;
   items.forEach(function (item, i) {
     li = document.createElement('li');
     text = document.createElement('span');
     type = document.createElement('span');
     var idx = item.fullName.toLowerCase().indexOf(this$1.currentValue.toLowerCase());
     var len = this$1.currentValue.length;
     // Don't highlight if there are no results.
     var str;
     if (error) {
       str = item.fullName;
     } else {
       str = new StringBuilder$2(item.fullName).insert(idx, bs).insert(idx + len + 3, be).toString();
     }
     text.classList.add('name');
     type.classList.add('type');
     text.innerHTML = str;
     type.innerHTML = item.type.toString();

     li.setAttribute('id', item.id);
     li.appendChild(text);
     li.appendChild(type);
     fragment.appendChild(li);
   });

   this.dropdown.appendChild(fragment.cloneNode(true));
    if (error) { return; }
   // setData checks whether dataObjects is undefined or not so no need to check here.
   // The items must be appended to the DOM first before the data can be set because the
   // property that the DataStore attaches to the DOM element is wiped out when the elements are appended.
   this.setData(dataObjects);
   this.bindItems();
 };

  StandardsTypeahead.prototype.attributeChangedCallback = function attributeChangedCallback (name, oVal, nVal) {
    var this$1 = this;

    if (nVal && nVal !== '' && nVal !== oVal) {
      if (name === 'options' && this._options) {
        Object.assign(this._options, isJson(nVal) ? JSON.parse(nVal) : {});
        if (this._options.list && typeof this._options.list[0] === 'object') {
          // if (!this._options.propertyInObjectArrayToUse) throw new Error('propertyInObjectArrayToUse required if list contains objects');
          this._options.list = this._options.list.map(function (li) { return li[this$1._options.propertyInObjectArrayToUse]; });
        }
        if (this._options.placeholder) { this.input.placeholder = this._options.placeholder; }
        this.createDropdown();
      }
    }
  };

  /*
   * bindItems
   * Bind click and hover events to each list item.
   */
  StandardsTypeahead.prototype.bindItems = function bindItems () {
    var this$1 = this;

    var items = this.getDropdownItems();
    [].forEach.call(items, function (item, i) {
      this$1.registerEventListener(item, 'mousedown', this$1.triggerSelect.bind(this$1), this$1.clickHandlers);
      this$1.registerEventListener(item, 'mouseover', this$1.triggerHover.bind(this$1, i), this$1.hoverHandlers);
    });
  };

  /*
   * bindSelectedItems
   * Bind click and hover events to each selected item.
   */
  StandardsTypeahead.prototype.bindSelectedItems = function bindSelectedItems () {
    var this$1 = this;

    this.selectedItemClickHandlers = [];
    var selectedItems = this.getSelectedItems();
    [].forEach.call(selectedItems, function (item, i) {
      this$1.registerEventListener(item, 'mousedown', this$1.triggerRemove.bind(this$1), this$1.selectedItemClickHandlers);
    });
  };
  /*
   * clearData
   * Empty the DataStore of all data corresponding to the current list items.
   */
  StandardsTypeahead.prototype.clearData = function clearData () {
    var this$1 = this;

    var items = this.getDropdownItems();
    [].forEach.call(items, function (item, i) {
      this$1.dataStore.remove(items[i]);
    });
  };

  /*
   * clearDropdown
   * Completely empty out the ul element.
   * Before removing all of the list items, all event listeners are unbound
   * and all corresponding data is cleared.
   */
  StandardsTypeahead.prototype.clearDropdown = function clearDropdown () {
    // Reset index back to -1
    this.setIndex();

    // Remove all event listeners
    this.unbindItems();

    // Clear data from the data store
    // this.clearData();

    // Completely remove all of the elements
    this.dropdown.innerHTML = '';
  };

  StandardsTypeahead.prototype.clearSearch = function clearSearch () {
    this.clearDropdown();
    this.input.value = '';
  };

  /*
   * createDropdown
   * Setup the initial dropdown.
   */
  StandardsTypeahead.prototype.createDropdown = function createDropdown () {
    // prevents creation of multiple dropdown container elements
    if (this.dropdown) { return; }
    // This returns an object of {dropdown: DOM, wrapper: DOM}
    var list = generateList();

    // Grab the unordered list
    this.dropdown = list.dropdown;
    this.setIndex();

    // Hide the list
    this.hideDropdown();

    // Append it after the input
    appendAfter(this.input, list.wrapper);
  };

  StandardsTypeahead.prototype.connectedCallback = function connectedCallback () {
    var this$1 = this;

    this.shadowRoot.innerHTML = "<style>" + css + "</style><div><input /></div>";
    this.input = this.shadowRoot.querySelector('input');
    this._options = this._options || {};
    this.activeClass = 'highlight';
    this.hoverClass = 'hover';
    this.input.onkeyup = this.onKeyupHandler.bind(this);
    // this.input.onfocus = this.onFocusHandler.bind(this);
    this.input.onblur = this.onBlurHandler.bind(this);
    this.datastore = new DataStore();
    this.actionFunctions = {
      // Enter key
      13: function () { return this$1.triggerSelect(this$1.getDropdownItems()[this$1.index], true); },
      // Escape key
      27: function () { return this$1.clearSearch(); },
      // Up arrow
      38: function () { return this$1.updateIndex(true); },
      // Down arrow
      40: function () { return this$1.updateIndex(); }
    };
  };

  /*
   * deselectAllItems
   * Grabs all of the current list items and deactivates them.
   */
  StandardsTypeahead.prototype.deselectAllItems = function deselectAllItems () {
    var this$1 = this;

    var items = this.getDropdownItems();
    items.forEach(function (item) {
      removeClass(item, this$1.activeClass);
      removeClass(item, this$1.hoverClass);
    });
  };

  /*
   * deselectItems
   * items: a list of items to be deactivated.
   */
  StandardsTypeahead.prototype.deselectItems = function deselectItems (items) {
    var this$1 = this;
    if ( items === void 0 ) items = [];

    [].forEach.call(items, function (item, i) {
      removeClass(item, this$1.activeClass);
      removeClass(item, this$1.hoverClass);
    });
  };

  StandardsTypeahead.prototype.displayDropdown = function displayDropdown () {
    this.dropdown.style.display = 'block';
  };

  /*
   * getActionFromKey
   * ev: a keyup event
   * If the key is an action key (such as up arrow or enter), the function corresponding to this key is returned.
   * Returns undefined if the key pressed does not correspond to an action.
   */
  StandardsTypeahead.prototype.getActionFromKey = function getActionFromKey (ev) {
    if (!ev) { return; }
    var charCode = typeof ev.which === "number" ? ev.which : ev.keyCode;

    // Determine if this character is an action character
    var action = this.actionFunctions[charCode.toString()];
    if (action) { return action; }

    return;
  };

  StandardsTypeahead.prototype.getActiveItems = function getActiveItems () {
    return this.dropdown.getElementsByClassName(this.activeClass);
  };

  StandardsTypeahead.prototype.getDropdownItems = function getDropdownItems () {
    var dropdownItems = this.dropdown.querySelectorAll('li');
    return dropdownItems;
  };

  StandardsTypeahead.prototype.getSelectedItems = function getSelectedItems () {
    var wrapper = this.shadowRoot.querySelectorAll('.wrapper');
    if (wrapper){
      var selectedItems = wrapper[0].getElementsByTagName('div');
      return selectedItems;
    }
  };

  StandardsTypeahead.prototype.getHoverItems = function getHoverItems () {
    return this.dropdown.getElementsByClassName(this.hoverClass);
  };

  /*
   * getInputValue
   * Return the current input value.
   */
  StandardsTypeahead.prototype.getInputValue = function getInputValue () {
    return this.input.value;
  };

  /**
   * [Finds item in list and returns it]
   * @param  {[String]} val [Value to be found in list]
   * @param  {[Array]} list [HTMCollection of dropdown items]
   * @return {[String]}     [Item from the list or undefined if not found]
   */
  StandardsTypeahead.prototype.getItemFromList = function getItemFromList (val, list) {
    if (this._options.list) {
      // console.log('list', this._options.list);
      // let i = this._options.list.find((item) => {
      //   console.log('item', item);
      //   item.toLowerCase() === val.toLowerCase();
      // });
    var i = this._options.list.filter(function (item) {
      item.fullName.includes(val);
    });

      return Promise.resolve(i ? i : '');
    }
    // return makeRequest(this._options.source, val, this._options.queryParams)
    //   .then((matches) => {
    //     let match = matches.find((m) => val === m[this._options.propertyInObjectArrayToUse]);
    //     return match ? match[this._options.propertyInObjectArrayToUse] : null;
    //   });
  };

  StandardsTypeahead.prototype.hideDropdown = function hideDropdown () {
    this.dropdown.style.display = 'none';
  };

  /*
   * onInputChange
   * When the value of the input field has changed make an AJAX request from the source
   * and update the dropdown with the returned values.
   */
  StandardsTypeahead.prototype.onInputChange = function onInputChange () {
    var _this = this;
    if (this._options.list) {
      // When searching from a static list, find the matches and update the dropdown with these matches
      var matches = findMatches(this.currentValue, this._options.list);
      this.updateDropdown(matches);
    } else if (this._options.externalURL) {
        // let updateStr;
        // if (this._options.uid) {
        //   updateStr = this._options.uid + ":updateDropdownEvent";
        // } else {
        //   updateStr = 'updateDropdownEvent';
        // }
        document.addEventListener('updateDropdownEvent', function(evt) {
          _this.updateDropdown(evt.detail.matches);
        });
      // Otherwise, emit event with value for searching. You should return 'updateDropdownEvent' event with the returned data object.
      if (this.currentValue !== ''){
        var eventStr;
        if (this._options.uid) {
         eventStr = this._options.uid + ':inputChangedEvent';
        } else {
          eventStr = 'inputChangedEvent';
        }
        document.dispatchEvent(new CustomEvent(eventStr, {detail: {value: this.currentValue, uid: this._options.uid}}));
      } else {
        this.clearSearch();
      }
      // makeRequest(this._options.source, this.currentValue, this._options.queryParams).then((matches) => {
      //   matches = this._options.propertyInObjectArrayToUse ? matches.map((m) => m[this._options.propertyInObjectArrayToUse]) : matches;
      //   this.updateDropdown(matches);
        // if (Array.isArray(matches)) {
        //   let labels = this.parseMatches(matches);
        //   this.updateDropdown(labels, matches);
        // } else {
        //   this.updateDropdown(matches);
        // }
      // });

    }
  };

  StandardsTypeahead.prototype.onBlurHandler = function onBlurHandler (e) {
    var this$1 = this;

    e.stopPropagation();
    setTimeout(function () {
      if (this$1.options.requireSelectionFromList) {
        this$1.getItemFromList(this$1.input.value)
          .then(function (itemFromList) {
            if (itemFromList) { this$1.input.value = itemFromList; }
            else { this$1.input.value = ''; }
          });
      }
      this$1.currentValue = this$1.input.value;
      this$1.clearDropdown();
    }, 10);
  };

  StandardsTypeahead.prototype.onKeyupHandler = function onKeyupHandler (e) {
    e.preventDefault();
    var value;
    var action = this.getActionFromKey(e);
    if (action) { action.call(this); }
    else {
      value = this.getInputValue();
      if (value !== this.currentValue) {
        this.currentValue = value;
        this.onInputChange.call(this);
      }
    }
  };

  /**
   * Takes a list of objects and returns a list containing one of the properties from the objects.
   * The property to be used within the list is set within this._options.property.
   * @param  {Array}  [matches=[]] [ a list of objects that need to be parsed for one property]
   * @return {[Array]}  [description]
   */
  StandardsTypeahead.prototype.parseMatches = function parseMatches (matches) {
    var this$1 = this;
    if ( matches === void 0 ) matches = [];

    return matches.map(function (match) { return match[this$1._options.property]; });
  };

  /**
   * [registerEventListener description]
   * @param  {[HTMLElement]} element [the element to add the event listener to]
   * @param  {[Event]} ev [the event to trigger (click, mouseover)]
   * @param  {[Function]} handler [the function handler]
   * @param  {[Array]} list [the list to add the function handler to for unbinding]
   * @return {[Void]} [description]
   */
  StandardsTypeahead.prototype.registerEventListener = function registerEventListener (element, ev, handler, list) {
      if (!element) { return; }
      element.addEventListener(ev, handler, false);
      list.push(handler);
  };

  /*
   * resetHandlers
   * Empty out event handlers.
   * Called when all items are unbound.
   */
  StandardsTypeahead.prototype.resetHandlers = function resetHandlers () {
      this.clickHandlers = [];
      this.hoverHandlers = [];
  };

  /*
   * setData
   * dataObjects: objects to be attached to a DOM element.
   * Stores the passed in objects onto the dropdown list items.
   * Uses the DataStore functionality provided in DataStore.js.
   */
  StandardsTypeahead.prototype.setData = function setData (dataObjects) {
    if (!dataObjects || dataObjects.length === 0) { return; }

    var items = this.getDropdownItems();
    items.forEach(function (item, i) {
      dataStore.set(item, 'data', dataObjects[i]);
    });
  };

  /*
   * selectItem
   * index: the index of the item to set as active or inactive
   * deselect: a boolean of whether to set the item as active or inactive
   */
  StandardsTypeahead.prototype.selectItem = function selectItem (index, deselect) {
    var items = this.getDropdownItems();

    if (items.length > 0 && items[index]) {
      if (deselect) { removeClass(items[index], this.activeClass); }
      else { addClass(items[index], this.activeClass); }
    }
  };

  /*
   * setIndex
   * idx: the value to change the index to
   * Sets the index to a value without altering on list items.
   * If no index is passed in then the index is reset back to -1.
   * If an out of bounds index is passed then nothing is changed.
   */
  StandardsTypeahead.prototype.setIndex = function setIndex (idx) {
    // Make sure we stay within bounds again
    if (idx < -1 || idx > this.getDropdownItems().length - 1) { return; }
    this.index = idx || idx === 0 ? idx : -1;
  };

  /*
   * triggerHover
   * Perform default mouseover behavior: element that the event is triggered on is activated
   * and all other active elements are deactived.
   * Call the optional onHover function after.
   */
  StandardsTypeahead.prototype.triggerHover = function triggerHover (index, evt) {
    var item = evt.target;
    this.deselectItems(this.getHoverItems());
    addClass(item, this.hoverClass);

    this.setIndex(index);
    if (typeof this._options.onHover === 'function') {
      var data = dataStore.get(item, 'data');
      this._options.onHover(item, data);
    }
  };

  /*
   * triggerRemove
   * Perform default click behavior: element that the event is triggered on is removed
   * selected item is removed from DOM, as well as this.selectedItems
   */
  StandardsTypeahead.prototype.triggerRemove = function triggerRemove (ev) {
    var item;
    if (ev) {
      if (ev.path && ev.path[0].tagName === 'SPAN'){
        item = ev;
        // selected item wrapping div
        var div = ev.path[2];
        // selected item div id
        var id = ev.path[1].id;
        item = ev;
        // remove item from selected items
        item.path[1].remove();
        this.unbindItem(div);
        // remove selected item from this.selectedItems array
        var i = this.selectedItems.findIndex(function (x) { return x.id == id; });
        this.selectedItems.splice(i, 1);
      }
    }
  };
  /*
   * triggerSelect
   * Perform default click behavior: element that the event is triggered on is activated
   * and all other active elements are deactivated.
   * Call the optional onSelect function after.
   */
  StandardsTypeahead.prototype.triggerSelect = function triggerSelect (ev, clearDropdown) {
    var this$1 = this;
    if ( clearDropdown === void 0 ) clearDropdown = false;

    var item;
    if (ev) {
      if (ev.target) {
        ev.stopPropagation();
        item = ev.currentTarget;
      } else {
        item = ev;
      }
    }

    if (item) {
       if (!this.selectedItems){
         this.selectedItems = [];
       }
       // Check if selected Item already exists, if so, do not add to DOM and this.selectedItems
       var i = this.selectedItems.findIndex(function (x) { return x.id == item.id; });
       if (i !== -1) {
         removeClass(item, this.hoverClass);
         addClass(item, this.activeClass);
         this.deselectItems(this.getDropdownItems());
         this.clearSearch();
         return;
       }

      // Create elements
      var fragment = document.createDocumentFragment();
      var div, innerDiv, spanName, spanType, spanX;
      div = document.createElement('div');
      innerDiv = document.createElement('div');
      spanName = document.createElement('span');
      spanType = document.createElement('span');
      spanX = document.createElement('span');
      // Add comma between place and type, for readability
      var nameEl = item.getElementsByClassName('name');
      var typeEl = item.getElementsByClassName('type');
      var name = nameEl[0].innerText;
      var type = typeEl[0].innerText;
      spanName.innerHTML = name + ', ' + type;
      // Decorate elements
      spanName.classList.add('selected-name');
      div.classList.add('selected-item');
      div.setAttribute('id', item.id);
      // Append elements
      fragment.appendChild(div);
      var el = fragment.getElementById(item.id);
      el.appendChild(spanName);
      el.appendChild(spanX);
      this.dropdown.parentNode.insertBefore(fragment.cloneNode(true), this.dropdown.nextSibling);
      // Add item to this.selectedItems array
      var selectedItem = {name: spanName.innerHTML, id: item.id};
      this.selectedItems.unshift(selectedItem);
      // Add event bindings
      this.bindSelectedItems();
      // Clean up
      this.input.value = '';
      clearDropdown = true;
      removeClass(item, this.hoverClass);
      addClass(item, this.activeClass);
    } else if (this.options.requireSelectionFromList) {
      this.getItemFromList(this.currentValue)
        .then(function (listItem) {
          if (listItem) { this$1.input.value = listItem; }
        });
    }
    this.deselectItems(this.getDropdownItems());
    // document.dispatchEvent(new CustomEvent('selectionChangedEvent', {detail: {id: this._options.uid, value: this.input.value}}));
    if (clearDropdown) { this.clearDropdown(); }
  };

  /*
   * updateIndex
   * decrement: boolean of whether to increment or decrement the index
   * Updates the index and activates the list item for that updated index.
   */
  StandardsTypeahead.prototype.updateIndex = function updateIndex (decrement) {
      // Make sure we stay within bounds
    var length = this.getDropdownItems().length - 1;
    if (decrement && this.index === 0) { return; }
    if (!decrement && this.index === length) { return; }

    // TODO: Is this really going to be faster than doing deselectAllItems? where we just remove it
    // from the items we have saved?
    // Would be interesting to see if the document.getElementsByClassName makes
    // it slower
    this.deselectItems(this.getActiveItems());

    if (decrement) { this.index--; }
    else { this.index++; }

    this.selectItem(this.index);
  };

  /*
   * unbindItems
   * Unbind all events from all list items
   */
   StandardsTypeahead.prototype.unbindItem = function unbindItem (item) {
     item.removeEventListener('click', this.selectedItemClickHandlers, false);
   };

  /*
   * unbindItems
   * Unbind all events from all list items
   */
  StandardsTypeahead.prototype.unbindItems = function unbindItems () {
    var this$1 = this;

    var items = this.getDropdownItems();
    [].forEach.call(items, function (item, i) {
      items[i].removeEventListener('click', this$1.clickHandlers[i], false);
      items[i].removeEventListener('mouseover', this$1.hoverHandlers[i], false);
    });
    this.resetHandlers();
  };

  /**
   * [updateDropdown mpties out the dropdown and appends a new set of list items if they exist.]
   * @param  {[Array]} labels       [strings to be displayed within the list items of the dropdown]
   * @param  {[Array]} dataObjects  [objects to be stored within the list items]
   * @return {[Void]}               [nothing]
   */
  StandardsTypeahead.prototype.updateDropdown = function updateDropdown (labels, dataObjects) {
      // Always clear the dropdown with a new search
      this.clearDropdown();

      // No matches returned, hide the dropdown
      if (labels.length === 0) {
          this.hideDropdown();
          return;
      }

      // Matches returned, add the matches to the list
      // and display the dropdown
      this.addItems(labels, dataObjects);
      this.displayDropdown();
  };

  /*
   * updateSelectedItems
   * This is triggered from setSelectedItems()
   * Creates selected item tags from newly created this.selectedItems array
   * Calls bindSelectedItems() to set bindings
   */
  StandardsTypeahead.prototype.updateSelectedItems = function updateSelectedItems (items) {
    var fragment = document.createDocumentFragment();
    [].forEach.call(items, function (item) {
      var div;
      div = document.createElement('div');
      var name = item.name.toString();
      var innerDiv, spanName, spanType, spanX;
      innerDiv = document.createElement('div');
      spanName = document.createElement('span');
      spanType = document.createElement('span');
      spanX = document.createElement('span');
      spanName.innerHTML = name;
      spanName.classList.add('selected-name');
      div.setAttribute('id', item.id);
      fragment.appendChild(div);
      div.classList.add('selected-item');
      var el = fragment.getElementById(item.id);
      el.appendChild(spanName);
      el.appendChild(spanX);
    });
    this.dropdown.parentNode.insertBefore(fragment.cloneNode(true), this.dropdown.nextSibling);
    this.bindSelectedItems();
  };

  prototypeAccessors.options.get = function () {
    return this._options;
  };

  StandardsTypeahead.prototype.returnSelectedItems = function returnSelectedItems () {
    var items = JSON.stringify(this.selectedItems);
    var emptyArray = JSON.stringify([]);
    return items || emptyArray;
  };

  StandardsTypeahead.prototype.setSelectedItems = function setSelectedItems (items) {
    this.selectedItems = items;
    this.updateSelectedItems(items);
  };

  prototypeAccessors.options.set = function (options) {
    if (typeof options === 'object') { this.setAttribute('options', JSON.stringify(options)); }
    else { this.setAttribute('options', options); }
  };

  staticAccessors.observedAttributes.get = function () {
    return ['options'];
  };

  Object.defineProperties( StandardsTypeahead.prototype, prototypeAccessors );
  Object.defineProperties( StandardsTypeahead, staticAccessors );

  return StandardsTypeahead;
}(HTMLElement));

customElements.define('standards-typeahead', StandardsTypeahead);

export { StandardsTypeahead };
