
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
    displayName?: string;
    displayId?: string;
    phoneNumber?: string;
    jobTitle?: string;
    department?: string;
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
    shortDescription?: string;
}

export interface CartItem extends Product {
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
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
    shippingAddress?: string;
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
    id: string | number;
    imageUrl: string;
    link: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    position: 'main_hero' | 'popup' | 'middle_banner';
    title?: string;
}

export interface Promotion {
    id: string | number;
    title: string;
    description: string;
    bannerImage: string;
    productIds: number[];
    startDate: string;
    endDate: string;
    isActive: boolean;
}

// Analytics Types
export interface CustomerSegment {
    id: string;
    name: string;
    count: number;
    description: string;
    customers: Customer[];
}

export interface TrafficSource {
    source: string;
    visits: number;
    percentage: number;
}

export interface AuditLog {
    id: string;
    userId: string;
    username: string;
    action: string;
    target: string;
    details: string;
    timestamp: string;
}
