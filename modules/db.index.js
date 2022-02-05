const dbConf = require("./db.config.js").dbConf;
const { Pool } = require("pg");
const dbNum = dbConf.length;
let pool = [];

const initTx = async (cb) => {
  const connection = await pool[i].connect();
  let res;
  try {
    await connection.query("BEGIN");
    try {
      res = await cb(connection);
      await connection.query("COMMIT");
    } catch (err) {
      await connection.query("ROLLBACK");
      throw err;
    }
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
  return res;
};

for (let i = 0; i < dbNum; i++) {
  pool[i] = new Pool(dbConf[i]);
  pool[i].tx = async (cb) => {
    const connection = await pool[i].connect();
    let res;
    try {
      await connection.query("BEGIN");
      try {
        res = await cb(connection);
        await connection.query("COMMIT");
      } catch (err) {
        await connection.query("ROLLBACK");
        throw err;
      }
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
    return res;
  };
}
initilize = (index, conf) => {
  pool[index] = new Pool(conf);
  pool[index].tx = async (cb) => {
    const connection = await pool[index].connect();
    let res;
    try {
      await connection.query("BEGIN");
      try {
        res = await cb(connection);
        await connection.query("COMMIT");
      } catch (err) {
        await connection.query("ROLLBACK");
        throw err;
      }
    } catch (err) {
      throw err;
    } finally {
      connection.release();
    }
    return res;
  };
};

module.exports = { pool, dbConf, initilize };
