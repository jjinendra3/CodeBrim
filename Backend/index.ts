import express from "express";
import cors from "cors";
import { Server } from "socket.io";

const http = require("http");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/code", require("./routes/code.ts"));
app.use("/git", require("./routes/git"));
app.use("/project", require("./routes/project"));
app.use("/server", require("./routes/server"));

server.listen(5000, () => {
  console.log(`Server running on http://localhost:${5000}`);
});

io.on("connection", socket => {
  console.log("Client connected:", socket.id);
});

export { io };
