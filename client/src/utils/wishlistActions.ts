import axiosInstance from '../lib/axiosConfig';
import { addWishlistItem, removeWishlistItem } from '../redux/userSlice';
import toast from 'react-hot-toast';
import type { AppDispatch } from '../store';

export const toggleWishlist = async (productId: number, isWishlisted: boolean, dispatch: AppDispatch) => {
  try {
    if (isWishlisted) {
      await axiosInstance.delete(`/api/wishlist/${productId}`);
      dispatch(removeWishlistItem(productId));
      toast.success('Removed from wishlist');
    } else {
      await axiosInstance.post('/api/wishlist', { productId });
      dispatch(addWishlistItem(productId));
      toast.success('Added to wishlist');
    }
  } catch {
    toast.error('Failed to update wishlist');
  }
};
