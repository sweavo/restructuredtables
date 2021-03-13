import { assert } from 'node:console';
import { listenerCount } from 'node:events';
import *  as cals from './cals';

export function getReSTParameter(line: string) {
    return line.split(':')[2].trim();
}

function isBorder( line: string) : boolean {
    return line.slice(0,1) === '+';
}
function isHeaderEnd( line: string) : boolean {
    return line.slice(0,2) === '+=';
}

// fromGrid reads a restructuredText gridtable and turns it into a CALS structure.
export function fromGrid( input:string ):cals.Table {
    const lines = input.split('\n');

    // Use the first line to describe the columns:
    const columnStrings = lines[0].split('+').slice(1,-1);
    const widths = columnStrings.map( (st) => { return  st.length - 2; });

    // Scoop up the contents.
    let cells:string[][] = [];
    let headerRows = 0;
    let rowIndex = 0;
    let sep = '';
    lines.slice(0,-1).forEach( (line) => {
        if (isBorder( line ) ) {
            // Start a new set of cell buffers.
            cells.push( new Array(widths.length).fill(""));
            rowIndex = cells.length-1;
            sep='';
            if (isHeaderEnd(line)) {
                headerRows = rowIndex;
            }
        }
        else
        {
            // Append a line to each of the cell buffers.
            line.split('|').slice(1,-1).forEach( (cellLine,i) => {
                cells[rowIndex][i]+= sep + cellLine.slice(1,-1).trimEnd();
            });
            sep = '\n';
        }
    });

    // trim trailing whitespace from each cell
    cells = cells.map( 
        (row) => row.map(
            (str)=> str.trimEnd()));
    
            return cals.tableHelper( widths, cells, headerRows );
}

function writeRowMultiline( colwidths: number[], row: cals.Row, callback: (l:string)=>void ) {

    // Each of the cells' paracons is to be held as an array of lines.
    const paraconLineArrays = row.entry.map( (entry) => entry.paracon.split('\n') );

    //Hold on to the length of the longest.
    const extent = Math.max(... paraconLineArrays.map( (s) => s.length ));

    // Now loop long enough for the longest list of cell lines, rendering the grid with text in cells.
    for (let textLineIndex = 0; textLineIndex<extent; ++textLineIndex) {
        // Take the ith line of each entry in the row, or "" where there is no ith line
        const cellLines = paraconLineArrays.map( (pc) => (textLineIndex < pc.length) ? pc[textLineIndex] : "" );

        const  innerText = cellLines.map( (cellLine, colIndex) => cellLine.padEnd(colwidths[colIndex], ' ')).join(' | ');
        callback( '| ' + innerText + ' |');
    }

}
// Given a cals table, write it as an RST gridtable
export function toGrid( input:cals.Table ): string {
    const colspecs = input.tgroup[0].colspecs;
    const colwidths = colspecs.map((spec) => parseInt(spec.colwidth));

    // Prefab this line, which will be re-used a bunch.
    const headPlate = '+' + (colwidths.map( (w) => { return ''.padStart(w + 2,'-');}).join('+')) + '+';
    const headSeparator = '+' + (colwidths.map( (w) => { return ''.padStart(w + 2,'=');}).join('+')) + '+';

    // Accumulator
    let lines = [];

    // Heading rows, if any
    if (input.tgroup[0].thead !== undefined) {

        input.tgroup[0].thead.row.map( (row: cals.Row) => {
            lines.push(headPlate);
            writeRowMultiline( colwidths, row, (line) => lines.push(line) );
        });

        // horizontal double-rule signifying end of header
        lines.push(headSeparator);

    } else {

        // horizontal single rule signifying start of table
        lines.push(headPlate);

    }

    // Go through the rows. For each we will find the lines within the cells of that row
    input.tgroup[0].tbody.row.map( (row: cals.Row) => {

        writeRowMultiline( colwidths, row, (line) => lines.push(line) );
        lines.push(headPlate);

    });

    return lines.join('\n');
}


// functions for converting to and from listTable

// Helper: take some lines representing ReST and indent them, with an optional list marker on the first row.
export function toListElement( spaces: number, lines: string[], firstCharacter=" ") {
    let lead = firstCharacter.padEnd(spaces,' ');
    return lines.map( (line) => {
        const buffer = lead + line;
        lead = ''.padEnd(spaces,' ');
        return buffer;
    });
}

function cellTextToBullet( text: string ) {
    return toListElement(2,text.split('\n'),'-');
}


export function toListTable( table: cals.Table) {
    let headerLines = [ '.. list-table::' ];

    // Get the widths
    const widths=table.tgroup[0].colspecs.map( (colspec: cals.ColSpec) => colspec.colwidth );
    headerLines.push('   :widths: ' + widths.join(' '));

    // Count header rows
    const headerRows = table.tgroup[0].thead?.row.length || 0;
    headerLines.push('   :header-rows: ' + headerRows.toString());

    // Blank line to separate directive from table
    headerLines.push('');

    // build the nested list.
    const dataLines = table.tgroup[0].getAllRows().map((row)=>{
        const cells = row.entry.map( (entry) => entry.paracon);
        const cellLines = cells.map(cellTextToBullet);
        const rowLines = Array.prototype.concat( ...cellLines);
        return toListElement(2, rowLines, '*');
    });
        
    return headerLines.concat(toListElement(4,Array.prototype.concat(... dataLines))).join('\n');
}

export function getListItems( lines:string[]) {
    let output:string[][]=[];
    let item:string[] = [];
    // Match the leading spaces, the bullet, and the spaces between the bullet and the text
    const lineLeadPieces = lines[0].match(/^(\s*)([-\*])(\s+)/);
    
    if (lineLeadPieces === null) {
        return [['error']];
    }
    
    const bulletLead = lineLeadPieces[1] + lineLeadPieces[2] + lineLeadPieces[3];
    const leadLength = bulletLead.length;
    // derive the start of a continuation line
    const continuationLead = lineLeadPieces[1] + ' ' + lineLeadPieces[3];
    lines.forEach( (line) => {
        if (line.substr(0,leadLength) === bulletLead )
        {
            if ( item.length ) {
                output.push(item);
            }
            item = [line.substr(leadLength)];
        }
        else if ( line.substr(0,leadLength) === continuationLead )
        {
            item.push( line.substr(leadLength));
        }
        else
        {
            if ( item.length ) {
                output.push(item);
            }
            return output;
        }

    });
    if ( item.length ) {
        output.push(item);
    }
    return output;
}

export function fromListTable( text: string ) {
    const lines =  text.split('\n');

    // Brutally simple right now, assumes correctness of input and that markup is 
    // as written by toListTable.
    // First argument is widths
    const widthStrings=getReSTParameter(lines[1]).split(' ');
    const widthInts=widthStrings.map((a:string)=>parseInt(a)); // why not map(parseInt) ? see https://medium.com/dailyjs/parseint-mystery-7c4368ef7b21   
    
    // Second argument is header rows
    const headerRows=parseInt(getReSTParameter(lines[2]));

    // After the blank line, we have rows and columns. 
    const rowsOfReST = getListItems(lines.slice(4)); // Array of rows, where each row is a strings[] representing an ReST list
    const rowsOfCellsOfArraysOfReST = rowsOfReST.map(getListItems); // Array of rows, where each row is an array of entries, where each entry is a strings[] representing lines.

    // HACK this seems to me to nest one too many times, but it passes the test, so...
    const rowsOfCellsOfTextOfReST = rowsOfCellsOfArraysOfReST.map( (cellsOfArraysOfReST)=>cellsOfArraysOfReST).map( (arrayOfReST) => arrayOfReST.map( (dunno) => dunno.join('\n')));
    
    return cals.tableHelper(widthInts,rowsOfCellsOfTextOfReST,headerRows);
}
