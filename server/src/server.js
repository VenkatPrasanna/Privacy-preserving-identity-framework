const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 7000;
const MONGO_URL = "mongodb://myapp_db:27017";
//const MONGO_URL = "mongodb://127.0.0.1:27017";
//app.set("port", PORT);
const server = http.createServer(app);

mongoose.connection.once("open", () => {
  console.log("Database connection is established");
});

mongoose.connection.on("error", () => {
  console.error("Database connection error");
});

async function startServer() {
  await mongoose.connect(MONGO_URL);
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
