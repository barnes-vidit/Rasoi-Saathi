# RasoiLink

A mobile-first web app enabling Indian street food vendors to collaboratively place bulk raw-material orders, unlock wholesale prices, and receive shared delivery from local suppliers.

## 🚀 Overview

**RasoiLink** is designed for street vendors who typically don't have access to tech-savvy tools. Our goal: make bulk raw-material purchasing seamless, intuitive, and affordable — with minimal tech knowledge required.

## 🧑‍🍳 Who is it for?

* Indian street food vendors (especially in urban zones)
* Local suppliers providing vegetables, grains, and cooking ingredients

## 🛠 Tech Stack

* **Frontend:** React / Next.js (mobile-first)
* **Backend:** Supabase (DB, Auth, Storage, Edge Functions)
* **Realtime:** Supabase Realtime Subscriptions
* **Authentication:** Supabase Auth (Phone OTP)
* **File Storage:** Supabase Storage
* **Payment:** UPI (Mock or Razorpay/Paytm simulated)

## 📱 Core Features

### 👨‍🍳 Vendors

* Phone OTP Login
* Auto-detect or select local zone
* View/join ongoing group orders
* Add items + quantities to group cart
* View real-time cart totals and pricing
* Pay via UPI and track status (forming → dispatched → delivered)
* See order history

### 🏬 Suppliers

* Upload and manage item inventory
* View active group orders matched to them
* Track vendor-specific requests and totals
* Mark orders as dispatched
* Upload delivery proof (image/audio via Supabase Storage)

### 🔄 Realtime Behavior

* Group cart auto-refreshes as vendors update quantities
* Status changes (e.g., order closed/dispatched) reflected instantly

### 🔐 Security & Role Access

* Supabase Row-Level Security (RLS)
* Vendors can only access their own records
* Suppliers can only view/manage their group orders and items

## ⏱ Auto-Closure Logic

* Orders automatically close at defined time or when minimum vendor threshold is met
* Vendors cannot join once closed

## 📁 Supabase DB Schema (Simplified)

* **vendors**
* **suppliers**
* **items** (supplier\_id FK)
* **group\_orders** (zone, deadline, status)
* **group\_order\_items** (aggregated qty + linked to item)
* **vendor\_orders** (vendor\_id, group\_order\_id, paid, items)
* **delivery\_proofs** (media uploads by supplier)

## ✅ Dev Milestones

### Phase 1: Planning ✅

* Vision, personas, value prop

### Phase 2: DB Design ✅

* Supabase schema, security policies

### Phase 3: UI/UX ✅

* Mobile-first, intuitive, premium feel UI

### Phase 4 & 5: Backend Logic ✅

* Supabase Edge Functions, RLS, and Storage configured

### Phase 6: Integration & Testing ✅

* Full vendor → supplier journey tested

## 🧪 Testing & QA

* Simulated with mock vendors and suppliers
* Edge cases handled (e.g., vendor doesn't pay, group timeout)
* Real-time updates validated
* Security verified via Supabase Auth & RLS

## 🔚 Current Status

✅ MVP is complete
✅ Demo-ready
🚧 Final polish (logos, animations, notification extras) underway

## 🧠 Future Enhancements

* Live SMS/Email alerts for status changes
* Multilingual support (Hindi, Tamil, etc.)
* AI-based item demand forecasting per zone
* Supplier-bidding module for lowest prices

## 🤝 Made for Tutedude Hackathon

**Team:** \Hacky Pandas
**Date:** 27 July 2025

---

> "Join hands with fellow vendors. Buy smart. Save more. — RasoiLink"
