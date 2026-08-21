// Common utility functions for the application

import axiosInstance from "../lib/axiosConfig";

/**
 * Formats a number to currency format
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'AED')
 * @returns Formatted currency string, e.g. "AED 1,299.00"
 */
export const formatCurrency = (amount: number, currency: string = import.meta.env.VITE_CURRENCY || 'AED'): string => {
  return `${currency} ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

/**
 * Validates if the given string is a valid email
 * @param email - Email to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const checkSellerAuth = async () => {
    try {
        const response = await axiosInstance.get("/api/sellers/auth");
        return response.data;
    } catch (error) {
        return null;
    }
}

// The 7 Emirates — used as a fixed dropdown instead of a free-text state field
export const EMIRATES = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ajman',
  'Umm Al Quwain',
  'Ras Al Khaimah',
  'Fujairah',
];

// UAE VAT
export const VAT_RATE = 0.05;

// Flat shipping fees by zone — free above this subtotal regardless of emirate
export const FREE_SHIPPING_THRESHOLD = 200;
export const DUBAI_SHIPPING_FEE = 15;
export const OTHER_EMIRATES_SHIPPING_FEE = 25;

export const getShippingFee = (subtotal: number, emirate: string): number => {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return emirate === 'Dubai' ? DUBAI_SHIPPING_FEE : OTHER_EMIRATES_SHIPPING_FEE;
};

// Add more utility functions as needed
