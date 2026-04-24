// ===============================
// 🔐 SESSION PROTECTION
// ===============================
let currentCashier = null;

async function fetchCurrentCashier() {
  try {

    const res = await fetch("/api/auth/me");

    if (!res.ok) throw new Error("Not authenticated");

    currentCashier = await res.json();

    

    const userEl = document.getElementById("loggedUser");

    if (userEl) {
      userEl.textContent = "Welcome, " + currentCashier.username;
    }

  } catch (err) {

    console.log(err);

    window.location.href = "cashier-login.html";

  }
}

// ===============================
// DOM ELEMENTS
// ===============================
const productSelect = document.getElementById("productSelect");
const productSearch = document.getElementById("productSearch");
const priceInput = document.getElementById("priceInput");
const barcodeInput = document.getElementById("barcodeInput");
const saleType = document.getElementById("saleType");
const cartTable = document.getElementById("cartTable");

const discountInput = document.getElementById("discountInput");
const paymentMethod = document.getElementById("paymentMethod");
const cashReceivedInput = document.getElementById("cashReceived");
const balanceAmount = document.getElementById("balanceAmount");

const grandTotalEl = document.getElementById("grandTotal");
const grandTotalDisplay = document.getElementById("grandTotalDisplay");
const cartItemCount = document.getElementById("cartItemCount");

const dailySalesEl = document.getElementById("dailySales");
const monthlyRevenueEl = document.getElementById("monthlyRevenue");

const clearCartBtn = document.getElementById("clearCartBtn");
const scannerContainer = document.getElementById("scanner-container");

// ===============================
// VARIABLES
// ===============================
let products = [];
let cart = [];
let grandTotal = 0;
let dailyTotal = 0;


// ===============================
// 🔌 SOCKET CONNECTION
// ===============================
let socket;

function initSocket(){

  socket = io(window.location.origin, {
    transports: ["websocket"],
    withCredentials: true
  });

  socket.on("connect", () => {
    console.log("🟢 Cashier connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);
  });

  // 🔥 RECEIVE NEW SALE (from other devices)
  socket.on("new-sale", (sale) => {

    console.log("📦 Sale update received:", sale);

    // update daily total instantly
    dailyTotal += Number(sale.total || 0);
    updateDaily();

    // reload products (stock updated)
    loadProducts();

  });

}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", async () => {

  initSocket();

  await fetchCurrentCashier();

  await loadProducts();

  await loadDailyTotal();

  updateDaily();

  updateMonthly();

  updateTime(); // start clock immediately

});


// ===============================
// LOAD PRODUCTS
// ===============================
async function loadProducts() {

  try {

    const res = await fetch("/api/products");

    products = await res.json();

    renderProductOptions(products);

  } catch (err) {

    console.log("Product loading error", err);

  }

}

// ===============================
// RENDER PRODUCTS
// ===============================
function renderProductOptions(products) {

    const grid = document.getElementById("productGrid");

    grid.innerHTML = "";

    products.forEach(product => {

        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
    <div class="card-top">
        <span class="stock">${product.stock || 0}</span>
    </div>

    <div class="card-body">
        <div class="emoji">${product.emoji || "📦"}</div>
        <h4>${product.name}</h4>
        <span class="stock1"> Unit: ₵ ${product.unitPrice || product.price}</span>
        <span class="stock1"> Bulk: ₵ ${product.bulkPrice || product.price}</span>
    </div>
`;

        // 🔥 CLICK = ADD TO CART
        card.onclick = () => addProductToCart(product);

        grid.appendChild(card);
    });

}

// ===============================
// PRODUCT SEARCH
// ===============================
productSearch?.addEventListener("input", function () {

  const keyword = this.value.toLowerCase();

  if (!keyword) {

    renderProductOptions(products);

    return;

  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(keyword) ||
    p.barcode.includes(keyword)
  );

  renderProductOptions(filtered);

  // AUTO SELECT FIRST RESULT
  if (filtered.length > 0) {

    productSelect.value = filtered[0].barcode;

    updatePrice();

  }

});

// ===============================
// AUTO PRICE UPDATE
// ===============================
function updatePrice() {

  const product = products.find(p => p.barcode === productSelect.value);

  if (!product) return;

  priceInput.value =
    saleType.value === "bulk"
      ? product.bulkPrice || product.price
      : product.unitPrice || product.price;

}

productSelect?.addEventListener("change", updatePrice);
saleType?.addEventListener("change", updatePrice);

// ===============================
// BARCODE INPUT SCANNER
// ===============================
barcodeInput?.addEventListener("keydown", async function (e) {

  if (e.key === "Enter") {

    e.preventDefault();

    const barcode = barcodeInput.value.trim();

    if (!barcode) return;

    try {

      const res = await fetch(`/api/products/barcode/${barcode}`);

      if (!res.ok) {

        alert("Product not found");

        barcodeInput.value = "";

        return;

      }

      const product = await res.json();

      addProductToCart(product);

    } catch (err) {

      console.log(err);

    }

    barcodeInput.value = "";

  }

});

// ===============================
// SOUND
// ===============================
const beep = new Audio("beep.mp3");

function playBeep() {

  beep.currentTime = 0;

  beep.play().catch(()=>{});

}

// ===============================
// ADD PRODUCT TO CART
// ===============================

// ADD PRODUCT FROM BARCODE SCAN
function addProductToCart(product) {

  const type = document.getElementById("saleType").value || "unit";
  const qty = parseInt(document.getElementById("qtyInput").value) || 1;

  let price = 0;

  if (type === "bulk") {
    price = Number(product.bulkPrice || product.price);
  } else {
    price = Number(product.unitPrice || product.price);
  }

  const total = price * qty;

  const item = {
    productId: product. _id,
    name: product.name,
    type: type,              // ✅ IMPORTANT
    qty: qty,
    price: price,
    total: total
  };

  cart.push(item);
  grandTotal += total;

  renderCart();
  playBeep();
}



// MANUAL ADD
window.addToCart = function () {
  const product = products.find(p => p.barcode === productSelect.value);
  const qty = parseInt(document.getElementById("qtyInput").value);
  const type = saleType.value;

  if (!product || qty <= 0) {
    alert("Invalid product");
    return;
  }

  let price;
  if (type === "bulk") {
    price = parseFloat(product.bulkPrice || product.price);
  } else {
    price = parseFloat(product.unitPrice || product.price);
  }

  const total = price * qty;

  const item = {
    productId: product. _id,
    name: product.name,
    type: type,
    qty: qty,
    price: price,
    total: total
  };

  cart.push(item);
  grandTotal += total;
  renderCart();
};

function removeCartItem(index) {
  // Subtract the item's total from grand total
  grandTotal -= cart[index].total;
  // Remove the item from the cart
  cart.splice(index, 1);
  // Re-render the table and update all totals
  renderCart();
}
// ===============================
// RENDER CART
// ===============================

function renderCart() {
  if (!cartTable) return;

  cartTable.innerHTML = "";

  cart.forEach((item, index) => {

    const row = cartTable.insertRow();

    row.insertCell(0).innerText = item.name;
    row.insertCell(1).innerText = item.type;

    // ✅ QUANTITY WITH BUTTONS
    const qtyCell = row.insertCell(2);
    qtyCell.innerHTML = `
      <button onclick="decreaseQty(${index})">-</button>
      <span style="margin:0 8px;">${item.qty}</span>
      <button onclick="increaseQty(${index})">+</button>
    `;

    row.insertCell(3).innerText = item.total.toFixed(2);

    // ACTION BUTTON
    const actionCell = row.insertCell(4);
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.onclick = () => removeCartItem(index);
    actionCell.appendChild(deleteBtn);
  });

  updateTotals();
}
function increaseQty(index) {

  const item = cart[index];

  item.qty += 1;
  item.total = item.qty * item.price;

  grandTotal += item.price;

  renderCart();
}
function decreaseQty(index) {

  const item = cart[index];

  item.qty -= 1;
  item.total = item.qty * item.price;

  grandTotal -= item.price;

  // REMOVE ITEM IF ZERO
  if (item.qty <= 0) {
    cart.splice(index, 1);
  }

  renderCart();
}
// ===============================
// TOTALS
// ===============================
function updateTotals() {

  const discount = Number(discountInput?.value) || 0;

  const finalTotal = Math.max(grandTotal - discount, 0);

  if (grandTotalEl) grandTotalEl.textContent = finalTotal.toFixed(2);

  if (grandTotalDisplay) grandTotalDisplay.textContent = finalTotal.toFixed(2);

  if (cartItemCount) cartItemCount.textContent = cart.length;

  calculateBalance();

}

function calculateBalance() {

  const received = Number(cashReceivedInput?.value) || 0;

  const total = Number(grandTotalDisplay?.textContent) || 0;

  if (balanceAmount) {
    balanceAmount.textContent = (received - total).toFixed(2);
  }

}

discountInput?.addEventListener("input", updateTotals);
cashReceivedInput?.addEventListener("input", calculateBalance);

// ===============================
// CLEAR CART
// ===============================
function clearCart() {
    cart.length = 0;   // clear original array
    grandTotal = 0;
    renderCart();
}


window.printReceipt = async function () {

  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }

  const finalTotal = Number(grandTotalDisplay.textContent);

  try {

    const res = await fetch("/api/sales", {   // ✅ FIXED HERE
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include", // ✅ keep session working
      body: JSON.stringify({
        cashierId: currentCashier?.id,
        cashierName: currentCashier?.username,
        items: cart,
        total: finalTotal,
        paymentMethod: paymentMethod.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Sale failed");
      return;
    }

    showReceiptModal();

    cart = [];
    grandTotal = 0;

    renderCart();

    await loadProducts();
    await loadDailyTotal();

  } catch (err) {
    console.error("NETWORK ERROR:", err);
    alert("Cannot connect to server.");
  }
};

 
  
function showReceiptModal(){

  const total = parseFloat(document.getElementById('grandTotalDisplay').textContent) || 0;
  const disc = parseFloat(document.getElementById('discountInput').value) || 0;
  const method = document.getElementById('paymentMethod').value;
  const cash = parseFloat(document.getElementById('cashReceived').value) || 0;
  const change = method === 'Cash' ? Math.max(0, cash - total) : 0;

  const now = new Date();
  const orderId = 'ORD-' + Date.now();

  const itemsHTML = cart.map(c => `
    <div class="receipt-item-row">
      <span>${c.name} (${c.type}) ×${c.qty}</span>
      <span>GH₵ ${(c.price * c.qty).toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('receiptPaper').innerHTML = `
    <h2>SmartPOS Supermarket</h2>
    <p class="receipt-center">Accra, Ghana</p>
    <p class="receipt-center">${now.toLocaleString()}</p>
    <p class="receipt-center">Receipt #: ${orderId}</p>
    <p class="receipt-center">Cashier: ${currentCashier?.username || '-'}</p>

    <hr/>
    ${itemsHTML}
    <hr/>

    ${disc > 0 ? `
      <div class="receipt-item-row">
        <span>Discount</span>
        <span>-GH₵ ${disc.toFixed(2)}</span>
      </div>` : ''}

    <div class="receipt-item-row receipt-total">
      <span>GRAND TOTAL</span>
      <span>GH₵ ${total.toFixed(2)}</span>
    </div>

    <div class="receipt-item-row">
      <span>Payment</span>
      <span>${method}</span>
    </div>

    ${method === 'Cash' ? `
      <div class="receipt-item-row">
        <span>Cash</span>
        <span>GH₵ ${cash.toFixed(2)}</span>
      </div>
      <div class="receipt-item-row">
        <span>Change</span>
        <span>GH₵ ${change.toFixed(2)}</span>
      </div>` : ''}

    <hr/>
    <p class="receipt-center" style="font-size:11px;">
      Items purchased are NOT refundable.
    </p>
    <p class="receipt-center">Thank you!</p>
  `;

  // ✅ SHOW MODAL
  document.getElementById('receiptModal').classList.add('open');


  
}
window.closeModal = function(id){
  document.getElementById(id).classList.remove('open');
};
  

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.modal-overlay').forEach(o=>{
    o.addEventListener('click',e=>{
      if(e.target===o)o.classList.remove('open');
    });
  });
});


function doPrint(){

  const content = document.getElementById('receiptPaper').innerHTML;

  if(!content){
    alert("Receipt empty");
    return;
  }

  const printWindow = window.open('', '', 'width=400,height=600');

  printWindow.document.write(`
    <html>
      <head>
        <title>Print Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 280px;
            margin: auto;
            padding: 10px;
          }
          h2 { text-align:center; }
          .receipt-center { text-align:center; }
          .receipt-item-row {
            display:flex;
            justify-content:space-between;
          }
          .receipt-total {
            font-weight:bold;
            font-size:14px;
          }
          hr { border: none; border-top: 1px dashed #000; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `);

  printWindow.document.close();

  // wait for content to load
  printWindow.onload = function () {
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
}


// ===============================
// DAILY SALES
// ===============================
async function loadDailyTotal() {

  try {

    const res = await fetch("/api/analytics/daily-total");

    const data = await res.json();

    dailyTotal = Number(data.total) || 0;

    updateDaily();

  } catch (err) {

    console.log(err);

  }

}

function updateDaily() {

  if (dailySalesEl)
    dailySalesEl.textContent = dailyTotal.toFixed(2);

}



// ===============================
// MONTHLY REVENUE
// ===============================
async function updateMonthly() {

  try {

    const res = await fetch("/api/analytics/monthly-revenue");

    const data = await res.json();

    if (monthlyRevenueEl) {
      monthlyRevenueEl.textContent = Number(data.total).toFixed(2);
    }

  } catch (err) {

    console.log("Monthly revenue error", err);

  }

}
// CAMERA BARCODE SCANNER
// =================================
function startScanner(){

scannerContainer.style.display="block";

Quagga.init({

inputStream:{

type:"LiveStream",

target:scannerContainer,

constraints:{
facingMode:"environment"
}

},

decoder:{

readers:[
"ean_reader",
"code_128_reader",
"upc_reader"
]

}

},function(err){

if(err){

console.log(err);
return;

}

Quagga.start();

});

}

Quagga.onDetected(async function(data){

const code=data.codeResult.code;

try{

const res=await fetch(`/api/products/barcode/${code}`);

if(!res.ok){

alert("Product not found");

stopScanner();

return;

}

const product=await res.json();

addProductToCart(product);

}catch(err){

console.log(err);

}

stopScanner();

});

function stopScanner(){

Quagga.stop();

scannerContainer.style.display="none";

}

// ===============================
// CLOCK
// ===============================
function updateTime() {

  const el = document.getElementById("dateTime");

  if (!el) return;

  el.textContent = new Date().toLocaleString();

}

setInterval(updateTime, 1000);


// ===============================
// LOGOUT
// ===============================
async function logoutCashier() {

  await fetch("/api/auth/logout", { method: "POST" });

  window.location.href = "cashier-login.html";

}