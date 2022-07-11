const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const api = require("./routes/api");
const { getAllKeys, addNewKey } = require("./models/key.model");

// Set whitelisted servers to avoid CORS issues
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

// app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", api);

app.get("/api/keybyid", async (req, res) => {
  console.log(req);
});
// app.get("/*", (req, res) => {
//   //res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
//   //console.log(path.join(__dirname, ".."));
//   res.sendFile(
//     path.join(__dirname, "..", "..", "ui", "ui", "src", "index.html")
//   );
// });

// app.get("/key", async (req, res) => {
//   const key = await generateKey();
//   res.json(key);
// });

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

module.exports = app;
