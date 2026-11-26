const form = document.getElementById("fdpForm");
const tableBody = document.getElementById("tableBody");
const message = document.getElementById("message");

let inventory = [];

function loadData() {function loadData() {
    inventory = JSON.parse(
        localStorage.getItem("fdpInventory") || "[]"
    );

    const searchText = document
        .getElementById("inventorySearch")
        .value.toLowerCase()
        .trim();

    const filteredInventory = inventory.filter(item =>
        item.batch.toLowerCase().includes(searchText) ||
        item.product.toLowerCase().includes(searchText) ||
        item.location.toLowerCase().includes(searchText)
    );

    tableBody.innerHTML = "";

    filteredInventory.forEach((item, index) => {
        const row = document.createElement("tr");

        const values = [
            index + 1,
            item.batch,
            item.product,
            item.quantity,
            item.expiry,
            item.location
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            deleteBatch(item.id);
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        tableBody.appendChild(row);
    });

    updateDashboard();
}

document.getElementById("inventorySearch")
    .addEventListener("input", loadData);}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const batch = document.getElementById("batch").value.trim();
    const product = document.getElementById("product").value.trim();
    const quantity = Number(document.getElementById("quantity").value);
    const expiry = document.getElementById("expiry").value;
    const location = document.getElementById("location").value.trim();

    if (!batch || !product || !location || !expiry ||
        !Number.isInteger(quantity) || quantity <= 0) {
        message.textContent = "Please enter valid details. Quantity must be greater than zero.";
        return;
    }

    if (inventory.some(item => item.batch.toLowerCase() === batch.toLowerCase())) {
        message.textContent = "This batch number already exists!";
        return;
    }

    const newBatch = {
        id: Date.now(),
        batch: batch,
        product: product,
        quantity: quantity,
        expiry: expiry,
        location: location
    };

    inventory.push(newBatch);

    localStorage.setItem(
        "fdpInventory",
        JSON.stringify(inventory)
    );

    form.reset();

    message.textContent = "FDP Batch added successfully!";

    loadData();
});

function deleteBatch(id) {
    if (!confirm("Are you sure you want to delete this batch?")) {
        return;
    }

    inventory = inventory.filter(item => item.id !== id);

    localStorage.setItem(
        "fdpInventory",
        JSON.stringify(inventory)
    );

    message.textContent = "Batch deleted successfully.";

    loadData();
}
function updateDashboard() {
    const totalBatches = inventory.length;

    const totalUnits = inventory.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expired = 0;
    let soon = 0;
    let safe = 0;

    inventory.forEach(item => {
        const expiryDate = new Date(item.expiry + "T00:00:00");
        const daysLeft = Math.floor(
            (expiryDate - today) / (1000 * 60 * 60 * 24)
        );

        if (Number(item.quantity) <= 0) return;

        if (daysLeft < 0) {
            expired++;
        } else if (daysLeft <= 30) {
            soon++;
        } else {
            safe++;
        }
    });

    document.getElementById("total").textContent = totalBatches;
    document.getElementById("units").textContent = totalUnits;
    document.getElementById("available").textContent =
        inventory.filter(item =>
            item.expiry >= today.toISOString().split("T")[0] &&
            Number(item.quantity) > 0
        ).length;

    document.getElementById("expiredCount").textContent = expired;
    document.getElementById("soonCount").textContent = soon;
    document.getElementById("safeCount").textContent = safe;
}

// Make refresh function available to the HTML button
window.loadData = loadData;

// Display saved records when the page opens
loadData();