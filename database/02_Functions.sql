USE BTL2;

DROP FUNCTION IF EXISTS fn_expected_appointment_fee;
DROP FUNCTION IF EXISTS fn_profile_paid_total;

DELIMITER //

CREATE FUNCTION fn_expected_appointment_fee(
    p_appointment_id VARCHAR(20)
)
RETURNS DECIMAL(15,2)
READS SQL DATA
BEGIN
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    DECLARE v_price DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_total DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_appointment_count INT DEFAULT 0;
    DECLARE v_service_price_count INT DEFAULT 0;

    DECLARE cur_service_prices CURSOR FOR
        SELECT s.PRICE
          FROM APPOINTMENT a
          JOIN SCHEDULE sch
            ON a.SCHEDULE_ID = sch.SCHEDULE_ID
          JOIN SERVICES s
            ON sch.FACILITY_ID = s.FACILITY_ID
           AND a.SERVICE_TYPE = s.SERVICE_NAME
         WHERE a.APPOINTMENT_ID = p_appointment_id;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    IF p_appointment_id IS NULL OR TRIM(p_appointment_id) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: p_appointment_id must not be NULL or empty.';
    END IF;

    SELECT COUNT(*)
      INTO v_appointment_count
      FROM APPOINTMENT
     WHERE APPOINTMENT_ID = p_appointment_id;

    IF v_appointment_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: Appointment does not exist.';
    END IF;

    SELECT COUNT(*)
      INTO v_service_price_count
      FROM APPOINTMENT a
      JOIN SCHEDULE sch
        ON a.SCHEDULE_ID = sch.SCHEDULE_ID
      JOIN SERVICES s
        ON sch.FACILITY_ID = s.FACILITY_ID
       AND a.SERVICE_TYPE = s.SERVICE_NAME
     WHERE a.APPOINTMENT_ID = p_appointment_id;

    IF v_service_price_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: Matching service price does not exist for this appointment facility and service type.';
    END IF;

    SET v_done = FALSE;
    OPEN cur_service_prices;

    price_loop: LOOP
        FETCH cur_service_prices INTO v_price;

        IF v_done THEN
            LEAVE price_loop;
        END IF;

        SET v_total = v_total + IFNULL(v_price, 0.00);
    END LOOP;

    CLOSE cur_service_prices;

    RETURN v_total;
END //

CREATE FUNCTION fn_profile_paid_total(
    p_profile_id VARCHAR(20),
    p_from_date DATE,
    p_to_date DATE
)
RETURNS DECIMAL(15,2)
READS SQL DATA
BEGIN
    DECLARE v_done BOOLEAN DEFAULT FALSE;
    DECLARE v_amount DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_total DECIMAL(15,2) DEFAULT 0.00;
    DECLARE v_profile_count INT DEFAULT 0;

    DECLARE cur_paid_billing CURSOR FOR
        SELECT br.TOTAL_FEE, br.STATUS
          FROM APPOINTMENT a
          JOIN BILLING_RECORD br
            ON a.APPOINTMENT_ID = br.APPOINTMENT_ID
         WHERE a.PROFILE_ID = p_profile_id
           AND a.DATE BETWEEN p_from_date AND p_to_date
           AND br.STATUS = 'PAID';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    IF p_profile_id IS NULL OR TRIM(p_profile_id) = '' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: p_profile_id must not be NULL or empty.';
    END IF;

    IF p_from_date IS NULL OR p_to_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: p_from_date and p_to_date must not be NULL.';
    END IF;

    IF p_from_date > p_to_date THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: p_from_date must be less than or equal to p_to_date.';
    END IF;

    SELECT COUNT(*)
      INTO v_profile_count
      FROM PROFILE
     WHERE PROFILE_ID = p_profile_id;

    IF v_profile_count = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] FUNCTION failed: Profile does not exist.';
    END IF;

    SET v_done = FALSE;
    OPEN cur_paid_billing;

    paid_loop: LOOP
        FETCH cur_paid_billing INTO v_amount, v_status;

        IF v_done THEN
            LEAVE paid_loop;
        END IF;

        IF v_status = 'PAID' THEN
            SET v_total = v_total + IFNULL(v_amount, 0.00);
        END IF;
    END LOOP;

    CLOSE cur_paid_billing;

    RETURN v_total;
END //

DELIMITER ;

-- Assignment 2.4 demo examples:
-- SELECT fn_expected_appointment_fee('APP_12_01') AS ExpectedFee;
-- SELECT fn_profile_paid_total('PROF001', '2026-01-01', '2026-12-31') AS PaidTotal;
-- SELECT fn_profile_paid_total('PROF002', '2026-01-01', '2026-12-31') AS PaidTotal;
