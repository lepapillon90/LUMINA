import { Product, OOTDPost } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "루미나 펄 드롭 이어링",
    price: 45000,
    category: "earring",
    image: "https://picsum.photos/400/500?random=1",
    description: "골드 도금 체인에 매달린 우아한 담수 진주가 돋보이는 이어링입니다.",
    isNew: true
  },
  {
    id: 2,
    name: "셀레스티얼 골드 링",
    price: 32000,
    category: "ring",
    image: "https://picsum.photos/400/500?random=2",
    description: "밤하늘에서 영감을 받은 미니멀한 디자인의 골드 링입니다.",
  },
  {
    id: 3,
    name: "실버 미스트 목걸이",
    price: 58000,
    category: "necklace",
    image: "https://picsum.photos/400/500?random=3",
    description: "안개를 형상화한 팬던트가 달린 스털링 실버 체인 목걸이입니다.",
    isNew: true
  },
  {
    id: 4,
    name: "빈티지 루비 스터드",
    price: 62000,
    category: "earring",
    image: "https://picsum.photos/400/500?random=4",
    description: "깊은 붉은색 인조 루비가 세팅된 클래식한 빈티지 스타일의 귀걸이입니다.",
  },
  {
    id: 5,
    name: "오션 블루 팔찌",
    price: 28000,
    category: "bracelet",
    image: "https://picsum.photos/400/500?random=5",
    description: "깊은 바다의 색상을 담은 비즈 팔찌로 시원한 느낌을 줍니다.",
  },
  {
    id: 6,
    name: "골든 리프 커프",
    price: 40000,
    category: "bracelet",
    image: "https://picsum.photos/400/500?random=6",
    description: "정교한 잎사귀 디테일이 살아있는 조절 가능한 골드 커프입니다.",
  }
];

export const OOTD_POSTS: OOTDPost[] = [
  {
    id: 101,
    user: "@seoul_chic",
    image: "https://picsum.photos/400/600?random=101",
    likes: 124,
    caption: "오늘 데이트룩의 완성은 루미나 진주 귀걸이! ✨",
    productsUsed: [1]
  },
  {
    id: 102,
    user: "@fashion_daily",
    image: "https://picsum.photos/400/600?random=102",
    likes: 89,
    caption: "심플한 골드 포인트가 어떤 옷이든 잘 어울려요.",
    productsUsed: [2, 6]
  },
  {
    id: 103,
    user: "@minji_style",
    image: "https://picsum.photos/400/600?random=103",
    likes: 245,
    caption: "실버 미스트 목걸이로 완성한 겨울 코디 ❄️",
    productsUsed: [3]
  }
];

export const BANK_INFO = {
  bankName: "루미나 은행 (Lumina Bank)",
  accountNumber: "123-456-789012",
  holder: "(주)루미나"
};