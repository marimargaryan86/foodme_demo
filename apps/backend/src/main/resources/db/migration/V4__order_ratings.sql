-- Order ratings: one 1-5 star rating (+ optional comment) per delivered order.
-- Kept permanently; chef.rating is recalculated from these rows on each new rating.

CREATE SEQUENCE foodme.order_rating_id_seq START WITH 1 INCREMENT BY 1;

CREATE TABLE foodme.order_rating (
    id BIGINT NOT NULL PRIMARY KEY,
    order_id BIGINT NOT NULL UNIQUE REFERENCES foodme."order"(id),
    customer_id BIGINT NOT NULL REFERENCES foodme.customer(id),
    chef_id BIGINT NOT NULL REFERENCES foodme.chef(id),
    stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
    comment VARCHAR(1000),
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_order_rating_chef_id ON foodme.order_rating(chef_id);
