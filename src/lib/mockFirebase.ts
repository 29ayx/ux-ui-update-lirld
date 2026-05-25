import dummyData from "./dummyData.json";

// In-memory Database state
class MockDb {
  private data: any;
  private listeners: Map<string, Array<(snapshot: any) => void>> = new Map();

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lirld_mock_db");
      if (saved) {
        try {
          this.data = JSON.parse(saved);
          return;
        } catch (e) {
          console.error("Error parsing saved mock db", e);
        }
      }
    }
    this.data = JSON.parse(JSON.stringify(dummyData));
    this.save();
  }

  private save() {
    if (typeof window !== "undefined") {
      localStorage.setItem("lirld_mock_db", JSON.stringify(this.data));
    }
  }

  getData() {
    return this.data;
  }

  getCollection(colName: string) {
    if (colName === "plan") return this.data.plans || [];
    if (colName === "users") return Object.values(this.data.users || {});
    if (colName === "callLogs") return this.data.callLogs || [];
    if (colName === "profileViews") return this.data.profileViews || [];
    return [];
  }

  getDocument(colName: string, docId: string) {
    if (colName === "marketing") {
      return this.data.marketing?.[docId] || null;
    }
    if (colName === "users") {
      return this.data.users?.[docId] || null;
    }
    if (colName === "chats") {
      return this.data.chats?.[docId] || null;
    }
    if (colName === "messages") {
      return this.data.messages?.[docId] || null;
    }
    if (colName === "calls") {
      return this.data.calls?.[docId] || null;
    }
    return null;
  }

  private resolveFieldValues(current: any, updates: any) {
    const resolved = { ...updates };
    for (const [key, value] of Object.entries(updates)) {
      if (value && typeof value === "object" && (value as any).type) {
        const val = value as any;
        if (val.type === "increment") {
          resolved[key] = (current[key] || 0) + val.value;
        } else if (val.type === "arrayUnion") {
          const arr = Array.isArray(current[key]) ? [...current[key]] : [];
          for (const item of val.elements) {
            if (!arr.includes(item)) {
              arr.push(item);
            }
          }
          resolved[key] = arr;
        } else if (val.type === "arrayRemove") {
          const arr = Array.isArray(current[key]) ? [...current[key]] : [];
          resolved[key] = arr.filter((item: any) => !val.elements.includes(item));
        } else if (val.type === "deleteField") {
          delete current[key];
          delete resolved[key];
        }
      }
    }
    return resolved;
  }

  updateDocument(colName: string, docId: string, updates: any) {
    if (colName === "users") {
      if (!this.data.users) this.data.users = {};
      const current = this.data.users[docId] || {};
      const resolved = this.resolveFieldValues(current, updates);
      this.data.users[docId] = { ...current, ...resolved, uid: docId };
    } else if (colName === "marketing") {
      if (!this.data.marketing) this.data.marketing = {};
      const current = this.data.marketing[docId] || {};
      const resolved = this.resolveFieldValues(current, updates);
      this.data.marketing[docId] = { ...current, ...resolved };
    } else if (colName === "chats") {
      if (!this.data.chats) this.data.chats = {};
      const current = this.data.chats[docId] || {};
      const resolved = this.resolveFieldValues(current, updates);
      this.data.chats[docId] = { ...current, ...resolved, id: docId };
    } else if (colName === "calls") {
      if (!this.data.calls) this.data.calls = {};
      const current = this.data.calls[docId] || {};
      const resolved = this.resolveFieldValues(current, updates);
      this.data.calls[docId] = { ...current, ...resolved, id: docId };
    }
    this.save();
    this.triggerListeners(colName, docId);
  }

  setDocument(colName: string, docId: string, docData: any) {
    if (colName === "users") {
      if (!this.data.users) this.data.users = {};
      const resolved = this.resolveFieldValues({}, docData);
      this.data.users[docId] = { ...resolved, uid: docId };
    } else if (colName === "marketing") {
      if (!this.data.marketing) this.data.marketing = {};
      const resolved = this.resolveFieldValues({}, docData);
      this.data.marketing[docId] = resolved;
    } else if (colName === "chats") {
      if (!this.data.chats) this.data.chats = {};
      const resolved = this.resolveFieldValues({}, docData);
      this.data.chats[docId] = { ...resolved, id: docId };
    } else if (colName === "calls") {
      if (!this.data.calls) this.data.calls = {};
      const resolved = this.resolveFieldValues({}, docData);
      this.data.calls[docId] = { ...resolved, id: docId };
    }
    this.save();
    this.triggerListeners(colName, docId);
  }

  addDocument(colName: string, docData: any) {
    const docId = Math.random().toString(36).substring(2, 11);
    if (colName === "plan") {
      if (!this.data.plans) this.data.plans = [];
      const newPlan = { ...docData, id: docId };
      this.data.plans.push(newPlan);
      this.save();
      this.triggerListeners(colName, "");
      return docId;
    }
    if (colName === "callLogs") {
      if (!this.data.callLogs) this.data.callLogs = [];
      const newLog = { ...docData, id: docId };
      this.data.callLogs.push(newLog);
      this.save();
      this.triggerListeners(colName, "");
      return docId;
    }
    if (colName === "profileViews") {
      if (!this.data.profileViews) this.data.profileViews = [];
      const newView = { ...docData, id: docId };
      this.data.profileViews.push(newView);
      this.save();
      this.triggerListeners(colName, "");
      return docId;
    }
    if (colName.startsWith("messages/")) {
      const chatId = colName.split("/")[1];
      if (!this.data.messages) this.data.messages = {};
      if (!this.data.messages[chatId]) this.data.messages[chatId] = [];
      const newMsg = { ...docData, id: docId };
      this.data.messages[chatId].push(newMsg);
      this.save();
      this.triggerListeners("messages", chatId);
      return docId;
    }
    return docId;
  }

  deleteDocument(colName: string, docId: string) {
    if (colName === "plan") {
      this.data.plans = (this.data.plans || []).filter((p: any) => p.id !== docId);
    } else if (colName === "users") {
      if (this.data.users) delete this.data.users[docId];
    } else if (colName === "chats") {
      if (this.data.chats) delete this.data.chats[docId];
    } else if (colName === "calls") {
      if (this.data.calls) delete this.data.calls[docId];
    }
    this.save();
    this.triggerListeners(colName, docId);
  }

  subscribe(key: string, callback: (snapshot: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
    
    // Initial emit
    setTimeout(() => {
      this.triggerListenerForKey(key, callback);
    }, 0);

    return () => {
      const list = this.listeners.get(key) || [];
      this.listeners.set(key, list.filter((l) => l !== callback));
    };
  }

  private triggerListeners(colName: string, docId: string) {
    // Trigger specific doc subscribers
    const docKey = `${colName}/${docId}`;
    if (this.listeners.has(docKey)) {
      this.listeners.get(docKey)!.forEach(cb => this.triggerListenerForKey(docKey, cb));
    }
    // Trigger collection level subscribers
    if (this.listeners.has(colName)) {
      this.listeners.get(colName)!.forEach(cb => this.triggerListenerForKey(colName, cb));
    }
    // Handle messages nesting
    if (colName === "messages") {
      const chatMsgKey = `messages/${docId}`;
      if (this.listeners.has(chatMsgKey)) {
        this.listeners.get(chatMsgKey)!.forEach(cb => this.triggerListenerForKey(chatMsgKey, cb));
      }
    }
  }

  private triggerListenerForKey(key: string, callback: (snapshot: any) => void) {
    const parts = key.split("/");
    const colName = parts[0];
    const docId = parts[1];

    if (docId) {
      // Document Snapshot Mock
      const data = this.getDocument(colName, docId);
      callback({
        exists: () => data !== null,
        id: docId,
        data: () => data,
      });
    } else {
      // Query / Collection Snapshot Mock
      const list = this.getCollection(colName);
      callback({
        docs: list.map((item: any) => ({
          id: item.id || item.uid,
          data: () => item,
        })),
        forEach: (cb: any) => {
          list.forEach((item: any) => {
            cb({
              id: item.id || item.uid,
              data: () => item,
            });
          });
        }
      });
    }
  }
}

const mockDbInstance = new MockDb();

// ----------------------------------------------------
// Mock firebase/app
// ----------------------------------------------------
export const getApps = () => [{ name: "[DEFAULT]" }];
export const getApp = () => ({ name: "[DEFAULT]" });
export const initializeApp = () => ({ name: "[DEFAULT]" });

// ----------------------------------------------------
// Mock firebase/firestore
// ----------------------------------------------------
export const getFirestore = () => mockDbInstance;

export class Timestamp {
  constructor(public seconds: number, public nanoseconds: number) {}
  static now() {
    return new Timestamp(Math.floor(Date.now() / 1000), 0);
  }
  static fromDate(date: Date) {
    return new Timestamp(Math.floor(date.getTime() / 1000), 0);
  }
  toDate() {
    return new Date(this.seconds * 1000);
  }
  toMillis() {
    return this.seconds * 1000;
  }
}

export const serverTimestamp = () => Timestamp.now();

export const doc = (db: any, path: string, ...pathSegments: string[]) => {
  const fullPath = [path, ...pathSegments].filter(Boolean).join("/");
  const parts = fullPath.split("/");
  return {
    type: "document",
    colName: parts[0],
    docId: parts[1],
    path: fullPath
  };
};

export const collection = (db: any, path: string, ...pathSegments: string[]) => {
  const fullPath = [path, ...pathSegments].filter(Boolean).join("/");
  return {
    type: "collection",
    colName: fullPath,
    path: fullPath
  };
};

export const collectionGroup = (db: any, path: string) => {
  return {
    type: "collectionGroup",
    colName: path,
    path: path
  };
};


export const getDoc = async (docRef: any) => {
  const data = mockDbInstance.getDocument(docRef.colName, docRef.docId);
  return {
    exists: () => data !== null,
    id: docRef.docId,
    data: () => data,
  };
};

export const getDocs = async (queryRef: any) => {
  const colName = queryRef.colName || queryRef.path;
  const list = mockDbInstance.getCollection(colName);
  return {
    docs: list.map((item: any) => ({
      id: item.id || item.uid,
      data: () => item,
    })),
    forEach: (cb: any) => {
      list.forEach((item: any) => {
        cb({
          id: item.id || item.uid,
          data: () => item,
        });
      });
    }
  };
};

export const onSnapshot = (ref: any, onNext: any, onError?: any) => {
  const key = ref.path;
  return mockDbInstance.subscribe(key, onNext);
};

export const addDoc = async (colRef: any, docData: any) => {
  const id = mockDbInstance.addDocument(colRef.path, docData);
  return { id };
};

export const updateDoc = async (docRef: any, updates: any) => {
  mockDbInstance.updateDocument(docRef.colName, docRef.docId, updates);
};

export const setDoc = async (docRef: any, docData: any) => {
  mockDbInstance.setDocument(docRef.colName, docRef.docId, docData);
};

export const deleteDoc = async (docRef: any) => {
  mockDbInstance.deleteDocument(docRef.colName, docRef.docId);
};

export const writeBatch = (db: any) => {
  return {
    set: (docRef: any, docData: any) => {
      mockDbInstance.setDocument(docRef.colName, docRef.docId, docData);
    },
    update: (docRef: any, updates: any) => {
      mockDbInstance.updateDocument(docRef.colName, docRef.docId, updates);
    },
    delete: (docRef: any) => {
      mockDbInstance.deleteDocument(docRef.colName, docRef.docId);
    },
    commit: async () => {}
  };
};

export const runTransaction = async (db: any, updateFunction: any) => {
  const transaction = {
    get: async (docRef: any) => {
      const data = mockDbInstance.getDocument(docRef.colName, docRef.docId);
      return {
        exists: () => data !== null,
        id: docRef.docId,
        data: () => data,
      };
    },
    update: (docRef: any, updates: any) => {
      mockDbInstance.updateDocument(docRef.colName, docRef.docId, updates);
    },
    set: (docRef: any, docData: any) => {
      mockDbInstance.setDocument(docRef.colName, docRef.docId, docData);
    },
    delete: (docRef: any) => {
      mockDbInstance.deleteDocument(docRef.colName, docRef.docId);
    }
  };
  return await updateFunction(transaction);
};

export const query = (colRef: any, ...constraints: any[]) => {
  return colRef; // Simple query pass-through
};


export const where = (field: string, op: string, value: any) => {
  return { type: "where", field, op, value };
};

export const orderBy = (field: string, direction?: "asc" | "desc") => {
  return { type: "orderBy", field, direction };
};

export const limit = (num: number) => {
  return { type: "limit", limit: num };
};

export const startAfter = (doc: any) => {
  return { type: "startAfter", doc };
};

export const increment = (num: number) => {
  return { type: "increment", value: num };
};

export const arrayUnion = (...elements: any[]) => {
  return { type: "arrayUnion", elements };
};

export const arrayRemove = (...elements: any[]) => {
  return { type: "arrayRemove", elements };
};

export const deleteField = () => {
  return { type: "deleteField" };
};

// ----------------------------------------------------
// Mock firebase/auth
// ----------------------------------------------------
class MockAuth {
  private authStateListeners: Array<(user: any) => void> = [];
  currentUser: any = null;

  constructor() {
    // Auto-login as default Guest Explorer dummy profile
    setTimeout(() => {
      const dbData = mockDbInstance.getData();
      this.currentUser = {
        uid: "current-user",
        email: dbData.users["current-user"]?.email || "guest@lirld.com",
        displayName: dbData.users["current-user"]?.name || "Guest Explorer",
        photoURL: dbData.users["current-user"]?.photos?.[0] || "",
        phoneNumber: null,
        emailVerified: true,
      };
      this.triggerAuthStateChanged();
    }, 100);
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.authStateListeners.push(callback);
    // Emit current user immediately
    setTimeout(() => {
      callback(this.currentUser);
    }, 0);
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== callback);
    };
  }

  triggerAuthStateChanged() {
    this.authStateListeners.forEach(cb => cb(this.currentUser));
  }

  async signInWithPopup() {
    const dbData = mockDbInstance.getData();
    this.currentUser = {
      uid: "current-user",
      email: "guest@lirld.com",
      displayName: dbData.users["current-user"]?.name || "Guest Explorer",
      photoURL: dbData.users["current-user"]?.photos?.[0] || "",
      phoneNumber: null,
      emailVerified: true,
    };
    this.triggerAuthStateChanged();
  }

  async signOut() {
    this.currentUser = null;
    this.triggerAuthStateChanged();
  }
}

const mockAuthInstance = new MockAuth();

export const getAuth = () => mockAuthInstance;
export const onAuthStateChanged = (auth: any, callback: any) => mockAuthInstance.onAuthStateChanged(callback);
export const signInWithPopup = async (auth: any, provider: any) => mockAuthInstance.signInWithPopup();
export const signOut = async (auth: any) => mockAuthInstance.signOut();
export const deleteUser = async (user: any) => {
  console.log("Mock delete user:", user);
};
export class GoogleAuthProvider {

  addScope() {}
}

// ----------------------------------------------------
// Mock firebase/storage
// ----------------------------------------------------
export const getStorage = () => ({});
export const ref = (storage: any, path: string) => ({ path });
export const uploadBytesResumable = (ref: any, file: File) => {
  return {
    on: (event: string, progressCb: any, errorCb: any, completeCb: any) => {
      setTimeout(() => progressCb({ bytesTransferred: 50, totalBytes: 100 }), 100);
      setTimeout(() => progressCb({ bytesTransferred: 100, totalBytes: 100 }), 300);
      setTimeout(() => completeCb(), 500);
    }
  };
};
export const getDownloadURL = async (ref: any) => {
  return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"; // Mock profile picture URL
};
export const deleteObject = async (ref: any) => {
  console.log("Mock delete object: ", ref.path);
};


// ----------------------------------------------------
// Mock firebase/functions
// ----------------------------------------------------
export const getFunctions = () => ({});
export const httpsCallable = (functions: any, name: string) => {
  return async (data: any) => {
    console.log(`Mocking functions call to: ${name}`, data);
    if (name === "generateLivekitToken") {
      return { data: { token: "mock-livekit-token-value" } };
    }
    return { data: {} };
  };
};

export const db = mockDbInstance;
export const auth = mockAuthInstance;
export const storage = {};
export const functions = {};
export default mockDbInstance;
