package am.foodme.backend.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class OrderRatingRequestDto {
    /** Double so that 4.5 reaches the service and is refused, instead of being truncated to 4. */
    private Double stars;
    private String comment;
}
