package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminModerationAndCouponsTest extends BaseTest {

    @Test(priority = 1, description = "Verify Review Moderation Workspace")
    public void testReviewsModerationPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/reviews");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/reviews"), "Reviews moderation page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Product Reviews Moderation')]")).isDisplayed(), "Reviews title should be visible.");
    }

    @Test(priority = 2, description = "Verify Coupon Administration Page")
    public void testCouponsAdministrationPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/coupons");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/coupons"), "Coupons page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Promotional Coupons')]")).isDisplayed(), "Coupons title should be visible.");
    }
}
