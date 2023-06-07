const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());
const port = 3000;
app.use(express.static('public'));
app.use(express.json());

const path = require('path');
const filePath = path.join(__dirname, 'log.txt'); // Define the file path relative to the current module's directory

// Create the log file if it's missing
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '', 'utf8');
}

app.post('/addLog', (req, res) => {
  const { answers, key } = req.body;
  const timestamp = Date.now();
  let log;

  if (key) {
    log = `key,${key},${timestamp}\n`;
  } else {
    log = `match,${answers},${timestamp}\n`;
  }

  // Append the log to the text file
  fs.appendFile(filePath, log, 'utf8', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error adding log to file');
    } else {
      console.log('Log added to file:', log); // Print the log message to the terminal
      res.send(log); // Send the log message as the response
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});