package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.config.TestConfig;
import com.marqivo.pages.AdminLoginPage;
import com.marqivo.pages.AdminSidebar;
import org.openqa.selenium.WebElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class AdminNavigationTest extends BaseTest {

    private final String[] adminRoutes = {
        "/admin/dashboard",
        "/admin/products",
        "/admin/categories",
        "/admin/inventory",
        "/admin/customers",
        "/admin/orders",
        "/admin/returns",
        "/admin/refunds",
        "/admin/reviews",
        "/admin/coupons",
        "/admin/shipping",
        "/admin/tax",
        "/admin/reports",
        "/admin/admin-users",
        "/admin/roles",
        "/admin/audit-logs"
    };

    @Test(priority = 1, description = "Verify Full Admin Sidebar Navigation Discovery")
    public void testAdminSidebarNavigation() {
        driver.get(TestConfig.getBaseUrl() + "/admin/login");
        AdminLoginPage loginPage = new AdminLoginPage(driver);
        loginPage.login(TestConfig.getAdminEmail(), TestConfig.getAdminPassword());

        AdminSidebar sidebar = new AdminSidebar(driver);
        List<WebElement> navLinks = sidebar.getNavLinks();
        Assert.assertFalse(navLinks.isEmpty(), "Admin sidebar should discover navigation links.");

        for (String route : adminRoutes) {
            driver.get(TestConfig.getBaseUrl() + route);
            Assert.assertTrue(driver.getCurrentUrl().contains(route), "Route " + route + " should be accessible.");
            Assert.assertTrue(driver.getPageSource().length() > 200, "Route " + route + " should render content.");
        }
    }
}
