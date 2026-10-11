package com.dossia.backend;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(DossiaApplication.class);

    @Test
    void verifyModularity() {
        modules.verify();
    }
}
