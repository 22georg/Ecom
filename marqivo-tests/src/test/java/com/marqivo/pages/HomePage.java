package com.marqivo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class HomePage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By logo = By.cssSelector("a[href='/']");
    private final By searchInput = By.cssSelector("input[placeholder*='Search']");
    private final By searchButton = By.cssSelector("button[type='submit']");
    private final By cartIcon = By.cssSelector("a[href='/cart']");
    private final By wishlistIcon = By.cssSelector("a[href='/wishlist']");
    private final By accountIcon = By.cssSelector("a[href='/account']");
    private final By productCards = By.cssSelector("a[href^='/product/']");
    private final By categoryLinks = By.cssSelector("a[href^='/category/']");

    public HomePage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLogoDisplayed() {
        return driver.findElement(logo).isDisplayed();
    }

    public void searchProduct(String query) {
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(searchInput));
        input.clear();
        input.sendKeys(query);
        try {
            driver.findElement(searchButton).click();
        } catch (Exception e) {
            input.sendKeys(Keys.ENTER);
        }
    }

    private final By cartButton = By.cssSelector("button[aria-label='Shopping Cart'], a[href='/cart']");

    public void openCart() {
        try {
            driver.findElement(cartButton).click();
        } catch (Exception e) {
            driver.get(com.marqivo.config.TestConfig.getBaseUrl() + "/cart");
        }
    }

    public void openAccount() {
        driver.findElement(accountIcon).click();
    }

    public void openFirstProduct() {
        List<WebElement> cards = driver.findElements(productCards);
        if (!cards.isEmpty()) {
            cards.get(0).click();
        }
    }

    public int getProductCardCount() {
        return driver.findElements(productCards).size();
    }
}
