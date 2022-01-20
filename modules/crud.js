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

//調査票を取得する

/**
 *
 */
const select = async (req, res) => {
  const params = req.params;
  const query = req.query;
  const body = req.body;
  console.log(params);
  console.log(query);
  console.log(body);

  try {
    const result = await pool[1].tx(async (client) => {
      const table = "tbl_010_document";
      const name = params.table === undefined ? "" : typeData(params.table);
      const cond = name == "" ? "" : `AND name = ${name}`;
      const sql = `SELECT * FROM ${table} WHERE 1=1 ${cond}`;
      console.log(sql);
      const res1 = await client.query(sql);
      return res1;
    });
    const response = getResponce(result);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

const registerDocumentData = async (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  const data = body.data;

  try {
    const result = await pool[1].tx(async (client) => {
      const table = "tbl_010_document";
      const columns = Object.keys(data);
      const col = "(" + columns.join(",") + ")";
      const row = "(" + columns.map((x) => typeData(data[x])).join(",") + ")";
      const sql = `INSERT INTO ${table} ${col} VALUES ${row} RETURNING *`;
      console.log(sql);
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

const updateDocumentData = async (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  try {
    const result = await pool[1].tx(async (client) => {
      const table = "tbl_010_document";
      const key = body.data.key;
      const update = body.data.update;
      const cond = joinData(key);
      const row = joinData(update);
      const sql = `UPDATE ${table} SET ${row} WHERE 1=1 AND ${cond} RETURNING *`;
      console.log(sql);
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

const deleteDocumentData = async (req, res) => {
  let param = req.params;
  let query = req.query;
  let body = req.body;
  console.log(param);
  console.log(query);
  console.log(body);
  try {
    const result = await pool[1].tx(async (client) => {
      const table = "tbl_010_document";
      const key = body.data.key;
      const cond = joinData(key, " AND ");
      const sql = `DELETE FROM ${table} WHERE 1=1 AND ${cond} RETURNING *`;
      console.log(sql);
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
