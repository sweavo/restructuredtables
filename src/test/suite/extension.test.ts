import * as assert from 'assert';
import { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } from 'constants';
import { execPath } from 'process';

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
		const tgroup = new cals.TGroup( [col], 0, [row]);
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

    test('Render an RST gridtable with multiline cells of different numbers of lines.', () => {
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

	test('Parse and re-render an RST gridtable with multiline cells of different numbers of lines.', () => {
        const input = `+---+---+---+
| A | B | C |
+---+---+---+
| 0 | 0 |   |
| 0 |   | x |
| 1 |   |   |
| 1 |   |   |
+---+---+---+`;

        const table = cals.fromGrid(input);

        const output = cals.toGrid( table );

        assert.strictEqual(output, input);

    });

	test('`[024]` in toGrid, render heading rows followed by a = border.]', () => {
		let table = cals.tableHelper([5,5,5], [["1","2","3"],["4","5","6"]]);


		table.tgroup[0].thead = new cals.THead([
			new cals.Row(
				['A','B','C' ].map( (e) => {return new cals.Entry(e); } )
			)
		]);

		const expected = `+-------+-------+-------+
| A     | B     | C     |
+=======+=======+=======+
| 1     | 2     | 3     |
+-------+-------+-------+
| 4     | 5     | 6     |
+-------+-------+-------+`;

		const output = cals.toGrid( table );

		assert.strictEqual(output, expected);
	});

	test('`[023]` in fromGrid, treat rows above a = border as heading rows.', () => {
		const input = `+-------+-------+-------+
| 1     | 2     | 3     |
+-------+-------+-------+
| A     | B     | C     |
+=======+=======+=======+
| 1     | 2     | 3     |
+-------+-------+-------+
| 4     | 5     | 6     |
+-------+-------+-------+`;

		const table = cals.fromGrid(input);

		assert.strictEqual(table.tgroup[0].thead?.row.length,2, "checking for 2 header rows");
		assert.strictEqual(table.tgroup[0].thead?.row[1].entry[2].paracon,'C    '); // bug [026] the whitespace should have been stripped
		assert.strictEqual(table.tgroup[0].tbody.row.length,2, "checking for 2 body rows");
		assert.strictEqual(table.tgroup[0].tbody.row[0].entry[0],'1');
	});

});
