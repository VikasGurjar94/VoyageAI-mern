# System Requirements Specification (SRS) - VoyageAI

## 1. Functional Requirements (The Features)

### A. Authentication Module
* **FR-01:** System must allow users to Sign Up and Log In using Email/Password.
* **FR-02:** System must assign roles: `User` (default) or `Admin`.
* **FR-03:** Passwords must be hashed (bcrypt) before saving to MongoDB.

### B. Tour Management (Public View)
* **FR-04:** Homepage must display a list of "Featured Tours" (limit 8).
* **FR-05:** Users must be able to search tours by "City" or "Title".
* **FR-06:** "Tour Details" page must show: Image, Price, Description, and Booking Form.

### C. Booking System (User)
* **FR-07:** Clicking "Book Now" is only allowed for logged-in users.
* **FR-08:** Users must input "Guest Size" (must not exceed Max Group Size).
* **FR-09:** Successful booking creates a `Booking` document in DB with status `pending`.

### D. Admin Panel (Protected Route)
* **FR-10:** Only users with `isAdmin: true` can access `/admin`.
* **FR-11:** Admin can `Create`, `Update`, and `Delete` tour packages.
* **FR-12:** Admin can view all bookings and change status to `Confirmed` or `Cancelled`.
