# Xander Restaurant --- Knowledge Base

**Document type:** Synthetic demo data for RAG testing\
**Version:** 1.0\
**Important:** Xander Restaurant and all details in this document are
fictional sample data created for testing. Replace them with verified
business information before using this knowledge base with real
customers.

------------------------------------------------------------------------

## 1. Restaurant Overview

**Name:** Xander Restaurant\
**Cuisine:** Casual dining with a mix of burgers, sandwiches, rice
dishes, grilled items, and local favourites\
**Positioning:** A friendly, modern restaurant focused on freshly
prepared meals, approachable prices, and convenient dining.\
**Service options:** Dine-in, takeaway, and delivery (availability may
vary by branch).\
**Currency:** Pakistani Rupees (PKR / Rs.)

Xander Restaurant aims to make everyday dining convenient for families,
students, office workers, and groups of friends. Each branch follows the
same core service standards, although some dishes are exclusive to
selected locations.

## 2. Our Story and Founding

Xander Restaurant was founded in **2018** by **Ayaan Malik** and **Sara
Ahmed** in **Karachi, Pakistan**.

The idea began when the founders noticed that customers wanted a relaxed
place where they could enjoy familiar comfort food, generous portions,
and friendly service without a formal fine-dining experience. They
started with a small restaurant and a short menu built around burgers,
sandwiches, and rice meals.

The first location opened in **Gulshan-e-Iqbal, Karachi**. A few popular
dishes and word-of-mouth recommendations helped the restaurant attract
regular customers. Xander later expanded to other neighbourhoods while
keeping its original focus on accessible food and welcoming service.

**Founding facts for retrieval** - Founded: 2018 - Founders: Ayaan Malik
and Sara Ahmed - Founded in: Karachi, Pakistan - First branch:
Gulshan-e-Iqbal, Karachi - Original concept: Casual comfort food with
friendly service - First menu focus: Burgers, sandwiches, and rice meals

## 3. Branch Directory

### Branch 1 --- Gulshan-e-Iqbal (Flagship)

-   **Branch code:** XAN-KHI-01
-   **Address:** Block 13-D, University Road, Gulshan-e-Iqbal, Karachi
-   **Branch type:** Flagship
-   **Opening hours:** Daily, 12:00 PM--11:30 PM
-   **Phone:** 021-5550-1001
-   **Dine-in:** Yes
-   **Takeaway:** Yes
-   **Delivery:** Yes, within the branch's delivery area
-   **Special dishes exclusive to this branch:**
    -   Gulshan Special Beef Burger
    -   Flagship Loaded Fries
-   **Notes:** This is the original Xander location and the only branch
    serving the Gulshan Special Beef Burger.

### Branch 2 --- DHA Phase 6

-   **Branch code:** XAN-KHI-02
-   **Address:** Main Khayaban-e-Ittehad, DHA Phase 6, Karachi
-   **Branch type:** Standard
-   **Opening hours:** Daily, 1:00 PM--12:00 AM
-   **Phone:** 021-5550-1002
-   **Dine-in:** Yes
-   **Takeaway:** Yes
-   **Delivery:** Yes, within the branch's delivery area
-   **Special dishes exclusive to this branch:**
    -   DHA Peri Peri Chicken
    -   Smoked BBQ Club Sandwich
-   **Notes:** The DHA branch offers a spicier grilled selection. Its
    exclusive dishes are not part of the standard menu at other
    branches.

### Branch 3 --- North Nazimabad

-   **Branch code:** XAN-KHI-03
-   **Address:** Block H, near Hyderi Market, North Nazimabad, Karachi
-   **Branch type:** Standard
-   **Opening hours:** Daily, 12:30 PM--11:00 PM
-   **Phone:** 021-5550-1003
-   **Dine-in:** Yes
-   **Takeaway:** Yes
-   **Delivery:** Yes, within the branch's delivery area
-   **Special dishes exclusive to this branch:**
    -   Hyderi Chicken Handi
    -   North Special Masala Biryani
-   **Notes:** This branch has a small selection of desi-style meals
    that are exclusive to North Nazimabad.

### Branch 4 --- Clifton

-   **Branch code:** XAN-KHI-04
-   **Address:** Block 5, Clifton, near Boat Basin, Karachi
-   **Branch type:** Express
-   **Opening hours:** Daily, 2:00 PM--1:00 AM
-   **Phone:** 021-5550-1004
-   **Dine-in:** Limited seating
-   **Takeaway:** Yes
-   **Delivery:** Yes, within the branch's delivery area
-   **Special dishes exclusive to this branch:**
    -   Clifton Crispy Fish Burger
    -   Sea View Mint Cooler
-   **Notes:** The Clifton branch focuses on quick meals and has a
    seafood-inspired burger not offered at the other locations.

## 4. Standard Menu

The following items are listed as standard menu items in this demo
dataset. Prices are in Pakistani Rupees.

  ------------------------------------------------------------------------
  Item                                         Price Description
  --------------------- ---------------------------- ---------------------
  Zinger Burger                              Rs. 850 Crispy chicken fillet
                                                     burger

  Chicken Biryani                            Rs. 450 Spiced rice served
                                                     with chicken

  Club Sandwich                              Rs. 700 Layered sandwich with
                                                     chicken and
                                                     vegetables
  ------------------------------------------------------------------------

**Menu rules** - The three items above are standard items in this sample
knowledge base. - Branch-exclusive dishes are listed separately under
each branch. - Do not assume a branch-exclusive dish is available at
another branch. - Prices and availability can change. Confirm current
prices and stock using the live menu system before quoting them to a
customer. - If a customer asks for a dish that is not listed, do not
invent it. Offer to check with the relevant branch.

## 5. Branch-Specific Dish Lookup

Use this section when a customer asks whether a special dish is
available at a particular branch.

  Dish                           Available branch   Branch code
  ------------------------------ ------------------ -------------
  Gulshan Special Beef Burger    Gulshan-e-Iqbal    XAN-KHI-01
  Flagship Loaded Fries          Gulshan-e-Iqbal    XAN-KHI-01
  DHA Peri Peri Chicken          DHA Phase 6        XAN-KHI-02
  Smoked BBQ Club Sandwich       DHA Phase 6        XAN-KHI-02
  Hyderi Chicken Handi           North Nazimabad    XAN-KHI-03
  North Special Masala Biryani   North Nazimabad    XAN-KHI-03
  Clifton Crispy Fish Burger     Clifton            XAN-KHI-04
  Sea View Mint Cooler           Clifton            XAN-KHI-04

**Important:** A dish being exclusive to one branch means it should not
be promised at other branches. If the customer asks about a branch not
listed for that dish, explain which branch offers it and offer to help
with another option.

## 6. Customer Service Policies

### Orders

-   Customers can place orders through the restaurant's ordering channel
    or directly with a branch.
-   This knowledge base does not confirm whether an order has been
    placed.
-   Only confirm an order when the ordering system returns a successful
    confirmation.

### Reservations

-   Customers should contact their preferred branch to confirm table
    availability.
-   Do not promise a reservation without confirmation from the branch.

### Delivery

-   Delivery coverage depends on the customer's address and the branch.
-   Do not invent delivery fees or delivery time estimates.
-   Ask for the customer's area and direct them to the relevant branch
    for confirmation if live delivery coverage is unavailable.

### Complaints

When a customer reports a problem: 1. Listen and respond politely. 2.
Apologise for the inconvenience. 3. Collect the required complaint
details: - Customer name - Phone number - Complaint description - Order
ID (if available) - Status (initially `Pending`) 4. Use the complaint
logging tool to record the complaint. 5. Confirm it was logged only
after the tool reports success.

### Allergies and Dietary Questions

-   Never guarantee that a dish is allergen-free unless verified
    ingredient and preparation information is available.
-   For allergy, cross-contamination, or strict dietary questions,
    advise the customer to confirm directly with the branch before
    ordering.

## 7. Frequently Asked Questions

**Q: When was Xander Restaurant founded?**\
A: Xander Restaurant was founded in 2018.

**Q: Who founded Xander Restaurant?**\
A: The fictional founders in this demo dataset are Ayaan Malik and Sara
Ahmed.

**Q: Where was the first Xander branch opened?**\
A: The first branch opened in Gulshan-e-Iqbal, Karachi.

**Q: How many branches does Xander have in this demo dataset?**\
A: Four branches: Gulshan-e-Iqbal, DHA Phase 6, North Nazimabad, and
Clifton.

**Q: Which branch serves the Gulshan Special Beef Burger?**\
A: The Gulshan-e-Iqbal flagship branch (XAN-KHI-01).

**Q: Where can I get DHA Peri Peri Chicken?**\
A: It is exclusive to the DHA Phase 6 branch (XAN-KHI-02).

**Q: Which branch serves Hyderi Chicken Handi?**\
A: The North Nazimabad branch (XAN-KHI-03).

**Q: Which branch serves the Clifton Crispy Fish Burger?**\
A: The Clifton branch (XAN-KHI-04).

**Q: Is Chicken Biryani available at every branch?**\
A: It is listed as a standard menu item in this demo dataset, but
customers should confirm current branch availability.

**Q: Can I get a branch-exclusive dish delivered from another branch?**\
A: Branch-exclusive dishes are associated with the branch listed in this
document. The customer should contact that branch to ask about delivery
options.

## 8. RAG Retrieval Notes

Useful entities and keywords: - Restaurant: Xander Restaurant -
Founders: Ayaan Malik, Sara Ahmed - Year founded: 2018 - City: Karachi -
Branches: Gulshan-e-Iqbal, DHA Phase 6, North Nazimabad, Clifton -
Branch codes: XAN-KHI-01, XAN-KHI-02, XAN-KHI-03, XAN-KHI-04 - Standard
dishes: Zinger Burger, Chicken Biryani, Club Sandwich - Exclusive
dishes: Gulshan Special Beef Burger, Flagship Loaded Fries, DHA Peri
Peri Chicken, Smoked BBQ Club Sandwich, Hyderi Chicken Handi, North
Special Masala Biryani, Clifton Crispy Fish Burger, Sea View Mint Cooler

When answering customer questions, distinguish between: 1.
Restaurant-wide information 2. Standard menu items 3. Branch-specific
information 4. Live information that must be checked using a tool

Do not treat this demo document as a source of live stock, current
pricing, order status, or real-world business information.
