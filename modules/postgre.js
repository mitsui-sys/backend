const { pool, dbConf, initilize } = require("./db.index"); //DB設定

const getResponce = (result) => {
  let response = {};
  // fieldsから列名, _types._types.builtinsからデータ型を得る
  const fields = result.fields;
  const types = result._types._types.builtins;
  const columns = [];
  fields.forEach((f) => {
    const dt = Object.keys(types).reduce((r, key) => {
      return types[key] === f.dataTypeID ? key : r;
    }, null);
    columns.push({ columnName: f.name, type: dt });
  });
  // レスポンスに列情報を設定する
  response.columns = columns;
  // レスポンスにサンプルデータを設定する
  response.rows = result.rows;
  return response;
};

const isNum = (val) => {
  return !isNaN(val);
};

const typeData = (data) => {
  // return typeof data === "string" ? `'${data}'` : data;
  return !isNum(data) ? `'${data}'` : data;
};

const getCurrentFiles = (req, res) => {
  const glob = require("glob");

  glob("*", (err, files) => {
    files.forEach((file) => {
      console.log(file);
    });
    res.status(200);
    res.end(files);
  }).catch((err) => {
    // error
    res.status(500);
    res.end(`Error accessing DB: ${JSON.stringify(error)}`);
  });
};

const getLog = (req, res) => {
  req.params.name = "tbl_008_log";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const tblName = param.name;
  const sql = `SELECT * FROM ${tblName}`;
  console.log(sql);
  pool[1]
    .query(sql)
    .then((result) => {
      // success
      let response = {};
      // fieldsから列名, _types._types.builtinsからデータ型を得る
      const fields = result.fields;
      const types = result._types._types.builtins;
      const columns = [];
      fields.forEach((f) => {
        const dt = Object.keys(types).reduce((r, key) => {
          return types[key] === f.dataTypeID ? key : r;
        }, null);
        columns.push({ columnName: f.name, type: dt });
      });
      // レスポンスに列情報を設定する
      response.columns = columns;
      // レスポンスにサンプルデータを設定する
      response.rows = result.rows;
      // success
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const registerLog = (req, res) => {
  req.params.name = "tbl_008_log";
  const param = req.params;
  const query = req.query;
  const body = req.body;

  console.log(param);
  console.log(query);
  console.log(body);

  const name = param.name;
  const data = body.data;
  const columns = Object.keys(data);
  const col = "(" + columns.join(",") + ")";
  const row = "(" + columns.map((x) => typeData(data[x])).join(",") + ")";
  let queryStr = `INSERT INTO ${name} ${col} VALUES ${row} RETURNING *`;
  console.log(queryStr);
  pool[1]
    .query(queryStr)
    // pool[0].query(queryStr, data)
    .then((results) => {
      res.status(201).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const getFile = (req, res) => {
  req.params.name = "tbl_007_file";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const tblName = param.name;
  const sql = `SELECT * FROM ${tblName}`;
  console.log(sql);
  pool[1]
    .query(sql)
    .then((result) => {
      // success
      const response = getResponce(result);
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const registerFile = (req, res) => {
  req.params.name = "tbl_007_file";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  const file = req.file;
  const formData = req.FormData;
  console.log(param);
  console.log(query);
  console.log(body);
  console.log(file);
  console.log(formData);

  let name = param.name;
  let data = body.data;
  const columns = Object.keys(data[0]);
  const col = "(" + columns.join(",") + ")";
  let vals = [];
  for (const i in data) {
    const d = data[i];
    const row = "(" + columns.map((x) => typeData(d[x])).join(",") + ")";
    vals.push(row);
  }
  const val = vals.join(",");

  let queryStr = `INSERT INTO ${name} ${col} VALUES ${val} RETURNING *`;
  console.log(queryStr);
  pool[1]
    .query(queryStr)
    // pool[0].query(queryStr, data)
    .then((results) => {
      res.status(201).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const getUser = (req, res) => {
  req.params.name = "tbl_001_user";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const tblName = param.name;
  const sql = `SELECT * FROM ${tblName}`;
  console.log(sql);
  pool[1]
    .query(sql)
    .then((result) => {
      // success
      const response = getResponce(result);
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const registerUser = (req, res) => {
  req.params.name = "tbl_001_user";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const name = param.name;
  const data = body.data;
  let columns = Object.keys(data);
  const col = "(" + columns.join(",") + ")";
  let vals = [];
  for (const x in data) {
    console.log(`${x} : ${data[x]}`);
    vals.push(typeData(data[x]));
  }
  let val = "(" + vals.join(",") + ")";

  const queryStr = `INSERT INTO ${name} ${col} VALUES ${val} RETURNING *`;
  console.log(queryStr);
  pool[1]
    .query(queryStr)
    // pool[0].query(queryStr, data)
    .then((results) => {
      res.status(201).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const getSearch = (req, res) => {
  req.params.name = "tbl_001_user";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const name = param.name;
  const username = param.user;
  let sql = `SELECT * FROM ${name} WHERE 1=1 `;
  if (username) sql += ` AND user_name = '${username}'`;
  pool[1]
    .query(sql)
    // pool[0].query(queryStr, data)
    .then((result) => {
      // success
      const response = getResponce(result);
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const registerSearch = (req, res) => {
  req.params.name = "tbl_001_user";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const name = param.name;
  const data = body.data;
  const user_name = data.user_name;
  const search = data.search;

  const queryStr = `UPDATE ${name} SET search = '${search}' WHERE user_name = '${user_name}' RETURNING *`;
  console.log(queryStr);
  pool[1]
    .query(queryStr)
    // pool[0].query(queryStr, data)
    .then((results) => {
      res.status(201).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const login = (req, res) => {
  req.params.name = "tbl_001_user";
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const tblName = param.name;
  const username = query.username;
  const password = query.password;

  const sql = `SELECT * FROM ${tblName} WHERE 1=1 AND user_name = '${username}' AND password = '${password}'`;
  console.log(sql);
  pool[1]
    .query(sql)
    .then((result) => {
      // success
      res.status(200).json(result.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const init = (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const id = query.id || 0;

  //初期化
  let conf = Object.assign(dbConf[id]);
  for (key in body) {
    conf[key] = body[key];
  }
  console.log(conf);
  initilize(id, conf);

  let sql =
    "SELECT tablename FROM pg_tables " +
    "WHERE schemaname NOT IN('pg_catalog','information_schema') " +
    "ORDER BY tablename";

  pool[id]
    .query(sql)
    .then((results) => {
      // success
      const response = getResponce(result);
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const getTables = async (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  try {
    const result = await pool[0].tx(async (client) => {
      const sql =
        "SELECT tablename FROM pg_tables " +
        "WHERE schemaname NOT IN('pg_catalog','information_schema') " +
        "ORDER BY tablename";
      const res1 = await client.query(sql); // ➀
      // const res2 = await client.query("SELECT NOW()"); // ➁
      // const res3 = await client.query("SELECT NOW()"); // ➂
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const createTable = (req, res) => {
  let body = req.body;
  let tblName = body.tblName;
  let names = body.names;
  let types = body.types;
  let sql = `CREATE TABLE ${tblName}()`;
  pool[0]
    .query(sql)
    .then((results) => {
      // success
      res.status(200).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const getColumns = (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);

  // 対象のテーブル
  // const table = req.body.table;
  const table = param.name;
  // サンプルデータのレコード件数
  const limit = body.limit || 10;
  let sql = `SELECT * FROM ${table} LIMIT ${limit}`;
  console.log(sql);
  // let sql = `SELECT * FROM information_schema.columns WHERE table_name=${name} ORDER BY ordinal_position`
  pool[0]
    .query(sql)
    .then((result) => {
      let response = {};
      // fieldsから列名, _types._types.builtinsからデータ型を得る
      const fields = result.fields;
      const types = result._types._types.builtins;
      const columns = [];
      fields.forEach((f) => {
        const dt = Object.keys(types).reduce((r, key) => {
          return types[key] === f.dataTypeID ? key : r;
        }, null);
        columns.push({ columnName: f.name, type: dt });
      });
      // レスポンスに列情報を設定する
      response.columns = columns;
      // レスポンスにサンプルデータを設定する
      response.rows = result.rows;
      // success
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const get = (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  let name = param.name;
  let sql = `SELECT * FROM ${name} WHERE 1=1`;
  // 条件パラメータが存在するか
  if (Object.keys(query).length > 0) {
    let conds = [];
    for (let key in query) {
      let value = query[key];
      console.log(key, value);
      let d = "";
      if (isFinite(value)) {
        d = ` AND ${key} = ${value}`;
      } else {
        d = ` AND ${key} LIKE '%${value}%'`;
      }
      conds.push(d);
    }
    let whereStr = conds.join("");
    sql += whereStr;
  }
  console.log(sql);
  pool[0]
    .query(sql)
    .then((result) => {
      // success
      const response = getResponce(result);
      res.status(200).json(response);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const insertOne = (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  let name = param.name;
  let data = body.data;
  const columns = Object.keys(data[0]);
  const col = "(" + columns.join(",") + ")";
  let vals = [];
  for (const i in data) {
    const d = data[i];
    const row = "(" + columns.map((x) => typeData(d[x])).join(",") + ")";
    vals.push(row);
  }
  const val = vals.join(",");
  let queryStr = `INSERT INTO ${name} ${col} VALUES ${val} RETURNING *`;
  console.log(queryStr);
  pool[0]
    .query(queryStr)
    // pool[0].query(queryStr, data)
    .then((results) => {
      res.status(201).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const updateOne = (req, res) => {
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const name = param.name;
  const data = body.data;
  const key = data.key;
  const id = data.id;
  const update = data.update;
  let rows = [];
  for (let key in update) {
    rows.push(`${key}=${typeData(update[key])}`);
  }
  const row = rows.join(",");
  let sql = `UPDATE ${name} SET ${row} WHERE ${key} = ${id} RETURNING *`;
  console.log(sql);
  pool[0]
    .query(sql)
    .then((results) => {
      res.status(200).json(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

const deleteOne = (req, res) => {
  const param = req.params;
  const query = req.query;
  const body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const name = param.name;
  console.log(name);
  const deleteKey = body.deleteKey;
  const selectedItem = body.selectedItem;
  let arr = [];
  for (const i in selectedItem) {
    const d = selectedItem[i];
    const id = d[deleteKey];
    arr.push(id);
  }
  const cond = arr.join(",");
  const queryStr = `DELETE FROM ${name} WHERE ${deleteKey} in (${cond}) RETURNING *`;
  console.log(queryStr);
  pool[0]
    .query(queryStr)
    .then((results) => {
      res.status(200).end(results.rows);
    })
    .catch((error) => {
      // error
      res.status(500);
      res.end(`Error accessing DB: ${JSON.stringify(error)}`);
    });
};

module.exports = {
  init,
  getTables,
  createTable,
  get,
  insertOne,
  updateOne,
  deleteOne,
  getColumns,
  login,
  getSearch,
  registerSearch,
  getUser,
  registerUser,
  getFile,
  registerFile,
  getCurrentFiles,
  getLog,
  registerLog,
};
