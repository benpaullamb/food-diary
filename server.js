const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const getFilename = require('./src/utils');

app.use(express.static('dist'));
app.use(express.json());

const foodDiaryDir = 'C:\\Users\\benpa\\Desktop\\Food Diary Logs';

app.post('/food-diary', (req, res) => {
  const filename = getFilename(req.body);
  const filePath = path.join(foodDiaryDir, filename);

  console.log('Writing', req.body, 'to', filePath);

  fs.writeFileSync(filePath, JSON.stringify(req.body));

  res.sendStatus(200);
});

app.get('/food-diary', (req, res) => {
  const entryFilenames = fs.readdirSync(foodDiaryDir);

  const entries = entryFilenames.map((entryFilename) => {
    const filePath = path.join(foodDiaryDir, entryFilename);
    const json = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(json);
  });

  res.json(entries);
});

app.listen(80, () => {
  console.log('http://localhost');
});
