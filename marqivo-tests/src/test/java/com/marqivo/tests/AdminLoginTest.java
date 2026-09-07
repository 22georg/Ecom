package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminDashboardPage;
import com.marqivo.pages.AdminLoginPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AdminLoginTest extends BaseTest {

    @Test(priority = 1, description = "Verify Admin Login Page Loads")
    public void testAdminLoginPageLoad() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        AdminLoginPage loginPage = new AdminLoginPage(driver);

        System.out.println("Admin Account Configured:");
        System.out.println("Email:    " + TestConfig.getAdminEmail());
        System.out.println("Password: " + TestConfig.getMaskedAdminPassword());

        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/login"), "Admin login route should load.");
    }

    @Test(priority = 2, description = "Verify Valid Admin Authentication")
    public void testValidAdminAuthentication() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        AdminLoginPage loginPage = new AdminLoginPage(driver);

        loginPage.login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        AdminDashboardPage dashboard = new AdminDashboardPage(driver);
        Assert.assertTrue(driver.getCurrentUrl().contains("/admin/dashboard"), "Successful admin sign-in should navigate to /admin/dashboard.");
        Assert.assertTrue(dashboard.isDashboardLoaded(), "Dashboard header should be visible.");
    }

    @Test(priority = 3, description = "Verify Invalid Admin Credentials Failure")
    public void testInvalidAdminCredentials() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        AdminLoginPage loginPage = new AdminLoginPage(driver);

        loginPage.login("wrongadmin@marqivo.com", "WrongPassword123!");

        Assert.assertTrue(loginPage.isErrorDisplayed() || driver.getCurrentUrl().contains("/admin/login"), "Invalid credentials should be rejected safely.");
    }
}
