import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/code", require("./routes/code-copy.ts"));
app.use("/git", require("./routes/git"));
app.use("/project", require("./routes/project"));
app.use("/server", require("./routes/server"));

app.listen(5000, () => {
  return console.log(`Express is listening at http://localhost:5000`);
});
