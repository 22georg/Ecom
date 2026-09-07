package com.marqivo.utilities;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

public class ElementDiscoveryUtil {

    public enum ElementCategory {
        SAFE,
        NAVIGATION,
        FORM_SUBMIT,
        DESTRUCTIVE,
        PAYMENT,
        LOGOUT,
        UNKNOWN
    }

    public static class DiscoveredElement {
        public String text;
        public String tagName;
        public String href;
        public ElementCategory category;
        public boolean isEnabled;

        public DiscoveredElement(String text, String tagName, String href, ElementCategory category, boolean isEnabled) {
            this.text = text;
            this.tagName = tagName;
            this.href = href;
            this.category = category;
            this.isEnabled = isEnabled;
        }
    }

    public static List<DiscoveredElement> discoverButtons(WebDriver driver) {
        List<DiscoveredElement> list = new ArrayList<>();
        try {
            List<WebElement> elements = driver.findElements(By.cssSelector("button, a[role='button'], input[type='submit']"));
            for (WebElement el : elements) {
                if (!el.isDisplayed()) continue;

                String text = el.getText().trim();
                if (text.isEmpty()) text = el.getAttribute("title");
                if (text == null || text.isEmpty()) text = el.getAttribute("aria-label");
                if (text == null || text.isEmpty()) text = "Unlabeled Button";

                ElementCategory category = classifyElement(text, el.getAttribute("class"));
                list.add(new DiscoveredElement(text, el.getTagName(), null, category, el.isEnabled()));
            }
        } catch (Exception e) {
            System.err.println("Button discovery error: " + e.getMessage());
        }
        return list;
    }

    public static List<DiscoveredElement> discoverLinks(WebDriver driver) {
        List<DiscoveredElement> list = new ArrayList<>();
        try {
            List<WebElement> elements = driver.findElements(By.cssSelector("a[href]"));
            for (WebElement el : elements) {
                if (!el.isDisplayed()) continue;
                String href = el.getAttribute("href");
                String text = el.getText().trim();
                if (text.isEmpty()) text = href;

                if (href != null && href.startsWith("http")) {
                    list.add(new DiscoveredElement(text, "a", href, ElementCategory.NAVIGATION, el.isEnabled()));
                }
            }
        } catch (Exception e) {
            System.err.println("Link discovery error: " + e.getMessage());
        }
        return list;
    }

    private static ElementCategory classifyElement(String text, String className) {
        String lowerText = text.toLowerCase();
        String lowerClass = className != null ? className.toLowerCase() : "";

        if (lowerText.contains("logout") || lowerText.contains("sign out")) return ElementCategory.LOGOUT;
        if (lowerText.contains("delete") || lowerText.contains("archive") || lowerText.contains("cancel order")) return ElementCategory.DESTRUCTIVE;
        if (lowerText.contains("pay") || lowerText.contains("place order") || lowerText.contains("checkout")) return ElementCategory.PAYMENT;
        if (lowerText.contains("submit") || lowerText.contains("save") || lowerText.contains("create")) return ElementCategory.FORM_SUBMIT;
        if (lowerText.contains("view") || lowerText.contains("details") || lowerText.contains("navigate")) return ElementCategory.NAVIGATION;

        return ElementCategory.SAFE;
    }
}
