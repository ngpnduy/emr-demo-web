USE BTL2;

DROP TRIGGER IF EXISTS trg_check_advance_booking_insert;
DROP TRIGGER IF EXISTS trg_calc_bookings_after_insert;
DROP TRIGGER IF EXISTS trg_calc_bookings_after_delete;
DROP TRIGGER IF EXISTS trg_calc_bookings_after_update;

DELIMITER //

-- 2.2.1
-- TRIGGER: Check booking conditions in advance
CREATE TRIGGER trg_check_advance_booking_insert
BEFORE INSERT ON APPOINTMENT
FOR EACH ROW
BEGIN
    DECLARE current_dt DATETIME;
    SET current_dt = NOW();

    IF IFNULL(@disable_date_check, 0) = 0 THEN 
        IF NEW.Date <= DATE(current_dt) THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] ERROR: Must book before at least 1 day';
        ELSEIF NEW.Date = DATE_ADD(DATE(current_dt), INTERVAL 1 DAY) AND TIME(current_dt) >= '16:00:00' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[DB] ERROR: Appointments for the following day must be made prior to 16:00 of the preceding day';
        END IF;
    END IF;
END //

-- 2.2.2
-- Derived attribute is the CURRENT_COUNTS of TIMESLOT
-- TRIGGER: Update TIMESLOT after Insert Appointment
CREATE TRIGGER trg_calc_bookings_after_insert
AFTER INSERT ON APPOINTMENT
FOR EACH ROW
BEGIN
    DECLARE v_max_patients INT;
    DECLARE v_current_count INT;
    
    SELECT MAX_PATIENT_PER_SLOT INTO v_max_patients
    FROM SCHEDULE WHERE SCHEDULE_ID = NEW.SCHEDULE_ID;

    SELECT COUNT(*) INTO v_current_count
    FROM APPOINTMENT 
    WHERE SCHEDULE_ID = NEW.SCHEDULE_ID AND SLOT_NO = NEW.SLOT_NO;

    IF v_current_count >= v_max_patients THEN
        UPDATE TIMESLOT
        SET STATUS = 'FULLY_BOOKED'
        WHERE SCHEDULE_ID = NEW.SCHEDULE_ID AND SLOT_NO = NEW.SLOT_NO;
    END IF;
END //

-- TRIGGER: Update TIMESLOT after Delete Appointment
CREATE TRIGGER trg_calc_bookings_after_delete
AFTER DELETE ON APPOINTMENT
FOR EACH ROW
BEGIN
    DECLARE v_max_patients INT;
    DECLARE v_current_count INT;

    SELECT MAX_PATIENT_PER_SLOT INTO v_max_patients
    FROM SCHEDULE WHERE SCHEDULE_ID = OLD.SCHEDULE_ID;

    SELECT COUNT(*) INTO v_current_count
    FROM APPOINTMENT 
    WHERE SCHEDULE_ID = OLD.SCHEDULE_ID AND SLOT_NO = OLD.SLOT_NO;

    IF v_current_count < v_max_patients THEN
        UPDATE TIMESLOT
        SET STATUS = 'AVAILABLE' 
        WHERE SCHEDULE_ID = OLD.SCHEDULE_ID AND SLOT_NO = OLD.SLOT_NO AND STATUS != 'CANCELLED';
    END IF;
END //

-- TRIGGER: Update TIMESLOT after Update Appointment
CREATE TRIGGER trg_calc_bookings_after_update
AFTER UPDATE ON APPOINTMENT
FOR EACH ROW
BEGIN
    DECLARE v_old_max INT;
    DECLARE v_new_max INT;
    DECLARE v_old_count INT;
    DECLARE v_new_count INT;

    IF NEW.SCHEDULE_ID != OLD.SCHEDULE_ID OR NEW.SLOT_NO != OLD.SLOT_NO THEN
        SELECT MAX_PATIENT_PER_SLOT INTO v_old_max FROM SCHEDULE WHERE SCHEDULE_ID = OLD.SCHEDULE_ID;
        SELECT COUNT(*) INTO v_old_count FROM APPOINTMENT WHERE SCHEDULE_ID = OLD.SCHEDULE_ID AND SLOT_NO = OLD.SLOT_NO;
        
        IF v_old_count < v_old_max THEN
            UPDATE TIMESLOT SET STATUS = 'AVAILABLE' 
            WHERE SCHEDULE_ID = OLD.SCHEDULE_ID AND SLOT_NO = OLD.SLOT_NO AND STATUS != 'CANCELLED';
        END IF;
        
        SELECT MAX_PATIENT_PER_SLOT INTO v_new_max FROM SCHEDULE WHERE SCHEDULE_ID = NEW.SCHEDULE_ID;
        SELECT COUNT(*) INTO v_new_count FROM APPOINTMENT WHERE SCHEDULE_ID = NEW.SCHEDULE_ID AND SLOT_NO = NEW.SLOT_NO;
        
        IF v_new_count >= v_new_max THEN
            UPDATE TIMESLOT SET STATUS = 'FULLY_BOOKED' 
            WHERE SCHEDULE_ID = NEW.SCHEDULE_ID AND SLOT_NO = NEW.SLOT_NO;
        END IF;
    END IF;
END //

DELIMITER ;