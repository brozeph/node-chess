0.3.3 / 2018-06-05
==================

	* Added `.npmignore` file to help with distribution of `dist` folder

0.3.2 / 2018-06-05
==================

	* Added `prepare` directive to `package.json` file

0.3.1 / 2018-06-05
==================

	* Added `prepublish` directive to `package.json` file

0.3.0 / 2018-04-18
==================

	* adding in ability to determine pieces that put King in check (#22)
	* merging pull request from @Piterden (improved Regex)
	* moving to eslint and Babel compliant build and test tasks

0.2.8 / 2016-11-18
==================

	* adding a new public function to the `game` object (`getHashCode`) that generates and returns the hash that is used for the move history

0.2.7 / 2015-08-23
==================

	* fixing an issue where Pawn promotion was not always properly available as a notated move option
	* fixing an issue where, in some circumstances, non-Pawn pieces improperly allowed for promotion

0.2.6 / 2015-03-26
==================

	* adding Node v0.12 build target for Travis-CI
	* enhanced jshint coverage for entire project
	* fixing issue where Pawn double-square move was incorrectly restricted in some scenarios where capture would have been evaded

0.2.5 / 2014-10-30
==================

	* adding support for `PGN` (Portable Game Notation) when creating algebraic game client

0.2.4 / 2014-09-16
==================

	* adding `promotion` property to `game.moveHistory` which is set to true when Pawn promotion occurs

0.2.3 / 2014-09-16
==================

	* adding `algebraic` property to `game.moveHistory` when supplied

0.2.2 / 2014-09-12
==================

	* introducing fix for phantom black Pawn spawn (issue #8)

0.2.1 / 2014-03-11
==================

	* added gh-pages for documentation

0.2.0 / 2014-03-11
==================

	* added proper pawn promotion notation to the algebraicGameClient
		* example: `gc.getStatus().notatedMoves` will now contain entries for `a1R`, `a1N`, `a1B` and `a1Q` instead of `a1`

0.1.8 / 2014-01-22
==================

	* additional verification of Knight check related to issue #4

0.1.7 / 2014-01-21
==================

	* introducing fix for Knight attack causing check (issue #4)

0.1.6 / 2014-01-21
==================

	* introducing fix for phantom black Pawn spawn (issue #3)

0.1.5 / 2013-06-15
==================

	* adding coveralls.io unit test data
	* converting to jshint from jslint

	0.1.4 / 2012-11-18
==================

	* adding jslint
	* switching to mocha for testing

	0.1.3 / 2012-10-18
==================

	* fixing phantom spawn (issue #1)

	0.1.2 / 2011-06-12
==================

	* initial release
