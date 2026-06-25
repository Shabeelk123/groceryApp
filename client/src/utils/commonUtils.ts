// Common utility functions for the application

import axiosInstance from "../lib/axiosConfig";

/**
 * Formats a number to currency format
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: '₹')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = '₹'): string => {
  return `${currency}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
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

// Add more utility functions as needed
