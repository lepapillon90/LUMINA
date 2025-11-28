export enum UserRole {
    ADMIN = 'ADMIN',
    GUEST = 'GUEST'
}

export interface UserPermissions {
    orders: boolean;
    products: boolean;
    customers: boolean;
    analytics: boolean;
    system: boolean;
}

export interface User {
    uid: string;
    email: string;
    username: string;
    displayId?: string;
    phoneNumber?: string;
    jobTitle?: string;
    isActive?: boolean;
    role: UserRole;
    permissions?: UserPermissions;
    createdAt: any;
}

export interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    image: string;
    description: string;
    isNew?: boolean;
    tags: string[];
}

export interface CartItem extends Product {
    quantity: number;
}

export interface OOTDPost {
    id: number;
    user: string;
    image: string;
    likes: number;
    caption: string;
    productsUsed: number[];
    comments?: { user: string; text: string }[];
    isLiked?: boolean;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    customerName: string;
    total: number;
    status: string;
    date: string;
    createdAt?: any;
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinDate: string;
    totalSpent: number;
    grade: string;
}
