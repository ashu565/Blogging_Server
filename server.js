const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({
  path: "./config.env",
});

const app = require("./app");
const port = process.env.PORT | 3000;

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
  })
  .then((con) => {
    // console.log(con.connection);
    console.log("DB connection success");
  });

app.listen(port, () => {
  console.log(`app running on port ${port}`);
});
