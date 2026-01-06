export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface UseWishlistReturn {
  items: string[]; // product IDs
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  loading: boolean;
  count: number;
}

