
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
    const { id, name, email, password, role = "user" } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    
    const query = "INSERT INTO users (name, email, password, role) VALUES (:1, :2, :3, :4)";
    const result = await runQuery(query, [name, email, password, role], true);
    
    if (result.error) {
        return res.status(500).json(result);
    }
    
    res.json({ success: "User added successfully" });
});

// API for user login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    
    const query = "SELECT * FROM users WHERE email = :1";
    const users = await runQuery(query, [email]);
    
    if (users.length === 0 || users.error) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = users[0];
    
    // In a real app, use bcrypt to compare hashed passwords
    if (user.PASSWORD !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // In a real app, generate a JWT token
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

// API to fetch events
app.get("/events", async (req, res) => {
    const data = await runQuery("SELECT * FROM EVENTS ORDER BY EVENT_DATE"); 
    res.json(data);
});

// API to fetch event by ID
app.get("/events/:id", async (req, res) => {
    const { id } = req.params;
    const data = await runQuery("SELECT * FROM EVENTS WHERE ID = :1", [id]);
    
    if (data.length === 0) {
        return res.status(404).json({ error: "Event not found" });
    }
    
    res.json(data[0]);
});

// API to create a new event
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
        )`;
    
    const params = [
        title, description, image_url, event_date, time_start, time_end,
        location, category, price, total_tickets, created_by
    ];
    
    const result = await runQuery(query, params, true);
    
    if (result.error) {
        return res.status(500).json(result);
    }
    
    res.json({ success: "Event created successfully" });
});

// API to submit a pending event request
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
        )`;
    
    const params = [
        title, description, image_url, event_date, time_start, time_end,
        location, category, price, total_tickets, requester_id
    ];
    
    const result = await runQuery(query, params, true);
    
    if (result.error) {
        return res.status(500).json(result);
    }
    
    res.json({ 
        success: true,
        message: "Event request submitted successfully and pending approval" 
    });
});

// API to fetch pending events
app.get("/pending-events", async (req, res) => {
    const data = await runQuery(`
        SELECT pe.*, u.NAME as requester_name 
        FROM PENDING_EVENTS pe
        JOIN USERS u ON pe.requester_id = u.id
        ORDER BY pe.created_at DESC
    `); 
    res.json(data);
});

// API to approve or reject a pending event
app.put("/pending-events/:id", async (req, res) => {
    const { id } = req.params;
    const { status, admin_notes } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
    }
    
    const query = `
        UPDATE pending_events 
        SET status = :1, admin_notes = :2 
        WHERE id = :3
    `;
    
    const result = await runQuery(query, [status, admin_notes, id], true);
    
    if (result.error) {
        return res.status(500).json(result);
    }
    
    // If approved, create the event
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
                )`;
            
            const createParams = [
                event.TITLE, event.DESCRIPTION, event.IMAGE_URL, event.EVENT_DATE,
                event.TIME_START, event.TIME_END, event.LOCATION, event.CATEGORY,
                event.PRICE, event.TOTAL_TICKETS, event.REQUESTER_ID
            ];
            
            await runQuery(createEventQuery, createParams, true);
        }
    }
    
    res.json({ 
        success: true,
        message: `Event request ${status}` 
    });
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
