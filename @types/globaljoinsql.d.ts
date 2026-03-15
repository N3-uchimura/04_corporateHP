/**
 * globaljoinsql.d.ts
 **
 * function：global joinsql type
 **/

export { };

declare global {
  // update arguments
  interface updateargs {
    table: string;
    setcol: string[];
    setval: any[];
    selcol: string[];
    selval: any[];
    spanval?: number;
    spancol?: string;
    spandirection?: string;
    spanunit?: string;
  }

  // insert arguments
  interface insertargs {
    table: string;
    columns: string[];
    values: any[];
  }
}
