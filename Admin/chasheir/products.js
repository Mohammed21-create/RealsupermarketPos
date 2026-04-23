/* product.js - Admin Product Management */

document.addEventListener("DOMContentLoaded", function () {

    let products = [];
    let editIndex = null;

    const API_URL = "http://api/products"; // backend URL

    // ================= LOAD PRODUCTS FROM BACKEND =================
    async function loadProducts() {
        try {
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error("Server error while fetching products");
            products = await res.json();

            // Normalize fields
            products = products.map(p => ({
    ...p,
    emoji: p.emoji || "📦", // ✅ ADD THIS
    unitPrice: Number(p.unitPrice || 0),
    bulkPrice: Number(p.bulkPrice || 0),
    unitsPerBulk: Number(p.unitsPerBulk || 1),
    unitCost: Number(p.unitCost || 0),
    bulkCost: Number(p.bulkCost || (p.unitCost * (p.unitsPerBulk || 1))),
    stock: Number(p.stock || 0),
}));

            renderProducts();
        } catch (err) {
            console.error("Failed to load products:", err);
            alert("Error loading products from server");
        }
    }

    // ================= BARCODE GENERATOR =================
    function generateBarcode() {
        return "POS-" + Date.now();
    }

    // ================= ADD / UPDATE PRODUCT =================
    window.addProduct = async function () {

        const name = document.getElementById("productName").value.trim();
        const emoji = document.getElementById("productEmoji").value.trim();
        const unitPrice = parseFloat(document.getElementById("unitPrice").value);
        const bulkPrice = parseFloat(document.getElementById("bulkPrice").value);
        const unitsPerBulk = parseInt(document.getElementById("unitsPerBulk").value);
        const unitCost = parseFloat(document.getElementById("productCost").value);
        const bulkCostInput = parseFloat(document.getElementById("bulkCost").value);
        const stock = parseInt(document.getElementById("productStock").value);

        if (!name || isNaN(unitPrice) || isNaN(unitCost) || isNaN(stock)) {
            alert("Please fill all required fields correctly");
            return;
        }

        const finalUnitsPerBulk = unitsPerBulk || 1;
        const finalBulkCost = bulkCostInput || (unitCost * finalUnitsPerBulk);

        const productData = {
            name,
             emoji,
            unitPrice,
            bulkPrice: bulkPrice || 0,
            unitsPerBulk: finalUnitsPerBulk,
            unitCost,
            bulkCost: finalBulkCost,
            stock,
        };

        try {
            if (editIndex === null) {
                productData.barcode = generateBarcode();

                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                });

                if (!res.ok) throw new Error("Failed to add product");

            } else {
                const id = products[editIndex]._id;

                const res = await fetch(`${API_URL}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(productData)
                });

                if (!res.ok) throw new Error("Failed to update product");

                editIndex = null;
            }

            clearForm();
            loadProducts();

        } catch (err) {
            console.error("Error saving product:", err);
            alert("Failed to save product. See console for details.");
        }
    };

    // ================= CLEAR FORM =================
    function clearForm() {
        document.getElementById("productName").value = "";
        document.getElementById("unitPrice").value = "";
        document.getElementById("bulkPrice").value = "";
        document.getElementById("unitsPerBulk").value = "";
        document.getElementById("productCost").value = "";
        document.getElementById("bulkCost").value = "";
        document.getElementById("productStock").value = "";
        document.getElementById("productEmoji").value = "";
    }

    // ================= RENDER PRODUCTS =================
    function renderProducts() {
        const tbody = document.getElementById("productTableBody");
        tbody.innerHTML = "";

        products.forEach((product, index) => {
            const unitProfit = product.unitPrice - product.unitCost;
            const bulkProfit = product.bulkPrice - product.bulkCost;

            const unitProfitPercent = product.unitCost > 0
                ? ((unitProfit / product.unitCost) * 100).toFixed(1)
                : 0;

            const stockStatus = product.stock <= 5
                ? `<span class="low-stock">Low</span>`
                : `<span class="good-stock">OK</span>`;

            const row = `
                <tr>
                    <td>${product.emoji} ${product.name}</td>
                    <td>GH₵ ${product.unitPrice.toFixed(2)}</td>
                    <td>GH₵ ${product.bulkPrice.toFixed(2)}</td>
                    <td>${product.unitsPerBulk}</td>
                    <td>GH₵ ${product.unitCost.toFixed(2)}</td>
                    <td>GH₵ ${product.bulkCost.toFixed(2)}</td>
                    <td>${product.stock} (${stockStatus})</td>
                    <td>
                        Unit: GH₵ ${unitProfit.toFixed(2)} (${unitProfitPercent}%)
                        <br>
                        Bulk: GH₵ ${bulkProfit.toFixed(2)}
                    </td>
                    <td>
                        <svg id="barcode${index}"></svg><br>
                        <small>${product.barcode}</small><br>
                        <button onclick="printBarcode(${index})"><i class="fas fa-print"></i></button>
                    </td>
                    <td>
                        <button class="edit-btn" onclick="editProduct(${index})"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="deleteProduct(${index})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `;

            tbody.innerHTML += row;

            JsBarcode(`#barcode${index}`, product.barcode, {
                format: "CODE128",
                width: 2,
                height: 40
            });
        });
    }

    // ================= EDIT =================
    window.editProduct = function (index) {
        const product = products[index];

        document.getElementById("productName").value = product.name;
        document.getElementById("productEmoji").value = product.emoji || "";
        document.getElementById("unitPrice").value = product.unitPrice;
        document.getElementById("bulkPrice").value = product.bulkPrice;
        document.getElementById("unitsPerBulk").value = product.unitsPerBulk;
        document.getElementById("productCost").value = product.unitCost;
        document.getElementById("bulkCost").value = product.bulkCost;
        document.getElementById("productStock").value = product.stock;

        editIndex = index;
    };

    // ================= DELETE =================
    window.deleteProduct = async function (index) {
        if (!confirm("Delete this product?")) return;

        try {
            const id = products[index]._id;

            const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete product");

            loadProducts();

        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete product. See console for details.");
        }
    };

    // ================= SEARCH =================
    document.getElementById("searchProduct").addEventListener("keyup", function () {
        const value = this.value.toLowerCase();
        const rows = document.querySelectorAll("#productTableBody tr");

        rows.forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
        });
    });

    // ================= PRINT BARCODE =================
    window.printBarcode = function (index) {
        const product = products[index];

        const printWindow = window.open("", "", "width=400,height=300");

        printWindow.document.write(`
            <h3>${product.name}</h3>
            <svg id="printBarcode"></svg>
            <p>Unit Price: GH₵ ${product.unitPrice.toFixed(2)}</p>
            <p>Bulk Price: GH₵ ${product.bulkPrice.toFixed(2)}</p>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
            <script>
                JsBarcode("#printBarcode", "${product.barcode}", {
                    format: "CODE128",
                    width: 2,
                    height: 60
                });
            <\/script>
        `);

        printWindow.document.close();
        printWindow.print();
    };

    // ================= INITIAL LOAD =================
    loadProducts();

});