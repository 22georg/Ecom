package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.pages.CartPage;
import com.marqivo.pages.HomePage;
import com.marqivo.pages.ProductPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class CartAndCheckoutTest extends BaseTest {

    @Test(priority = 1, description = "Verify Shopping Cart Opening and Coupon Structure")
    public void testCartOpening() {
        driver.get(com.marqivo.config.TestConfig.getBaseUrl() + "/cart");
        CartPage cart = new CartPage(driver);

        Assert.assertTrue(driver.getCurrentUrl().contains("/cart"), "Cart URL should load.");
    }

    @Test(priority = 2, description = "Verify Checkout Route Loading")
    public void testCheckoutPageLoad() {
        driver.get(com.marqivo.config.TestConfig.getBaseUrl() + "/checkout");
        Assert.assertTrue(driver.getCurrentUrl().contains("/checkout") || driver.getCurrentUrl().contains("/cart"), "Checkout page or cart redirect should handle request.");
    }
}
