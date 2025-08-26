

const { pgPool } = require("../pg_constant");
const argon2 = require('argon2');
const jwt = require("jsonwebtoken");
const { User, Role } = require("../models"); // adjust path
const  writeLog  = require("../utils/logger");


// module.exports.userLogin = async function userLogin(req, res) {
//     try {
//         console.log("Inside the user login function");
//         const { email, password } = req.body;

//         if (!email || !password) {
//             return res.status(400).json({ message: "Email and password are required" });
//         }

//         const userSql = `SELECT * FROM users WHERE email = $1`;
//         const { rows } = await pgPool.query(userSql, [email]);

//         if (rows.length === 0) {
//             writeLog(`Invalid email attempt: ${email}`);
//             return res.status(404).json({ message: "User not found" });
//         }

//         const user = rows[0];

//         // Compare passwords using Argon2
//         const passwordMatch = await argon2.verify(user.password, password);

//         if (!passwordMatch) {
//             return res.status(403).json({ message: "Incorrect password" });
//         }

//         // Get user's role
//         const { rows: roleRows } = await pgPool.query(
//             `SELECT r.*
//              FROM user_roles ur
//              JOIN roles r ON ur.role_id_fk = r.role_id_pk
//              WHERE ur.user_id_fk = $1`,
//             [user.user_id_pk]
//         );

//         const userRole = roleRows[0] || { role_id_pk: null, role_name: "No Role" };

//         // Remove sensitive data before sending
//         delete user.password;

//         const payload = {
//             id: user.user_id_pk,
//             email: user.email,
//             username: user.username,
//             role: userRole.role_id_pk
//         };

//         // console.log("payload", payload);

//         const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

//         // Store session
//         req.session.user = payload;

//         writeLog(`User logged in: ${email}`);

//         return res.status(200).json({
//             message: `${user.username} logged in successfully`,
//             token,
//             userrole: userRole,
//             redirect: req.headers.host.includes("localhost")
//                 ? "http://localhost:8001"
//                 : "https://eapp.rbpu.in/"
//         });

//     } catch (err) {
//         console.error("Login error:", err.message);
//         writeLog(`User logged in server error: ${err.message}`);
//         return res.status(500).json({
//             message: "Server error",
//             error: err.message
//         });
//     }
// };

module.exports.userLogin = async function userLogin(req, res) {
  try {
    console.log("Inside the user login function");
    const { email, password } = req.body;
console.log(email,password);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user with roles (eager loading through user_roles)
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          through: { attributes: [] }, // exclude junction table fields
        },
      ],
    });

    if (!user) {
      // writeLog(`Invalid email attempt: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const passwordMatch = await argon2.verify(user.password, password);

    if (!passwordMatch) {
      return res.status(403).json({ message: "Incorrect password" });
    }

    // Pick the first role (or fallback)
    const userRole = user.Roles?.[0] || { role_id_pk: null, name: "No Role" };

    // Remove sensitive data
    const userData = user.toJSON();
    delete userData.password;

    const payload = {
      id: user.user_id_pk,
      email: user.email,
      username: user.username || user.first_name, // adjust as per your schema
      role: userRole.role_id_pk,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Store session (in user_sessions via express-session)
    req.session.user = payload;

    // writeLog(`User logged in: ${email}`);

    return res.status(200).json({
      message: `${payload.username} logged in successfully`,
      token,
      userrole: userRole,
      redirect: req.headers.host.includes("localhost")
        ? "http://localhost:8000"
        : "https://eapp.rbpu.in/",
    });
  } catch (err) {
    console.error("Login error:", err.message);
    // writeLog(`User logged in server error: ${err.message}`);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
