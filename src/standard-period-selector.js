'use strict';

/**
 * Class definition of StandardPeriodSelector
 */

class StandardPeriodSelector {
  constructor () {
    /**
     * @private
     */
    this.all = 1;
    this.calculatedPeriods = [];
    this.startDataset = 0;
    this.endDataset = 990019999999;
    this.startActiveWindow = 55000000;
    this.endActiveWindow = 60000000;
    this.standardCalculatedPeriods = [];
    this.standardContexualPeriods = [];
    this.timePeriods = [{
      'name': 'second',
      'milliseconds': 1000,
      'startingPoint': 0,
      'total': 60,
      'abbreviation': 'sec',
      'description': 'SECOND',
      'parent': 'minute',
      'multipliers': [1, 5, 15, 30]
    }, {
      'name': 'minute',
      'milliseconds': 60000,
      'startingPoint': 0,
      'total': 60,
      'abbreviation': 'min',
      'description': 'MINUTE',
      'parent': 'hour',
      'multipliers': [1, 5, 15, 30]
    }, {
      'name': 'hour',
      'milliseconds': 3600000,
      'startingPoint': 0,
      'total': 24,
      'abbreviation': 'hr',
      'description': 'HOUR',
      'parent': 'day',
      'multipliers': [1, 3, 6, 12]
    }, {
      'name': 'day',
      'milliseconds': 86400000,
      'startingPoint': 0,
      'total': 30,
      'abbreviation': 'D',
      'description': 'DAY',
      'parent': 'month',
      'multipliers': [1, 7, 15]
    }, {
      'name': 'month',
      'milliseconds': 2592000000,
      'startingPoint': 0,
      'total': 12,
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
    this.tdButtons = [
      {
        'name': 'YTD',
        'abbreviation': 'YTD',
        'parent': 'year',
        'milliseconds': 31104000000,
        'description': 'Year to Date'
      },
      {
        'name': 'QTD',
        'abbreviation': 'QTD',
        'parent': 'month',
        'multiplier': 3,
        'milliseconds': 7776000000,
        'description': 'Quarter to Date'
      },
      {
        'name': 'MTD',
        'abbreviation': 'MTD',
        'parent': 'month',
        'milliseconds': 2592000000,
        'description': 'Month to Date'
      },
      {
        'name': 'WTD',
        'abbreviation': 'WTD',
        'parent': 'day',
        'multiplier': 7,
        'milliseconds': 604800000,
        'description': 'Week to Date'
      },
      {
        'name': 'Y',
        'abbreviation': 'Y',
        'parent': 'day',
        'milliseconds': 86400000,
        'description': 'Yesterday'
      },
      {
        'name': 'T',
        'abbreviation': 'T',
        'parent': 'day',
        'milliseconds': 86400000,
        'description': 'Today'
      }
    ];
    this.config = {};
  }

  /**
   * A function to generate the calculated buttons using
   * the active range and the location of the active range
   */
  generateCalculatedButtons () {
    var targetBlock = this.endActiveWindow - this.startDataset,
      i = 0,
      j = 0,
      activeWindow = this.endActiveWindow - this.startActiveWindow;
    this.standardCalculatedPeriods = [];
    console.log('activeWindow', activeWindow);
    for (i = 0; i < this.timePeriods.length; i++) {
      // checking whether the unit is applicable for the current target block
      if (targetBlock / this.timePeriods[i].milliseconds >= 1) {
        // checking whether the unit is of the higher order and only multiplier 1 is applicable
        if (Math.floor((activeWindow) / this.timePeriods[i].milliseconds) < 1) {
          this.standardCalculatedPeriods.push({
            'abbreviation': this.timePeriods[i].abbreviation,
            'description': this.timePeriods[i].description,
            'milliseconds': this.timePeriods[i].milliseconds,
            'multipliers': [1]
          });
        } else { // if the unit is of the order of the target block and calculating the multipliers
          this.standardCalculatedPeriods.push({
            'abbreviation': this.timePeriods[i].abbreviation,
            'description': this.timePeriods[i].description,
            'milliseconds': this.timePeriods[i].milliseconds,
            'multipliers': []
          });
          // calculating and populating the applicable multpliers of each unit
          for (j = 0; j < this.timePeriods[i].multipliers.length; j++) {
            if (activeWindow / 10 < this.timePeriods[i].multipliers[j] * this.timePeriods[i].milliseconds) {
              this.standardCalculatedPeriods[this.standardCalculatedPeriods.length - 1].multipliers.push(
                this.timePeriods[i].multipliers[j]
                );
            }
          }
        }
      }
    }
    this.drawButtonsCalculated(this.standardCalculatedPeriods);
  }

  /**
   * A function to generate the contextual buttons using
   * the end point of the time-scale
   */
  generateContextualButtons () {
    // generating an array with applicable TD buttons
    var buttons = [],
      i = 0,
      endStamp = this.endDataset,
      dateStart = new Date(endStamp),
      dateEnd = new Date(endStamp);
    for (; i < this.tdButtons.length; i++) {
      dateStart = new Date(endStamp);
      if (this.tdButtons[i].name === 'YTD') {
        console.log('YTD');
        dateStart.setMonth(0);
        dateStart.setDate(0);
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
      } else if (this.tdButtons[i].name === 'MTD') {
        console.log('MTD');
        dateStart.setDate(0);
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
      } else if (this.tdButtons[i].name === 'QTD') {
        console.log('QTD');
        dateStart.setMonth(11 - (dateStart.getMonth() % 4));
        dateStart.setDate(0);
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
      } else if (this.tdButtons[i].name === 'WTD') {
        console.log('WTD');
        dateStart.setDate(dateStart.getDate() - dateStart.getDay());
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
      } else if (this.tdButtons[i].name === 'Y') {
        console.log('Y');
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
        dateStart -= 86400000;
      } else if (this.tdButtons[i].name === 'T') {
        console.log('T');
        dateStart.setHours(0);
        dateStart.setMinutes(0);
        dateStart.setSeconds(0);
      }

      if (dateEnd < dateStart) {
        continue;
      } else {
        this.tdButtons[i].dateStart = dateStart.valueOf();
        this.tdButtons[i].dateEnd = dateEnd.valueOf();
        buttons.push(this.tdButtons[i]);
      }
    }
    this.standardContexualPeriods = buttons;
    this.drawButtonsContextual(this.standardContexualPeriods);
  }

  /**
   * A function to set the active period's
   * start and end point
   * @param  {number} date stamp - A UNIX timestamp to be set as the start point of active period
   * @param  {number} date stamp - A UNIX timestamp to be set as the end point of active period
   */
  setActivePeriod (start, end) {
    console.log(start, end);
    this.startActiveWindow = start;
    this.endActiveWindow = end;
    document.getElementById('startActiveRange').innerHTML = new Date(this.startActiveWindow);
    document.getElementById('endActiveRange').innerHTML = new Date(this.endActiveWindow);
    this.generateCalculatedButtons();
  }

  /**
   * A function to set the start and end point of the
   * entire time-line
   * @param  {number} date stamp - A UNIX timestamp to be set as the start point of time-line
   * @param  {number} date stamp - A UNIX timestamp to be set as the end point of time-line
   */
  setTimeline (start, end) {
    console.log(start, end);
    this.startDataset = start;
    this.endDataset = end;
    document.getElementById('startActiveRange').innerHTML = new Date(this.startDataset);
    document.getElementById('endActiveRange').innerHTML = new Date(this.endDataset);
    this.generateCalculatedButtons();
  }

  /**
   * A function to draw the calculated buttons in the canvas
   * @param  {array} array of objects - An array of objects with the standard periods to be drawn information
   */
  drawButtonsCalculated (standardPeriods) {
    var calculatedButtons = document.getElementById('calculated'),
      btn,
      i = 0,
      j = 0,
      multiplierValue = 0,
      self = this;
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
          console.log(self.endActiveWindow - event.srcElement.multiplierValue, self.endActiveWindow);
        });
        calculatedButtons.appendChild(btn);
      }
    }
    this.standardCalculatedPeriods = [];
  }

  /**
   * A function to draw the contextual buttons.
   * @param  {array} array of objects - An array of objects with the standard periods to be drawn information
   */
  drawButtonsContextual (standardPeriods) {
    var contextualButtons = document.getElementById('contextual'),
      btn,
      i = 0,
      self = this;
    contextualButtons.innerHTML = '';
    console.log(standardPeriods);
    for (i = 0; i < standardPeriods.length; i++) {
      btn = document.createElement('BUTTON');
      btn.id = standardPeriods[i].abbreviation;
      btn.innerHTML = standardPeriods[i].abbreviation;
      btn.addEventListener('click', eventBtn.bind(this, standardPeriods[i]));
      contextualButtons.appendChild(btn);
    }
    function eventBtn (obj) {
      self.setActivePeriod(obj.dateStart, obj.dateEnd);
      console.log(obj.dateStart, obj.dateEnd);
    }
    this.standardContextualPeriods = [];
  }

  /**
   * A function to draw the ALL button.
   * @param  {array} array of objects - An array of objects with the standard periods to be drawn information
   */
  drawButtonAll (standardPeriods) {
    var allButtons = document.getElementById('allButton'),
      btn,
      self = this;
    allButtons.innerHTML = '';
    console.log(standardPeriods);
    btn = document.createElement('BUTTON');
    btn.id = 'all';
    btn.innerHTML = 'ALL';
    btn.addEventListener('click', function (event) {
      self.setActivePeriod(self.startDataset, self.endDataset);
    });
    allButtons.appendChild(btn);
  }

  /**
   * A function to set the object to set the user preferences
   */
  configure (config) {
    this.config = config;
  }

  /**
   * Fusioncharts life cycle method for extension
   */
  init (require) {
    require('X-Axis', 'Y-Axis', 'graphics', 'chart', 'extensionData', 'dateFormatter',
      function (x, y, graphics, chart, extData, dateFormatter) {

      });
  }

  /**
   * Fusioncharts life cycle method for extension
   */
  placeInCanvas () {}

  /**
   * Fusioncharts life cycle method for extension
   */
  draw () {
    // drawing of the standard time periods happens here
  }

  /**
   * Fusioncharts life cycle method for extension
   */
  dispose () {}
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = StandardPeriodSelector;
} else {
  window.StandardPeriod = StandardPeriodSelector;
}
