# BÁO CÁO PHẦN 2.3 — STORED PROCEDURES (Query-Only)
> **Mục tiêu:** Xây dựng các Stored Procedures chuyên dùng để **hiển thị dữ liệu** (chỉ SELECT), đáp ứng tiêu chí SQL nâng cao của bài tập và hỗ trợ đội phát triển UI/Web App tích hợp trực tiếp.

---

## 1. TỔNG QUAN LUỒNG NGHIỆP VỤ

Toàn bộ 3 SP trong file này xoay quanh **một luồng UI duy nhất dành cho Bệnh nhân + Màn hình Admin**, tập trung vào cơ sở **Bệnh viện Tâm Anh (MF002 / BR002)**:

```
[Patient UI]
  Bước 1 ──► sp_GetAvailableTimeslots   → Hiển thị giờ trống + Bác sĩ
  Bước 2 ──► sp_insert_appointment      → (CRUD) Lưu phiếu hẹn
  Bước 3 ──► sp_ViewPatientAppointments → Xác nhận lịch hẹn vừa tạo

[Admin UI]
  Bước 4 ──► sp_GetPopularSpecialties   → Dashboard thống kê chuyên khoa
```

> **Lưu ý quan trọng:** Mọi thao tác ghi dữ liệu (INSERT / UPDATE / DELETE) đều thuộc Phần 2.2 (file `03_SPs_CRUD.sql`). File `05_SPs_Queries.sql` **chỉ chứa SELECT** — đây là yêu cầu bắt buộc của đề bài.

---

## 2. TÀI LIỆU API CHI TIẾT (DÀNH CHO ĐỘI UI/WEB APP)

---

### 2.1. `sp_GetAvailableTimeslots` — Tìm giờ khám còn trống

**Màn hình UI tương ứng:** Trang Đặt lịch — Bước chọn giờ khám.

#### Đầu vào (Tham số IN)

| Tham số | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|
| `p_FacilityID` | VARCHAR(20) | Mã bệnh viện (lấy từ màn hình chọn BV) | `'MF002'` |
| `p_BranchID` | VARCHAR(20) | Mã chi nhánh (lấy từ màn hình chọn chi nhánh) | `'BR002'` |
| `p_Date` | DATE | Ngày muốn khám (từ date-picker của UI) | `'2026-06-10'` |

#### Đầu ra (Cột SELECT trả về)

| Cột | Mô tả | Dùng để làm gì trên UI |
|---|---|---|
| `SLOT_NO` | Số thứ tự slot | **Ẩn** — truyền vào `sp_insert_appointment` khi user bấm "Chọn" |
| `Start_Time` | Giờ bắt đầu | **Hiển thị** — VD: "07:00" |
| `End_Time` | Giờ kết thúc | **Hiển thị** — VD: "07:30" |
| `Doctor_Name` | Tên bác sĩ phụ trách | **Hiển thị** — VD: "BS. Vũ Lương Y" |
| `SCHEDULE_ID` | Mã lịch làm việc | **Ẩn** — truyền vào `sp_insert_appointment` khi user bấm "Chọn" |

#### Lệnh gọi mẫu
```sql
CALL sp_GetAvailableTimeslots('MF002', 'BR002', '2026-06-10');
```

#### Tiêu chí Database đáp ứng
- ✅ JOIN 3 bảng: `SCHEDULE`, `TIMESLOT`, `WORKS_AT`, `DOCTOR`
- ✅ Có `WHERE` (Lọc BV, Chi nhánh, Ngày, Trạng thái AVAILABLE)
- ✅ Có `ORDER BY` (Giờ sớm nhất lên đầu — thuận mắt người dùng)

---

### 2.2. `sp_GetPopularSpecialties` — Thống kê Chuyên khoa phổ biến ⭐ (Câu lấy điểm khó)

**Màn hình UI tương ứng:** Admin Dashboard — Biểu đồ/Bảng xếp hạng chuyên khoa.

#### Đầu vào (Tham số IN)

| Tham số | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|
| `p_FacilityID` | VARCHAR(20) | Mã bệnh viện muốn xem báo cáo | `'MF002'` |
| `p_BranchID` | VARCHAR(20) | Mã chi nhánh cụ thể | `'BR002'` |
| `p_StartDate` | DATE | Từ ngày | `'2025-01-01'` |
| `p_EndDate` | DATE | Đến ngày | `'2025-12-31'` |
| `p_MinAppointments` | INT | Ngưỡng lọc tối thiểu (đặt = 1 để lấy tất cả) | `1` |

#### Đầu ra (Cột SELECT trả về)

| Cột | Mô tả | Dùng để làm gì trên UI |
|---|---|---|
| `SPECIALTY_ID` | Mã chuyên khoa | **Ẩn** — dùng để navigate nếu cần |
| `Specialty_Name` | Tên chuyên khoa | **Hiển thị** — nhãn của cột/thanh biểu đồ |
| `Total_Appointments` | Tổng lượt khám | **Hiển thị** — giá trị của cột/thanh biểu đồ |

#### Lệnh gọi mẫu
```sql
CALL sp_GetPopularSpecialties('MF002', 'BR002', '2025-01-01', '2025-12-31', 1);
```

**Kết quả mong đợi với dữ liệu hiện tại:**
| Specialty_Name | Total_Appointments |
|---|---|
| Khoa Nội Tim Mạch | 3 |
| Khoa Nhi | 2 |
| Khoa Thần Kinh | 1 |
| Khoa Răng Hàm Mặt | 1 |
| Khoa Tiêm Chủng | 1 |
| Khoa Ung Bướu | 1 |

#### Tiêu chí Database đáp ứng (Câu khó — lấy điểm tuyệt đối)
- ✅ **Aggregate function:** `COUNT(a.APPOINTMENT_ID)`
- ✅ **GROUP BY:** `sp.SPECIALTY_ID, sp.NAME`
- ✅ **HAVING:** `COUNT(...) >= p_MinAppointments`
- ✅ **WHERE:** Lọc theo BV, chi nhánh, khoảng thời gian
- ✅ **ORDER BY:** `Total_Appointments DESC`
- ✅ **JOIN:** 3 bảng — `MEDICAL_SPECIALITY`, `APPOINTMENT`, `SCHEDULE`

---

### 2.3. `sp_ViewPatientAppointments` — Xem lịch sử hẹn khám (Bonus)

**Màn hình UI tương ứng:** Trang "Hồ sơ của tôi" → Tab "Lịch sử đặt khám".

#### Đầu vào (Tham số IN)

| Tham số | Kiểu | Mô tả | Ví dụ |
|---|---|---|---|
| `p_ProfileID` | VARCHAR(20) | Mã hồ sơ đang đăng nhập (lấy từ session) | `'PROF001'` |

#### Đầu ra (Cột SELECT trả về)

| Cột | Mô tả | Dùng để làm gì trên UI |
|---|---|---|
| `APPOINTMENT_ID` | Mã phiếu hẹn | **Ẩn** — dùng nếu cần navigate đến chi tiết |
| `Appointment_Date` | Ngày khám | **Hiển thị** trên thẻ Card |
| `Appointment_Time` | Giờ khám | **Hiển thị** trên thẻ Card |
| `SERVICE_TYPE` | Loại dịch vụ | **Hiển thị** badge/tag |
| `Specialty_Name` | Tên chuyên khoa | **Hiển thị** trên thẻ Card |
| `Facility_Name` | Tên bệnh viện | **Hiển thị** trên thẻ Card |

#### Lệnh gọi mẫu
```sql
CALL sp_ViewPatientAppointments('PROF001');
```

#### Tiêu chí Database đáp ứng
- ✅ JOIN 4 bảng: `APPOINTMENT`, `MEDICAL_SPECIALITY`, `SCHEDULE`, `MEDICAL_FACILITY`
- ✅ Có `WHERE` (Lọc đúng hồ sơ bệnh nhân)
- ✅ Có `ORDER BY` (Lịch gần nhất lên đầu — UX tốt)
- ✅ **Liên kết trực tiếp với CRUD:** Đây là SP đọc lại chính bảng `APPOINTMENT` mà `sp_insert_appointment` đã ghi vào — chứng minh luồng dữ liệu hoàn chỉnh.

---

## 3. KỊCH BẢN DEMO THUYẾT TRÌNH (Chạy theo thứ tự)

> [!NOTE]
> **Bước 1 — Patient UI: Tìm giờ rảnh tại Tâm Anh**
> ```sql
> CALL sp_GetAvailableTimeslots('MF002', 'BR002', '2026-06-10');
> ```
> *App hiển thị danh sách slot: "07:00-07:30 | BS. Vũ Lương Y", "07:30-08:00 | BS. Vũ Lương Y",...*
> *Người dùng chọn Slot 1 → App lưu ngầm `SCHEDULE_ID = 'SCH006'` và `SLOT_NO = 1`.*

> [!NOTE]
> **Bước 2 — Giao điểm CRUD (2.2): Bệnh nhân bấm "Xác nhận đặt lịch"**
> ```sql
> -- App gọi lệnh này khi user bấm nút "Đặt lịch"
> CALL sp_insert_appointment(
>     'APP010',       -- Mã phiếu hẹn mới (App tự sinh)
>     '07:00:00',     -- Giờ khám (lấy từ Bước 1)
>     '2026-06-10',   -- Ngày khám (lấy từ Bước 1)
>     'Khám Thường',  -- Loại dịch vụ
>     'SPEC01',       -- Chuyên khoa (người dùng đã chọn trước)
>     'PROF001',      -- Hồ sơ bệnh nhân (lấy từ session)
>     'SCH006',       -- SCHEDULE_ID (lấy từ Bước 1)
>     1               -- SLOT_NO (lấy từ Bước 1)
> );
> ```
> *Trigger tự động cập nhật Slot 1 (SCH006) → `STATUS = 'FULLY_BOOKED'`.*

> [!NOTE]
> **Bước 3 — Patient UI: Xác nhận lịch hẹn**
> ```sql
> CALL sp_ViewPatientAppointments('PROF001');
> ```
> *App hiển thị thẻ lịch hẹn mới nhất ở trên cùng: "10/06/2026 | 07:00 | Nội Tim Mạch | Bệnh viện Tâm Anh".*
> *Đây là minh chứng cho luồng dữ liệu: CRUD ghi vào → Query SP đọc ra.*

> [!NOTE]
> **Bước 4 — Admin UI: Dashboard thống kê cuối kỳ**
> ```sql
> CALL sp_GetPopularSpecialties('MF002', 'BR002', '2025-01-01', '2025-12-31', 1);
> ```
> *Kết quả: Nội Tim Mạch (3 ca) → Nhi (2 ca) → Thần kinh, RHM, Tiêm chủng, Ung bướu (1 ca mỗi khoa).*
> *Admin thấy ngay Nội Tim Mạch là chuyên khoa cần ưu tiên bố trí thêm bác sĩ tại Tâm Anh.*
