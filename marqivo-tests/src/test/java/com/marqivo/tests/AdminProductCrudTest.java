package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminProductCrudTest extends BaseTest {

    @Test(priority = 1, description = "Verify Admin Product Management Listing and Creation")
    public void testAdminProductListing() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        AdminLoginPage loginPage = new AdminLoginPage(driver);
        loginPage.login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/products");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/products"), "Admin products route should load.");

        WebElement createBtn = driver.findElement(By.xpath("//button[contains(.,'Create New Product')]"));
        Assert.assertTrue(createBtn.isDisplayed(), "Create Product button should be visible.");
    }
}
