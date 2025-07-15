async function testAPI() {
  try {
    console.log('🧪 Test de l\'API /api/blog/articles...');
    
    const response = await fetch('http://localhost:3002/api/blog/articles', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Succès:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erreur:', errorText);
    }
  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

testAPI(); 