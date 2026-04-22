// ================= LOAD REFUND HISTORY =================

document.addEventListener("DOMContentLoaded", () => {

let refunds = [];

// FETCH REFUNDS FROM BACKEND
async function loadRefunds(){

try{

const res = await fetch("/api/refunds");

refunds = await res.json();

renderRefunds(refunds);

}catch(err){

console.error("Failed to load refunds", err);

}

}

// ================= RENDER REFUNDS =================

function renderRefunds(data){

const table = document.getElementById("refundHistoryTable");

table.innerHTML = "";

if(data.length === 0){

table.innerHTML = `<tr><td colspan="4">No refunds found</td></tr>`;

return;

}

data.forEach(refund => {

const date = new Date(refund.createdAt).toLocaleString();

const items = refund.items
.map(item => `${item.name} x${item.qty}`)
.join(", ");

const row = `

<tr>
<td>${date}</td>
<td>${refund.cashier}</td>
<td>${items}</td>
<td>GH₵ ${refund.amount.toFixed(2)}</td>
</tr>

`;

table.innerHTML += row;

});

}

// ================= SEARCH FUNCTION =================

document.getElementById("searchRefund").addEventListener("keyup", function(){

const value = this.value.toLowerCase();

const filtered = refunds.filter(refund => {

const date = new Date(refund.createdAt).toLocaleString().toLowerCase();

const cashier = refund.cashier.toLowerCase();

const items = refund.items.map(i => i.name).join(" ").toLowerCase();

return (
date.includes(value) ||
cashier.includes(value) ||
items.includes(value)
);

});

renderRefunds(filtered);

});

// ================= INITIAL LOAD =================

loadRefunds();

});