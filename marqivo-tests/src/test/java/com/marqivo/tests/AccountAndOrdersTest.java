package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AccountAndOrdersTest extends BaseTest {

    @Test(priority = 1, description = "Verify Account Route Guarding and Login Redirect")
    public void testAccountSecurityRedirect() {
        driver.get(com.marqivo.config.TestConfig.getBaseUrl() + "/account");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "Unauthenticated access to /account must redirect to /login.");
    }

    @Test(priority = 2, description = "Verify Customer Orders Guarding")
    public void testCustomerOrdersRoute() {
        driver.get(com.marqivo.config.TestConfig.getBaseUrl() + "/account/orders");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "Unauthenticated access to /account/orders must redirect to /login.");
    }
}
