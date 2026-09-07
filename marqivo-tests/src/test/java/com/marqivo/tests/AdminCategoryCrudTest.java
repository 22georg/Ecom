package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminCategoryCrudTest extends BaseTest {

    @Test(priority = 1, description = "Verify Category Hierarchy Page Loading")
    public void testCategoryHierarchyPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/categories");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/categories"), "Category management page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Category Hierarchy')]")).isDisplayed(), "Header title should be visible.");
    }
}
