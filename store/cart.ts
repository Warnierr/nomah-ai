import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  countInStock: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemsCount: number
  total: number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemsCount: 0,
      total: 0,

      addItem: (item) => {
        const currentItems = get().items
        const existingItem = currentItems.find((i) => i.id === item.id)

        if (existingItem) {
          const newQuantity = Math.min(existingItem.quantity + 1, item.countInStock)
          set({
            items: currentItems.map((i) =>
              i.id === item.id ? { ...i, quantity: newQuantity } : i
            ),
          })
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }] })
        }

        // Update totals
        const items = get().items
        set({
          itemsCount: items.reduce((total, item) => total + item.quantity, 0),
          total: items.reduce((total, item) => total + item.price * item.quantity, 0),
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))

        // Update totals
        const items = get().items
        set({
          itemsCount: items.reduce((total, item) => total + item.quantity, 0),
          total: items.reduce((total, item) => total + item.price * item.quantity, 0),
        })
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }))

        // Update totals
        const items = get().items
        set({
          itemsCount: items.reduce((total, item) => total + item.quantity, 0),
          total: items.reduce((total, item) => total + item.price * item.quantity, 0),
        })
      },

      clearCart: () => {
        set({ items: [], itemsCount: 0, total: 0 })
      },
    }),
    {
      name: 'cart-storage',
    }
  )
) 