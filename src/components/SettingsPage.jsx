import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

const DEFAULT_CONFIG = {
  accounts: [
    { id: 'account1', name: '日高 個人アカウント' },
    { id: 'account2', name: 'クラシ訪問看護 アカウント' },
  ],
  snsTypes: [
    { id: 'ig', name: 'Instagram', label: 'フォロワー数' },
    { id: 'yt', name: 'YouTube', label: 'フォロワー数' },
    { id: 'line', name: '公式LINE', label: '友達数' },
  ],
};

export default function SettingsPage({ accounts, snsTypes }) {
  const [editAccounts, setEditAccounts] = useState(accounts.length > 0 ? accounts : DEFAULT_CONFIG.accounts);
  const [editSnsTypes, setEditSnsTypes] = useState(snsTypes.length > 0 ? snsTypes : DEFAULT_CONFIG.snsTypes);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await setDoc(doc(db, 'config', 'master'), {
        accounts: editAccounts,
        snsTypes: editSnsTypes,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const addAccount = () => {
    const newId = 'account' + (Math.max(...editAccounts.map(a => parseInt(a.id.replace('account', '')) || 0)) + 1);
    setEditAccounts([...editAccounts, { id: newId, name: '新しいアカウント' }]);
  };

  const deleteAccount = (index) => {
    setEditAccounts(editAccounts.filter((_, i) => i !== index));
  };

  const updateAccount = (index, key, value) => {
    const newAccounts = [...editAccounts];
    newAccounts[index] = { ...newAccounts[index], [key]: value };
    setEditAccounts(newAccounts);
  };

  const addSnsType = () => {
    const newId = 'sns' + Date.now();
    setEditSnsTypes([...editSnsTypes, { id: newId, name: '新しいSNS', label: 'フォロワー数' }]);
  };

  const deleteSnsType = (index) => {
    setEditSnsTypes(editSnsTypes.filter((_, i) => i !== index));
  };

  const updateSnsType = (index, key, value) => {
    const newSnsTypes = [...editSnsTypes];
    newSnsTypes[index] = { ...newSnsTypes[index], [key]: value };
    setEditSnsTypes(newSnsTypes);
  };

  return (
    <div>
      <div className="card">
        <h2>アカウント管理</h2>
        {saved && (
          <div style={{ background: '#E8F5F1', color: '#1D7A5F', padding: '12px', borderRadius: '8px', marginBottom: '1rem' }}>
            ✓ 保存しました
          </div>
        )}
        {editAccounts.map((acc, idx) => (
          <div key={acc.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={acc.name}
              onChange={(e) => updateAccount(idx, 'name', e.target.value)}
              style={{ flex: 1 }}
            />
            <button className="action-btn" onClick={() => deleteAccount(idx)} style={{ color: '#B91C1C' }}>
              削除
            </button>
          </div>
        ))}
        <button className="secondary btn-single" onClick={addAccount} style={{ marginTop: '8px' }}>
          + アカウント追加
        </button>
      </div>

      <div className="card">
        <h2>SNSタイプ管理</h2>
        {editSnsTypes.map((sns, idx) => (
          <div key={sns.id} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #E5E1DB' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div className="input-group">
                <label>SNS名</label>
                <input
                  type="text"
                  value={sns.name}
                  onChange={(e) => updateSnsType(idx, 'name', e.target.value)}
                />
              </div>
              <div className="input-group">
                <label>ラベル</label>
                <input
                  type="text"
                  value={sns.label}
                  onChange={(e) => updateSnsType(idx, 'label', e.target.value)}
                />
              </div>
            </div>
            <button className="action-btn" onClick={() => deleteSnsType(idx)} style={{ color: '#B91C1C', width: '100%' }}>
              このSNSを削除
            </button>
          </div>
        ))}
        <button className="secondary btn-single" onClick={addSnsType}>
          + SNSタイプ追加
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button onClick={handleSave}>保存</button>
      </div>
    </div>
  );
}
