# 🚗 Vehicle Quotation & Task Management App

A fully functional React Native mobile app designed for vehicle dealerships to generate professional quotations, manage tasks, and handle customer data — all integrated with Google Sheets via Google Apps Script.

> 🔒 This is a **demo version**. Real logos, RTGS bank details, and dealership names have been replaced for privacy.

---

## 📱 Features

- 🔐 **Login/Signup** with Google Apps Script backend
- 📊 **Task Sheet Viewer** – fetch user-specific tasks from Google Sheets
- 🧾 **Digital Quotation Generator**
  - Customer info
  - Vehicle model, variant, and color
  - Auto-filled dealership name (Demo Motors Pvt. Ltd.)
  - Dynamic RTGS bank info
  - Pricing table with tax & total
  - Shareable PDF generation
- 🌈 **Animated UI**
  - Gradient backgrounds
  - Emoji-enhanced headers
  - Dark/light mode toggle
- 🔔 **Push Notifications** via Firebase (FCM token saved on login)

---

## 🧰 Tech Stack

- **Frontend:** React Native, JavaScript
- **Backend:** Google Apps Script (custom APIs)
- **Database:** Google Sheets
- **PDF Generation:** `react-native-html-to-pdf`
- **Notifications:** Firebase Cloud Messaging

---

## 🚀 Getting Started (for reviewers)

```bash
git clone https://github.com/your-username/vehicle-quotation-task-management.git
cd vehicle-quotation-task-management
npm install
npx react-native run-android
