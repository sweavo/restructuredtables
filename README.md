# restructuredtables

vscode plugin for handling tables in restructuredText.

RestructuredText has two native table formats, and the grid table is quite powerful. It can have RST paragraphs inside cells, i.e. bullet lists, code fragments, etc.  But to write the markup is cumbersome: you have to draw an ASCII-art grid using pipes, minuses, equalses and pluses, and you end up spending much more time lining up your art in your document source than you do focusing on the contents of your document.  

This extension aims to make it much easier to edit grid tables by parsing the table and re-rendering it, allowing it to re-flow, e.g. when cells get wider or taller.

## Features

### 2021-02-28

No features yet.  There are some basic tests for the `cals.toGrid` function.  Next might be to implement some tests for that `cals.fromGrid` function.

- `[002]` parse a grid table into an array of cells + some metadata (use CALS as the inspiration)

This is done to the smallest possible meaning of done.  I already have separate backlog items for multiline cell contents, and colspan and rowspan are not part of the MVP. 

Grooming: 009 is a dup of 003: Removed.  Reordered BL and added a bunch of revelations about pipe symbols and missing knowledge.

- `[003]` gridtable parsing to handle when the cells are multiline

- `[010]` Render a table where a cell runs to multiple lines

To test this I will use tableHelper so that the input can have different numbers of lines in cells along the same row.

It's working.  Now also a round-trip test to show that the grid does not drift when de- and re-encoded.

### 2021-03-01

- `[018]` Read about headings in gridtables and see how to incorporate in CALS

https://docutils.sourceforge.io/docs/ref/rst/restructuredtext.html#tables

Notes: (1) restructuredText seems to use CALS internally for its table representation.  (2) "emacs table mode" might provide some inspiration about the operations to be performed on a table.

Each cell is a miniature document, suggesting that I'll have to do something very clever to support reflowing. Actually, if we can insist that the left and right text columns within the table cell are blank, then the first encounter of - or = is the end of the imprisoned document.  Similarly, if the top or the bottom of the cell are a given width, then that sets the width (and possibly span) of the cell, and we don't have to worry about detecting internal | characters.  Actually we dont have to worry about that until we are doing colspans.

Headings are denoted by having multiple rows above a border written with = characters.
s

- `[024]` in toGrid, render heading rows followed by a = border.

### 2021-03-04

- `[023]` in fromGrid, treat rows above a = border as heading rows.

Discovered that when a grid cell is wider than the line that it contains, you get all the spaces in the output.  Raised 026.

Problem with the splitting of the array

### 2021-03-06

Something was going wrong here:

    this.thead=new THead(rows=rows.slice(0,headRows));
    this.tbody=new TBody(rows=rows.slice(headRows, rows.length));

The first of these two lines was leaving `rows` with only `headRows` rows, and then the second line was resulting in zero rows, presumably because `rows.length == headRows` by then.

A "refactor" to perform the partitioning of `rows` in a separate function fixed the bug. This is obviously not OK, so I went back and had a look. The answer: named parameters don't work like that in Javascript! In fact, they don't exist; what we use is de-structuring https://stackoverflow.com/a/42108988/11982419.

Fixing this on branch `refactor-after-023`. Done

- `[026]` in fromGrid, strip trailing whitespace from paracons

Since fromGrid is restructuredText not CALS world, it's OK to acknowledge that the cell contents are ReST documents.  So whitespace tidying is appropriate.  Here's the rule: from each line within a cell (i.e. between the | characters), trim the single leftmost space and all the rightmost spaces. So:

    | Now is the |
    | winter of  |  --> "Now is the\nwinter of\nour\ndiscontent"
    | our        |
    | discontent |

What to do with trailing newlines? I imagine ReST defines that as trimmed, so we can preserve or trim it as we see fit.

Indent on the left however is relevant, because it can start monospaced sections, etc.

    | Using Bash: | --> "Using Bash:\n    $ ls"
    |     $ ls    |

Done.

- `[Spike]` looking at how the UI will work.

`CustomTextEditor` is potentially heavyweight, and might force me to replace all other functionality for ReST.  

I didn't see a way to extract the table to another buffer and put it back.

I didn't see a way to open a mini editor window for the cell contents.

But I did find some hints about writing a formatter.  Perhaps use this API and specify a ReST formatter. https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices

### 2021-03-07

Not knowing much about the possibilities of the UI, I'm faced with two options:

1) spike a bunch of UI sketches to skill up, possibly building a whole language server
2) build support for [list tables](https://docutils.sourceforge.io/docs/ref/rst/directives.html#list-table) and then allow a transform between the two.

Option (2) is well documented and would provide a complete end-to-end MVP:  A command to translate between a gridTable and listTable.  Once the parsing of listtables is good enough, this would be releasable.

**Goal** implement a command to transform a gridtable to a list table and back again. At first it doesn't have to understand every kind of list table, e.g. column widths can be mandatory.  We are talking about a two-level list, using leading spaces to indicate nesting level, and the presence of list markers to validate.

Example:

    .. list-table::
        :widths: 15 10 30
        :header-rows: 1

        * - Treat
          - Quantity
          - Description
        * - Albatross
          - 2.99
          - On a stick!
        * - Crunchy Frog
          - 1.49
          - If we took the bones out, it wouldn't be
            crunchy, now would it?
        * - Gannet Ripple
          - 1.99
          - On a stick!

**Note list-table does not support column-spanning, so it would need some customizing to extend it.

- `[028]` toListTable: convert from CALS to a list-table 

Got this mostly done on the branch, but MIKADO PUSH I need to trim trailing blank lines from cell contents on read.

### 2021-03-09

- PUSH `[031]` fromGrid: blank lines at the end of multiline cells are trimmed.

POP to `[028]` and the test now passes. Done

### 2021-03-13

- `[027]` fromListTable: convert a list-table to CALS

- PUSH - `[025]` split out cals.ts into datamodel and conversion functions

Actually this means ReST and cals modules.
Done 025

POP to `[027]`.

`[027]` is done with MANY caveats.  Created ticket `[031]` to go back and toughen it up to work generically for ReST tables.

As it stands, it insists that the bullets are - or *, and it does not actually parse the list-table directive; it just assumes it
has one and jumps straight to the parameters, which also must be at the same line offsets from the directive as is written by toListTable.

We have enough now to make a vscode action that transforms a table between grid and list.

Done. 027

## Backlog
_(next:032)_

- `[031]` fromListTable: read up on ReST and support more valid inputs
- `[029]` fromList, toList: have some round-trip tests.
- `[006]` investigate: in a table cell, press a key to open the cell's contents in a new editor.  Close to save back to the cell.
- `[001]` read a table from a string in the document
- `[004]` gridtable parsing to handle when the table is indented
- `[019]` how should CALS represent column width in characters?
- `[020]` Do we need CALS to hold on to whether or not grid lines are shown? Consider both in the source and whether the source can specify what is rendered.
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
- `[022]` when reflowing a cell that contains | characters, avoid putting them directly below a +. (Defer until colspan)
- `[021]` read up on pandoc support for CALS tables: there will be no point in supporting certain features.

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

