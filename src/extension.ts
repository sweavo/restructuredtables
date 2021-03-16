// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cals from './cals';
import * as ReST from './ReST';


function isTableLine( line: string) : boolean {
	return (line.match(/^\s*[|+]/))?true:false;
}

// Given a vscode document, and a line on which the cursor appears, return the first and last+1
// lines of the table. If first == last then there was no table found.
function findTableRange( document: vscode.TextDocument, startLine: number  ) {
	let start = startLine;
	let end = startLine;
	const maxLine = document.lineCount;
	console.log('ReSTables: count to start');
	for ( let cursor=startLine; 
			cursor>=0 && isTableLine( document.lineAt(cursor).text); 
			start=cursor--) {};
	console.log('ReSTables: count to end');
	for ( let cursor=startLine; 
			cursor<maxLine && isTableLine( document.lineAt(cursor).text); 
			end=++cursor ) {};

	console.log('ReSTables:return the range');
	return new vscode.Range( 
				new vscode.Position(start, 0),
				new vscode.Position(end, 0));
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
		editor.selection=new vscode.Selection( detectedRange.start, detectedRange.end);
		console.log('ResTables: set selection. Done');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
