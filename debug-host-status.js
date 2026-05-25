// Debug script to check host status
// Run this in your browser console on the settings page

async function debugHostStatus() {
  const user = firebase.auth().currentUser;
  if (!user) {
    console.log("❌ No user logged in");
    return;
  }

  console.log("🔍 Checking host status for user:", user.uid);
  
  // Check user document
  const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
  const userData = userDoc.data();
  
  console.log("\n📄 User Document:");
  console.log("  - isHost:", userData?.isHost);
  console.log("  - pricePerMinute:", userData?.pricePerMinute);
  console.log("  - promoCardDismissed:", userData?.promoCardDismissed);
  console.log("  - promoCardDismissedAt:", userData?.promoCardDismissedAt);
  
  // Check host application
  const hostAppDoc = await firebase.firestore().collection('hostApplications').doc(user.uid).get();
  const hostAppData = hostAppDoc.data();
  
  console.log("\n📋 Host Application:");
  if (hostAppData) {
    console.log("  - status:", hostAppData.status);
    console.log("  - pricePerMinute:", hostAppData.pricePerMinute);
    console.log("  - appliedAt:", hostAppData.appliedAt?.toDate());
  } else {
    console.log("  - No application found");
  }
  
  // Determine what should show
  console.log("\n✅ What should display:");
  
  if (userData?.isHost === true) {
    console.log("  → Nothing (user is already an approved host)");
  } else if (hostAppData && hostAppData.status === 'pending') {
    console.log("  → Status Card (pending application)");
  } else if (hostAppData && hostAppData.status === 'approved') {
    console.log("  → Nothing (approved but user doc not updated - this is a bug!)");
  } else if (userData?.promoCardDismissed === true) {
    console.log("  → Nothing (promo card was dismissed)");
  } else {
    console.log("  → Promo Card (eligible to apply)");
  }
}

debugHostStatus();
