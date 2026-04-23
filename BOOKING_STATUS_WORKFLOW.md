# Booking Status Workflow & Fleet Unit Assignment

## Overview
Complete booking lifecycle with automatic fleet unit assignment, mandatory contract signing, and real-time status tracking.

---

## 1. AUTOMATIC FLEET UNIT ASSIGNMENT ✅

### How It Works
When a customer completes payment (Step 4), the system **automatically assigns the first available scooter**:

```
Customer books: Honda Click V3 125
Available scooters:
- HC1-01 (G7Y611) → ✓ ASSIGNED
- HC1-02 (G7Y612) → Available
- HC1-03 (G7Y613) → Under Maintenance (skipped)
- HC1-04 (G7Y614) → Available

Result: Booking assigned to HC1-01 (G7Y611)
Plate number automatically filled in contract!
```

### Assignment Rules
- ✅ Must be status = 'available' (not 'maintenance', 'rented', etc.)
- ✅ Assigned in order (HB01, HB02, etc.) - first available wins
- ✅ If NO units available → Error: "No units available for these dates"
- ✅ Plate number automatically shown in contract

### Fleet Unit Fields
```prisma
model FleetUnit {
  unitNumber      String  // "HC1-01", "HB02", etc.
  licensePlate    String  // "G7Y611", "ABC1234", etc.
  status          String  // "available", "maintenance", "rented"
}
```

### Example: Booking Details API Response
```json
{
  "reference": "KJM-20260422-696021",
  "fleetUnit": {
    "unitNumber": "HC1-01",
    "licensePlate": "G7Y611"  ← Automatically assigned
  },
  "vehicleModel": "Honda Click V3 125",
  "finalPrice": 2396
}
```

---

## 2. BOOKING STATUS LIFECYCLE

### Status Flow

```
┌─────────────────────────────────────────────────────────────┐
│ BOOKING LIFECYCLE                                           │
└─────────────────────────────────────────────────────────────┘

Step 1: Vehicle & Dates
Step 2: Delivery
Step 3: Customer Details
Step 4: Payment Method
    ↓
    [Booking created → status: "pending"]
    ✓ Fleet unit ASSIGNED
    ✓ Plate number ASSIGNED
    ↓
Step 5: CONTRACT SIGNING ← ⚠️ REQUIRED
    [Must upload: ID + Passport]
    [Must draw: Digital Signature]
    [Must check: Agreement checkbox]
    ↓
    [Contract signed → status: "confirmed"]
    ✓ ContractSigning record created
    ↓
Step 6: Confirmation
    [Success page with download button]
```

### Status Meanings

| Status | Meaning | Can Cancel? | Can Download Contract? |
|--------|---------|-------------|------------------------|
| **pending** | Booking created, waiting for contract signing | ✅ Yes | ❌ No |
| **confirmed** | Contract signed, all documents submitted | ❌ No | ✅ Yes |
| **active** | Customer has picked up vehicle | ❌ No | ✅ Yes |
| **returned** | Vehicle returned, damages assessed | ❌ No | ✅ Yes |
| **cancelled** | Booking cancelled | N/A | ✅ Yes (if contract exists) |

---

## 3. CONTRACT SIGNING - MANDATORY ⚠️

### Why It's Required
- ✅ Legal binding agreement
- ✅ Confirms customer understands terms
- ✅ ID verification
- ✅ Passport verification
- ✅ Digital signature proof
- ✅ Only THEN booking is "confirmed"

### What's Mandatory
```
□ Agreement checkbox checked
□ Email confirmed
□ ID/Driver's License uploaded (JPG, PNG, PDF)
□ Passport copy uploaded (JPG, PNG, PDF)
□ Digital signature drawn
↓
ONLY THEN: Contract signing succeeds
THEN: Booking status → "confirmed"
```

### Validation
```typescript
// API validates in step 5:
if (!agreedToTerms) → Error
if (!confirmEmail) → Error
if (!idFile) → Error
if (!passportFile) → Error
if (!signaturePath) → Error
↓
ALL REQUIRED → Can submit
```

---

## 4. REAL-TIME CONTRACT STATUS CHECK

### API Endpoint: `GET /api/contracts/status?reference=KJM-xxx`

#### Response (Contract NOT signed yet)
```json
{
  "reference": "KJM-20260422-696021",
  "bookingStatus": "pending",
  "contractSigned": false,
  "contractStatus": null,
  "signedAt": null,
  "fleetUnit": {
    "unitNumber": "HC1-01",
    "licensePlate": "G7Y611"
  },
  "canConfirm": false  ← Cannot confirm yet
}
```

#### Response (Contract SIGNED)
```json
{
  "reference": "KJM-20260422-696021",
  "bookingStatus": "confirmed",
  "contractSigned": true,
  "contractStatus": "completed",
  "signedAt": "2026-04-22T20:55:30.000Z",
  "customerName": "Jane Smith",
  "idDocumentPath": "/contracts/KJM-20260422-696021/id.pdf",
  "passportDocumentPath": "/contracts/KJM-20260422-696021/passport.pdf",
  "signaturePath": "/contracts/KJM-20260422-696021/signature.png",
  "fleetUnit": {
    "unitNumber": "HC1-01",
    "licensePlate": "G7Y611"
  },
  "canConfirm": true  ← Can now proceed with payment
}
```

---

## 5. CONTRACT DOWNLOAD

### API Endpoint: `GET /api/contracts/download?reference=KJM-xxx`

#### What's Included in Downloaded Contract
✅ Pre-filled customer name, phone, nationality  
✅ Vehicle info: brand, model, engine, **plate number**  
✅ Rental dates & duration  
✅ Pricing breakdown  
✅ All terms & conditions  
✅ **Digital signature image embedded**  
✅ Document info: reference, signed date, status  

#### Signature Section
```
┌──────────────────────┐
│  [SIGNATURE IMAGE]   │
│                      │
│ Renter Signature     │
│ Jane Smith           │
│ Date: 2026-04-22    │
└──────────────────────┘
```

#### Download Link (Confirmation Page)
```
[Download Contract] ← Opens HTML file
[WhatsApp us]      ← Contact support
[Back to Home]     ← Homepage
```

---

## 6. DATABASE RECORDS

### Booking Record (After Payment)
```json
{
  "reference": "KJM-20260422-696021",
  "status": "pending",        ← Not confirmed yet
  "fleetUnitId": "cmo...",    ← HC1-01 assigned
  "totalPrice": 2396,
  "autoDiscount": 505,
  "promoDiscount": 599,
  "finalPrice": 2396
}
```

### ContractSigning Record (After Contract Signed)
```json
{
  "bookingReference": "KJM-20260422-696021",
  "customerName": "Jane Smith",
  "customerEmail": "jane@example.com",
  "signedAt": "2026-04-22T20:55:30.000Z",
  "idDocumentPath": "/contracts/KJM-20260422-696021/id.pdf",
  "passportDocumentPath": "/contracts/KJM-20260422-696021/passport.pdf",
  "signaturePath": "/contracts/KJM-20260422-696021/signature.png",
  "status": "completed",
  "contractHash": "sha256_hash_for_verification"
}
```

### File Storage
```
public/contracts/
├── KJM-20260422-696021/
│   ├── id.pdf              ← Customer ID
│   ├── passport.jpg        ← Passport copy
│   └── signature.png       ← Digital signature
├── KJM-20260422-674377/
│   ├── id.jpg
│   ├── passport.pdf
│   └── signature.png
```

---

## 7. ADMIN DASHBOARD VIEW (Real-Time)

### Bookings Table with Contract Status

| Reference | Customer | Vehicle | Plate | Status | Contract | Action |
|-----------|----------|---------|-------|--------|----------|--------|
| KJM-20260422-696021 | Jane Smith | Honda Click V3 125 | G7Y611 | **pending** | ❌ Not signed | View / Contact |
| KJM-20260422-674377 | John Doe | Honda Beat 110 | HB01 | **confirmed** | ✅ Signed | View / Download |
| KJM-20260421-555123 | Maria Garcia | Yamaha Nmax 155 | YN05 | **active** | ✅ Signed | View |

### Contract Status Indicators
- **❌ Not signed** (Red) → Pending
- **✅ Signed** (Green) → Completed
- **⏳ Pending** (Yellow) → Waiting for customer to sign

### Admin Actions
```
Click on booking row:
├── View Contract (HTML preview)
├── Download Contract (PDF ready)
├── View Documents (ID + Passport images)
├── View Signature
├── Verify Status
└── Send Reminder (WhatsApp/Email if not signed)
```

---

## 8. COMPLETE WORKFLOW EXAMPLE

### Scenario: Jane Smith Books Honda Click V3 125

**Step 1-3: Form submission**
```
Vehicle: Honda Click V3 125
Pickup: 2026-04-26
Return: 2026-05-03
```

**Step 4: Payment (Booking Created)**
```
POST /api/bookings
Response: {
  reference: "KJM-20260422-696021",
  booking: {
    status: "pending",
    fleetUnitId: "cmo7ol4me0001ymyvl9pdb9st",  ← AUTO ASSIGNED
    vehicleId: "vehicle-2"
  }
}

DB creates Booking with:
✓ Reference: KJM-20260422-696021
✓ Status: pending
✓ Fleet Unit: HC1-01 (G7Y611) ← AUTOMATIC ASSIGNMENT
✓ Customer: Jane Smith
✓ Vehicle: Honda Click V3 125
✓ Dates: 2026-04-26 to 2026-05-03
```

**Step 5: Contract Signing**
```
GET /api/bookings/details?reference=KJM-20260422-696021
Response: {
  vehicleModel: "Honda Click V3 125",
  vehiclePlateNumber: "G7Y611",  ← Pre-filled!
  customerName: "Jane Smith",
  pickupDate: "2026-04-26",
  finalPrice: 2396,
  ...all data pre-filled
}

Customer sees contract with plate number: G7Y611
Customer signs contract & uploads documents:
├── ID: jane_id.pdf
├── Passport: jane_passport.jpg
└── Signature: [canvas drawing]

POST /api/contracts/sign
Response: { success: true, contractId: "cmo..." }

DB creates ContractSigning record
DB updates Booking: status → "confirmed"
```

**Step 6: Confirmation**
```
Success page shows:
✓ Booking Confirmed
✓ Reference: KJM-20260422-696021
✓ Vehicle: Honda Click V3 125
✓ Plate: G7Y611
✓ Contract: SIGNED
✓ Button: [Download Contract]

Customer can:
├── Download signed contract with signature
├── Message on WhatsApp
└── Go back to home
```

**Admin View (Real-Time)**
```
Bookings List:
KJM-20260422-696021 | Jane Smith | HC Click V3 125 | G7Y611 | confirmed | ✅ Signed

Admin can:
├── View contract (with signature)
├── View uploaded ID
├── View uploaded Passport
├── Download contract PDF
└── All info available in real-time
```

---

## 9. KEY FEATURES SUMMARY

### ✅ Automatic Fleet Unit Assignment
- First available scooter automatically assigned
- Plate number pre-filled in contract
- Shows in booking reference & contract
- Prevents overbooking

### ✅ Mandatory Contract Signing
- Booking status: "pending" until contract signed
- All documents required (ID + Passport)
- Digital signature required
- Cannot skip this step

### ✅ Real-Time Status Tracking
- Check contract signing status via API
- Admin sees status immediately
- Know if customer signed or not
- Can send reminders if needed

### ✅ Contract Download
- Signed contract with embedded signature
- All booking data pre-filled
- Ready to print or save as PDF
- Download available after signing

### ✅ Security & Audit Trail
- Contract hash for verification
- IP address & user agent logged
- All documents securely stored
- Complete booking history

---

## API Reference

### Automatic Assignment (on booking creation)
```
POST /api/bookings

✓ Automatically finds first available fleet unit
✓ Assigns it to booking
✓ Returns fleet unit ID & plate number
✗ If no units available → Error with details
```

### Check Status (Real-Time)
```
GET /api/contracts/status?reference=KJM-xxx

Returns:
- bookingStatus (pending/confirmed/active/returned)
- contractSigned (true/false)
- fleetUnit info
- canConfirm (true/false)
```

### Download Contract
```
GET /api/contracts/download?reference=KJM-xxx

Returns:
- HTML with pre-filled data
- Signature image embedded
- All terms & conditions
- Ready to download/print
```

---

**Status**: ✅ Complete Implementation  
**Last Updated**: 2026-04-22  
**Fleet Unit Assignment**: ✅ Automatic  
**Contract Signing**: ✅ Mandatory  
**Real-Time Status**: ✅ Available  
**Contract Download**: ✅ Available  
