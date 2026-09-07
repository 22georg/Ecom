package com.marqivo.utilities;

import com.marqivo.config.TestConfig;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.text.SimpleDateFormat;
import java.util.*;

public class ReportUtil {

    public static class TestResultItem {
        public String name;
        public String category; // CUSTOMER or ADMIN
        public String status;   // PASS, FAIL, SKIP, BLOCKED
        public long durationMs;
        public String errorMessage;
        public String screenshotPath;

        public TestResultItem(String name, String category, String status, long durationMs, String errorMessage, String screenshotPath) {
            this.name = name;
            this.category = category;
            this.status = status;
            this.durationMs = durationMs;
            this.errorMessage = errorMessage;
            this.screenshotPath = screenshotPath;
        }
    }

    private static final List<TestResultItem> results = Collections.synchronizedList(new ArrayList<>());

    public static void addResult(TestResultItem item) {
        results.add(item);
    }

    public static List<TestResultItem> getResults() {
        return new ArrayList<>(results);
    }

    public static void printVerificationSummary() {
        int total = results.size();
        int passed = 0;
        int failed = 0;
        int skipped = 0;
        int blocked = 0;

        int custPass = 0, custTotal = 0;
        int adminPass = 0, adminTotal = 0;

        for (TestResultItem item : results) {
            if ("PASS".equalsIgnoreCase(item.status)) passed++;
            else if ("FAIL".equalsIgnoreCase(item.status)) failed++;
            else if ("SKIP".equalsIgnoreCase(item.status)) skipped++;
            else if ("BLOCKED".equalsIgnoreCase(item.status)) blocked++;

            if ("CUSTOMER".equalsIgnoreCase(item.category)) {
                custTotal++;
                if ("PASS".equalsIgnoreCase(item.status)) custPass++;
            } else if ("ADMIN".equalsIgnoreCase(item.category)) {
                adminTotal++;
                if ("PASS".equalsIgnoreCase(item.status)) adminPass++;
            }
        }

        double passRate = total > 0 ? ((double) passed / total) * 100.0 : 0.0;

        System.out.println("========================================");
        System.out.println("MARQIVO QA AUTOMATED VERIFICATION SUMMARY");
        System.out.println("========================================");
        System.out.println("Application URL: " + TestConfig.getBaseUrl());
        System.out.println("Browser:        " + TestConfig.getBrowser().toUpperCase() + " (Headless: " + TestConfig.isHeadless() + ")");
        System.out.println("Admin Account:  " + TestConfig.getAdminEmail());
        System.out.println("Admin Password: " + TestConfig.getMaskedAdminPassword());
        System.out.println("----------------------------------------");
        System.out.println(String.format("Total Tests:   %d", total));
        System.out.println(String.format("Passed:        %d", passed));
        System.out.println(String.format("Failed:        %d", failed));
        System.out.println(String.format("Skipped:       %d", skipped));
        System.out.println(String.format("Blocked:       %d", blocked));
        System.out.println(String.format("Pass Rate:     %.1f%%", passRate));
        System.out.println("----------------------------------------");
        System.out.println("SUBSYSTEM BREAKDOWN:");
        System.out.println(String.format("Customer Suite: %d/%d PASS", custPass, custTotal));
        System.out.println(String.format("Admin Suite:    %d/%d PASS", adminPass, adminTotal));
        System.out.println("========================================");

        if (failed > 0) {
            System.out.println("FAILED TESTS DETAILS:");
            for (TestResultItem item : results) {
                if ("FAIL".equalsIgnoreCase(item.status)) {
                    System.out.println(" - " + item.name + " (" + item.category + ")");
                    if (item.errorMessage != null) System.out.println("   Error: " + item.errorMessage);
                    if (item.screenshotPath != null) System.out.println("   Screenshot: " + item.screenshotPath);
                }
            }
            System.out.println("========================================");
        }

        generateHtmlReport();
    }

    public static void generateHtmlReport() {
        try {
            File reportDir = new File("target/reports");
            if (!reportDir.exists()) reportDir.mkdirs();

            File htmlFile = new File(reportDir, "marqivo_qa_report.html");
            try (PrintWriter out = new PrintWriter(new FileWriter(htmlFile))) {
                out.println("<!DOCTYPE html><html><head><meta charset='UTF-8'><title>MARQIVO QA Verification Report</title>");
                out.println("<style>");
                out.println("body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 24px; }");
                out.println(".container { max-width: 1200px; margin: 0 auto; }");
                out.println("h1 { color: #10B981; margin-bottom: 4px; }");
                out.println(".card { background: #1E293B; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 24px; }");
                out.println(".grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px; }");
                out.println(".metric { background: #0F172A; padding: 16px; border-radius: 8px; border: 1px solid #334155; }");
                out.println(".metric-val { font-size: 24px; font-weight: bold; margin-top: 4px; }");
                out.println("table { width: 100%; border-collapse: collapse; margin-top: 16px; }");
                out.println("th, td { text-align: left; padding: 12px; border-bottom: 1px solid #334155; font-size: 14px; }");
                out.println("th { background: #0F172A; color: #94A3B8; text-transform: uppercase; font-size: 12px; }");
                out.println(".badge-pass { background: rgba(16,185,129,0.15); color: #10B981; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; }");
                out.println(".badge-fail { background: rgba(244,63,94,0.15); color: #F43F5E; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; }");
                out.println(".badge-skip { background: rgba(245,158,11,0.15); color: #F59E0B; padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 11px; }");
                out.println("</style></head><body><div class='container'>");
                out.println("<h1>MARQIVO QA Verification Execution Report</h1>");
                out.println("<p style='color: #94A3B8;'>Automated UI & Function Test Suite Results</p>");

                int passed = (int) results.stream().filter(r -> "PASS".equalsIgnoreCase(r.status)).count();
                int failed = (int) results.stream().filter(r -> "FAIL".equalsIgnoreCase(r.status)).count();
                int skipped = (int) results.stream().filter(r -> "SKIP".equalsIgnoreCase(r.status)).count();
                double passRate = results.size() > 0 ? ((double) passed / results.size()) * 100.0 : 0.0;

                out.println("<div class='card'><div class='grid'>");
                out.println("<div class='metric'><div>Total Tests</div><div class='metric-val'>" + results.size() + "</div></div>");
                out.println("<div class='metric'><div>Passed</div><div class='metric-val' style='color:#10B981;'>" + passed + "</div></div>");
                out.println("<div class='metric'><div>Failed</div><div class='metric-val' style='color:#F43F5E;'>" + failed + "</div></div>");
                out.println("<div class='metric'><div>Skipped</div><div class='metric-val' style='color:#F59E0B;'>" + skipped + "</div></div>");
                out.println("<div class='metric'><div>Pass Rate</div><div class='metric-val' style='color:#10B981;'>" + String.format("%.1f%%", passRate) + "</div></div>");
                out.println("</div></div>");

                out.println("<div class='card'><h2>Test Results Details</h2><table><thead><tr><th>Test Name</th><th>Category</th><th>Status</th><th>Duration</th><th>Details</th></tr></thead><tbody>");
                for (TestResultItem item : results) {
                    String badgeClass = "PASS".equalsIgnoreCase(item.status) ? "badge-pass" : "FAIL".equalsIgnoreCase(item.status) ? "badge-fail" : "badge-skip";
                    out.println("<tr>");
                    out.println("<td><b>" + item.name + "</b></td>");
                    out.println("<td>" + item.category + "</td>");
                    out.println("<td><span class='" + badgeClass + "'>" + item.status + "</span></td>");
                    out.println("<td>" + item.durationMs + " ms</td>");
                    out.println("<td>" + (item.errorMessage != null ? item.errorMessage : "-") + "</td>");
                    out.println("</tr>");
                }
                out.println("</tbody></table></div>");
                out.println("</div></body></html>");
            }
        } catch (Exception e) {
            System.err.println("Failed to write HTML report: " + e.getMessage());
        }
    }
}
