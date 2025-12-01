import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, User, UserRole } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';

// --- Contexts ---

// Cart Context
interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    isCartOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

// Auth Context
interface AuthContextType {
    user: User | null;
    loading: boolean;
    logout: () => Promise<void>;
    toggleWishlist: (productId: number) => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- Providers ---

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    const addToCart = (product: Product, quantity: number = 1) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { ...product, quantity }];
        });
        openCart(); // Automatically open cart when adding item
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                // Ensure quantity doesn't drop below 1
                return { ...item, quantity: Math.max(1, quantity) };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    // Auth State
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Cart Sync State
    const isCartSynced = React.useRef(false);

    // 1. Handle Auth Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                let role = UserRole.GUEST;
                let username = firebaseUser.displayName || firebaseUser.email || 'User';

                let userDoc: any = null;

                // Fetch user details from Firestore
                try {
                    const { getById } = await import('./services/db');
                    userDoc = await getById('users', firebaseUser.uid);

                    // Force Admin role for demo account
                    if (firebaseUser.email === 'admin@lumina.com') {
                        role = UserRole.ADMIN;
                    }

                    if (userDoc) {
                        // Only overwrite if not already set to ADMIN by the email check above
                        if (role !== UserRole.ADMIN) {
                            role = (userDoc as any).role === 'ADMIN' ? UserRole.ADMIN : UserRole.GUEST;
                        }
                        username = (userDoc as any).username || username;
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }

                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    username: username,
                    displayName: (userDoc as any)?.displayName || firebaseUser.displayName || undefined,
                    role: role,
                    createdAt: (userDoc as any)?.createdAt || new Date(),
                    permissions: (userDoc as any)?.permissions,
                    profileImage: (userDoc as any)?.profileImage || firebaseUser.photoURL || undefined,
                    wishlist: (userDoc as any)?.wishlist || []
                });

            } else {
                setUser(null);
                setCart([]); // Clear cart on logout
                isCartSynced.current = false;
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Cart Sync Logic: Fetch & Merge (Runs when user changes)
    useEffect(() => {
        const syncCart = async () => {
            if (user && !isCartSynced.current) {
                try {
                    const { getById, set } = await import('./services/db');
                    const savedCartDoc = await getById('carts', user.uid);

                    let mergedCart = [...cart]; // Start with current local cart (guest items)

                    if (savedCartDoc && (savedCartDoc as any).items) {
                        const remoteItems = (savedCartDoc as any).items as CartItem[];

                        // Merge strategy:
                        const remoteMap = new Map(remoteItems.map(item => [item.id, item]));

                        mergedCart.forEach(localItem => {
                            if (remoteMap.has(localItem.id)) {
                                const remoteItem = remoteMap.get(localItem.id)!;
                                remoteItem.quantity += localItem.quantity;
                                remoteMap.set(localItem.id, remoteItem);
                            } else {
                                remoteMap.set(localItem.id, localItem);
                            }
                        });

                        mergedCart = Array.from(remoteMap.values());
                    }

                    // Update local state
                    setCart(mergedCart);

                    // Mark as synced
                    isCartSynced.current = true;

                    // If we merged guest items, save immediately
                    if (cart.length > 0) {
                        await set('carts', user.uid, {
                            items: mergedCart,
                            lastUpdated: new Date().toISOString()
                        });
                    }

                } catch (error) {
                    console.error("Error syncing cart:", error);
                    isCartSynced.current = true;
                }
            }
        };

        syncCart();
    }, [user, cart]);

    // 3. Save Cart on Change (if logged in and synced)
    useEffect(() => {
        const saveCart = async () => {
            if (user && isCartSynced.current && !loading) {
                try {
                    const { set } = await import('./services/db');
                    await set('carts', user.uid, {
                        items: cart,
                        lastUpdated: new Date().toISOString()
                    });
                } catch (error) {
                    console.error("Error saving cart:", error);
                }
            }
        };

        const timeoutId = setTimeout(saveCart, 500);
        return () => clearTimeout(timeoutId);
    }, [cart, user, loading]);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setCart([]);
        isCartSynced.current = false;
    };

    const toggleWishlist = async (productId: number) => {
        if (!user) return;

        const currentWishlist = user.wishlist || [];
        const newWishlist = currentWishlist.includes(productId)
            ? currentWishlist.filter(id => id !== productId)
            : [...currentWishlist, productId];

        // Optimistic update
        setUser({ ...user, wishlist: newWishlist });

        try {
            const { update } = await import('./services/db');
            await update('users', user.uid, { wishlist: newWishlist });
        } catch (error) {
            console.error("Failed to update wishlist:", error);
            // Revert on error
            setUser(user);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout, toggleWishlist }}>
            <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, openCart, closeCart }}>
                {loading ? <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div></div> : children}
            </CartContext.Provider>
        </AuthContext.Provider>
    );
};


// --- Hooks ---
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within Providers");
    return context;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within Providers");
    return context;
};
