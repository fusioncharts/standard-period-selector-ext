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
      var self = this;
      self.ratio = 8;
      self.toolbox = FusionCharts.getComponent('api', 'toolbox');
      self.HorizontalToolbar = self.toolbox.HorizontalToolbar;
      self.ComponentGroup = self.toolbox.ComponentGroup;
      self.SymbolStore = self.toolbox.SymbolStore;
      self.all = 1;
      self.calculatedPeriods = [];
      self.startDataset = 0;
      // self.endDataset = self.globalReactiveModel.model['x-axis-absolute-range-end'];
      self.startActiveWindow = 0;
      self.endActiveWindow = 1;
      self.standardCalculatedPeriods = [];
      self.standardContexualPeriods = [];
      self.startPointUnit = 0;
      self.startPointMultiplier = 0;
      self.clickedId = 'ALL';
      self.noCalcButtons = 0;
      self.minimumBucket = 5184000000;
      self.toolbar = {};
      self.categoryClicked;
      self.btns = {
        contextualObj: {},
        calculatedObj: {}
      };

      self.tdButtons = [
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
      self.config = {
        anchorPositions: 'right',
        all: '1',
        contextual: '1',
        calculated: '1',
        tertiaryTimePeriods: {}
      };

      self._babTimer = 0;

      self.propsChangeListener = (start, end) => {
        self.startActiveWindow = start[1];
        self.endActiveWindow = end[1];

        if (self._babTimer) {
          if (!self.updatePending) {
            self.updatePending = true;
            setTimeout(function () {
              self.updatePending = false;
              self.onActiveRangeChange();
            }, self._babTimer);
          }
        } else {
          self._babTimer = 300;
          self.onActiveRangeChange();
        }
      };
    }

    // ****** Make btns visible ******* /
    /**
     * A function to generate the calculated buttons using
     * the active range and the location of the active range
     */

    hideAllCalcBtns () {
      var self = this,
        calculatedObj = self.btns.calculatedObj,
        i;
      for (i in calculatedObj) {
        calculatedObj[i].btn.hide();
      }
    }

    showApplicableCalculatedButtons () {
      var targetBlock = this.endActiveWindow - this.startDataset,
        i = 0,
        j = 0,
        activeWindow = this.endActiveWindow - this.startActiveWindow,
        self = this,
        key,
        calculatedObj = self.btns.calculatedObj;

      self.hideAllCalcBtns();
      self.standardCalculatedPeriods = [];
      for (i = 0; i < self.timePeriods.length; i++) {
        // checking whether the unit is applicable for the current target block
        if (targetBlock / self.timePeriods[i].interval >= 1) {
          // checking whether the unit is of the higher order and only multiplier 1 is applicable
          if (this.extData['default-select'] === '1' + self.timePeriods[i].abbreviation.single) {
            this.clickedIdVal = self.timePeriods[i].interval;
          }
          if (Math.floor((activeWindow) / self.timePeriods[i].interval) < 1) {
            // self.show('1' + self.timePeriods[i].abbreviation.single);
            // self.calculatedObj['1' + self.timePeriods[i].abbreviation.single].show();
            self.standardCalculatedPeriods.push({
              'name': self.timePeriods[i].name,
              'abbreviation': self.timePeriods[i].abbreviation.single,
              'multipliers': [1]
            });
          } else { // if the unit is of the order of the target block and calculating the multipliers
            self.standardCalculatedPeriods.push({
              'name': self.timePeriods[i].name,
              'abbreviation': self.timePeriods[i].abbreviation.single,
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

      for (i = 0; i < self.standardCalculatedPeriods.length; i++) {
        for (j = 0; j < self.standardCalculatedPeriods[i].multipliers.length; j++) {
          key = self.standardCalculatedPeriods[i].multipliers[j] +
            self.standardCalculatedPeriods[i].name;
          calculatedObj[key].btn && calculatedObj[key].btn.show();
        }
      }
      self.toolbar && self.toolbar.redraw();
    }

    // ******** React on active property change ****

    heighlightActiveRange () {
      // first check w.r.t contextual btns then others
      var sps = this,
        selectLine = sps.saveSelectLine,
        boundElement,
        clickedId = sps.clickedId,
        bBox,
        x1,
        x2,
        y2,
        activeBtn,
        contextualObj = sps.btns.contextualObj,
        calculatedObj = sps.btns.calculatedObj;

      // if the heighliter is not createcd create it
      if (!selectLine) {
        selectLine = sps.saveSelectLine || (sps.saveSelectLine = sps.graphics.paper.path({
          'stroke': '#c95a5a',
          'stroke-width': '2px'
        }).toFront());
      }

      activeBtn = contextualObj[clickedId] || calculatedObj[clickedId] || sps.btns[clickedId];

      if (activeBtn) {
        boundElement = activeBtn.btn.svgElems.node;
        bBox = boundElement.getBBox();
        x1 = bBox.x;
        x2 = x1 + bBox.width;
        y2 = bBox.y + bBox.height;
        selectLine.show().attr({
          path: ['M', x1 - 0.5, y2 - 0.5, 'L', x2 + 0.5, y2 - 0.5]
        });
      } else {
        selectLine.hide();
      }
    }

    onActiveRangeChange () {
      var self = this,
        categoryClicked = self.categoryClicked,
        clickedId = self.clickedId,
        startDataset = self.startDataset,
        endDataset = self.endDataset,
        startActiveWindow = self.startActiveWindow,
        endActiveWindow = self.endActiveWindow,
        contextualObj = self.btns.contextualObj,
        calculatedObj = self.btns.calculatedObj,
        lastClickedBtnObj;

      if (categoryClicked === 'ALL') {
        if (!(startDataset === startActiveWindow && endDataset === endActiveWindow)) {
          delete self.clickedId;
          delete self.categoryClicked;
        }
      } else if (categoryClicked === 'contextual') {
        lastClickedBtnObj = contextualObj[clickedId];
        if (lastClickedBtnObj && !(startActiveWindow === lastClickedBtnObj.contextStart &&
          endActiveWindow === lastClickedBtnObj.contextEnd)) {
          delete self.clickedId;
          delete self.categoryClicked;
        }
      } else if (categoryClicked === 'calculated') {
        lastClickedBtnObj = calculatedObj[clickedId];
        if (lastClickedBtnObj && !((endActiveWindow - startActiveWindow) === lastClickedBtnObj.interval)) {
          delete self.clickedId;
          delete self.categoryClicked;
        }
      }

      self.showApplicableCalculatedButtons();
      self.heighlightActiveRange();
    }

    // *********** Drzaw the btns initialy ***** //

    // adds multipliers to the timerules object
    processMultipliers (timeArr) {
      var self = this;
      for (let i = 0; i < timeArr.length; i++) {
        let len = timeArr[i].possibleFactors.length,
          timeName = timeArr[i] && timeArr[i].name,
          timeObj = timeArr && timeArr[i],
          customMultipliers = self && self.customMultipliers || {};
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

    createCalculatedButtons (buttonGroup) {
      var self = this,
        btnCalc,
        calculatedObj = self.btns.calculatedObj,
        btnObj;
      for (let i = self.timePeriods.length - 1; i >= 0; i--) {
        for (let j = self.timePeriods[i].multipliers.length - 1; j >= 0; j--) {
          let keyAbb = self.timePeriods[i].multipliers[j] + self.timePeriods[i].abbreviation.single,
            keyName = self.timePeriods[i].multipliers[j] + self.timePeriods[i].name;
          let interval = (self.timePeriods[i].multipliers[j] * self.timePeriods[i].interval);
          btnObj = calculatedObj[keyName] = {
            interval: interval,
            fn: function () {
              self.clickedId = keyName;
              self.categoryClicked = 'calculated';
              self.globalReactiveModel.model['x-axis-visible-range-start'] = self.endActiveWindow - interval;
            },
            shortKey: keyAbb
          };

          btnCalc = new this.toolbox.Symbol(keyAbb, true, {
            paper: this.graphics.paper,
            chart: this.chart,
            smartLabel: this.smartLabel,
            chartContainer: this.graphics.container
          }, self.extData.style['calculated-config']).attachEventHandlers({
            'click': btnObj.fn,
            tooltext: self.timePeriods[i].multipliers[j] + ' ' + self.timePeriods[i].description
          });
          btnObj.btn = btnCalc;
          buttonGroup.addSymbol(btnCalc);
          // calculatedButtons.hide();
        }
      }
    }

    /**
     * A function to generate the contextual buttons using
     * the end point of the time-scale
     */
    generateCtxBtnList () {
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

        if (dateEnd < dateStart && (dateEnd - dateStart) < this.minimumBucket) {
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
    }

    createContextualButtons (buttonGroup) {
      var contextualButtons = [],
        self = this,
        contextualConfig,
        contextualObj = self.btns.contextualObj,
        btnObj,
        keyName;
      self.generateCtxBtnList();
      for (let i = 0; i < this.standardContexualPeriods.length; i++) {
        contextualConfig = (i === 0) ? self.extData.style['contextual-config-first'] || {
          fill: '#ffffff',
          labelFill: '#696969',
          symbolStrokeWidth: '2',
          stroke: '#ced5d4',
          strokeWidth: '1',
          height: 22,
          hoverFill: '#ced5d4',
          radius: 1,
          margin: {
            right: 0,
            left: 5
          },
          btnTextStyle: {
            'fontFamily': '"Lucida Grande", sans-serif',
            'fontSize': '13',
            'fill': '#696969',
            'line-height': '1',
            'letter-spacing': '-0.04em'
          }
        } : self.extData.style['contextual-config'] || {
          fill: '#ffffff',
          labelFill: '#696969',
          symbolStrokeWidth: '2',
          stroke: '#ced5d4',
          strokeWidth: '1',
          height: 22,
          hoverFill: '#ced5d4',
          radius: 1,
          margin: {
            right: 0,
            left: 0
          },
          btnTextStyle: {
            'fontFamily': '"Lucida Grande", sans-serif',
            'fontSize': '13',
            'fill': '#696969',
            'line-height': '1',
            'letter-spacing': '-0.04em'
          }
        };
        keyName = this.standardContexualPeriods[i].abbreviation;
        btnObj = contextualObj[keyName] = {
          contextStart: self.standardContexualPeriods[i].dateStart,
          contextEnd: self.standardContexualPeriods[i].dateEnd,
          fn: function () {
            self.categoryClicked = 'contextual';
            self.clickedId = self.standardContexualPeriods[i].abbreviation;
            self.globalReactiveModel
              .lock()
              .prop('x-axis-visible-range-start', self.standardContexualPeriods[i].dateStart)
              .prop('x-axis-visible-range-end', self.standardContexualPeriods[i].dateEnd)
              .unlock();
          }
        };

        btnObj.btn = new this.toolbox.Symbol(this.standardContexualPeriods[i].abbreviation, true, {
          paper: this.graphics.paper,
          chart: this.chart,
          smartLabel: this.smartLabel,
          chartContainer: this.graphics.container
        }, contextualConfig)
          .attachEventHandlers({
            'click': btnObj.fn,
            tooltext: this.standardContexualPeriods[i].description
          });

        if (self.standardContexualPeriods[i].dateEnd - self.standardContexualPeriods[i].dateStart >= self.minimumBucket) {
          buttonGroup.addSymbol(btnObj.btn);
        }
      }
    }

    // creates toolbar
    createToolbar () {
      var buttonGroup,
        toolbar = this.toolbar,
        allButton,
        self = this,
        fromDateLabel,
        group;

      // initiating the toolbar
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

      // making group for the extension label
      group = new this.toolbox.ComponentGroup({
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      });

      // making buttonGroup for the buttons
      buttonGroup = new this.toolbox.ComponentGroup({
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      });
      buttonGroup.setConfig({
        fill: '#fff',
        borderThickness: 0
      });
      group.setConfig({
        fill: '#fff',
        borderThickness: 0
      });

      // extension label
      fromDateLabel = new this.toolbox.Label('Zoom:', {
        smartLabel: this.smartLabel,
        paper: this.graphics.paper
      }, self.extData.style['label-config']);
      group.addSymbol(fromDateLabel);

      // 'ALL' button created
      allButton = {fn: function () {
        self.clickedId = 'ALL';
        self.categoryClicked = 'ALL';
        self.globalReactiveModel
          .lock()
          .prop('x-axis-visible-range-start', self.startDataset)
          .prop('x-axis-visible-range-end', self.endDataset)
          .unlock();
      }};
      allButton.btn = new this.toolbox.Symbol('ALL', true, {
        paper: this.graphics.paper,
        chart: this.chart,
        smartLabel: this.smartLabel,
        chartContainer: this.graphics.container
      }, self.extData.style['all-config']).attachEventHandlers({
        click: allButton.fn,
        tooltext: 'ALL'
      });

      self.btns['ALL'] = allButton;

      buttonGroup.addSymbol(allButton.btn);

      // create all calculated button
      self.createCalculatedButtons(buttonGroup);

      // create all contextual button
      self.createContextualButtons(buttonGroup);

      // adding group and button group to toolbar
      toolbar.addComponent(group);
      toolbar.addComponent(buttonGroup);
      this.toolbar = toolbar;
      return toolbar;
    };

    // *********** Extension interface methods *********//

      /**
     * Fusioncharts life cycle method for extension
     */
    init (require) {
      var instance = this;
      require([
        'graphics',
        'chart',
        'canvasConfig',
        'MarkerManager',
        'reactiveModel',
        'globalReactiveModel',
        'spaceManagerInstance',
        'smartLabel',
        'extData',
        'chartInstance',
        function (
              graphics,
              chart,
              canvasConfig,
              markerManager,
              reactiveModel,
              globalReactiveModel,
              spaceManagerInstance,
              smartLabel,
              extData,
              chartInstance) {
          instance.graphics = graphics;
          instance.chart = chart;
          instance.markerManager = markerManager;
          instance.canvasConfig = canvasConfig;
          instance.reactiveModel = reactiveModel;
          instance.globalReactiveModel = globalReactiveModel;
          instance.spaceManagerInstance = spaceManagerInstance;
          instance.smartLabel = smartLabel;
          instance.extDataUser = extData;
          instance.chartInstance = chartInstance;
        }
      ]);
      instance.endActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-end'];
      instance.startActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-start'];
      instance.startDataset = instance.globalReactiveModel.model['x-axis-absolute-range-start'];
      instance.endDataset = instance.globalReactiveModel.model['x-axis-absolute-range-end'];
      instance.timeRules = instance.chartInstance.apiInstance.getComponentStore();
      instance.timeRules = instance.timeRules.getCanvasByIndex(0).composition.impl;
      instance.timeRules = instance.timeRules.getDataAggregator();
      instance.timeRules = instance.timeRules.getAggregationTimeRules();
      instance.timePeriods = instance.processMultipliers(instance.timeRules);
      instance.extData = {
        'disabled': 'false',
        'default-select': 'ALL',
        'posWrtCanvas': 'top',
        'layout': 'inline',
        'alignment': 'left',
        'orientation': 'horizontal',
        'customMultipliers': {
          'millisecond': [1, 500],
          'second': [1, 5, 15, 30],
          'minute': [1, 5, 15, 30],
          'hour': [1, 3, 6, 12],
          'day': [1, 7, 15],
          'month': [1, 3, 6],
          'year': [1, 3, 5]
        },
        'style': {
          'label-config': {
            // --config--
            text: {
              style: {
                'font-family': '"Lucida Grande", sans-serif',
                'font-size': '13',
                'fill': '#4b4b4b'
              }
            },
            container: {
              height: 22
            }
          },
          'all-config': {
            // --config--
            fill: '#ffffff',
            labelFill: '#4b4b4b',
            symbolStrokeWidth: '2',
            stroke: '#ced5d4',
            strokeWidth: '1',
            hoverFill: '#f7f7f7',
            height: 22,
            radius: 1,
            margin: {
              right: 5
            },
            btnTextStyle: {
              'fontFamily': '"Lucida Grande", sans-serif',
              'fontSize': '13',
              'fill': '#4b4b4b',
              'line-height': '1',
              'letter-spacing': '-0.04em'
            }
          },
          'calculated-config': {
            // --config--
            fill: '#ffffff',
            labelFill: '#4b4b4b',
            symbolStrokeWidth: '2',
            stroke: '#ced5d4',
            strokeWidth: '1',
            hoverFill: '#f7f7f7',
            height: 22,
            radius: 1,
            margin: {
              right: 0
            },
            btnTextStyle: {
              'fontFamily': '"Lucida Grande", sans-serif',
              'fontSize': '13',
              'fill': '#4b4b4b',
              'line-height': '1',
              'letter-spacing': '-0.04em'
            }
          },
          'contextual-config-first': {
            fill: '#ffffff',
            labelFill: '#4b4b4b',
            symbolStrokeWidth: '2',
            stroke: '#ced5d4',
            strokeWidth: '1',
            height: 22,
            hoverFill: '#f7f7f7',
            radius: 1,
            margin: {
              right: 0,
              left: 5
            },
            btnTextStyle: {
              'fontFamily': '"Lucida Grande", sans-serif',
              'fontSize': '13',
              'fill': '#696969',
              'line-height': '1',
              'letter-spacing': '-0.04em'
            }
          },
          'contextual-config': {
            fill: '#ffffff',
            labelFill: '#4b4b4b',
            symbolStrokeWidth: '2',
            stroke: '#ced5d4',
            strokeWidth: '1',
            height: 22,
            hoverFill: '#f7f7f7',
            radius: 1,
            margin: {
              right: 0,
              left: 0
            },
            btnTextStyle: {
              'fontFamily': '"Lucida Grande", sans-serif',
              'fontSize': '13',
              'fill': '#4b4b4b',
              'line-height': '1',
              'letter-spacing': '-0.04em'
            }
          }
        }
      };
      Object.assign(instance.extData, instance.extDataUser);
      instance.customMultipliers = instance.extData.customMultipliers || {
        'millisecond': [1, 500],
        'second': [1, 5, 15, 30],
        'minute': [1, 5, 15, 30],
        'hour': [1, 3, 6, 12],
        'day': [1, 7, 15],
        'month': [1, 3, 6],
        'year': [1, 3]
      };
      instance.clickedId = instance.extData['default-select'] || 'ALL';
      // instance.setActivePeriod(instance.startActiveWindow, instance.endActiveWindow);
      instance.toolbars = [];
      instance.measurement = {};
      instance.flag = true;

      instance.toolbars.push(instance.createToolbar());

      instance.globalReactiveModel.onPropsChange(['x-axis-visible-range-start', 'x-axis-visible-range-end'], instance.propsChangeListener);
      return instance;
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
          return obj[self.extData.layout] || 'inline';
        },
        orientation: [{
          type: function (obj) {
            return obj[self.extData.orientation] || 'horizontal';
          },
          position: [{
            type: function (obj) {
              return obj[self.extData.posWrtCanvas] || 'top';
            },
            alignment: [{
              type: function (obj) {
                return obj[self.extData.alignment] || 'left';
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

    // draws extension in the canvas
    draw (x, y, width, height, group) {
      var self = this,
        measurement = self.measurement,
        toolbars = self.toolbars,
        ln,
        i,
        toolbar,
        selectLine,
        contextualObj = self.btns.contextualObj,
        calculatedObj = self.btns.calculatedObj,
        clickedId = self.clickedId,
        activeBtn;
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

      activeBtn = contextualObj[clickedId] || self.btns[clickedId];
      if (!activeBtn) {
        for (i in calculatedObj) {
          if (calculatedObj[i].shortKey === clickedId) {
            activeBtn = calculatedObj[i];
          }
        }
      }
      this.saveSelectLine = selectLine;
      this.minimumBucket = this.globalReactiveModel.model['minimum-consecutive-datestamp-diff'] * this.globalReactiveModel.model['x-axis-maximum-allowed-ticks'];
      activeBtn && activeBtn.fn && activeBtn.fn();
    };
  }
  return StandardPeriodSelector;
};
