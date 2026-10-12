/**
 * Super Admin & Multi-Tenancy Platform Governance Module.
 * Strict CNDP Loi 09-08 isolation: depends ONLY on auth and common.
 * Has ZERO access to clinical data (patients, consultations, agenda, cnss).
 */
@org.springframework.modulith.ApplicationModule(
        allowedDependencies = {"auth", "common"}
)
package com.dossia.backend.admin;
