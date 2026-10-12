package am.foodme.backend;

import am.foodme.backend.repository.OrderRatingRepository;
import am.foodme.backend.repository.OrderRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderRatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderRatingRepository orderRatingRepository;

    private String register() throws Exception {
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "fullName", "Ann",
                                "email", "rating-" + UUID.randomUUID() + "@example.com",
                                "phoneNumber", "+37491234567",
                                "password", "secret123"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asText();
    }

    /** Places a takeaway order for chef 2 and returns its number. */
    private String placeOrder(String token) throws Exception {
        String response = mockMvc.perform(post("/api/order")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "chefId", 2,
                                "receiverName", "Ann",
                                "receiverPhoneNumber", "+37491234567",
                                "receiverEmail", "ann@example.com",
                                "paymentType", "CASH",
                                "deliveryMethod", "TAKEAWAY",
                                "createOrderDishes", List.of(Map.of("dishId", 1, "quantity", 1))))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("number").asText();
    }

    private String deliveredOrder(String token) throws Exception {
        String number = placeOrder(token);
        markDelivered(number);
        return number;
    }

    private void markDelivered(String number) {
        var order = orderRepository.findByNumber(number).orElseThrow();
        order.setStatus("DELIVERED");
        orderRepository.save(order);
    }

    private org.springframework.test.web.servlet.ResultActions rate(String token, String number, Object stars, String comment) throws Exception {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("stars", stars);
        if (comment != null) body.put("comment", comment);
        var req = post("/api/customer/orders/" + number + "/rating")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(body));
        if (token != null) req = req.header("Authorization", "Bearer " + token);
        return mockMvc.perform(req);
    }

    @Test
    void rateDeliveredOrder_savesAndShowsInOrderList() throws Exception {
        String token = register();
        String number = deliveredOrder(token);

        rate(token, number, 5, "Great").andExpect(status().isOk())
                .andExpect(jsonPath("$.stars").value(5))
                .andExpect(jsonPath("$.comment").value("Great"));

        mockMvc.perform(get("/api/customer/orders").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.list[0].rating.stars").value(5))
                .andExpect(jsonPath("$.list[0].rating.comment").value("Great"));
        mockMvc.perform(get("/api/order/number/" + number))
                .andExpect(jsonPath("$.rating.stars").value(5));
    }

    @Test
    void commentIsOptional() throws Exception {
        String token = register();
        rate(token, deliveredOrder(token), 3, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.comment").doesNotExist());
    }

    @Test
    void nonDeliveredOrder_isRefused() throws Exception {
        String token = register();
        rate(token, placeOrder(token), 4, null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Only delivered orders can be reviewed."));
    }

    @Test
    void secondRating_isRefused() throws Exception {
        String token = register();
        String number = deliveredOrder(token);
        rate(token, number, 4, null).andExpect(status().isOk());
        rate(token, number, 5, null).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Order already reviewed."));
    }

    @Test
    void someoneElsesOrder_isNotFound() throws Exception {
        String owner = register();
        String number = deliveredOrder(owner);
        rate(register(), number, 4, null).andExpect(status().isNotFound());
    }

    @Test
    void unauthenticated_isRefused() throws Exception {
        String token = register();
        rate(null, deliveredOrder(token), 4, null).andExpect(status().isUnauthorized());
    }

    @Test
    void invalidStars_areRefused() throws Exception {
        String token = register();
        String number = deliveredOrder(token);
        for (Object bad : new Object[]{0, 6, -1, 4.5, "five"}) {
            rate(token, number, bad, null).andExpect(status().isBadRequest());
        }
        rate(token, number, null, null).andExpect(status().isBadRequest());
    }

    @Test
    void commentLimit_is1000Characters() throws Exception {
        String token = register();
        String number = deliveredOrder(token);
        rate(token, number, 4, "x".repeat(1001)).andExpect(status().isBadRequest());
        rate(token, number, 4, "x".repeat(1000)).andExpect(status().isOk());
    }

    @Test
    void chefRating_isAverageRoundedToOneDecimal() throws Exception {
        // chef 2 is only used by this class; other tests in it add 5/3/4/... so assert on a delta-free chef
        String token = register();
        String a = deliveredOrder(token);
        String b = deliveredOrder(token);
        rate(token, a, 5, null).andExpect(status().isOk());
        double afterFirst = chefRating();
        rate(token, b, 4, null).andExpect(status().isOk());
        double afterSecond = chefRating();
        // rounded to one decimal
        assertEquals(Math.round(afterSecond * 10) / 10.0, afterSecond);
        assertEquals(Math.round(afterFirst * 10) / 10.0, afterFirst);
    }

    @Test
    void starBoundaries_1And5_areAccepted() throws Exception {
        String token = register();
        rate(token, deliveredOrder(token), 1, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.stars").value(1));
        rate(token, deliveredOrder(token), 5, null).andExpect(status().isOk())
                .andExpect(jsonPath("$.stars").value(5));
    }

    @Test
    void chefRating_equalsStoredAverageOfAllRatings() throws Exception {
        String token = register();
        rate(token, deliveredOrder(token), 5, null).andExpect(status().isOk());
        rate(token, deliveredOrder(token), 2, null).andExpect(status().isOk());

        double average = orderRatingRepository.averageStarsByChefId(2L);
        double expected = Math.round(average * 10) / 10.0;
        assertEquals(expected, chefRating());
    }

    private double chefRating() throws Exception {
        String body = mockMvc.perform(get("/api/chef/2")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).get("rating").asDouble();
    }
}
