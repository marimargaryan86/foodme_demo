---
paths:
  - "apps/backend/src/test/**"
---
# Backend test rules
Follow the existing `*ControllerTest.java` classes in `am.foodme.backend` (Chef, Dish, Order, CustomerAuth).

- One `<Controller>Test` class per controller. It is annotated with `@SpringBootTest`, `@AutoConfigureMockMvc` and `@ActiveProfiles("test")`, autowires `MockMvc` (plus `ObjectMapper` for JSON bodies), and uses static imports from `MockMvcRequestBuilders` / `MockMvcResultMatchers`.
- Method names follow `method_scenario_outcome`, e.g. `createOrder_withoutToken_unauthorized`, `login_wrongPassword_rejected`.
- Get customer tokens the way `OrderControllerTest.customerToken()` does: POST `/api/auth/register` with a UUID email and read `token` from the response.
- Add fixtures to `src/test/resources/data.sql`. Use `foodme.`-qualified table names and explicit ids above the existing ones.
- Existing tests assert on seed data (e.g. `getActiveDishesForChef_firstResultIsLavashWrap`, active-chef counts). Rerun `./gradlew test` after you change `data.sql`.
- The Spring context, and with it the order-number sequence, is shared across tests. Use `@TestMethodOrder` + `@Order` only when assertions depend on sequence, as in `OrderControllerTest`.
