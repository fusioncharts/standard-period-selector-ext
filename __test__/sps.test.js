'use strict';

const FusionCharts = require('fusioncharts'),
  StandardPeriodSelectorExt = require('../src/standard-period-selector.js');

require('fusioncharts/fusioncharts.timeseries')(FusionCharts);

// FusionCharts.register('extension', ['private', 'test-standard-period-selector', StandardPeriodSelector({FusionCharts: FusionCharts})]);

describe('StandardPeriodSelector', () => {
  var StandardPeriodSelector = StandardPeriodSelectorExt({FusionCharts: FusionCharts}),
    standardPeriodSelector = new StandardPeriodSelector();
  standardPeriodSelector.constructor();
  standardPeriodSelector.globalReactiveModel = {};
  standardPeriodSelector.globalReactiveModel.model = {};
  standardPeriodSelector.globalReactiveModel.model['x-axis-absolute-range-end'] = 9999999999;

  it('Should be able to create a new instance', () => {
    expect(standardPeriodSelector).toBeInstanceOf(StandardPeriodSelector);
  });

  it('#processMultipliers()', () => {
    var timeArr = [{
        possibleFactors: [1, 2, 4, 5]
      }, {
        possibleFactors: [1, 2, 3, 7, 9]
      }, {
        possibleFactors: [1]
      }],
      len = standardPeriodSelector.processMultipliers(timeArr).length - 1;
    expect(standardPeriodSelector.processMultipliers([])).toBeInstanceOf(Array);
    expect(standardPeriodSelector.processMultipliers(timeArr)[0]).toBeInstanceOf(Object);
    expect(standardPeriodSelector.processMultipliers(timeArr)[0].multipliers).toBeInstanceOf(Array);
    expect(standardPeriodSelector.processMultipliers(timeArr)[0].multipliers).toContain(1);
    expect(standardPeriodSelector.processMultipliers(timeArr)[len]).toBeInstanceOf(Object);
    expect(standardPeriodSelector.processMultipliers(timeArr)[len].multipliers).toBeInstanceOf(Array);
    expect(standardPeriodSelector.processMultipliers(timeArr)[len].multipliers).toContain(1);
  });

  it('standardPeriodSelector.toolbox exists', () => {
    expect(standardPeriodSelector.toolbox)
    .toBeDefined();
  });

  it('standardPeriodSelector.HorizontalToolbar exists', () => {
    expect(standardPeriodSelector.HorizontalToolbar)
    .toBeDefined();
  });

  it('standardPeriodSelector.ComponentGroup exists', () => {
    expect(standardPeriodSelector.ComponentGroup)
    .toBeDefined();
  });

  it('#generateCtxBtnList() generating contextual button list, which has "dateEnd" and "dateStart"', () => {
    standardPeriodSelector.generateCtxBtnList();
    var lastIndex = standardPeriodSelector.standardContexualPeriods.length - 1;
    expect(standardPeriodSelector.standardContexualPeriods[0]['dateEnd']).toBeDefined();
    expect(standardPeriodSelector.standardContexualPeriods[0]['dateStart']).toBeDefined();
    expect(standardPeriodSelector.standardContexualPeriods[lastIndex]['dateEnd']).toBeDefined();
    expect(standardPeriodSelector.standardContexualPeriods[lastIndex]['dateStart']).toBeDefined();
  });

  it('#onActiveRangeChange() executes correctly with "ALL"', () => {
    standardPeriodSelector.categoryClicked = 'ALL';
    standardPeriodSelector.clickedId = 'ALL';
    standardPeriodSelector.startDataset = 0;
    standardPeriodSelector.endDataset = 100;
    standardPeriodSelector.startActiveWindow = 1;
    standardPeriodSelector.endActiveWindow = 99;
    standardPeriodSelector.showApplicableCalculatedButtons = function () {
      console.log('showApplicableCalculatedButtons');
    };
    standardPeriodSelector.heighlightActiveRange = function () {
      console.log('hightlightActiveRange');
    };
    standardPeriodSelector.onActiveRangeChange();
    expect(standardPeriodSelector.clickedId).toBeUndefined();

    standardPeriodSelector.startActiveWindow = 0;
    standardPeriodSelector.endActiveWindow = 100;
    standardPeriodSelector.onActiveRangeChange();
    expect(standardPeriodSelector.clickedId).toBeDefined();
  });

  it('#hideAllCalcBtns()', () => {
    var hide1, hide2;
    standardPeriodSelector.btns.calculatedObj = [{
      btn: {
        hide: function () {
          console.log(hide1 = 'hide');
        }
      }
    }, {
      btn: {
        hide: function () {
          console.log(hide2 = 'hide');
        }
      }
    }];
    standardPeriodSelector.hideAllCalcBtns();
    expect(hide1).toBeDefined();
    expect(hide2).toBeDefined();
  });
});
