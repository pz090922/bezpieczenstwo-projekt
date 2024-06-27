const mongoose = require("mongoose");
const { url, password, user, database } = require("../config");
// const database = `mongodb://${user}:${password}@${url}:27017`
mongoose.connect(database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    console.log(database)
    await mongoose.connect(database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to database");
  } catch (err) {
    console.error(err);
  }
}

run();