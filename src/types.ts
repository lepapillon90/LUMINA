
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
    // Membership fields
    grade?: string;
    totalSpent?: number;
    points?: number;
    inviteCode?: string;
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
    sizeStock?: { [size: string]: number }; // 사이즈별 재고 수량 (하위 호환성)
    sizeColorStock?: Array<{ size: string; color: string; quantity: number }>; // 사이즈-색상 조합별 재고
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
    phone?: string;
    email?: string;
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
    points?: number;
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

// User Settings Types
export interface DeliveryAddress {
    id: string;
    name: string;
    recipient: string;
    phone: string;
    address: string;
    detailAddress: string;
    postalCode: string;
    isDefault: boolean;
    createdAt?: any;
}

export interface StyleProfile {
    // 사이즈 정보
    ringSize?: string;
    wristSize?: string;
    neckSize?: string;
    earSize?: string;

    // 선호 소재 및 톤
    tone?: string;
    preferredMaterials?: string[];

    // 스타일 선호도
    preferredStyle?: string[];
    preferredJewelryTypes?: string[];

    // 예산 범위
    budgetRange?: string;

    // 착용 목적
    wearingPurpose?: string[];

    // 디자인 선호도
    designPreference?: string[];

    // 알러지 정보
    allergy?: string;

    // 기념일 정보
    specialOccasions?: {
        birthday?: string;
        anniversary?: string;
        other?: string;
    };
}

export interface NotificationSettings {
    email: boolean;
    sms: boolean;
    push: boolean;
}

// Membership Types
export type MembershipGrade = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'VIP';

export interface MembershipTier {
    grade: MembershipGrade;
    minSpent: number;
    maxSpent: number;
    discountRate: number;
    name: string;
}

export interface Coupon {
    id: string;
    userId: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchaseAmount: number;
    expiryDate: string;
    isUsed: boolean;
    usedAt?: any;
    createdAt: any;
}

export interface PointHistory {
    id: string;
    userId: string;
    type: 'earned' | 'used' | 'expired';
    amount: number;
    description: string;
    orderId?: string;
    expiryDate?: any;
    createdAt: any;
}

// Homepage Management Types
export interface HomepageHero {
    id: string;
    videoUrl?: string;
    imageUrl?: string;
    posterUrl: string;
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface HomepageTimeSale {
    id: string;
    title: string;
    description: string;
    discountPercentage: number;
    productIds: number[];
    countdownEndTime: any;
    backgroundColor?: string;
    backgroundImageUrl?: string;
    textColor?: string;
    isActive: boolean;
    startDate: string;
    endDate: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface HomepageNewArrivals {
    id: string;
    title: string;
    description: string;
    productIds: number[];
    maxDisplayCount: number;
    isActive: boolean;
    updatedAt?: any;
}

export interface LookbookHotspot {
    id: string;
    x: number;
    y: number;
    productId: number;
}

export interface HomepageLookbook {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    hotspots: LookbookHotspot[];
    isActive: boolean;
    season?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface HomepageTrendingOOTD {
    id: string;
    title: string;
    description: string;
    displayCount: number;
    sortBy: 'likes' | 'recent' | 'manual';
    manualPostIds?: number[];
    isActive: boolean;
    updatedAt?: any;
}

export interface MagazineArticle {
    id: string;
    category: string;
    title: string;
    excerpt: string;
    imageUrl: string;
    link: string;
    publishedDate: string;
    displayOrder: number;
    isActive: boolean;
    createdAt?: any;
    updatedAt?: any;
}

export interface InstagramPost {
    id: string;
    imageUrl: string;
    likes: number;
    comments: number;
    link: string;
    displayOrder: number;
    isActive: boolean;
    createdAt?: any;
}

export interface HomepageInstagramFeed {
    id: string;
    accountName: string;
    title: string;
    description: string;
    displayCount: number;
    posts: InstagramPost[];
    isActive: boolean;
    updatedAt?: any;
}

export interface HomepageNewsletter {
    id: string;
    title: string;
    description: string;
    couponCode?: string;
    discountAmount?: number;
    showOnFirstVisit: boolean;
    showOnExitIntent: boolean;
    isActive: boolean;
    updatedAt?: any;
}

export interface NewsletterSubscriber {
    id: string;
    email: string;
    subscribedAt?: any;
    couponCode?: string;
    isActive: boolean;
}

export interface HomepageAnnouncementBar {
    id: string;
    messages: string[];
    backgroundColor?: string;
    textColor?: string;
    rotationInterval?: number; // milliseconds
    isActive: boolean;
    updatedAt?: any;
}

// Inventory Management Types
export interface InventoryLog {
    id: string;
    productId: number;
    productName: string;
    type: '입고' | '출고';
    size?: string;
    color?: string;
    quantity: number;
    beforeQuantity: number; // 변경 전 재고
    afterQuantity: number; // 변경 후 재고
    reason?: string; // 사유 (입고: "신규 입고", "반품 입고" 등, 출고: "판매", "폐기", "반품" 등)
    adminUserId: string;
    adminUsername: string;
    createdAt: any;
    orderId?: string; // 출고인 경우 관련 주문 ID (있는 경우)
}