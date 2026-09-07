package com.marqivo.tests;

import com.marqivo.base.BaseTest;
import com.marqivo.pages.HomePage;
import com.marqivo.utilities.ElementDiscoveryUtil;
import com.marqivo.utilities.ElementDiscoveryUtil.DiscoveredElement;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.List;

public class CustomerNavigationTest extends BaseTest {

    @Test(priority = 1, description = "Verify Homepage Logo and Elements Load")
    public void testHomepageLoad() {
        HomePage home = new HomePage(driver);
        Assert.assertTrue(home.isLogoDisplayed(), "MARQIVO Logo should be visible on homepage.");
        Assert.assertTrue(driver.getCurrentUrl().contains("3000") || driver.getCurrentUrl().contains("http"), "Valid base URL expected.");
    }

    @Test(priority = 2, description = "Discover and Verify Navigation Links")
    public void testNavigationLinksDiscovery() {
        List<DiscoveredElement> links = ElementDiscoveryUtil.discoverLinks(driver);
        Assert.assertFalse(links.isEmpty(), "Storefront should contain navigation links.");

        int checked = 0;
        for (DiscoveredElement link : links) {
            if (checked >= 5) break;
            if (link.href != null && link.href.contains(driver.getCurrentUrl())) {
                driver.navigate().to(link.href);
                Assert.assertTrue(driver.getPageSource().length() > 100, "Page should render content.");
                checked++;
            }
        }
    }

    @Test(priority = 3, description = "Verify Cart & Account Route Destinations")
    public void testCartAndAccountRoutes() {
        HomePage home = new HomePage(driver);

        home.openCart();
        Assert.assertTrue(driver.getCurrentUrl().contains("/cart") || driver.getPageSource().contains("Cart") || driver.getPageSource().contains("Shopping"), "Cart drawer or cart route should open.");

        driver.navigate().to(com.marqivo.config.TestConfig.getBaseUrl() + "/login");
        Assert.assertTrue(driver.getCurrentUrl().contains("/login"), "Login route should open.");
    }
}
