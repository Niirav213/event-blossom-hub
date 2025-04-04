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

// Utility: Run SQL query
async function runQuery(query, params = [], isWrite = false) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
        if (isWrite) await connection.commit();
        return result.rows;
    } catch (err) {
        console.error("❌ Database Error:", err);
        return { error: err.message };
    } finally {
        if (connection) await connection.close();
    }
}

// Test DB connection on server start
(async () => {
    try {
        const conn = await oracledb.getConnection(dbConfig);
        console.log("✅ Connected to Oracle 11g XE!");
        await conn.close();
    } catch (err) {
        console.error("❌ Connection failed:", err);
        process.exit(1);
    }
})();

/* ---------- USER ROUTES ---------- */

// Fetch all users
app.get("/users", async (req, res) => {
    const data = await runQuery("SELECT * FROM USERS");
    res.json(data);
});

// Register user
app.post("/api/auth/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const result = await runQuery(
            `INSERT INTO users (name, email, password, role, email_verified) 
             VALUES (:name, :email, :password, 'user', 0)`,
            { name, email, password },
            true
        );
        res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
        res.status(500).json({ error: "Registration failed." });
    }
});

// Login user
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const query = "SELECT * FROM users WHERE email = :1";
    const users = await runQuery(query, [email]);

    if (users.length === 0 || users.error || users[0].PASSWORD !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    res.json({
        success: true,
        user: {
            id: user.ID,
            name: user.NAME,
            email: user.EMAIL,
            role: user.ROLE
        }
    });
});

/* ---------- EVENTS ---------- */

// Fetch all events
app.get("/events", async (req, res) => {
    const data = await runQuery("SELECT * FROM EVENTS ORDER BY EVENT_DATE");
    res.json(data);
});

// Fetch event by ID
app.get("/api/events", async (req, res) => {
    const data = await runQuery("SELECT * FROM EVENTS WHERE ID = :1", [req.params.id]);
    if (data.length === 0) return res.status(404).json({ error: "Event not found" });
    res.json(data[0]);
});

// Create new event (admin only)
app.post("/events", async (req, res) => {
    const {
        title, description, image_url, event_date, time_start, time_end,
        location, category, price, total_tickets, created_by
    } = req.body;

    if (!title || !event_date || !time_start || !time_end || !location || !created_by) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        INSERT INTO events (
            title, description, image_url, event_date, time_start, time_end,
            location, category, price, total_tickets, created_by
        ) VALUES (
            :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'),
            TO_TIMESTAMP(:5, 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(:6, 'YYYY-MM-DD HH24:MI:SS'),
            :7, :8, :9, :10, :11
        )
    `;
    const params = [
        title, description, image_url, event_date, time_start, time_end,
        location, category, price, total_tickets, created_by
    ];

    const result = await runQuery(query, params, true);
    res.json(result.error ? result : { success: "Event created successfully" });
});

/* ---------- PENDING EVENTS ---------- */

// Submit request for new event
app.post("/events/request", async (req, res) => {
    const {
        title, description, image_url, event_date, time_start, time_end,
        location, category, price, total_tickets, requester_id
    } = req.body;

    if (!title || !event_date || !location || !requester_id) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
        INSERT INTO pending_events (
            title, description, image_url, event_date, time_start, time_end,
            location, category, price, total_tickets, requester_id, status
        ) VALUES (
            :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'),
            TO_TIMESTAMP(:5, 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP(:6, 'YYYY-MM-DD HH24:MI:SS'),
            :7, :8, :9, :10, :11, 'pending'
        )
    `;
    const params = [
        title, description, image_url, event_date, time_start, time_end,
        location, category, price, total_tickets, requester_id
    ];

    const result = await runQuery(query, params, true);
    res.json(result.error ? result : {
        success: true,
        message: "Event request submitted and pending approval"
    });
});

// Get all pending event requests
app.get("/pending-events", async (req, res) => {
    const data = await runQuery(`
        SELECT pe.*, u.NAME AS requester_name 
        FROM PENDING_EVENTS pe
        JOIN USERS u ON pe.requester_id = u.id
        ORDER BY pe.created_at DESC
    `);
    res.json(data);
});

// Approve or reject a pending event
app.put("/pending-events/:id", async (req, res) => {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }

    const updateQuery = `
        UPDATE pending_events 
        SET status = :1, admin_notes = :2 
        WHERE id = :3
    `;
    const result = await runQuery(updateQuery, [status, admin_notes, id], true);
    if (result.error) return res.status(500).json(result);

    if (status === 'approved') {
        const pendingEventData = await runQuery("SELECT * FROM pending_events WHERE id = :1", [id]);
        if (pendingEventData.length > 0) {
            const event = pendingEventData[0];
            const createEventQuery = `
                INSERT INTO events (
                    title, description, image_url, event_date, time_start, time_end,
                    location, category, price, total_tickets, created_by
                ) VALUES (
                    :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11
                )
            `;
            const createParams = [
                event.TITLE, event.DESCRIPTION, event.IMAGE_URL, event.EVENT_DATE,
                event.TIME_START, event.TIME_END, event.LOCATION, event.CATEGORY,
                event.PRICE, event.TOTAL_TICKETS, event.REQUESTER_ID
            ];
            await runQuery(createEventQuery, createParams, true);
        }
    }

    res.json({ success: true, message: `Event request ${status}` });
});

/* ---------- TOKENS ---------- */

// Add refresh token
app.post("/tokens/refresh", async (req, res) => {
    const { user_id, token, expires_at } = req.body;
    if (!user_id || !token || !expires_at) return res.status(400).json({ error: "Missing fields" });

    const query = `
        INSERT INTO refresh_tokens (user_id, token, expires_at)
        VALUES (:1, :2, TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS'))
    `;
    const result = await runQuery(query, [user_id, token, expires_at], true);
    res.json(result.error ? result : { success: "Refresh token added" });
});

// Password reset token
app.post("/tokens/reset", async (req, res) => {
    const { user_id, token, expires_at } = req.body;
    if (!user_id || !token || !expires_at) return res.status(400).json({ error: "Missing fields" });

    const query = `
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (:1, :2, TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS'))
    `;
    const result = await runQuery(query, [user_id, token, expires_at], true);
    res.json(result.error ? result : { success: "Reset token created" });
});

// Email verification token
app.post("/tokens/verify", async (req, res) => {
    const { user_id, token, expires_at } = req.body;
    if (!user_id || !token || !expires_at) return res.status(400).json({ error: "Missing fields" });

    const query = `
        INSERT INTO email_verification_tokens (user_id, token, expires_at)
        VALUES (:1, :2, TO_TIMESTAMP(:3, 'YYYY-MM-DD HH24:MI:SS'))
    `;
    const result = await runQuery(query, [user_id, token, expires_at], true);
    res.json(result.error ? result : { success: "Verification token created" });
});

/* ---------- TICKETS ---------- */

// Book ticket
app.post("/tickets", async (req, res) => {
    const { event_id, user_id, quantity = 1, status = 'booked' } = req.body;
    if (!event_id || !user_id) return res.status(400).json({ error: "Missing event_id or user_id" });

    const query = `
        INSERT INTO tickets (event_id, user_id, quantity, status)
        VALUES (:1, :2, :3, :4)
    `;
    const result = await runQuery(query, [event_id, user_id, quantity, status], true);
    res.json(result.error ? result : { success: "Ticket booked" });
});

// Get tickets by user
app.get("/tickets/user/:id", async (req, res) => {
    const query = `
        SELECT t.*, e.title AS event_title
        FROM tickets t
        JOIN events e ON t.event_id = e.id
        WHERE t.user_id = :1
        ORDER BY t.purchase_date DESC
    `;
    const data = await runQuery(query, [req.params.id]);
    res.json(data);
});

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
