package com.marqivo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class AdminSidebar {
    private final WebDriver driver;

    private final By navLinks = By.cssSelector("aside a[href^='/admin/']");

    public AdminSidebar(WebDriver driver) {
        this.driver = driver;
    }

    public List<WebElement> getNavLinks() {
        try {
            new WebDriverWait(driver, Duration.ofSeconds(10))
                .until(ExpectedConditions.presenceOfElementLocated(navLinks));
        } catch (Exception ignored) {}
        return driver.findElements(navLinks);
    }

    public void navigateTo(String path) {
        List<WebElement> links = getNavLinks();
        for (WebElement link : links) {
            String href = link.getAttribute("href");
            if (href != null && href.endsWith(path)) {
                link.click();
                return;
            }
        }
        driver.get(driver.getCurrentUrl() + (path.startsWith("/") ? path : "/" + path));
    }
}
