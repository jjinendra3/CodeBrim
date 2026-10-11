import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";

// Log stray errors instead of letting one bad request take the whole app down.
process.on("unhandledRejection", err => {
  console.error("Unhandled rejection:", err);
});
process.on("uncaughtException", err => {
  console.error("Uncaught exception:", err);
});

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

server.listen(5000, () => {
  console.log(`Server running on http://localhost:${5000}`);
});

io.on("connection", socket => {
  console.log("Client connected:", socket.id);
});

export { io };
