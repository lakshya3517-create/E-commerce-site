# Kora Supply - E-Commerce Product Website

A demo e-commerce website for study and desk essentials, built with plain HTML, CSS and JavaScript (no libraries).
It shows a product catalogue with search, category filters, product details and a working cart.

> This is a practice project. No real orders or payments are processed.

## Features

- **Product grid** with 12 products in 4 categories (Stationery, Bags, Tech, Desk)
- **Search** that filters as you type (name, category and description)
- **Category filters** with product counts, plus a **price range** filter
- **Sorting**: featured, price low to high, price high to low, top rated
- **Product details** window with description, specs, rating and quantity picker
- **Cart drawer** with quantity controls, remove item, subtotal, delivery fee (free over Rs. 999) and total
- **Cart saved in Local Storage**, so it survives a page refresh
- Empty states for "no results" and "empty cart"
- Responsive layout (desktop, tablet, mobile), keyboard accessible, respects reduced-motion settings

## Technologies

HTML5 (`<dialog>`, semantic tags), CSS3 (Grid, Flexbox, custom properties), JavaScript (DOM, events, array methods, Local Storage)

## Run Locally

Download or clone the project and open `index.html` in a browser. No build step is needed.

## Project Structure

```
ecommerce-product-website/
├── index.html   # page structure
├── style.css    # styling and responsive layout
├── script.js    # product data, filters, details, cart logic
└── README.md
```

## Possible Improvements

- Load products from a JSON file or an API
- Add wishlist and product reviews
- Add a checkout form with validation
