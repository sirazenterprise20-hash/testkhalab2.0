import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Firestore Error Handling Interface as prescribed in standard guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testConnection() {
  const testPath = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection test: SUCCESS");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. Client is reporting offline.");
    } else {
      console.log("Firestore connection test successfully contacted servers:", error);
    }
  }
}

// Execute connection test
testConnection();

// CREATE / USER profile sign up or sign in lookup
export async function syncUserProfile(phone: string, name: string, address: string = "") {
  const path = `users/${phone}`;
  try {
    const userDocRef = doc(db, 'users', phone);
    const existingSnap = await getDoc(userDocRef);
    
    if (existingSnap.exists()) {
      const existingData = existingSnap.data();
      console.log("Fetched existing user profile from Firebase:", existingData);
      return existingData;
    } else {
      // First order -> Sign up auto profile!
      const newProfile = {
        phone,
        name,
        address,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, newProfile);
      console.log("Auto-registered new user profile in Firebase:", newProfile);
      return newProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
}

// Get user profile
export async function getUserProfile(phone: string) {
  const path = `users/${phone}`;
  try {
    const userDocRef = doc(db, 'users', phone);
    const snap = await getDoc(userDocRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// SAVE Order to Firebase
export async function saveOrderToFirebase(orderData: any) {
  const orderId = orderData.id;
  const path = `orders/${orderId}`;
  try {
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(orderDocRef, {
      ...orderData,
      createdAt: orderData.createdAt || new Date().toISOString()
    });
    console.log(`Saved order ${orderId} successfully in Firebase.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Fetch all orders for a specific phone number
export async function getOrdersByPhoneFromFirebase(phone: string) {
  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('customerPhone', '==', phone));
    const querySnapshot = await getDocs(q);
    const orderList: any[] = [];
    querySnapshot.forEach((doc) => {
      orderList.push(doc.data());
    });
    return orderList;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// --- ADDITIONAL FIRESTORE PERSISTENT BACKEND SYSTEM ---

// 1. Site Config Helpers
export async function getSiteConfigFromFirebase() {
  const path = 'config/main';
  try {
    const docRef = doc(db, 'config', 'main');
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveSiteConfigToFirebase(config: any) {
  const path = 'config/main';
  try {
    await setDoc(doc(db, 'config', 'main'), config);
    console.log("Site config backed up to Firestore.");
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Product Helpers
export async function getProductsFromFirebase() {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, 'products'));
    const list: any[] = [];
    snap.forEach(doc => {
      list.push(doc.data());
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveProductToFirebase(product: any) {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
    console.log(`Product ${product.id} stored in Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromFirebase(id: string) {
  const path = `products/${id}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'products', id));
    console.log(`Product ${id} deleted from Firestore.`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 3. Catalog Helpers
export async function getCatalogsFromFirebase() {
  const path = 'catalogs';
  try {
    const snap = await getDocs(collection(db, 'catalogs'));
    const list: any[] = [];
    snap.forEach(doc => list.push(doc.data()));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveCatalogToFirebase(catalog: any) {
  const path = `catalogs/${catalog.id}`;
  try {
    await setDoc(doc(db, 'catalogs', catalog.id), catalog);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCatalogFromFirebase(id: string) {
  const path = `catalogs/${id}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'catalogs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 4. Promo Helpers
export async function getPromosFromFirebase() {
  const path = 'promos';
  try {
    const snap = await getDocs(collection(db, 'promos'));
    const list: any[] = [];
    snap.forEach(doc => list.push(doc.data()));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function savePromoToFirebase(promo: any) {
  const path = `promos/${promo.id || promo.code}`;
  try {
    await setDoc(doc(db, 'promos', promo.id || promo.code), promo);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePromoFromFirebase(id: string) {
  const path = `promos/${id}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'promos', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 5. Fake Customer Helpers (Blocked phone numbers)
export async function getFakeCustomersFromFirebase() {
  const path = 'fakeCustomers';
  try {
    const snap = await getDocs(collection(db, 'fakeCustomers'));
    const list: any[] = [];
    snap.forEach(doc => list.push(doc.data()));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFakeCustomerToFirebase(fc: any) {
  const path = `fakeCustomers/${fc.id || fc.phone}`;
  try {
    await setDoc(doc(db, 'fakeCustomers', fc.id || fc.phone), fc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFakeCustomerFromFirebase(id: string) {
  const path = `fakeCustomers/${id}`;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(db, 'fakeCustomers', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 6. Review Helpers
export async function getReviewsFromFirebase() {
  const path = 'reviews';
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    const list: any[] = [];
    snap.forEach(doc => list.push(doc.data()));
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveReviewToFirebase(review: any) {
  const path = `reviews/${review.id || Date.now().toString()}`;
  try {
    await setDoc(doc(db, 'reviews', review.id || Date.now().toString()), review);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
