import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{ id: String, name: String, price: Number, category: String }]
});

export default mongoose.model("Cart", cartSchema);
