// Mirrors client/src/utils/commonUtils.ts — no shared types package between
// client and server, so these constants are duplicated by hand (see CLAUDE.md).

export const VAT_RATE = 0.05; // UAE VAT

export const FREE_SHIPPING_THRESHOLD = 200;
export const DUBAI_SHIPPING_FEE = 15;
export const OTHER_EMIRATES_SHIPPING_FEE = 25;

export const getShippingFee = (subtotal: number, emirate: string): number => {
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    return emirate === "Dubai" ? DUBAI_SHIPPING_FEE : OTHER_EMIRATES_SHIPPING_FEE;
};
