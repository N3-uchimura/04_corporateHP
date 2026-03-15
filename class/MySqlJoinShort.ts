/**
 * MySqlJoin.ts
 *
 * name：SQL
 * function：SQL with Join operation
 * updated: 2026/01/18
 **/

"use strict";

// import global interface
import { } from "../@types/globaljoinsql";

// define modules
import * as mysql from "mysql2"; // mysql

// SQL class
class SQL {
  static logger: any; // logger
  static pool: any; // sql pool
  static encryptkey: string; // encryptkey

  // construnctor
  constructor(
    host: string,
    user: string,
    pass: string,
    port: number,
    db: string,
    logger: any,
    key?: string,
  ) {
    // loggeer instance
    SQL.logger = logger;
    // DB config
    SQL.pool = mysql.createPool({
      host: host, // host
      user: user, // username
      password: pass, // password
      database: db, // db name
      port: port, // port number
      waitForConnections: true, // wait for conn
      idleTimeout: 1000000, // timeout(ms)
      insecureAuth: false, // allow insecure
    });
    // encrypted key
    SQL.encryptkey = key!;
  }

  // inquire
  doInquiry = async (sql: string, inserts: string[]): Promise<any> => {
    return new Promise(async (resolve, _) => {
      try {
        // make query
        const qry: any = mysql.format(sql, inserts);
        // connect ot mysql
        const promisePool: any = SQL.pool.promise();
        // query name
        const [rows, _] = await promisePool.query(qry);

        // empty
        if (SQL.isEmpty(rows)) {
          // return error
          resolve("empty");
        } else {
          // result object
          resolve(rows);
        }
      } catch (e: unknown) {
        // error
        SQL.logger.error(e);
        resolve("error");
      }
    });
  };

  // update
  updateDB = async (args: updateargs): Promise<any> => {
    return new Promise(async (resolve1) => {
      try {
        //SQL.logger.trace('db: updateDB mode');
        // not
        let tmpQuery: string = "";
        // placeholder array
        let placeholder: any[] = [];
        // tmp placeholder array
        let tmpPlaceholder: any[] = [];
        // table
        const table: string = args.table;
        // select columns
        const selcol: string[] = args.selcol;
        // select values
        const selval: any[] = args.selval;
        // set column
        const setcol: string[] = args.setcol;
        // set value
        const setval: any[] = args.setval;
        // span value (optional)
        const spanval: any = args.spanval ?? null;
        // span direction (optional)
        const spandirection: any = args.spandirection ?? null;
        // spanunit (optional)
        const spanunit: any = args.spanunit ?? null;
        // selcol length
        const selcolLen: number = selcol.length;
        // setvallength
        const setvalLen: number = setval.length;
        // promise
        const promises: Promise<any>[] = [];
        // query string
        let queryString: string = "UPDATE ?? SET ?? = ?";

        // col exists
        if (selcolLen > 0) {
          // add where
          queryString += " WHERE";
          // set all conditions
          for (let i: number = 0; i < selcolLen; i++) {
            // initialize
            tmpQuery = "";
            // not
            if (selcol[i].includes("*")) {
              // query
              queryString += "?? <> ?";
              // replace asterisk
              tmpQuery = selcol[i].replace("*", "");
            } else {
              queryString += "?? = ?";
              tmpQuery = selcol[i];
            }

            // push column
            tmpPlaceholder.push(tmpQuery);
            // push value
            tmpPlaceholder.push(selval[i]);
            // other than last one
            if (i < selcolLen - 1) {
              // add 'and' phrase
              queryString += " AND ";
            }
          }
        }

        // val exists
        if (setvalLen > 0) {
          // set all values and execute
          for (let j = 0; j < setvalLen; j++) {
            // placeholder
            placeholder = [table];
            // add promise
            promises.push(
              new Promise(async (resolve2, _) => {
                // push column
                placeholder.push(setcol[j]);
                // push value
                placeholder.push(setval[j]);
                // add conditions
                placeholder.push(...tmpPlaceholder);

                // add span
                if (spanval && spanunit && spandirection) {
                  // flg
                  if (spandirection == "after") {
                    // query
                    queryString += ` AND ?? > date(current_timestamp - interval ? ${spanunit})`;
                  } else if (spandirection == "before") {
                    // query
                    queryString += ` AND ?? < date(current_timestamp - interval ? ${spanunit})`;
                  }
                  placeholder.push("created_at");
                  placeholder.push(spanval);
                }

                // do query
                await this.doInquiry(queryString, placeholder)
                  .then((result: any) => {
                    // result exists
                    if (result == "error" || result == "empty") {
                      //SQL.logger.trace(`updateDB: ${result}`);
                    } else {
                      //SQL.logger.trace('updateDB: success');
                    }
                    // do query
                    resolve2(result);
                  })
                  .catch((err: unknown) => {
                    // error
                    SQL.logger.error(err);
                    resolve2("error");
                  });
              }),
            );
          }
        }

        // complete
        Promise.all(promises).then((results: any) => {
          resolve1(results);
        });
      } catch (e: unknown) {
        // error
        SQL.logger.error(e);
        resolve1("error");
      }
    });
  };

  // insert
  insertDB = async (args: insertargs): Promise<any> => {
    return new Promise(async (resolve) => {
      try {
        SQL.logger.trace("db: insertDB mode");
        // table
        const table: string = args.table;
        // columns
        const columns: string[] = args.columns;
        // values
        const values: any[] = args.values;
        // query string
        const queryString: string = "INSERT INTO ??(??) VALUES (?)";
        // placeholder
        const placeholder: any[] = [table, columns, values];

        // do query
        await this.doInquiry(queryString, placeholder)
          .then((result: any) => {
            // result exists
            if (result == "error" || result == "empty") {
              resolve(result);
              SQL.logger.trace(`insertDB: ${result}`);
            } else {
              resolve(result.insertId);
              SQL.logger.trace("insertDB: success");
            }
          })
          .catch((err: unknown) => {
            // error
            SQL.logger.error(err);
            resolve("error");
          });
      } catch (e: unknown) {
        // error
        SQL.logger.error(e);
        resolve("error");
      }
    });
  };

  // empty or not
  static isEmpty(obj: Object) {
    // check whether blank
    return !Object.keys(obj).length;
  }
}

// export module
export default SQL;
