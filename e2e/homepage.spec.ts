import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier que le titre de la page est correct
    await expect(page).toHaveTitle(/Nomah AI/);
    
    // Vérifier que le header est présent
    await expect(page.locator('header')).toBeVisible();
    
    // Vérifier que le logo/nom du site est présent
    await expect(page.getByRole('link', { name: 'Nomah AI' })).toBeVisible();
    
    // Vérifier que la navigation est présente
    await expect(page.getByRole('link', { name: 'Accueil' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Produits', exact: true })).toBeVisible();
    
    // Vérifier que la barre de recherche est présente
    await expect(page.getByPlaceholder('Rechercher des produits...')).toBeVisible();
    
    // Vérifier que le panier est présent
    await expect(page.locator('[href="/cart"]')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur le lien Produits dans la navigation
    await page.getByRole('link', { name: 'Produits', exact: true }).click();
    
    // Vérifier que nous sommes sur la page des produits
    await expect(page).toHaveURL(/\/products/);
    
    // Vérifier que des produits sont affichés
    await expect(page.locator('[data-testid="product-card"]').first()).toBeVisible({ timeout: 10000 });
  });

  test('should perform a search', async ({ page }) => {
    await page.goto('/');
    
    // Effectuer une recherche
    const searchInput = page.getByPlaceholder('Rechercher des produits...');
    await searchInput.fill('iPhone');
    await page.getByRole('button', { name: 'Rechercher' }).click();
    
    // Vérifier que nous sommes sur la page de recherche
    await expect(page).toHaveURL(/\/search/);
    
    // Vérifier que des résultats sont affichés
    await expect(page.getByText('iPhone', { exact: false })).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to cart', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur l'icône du panier
    await page.locator('[href="/cart"]').click();
    
    // Vérifier que nous sommes sur la page du panier
    await expect(page).toHaveURL(/\/cart/);
    
    // Vérifier que la page du panier s'affiche
    await expect(page.getByText('Panier', { exact: false })).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Définir la taille mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Vérifier que le contenu est visible sur mobile
    await expect(page.getByRole('link', { name: 'Nomah AI' })).toBeVisible();
    await expect(page.getByPlaceholder('Rechercher des produits...')).toBeVisible();
    
    // Vérifier que la navigation mobile fonctionne
    await expect(page.locator('[href="/cart"]')).toBeVisible();
  });
}); 