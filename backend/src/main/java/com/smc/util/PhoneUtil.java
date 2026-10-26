package com.smc.util;

import java.util.regex.Pattern;

public class PhoneUtil {

    private static final Pattern CLEAN_PATTERN = Pattern.compile("[^0-9]");
    private static final Pattern LOCAL_9_DIGIT_PATTERN = Pattern.compile("^[1-9][0-9]{8}$");

    /**
     * Normalizes a Sri Lankan phone number to E.164 format: +94XXXXXXXXX.
     * Accepts:
     * - 0712345678 (10 digits starting with 0)
     * - +94712345678 or +94 71 234 5678
     * - 94712345678
     * - 0094712345678
     * - Valid Sri Lankan landlines (e.g. 0672220261, +94672220261)
     *
     * @param rawPhone raw phone string
     * @return normalized phone in format "+94XXXXXXXXX", or null if input is null/blank or invalid
     */
    public static String normalizeSriLankanPhone(String rawPhone) {
        if (rawPhone == null || rawPhone.isBlank()) {
            return null;
        }

        // Remove all non-digits
        String digits = CLEAN_PATTERN.matcher(rawPhone).replaceAll("");

        String local9;
        if (digits.startsWith("0094")) {
            local9 = digits.substring(4);
        } else if (digits.startsWith("94")) {
            local9 = digits.substring(2);
        } else if (digits.startsWith("0")) {
            local9 = digits.substring(1);
        } else if (digits.length() == 9) {
            local9 = digits;
        } else {
            return null;
        }

        // Sri Lankan phone must be exactly 9 digits without the trunk 0 / country code
        if (local9.length() == 9 && LOCAL_9_DIGIT_PATTERN.matcher(local9).matches()) {
            return "+94" + local9;
        }

        return null;
    }

    /**
     * Checks if a phone number is a valid Sri Lankan phone number in any supported format.
     */
    public static boolean isValidSriLankanPhone(String rawPhone) {
        return normalizeSriLankanPhone(rawPhone) != null;
    }
}
