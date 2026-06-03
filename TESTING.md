# Testing Guide

## System Testing Checklist

This guide helps you verify that all core features of the AasaMedChem inventory system are working correctly.

### 1. Authentication & Role-Based Access

#### Test 1.1: Admin Login
```
1. Go to /login
2. Enter: admin@example.com / demo123
3. Verify: Redirects to /admin dashboard
4. Verify: NavBar shows "Administrator" role
5. Verify: Can access /admin and /admin/products
```

**Expected Result**: ✓ Should see admin dashboard

#### Test 1.2: Seller Login
```
1. Go to /login
2. Enter: seller@example.com / demo123
3. Verify: Redirects to /seller dashboard
4. Verify: NavBar shows "Seller" role
5. Verify: Can access /seller and /seller/products
```

**Expected Result**: ✓ Should see seller dashboard

#### Test 1.3: Access Control
```
1. Login as admin
2. Try to access /seller/products
3. Verify: Redirected to /admin
4. Repeat for seller trying /admin - should redirect to /seller
```

**Expected Result**: ✓ Redirects to correct role dashboard

---

### 2. Product Management (Admin Flow)

#### Test 2.1: Create Product - Weight Dimension
```
Admin → Products → Add New Product

Fill form:
- SKU: TEST-WEIGHT-001
- Name: Test Weight Product
- Category: Test Category
- Unit: Weight (g, kg)
- Base Quantity: 1000 (grams)
- Base Price: 50 (₹/gram)

Click "Create Product"
```

**Expected Result**: ✓ Product appears in list immediately
**Verify**: 
- SKU is TEST-WEIGHT-001
- Base Price shows as ₹50/g
- Available units: g, kg

#### Test 2.2: Create Product - Volume Dimension
```
Same process with:
- SKU: TEST-VOLUME-001
- Name: Test Volume Product
- Unit: Volume (mL, L)
- Base Quantity: 500 (mL)
- Base Price: 200 (₹/mL)
```

**Expected Result**: ✓ Product created
**Verify**: Available units: mL, L

#### Test 2.3: Create Product - Count Dimension
```
Same process with:
- SKU: TEST-COUNT-001
- Name: Test Count Product
- Unit: Count (items)
- Base Quantity: 100 (items)
- Base Price: 10 (₹/item)
```

**Expected Result**: ✓ Product created
**Verify**: Available units: item

---

### 3. Unit Conversion & Pricing (Seller Flow)

#### Test 3.1: Weight Unit Conversion
```
Login as seller → Browse Products → Select "TEST-WEIGHT-001"

1. Select product (checkbox)
2. Quantity: 2.5
3. Unit: kg

Expected Price Calculation:
- 2.5 kg = 2500 g (conversion)
- 2500 g × ₹50/g = ₹125,000
```

**Verify in UI**: Shows "₹125,000" as total

#### Test 3.2: Change Unit, Verify Recalculation
```
Still with TEST-WEIGHT-001, quantity 2.5

1. Change unit from kg to g
2. Quantity: 250 (grams)

Expected:
- 250 g × ₹50/g = ₹12,500
```

**Verify in UI**: Price updates to "₹12,500"

#### Test 3.3: Volume Unit Conversion
```
Select TEST-VOLUME-001 product

1. Quantity: 1
2. Unit: L

Expected:
- 1 L = 1000 mL
- 1000 mL × ₹200/mL = ₹200,000
```

**Verify**: Shows "₹200,000"

#### Test 3.4: Count Dimension
```
Select TEST-COUNT-001 product

1. Quantity: 50
2. Unit: item

Expected:
- 50 items × ₹10/item = ₹500
```

**Verify**: Shows "₹500"

---

### 4. Order Placement (Seller Flow)

#### Test 4.1: Place Single Item Order
```
1. Select TEST-WEIGHT-001
   - Quantity: 1
   - Unit: kg
   - Price: ₹50,000

2. Click "Place Order / Quotation"
3. System should create order with status "quotation"
```

**Verify**:
- Order number generated (ORD-xxxxx)
- Status shows as "quotation"
- Total price is ₹50,000

#### Test 4.2: Place Multi-Item Order
```
1. Select TEST-WEIGHT-001
   - Quantity: 0.5
   - Unit: kg
   - Price: ₹25,000

2. Also select TEST-VOLUME-001
   - Quantity: 2
   - Unit: L
   - Price: ₹400,000

3. Total should show: ₹425,000
4. Place order with notes: "Urgent delivery needed"
```

**Verify**:
- Both items in order
- Total = ₹425,000
- Notes saved
- Can see in My Orders page

---

### 5. Admin Order Management

#### Test 5.1: View All Orders
```
Admin → Orders → Check filters

1. View all orders placed by sellers
2. Verify counts match in filter buttons
3. Click on an order to see details
```

**Expected Result**: ✓ All seller orders visible

#### Test 5.2: Confirm Order
```
1. Select a quotation (status: "quotation")
2. Click "Confirm Order"
3. Verify status changes to "confirmed"
```

**Expected Result**: ✓ Status updates in UI and backend

#### Test 5.3: Reject Order
```
1. Select another quotation
2. Click "Reject"
3. Verify status changes to "rejected"
```

**Expected Result**: ✓ Status updates

#### Test 5.4: Complete Order
```
1. Select a confirmed order
2. Click "Mark as Completed"
3. Verify status changes to "completed"
```

**Expected Result**: ✓ Status updates

---

### 6. Unit Conversion Accuracy

#### Test 6.1: Verify Price in Order (Admin View)
```
Order placed: 2.5 kg of ₹50/g product

In admin orders view:
- Quantity shown: 2.5 kg
- Unit: kg
- Price per unit: ₹50,000/kg (2.5kg conversion)
- Total: ₹125,000

Verify conversion is correct:
2.5 kg × 1000 = 2500 g
2500 g × ₹50/g = ₹125,000 ✓
```

#### Test 6.2: Mixed Units Order Calculation
```
Order with:
- Item 1: 0.5 L @ ₹300/mL = 500 mL × ₹300 = ₹150,000
- Item 2: 10 items @ ₹25/item = ₹250

Total should: ₹150,250

Verify all calculations in order details
```

---

### 7. Data Precision

#### Test 7.1: Fractional Quantities
```
Product: ₹50/g
Order: 1.5678 kg

Expected: 1.5678 × 1000 = 1567.8 g
Price: 1567.8 × 50 = ₹78,390

Verify decimal precision is maintained
```

#### Test 7.2: INR Formatting
```
All prices should display as:
- ₹1,00,000 (Indian numbering)
- ₹25,000.50 (with paisa)
- ₹500 (small amounts)
```

---

### 8. Search & Filter

#### Test 8.1: Product Search
```
Seller → Products

1. Search: "test"
2. Verify: Shows TEST-WEIGHT-001, TEST-VOLUME-001, TEST-COUNT-001

3. Search: "WEIGHT"
4. Verify: Only shows TEST-WEIGHT-001

5. Search: "NonExistent"
6. Verify: No results shown
```

#### Test 8.2: Category Filter
```
1. Filter by "Test Category"
2. Verify: Shows products in that category

3. Change filter to different category
4. Verify: Shows different products
```

---

### 9. Navigation & Session Management

#### Test 9.1: Navigation Links
```
Admin:
- Logo → /admin ✓
- Dashboard → /admin ✓
- Products → /admin/products ✓
- Orders → /admin/orders ✓

Seller:
- Logo → /seller ✓
- Dashboard → /seller ✓
- Products → /seller/products ✓
- My Orders → /seller/orders ✓
```

#### Test 9.2: Logout
```
1. Click user menu (👤)
2. Click "Sign Out"
3. Verify: Redirected to /login
4. Try accessing /admin → redirected to /login
```

---

### 10. Error Handling

#### Test 10.1: Invalid Inputs
```
Create product with missing fields:
1. Leave SKU empty → Should show error
2. Leave price empty → Should show error
3. Invalid unit type → Should show error
```

#### Test 10.2: Duplicate SKU
```
1. Try to create two products with same SKU
2. Verify: Should show error about duplicate SKU
```

#### Test 10.3: Missing Product
```
Try to access: /api/products/invalid-id
Verify: Returns 404 error
```

---

## Performance Checks

### Load Time
- Page load: < 2s
- API response: < 500ms
- Product search: < 200ms

### Data Accuracy
- All unit conversions accurate ✓
- All prices calculated correctly ✓
- No data loss on page refresh ✓
- Database persists data correctly ✓

---

## Regression Test Suite

Before deploying, verify:

1. ✓ All authentication flows work
2. ✓ All CRUD operations work for products and orders
3. ✓ Unit conversions are accurate
4. ✓ Prices calculate correctly
5. ✓ Role-based access control works
6. ✓ Navigation is functional
7. ✓ Search and filter work
8. ✓ Error handling is graceful
9. ✓ Database is persisting data
10. ✓ API endpoints return correct data

---

## Test Data Reference

**Products Created**:
```
1. TEST-WEIGHT-001
   - Category: Test Category
   - Base: 1000g @ ₹50/g
   - Available Units: g, kg

2. TEST-VOLUME-001
   - Category: Test Category
   - Base: 500mL @ ₹200/mL
   - Available Units: mL, L

3. TEST-COUNT-001
   - Category: Test Category
   - Base: 100 items @ ₹10/item
   - Available Units: item
```

**Test Users**:
```
Admin: admin@example.com / demo123
Seller: seller@example.com / demo123
```

---

**Last Updated**: June 2024
**System Version**: 1.0.0
