// Sample data: replace images/fields with your own references
const products = [
  {
    id: "p1",
    title: "Classic Blue Oxford Shirt",
    category: "Shirts",
    price: 1299,
    rating: 4.6,
    img: "https://picsum.photos/seed/shirt1/800/1000",
    desc: "Comfortable cotton button-down shirt with neat finish."
  },
  {
    id: "p2",
    title: "Slim Fit Chinos",
    category: "Trousers",
    price: 1599,
    rating: 4.4,
    img: "https://picsum.photos/seed/trouser1/800/1000",
    desc: "Smart-casual slim fit chino trousers with stretch."
  },
  {
    id: "p3",
    title: "Bomber Jacket",
    category: "Jackets",
    price: 3499,
    rating: 4.8,
    img: "https://picsum.photos/seed/jacket1/800/1000",
    desc: "Lightweight bomber jacket — seasonal essential."
  },
  {
    id: "p4",
    title: "Plain White Tee",
    category: "T-Shirts",
    price: 499,
    rating: 4.2,
    img: "https://picsum.photos/seed/tee1/800/1000",
    desc: "Soft cotton tee, perfect for layering."
  },
  {
    id: "p5",
    title: "Denim Jacket",
    category: "Jackets",
    price: 3999,
    rating: 4.7,
    img: "https://picsum.photos/seed/denim1/800/1000",
    desc: "Classic denim jacket with structured fit."
  }
];

let cart = {}; // { productId: { product, qty, size } }

// Utility: format currency (INR style)
function formatCurrency(n) {
  return "₹" + n.toFixed(2);
}

function renderCategories() {
  const cats = Array.from(new Set(products.map(p => p.category)));
  const $cat = $("#categoryFilter");
  cats.forEach(c => $cat.append(`<option value="${c}">${c}</option>`));
}

function renderProducts(list) {
  const $wrap = $("#products").empty();
  if (!list.length) {
    $wrap.html(`<div class="muted">No products found.</div>`);
    return;
  }
  list.forEach(p => {
    const $card = $(`
      <article class="card" data-id="${p.id}">
        <div class="img-wrap"><img src="${p.img}" alt="${p.title}"></div>
        <h3>${p.title}</h3>
        <div class="muted">${p.category}</div>
        <div class="price-row">
          <div>${formatCurrency(p.price)}</div>
          <div class="muted">${p.rating} ★</div>
        </div>
        <div class="actions-row">
          <button class="btn quickview">Quick view</button>
          <button class="btn primary add-to-cart">Add</button>
        </div>
      </article>
    `);
    $wrap.append($card);
  });
}

// Search + filter + sort pipeline
function getFilteredProducts() {
  let q = $("#search").val().trim().toLowerCase();
  let cat = $("#categoryFilter").val();
  let sort = $("#sortSelect").val();
  let out = products.filter(p => {
    const matchQ = q === "" || (p.title + " " + p.desc + " " + p.category).toLowerCase().includes(q);
    const matchC = cat === "all" || p.category === cat;
    return matchQ && matchC;
  });
  if (sort === "price-asc") out.sort((a,b)=>a.price-b.price);
  else if (sort === "price-desc") out.sort((a,b)=>b.price-a.price);
  else if (sort === "newest") out = out; // sample data no date field
  else out.sort((a,b)=>b.rating - a.rating);
  return out;
}

// Cart functions
function addToCart(id, qty=1, size="M") {
  const prod = products.find(p=>p.id===id);
  if(!prod) return;
  if (cart[id]) cart[id].qty += qty;
  else cart[id] = { product: prod, qty, size };
  updateCartUI();
}

function removeFromCart(id) {
  delete cart[id];
  updateCartUI();
}

function changeQty(id, qty) {
  if (!cart[id]) return;
  cart[id].qty = Math.max(1, qty);
  updateCartUI();
}

function cartTotals(){
  let subtotal=0, items=0;
  Object.values(cart).forEach(ci=>{
    subtotal += ci.product.price * ci.qty;
    items += ci.qty;
  });
  return { subtotal, items };
}

function updateCartUI(){
  const $count = $("#cartCount");
  const $items = $("#cartItems").empty();
  const { subtotal, items } = cartTotals();
  $count.text(items);
  $("#cartSubtotal").text(formatCurrency(subtotal));
  if (items === 0) $items.html('<div class="muted">Your cart is empty.</div>');
  else {
    for (const id in cart) {
      const ci = cart[id];
      const $el = $(`
        <div class="cart-item" data-id="${id}">
          <img src="${ci.product.img}" alt="${ci.product.title}">
          <div style="flex:1">
            <div style="font-weight:700">${ci.product.title}</div>
            <div class="muted" style="font-size:0.9rem">Size: ${ci.size}</div>
            <div class="muted" style="font-size:0.9rem">${formatCurrency(ci.product.price)}</div>
          </div>
          <div>
            <div class="qty-controls">
              <button class="btn dec">−</button>
              <span class="qty">${ci.qty}</span>
              <button class="btn inc">+</button>
            </div>
            <div style="margin-top:8px"><button class="btn" style="font-size:.85rem">Remove</button></div>
          </div>
        </div>
      `);
      $items.append($el);
    }
  }
}

// Quick view
function openQuickView(product) {
  $("#qv-image").attr("src", product.img);
  $("#qv-title").text(product.title);
  $("#qv-desc").text(product.desc);
  $("#qv-price").text(formatCurrency(product.price));
  $("#qv-rating").text(product.rating + " ★");
  $("#qv-add").data("id", product.id);
  $("#quickView").attr("aria-hidden","false");
  $("#overlay").addClass("show").attr("aria-hidden","false");
}

function closeQuickView(){
  $("#quickView").attr("aria-hidden","true");
  $("#overlay").removeClass("show").attr("aria-hidden","true");
}

// Cart panel toggles
function openCartPanel(){
  $("#cartPanel").addClass("open").attr("aria-hidden","false");
  $("#overlay").addClass("show").attr("aria-hidden","false");
}
function closeCartPanel(){
  $("#cartPanel").removeClass("open").attr("aria-hidden","true");
  $("#overlay").removeClass("show").attr("aria-hidden","true");
}

$(function(){
  // initial render
  renderCategories();
  renderProducts(getFilteredProducts());
  $("#year").text(new Date().getFullYear());

  // events
  $("#search").on("input", function(){ renderProducts(getFilteredProducts()); });
  $("#categoryFilter, #sortSelect").on("change", function(){ renderProducts(getFilteredProducts()); });

  // Delegate product card buttons
  $("#products").on("click", ".add-to-cart", function(){
    const id = $(this).closest(".card").data("id");
    addToCart(id, 1);
  });

  $("#products").on("click", ".quickview", function(){
    const id = $(this).closest(".card").data("id");
    const p = products.find(x=>x.id===id);
    openQuickView(p);
  });

  // quick view actions
  $(".modal-close").on("click", closeQuickView);
  $("#overlay").on("click", function(){ closeQuickView(); closeCartPanel(); });

  $("#qv-add").on("click", function(){
    const id = $(this).data("id");
    const size = $("#qv-size").val();
    addToCart(id,1,size);
    closeQuickView();
    openCartPanel();
  });

  // cart panel
  $("#cartBtn").on("click", openCartPanel);
  $("#closeCart").on("click", closeCartPanel);

  // cart item quantity buttons (delegate)
  $("#cartItems").on("click", ".inc", function(){
    const id = $(this).closest(".cart-item").data("id");
    changeQty(id, cart[id].qty + 1);
  });
  $("#cartItems").on("click", ".dec", function(){
    const id = $(this).closest(".cart-item").data("id");
    changeQty(id, cart[id].qty - 1);
  });
  $("#cartItems").on("click", "button:contains('Remove')", function(){
    const id = $(this).closest(".cart-item").data("id");
    removeFromCart(id);
  });

  // product quick keyboard closing
  $(document).on("keydown", function(e){
    if (e.key === "Escape") { closeQuickView(); closeCartPanel(); }
  });

  // hamburger open/close simple behavior
  $(".hamburger").on("click", function(){
    // small simple menu: toggle show of search and category on small screens
    $(".search-wrap").toggle();
    $(".category-select").toggle();
  });

  // initial cart UI update
  updateCartUI();
});


// 

// $(document).ready(function(){
//     $('.menu-toggle').click(function(){
//         $('.nav-links').toggleClass('active');
//     });
// });
