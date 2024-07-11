const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const Visitor = require('./models/visitor'); // Import your Visitor model
// const Contractor = require('./models/Contractor'); // Import your Contractor model if needed

const colors = require("colors");
const connectDB = require("./db/connection.js");
const dotenv = require("dotenv");
dotenv.config();
connectDB();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// Define your routes
const visitorRoutes = require('./routes/visitorRoutes');
const contractorRoutes = require('./routes/contractorRoutes');

app.use('/api/visitor', visitorRoutes); // Example route setup, adjust as per your actual routes
app.use('/api/contractor',contractorRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`.yellow.bold);
});
