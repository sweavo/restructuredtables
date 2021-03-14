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
	
	for ( let cursor=start; cursor>=0 && isTableLine( document.lineAt(cursor).text); --cursor) {
		start=cursor;		
	}

	for ( let cursor=start; cursor<=maxLine && isTableLine( document.lineAt(cursor).text); ++cursor) {
		end=cursor;		
	}

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
	let disposable = vscode.commands.registerCommand('restructuredtables.gridTableToListTable', (editor, edit) => {
		// Display a message box to the user
		vscode.window.showInformationMessage('restructuredTables received "gridTableToListTable".');

		let position = editor.selection.active;
		const detectedRange=findTableRange(editor.document,position.line);
		editor.selection=new vscode.Selection( detectedRange.start, detectedRange.end);


	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
