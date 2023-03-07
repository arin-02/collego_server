const express = require("express");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary");
dotenv.config({ path: ".env" });
const cors = require("cors");
const Connection = require("./database/db");
const cookieParser = require("cookie-parser");
const app = express();
const Routes = require("./Routes/Auth");
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

Connection(username, password);
const PORT = process.env.PORT || 8080;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({}));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
  useTempFiles: true,
}));

app.use("/", Routes);

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
