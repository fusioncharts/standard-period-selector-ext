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
      this.clickedId = 'ALL';
      this.noCalcButtons = 0;
      this.calculatedButtonObj = {};
      this.minimumBucket = 1;
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
        count = 0,
        self = this;
      self.standardCalculatedPeriods = [];
      for (i = 0; i < self.timePeriods.length; i++) {
        // checking whether the unit is applicable for the current target block
        if (targetBlock / self.timePeriods[i].interval >= 1) {
          // checking whether the unit is of the higher order and only multiplier 1 is applicable
          if (Math.floor((activeWindow) / self.timePeriods[i].interval) < 1) {
            self.standardCalculatedPeriods.push({
              'abbreviation': self.timePeriods[i].abbreviation.single,
              'description': self.timePeriods[i].description,
              'milliseconds': self.timePeriods[i].interval,
              'name': self.timePeriods[i].name,
              'multipliers': [1]
            });
          } else { // if the unit is of the order of the target block and calculating the multipliers
            self.standardCalculatedPeriods.push({
              'abbreviation': self.timePeriods[i].abbreviation.single,
              'description': self.timePeriods[i].description,
              'milliseconds': self.timePeriods[i].interval,
              'name': self.timePeriods[i].name,
              'multipliers': []
            });
            // calculating and populating the applicable multpliers of each unit
            for (j = 0; j < self.timePeriods[i].multipliers.length; j++) {
              if (activeWindow / self.ratio < self.timePeriods[i].multipliers[j] * self.timePeriods[i].interval &&
                (self.timePeriods[i].multipliers[j] * self.timePeriods[i].interval) > self.minimumBucket) {
                self.standardCalculatedPeriods[self.standardCalculatedPeriods.length - 1].multipliers.push(
                  self.timePeriods[i].multipliers[j]
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
          if (+this.endDataset === +dateStart) {
            dateStart = +dateStart - 86400000;
          }
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

    processMultipliers (timeArr) {
      var self = this;
      for (let i = 0; i < timeArr.length; i++) {
        let len = timeArr[i].possibleFactors.length,
          timeName = timeArr[i] && timeArr[i].name,
          timeObj = timeArr && timeArr[i],
          customMultipliers = self.extData && self.extData.customMultipliers || {};
        timeObj.multipliers = [];
        if (customMultipliers[timeName]) {
          timeObj.multipliers = customMultipliers[timeName];
        } else if (len === 1) {
          timeObj.multipliers.push(timeObj.possibleFactors[0]);
        } else if (len === 2) {
          timeObj.multipliers.push(timeObj.possibleFactors[0]);
          timeObj.multipliers.push(timeObj.possibleFactors[len - 1]);
        } else {
          timeObj.multipliers.push(timeObj.possibleFactors[0]);
          timeObj.multipliers.push(Math.floor(timeObj.possibleFactors[len - 1] / 2));
          timeObj.multipliers.push(timeObj.possibleFactors[len - 1]);
        }
      }
      return timeArr;
    }

    /**
     * A function to set the active period's
     * start and end point
     * @param  {number} date stamp - A UNIX timestamp to be set as the start point of active period
     * @param  {number} date stamp - A UNIX timestamp to be set as the end point of active period
     */
    setActivePeriod (a, b) {
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
      if (this.periodButtonClicked) {
        this.periodButtonClicked = false;
        this.globalReactiveModel.model['x-axis-visible-range-start'] = this.startActiveWindow;
        this.globalReactiveModel.model['x-axis-visible-range-end'] = this.endActiveWindow;
      }
      this.generateCalculatedButtons();
      this.generateContextualButtons();
    }

    /**
     * A function to set the start and end point of the
     * entire time-line
     * @param  {number} date stamp - A UNIX timestamp to be set as the start point of time-line
     * @param  {number} date stamp - A UNIX timestamp to be set as the end point of time-line
     */

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
      var instance = this,
        i = 0,
        j = 0,
        ii = 0,
        jj = 0,
        standardCalculatedPeriods = instance.standardCalculatedPeriods;
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
        'extData',
        'chartInstance',
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
              smartLabel,
              extData,
              chartInstance) {
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
          instance.extData = extData;
          instance.chartInstance = chartInstance;
        }
      ]);
      instance.endActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-end'];
      instance.startActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-start'];
      instance.startDataset = instance.globalReactiveModel.model['x-axis-absolute-range-start'];
      instance.endDataset = instance.globalReactiveModel.model['x-axis-absolute-range-end'];
      // instance.globalReactiveModel.model['_x-axis-visible-range-start'] += 124416000000;
      instance.timeRules = instance.chartInstance.apiInstance.getComponentStore();
      instance.timeRules = instance.timeRules.getCanvasByIndex(0).composition.impl;
      instance.timeRules = instance.timeRules.getDataAggregator();
      instance.timeRules = instance.timeRules.getAggregationTimeRules();
      instance.timePeriods = instance.processMultipliers(instance.timeRules);
      // instance.minimumBucket = +instance.globalReactiveModel['x-axis-maximum-allowed-ticks'] *
      //   +instance.globalReactiveModel['minimum-consecutive-datestamp-diff;'];
      // minimum-consecutive-datestamp-diff
      // x-axis-maximum-allowed-ticks
      // console.log(instance.globalReactiveModel);
      // console.log(instance.globalReactiveModel.model['x-axis-maximum-allowed-ticks']);
      // console.log(instance.globalReactiveModel.model['minimum-consecutive-datestamp-diff;']);
      instance.setActivePeriod(instance.startActiveWindow, instance.endActiveWindow);
      instance.toolbars = [];
      instance.measurement = {};
      instance.flag = true;

      instance.toolbars.push(instance.createToolbar());

      instance.globalReactiveModel.onPropsChange(['x-axis-visible-range-start', 'x-axis-visible-range-end'], propsHandler);
      function propsHandler (start, end, flag) {
        instance.lastDisposed = instance.lastDisposed || 0;
        if (flag) {
          instance.launchedPropsHandler = false;
          start = instance.propsStart;
          end = instance.propsEnd;
        }
        instance.propsStart = start;
        instance.propsEnd = end;
        if (+new Date() - instance.lastDisposed < 400) {
          if (!instance.launchedPropsHandler) {
            instance.launchedPropsHandler = true;
            setTimeout(propsHandler.bind(null, 0, 0, true));
          }
          return;
        }
        instance.lastDisposed = +new Date();
        instance.setActivePeriod(start[1], end[1]);
        for (let i = 0; i < instance.standardCalculatedPeriods.length; i++) {
          for (let j = 0; j < instance.standardCalculatedPeriods[i].multipliers.length; j++) {
            if ((end[1] - start[1]) >= (instance.endDataset - instance.startDataset)) {
              instance.clickedId = 'ALL';
            } else if ((end[1] - start[1]) >= instance.timePeriods[i].multipliers[j] * instance.timePeriods[i].interval) {
              instance.clickedId = instance.timePeriods[i].multipliers[j] + instance.timePeriods[i].abbreviation.single;
            }
          }
        }

        if (!instance.cantDispose) {
          instance.cantDispose = true;
          instance.toolbar.dispose();
          instance.toolbars.pop();
          instance.toolbars.push(instance.createToolbar());
          instance.getLogicalSpace();
          instance.draw();
        } else {
          instance.cantDispose = false;
        }
      }
      return instance;
    };

    createToolbar () {
      var unigroup,
        toolbar,
        calculatedButtons,
        contextualButtons,
        allButton,
        self = this,
        deductorAr = [],
        startMultiplier,
        deductor,
        i,
        j,
        contextualConfig,
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
      }, self.extData.style['label-config']);
      group.addSymbol(fromDateLabel);
      allButton = new this.toolbox.Symbol('ALL', true, {
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      }, self.extData.style['all-config']).attachEventHandlers({
        click: function () {
          self.periodButtonClicked = true;
          self.clickedId = 'ALL';
          self.setActivePeriod(self.startDataset, self.endDataset);
          // toolbar.dispose();
          // self.toolbars.pop();
          // self.toolbars.push(self.createToolbar());
          // self.getLogicalSpace();
          // self.draw();
          // self._ref.reAllocate(self.parentGroup);
        },
        tooltext: 'ALL'
      });

      unigroup.addSymbol(allButton);
      for (i = 0; i < this.standardCalculatedPeriods.length; i++) {
        for (j = this.standardCalculatedPeriods[i].multipliers.length - 1; j >= 0; j--) {
          deductorAr.push(self.standardCalculatedPeriods[i].multipliers[j] * self.standardCalculatedPeriods[i].milliseconds);
        }
      }

      calculatedButtons = {};
      for (let key in this.calculatedButtonObj) {
        this.calculatedButtonObj[key].hide();
      }
      for (let i = self.startPointUnit; i >= 0; i--) {
        if (i === self.startPointUnit) {
          startMultiplier = self.startPointMultiplier;
        } else {
          startMultiplier = self.standardCalculatedPeriods[i].multipliers.length - 1;
        }
        for (let j = startMultiplier; j >= 0; j--) {
          let keyAbb = self.standardCalculatedPeriods[i].multipliers[j] + self.standardCalculatedPeriods[i].abbreviation;
          if (this.calculatedButtonObj[keyAbb] === undefined) {
            calculatedButtons = new this.toolbox.Symbol(keyAbb, true, {
              paper: this.graphics.paper,
              chart: this.chart,
              smartLabel: this.smartLabel,
              chartContainer: this.graphics.container
            }, self.extData.style['calculated-config']).attachEventHandlers({
              'click': function () {
                self.periodButtonClicked = true;
                self.clickedId = self.standardCalculatedPeriods[i].multipliers[j] + self.standardCalculatedPeriods[i].abbreviation;
                deductor = (self.standardCalculatedPeriods[i].multipliers[j] * self.standardCalculatedPeriods[i].milliseconds);
                self.setActivePeriod(deductor);
                // toolbar.dispose();
                // self.toolbars.pop();
                // self.toolbars.push(self.createToolbar());
                // self.getLogicalSpace();
                // self.draw();
                // self._ref.reAllocate(self.parentGroup);
                // this.toolbars[this.toolbars.length - 1] = this.createToolbar();
              },
              tooltext: self.standardCalculatedPeriods[i].multipliers[j] + ' ' + self.standardCalculatedPeriods[i].description
            });
            this.calculatedButtonObj[keyAbb] = calculatedButtons;
          }
          // unigroup.addSymbol(calculatedButtons[i]);
          this.calculatedButtonObj[keyAbb].show();
          unigroup.addSymbol(this.calculatedButtonObj[keyAbb]);
        }
      }

      // for (let i = self.startPointUnit; i >= 0; i--) {
      //   for (let j = startMultiplier; j >= 0; j--) {
      //     let keyAbb = self.standardCalculatedPeriods[i].multipliers[j] + self.standardCalculatedPeriods[i].abbreviation;
      //     unigroup.addSymbol(this.calculatedButtonObj[keyAbb]);
      //   }
      // }

      contextualButtons = [];

      for (let i = 0; i < this.standardContexualPeriods.length; i++) {
        contextualConfig = (i === 0) ? self.extData.style['contextual-config-first'] : self.extData.style['contextual-config'];
        contextualButtons[i] = new this.toolbox.Symbol(this.standardContexualPeriods[i].abbreviation, true, {
          paper: this.graphics.paper,
          chart: this.chart,
          smartLabel: this.smartLabel,
          chartContainer: this.graphics.container
        }, contextualConfig).attachEventHandlers({
          'click': function () {
            self.periodButtonClicked = true;
            self.clickedId = self.standardContexualPeriods[i].abbreviation;
            self.setActivePeriod(self.standardContexualPeriods[i].dateStart, self.standardContexualPeriods[i].dateEnd);
            // toolbar.dispose();
            // self.toolbars.pop();
            // self.toolbars.push(self.createToolbar());
            // self.getLogicalSpace();
            // self.draw();
            // self._ref.reAllocate(self.parentGroup);
          },
          tooltext: this.standardContexualPeriods[i].description
        });
        unigroup.addSymbol(contextualButtons[i]);
      }

      this.SymbolStore.register('textBoxIcon', function (x, y, rad, w, h, padX, padY) {
        var x1 = x - w / 2 + padX / 2,
          x2 = x + w / 2 - padX / 2,
          y1 = y - h / 2 + padY / 2,
          y2 = y + h / 2 - padY / 2;

        return ['M', x1, y1, 'L', x2, y1, 'L', x2, y2, 'L', x1, y2, 'Z'];
      });

      toolbar.addComponent(group);
      toolbar.addComponent(unigroup);
      this.toolbar = toolbar;
      return toolbar;
    };

    getLogicalSpace (availableWidth = this._pWidth, availableHeight = this._pHeight) {
      // availableWidth /= 2;
      var logicalSpace,
        width = 420, // width hardcoded; TODO: make it dynamic
        height = 0,
        i,
        ln;

      for (i = 0, ln = this.toolbars.length; i < ln; i++) {
        logicalSpace = this.toolbars[i].getLogicalSpace(availableWidth, availableHeight);
        // width = Math.max(logicalSpace.width, width);
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

    getDefaultGroup () {
      return this.parentGroup;
    }

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
          return obj[self.extData.layout];
        },
        orientation: [{
          type: function (obj) {
            return obj[self.extData.orientation];
          },
          position: [{
            type: function (obj) {
              return obj[self.extData.posWrtCanvas];
            },
            alignment: [{
              type: function (obj) {
                return obj[self.extData.alignment];
              },
              dimensions: [function () {
                var parent = this.getParentComponentGroup();
                self._ref = this;
                return self.getLogicalSpace((self._pWidth = parent.getWidth()), (self._pHeight = parent.getHeight()));
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
        symbolList,
        boundElement,
        bBox,
        x1,
        x2,
        y2,
        selectLine;

      this.flag = true;
      selectLine = this.saveSelectLine || this.graphics.paper.path({
        'stroke': '#c95a5a',
        'stroke-width': '2px'
      }).toFront();
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
      this.saveSelectLine = selectLine;
      symbolList = toolbars[0].componentGroups[1].symbolList;
      for (let i = 0, ii = symbolList.length; i < ii; i++) {
        if (symbolList[i].symbol === this.clickedId) {
          boundElement = symbolList[i].getBoundElement();
          bBox = boundElement.getBBox();
          x1 = bBox.x;
          x2 = bBox.x2;
          y2 = bBox.y2;

          selectLine.attr({
            path: ['M', x1 - 0.5, y2 - 0.5, 'L', x2 + 0.5, y2 - 0.5]
          });
        }
      }
      this.minimumBucket = this.globalReactiveModel.model['minimum-consecutive-datestamp-diff'] * this.globalReactiveModel.model['x-axis-maximum-allowed-ticks'];
    };
  }
  return StandardPeriodSelector;
};
