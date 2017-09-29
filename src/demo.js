var states = [
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virgin Islands",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

let states2 = JSON.parse('[{"fullName":"Alabama","type":"AL","id":"123"},{"fullName":"Alaska","type":"AK","id":"123"},{"fullName":"American Samoa","type":"AS","id":"123"},{"fullName":"Arizona","type":"AZ","id":"123"},{"fullName":"Arkansas","type":"AR","id":"123"},{"fullName":"California","type":"CA","id":"123"},{"fullName":"Colorado","type":"CO","id":"123"},{"fullName":"Connecticut","type":"CT","id":"123"},{"fullName":"Delaware","type":"DE","id":"123"},{"fullName":"District Of Columbia","type":"DC","id":"123"},{"fullName":"Federated States Of Micronesia","type":"FM","id":"123"},{"fullName":"Florida","type":"FL","id":"123"},{"fullName":"Georgia","type":"GA","id":"123"},{"fullName":"Guam","type":"GU","id":"123"},{"fullName":"Hawaii","type":"HI","id":"123"},{"fullName":"Idaho","type":"ID","id":"123"},{"fullName":"Illinois","type":"IL","id":"123"},{"fullName":"Indiana","type":"IN","id":"123"},{"fullName":"Iowa","type":"IA","id":"123"},{"fullName":"Kansas","type":"KS","id":"123"},{"fullName":"Kentucky","type":"KY","id":"123"},{"fullName":"Louisiana","type":"LA","id":"123"},{"fullName":"Maine","type":"ME","id":"123"},{"fullName":"Marshall Islands","type":"MH","id":"123"},{"fullName":"Maryland","type":"MD","id":"123"},{"fullName":"Massachusetts","type":"MA","id":"123"},{"fullName":"Michigan","type":"MI","id":"123"},{"fullName":"Minnesota","type":"MN","id":"123"},{"fullName":"Mississippi","type":"MS","id":"123"},{"fullName":"Missouri","type":"MO","id":"123"},{"fullName":"Montana","type":"MT","id":"123"},{"fullName":"Nebraska","type":"NE","id":"123"},{"fullName":"Nevada","type":"NV","id":"123"},{"fullName":"New Hampshire","type":"NH","id":"123"},{"fullName":"New Jersey","type":"NJ","id":"123"},{"fullName":"New Mexico","type":"NM","id":"123"},{"fullName":"New York","type":"NY","id":"123"},{"fullName":"North Carolina","type":"NC","id":"123"},{"fullName":"North Dakota","type":"ND","id":"123"},{"fullName":"Northern Mariana Islands","type":"MP","id":"123"},{"fullName":"Ohio","type":"OH","id":"123"},{"fullName":"Oklahoma","type":"OK","id":"123"},{"fullName":"Oregon","type":"OR","id":"123"},{"fullName":"Palau","type":"PW","id":"123"},{"fullName":"Pennsylvania","type":"PA","id":"123"},{"fullName":"Puerto Rico","type":"PR","id":"123"},{"fullName":"Rhode Island","type":"RI","id":"123"},{"fullName":"South Carolina","type":"SC","id":"123"},{"fullName":"South Dakota","type":"SD","id":"123"},{"fullName":"Tennessee","type":"TN","id":"123"},{"fullName":"Texas","type":"TX","id":"123"},{"fullName":"Utah","type":"UT","id":"123"},{"fullName":"Vermont","type":"VT","id":"123"},{"fullName":"Virgin Islands","type":"VI","id":"123"},{"fullName":"Virginia","type":"VA","id":"123"},{"fullName":"Washington","type":"WA","id":"123"},{"fullName":"West Virginia","type":"WV","id":"123"},{"fullName":"Wisconsin","type":"WI","id":"123"},{"fullName":"Wyoming","type":"WY","id":"123"}]');


window.addEventListener('WebComponentsReady', function() {
  var component1 = document.querySelector('#foo');
  var component2 = document.querySelector('#bar');

  let options2 = {
    queryParams: {
      searchParam: 'q',
      otherParams: {
        _page: 1,
        _limit: 10
      }
    },
    placeholder: 'US States',
    propertyInObjectArrayToUse: 'name',
    requireSelectionFromList: true,
    source: 'http://localhost:3000/states',
    uid: 'bar'
  };

  component1.options = {
    list: states2,
    placeholder: 'US States',
    propertyInObjectArrayToUse: 'name',
    requireSelectionFromList: true,
    uid: 'foo'
  };

  component2.options = options2;

  angular.module('Test', []).controller('MainCtrl', function($scope) {
    $scope.options = options2;
  });

  angular.element(function() {
    angular.bootstrap(document, ['Test'])
  })

  document.addEventListener('selectionChangedEvent', function(evt) {
    console.log("evt", evt);
  })
});
