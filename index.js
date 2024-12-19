import express from 'express';
import connectToMongo from './db.js';

connectToMongo();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Available Routes
import authRoute from './routes/auth.js';
import noteRoute from './routes/notes.js';

app.use('/auth', authRoute);
app.use('/notes', noteRoute);

// Start Server
app.listen(port, () => {
  console.log(`Notebook backend listening at http://localhost:${port}`);
});
