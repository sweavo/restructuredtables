import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import * as cals from '../../cals';

suite('CALS lib demonstrations', () => {
	//vscode.window.showInformationMessage('Start all tests.');

	test('Construct Simple Table from the bottom up', () => {
		const entry: cals.Entry = { 
			'align': 'left', 
			'char': '', 
			'charoff': '',
			'colname':'1',
			'colsep': false,
			'morerows': '',
			'nameend':'',
			'namest':'',
			'paracon':'Hello, Mum!', // The actual cell contents
			'rowsep': false,
			'valign':'top'
		};
		const row: cals.Row = {
			'entry': [ entry],
			'rowsep': false,
			'valign': 'top'
		};
		const tbody: cals.TBody = {
			'row': [ row ],
			'valign': 'top'
		};
		const col : cals.ColSpec = {
			'align': 'left',
			'char':'',
			'charoff': '',
			'colname':'1',
			'colnum':'1',
			'colsep': false,
			'colwidth':'10',
			'rowsep': false
		};
		const tgroup: cals.TGroup = {
			'align': 'left',
			'cols': 1,
			'colsep': false,
			'colspecs': [ col ],
			'rowsep': false,
			'tbody': tbody,
			'thead': []
		};
		const table = new cals.Table( false,[ tgroup ]);

		assert.strictEqual('Hello, Mum!', table.tgroup[0].tbody.row[0].entry[0].paracon );		
		assert.strictEqual(true, table.isValid());
	});
	test ('A table needs one tgroups',() => {
		const table = new cals.Table(false, []);

		assert.strictEqual(false, table.isValid());
	});

	test('Parse a simple RST gridtable and regenerate it.', () => {
		const input = `
			+---+---+-----+
			| A | B | Out |
			+---+---+-----+
			| 0 | 0 |  0  |
			| 0 | 0 |  1  |
			| 0 | 1 |  0  |
			| 0 | 1 |  1  |
			| 1 | 0 |  0  |
			| 1 | 0 |  1  |
			| 1 | 1 |  0  |
			| 1 | 1 |  1  |
			+---+---+-----+`;

		const table = cals.fromGrid( input );

		const output = cals.toGrid( table );

		assert.strictEqual( input, output );

	});
});
