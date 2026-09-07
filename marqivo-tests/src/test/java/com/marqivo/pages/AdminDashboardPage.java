package com.marqivo.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class AdminDashboardPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By dashboardHeader = By.xpath("//*[contains(text(),'Operations Overview')]");
    private final By periodButtons = By.cssSelector("button");
    private final By kpiCards = By.cssSelector("div[class*='border-slate-800']");

    public AdminDashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isDashboardLoaded() {
        return !driver.findElements(dashboardHeader).isEmpty();
    }
}
