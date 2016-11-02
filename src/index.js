'use strict';
const StandardPeriodSelector = require('./standard-period-selector');

var global = this;
var extAPI = global.extAPI;
window.stPS = new StandardPeriodSelector();
extAPI(window.stPS);

// var fc = new FusionCharts();

/* FusionCharts.register('extension', ['standard-period-selector', function (id) {
  var global = this;
  var extAPI = global.extAPI;

  // var otherAPI = FusionCharts.getExtComponent(id, 'api', 'legacyextapi');
  // var toolBoxApi = FusionCharts.getComponent('api', 'toolbox');

  window.stPS = new StandardPeriodSelector();
  extAPI(window.stPS);
}]); */
