async function loginCashier() {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const errorMsg = document.getElementById("errorMsg");

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    // Reset error message
    errorMsg.style.display = "none";
    errorMsg.innerText = "";

    // Validate inputs
    if (!username || !password) {
        errorMsg.innerText = "Enter username and password";
        errorMsg.style.display = "block";
        return;
    }

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorMsg.innerText = data.message || "Invalid username or password";
            errorMsg.style.display = "block";
            passwordInput.value = "";
            return;
        }

        // ✅ IMPORTANT: ROLE-BASED REDIRECT
        if (data.role === "admin") {
            window.location.href = "admin.html";
        } else if (data.role === "cashier") {
            window.location.href = "index.html"; // cashier POS page
        } else {
            errorMsg.innerText = "Unknown role";
            errorMsg.style.display = "block";
        }

    } catch (error) {
        console.error("Login error:", error);
        errorMsg.innerText = "Server connection failed. Try again!";
        errorMsg.style.display = "block";
        passwordInput.value = "";
    }
}