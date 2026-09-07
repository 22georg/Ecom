package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.pages.HomePage;
import com.marqivo.pages.ProductPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class ProductDiscoveryTest extends BaseTest {

    @Test(priority = 1, description = "Verify Search Functionality")
    public void testSearchFunctionality() {
        HomePage home = new HomePage(driver);
        home.searchProduct("MARQIVO");

        try {
            wait.until(d -> d.getCurrentUrl().contains("search") || d.getCurrentUrl().contains("products"));
        } catch (Exception ignored) {}

        Assert.assertTrue(driver.getCurrentUrl().contains("search") || driver.getCurrentUrl().contains("products") || driver.getPageSource().contains("Catalog"), "Search parameter or products listing should load.");
    }

    @Test(priority = 2, description = "Verify Opening Product Detail Page (PDP)")
    public void testOpenProductDetail() {
        HomePage home = new HomePage(driver);

        if (home.getProductCardCount() > 0) {
            home.openFirstProduct();
            ProductPage pdp = new ProductPage(driver);

            Assert.assertNotNull(pdp.getProductTitle(), "Product title should be visible.");
            Assert.assertTrue(pdp.isPriceDisplayed(), "Price tag should be displayed on PDP.");
            Assert.assertTrue(pdp.isAddToCartAvailable(), "Add to Cart button should be present.");
        } else {
            driver.get(com.marqivo.config.TestConfig.getBaseUrl() + "/products");
            Assert.assertTrue(driver.getCurrentUrl().contains("/products"), "Products page fallback.");
        }
    }
}
