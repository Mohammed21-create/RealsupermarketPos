// ===============================
// SMARTPOS SETTINGS SYSTEM (BACKEND VERSION)
// ===============================


// ===============================
// DOM ELEMENTS
// ===============================
const lastBackupDisplay = document.getElementById("lastBackupDate");

const restoreFile = document.getElementById("restoreFile");
const restoreBtn = document.getElementById("restoreBtn");

const changePassBtn = document.getElementById("changePassBtn");

const addCashierBtn = document.getElementById("addCashierBtn");
const cashierListEl = document.getElementById("cashierList");
const cashierMsg = document.getElementById("cashierMsg");

const clearSalesBtn = document.getElementById("clearSalesBtn");
const clearProductsBtn = document.getElementById("clearProductsBtn");
const resetSystemBtn = document.getElementById("resetSystemBtn");

const infoProducts = document.getElementById("infoProducts");
const infoSales = document.getElementById("infoSales");


// ===============================
// API ROUTES
// ===============================
const API_PRODUCTS = "/api/products";
const API_SALES = "/api/sales";
const API_CASHIERS = "/api/cashiers";
const API_ADMIN = "/api/admin";
const API_SYSTEM = "/api/system";


// ===============================
// MESSAGE HELPER
// ===============================
function showMessage(el, msg, color = "green") {

if (!el) return;

el.textContent = msg;
el.style.color = color;

}


// ===============================
// LOAD SYSTEM INFO
// ===============================
async function updateSystemInfo() {

try {

const productsRes = await fetch(API_PRODUCTS);
const products = await productsRes.json();

const salesRes = await fetch(API_SALES);
const sales = await salesRes.json();

infoProducts.textContent = products.length;
infoSales.textContent = sales.length;

} catch (err) {

console.log("Failed to load system info");

}

}

updateSystemInfo();


// ===============================
// LOAD CASHIERS
// ===============================
async function loadCashiers() {

try {

const res = await fetch(API_CASHIERS);
const cashiers = await res.json();

cashierListEl.innerHTML = "";

cashiers.forEach(c => {

const li = document.createElement("li");

li.innerHTML = `
<div style="display:flex; gap:6px; margin-bottom:8px;">

<input type="text" value="${c.username}" id="user-${c._id}" disabled>

<input type="password" placeholder="New Password" id="pass-${c._id}" disabled>

<button onclick="editCashier('${c._id}')">Edit</button>

<button onclick="saveCashier('${c._id}')" id="save-${c._id}" style="display:none;">Save</button>

<button onclick="cancelEdit()">Cancel</button>

<button onclick="deleteCashier('${c._id}')">Delete</button>

</div>
`;

cashierListEl.appendChild(li);

});

} catch (err) {

showMessage(cashierMsg, "Failed to load cashiers", "red");

}

}

loadCashiers();


// ===============================
// ADD CASHIER
// ===============================
addCashierBtn?.addEventListener("click", async () => {

const username = document.getElementById("cashierUsername").value.trim();
const password = document.getElementById("cashierPassword").value.trim();

if (!username || !password) {

showMessage(cashierMsg, "All fields required", "red");
return;

}

try {

const res = await fetch(API_CASHIERS, {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({ username, password })

});

const data = await res.json();

if (res.ok) {

showMessage(cashierMsg, "Cashier added successfully");

document.getElementById("cashierUsername").value = "";
document.getElementById("cashierPassword").value = "";

loadCashiers();

} else {

showMessage(cashierMsg, data.message, "red");

}

} catch {

showMessage(cashierMsg, "Server error", "red");

}

});


// ===============================
// DELETE CASHIER
// ===============================
async function deleteCashier(id) {

if (!confirm("Delete this cashier?")) return;

try {

await fetch(API_CASHIERS + "/" + id, {
method: "DELETE"
});

showMessage(cashierMsg, "Cashier deleted");
loadCashiers();

} catch {

alert("Failed to delete cashier");

}

}


// ===============================
// EDIT CASHIER
// ===============================
function editCashier(id) {

document.getElementById("user-" + id).disabled = false;
document.getElementById("pass-" + id).disabled = false;

document.getElementById("save-" + id).style.display = "inline-block";

}


// ===============================
// SAVE CASHIER (USERNAME + PASSWORD)
// ===============================
async function saveCashier(id) {

const username = document.getElementById("user-" + id).value.trim();
const password = document.getElementById("pass-" + id).value.trim();

if(!username){

showMessage(cashierMsg,"Username required","red");
return;

}

try {

const res = await fetch(API_CASHIERS + "/" + id, {

method: "PUT",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({ username, password })

});

const data = await res.json();

if (res.ok) {

showMessage(cashierMsg, "Cashier updated successfully");

loadCashiers();

} else {

showMessage(cashierMsg, data.message, "red");

}

} catch {

showMessage(cashierMsg, "Server error", "red");

}

}


// ===============================
// CANCEL EDIT
// ===============================
function cancelEdit() {

loadCashiers();

}


// ===============================
// CHANGE ADMIN PASSWORD
// ===============================
changePassBtn?.addEventListener("click", async () => {

const current = document.getElementById("currentPass").value.trim();
const newPass = document.getElementById("newPass").value.trim();
const passMsg = document.getElementById("passMsg");

if (!current || !newPass) {
showMessage(passMsg, "All fields required", "red");
return;
}

if (newPass.length < 4) {
showMessage(passMsg, "Password must be at least 4 characters", "red");
return;
}

try {

const res = await fetch(API_ADMIN + "/change-password", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
credentials: "include", // 🔥 FIX
body: JSON.stringify({ current, newPass })
});

let data;

try {
data = await res.json();
} catch {
data = { message: "Unexpected server error" };
}

if (res.ok) {

showMessage(passMsg, "Password updated successfully");

document.getElementById("currentPass").value = "";
document.getElementById("newPass").value = "";

} else {

showMessage(passMsg, data.message || "Update failed", "red");

}

} catch (err) {

showMessage(passMsg, "Server error", "red");

}

});


// ===============================
// BACKUP SYSTEM
// ===============================
async function createBackup() {

try {

const res = await fetch(API_SYSTEM + "/backup");

const blob = await res.blob();

const url = URL.createObjectURL(blob);

const link = document.createElement("a");

link.href = url;
link.download = "SmartPOS_Backup.json";
link.click();

const date = new Date().toLocaleDateString();

if (lastBackupDisplay)
lastBackupDisplay.textContent = date;

} catch {

alert("Backup failed");

}

}

downloadBackupBtn?.addEventListener("click",createBackup);


// ===============================
// RESTORE BACKUP
// ===============================
restoreBtn?.addEventListener("click", async () => {

if (!restoreFile.files.length) {

alert("Select backup file first");
return;

}


const formData = new FormData();
formData.append("file", restoreFile.files[0]);

try {

await fetch(API_SYSTEM + "/restore", {

method: "POST",
body: formData

});

alert("System restored successfully");
location.reload();

} catch {

alert("Restore failed");

}

});





