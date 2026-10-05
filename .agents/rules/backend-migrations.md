---
paths:
  - "apps/backend/src/main/resources/db/migration/**"
  - "apps/backend/src/main/java/**/model/**"
---
# Backend schema rules
Flyway owns the schema; Hibernate only checks it. `application.properties` sets `spring.flyway.enabled=true` (schema `foodme`, `classpath:db/migration`) and `spring.jpa.hibernate.ddl-auto=validate`. The JPA entities are in `am.foodme.backend.model`.

- **Every schema change is a new migration:** `V{n}__description.sql`, with `n` one above the highest existing version (`V1`–`V3` today). Changing an entity's fields, tables, columns, types or constraints without one makes the app fail to start, because `validate` rejects a schema that doesn't match the entities.
- **Never edit, rename or delete an applied migration.** Flyway stores a checksum per migration, so a changed file fails startup on every database that already ran it, prod included. Fix mistakes with a new migration. Never reuse a version number.
- **Qualify objects with the schema** (`foodme.table`), as the existing migrations do.
- **Tests don't run migrations.** The `test` profile (`application-test.properties`) uses H2 with Flyway off and `ddl-auto=create-drop`, so a green `./gradlew test` doesn't prove a migration works. Check it against the local Postgres (`./gradlew bootRun`) and keep `src/test/resources/data.sql` in line with the entities.
- **Image URLs:** images are stored in Postgres (`foodme.image`, served at `/api/images/**`) and referenced by relative `/api/images/...` paths; never store an absolute host. `ImageUrlResponseAdvice` makes them absolute per request, but only for the DTOs it lists (`ChefResponseDto`, `ExploreChefResponseDto`, `DishDto`, `OrderDishDto`, `OrderDto`, `AdminListResponseDto`, `DishPaginationCountDto`). A new DTO that carries or wraps an image URL must be added to its `rewrite` method.
- The deployed database is shared: don't change seed or catalog data in a migration unless that is the task.
