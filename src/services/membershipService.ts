import { db } from '../firebase';
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    updateDoc,
    addDoc,
    Timestamp 
} from 'firebase/firestore';
import { Coupon, PointHistory, MembershipGrade, MembershipTier } from '../types';

const MEMBERSHIP_TIERS: MembershipTier[] = [
    { grade: 'Bronze', minSpent: 0, maxSpent: 500000, discountRate: 1, name: '브론즈' },
    { grade: 'Silver', minSpent: 500000, maxSpent: 2000000, discountRate: 2, name: '실버' },
    { grade: 'Gold', minSpent: 2000000, maxSpent: 5000000, discountRate: 3, name: '골드' },
    { grade: 'Platinum', minSpent: 5000000, maxSpent: 10000000, discountRate: 5, name: '플래티넘' },
    { grade: 'VIP', minSpent: 10000000, maxSpent: Infinity, discountRate: 10, name: 'VIP' }
];

// 멤버십 등급 계산
export const calculateMembershipGrade = (totalSpent: number): MembershipGrade => {
    for (let i = MEMBERSHIP_TIERS.length - 1; i >= 0; i--) {
        if (totalSpent >= MEMBERSHIP_TIERS[i].minSpent) {
            return MEMBERSHIP_TIERS[i].grade;
        }
    }
    return 'Bronze';
};

// 멤버십 등급 정보 가져오기
export const getMembershipTier = (grade: MembershipGrade): MembershipTier => {
    return MEMBERSHIP_TIERS.find(tier => tier.grade === grade) || MEMBERSHIP_TIERS[0];
};

// 다음 등급까지 필요한 금액 계산
export const getNextTierInfo = (currentGrade: MembershipGrade, totalSpent: number) => {
    const currentIndex = MEMBERSHIP_TIERS.findIndex(tier => tier.grade === currentGrade);
    
    if (currentIndex === -1 || currentIndex === MEMBERSHIP_TIERS.length - 1) {
        return null; // 이미 최고 등급
    }
    
    const nextTier = MEMBERSHIP_TIERS[currentIndex + 1];
    const remainingAmount = nextTier.minSpent - totalSpent;
    
    return {
        nextGrade: nextTier.grade,
        nextGradeName: nextTier.name,
        remainingAmount: Math.max(0, remainingAmount),
        progress: totalSpent >= MEMBERSHIP_TIERS[currentIndex].minSpent 
            ? ((totalSpent - MEMBERSHIP_TIERS[currentIndex].minSpent) / (nextTier.minSpent - MEMBERSHIP_TIERS[currentIndex].minSpent)) * 100
            : 0
    };
};

// 쿠폰 조회
export const getUserCoupons = async (userId: string): Promise<Coupon[]> => {
    try {
        const couponsQuery = query(
            collection(db, 'user_coupons'),
            where('userId', '==', userId),
            where('isUsed', '==', false),
            orderBy('expiryDate', 'asc')
        );
        
        const querySnapshot = await getDocs(couponsQuery);
        const coupons: Coupon[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            coupons.push({
                id: doc.id,
                ...data
            } as Coupon);
        });
        
        // 만료일 체크
        const now = new Date();
        return coupons.filter(coupon => {
            const expiryDate = coupon.expiryDate instanceof Timestamp 
                ? coupon.expiryDate.toDate() 
                : new Date(coupon.expiryDate);
            return expiryDate > now;
        });
    } catch (error) {
        console.error('[MY_LOG] Error fetching user coupons:', error);
        return [];
    }
};

// 포인트 내역 조회
export const getPointHistory = async (userId: string, limitCount: number = 50): Promise<PointHistory[]> => {
    try {
        const pointsQuery = query(
            collection(db, 'point_history'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
        
        const querySnapshot = await getDocs(pointsQuery);
        const history: PointHistory[] = [];
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            history.push({
                id: doc.id,
                ...data
            } as PointHistory);
        });
        
        return history;
    } catch (error) {
        console.error('[MY_LOG] Error fetching point history:', error);
        return [];
    }
};

// 포인트 적립
export const earnPoints = async (
    userId: string, 
    amount: number, 
    description: string, 
    orderId?: string
): Promise<void> => {
    try {
        // 포인트 내역 추가
        await addDoc(collection(db, 'point_history'), {
            userId,
            type: 'earned',
            amount,
            description,
            orderId: orderId || null,
            createdAt: Timestamp.now(),
            expiryDate: Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) // 1년 후 만료
        });
        
        // 사용자 포인트 업데이트
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const currentPoints = userDoc.data().points || 0;
            await updateDoc(userRef, {
                points: currentPoints + amount
            });
        }
    } catch (error) {
        console.error('[MY_LOG] Error earning points:', error);
        throw error;
    }
};

// 친구 초대 코드 생성
export const generateInviteCode = (userId: string, username: string): string => {
    const prefix = 'LUMINA';
    const userHash = userId.substring(0, 6).toUpperCase();
    const usernameHash = username.substring(0, 4).toUpperCase();
    return `${prefix}${userHash}${usernameHash}`;
};

// 친구 초대 코드 가져오기 또는 생성
export const getOrCreateInviteCode = async (userId: string, username: string): Promise<string> => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
            const inviteCode = userDoc.data().inviteCode;
            if (inviteCode) {
                return inviteCode;
            }
        }
        
        // 코드가 없으면 생성
        const newInviteCode = generateInviteCode(userId, username);
        await updateDoc(userRef, {
            inviteCode: newInviteCode
        });
        
        return newInviteCode;
    } catch (error) {
        console.error('[MY_LOG] Error getting/creating invite code:', error);
        return generateInviteCode(userId, username);
    }
};

// 사용자 멤버십 정보 가져오기
export const getUserMembershipInfo = async (userId: string) => {
    try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
            return null;
        }
        
        const userData = userDoc.data();
        const totalSpent = userData.totalSpent || 0;
        const currentGrade = userData.grade || calculateMembershipGrade(totalSpent);
        const points = userData.points || 0;
        
        // 등급 업데이트 (필요시)
        const calculatedGrade = calculateMembershipGrade(totalSpent);
        if (calculatedGrade !== currentGrade) {
            await updateDoc(userRef, {
                grade: calculatedGrade
            });
        }
        
        const tier = getMembershipTier(calculatedGrade);
        const nextTierInfo = getNextTierInfo(calculatedGrade, totalSpent);
        
        return {
            grade: calculatedGrade,
            gradeName: tier.name,
            totalSpent,
            points,
            discountRate: tier.discountRate,
            nextTierInfo
        };
    } catch (error) {
        console.error('[MY_LOG] Error getting user membership info:', error);
        throw error;
    }
};

