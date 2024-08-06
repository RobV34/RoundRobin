const express = require('express');
const path = require('path');
const app = express();
const scheduleRouter = require('./routes/schedule');

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded bodies and JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Home route - Renders the main interface (should come before static file serving)
app.get('/', (req, res) => {
  res.render('layout'); // This should render layout.ejs
});

// Schedule route - Handles schedule generation
app.use('/schedule', scheduleRouter);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Remove the explicit route for index.html if it exists
// app.get('/index.html', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});







