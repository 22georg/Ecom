package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminReturnRefundTest extends BaseTest {

    @Test(priority = 1, description = "Verify Return Requests Workspace")
    public void testReturnsWorkspace() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/returns");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/returns"), "Returns route should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Return Requests Workspace')]")).isDisplayed(), "Returns title should be visible.");
    }

    @Test(priority = 2, description = "Verify Refund History Ledger")
    public void testRefundsLedger() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/refunds");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/refunds"), "Refunds route should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Refund History & Audit')]")).isDisplayed(), "Refunds title should be visible.");
    }
}
