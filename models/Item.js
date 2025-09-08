import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String
});

export default mongoose.model("Item", itemSchema);
