const express = require("express");
const port = 5000;
const cors = require("cors");
const connectDB = require("./Config/db");

const app = express(); 

app.use(cors({
  origin: "http://localhost:5173", // Allow all origins (temporary for debugging)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

connectDB();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use("/api", require("./Routes/LoginRoute"));
app.use("/api/form", require("./Routes/formRoute"));
app.use("/api/slider", require("./Routes/sliderRoute"));
app.use("/api/category", require("./Routes/categoryRoute"));
app.use("/api/subCategory", require("./Routes/subCategoryRoute"));
app.use("/api/product", require("./Routes/productRoute"));
app.use("/api/gallery", require("./Routes/galleryRoute"));
app.use("/api/ebrochure", require("./Routes/ebrochureRoute"));
// app.use("/api/contact", require("./Routes/sliderRoute"));

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}).catch((err) => {
  console.error("❌ Failed to connect to MongoDB:", err);
});
