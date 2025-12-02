import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Customer, Order } from '../types';

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

// Mock Traffic Data (Since we don't have real tracking)
export const getTrafficSources = async (): Promise<TrafficSource[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
        { source: 'Direct', visits: 1250, percentage: 35 },
        { source: 'Organic Search', visits: 980, percentage: 28 },
        { source: 'Social Media (Instagram)', visits: 850, percentage: 24 },
        { source: 'Paid Ads', visits: 320, percentage: 9 },
        { source: 'Referral', visits: 140, percentage: 4 }
    ];
};

// Customer Segmentation Logic
export const getCustomerSegments = async (): Promise<CustomerSegment[]> => {
    try {
        // Fetch all customers and orders
        // In a real app, this would be done via a backend aggregation query or cloud function
        // to avoid fetching all data to the client.
        const customersSnapshot = await getDocs(collection(db, 'users')); // Assuming users collection contains customers
        const ordersSnapshot = await getDocs(collection(db, 'orders'));

        const customers: Customer[] = [];
        customersSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.role !== 'ADMIN') {
                customers.push({ id: doc.id, ...data } as Customer);
            }
        });

        const orders: Order[] = [];
        ordersSnapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });

        // Calculate metrics per customer
        const customerMetrics = customers.map(customer => {
            const customerOrders = orders.filter(o => o.userId === customer.id);
            const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);
            const lastOrderDate = customerOrders.length > 0
                ? customerOrders.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)[0].createdAt
                : null;

            return {
                ...customer,
                totalSpent,
                orderCount: customerOrders.length,
                lastOrderDate
            };
        });

        // Define Segments
        const vipCustomers = customerMetrics.filter(c => c.totalSpent >= 1000000 || c.orderCount >= 5);

        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        const atRiskCustomers = customerMetrics.filter(c =>
            c.orderCount > 0 &&
            c.lastOrderDate &&
            new Date(c.lastOrderDate.seconds * 1000) < threeMonthsAgo
        );

        const newCustomers = customerMetrics.filter(c =>
            c.orderCount === 1 &&
            c.lastOrderDate &&
            new Date(c.lastOrderDate.seconds * 1000) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        );

        return [
            {
                id: 'vip',
                name: 'VIP 고객',
                count: vipCustomers.length,
                description: '누적 구매액 100만원 이상 또는 5회 이상 구매',
                customers: vipCustomers
            },
            {
                id: 'at_risk',
                name: '이탈 위험',
                count: atRiskCustomers.length,
                description: '최근 3개월간 구매 이력이 없는 기존 고객',
                customers: atRiskCustomers
            },
            {
                id: 'new',
                name: '신규 고객',
                count: newCustomers.length,
                description: '최근 30일 내 첫 구매 고객',
                customers: newCustomers
            }
        ];

    } catch (error) {
        console.error("Error calculating customer segments:", error);
        return [];
    }
};
