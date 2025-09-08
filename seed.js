// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Item from "./models/Item.js";

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for seeding");

    const items = [
  { name: "iPhone 14", price: 70000, category: "electronics", imageUrl: "/images/iphone14.jpg" },
  { name: "Samsung Galaxy S23", price: 65000, category: "electronics", imageUrl: "/images/iphone14.jpg" },
  { name: "Nike Air Max", price: 9000, category: "fashion", imageUrl: "/images/iphone14.jpg" },
  { name: "Levi’s Jeans", price: 2500, category: "fashion", imageUrl: "/images/iphone14.jpg" },
  { name: "The Alchemist", price: 499, category: "books", imageUrl: "/images/iphone14.jpg" },
  { name: "Harry Potter Set", price: 2999, category: "books", imageUrl: "/images/iphone14.jpg" }
];

    await Item.deleteMany(); // clear old items
    await Item.insertMany(items);

    console.log("🌱 Database seeded successfully!");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  }
}

seed();
