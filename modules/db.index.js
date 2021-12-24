const dbConf =  require('./db.config.js').dbConf
const { Pool } = require('pg')
const dbNum = dbConf.length
let pool = []
for (let i = 0; i < dbNum; i ++) {
    pool[i] = new Pool(dbConf[i])
}
initilize = (index, conf) => {
    pool[index] = new Pool(conf)
}


module.exports = { pool, dbConf, initilize }