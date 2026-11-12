# MPSC Sarathi: Platform Guide & Architecture Manual (v1.0)

A secure, lightweight, and scalable web platform designed specifically for **Maharashtra Public Service Commission (MPSC)** mock tests (Rajyaseva, Combine Group B & Group C).

---

## 1. System Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Tailwind CSS + Lucide Icons | Responsive bilingual MPSC student portal & admin CMS |
| **Backend API** | Node.js + Express + TypeScript (`server.ts`) | RESTful endpoints, auth, test engine, promo codes |
| **Database** | Supabase (PostgreSQL) + Local Persistent Store | Relational schema (`supabase_schema.sql`) & automatic local fallback |
| **Payment Gateway** | Razorpay (Server-Side Verified) | Secure HMAC SHA256 signature verification before unlocking tests |
| **Version Control** | GitHub | Modular git branch strategy for easy maintenance |

---

## 2. Database Design & Tables

The system follows a strict relational database design tailored for bilingual MPSC examinations:

1. **`roles`**: System roles (`admin`, `student`).
2. **`users`**: Student and administrator profiles with hashed credentials.
3. **`exams`**: MPSC exam categories (Rajyaseva State Services, Combine Group B, Combine Group C).
4. **`subjects`**: Core MPSC syllabus subjects (Polity, Maharashtra History, Maharashtra Geography, Economy, General Science, Marathi Grammar, CSAT).
5. **`topics`**: Granular syllabus topics (e.g., 73rd Amendment, Godavari River Basin, Satyashodhak Samaj).
6. **`questions`**: Bilingual question items (`question_en`, `question_mr`, `explanation_en`, `explanation_mr`, difficulty, marks, negative marks).
7. **`question_options`**: Options per question (`text_en`, `text_mr`, `is_correct`).
8. **`tests`**: Test configurations (duration in minutes, total marks, passing marks, negative marking factor `0.25`, price).
9. **`test_questions`**: Ordered questions mapped to a mock test.
10. **`promo_codes`**: Discount coupons (percentage/fixed, expiry, usage limit, minimum cart amount).
11. **`payments`**: Transaction records with Razorpay order ID, payment ID, and HMAC SHA256 signature.
12. **`test_enrollments`**: Records of unlocked/purchased tests for students.
13. **`attempts`**: Student test sessions with timer and status (`in_progress`, `evaluated`).
14. **`answers`**: Selected answers and review flags per question.
15. **`results`**: Evaluated scores, positive marks, negative penalties, rank, percentile, and subject-wise breakdown.

---

## 3. Supabase Integration Setup

To run directly on a hosted Supabase PostgreSQL instance:
1. Log into your Supabase Dashboard at [supabase.com](https://supabase.com).
2. Create a new project named `mpsc-sarathi`.
3. Open the **SQL Editor** from the left navigation panel.
4. Open the file `supabase_schema.sql` from the root directory of this repository.
5. Copy the entire SQL content and paste it into the Supabase SQL Editor.
6. Click **Run**. All 15 tables, indexes, and Row Level Security (RLS) policies will be created instantly.
7. In your Supabase Project Settings -> API, copy your `Project URL` and `service_role` secret key.
8. Set these in your `.env` file:
   ```env
   SUPABASE_URL="https://your-project-id.supabase.co"
   SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
   ```

---

## 4. Razorpay Payments & Server-Side Verification

Security rule: **Never unlock tests based solely on client-side responses.**

### Workflow:
1. **Order Creation**: Student clicks "Buy Test". The frontend calls `POST /api/payments/create-order` with the `test_id` and optional `promo_code`.
2. The server verifies test pricing, applies valid discounts, and creates a unique Razorpay Order record.
3. **Checkout**: Razorpay Standard Checkout opens in the student's browser.
4. **Signature Verification**: On successful payment, Razorpay sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
5. Frontend calls `POST /api/payments/verify`.
6. The backend generates an HMAC SHA-256 hash using the secret key:
   ```typescript
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     .update(`${orderId}|${paymentId}`)
     .digest('hex');
   ```
7. Only if the signature matches does the backend mark the order as `paid`, record the timestamp, increment promo usage, and grant access to the test.

---

## 5. Non-Technical Owner Operations

### A. Adding Bilingual Questions
1. Log in as Admin (`admin@mpsc.gov` / `admin123`).
2. Navigate to **Question Bank** -> **Add New Question**.
3. Select Exam (e.g., MPSC Rajyaseva) and Subject (e.g., Indian Polity).
4. Enter the English question in the **English Question** box and Marathi in the **मराठी प्रश्न** box.
5. Fill in 4 bilingual options and click the checkmark next to the correct answer.
6. Add detailed bilingual explanations (स्पष्टीकरण) to help students learn after test submission.
7. Click **Save Question**.

### B. Creating Mock Tests & Setting Negative Marking
1. Navigate to **Test Management** -> **Create Test**.
2. Enter Title (English & Marathi), Duration (e.g., 60 mins), Total Marks (e.g., 100), and Negative Mark Factor (`0.25` for standard MPSC 1/4th penalty).
3. Set Price (`0` for Free starter tests, or e.g. `₹199` for full test series).
4. Select the questions to include from the question bank.
5. Toggle **Published** to make it instantly visible to students.

### C. Creating Promo Codes
1. Navigate to **Promo Codes** -> **New Promo Code**.
2. Enter Code (e.g., `DIWALI50` or `MPSC2026`).
3. Select **Percentage** (e.g. 20%) or **Fixed Amount** (e.g. ₹50).
4. Set Minimum Order Amount (e.g. ₹100), Usage Limit (e.g. 500 uses), and Expiry Date.
5. Click **Create Promo**.

### D. Exporting Backups & Disaster Recovery
- Go to **Admin Dashboard** -> **Backups & Settings**.
- Click **Export JSON Backup** to download a complete instant snapshot of questions, tests, student attempts, and payment records.
- To restore on a new server, click **Restore from Backup**, upload the JSON file, and confirm.

---

## 6. Health Check API Specification

- **Endpoint**: `GET /api/health`
- **Authentication**: None (Public prober)
- **Sample Response**:
  ```json
  {
    "status": "healthy",
    "platform": "MPSC Sarathi Engine v1.0",
    "timestamp": "2026-11-12T00:20:00.000Z",
    "uptimeSeconds": 3482,
    "database": {
      "status": "connected",
      "questionsCount": 8,
      "testsCount": 4,
      "usersCount": 2
    },
    "razorpay": {
      "configured": true,
      "keyId": "rzp_test_..."
    },
    "memory": {
      "rssMb": 68,
      "heapUsedMb": 32
    }
  }
  ```

---

## 7. Troubleshooting Guide

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **Payment Signature Verification Failed** | Razorpay Key Secret mismatch or altered payment response | Verify that `RAZORPAY_KEY_SECRET` in `.env` matches the secret in your Razorpay dashboard. In sandbox test mode, use the verified simulated checkout. |
| **Marathi characters appear distorted** | UTF-8 encoding missing | All database tables and JSON stores use UTF-8. Ensure your browser font supports Devanagari (`Noto Sans Devanagari` is bundled). |
| **Test Not Unlocking After Payment** | Verification webhook/call didn't complete | Check Admin -> Payments table. If order is marked 'created', use the admin manual verify tool or check network connectivity. |
| **Promo Code Invalid** | Min order amount not met, expired, or test not eligible | Review promo code start/expiry dates and minimum order amount in the Promo Code Manager. |

---

## 8. Package Management Category (Bundled Mock Test Packs)

The platform provides a flexible, code-free **Package Management Category** allowing the non-technical owner to bundle multiple mock tests into comprehensive exam packs (e.g., *MPSC Group C Complete Package* with 35+ tests, *MPSC AMVI Technical Mock Pack* with 20 tests, or *Rajyaseva Master Test Series*).

### A. Database Design for Packages
- **`packages`**:
  - `id`: Unique identifier (e.g., `pkg_group_c_complete`).
  - `exam_id`: Target exam category.
  - `name_en` & `name_mr`: Bilingual package titles.
  - `description_en` & `description_mr`: Bilingual descriptions.
  - `image_url`: Promotional banner image.
  - `price` & `discount_price`: Original strike-through price and active discounted price.
  - `validity_days`: Package access duration (e.g., 180 days, 365 days).
  - `is_published`: Instant publish/unpublish toggle.
- **`package_tests`**:
  - `package_id`, `test_id`: Many-to-many relationship mapping tests to packages.
  - `sort_order`: Ordering of mock tests within the package syllabus.
- **`package_enrollments`**:
  - `user_id`, `package_id`: Student subscription record with `valid_until` timestamp and `payment_id`.

### B. Admin Operations (Zero Code Required)
1. **Create Package**:
   - Navigate to **Admin Command Center** -> **पॅकेजेस (Packages)** -> **+ New Package (+ नवीन पॅकेज)**.
   - Enter bilingual titles, descriptions, target exam category, banner image, validity period (in days), and pricing.
2. **Add & Reorder Mock Tests**:
   - In the Package Editor modal, click **+ Add (जोडा)** next to any test from the test library to include it in the package.
   - Use the **Up (↑)** and **Down (↓)** arrow buttons to dynamically reorder tests inside the package.
   - Click the trash icon to remove a test from the package without deleting the test itself.
3. **Publish / Unpublish**:
   - Toggle publish status at any time to show or hide the package from student browsing.

### C. Student Flow & Dual Purchase Model
- **Package Browsing**: Students can toggle between *Packages (पॅकेजेस)* and *Individual Tests (स्वतंत्र चाचण्या)* on the dashboard.
- **Package Inspection**: Students can click **View Included Tests (समाविष्ट चाचण्या पहा)** to view every test, duration, total marks, and questions before purchasing.
- **Razorpay Checkout & Server Verification**:
  - Students can apply promotional discount codes to package purchases.
  - On checkout, Razorpay issues a transaction verified via HMAC SHA-256 on the Node.js server.
  - The server records the payment with `item_type: 'package'`, unlocks the package subscription in `package_enrollments`, and automatically grants access to all bundled tests.
- **Inherited vs Individual Test Access**:
  - Purchasing an individual test grants access *only* to that test.
  - Purchasing a package unlocks *all* tests mapped to that package.
  - Both access paths coexist harmoniously with independent payment logs and attempt tracking.

