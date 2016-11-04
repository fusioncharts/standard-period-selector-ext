'use strict';
const StandardPeriodSelector = require('./standard-period-selector');

window.stPS = new StandardPeriodSelector();
window.timePeriods = [{
  'name': 'minute',
  'milliseconds': 60000,
  'startingPoint': 0,
  'abbreviation': 'min',
  'description': 'MINUTE',
  'parent': 'hour',
  'multipliers': [1, 15, 30]
}, {
  'name': 'hour',
  'milliseconds': 3600000,
  'startingPoint': 0,
  'abbreviation': 'hr',
  'description': 'HOUR',
  'parent': 'day',
  'multipliers': [1, 3, 6, 12]
}, {
  'name': 'day',
  'milliseconds': 86400000,
  'startingPoint': 0,
  'abbreviation': 'D',
  'description': 'DAY',
  'parent': 'month',
  'multipliers': [1, 7, 15]
}, {
  'name': 'month',
  'milliseconds': 2592000000,
  'startingPoint': 0,
  'abbreviation': 'M',
  'description': 'MONTH',
  'parent': 'year',
  'multipliers': [1, 3, 6]
}, {
  'name': 'year',
  'milliseconds': 31104000000,
  'startingPoint': 0,
  'abbreviation': 'Y',
  'description': 'YEAR',
  'multipliers': [1, 3, 5]
}];

// var fc = new FusionCharts();

/* FusionCharts.register('extension', ['standard-period-selector', function (id) {
  var global = this;
  var extAPI = global.extAPI;

  // var otherAPI = FusionCharts.getExtComponent(id, 'api', 'legacyextapi');
  // var toolBoxApi = FusionCharts.getComponent('api', 'toolbox');

  window.stPS = new StandardPeriodSelector();
  extAPI(window.stPS);
}]); */
