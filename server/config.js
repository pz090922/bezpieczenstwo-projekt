require("dotenv").config();

module.exports = {
  port: process.env.API_PORT || 3001,
  url: process.env.ME_CONFIG_MONGODB_SERVER || "localhost",
  password: process.env.MONGO_INITDB_ROOT_PASSWORD || "password",
  user: process.env.MONGO_INITDB_ROOT_USERNAME || "root",
};
// "mongodb://localhost:27017",
// GdnEBFUhkvGPFpbn
// database: "mongodb+srv://pzawistowski2:GdnEBFUhkvGPFpbn@cluster0.ahvzcsc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",