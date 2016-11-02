'use strict';

class StandardPeriodSelector {
  constructor () {
    this.all = 1;
    this.calculatedPeriods = [];
    this.startDataset = 0;
    this.endDataset = 799999999;
    this.startActiveWindow = 500000000;
    this.endActiveWindow = 600000000;
    this.timePeriods = [{
      'name': 'minute',
      'milliseconds': 60000,
      'startingPoint': 0,
      'abbreviation': 'min',
      'description': 'Minute'
    }, {
      'name': 'hour',
      'milliseconds': 3600000,
      'startingPoint': 0,
      'abbreviation': 'hr',
      'description': 'Hour'
    }, {
      'name': 'day',
      'milliseconds': 86400000,
      'startingPoint': 0,
      'abbreviation': 'D',
      'description': 'Day'
    }, {
      'name': 'month',
      'milliseconds': 2592000000,
      'startingPoint': 0,
      'abbreviation': 'M',
      'description': 'Month'
    }];
    this.config = {};
  }

  calculateApplicableStandardPeriods () {
    var targetBlock = this.endDataset - this.startDataset;
    var applicableStandardPeriod = [];
    var i = 0;

    for (i = 0; i < this.timePeriods.length; i++) {
      if (targetBlock / this.timePeriods[i].milliseconds >= 1) {
        applicableStandardPeriod.push(this.timePeriods[i].name);
      }
    }

    this.calculatedPeriods = applicableStandardPeriod;
    return applicableStandardPeriod;
  }

  drawButtons () {}

  setChartRangeObButtonClick () {}

  configure (config) {
    this.config = config;
  }

  init (require) {
    require('X-Axis', 'Y-Axis', 'graphics', 'chart', 'extensionData', 'dateFormatter',
      function (x, y, graphics, chart, extData, dateFormatter) {

      });
  }

  placeInCanvas () {}

  draw () {
    // drawing of the standard time periods happens here
  }

  dispose () {}
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = StandardPeriodSelector;
} else {
  window.StandardPeriod = StandardPeriodSelector;
}
