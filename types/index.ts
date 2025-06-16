import type { Product as PrismaProduct, Category as PrismaCategory } from '@prisma/client';

export type Product = PrismaProduct & {
  category?: PrismaCategory;
};

export type Category = PrismaCategory & {
  products?: Product[];
};

export type User = Prisma.UserGetPayload<{
  include: {
    orders: true;
    reviews: true;
    cart: true;
    wishlist: true;
  };
}>;

export type Order = Prisma.OrderGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
    user: true;
    shippingAddress: true;
  };
}>;

export type Review = Prisma.ReviewGetPayload<{
  include: {
    user: true;
    product: true;
  };
}>;

export type Cart = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
    user: true;
  };
}>; 