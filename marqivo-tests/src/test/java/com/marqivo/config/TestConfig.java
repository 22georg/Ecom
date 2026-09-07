package com.marqivo.config;

import java.io.File;
import java.io.FileInputStream;
import java.util.Properties;

public class TestConfig {
    private static final Properties properties = new Properties();

    static {
        try {
            File envFile = new File("test.env");
            if (envFile.exists()) {
                try (FileInputStream fis = new FileInputStream(envFile)) {
                    properties.load(fis);
                }
            }
        } catch (Exception ignored) {
        }
    }

    public static String getBaseUrl() {
        return getEnvOrProp("BASE_URL", "http://localhost:3000");
    }

    public static String getAdminEmail() {
        return getEnvOrProp("ADMIN_EMAIL", "admin@marqivo.com");
    }

    public static String getAdminPassword() {
        return getEnvOrProp("ADMIN_PASSWORD", "MarqivoAdmin2026!");
    }

    public static String getMaskedAdminPassword() {
        String pass = getAdminPassword();
        if (pass == null || pass.isEmpty()) return "NOT CONFIGURED";
        return "********";
    }

    public static String getTestUserEmail() {
        return getEnvOrProp("TEST_USER_EMAIL", "customer@marqivo.com");
    }

    public static String getTestUserPassword() {
        return getEnvOrProp("TEST_USER_PASSWORD", "Customer2026!");
    }

    public static String getBrowser() {
        return getEnvOrProp("BROWSER", "chrome").toLowerCase();
    }

    public static boolean isHeadless() {
        return Boolean.parseBoolean(getEnvOrProp("HEADLESS", "true"));
    }

    private static String getEnvOrProp(String key, String defaultValue) {
        String sysVal = System.getProperty(key);
        if (sysVal != null && !sysVal.isEmpty()) return sysVal;

        String envVal = System.getenv(key);
        if (envVal != null && !envVal.isEmpty()) return envVal;

        String propVal = properties.getProperty(key);
        if (propVal != null && !propVal.isEmpty()) return propVal;

        return defaultValue;
    }
}
