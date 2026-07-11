"use client";

import { useMemo, useState } from "react";

const destinations = [
  { id: "dali", city: "大理", title: "风与洱海", tag: "洱海日落", type: "浪漫漫游", meta: "慢旅行 · 4天3夜", price: "¥ 2,800 起", note: "住进苍山脚下，把日落和晚风留给彼此。" },
  { id: "kyoto", city: "京都", title: "秋日散步", tag: "红叶季", type: "城市散步", meta: "人文 · 5天4夜", price: "¥ 6,900 起", note: "沿鸭川散步，在古寺与町屋间慢慢相遇。" },
  { id: "iceland", city: "冰岛", title: "追极光", tag: "极光季", type: "自然旷野", meta: "公路 · 8天7夜", price: "¥ 16,800 起", note: "穿过黑沙滩与冰川，等待只属于两人的极光。" },
  { id: "chiangmai", city: "清迈", title: "古城慢日", tag: "轻松周末", type: "城市散步", meta: "松弛 · 4天3夜", price: "¥ 3,600 起", note: "咖啡馆、夜市和山间清晨，刚好不赶时间。" },
  { id: "amami", city: "奄美大岛", title: "蓝色秘境", tag: "人少景美", type: "自然旷野", meta: "海岛 · 6天5夜", price: "¥ 8,900 起", note: "划进红树林，在安静海湾收藏一整片蓝。" },
  { id: "lisbon", city: "里斯本", title: "海风电车", tag: "复古浪漫", type: "浪漫漫游", meta: "漫游 · 6天5夜", price: "¥ 9,800 起", note: "搭黄色电车穿过旧城，把黄昏留给观景台。" },
];

const filters = ["全部灵感", "浪漫漫游", "自然旷野", "城市散步"];
const preferences = ["海边日落", "小众秘境", "不赶早", "在地美食", "人文散步", "自然旷野"];

export default function Home() {
  const [filter, setFilter] = useState("全部灵感");
  const [saved, setSaved] = useState<string[]>(["dali"]);
  const [prefs, setPrefs] = useState<string[]>(["海边日落", "不赶早"]);
  const [planOpen, setPlanOpen] = useState(false);
  const [planReady, setPlanReady] = useState(false);

  const visible = useMemo(() => filter === "全部灵感" ? destinations : destinations.filter((item) => item.type === filter), [filter]);
  const toggleSaved = (id: string) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const togglePref = (pref: string) => setPrefs((items) => items.includes(pref) ? items.filter((item) => item !== pref) : [...items, pref]);

  return (
    <main>
      <nav className="nav" aria-label="主导航">
        <a className="logo" href="#top" aria-label="去野首页">去野<span /></a>
        <div className="navLinks">
          <a className="active" href="#discover">灵感目的地</a>
          <button onClick={() => setPlanOpen(true)}>智能行程</button>
          <a href="#discover">我的收藏</a>
        </div>
        <a className="savedPill" href="#discover"><b>♥</b> 已收藏 {saved.length}</a>
      </nav>

      <section className="hero" id="top">
        <div className="heroCopy">
          <p className="eyebrow">DESTINATION JOURNAL · 2026</p>
          <h1>下一站，<br />和喜欢的人一起出发</h1>
          <p className="lede">避开千篇一律的路线，从海风、老街和日落里，找到只属于你们的旅行章节。</p>
          <div className="heroActions">
            <button className="primary" onClick={() => setPlanOpen(true)}>生成我的行程 <span>→</span></button>
            <a className="textLink" href="#discover">看看本周灵感</a>
          </div>
          <div className="heroMeta"><span>01</span><i /> <span>06</span><small>本周精选目的地</small></div>
        </div>
        <div className="heroVisual" role="img" aria-label="大理洱海日出与山景">
          <div className="sun" /><div className="mountain mountainBack" /><div className="mountain mountainFront" /><div className="lake" />
          <p>洱海 · 07:20</p>
          <div className="stamp"><small>EDITOR&apos;S PICK</small><strong>大理</strong><span>风与洱海</span></div>
        </div>
      </section>

      <section className="discover" id="discover">
        <div className="sectionHeader">
          <div><p className="kicker">WEEKLY INSPIRATION</p><h2>此刻，适合两个人出发</h2><span>根据季节、氛围与旅行节奏，为你精选</span></div>
          <div className="filters" aria-label="筛选目的地">
            {filters.map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>

        <div className="destinationGrid">
          {visible.map((item, index) => (
            <article className={`destinationCard ${index === 0 ? "featured" : ""}`} key={item.id}>
              <div className={`destinationImage ${item.id}`}>
                <span className="tag">{item.tag}</span>
                <button className={`heart ${saved.includes(item.id) ? "isSaved" : ""}`} onClick={() => toggleSaved(item.id)} aria-label={`${saved.includes(item.id) ? "取消收藏" : "收藏"}${item.city}`}>{saved.includes(item.id) ? "♥" : "♡"}</button>
                <span className="cardIndex">0{index + 1}</span>
              </div>
              <div className="cardBody">
                <div><h3>{item.city} · {item.title}</h3><p>{item.note}</p></div>
                <div className="cardMeta"><span>{item.meta}</span><strong>{item.price}</strong></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="plannerBanner">
        <div><p>AI TRIP MAKER</p><h2>你们喜欢怎样的旅行？</h2><span>选几个关键词，30 秒生成专属双人路线。</span></div>
        <div className="preferenceRow">
          {preferences.slice(0, 4).map((pref) => <button key={pref} className={prefs.includes(pref) ? "selected" : ""} onClick={() => togglePref(pref)}>{pref}</button>)}
        </div>
        <button className="bannerAction" onClick={() => setPlanOpen(true)}>生成我的行程 <span>→</span></button>
      </section>

      <footer><a className="logo" href="#top">去野<span /></a><p>把想去的地方，变成一起走过的路。</p><small>© 2026 GO WILD TRAVEL JOURNAL</small></footer>

      {planOpen && <div className="modalBackdrop" role="presentation" onMouseDown={() => setPlanOpen(false)}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="planner-title" onMouseDown={(e) => e.stopPropagation()}>
          <button className="close" onClick={() => setPlanOpen(false)} aria-label="关闭">×</button>
          {!planReady ? <>
            <p className="kicker">YOUR PRIVATE ROUTE</p><h2 id="planner-title">为两个人，写一条刚刚好的路线</h2><span className="modalIntro">选出此刻最想要的旅行感觉，我们会把节奏、风景和约会时刻排进同一段旅程。</span>
            <div className="modalPrefs">{preferences.map((pref) => <button key={pref} className={prefs.includes(pref) ? "selected" : ""} onClick={() => togglePref(pref)}>{prefs.includes(pref) ? "✓ " : "+ "}{pref}</button>)}</div>
            <label>想去几天？<select defaultValue="5"><option value="3">3 天 2 夜</option><option value="5">5 天 4 夜</option><option value="7">7 天 6 夜</option></select></label>
            <button className="primary full" disabled={!prefs.length} onClick={() => setPlanReady(true)}>生成专属路线 →</button>
          </> : <div className="result"><div className="resultMark">✓</div><p className="kicker">ROUTE READY</p><h2>大理 · 5 天 4 夜慢旅行</h2><p>洱海日落、苍山轻徒步、喜洲古镇与四顿在地小馆，已经按“不赶早”的节奏排好了。</p><ol><li><b>Day 1</b> 入住古城 · 黄昏散步</li><li><b>Day 2</b> 洱海骑行 · 海边日落</li><li><b>Day 3</b> 喜洲慢游 · 在地美食</li></ol><button className="primary full" onClick={() => { setPlanOpen(false); setPlanReady(false); }}>收藏这条路线 ♥</button></div>}
        </section>
      </div>}
    </main>
  );
}
