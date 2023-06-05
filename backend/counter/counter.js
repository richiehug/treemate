const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/pushData', (req, res) => {
  const timestamp = Date.now();
  const filePath = 'counter.txt';

  // Append the line and timestamp to the text file
  fs.appendFile(filePath, timestamp + '\n', 'utf8', (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error pushing data to file');
    } else {
      console.log('Data pushed to file');
      res.sendStatus(200);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});