export default function Home() {
  return (
    <div style={{ maxWidth: 500, margin: '100px auto', textAlign: 'center' }}>
      <h1>ESL Tutor POC</h1>
      <p>Home page is working.</p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
        <a href="/signup">Go to signup</a>
        <a href="/login">Go to login</a>
      </div>
    </div>
  )
} 

