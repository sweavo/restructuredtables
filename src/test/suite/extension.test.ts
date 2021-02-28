import * as assert from 'assert';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import * as cals from '../../cals';

suite('CALS lib demonstrations', () => {
	//vscode.window.showInformationMessage('Start all tests.');

	test('Construct Simple Table from the bottom up', () => {
		const entry=new cals.Entry('Hello, Mum!');

		const row = new cals.Row([entry]);
		const col = new cals.ColSpec(10);
		const tgroup = new cals.TGroup( [col], false, [row]);
		const table = new cals.Table( [ tgroup ]);

		assert.strictEqual(table.tgroup[0].tbody.row[0].entry[0].paracon, 'Hello, Mum!');
		assert.strictEqual(table.isValid(), true);
	});
	test ('A table needs one tgroups',() => {
		
		const table = new cals.Table([]);

		assert.strictEqual(table.isValid(), false);

	});
	test ('toGrid: write a 1x1 grid', () => {	
		
		const output = cals.toGrid( cals.tableHelper([2],[['Yo']]) );
		
		assert.strictEqual( output, '+----+\n| Yo |\n+----+');

	});

	test ('toGrid: write one two-column row', () => {	
		
		const output = cals.toGrid( cals.tableHelper([2,5],[['Yo', 'There']]) );
		
		assert.strictEqual( output, '+----+-------+\n| Yo | There |\n+----+-------+');

	});

	test ('toGrid: write two two-column rows', () => {	
		
		const output = cals.toGrid( cals.tableHelper([2,5],[['Yo', 'There'],
															['Hi', 'Matey']]) );
		
		assert.strictEqual( output, '+----+-------+\n| Yo | There |\n+----+-------+\n| Hi | Matey |\n+----+-------+');

	});

	test('Parse a simple RST gridtable and regenerate it.', () => {
		const input = `+---+---+-----+
| A | B | Out |
+---+---+-----+
| 0 | 0 | 0   |
+---+---+-----+
| 0 | 1 | 0   |
+---+---+-----+
| 1 | 0 | 0   |
+---+---+-----+
| 1 | 1 | 1   |
+---+---+-----+`;

		const table = cals.fromGrid( input );

		const output = cals.toGrid( table );

		assert.strictEqual(output, input);

	});

	test('Parse an RST gridtable with multiline cells.', () => {
		const input = `+---+---+---+
| A | B | C |
+---+---+---+
| 0 | 0 | 0 |
| 0 | 1 | 0 |
| 1 | 0 | 0 |
| 1 | 1 | 1 |
+---+---+---+`;

		const table = cals.fromGrid( input );

		assert.strictEqual(table.tgroup[0].tbody.row[1].entry[0].paracon, '0\n0\n1\n1');

	});

    test('Parse an RST gridtable with multiline cells and re-render.', () => {
        const expected = `+---+---+---+
| A | B | C |
+---+---+---+
| 0 | 0 |   |
| 0 |   | x |
| 1 |   |   |
| 1 |   |   |
+---+---+---+`;

        const table = cals.tableHelper([1,1,1], [['A','B','C'],['0\n0\n1\n1', '0','\nx']]);

        const output = cals.toGrid( table );

        assert.strictEqual(output, expected);

    });
});
