/**
 * Cross-cutting common module (domain base classes, exceptions, utilities).
 * Marked as OPEN so all domain modules can access common abstractions.
 */
@org.springframework.modulith.ApplicationModule(
        type = org.springframework.modulith.ApplicationModule.Type.OPEN
)
package com.dossia.backend.common;
