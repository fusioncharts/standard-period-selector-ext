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
    this.config = {};
  }

  calculateApplicableUnitPeriods () {
    var targetBlock = this.endActiveWindow - this.startDataset;
    var applicableStandardUnitPeriod = [];
    var i = 0;
    var j = 0;
    // var counter = 0;
    var activeWindow = this.endActiveWindow - this.startActiveWindow;
    // counter = -1;
    // this.standardPeriods = [];
    console.log('activeWindow', activeWindow);
    for (i = 0; i < window.timePeriods.length; i++) {
      // console.log('window.timePeriods[i].milliseconds', window.timePeriods[i].milliseconds);
      // console.log(Math.round((activeWindow) / window.timePeriods[i].milliseconds));
      // console.log('window.timePeriods[i].milliseconds', window.timePeriods[i].multipliers);
      if (targetBlock / window.timePeriods[i].milliseconds >= 1) {
        console.log(window.timePeriods[i].description);
        if (Math.floor((activeWindow) / window.timePeriods[i].milliseconds) < 1) {
          window.timePeriods[i].applicableMultipliers = window.timePeriods[i].multipliers[0];
          this.standardPeriods.push({ 'multipliers': [window.timePeriods[i].multipliers[0]],
            'milliseconds': window.timePeriods[i].milliseconds,
            'abbreviation': window.timePeriods[i].abbreviation,
            'description': window.timePeriods[i].description});
          // counter++;
          console.log(window.timePeriods[i].multipliers[0] + window.timePeriods[i].abbreviation);
        } else {
          for (j = 0; j < window.timePeriods[i].multipliers.length; j++) {
            if (activeWindow / 5 < window.timePeriods[i].multipliers[j] * window.timePeriods[i].milliseconds) {
              if (window.timePeriods[i].applicableMultipliers === undefined) {
                window.timePeriods[i].applicableMultipliers = [];
              }
              if (this.standardPeriods[this.standardPeriods.length - 1] === undefined) {
                this.standardPeriods.push({ 'multipliers': [],
                  'milliseconds': window.timePeriods[i].milliseconds,
                  'abbreviation': window.timePeriods[i].abbreviation,
                  'description': window.timePeriods[i].description});
              }
              this.standardPeriods[this.standardPeriods.length - 1]
                .multipliers.push(window.timePeriods[i].multipliers[j]);
              // this.standardPeriods[this.standardPeriods.length - 1]
              //   .abbreviation = window.timePeriods[i].abbreviation;
              // this.standardPeriods[this.standardPeriods.length - 1]
              //   .milliseconds = window.timePeriods[i].milliseconds;
              // window.timePeriods[i].applicableMultipliers.push(window.timePeriods[i].multipliers[j]);
              console.log(window.timePeriods[i].multipliers[j] + window.timePeriods[i].abbreviation);
            }
          }
        }
        applicableStandardUnitPeriod.push(window.timePeriods[i]);
        console.log('================');
      }
    }
    return applicableStandardUnitPeriod;
  }

  calculateApplicableStandardPeriods () {
    var applicableStandardUnitPeriod = this.calculateApplicableStandardPeriods();
    return applicableStandardUnitPeriod;
  }

  setActivePeriod (start, end) {
    console.log(start, end);
    this.startActiveWindow = start;
    this.endActiveWindow = end;
    document.getElementById('startActiveRange').innerHTML = this.startActiveWindow;
    document.getElementById('endActiveRange').innerHTML = this.endActiveWindow;
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

  drawButtons () {
    var calculatedButtons = document.getElementById('calculated');
    var btn;
    var i = 0;
    var j = 0;
    var multiplierValue = 0;
    var self = this;
    calculatedButtons.innerHTML = '';
    console.clear();
    for (i = this.standardPeriods.length - 1; i >= 0; i--) {
      for (j = this.standardPeriods[i].multipliers.length - 1; j >= 0; j--) {
        console.log(this.standardPeriods[i].multipliers[j] + this.standardPeriods[i].abbreviation);
        btn = document.createElement('BUTTON');
        btn.id = this.standardPeriods[i].multipliers[j] + this.standardPeriods[i].abbreviation;
        btn.innerHTML = this.standardPeriods[i].multipliers[j] + this.standardPeriods[i].abbreviation;
        multiplierValue = self.standardPeriods[i].multipliers[j] * this.standardPeriods[i].milliseconds;
        btn.multiplierValue = multiplierValue;
        console.log(multiplierValue);
        btn.addEventListener('click', function (event) {
          console.log(event.srcElement.multiplierValue);
          self.setActivePeriod(self.endActiveWindow - event.srcElement.multiplierValue, self.endActiveWindow);
          self.drawButtons();
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
