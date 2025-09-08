// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Item from "./models/Item.js";
import Cart from "./models/Cart.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// ✅ Proper CORS setup
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// 🔹 Auth middleware
function authenticate(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Token missing" });

  jwt.verify(token.split(" ")[1], JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// 🔹 Signup
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword });
  await user.save();
  res.json({ message: "Signup successful" });
});

// 🔹 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ token });
});

// 🔹 CRUD Items
app.get("/items", async (req, res) => {
  const { category, maxPrice } = req.query;
  let query = {};
  if (category) query.category = category;
  if (maxPrice) query.price = { $lte: Number(maxPrice) };

  const items = await Item.find(query);
  res.json(items);
});

app.post("/items", authenticate, async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.json(item);
});

app.put("/items/:id", authenticate, async (req, res) => {
  const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
});

app.delete("/items/:id", authenticate, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item deleted" });
});

// 🔹 Cart APIs
app.get("/cart", authenticate, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.json([]);
  res.json(cart.items);
});

app.post("/cart", authenticate, async (req, res) => {
  const { itemId } = req.body;
  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }

  cart.items.push(item);
  await cart.save();
  res.json(cart.items);
});

app.delete("/cart/:itemId", authenticate, async (req, res) => {
  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.status(404).json({ error: "Cart not found" });

  cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
  await cart.save();
  res.json(cart.items);
});

app.get("/", (req, res) => {
  res.send("Backend is working ✅");
});


// Start server
app.listen(PORT, "127.0.0.1", () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});

