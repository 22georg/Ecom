package com.marqivo.utilities;

import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;

import java.io.File;
import java.text.SimpleDateFormat;
import java.util.Date;

public class ScreenshotUtil {

    public static String captureScreenshot(WebDriver driver, String testName) {
        if (driver == null) return null;
        try {
            TakesScreenshot ts = (TakesScreenshot) driver;
            File source = ts.getScreenshotAs(OutputType.FILE);

            String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss_SSS").format(new Date());
            String fileName = testName + "_" + timestamp + ".png";

            File destinationDir = new File("screenshots/failed");
            if (!destinationDir.exists()) {
                destinationDir.mkdirs();
            }

            File destination = new File(destinationDir, fileName);
            FileUtils.copyFile(source, destination);
            return destination.getAbsolutePath();
        } catch (Exception e) {
            System.err.println("Failed to capture screenshot: " + e.getMessage());
            return null;
        }
    }
}
