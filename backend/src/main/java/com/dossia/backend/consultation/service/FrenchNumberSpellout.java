package com.dossia.backend.consultation.service;

/**
 * Utility to convert integer day counts (1..365) into standard French words.
 * Mandatory for Moroccan medical anti-fraud regulations on official Sick Leave Certificates (Arrêt de Travail).
 */
public final class FrenchNumberSpellout {

    private static final String[] UNITS = {
            "zéro", "un", "deux", "trois", "quatre", "cinq",
            "six", "sept", "huit", "neuf", "dix",
            "onze", "douze", "treize", "quatorze", "quinze",
            "seize", "dix-sept", "dix-huit", "dix-neuf"
    };

    private static final String[] TENS = {
            "", "", "vingt", "trente", "quarante", "cinquante", "soixante"
    };

    private FrenchNumberSpellout() {}

    public static String toWords(Integer number) {
        if (number == null) {
            return "";
        }
        if (number < 0) {
            return "moins " + toWords(-number);
        }
        if (number < 20) {
            return UNITS[number];
        }
        if (number < 70) {
            int tensIndex = number / 10;
            int rem = number % 10;
            if (rem == 0) {
                return TENS[tensIndex];
            } else if (rem == 1) {
                return TENS[tensIndex] + " et un";
            } else {
                return TENS[tensIndex] + "-" + UNITS[rem];
            }
        }
        if (number < 80) { // 70 to 79
            int rem = number - 60;
            if (rem == 11) {
                return "soixante et onze";
            } else {
                return "soixante-" + UNITS[rem];
            }
        }
        if (number < 90) { // 80 to 89
            int rem = number - 80;
            if (rem == 0) {
                return "quatre-vingts";
            } else if (rem == 1) {
                return "quatre-vingt-un";
            } else {
                return "quatre-vingt-" + UNITS[rem];
            }
        }
        if (number < 100) { // 90 to 99
            int rem = number - 80;
            return "quatre-vingt-" + UNITS[rem];
        }
        if (number == 100) {
            return "cent";
        }
        if (number < 200) {
            return "cent " + toWords(number - 100);
        }
        if (number < 1000) {
            int hundreds = number / 100;
            int rem = number % 100;
            String prefix = UNITS[hundreds] + " cent";
            if (rem == 0) {
                return prefix + "s";
            } else {
                return prefix + " " + toWords(rem);
            }
        }
        return String.valueOf(number);
    }
}
