const express = require('express');
const cors = require('cors');

const problemsRouter = require('./routes/problems');
const userRouter = require('./routes/user');
const questRouter = require('./routes/quest');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'LeetQuest API running' });
});

app.use('/problems', problemsRouter);
app.use('/user', userRouter);
app.use('/quest', questRouter);

app.listen(PORT, () => {
  console.log(`LeetQuest API listening on http://localhost:${PORT}`);
});