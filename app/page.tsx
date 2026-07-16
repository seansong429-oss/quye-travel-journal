"use client";
/* Remote travel photography uses native responsive images with explicit lazy loading. */
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type View = "discover" | "planner" | "favorites";
type FavoriteTab = "destination" | "route" | "trip";
type Destination = { id: string; city: string; country: string; title: string; summary: string; days: string; tags: string[]; image: string; season: string };

const destinations: Destination[] = [
  { id: "dali", city: "大理", country: "中国 · 云南", title: "风与洱海的慢旅", summary: "沿着洱海骑行，在喜洲古镇和苍山脚下，把日子过得再慢一点。", days: "4—5 天", tags: ["自然", "美食", "松弛"], season: "全年适合", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1200&q=82" },
  { id: "kyoto", city: "京都", country: "日本 · 关西", title: "古寺与秋日散步", summary: "清晨走进安静的古寺，午后沿鸭川散步，收藏一城温柔秋色。", days: "5—6 天", tags: ["人文", "美食", "城市"], season: "10—11 月", image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=82" },
  { id: "iceland", city: "冰岛", country: "冰岛 · 南岸", title: "追一场北境极光", summary: "穿过瀑布、黑沙滩与冰川，在漫长夜色里等待极光点亮天空。", days: "8—10 天", tags: ["自然", "自驾", "摄影"], season: "9—3 月", image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=82" },
  { id: "chiangmai", city: "清迈", country: "泰国 · 北部", title: "古城里的松弛周末", summary: "从山间清晨到周末夜市，用咖啡、寺庙和小巷填满轻松假期。", days: "4—5 天", tags: ["美食", "亲子", "慢游"], season: "11—2 月", image: "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=82" },
  { id: "amami", city: "奄美大岛", country: "日本 · 鹿儿岛", title: "住进蓝色秘境", summary: "划进红树林，在安静海湾看一整片蓝，避开拥挤的人潮。", days: "5—6 天", tags: ["海岛", "小众", "自然"], season: "4—10 月", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=82" },
  { id: "lisbon", city: "里斯本", country: "葡萄牙", title: "海风与黄色电车", summary: "搭老电车穿过起伏旧城，在瓷砖墙和观景台之间等待黄昏。", days: "6—7 天", tags: ["城市", "美食", "浪漫"], season: "4—6 月", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=82" },
];

const routes = [
  { id: "r-yunnan", title: "滇西北山海环线", places: "大理 → 沙溪 → 丽江", days: "7 天 6 夜", type: "自驾 · 人文", tone: "terracotta" },
  { id: "r-kansai", title: "关西古都慢游", places: "大阪 → 京都 → 奈良", days: "6 天 5 夜", type: "铁路 · 美食", tone: "olive" },
  { id: "r-portugal", title: "葡萄牙沿海之路", places: "里斯本 → 辛特拉 → 波尔图", days: "8 天 7 夜", type: "铁路 · 城市", tone: "ocean" },
];
const seasons = [
  { label: "春日出发", title: "去山野看花开", copy: "林芝、伊犁与济州岛，正慢慢进入最柔软的季节。", accent: "01", className: "spring" },
  { label: "夏日避暑", title: "住进有风的地方", copy: "海边、草原和高原湖泊，适合把行程排得松一点。", accent: "02", className: "summer" },
  { label: "秋日预告", title: "追一城金色晚风", copy: "从京都到阿勒泰，提前收藏今年的限定风景。", accent: "03", className: "autumn" },
];
const navItems: { id: View; label: string; icon: string }[] = [
  { id: "discover", label: "灵感目的地", icon: "⌁" },
  { id: "planner", label: "智能行程", icon: "✦" },
  { id: "favorites", label: "我的收藏", icon: "♡" },
];

function HeartIcon({ filled = false }: { filled?: boolean }) { return <span aria-hidden="true">{filled ? "♥" : "♡"}</span>; }

function Header({ active, savedCount, onNavigate }: { active: View; savedCount: number; onNavigate: (view: View) => void }) {
  return <>
    <header className="siteHeader"><div className="navContainer">
      <button className="brand" onClick={() => onNavigate("discover")} aria-label="返回去野首页"><span className="brandMark">去野</span><span className="brandDot" /><span className="brandSub">TRAVEL JOURNAL</span></button>
      <nav className="desktopNav" aria-label="主导航">{navItems.map((item) => <button key={item.id} className={active === item.id ? "isActive" : ""} aria-current={active === item.id ? "page" : undefined} onClick={() => onNavigate(item.id)}>{item.label}</button>)}</nav>
      <button className="savedButton" onClick={() => onNavigate("favorites")} aria-label={`查看我的收藏，共 ${savedCount} 项`}><HeartIcon filled={savedCount > 0} /><span>我的收藏</span><b>{savedCount}</b></button>
    </div></header>
    <nav className="mobileNav" aria-label="移动端主导航">{navItems.map((item) => <button key={item.id} className={active === item.id ? "isActive" : ""} aria-current={active === item.id ? "page" : undefined} onClick={() => onNavigate(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
  </>;
}

function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy?: string; action?: React.ReactNode }) {
  return <div className="sectionHeading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{copy && <p className="sectionCopy">{copy}</p>}</div>{action}</div>;
}

function DestinationCard({ item, saved, onToggle, onOpen }: { item: Destination; saved: boolean; onToggle: () => void; onOpen: () => void }) {
  return <article className="destinationCard">
    <button className="cardOpen" onClick={onOpen} aria-label={`查看${item.city}旅行详情`}>
      <span className="cardImageWrap"><img src={item.image} alt={`${item.city}${item.title}旅行风景`} loading="lazy" decoding="async" /><span className="seasonBadge">{item.season}</span></span>
      <span className="cardContent"><span className="cardLocation">{item.country}</span><span className="cardTitleRow"><strong>{item.city}</strong><span>{item.days}</span></span><span className="cardSubtitle">{item.title}</span><span className="cardDescription">{item.summary}</span><span className="tagRow">{item.tags.map((tag) => <i key={tag}>{tag}</i>)}</span></span>
    </button>
    <button className={`heartButton ${saved ? "isSaved" : ""}`} onClick={onToggle} aria-label={`${saved ? "取消收藏" : "收藏"}${item.city}`}><HeartIcon filled={saved} /></button>
  </article>;
}

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return <div className="emptyState"><div className="emptyIllustration" aria-hidden="true">⌁</div><h3>这里还空着，正好装下下一段旅程</h3><p>收藏喜欢的目的地、路线或智能行程，之后可以随时回来继续计划。</p><button className="button primaryButton" onClick={onExplore}>去探索目的地</button></div>;
}

function DiscoverView({ saved, onToggleSaved, onPlan, onFavorites }: { saved: string[]; onToggleSaved: (id: string) => void; onPlan: (destination?: string) => void; onFavorites: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("全部");
  const [selected, setSelected] = useState<Destination | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const filters = ["全部", "自然", "美食", "亲子", "小众"];
  const visible = useMemo(() => destinations.filter((item) => (filter === "全部" || item.tags.includes(filter)) && (`${item.city}${item.country}${item.title}${item.tags.join("")}`).toLowerCase().includes(query.trim().toLowerCase())), [filter, query]);
  const handleSearch = (event: FormEvent) => { event.preventDefault(); resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); };

  return <>
    <section className="hero" aria-labelledby="hero-title">
      <img className="heroImage" src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=82" alt="山野湖畔的旅行风景" fetchPriority="high" decoding="async" /><div className="heroShade" />
      <div className="heroInner"><div className="heroCopy"><p className="heroKicker"><span />把世界，走成自己的故事</p><h1 id="hero-title">发现下一段<br />值得记录的旅程</h1><p>发现目的地、生成个性行程，也把每一次心动稳稳收藏。去哪里不必马上决定，先从一张风景开始。</p>
        <form className="searchBox" role="search" onSubmit={handleSearch}><label htmlFor="destination-search">搜索想去的地方</label><span aria-hidden="true">⌕</span><input id="destination-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索城市、国家或旅行主题" /><button type="submit">寻找灵感</button></form>
        <div className="heroActions"><button className="button primaryButton" onClick={() => onPlan(query || undefined)}>开始规划行程 <span>→</span></button><button className="button ghostButton" onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}>探索目的地</button></div>
      </div><aside className="heroNote" aria-label="本周旅行灵感"><span>本周灵感 · NO. 01</span><strong>去有风的地方</strong><p>大理洱海，4—5 天慢旅行</p></aside></div>
    </section>

    <main className="pageContent">
      <section className="contentSection" ref={resultsRef}><SectionHeading eyebrow="POPULAR DESTINATIONS" title="热门目的地" copy="从季节与旅行体验出发，挑一处刚好适合现在的地方。" action={<button className="textButton" onClick={() => setFilter("全部")}>查看全部 <span>→</span></button>} />
        <div className="filterBar" aria-label="目的地分类筛选">{filters.map((item) => <button className={filter === item ? "isActive" : ""} aria-pressed={filter === item} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div>
        {visible.length ? <div className="destinationGrid">{visible.map((item) => <DestinationCard key={item.id} item={item} saved={saved.includes(item.id)} onToggle={() => onToggleSaved(item.id)} onOpen={() => setSelected(item)} />)}</div> : <div className="noResults"><strong>没有找到相关目的地</strong><p>换个关键词或分类试试看。</p><button className="textButton" onClick={() => { setQuery(""); setFilter("全部"); }}>清除筛选</button></div>}
      </section>

      <section className="contentSection recommendationSection"><SectionHeading eyebrow="JUST FOR YOU" title="为你推荐" copy="根据你收藏的“自然、慢游与美食”，我们挑了这条不赶时间的路线。" />
        <div className="editorialCard"><img src={destinations[0].image} alt="大理洱海旅行路线推荐" loading="lazy" decoding="async" /><div className="editorialCopy"><p className="eyebrow">THIS WEEK&apos;S PICK</p><h3>大理 · 沙溪<br />一条有风的慢游线</h3><p>从洱海边的晨光出发，在沙溪古镇住两晚。7 天里只换两次酒店，把更多时间留给散步、吃饭和发呆。</p><div className="routeFacts"><span><b>7</b> 天</span><span><b>3</b> 座小城</span><span><b>12</b> 个灵感点</span></div><button className="button darkButton" onClick={() => onPlan("大理")}>用这条路线规划 <span>→</span></button></div></div>
      </section>

      <section className="contentSection"><SectionHeading eyebrow="TRAVEL BY SEASON" title="跟着季节去旅行" copy="每个季节都有一条最适合出发的理由。" />
        <div className="seasonGrid">{seasons.map((item) => <button key={item.title} className={`seasonCard ${item.className}`} onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })}><span>{item.accent}</span><p>{item.label}</p><strong>{item.title}</strong><small>{item.copy}</small><i>探索灵感 →</i></button>)}</div>
      </section>

      <section className="contentSection routeSection"><SectionHeading eyebrow="POPULAR ROUTES" title="热门旅行路线" copy="已经整理好节奏与停留顺序，适合直接拿来做计划。" />
        <div className="routeGrid">{routes.map((route, index) => <article className={`routeCard ${route.tone}`} key={route.id}><div className="routeNumber">0{index + 1}</div><p>{route.type}</p><h3>{route.title}</h3><span>{route.places}</span><footer><b>{route.days}</b><button onClick={() => onPlan(route.places.split(" → ")[0])}>查看路线 →</button></footer></article>)}</div>
      </section>

      <section className="contentSection recentSection"><SectionHeading eyebrow="RECENTLY SAVED" title="最近收藏" copy="把心动留住，等合适的时候再出发。" action={saved.length ? <button className="textButton" onClick={onFavorites}>管理收藏 <span>→</span></button> : null} />
        {saved.length ? <div className="recentRow">{destinations.filter((item) => saved.includes(item.id)).slice(0, 3).map((item) => <DestinationCard key={item.id} item={item} saved onToggle={() => onToggleSaved(item.id)} onOpen={() => setSelected(item)} />)}</div> : <EmptyState onExplore={() => resultsRef.current?.scrollIntoView({ behavior: "smooth" })} />}
      </section>
      <section className="plannerCta"><div><p className="eyebrow">SMART TRIP PLANNER</p><h2>告诉我们想怎样旅行，<br />剩下的交给行程助手。</h2><span>从目的地、日期到兴趣偏好，分 4 步生成一份每天都清楚的旅行计划。</span></div><button className="button lightButton" onClick={() => onPlan()}>免费生成行程 <span>→</span></button></section>
    </main>

    {selected && <div className="dialogBackdrop" onMouseDown={() => setSelected(null)}><section className="detailDialog" role="dialog" aria-modal="true" aria-labelledby="destination-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialogClose" onClick={() => setSelected(null)} aria-label="关闭目的地详情">×</button><img src={selected.image} alt={`${selected.city}旅行风景`} /><div className="detailCopy"><p>{selected.country} · {selected.season}</p><h2 id="destination-title">{selected.city}，{selected.title}</h2><span>{selected.summary}</span><div className="tagRow">{selected.tags.map((tag) => <i key={tag}>{tag}</i>)}</div><div className="detailActions"><button className={`button ${saved.includes(selected.id) ? "softButton" : "ghostDarkButton"}`} onClick={() => onToggleSaved(selected.id)}><HeartIcon filled={saved.includes(selected.id)} /> {saved.includes(selected.id) ? "已收藏" : "收藏目的地"}</button><button className="button primaryButton" onClick={() => { setSelected(null); onPlan(selected.city); }}>规划 {selected.days} 行程</button></div></div></section></div>}
  </>;
}

type PlannerData = { destination: string; date: string; days: string; people: string; budget: string; interests: string[]; transport: string };

function PlannerView({ initialDestination, onSaved }: { initialDestination: string; onSaved: () => void }) {
  const [step, setStep] = useState(1), [loading, setLoading] = useState(false), [ready, setReady] = useState(false), [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [data, setData] = useState<PlannerData>({ destination: initialDestination, date: "", days: "5", people: "2", budget: "舒适型", interests: ["自然风景", "在地美食"], transport: "公共交通" });
  const interests = ["自然风景", "在地美食", "人文历史", "城市漫步", "亲子体验", "小众秘境"];
  const update = (key: keyof PlannerData, value: string | string[]) => setData((current) => ({ ...current, [key]: value }));
  const validate = () => { const next: Record<string, string> = {}; if (step === 1 && !data.destination.trim()) next.destination = "请输入想去的目的地"; if (step === 1 && !data.date) next.date = "请选择出发日期"; if (step === 4 && !data.interests.length) next.interests = "请至少选择一项兴趣"; setErrors(next); return !Object.keys(next).length; };
  const generate = () => { if (!validate()) return; setLoading(true); setMessage(""); window.setTimeout(() => { setLoading(false); setReady(true); }, 900); };
  const saveTrip = () => { onSaved(); setMessage("行程已保存到“我的收藏”"); };
  const exportTrip = () => { const content = `${data.destination} · ${data.days}天旅行计划\n\n第1天 抵达与城市初见\n第2天 自然风景与在地美食\n第3天 人文漫步与自由探索`; const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${data.destination || "去野"}行程.txt`; anchor.click(); URL.revokeObjectURL(url); setMessage("行程已导出"); };

  if (loading) return <main className="subPage plannerPage"><div className="subPageIntro"><p className="eyebrow">SMART TRIP PLANNER</p><h1>正在为你安排刚刚好的节奏</h1><span>正在匹配景点、交通与餐饮，请稍等片刻。</span></div><div className="skeletonPanel" aria-live="polite" aria-label="正在生成行程"><i /><i /><i /><i /></div></main>;
  if (ready) return <main className="subPage resultPage">
    <div className="resultHeader"><div><p className="eyebrow">YOUR TRIP IS READY</p><h1>{data.destination || "大理"} · {data.days} 天旅行计划</h1><span>{data.date || "灵活出发"} · {data.people} 人 · {data.budget} · {data.transport}</span></div><div className="resultActions"><button className="button ghostDarkButton" onClick={() => { setReady(false); setStep(1); }}>重新生成</button><button className="button ghostDarkButton" onClick={exportTrip}>导出</button><button className="button primaryButton" onClick={saveTrip}>♥ 保存行程</button></div></div>
    {message && <div className="toast" role="status">✓ {message}</div>}
    <div className="dayTimeline">{[
      { day: "第 1 天", title: "抵达与城市初见", items: [["14:00", "抵达并入住", "机场 / 车站 → 酒店", "预留休息时间，不安排长距离移动"], ["17:30", "老城日落散步", "步行约 20 分钟", "晚餐：本地风味小馆"]] },
      { day: "第 2 天", title: "自然风景与在地味道", items: [["09:30", "湖畔或山野轻体验", "公共交通约 35 分钟", "带好防晒与饮用水"], ["13:00", "在地午餐与市集", "步行串联", "避开高峰，建议提前取号"], ["18:00", "观景台看日落", "打车约 20 分钟", "傍晚温差大，准备外套"]] },
      { day: "第 3 天", title: "人文漫步与自由探索", items: [["10:00", "博物馆与古建街区", "步行为主", "周一闭馆信息请提前确认"], ["15:00", "留白时间", "按状态自由调整", "咖啡馆、买手店或回酒店休息"]] },
    ].map((day) => <section className="dayCard" key={day.day}><div className="dayLabel"><span>{day.day}</span><h2>{day.title}</h2></div><div className="dayItems">{day.items.map((item) => <div className="dayItem" key={item[0]}><time>{item[0]}</time><div><strong>{item[1]}</strong><span>交通：{item[2]}</span><small>{item[3]}</small></div></div>)}</div></section>)}</div>
    <div className="resultNote"><strong>行前提醒</strong><p>行程会根据营业时间、天气和实时交通变化，请在出发前再次确认预约信息。</p></div>
  </main>;

  return <main className="subPage plannerPage"><div className="subPageIntro"><p className="eyebrow">SMART TRIP PLANNER</p><h1>四步，生成你的专属行程</h1><span>一次只做一个小决定，让计划轻松一点。</span></div>
    <div className="plannerLayout"><aside className="progressPanel"><p>行程完成度</p><div className="progressTrack"><i style={{ width: `${step * 25}%` }} /></div><b>{step} / 4</b><ol>{["目的地与日期", "天数与同行人", "预算与交通", "旅行兴趣"].map((label, index) => <li key={label} className={step >= index + 1 ? "isDone" : ""}><span>{step > index + 1 ? "✓" : index + 1}</span>{label}</li>)}</ol></aside>
      <section className="formPanel" aria-labelledby="form-title"><div className="formTitle"><span>STEP {step}</span><h2 id="form-title">{["想去哪里，什么时候出发？", "这趟旅行有多长？", "选择预算和出行方式", "最后，告诉我们你喜欢什么"][step - 1]}</h2></div>
        {step === 1 && <div className="formGrid"><label>目的地<input className={errors.destination ? "hasError" : ""} value={data.destination} onChange={(event) => update("destination", event.target.value)} placeholder="例如：大理、京都、冰岛" aria-describedby={errors.destination ? "destination-error" : undefined} />{errors.destination && <small id="destination-error" className="fieldError">{errors.destination}</small>}</label><label>出发日期<input className={errors.date ? "hasError" : ""} type="date" value={data.date} onChange={(event) => update("date", event.target.value)} aria-describedby={errors.date ? "date-error" : undefined} />{errors.date && <small id="date-error" className="fieldError">{errors.date}</small>}</label></div>}
        {step === 2 && <div className="choiceGrid"><fieldset><legend>旅行天数</legend><div className="segmented">{["3", "5", "7", "10"].map((value) => <button type="button" aria-pressed={data.days === value} className={data.days === value ? "isSelected" : ""} key={value} onClick={() => update("days", value)}>{value} 天</button>)}</div></fieldset><label>同行人数<select value={data.people} onChange={(event) => update("people", event.target.value)}><option value="1">1 人 · 一个人出发</option><option value="2">2 人 · 双人旅行</option><option value="3">3 人</option><option value="4">4 人</option><option value="5">5 人及以上</option></select></label></div>}
        {step === 3 && <div className="choiceGrid"><fieldset><legend>人均预算</legend><div className="optionCards">{[["轻松型", "¥3,000 以内"], ["舒适型", "¥3,000—8,000"], ["品质型", "¥8,000 以上"]].map(([value, copy]) => <button type="button" aria-pressed={data.budget === value} className={data.budget === value ? "isSelected" : ""} key={value} onClick={() => update("budget", value)}><strong>{value}</strong><span>{copy}</span></button>)}</div></fieldset><fieldset><legend>主要出行方式</legend><div className="segmented">{["公共交通", "自驾", "包车", "骑行 / 步行"].map((value) => <button type="button" aria-pressed={data.transport === value} className={data.transport === value ? "isSelected" : ""} key={value} onClick={() => update("transport", value)}>{value}</button>)}</div></fieldset></div>}
        {step === 4 && <fieldset><legend>旅行兴趣（可多选）</legend><div className="interestGrid">{interests.map((value) => { const chosen = data.interests.includes(value); return <button type="button" aria-pressed={chosen} className={chosen ? "isSelected" : ""} key={value} onClick={() => update("interests", chosen ? data.interests.filter((item) => item !== value) : [...data.interests, value])}>{chosen ? "✓ " : "+ "}{value}</button>; })}</div>{errors.interests && <small className="fieldError">{errors.interests}</small>}</fieldset>}
        <div className="formActions"><button className="button ghostDarkButton" disabled={step === 1} onClick={() => setStep((current) => Math.max(current - 1, 1))}>上一步</button>{step < 4 ? <button className="button primaryButton" onClick={() => { if (validate()) setStep((current) => current + 1); }}>继续 <span>→</span></button> : <button className="button primaryButton" onClick={generate}>生成我的行程 <span>✦</span></button>}</div>
      </section></div>
  </main>;
}

function FavoritesView({ saved, onToggleSaved, tripSaved, onCancelTrip, onEditTrip, onExplore }: { saved: string[]; onToggleSaved: (id: string) => void; tripSaved: boolean; onCancelTrip: () => void; onEditTrip: () => void; onExplore: () => void }) {
  const [tab, setTab] = useState<FavoriteTab>("destination"), [query, setQuery] = useState(""), [sort, setSort] = useState("最近收藏");
  const [hiddenRoutes, setHiddenRoutes] = useState<string[]>([]);
  const destinationItems = destinations.filter((item) => saved.includes(item.id) && `${item.city}${item.title}`.includes(query));
  const savedRouteItems = routes.slice(0, saved.length ? 2 : 0).filter((item) => !hiddenRoutes.includes(item.id));
  const routeItems = savedRouteItems.filter((item) => item.title.includes(query) || item.places.includes(query));
  const counts = { destination: saved.length, route: savedRouteItems.length, trip: tripSaved ? 1 : 0 };
  const empty = tab === "destination" ? destinationItems.length === 0 : tab === "route" ? routeItems.length === 0 : !tripSaved;
  return <main className="subPage favoritesPage"><div className="favoritesHeader"><div><p className="eyebrow">MY TRAVEL COLLECTION</p><h1>我的收藏</h1><span>把想去的地方收在一起，慢慢变成下一次出发。</span></div><div className="collectionCount"><b>{saved.length + counts.route + counts.trip}</b><span>条旅行灵感</span></div></div>
    <div className="favoriteTabs" role="tablist" aria-label="收藏类型">{([["destination", "目的地"], ["route", "旅行路线"], ["trip", "智能行程"]] as [FavoriteTab, string][]).map(([id, label]) => <button role="tab" aria-selected={tab === id} className={tab === id ? "isActive" : ""} key={id} onClick={() => setTab(id)}>{label}<span>{counts[id]}</span></button>)}</div>
    <div className="collectionToolbar"><label className="collectionSearch"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索收藏内容" aria-label="搜索收藏内容" /></label><label className="sortSelect"><span>排序</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option>最近收藏</option><option>旅行天数</option><option>目的地名称</option></select></label></div>
    {empty ? <EmptyState onExplore={onExplore} /> : <>{tab === "destination" && <div className="destinationGrid">{destinationItems.map((item) => <DestinationCard key={item.id} item={item} saved onToggle={() => onToggleSaved(item.id)} onOpen={onExplore} />)}</div>}{tab === "route" && <div className="routeList">{routeItems.map((route, index) => <article key={route.id}><span>0{index + 1}</span><div><p>{route.type}</p><h3>{route.title}</h3><small>{route.places} · {route.days}</small></div><button className="button ghostDarkButton" onClick={() => setHiddenRoutes((items) => [...items, route.id])}>取消收藏</button></article>)}</div>}{tab === "trip" && tripSaved && <article className="savedTrip"><div><p>最近更新 · {new Date().toLocaleDateString("zh-CN")}</p><h3>大理 · 5 天慢旅行</h3><span>自然风景 · 在地美食 · 公共交通</span></div><div><button className="button ghostDarkButton" onClick={onCancelTrip}>取消收藏</button><button className="button primaryButton" onClick={onEditTrip}>继续编辑</button></div></article>}</>}
  </main>;
}

function SiteFooter({ onNavigate }: { onNavigate: (view: View) => void }) {
  return <footer className="siteFooter"><div><button className="brand footerBrand" onClick={() => onNavigate("discover")}><span className="brandMark">去野</span><span className="brandDot" /></button><p>把想去的地方，变成一起走过的路。</p></div><nav aria-label="页脚导航"><button onClick={() => onNavigate("discover")}>灵感目的地</button><button onClick={() => onNavigate("planner")}>智能行程</button><button onClick={() => onNavigate("favorites")}>我的收藏</button></nav><small>© 2026 GO WILD TRAVEL JOURNAL</small></footer>;
}

export default function Home() {
  const [view, setView] = useState<View>("discover");
  const [saved, setSaved] = useState<string[]>(["dali"]);
  const [plannerDestination, setPlannerDestination] = useState("");
  const [tripSaved, setTripSaved] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("quye-saved");
      if (stored) { try { setSaved(JSON.parse(stored) as string[]); } catch { /* Keep the safe default. */ } }
      setTripSaved(window.localStorage.getItem("quye-trip-saved") === "true");
      setStorageReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => { if (storageReady) window.localStorage.setItem("quye-saved", JSON.stringify(saved)); }, [saved, storageReady]);
  const navigate = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleSaved = (id: string) => setSaved((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const openPlanner = (destination = "") => { setPlannerDestination(destination); navigate("planner"); };
  const saveTrip = () => { setTripSaved(true); window.localStorage.setItem("quye-trip-saved", "true"); };
  const cancelTrip = () => { setTripSaved(false); window.localStorage.removeItem("quye-trip-saved"); };
  return <div className="siteShell"><Header active={view} savedCount={saved.length + (tripSaved ? 1 : 0)} onNavigate={navigate} />{view === "discover" && <DiscoverView saved={saved} onToggleSaved={toggleSaved} onPlan={openPlanner} onFavorites={() => navigate("favorites")} />}{view === "planner" && <PlannerView initialDestination={plannerDestination} onSaved={saveTrip} />}{view === "favorites" && <FavoritesView saved={saved} onToggleSaved={toggleSaved} tripSaved={tripSaved} onCancelTrip={cancelTrip} onEditTrip={() => openPlanner("大理")} onExplore={() => navigate("discover")} />}<SiteFooter onNavigate={navigate} /></div>;
}
