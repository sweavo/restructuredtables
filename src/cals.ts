/* 
    TypeScript types for handling Exchange-CALS tables.

    This internal representation of tables supports more use-cases than pandoc's iomplementation of 
    restructuredText tables.  The aim here is to represent everything that can be expressed in the 
    two built-in table types of restructuredText. Translation to and from text is left to encoders 
    and decoders respectively.
*/

// Alignment enums
type CalsAlign = "left" | "right" | "center" | "justify" | "char";
type CalsVAlign = "top" | "middle" | "bottom";

// Entry: the content of a table cell. The paracon is a whole new document context (ideally)
interface Entry {
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
interface Row {
    rowsep: boolean;
    valign: CalsVAlign;
    entry: Entry[];
}

// The table body Row(s)
interface TBody {
    valign: CalsVAlign;
    row: Row[];
}

// The table header Row(s)
interface THead {
    valign: CalsVAlign;
    row: Row[];
}

// Column Specification
interface ColSpec {
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
interface TGroup {
    cols: number;
    colsep: boolean;
    rowsep: boolean;
    align: CalsAlign;
    colspecs: ColSpec[];
    thead: THead[]; // 0..1
    tbody: TBody;
}

// One logical table, which may span several pages or minipages, each with its own tgroup.
interface Table{
    // omitted: stuff relating to titles and frame?!
    pgwide: boolean; 
    tgroup: TGroup[];
}

