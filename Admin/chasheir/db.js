let db;

// INIT DATABASE
export function initDB() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open("SmartPOS_DB", 2);

        request.onupgradeneeded = (e) => {
            db = e.target.result;

            // SALES
            if (!db.objectStoreNames.contains("offlineSales")) {
                db.createObjectStore("offlineSales", {
                    keyPath: "id",
                    autoIncrement: true
                });
            }

            // PRODUCTS
            if (!db.objectStoreNames.contains("products")) {
                db.createObjectStore("products", {
                    keyPath: "_id"
                });
            }

            // CASHIERS
            if (!db.objectStoreNames.contains("cashiers")) {
                db.createObjectStore("cashiers", {
                    keyPath: "_id"
                });
            }
        };

        request.onsuccess = (e) => {
            db = e.target.result;
            console.log("DB Ready ✅");
            resolve(db);
        };

        request.onerror = () => reject("DB error");
    });
}
// ================= PRODUCTS =================
export function saveProducts(products) {
    const tx = db.transaction("products", "readwrite");
    const store = tx.objectStore("products");

    products.forEach(p => store.put(p));
}

export function getProductsOffline() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("products", "readonly");
        const store = tx.objectStore("products");

        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject("Error loading products");
    });
}

// ================= CASHIERS =================
export function saveCashiers(cashiers) {
    const tx = db.transaction("cashiers", "readwrite");
    const store = tx.objectStore("cashiers");

    cashiers.forEach(c => store.put(c));
}

export function getCashiersOffline() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("cashiers", "readonly");
        const store = tx.objectStore("cashiers");

        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject("Error loading cashiers");
    });
}

// ================= SALES =================
export function saveOfflineSale(sale) {
    const tx = db.transaction("offlineSales", "readwrite");
    const store = tx.objectStore("offlineSales");

    store.add({
        ...sale,
        createdOffline: true
    });

    console.log("Saved offline 📴");
}

export function getOfflineSales() {
    return new Promise((resolve, reject) => {
        const tx = db.transaction("offlineSales", "readonly");
        const store = tx.objectStore("offlineSales");

        const req = store.getAll();

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject("Error loading sales");
    });
}

export function clearOfflineSales() {
    const tx = db.transaction("offlineSales", "readwrite");
    const store = tx.objectStore("offlineSales");

    store.clear();
}