'use strict';

class StandardPeriodSelector {
  constructor () {
    this.all = 1;
    this.calculatedPeriods = [];
    this.startDataset = 0;
    this.endDataset = 7999999999999;
    this.startActiveWindow = 55000000;
    this.endActiveWindow = 60000000;
    this.standardPeriods = [];
    this.timePeriods = [{
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
    this.config = {};
  }

  calculateApplicableUnitPeriods () {
    var targetBlock = this.endActiveWindow - this.startDataset;
    var i = 0;
    var j = 0;
    var activeWindow = this.endActiveWindow - this.startActiveWindow;
    this.standardPeriods = [];
    console.log('activeWindow', activeWindow);
    for (i = 0; i < this.timePeriods.length; i++) {
      // checking whether the unit is applicable for the current target block
      if (targetBlock / this.timePeriods[i].milliseconds >= 1) {
        // checking whether the unit is of the higher order and only multiplier 1 is applicable
        if (Math.floor((activeWindow) / this.timePeriods[i].milliseconds) < 1) {
          this.standardPeriods.push({
            'abbreviation': this.timePeriods[i].abbreviation,
            'description': this.timePeriods[i].description,
            'milliseconds': this.timePeriods[i].milliseconds,
            'multipliers': [1]
          });
        } else { // if the unit is of the order of the target block and calculating the multipliers
          this.standardPeriods.push({
            'abbreviation': this.timePeriods[i].abbreviation,
            'description': this.timePeriods[i].description,
            'milliseconds': this.timePeriods[i].milliseconds,
            'multipliers': []
          });
          // calculating and populating the applicable multpliers of each unit
          for (j = 0; j < this.timePeriods[i].multipliers.length; j++) {
            if (activeWindow / 10 < this.timePeriods[i].multipliers[j] * this.timePeriods[i].milliseconds) {
              this.standardPeriods[this.standardPeriods.length - 1].multipliers.push(
                this.timePeriods[i].multipliers[j]
                );
            }
          }
        }
      }
    }
    this.drawButtons(this.standardPeriods);
    return this.standardPeriods;
  }

  calculateApplicableStandardPeriods () {
    var applicableStandardUnitPeriod = this.calculateApplicableStandardPeriods();
    return applicableStandardUnitPeriod;
  }

  setActivePeriod (start, end) {
    console.log(start, end);
    this.startActiveWindow = start;
    this.endActiveWindow = end;
    document.getElementById('startActiveRange').innerHTML = new Date(this.startActiveWindow);
    document.getElementById('endActiveRange').innerHTML = new Date(this.endActiveWindow);
    this.calculateApplicableUnitPeriods();
  }

  setTimeline (start, end) {
    console.log(start, end);
    this.startDataset = start;
    this.endDataset = end;
    document.getElementById('startActiveRange').innerHTML = new Date(this.startDataset);
    document.getElementById('endActiveRange').innerHTML = new Date(this.endDataset);
    this.calculateApplicableUnitPeriods();
  }

  setActivePeriodStart (start) {
    this.startActiveWindow = this.endActiveWindow - start;
    this.calculateApplicableUnitPeriods();
  }

  setActivePeriodEnd (end) {
    this.endActiveWindow = this.startActiveWindow + end;
    this.calculateApplicableUnitPeriods();
  }

  drawButtons (standardPeriods) {
    var calculatedButtons = document.getElementById('calculated');
    var btn;
    var i = 0;
    var j = 0;
    var multiplierValue = 0;
    var self = this;
    calculatedButtons.innerHTML = '';
    for (i = standardPeriods.length - 1; i >= 0; i--) {
      for (j = standardPeriods[i].multipliers.length - 1; j >= 0; j--) {
        btn = document.createElement('BUTTON');
        btn.id = standardPeriods[i].multipliers[j] + standardPeriods[i].abbreviation;
        btn.innerHTML = standardPeriods[i].multipliers[j] + standardPeriods[i].abbreviation;
        multiplierValue = standardPeriods[i].multipliers[j] * standardPeriods[i].milliseconds;
        btn.multiplierValue = multiplierValue;
        btn.addEventListener('click', function (event) {
          self.setActivePeriod(self.endActiveWindow - event.srcElement.multiplierValue, self.endActiveWindow);
        });
        calculatedButtons.appendChild(btn);
      }
    }
    this.standardPeriods = [];
  }

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
