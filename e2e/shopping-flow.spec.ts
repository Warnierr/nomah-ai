import { test, expect } from '@playwright/test';

test.describe('Shopping Flow', () => {
  test('should complete a full shopping journey', async ({ page }) => {
    // 1. Aller sur la page d'accueil
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Nomah AI' })).toBeVisible();

    // 2. Naviguer vers les produits
    await page.getByRole('link', { name: 'Produits', exact: true }).click();
    await expect(page).toHaveURL(/\/products/);

    // 3. Attendre que les produits se chargent et cliquer sur le premier
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.click();

    // 4. Vérifier que nous sommes sur la page du produit
    await expect(page).toHaveURL(/\/products\/[^\/]+$/);
    
    // 5. Ajouter le produit au panier
    const addToCartButton = page.getByRole('button', { name: /ajouter au panier/i });
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    // 6. Vérifier que le produit a été ajouté (toast ou notification)
    await expect(page.getByText(/ajouté/i)).toBeVisible({ timeout: 5000 });

    // 7. Aller au panier
    await page.locator('[href="/cart"]').click();
    await expect(page).toHaveURL(/\/cart/);

    // 8. Vérifier que le produit est dans le panier
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

    // 9. Procéder au checkout (si l'utilisateur n'est pas connecté, il sera redirigé vers la connexion)
    const checkoutButton = page.getByRole('button', { name: /commander/i });
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click();
      
      // Si redirigé vers la connexion, c'est normal
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(checkout|auth)/);
    }
  });

  test('should update cart quantities', async ({ page }) => {
    // Aller directement au panier (supposons qu'il y a déjà des articles)
    await page.goto('/cart');

    // Attendre que le panier se charge
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 });

    // Trouver les boutons de quantité
    const increaseButton = page.locator('[data-testid="increase-quantity"]').first();
    const decreaseButton = page.locator('[data-testid="decrease-quantity"]').first();
    const quantityDisplay = page.locator('[data-testid="quantity-display"]').first();

    if (await increaseButton.isVisible()) {
      // Obtenir la quantité initiale
      const initialQuantity = await quantityDisplay.textContent();
      
      // Augmenter la quantité
      await increaseButton.click();
      
      // Vérifier que la quantité a augmenté
      await expect(quantityDisplay).not.toHaveText(initialQuantity || '');
    }
  });

  test('should remove items from cart', async ({ page }) => {
    await page.goto('/cart');

    // Attendre que le panier se charge
    await page.waitForSelector('[data-testid="cart-item"]', { timeout: 10000 });

    // Compter les articles initiaux
    const initialItems = await page.locator('[data-testid="cart-item"]').count();

    if (initialItems > 0) {
      // Supprimer le premier article
      const removeButton = page.locator('[data-testid="remove-item"]').first();
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        // Vérifier que l'article a été supprimé
        await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(initialItems - 1);
      }
    }
  });

  test('should search and filter products', async ({ page }) => {
    await page.goto('/');

    // Effectuer une recherche
    const searchInput = page.getByPlaceholder('Rechercher des produits...');
    await searchInput.fill('iPhone');
    await page.getByRole('button', { name: 'Rechercher' }).click();

    // Vérifier que nous sommes sur la page de recherche
    await expect(page).toHaveURL(/\/search/);

    // Attendre que les résultats se chargent
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });

    // Vérifier que les résultats contiennent le terme recherché
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // Vérifier qu'au moins un produit contient "iPhone"
      const firstProductName = await productCards.first().locator('h3').textContent();
      expect(firstProductName?.toLowerCase()).toContain('iphone');
    }
  });

  test('should handle empty cart', async ({ page }) => {
    await page.goto('/cart');

    // Si le panier est vide, vérifier le message approprié
    const emptyCartMessage = page.getByText(/panier est vide/i);
    const cartItems = page.locator('[data-testid="cart-item"]');

    // Soit il y a des articles, soit le message de panier vide
    const hasItems = await cartItems.count() > 0;
    const hasEmptyMessage = await emptyCartMessage.isVisible();

    expect(hasItems || hasEmptyMessage).toBeTruthy();

    if (hasEmptyMessage) {
      // Vérifier qu'il y a un lien pour continuer les achats
      await expect(page.getByText(/continuer/i)).toBeVisible();
    }
  });

  test('should display product details correctly', async ({ page }) => {
    await page.goto('/products');
    
    // Attendre que les produits se chargent
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Cliquer sur le premier produit
    await page.locator('[data-testid="product-card"]').first().click();
    
    // Vérifier que nous sommes sur une page de produit
    await expect(page).toHaveURL(/\/products\/[^\/]+$/);
    
    // Vérifier que les éléments essentiels sont présents
    await expect(page.locator('h1')).toBeVisible(); // Nom du produit
    await expect(page.getByText(/€/)).toBeVisible(); // Prix
    await expect(page.locator('img')).toBeVisible(); // Image du produit
    await expect(page.getByRole('button', { name: /ajouter au panier/i })).toBeVisible(); // Bouton d'ajout
  });
}); 