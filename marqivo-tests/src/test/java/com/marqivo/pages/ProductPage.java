package com.marqivo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class ProductPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By productTitle = By.cssSelector("h1");
    private final By priceTag = By.xpath("//*[contains(text(),'BDT') or contains(text(),'৳')]");
    private final By addToCartButton = By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'add to cart')]");
    private final By wishlistButton = By.xpath("//button[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'wishlist')]");
    private final By skuLabel = By.xpath("//*[contains(text(),'SKU')]");

    public ProductPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public String getProductTitle() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(productTitle)).getText();
    }

    public boolean isPriceDisplayed() {
        return !driver.findElements(priceTag).isEmpty();
    }

    public boolean isAddToCartAvailable() {
        return !driver.findElements(addToCartButton).isEmpty();
    }

    public void clickAddToCart() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(addToCartButton));
        btn.click();
    }
}
