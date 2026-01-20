## C. Developer-Client Requirement Gathering
*These are the critical questions the Developer  must ask the Client (Project Owner/Professor) before writing a single line of code to avoid "Scope Creep" later.*

**1. The "Unique Selling Point" (USP)**
* *Q:* "There are 100 travel websites (MakeMyTrip, Expedia). Why are we building VoyageAI? What is the *one* thing we do differently?"
    * *Developer Note:* The answer must be "Personalized AI Itineraries," otherwise the project is generic.

**2. User Persona & Access Control**
* *Q:* "Who is the primary user? Is it a college student looking for cheap trips, or a luxury traveler?"
    * *Why ask this:* If it's students, the UI should be vibrant/fun. If luxury, it should be minimal/elegant.
* *Q:* "Do we need an Admin approval flow for new Users, or can anyone sign up?"
    * *Current Agreement:* Anyone can sign up as User. Admins are pre-set in DB.

**3. Content Strategy**
* *Q:* "Where are the images and descriptions coming from? Will the Client provide high-quality assets, or should the Developer use stock images?"
    * *Agreement:* Developer will use Unsplash URLs for the MVP.

**4. The "AI" Scope (Boundary Setting)**
* *Q:* "For the AI features, do we want a simple text response (Chatbot style) or a fully interactive UI (Clickable daily plans)?"
    * *Constraint:* Interactive UI is preferred but requires significantly more development time. We will start with JSON-to-UI rendering.

---

## D. Client-Developer Sprint Review (The Weekly Check-In)
*These are the hard questions the Client (Evaluator) will ask the Developer (You) during the review meetings. You must have answers ready.*

**1. Progress vs. Timeline**
* *Q:* "We are in Week 3. Is the Authentication system fully secure? Can I hack it by guessing a URL?"
    * *Required Answer:* "Yes, we implemented JWT (JSON Web Tokens) and Protected Routes. Even if you guess the URL `/admin`, the backend rejects the request without a token."

**2. Data Integrity**
* *Q:* "What happens if two users try to book the last seat on a tour at the exact same second?"
    * *Developer Answer:* "Currently, we check availability *before* saving. For Phase 2, we will implement database 'Transactions' to prevent overbooking."

**3. The "Mock" Factor**
* *Q:* "Is this real data? Are these real payments?"
    * *Developer Answer:* "No, the payment button is a simulation that changes the booking status in the database. No real money is processed in the MVP."

---

## E. Developer Internal "Pre-Flight" Checklist
*Questions the Developer must ask themselves before pushing code to GitHub.*

**1. Security Check**
* [ ] Did I remove my `.env` file from Git? (Is `node_modules` in `.gitignore`?)
* [ ] Are the API keys for Gemini/Mapbox restricted or hidden?
* [ ] Is the MongoDB password hardcoded? (It should be an environment variable).

**2. Usability Check**
* [ ] Does the site break if I view it on a mobile phone (375px width)?
* [ ] What happens if the AI API fails or times out? Do I show a "Try again" message or a white screen?
    * *Fix:* Must implement a "Loading Skeleton" and an Error Boundary.