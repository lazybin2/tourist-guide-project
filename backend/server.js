require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

//initDB tables
require('./config/initDb');

//Routes Registration 
app.use("/api/auth", require("./routes/auth"));
app.use("/api/guide", require("./routes/guide"));
app.use("/api/places", require("./routes/place")); 
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/traveler", require("./routes/traveler"));



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});