package com.marqivo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CartPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By checkoutButton = By.cssSelector("a[href='/checkout'], button[type='button']");
    private final By couponInput = By.cssSelector("input[placeholder*='Coupon']");
    private final By applyCouponButton = By.xpath("//button[contains(text(),'Apply')]");
    private final By cartItems = By.cssSelector("div[class*='border']");

    public CartPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isCheckoutButtonDisplayed() {
        return !driver.findElements(checkoutButton).isEmpty();
    }

    public void proceedToCheckout() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(checkoutButton));
        btn.click();
    }

    public void applyCoupon(String code) {
        if (!driver.findElements(couponInput).isEmpty()) {
            WebElement input = driver.findElement(couponInput);
            input.clear();
            input.sendKeys(code);
            driver.findElement(applyCouponButton).click();
        }
    }
}
