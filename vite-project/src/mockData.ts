import { ItemProps } from './components/Item';
// two sample beats for mock mode
export const mockBeats: ItemProps[] = [
  {
    id: 9001,
    title: 'pluhcks',
    author_id: 1,
    bpm: 193,
    musical_key: 'F major',
    tags: ['ambient', 'generative'],
    image_url: '/mock-beat1.jpg',
    mp3_url: '/mock-beat1.mp3',
  },
  {
    id: 9002,
    title: 'Golden Hour',
    author_id: 1,
    bpm: 96,
    musical_key: 'G major',
    tags: ['chill', 'lofi'],
    image_url: '/mock-beat2.jpg',
    mp3_url: '/mock-beat2.mp3',
  },
];

export interface MockBeatDetails {
  id: number;
  title: string;
  bpm: number;
  musical_key: string;
  authors: string[];
  tags: string[];
  image_url: string;
  mp3_url: string;
  sample?: string;
}

export const mockBeatDetails: Record<number, MockBeatDetails> = {
  9001: {
    id: 9001,
    title: 'pluhcks',
    bpm: 193,
    musical_key: 'F major',
    authors: ['Demo Producer'],
    tags: ['ambient', 'generative'],
    image_url: '/mock-beat1.jpg',
    mp3_url: '/mock-beat1.mp3',
  },
  9002: {
    id: 9002,
    title: 'Golden Hour',
    bpm: 96,
    musical_key: 'G major',
    authors: ['Demo Producer'],
    tags: ['chill', 'lofi'],
    image_url: '/mock-beat2.jpg',
    mp3_url: '/mock-beat2.mp3',
  },
};

export const mockLicenses = [
  { id: 'mock-1', name: 'MP3 Lease', price: '$29.99' },
  { id: 'mock-2', name: 'WAV Lease', price: '$49.99' },
  { id: 'mock-3', name: 'Exclusive', price: '$299.99' },
];

export const MOCK_USER = {
  name: 'Demo User',
  role: 'user',
};

//mock cart and orders for localStorage

export interface MockCartItem {
  cart_id: number;
  beat_id: number;
  beat_title: string;
  bpm: number;
  musical_key: string;
  license_id: string;
  license_name: string;
  license_price: number;
  image_url: string;
}

export interface MockOrder {
  id: number;
  total_price: string;
  is_paid: boolean;
  created_at: string;
  items: MockCartItem[];
}

const MOCK_CART_KEY = 'mockCart';
const MOCK_ORDERS_KEY = 'mockOrders';

export function getMockCart(): MockCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToMockCart(beat: MockBeatDetails, license: { id: string; name: string; price: string }): MockCartItem {
  const cart = getMockCart();
  const item: MockCartItem = {
    cart_id: Date.now(),
    beat_id: beat.id,
    beat_title: beat.title,
    bpm: beat.bpm,
    musical_key: beat.musical_key,
    license_id: license.id,
    license_name: license.name,
    license_price: parseFloat(license.price.replace('$', '')),
    image_url: beat.image_url,
  };
  cart.push(item);
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(cart));
  return item;
}

export function removeFromMockCart(cartId: number): MockCartItem[] {
  const cart = getMockCart().filter((i) => i.cart_id !== cartId);
  localStorage.setItem(MOCK_CART_KEY, JSON.stringify(cart));
  return cart;
}

export function getMockOrders(): MockOrder[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_ORDERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMockOrders(orders: MockOrder[]) {
  localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(orders));
}

export function placeMockOrder(): MockOrder {
  const cart = getMockCart();
  const total = cart.reduce((sum, i) => sum + i.license_price, 0);
  const order: MockOrder = {
    id: Date.now(),
    total_price: total.toFixed(2),
    is_paid: false,
    created_at: new Date().toISOString(),
    items: cart,
  };
  const orders = getMockOrders();
  orders.unshift(order);
  saveMockOrders(orders);
  localStorage.removeItem(MOCK_CART_KEY);
  return order;
}

export function getMockOrder(id: number): MockOrder | null {
  return getMockOrders().find((o) => o.id === id) ?? null;
}

export function payMockOrder(id: number): MockOrder | null {
  const orders = getMockOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.is_paid = true;
  saveMockOrders(orders);
  return order;
}
