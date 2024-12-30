const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'stage_events',
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    process.exit(1);
  }
  console.log('Connected to MySQL');
});

// Routes


// Create a new event
app.post('/api/events', (req, res) => {
  const { name, detail, organizer } = req.body;
  const query = 'INSERT INTO stage_event (name, detail, organizer) VALUES (?, ?, ?)';
  db.query(query, [name, detail, organizer], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Event created', eventId: result.insertId });
  });
});

// Get all events
app.get('/api/events', (req, res) => {
  const query = 'SELECT * FROM stage_event';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Get a specific event
app.get('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM stage_event WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results[0]);
  });
});

// Update an event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { name, detail, organizer } = req.body;
  const query = 'UPDATE stage_event SET name = ?, detail = ?, organizer = ? WHERE id = ?';
  db.query(query, [name, detail, organizer, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Event updated' });
  });
});

// Delete an event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM stage_event WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Event deleted' });
  });
});


// Create a new show
app.post('/api/shows', (req, res) => {
  const { start_time, end_time, stage_event_id } = req.body;
  const query = 'INSERT INTO stage_event_show (start_time, end_time, stage_event_id) VALUES (?, ?, ?)';
  db.query(query, [start_time, end_time, stage_event_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Show created', showId: result.insertId });
  });
});

// Get all shows with event details
app.get('/api/shows', (req, res) => {
  const query = `
    SELECT ses.id, ses.start_time, ses.end_time, se.name AS event_name, se.detail, se.organizer
    FROM stage_event_show ses
    JOIN stage_event se ON ses.stage_event_id = se.id
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});


// Book tickets for a show
app.post('/api/tickets', (req, res) => {
  const { price, customer, no_of_seats, stage_event_show_id } = req.body;
  const query = 'INSERT INTO ticket_booking (price, customer, no_of_seats, stage_event_show_id) VALUES (?, ?, ?, ?)';
  db.query(query, [price, customer, no_of_seats, stage_event_show_id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: 'Tickets booked', bookingId: result.insertId });
  });
});

// Get booking summary for all shows
app.get('/api/tickets/summary', (req, res) => {
  const query = `
    SELECT ses.id AS show_id, se.name AS event_name, ses.start_time, ses.end_time, 
           SUM(tb.no_of_seats) AS total_tickets
    FROM stage_event_show ses
    JOIN stage_event se ON ses.stage_event_id = se.id
    LEFT JOIN ticket_booking tb ON ses.id = tb.stage_event_show_id
    GROUP BY ses.id, se.name, ses.start_time, ses.end_time
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
 