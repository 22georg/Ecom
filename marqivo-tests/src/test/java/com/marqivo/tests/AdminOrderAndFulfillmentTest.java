package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminOrderAndFulfillmentTest extends BaseTest {

    @Test(priority = 1, description = "Verify Admin Order Operations Workspace")
    public void testAdminOrdersWorkspace() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/orders");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/orders"), "Admin orders workspace should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Order Management & Fulfillment')]")).isDisplayed(), "Order management header should be visible.");
    }
}
