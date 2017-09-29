import {addClass, hasClass, removeClass} from '../node_modules/s-utilities/src/manageClasses';
import appendAfter from '../node_modules/s-utilities/src/appendAfter';
import css from './standards-typeahead.css';
import DataStore from '../node_modules/s-utilities/src/DataStore';
import findMatches from './findMatches';
import generateList from './generateList';
import isJson from '../node_modules/s-utilities/src/isJson.js';
import makeRequest from './makeRequest';
import StringBuilder from '../node_modules/s-utilities/src/StringBuilder';

class StandardsTypeahead extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

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
 addItems(items = [], dataObjects) {
   let bs = '<b>';
   let be = '</b>';
   let fragment = document.createDocumentFragment();
   let html = '';
   let li, text, type;
   let error = items[0].error;
   items.forEach((item, i) => {
     li = document.createElement('li');
     text = document.createElement('span');
     type = document.createElement('span');
     let idx = item.fullName.toLowerCase().indexOf(this.currentValue.toLowerCase());
     let len = this.currentValue.length;
     // Don't highlight if there are no results.
     let str;
     if (error) {
       str = item.fullName;
     } else {
       str = new StringBuilder(item.fullName).insert(idx, bs).insert(idx + len + 3, be).toString();
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
    if (error) return;
   // setData checks whether dataObjects is undefined or not so no need to check here.
   // The items must be appended to the DOM first before the data can be set because the
   // property that the DataStore attaches to the DOM element is wiped out when the elements are appended.
   this.setData(dataObjects);
   this.bindItems();
 }

  attributeChangedCallback(name, oVal, nVal) {
    if (nVal && nVal !== '' && nVal !== oVal) {
      if (name === 'options' && this._options) {
        Object.assign(this._options, isJson(nVal) ? JSON.parse(nVal) : {});
        if (this._options.list && typeof this._options.list[0] === 'object') {
          // if (!this._options.propertyInObjectArrayToUse) throw new Error('propertyInObjectArrayToUse required if list contains objects');
          this._options.list = this._options.list.map((li) => li[this._options.propertyInObjectArrayToUse]);
        }
        if (this._options.placeholder) this.input.placeholder = this._options.placeholder;
        this.createDropdown();
      }
    }
  }

  /*
   * bindItems
   * Bind click and hover events to each list item.
   */
  bindItems() {
    let items = this.getDropdownItems();
    let wrapper = this.shadowRoot;
    let clickHandler, hoverHandler;

    [].forEach.call(items, (item, i) => {
      this.registerEventListener(item, 'mousedown', this.triggerSelect.bind(this), this.clickHandlers);
      this.registerEventListener(item, 'mouseover', this.triggerHover.bind(this, i), this.hoverHandlers);
    });
  }

  /*
   * bindSelectedItems
   * Bind click and hover events to each selected item.
   */
  bindSelectedItems() {
    this.selectedItemClickHandlers = [];
    let selectedItems = this.getSelectedItems();
    [].forEach.call(selectedItems, (item, i) => {
      this.registerEventListener(item, 'mousedown', this.triggerRemove.bind(this), this.selectedItemClickHandlers);
    });
  }
  /*
   * clearData
   * Empty the DataStore of all data corresponding to the current list items.
   */
  clearData() {
    let items = this.getDropdownItems();
    [].forEach.call(items, (item, i) => {
      this.dataStore.remove(items[i]);
    });
  }

  /*
   * clearDropdown
   * Completely empty out the ul element.
   * Before removing all of the list items, all event listeners are unbound
   * and all corresponding data is cleared.
   */
  clearDropdown() {
    // Reset index back to -1
    this.setIndex();

    // Remove all event listeners
    this.unbindItems();

    // Clear data from the data store
    // this.clearData();

    // Completely remove all of the elements
    this.dropdown.innerHTML = '';
  }

  clearSearch() {
    this.clearDropdown();
    this.input.value = '';
  }

  /*
   * createDropdown
   * Setup the initial dropdown.
   */
  createDropdown() {
    // prevents creation of multiple dropdown container elements
    if (this.dropdown) return;
    // This returns an object of {dropdown: DOM, wrapper: DOM}
    let list = generateList();

    // Grab the unordered list
    this.dropdown = list.dropdown;
    this.setIndex();

    // Hide the list
    this.hideDropdown();

    // Append it after the input
    appendAfter(this.input, list.wrapper);
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `<style>${css}</style><div><input /></div>`;
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
      13: () => this.triggerSelect(this.getDropdownItems()[this.index], true),
      // Escape key
      27: () => this.clearSearch(),
      // Up arrow
      38: () => this.updateIndex(true),
      // Down arrow
      40: () => this.updateIndex()
    };
  }

  /*
   * deselectAllItems
   * Grabs all of the current list items and deactivates them.
   */
  deselectAllItems() {
    let items = this.getDropdownItems();
    items.forEach((item) => {
      removeClass(item, this.activeClass);
      removeClass(item, this.hoverClass);
    });
  }

  /*
   * deselectItems
   * items: a list of items to be deactivated.
   */
  deselectItems(items = []) {
    [].forEach.call(items, (item, i) => {
      removeClass(item, this.activeClass);
      removeClass(item, this.hoverClass);
    });
  }

  displayDropdown() {
    this.dropdown.style.display = 'block';
  }

  /*
   * getActionFromKey
   * ev: a keyup event
   * If the key is an action key (such as up arrow or enter), the function corresponding to this key is returned.
   * Returns undefined if the key pressed does not correspond to an action.
   */
  getActionFromKey(ev) {
    if (!ev) return;
    let charCode = typeof ev.which === "number" ? ev.which : ev.keyCode;

    // Determine if this character is an action character
    let action = this.actionFunctions[charCode.toString()];
    if (action) return action;

    return;
  }

  getActiveItems() {
    return this.dropdown.getElementsByClassName(this.activeClass);
  }

  getDropdownItems() {
    let dropdownItems = this.dropdown.querySelectorAll('li');
    return dropdownItems;
  }

  getSelectedItems() {
    let wrapper = this.shadowRoot.querySelectorAll('.wrapper');
    if (wrapper){
      let selectedItems = wrapper[0].getElementsByTagName('div');
      return selectedItems;
    }
  }

  getHoverItems() {
    return this.dropdown.getElementsByClassName(this.hoverClass);
  }

  /*
   * getInputValue
   * Return the current input value.
   */
  getInputValue() {
    return this.input.value;
  }

  /**
   * [Finds item in list and returns it]
   * @param  {[String]} val [Value to be found in list]
   * @param  {[Array]} list [HTMCollection of dropdown items]
   * @return {[String]}     [Item from the list or undefined if not found]
   */
  getItemFromList(val, list) {
    if (this._options.list) {
      // console.log('list', this._options.list);
      // let i = this._options.list.find((item) => {
      //   console.log('item', item);
      //   item.toLowerCase() === val.toLowerCase();
      // });
    let i = this._options.list.filter((item) => {
      item.fullName.includes(val);
    });

      return Promise.resolve(i ? i : '');
    }
    // return makeRequest(this._options.source, val, this._options.queryParams)
    //   .then((matches) => {
    //     let match = matches.find((m) => val === m[this._options.propertyInObjectArrayToUse]);
    //     return match ? match[this._options.propertyInObjectArrayToUse] : null;
    //   });
  }

  hideDropdown() {
    this.dropdown.style.display = 'none';
  }

  /*
   * onInputChange
   * When the value of the input field has changed make an AJAX request from the source
   * and update the dropdown with the returned values.
   */
  onInputChange() {
    let _this = this;
    if (this._options.list) {
      // When searching from a static list, find the matches and update the dropdown with these matches
      let matches = findMatches(this.currentValue, this._options.list);
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
        let eventStr;
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
  }

  onBlurHandler(e) {
    e.stopPropagation();
    setTimeout(() => {
      if (this.options.requireSelectionFromList) {
        this.getItemFromList(this.input.value)
          .then((itemFromList) => {
            if (itemFromList) this.input.value = itemFromList;
            else this.input.value = '';
          });
      }
      this.currentValue = this.input.value;
      this.clearDropdown();
    }, 10);
  }

  onKeyupHandler(e) {
    e.preventDefault();
    let value;
    let action = this.getActionFromKey(e);
    if (action) action.call(this);
    else {
      value = this.getInputValue();
      if (value !== this.currentValue) {
        this.currentValue = value;
        this.onInputChange.call(this);
      }
    }
  }

  /**
   * Takes a list of objects and returns a list containing one of the properties from the objects.
   * The property to be used within the list is set within this._options.property.
   * @param  {Array}  [matches=[]] [ a list of objects that need to be parsed for one property]
   * @return {[Array]}  [description]
   */
  parseMatches(matches = []) {
    return matches.map((match) => match[this._options.property]);
  }

  /**
   * [registerEventListener description]
   * @param  {[HTMLElement]} element [the element to add the event listener to]
   * @param  {[Event]} ev [the event to trigger (click, mouseover)]
   * @param  {[Function]} handler [the function handler]
   * @param  {[Array]} list [the list to add the function handler to for unbinding]
   * @return {[Void]} [description]
   */
  registerEventListener(element, ev, handler, list) {
      if (!element) return;
      element.addEventListener(ev, handler, false);
      list.push(handler);
  }

  /*
   * resetHandlers
   * Empty out event handlers.
   * Called when all items are unbound.
   */
  resetHandlers() {
      this.clickHandlers = [];
      this.hoverHandlers = [];
  }

  /*
   * setData
   * dataObjects: objects to be attached to a DOM element.
   * Stores the passed in objects onto the dropdown list items.
   * Uses the DataStore functionality provided in DataStore.js.
   */
  setData(dataObjects) {
    if (!dataObjects || dataObjects.length === 0) return;

    let items = this.getDropdownItems();
    items.forEach((item, i) => {
      dataStore.set(item, 'data', dataObjects[i]);
    });
  }

  /*
   * selectItem
   * index: the index of the item to set as active or inactive
   * deselect: a boolean of whether to set the item as active or inactive
   */
  selectItem(index, deselect) {
    let items = this.getDropdownItems();

    if (items.length > 0 && items[index]) {
      if (deselect) removeClass(items[index], this.activeClass);
      else addClass(items[index], this.activeClass);
    }
  }

  /*
   * setIndex
   * idx: the value to change the index to
   * Sets the index to a value without altering on list items.
   * If no index is passed in then the index is reset back to -1.
   * If an out of bounds index is passed then nothing is changed.
   */
  setIndex(idx) {
    // Make sure we stay within bounds again
    if (idx < -1 || idx > this.getDropdownItems().length - 1) return;
    this.index = idx || idx === 0 ? idx : -1;
  }

  /*
   * triggerHover
   * Perform default mouseover behavior: element that the event is triggered on is activated
   * and all other active elements are deactived.
   * Call the optional onHover function after.
   */
  triggerHover(index, evt) {
    let item = evt.target;
    this.deselectItems(this.getHoverItems());
    addClass(item, this.hoverClass);

    this.setIndex(index);
    if (typeof this._options.onHover === 'function') {
      let data = dataStore.get(item, 'data');
      this._options.onHover(item, data);
    }
  }

  /*
   * triggerRemove
   * Perform default click behavior: element that the event is triggered on is removed
   * selected item is removed from DOM, as well as this.selectedItems
   */
  triggerRemove(ev) {
    let item;
    if (ev) {
      if (ev.path && ev.path[0].tagName === 'SPAN'){
        item = ev;
        // selected item wrapping div
        let div = ev.path[2];
        // selected item div id
        let id = ev.path[1].id;
        item = ev;
        // remove item from selected items
        item.path[1].remove();
        this.unbindItem(div);
        // remove selected item from this.selectedItems array
        let i = this.selectedItems.findIndex(x => x.id == id);
        this.selectedItems.splice(i, 1);
      }
    }
  }
  /*
   * triggerSelect
   * Perform default click behavior: element that the event is triggered on is activated
   * and all other active elements are deactivated.
   * Call the optional onSelect function after.
   */
  triggerSelect(ev, clearDropdown = false) {
    let item;
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
       let i = this.selectedItems.findIndex(x => x.id == item.id);
       if (i !== -1) {
         removeClass(item, this.hoverClass);
         addClass(item, this.activeClass);
         this.deselectItems(this.getDropdownItems());
         this.clearSearch();
         return;
       }

      // Create elements
      let fragment = document.createDocumentFragment();
      let div, innerDiv, spanName, spanType, spanX;
      div = document.createElement('div');
      innerDiv = document.createElement('div');
      spanName = document.createElement('span');
      spanType = document.createElement('span');
      spanX = document.createElement('span');
      // Add comma between place and type, for readability
      let nameEl = item.getElementsByClassName('name');
      let typeEl = item.getElementsByClassName('type');
      let name = nameEl[0].innerText;
      let type = typeEl[0].innerText;
      spanName.innerHTML = name + ', ' + type;
      // Decorate elements
      spanName.classList.add('selected-name');
      div.classList.add('selected-item');
      div.setAttribute('id', item.id);
      // Append elements
      fragment.appendChild(div);
      let el = fragment.getElementById(item.id);
      el.appendChild(spanName);
      el.appendChild(spanX);
      this.dropdown.parentNode.insertBefore(fragment.cloneNode(true), this.dropdown.nextSibling);
      // Add item to this.selectedItems array
      let selectedItem = {name: spanName.innerHTML, id: item.id};
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
        .then((listItem) => {
          if (listItem) this.input.value = listItem;
        });
    }
    this.deselectItems(this.getDropdownItems());
    // document.dispatchEvent(new CustomEvent('selectionChangedEvent', {detail: {id: this._options.uid, value: this.input.value}}));
    if (clearDropdown) this.clearDropdown();
  }

  /*
   * updateIndex
   * decrement: boolean of whether to increment or decrement the index
   * Updates the index and activates the list item for that updated index.
   */
  updateIndex(decrement) {
      // Make sure we stay within bounds
    let length = this.getDropdownItems().length - 1;
    if (decrement && this.index === 0) return;
    if (!decrement && this.index === length) return;

    // TODO: Is this really going to be faster than doing deselectAllItems? where we just remove it
    // from the items we have saved?
    // Would be interesting to see if the document.getElementsByClassName makes
    // it slower
    this.deselectItems(this.getActiveItems());

    if (decrement) this.index--;
    else this.index++;

    this.selectItem(this.index);
  }

  /*
   * unbindItems
   * Unbind all events from all list items
   */
   unbindItem(item) {
     item.removeEventListener('click', this.selectedItemClickHandlers, false);
   }

  /*
   * unbindItems
   * Unbind all events from all list items
   */
  unbindItems() {
    let items = this.getDropdownItems();
    [].forEach.call(items, (item, i) => {
      items[i].removeEventListener('click', this.clickHandlers[i], false);
      items[i].removeEventListener('mouseover', this.hoverHandlers[i], false);
    });
    this.resetHandlers();
  }

  /**
   * [updateDropdown mpties out the dropdown and appends a new set of list items if they exist.]
   * @param  {[Array]} labels       [strings to be displayed within the list items of the dropdown]
   * @param  {[Array]} dataObjects  [objects to be stored within the list items]
   * @return {[Void]}               [nothing]
   */
  updateDropdown(labels, dataObjects) {
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
  }

  /*
   * updateSelectedItems
   * This is triggered from setSelectedItems()
   * Creates selected item tags from newly created this.selectedItems array
   * Calls bindSelectedItems() to set bindings
   */
  updateSelectedItems(items) {
    let fragment = document.createDocumentFragment();
    [].forEach.call(items, (item) => {
      let div;
      div = document.createElement('div');
      let name = item.name.toString();
      let innerDiv, spanName, spanType, spanX;
      innerDiv = document.createElement('div');
      spanName = document.createElement('span');
      spanType = document.createElement('span');
      spanX = document.createElement('span');
      spanName.innerHTML = name;
      spanName.classList.add('selected-name');
      div.setAttribute('id', item.id);
      fragment.appendChild(div);
      div.classList.add('selected-item');
      let el = fragment.getElementById(item.id);
      el.appendChild(spanName);
      el.appendChild(spanX);
    })
    this.dropdown.parentNode.insertBefore(fragment.cloneNode(true), this.dropdown.nextSibling);
    this.bindSelectedItems();
  }

  get options() {
    return this._options;
  }

  returnSelectedItems() {
    let items = JSON.stringify(this.selectedItems);
    let emptyArray = JSON.stringify([]);
    return items || emptyArray;
  }

  setSelectedItems(items) {
    this.selectedItems = items;
    this.updateSelectedItems(items);
  }

  set options(options) {
    if (typeof options === 'object') this.setAttribute('options', JSON.stringify(options));
    else this.setAttribute('options', options);
  }

  static get observedAttributes() {
    return ['options'];
  }
}

customElements.define('standards-typeahead', StandardsTypeahead);

export { StandardsTypeahead };
