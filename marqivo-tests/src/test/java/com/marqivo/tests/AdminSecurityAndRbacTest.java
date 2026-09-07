package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminSecurityAndRbacTest extends BaseTest {

    @Test(priority = 1, description = "Verify Admin Accounts Management Page")
    public void testAdminAccountsPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/admin-users");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/admin-users"), "Admin users page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Admin Accounts')]")).isDisplayed(), "Admin users header should be visible.");
    }

    @Test(priority = 2, description = "Verify RBAC Roles & Permissions Matrix Page")
    public void testRolesMatrixPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/roles");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/roles"), "Roles matrix page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Role-Based Access Control')]")).isDisplayed(), "RBAC matrix header should be visible.");
    }

    @Test(priority = 3, description = "Verify Administrative Audit Logs Page")
    public void testAuditLogsPage() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        new AdminLoginPage(driver).login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        driver.get(TestConfig.getBaseUrl() + "/admin/audit-logs");
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/audit-logs"), "Audit logs page should load.");
        Assert.assertTrue(driver.findElement(By.xpath("//*[contains(text(),'Administrative Audit Trail')]")).isDisplayed(), "Audit logs header should be visible.");
    }
}
