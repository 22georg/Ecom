package com.marqivo.listeners;

import com.marqivo.base.BaseTest;
import com.marqivo.utilities.ReportUtil;
import com.marqivo.utilities.ReportUtil.TestResultItem;
import org.openqa.selenium.WebDriver;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;

public class TestListener implements ITestListener {

    @Override
    public void onTestSuccess(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        String category = getCategory(result);
        long duration = result.getEndMillis() - result.getStartMillis();

        ReportUtil.addResult(new TestResultItem(testName, category, "PASS", duration, null, null));
    }

    @Override
    public void onTestFailure(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        String category = getCategory(result);
        long duration = result.getEndMillis() - result.getStartMillis();
        String error = result.getThrowable() != null ? result.getThrowable().getMessage() : "Test Failed";
        String screenshotPath = (String) result.getAttribute("screenshotPath");

        ReportUtil.addResult(new TestResultItem(testName, category, "FAIL", duration, error, screenshotPath));
    }

    @Override
    public void onTestSkipped(ITestResult result) {
        String testName = result.getMethod().getMethodName();
        String category = getCategory(result);
        long duration = result.getEndMillis() - result.getStartMillis();
        String reason = result.getThrowable() != null ? result.getThrowable().getMessage() : "Test Skipped";

        ReportUtil.addResult(new TestResultItem(testName, category, "SKIP", duration, reason, null));
    }

    @Override
    public void onFinish(ITestContext context) {
        ReportUtil.printVerificationSummary();
    }

    private String getCategory(ITestResult result) {
        String className = result.getTestClass().getName();
        if (className.toLowerCase().contains("admin")) {
            return "ADMIN";
        }
        return "CUSTOMER";
    }
}
