const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Use Thin Mode (No Oracle Instant Client required)
oracledb.initOracleClient({});
console.log("✅ Using Thin Mode for Oracle 11g XE!");

const dbConfig = {
    user: process.env.DB_USER || "your_db_user",
    password: process.env.DB_PASSWORD || "your_db_password",
    connectString: process.env.DB_HOST || "localhost/XE"
};

// Function to execute queries
async function runQuery(query, params = [], isWrite = false) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (isWrite) await connection.commit(); // Commit changes for write operations

        return result.rows;
    } catch (err) {
        console.error("❌ Database Error:", err);
        return { error: err.message };
    } finally {
        if (connection) await connection.close();
    }
}

// ✅ Test database connection on startup
(async () => {
    try {
        const conn = await oracledb.getConnection(dbConfig);
        console.log("✅ Successfully connected to Oracle 11g XE!");
        await conn.close();
    } catch (err) {
        console.error("❌ Connection failed:", err);
        process.exit(1);
    }
})();

// API to fetch users
app.get("/users", async (req, res) => {
    const data = await runQuery("SELECT * FROM USERS"); 
    res.json(data);
});

// API to insert a new user
app.post("/users", async (req, res) => {
    const { id, name, email } = req.body;
    if (!id || !name || !email) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const query = "INSERT INTO users (id, name, email) VALUES (:1, :2, :3)";
    const result = await runQuery(query, [id, name, email], true);
    
    if (result.error) {
        return res.status(500).json(result);
    }
    
    res.json({ success: "User added successfully" });
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
