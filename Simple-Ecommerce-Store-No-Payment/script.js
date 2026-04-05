const STORAGE_KEYS = {
  products: "products",
  cart: "cart",
  wishlist: "wishlist",
  theme: "theme"
};

const API_BASE = "http://localhost:3000";

const starterProducts = [
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

document.addEventListener("DOMContentLoaded", () => {
  initializeStorage();
  applySavedTheme();
  setupNavInteractions();
  updateCartCount();
  initializePage();
});

function initializeStorage() {
  const products = getLocalData(STORAGE_KEYS.products);
  const cart = getLocalData(STORAGE_KEYS.cart);
  const wishlist = getLocalData(STORAGE_KEYS.wishlist);

  if (!Array.isArray(products) || products.length === 0) {
    setLocalData(STORAGE_KEYS.products, starterProducts);
  }

  if (!Array.isArray(cart)) {
    setLocalData(STORAGE_KEYS.cart, []);
  }

  if (!Array.isArray(wishlist)) {
    setLocalData(STORAGE_KEYS.wishlist, []);
  }
}

function setupNavInteractions() {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  const themeToggle = document.getElementById("themeToggle");

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("show");
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const darkModeEnabled = document.body.classList.contains("dark");
      setLocalData(STORAGE_KEYS.theme, darkModeEnabled ? "dark" : "light");
      themeToggle.textContent = darkModeEnabled ? "Light Mode" : "Dark Mode";
    });

    const darkModeEnabled = document.body.classList.contains("dark");
    themeToggle.textContent = darkModeEnabled ? "Light Mode" : "Dark Mode";
  }
}

function applySavedTheme() {
  const savedTheme = getLocalData(STORAGE_KEYS.theme);
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }
}

function initializePage() {
  const page = document.body.dataset.page;

  if (page === "home") {
    setupHomePage();
  }

  if (page === "product-details") {
    setupProductDetailsPage();
  }

  if (page === "cart") {
    setupCartPage();
  }
}

async function getProducts() {
  const apiProducts = await requestApi("/products");

  if (Array.isArray(apiProducts)) {
    setLocalData(STORAGE_KEYS.products, apiProducts);
    return apiProducts;
  }

  return getLocalData(STORAGE_KEYS.products) || [];
}

async function getProductById(id) {
  const apiProduct = await requestApi(`/products/${id}`);

  if (apiProduct && apiProduct.id) {
    return apiProduct;
  }

  const products = getLocalData(STORAGE_KEYS.products) || [];
  return products.find((item) => Number(item.id) === Number(id));
}

function getCart() {
  return getLocalData(STORAGE_KEYS.cart) || [];
}

function setCart(cart) {
  setLocalData(STORAGE_KEYS.cart, cart);
  updateCartCount();
}

function getWishlist() {
  return getLocalData(STORAGE_KEYS.wishlist) || [];
}

function setWishlist(wishlist) {
  setLocalData(STORAGE_KEYS.wishlist, wishlist);
}

function addToCart(productId, quantity = 1) {
  const cart = getCart();
  const existingIndex = cart.findIndex((item) => Number(item.productId) === Number(productId));

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ productId: Number(productId), quantity });
  }

  setCart(cart);

  // Optional backend sync.
  requestApi("/cart", "POST", { productId: Number(productId), quantity }).catch(() => {});
}

function removeFromCart(productId) {
  const updatedCart = getCart().filter((item) => Number(item.productId) !== Number(productId));
  setCart(updatedCart);

  // Optional backend sync.
  requestApi(`/cart/${productId}`, "DELETE").catch(() => {});
}

function updateCartItemQuantity(productId, newQuantity) {
  const cart = getCart();
  const index = cart.findIndex((item) => Number(item.productId) === Number(productId));

  if (index < 0) {
    return;
  }

  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  cart[index].quantity = newQuantity;
  setCart(cart);
}

function toggleWishlist(productId) {
  const wishlist = getWishlist();
  const exists = wishlist.includes(Number(productId));

  const updatedWishlist = exists
    ? wishlist.filter((id) => Number(id) !== Number(productId))
    : [...wishlist, Number(productId)];

  setWishlist(updatedWishlist);
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + Number(item.quantity), 0);

  document.querySelectorAll("#cartCount").forEach((element) => {
    element.textContent = String(count);
  });
}

async function setupHomePage() {
  const productsContainer = document.getElementById("productsContainer");
  const emptyBox = document.getElementById("productsEmpty");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const priceSort = document.getElementById("priceSort");

  if (!productsContainer || !searchInput || !categoryFilter || !priceSort || !emptyBox) {
    return;
  }

  const products = await getProducts();

  // Load categories once based on product list.
  const categories = [...new Set(products.map((product) => product.category))];
  categoryFilter.innerHTML =
    '<option value="all">All Categories</option>' +
    categories.map((category) => `<option value="${category}">${category}</option>`).join("");

  const renderProducts = () => {
    const searchValue = searchInput.value.toLowerCase().trim();
    const selectedCategory = categoryFilter.value;
    const selectedSort = priceSort.value;
    const wishlist = getWishlist();

    let filteredProducts = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchValue);
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (selectedSort === "low-high") {
      filteredProducts.sort((a, b) => a.price - b.price);
    }

    if (selectedSort === "high-low") {
      filteredProducts.sort((a, b) => b.price - a.price);
    }

    productsContainer.innerHTML = "";

    if (filteredProducts.length === 0) {
      emptyBox.classList.remove("hidden");
      return;
    }

    emptyBox.classList.add("hidden");

    filteredProducts.forEach((product) => {
      const isWishlisted = wishlist.includes(Number(product.id));

      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <img class="product-image" src="${product.image}" alt="${product.name}" />
        <div class="product-body">
          <p class="product-category">${product.category}</p>
          <h3>${product.name}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <p>${shortenText(product.description, 80)}</p>
          <div class="card-actions">
            <a class="secondary-btn" href="product.html?id=${product.id}">View Details</a>
            <button class="primary-btn" data-action="cart" data-id="${product.id}">Add to Cart</button>
            <button class="wishlist-btn ${isWishlisted ? "active" : ""}" data-action="wishlist" data-id="${product.id}">
              &#10084; ${isWishlisted ? "Wishlisted" : "Wishlist"}
            </button>
          </div>
        </div>
      `;

      productsContainer.appendChild(card);
    });

    productsContainer.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const productId = Number(button.dataset.id);

        if (action === "cart") {
          addToCart(productId, 1);
          button.textContent = "Added";
          setTimeout(() => {
            button.textContent = "Add to Cart";
          }, 900);
        }

        if (action === "wishlist") {
          toggleWishlist(productId);
          renderProducts();
        }
      });
    });
  };

  renderProducts();
  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  priceSort.addEventListener("change", renderProducts);
}

async function setupProductDetailsPage() {
  const details = document.getElementById("productDetails");
  const empty = document.getElementById("detailsEmpty");
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  if (!details || !empty || !productId) {
    return;
  }

  const product = await getProductById(productId);

  if (!product) {
    empty.classList.remove("hidden");
    details.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");
  details.classList.remove("hidden");

  const wishlisted = getWishlist().includes(Number(product.id));

  details.innerHTML = `
    <div class="details-layout">
      <img src="${product.image}" alt="${product.name}" />
      <div class="details-content">
        <p class="product-category">${product.category}</p>
        <h1>${product.name}</h1>
        <p class="product-price">$${product.price.toFixed(2)}</p>
        <p>${product.description}</p>
        <div class="card-actions">
          <button class="primary-btn" id="detailsAddCart">Add to Cart</button>
          <button class="wishlist-btn ${wishlisted ? "active" : ""}" id="detailsWishlist">
            &#10084; ${wishlisted ? "Wishlisted" : "Wishlist"}
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById("detailsAddCart").addEventListener("click", () => {
    addToCart(Number(product.id), 1);
  });

  document.getElementById("detailsWishlist").addEventListener("click", () => {
    toggleWishlist(Number(product.id));
    setupProductDetailsPage();
  });
}

async function setupCartPage() {
  const cartItemsElement = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");
  const cartEmptyElement = document.getElementById("cartEmpty");
  const cartSummary = document.getElementById("cartSummary");

  if (!cartItemsElement || !cartTotalElement || !cartEmptyElement || !cartSummary) {
    return;
  }

  const renderCart = async () => {
    const products = await getProducts();
    const cart = getCart();

    cartItemsElement.innerHTML = "";

    if (!cart.length) {
      cartEmptyElement.classList.remove("hidden");
      cartSummary.classList.add("hidden");
      return;
    }

    cartEmptyElement.classList.add("hidden");
    cartSummary.classList.remove("hidden");

    let total = 0;

    cart.forEach((item) => {
      const product = products.find((p) => Number(p.id) === Number(item.productId));
      if (!product) {
        return;
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      const row = document.createElement("article");
      row.className = "cart-item";
      row.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <div>
          <h3>${product.name}</h3>
          <p>$${product.price.toFixed(2)} each</p>
          <div class="qty-controls">
            <button data-action="decrease" data-id="${product.id}">-</button>
            <span>${item.quantity}</span>
            <button data-action="increase" data-id="${product.id}">+</button>
          </div>
        </div>
        <div>
          <p><strong>$${itemTotal.toFixed(2)}</strong></p>
          <button class="remove-btn" data-action="remove" data-id="${product.id}">Remove</button>
        </div>
      `;

      cartItemsElement.appendChild(row);
    });

    cartTotalElement.textContent = `$${total.toFixed(2)}`;

    cartItemsElement.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const productId = Number(button.dataset.id);
        const cartItem = getCart().find((item) => Number(item.productId) === productId);

        if (!cartItem) {
          return;
        }

        if (action === "increase") {
          updateCartItemQuantity(productId, cartItem.quantity + 1);
        }

        if (action === "decrease") {
          updateCartItemQuantity(productId, cartItem.quantity - 1);
        }

        if (action === "remove") {
          removeFromCart(productId);
        }

        renderCart();
      });
    });
  };

  renderCart();
}

async function requestApi(path, method = "GET", body = null) {
  try {
    const options = { method, headers: {} };

    if (body) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    // Backend is optional, so frontend-only mode should continue to work.
    return null;
  }
}

function getLocalData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

function setLocalData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function shortenText(text, maxLength) {
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}
