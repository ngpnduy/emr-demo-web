-- =====================================================
-- STORED PROCEDURES FOR TABLE: APPOINTMENT
-- =====================================================
USE BTL2;
DELIMITER $$
 
CREATE PROCEDURE sp_insert_appointment (
    IN  p_appointment_id    VARCHAR(20),
    IN  p_time              TIME,
    IN  p_date              DATE,
    IN  p_service_type      VARCHAR(100),
    IN  p_specialty_id      VARCHAR(20),
    IN  p_profile_id        VARCHAR(20),
    IN  p_schedule_id       VARCHAR(20),
    IN  p_slot_no           INT
)
BEGIN
    DECLARE v_profile_exists    INT DEFAULT 0;
    DECLARE v_specialty_exists  INT DEFAULT 0;
    DECLARE v_slot_status       VARCHAR(50) DEFAULT NULL;
    DECLARE v_schedule_date     DATE DEFAULT NULL;
    DECLARE v_existing_id       VARCHAR(20) DEFAULT NULL;
    DECLARE v_duplicate_booking INT DEFAULT 0; 
 
    -- Appointment ID must not already exist 
    SELECT APPOINTMENT_ID INTO v_existing_id FROM APPOINTMENT WHERE APPOINTMENT_ID = p_appointment_id;
    IF v_existing_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: APPOINTMENT_ID already exists. ';
    END IF;
 
    -- PROFILE_ID must exist 
    SELECT COUNT(*) INTO v_profile_exists FROM PROFILE WHERE PROFILE_ID = p_profile_id;
    IF v_profile_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: PROFILE_ID does not exist. ';
    END IF;
 
    -- SPECIALTY_ID must exist
    SELECT COUNT(*) INTO v_specialty_exists FROM MEDICAL_SPECIALITY WHERE SPECIALTY_ID = p_specialty_id;
    IF v_specialty_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: SPECIALTY_ID does not exist. ';
    END IF;
 
    -- TIMESLOT must exist 
    SELECT STATUS INTO v_slot_status FROM TIMESLOT WHERE SCHEDULE_ID = p_schedule_id AND SLOT_NO = p_slot_no;
    IF v_slot_status IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: The specified time slot (SCHEDULE_ID + SLOT_NO) does not exist. ';
    END IF;
 
    -- TIMESLOT must be AVAILABLE 
    IF v_slot_status <> 'AVAILABLE' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: The selected time slot is no longer AVAILABLE. ';
    END IF;
 
    -- Appointment DATE must match the schedule DATE
    SELECT DATE INTO v_schedule_date FROM SCHEDULE WHERE SCHEDULE_ID = p_schedule_id;
    IF v_schedule_date IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: SCHEDULE_ID does not correspond to any existing schedule.';
    END IF;
 
    IF p_date <> v_schedule_date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: The appointment DATE does not match the date of the selected schedule.';
    END IF;
 
    -- Appointment date must be at least tomorrow
    IF p_date <= CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] INSERT failed: Appointments must be booked for a future date. ';
    END IF;

    -- A PROFILE cannot have 2 appointments in the same DATE and TIME
    SELECT COUNT(*) INTO v_duplicate_booking
      FROM APPOINTMENT
     WHERE PROFILE_ID = p_profile_id
       AND DATE = p_date 
       AND TIME = p_time;

    IF v_duplicate_booking > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[BE] INSERT failed: This profile already has an appointment booked at this specific date and time.';
    END IF;
 
    -- Insert
    INSERT INTO APPOINTMENT (
        APPOINTMENT_ID, TIME, DATE, SERVICE_TYPE, SPECIALTY_ID, PROFILE_ID, SCHEDULE_ID, SLOT_NO
    ) VALUES (
        p_appointment_id, p_time, p_date, p_service_type, p_specialty_id, p_profile_id, p_schedule_id, p_slot_no
    );
 
END$$
 
DELIMITER $$

CREATE PROCEDURE sp_update_appointment (
    IN  p_appointment_id    VARCHAR(20),
    IN  p_new_time          TIME,
    IN  p_new_date          DATE,
    IN  p_new_service_type  VARCHAR(100),
    IN  p_new_specialty_id  VARCHAR(20),
    IN  p_new_profile_id    VARCHAR(20), 
    IN  p_new_schedule_id   VARCHAR(20),
    IN  p_new_slot_no       INT
)
BEGIN
    DECLARE v_old_schedule_id   VARCHAR(20) DEFAULT NULL;
    DECLARE v_old_slot_no       INT         DEFAULT NULL;
    DECLARE v_old_date          DATE        DEFAULT NULL;
    DECLARE v_billing_status    VARCHAR(50) DEFAULT NULL;
    DECLARE v_new_slot_status   VARCHAR(50) DEFAULT NULL;
    DECLARE v_new_schedule_date DATE        DEFAULT NULL;
    DECLARE v_specialty_exists  INT         DEFAULT 0;
    DECLARE v_profile_exists    INT         DEFAULT 0; 
    DECLARE v_duplicate_booking INT         DEFAULT 0;
 
    SELECT SCHEDULE_ID, SLOT_NO, DATE INTO v_old_schedule_id, v_old_slot_no, v_old_date
      FROM APPOINTMENT WHERE APPOINTMENT_ID = p_appointment_id; 
     
    IF v_old_schedule_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: APPOINTMENT_ID not found. ';
    END IF;
 
    SELECT BR.STATUS INTO v_billing_status FROM BILLING_RECORD BR WHERE BR.APPOINTMENT_ID = p_appointment_id;
     
    IF v_billing_status = 'PAID' THEN
        IF (p_new_date <> v_old_date) OR (p_new_schedule_id <> v_old_schedule_id) OR (p_new_slot_no <> v_old_slot_no) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: Cannot change the date or slot of a paid appointment ';
        END IF;
    END IF;
 
    IF p_new_date <= CURDATE() THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: The new appointment date must be a future date. ';
    END IF;

    SELECT COUNT(*) INTO v_profile_exists FROM PROFILE WHERE PROFILE_ID = p_new_profile_id;
    IF v_profile_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: The new PROFILE_ID does not exist. ';
    END IF;

    SELECT COUNT(*) INTO v_specialty_exists FROM MEDICAL_SPECIALITY WHERE SPECIALTY_ID = p_new_specialty_id;
    IF v_specialty_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: The new SPECIALTY_ID does not exist. ';
    END IF;
 
    IF (p_new_schedule_id <> v_old_schedule_id) OR (p_new_slot_no <> v_old_slot_no) THEN
        SELECT STATUS INTO v_new_slot_status FROM TIMESLOT WHERE SCHEDULE_ID = p_new_schedule_id AND SLOT_NO = p_new_slot_no;
           
        IF v_new_slot_status IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: The new time slot does not exist. ';
        END IF;
 
        IF v_new_slot_status <> 'AVAILABLE' THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: The new time slot is not AVAILABLE. ';
        END IF;
 
        SELECT DATE INTO v_new_schedule_date FROM SCHEDULE WHERE SCHEDULE_ID = p_new_schedule_id;
         
        IF p_new_date <> v_new_schedule_date THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '[BE] UPDATE failed: The new appointment date does not match the date of the selected schedule.';
        END IF;
    END IF;

    -- Make sure that PROFILE don't update time that is the same to another booked APPOINTMENT 
    SELECT COUNT(*) INTO v_duplicate_booking
      FROM APPOINTMENT
     WHERE PROFILE_ID = p_new_profile_id
       AND DATE = p_new_date
       AND TIME = p_new_time
       AND APPOINTMENT_ID <> p_appointment_id;

    IF v_duplicate_booking > 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[BE] UPDATE failed: This profile already has another appointment booked at the new date and time.';
    END IF;

    UPDATE APPOINTMENT
       SET TIME            = p_new_time,
           DATE            = p_new_date,
           SERVICE_TYPE    = p_new_service_type,
           SPECIALTY_ID    = p_new_specialty_id,
           PROFILE_ID      = p_new_profile_id,
           SCHEDULE_ID     = p_new_schedule_id,
           SLOT_NO         = p_new_slot_no
     WHERE APPOINTMENT_ID  = p_appointment_id;
 
END$$
 
CREATE PROCEDURE sp_delete_appointment (
    IN  p_appointment_id    VARCHAR(20)
)
BEGIN
    DECLARE v_appt_date         DATE        DEFAULT NULL;
    DECLARE v_billing_status    VARCHAR(50) DEFAULT NULL;
    DECLARE v_medical_record_id VARCHAR(20) DEFAULT NULL;
 
    SELECT DATE
      INTO v_appt_date
      FROM APPOINTMENT
     WHERE APPOINTMENT_ID = p_appointment_id;
 
    IF v_appt_date IS NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[BE] DELETE failed: APPOINTMENT_ID not found.';
    END IF;
 
    SELECT MEDICAL_RECORD_ID
      INTO v_medical_record_id
      FROM MEDICAL_RECORD
     WHERE APPOINTMENT_ID = p_appointment_id;
 
    IF v_medical_record_id IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[BE] DELETE failed: A medical record is associated with this appointment.';
    END IF;
 
    SELECT STATUS
      INTO v_billing_status
      FROM BILLING_RECORD
     WHERE APPOINTMENT_ID = p_appointment_id;
 
    IF v_billing_status = 'PAID' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[BE] DELETE failed: This appointment has been paid.';
    END IF;
 
    IF v_appt_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = '[BE] DELETE failed: The appointment date has already passed.';
    END IF;
 
    -- =========================================================
    -- START CLEANING CHILDREN TABLE BEFORE DELETING PARENT TABLE
    -- =========================================================
    
    DELETE FROM ASSIGNS 
    WHERE APPOINTMENT_ID = p_appointment_id;

    DELETE FROM SYMPTOM_NOTES 
    WHERE APPOINTMENT_ID = p_appointment_id;

    DELETE FROM BILLING_RECORD 
    WHERE APPOINTMENT_ID = p_appointment_id;

    -- =========================================================
    -- FINALLY: DELETING THE PARENT TABLE
    -- =========================================================
    DELETE FROM APPOINTMENT
    WHERE APPOINTMENT_ID = p_appointment_id;
 
END$$
 
DELIMITER ;
