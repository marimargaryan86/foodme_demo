---
paths:
  - "apps/backend/src/main/**"
---
# Backend API rules
Rules for Spring Boot source, Flyway migrations and response DTOs.

- Migrations are append-only. Never edit `V1__init.sql`, `V2__images_in_db.sql` or `V3__more_menu_items.sql`. The next one is `V4__<description>.sql`.
- `ImageUrlResponseAdvice.rewrite()` only absolutizes the types it lists in an `instanceof` chain. A new DTO with an image URL needs its own branch that calls `absolutize(...)`.
- A wrapper DTO that contains image DTOs also needs a branch that recurses into them, like `OrderDto` → `getOrderDishList()`. Without one, its URLs stay relative.
- Public and customer endpoints go in `controller/api/`. Admin endpoints go in `controller/admin/Admin*Controller`. Don't mix the two in one controller.
- Build `@RequestMapping` paths from `ControllerUtil` constants (`API_*_CONTROLLER`, `ADMIN_*_CONTROLLER`), and add the matching rule to `SecurityConfig` (`/api/**` and `/admin/**` are secured separately).
