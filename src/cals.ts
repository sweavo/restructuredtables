/* 
    TypeScript types for handling Exchange-CALS tables.

    This internal representation of tables supports more use-cases than pandoc's iomplementation of 
    restructuredText tables.  The aim here is to represent everything that can be expressed in the 
    two built-in table types of restructuredText. Translation to and from text is left to encoders 
    and decoders respectively.
*/

import { debug } from "console";
import { Recoverable } from "repl";
import { runInNewContext } from "vm";

// Alignment enums
export type CalsAlign = "left" | "right" | "center" | "justify" | "char";
type CalsVAlign = "top" | "middle" | "bottom";

// Entry: the content of a table cell. The paracon is a whole new document context (ideally)
export class Entry {
    constructor (paracon:string){
        this.paracon =paracon;
    }
    colname?: string;
    namest?: string;
    nameend?:string;
    morerows?:string;
    colsep?:boolean;
    rowsep?:boolean;
    align?: CalsAlign;
    char?: string;
    charoff?:string;
    valign?: CalsVAlign;
    paracon: string;
}

// One table Row.
export class Row {
    constructor (entries: Entry[]) {
        this.entry = entries;
    };    
    rowsep?: boolean;
    valign?: CalsVAlign;
    entry: Entry[];
}

// The table body Row(s)
export class TBody {
    constructor (rows: Row[]){
        this.row = rows;
    }
    valign?: CalsVAlign;
    row: Row[];
}

// The table header Row(s)
export class THead {
    constructor (rows: Row[]){
        this.row = rows;
    }
    valign?: CalsVAlign;
    row: Row[];
}

// Column Specification
export class ColSpec {
    constructor (colwidth: number) {
        this.colwidth = colwidth.toString();
    };
    colnum?: string;
    colname?: string;
    colwidth: string;
    colsep?: boolean;
    rowsep?: boolean;
    align?: CalsAlign;
    char?: string;
    charoff?: string;
}

// TGroup: one uninterrupted layout of a subsection of the table, e.g. one pageful.
export class TGroup {
    cols: number;
    colsep?: boolean;
    rowsep?: boolean;
    align?: CalsAlign;
    colspecs: ColSpec[];
    thead?: THead; // 0..1
    tbody: TBody;
    constructor ( colspecs: ColSpec[], hasHead: boolean, rows: Row[]){
        this.colspecs = colspecs;
        this.cols = this.colspecs.length;
        if (hasHead){
            this.thead=new THead(rows=[rows[0]]);
            this.tbody=new TBody(rows=rows.slice(1));
        }else{
            this.thead=undefined;
            this.tbody=new TBody(rows);
        }
    }
}

// One logical table, which may span several pages or minipages, each with its own tgroup.
export class Table{
    // omitted: stuff relating to titles and frame?!
    public  pgwide: boolean = false; 
    public tgroup: TGroup[] = [];

    constructor ( tgroup: TGroup[] ) {
        this.pgwide = false;
        this.tgroup = tgroup;
    }
    public isValid() {
        if (this.tgroup.length === 0){
            return false;
        }
        return true;
    };
}


// fromGrid reads a restructuredText gridtable and turns it into a CALS structure.
export function fromGrid( input:string ):Table {
    const lines = input.split('\n');
    // Use the first line to describe the columns:

    const columnStrings =  lines[0].split('+');

    const colspecs = columnStrings.map( (st) => { return new ColSpec( st.length ); } );

    const headRow = new Row([new Entry("hello"), new Entry("mum")]);
    const bodyRow = new Row([new Entry("wotcher"), new Entry("Mate")]);

    const table = new Table(
        [new TGroup(
            colspecs,
            false,
            [
                headRow,
                bodyRow
            ]
        )]
    );

    return table;
}

export function tableHelper( widths: number[], entries: string[][]){
    const colspecs = widths.map( (wid) => { return new ColSpec( wid); } );
    const rows =entries.map( (row) => {
        return new Row( row.map( (e) => { return new Entry(e); }));
    });
    return new Table( [new TGroup( colspecs, false, rows )]);

}

// Given a cals table, write it as an RST gridtable
export function toGrid( input:Table ): string {
    const colspecs = input.tgroup[0].colspecs;
    const colwidths = colspecs.map((spec) => {return parseInt(spec.colwidth);});

    const headPlate = '+' + (colwidths.map( (w) => { return ''.padStart(w + 2,'-');}).join('+')) + '+';

    let lines = [headPlate];
    const rows = input.tgroup[0].tbody.row.map( (row: Row) => {
        
        lines.push( '| ' + row.entry.map( (entry, i) => {
            return entry.paracon.padEnd(colwidths[i], ' ');
        }).join(' | ') + ' |');
        lines.push(headPlate);
    });
    return lines.join('\n');
}
