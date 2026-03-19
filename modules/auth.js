const db = require("../db");

async function login(username,password){

    const [rows] = await db.execute(
        `SELECT id,username,role
         FROM users
         WHERE username = ? AND password = ?`,
        [username,password]
    );

    if(rows.length === 0){
        return null;
    }

    return rows[0];

}

async function getStaff(){
    const [rows] = await db.execute(`
        SELECT id, username FROM users
    `);

    return rows;
}

module.exports = { login,getStaff };