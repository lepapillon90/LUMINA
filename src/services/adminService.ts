import { collection, doc, getDocs, updateDoc, query, where, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, firebaseConfig } from '../firebase';
import { User, UserRole, UserPermissions } from '../types';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword, signOut } from 'firebase/auth';
import { logAction } from './auditService';

const USERS_COLLECTION = 'users';

export const getAdminUsers = async (): Promise<User[]> => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where('role', '==', UserRole.ADMIN));
        const querySnapshot = await getDocs(q);
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ uid: doc.id, ...doc.data() } as User);
        });
        return users;
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return [];
    }
};

export const getAllUsers = async (): Promise<User[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users: User[] = [];
        querySnapshot.forEach((doc) => {
            users.push({ uid: doc.id, ...doc.data() } as User);
        });
        return users;
    } catch (error) {
        console.error('Error fetching all users:', error);
        return [];
    }
};

export const promoteUserToAdmin = async (uid: string, permissions: UserPermissions, adminUser: { uid: string, username: string }, displayId?: string, phoneNumber?: string, jobTitle?: string, department?: string, displayName?: string): Promise<void> => {
    try {
        const updateData: any = {
            role: UserRole.ADMIN,
            permissions,
            isActive: true
        };
        if (displayId) updateData.displayId = displayId;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;
        if (jobTitle) updateData.jobTitle = jobTitle;
        if (department) updateData.department = department;
        if (displayName) updateData.displayName = displayName;

        await updateDoc(doc(db, USERS_COLLECTION, uid), updateData);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'PROMOTE_ADMIN',
            `User ${uid}`,
            `Promoted user ${uid} to admin`
        );
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        throw error;
    }
};

export const promoteToAdmin = async (email: string, username: string, permissions: UserPermissions, adminUser: { uid: string, username: string }, displayId?: string, phoneNumber?: string, jobTitle?: string, department?: string, displayName?: string): Promise<void> => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            throw new Error('User not found. Please ask the user to sign up first.');
        }

        const userDoc = querySnapshot.docs[0];
        await promoteUserToAdmin(userDoc.id, permissions, adminUser, displayId, phoneNumber, jobTitle, department, displayName);
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        throw error;
    }
};

export const updateAdminUser = async (uid: string, permissions: UserPermissions, adminUser: { uid: string, username: string }, displayId?: string, phoneNumber?: string, jobTitle?: string, department?: string, displayName?: string): Promise<void> => {
    try {
        const updateData: any = { permissions };
        if (displayId !== undefined) updateData.displayId = displayId;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
        if (department !== undefined) updateData.department = department;
        if (displayName !== undefined) updateData.displayName = displayName;

        await updateDoc(doc(db, USERS_COLLECTION, uid), updateData);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_ADMIN',
            `Admin ${uid}`,
            `Updated admin user info`
        );
    } catch (error) {
        console.error('Error updating admin user:', error);
        throw error;
    }
};

export const toggleAdminStatus = async (uid: string, isActive: boolean, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        await updateDoc(doc(db, USERS_COLLECTION, uid), { isActive });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'TOGGLE_ADMIN_STATUS',
            `Admin ${uid}`,
            `Changed status to ${isActive ? 'Active' : 'Inactive'}`
        );
    } catch (error) {
        console.error('Error toggling admin status:', error);
        throw error;
    }
};

export const deleteAdminUser = async (uid: string, adminUser: { uid: string, username: string }): Promise<void> => {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, uid));

        await logAction(
            adminUser.uid,
            adminUser.username,
            'DELETE_ADMIN',
            `Admin ${uid}`,
            `Deleted admin user`
        );
    } catch (error) {
        console.error('Error deleting admin user:', error);
        throw error;
    }
};

export const createAdminUser = async (email: string, password: string, username: string, permissions: UserPermissions, adminUser: { uid: string, username: string }, displayId?: string, phoneNumber?: string, jobTitle?: string, department?: string, displayName?: string): Promise<void> => {
    let secondaryApp;
    try {
        // 1. Initialize a secondary app instance to create user without logging out current admin
        secondaryApp = initializeApp(firebaseConfig, 'SecondaryApp');
        const secondaryAuth = getAuth(secondaryApp);

        // 2. Create the user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const { uid } = userCredential.user;

        // 3. Create the user document in Firestore with Admin role and permissions
        const userData: any = {
            uid,
            email,
            username,
            role: UserRole.ADMIN,
            permissions,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        };
        if (displayId) userData.displayId = displayId;
        if (phoneNumber) userData.phoneNumber = phoneNumber;
        if (jobTitle) userData.jobTitle = jobTitle;
        if (department) userData.department = department;
        if (displayName) userData.displayName = displayName;

        await setDoc(doc(db, USERS_COLLECTION, uid), userData);

        // 4. Sign out from the secondary app to avoid any session conflicts (though it shouldn't affect main auth)
        await signOut(secondaryAuth);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'CREATE_ADMIN',
            username,
            `Created new admin user: ${username}`
        );

    } catch (error) {
        console.error('Error creating admin user:', error);
        throw error;
    } finally {
        // 5. Clean up the secondary app
        if (secondaryApp) {
            await deleteApp(secondaryApp);
        }
    }
};

export const sendAdminPasswordReset = async (email: string): Promise<void> => {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw error;
    }
};

export const changeOwnPassword = async (newPassword: string): Promise<void> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('No user logged in');
        await updatePassword(user, newPassword);
    } catch (error) {
        console.error('Error changing password:', error);
        throw error;
    }
};
