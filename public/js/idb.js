let db;

const request = indexedDB.open('budget-tracker-2000', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('deposit_withdraw', { autoIncrement: true });
};

// upon a successful thing
request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadMoney();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['deposit_withdraw'], 'readwrite');

    const moneyObjectStore = transaction.objectStore('deposit_withdraw');

    moneyObjectStore.add(record);
}

function uploadMoney() {
    const transaction = db.transaction(['deposit_withdraw'], 'readwrite');
    const moneyObjectStore = transaction.objectStore('deposit_withdraw');
    const getAll = moneyObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept:
                        'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['deposit_withdraw'], 'readwrite')
                    const moneyObjectStore = transaction.objectStore('deposit_withdraw');
                    moneyObjectStore.clear();

                    alert('All saved money has been submitted.');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}

window.addEventListener('online', uploadMoney);

