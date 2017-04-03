'use strict';
const StandardPeriodSelector = require('./standard-period-selector');

;(function (env, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = env.document
       ? factory(env) : function (win) {
         if (!win.document) {
           throw new Error('Window with document not present');
         }
         return factory(win, true);
       };
  } else {
    env.StandardPeriodSelector = factory(env, true);
  }
})(typeof window !== 'undefined' ? window : this, function (_window, windowExists) {
  var FC = require('fusioncharts');
  FC.register('extension', ['private', 'standard-period-selector', function () {
    FC.registerComponent('extensions', 'standard-period-selector', StandardPeriodSelector({FusionCharts: FC}));
  }]);
});
