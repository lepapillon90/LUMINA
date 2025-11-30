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
    profileImage?: string;
    wishlist?: number[];
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
    material?: string;
    colors?: string[];
    sizes?: string[];
    sales?: number;
    reviewCount?: number;
    discount?: number;
    stock?: number;
    images?: string[];
}

export interface CartItem extends Product {
    quantity: number;
}

export interface OOTDPost {
    id: number;
    user: string;
    userId?: string;
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
    lastLoginDate?: string;
    status?: 'active' | 'inactive' | 'banned';
    memo?: string;
}

export interface Banner {
    id: number;
    imageUrl: string;
    link: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    position: 'main_hero' | 'popup' | 'middle_banner';
    title?: string;
}

export interface Promotion {
    id: number;
    title: string;
    description: string;
    bannerImage: string;
    productIds: number[];
    startDate: string;
    endDate: string;
    isActive: boolean;
}
