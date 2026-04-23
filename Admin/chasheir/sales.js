// ===============================
// SMARTPOS SALES MANAGEMENT (BACKEND VERSION)
// ===============================

// Protect page

let currentReportData = [];
let currentSearchReport= "";

// ===============================
// DOM
// ===============================
const todayRevenue = document.getElementById("todayRevenue");
const weekRevenue = document.getElementById("weekRevenue");
const monthRevenue = document.getElementById("monthRevenue");
const yearRevenue = document.getElementById("yearRevenue");

const analysisType = document.getElementById("analysisType");
const analysisDate = document.getElementById("analysisDate");

const aTransactions = document.getElementById("aTransactions");
const aRevenue = document.getElementById("aRevenue");
const aProfit = document.getElementById("aProfit");
const aLoss = document.getElementById("aLoss");
const aItems = document.getElementById("aItems");

const salesTableBody = document.getElementById("salesTableBody");

const filterType = document.getElementById("filterType");
const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");

// ===============================
// DATA
// ===============================
let sales = [];
let currentFilteredData = [];

// ===============================
// INIT
// ===============================

// ===============================
// LOAD SALES FROM BACKEND
// ===============================
async function loadSales() {

    try {

        const res = await fetch("/api/sales");

        if (!res.ok) throw new Error("Failed to load sales");

        sales = await res.json();

    } catch (err) {

        console.log("Sales loading error:", err);

    }

}

// ===============================
// DATE FORMATTER
// ===============================
function formatDate(date){

const d = new Date(date);

const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}/${d.getFullYear()}`;

}


function calculateRevenuePeriods(data){

let todayTotal = 0;
let weekTotal = 0;
let monthTotal = 0;
let yearTotal = 0;

const today = new Date();
const weekAgo = new Date();
weekAgo.setDate(today.getDate() - 7);

data.forEach(sale=>{

const saleDate = new Date(sale.createdAt);
const amount = Number(sale.total) || 0;

if(saleDate.toDateString() === today.toDateString()){
todayTotal += amount;
}

if(saleDate >= weekAgo){
weekTotal += amount;
}

if(
saleDate.getMonth() === today.getMonth() &&
saleDate.getFullYear() === today.getFullYear()
){
monthTotal += amount;
}

if(saleDate.getFullYear() === today.getFullYear()){
yearTotal += amount;
}

});

todayRevenue.textContent = todayTotal.toFixed(2);
weekRevenue.textContent = weekTotal.toFixed(2);
monthRevenue.textContent = monthTotal.toFixed(2);
yearRevenue.textContent = yearTotal.toFixed(2);

}

// ===============================
// RENDER TABLE
// ===============================
function renderSalesTable(data) {

    salesTableBody.innerHTML = "";

    if (data.length === 0) {

        salesTableBody.innerHTML = `
        <tr>
        <td colspan="8" style="text-align:center;">No Transactions Found</td>
        </tr>`;

        return;
    }

    data.forEach((sale) => {

        let unitQty = 0;
        let bulkQty = 0;
        let breakdown = "";

        sale.items.forEach(item => {

            const qty = Number(item.qty) || 0;
            const type = item.type || "unit";

            if (type === "unit") unitQty += qty;
            if (type === "bulk") bulkQty += qty;

            breakdown += `<div>${item.name} (${qty} ${type})</div>`;

        });

        const row = document.createElement("tr");
        row. onclick = () =>
            viewTransaction(sale._id);
        
        
        const saleDate = new Date(sale.createdAt);
const time = saleDate.toLocaleTimeString();

row.innerHTML = `
<td>${formatDate(sale.createdAt)}</td>
<td>${time}</td>
<td>${breakdown}</td>
<td>${unitQty}</td>
<td>${bulkQty}</td>
<td>${Number(sale.total).toFixed(2)}</td>
<td>${Number(sale.cashReceived || 0).toFixed(2)}</td>
<td>${Number(sale.balance || 0).toFixed(2)}</td>
<td>

</td>
`;

        salesTableBody.appendChild(row);

    });

}

let selectedSale = null;

function viewTransaction(id){

const sale = sales.find(s => s._id === id);

if(!sale) return;

selectedSale = sale;

let itemsHTML = "";

sale.items.forEach(item =>{

itemsHTML += `
<div>
${item.name} - ${item.qty} (${item.type})
</div>
`;

});

document.getElementById("transactionDetails").innerHTML = `

<p><strong>Transaction ID:</strong> ${sale._id}</p>

<p><strong>Date:</strong> ${formatDate(sale.createdAt)}</p>

<p><strong>Cashier:</strong> ${sale.cashierName || "Unknown"}</p>

<hr>

<h4>Items</h4>

${itemsHTML}

<hr>

<p><strong>Total:</strong> GH₵ ${sale.total}</p>
<p><strong>PaymentMethod:</strong>  ${sale.paymentMethod}</p>




`;

document.getElementById("transactionModal").style.display = "flex";

}
function closeTransactionModal(){

document.getElementById("transactionModal").style.display = "none";

}
function printReceipt(){

const content = document.getElementById("transactionDetails").innerHTML;

const win = window.open("", "", "width=400,height=600");

win.document.write(`
<html>
<head>
<title>Receipt</title>
</head>
<body>

<h3>SmartPOS Receipt</h3>

${content}

</body>
</html>
`);

win.document.close();
win.print();

}

// ===============================
// SALES ANALYZER
// ===============================
function analyzeSales(){

if(!analysisDate.value){
alert("Please select a date");
return;
}

const type = analysisType.value;
const selectedDate = new Date(analysisDate.value);

let filtered = [];

sales.forEach(sale=>{

const saleDate = new Date(sale.createdAt);

if(type === "day"){

if(saleDate.toDateString() === selectedDate.toDateString()){
filtered.push(sale);
}

}

if(type === "week"){

const start = new Date(selectedDate);
start.setDate(start.getDate()-7);

if(saleDate >= start && saleDate <= selectedDate){
filtered.push(sale);
}

}

if(type === "month"){

if(
saleDate.getMonth() === selectedDate.getMonth() &&
saleDate.getFullYear() === selectedDate.getFullYear()
){
filtered.push(sale);
}

}

if(type === "year"){

if(saleDate.getFullYear() === selectedDate.getFullYear()){
filtered.push(sale);
}

}

});

calculateAnalysis(filtered);
calculateRevenuePeriods(sales);
renderSalesTable(filtered);

}


function groupSales(){

const type = document.getElementById("groupType").value;

if(type === "none"){
renderSalesTable(sales);
return;
}

const grouped = {};

sales.forEach(sale=>{

const d = new Date(sale.createdAt);

let key = "";

if(type === "day"){
key = d.toLocaleDateString("en-US",{weekday:"long"});
}

if(type === "month"){
key = d.toLocaleDateString("en-US",{month:"long", year:"numeric"});
}

if(type === "year"){
key = d.getFullYear();
}

if(!grouped[key]){
grouped[key] = [];
}

grouped[key].push(sale);

});

renderGroupedSales(grouped);

}

function renderGroupedSales(grouped){

salesTableBody.innerHTML = "";

for(const group in grouped){

const header = document.createElement("tr");

header.innerHTML = `
<td colspan="8" style="background:#f4f4f4;font-weight:bold; color:black;">
${group}
</td>
`;

salesTableBody.appendChild(header);

grouped[group].forEach(sale=>{

let unitQty = 0;
let bulkQty = 0;

sale.items.forEach(item=>{

if(item.type === "unit") unitQty += item.qty;
if(item.type === "bulk") bulkQty += item.qty;

});

const row = document.createElement("tr");

row.onclick = ()=>viewTransaction(sale._id);

const saleDate = new Date(sale.createdAt);
const time = saleDate.toLocaleTimeString();

const cash = Number(sale.cashReceived) || 0;
const total = Number(sale.total) || 0;
const balance = cash - total;

row.innerHTML = `
<td>${formatDate(sale.createdAt)}</td>
<td>${time}</td>
<td>${sale.items.map(i => i.name).join(", ")}</td>
<td>${unitQty}</td>
<td>${bulkQty}</td>
<td>${total.toFixed(2)}</td>
<td>${cash.toFixed(2)}</td>
<td>${Number(sale.balance || 0).toFixed(2)}</td>
`;

salesTableBody.appendChild(row);

});

}

}


// ===============================
// CALCULATE ANALYSIS RESULTS
// ===============================
function calculateAnalysis(data){

let revenue = 0;
let loss = 0;
let items = 0;

data.forEach(sale=>{

if(sale.refunded){
loss += Number(sale.total) || 0;
}else{
revenue += Number(sale.total) || 0;
}

// ✅ SAFE CHECK
if(Array.isArray(sale.items)){
sale.items.forEach(item => {
items += Number(item.qty) || 0;
});
}

});

const profit = revenue - loss;

aTransactions.textContent = data.length;
aRevenue.textContent = revenue.toFixed(2);
aProfit.textContent = profit.toFixed(2);
aLoss.textContent = loss.toFixed(2);
aItems.textContent = items;

}

document.addEventListener("DOMContentLoaded", async () => {

await loadSales();

renderSalesTable(sales);

calculateRevenuePeriods(sales);
calculateAnalysis(sales)

});

// ===============================
// FILTER SYSTEM
// ===============================
function applyFilter() {

let filtered = [...sales];
const type = filterType.value;
const today = new Date();

if (type === "daily") {

filtered = filtered.filter(sale => {

const d = new Date(sale.createdAt);
return d.toDateString() === today.toDateString();

});

}

if (type === "weekly") {

const start = new Date();
start.setDate(today.getDate()-7);

filtered = filtered.filter(sale => {

const d = new Date(sale.createdAt);
return d >= start && d <= today;

});

}

if (type === "monthly") {

const month = today.getMonth();
const year = today.getFullYear();

filtered = filtered.filter(sale => {

const d = new Date(sale.createdAt);
return d.getMonth() === month && d.getFullYear() === year;

});

}

if (type === "yearly") {

const year = today.getFullYear();

filtered = filtered.filter(sale =>
new Date(sale.createdAt).getFullYear() === year
);

}

if (type === "custom" && startDate.value && endDate.value) {

const start = new Date(startDate.value);
const end = new Date(endDate.value);

filtered = filtered.filter(sale => {

const d = new Date(sale.createdAt);
return d >= start && d <= end;

});

}

currentFilteredData = filtered;

/*renderSalesTable(filtered);
calculateRevenuePeriods(filtered);
*/
renderSalesTable(filtered); // 👈 ADD THIS BACK
calculateRevenuePeriods(filtered);
calculateAnalysis(filtered);

}

// ===============================
// REFUND SALE
// ===============================


// ===============================
// EXPORT CSV
// ===============================
// ===============================
// EXPORT PDF
// ===============================
async function exportPDF() {

  const reportType = document.getElementById("reportType").value;

  let filtered = [];
  const today = new Date();

  sales.forEach(sale => {

    const d = new Date(sale.createdAt);

    if (reportType === "daily") {
      if (d.toDateString() === today.toDateString()) {
        filtered.push(sale);
      }
    }

    if (reportType === "monthly") {
      if (
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      ) {
        filtered.push(sale);
      }
    }

    if (reportType === "yearly") {
      if (d.getFullYear() === today.getFullYear()) {
        filtered.push(sale);
      }
    }

  });

  // 🔍 DEBUG (optional)
  console.log("Filtered Sales:", filtered);

  generatePDF(filtered, reportType);
}


// ===============================
// GENERATE PDF (PRINT VIEW)
// ===============================
function generatePDF(data, reportType) {

  if (!data || data.length === 0) {
    alert("No sales data available for this report.");
    return;
  }

  let html = `
    <h2>SmartPOS Sales Report</h2>
    <p><strong>Report Type:</strong> ${reportType.toUpperCase()}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

    <table border="1" cellspacing="0" cellpadding="5">
      <thead>
        <tr>
          <th>Date</th>
          <th>Time</th>
          <th>Cashier</th>
          <th>Items</th>
          <th>Units Sold</th>
          <th>Total (GH₵)</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach(sale => {

    const date = new Date(sale.createdAt);

    let items = "";
    let units = 0;

    (sale.items || []).forEach(item => {
      items += item.name + ", ";
      units += Number(item.qty) || 0;
    });

    html += `
      <tr>
        <td>${date.toLocaleDateString()}</td>
        <td>${date.toLocaleTimeString()}</td>
        <td>${sale.cashierName || "Unknown"}</td>
        <td>${items}</td>
        <td>${units}</td>
        <td>${Number(sale.total).toFixed(2)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  const win = window.open("", "", "width=900,height=700");

  win.document.write(`
    <html>
      <head>
        <title>Sales Report</title>
        <style>
          body {
            font-family: Arial;
            padding: 20px;
          }
          h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background: #222;
            color: white;
          }
          td, th {
            padding: 8px;
            text-align: left;
          }
        </style>
      </head>
      <body>

        ${html}

      </body>
    </html>
  `);

  win.document.close();

  // ✅ FIX: WAIT FOR CONTENT BEFORE PRINT
  win.onload = function () {
    win.focus();
    win.print();
  };

}


// ===============================
// SEARCH TRANSACTIONS
// ===============================
function searchTransactions(){

const keyword = document
.getElementById("searchTransaction")
.value
.toLowerCase();

const filtered = sales.filter(sale=>{

let itemNames = sale.items
.map(i=>i.name.toLowerCase())
.join(" ");

const cashier = (sale.cashierName || "").toLowerCase();

const date = formatDate(sale.createdAt).toLowerCase();

return (
itemNames.includes(keyword) ||
cashier.includes(keyword) ||
date.includes(keyword)
);

});

currentFilteredData = filtered;

renderSalesTable(filtered);

}

function searchSalesReport(){

const keyword = document
.getElementById("searchReport")
.value
.trim()
.toLowerCase();

if(!keyword){
alert("Please enter something to search");
return;
}

let filtered = [];

const days = [
"sunday","monday","tuesday",
"wednesday","thursday",
"friday","saturday"
];

/* =========================
   DAY RANGE SEARCH
========================= */

if((keyword.includes("-") || keyword.includes("to")) &&
days.some(d=>keyword.includes(d))){

let parts;

if(keyword.includes("-")){
parts = keyword.split("-");
}else{
parts = keyword.split("to");
}

const startDay = parts[0].trim();
const endDay = parts[1].trim();

const startIndex = days.indexOf(startDay);
const endIndex = days.indexOf(endDay);

if(startIndex !== -1 && endIndex !== -1){

filtered = sales.filter(sale=>{

const saleDate = new Date(sale.createdAt);
const saleDayIndex = saleDate.getDay();

return saleDayIndex >= startIndex && saleDayIndex <= endIndex;

});

}

}

/* =========================
   DATE RANGE SEARCH
========================= */

else if(keyword.includes("-") || keyword.includes("to")){

let parts;

if(keyword.includes("-")){
parts = keyword.split("-");
}else{
parts = keyword.split("to");
}

const startDate = new Date(parts[0].trim());
const endDate = new Date(parts[1].trim());

if(!isNaN(startDate) && !isNaN(endDate)){

filtered = sales.filter(sale=>{

const saleDate = new Date(sale.createdAt);

return saleDate >= startDate && saleDate <= endDate;

});

}

}

/* =========================
   EXACT DATE SEARCH
========================= */

else{

const searchDate = new Date(keyword);

if(!isNaN(searchDate)){

filtered = sales.filter(sale=>{

const saleDate = new Date(sale.createdAt);

return (
saleDate.getFullYear() === searchDate.getFullYear() &&
saleDate.getMonth() === searchDate.getMonth() &&
saleDate.getDate() === searchDate.getDate()
);

});

}

/* =========================
   NORMAL SEARCH
========================= */

else{

const keywords = keyword.split(" ");

filtered = sales.filter(sale=>{

const d = new Date(sale.createdAt);

const day = d.toLocaleDateString("en-US",{weekday:"long"}).toLowerCase();
const month = d.toLocaleDateString("en-US",{month:"long"}).toLowerCase();
const year = d.getFullYear().toString();

const cashier = (sale.cashierName || "").toLowerCase();

const items = sale.items
.map(i=>i.name.toLowerCase())
.join(" ");

const searchable = `
${day}
${month}
${year}
${cashier}
${items}
`;

return keywords.every(k => searchable.includes(k));

});

}

}

/* SAVE REPORT */
currentReportData = filtered;
currentSearchReport = keyword;
if(filtered.length === 0){
    alert("No result found");
    return;
}

generateReport(filtered);

}


function generateReport(data){

let revenue = 0;
let loss = 0;
let unitSold = 0;
let bulkSold = 0;

let rows = "";

data.forEach(sale=>{

revenue += Number(sale.total);

let unit = 0;
let bulk = 0;

sale.items.forEach(item=>{

if(item.type === "unit") unit += Number(item.qty);
if(item.type === "bulk") bulk += Number(item.qty);

});

unitSold += unit;
bulkSold += bulk;

if(sale.refunded){
loss += Number(sale.total);
}

rows += `
<tr>
<td>${sale.cashierName || "Unknown"}</td>
<td>${sale.items.map(i=>i.name).join(", ")}</td>
<td>${unit}</td>
<td>${bulk}</td>
<td>${new Date(sale.createdAt).toLocaleString()}</td>
<td>GH₵ ${Number(sale.total).toFixed(2)}</td>
</tr>
`;

});

const profit = revenue - loss;

/* SUMMARY CARDS (screen only) */

document.getElementById("reportSummary").innerHTML = `

<p><strong>Total Transactions:</strong> ${data.length}</p>
<p><strong>Unit Sold:</strong> ${unitSold}</p>
<p><strong>Bulk Sold:</strong> ${bulkSold}</p>
<p><strong>Total Revenue:</strong> GH₵ ${revenue.toFixed(2)}</p>
<p><strong>Profit:</strong> GH₵ ${profit.toFixed(2)}</p>
<p><strong>Loss:</strong> GH₵ ${loss.toFixed(2)}</p>

`;


/* TABLE */

document.getElementById("reportTable").innerHTML = `

<table>

<tr>
<th>Cashier</th>
<th>Items</th>
<th>Unit Sold</th>
<th>Bulk Sold</th>
<th>Date</th>
<th>Total</th>
</tr>

${rows}

</table>

`;

document.getElementById("reportModal").style.display = "flex";

}

function exportReportPDF1(){

if(currentReportData.length === 0){

alert("No report to export. Please search first.");
return;

}

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

//
let totalTransactions = currentReportData.length;
let unitSold = 0;
let bulkSold = 0;
let revenue = 0;
let profit = 0;
let loss = 0;

currentReportData.forEach(sale => {

    revenue += Number(sale.total || 0);
    profit += Number(sale.profit || 0);
    loss += Number(sale.loss || 0);

    sale.items.forEach(item => {

        if(item.type === "unit"){
            unitSold += Number(item.qty);
        }

        if(item.type === "bulk"){
            bulkSold += Number(item.qty);
        }

    });

});
//
doc.setFontSize(16);
doc.text("SmartPOS Sales Report", 14, 20);

doc.setFontSize(12);
doc.text("Search: " + currentSearchReport, 14, 30);

doc.setFontSize(11);
doc.text("Total Transactions: " + totalTransactions, 14, 45);
doc.text("Unit Sold: " + unitSold, 14, 52);
doc.text("Bulk Sold: " + bulkSold, 14, 59);
doc.text("Revenue: GHS " + revenue.toFixed(2), 14, 66);
doc.text("Loss: GHS " + loss.toFixed(2), 14, 80);
doc.text("Generated: " + new Date().toLocaleString(), 14, 36);

const pageCount = doc.internal.getNumberOfPages();

for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.text("Page " + i + " of " + pageCount, 180, 290);
}



doc.setFontSize(16);
doc.text("SmartPOS Sales Report", 14, 20);

doc.setFontSize(12);
doc.text("Search: " + currentSearchReport, 14, 30);

let y = 95;

doc.setFontSize(10);

// Table Header
doc.text("Cashier", 14, y);
doc.text("Items", 40, y);
doc.text("Units", 95, y);
doc.text("Bulk", 115, y);
doc.text("Date", 135, y);
doc.text("Total", 175, y);

y += 8;

// Export ONLY searched data


currentReportData.forEach(sale => {

let unit = 0;
let bulk = 0;

sale.items.forEach(item => {

if(item.type === "unit") unit += Number(item.qty);
if(item.type === "bulk") bulk += Number(item.qty);

});

const items = sale.items.map(i => i.name).join(", ");

const date = new Date(sale.createdAt).toLocaleDateString();

doc.text(String(sale.cashierName || "Unknown"), 14, y);
doc.text(items.substring(0,25), 40, y);
doc.text(String(unit), 95, y);
doc.text(String(bulk), 115, y);
doc.text(date, 135, y);
doc.text("GHS " + Number(sale.total).toFixed(2), 175, y);

y += 8;

if(y > 280){
doc.addPage();
y = 20;
}

});

doc.save("smartpos_sales_report.pdf");

}



function closeReport(){

document.getElementById("reportModal").style.display = "none";

}