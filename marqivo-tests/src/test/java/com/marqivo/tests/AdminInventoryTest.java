package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminInventoryTest extends BaseTest {

    @Test(priority = 1, description = "Verify Warehouse Inventory Levels Page")
    public void testInventoryLevelsPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/inventory");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/inventory"), "Inventory management page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Warehouse & Stock Control')]")).isDisplayed(), "Inventory title should be visible.");
    }
}
