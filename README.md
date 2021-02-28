# restructuredtables

vscode plugin for handling tables in restructuredText.

RestructuredText has two native table formats, and the grid table is quite powerful. It can have RST paragraphs inside cells, i.e. bullet lists, code fragments, etc.  But to write the markup is cumbersome: you have to draw an ASCII-art grid using pipes, minuses, equalses and pluses, and you end up spending much more time lining up your art in your document source than you do focusing on the contents of your document.  

This extension aims to make it much easier to edit grid tables by parsing the table and re-rendering it, allowing it to re-flow, e.g. when cells get wider or taller.

## Features

2021-02-28: No features yet.  There are some basic tests for the `cals.toGrid` function.  Next might be to implement some tests for that `cals.fromGrid` function.

## Backlog

- Allow more alignment options such that numbers can be right-aligned
- Parse a table where a cell runs to multiple lines
- Render a table where a cell runs to multiple lines
- Add screenshots or animations to the docs
- Read the [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: enable/disable this extension
* `myExtension.thing`: set to `blah` to do something

## Known Issues

- Extension basically does nothing
- `cals` class library is included in the extension, it probably should be separate.
- testing invokes the extension testing framework, even for typescript-only tests, which could run a lot faster.

## Release Notes

### 2021-02-28

In development

