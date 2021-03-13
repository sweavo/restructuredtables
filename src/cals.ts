/*
    TypeScript types for handling Exchange-CALS tables.

    This internal representation of tables supports more use-cases than pandoc's implementation of
    restructuredText tables.  The aim here is to represent everything that can be expressed in the
    two built-in table types of restructuredText. Translation to and from text is left to encoders
    and decoders respectively.
*/
import * as ReST from './ReST';

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

// TODO move to utility module
function arrayPartition(inputArray: any[], splitIndex:number): any[][] {
    const length = inputArray.length;
    const first = inputArray.slice(0, splitIndex);
    const second = inputArray.slice(splitIndex,length);
    return [first, second];
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

    constructor ( colspecs: ColSpec[], headRows: number, rows: Row[]){
        const [tableHeadRows, tableBodyRows] = arrayPartition(rows, headRows);
        this.colspecs = colspecs;
        this.cols = this.colspecs.length;

        // rather than containing zero rows, thead is completely undefined if there is no header
        this.thead=headRows?new THead(tableHeadRows):undefined;
        this.tbody=new TBody(tableBodyRows);
    }

    // There HAS to be a lighter way than duplicating the array
    getAllRows() {
        let returnArray = this.tbody.row;
        if (this.thead !== undefined ){
            returnArray.unshift( ... this.thead.row);
        }
        return returnArray;
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

// Shortcut to a cals table from a couple of JS arrays
export function tableHelper( widths: number[], entries: string[][], headerRows=0 ) {
    const colspecs = widths.map( (wid) => { return new ColSpec( wid); } );
    const rows =entries.map( (row) => {
        return new Row( row.map( (e) => { return new Entry(e); }));
    });
    return new Table( [new TGroup( colspecs, headerRows, rows )]);

}
