const express = require("express");
const morgan = require("morgan");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const blogRoute = require("./routes/blogRoutes");
const AppError = require("./utils/AppError");
const globalErrorHandler = require("./utils/globalErrorHandler");
const cors = require("cors");
const app = express();

//parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// allow other request to get access
app.use(cors());

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/auth", userRoute);
app.use("/api/v1/blog", blogRoute);

app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`), 404);
});
app.use(globalErrorHandler);

module.exports = app;
