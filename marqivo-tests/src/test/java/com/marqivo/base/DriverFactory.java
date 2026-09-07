package com.marqivo.base;

import com.marqivo.config.TestConfig;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;

import java.io.File;
import java.time.Duration;

public class DriverFactory {

    public static WebDriver createDriver() {
        String browser = TestConfig.getBrowser();
        boolean headless = TestConfig.isHeadless();
        WebDriver driver;

        if ("edge".equalsIgnoreCase(browser)) {
            WebDriverManager.edgedriver().setup();
            EdgeOptions options = new EdgeOptions();
            if (headless) {
                options.addArguments("--headless=new");
            }
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--remote-allow-origins=*");
            driver = new EdgeDriver(options);
        } else {
            // Default: Chrome
            String systemChromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
            ChromeOptions options = new ChromeOptions();
            if (new File(systemChromePath).exists()) {
                options.setBinary(systemChromePath);
            }
            WebDriverManager.chromedriver().setup();

            if (headless) {
                options.addArguments("--headless=new");
            }
            options.addArguments("--window-size=1920,1080");
            options.addArguments("--disable-gpu");
            options.addArguments("--no-sandbox");
            options.addArguments("--disable-dev-shm-usage");
            options.addArguments("--remote-allow-origins=*");
            driver = new ChromeDriver(options);
        }

        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(2));
        driver.manage().window().maximize();
        return driver;
    }
}
