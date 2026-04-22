// ================= GLOBAL SALES =================
let selectedCashierActivity = null;
let sales = [];


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", () => {

loadSales();

// SEARCH BUTTON
document
.getElementById("searchCashierBtn")
.addEventListener("click", searchCashier);

// ENTER KEY SEARCH
document
.getElementById("searchCashier")
.addEventListener("keypress", function(e){

if(e.key === "Enter"){
searchCashier();
}

});

});


// ================= LOAD SALES =================

async function loadSales(){

try{

const res = await fetch("/api/sales");

sales = await res.json();

renderSales(sales);

}catch(err){

console.error("Failed to load sales", err);

}

}


// ================= DATE FORMAT =================

function formatDateTime(date){

const d = new Date(date);

return {
datePart: d.toLocaleDateString(),
timePart: d.toLocaleTimeString()
};

}


// ================= RENDER SALES =================

function renderSales(data){

const table = document.getElementById("cashierActivityTable");

table.innerHTML = "";

if(data.length === 0){

table.innerHTML = `<tr><td colspan="6">No sales found</td></tr>`;
return;

}

data.forEach(sale => {

const {datePart, timePart} = formatDateTime(sale.createdAt);

const items = sale.items
.map(item => `${item.name} x${item.qty}`)
.join(", ");

const row = `
<tr onclick='openCashierTransaction(${JSON.stringify(sale)})' style="cursor:pointer;">
<td>${datePart}</td>
<td>${timePart}</td>
<td style="color:blue;font-weight:bold;">
${sale.cashier || sale.cashierName || "Unknown"}
</td>
<td>${items}</td>
<td>GH₵ ${sale.total.toFixed(2)}</td>
<td>${sale.paymentMethod}</td>
</tr>
`;

table.innerHTML += row;

});

}


// ================= SEARCH FUNCTION =================

function searchCashier(){

const keyword = document
.getElementById("searchCashier")
.value
.trim()
.toLowerCase();

if(!keyword){

renderSales(sales);
return;

}

const words = keyword.split(" ");

const days = [
"sunday","monday","tuesday","wednesday",
"thursday","friday","saturday"
];

const months = [
"january","february","march","april","may","june",
"july","august","september","october","november","december"
];

const filtered = sales.filter(sale=>{

const d = new Date(sale.createdAt);

const cashier = (sale.cashier || sale.cashierName || "").toLowerCase();

if(!cashier.includes(words[0])) return false;

const dayIndex = d.getDay();
const monthIndex = d.getMonth();
const year = d.getFullYear();

for(let i=1;i<words.length;i++){

if(words[i].includes("-")){

const [start,end] = words[i].split("-");


// DAY RANGE
if(days.includes(start) && days.includes(end)){

const startIndex = days.indexOf(start);
const endIndex = days.indexOf(end);

if(dayIndex < startIndex || dayIndex > endIndex){
return false;
}

}


// MONTH RANGE
if(months.includes(start) && months.includes(end)){

const startIndex = months.indexOf(start);
const endIndex = months.indexOf(end);

if(monthIndex < startIndex || monthIndex > endIndex){
return false;
}

}


// YEAR RANGE
if(!isNaN(start) && !isNaN(end)){

if(year < Number(start) || year > Number(end)){
return false;
}

}

}

}

return true;

});

renderSales(filtered);

}
function openCashierTransaction(sale){

const popup = document.getElementById("cashierPopup");

popup.style.display = "block";

const body = document.getElementById("cashierPopupBody");

const d = new Date(sale.createdAt);

const items = sale.items
.map(i => `${i.name} x${i.qty}`)
.join("<br>");

body.innerHTML = `

<h3>Cashier Transaction</h3>

<p><strong>Cashier:</strong> ${sale.cashier || sale.cashierName}</p>

<p><strong>Date:</strong> ${d.toLocaleDateString()}</p>

<p><strong>Time:</strong> ${d.toLocaleTimeString()}</p>

<p><strong>Items Sold:</strong><br>${items}</p>

<p><strong>Total:</strong> GH₵ ${sale.total}</p>

<p><strong>Payment Method:</strong> ${sale.paymentMethod}</p>

<br>

<button onclick='exportTransactionPDF(${JSON.stringify(sale)})'>
Export PDF
</button>

`;
}
function exportTransactionPDF(sale){

const { jsPDF } = window.jspdf;

const doc = new jsPDF();

const d = new Date(sale.createdAt);

doc.setFontSize(16);
doc.text("Cashier Transaction Report", 20, 20);

doc.setFontSize(12);

doc.text("Cashier: " + (sale.cashier || sale.cashierName), 20, 40);
doc.text("Date: " + d.toLocaleDateString(), 20, 50);
doc.text("Time: " + d.toLocaleTimeString(), 20, 60);

let y = 80;

sale.items.forEach(item => {

doc.text(`${item.name} x${item.qty}`, 20, y);

y += 10;

});

doc.text("Total: GHS " + sale.total, 20, y + 10);
doc.text("Payment: " + sale.paymentMethod, 20, y + 20);

doc.save("transaction_report.pdf");

}