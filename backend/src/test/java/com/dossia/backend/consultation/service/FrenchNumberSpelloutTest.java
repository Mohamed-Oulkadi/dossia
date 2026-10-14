package com.dossia.backend.consultation.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

class FrenchNumberSpelloutTest {

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({
            "1, un",
            "2, deux",
            "3, trois",
            "4, quatre",
            "5, cinq",
            "7, sept",
            "10, dix",
            "14, quatorze",
            "15, quinze",
            "20, vingt",
            "21, vingt et un",
            "22, vingt-deux",
            "30, trente",
            "31, trente et un",
            "45, quarante-cinq",
            "60, soixante",
            "71, soixante et onze",
            "75, soixante-quinze",
            "80, quatre-vingts",
            "81, quatre-vingt-un",
            "90, quatre-vingt-dix"
    })
    @DisplayName("Converts common sick leave days (1..90) accurately into French words for anti-fraud rules")
    void shouldConvertCommonSickLeaveDaysAccurately(int number, String expected) {
        assertThat(FrenchNumberSpellout.toWords(number)).isEqualTo(expected);
    }

    @Test
    @DisplayName("Handles null and zero safely")
    void shouldHandleNullAndZeroSafely() {
        assertThat(FrenchNumberSpellout.toWords(null)).isEmpty();
        assertThat(FrenchNumberSpellout.toWords(0)).isEqualTo("zéro");
    }
}
