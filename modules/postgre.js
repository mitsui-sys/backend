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
  return !isNum(data) || !data ? `'${data}'` : data;
};

/**
 * 連想配列を文字列に１つにまとめる
 * @param {*} data 連想配列
 * @returns 結合した値
 */
const joinData = (data, separator = ",") => {
  let items = [];
  for (const x in data) {
    items.push(`${x}=${typeData(data[x])}`);
  }
  return items.join(separator);
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

const selectDatabase = async function (req, res) {
  try {
    const table = req.params.table;
    const key = req.query;
    const size = Object.keys(key).length;
    const join = joinData(key, " AND ");
    const cond = size > 0 ? `WHERE ${join}` : "";
    const sql = `SELECT * FROM ${table} ${cond}`;
    console.log(sql);
    const result = await pool[0].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};
const insertDatabase = async function (req, res) {
  try {
    const data = req.body.data;
    const table = req.params.table;
    const columns = Object.keys(data);
    const col = "(" + columns.join(",") + ")";
    const row = "(" + columns.map((x) => typeData(data[x])).join(",") + ")";
    const sql = `INSERT INTO ${table} ${col} VALUES ${row} RETURNING *`;
    console.log(sql);
    const result = await pool[0].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const updateDatabase = async function (req, res) {
  try {
    const table = req.params.table;
    const key = req.body.data.key;
    const update = req.body.data.update;
    const cond = joinData(key);
    const row = joinData(update);
    const sql = `UPDATE ${table} SET ${row} WHERE 1=1 AND ${cond} RETURNING *`;
    console.log(sql);
    const result = await pool[0].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const deleteDatabase = async function (req, res) {
  try {
    console.log(req.body);
    const table = req.params.table;
    const key = req.query;
    const cond = joinData(key, " AND ");
    const sql = `DELETE FROM ${table} WHERE 1=1 AND ${cond} RETURNING *`;
    console.log(sql);
    const result = await pool[0].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const selectSystem = async function (req, res) {
  try {
    const table = req.params.table;
    const key = req.query;
    const size = Object.keys(key).length;
    const join = joinData(key, " AND ");
    const cond = size > 0 ? `WHERE ${join}` : "";
    const sql = `SELECT * FROM ${table} ${cond}`;
    console.log(sql);
    const result = await pool[1].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const insertSystem = async function (req, res) {
  try {
    const data = req.body.data;
    const table = req.params.table;
    const columns = Object.keys(data);
    const col = "(" + columns.join(",") + ")";
    const row = "(" + columns.map((x) => typeData(data[x])).join(",") + ")";
    const sql = `INSERT INTO ${table} ${col} VALUES ${row} RETURNING *`;
    console.log(sql);
    const result = await pool[1].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const updateSystem = async function (req, res) {
  try {
    const table = req.params.table;
    const key = req.body.data.key;
    const update = req.body.data.update;
    const cond = joinData(key);
    const row = joinData(update);
    const sql = `UPDATE ${table} SET ${row} WHERE 1=1 AND ${cond} RETURNING *`;
    console.log(sql);
    const result = await pool[1].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const deleteSystem = async function (req, res) {
  try {
    const table = req.params.table;
    const key = req.query;
    console.log(table, key);
    const cond = joinData(key, " AND ");
    const sql = `DELETE FROM ${table} WHERE 1=1 AND ${cond} RETURNING *`;
    console.log(sql);
    const result = await pool[1].tx(async (client) => {
      const res1 = await client.query(sql); // ➀
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

module.exports = {
  init,
  getTables,
  createTable,
  getColumns,
  registerSearch,
  getCurrentFiles,
  selectDatabase,
  insertDatabase,
  updateDatabase,
  deleteDatabase,
  selectSystem,
  insertSystem,
  updateSystem,
  deleteSystem,
};
