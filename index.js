

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
 // For hashing passwords (optional, but recommended)
 const bcrypt = require('bcrypt');  // For hashing passwords (optional, but recommended)

const app = express();
app.use(bodyParser.json()); // Parse application/json
app.use(bodyParser.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded

const db = mysql.createConnection({
    host: 'localhost',          // Replace with your host name
    user: 'root',               // Replace with your database username
    password: 'password',       // Replace with your database password
    database: 'RMT_PORTAL',     // Replace with your database name
    // Increase timeout to 20 seconds (20000 milliseconds)
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        console.error('Error details:', {
            code: err.code,
            errno: err.errno,
            syscall: err.syscall,
            address: err.address,
            port: err.port
        });
        return;
    }
    console.log('Connected to MySQL database');
});

// Posts API
app.get('/', function(req, res) {
    db.query("SELECT * FROM post ORDER BY postid DESC LIMIT 50", (err, results) => {
        if (err) {
            console.error("Error fetching posts:", err);
            res.status(500).send("Error fetching posts");
            return;
        }
        res.json(results);
    });
});

// User creation API
app.post('/user_creation', async (req, res) => {
    const { username, password, displayname, email, mobileno, roleid, rss_access, status } = req.body;

    // Hash the password before storing it (optional but recommended)
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
        INSERT INTO users (username, password, displayname, email, mobileno, roleid, rss_access, created_at, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;
  
    const values = [username, hashedPassword, displayname, email, mobileno, roleid, rss_access, status];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.status(201).json({ message: 'User Created successfully' });
    });
});

// Create post API
app.post('/create_post', (req, res) => {
    const {
        categoryid, guid, posttitle, description, postintro, Author, publishedon, keywords, imagepath,
        rssid, hitcount, trending_now, hot_content, status, schedule, schedule_date, noti_input,
        created_at, published_date, updated_at, uploaded_by, hashtag, language, writer, posturltitle, postlink
    } = req.body;

    const query = `
        INSERT INTO post (categoryid, guid, posttitle, description, postintro, Author, publishedon, keywords, imagepath,
        rssid, hitcount, trending_now, hot_content, status, schedule, schedule_date, noti_input,
        created_at, published_date, updated_at, uploaded_by, hashtag, language, writer, posturltitle, postlink)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        categoryid, guid, posttitle, description, postintro, Author, publishedon, keywords, imagepath,
        rssid, hitcount, trending_now, hot_content, status, schedule, schedule_date, noti_input,
        created_at, published_date, updated_at, uploaded_by, hashtag, language, writer, posturltitle, postlink
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        res.status(201).json({ status:'201', message: 'Post Created successfully' });
    });
});

// Login API
// const bcrypt = require('bcrypt'); // Ensure bcrypt is required at the top

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log(`Received login request for username: ${username}`);

    const query = 'SELECT * FROM users WHERE username = ?';

    db.query(query, [username], (err, results) => {
        if (err) {
            console.error('Error executing query', err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        console.log(`Query results: ${JSON.stringify(results)}`);

        if (results.length === 0) {
            console.warn(`No user found with username: ${username}`);
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const user = results[0];

        console.log(`Stored password for user: ${user.password}`);
        console.log(`Provided password: ${password}`);

        if (password !== user.password) {
            console.warn(`Password mismatch for username: ${username}`);
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        // Successful login
        res.status(200).json({  status :'200', message: 'Login successful' });
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`); // Log a message when the server starts
});
