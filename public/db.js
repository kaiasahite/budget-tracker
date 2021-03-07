let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('pending', {autoIncrement: true})
};

request.onsuccess = function (event) {
    db = event.target.result;

    if(navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log("Something went wrong! " + event.target.errorCode)
};

function saveTransaction(data) {
    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    store.add(data);
};

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");

    const store = transaction.objectStore("pending");

    const seeAll = store.getAll();

    seeAll.onsuccess = function() {
        if (seeAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: "POST",
                body: JSON.stringify(seeAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(["pending"], "readwrite");

                const store = transaction.objectStore('pending');

                store.clear();
            });
        }
    };
}

//listen for event - app coming back online
window.addEventListener('online', checkDatabase);