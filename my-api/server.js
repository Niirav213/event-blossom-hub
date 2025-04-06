
const express = require("express");
const cors = require("cors");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oracledb = require("oracledb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// ✅ Use Thin Mode (No Oracle Instant Client required)
try {
    oracledb.initOracleClient({});
    console.log("✅ Using Thin Mode for Oracle 11g XE!");
} catch (err) {
    console.error("Oracle initialization error:", err);
}

const dbConfig = {
    user: process.env.DB_USER || "system",
    password: process.env.DB_PASSWORD || "admin123",
    connectString: process.env.DB_HOST || "localhost/XE"
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'Access denied' });
    
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// Admin middleware
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }
    next();
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

// Test the connection
(async () => {
    try {
        const conn = await oracledb.getConnection(dbConfig);
        console.log('✅ Connected to Oracle 11g XE!');
        await conn.close();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    }
})();

// Root endpoint
app.get('/', (req, res) => {
    res.send('College Events API is running');
});

/* ---------- USER ROUTES ---------- */

// Fetch all users
app.get("/users", async (req, res) => {
    const data = await runQuery("SELECT * FROM USERS");
    res.json(data);
});

// Register user
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: "All fields are required." });
        }
        
        // Check if user already exists
        const existingUsers = await runQuery("SELECT * FROM users WHERE email = :1", [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ error: "User already exists with this email" });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Insert new user
        await runQuery(
            `INSERT INTO users (name, email, password, role, email_verified) 
             VALUES (:1, :2, :3, :4, 0)`,
            [name, email, hashedPassword, role],
            true
        );
        
        // Get the newly created user
        const newUsers = await runQuery("SELECT * FROM users WHERE email = :1", [email]);
        if (newUsers.length === 0) {
            return res.status(500).json({ error: "Failed to retrieve user after registration" });
        }
        
        const user = newUsers[0];
        
        // Create JWT token
        const token = jwt.sign(
            { id: user.ID, email: user.EMAIL, role: user.ROLE },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ 
            user: { 
                id: user.ID, 
                name: user.NAME, 
                email: user.EMAIL, 
                role: user.ROLE 
            }, 
            token 
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed." });
    }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password required" });
        }
        
        // Find user
        const users = await runQuery("SELECT * FROM users WHERE email = :1", [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        
        const user = users[0];
        
        // Compare passwords - first check if it's a bcrypt hash
        let validPassword = false;
        if (user.PASSWORD.startsWith('$2')) {
            // It's a bcrypt hash, use bcrypt.compare
            validPassword = await bcrypt.compare(password, user.PASSWORD);
        } else {
            // It's a plain text password (for migration)
            validPassword = (user.PASSWORD === password);
        }
        
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }
        
        // Create token
        const token = jwt.sign(
            { id: user.ID, email: user.EMAIL, role: user.ROLE },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            user: { 
                id: user.ID, 
                name: user.NAME, 
                email: user.EMAIL, 
                role: user.ROLE 
            }, 
            token 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Login failed" });
    }
});

/* ---------- EVENTS ---------- */

// Fetch all events
app.get("/api/events", async (req, res) => {
    try {
        const { category } = req.query;
        
        let query = "SELECT * FROM EVENTS";
        const params = [];
        
        if (category) {
            query += " WHERE category = :1";
            params.push(category);
        }
        
        query += " ORDER BY EVENT_DATE";
        
        const data = await runQuery(query, params);
        res.json(data);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Failed to fetch events" });
    }
});

// Fetch event by ID
app.get("/api/events/:id", async (req, res) => {
    try {
        const data = await runQuery("SELECT * FROM EVENTS WHERE ID = :1", [req.params.id]);
        if (data.length === 0) return res.status(404).json({ error: "Event not found" });
        res.json(data[0]);
    } catch (error) {
        console.error("Error fetching event:", error);
        res.status(500).json({ error: "Failed to fetch event" });
    }
});

// Create new event
app.post("/api/events", authenticateToken, async (req, res) => {
    try {
        const {
            title, description, image_url, date, time_start, time_end,
            location, category, price, total_tickets
        } = req.body;
        
        if (!title || !date || !time_start || !time_end || !location) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        
        // If user is not an admin, create a pending event request
        if (req.user.role !== 'admin') {
            await runQuery(
                `INSERT INTO pending_events (
                    title, description, image_url, event_date, time_start, time_end,
                    location, category, price, total_tickets, requester_id, status
                ) VALUES (
                    :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'),
                    :5, :6, :7, :8, :9, :10, :11, 'pending'
                )`,
                [title, description, image_url, date, time_start, time_end,
                location, category, price, total_tickets, req.user.id],
                true
            );
            
            return res.status(201).json({ 
                message: "Event request submitted successfully and is pending approval"
            });
        }
        
        // Admin direct event creation
        await runQuery(
            `INSERT INTO events (
                title, description, image_url, event_date, time_start, time_end,
                location, category, price, total_tickets, available_tickets, created_by
            ) VALUES (
                :1, :2, :3, TO_DATE(:4, 'YYYY-MM-DD'),
                :5, :6, :7, :8, :9, :10, :11, :12
            )`,
            [title, description, image_url, date, time_start, time_end,
            location, category, price, total_tickets, total_tickets, req.user.id],
            true
        );
        
        res.status(201).json({ message: "Event created successfully" });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ error: "Failed to create event" });
    }
});

/* ---------- PENDING EVENTS ---------- */

// Get all pending event requests
app.get("/api/pending-events", authenticateToken, isAdmin, async (req, res) => {
    try {
        const data = await runQuery(`
            SELECT pe.*, u.NAME AS requester_name 
            FROM PENDING_EVENTS pe
            JOIN USERS u ON pe.requester_id = u.id
            ORDER BY pe.created_at DESC
        `);
        res.json(data);
    } catch (error) {
        console.error("Error fetching pending events:", error);
        res.status(500).json({ error: "Failed to fetch pending events" });
    }
});

// Approve or reject a pending event
app.put("/api/pending-events/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_notes } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        await runQuery(
            `UPDATE pending_events 
            SET status = :1, admin_notes = :2 
            WHERE id = :3`,
            [status, admin_notes, id],
            true
        );

        if (status === 'approved') {
            const pendingEventData = await runQuery("SELECT * FROM pending_events WHERE id = :1", [id]);
            if (pendingEventData.length > 0) {
                const event = pendingEventData[0];
                await runQuery(
                    `INSERT INTO events (
                        title, description, image_url, event_date, time_start, time_end,
                        location, category, price, total_tickets, available_tickets, created_by
                    ) VALUES (
                        :1, :2, :3, :4, :5, :6, :7, :8, :9, :10, :11, :12
                    )`,
                    [event.TITLE, event.DESCRIPTION, event.IMAGE_URL, event.EVENT_DATE,
                    event.TIME_START, event.TIME_END, event.LOCATION, event.CATEGORY,
                    event.PRICE, event.TOTAL_TICKETS, event.TOTAL_TICKETS, event.REQUESTER_ID],
                    true
                );
            }
        }

        res.json({ success: true, message: `Event request ${status}` });
    } catch (error) {
        console.error("Error updating pending event:", error);
        res.status(500).json({ error: "Failed to update pending event" });
    }
});

/* ---------- TICKETS ---------- */

// Book ticket
app.post("/api/tickets", authenticateToken, async (req, res) => {
    try {
        const { event_id, quantity = 1 } = req.body;
        
        if (!event_id) {
            return res.status(400).json({ error: "Missing event_id" });
        }
        
        // Check if event exists and has available tickets
        const events = await runQuery(
            "SELECT * FROM events WHERE id = :1 AND total_tickets > 0",
            [event_id]
        );
        
        if (events.length === 0) {
            return res.status(400).json({ error: "Event not found or no tickets available" });
        }
        
        // Generate unique ticket code
        const ticketCode = `TCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Create ticket
        await runQuery(
            `INSERT INTO tickets (event_id, user_id, ticket_code, quantity, status)
            VALUES (:1, :2, :3, :4, 'confirmed')`,
            [event_id, req.user.id, ticketCode, quantity],
            true
        );
        
        // Update available tickets
        await runQuery(
            "UPDATE events SET total_tickets = total_tickets - :1 WHERE id = :2",
            [quantity, event_id],
            true
        );
        
        res.status(201).json({ 
            success: true,
            message: "Ticket purchased successfully", 
            ticket_code: ticketCode 
        });
    } catch (error) {
        console.error("Error purchasing ticket:", error);
        res.status(500).json({ error: "Failed to purchase ticket" });
    }
});

// Get user tickets
app.get("/api/tickets/my", authenticateToken, async (req, res) => {
    try {
        const tickets = await runQuery(
            `SELECT t.*, e.title as event_title, e.event_date, e.time_start, e.location, e.image_url
            FROM tickets t
            JOIN events e ON t.event_id = e.id
            WHERE t.user_id = :1
            ORDER BY t.purchase_date DESC`,
            [req.user.id]
        );
        
        res.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "Failed to fetch tickets" });
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
