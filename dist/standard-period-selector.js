/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	const StandardPeriodSelector = __webpack_require__(1);

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


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	/**
	 * Class definition of StandardPeriodSelector
	 */

	module.exports = function (dep) {
	  class StandardPeriodSelector {
	    /**
	     *In time series charts, it is required to have some
	     *optional UI buttons / options to select the visible
	     *canvas range to a standard time period like
	     *1 month, 1 year, 5 years, 3 months,  YTD etc.
	     *Also, from the same UI it should have an option
	     *to select the full date-time range.
	     *
	     *The configuration object for the extension is as follows:
	     *The extension provides an optional tool (UI buttons)
	     *for the user to select various popular standard time periods
	     *like 1 week, 1 month, 3 month, 1 year, 5 year, YTD, QTD,
	     *MTD, DTT, All etc.
	     *
	     *@example
	     *datasource: {
	     *  extension: {
	     *     'standard-period-selector': {
	     *       'disabled': 'false',
	     *       'default-select': 'ALL',
	     *       'posWrtCanvas': 'top',
	     *       'anchor-align': 'left',
	     *       'layout': 'inline',
	     *       'alignment': 'left',
	     *       'orientation': 'horizontal',
	     *     }
	     *   }
	     *}
	     *
	     *
	     */

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
	      self.noCalcButtons = 0;
	      self.minimumBucket = 1;
	      self.buttonGroup = {};
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
	          self._babTimer = 200;
	          self.onActiveRangeChange();
	        }
	      };
	    }

	    // --test case made--
	    hideAllCalcBtns () {
	      var self = this,
	        calculatedObj = self.btns.calculatedObj,
	        i;
	      for (i in calculatedObj) {
	        calculatedObj[i].btn.hide();
	      }
	    }

	    showApplicableCalculatedButtons () {
	      var self = this,
	        targetBlock,
	        i = 0,
	        ii = 0,
	        j = 0,
	        jj = 0,
	        activeWindow = self.endActiveWindow - self.startActiveWindow,
	        key,
	        anchorPositions = self.anchorPositions,
	        calculatedObj = self.btns.calculatedObj,
	        timePeriods = self.timePeriods,
	        interval = 0,
	        name,
	        abbreviation,
	        standardCalculatedPeriods = [],
	        minimumBucket = self.minimumBucket,
	        maximumBucket = self.maximumBucket;

	      if (anchorPositions === 'right') {
	        targetBlock = self.endActiveWindow - self.startDataset;
	      } else if (anchorPositions === 'left') {
	        targetBlock = self.endDataset - self.startActiveWindow;
	      }

	      self.hideAllCalcBtns();
	      for (i = 0, ii = timePeriods.length; i < ii; i++) {
	        interval = timePeriods[i].interval;
	        name = timePeriods[i].name;
	        abbreviation = timePeriods[i].abbreviation.single;
	        // checking whether the unit is applicable for the current target block
	        if (targetBlock / interval >= 1) {
	          // checking whether the unit is of the higher order and only multiplier 1 is applicable
	          if (Math.floor((activeWindow) / interval) < 1) {
	            standardCalculatedPeriods.push({
	              'name': name,
	              'abbreviation': abbreviation,
	              'multipliers': [1]
	            });
	          } else { // if the unit is of the order of the target block and calculating the multipliers
	            standardCalculatedPeriods.push({
	              'name': name,
	              'abbreviation': abbreviation,
	              'multipliers': []
	            });
	            // calculating and populating the applicable multpliers of each unit
	            for (j = 0, jj = timePeriods[i].multipliers.length; j < jj; j++) {
	              if ((activeWindow / self.ratio < timePeriods[i].multipliers[j] * interval) &&
	                (timePeriods[i].multipliers[j] * interval) > minimumBucket &&
	                (timePeriods[i].multipliers[j] * interval) < maximumBucket) {
	                standardCalculatedPeriods[standardCalculatedPeriods.length - 1].multipliers.push(
	                  timePeriods[i].multipliers[j]);
	              }
	            }
	          }
	        }
	      }

	      for (i = 0, ii = standardCalculatedPeriods.length; i < ii; i++) {
	        for (j = 0, jj = standardCalculatedPeriods[i].multipliers.length; j < jj; j++) {
	          key = standardCalculatedPeriods[i].multipliers[j] +
	            standardCalculatedPeriods[i].name;
	          calculatedObj[key].btn && calculatedObj[key].btn.show();
	        }
	      }
	      self.standardCalculatedPeriods = standardCalculatedPeriods;
	      self.toolbar && self.toolbar.redraw();
	    }

	    // ******** React on active property change ****

	    highlightActiveRange () {
	      // first check w.r.t contextual btns then others
	      var self = this,
	        selectLine = self.saveSelectLine,
	        boundElement,
	        clickedId = self.clickedId,
	        bBox,
	        x1,
	        x2,
	        y2,
	        activeBtn,
	        contextualObj = self.btns.contextualObj,
	        calculatedObj = self.btns.calculatedObj;

	      // if the heighliter is not createcd create it
	      if (!selectLine) {
	        selectLine = self.saveSelectLine || (self.saveSelectLine = self.graphics.paper.path({
	          'stroke': '#c95a5a',
	          'stroke-width': '2px'
	        }).toFront());
	      }

	      activeBtn = contextualObj[clickedId] || calculatedObj[clickedId] || self.btns[clickedId];

	      if (activeBtn) {
	        boundElement = activeBtn.btn.svgElems.node;
	        bBox = boundElement.getBBox();
	        x1 = bBox.x;
	        x2 = x1 + bBox.width;
	        y2 = bBox.y + bBox.height;
	        selectLine.show().attr({
	          path: ['M', x1 + 1, y2 - 1.2, 'L', x2, y2 - 1.2]
	        });
	      } else {
	        selectLine.hide();
	      }
	    }

	    // --test case made--
	    onActiveRangeChange () {
	      var self = this,
	        x,
	        found,
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
	      } else { // nothing is selected
	        if (startDataset === startActiveWindow && endDataset === endActiveWindow) {
	          self.clickedId = 'ALL';
	          self.categoryClicked = 'ALL';
	        } else {
	          for (x in contextualObj) {
	            lastClickedBtnObj = contextualObj[x];
	            if (startActiveWindow === lastClickedBtnObj.contextStart &&
	              endActiveWindow === lastClickedBtnObj.contextEnd) {
	              self.clickedId = x;
	              self.categoryClicked = 'contextual';
	              found = true;
	            }
	          }
	          if (!found) {
	            for (x in calculatedObj) {
	              lastClickedBtnObj = calculatedObj[x];
	              if ((endActiveWindow - startActiveWindow) === lastClickedBtnObj.interval) {
	                self.clickedId = x;
	                self.categoryClicked = 'calculated';
	              }
	            }
	          }
	        }
	      }
	      if (self.toolbarDrawn) {
	        self.showApplicableCalculatedButtons();
	        self.highlightActiveRange();
	      }
	    }

	    // *********** Drzaw the btns initialy ***** //

	    // --test case made--
	    // adds multipliers to the timerules object
	    processMultipliers (timeArr, customMultipliers) {
	      for (let i = 0, ii = timeArr.length; i < ii; i++) {
	        let len = timeArr[i].possibleFactors.length,
	          timeName = timeArr[i] && timeArr[i].name,
	          timeObj = timeArr && timeArr[i];
	        timeObj.multipliers = [];
	        if (customMultipliers === undefined) {
	          customMultipliers = {};
	        }
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
	        btnObj,
	        anchorPositions = self.anchorPositions,
	        minimumBucket = this.minimumBucket,
	        model = self.globalReactiveModel.model;
	      for (let i = self.timePeriods.length - 1; i >= 0; i--) {
	        for (let j = self.timePeriods[i].multipliers.length - 1; j >= 0; j--) {
	          let keyAbb = self.timePeriods[i].multipliers[j] + self.timePeriods[i].abbreviation.single,
	            keyName = self.timePeriods[i].multipliers[j] + self.timePeriods[i].name;
	          let interval = (self.timePeriods[i].multipliers[j] * self.timePeriods[i].interval);
	          if (interval > minimumBucket) {
	            btnObj = calculatedObj[keyName] = {
	              interval: interval,
	              fn: function () {
	                self.clickedId = keyName;
	                self.categoryClicked = 'calculated';
	                self.highlightActiveRange();
	                if (anchorPositions === 'right') {
	                  if (model['x-axis-absolute-range-start'] > self.endActiveWindow - interval) {
	                    // model['x-axis-visible-range-start'] = model['x-axis-absolute-range-start'];
	                    // model['x-axis-visible-range-end'] = model['x-axis-visible-range-start'] + interval;
	                    // interval = model['x-axis-visible-range-start'] + interval;
	                    self.globalReactiveModel
	                      .lock()
	                      .prop('x-axis-visible-range-end', model['x-axis-visible-range-start'] + interval)
	                      .prop('x-axis-visible-range-start', self.startDataset)
	                      .unlock();
	                  } else {
	                    model['x-axis-visible-range-start'] = self.endActiveWindow - interval;
	                  }
	                } else {
	                  if (model['x-axis-absolute-range-end'] < self.startActiveWindow + interval) {
	                    // model['x-axis-visible-range-end'] = model['x-axis-absolute-range-end'];
	                    // model['x-axis-visible-range-start'] = model['x-axis-absolute-range-end'] - interval;
	                    // interval = model['x-axis-absolute-range-end'] - interval;
	                    self.globalReactiveModel
	                      .lock()
	                      .prop('x-axis-visible-range-end', self.endDataset)
	                      .prop('x-axis-visible-range-start', model['x-axis-absolute-range-end'] - interval)
	                      .unlock();
	                  } else {
	                    model['x-axis-visible-range-end'] = self.startActiveWindow + interval;
	                  }
	                }
	              },
	              shortKey: keyAbb
	            };

	            btnCalc = new self.toolbox.Symbol(keyAbb, true, {
	              paper: self.graphics.paper,
	              chart: self.chart,
	              smartLabel: self.smartLabel,
	              chartContainer: self.graphics.container
	            }, self.extData.style['calculated-config']).attachEventHandlers({
	              'click': btnObj.fn,
	              tooltext: self.timePeriods[i].multipliers[j] + ' ' + self.timePeriods[i].description
	            });
	            btnObj.btn = btnCalc;
	            buttonGroup.addSymbol(btnCalc);
	          }
	        }
	      }
	    }

	    // --test case made--
	    generateCtxBtnList () {
	      // generating an array with applicable TD buttons
	      var self = this,
	        buttons = self.standardContexualPeriods,
	        i = 0,
	        ii = 0,
	        endStamp = self.globalReactiveModel.model['x-axis-absolute-range-end'],
	        dateStart = endStamp - 2,
	        dateEnd = endStamp,
	        relativeTDButton = {},
	        tdButtons = self.tdButtons,
	        minimumBucket = self.minimumBucket || 1,
	        startActiveWindow = self.startActiveWindow,
	        endActiveWindow = self.endActiveWindow;

	      for (ii = tdButtons.length; i < ii; i++) {
	        dateStart = new Date(endStamp);
	        if (tdButtons[i].name === 'YTD') {
	          dateStart.setMonth(0);
	          dateStart.setDate(1);
	          dateStart.setHours(0);
	          dateStart.setMinutes(0);
	          dateStart.setSeconds(0);
	        } else if (tdButtons[i].name === 'MTD') {
	          dateStart.setDate(1);
	          dateStart.setHours(0);
	          dateStart.setMinutes(0);
	          dateStart.setSeconds(0);
	        } else if (tdButtons[i].name === 'QTD') {
	          dateStart.setMonth(11 - (dateStart.getMonth() % 4));
	          dateStart.setDate(0);
	          dateStart.setHours(0);
	          dateStart.setMinutes(0);
	          dateStart.setSeconds(0);
	        } else if (tdButtons[i].name === 'WTD') {
	          dateStart.setDate(dateStart.getDate() - dateStart.getDay());
	          dateStart.setHours(0);
	          dateStart.setMinutes(0);
	          dateStart.setSeconds(0);
	        } else if (tdButtons[i].name === 'Y') {
	          dateStart.setHours(0);
	          dateStart.setMinutes(0);
	          dateStart.setSeconds(0);
	          dateStart -= 86400000;
	        } else if (tdButtons[i].name === 'T') {
	          dateStart.setHours(0);
	          dateStart.setMinutes(0);
	          dateStart.setSeconds(0);
	          if (endStamp === +dateStart) {
	            dateStart = +dateStart - 86400000;
	          }
	        }

	        if (dateEnd < dateStart && (dateEnd - dateStart) < minimumBucket) {
	          continue;
	        } else {
	          tdButtons[i].dateStart = dateStart.valueOf();
	          tdButtons[i].dateEnd = dateEnd.valueOf();
	          buttons.push(tdButtons[i]);
	        }
	      }
	      relativeTDButton.milliseconds = Infinity;
	      for (i = 0, ii = tdButtons.length; i < ii; i++) {
	        if (Math.abs(tdButtons[i].milliseconds - (endActiveWindow - startActiveWindow)) < relativeTDButton.milliseconds) {
	          relativeTDButton.milliseconds = tdButtons[i].milliseconds;
	          relativeTDButton.name = tdButtons[i].abbreviation;
	        }
	      }
	    }

	    createContextualButtons (buttonGroup) {
	      var self = this,
	        contextualConfig,
	        contextualObj = self.btns.contextualObj,
	        btnObj,
	        keyName,
	        firstDraw = true;
	      self.generateCtxBtnList();
	      for (let i = 0, ii = this.standardContexualPeriods.length; i < ii; i++) {
	        if (!((self.standardContexualPeriods[i].dateEnd - self.standardContexualPeriods[i].dateStart >= self.minimumBucket) &&
	          (self.standardContexualPeriods[i].dateStart > self.startDataset))) {
	          continue;
	        }
	        contextualConfig = firstDraw ? self.extData.style['contextual-config-first'] : self.extData.style['contextual-config'];
	        firstDraw = false;
	        keyName = self.standardContexualPeriods[i].abbreviation;
	        btnObj = contextualObj[keyName] = {
	          contextStart: self.standardContexualPeriods[i].dateStart,
	          contextEnd: self.standardContexualPeriods[i].dateEnd,
	          fn: function () {
	            self.categoryClicked = 'contextual';
	            self.clickedId = self.standardContexualPeriods[i].abbreviation;
	            self.highlightActiveRange();
	            self.globalReactiveModel
	              .lock()
	              .prop('x-axis-visible-range-end', self.standardContexualPeriods[i].dateEnd)
	              .prop('x-axis-visible-range-start', self.standardContexualPeriods[i].dateStart)
	              .unlock();
	          }
	        };

	        btnObj.btn = new self.toolbox.Symbol(self.standardContexualPeriods[i].abbreviation, true, {
	          paper: self.graphics.paper,
	          chart: self.chart,
	          smartLabel: self.smartLabel,
	          chartContainer: self.graphics.container
	        }, contextualConfig)
	          .attachEventHandlers({
	            'click': btnObj.fn,
	            tooltext: self.standardContexualPeriods[i].description
	          });
	        buttonGroup.addSymbol(btnObj.btn);
	      }
	    }

	    // creates toolbar
	    createToolbar () {
	      var self = this,
	        buttonGroup,
	        toolbar,
	        allButton,
	        fromDateLabel,
	        group,
	        dummyButtonGroup;

	      // initiating the toolbar
	      toolbar = new self.HorizontalToolbar({
	        paper: self.graphics.paper,
	        chart: self.chart,
	        smartLabel: self.smartLabel,
	        chartContainer: self.graphics.container
	      });
	      toolbar.setConfig({
	        fill: '#fff',
	        borderThickness: 0
	      });

	      // making group for the extension label
	      group = new self.toolbox.ComponentGroup({
	        paper: self.graphics.paper,
	        chart: self.chart,
	        smartLabel: self.smartLabel,
	        chartContainer: self.graphics.container
	      });

	      // making buttonGroup for the buttons
	      buttonGroup = new self.toolbox.ComponentGroup({
	        paper: self.graphics.paper,
	        chart: self.chart,
	        smartLabel: self.smartLabel,
	        chartContainer: self.graphics.container
	      });

	      // making buttonGroup for the buttons
	      dummyButtonGroup = new self.toolbox.ComponentGroup({
	        paper: self.graphics.paper,
	        chart: self.chart,
	        smartLabel: self.smartLabel,
	        chartContainer: self.graphics.container
	      });

	      dummyButtonGroup.setConfig({
	        fill: '#fff',
	        borderThickness: 0
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
	      fromDateLabel = new self.toolbox.Label('Zoom:', {
	        smartLabel: self.smartLabel,
	        paper: self.graphics.paper
	      }, self.extData.style['label-config']);
	      group.addSymbol(fromDateLabel);

	      // 'ALL' button created
	      allButton = self.allButtonShow && {fn: function () {
	        self.clickedId = 'ALL';
	        self.categoryClicked = 'ALL';
	        self.highlightActiveRange();
	        self.globalReactiveModel
	          .lock()
	          .prop('x-axis-visible-range-end', self.endDataset)
	          .prop('x-axis-visible-range-start', self.startDataset)
	          .unlock();
	      }};
	      if (allButton) {
	        allButton.btn = new self.toolbox.Symbol('ALL', true, {
	          paper: self.graphics.paper,
	          chart: self.chart,
	          smartLabel: self.smartLabel,
	          chartContainer: self.graphics.container
	        }, self.extData.style['all-config']).attachEventHandlers({
	          click: allButton.fn,
	          tooltext: 'ALL'
	        });

	        self.btns['ALL'] = allButton;

	        buttonGroup.addSymbol(allButton.btn);
	      };

	      // adding dummyButton
	      for (let i = 0; i < 8; i++) {
	        dummyButtonGroup.addSymbol(new self.toolbox.Symbol('ALL', true, {
	          paper: self.graphics.paper,
	          chart: self.chart,
	          smartLabel: self.smartLabel,
	          chartContainer: self.graphics.container
	        }, self.extData.style['all-config']).attachEventHandlers({
	          click: allButton.fn,
	          tooltext: '___'
	        }));
	      }
	      self.dummyButtonGroup = dummyButtonGroup;

	      // adding group and button group to toolbar
	      toolbar.addComponent(group);
	      toolbar.addComponent(buttonGroup);
	      toolbar.addComponent(dummyButtonGroup);
	      self.toolbar = toolbar;
	      self.buttonGroup = buttonGroup;
	      return toolbar;
	    };

	    // *********** Extension interface methods *********//

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
	      instance.extData = {
	        'disabled': false,
	        'default-select': 'ALL',
	        'all-button': true,
	        'contextual-button': true,
	        'calculated-button': true,
	        'posWrtCanvas': 'top',
	        'anchor-align': 'right',
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
	            },
	            shadow: {
	              'fill': '#000',
	              'opacity': '0.35'
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
	            },
	            shadow: {
	              'fill': '#000',
	              'opacity': '0.35'
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
	            },
	            shadow: {
	              'fill': '#000',
	              'opacity': '0.35'
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
	            },
	            shadow: {
	              'fill': '#000',
	              'opacity': '0.35'
	            }
	          }
	        }
	      };
	      Object.assign(instance.extData, instance.extDataUser);
	      instance.endActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-end'];
	      instance.startActiveWindow = instance.globalReactiveModel.model['x-axis-visible-range-start'];
	      instance.startDataset = instance.globalReactiveModel.model['x-axis-absolute-range-start'];
	      instance.endDataset = instance.globalReactiveModel.model['x-axis-absolute-range-end'];

	      instance.maximumBucket = instance.endDataset - instance.startDataset;

	      instance.timeRules = instance.chartInstance.apiInstance.getComponentStore();
	      instance.timeRules = instance.timeRules.getCanvasByIndex(0).composition.impl;
	      instance.timeRules = instance.timeRules.getDataAggregator();
	      instance.timeRules = instance.timeRules.getAggregationTimeRules();

	      instance.timePeriods = instance.processMultipliers(instance.timeRules, instance.extData.customMultipliers);

	      instance.allButtonShow = instance.extData['all-button'];
	      instance.calculatedButtonShow = instance.extData['calculated-button'];
	      instance.contextualButtonShow = instance.extData['contextual-button'];
	      instance.anchorPositions = instance.extData['anchor-align'];
	      instance.customMultipliers = instance.extData.customMultipliers;
	      instance.keySelect = instance.extData['default-select'];

	      instance.measurement = {};
	      instance.flag = true;
	      instance.toolbars = [];
	      instance.toolbars.push(instance.createToolbar());

	      instance.globalReactiveModel.onPropsChange(['x-axis-visible-range-start', 'x-axis-visible-range-end'],
	        instance.propsChangeListener);
	      instance.globalReactiveModel.onPropChange('x-axis-absolute-range-end', function (absEnd) {
	        if (instance.categoryClicked === 'contextual') {
	          instance.globalReactiveModel.model['x-axis-visible-range-end'] =
	            instance.globalReactiveModel.model['x-axis-absolute-range-end'];
	        }
	      });
	      return instance;
	    };

	    getLogicalSpace (availableWidth = this._pWidth, availableHeight = this._pHeight) {
	      var logicalSpace,
	        width = 0,
	        height = 0,
	        i,
	        ii,
	        self = this;

	      for (i = 0, ii = self.toolbars.length; i < ii; i++) {
	        logicalSpace = self.toolbars[i].getLogicalSpace(availableWidth, availableHeight);
	        width = Math.max(logicalSpace.width, width);
	        height += logicalSpace.height;
	        self.toolbars[i].width = logicalSpace.width;
	        self.toolbars[i].height = logicalSpace.height;
	      }
	      height += self.padding;
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
	        contextualObj = self.btns.contextualObj,
	        calculatedObj = self.btns.calculatedObj,
	        clickedId = self.clickedId,
	        activeBtn,
	        model = self.globalReactiveModel.model,
	        minimumBucket = self.minimumBucket,
	        buttonGroup = self.buttonGroup,
	        notFound,
	        key;

	      minimumBucket = model['minimum-consecutive-datestamp-diff'] * model['x-axis-maximum-allowed-ticks'];
	      self.minimumBucket = minimumBucket;

	      self.dummyButtonGroup.dispose();
	      // create all calculated button
	      self.calculatedButtonShow && self.createCalculatedButtons(buttonGroup);

	      // create all contextual button
	      self.contextualButtonShow && self.createContextualButtons(buttonGroup);

	      if (self.keySelect) {
	        if (self.keySelect === 'ALL') {
	          self.clickedId = 'ALL';
	        } else if (contextualObj[self.keySelect]) {
	          self.clickedId = self.keySelect;
	        } else {
	          notFound = true;
	          for (key in calculatedObj) {
	            if (notFound && calculatedObj[key].shortKey === self.keySelect) {
	              self.clickedId = key;
	              notFound = false;
	            }
	          }
	        }
	      }
	      clickedId = self.clickedId;

	      x = x === undefined ? measurement.x : x;
	      y = y === undefined ? measurement.y : y;
	      width = width === undefined ? measurement.width : width;
	      height = height === undefined ? measurement.height : height;
	      group = group === undefined ? this.parentGroup : group;
	      if (width && height) {
	        for (i = 0, ln = toolbars.length; i < ln; i++) {
	          toolbar = toolbars[i];
	          toolbar.draw(x, y, group);
	          self.toolbarDrawn = true;
	        }
	        if (clickedId) {
	          activeBtn = calculatedObj[clickedId] || contextualObj[clickedId] || self.btns[clickedId];
	          if (activeBtn) {
	            activeBtn.fn && activeBtn.fn();
	          } else {
	            self.onActiveRangeChange();
	          }
	        } else {
	          self.onActiveRangeChange();
	        }
	      }
	    };
	  }
	  return StandardPeriodSelector;
	};


/***/ }
/******/ ]);