/* 
    TypeScript types for handling Exchange-CALS tables.

    This internal representation of tables supports more use-cases than pandoc's iomplementation of 
    restructuredText tables.  The aim here is to represent everything that can be expressed in the 
    two built-in table types of restructuredText. Translation to and from text is left to encoders 
    and decoders respectively.
*/

// Alignment enums
export type CalsAlign = "left" | "right" | "center" | "justify" | "char";
type CalsVAlign = "top" | "middle" | "bottom";

// Entry: the content of a table cell. The paracon is a whole new document context (ideally)
export interface Entry {
    colname: string;
    namest: string;
    nameend:string;
    morerows:string;
    colsep:boolean;
    rowsep:boolean;
    align: CalsAlign;
    char: string;
    charoff:string;
    valign: CalsVAlign;
    paracon: string;
}

// One table Row.
export interface Row {
    rowsep: boolean;
    valign: CalsVAlign;
    entry: Entry[];
}

// The table body Row(s)
export interface TBody {
    valign: CalsVAlign;
    row: Row[];
}

// The table header Row(s)
export interface THead {
    valign: CalsVAlign;
    row: Row[];
}

// Column Specification
export interface ColSpec {
    colnum: string;
    colname: string;
    colwidth: string;
    colsep: boolean;
    rowsep: boolean;
    align: CalsAlign;
    char: string;
    charoff: string;
}

// TGroup: one uninterrupted layout of a subsection of the table, e.g. one pageful.
export interface TGroup {
    cols: number;
    colsep: boolean;
    rowsep: boolean;
    align: CalsAlign;
    colspecs: ColSpec[];
    thead: THead[]; // 0..1
    tbody: TBody;
}

// One logical table, which may span several pages or minipages, each with its own tgroup.
export class Table{
    // omitted: stuff relating to titles and frame?!
    public  pgwide: boolean = false; 
    public tgroup: TGroup[] = [];

    constructor ( pgwide:boolean , tgroup: TGroup[] ) {
        this.pgwide = pgwide;
        this.tgroup = tgroup;
    }
    public isValid() {
        if (this.tgroup.length === 0){
            return false;
        }
        return true;
    };
}