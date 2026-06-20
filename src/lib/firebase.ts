import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, collection, query, where, getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
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
