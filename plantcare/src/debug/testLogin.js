// Debug script untuk test login
const testLogin = async () => {
  try {
    console.log('Testing direct fetch to login endpoint...');
    
    const response = await fetch('http://localhost:6543/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        username: 'admin',
        password: 'sainsdata'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    return data;
  } catch (error) {
    console.error('Test login error:', error);
    throw error;
  }
};

// Export untuk digunakan di console browser
window.testLogin = testLogin;

export default testLogin;
