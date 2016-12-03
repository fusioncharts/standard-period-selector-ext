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

	/* WEBPACK VAR INJECTION */(function(module) {'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var StandardPeriodSelector = __webpack_require__(2);

	window.stPS = new StandardPeriodSelector();

	;(function (env, factory) {
	  if (( false ? 'undefined' : _typeof(module)) === 'object' && module.exports) {
	    module.exports = env.document ? factory(env) : function (win) {
	      if (!win.document) {
	        throw new Error('Window with document not present');
	      }
	      return factory(win, true);
	    };
	  } else {
	    env.StandardPeriodSelector = factory(env, true);
	  }
	})(typeof window !== 'undefined' ? window : undefined, function (_window, windowExists) {
	  var FC = _window.FusionCharts;
	  FC.register('extension', ['private', 'standard-period-selector', function () {
	    FC.registerComponent('extensions', 'standard-period-selector', StandardPeriodSelector({ FusionCharts: FC }));
	  }]);
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(1)(module)))

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Class definition of StandardPeriodSelector
	 */

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	module.exports = function (dep) {
	  var StandardPeriodSelector = function () {
	    function StandardPeriodSelector() {
	      _classCallCheck(this, StandardPeriodSelector);

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

	      this.tdButtons = [{
	        'name': 'YTD',
	        'abbreviation': 'YTD',
	        'parent': 'year',
	        'milliseconds': 31104000000,
	        'description': 'Year to Date'
	      }, {
	        'name': 'QTD',
	        'abbreviation': 'QTD',
	        'parent': 'month',
	        'multiplier': 3,
	        'milliseconds': 7776000000,
	        'description': 'Quarter to Date'
	      }, {
	        'name': 'MTD',
	        'abbreviation': 'MTD',
	        'parent': 'month',
	        'milliseconds': 2592000000,
	        'description': 'Month to Date'
	      }, {
	        'name': 'WTD',
	        'abbreviation': 'WTD',
	        'parent': 'day',
	        'multiplier': 7,
	        'milliseconds': 604800000,
	        'description': 'Week to Date'
	      }, {
	        'name': 'Y',
	        'abbreviation': 'Y',
	        'parent': 'day',
	        'milliseconds': 86400000,
	        'description': 'Yesterday'
	      }, {
	        'name': 'T',
	        'abbreviation': 'T',
	        'parent': 'day',
	        'milliseconds': 86400000,
	        'description': 'Today'
	      }];
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


	    _createClass(StandardPeriodSelector, [{
	      key: 'generateCalculatedButtons',
	      value: function generateCalculatedButtons() {
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
	            if (Math.floor(activeWindow / self.timePeriods[i].interval) < 1) {
	              self.standardCalculatedPeriods.push({
	                'abbreviation': self.timePeriods[i].abbreviation.single,
	                'description': self.timePeriods[i].description,
	                'milliseconds': self.timePeriods[i].interval,
	                'name': self.timePeriods[i].name,
	                'multipliers': [1]
	              });
	            } else {
	              // if the unit is of the order of the target block and calculating the multipliers
	              self.standardCalculatedPeriods.push({
	                'abbreviation': self.timePeriods[i].abbreviation.single,
	                'description': self.timePeriods[i].description,
	                'milliseconds': self.timePeriods[i].interval,
	                'name': self.timePeriods[i].name,
	                'multipliers': []
	              });
	              // calculating and populating the applicable multpliers of each unit
	              for (j = 0; j < self.timePeriods[i].multipliers.length; j++) {
	                if (activeWindow / self.ratio < self.timePeriods[i].multipliers[j] * self.timePeriods[i].interval && self.timePeriods[i].multipliers[j] * self.timePeriods[i].interval > self.minimumBucket) {
	                  self.standardCalculatedPeriods[self.standardCalculatedPeriods.length - 1].multipliers.push(self.timePeriods[i].multipliers[j]);
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

	    }, {
	      key: 'generateContextualButtons',
	      value: function generateContextualButtons() {
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
	            dateStart.setMonth(11 - dateStart.getMonth() % 4);
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
	    }, {
	      key: 'processMultipliers',
	      value: function processMultipliers(timeArr) {
	        var self = this;
	        for (var i = 0; i < timeArr.length; i++) {
	          var len = timeArr[i].possibleFactors.length,
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

	      /**
	       * A function to set the active period's
	       * start and end point
	       * @param  {number} date stamp - A UNIX timestamp to be set as the start point of active period
	       * @param  {number} date stamp - A UNIX timestamp to be set as the end point of active period
	       */

	    }, {
	      key: 'setActivePeriod',
	      value: function setActivePeriod(a, b) {
	        var start, end;
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

	    }, {
	      key: 'configure',
	      value: function configure(config) {
	        this.config = config;
	      }

	      /**
	       * Fusioncharts life cycle method for extension
	       */

	    }, {
	      key: 'init',
	      value: function init(require) {
	        var instance = this,
	            i = 0,
	            j = 0,
	            ii = 0,
	            jj = 0,
	            standardCalculatedPeriods = instance.standardCalculatedPeriods;
	        require(['xAxis', 'yAxis', 'graphics', 'chart', 'dataset', 'PlotManager', 'canvasConfig', 'MarkerManager', 'reactiveModel', 'globalReactiveModel', 'spaceManagerInstance', 'smartLabel', 'extData', 'chartInstance', function (xAxis, yAxis, graphics, chart, dataset, plotManager, canvasConfig, markerManager, reactiveModel, globalReactiveModel, spaceManagerInstance, smartLabel, extData, chartInstance) {
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
	          instance.extDataUser = extData;
	          instance.chartInstance = chartInstance;
	        }]);
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
	        instance.extData = {
	          'default-select': 'ALL',
	          'posWrtCanvas': 'top',
	          'layout': 'inline',
	          'alignment': 'right',
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
	                  'fill': '#696969',
	                  'font-weight': 'bold'
	                }
	              },
	              container: {
	                height: 22
	              }
	            },
	            'all-config': {
	              // --config--
	              fill: '#ffffff',
	              labelFill: '#696969',
	              symbolStrokeWidth: '2',
	              stroke: '#ced5d4',
	              strokeWidth: '1',
	              hoverFill: '#ced5d4',
	              height: 22,
	              radius: 1,
	              margin: {
	                right: 5
	              },
	              btnTextStyle: {
	                'fontFamily': '"Lucida Grande", sans-serif',
	                'fontSize': '13',
	                'fill': '#696969',
	                'line-height': '1',
	                'letter-spacing': '-0.04em'
	              }
	            },
	            'calculated-config': {
	              // --config--
	              fill: '#ffffff',
	              labelFill: '#696969',
	              symbolStrokeWidth: '2',
	              stroke: '#ced5d4',
	              strokeWidth: '1',
	              hoverFill: '#ced5d4',
	              height: 22,
	              radius: 1,
	              margin: {
	                right: 0
	              },
	              btnTextStyle: {
	                'fontFamily': '"Lucida Grande", sans-serif',
	                'fontSize': '13',
	                'fill': '#696969',
	                'line-height': '1',
	                'letter-spacing': '-0.04em'
	              }
	            },
	            'contextual-config-first': {
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
	            },
	            'contextual-config': {
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
	            }
	          }
	        };
	        Object.assign(instance.extData, instance.extDataUser);
	        // instance.minimumBucket = +instance.globalReactiveModel['x-axis-maximum-allowed-ticks'] *
	        //   +instance.globalReactiveModel['minimum-consecutive-datestamp-diff;'];
	        // minimum-consecutive-datestamp-diff
	        // x-axis-maximum-allowed-ticks
	        // console.log(instance.globalReactiveModel);
	        // console.log(instance.globalReactiveModel.model['x-axis-maximum-allowed-ticks']);
	        // console.log(instance.globalReactiveModel.model['minimum-consecutive-datestamp-diff;']);
	        instance.customMultipliers = instance.extData.customMultipliers || {
	          'millisecond': [1, 500],
	          'second': [1, 5, 15, 30],
	          'minute': [1, 5, 15, 30],
	          'hour': [1, 3, 6, 12],
	          'day': [1, 7, 15],
	          'month': [1, 3, 6],
	          'year': [1, 3]
	        };

	        instance.setActivePeriod(instance.startActiveWindow, instance.endActiveWindow);
	        instance.toolbars = [];
	        instance.measurement = {};
	        instance.flag = true;

	        instance.toolbars.push(instance.createToolbar());

	        instance.globalReactiveModel.onPropsChange(['x-axis-visible-range-start', 'x-axis-visible-range-end'], propsHandler);
	        function propsHandler(start, end, flag) {
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
	          for (var _i = 0; _i < instance.standardCalculatedPeriods.length; _i++) {
	            for (var _j = 0; _j < instance.standardCalculatedPeriods[_i].multipliers.length; _j++) {
	              if (end[1] - start[1] >= instance.endDataset - instance.startDataset) {
	                // instance.clickedId = 'ALL';
	              } else if (end[1] - start[1] >= instance.timePeriods[_i].multipliers[_j] * instance.timePeriods[_i].interval) {
	                // instance.clickedId = instance.timePeriods[i].multipliers[j] + instance.timePeriods[i].abbreviation.single;
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
	      }
	    }, {
	      key: 'createToolbar',
	      value: function createToolbar() {
	        var _this = this;

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
	        }, self.extData.style['all-config'] || {
	          // --config--
	          fill: '#ffffff',
	          labelFill: '#696969',
	          symbolStrokeWidth: '2',
	          stroke: '#ced5d4',
	          strokeWidth: '1',
	          hoverFill: '#ced5d4',
	          height: 22,
	          radius: 1,
	          margin: {
	            right: 5
	          },
	          btnTextStyle: {
	            'fontFamily': '"Lucida Grande", sans-serif',
	            'fontSize': '13',
	            'fill': '#696969',
	            'line-height': '1',
	            'letter-spacing': '-0.04em'
	          }
	        }).attachEventHandlers({
	          click: function click() {
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
	        for (var key in this.calculatedButtonObj) {
	          this.calculatedButtonObj[key].hide();
	        }

	        var _loop = function _loop(_i2) {
	          if (_i2 === self.startPointUnit) {
	            startMultiplier = self.startPointMultiplier;
	          } else {
	            startMultiplier = self.standardCalculatedPeriods[_i2].multipliers.length - 1;
	          }

	          var _loop3 = function _loop3(_j2) {
	            var keyAbb = self.standardCalculatedPeriods[_i2].multipliers[_j2] + self.standardCalculatedPeriods[_i2].abbreviation;
	            if (_this.calculatedButtonObj[keyAbb] === undefined) {
	              calculatedButtons = new _this.toolbox.Symbol(keyAbb, true, {
	                paper: _this.graphics.paper,
	                chart: _this.chart,
	                smartLabel: _this.smartLabel,
	                chartContainer: _this.graphics.container
	              }, self.extData.style['calculated-config'] || {
	                // --config--
	                fill: '#ffffff',
	                labelFill: '#696969',
	                symbolStrokeWidth: '2',
	                stroke: '#ced5d4',
	                strokeWidth: '1',
	                hoverFill: '#ced5d4',
	                height: 22,
	                radius: 1,
	                margin: {
	                  right: 0
	                },
	                btnTextStyle: {
	                  'fontFamily': '"Lucida Grande", sans-serif',
	                  'fontSize': '13',
	                  'fill': '#696969',
	                  'line-height': '1',
	                  'letter-spacing': '-0.04em'
	                }
	              }).attachEventHandlers({
	                'click': function click() {
	                  self.periodButtonClicked = true;
	                  self.clickedId = self.standardCalculatedPeriods[_i2].multipliers[_j2] + self.standardCalculatedPeriods[_i2].abbreviation;
	                  deductor = self.standardCalculatedPeriods[_i2].multipliers[_j2] * self.standardCalculatedPeriods[_i2].milliseconds;
	                  self.setActivePeriod(deductor);
	                  // toolbar.dispose();
	                  // self.toolbars.pop();
	                  // self.toolbars.push(self.createToolbar());
	                  // self.getLogicalSpace();
	                  // self.draw();
	                  // self._ref.reAllocate(self.parentGroup);
	                  // this.toolbars[this.toolbars.length - 1] = this.createToolbar();
	                },
	                tooltext: self.standardCalculatedPeriods[_i2].multipliers[_j2] + ' ' + self.standardCalculatedPeriods[_i2].description
	              });
	              _this.calculatedButtonObj[keyAbb] = calculatedButtons;
	            }
	            // unigroup.addSymbol(calculatedButtons[i]);
	            _this.calculatedButtonObj[keyAbb].show();
	            unigroup.addSymbol(_this.calculatedButtonObj[keyAbb]);
	          };

	          for (var _j2 = startMultiplier; _j2 >= 0; _j2--) {
	            _loop3(_j2);
	          }
	        };

	        for (var _i2 = self.startPointUnit; _i2 >= 0; _i2--) {
	          _loop(_i2);
	        }

	        // for (let i = self.startPointUnit; i >= 0; i--) {
	        //   for (let j = startMultiplier; j >= 0; j--) {
	        //     let keyAbb = self.standardCalculatedPeriods[i].multipliers[j] + self.standardCalculatedPeriods[i].abbreviation;
	        //     unigroup.addSymbol(this.calculatedButtonObj[keyAbb]);
	        //   }
	        // }

	        contextualButtons = [];

	        var _loop2 = function _loop2(_i3) {
	          contextualConfig = _i3 === 0 ? self.extData.style['contextual-config-first'] || {
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
	          contextualButtons[_i3] = new _this.toolbox.Symbol(_this.standardContexualPeriods[_i3].abbreviation, true, {
	            paper: _this.graphics.paper,
	            chart: _this.chart,
	            smartLabel: _this.smartLabel,
	            chartContainer: _this.graphics.container
	          }, contextualConfig).attachEventHandlers({
	            'click': function click() {
	              self.periodButtonClicked = true;
	              self.clickedId = self.standardContexualPeriods[_i3].abbreviation;
	              self.setActivePeriod(self.standardContexualPeriods[_i3].dateStart, self.standardContexualPeriods[_i3].dateEnd);
	              // toolbar.dispose();
	              // self.toolbars.pop();
	              // self.toolbars.push(self.createToolbar());
	              // self.getLogicalSpace();
	              // self.draw();
	              // self._ref.reAllocate(self.parentGroup);
	            },
	            tooltext: _this.standardContexualPeriods[_i3].description
	          });
	          unigroup.addSymbol(contextualButtons[_i3]);
	        };

	        for (var _i3 = 0; _i3 < this.standardContexualPeriods.length; _i3++) {
	          _loop2(_i3);
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
	      }
	    }, {
	      key: 'getLogicalSpace',
	      value: function getLogicalSpace() {
	        var availableWidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._pWidth;
	        var availableHeight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._pHeight;

	        // availableWidth /= 2;
	        var logicalSpace,
	            width = 420,
	            // width hardcoded; TODO: make it dynamic
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
	      }
	    }, {
	      key: 'getDefaultGroup',
	      value: function getDefaultGroup() {
	        return this.parentGroup;
	      }
	    }, {
	      key: 'placeInCanvas',
	      value: function placeInCanvas() {
	        var _self = this;
	        _self.padding = 5;
	        _self.spaceManagerInstance.add([{
	          name: function name() {
	            return 'standard-period-selector-ext';
	          },
	          ref: function ref(obj) {
	            return obj['0'];
	          },
	          self: function self() {
	            return _self;
	          },
	          priority: function priority() {
	            return 2;
	          },
	          layout: function layout(obj) {
	            return obj[_self.extData.layout] || 'inline';
	          },
	          orientation: [{
	            type: function type(obj) {
	              return obj[_self.extData.orientation] || 'horizontal';
	            },
	            position: [{
	              type: function type(obj) {
	                return obj[_self.extData.posWrtCanvas] || 'top';
	              },
	              alignment: [{
	                type: function type(obj) {
	                  return obj[_self.extData.alignment] || 'left';
	                },
	                dimensions: [function () {
	                  var parent = this.getParentComponentGroup();
	                  _self._ref = this;
	                  return _self.getLogicalSpace(_self._pWidth = parent.getWidth(), _self._pHeight = parent.getHeight());
	                }]
	              }]
	            }]
	          }]
	        }]);
	      }
	    }, {
	      key: 'setDrawingConfiguration',
	      value: function setDrawingConfiguration(x, y, width, height, group) {
	        var mes = this.measurement;
	        mes.x = x;
	        mes.y = y;
	        mes.width = width;
	        mes.height = height;

	        this.parentGroup = group;

	        return this;
	      }
	    }, {
	      key: 'draw',
	      value: function draw(x, y, width, height, group) {
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
	        for (var _i4 = 0, ii = symbolList.length; _i4 < ii; _i4++) {
	          if (symbolList[_i4].symbol === this.clickedId) {
	            boundElement = symbolList[_i4].getBoundElement();
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
	      }
	    }]);

	    return StandardPeriodSelector;
	  }();

	  return StandardPeriodSelector;
	};

/***/ }
/******/ ]);