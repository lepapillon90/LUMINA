
export interface Product {
  id: number;
  name: string;
  price: number;
  category: 'earring' | 'necklace' | 'ring' | 'bracelet';
  image: string;
  description: string;
  isNew?: boolean;
  tags?: string[];
}

export interface OOTDPost {
  id: number;
  user: string;
  image: string;
  likes: number;
  caption: string;
  productsUsed: number[]; // Product IDs
  comments?: { user: string; text: string }[];
  isLiked?: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: string; // Changed to string to support Korean statuses like '결제완료', '배송중'
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
  grade: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
}

export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN'
}

export interface User {
  username: string;
  role: UserRole;
}
