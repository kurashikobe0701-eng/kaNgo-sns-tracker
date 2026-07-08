import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function SNSTrackerPage({ accounts, snsTypes }) {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0]?.id || '');
  const [activeTab, setActiveTab] = useState(null);
  const [formData, setFormData] = useState({});
  const [updateTime, setUpdateTime] = useState('');

  useEffect(() => {
    if (data.length === 0 || !data[data.length - 1].savedAt) return;
    const lastSaved = new Date(data[data.length - 1].savedAt);
    setUpdateTime(lastSaved.getFullYear() + '/' + (lastSaved.getMonth() + 1) + '/' + lastSaved.getDate() + ' 更新');
  }, [data]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'sns_data'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setData(items.sort((a, b) => new Date(a.key) - new Date(b.key)));
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0].id);
      setActiveTab(accounts[0].id + '_' + (snsTypes[0]?.id || 0));
    }
  }, [accounts, snsTypes]);

  const handleSave = async () => {
    const key = year + '-' + String(month).padStart(2, '0');
    const existing = data.find((d) => d.key === key && d.accountId === selectedAccount);
    try {
      if (existing) {
        await updateDoc(doc(db, 'sns_data', existing.id), { ...formData, savedAt: new Date().toISOString() });
      } else {
        await addDoc(collection(db, 'sns_data'), {
          key,
          accountId: selectedAccount,
          year,
          month,
          ...formData,
          savedAt: new Date().toISOString(),
        });
      }
      setFormData({});
      alert(year + '年' + month + '月のデータを保存しました！');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('このデータを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'sns_data', id));
    } catch (e) {
      console.error(e);
    }
  };

  const getLatestSummary = () => {
    const accountData = data.filter((d) => d.accountId === selectedAccount);
    if (accountData.length === 0) return null;
    const latest = accountData[accountData.length - 1];
    const prev = accountData.length >= 2 ? accountData[accountData.length - 2] : null;
    return { latest, prev };
  };

  const fmt = (n) => (n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toLocaleString());

  const summary = getLatestSummary();

  return (
    <div>
      <div className="card">
        <h2>データ入力</h2>
        <div className="input-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
          <div className="input-group">
            <label>年</label>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value))} min="2024" max="2030" />
          </div>
          <div className="input-group">
            <label>月</label>
            <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}月</option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <label>アカウント</label>
            <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>
        <hr className="divider" />
        <div className="input-grid">
          {snsTypes.map((sns) => (
            <div key={sns.id} className="input-group">
              <span className="channel-badge">{sns.name}</span>
              <label>{sns.label || 'フォロワー数'}</label>
              <input
                type="number"
                value={formData[sns.id] || ''}
                onChange={(e) => setFormData({ ...formData, [sns.id]: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          ))}
        </div>
        <hr className="divider" />
        <div className="btn-row">
          <button onClick={handleSave}>保存</button>
          <button className="secondary" onClick={() => { setFormData({}); setUpdateTime(''); }}>リセット</button>
        </div>
      </div>

      {summary && (
        <div className="card">
          <h2>サマリー ({summary.latest.year}年{summary.latest.month}月)</h2>
          <div className="metrics-grid">
            {snsTypes.map((sns) => {
              const val = summary.latest[sns.id] || 0;
              const prevVal = summary.prev ? (summary.prev[sns.id] || 0) : null;
              const diff = prevVal !== null ? val - prevVal : null;
              const diffStr = diff !== null ? (diff >= 0 ? '+' + diff.toLocaleString() : diff.toLocaleString()) : '—';
              const diffCls = diff === null ? '' : diff >= 0 ? 'green' : 'red';
              return (
                <div key={sns.id} className="metric">
                  <div className="metric-label">{sns.name}</div>
                  <div className="metric-value">{fmt(val)}</div>
                  <div className={`metric-sub ${diffCls}`}>前月比 {diffStr}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data.filter((d) => d.accountId === selectedAccount).length > 0 && (
        <div className="card">
          <h2>推移グラフ</h2>
          <div className="tabs">
            {snsTypes.map((sns) => (
              <div
                key={sns.id}
                className={`tab ${activeTab === selectedAccount + '_' + sns.id ? 'active' : ''}`}
                onClick={() => setActiveTab(selectedAccount + '_' + sns.id)}
              >
                {sns.name}
              </div>
            ))}
          </div>
          {activeTab && (
            <div className="chart-wrap">
              <Line
                data={{
                  labels: data
                    .filter((d) => d.accountId === selectedAccount)
                    .map((d) => d.year + '/' + d.month + '月'),
                  datasets: [
                    {
                      label: snsTypes.find((s) => s.id === activeTab.split('_')[1])?.name,
                      data: data
                        .filter((d) => d.accountId === selectedAccount)
                        .map((d) => d[activeTab.split('_')[1]] || 0),
                      borderColor: '#1D7A5F',
                      backgroundColor: '#1D7A5F18',
                      borderWidth: 2.5,
                      tension: 0.35,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }}
              />
            </div>
          )}
        </div>
      )}

      <div className="card">
        <h2>月次データ一覧</h2>
        {data.filter((d) => d.accountId === selectedAccount).length === 0 ? (
          <div className="empty-state">データがありません</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>月</th>
                  {snsTypes.map((sns) => (
                    <th key={sns.id}>{sns.name}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data
                  .filter((d) => d.accountId === selectedAccount)
                  .reverse()
                  .map((d) => (
                    <tr key={d.id}>
                      <td>{d.year}年{d.month}月</td>
                      {snsTypes.map((sns) => (
                        <td key={sns.id}>{(d[sns.id] || 0).toLocaleString()}</td>
                      ))}
                      <td>
                        <button className="action-btn" onClick={() => handleDelete(d.id)}>
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', color: '#6B6560', marginTop: '2rem' }}>
        最終更新: {updateTime || '未更新'}
      </div>
    </div>
  );
}
