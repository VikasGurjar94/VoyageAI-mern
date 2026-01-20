# Project Initiation: VoyageAI (MVP Phase)
**Date:** Jan 20, 2026  
**Interviewer:** Vikas  
**Topic:** Defining the MVP Scope & Core Problems  

## Raw Meeting Notes

**The Core Problem:**
Currently, students and travelers spend hours jumping between 10 different tabs (Google, Hotels, Maps, Instagram) just to plan a simple 3-day trip. They want *one* place that does the thinking for them.

**The Solution (MVP Focus):**
We are NOT building the full "Jarvis" AI yet. The MVP needs to be a solid, reliable booking platform first. If the basic booking doesn't work, the AI features don't matter.

**Key Decisions from Discussion:**
1.  **Auth is tricky:** We need "Admin" vs. "User" roles immediately. I can't have random users deleting trips.
    * *Decision:* Simple JWT auth. No "Forgot Password" email flow yet (too complex for MVP).
2.  **Images:** Hosting images on our own server is a nightmare.
    * *Decision:* Just use Unsplash URLs for now. Cloudinary integration moves to Phase 2.
3.  **Booking Logic:** Do we need a real payment gateway (Razorpay/Stripe)?
    * *Decision:* NO. For MVP, clicking "Book" just creates a database entry with status "Pending." Real money is for Version 2.0.
4.  **The "Vibe":** It can't look like a government railway site. Needs to feel like Airbnb. Clean, whitespace, rounded corners.

**Immediate To-Do:**
- [ ] Set up the repo.
- [ ] Get the "Add Tour" form working for Admin (this is the backbone).
- [ ] Build the "Trip Details" page.