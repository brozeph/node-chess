global.requireWithCoverage = function (libName) {
	if (process.env.NODE_CHESS_COVERAGE) {
		return require('../lib-cov/' + libName + '.js');
	}

	if (libName === 'index') {
		return require('../lib');
	} else {
		return require('../lib/' + libName + '.js');
	}
};

global.chai = require('chai');
global.assert = chai.assert;
global.expect = chai.expect;
global.should = chai.should();