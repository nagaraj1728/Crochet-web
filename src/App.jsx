
import React, { useState, useEffect } from "react";
import "./App.css";

// PRODUCT IMAGES
import accessories from "./assets/products/accessories.jpg";
import bunny from "./assets/products/bunny.jpg";
import gloves from "./assets/products/gloves.jpg";
import crochetTop from "./assets/products/Crochet-Top.jpg";
import milesKeychain from "./assets/products/Milesmorales-keychain.jpg";
import grannySquares from "./assets/products/granny-squares.jpg";
import crochetPurse from "./assets/products/Crochet-purse.jpg";
import bobblePurse from "./assets/products/bobblestich-purse.jpg";

// API
const API_URL = "https://crochet-web-s2p7.onrender.com/api/products";
const ORDER_API = "https://crochet-web-s2p7.onrender.com/api/orders";

// BUSINESS DETAILS
const business = {
  name: "Mahima Crochets",
  phone: "9779706979764",
  email: "mahimagrgg123@gmail.com",
  instagram: "https://instagram.com/mahimacrochets",
  location: "Kathmandu, Nepal",
};

// DEFAULT PRODUCTS
const defaultProducts = [
  {
    id: 1,
    name: "Crochet Accessories Set and Tote Bag",
    price: 1500,
    category: "Accessories",
    image: accessories,
    description: "Beautiful handmade crochet accessories and tote bag.",
  },
  {
    id: 2,
    name: "Crochet Bunny Amigurumi",
    price: 850,
    category: "Amigurumi",
    image: bunny,
    description: "Cute handmade crochet bunny.",
  },
  {
    id: 3,
    name: "Crochet Fingerless Gloves",
    price: 650,
    category: "Wearables",
    image: gloves,
    description: "Comfortable handmade crochet gloves.",
  },
  {
    id: 4,
    name: "Crochet Vest",
    price: 1800,
    category: "Clothing",
    image: crochetTop,
    description: "Stylish handmade crochet clothing.",
  },
  {
    id: 5,
    name: "Miles Morales Crochet Keychain",
    price: 350,
    category: "Keychains",
    image: milesKeychain,
    description: "Handmade character-inspired crochet keychain.",
  },
  {
    id: 6,
    name: "Crochet Granny Squares",
    price: 500,
    category: "Accessories",
    image: grannySquares,
    description: "Colourful handmade crochet granny squares.",
  },
  {
    id: 7,
    name: "Crochet Purse",
    price: 950,
    category: "Bags",
    image: crochetPurse,
    description: "Beautiful handmade crochet purse.",
  },
  {
    id: 8,
    name: "Bobble Stitch Purse",
    price: 1100,
    category: "Bags",
    image: bobblePurse,
    description: "Elegant handmade bobble stitch purse.",
  },
];

function App() {
  const [products, setProducts] = useState(defaultProducts);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

  const categories = [
    "All",
    "Bags",
    "Accessories",
    "Amigurumi",
    "Wearables",
    "Clothing",
    "Keychains",
  ];

  // FETCH PRODUCTS FROM MONGODB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error("Product API unavailable");
        }

        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setProducts(
            data.map((product) => ({
              ...product,
              id: product._id || product.id,
              image: product.image || "",
            }))
          );
        }
      } catch (error) {
        console.error("Product loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // FILTER PRODUCTS
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // ADD TO CART
  const addToCart = (product) => {
    setCart((previous) => {
      const existing = previous.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return previous.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...previous, { ...product, quantity: 1 }];
    });
  };

  // UPDATE QUANTITY
  const updateQuantity = (id, amount) => {
    setCart((previous) =>
      previous
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // REMOVE ITEM
  const removeItem = (id) => {
    setCart((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  // CART CALCULATIONS
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // PRICE FORMAT
  const formatPrice = (price) =>
    "NPR " + Number(price).toLocaleString("en-IN");

  // CUSTOMER UPDATE
  const updateCustomer = (field, value) => {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // OPEN CHECKOUT
  const openCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setShowCart(false);
    setShowCheckout(true);
  };

  // PLACE ORDER AND SAVE IN MONGODB
  const placeOrder = async (event) => {
    event.preventDefault();

    if (placingOrder) return;

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert("Please fill in all delivery details.");
      return;
    }

    const phone = business.phone.replace(/\D/g, "");

    if (!/^\d{10,15}$/.test(phone)) {
      alert("Please check the business WhatsApp number.");
      return;
    }

    setPlacingOrder(true);

    try {
      const orderData = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
        },

        items: cart.map((item) => ({
          productId: String(item.id),
          name: item.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),

        totalAmount: totalPrice,
        paymentMethod,
      };

      // SAVE ORDER IN MONGODB
      const response = await fetch(ORDER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to save your order."
        );
      }

      // WHATSAPP ORDER DETAILS
      const orderDetails = cart
        .map(
          (item) =>
            `${item.name} x ${item.quantity} = ${formatPrice(
              item.price * item.quantity
            )}`
        )
        .join("\n");

      const message = `Hello ${business.name}!

I would like to place an order.

ORDER ID: ${result.order._id}

CUSTOMER DETAILS
Name: ${customer.name}
Phone: ${customer.phone}
Delivery Address: ${customer.address}

ORDER DETAILS
${orderDetails}

Total Amount: ${formatPrice(totalPrice)}
Payment Method: ${paymentMethod}

Please confirm my order and share the next steps.

Thank you!`;

      const whatsappURL =
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

      // OPEN WHATSAPP
      window.open(whatsappURL, "_blank");

      alert(
        "Your order has been saved successfully! Order ID: " +
        result.order._id
      );

      setCart([]);
      setShowCheckout(false);
      setShowCart(false);

      setCustomer({
        name: "",
        phone: "",
        address: "",
      });

      setPaymentMethod("Cash on Delivery");

    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "Something went wrong.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="app">

      {/* ANNOUNCEMENT */}
      <div className="announcement">
        Handmade with love ♡ | Made in Nepal
      </div>

      {/* NAVBAR */}
      <header className="navbar">

        <a href="#home" className="logo">
          Mahima <span>Crochets.</span>
        </a>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>Our Story</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>

        <button
          className="cart-button"
          onClick={() => setShowCart(true)}
        >
          🛍️ Cart <span>{totalItems}</span>
        </button>

      </header>

      <main>

        {/* HERO */}
        <section className="hero" id="home">

          <div className="hero-content">

            <p className="eyebrow">
              HANDMADE WITH LOVE IN NEPAL
            </p>

            <h1>
              Little things,
              <br />
              made with <i>love.</i>
            </h1>

            <p className="hero-description">
              Discover beautiful handmade crochet creations.
              Every piece is carefully crafted with creativity,
              patience and love.
            </p>

            <a href="#shop" className="primary-button">
              Explore Collection →
            </a>

            <p className="hero-note">
              ♡ Every stitch has a story
            </p>

          </div>

          <div className="hero-art">
            <div className="hero-circle">
              <span>💐</span>
            </div>
            <p>Handmade just for you ♡</p>
          </div>

        </section>

        {/* FEATURES */}
        <section className="features">

          <div>
            <span>🧶</span>
            <h3>Handmade</h3>
            <p>Made with care</p>
          </div>

          <div>
            <span>💗</span>
            <h3>Made with Love</h3>
            <p>Every piece is special</p>
          </div>

          <div>
            <span>🎁</span>
            <h3>Perfect Gifts</h3>
            <p>For every occasion</p>
          </div>

        </section>

        {/* SHOP */}
        <section className="shop-section" id="shop">

          <div className="section-heading">
            <p className="eyebrow">OUR COLLECTION</p>

            <h2>
              Made by hand, <i>made for you.</i>
            </h2>

            <p>Find something special in every stitch.</p>
          </div>

          {/* SEARCH */}
          <div className="shop-controls">

            <input
              type="text"
              className="product-search"
              placeholder="Search crochet products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* CATEGORY FILTERS */}
            <div className="category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    selectedCategory === category
                      ? "category-filter active"
                      : "category-filter"
                  }
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

          </div>

          {loading && (
            <p className="no-products">Loading products...</p>
          )}

          {/* PRODUCT GRID */}
          <div className="product-grid">

            {!loading && filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (

                <article className="product-card" key={product.id}>

                  <div className="product-art">

                    <img
                      src={product.image}
                      alt={product.name}
                    />

                    <small>{product.category}</small>

                  </div>

                  <div className="product-info">

                    <p className="category">
                      {product.category}
                    </p>

                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-bottom">

                      <strong>
                        {formatPrice(product.price)}
                      </strong>

                      <button
                        className="add-button"
                        onClick={() => addToCart(product)}
                      >
                        + Add
                      </button>

                    </div>

                    <button
                      className="view-details-button"
                      onClick={() => setSelectedProduct(product)}
                    >
                      View Details
                    </button>

                  </div>

                </article>

              ))
            ) : !loading ? (
              <p className="no-products">
                No products found. Try another search.
              </p>
            ) : null}

          </div>

        </section>

        {/* CUSTOM ORDERS */}
        <section className="custom-section">

          <div>
            <p className="eyebrow">
              YOUR IDEA, OUR CREATIVITY
            </p>

            <h2>
              Want something <i>custom made?</i>
            </h2>

            <p>
              Have a special crochet design in mind?
              Contact Mahima to discuss your custom order.
            </p>

            <a
              href={`https://wa.me/${business.phone}`}
              target="_blank"
              rel="noreferrer"
              className="primary-button"
            >
              Request Custom Order →
            </a>
          </div>

          <div className="custom-art">
            🧶 🌷 🧸
          </div>

        </section>

        {/* ABOUT */}
        <section className="about-section" id="about">

          <p className="eyebrow">
            OUR LITTLE STORY
          </p>

          <h2>Every stitch tells a story.</h2>

          <p>
            Welcome to Mahima Crochets! A small handmade
            business built with creativity, patience and love.
            Every crochet creation is made with attention to
            detail, bringing happiness through handmade art.
          </p>

          <h3>With love, Mahima ♡</h3>

        </section>

        {/* CONTACT */}
        <section className="contact-section" id="contact">

          <div className="section-heading">
            <p className="eyebrow">GET IN TOUCH</p>
            <h2>Let's connect!</h2>
            <p>We would love to hear from you.</p>
          </div>

          <div className="contact-grid">

            <a
              href={`https://wa.me/${business.phone}`}
              target="_blank"
              rel="noreferrer"
              className="contact-card"
            >
              <span>💬</span>
              <h3>WhatsApp</h3>
              <p>Chat with us</p>
            </a>

            <a
              href={`mailto:${business.email}`}
              className="contact-card"
            >
              <span>✉️</span>
              <h3>Email</h3>
              <p>{business.email}</p>
            </a>

            <a
              href={business.instagram}
              target="_blank"
              rel="noreferrer"
              className="contact-card"
            >
              <span>📸</span>
              <h3>Instagram</h3>
              <p>Follow our creations</p>
            </a>

            <div className="contact-card">
              <span>📍</span>
              <h3>Location</h3>
              <p>{business.location}</p>
            </div>

          </div>

        </section>

      </main>

      {/* PRODUCT DETAILS POPUP */}
      {selectedProduct && (

        <div
          className="product-detail-overlay"
          onClick={() => setSelectedProduct(null)}
        >

          <div
            className="product-detail-modal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="detail-close"
              onClick={() => setSelectedProduct(null)}
            >
              ✕
            </button>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
            />

            <div className="product-detail-info">

              <p className="category">
                {selectedProduct.category}
              </p>

              <h2>{selectedProduct.name}</h2>

              <p>{selectedProduct.description}</p>

              <h3>{formatPrice(selectedProduct.price)}</h3>

              <button
                className="add-button"
                onClick={() => {
                  addToCart(selectedProduct);
                  setSelectedProduct(null);
                }}
              >
                + Add to Cart
              </button>

            </div>

          </div>

        </div>

      )}

      {/* SHOPPING CART */}
      {showCart && (

        <div
          className="cart-overlay"
          onClick={() => setShowCart(false)}
        >

          <div
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="cart-header">

              <h2>Your Shopping Bag</h2>

              <button onClick={() => setShowCart(false)}>
                ✕
              </button>

            </div>

            {cart.length === 0 ? (

              <div className="empty-cart">
                <span>🛍️</span>
                <p>Your shopping bag is empty.</p>

                <button onClick={() => setShowCart(false)}>
                  Continue Shopping
                </button>
              </div>

            ) : (

              <>

                <div className="cart-items">

                  {cart.map((item) => (

                    <div className="cart-item" key={item.id}>

                      <div className="cart-item-art">
                        <img
                          src={item.image}
                          alt={item.name}
                        />
                      </div>

                      <div className="cart-item-info">

                        <h3>{item.name}</h3>

                        <p>{formatPrice(item.price)}</p>

                        <div className="quantity-controls">

                          <button
                            onClick={() =>
                              updateQuantity(item.id, -1)
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              updateQuantity(item.id, 1)
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                      <button
                        className="remove-button"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>

                    </div>

                  ))}

                </div>

                <div className="cart-footer">

                  <div className="total-row">
                    <span>Total</span>
                    <strong>{formatPrice(totalPrice)}</strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={openCheckout}
                  >
                    Proceed to Checkout
                  </button>

                  <p>
                    Delivery and payment details will be confirmed
                    by the seller.
                  </p>

                </div>

              </>

            )}

          </div>

        </div>

      )}

      {/* CHECKOUT PAGE */}
      {showCheckout && (

        <div className="checkout-overlay">

          <div className="checkout-container">

            <div className="checkout-header">

              <h2>Complete Your Order</h2>

              <button
                onClick={() => setShowCheckout(false)}
                disabled={placingOrder}
              >
                ✕
              </button>

            </div>

            <form onSubmit={placeOrder}>

              <h3>Delivery Information</h3>

              <label htmlFor="customer-name">
                Full Name
              </label>

              <input
                id="customer-name"
                type="text"
                placeholder="Enter your full name"
                value={customer.name}
                onChange={(e) =>
                  updateCustomer("name", e.target.value)
                }
                required
              />

              <label htmlFor="customer-phone">
                Phone Number
              </label>

              <input
                id="customer-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={customer.phone}
                onChange={(e) =>
                  updateCustomer("phone", e.target.value)
                }
                required
              />

              <label htmlFor="customer-address">
                Delivery Address
              </label>

              <textarea
                id="customer-address"
                placeholder="Enter your complete delivery address"
                value={customer.address}
                onChange={(e) =>
                  updateCustomer("address", e.target.value)
                }
                required
              />

              <h3>Payment Method</h3>

              <div className="payment-options">

                {["Cash on Delivery", "eSewa", "Khalti"].map((method) => (
                  <label key={method}>
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />
                    {method}
                  </label>
                ))}

              </div>

              <div className="checkout-summary">

                <span>Total Amount</span>

                <strong>{formatPrice(totalPrice)}</strong>

              </div>

              <p className="payment-note">
                Online payment will be arranged with the seller.
                Selecting eSewa or Khalti here does not process a
                payment yet.
              </p>

              <button
                type="submit"
                className="checkout-button"
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Saving Order..."
                  : "Confirm Order on WhatsApp"}
              </button>

            </form>

          </div>

        </div>

      )}

      {/* FOOTER */}
      <footer className="footer">

        <h2>Mahima Crochets.</h2>

        <p>Handmade with love, from Nepal ♡</p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#shop">Shop</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </div>

        <p className="copyright">
          © 2026 Mahima Crochets. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default App;
