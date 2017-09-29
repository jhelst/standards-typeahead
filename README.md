standards-typeahead
===================

This is a native v1 web component which provides a traditional typeahead or autocomplete with support for multiple items per dropdown item.

# Use

```html
<standards-typeahead options="options"></standards-typeahead>
```

or

```Javascript
// Use with  list
let component = document.querySelector('standards-typeahead');
let states = [
  {fullName: "Alabama", type: 'AL', id: '123'},
  {fullName: "Alaska", type: 'AK', id:'456'},
]; //
component.options = {
  list: states,
  requireSelectionFromList: true
};
// Use with an external search
let component = document.querySelector('standards-typeahead');
component.options = {
  requireSelectionFromList: true,
  externalURL: true,
};
```
## Options

"options" is an object that can have the following properties:

- uid: (optional) Unique identified for the component. If provided, it is used in selectionChangedEvent, providing a way to identify a component when multiple components are used.
- list: A list of items to use for matching input. The list must be an object array.
- placeholder: (optional) Text to be used as the placeholder for the text input.
- requireSelectionFromList: Whether to force the user to select one of the choices in the list.
- externalURL: accepts Boolean *true*. If *true* component will dispatch *inputChangedEvent* with the input value, and listen for *updateDropdownEvent* event with the search results in an object.

## Custom CSS Properties
The component exposes the follow css custom properties:

- bold-color: The color of the bold element placed around matching text in the dropdown. Defaults to blue.
- border: The border style used by the component. Default is: 1px solid #ddd.
- dropdown-padding: The padding used for the dropdown list items. Defaults to 10px.
- dropdown-text-color: The text color of the dropdown items. Defaults to #555.
- font-family: The font family to be used. Defaults to arial.
- font-size: The font size used in the component. Defaults to 20px;
- highlight: The background-color for selected items in the dropdown.
- hover: The background-color used when hovering over dropdown items.
- input-padding: The padding used in the input element. Defaults to 10px;
- input-text-color: The color to use for the input element text. Defaults to #444;
- radius: The radius to be used for the top right and left of the input element. Defaults to 3px.

## Events
Fires an inputChangedEvent when the selection changes. If options.uid is provided, the event detail includes it:
```Javascript
// assuming options.uid = 'foo';
document.dispatchEvent('foo:inputChangedEvent', (evt) => {
  console.log("evt", evt)
  let uid = evt.detail.uid;
  let value = evt.detail.value;
})
```
Listens for a returning object, and uses this object to populate the dropdown
```Javascript
document.addEventListener('updateDropdownEvent', function(evt) {
  console.log("evt", evt)
  _this.updateDropdown(evt.detail.matches);
});
```

This listener expects an array of objects with the following properties:
- fullName
- type
- id

Example: ```[{fullName: "fullName", type: "type", id: "id"}...]```

# Installation

In Frontier apps, use bower. Otherwise you can use npm. When installed, the component adds the v1
polyfills to the dist directory so you don't have to figure out
how to get those loaded in Frontier since the polyfills do not currently support bower.

# Demo, Development & Testing

To see a demo of the component and to build it, run ```npm run dev```. This will build the assets and run a development server. Access it at http://localhost:8000.

To run the tests, run ```npm run karma```.
