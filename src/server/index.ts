import express from 'express';

const app = express();
const port = 3001;

app.use(express.json());

// A simple endpoint to check if the server is running
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the local Node.js server!' });
});

app.listen(port, () => {
  console.log(`🚀 Local server listening at http://localhost:${port}`);
});
