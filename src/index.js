'use strict';
const StandardPeriodSelector = require('./standard-period-selector');

window.stPS = new StandardPeriodSelector();

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
  var FC = _window.FusionCharts;
  FC.register('extension', ['private', 'standard-period-selector', function () {
    FC.registerComponent('extensions', 'standard-period-selector', StandardPeriodSelector({FusionCharts: FC}));
  }]);
});
