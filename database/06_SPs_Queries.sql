USE BTL2;

DROP PROCEDURE IF EXISTS sp_GetAvailableTimeslots;
DROP PROCEDURE IF EXISTS sp_ViewPatientAppointments;

DELIMITER //

CREATE PROCEDURE sp_GetAvailableTimeslots(
    IN p_FacilityID VARCHAR(20),
    IN p_BranchID   VARCHAR(20),
    IN p_Date       DATE
)
BEGIN
    SELECT 
        t.SLOT_NO,
        t.SLOT_START_TIME   AS Start_Time,
        t.SLOT_END_TIME     AS End_Time,
        s.SCHEDULE_ID,
        s.MAX_PATIENT_PER_SLOT,
        (SELECT COUNT(*) 
         FROM APPOINTMENT a 
         WHERE a.SCHEDULE_ID = t.SCHEDULE_ID 
           AND a.SLOT_NO = t.SLOT_NO) AS Current_Count
    FROM SCHEDULE s
    JOIN TIMESLOT t ON s.SCHEDULE_ID = t.SCHEDULE_ID
    WHERE s.FACILITY_ID = p_FacilityID
      AND s.BRANCH_ID   = p_BranchID
      AND s.DATE        = p_Date
      AND t.STATUS      = 'AVAILABLE'
    ORDER BY t.SLOT_START_TIME ASC;
END //


CREATE PROCEDURE sp_ViewPatientAppointments(
    IN p_CustomerID VARCHAR(20),
    IN p_Filter     VARCHAR(20), 
    IN p_SortOrder  VARCHAR(5),
    IN p_SearchDate DATE        
)
BEGIN
    SELECT
        a.APPOINTMENT_ID,
        p.FULL_NAME AS Profile_Name,
        a.DATE AS Appointment_Date,
        a.TIME AS Appointment_Time,
        a.SERVICE_TYPE,
        sp.NAME AS Specialty_Name,
        mf.BRAND_NAME AS Facility_Name,
        b.ADDRESS AS Branch_Address,
        a.PROFILE_ID,
        a.SPECIALTY_ID,
        a.SCHEDULE_ID,
        a.SLOT_NO,
        COALESCE(br.STATUS, 'PENDING') AS Billing_Status,
        COALESCE(br.TOTAL_FEE, srv.PRICE, 0) AS Appointment_Fee
    FROM APPOINTMENT a
    JOIN PROFILE p ON a.PROFILE_ID = p.PROFILE_ID
    JOIN MEDICAL_SPECIALITY sp ON a.SPECIALTY_ID = sp.SPECIALTY_ID
    JOIN SCHEDULE sch ON a.SCHEDULE_ID = sch.SCHEDULE_ID
    JOIN MEDICAL_FACILITY mf ON sch.FACILITY_ID = mf.FACILITY_ID
    JOIN BRANCH b ON sch.FACILITY_ID = b.FACILITY_ID AND sch.BRANCH_ID = b.BRANCH_ID
    LEFT JOIN BILLING_RECORD br ON a.APPOINTMENT_ID = br.APPOINTMENT_ID
    LEFT JOIN SERVICES srv ON sch.FACILITY_ID = srv.FACILITY_ID AND a.SERVICE_TYPE = srv.SERVICE_NAME
    WHERE p.ACCOUNT_ID = p_CustomerID 
      AND (
          (p_Filter = 'all') OR
          (p_Filter = 'upcoming' AND CONCAT(a.DATE, ' ', a.TIME) >= NOW()) OR
          (p_Filter = 'past' AND CONCAT(a.DATE, ' ', a.TIME) < NOW())
      )
      AND (p_SearchDate IS NULL OR a.DATE = p_SearchDate)
    ORDER BY 
        CASE WHEN p_SortOrder = 'ASC' THEN a.DATE END ASC,
        CASE WHEN p_SortOrder = 'ASC' THEN a.TIME END ASC,
        CASE WHEN p_SortOrder = 'DESC' THEN a.DATE END DESC,
        CASE WHEN p_SortOrder = 'DESC' THEN a.TIME END DESC;
END //

DELIMITER ;

