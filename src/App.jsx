import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import LoginPage from './components/LoginPage';
import SNSTrackerPage from './components/SNSTrackerPage';
import SettingsPage from './components/SettingsPage';
import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracker');
  const [accounts, setAccounts] = useState([]);
  const [snsTypes, setSnsTypes] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const configDocRef = doc(db, 'config', 'master');
        const unsubscribeConfig = onSnapshot(configDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAccounts(data.accounts || []);
            setSnsTypes(data.snsTypes || []);
          }
        });

        return () => unsubscribeConfig();
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'Noto Sans JP' }}>読み込み中...</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>SNSフォロワー推移トラッカー</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6B6560' }}>{user.email}</span>
          <button onClick={handleLogout} className="logout-btn">ログアウト</button>
        </div>
      </header>

      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          トラッカー
        </button>
        <button
          className={`main-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'tracker' && <SNSTrackerPage accounts={accounts} snsTypes={snsTypes} />}
        {activeTab === 'settings' && <SettingsPage accounts={accounts} snsTypes={snsTypes} />}
      </div>
    </div>
  );
}
