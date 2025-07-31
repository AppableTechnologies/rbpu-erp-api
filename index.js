// const appRouter = require("./routers/app_router");
// const cookieParser = require("cookie-parser");

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // ✅ Serve static files for resumes
// app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// const allowedOrigins = [
//     "http://localhost:3000",
//     "http://localhost:8000",
//     // "https://login.rbuchd.in",
//     // "https://rbuchd.in",
//     process.env.BASE_URL,
// ].filter(Boolean);

// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error("Not allowed by CORS"));
//         }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
// }))

// app.use((req, res, next) => {
//     console.log(`👉 ${req.method} ${req.url}`);
//     console.log("📝 Body received:", req.body);
//     next();
// });

// app.use(appRouter);

// app.get("/", (req, res) => {
//     res.send("Hello World from RBPU Erp !");
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// })


require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const pgSession = require("connect-pg-simple")(session);
const { pgPool } = require("./pg_constant.js");
const cors = require("cors"); // Import CORS

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

const PORT = process.env.PORT || 8000;
const appRouter = require("./routers/app_router.js");
const sequelize = require("./pg_constant.js");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8000",
  process.env.BASE_URL,
].filter(Boolean);

app.use("/public", express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Session Middleware with Security Improvements
app.use(
  session({
    store: new pgSession({
      pool: pgPool, // your PostgreSQL connection pool
      tableName: "user_sessions", // your existing table
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key", 
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      httpOnly: true, // Prevents client-side scripts from accessing the cookie
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    },
  })
);

if (process.env.NODE_ENV !== "production") {
  sequelize
    .authenticate()
    .then(() => {
      console.log("✅ Database connected");
      return sequelize.sync(); // optional in dev
    })
    .then(() => {
      console.log("✅ Models synced");
      // start your Express server here
    })
    .catch((err) => {
      console.error("❌ Error connecting to the database:", err);
    });
}

app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  console.log("📝 Body received:", req.body);
  next();
});

app.use(appRouter);
app.get("/", (req, res) => res.send("✅ Working"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
