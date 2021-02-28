# restructuredtables

vscode plugin for handling tables in restructuredText.

RestructuredText has two native table formats, and the grid table is quite powerful. It can have RST paragraphs inside cells, i.e. bullet lists, code fragments, etc.  But to write the markup is cumbersome: you have to draw an ASCII-art grid using pipes, minuses, equalses and pluses, and you end up spending much more time lining up your art in your document source than you do focusing on the contents of your document.  

This extension aims to make it much easier to edit grid tables by parsing the table and re-rendering it, allowing it to re-flow, e.g. when cells get wider or taller.

## Features

2021-02-28: No features yet.  There are some basic tests for the `cals.toGrid` function.  Next might be to implement some tests for that `cals.fromGrid` function.

- `[002]` parse a grid table into an array of cells + some metadata (use CALS as the inspiration)

This is done to the smallest possible meaning of done.  I already have separate backlog items for multiline cell contents, and colspan and rowspan are not part of the MVP. 

Grooming: 009 is a dup of 003: Removed.  Reordered BL and added a bunch of revelations about pipe symbols and missing knowledge.

- `[003]` gridtable parsing to handle when the cells are multiline



## Backlog

- `[010]` Render a table where a cell runs to multiple lines
- `[004]` gridtable parsing to handle when the table is indented
- `[018]` Read about headings in gridtables and see how to incorporate in CALS
- `[019]` how should CALS represent column width in characters?
- `[020]` Do we need CALS to hold on to whether or not grid lines are shown? Consider both in the source and whether the source can specify what is rendered.
- `[001]` read a table into a string from the document
- `[006]` investigate: in a table cell, press a key to open the cell's contents in a new editor.  Close to save back to the cell.
- `[007]` investigate: in a table, hit a key to reformat to some flat view; hit it again to reconstitue the table.
- `[008]` Allow more alignment options such that numbers can be right-aligned
- `[011]` Add screenshots or animations to the docs
- `[012]` Read the [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- `[005]` gridtable parsing to handle when the columns are not correctly aligned: 2021-02-28: at this time the alignment has no bearing on the parsing of the gridtable.  This means there will be bugs (raised as [013] and [014]) when pipe symbols appear other than in the correct columns.
- `[013]` handle when a pipe symbol is present in a table cell
- `[014]` gridtable to allow basic colspan without breaking [005]
- `[015]` use the existing line lengths in a column to work out the column's ideal width, including multiline entries.
- `[016]` EPIC allow the cell contents to be reflowed by parsing them as RST.
- `[017]` EPIC given [016], use the volume of text in columns to come up with the column widths.

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

