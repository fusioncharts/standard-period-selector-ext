import {describe, it} from 'mocha';
import {expect} from 'chai';

var StandardPeriodSelector = require('./../src/standard-period-selector');

describe('StandardPeriodSelector', function () {
  var stPS = new StandardPeriodSelector();
  describe('#calculateApplicableStandardPeriods', function () {
    it('should be a array', function () {
      expect(stPS.calculateApplicableStandardPeriods()).to.be.a('array');
    });
  });
});
