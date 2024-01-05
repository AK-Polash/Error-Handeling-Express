require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const _ = require("./routes");
const dbConfig = require("./config/dbConfig");
const PORT = process.env.PORT || 5000;

dbConfig();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
  })
);

app.use(_);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something Went Wrong!");
});

app.listen(PORT, () => console.log(`PORT IS RUNNING ON ${PORT}`));
