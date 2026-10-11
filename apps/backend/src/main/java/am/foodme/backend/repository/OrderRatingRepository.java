package am.foodme.backend.repository;

import am.foodme.backend.model.OrderRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRatingRepository extends JpaRepository<OrderRating, Long> {
    boolean existsByOrderId(Long orderId);

    @Query("SELECT AVG(r.stars) FROM OrderRating r WHERE r.chef.id = :chefId")
    Double averageStarsByChefId(Long chefId);
}
