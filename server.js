const express = require("express");
const cors = require("cors");
const employeeRoutes = require("./routes/employeeRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        origin.startsWith("chrome-extension://") ||
        origin === "https://attandance-backend-r6cc.onrender.com"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api", employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
