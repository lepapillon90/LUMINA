"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCustomerAccount = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// Initialize default app (handles Auth credentials automatically)
const app = admin.initializeApp();
// Access the 'lumina' database
const db = (0, firestore_1.getFirestore)(app, 'lumina');
// Access Auth
const auth = (0, auth_1.getAuth)(app);
exports.deleteCustomerAccount = functions.https.onCall(async (data, context) => {
    // 1. Check if user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const callerUid = context.auth.uid;
    try {
        // 2. Verify caller is an Admin
        // Use the specific database instance
        const callerDoc = await db.collection('users').doc(callerUid).get();
        const callerData = callerDoc.data();
        if (!callerData) {
            console.error(`[deleteCustomerAccount] Caller ${callerUid} not found in Firestore.`);
            throw new functions.https.HttpsError('permission-denied', 'Caller not found.');
        }
        console.log(`[deleteCustomerAccount] Caller role: ${callerData.role}, Email: ${callerData.email}`);
        // Special case: Auto-promote the main admin if they somehow lost their role
        if (callerData.email === 'admin@lumina.com' && callerData.role !== 'ADMIN') {
            console.log(`[deleteCustomerAccount] Promoting ${callerData.email} to ADMIN.`);
            await db.collection('users').doc(callerUid).update({ role: 'ADMIN' });
            // Proceed as admin
        }
        else {
            const role = callerData.role ? String(callerData.role).toUpperCase() : '';
            if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
                throw new functions.https.HttpsError('permission-denied', `Only admins can delete accounts. Current role: ${callerData.role}`);
            }
        }
        const { uid } = data;
        if (!uid) {
            throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "uid" argument.');
        }
        console.log(`[deleteCustomerAccount] Attempting to delete user: ${uid}`);
        // Check if user exists in Firestore before deleting
        const userDoc = await db.collection('users').doc(uid).get();
        if (!userDoc.exists) {
            console.warn(`[deleteCustomerAccount] User document ${uid} does not exist in 'lumina' database.`);
        }
        else {
            console.log(`[deleteCustomerAccount] User document ${uid} found. Deleting...`);
        }
        // 3. Delete from Firebase Authentication
        try {
            await auth.deleteUser(uid);
            console.log(`[deleteCustomerAccount] Auth user ${uid} deleted.`);
        }
        catch (authError) {
            if (authError.code === 'auth/user-not-found') {
                console.warn(`[deleteCustomerAccount] Auth user ${uid} not found.`);
            }
            else {
                throw authError;
            }
        }
        // 4. Delete from Firestore (users collection)
        await db.collection('users').doc(uid).delete();
        console.log(`[deleteCustomerAccount] Firestore document ${uid} deleted.`);
        return { success: true, message: `User ${uid} deleted successfully.` };
    }
    catch (error) {
        console.error('Error deleting user:', error);
        // Re-throw known HttpsErrors, otherwise throw internal
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', `Unable to delete user: ${error.message}`, error);
    }
});
//# sourceMappingURL=index.js.map