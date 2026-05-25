import admin from 'firebase-admin';

// Initialize Firebase Admin with project ID
// Note: For production, you'd use a service account JSON file
admin.initializeApp({
  projectId: 'lirld-5cabf',
});

const db = admin.firestore();

async function queryUsers() {
  try {
    console.log('Querying users collection...\n');
    
    const usersRef = db.collection('users');
    const snapshot = await usersRef.get();
    
    if (snapshot.empty) {
      console.log('❌ Users collection exists but is empty (no documents found)');
      return;
    }
    
    console.log(`✅ Found ${snapshot.size} document(s) in users collection:\n`);
    
    snapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}`);
      console.log('Data:', JSON.stringify(doc.data(), null, 2));
      console.log('---');
    });
    
  } catch (error) {
    if (error.code === 5) {
      console.log('❌ Users collection does not exist or is not accessible');
      console.log('Error:', error.message);
    } else {
      console.error('Error querying users:', error);
    }
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

queryUsers();



