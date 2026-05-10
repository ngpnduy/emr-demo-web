-- =====================================================
-- DML - SAMPLE DATA
-- =====================================================
USE BTL2;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE PRESCRIPTION_DETAIL;
TRUNCATE TABLE MEDICAL_RECORD;
TRUNCATE TABLE PRESCRIPTION;
TRUNCATE TABLE BILLING_RECORD;
TRUNCATE TABLE SYMPTOM_NOTES;
TRUNCATE TABLE ASSIGNS;
TRUNCATE TABLE APPOINTMENT;
TRUNCATE TABLE TIMESLOT;
TRUNCATE TABLE SCHEDULE;
TRUNCATE TABLE WORKS_AT;
TRUNCATE TABLE BRANCH;
TRUNCATE TABLE HAS_SPECIALITY;
TRUNCATE TABLE SPECIALIZE_IN;
TRUNCATE TABLE INVENTORY;
TRUNCATE TABLE TECHNICAL_LINK_LISTS;
TRUNCATE TABLE SERVICES;
TRUNCATE TABLE RELATED_TO;
TRUNCATE TABLE PROFILE;
TRUNCATE TABLE DOCTOR;
TRUNCATE TABLE CUSTOMER;
TRUNCATE TABLE ADMINISTRATOR;
TRUNCATE TABLE MEDICAL_SPECIALITY;
TRUNCATE TABLE MEDICAL_FACILITY;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 1. MEDICAL_FACILITY
-- =====================================================
INSERT INTO MEDICAL_FACILITY (FACILITY_ID, BRAND_NAME, INTRODUCTION, WEBSITE_URL, FACILITY_TYPE) 
VALUES 
('MF001', 'Bệnh viện Chợ Rẫy', 'Bệnh viện đa khoa trung ương hạng đặc biệt', 'https://choray.vn', 'HOSPITAL'),
('MF002', 'Bệnh viện Tâm Anh', 'Bệnh viện đa khoa quốc tế', 'https://tamanhhospital.vn', 'HOSPITAL'),
('MF003', 'Phòng khám Đa khoa Hoàn Mỹ', 'Phòng khám đa khoa', 'https://hoanmy.com', 'CLINIC'),
('MF004', 'VNVC Hoàng Văn Thụ', 'Trung tâm tiêm chủng', 'https://vnvc.vn', 'VACCINATION_CENTER');

-- =====================================================
-- 2. MEDICAL_SPECIALITY
-- =====================================================
INSERT INTO MEDICAL_SPECIALITY (SPECIALTY_ID, NAME, DESCRIPTION)
VALUES
('SPEC01', 'Khoa Nội Tim Mạch', 'Khám và điều trị các bệnh lý về tim mạch'),
('SPEC02', 'Khoa Thần Kinh', 'Khám và điều trị các bệnh lý hệ thần kinh'),
('SPEC03', 'Khoa Nhi', 'Chuyên chăm sóc sức khỏe trẻ em'),
('SPEC04', 'Khoa Răng Hàm Mặt', 'Chuyên khoa về nha khoa'),
('SPEC05', 'Khoa Tiêm Chủng', 'Dịch vụ tiêm phòng các loại vaccine'),
('SPEC06', 'Khoa Ung Bướu', 'Khám và điều trị các bệnh lý về ung bướu');

-- =====================================================
-- 3. USERS (ADMIN, CUSTOMER, DOCTOR)
-- =====================================================
INSERT INTO ADMINISTRATOR (ACCOUNT_ID, PRIVILEGE, PHONE_NO, PASSWORD_HASH, EMAIL, ROLE, FULL_NAME)
VALUES
('AD001', 'SUPER_ADMIN', '0912345678', 'hash_pass_1', 'nguyenvana@gmail.com', 'ADMINISTRATOR', 'Nguyễn Văn A'),
('AD002', 'SYSTEM_ADMIN', '0901234567', 'hash_pass_3', 'lethic@hospital.vn', 'ADMINISTRATOR', 'Lê Thị C'),
('AD003', 'MODERATOR', '0998877665', 'hash_pass_4', 'mod1@hospital.vn', 'ADMINISTRATOR', 'Trần Quản Trị');

-- Customers: C001 (Thành), C002 (Khách), C003 (Thảo)
INSERT INTO CUSTOMER(ACCOUNT_ID, PHONE_NO, PASSWORD_HASH, EMAIL, ROLE, FULL_NAME, REFERRER_CODE)
VALUES
('C001', '0336370024', 'Thanhkhung1', 'congthanhpham147@gmail.com', 'CUSTOMER', 'Phạm Nguyễn Công Thành', NULL),
('C002', '0911223344', 'hash_cust_2', 'khachhang2@gmail.com', 'CUSTOMER', 'Lê Văn Khách', 'REF_001'),
('C003', '0922334455', 'hash_cust_3', 'khachhang3@gmail.com', 'CUSTOMER', 'Trần Phương Thảo', NULL);

-- Doctors
INSERT INTO DOCTOR (ACCOUNT_ID, PHONE_NO, PASSWORD_HASH, EMAIL, ROLE, FULL_NAME, LICENSE_NO, SPECIALIZED_EXAMINATION, DEGREE_TITLE, EXPERIENCE, BIO, POSITION, YEAR_OF_EXPERIENCE)
VALUES
('DOC01', '0955667788', 'hash_doc_1', 'bacsi1@hospital.vn', 'DOCTOR', 'BS. Nguyễn Trí Thức', 'LIC001', 'Khám nội tim mạch', 'Tiến sĩ Y khoa', 'Chuyên gia can thiệp tim mạch', 'Giám đốc bệnh viện', 'Giám đốc', 20),
('DOC06', '0912121212', 'hash_doc_6', 'bacsi6@tamanh.vn', 'DOCTOR', 'BS. Vũ Lương Y', 'LIC006', 'Khám nội tim mạch', 'Bác sĩ chuyên khoa I', 'Chuyên gia tim mạch Tâm Anh', 'Từng tu nghiệp nước ngoài.', 'Bác sĩ điều trị', 10),
('DOC07', '0921000001', 'hash_doc_7', 'bacsi7@tamanh.vn', 'DOCTOR', 'BS. Trần Thị Mai Lan', 'LIC007', 'Khám nhi khoa', 'Thạc sĩ Nhi khoa', 'Chuyên gia Nhi khoa Tâm Anh', 'Chuyên điều trị các bệnh hô hấp.', 'Trưởng khoa Nhi', 12),
('DOC08', '0921000002', 'hash_doc_8', 'bacsi8@tamanh.vn', 'DOCTOR', 'BS. Nguyễn Đức Hải', 'LIC008', 'Khám thần kinh', 'Tiến sĩ Thần kinh học', 'Chuyên gia Thần kinh Tâm Anh', 'Chuyên điều trị đột quỵ.', 'Bác sĩ điều trị', 18);

-- =====================================================
-- 4. PROFILE & RELATED_TO (Focus on C001 - Thành)
-- =====================================================
INSERT INTO PROFILE (PROFILE_ID, SSN, ETHNICITY, EMAIL, HEALTH_INSURANCE_CODE, JOB, FULL_NAME, PHONE_NO, PROVINCE_CITY, DISTRICT_COUNTY, WARD_COMMUNE, SPECIFIC_ADDRESS, GENDER, DATE_OF_BIRTH, ACCOUNT_ID)
VALUES
-- PROFILEs of C001 (Thành's family)
('PROF001', '079099001122', 'Kinh', 'congthanhpham147@gmail.com', 'DN123456789', 'Sinh viên', 'Phạm Nguyễn Công Thành', '0336370024', 'TP.HCM', 'Quận 10', 'Phường 14', '268 Lý Thường Kiệt', 'Male', '2004-01-01', 'C001'),
('PROF002', '079070001123', 'Kinh', NULL, 'DN987654321', 'Kỹ sư', 'Phạm Văn Mai', '0901000005', 'TP.HCM', 'Quận 10', 'Phường 14', '268 Lý Thường Kiệt', 'Male', '1970-05-15', 'C001'),
('PROF003', '079075001124', 'Kinh', NULL, 'DN112233445', 'Giáo viên', 'Phạm Thị Thơ', '0901000006', 'TP.HCM', 'Quận 10', 'Phường 14', '268 Lý Thường Kiệt', 'Female', '1975-10-20', 'C001'),
-- PROFILES of other USERs
('PROF004', '079099007788', 'Kinh', 'khachhang2@gmail.com', 'GD987654321', 'Nhân viên', 'Lê Văn Khách', '0911223344', 'TP.HCM', 'Quận 1', 'Bến Nghé', '12 Lê Duẩn', 'Male', '1990-12-12', 'C002'),
('PROF005', '079099008899', 'Kinh', 'khachhang3@gmail.com', 'GD112233445', 'Kế toán', 'Trần Phương Thảo', '0922334455', 'TP.HCM', 'Quận 3', 'Phường 6', '15 Võ Văn Tần', 'Female', '1995-08-08', 'C003');

-- Thành's family
INSERT INTO RELATED_TO (PROFILE_ID, DEPENDENT_PROFILE_ID, RELATIONSHIP)
VALUES
('PROF001', 'PROF002', 'Ba'),
('PROF001', 'PROF003', 'Mẹ');

-- =====================================================
-- 5. SERVICES, TECHNICAL LINKS, INVENTORY
-- =====================================================
INSERT INTO SERVICES (FACILITY_ID, SERVICE_NAME, PRICE)
VALUES
('MF002', 'Khám Thường', 150000),
('MF002', 'Khám Dịch Vụ', 300000),
('MF001', 'Khám Chuyên Gia', 500000),
('MF003', 'Khám Đa Khoa', 200000),
('MF004', 'Tiêm Chủng Dịch Vụ', 600000);

INSERT INTO TECHNICAL_LINK_LISTS (TECHNICAL_LINK, FACILITY_ID)
VALUES 
('https://tamanhhospital.vn/booking-api', 'MF002'),
('https://choray.vn/api', 'MF001'),
('https://hoanmy.com/api', 'MF003');

INSERT INTO INVENTORY (INVENTORY, FACILITY_ID)
VALUES 
('Máy chụp MRI 3 Tesla', 'MF002'),
('Máy X-Quang Kỹ thuật số', 'MF001'),
('Hệ thống xét nghiệm máu', 'MF003');

-- =====================================================
-- 6. SPECIALITIES & BRANCH
-- =====================================================
INSERT INTO SPECIALIZE_IN(SPECIALTY_ID, DOCTOR_ID)
VALUES
('SPEC01','DOC01'), ('SPEC01','DOC06'), ('SPEC03','DOC07'), ('SPEC02','DOC08');

INSERT INTO HAS_SPECIALITY(SPECIALTY_ID, FACILITY_ID)
VALUES
('SPEC01','MF002'), ('SPEC02','MF002'), ('SPEC03','MF002'), ('SPEC04','MF002'), -- Tâm Anh 4 specialties
('SPEC01','MF001'), ('SPEC06','MF001'), ('SPEC02','MF001'),                   -- Chợ Rẫy
('SPEC01','MF003'), ('SPEC03','MF003');                                       -- Hoàn Mỹ

INSERT INTO BRANCH(BRANCH_ID, FACILITY_ID, ADDRESS, HOTLINE, OPERATING_HOURS)
VALUES
('BR001', 'MF001', '201B Nguyễn Chí Thanh, Quận 5', '19001234', '24/7'),
('BR002', 'MF002', '2B Phổ Quang, Tân Bình, TP.HCM', '18005678', '07:00 - 16:00'),
('BR003', 'MF003', 'Phan Đình Phùng, Phú Nhuận', '19008888', '08:00 - 18:00');

-- =====================================================
-- 7. WORKS_AT
-- =====================================================
INSERT INTO WORKS_AT (FACILITY_ID, BRANCH_ID, DOCTOR_ID, START_DATE, END_DATE, WORKING_DAYS, SHIFT_TIMES)
VALUES
('MF001', 'BR001', 'DOC01', '2009-01-01', NULL, 'Thứ 2 - Thứ 6', '08:00 - 17:00'),
('MF003', 'BR003', 'DOC01', '2020-01-01', NULL, 'Thứ 7 - Chủ Nhật', '08:00 - 12:00'), 
('MF002', 'BR002', 'DOC06', '2022-01-01', NULL, 'Thứ 2 - Chủ Nhật', '07:00 - 16:00'),
('MF002', 'BR002', 'DOC07', '2023-01-01', NULL, 'Thứ 2 - Chủ Nhật', '07:00 - 16:00'),
('MF002', 'BR002', 'DOC08', '2021-09-01', NULL, 'Thứ 2 - Chủ Nhật', '07:00 - 16:00');

-- =====================================================
-- 8. SCHEDULE 
-- =====================================================
INSERT INTO SCHEDULE (SCHEDULE_ID, DATE, START_TIME, END_TIME, SLOT_DURATION, MAX_PATIENT_PER_SLOT, FACILITY_ID, BRANCH_ID)
VALUES
-- QUÁ KHỨ 
('SCH_PAST_1', '2026-01-10', '08:00:00', '12:00:00', 30, 2, 'MF001', 'BR001'), -- Chợ Rẫy
('SCH_PAST_2', '2026-02-15', '08:00:00', '12:00:00', 30, 2, 'MF001', 'BR001'), -- Chợ Rẫy
('SCH_PAST_3', '2026-03-20', '08:00:00', '12:00:00', 30, 2, 'MF003', 'BR003'), -- Hoàn Mỹ

-- 10/05/2026 and 11/05/2026
('SCH_TA_10', '2026-05-10', '13:00:00', '17:00:00', 30, 2, 'MF002', 'BR002'), 
('SCH_TA_11', '2026-05-11', '13:00:00', '17:00:00', 30, 2, 'MF002', 'BR002'),
-- Future (Tâm Anh, MF002)
('SCH_TA_12', '2026-05-12', '07:00:00', '16:00:00', 30, 2, 'MF002', 'BR002'),
('SCH_TA_13', '2026-05-13', '07:00:00', '16:00:00', 30, 2, 'MF002', 'BR002'),
('SCH_TA_14', '2026-05-14', '07:00:00', '16:00:00', 30, 2, 'MF002', 'BR002'),
('SCH_TA_15', '2026-05-15', '07:00:00', '16:00:00', 30, 2, 'MF002', 'BR002');

-- =====================================================
-- 9. TIMESLOT 
-- =====================================================
-- Timeslot for the past
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_PAST_1', 1, '08:00:00', '08:30:00', 'AVAILABLE'),
('SCH_PAST_2', 1, '08:00:00', '08:30:00', 'AVAILABLE'),
('SCH_PAST_3', 1, '08:00:00', '08:30:00', 'AVAILABLE');

-- 10/05
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_TA_10', 1, '13:00:00', '13:30:00', 'AVAILABLE'),
('SCH_TA_10', 2, '13:30:00', '14:00:00', 'AVAILABLE'),
('SCH_TA_10', 3, '14:00:00', '14:30:00', 'AVAILABLE'),
('SCH_TA_10', 4, '14:30:00', '15:00:00', 'AVAILABLE'),
('SCH_TA_10', 5, '15:00:00', '15:30:00', 'AVAILABLE');

-- 11/05 
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_TA_11', 1, '13:00:00', '13:30:00', 'AVAILABLE'),
('SCH_TA_11', 2, '13:30:00', '14:00:00', 'AVAILABLE'),
('SCH_TA_11', 3, '14:00:00', '14:30:00', 'AVAILABLE'),
('SCH_TA_11', 4, '14:30:00', '15:00:00', 'AVAILABLE'),
('SCH_TA_11', 5, '15:00:00', '15:30:00', 'AVAILABLE');

-- 12/05
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_TA_12', 1, '07:00:00', '07:30:00', 'AVAILABLE'),
('SCH_TA_12', 2, '07:30:00', '08:00:00', 'AVAILABLE'),
('SCH_TA_12', 3, '08:00:00', '08:30:00', 'AVAILABLE'),
('SCH_TA_12', 4, '08:30:00', '09:00:00', 'AVAILABLE'),
('SCH_TA_12', 5, '09:00:00', '09:30:00', 'AVAILABLE');
-- 13/05
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_TA_13', 1, '07:00:00', '07:30:00', 'AVAILABLE'),
('SCH_TA_13', 2, '07:30:00', '08:00:00', 'AVAILABLE'),
('SCH_TA_13', 3, '08:00:00', '08:30:00', 'AVAILABLE'),
('SCH_TA_13', 4, '08:30:00', '09:00:00', 'AVAILABLE'),
('SCH_TA_13', 5, '09:00:00', '09:30:00', 'AVAILABLE');
-- 14/05
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_TA_14', 1, '07:00:00', '07:30:00', 'AVAILABLE'),
('SCH_TA_14', 2, '07:30:00', '08:00:00', 'AVAILABLE'),
('SCH_TA_14', 3, '08:00:00', '08:30:00', 'AVAILABLE'),
('SCH_TA_14', 4, '08:30:00', '09:00:00', 'AVAILABLE'),
('SCH_TA_14', 5, '09:00:00', '09:30:00', 'AVAILABLE');
-- Ngày 15/05
INSERT INTO TIMESLOT (SCHEDULE_ID, SLOT_NO, SLOT_START_TIME, SLOT_END_TIME, STATUS) VALUES
('SCH_TA_15', 1, '07:00:00', '07:30:00', 'AVAILABLE'),
('SCH_TA_15', 2, '07:30:00', '08:00:00', 'AVAILABLE'),
('SCH_TA_15', 3, '08:00:00', '08:30:00', 'AVAILABLE'),
('SCH_TA_15', 4, '08:30:00', '09:00:00', 'AVAILABLE'),
('SCH_TA_15', 5, '09:00:00', '09:30:00', 'AVAILABLE');

-- =====================================================
-- 10. APPOINTMENT 
-- =====================================================

SET @disable_date_check = 1; 

INSERT INTO APPOINTMENT (APPOINTMENT_ID, TIME, DATE, SERVICE_TYPE, SPECIALTY_ID, PROFILE_ID, SCHEDULE_ID, SLOT_NO)
VALUES
-- Past (Thành's family)
('APP_PAST_01', '08:00:00', '2026-01-10', 'Khám Chuyên Gia', 'SPEC01', 'PROF001', 'SCH_PAST_1', 1), 
('APP_PAST_02', '08:00:00', '2026-02-15', 'Khám Chuyên Gia', 'SPEC01', 'PROF002', 'SCH_PAST_2', 1), 
('APP_PAST_03', '08:00:00', '2026-03-20', 'Khám Đa Khoa',    'SPEC01', 'PROF003', 'SCH_PAST_3', 1), 

-- Future
('APP_12_01', '07:00:00', '2026-05-12', 'Khám Dịch Vụ', 'SPEC01', 'PROF001', 'SCH_TA_12', 1), -- Thành (Chưa có bệnh án)
('APP_12_02', '07:00:00', '2026-05-12', 'Khám Dịch Vụ', 'SPEC02', 'PROF004', 'SCH_TA_12', 1), -- Khách khác
('APP_13_01', '07:00:00', '2026-05-13', 'Khám Thường',  'SPEC01', 'PROF002', 'SCH_TA_13', 1), -- Ba Mai (Chưa có bệnh án)
('APP_14_01', '07:30:00', '2026-05-14', 'Khám Thường',  'SPEC03', 'PROF005', 'SCH_TA_14', 2), -- Khách khác
('APP_15_01', '07:00:00', '2026-05-15', 'Khám Thường',  'SPEC02', 'PROF003', 'SCH_TA_15', 1); -- Mẹ Thơ (Chưa có bệnh án)

SET @disable_date_check = 0;

-- =====================================================
-- 11. ASSIGNS
-- =====================================================
INSERT INTO ASSIGNS (DOCTOR_ID, APPOINTMENT_ID)
VALUES
('DOC01', 'APP_PAST_01'), ('DOC01', 'APP_PAST_02'), ('DOC01', 'APP_PAST_03'), 
('DOC06', 'APP_12_01'),   ('DOC08', 'APP_12_02'),   ('DOC06', 'APP_13_01'), 
('DOC07', 'APP_14_01'),   ('DOC08', 'APP_15_01');

-- =====================================================
-- 12. SYMPTOM_NOTES
-- =====================================================
INSERT INTO SYMPTOM_NOTES (APPOINTMENT_ID, APPOINTMENTS_SYMPTOM_NOTES)
VALUES
('APP_PAST_01', 'Đau thắt ngực nhẹ khi vận động'),
('APP_PAST_02', 'Huyết áp cao, tái khám định kỳ'),
('APP_PAST_03', 'Mệt mỏi, chán ăn kéo dài'),
('APP_12_01', 'Tái khám tim mạch Tâm Anh'),
('APP_13_01', 'Khám sức khỏe tổng quát cho người lớn tuổi');

-- =====================================================
-- 13. BILLING_RECORD 
-- =====================================================
INSERT INTO BILLING_RECORD (BILLING_ID, APPOINTMENT_ID, TOTAL_FEE, PAYMENT_METHOD, STATUS)
VALUES
-- Quá khứ
('BILL_P1', 'APP_PAST_01', 500000.00, 'BANK_TRANSFER', 'PAID'),
('BILL_P2', 'APP_PAST_02', 500000.00, 'CASH',          'PAID'),
('BILL_P3', 'APP_PAST_03', 200000.00, 'INSURANCE',     'PAID'),

-- Tương lai
('BILL_F1', 'APP_12_01',   300000.00, 'BANK_TRANSFER', 'PAID'),    
('BILL_F2', 'APP_13_01',   150000.00, 'CASH',          'PENDING'); 

-- =====================================================
-- 14. PRESCRIPTION & MEDICAL RECORD
-- =====================================================
INSERT INTO PRESCRIPTION (PRESCRIPTION_ID)
VALUES ('PRES_P1'), ('PRES_P2'), ('PRES_P3');

INSERT INTO MEDICAL_RECORD (MEDICAL_RECORD_ID, STATUS, PRIMARY_DIAGNOSIS, DETAILED_NOTE, DATE_OF_ISSUANCE, APPOINTMENT_ID, PRESCRIPTION_ID)
VALUES
('REC_P1', 'CONCLUDED', 'Rối loạn thần kinh thực vật', 'Không có tổn thương thực thể ở tim', '2026-01-10', 'APP_PAST_01', 'PRES_P1'),
('REC_P2', 'CONCLUDED', 'Tăng huyết áp vô căn',       'Tiếp tục phác đồ cũ',                  '2026-02-15', 'APP_PAST_02', 'PRES_P2'),
('REC_P3', 'CONCLUDED', 'Suy nhược cơ thể',           'Cần bổ sung vitamin và nghỉ ngơi',     '2026-03-20', 'APP_PAST_03', 'PRES_P3');

INSERT INTO PRESCRIPTION_DETAIL (PRESCRIPTION_ID, DETAIL_NO, FREQUENCY, MEDICATION, USAGES, INSTRUCTION)
VALUES
('PRES_P1', 1, '1 viên/ngày', 'Magnesium B6', 'Uống sáng', 'Uống sau ăn'),
('PRES_P2', 1, '1 viên/ngày', 'Amlodipine 5mg', 'Uống sáng', 'Uống đúng giờ'),
('PRES_P3', 1, '2 viên/ngày', 'Pharmaton', 'Uống sáng và trưa', 'Không uống tối');