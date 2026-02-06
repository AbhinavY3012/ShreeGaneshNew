# Firestore Security Rules Setup

## ⚠️ Important: Set Up Firestore Rules

The 400 error you're seeing is likely because Firestore security rules need to be configured.

## 🔧 How to Fix:

### Option 1: Development Mode (Quick Fix)
For testing purposes, set your Firestore rules to allow all reads/writes:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `food-suppliers-cd833`
3. Click on **Firestore Database** in the left menu
4. Click on the **Rules** tab
5. Replace the rules with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**

⚠️ **WARNING**: This allows anyone to read/write your data. Only use for development!

---

### Option 2: Production Mode (Secure)
For production, use these rules that require authentication:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Purchases collection
    match /purchases/{purchaseId} {
      allow read, write: if request.auth != null;
    }
    
    // Sales collection
    match /sales/{saleId} {
      allow read, write: if request.auth != null;
    }
    
    // Expenses collection
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note**: This requires users to be authenticated. You'll need to implement Firebase Authentication.

---

## 🎯 Recommended Steps:

1. **For now**: Use Option 1 (Development Mode) to test the app
2. **Later**: Implement Firebase Authentication and use Option 2 (Production Mode)

---

## 📊 Firestore Collections Being Used:

- `purchases` - Stores all purchase records
- `sales` - Stores all sales records
- `expenses` - Stores all expense records

---

## ✅ After Setting Rules:

1. Refresh your app
2. Try adding a purchase/sale/expense
3. The data should now save successfully! 🎉
