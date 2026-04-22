// =================================
// GLOBAL DATA
// =================================
let products = [];
let sales = [];
let adminUser = null;


// =================================
// FETCH ADMIN
// =================================
let admin = null;
async function fetchAdmin(){

try{

const res = await fetch("/api/auth/me");

if(!res.ok) throw new Error("Not logged in");

adminUser = await res.json();

document.getElementById("loggedUser").textContent =
"Welcome, " + adminUser.username;

}catch(err){

window.location.href = "cashier-login.html";

}

}

function formatDate(date){

const d = new Date(date);

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

return `${days[d.getDay()]}, ${months[d.getMonth()]}/${d.getFullYear()}`;

}
// =================================
// CLOCK
// =================================
function updateClock(){

const el = document.getElementById("adminDateTime");

if(!el) return;

el.textContent = new Date().toLocaleString();

}

setInterval(updateClock,1000);


// =================================
// LOAD PRODUCTS
// =================================
async function loadProducts(){

try{

const res = await fetch("/api/products");

products = await res.json();

document.getElementById("totalProducts").textContent =
products.length;

calculateInventory();


checkLowStock();

}catch(err){

console.log(err);

}

}


// =================================
// LOAD SALES
// =================================
async function loadSales(){

try{

const res = await fetch("/api/sales");

sales = await res.json();

}catch(err){

console.log(err);

}

}


// =================================
// INVENTORY VALUE
// =================================
function calculateInventory(){

let value = 0;

products.forEach(p=>{

const cost = Number(p.unitCost) || 0;
const stock = Number(p.stock) || 0;

value += cost * stock;

});

document.getElementById("inventoryValue").textContent =
value.toFixed(2);

}


// ===============================
// LOAD TOTAL STOCK COST
// ===============================


// =================================
// LOW STOCK
// =================================
function checkLowStock(){

const dropdown = document.getElementById("notificationDropdown");
const badge = document.getElementById("notificationBadge");

if(!dropdown || !badge) return;

dropdown.innerHTML = "";

let notifications = [];

products.forEach(product=>{

const stock = Number(product.stock) || 0;

if(stock === 0){

notifications.push({type:"out",product});

}

else if(stock <= 5){

notifications.push({type:"low",product});

}

});

badge.textContent = notifications.length;

if(notifications.length === 0){

dropdown.innerHTML =
`<div class="notification-item success">
✔ All products well stocked
</div>`;

return;

}

notifications.forEach(n=>{

const item = document.createElement("div");

item.className = `notification-item ${n.type}`;

item.innerHTML = `
<strong>${n.product.name}</strong><br>
<small>Stock: ${n.product.stock}</small>
`;

dropdown.appendChild(item);

});

}

async function loadInvestment(){
    try{

        const res = await fetch("/api/products/total-investment");

        if(!res.ok){
            throw new Error("Failed to load investment");
        }

        const data = await res.json();

        document.getElementById("totalInvestment").textContent =
            "GH₵ " + Number(data.totalInvestment).toFixed(2);

    }catch(err){
        console.error("Investment error:", err);

        document.getElementById("totalInvestment").textContent =
            "GH₵ 0.00";
    }
}



// ===================================
// NOTIFICATION TOGGLE
// ===================================
const bell = document.querySelector(".notification-bell");
const dropdown = document.getElementById("notificationDropdown");

bell.addEventListener("click",()=>{

dropdown.classList.toggle("show");

});

window.addEventListener("click",(e)=>{

if(!e.target.closest(".notification-area")){

dropdown.classList.remove("show");

}

});


// =================================
// DASHBOARD ANALYTICS
// =================================
function updateDashboard(){

let totalRevenue = 0;
let totalProfit = 0;
let totalLoss = 0;
let totalCogs = 0;

let transactions = 0;
let todaySales = 0;
let transactionsToday = 0;
let itemsSold = 0;

let todayItemsSold = 0;
let totalItemsSold = 0;

let unitCount = 0;
let bulkCount = 0;


let bestProfitProduct = "-";
let bestProfitValue = 0;

let worstProduct = "-";
let worstValue = Infinity;

let topProduct = "-";
let topQty = 0;

let productStats = {};
const today =new Date().toDateString();

sales.forEach(sale=>{

transactions++;

const saleTotal = Number(sale.total) || 0;

totalRevenue += saleTotal;


const saleDate = new Date(sale.createdAt).toDateString();


if(saleDate === today){
todaySales += saleTotal;
transactionsToday++;
}

sale.items?.forEach(item=>{

const name = item.name;
const qty = Number(item.qty) || 0;

totalItemsSold += qty;

if(saleDate === today){
todayItemsSold += qty;
}


if(item.type === "unit") unitCount += qty;
if(item.type === "bulk") bulkCount += qty;

const product = products.find(
p => p.name.toLowerCase().trim() === name.toLowerCase().trim()
);

if(!product) return;

const cost = Number(product.unitCost) || 0;
totalCogs += cost * qty;
const price = Number(item.total) / qty;

const profit = (price - cost) * qty;

if(!productStats[name]){
productStats[name] = {profit:0,qty:0};
}

productStats[name].profit += profit;
productStats[name].qty += qty;

if(profit >= 0){
totalProfit += profit;
}else{
totalLoss += Math.abs(profit);
}

if(productStats[name].profit > bestProfitValue){
bestProfitValue = productStats[name].profit;
bestProfitProduct = name;
}

if(productStats[name].profit < worstValue){
worstValue = productStats[name].profit;
worstProduct = name;
}

if(productStats[name].qty > topQty){
topQty = productStats[name].qty;
topProduct = name;
}
document.getElementById("todaySales").textContent =
todaySales.toFixed(2);

document.getElementById("liveTransactions").textContent =
transactionsToday;

let averageSale =
transactions ? totalRevenue / transactions : 0;

document.getElementById("averageSale").textContent =
averageSale.toFixed(2);

document.getElementById("worstProduct").textContent =
worstValue === Infinity ? "-" : worstProduct;

document.getElementById("worstProductValue").textContent =
worstValue === Infinity ? "0.00" : Math.abs(worstValue).toFixed(2);

document.getElementById("liveRevenue").textContent =
totalRevenue.toFixed(2);


let totalStock = 0;

products.forEach(p=>{
totalStock += Number(p.stock) || 0;
});

document.getElementById("totalStock").textContent =
totalStock;

});

});

let healthyProducts = 0;

products.forEach(p=>{

if(p.stock > 5){
healthyProducts++;
}

});

let healthScore =
products.length
? (healthyProducts / products.length) * 100
: 0;

document.getElementById("inventoryHealth").textContent =
healthScore.toFixed(0) + "%";
document.getElementById("totalCogs").textContent = totalCogs.toFixed(2);

// After your existing calculations, add:



// =============================
// BASIC STATS
// =============================
document.getElementById("totalSales").textContent =
transactions;

document.getElementById("liveItemsSold").textContent =
todayItemsSold;


document.getElementById("totalItemsSold").textContent =
totalItemsSold;


document.getElementById("unitSalesCount").textContent =
unitCount;

document.getElementById("bulkSalesCount").textContent =
bulkCount;


// =============================
// REVENUE / PROFIT
// =============================
document.getElementById("totalRevenue").textContent =
totalRevenue.toFixed(2);

document.getElementById("totalProfit").textContent =
totalProfit.toFixed(2);

document.getElementById("totalLoss").textContent =
totalLoss.toFixed(2);

document.getElementById("netProfit").textContent =
(totalProfit - totalLoss).toFixed(2);

let margin = 0;

if(totalRevenue > 0){
margin = (totalProfit / totalRevenue) * 100;
}

document.getElementById("profitMargin").textContent =
margin.toFixed(1) + "%";


// =============================
// PRODUCT ANALYTICS
// =============================
document.getElementById("bestProfitProduct").textContent =
bestProfitProduct;

document.getElementById("bestProfitValue").textContent =
bestProfitValue.toFixed(2);


document.getElementById("lossProduct").textContent =
worstValue === Infinity ? "-" : worstProduct;

document.getElementById("lossProductValue").textContent =
worstValue === Infinity ? "0.00" : Math.abs(worstValue).toFixed(2);

document.getElementById("topSellingProduct").textContent =
topProduct;

document.getElementById("topSellingQty").textContent =
topQty;


// =============================
// LOW STOCK CARD
// =============================
const lowStockItems = products.filter(
p=>Number(p.stock) <= 5
);

document.getElementById("lowStockCount").textContent =
lowStockItems.length;

}


// =================================
// CHARTS
// =================================
function createProductChart(){

const names = products.slice(0,5).map(p=>p.name);

const stocks = products.slice(0,5).map(p=>p.stock);

new Chart(document.getElementById("productChart"),{

type:"bar",

data:{
labels:names,
datasets:[{
label:"Stock",
data:stocks,
backgroundColor:"#4CAF50"
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

}


function createSalesTypeChart(){

const unit = Number(
document.getElementById("unitSalesCount").textContent
);

const bulk = Number(
document.getElementById("bulkSalesCount").textContent
);

new Chart(document.getElementById("salesTypeChart"),{

type:"pie",

data:{
labels:["Unit","Bulk"],
datasets:[{
data:[unit,bulk],
backgroundColor:["#2196F3","#FF9800"]
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

}
// =================================
// MONTHLY SALES CHART
// =================================
function createMonthlySalesChart(){

let monthly = {};

sales.forEach(sale=>{

const date = new Date(sale.createdAt);

const month =
date.getFullYear() + "-" + (date.getMonth()+1);

if(!monthly[month]) monthly[month] = 0;

monthly[month] += Number(sale.total) || 0;

});

const labels = Object.keys(monthly);

const values = Object.values(monthly);

new Chart(document.getElementById("monthlySalesChart"),{

type:"line",

data:{
labels:labels,
datasets:[{
label:"Monthly Sales",
data:values,
borderColor:"#4CAF50",
backgroundColor:"rgba(76,175,80,0.2)",
fill:true
}]
},

options:{
responsive:true,
maintainAspectRatio:false
}

});

}
// ===============================
// TOGGLE PANELS
// ===============================

const cashierIcon = document.getElementById("cashierIcon");
const restockIcon = document.getElementById("restockIcon");

const cashierPanel = document.getElementById("cashierPanel");
const restockPanel = document.getElementById("restockPanel");

// cashier toggle
cashierIcon.addEventListener("click",()=>{

cashierPanel.classList.toggle("show");

// close other panel
restockPanel.classList.remove("show");

});

// restock toggle
restockIcon.addEventListener("click",()=>{

restockPanel.classList.toggle("show");

// close other panel
cashierPanel.classList.remove("show");

});


// close panels when clicking outside
window.addEventListener("click",(e)=>{

if(!e.target.closest(".tool-icon") &&
!e.target.closest(".dropdown-panel")){

cashierPanel.classList.remove("show");
restockPanel.classList.remove("show");

}

});
// =================================
// CASHIER LEADERBOARD
// =================================
function updateCashierLeaderboard(){

let cashierStats = {};

sales.forEach(sale=>{

const cashier = sale.cashierName || sale.cashier || "Unknown";

const total = Number(sale.total) || 0;

if(!cashierStats[cashier]){

cashierStats[cashier] = {
revenue:0,
transactions:0
};

}

cashierStats[cashier].revenue += total;

cashierStats[cashier].transactions++;

});


// convert to array and sort
const sorted = Object.entries(cashierStats)
.sort((a,b)=> b[1].revenue - a[1].revenue)
.slice(0,5); // top 5


const container =
document.getElementById("cashierLeaderboard");

container.innerHTML = "";

if(sorted.length === 0){

container.innerHTML = "<p>No sales yet</p>";

return;

}

sorted.forEach((c,index)=>{

const name = c[0];
const revenue = c[1].revenue;
const transactions = c[1].transactions;

const row = document.createElement("div");

row.className = "leaderboard-row";

row.innerHTML = `
<span class="rank">#${index+1}</span>
<span class="cashier">${name}</span>
<span class="sales">GH₵ ${revenue.toFixed(2)}</span>
<span class="trx">${transactions} sales</span>
`;

container.appendChild(row);

});

}
// =================================
// SMART RESTOCK RECOMMENDATION AI
// =================================
function updateRestockAI(){

const container = document.getElementById("restockAI");

if(!container) return;

container.innerHTML = "";

let salesCount = {};

// count sales per product
sales.forEach(sale=>{

sale.items?.forEach(item=>{

if(!salesCount[item.name]) salesCount[item.name] = 0;

salesCount[item.name] += Number(item.qty) || 0;

});

});

let recommendations = [];

products.forEach(product=>{

const name = product.name;

const stock = Number(product.stock) || 0;

const sold = salesCount[name] || 0;

// sales speed estimate
const demand = sold;

// AI restock rule
if(stock <= 5 && demand > 0){

recommendations.push({
name,
stock,
demand,
level:"urgent"
});

}

else if(stock <= 10 && demand > 5){

recommendations.push({
name,
stock,
demand,
level:"medium"
});

}

else if(demand > 15){

recommendations.push({
name,
stock,
demand,
level:"high demand"
});

}

});


// =================================
// DEMAND PREDICTION AI
// =================================
function updateDemandPrediction(){

const container = document.getElementById("demandPrediction");

if(!container) return;

container.innerHTML = "";

let salesCount = {};

// count sales per product
sales.forEach(sale=>{

sale.items?.forEach(item=>{

if(!salesCount[item.name]){
salesCount[item.name] = 0;
}

salesCount[item.name] += Number(item.qty) || 0;

});

});

products.forEach(product=>{

const name = product.name;
const stock = Number(product.stock) || 0;
const sold = salesCount[name] || 0;

if(sold === 0) return;

// estimate daily sales (assume 7 days)
const dailySales = sold / 7;

const daysLeft = stock / dailySales;

if(daysLeft <= 5){

const row = document.createElement("div");

row.className = "prediction-row";

row.innerHTML = `
<strong>${name}</strong><br>
Stock: ${stock}<br>
Sales speed: ${dailySales.toFixed(1)}/day<br>
⚠ Will run out in ${daysLeft.toFixed(1)} days
`;

container.appendChild(row);

}

});

}

// sort by demand
recommendations.sort((a,b)=> b.demand - a.demand);

// top 5
recommendations = recommendations.slice(0,5);

if(recommendations.length === 0){

container.innerHTML =
"<p>All products sufficiently stocked ✔</p>";

return;

}

recommendations.forEach(p=>{

const row = document.createElement("div");

row.className = "restock-row";

let color = "#4CAF50";

if(p.level === "urgent") color = "#ff4d4d";

if(p.level === "medium") color = "#ffa500";

row.innerHTML = `
<span class="product">${p.name}</span>
<span class="stock">Stock: ${p.stock}</span>
<span class="demand">Sold: ${p.demand}</span>
<span class="level" style="color:${color}">
${p.level.toUpperCase()}
</span>
`;

container.appendChild(row);

});

}

async function loadTotalStockCost(){

try{

const res = await fetch("/api/system/stock-cost");

if(!res.ok){
throw new Error("API error");
}

const data = await res.json();

document.getElementById("totalStockCost").innerText =
"GHS " + Number(data.totalStockCost).toFixed(2);

}catch(err){

console.error("Stock cost error:", err);


}
}


// =================================
// LOGOUT
// =================================


async function logoutCashier() {

  await fetch("/api/auth/logout", { method: "POST" });

  window.location.href = "cashier-login.html";

}



// =================================
// AUTO REFRESH
// =================================
// =================================
// AUTO REFRESH
// =================================
async function refreshDashboard(){

try{

await loadProducts();

await loadSales();

await loadTotalStockCost();
await loadInvestment();

updateDashboard();

updateDemandPrediction();

updateAIInsights();

updateCashierLeaderboard();

updateRestockAI();

}catch(err){

console.log(err);

}

}
setInterval(refreshDashboard,5000);



// =================================
// AI INSIGHTS
// =================================
function updateAIInsights(){

let totalRevenue = sales.reduce(
(sum,s)=> sum + Number(s.total || 0),0
);

let avgSale =
sales.length ? (totalRevenue / sales.length) : 0;

let bestProduct = "-";
let bestQty = 0;

let productCount = {};

sales.forEach(s=>{

s.items?.forEach(i=>{

if(!productCount[i.name]) productCount[i.name] = 0;

productCount[i.name] += Number(i.qty) || 0;

});

});

Object.entries(productCount).forEach(([name,qty])=>{

if(qty > bestQty){

bestQty = qty;

bestProduct = name;

}

});

// Sales trend
let trend =
totalRevenue > 5000
? "Sales are growing fast 📈"
: "Sales stable but can improve";

// Fraud detection
let loss =
sales.some(s=> (s.total || 0) < 0);

let fraud =
loss
? "Possible suspicious refund detected"
: "No suspicious activity";

document.getElementById("aiSalesTrend").textContent = trend;

document.getElementById("aiTrendingProduct").textContent = bestProduct;

let cashierSales = {};

sales.forEach(s=>{
const c = s.cashierName || "Unknown";

if(!cashierSales[c]) cashierSales[c] = 0;

cashierSales[c] += Number(s.total)||0;
});

let topCashier = Object.entries(cashierSales)
.sort((a,b)=>b[1]-a[1])[0];

document.getElementById("aiTopCashier").textContent =
topCashier ? topCashier[0] : "-";

document.getElementById("aiFraudAlert").textContent = fraud;

}

// =================================
// INIT
// =================================
// =================================
// INIT
// =================================
document.addEventListener("DOMContentLoaded", async ()=>{

await fetchAdmin();

await loadProducts();

await loadSales();


await loadTotalStockCost();


updateDashboard();

updateAIInsights();

updateCashierLeaderboard();

updateRestockAI();

createProductChart();

createSalesTypeChart();

createMonthlySalesChart();

updateDemandPrediction();


});