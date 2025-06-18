import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  slug?: string
}

export interface ShippingAddress {
  fullName: string
  address: string
  city: string
  postalCode: string
  country: string
}

interface CartStore {
  items: CartItem[]
  shippingAddress: ShippingAddress | null
  paymentMethod: string | null
  
  // Actions
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setShippingAddress: (address: ShippingAddress) => void
  setPaymentMethod: (method: string) => void
  
  // Getters
  total: number
  itemsCount: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      shippingAddress: null,
      paymentMethod: null,
      
      addItem: (item: CartItem) => {
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id)
          
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            }
          }
          
          return {
            items: [...state.items, { ...item, quantity: item.quantity || 1 }],
          }
        })
      },
      
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id),
        }))
      },
      
      updateQuantity: (id: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))
      },
      
      clearCart: () => set({ 
        items: [], 
        shippingAddress: null, 
        paymentMethod: null 
      }),
      
      setShippingAddress: (address: ShippingAddress) => {
        set({ shippingAddress: address })
      },
      
      setPaymentMethod: (method: string) => {
        set({ paymentMethod: method })
      },
      
      // Getters calculés dynamiquement
      get total() {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      
      get itemsCount() {
        return get().items.reduce(
          (count, item) => count + item.quantity,
          0
        )
      },
    }),
    {
      name: 'nomah-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
) 