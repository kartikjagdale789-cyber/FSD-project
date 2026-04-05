const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

let products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 79.99,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80",
    description:
      "Comfortable over-ear wireless headphones with clear sound, deep bass, and long battery life."
  },
  {
    id: 2,
    name: "Minimal Desk Lamp",
    price: 34.5,
    category: "Home",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80",
    description:
      "A sleek LED desk lamp with adjustable brightness for study, office, and reading time."
  },
  {
    id: 3,
    name: "Classic White Sneakers",
    price: 54.0,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=80",
    description:
      "Everyday sneakers designed for comfort and style, perfect for casual outfits."
  },
  {
    id: 4,
    name: "Smart Fitness Watch",
    price: 119.0,
    category: "Electronics",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    description:
      "Track steps, heart rate, sleep, and workouts with this simple and useful smart watch."
  },
  {
    id: 5,
    name: "Reusable Water Bottle",
    price: 18.25,
    category: "Lifestyle",
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=80",
    description:
      "Double-wall stainless steel bottle that keeps drinks cool for longer periods."
  },
  {
    id: 6,
    name: "Organic Cotton Hoodie",
    price: 42.99,
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
    description:
      "Soft and warm hoodie made with organic cotton for a cozy and casual look."
  }
];

let cart = [];

app.get("/products", (req, res) => {
  res.json(products);
});

app.get("/products/:id", (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

app.post("/cart", (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ message: "productId is required" });
  }

  const product = products.find((item) => item.id === Number(productId));
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const existing = cart.find((item) => item.productId === Number(productId));

  if (existing) {
    existing.quantity += Number(quantity || 1);
  } else {
    cart.push({ productId: Number(productId), quantity: Number(quantity || 1) });
  }

  return res.status(201).json({ message: "Item added to cart", cart });
});

app.delete("/cart/:id", (req, res) => {
  const productId = Number(req.params.id);
  cart = cart.filter((item) => item.productId !== productId);
  return res.json({ message: "Item removed", cart });
});

app.listen(PORT, () => {
  console.log(`Simple E-Commerce server running at http://localhost:${PORT}`);
});
