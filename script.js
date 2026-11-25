/* Kora Supply - demo e-commerce product website
 * Features: product grid, search, category + price filters, sorting,
 * product details dialog, and a cart saved in Local Storage.
 */
(function () {
  "use strict";

  // ---------- Data ----------
  var PRODUCTS = [
    { id: 1, name: "Ruled Notebook A5 (Pack of 3)", category: "Stationery", price: 349, rating: 4.5, reviews: 212, icon: "📓", badge: "Bestseller",
      desc: "Three A5 notebooks with 160 ruled pages each. The paper holds up to gel and fountain pens without bleeding through.",
      specs: ["A5 size, 160 pages each", "80 GSM paper", "Stitched binding lies flat"] },
    { id: 2, name: "Gel Pen Set (10 Colours)", category: "Stationery", price: 199, rating: 4.3, reviews: 164, icon: "🖊️", badge: "",
      desc: "Ten smooth gel pens in bright colours for notes, diagrams and highlighting.",
      specs: ["0.5 mm tip", "Quick-dry ink", "Comes in a zip case"] },
    { id: 3, name: "Sticky Notes Bundle", category: "Stationery", price: 149, rating: 4.2, reviews: 98, icon: "🗒️", badge: "",
      desc: "Six pads in assorted sizes for reminders, bookmarks and quick to-do lists.",
      specs: ["6 pads, 50 sheets each", "Repositionable adhesive", "Assorted colours"] },
    { id: 4, name: "Canvas Backpack 22L", category: "Bags", price: 1499, rating: 4.6, reviews: 341, icon: "🎒", badge: "Top rated",
      desc: "A roomy everyday backpack with a padded laptop compartment and water-resistant canvas.",
      specs: ["22 litre capacity", "Fits up to 15.6 inch laptop", "Padded shoulder straps"] },
    { id: 5, name: "Laptop Sleeve 14 inch", category: "Bags", price: 799, rating: 4.1, reviews: 77, icon: "💼", badge: "",
      desc: "A slim padded sleeve that protects your laptop from scratches and light bumps.",
      specs: ["Fits 14 inch laptops", "Soft inner lining", "Front accessory pocket"] },
    { id: 6, name: "Zip Pencil Pouch", category: "Bags", price: 249, rating: 4.4, reviews: 130, icon: "👝", badge: "",
      desc: "A sturdy zip pouch that keeps pens, erasers and chargers in one place.",
      specs: ["Wide-opening zip", "Washable fabric", "Holds 20+ pens"] },
    { id: 7, name: "Wireless Earbuds", category: "Tech", price: 1799, rating: 4.2, reviews: 289, icon: "🎧", badge: "New",
      desc: "Compact earbuds with clear sound for lectures, calls and music, plus a pocket charging case.",
      specs: ["Bluetooth 5.3", "Up to 24 hours with case", "Touch controls"] },
    { id: 8, name: "Power Bank 10000 mAh", category: "Tech", price: 1299, rating: 4.5, reviews: 256, icon: "🔋", badge: "",
      desc: "Charge your phone more than twice on a single charge. Slim enough for a jacket pocket.",
      specs: ["10000 mAh capacity", "USB-C and USB-A ports", "Fast-charge support"] },
    { id: 9, name: "USB-C Hub 6-in-1", category: "Tech", price: 2199, rating: 4.0, reviews: 61, icon: "🔌", badge: "",
      desc: "Add HDMI, USB-A, SD card and charging pass-through to a laptop that has only USB-C ports.",
      specs: ["HDMI output", "2 x USB-A, 1 x SD card slot", "USB-C power pass-through"] },
    { id: 10, name: "LED Desk Lamp", category: "Desk", price: 999, rating: 4.4, reviews: 187, icon: "💡", badge: "Bestseller",
      desc: "A flexible desk lamp with three colour temperatures and adjustable brightness for late study sessions.",
      specs: ["3 colour modes, 5 brightness levels", "Flexible neck", "USB powered"] },
    { id: 11, name: "Aluminium Laptop Stand", category: "Desk", price: 1199, rating: 4.3, reviews: 143, icon: "💻", badge: "",
      desc: "Raises your screen to eye level and lets air flow under the laptop. Folds flat for your bag.",
      specs: ["Adjustable height", "Foldable design", "Non-slip silicone pads"] },
    { id: 12, name: "Desk Mat 80 cm", category: "Desk", price: 899, rating: 4.5, reviews: 118, icon: "🖱️", badge: "",
      desc: "A large desk mat that fits a keyboard and mouse, with a smooth surface and a non-slip base.",
      specs: ["80 x 30 cm", "Stitched edges", "Wipe-clean surface"] }
  ];

  var CATEGORIES = ["All", "Stationery", "Bags", "Tech", "Desk"];
  var FREE_DELIVERY_FROM = 999;
  var DELIVERY_FEE = 49;
  var STORAGE_KEY = "kora-supply-cart";

  // ---------- State ----------
  var state = { query: "", category: "All", price: "any", sort: "featured" };
  var cart = loadCart(); // { productId: quantity }
  var detailProduct = null;
  var detailQty = 1;
  var lastFocus = null;

  // ---------- Helpers ----------
  var $ = function (id) { return document.getElementById(id); };

  function money(n) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function stars(rating) {
    var full = Math.round(rating);
    return "★★★★★".slice(0, full) + "☆☆☆☆☆".slice(0, 5 - full);
  }
  function ratingHtml(p) {
    return '<span class="stars" aria-hidden="true">' + stars(p.rating) + "</span> " +
      '<span class="sr-only">Rated ' + p.rating + " out of 5. </span>" +
      p.rating.toFixed(1) + " (" + p.reviews + ")";
  }

  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      var clean = {};
      Object.keys(raw).forEach(function (k) {
        var id = Number(k), q = Number(raw[k]);
        if (byId(id) && q > 0) clean[id] = Math.min(q, 20);
      });
      return clean;
    } catch (e) {
      return {};
    }
  }
  function saveCart() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ }
  }

  var toastTimer;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  // ---------- Filtering ----------
  function priceMatch(p) {
    switch (state.price) {
      case "under500": return p.price < 500;
      case "500to1000": return p.price >= 500 && p.price <= 1000;
      case "over1000": return p.price > 1000;
      default: return true;
    }
  }
  function visibleProducts() {
    var q = state.query.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      var inCat = state.category === "All" || p.category === state.category;
      var inText = !q || (p.name + " " + p.category + " " + p.desc).toLowerCase().indexOf(q) !== -1;
      return inCat && inText && priceMatch(p);
    });
    if (state.sort === "priceLow") list.sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "priceHigh") list.sort(function (a, b) { return b.price - a.price; });
    if (state.sort === "rating") list.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
    return list;
  }

  // ---------- Rendering: store ----------
  function renderCategories() {
    $("categoryList").innerHTML = CATEGORIES.map(function (c) {
      var n = c === "All" ? PRODUCTS.length : PRODUCTS.filter(function (p) { return p.category === c; }).length;
      return '<button type="button" class="chip" data-cat="' + c + '" aria-pressed="' + (state.category === c) + '">' +
        "<span>" + c + '</span><span class="n">' + n + "</span></button>";
    }).join("");
  }

  function renderGrid() {
    var list = visibleProducts();
    $("grid").innerHTML = list.map(function (p) {
      return '<article class="card">' +
        '<div class="thumb" data-cat="' + p.category + '" aria-hidden="true">' +
          (p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : "") +
          '<span class="sticker">' + money(p.price) + "</span>" + p.icon +
        "</div>" +
        '<div class="card-body">' +
          '<button type="button" class="card-title" data-view="' + p.id + '">' + esc(p.name) + "</button>" +
          '<p class="card-cat">' + p.category + "</p>" +
          '<p class="rating">' + ratingHtml(p) + "</p>" +
          '<div class="card-actions">' +
            '<button type="button" class="btn" data-view="' + p.id + '">Details</button>' +
            '<button type="button" class="btn btn-primary" data-add="' + p.id + '">Add to cart</button>' +
          "</div>" +
        "</div></article>";
    }).join("");

    var count = list.length;
    $("resultCount").textContent = count + (count === 1 ? " product" : " products");

    var empty = count === 0;
    $("empty").hidden = !empty;
    $("grid").hidden = empty;
    if (empty) {
      var parts = [];
      if (state.query.trim()) parts.push('"' + state.query.trim() + '"');
      if (state.category !== "All") parts.push(state.category);
      $("emptyText").textContent = "No products match " + (parts.length ? parts.join(" in ") : "these filters") + ".";
    }
  }

  function renderAll() {
    renderCategories();
    renderGrid();
  }

  // ---------- Cart logic ----------
  function cartCount() {
    return Object.keys(cart).reduce(function (n, id) { return n + cart[id]; }, 0);
  }
  function cartSubtotal() {
    return Object.keys(cart).reduce(function (sum, id) { return sum + byId(Number(id)).price * cart[id]; }, 0);
  }
  function addToCart(id, qty) {
    cart[id] = Math.min((cart[id] || 0) + qty, 20);
    saveCart();
    renderCart();
    var btn = $("cartBtn");
    btn.classList.remove("bump");
    void btn.offsetWidth;
    btn.classList.add("bump");
  }
  function setQty(id, qty) {
    if (qty <= 0) delete cart[id]; else cart[id] = Math.min(qty, 20);
    saveCart();
    renderCart();
  }

  function renderCart() {
    var ids = Object.keys(cart);
    var count = cartCount();
    $("cartCount").textContent = count;
    $("cartBtn").setAttribute("aria-label", "Open cart, " + count + (count === 1 ? " item" : " items"));

    $("cartItems").innerHTML = ids.map(function (k) {
      var p = byId(Number(k)), q = cart[k];
      return '<li class="cart-row">' +
        '<div class="thumb" data-cat="' + p.category + '" aria-hidden="true">' + p.icon + "</div>" +
        "<div>" +
          '<div class="cart-name">' + esc(p.name) + "</div>" +
          '<div class="cart-unit">' + money(p.price) + " each</div>" +
          '<div class="cart-controls">' +
            '<div class="qty" role="group" aria-label="Quantity of ' + esc(p.name) + '">' +
              '<button type="button" data-dec="' + p.id + '" aria-label="Decrease quantity">&minus;</button>' +
              "<output>" + q + "</output>" +
              '<button type="button" data-inc="' + p.id + '" aria-label="Increase quantity">+</button>' +
            "</div>" +
            '<button type="button" class="link-btn" data-remove="' + p.id + '">Remove</button>' +
          "</div>" +
        "</div>" +
        '<div class="cart-line">' + money(p.price * q) + "</div>" +
      "</li>";
    }).join("");

    var hasItems = ids.length > 0;
    $("cartEmpty").hidden = hasItems;
    $("cartFooter").hidden = !hasItems;
    if (!hasItems) return;

    var sub = cartSubtotal();
    var free = sub >= FREE_DELIVERY_FROM;
    var delivery = free ? 0 : DELIVERY_FEE;
    $("subtotal").textContent = money(sub);
    $("delivery").textContent = free ? "Free" : money(delivery);
    $("total").textContent = money(sub + delivery);
    $("shipNote").textContent = free
      ? "You have free delivery."
      : "Add " + money(FREE_DELIVERY_FROM - sub) + " more for free delivery.";
  }

  // ---------- Drawer ----------
  function openDrawer() {
    lastFocus = document.activeElement;
    $("scrim").hidden = false;
    var d = $("drawer");
    d.removeAttribute("inert");
    d.classList.add("open");
    $("drawerClose").focus();
  }
  function closeDrawer() {
    var d = $("drawer");
    d.classList.remove("open");
    d.setAttribute("inert", "");
    $("scrim").hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // ---------- Details dialog ----------
  function openDetail(id) {
    var p = byId(id);
    if (!p) return;
    detailProduct = p;
    detailQty = 1;
    var th = $("detailThumb");
    th.setAttribute("data-cat", p.category);
    th.textContent = p.icon;
    $("detailCategory").textContent = p.category;
    $("detailTitle").textContent = p.name;
    $("detailRating").innerHTML = ratingHtml(p);
    $("detailPrice").textContent = money(p.price);
    $("detailDesc").textContent = p.desc;
    $("detailSpecs").innerHTML = p.specs.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    $("qtyValue").textContent = detailQty;
    $("detail").showModal();
  }

  // ---------- Events ----------
  $("search").addEventListener("input", function (e) { state.query = e.target.value; renderGrid(); });
  $("sortBy").addEventListener("change", function (e) { state.sort = e.target.value; renderGrid(); });
  $("priceFilter").addEventListener("change", function (e) { state.price = e.target.value; renderGrid(); });

  $("categoryList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-cat]");
    if (!b) return;
    state.category = b.getAttribute("data-cat");
    renderAll();
  });

  function clearFilters() {
    state = { query: "", category: "All", price: "any", sort: state.sort };
    $("search").value = "";
    $("priceFilter").value = "any";
    renderAll();
  }
  $("clearFilters").addEventListener("click", clearFilters);
  $("emptyClear").addEventListener("click", clearFilters);

  $("grid").addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) {
      var p = byId(Number(add.getAttribute("data-add")));
      addToCart(p.id, 1);
      toast(p.name + " added to cart");
      return;
    }
    var view = e.target.closest("[data-view]");
    if (view) openDetail(Number(view.getAttribute("data-view")));
  });

  $("qtyMinus").addEventListener("click", function () {
    detailQty = Math.max(1, detailQty - 1);
    $("qtyValue").textContent = detailQty;
  });
  $("qtyPlus").addEventListener("click", function () {
    detailQty = Math.min(20, detailQty + 1);
    $("qtyValue").textContent = detailQty;
  });
  $("detailAdd").addEventListener("click", function () {
    addToCart(detailProduct.id, detailQty);
    toast(detailQty + " x " + detailProduct.name + " added to cart");
    $("detail").close();
  });
  $("detailClose").addEventListener("click", function () { $("detail").close(); });
  $("detail").addEventListener("click", function (e) {
    if (e.target === $("detail")) $("detail").close(); // click on backdrop
  });

  $("cartBtn").addEventListener("click", openDrawer);
  $("drawerClose").addEventListener("click", closeDrawer);
  $("scrim").addEventListener("click", closeDrawer);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && $("drawer").classList.contains("open")) closeDrawer();
  });

  $("cartItems").addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]");
    var dec = e.target.closest("[data-dec]");
    var rem = e.target.closest("[data-remove]");
    if (inc) { var i = Number(inc.getAttribute("data-inc")); setQty(i, cart[i] + 1); }
    if (dec) { var d = Number(dec.getAttribute("data-dec")); setQty(d, cart[d] - 1); }
    if (rem) { setQty(Number(rem.getAttribute("data-remove")), 0); }
  });

  $("clearCart").addEventListener("click", function () {
    cart = {};
    saveCart();
    renderCart();
  });
  $("checkoutBtn").addEventListener("click", function () {
    cart = {};
    saveCart();
    renderCart();
    closeDrawer();
    toast("Demo order placed. No payment was taken.");
  });

  // ---------- Start ----------
  renderAll();
  renderCart();
})();
