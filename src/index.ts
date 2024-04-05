import express from 'express';
import * as fs from 'fs';
const { exec } = require('child_process');
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function buildDockerImage() {
  return new Promise((resolve, reject) => {
    const dockerCommand = 'docker build -t my-python-app ./dock/python';
    exec(dockerCommand, (error:any, stdout:any, stderr:any) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

function runImage(){
  return new Promise((resolve, reject) => {
    const dockerRunCommand="docker run my-python-app"
    exec(dockerRunCommand, (error:any, stdout:any, stderr:any) => {
      clearTimeout(3000);//will work for 3 seconds only.
      if (error) {
        reject({error,stderr});
        return;
      }
      resolve(stdout);
    })
  });
}
app.post('/runcode', async (req, res) => {
  const pythonCode ="print('Hello')";
  fs.writeFileSync('./dock/python/main.py', pythonCode);
  try {
  await buildDockerImage();
  } catch (error) {
    return res.send({success:0, message:"Failure in compiling the code, please try again later."})  
  }
try {
  const Runner= await runImage();
  return res.send({success:1,stdout:Runner});
} catch (error:any) {
  const err=error.stderr.slice(31);
  return res.send({success:0,stderr:err});
}
 
});

app.listen(5000, () => {
  return console.log(`Express is listening at http://localhost:5000`);
});