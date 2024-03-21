const express = require("express");
const mysql = require("mysql");
require("dotenv").config();
const cors = require("cors");
const redis = require("redis");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

const redisClient = redis.createClient({url:process.env.REDIS});

app.listen(5000, () => {
  console.log("Striver Let's Goooo! Yayaaaayyyy");
});

app.post("/submit", async (req, res) => {
  try {
    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      prefer_code_lang VARCHAR(255) NOT NULL,
      stdin TEXT NOT NULL,
      src_code TEXT NOT NULL,
      stdout TEXT,
      time DATETIME NOT NULL
    );
    `;
    await connection.query(createTableQuery);
    const inserter = `
      INSERT INTO users (username, prefer_code_lang, stdin, src_code, stdout, time)
      VALUES (?, ?, ?, ?, ?)`;
    const values = [
      req.body.username,
      req.body.lang,
      req.body.stdin,
      req.body.code,
      req.body.stdout,
      req.body.time,
    ];
    
  const result = await new Promise((resolve, reject) => {
    connection.query(`SELECT COUNT(*) AS count FROM users WHERE username = '${req.body.username}'`, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
  if(result[0].count>=1){
    return res.send({s:false,message:"Username already exists."})
  }



     await connection.query(inserter, values);
     const ok= await new Promise((resolve, reject) => {
      connection.query(`SELECT * FROM users`, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });


    await redisClient.connect();
    await redisClient.set("cachedData", JSON.stringify(ok));
    const cachedData = await redisClient.get("cachedData");
    await redisClient.quit();
    const parsedData = await JSON.parse(cachedData);
    return res.send({ s: true, parsedData });



  } catch (error) {
    await redisClient.quit();
    console.error("Error in /submit route:", error);
    return res.send({ s: false, message: error.message });
  }
});







app.get("/getsub", async (req, res) => {
  try {
    const checkTableQuery = "SHOW TABLES LIKE 'users'";
    connection.query(checkTableQuery, async (err, result) => {
      if (err) {
        console.error("Error checking table:", err);
        return res.send({ s: false });
      }
      if (result.length === 0) {
        return res.send({ s: false, message: "Table 'users' does not exist" });
      }



      await redisClient.connect();
    const cachedData = await redisClient.get("cachedData");
    await redisClient.quit();
      if(cachedData){
        const parsedData = await JSON.parse(cachedData);
         return res.send({ s: true, result:parsedData });
      }



      await connection.query("SELECT * FROM users;",async (err, result) => {
        if (err) {
          console.error("Error fetching data:", err);
          return res.send({ s: false });
        }
        await redisClient.connect();
        await redisClient.set("cachedData", JSON.stringify(ok));
        await redisClient.quit();
        return res.send({ s: true, result });
      });
    });



  } catch (error) {
    await redisClient.quit();
    console.log(error);
    return res.send({ s: false });
  }
});
