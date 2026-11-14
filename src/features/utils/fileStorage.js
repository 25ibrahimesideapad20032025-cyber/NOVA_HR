const DB_NAME = "nova_hr_files";
const STORE_NAME = "employee_files";

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEmployeeFile(file) {
  const db = await openDatabase();

  const id = `FILE-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");

    transaction.objectStore(STORE_NAME).put({
      id,
      name: file.name,
      type: file.type,
      size: file.size,
      file,
    });

    transaction.oncomplete = () => {
      db.close();
      resolve({ id, name: file.name, type: file.type, size: file.size });
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getEmployeeFile(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => {
      db.close();
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}

export async function deleteEmployeeFile(id) {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}