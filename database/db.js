const mongoose = require("mongoose");


const dbConnect = (username,password) => {
  const DB_URL =`mongodb+srv://${username}:${password}@cluster0.gwz9r3w.mongodb.net/Cluster0?retryWrites=true&w=majority`
  mongoose.connect(DB_URL);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error"));
  db.once("open", () => {
    console.log("DB connected...");
  });
};

module.exports = dbConnect;
