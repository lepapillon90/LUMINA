import { db } from '../firebase';
import {
    collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import {
    HomepageHero, HomepageTimeSale, HomepageNewArrivals,
    HomepageLookbook, HomepageTrendingOOTD, MagazineArticle,
    HomepageInstagramFeed, HomepageNewsletter, NewsletterSubscriber,
    HomepageAnnouncementBar
} from '../types';
import { logAction } from './auditService';
import { getCache, setCache, removeCache, CACHE_KEYS, DEFAULT_TTL } from '../utils/cache';

// Collection names
const HERO_COLLECTION = 'homepage_hero';
const TIMESALE_COLLECTION = 'homepage_timesale';
const NEW_ARRIVALS_COLLECTION = 'homepage_newarrivals';
const LOOKBOOK_COLLECTION = 'homepage_lookbooks';
const TRENDING_OOTD_COLLECTION = 'homepage_trending_ootd';
const MAGAZINE_COLLECTION = 'homepage_magazines';
const INSTAGRAM_FEED_COLLECTION = 'homepage_instagram_feed';
const NEWSLETTER_COLLECTION = 'homepage_newsletter';
const NEWSLETTER_SUBSCRIBERS_COLLECTION = 'newsletter_subscribers';
const ANNOUNCEMENT_BAR_COLLECTION = 'homepage_announcement_bar';

type AdminUser = { uid: string; username: string };

// ========== Hero Section ==========
const HERO_DOC_ID = 'current';

export const getHomepageHero = async (): Promise<HomepageHero | null> => {
    // Try cache first
    const cached = getCache<HomepageHero>(CACHE_KEYS.HERO);
    if (cached) {
        // Update in background
        fetchHeroFromFirebase().catch(() => { });
        return cached;
    }
    return await fetchHeroFromFirebase();
};

const fetchHeroFromFirebase = async (): Promise<HomepageHero | null> => {
    try {
        const docRef = doc(db, HERO_COLLECTION, HERO_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as HomepageHero;
            setCache(CACHE_KEYS.HERO, data, { ttl: DEFAULT_TTL.MEDIUM });
            return data;
        }
        return null;
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage hero:', error);
        return getCache<HomepageHero>(CACHE_KEYS.HERO) || null;
    }
};

export const saveHomepageHero = async (hero: Omit<HomepageHero, 'id'>, adminUser: AdminUser): Promise<HomepageHero> => {
    try {
        const docRef = doc(db, HERO_COLLECTION, HERO_DOC_ID);
        const data = {
            ...hero,
            updatedAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });

        // Clear cache so next load gets fresh data
        removeCache(CACHE_KEYS.HERO);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_HERO',
            'Hero Section',
            'Updated homepage hero section'
        );

        return { id: HERO_DOC_ID, ...hero } as HomepageHero;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage hero:', error);
        throw error;
    }
};

// ========== TimeSale ==========
const TIMESALE_DOC_ID = 'current';

export const getHomepageTimeSale = async (): Promise<HomepageTimeSale | null> => {
    // Try cache first
    const cached = getCache<HomepageTimeSale>(CACHE_KEYS.TIME_SALE);
    if (cached) {
        fetchTimeSaleFromFirebase().catch(() => { });
        return cached;
    }
    return await fetchTimeSaleFromFirebase();
};

const fetchTimeSaleFromFirebase = async (): Promise<HomepageTimeSale | null> => {
    try {
        const docRef = doc(db, TIMESALE_COLLECTION, TIMESALE_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as HomepageTimeSale;

            // 종료일이 지난 경우 자동 비활성화
            if (data.isActive && data.endDate) {
                const endDate = new Date(data.endDate);
                endDate.setHours(23, 59, 59, 999); // 종료일 자정까지 유효
                const now = new Date();

                if (now > endDate) {
                    // 자동 비활성화 - Firebase 업데이트
                    try {
                        await setDoc(docRef, { isActive: false, updatedAt: serverTimestamp() }, { merge: true });
                        console.log('[TimeSale] Auto-deactivated due to expired endDate');
                        removeCache(CACHE_KEYS.TIME_SALE);
                    } catch (updateError) {
                        console.error('[TimeSale] Failed to auto-deactivate:', updateError);
                    }
                    // 비활성화된 데이터 반환
                    return { ...data, isActive: false };
                }
            }

            setCache(CACHE_KEYS.TIME_SALE, data, { ttl: DEFAULT_TTL.SHORT });
            return data;
        }
        return null;
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage timesale:', error);
        return getCache<HomepageTimeSale>(CACHE_KEYS.TIME_SALE) || null;
    }
};

export const saveHomepageTimeSale = async (timeSale: Omit<HomepageTimeSale, 'id'>, adminUser: AdminUser): Promise<HomepageTimeSale> => {
    try {
        const docRef = doc(db, TIMESALE_COLLECTION, TIMESALE_DOC_ID);
        const data = {
            ...timeSale,
            createdAt: timeSale.createdAt || serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        // Remove undefined fields
        Object.keys(data).forEach(key => {
            if ((data as any)[key] === undefined) {
                delete (data as any)[key];
            }
        });

        await setDoc(docRef, data, { merge: true });

        removeCache(CACHE_KEYS.TIME_SALE);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_TIMESALE',
            'TimeSale Section',
            'Updated homepage timesale section'
        );

        return { id: TIMESALE_DOC_ID, ...timeSale } as HomepageTimeSale;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage timesale:', error);
        throw error;
    }
};

// ========== New Arrivals ==========
const NEW_ARRIVALS_DOC_ID = 'current';

export const getHomepageNewArrivals = async (): Promise<HomepageNewArrivals | null> => {
    try {
        const docRef = doc(db, NEW_ARRIVALS_COLLECTION, NEW_ARRIVALS_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as HomepageNewArrivals;
        }
        return null;
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage new arrivals:', error);
        return null;
    }
};

export const saveHomepageNewArrivals = async (newArrivals: Omit<HomepageNewArrivals, 'id'>, adminUser: AdminUser): Promise<HomepageNewArrivals> => {
    try {
        const docRef = doc(db, NEW_ARRIVALS_COLLECTION, NEW_ARRIVALS_DOC_ID);
        const data = {
            ...newArrivals,
            updatedAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_NEW_ARRIVALS',
            'New Arrivals Section',
            `Updated new arrivals with ${newArrivals.productIds.length} products`
        );

        return { id: NEW_ARRIVALS_DOC_ID, ...newArrivals } as HomepageNewArrivals;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage new arrivals:', error);
        throw error;
    }
};

// ========== Lookbook ==========
export const getHomepageLookbooks = async (): Promise<HomepageLookbook[]> => {
    try {
        const q = query(collection(db, LOOKBOOK_COLLECTION), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HomepageLookbook));
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage lookbooks:', error);
        return [];
    }
};

export const createHomepageLookbook = async (lookbook: Omit<HomepageLookbook, 'id'>, adminUser: AdminUser): Promise<HomepageLookbook> => {
    try {
        const data = {
            ...lookbook,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        const docRef = doc(collection(db, LOOKBOOK_COLLECTION));
        await setDoc(docRef, data);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'CREATE_HOMEPAGE_LOOKBOOK',
            lookbook.title,
            `Created lookbook: ${lookbook.title}`
        );

        return { id: docRef.id, ...lookbook } as HomepageLookbook;
    } catch (error) {
        console.error('[MY_LOG] Error creating homepage lookbook:', error);
        throw error;
    }
};

export const updateHomepageLookbook = async (id: string, lookbook: Partial<HomepageLookbook>, adminUser: AdminUser): Promise<void> => {
    try {
        const docRef = doc(db, LOOKBOOK_COLLECTION, id);
        await updateDoc(docRef, {
            ...lookbook,
            updatedAt: serverTimestamp()
        });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_LOOKBOOK',
            lookbook.title || `Lookbook ${id}`,
            `Updated lookbook ${id}`
        );
    } catch (error) {
        console.error('[MY_LOG] Error updating homepage lookbook:', error);
        throw error;
    }
};

export const deleteHomepageLookbook = async (id: string, adminUser: AdminUser): Promise<void> => {
    try {
        await deleteDoc(doc(db, LOOKBOOK_COLLECTION, id));

        await logAction(
            adminUser.uid,
            adminUser.username,
            'DELETE_HOMEPAGE_LOOKBOOK',
            `Lookbook ${id}`,
            `Deleted lookbook ${id}`
        );
    } catch (error) {
        console.error('[MY_LOG] Error deleting homepage lookbook:', error);
        throw error;
    }
};

// ========== Trending OOTD ==========
const TRENDING_OOTD_DOC_ID = 'current';

export const getHomepageTrendingOOTD = async (): Promise<HomepageTrendingOOTD | null> => {
    try {
        const docRef = doc(db, TRENDING_OOTD_COLLECTION, TRENDING_OOTD_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as HomepageTrendingOOTD;
        }
        return null;
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage trending OOTD:', error);
        return null;
    }
};

export const saveHomepageTrendingOOTD = async (trendingOOTD: Omit<HomepageTrendingOOTD, 'id'>, adminUser: AdminUser): Promise<HomepageTrendingOOTD> => {
    try {
        const docRef = doc(db, TRENDING_OOTD_COLLECTION, TRENDING_OOTD_DOC_ID);
        const data = {
            ...trendingOOTD,
            updatedAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_TRENDING_OOTD',
            'Trending OOTD Section',
            'Updated homepage trending OOTD section'
        );

        return { id: TRENDING_OOTD_DOC_ID, ...trendingOOTD } as HomepageTrendingOOTD;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage trending OOTD:', error);
        throw error;
    }
};

// ========== Magazine ==========
export const getMagazineArticles = async (): Promise<MagazineArticle[]> => {
    try {
        const q = query(collection(db, MAGAZINE_COLLECTION), orderBy('displayOrder', 'asc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MagazineArticle));
    } catch (error) {
        console.error('[MY_LOG] Error fetching magazine articles:', error);
        return [];
    }
};

export const createMagazineArticle = async (article: Omit<MagazineArticle, 'id'>, adminUser: AdminUser): Promise<MagazineArticle> => {
    try {
        const data = {
            ...article,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };
        const docRef = doc(collection(db, MAGAZINE_COLLECTION));
        await setDoc(docRef, data);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'CREATE_MAGAZINE_ARTICLE',
            article.title,
            `Created magazine article: ${article.title}`
        );

        return { id: docRef.id, ...article } as MagazineArticle;
    } catch (error) {
        console.error('[MY_LOG] Error creating magazine article:', error);
        throw error;
    }
};

export const updateMagazineArticle = async (id: string, article: Partial<MagazineArticle>, adminUser: AdminUser): Promise<void> => {
    try {
        const docRef = doc(db, MAGAZINE_COLLECTION, id);
        await updateDoc(docRef, {
            ...article,
            updatedAt: serverTimestamp()
        });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_MAGAZINE_ARTICLE',
            article.title || `Article ${id}`,
            `Updated magazine article ${id}`
        );
    } catch (error) {
        console.error('[MY_LOG] Error updating magazine article:', error);
        throw error;
    }
};

export const deleteMagazineArticle = async (id: string, adminUser: AdminUser): Promise<void> => {
    try {
        await deleteDoc(doc(db, MAGAZINE_COLLECTION, id));

        await logAction(
            adminUser.uid,
            adminUser.username,
            'DELETE_MAGAZINE_ARTICLE',
            `Article ${id}`,
            `Deleted magazine article ${id}`
        );
    } catch (error) {
        console.error('[MY_LOG] Error deleting magazine article:', error);
        throw error;
    }
};

// ========== Instagram Feed ==========
const INSTAGRAM_FEED_DOC_ID = 'current';

export const getHomepageInstagramFeed = async (): Promise<HomepageInstagramFeed | null> => {
    try {
        const docRef = doc(db, INSTAGRAM_FEED_COLLECTION, INSTAGRAM_FEED_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as HomepageInstagramFeed;
        }
        return null;
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage instagram feed:', error);
        return null;
    }
};

export const saveHomepageInstagramFeed = async (feed: Omit<HomepageInstagramFeed, 'id'>, adminUser: AdminUser): Promise<HomepageInstagramFeed> => {
    try {
        const docRef = doc(db, INSTAGRAM_FEED_COLLECTION, INSTAGRAM_FEED_DOC_ID);
        const data = {
            ...feed,
            updatedAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_INSTAGRAM_FEED',
            'Instagram Feed Section',
            'Updated homepage instagram feed section'
        );

        return { id: INSTAGRAM_FEED_DOC_ID, ...feed } as HomepageInstagramFeed;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage instagram feed:', error);
        throw error;
    }
};

// ========== Newsletter ==========
const NEWSLETTER_DOC_ID = 'current';

export const getHomepageNewsletter = async (): Promise<HomepageNewsletter | null> => {
    try {
        const docRef = doc(db, NEWSLETTER_COLLECTION, NEWSLETTER_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as HomepageNewsletter;
        }
        return null;
    } catch (error) {
        console.error('[MY_LOG] Error fetching homepage newsletter:', error);
        return null;
    }
};

export const saveHomepageNewsletter = async (newsletter: Omit<HomepageNewsletter, 'id'>, adminUser: AdminUser): Promise<HomepageNewsletter> => {
    try {
        const docRef = doc(db, NEWSLETTER_COLLECTION, NEWSLETTER_DOC_ID);
        const data = {
            ...newsletter,
            updatedAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_NEWSLETTER',
            'Newsletter Section',
            'Updated homepage newsletter settings'
        );

        return { id: NEWSLETTER_DOC_ID, ...newsletter } as HomepageNewsletter;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage newsletter:', error);
        throw error;
    }
};

export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
    try {
        const q = query(collection(db, NEWSLETTER_SUBSCRIBERS_COLLECTION), orderBy('subscribedAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsletterSubscriber));
    } catch (error) {
        console.error('[MY_LOG] Error fetching newsletter subscribers:', error);
        return [];
    }
};

// ========== Announcement Bar ==========
const ANNOUNCEMENT_BAR_DOC_ID = 'current';

export const getHomepageAnnouncementBar = async (): Promise<HomepageAnnouncementBar | null> => {
    // Try cache first
    const cached = getCache<HomepageAnnouncementBar>(CACHE_KEYS.ANNOUNCEMENT_BAR);
    if (cached) {
        fetchAnnouncementBarFromFirebase().catch(() => { });
        return cached;
    }
    return await fetchAnnouncementBarFromFirebase();
};

const fetchAnnouncementBarFromFirebase = async (): Promise<HomepageAnnouncementBar | null> => {
    try {
        const docRef = doc(db, ANNOUNCEMENT_BAR_COLLECTION, ANNOUNCEMENT_BAR_DOC_ID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as HomepageAnnouncementBar;
            setCache(CACHE_KEYS.ANNOUNCEMENT_BAR, data, { ttl: DEFAULT_TTL.MEDIUM });
            return data;
        }
        return null;
    } catch (error: any) {
        // 권한 오류는 조용히 반환 (상위에서 처리)
        if (error?.code !== 'permission-denied') {
            console.warn('[MY_LOG] Error fetching homepage announcement bar:', error);
        }
        // Return cached data on error
        const cached = getCache<HomepageAnnouncementBar>(CACHE_KEYS.ANNOUNCEMENT_BAR);
        if (cached) return cached;
        throw error;
    }
};

export const saveHomepageAnnouncementBar = async (
    announcementBar: Omit<HomepageAnnouncementBar, 'id'>,
    adminUser: AdminUser
): Promise<HomepageAnnouncementBar> => {
    try {
        const docRef = doc(db, ANNOUNCEMENT_BAR_COLLECTION, ANNOUNCEMENT_BAR_DOC_ID);
        const data = {
            ...announcementBar,
            updatedAt: serverTimestamp()
        };
        await setDoc(docRef, data, { merge: true });

        removeCache(CACHE_KEYS.ANNOUNCEMENT_BAR);

        await logAction(
            adminUser.uid,
            adminUser.username,
            'UPDATE_HOMEPAGE_ANNOUNCEMENT_BAR',
            'Announcement Bar',
            'Updated homepage announcement bar settings'
        );

        return { id: ANNOUNCEMENT_BAR_DOC_ID, ...announcementBar } as HomepageAnnouncementBar;
    } catch (error) {
        console.error('[MY_LOG] Error saving homepage announcement bar:', error);
        throw error;
    }
};

