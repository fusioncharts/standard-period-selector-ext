'use strict';

/**
 * Class definition of StandardPeriodSelector
 */

module.exports = function (dep) {
  class StandardPeriodSelector {
    constructor () {
      /**
       * @private
       */
      this.ratio = 8;
      this.toolbox = FusionCharts.getComponent('api', 'toolbox');
      this.HorizontalToolbar = this.toolbox.HorizontalToolbar;
      this.ComponentGroup = this.toolbox.ComponentGroup;
      this.SymbolStore = this.toolbox.SymbolStore;
      this.all = 1;
      this.calculatedPeriods = [];
      this.startDataset = 0;
      // this.endDataset = this.globalReactiveModel.model['x-axis-absolute-range-end'];
      this.startActiveWindow = 0;
      this.endActiveWindow = 1;
      this.standardCalculatedPeriods = [];
      this.standardContexualPeriods = [];
      this.startPointUnit = 0;
      this.startPointMultiplier = 0;
      this.clickedId;
      this.noCalcButtons = 0;
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
      this.config = {
        anchorPositions: 'right',
        all: '1',
        contextual: '1',
        calculated: '1',
        tertiaryTimePeriods: {}
      };
    }

    /**
     * A function to generate the calculated buttons using
     * the active range and the location of the active range
     */
    generateCalculatedButtons () {
      var targetBlock = this.endActiveWindow - this.startDataset,
        i = 0,
        j = 0,
        activeWindow = this.endActiveWindow - this.startActiveWindow,
        count = 0;
      this.standardCalculatedPeriods = [];
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
              if (activeWindow / this.ratio < this.timePeriods[i].multipliers[j] * this.timePeriods[i].milliseconds) {
                this.standardCalculatedPeriods[this.standardCalculatedPeriods.length - 1].multipliers.push(
                  this.timePeriods[i].multipliers[j]
                  );
              }
            }
          }
        }
      }
      this.noCalcButtons = Infinity;
      for (i = 0; i < this.standardCalculatedPeriods.length; i++) {
        for (j = 0; j < this.standardCalculatedPeriods[i].multipliers.length; j++) {
          ++count;
          if (this.noCalcButtons > i) {
            this.noCalcButtons = i;
          }
          if (count <= 4) {
            this.startPointMultiplier = j;
            this.startPointUnit = i;
          }
        }
      }

      // this.drawButtonsCalculated(this.standardCalculatedPeriods);
    }

    /**
     * A function to generate the contextual buttons using
     * the end point of the time-scale
     */
    generateContextualButtons () {
      // generating an array with applicable TD buttons
      var buttons = [],
        i = 0,
        endStamp = this.globalReactiveModel.model['x-axis-absolute-range-end'],
        dateStart = endStamp - 2,
        dateEnd = endStamp,
        relativeTDButton = {};
      for (; i < this.tdButtons.length; i++) {
        dateStart = new Date(endStamp);
        if (this.tdButtons[i].name === 'YTD') {
          dateStart.setMonth(0);
          dateStart.setDate(1);
          dateStart.setHours(0);
          dateStart.setMinutes(0);
          dateStart.setSeconds(0);
        } else if (this.tdButtons[i].name === 'MTD') {
          dateStart.setDate(1);
          dateStart.setHours(0);
          dateStart.setMinutes(0);
          dateStart.setSeconds(0);
        } else if (this.tdButtons[i].name === 'QTD') {
          dateStart.setMonth(11 - (dateStart.getMonth() % 4));
          dateStart.setDate(0);
          dateStart.setHours(0);
          dateStart.setMinutes(0);
          dateStart.setSeconds(0);
        } else if (this.tdButtons[i].name === 'WTD') {
          dateStart.setDate(dateStart.getDate() - dateStart.getDay());
          dateStart.setHours(0);
          dateStart.setMinutes(0);
          dateStart.setSeconds(0);
        } else if (this.tdButtons[i].name === 'Y') {
          dateStart.setHours(0);
          dateStart.setMinutes(0);
          dateStart.setSeconds(0);
          dateStart -= 86400000;
        } else if (this.tdButtons[i].name === 'T') {
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
      relativeTDButton.milliseconds = Infinity;
      for (i = 0; i < this.tdButtons.length; i++) {
        if (Math.abs(this.tdButtons[i].milliseconds - (this.endActiveWindow - this.startActiveWindow)) < relativeTDButton.milliseconds) {
          relativeTDButton.milliseconds = this.tdButtons[i].milliseconds;
          relativeTDButton.name = this.tdButtons[i].abbreviation;
        }
      }

      this.standardContexualPeriods = buttons;
      // this.drawButtonsContextual(this.standardContexualPeriods);
    }

    /**
     * A function to set the active period's
     * start and end point
     * @param  {number} date stamp - A UNIX timestamp to be set as the start point of active period
     * @param  {number} date stamp - A UNIX timestamp to be set as the end point of active period
     */
    setActivePeriod () {
      var start,
        end;
      if (arguments.length === 1) {
        end = this.globalReactiveModel.model['x-axis-visible-range-end'];
        start = end - arguments[0];
      } else if (arguments.length === 2) {
        start = arguments[0];
        end = arguments[1];
      }

      this.startActiveWindow = start;
      this.endActiveWindow = end;
      this.generateCalculatedButtons();
      this.globalReactiveModel.model['x-axis-visible-range-start'] = this.startActiveWindow;
      this.globalReactiveModel.model['x-axis-visible-range-end'] = this.endActiveWindow;
      this.generateContextualButtons();
    }

    /**
     * A function to set the start and end point of the
     * entire time-line
     * @param  {number} date stamp - A UNIX timestamp to be set as the start point of time-line
     * @param  {number} date stamp - A UNIX timestamp to be set as the end point of time-line
     */
    setTimeline (start, end) {
      this.startDataset = start;
      this.endDataset = end;
      document.getElementById('startActiveRange').innerHTML = new Date(this.startDataset);
      document.getElementById('endActiveRange').innerHTML = new Date(this.endDataset);
      this.generateCalculatedButtons();
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
      var instance = this;
      require([
        'xAxis',
        'yAxis',
        'graphics',
        'chart',
        'dataset',
        'PlotManager',
        'canvasConfig',
        'MarkerManager',
        'reactiveModel',
        'globalReactiveModel',
        'spaceManagerInstance',
        'smartLabel',
        function (
              xAxis,
              yAxis,
              graphics,
              chart,
              dataset,
              plotManager,
              canvasConfig,
              markerManager,
              reactiveModel,
              globalReactiveModel,
              spaceManagerInstance,
              smartLabel) {
          instance.xAxis = xAxis;
          instance.yAxis = yAxis;
          instance.graphics = graphics;
          instance.chart = chart;
          instance.dataset = dataset;
          instance.plotManager = plotManager;
          instance.markerManager = markerManager;
          instance.canvasConfig = canvasConfig;
          instance.reactiveModel = reactiveModel;
          instance.globalReactiveModel = globalReactiveModel;
          instance.spaceManagerInstance = spaceManagerInstance;
          instance.smartLabel = smartLabel;
        }
      ]);
      this.spaceManagerInstance = instance.spaceManagerInstance;
      this.globalReactiveModel = instance.globalReactiveModel;
      this.endActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-end'];
      this.startActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-start'];
      this.startDataset = instance.globalReactiveModel.model['x-axis-absolute-range-start'];
      this.endDataset = instance.globalReactiveModel.model['x-axis-absolute-range-end'];
      this.setActivePeriod(this.startActiveWindow, this.endActiveWindow);
      // instance.globalReactiveModel.model['_x-axis-visible-range-start'] += 124416000000;
      this.setActivePeriod(this.startActiveWindow, this.endActiveWindow);

      this.toolbars = [];

      this.measurement = {};

      this.toolbars.push(this.createToolbar());
      return this;
    };

    createToolbar () {
      var unigroup,
        toolbar,
        calculatedButtons,
        contextualButtons,
        allButton,
        self = this,
        endActive = this.globalReactiveModel.model['x-axis-visible-range-end'],
        deductorAr = [],
        startMultiplier,
        deductor,
        i,
        j,
        margin,
        fromDateLabel,
        group;

      group = new this.toolbox.ComponentGroup({
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      });

      unigroup = new this.toolbox.UniSelectComponentGroup({
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      });
      unigroup.setConfig({
        fill: '#fff',
        borderThickness: 0
      });
      group.setConfig({
        fill: '#fff',
        borderThickness: 0
      });
      toolbar = new this.HorizontalToolbar({
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      });
      toolbar.setConfig({
        fill: '#fff',
        borderThickness: 0
      });
      fromDateLabel = new this.toolbox.Label('Zoom:', {
        smartLabel: this.smartLabel,
        paper: this.graphics.paper
      }, {
        text: {
          style: {
            'font-size': '15',
            'fontFamily': 'MyriadPro'
          }
        }
      });
      group.addSymbol(fromDateLabel);
      allButton = new this.toolbox.Symbol('ALL', true, {
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      }, {
        fill: '#ffffff',
        labelFill: '#696969',
        symbolStrokeWidth: '2',
        symbolStroke: '#000000',
        strokeWidth: '1',
        hoverFill: '#7f7f7f',
        radius: 1,
        margin: {
          right: 5
        }
      }).attachEventHandlers({
        click: function () {
          self.setActivePeriod(self.startDataset, self.endDataset);
          toolbar.dispose();
          self.clickedId = 'ALL';
          self.toolbars.pop();
          self.toolbars.push(self.createToolbar());
          self.getLogicalSpace();
          self.draw();
        }
      });

      unigroup.addSymbol(allButton);
      for (i = 0; i < this.standardCalculatedPeriods.length; i++) {
        for (j = this.standardCalculatedPeriods[i].multipliers.length - 1; j >= 0; j--) {
          deductorAr.push(self.standardCalculatedPeriods[i].multipliers[j] * self.standardCalculatedPeriods[i].milliseconds);
        }
      }

      calculatedButtons = [];
      for (let i = self.startPointUnit; i >= 0; i--) {
        if (i === self.startPointUnit) {
          startMultiplier = self.startPointMultiplier;
        } else {
          startMultiplier = self.standardCalculatedPeriods[i].multipliers.length - 1;
        }
        for (let j = startMultiplier; j >= 0; j--) {
          margin = (i === self.noCalcButtons && j === 0) ? 5 : 0;
          console.log(endActive, i, self.noCalcButtons, j, margin);
          calculatedButtons[i] = new this.toolbox.Symbol(self.standardCalculatedPeriods[i].multipliers[j] + self.standardCalculatedPeriods[i].abbreviation, true, {
            paper: this.graphics.paper,
            chart: this.chart,
            smartLabel: this.smartLabel,
            chartContainer: this.graphics.container
          }, {
            fill: '#ffffff',
            labelFill: '#696969',
            symbolStrokeWidth: '2',
            symbolStroke: '#000000',
            strokeWidth: '1',
            hoverFill: '#7f7f7f',
            radius: 1,
            margin: {
              right: margin
            }
          }).attachEventHandlers({
            'click': function () {
              deductor = (self.standardCalculatedPeriods[i].multipliers[j] * self.standardCalculatedPeriods[i].milliseconds);
              self.clickedId = self.standardCalculatedPeriods[i].multipliers[j] + self.standardCalculatedPeriods[i].abbreviation;
              self.setActivePeriod(deductor);
              toolbar.dispose();
              self.toolbars.pop();
              self.toolbars.push(self.createToolbar());
              self.getLogicalSpace();
              self.draw();
              // this.toolbars[this.toolbars.length - 1] = this.createToolbar();
            }
          });
          unigroup.addSymbol(calculatedButtons[i]);
        }
      }

      contextualButtons = [];

      for (let i = 0; i < this.standardContexualPeriods.length; i++) {
        contextualButtons[i] = new this.toolbox.Symbol(this.standardContexualPeriods[i].abbreviation, true, {
          paper: this.graphics.paper,
          chart: this.chart,
          smartLabel: this.smartLabel,
          chartContainer: this.graphics.container
        }, {
          fill: '#ffffff',
          labelFill: '#696969',
          symbolStrokeWidth: '2',
          symbolStroke: '#000000',
          strokeWidth: '1',
          hoverFill: '#7f7f7f',
          radius: 1,
          margin: {
            right: 0
          }
        }).attachEventHandlers({
          'click': function () {
            self.setActivePeriod(self.standardContexualPeriods[i].dateStart, self.standardContexualPeriods[i].dateEnd);
            self.clickedId = self.standardContexualPeriods[i].abbreviation;
            toolbar.dispose();
            self.toolbars.pop();
            self.toolbars.push(self.createToolbar());
            self.getLogicalSpace();
            self.draw();
          }
        });
        unigroup.addSymbol(contextualButtons[i]);
      }

        // btn = document.createElement('BUTTON');
        // btn.id = standardPeriods[i].abbreviation;
        // btn.innerHTML = standardPeriods[i].abbreviation;
        // btn.addEventListener('click', eventBtn.bind(this, standardPeriods[i]));
        // contextualButtons.appendChild(btn);

      this.SymbolStore.register('textBoxIcon', function (x, y, rad, w, h, padX, padY) {
        var x1 = x - w / 2 + padX / 2,
          x2 = x + w / 2 - padX / 2,
          y1 = y - h / 2 + padY / 2,
          y2 = y + h / 2 - padY / 2;

        return ['M', x1, y1, 'L', x2, y1, 'L', x2, y2, 'L', x1, y2, 'Z'];
      });

      toolbar.addComponent(group);
      toolbar.addComponent(unigroup);
      return toolbar;
    };

    getLogicalSpace (availableWidth, availableHeight) {
      availableWidth /= 2;
      var logicalSpace,
        width = 0,
        height = 0,
        i,
        ln;

      for (i = 0, ln = this.toolbars.length; i < ln; i++) {
        logicalSpace = this.toolbars[i].getLogicalSpace(availableWidth, availableHeight);
        width = Math.max(logicalSpace.width, width);
        height += logicalSpace.height;
        this.toolbars[i].width = logicalSpace.width;
        this.toolbars[i].height = logicalSpace.height;
      }
      height += this.padding;
      return {
        width: width,
        height: height
      };
    };

    placeInCanvas () {
      var self = this;
      self.padding = 5;
      self.spaceManagerInstance.add([{
        name: function () {
          return 'standard-period-selector-ext';
        },
        ref: function (obj) {
          return obj['0'];
        },
        self: function () {
          return self;
        },
        priority: function () {
          return 2;
        },
        layout: function (obj) {
          return obj.inline;
        },
        orientation: [{
          type: function (obj) {
            return obj.horizontal;
          },
          position: [{
            type: function (obj) {
              return obj.top;
            },
            alignment: [{
              type: function (obj) {
                return obj.left;
              },
              dimensions: [function () {
                var parent = this.getParentComponentGroup();
                return self.getLogicalSpace(parent.getWidth(), parent.getHeight());
              }]
            }]
          }]
        }]
      }]);
    };

    setDrawingConfiguration (x, y, width, height, group) {
      var mes = this.measurement;
      mes.x = x;
      mes.y = y;
      mes.width = width;
      mes.height = height;

      this.parentGroup = group;

      return this;
    };

    draw (x, y, width, height, group) {
      var measurement = this.measurement,
        toolbars = this.toolbars,
        ln,
        i,
        toolbar,
        boundElement,
        bBox,
        x1,
        x2,
        y2;

      x = x === undefined ? measurement.x : x;
      y = y === undefined ? measurement.y : y;
      width = width === undefined ? measurement.width : width;
      height = height === undefined ? measurement.height : height;
      group = group === undefined ? this.parentGroup : group;
      if (width && height) {
        for (i = 0, ln = toolbars.length; i < ln; i++) {
          toolbar = toolbars[i];
          toolbar.draw(x, y, group);
        }
      }
      console.log(toolbars);
      for (let i = 0, ii = toolbars[0].componentGroups[1].symbolList; i < ii.length; i++) {
        if (ii[i].symbol === this.clickedId) {
          boundElement = ii[i].getBoundElement();
          bBox = boundElement.getBBox();
          x1 = bBox.x;
          x2 = bBox.x2;
          y2 = bBox.y2;

          this.graphics.paper.path({
            path: ['M', x1, y2 - 2 / 2, 'L', x2, y2 - 2 / 2],
            'stroke': '#ff0000'
          }).toFront();
          // this._parentGroup.setState(this);
        }
      }
    };
  }
  return StandardPeriodSelector;
};
