package com.dossia.backend.config;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseMigrationConfig {

    @Bean
    @ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
    public Flyway flyway(DataSource dataSource) {
        Flyway flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
        flyway.migrate();
        return flyway;
    }

    @Bean
    public static BeanFactoryPostProcessor entityManagerFactoryDependsOnFlyway() {
        return beanFactory -> {
            if (beanFactory.containsBeanDefinition("flyway")) {
                for (String beanName : beanFactory.getBeanNamesForType(EntityManagerFactory.class, true, false)) {
                    var beanDefinition = beanFactory.getBeanDefinition(beanName);
                    String[] dependsOn = beanDefinition.getDependsOn();
                    if (dependsOn == null) {
                        beanDefinition.setDependsOn("flyway");
                    } else {
                        String[] newDependsOn = new String[dependsOn.length + 1];
                        System.arraycopy(dependsOn, 0, newDependsOn, 0, dependsOn.length);
                        newDependsOn[dependsOn.length] = "flyway";
                        beanDefinition.setDependsOn(newDependsOn);
                    }
                }
            }
        };
    }
}
