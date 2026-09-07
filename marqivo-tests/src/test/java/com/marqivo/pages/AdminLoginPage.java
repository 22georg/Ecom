package com.marqivo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AdminLoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By emailInput = By.cssSelector("input[type='email']");
    private final By passwordInput = By.cssSelector("input[type='password']");
    private final By submitButton = By.cssSelector("button[type='submit']");
    private final By errorBanner = By.cssSelector("div[class*='rose-500']");

    public AdminLoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void login(String email, String password) {
        WebElement emailEl = wait.until(ExpectedConditions.visibilityOfElementLocated(emailInput));
        emailEl.clear();
        emailEl.sendKeys(email);

        WebElement passEl = driver.findElement(passwordInput);
        passEl.clear();
        passEl.sendKeys(password);

        try {
            WebElement btn = driver.findElement(submitButton);
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        } catch (Exception e) {
            passEl.sendKeys(org.openqa.selenium.Keys.ENTER);
        }
        try {
            wait.until(ExpectedConditions.or(
                ExpectedConditions.urlContains("/admin/dashboard"),
                ExpectedConditions.visibilityOfElementLocated(errorBanner)
            ));
            Thread.sleep(1000);
        } catch (Exception ignored) {}
    }

    public boolean isErrorDisplayed() {
        return !driver.findElements(errorBanner).isEmpty();
    }
}
