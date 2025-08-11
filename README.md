# RentalDemo
# SmartRent – Rental Management Platform

## 📌 Project Brief
This project is a Rental Management web application designed to streamline the entire rental lifecycle — from product listing to payment, delivery, and return.

It provides a unified online platform where customers can browse available products, check availability, book rentals for specific dates, and pay securely. Businesses can define rental products with flexible durations (hourly, daily, weekly, monthly), manage reservations to avoid overbooking, and automate pickup and return scheduling.

Customers can:
- Browse available products.
- Select rental dates and durations.
- Get instant pricing.
- Make secure online payments.
- Track pickup/return schedules.

Admins can:
- Manage the rentable product catalog.
- Configure pricing rules & availability.
- Handle orders, invoices, deliveries, and returns.
- View analytics and export reports.

The system supports **hourly, daily, weekly, and monthly rentals** with customizable pricing and automated notifications.

---

## 🛠 Tech Stack

### **Frontend**
- **React + Vite**
- **Tailwind CSS** (UI styling)
- **React Router** (navigation)
- **axios** (API calls)
- **react-date-range + date-fns** (date picker & calculations)
- **react-hook-form + zod** (form handling & validation, optional but helpful)

### **Backend**
- **Node.js + Express**
- **PostgreSQL** with Prisma 
- **jsonwebtoken (JWT)** for authentication
- **multer** for image uploads (disk or S3)
- **Razorpay** for payments
- **nodemailer** for email notifications
- **node-cron** for scheduled reminders (skip Redis for hackathon)

---

## 🚀 Key Features

### **0. Authentication & Authorization**
- Email/password signup & login.
- JWT-based authentication for APIs.
- Role-based access control:
  - **Customer** → browse, rent, pay, track orders.
  - **Admin** → manage products, orders, pricing, and reports.
- Password reset via email.

### **1. Rental Product Management**
- Mark products as rentable with unit (hour/day/week).
- Support for short- and long-term rentals.
- Product availability calendar/list to prevent overbooking.

### **2. Rental Quotations & Orders**
- Create & confirm rental quotations → convert to orders.
- Generate rental contracts.
- Customers can review, confirm, and pay online.
- Pickup & return scheduling with precise timings.
- Automated notifications (email/portal alerts) for customers and admins.

### **3. Payment Gateway Integration**
- Secure online payments (Razorpay/Stripe/PayPal).
- Payment directly from rental quotation or order.

### **4. Delivery Management**
- **Reservation**: Reserve items upon order confirmation.
- **Pickup**: Generate pickup documents; update stock status.
- **Return**: Generate return documents; update stock for next rentals.

### **5. Flexible Invoicing**
- Full upfront payment or partial deposit.
- Automatic late return fee calculation.

### **6. Pricelist Management**
- Multiple pricelists for customer segments (corporate, VIP, seasonal).
- Time-based pricing (hour/day/week).
- Discount rules (percentage/fixed/promotional).
- Seasonal/promo validity periods.

### **7. Returns & Delays Handling**
- Alerts for late returns.
- Automatic late fees or penalties.

### **8. Reports & Dashboards**
- Metrics: most rented products, total revenue, top customers.
- Export in PDF, XLSX, or CSV.

---

## 📅 Suggested Build Order 

1. **Project Scaffold + DB Setup**
   - Boot Express + PostgreSQL
   - Env setup, logger, error handler, CORS, validation
   - Health route, migration runner, seed script

2. **Auth & RBAC**
   - Signup/login → JWT issuance
   - Roles: admin, customer
   - Protect routes with middleware
   - UI: Login/Signup, logout, admin guard

3. **Products (Minimal Rentable Catalog)**
   - Models: Product, ProductImages, Stock, Category
   - Admin CRUD endpoints + simple admin UI
   - Public list/detail pages

4. **Pricing (Basic Time-based)**
   - Model: Pricelist, PricelistItem
   - Backend util for price calculation
   - Show computed price on product page

5. **Availability & Reservation Hold**
   - Check availability endpoint
   - Reservation hold on checkout (TTL ~10 min)

6. **Cart/Checkout (Quote → Order)**
   - Quote entity with dates, totals, deposit
   - Convert to order on confirmation
   - UI with date picker & breakdown

7. **Payments**
   - Integrate Razorpay (fastest for India)
   - Webhook for payment confirmation

8. **Pickup/Return Scheduling**
   - FulfillmentTask model for pickups & returns
   - Auto-create tasks on order confirmation

9. **Notifications (Email First)**
   - Cron job to send reminders N days before return

10. **Invoicing & Late Fees**
    - Generate invoice on confirmation
    - Late fee calculation & addition

11. **Reports/Dashboards**
    - API + charts
    - Export CSV → PDF/XLSX if time permits
