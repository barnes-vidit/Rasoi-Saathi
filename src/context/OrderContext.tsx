import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define types for our context
interface CartItem {
    id: string;
    name: string;
    pricePerKg: number;
    quantity: number;
    image_url?: string;
}

interface OrderContextType {
    cartItems: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    updateCartItemQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;

    totalAmount: number;
    discountedAmount: number;

    selectedSupplier: string | null;
    setSelectedSupplier: (supplierId: string | null) => void;

    selectedGroupOrder: string | null;
    setSelectedGroupOrder: (orderId: string | null) => void;

    language: 'hi' | 'en';
    setLanguage: (lang: 'hi' | 'en') => void;

    refreshTotal: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [selectedGroupOrder, setSelectedGroupOrder] = useState<string | null>(null);
    const [totalAmount, setTotalAmount] = useState(0);
    const [discountedAmount, setDiscountedAmount] = useState(0);
    const [language, setLanguage] = useState<'hi' | 'en'>(
        () => (localStorage.getItem('language') as 'hi' | 'en') || 'hi'
    );

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);


    // Calculate totals whenever cart changes
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
        setTotalAmount(total);
        // 15% Group Discount
        setDiscountedAmount(Math.round(total * 0.85));
    }, [cartItems]);

    const addToCart = (item: CartItem) => {
        setCartItems(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: item.quantity } : i);
            }
            return [...prev, item];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(prev => prev.filter(i => i.id !== itemId));
    };

    const updateCartItemQuantity = (itemId: string, quantity: number) => {
        setCartItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const refreshTotal = () => {
        const total = cartItems.reduce((sum, item) => sum + (item.pricePerKg * item.quantity), 0);
        setTotalAmount(total);
        setDiscountedAmount(Math.round(total * 0.85));
    };

    return (
        <OrderContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateCartItemQuantity,
            clearCart,
            totalAmount,
            discountedAmount,
            selectedSupplier,
            setSelectedSupplier,
            selectedGroupOrder,
            setSelectedGroupOrder,
            language,
            setLanguage,
            refreshTotal
        }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};
