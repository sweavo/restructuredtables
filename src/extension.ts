// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cals from './cals';
import * as ReST from './ReST';


function isTableLine( line: string) : boolean {
	return (line.match(/^\s*[|+]/))?true:false;
}

function isNotEmptyLine( line:string) : boolean {
	return line.trim().length > 0;
}

// Given a vscode document, and a line on which the cursor appears, return the range that
// contains the text of the table rendition.
// lines of the table. If first == last then there was no table found.
function findCompliantRange( document: vscode.TextDocument, startLine: number, filterCallback: (line:string)=>boolean ) {
	let start = startLine;
	let end = startLine;
	const maxLine = document.lineCount;
	console.log('ReSTables: count to start');
	for ( let cursor=startLine; 
			cursor>=0 && filterCallback( document.lineAt(cursor).text); 
			start=cursor--) {};
	console.log('ReSTables: count to end');
	for ( let cursor=startLine; 
			cursor<maxLine && filterCallback( document.lineAt(cursor).text); 
			end=cursor++ ) {};

	const lastColumn = 
	
	console.log('ReSTables:return the range');

	return new vscode.Range( 
				new vscode.Position(start, 0),
				document.lineAt(end).range.end );
}

function findTableRange( document: vscode.TextDocument, startline: number ) {
	return findCompliantRange( document, startline, isTableLine );
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Extension "restructuredtables" is active.');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerTextEditorCommand('restructuredtables.gridTableToListTable', (editor, edit) => {
		// Display a message box to the user
		vscode.window.showInformationMessage('restructuredTables received "gridTableToListTable".');
		console.log('ResTables: get selection');
		const position=editor.selection.active;
		console.log('ResTables: got line: ' + position.line);
		const detectedRange=findTableRange(editor.document,position.line);
		console.log('ResTables: detected the range of the table');
		const originalText=editor.document.getText(detectedRange);

		const replacementText=ReST.toListTable( ReST.fromGrid(originalText) );
		console.log('ResTables: prepared a replacement');
		edit.replace( detectedRange, replacementText);
		console.log('ResTables: replaced.. Done');
	});

	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerTextEditorCommand('restructuredtables.listTableToGridTable', (editor, edit) => {
		const position=editor.selection.active;
		const detectedRange=findCompliantRange(editor.document, position.line, isNotEmptyLine);
		let originalText=editor.document.getText(detectedRange);
		let expandedRange;
		if (ReST.is2LevelList(originalText)) {
			const prefixRange=findCompliantRange(editor.document, detectedRange.start.line-2, isNotEmptyLine);
			originalText = editor.document.getText(prefixRange) + '\n\n' + originalText;
			expandedRange=new vscode.Range(prefixRange.start,detectedRange.end);
		}
		else
		{
			const suffixRange=findCompliantRange(editor.document, detectedRange.end.line+2, isNotEmptyLine);
			originalText = originalText + '\n\n' + editor.document.getText(suffixRange);
			expandedRange=new vscode.Range(detectedRange.start,suffixRange.end);
		}

		const replacementText=ReST.toGrid(ReST.fromListTable(originalText));
		edit.replace( expandedRange, replacementText);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
