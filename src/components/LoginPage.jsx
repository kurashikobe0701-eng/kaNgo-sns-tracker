import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('ログインに失敗しました: ' + err.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('アカウント作成に失敗しました: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', fontFamily: 'Noto Sans JP' }}>
      <h2 style={{ marginBottom: '20px' }}>SNSトラッカー</h2>
      <form onSubmit={isSignUp ? handleSignUp : handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>メール:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        {error && <div style={{ color: '#B91C1C', marginBottom: '10px', fontSize: '12px' }}>{error}</div>}
        <button style={{ width: '100%', padding: '10px', background: '#1A1816', color: 'white', cursor: 'pointer', borderRadius: '4px', border: 'none' }}>
          {isSignUp ? 'アカウント作成' : 'ログイン'}
        </button>
      </form>
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px' }}>
        {isSignUp ? 'アカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
        <button
          type="button"
          onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
          style={{ background: 'none', border: 'none', color: '#1D7A5F', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignUp ? 'ログイン' : '登録'}
        </button>
      </p>
    </div>
  );
}
