# User Data & Interaction Questionnaires

## A. The "Plan My Trip" Questionnaire (Input Fields)
*When a user wants to find or generate a trip, these are the exact data points we need to capture in the Frontend Form:*

**1. The Basics (Hard Constraints)**
* **Destination:** (e.g., "Kerala", "Manali", or "Anywhere warm")
* **Dates:** Start Date & End Date.
* **Budget:** Slider (₹5,000 – ₹1,00,000+).
* **Travelers:** Solo, Couple, Family (with kids?), Friends.

**2. The "Vibe" Check (Soft Constraints - Crucial for AI)**
* *Question:* "What is the pace of this trip?"
    * [ ] Relaxed (Sleeping in, spa, cafes)
    * [ ] Moderate (Sightseeing + chill)
    * [ ] Fast (Packed schedule, hiking, exploring)
* *Question:* "What are your top interests?" (Select max 3)
    * [ ] Nature/Wildlife
    * [ ] History/Culture
    * [ ] Party/Nightlife
    * [ ] Food/Culinary

---

## B. Admin Data Entry Questionnaire
*When I (the Admin) upload a new tour package, I must answer these to populate the DB:*

1.  **Title:** (Must be catchy, e.g., "Hidden Gems of Goa")
2.  **Price:** (Per person in INR)
3.  **Max Group Size:** (e.g., 10 people)
4.  **Location Coordinates:** (Lat/Long - for the Map feature)
5.  **Featured?** (Yes/No - Does this go on the Homepage?)