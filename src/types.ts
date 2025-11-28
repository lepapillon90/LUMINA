export enum UserRole {
    ADMIN = 'ADMIN',
    GUEST = 'GUEST'
}

export interface User {
    uid: string;
    username: string;
    role: UserRole;
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
}
