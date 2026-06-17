export default function Header({ lang, setLang }) {
  return (
    <div style={{ backgroundColor: '#FFD700', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Такси БАЦ 🚕</h1>
      <select 
        value={lang} 
        onChange={(e) => setLang(e.target.value)}
        style={{ border: 'none', background: 'transparent', fontWeight: 600, fontSize: 14 }}
      >
        <option value="ru">RU</option>
        <option value="kk">KZ</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
