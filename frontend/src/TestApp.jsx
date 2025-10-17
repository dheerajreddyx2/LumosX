// Simple test component to verify React is working
// Use this to test if the issue is with the new code or React itself

function TestApp() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ color: '#6366f1' }}>✅ React is Working!</h1>
      <p>If you see this, React is rendering correctly.</p>
      <p>The issue is likely with the new code or missing dependencies.</p>
      
      <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '600px', margin: '30px auto' }}>
        <h2>Next Steps:</h2>
        <ol>
          <li>Check browser console for errors (Press F12)</li>
          <li>Make sure backend is running on port 5000</li>
          <li>Verify MongoDB is connected</li>
          <li>Run: <code>npm install</code> in frontend folder</li>
        </ol>
      </div>
    </div>
  );
}

export default TestApp;

