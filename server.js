// app.js

// Import the built-in 'http' module
const http = require('http');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set the response header
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Send the response text
  res.end('Hello World\n');
});

// The server will listen on port 3000
server.listen(3000, () => {
  console.log('Server is running at http://localhost:3000');
});
