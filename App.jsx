import { useState, useEffect, useRef, useCallback } from "react";

// ─── Store Config ─────────────────────────────────────────────────────────────
const STORES = {
  tj: { name: "Trader Joe's", short: "TJ", emoji: "🛒", color: "#c8102e", light: "#fff5f5" },
  wf: { name: "Whole Foods",  short: "WF", emoji: "🌿", color: "#00674b", light: "#f0faf5" },
  lr: { name: "LaRocca's",   short: "LR", emoji: "🏪", color: "#7b4f27", light: "#fdf6ee" },
};

// ─── Default Lists ────────────────────────────────────────────────────────────
const DEFAULTS = {
  lr: [
    { id:"lr1",  name:"Fresh Fruit (Chelsea)",         qty:1,    unit:"",       cat:"produce",  checked:false },
    { id:"lr2",  name:"Fresh Fruit (Jake & Rachel)",   qty:1,    unit:"",       cat:"produce",  checked:false },
    { id:"lr3",  name:"Skirt Steak (Rachel)",          qty:0.5,  unit:"lb",     cat:"meat",     checked:false },
    { id:"lr4",  name:"Grill Protein (Jake)",          qty:0.75, unit:"lb",     cat:"meat",     checked:false },
    { id:"lr5",  name:"Flowers for Rachel",            qty:1,    unit:"",       cat:"other",    checked:false },
  ],
  wf: [
    { id:"wf1",  name:"Chicken Fingers",               qty:1, unit:"pkg",    cat:"frozen",   checked:false },
    { id:"wf2",  name:"Banza Pizza",                   qty:1, unit:"",       cat:"frozen",   checked:false },
    { id:"wf3",  name:"Veggie Dinosaur Nuggets",       qty:1, unit:"pkg",    cat:"frozen",   checked:false },
    { id:"wf4",  name:"Fresh Parmesan",                qty:1, unit:"wedge",  cat:"dairy",    checked:false },
    { id:"wf5",  name:"Tea",                           qty:1, unit:"box",    cat:"pantry",   checked:false },
    { id:"wf6",  name:"Food to Grill",                 qty:1, unit:"",       cat:"meat",     checked:false },
  ],
  tj: [
    { id:"tj1",  name:"Avocados",                           qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj2",  name:"Fresh Fruit (Chelsea)",              qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj3",  name:"Sweet Potato",                       qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj4",  name:"Blueberries",                        qty:1, unit:"pint",   cat:"produce",  checked:false },
    { id:"tj5",  name:"Apples",                             qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj6",  name:"Tomatoes",                           qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj7",  name:"Bananas",                            qty:1, unit:"bunch",  cat:"produce",  checked:false },
    { id:"tj8",  name:"Edamame",                            qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj9",  name:"Kale",                               qty:1, unit:"bunch",  cat:"produce",  checked:false },
    { id:"tj10", name:"Mini Cucumbers",                     qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj11", name:"Peppers",                            qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj12", name:"Big Carrots",                        qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj13", name:"Oranges",                            qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj14", name:"Asparagus",                          qty:1, unit:"bunch",  cat:"produce",  checked:false },
    { id:"tj15", name:"Baby Corn",                          qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj16", name:"Lemons",                             qty:3, unit:"",       cat:"produce",  checked:false },
    { id:"tj17", name:"Zucchini",                           qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj18", name:"Regular Potato",                     qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj19", name:"Corn",                               qty:1, unit:"",       cat:"produce",  checked:false },
    { id:"tj20", name:"Strawberries",                       qty:1, unit:"pint",   cat:"produce",  checked:false },
    { id:"tj21", name:"Spinach",                            qty:1, unit:"bag",    cat:"produce",  checked:false },
    { id:"tj22", name:"Eggs",                               qty:1, unit:"dozen",  cat:"dairy",    checked:false },
    { id:"tj23", name:"Mexican Cheese",                     qty:1, unit:"bag",    cat:"dairy",    checked:false },
    { id:"tj24", name:"Feta",                               qty:1, unit:"block",  cat:"dairy",    checked:false },
    { id:"tj25", name:"Babybel Cheese",                     qty:1, unit:"pkg",    cat:"dairy",    checked:false },
    { id:"tj26", name:"Fresh Mozzarella Balls",             qty:1, unit:"tub",    cat:"dairy",    checked:false },
    { id:"tj27", name:"Almond Milk",                        qty:1, unit:"carton", cat:"dairy",    checked:false },
    { id:"tj28", name:"Plain 0% Greek Yogurt",              qty:1, unit:"large",  cat:"dairy",    checked:false },
    { id:"tj29", name:"Yogurt Tubes",                       qty:1, unit:"box",    cat:"dairy",    checked:false },
    { id:"tj30", name:"Kids Yogurts (Chelsea)",             qty:1, unit:"pack",   cat:"dairy",    checked:false },
    { id:"tj31", name:"Orange Juice",                       qty:1, unit:"carton", cat:"dairy",    checked:false },
    { id:"tj32", name:"Shredded Mozzarella",                qty:1, unit:"bag",    cat:"dairy",    checked:false },
    { id:"tj33", name:"String Cheese (Chelsea)",            qty:1, unit:"pkg",    cat:"dairy",    checked:false },
    { id:"tj34", name:"Whipped Cream",                      qty:1, unit:"can",    cat:"dairy",    checked:false },
    { id:"tj35", name:"Frozen Berries",                     qty:2, unit:"bags",   cat:"frozen",   checked:false },
    { id:"tj36", name:"Falafel",                            qty:1, unit:"pkg",    cat:"frozen",   checked:false },
    { id:"tj37", name:"In-Shell Edamame",                   qty:2, unit:"bags",   cat:"frozen",   checked:false },
    { id:"tj38", name:"Turkey Meatballs",                   qty:1, unit:"pkg",    cat:"frozen",   checked:false },
    { id:"tj39", name:"Pre-Cooked Grilled Chicken",         qty:1, unit:"pkg",    cat:"frozen",   checked:false },
    { id:"tj40", name:"Organic Chicken Nuggets",            qty:1, unit:"pkg",    cat:"frozen",   checked:false },
    { id:"tj41", name:"Butternut Squash Ravioli",           qty:1, unit:"pkg",    cat:"pasta",    checked:false },
    { id:"tj42", name:"Pesto",                              qty:1, unit:"jar",    cat:"pantry",   checked:false },
    { id:"tj43", name:"Brown Rice",                         qty:1, unit:"bag",    cat:"grains",   checked:false },
    { id:"tj44", name:"Whole Wheat Pasta",                  qty:1, unit:"box",    cat:"pasta",    checked:false },
    { id:"tj45", name:"Chickpea Pasta",                     qty:2, unit:"boxes",  cat:"pasta",    checked:false },
    { id:"tj46", name:"Colored Pasta",                      qty:2, unit:"boxes",  cat:"pasta",    checked:false },
    { id:"tj47", name:"Plain Pasta",                        qty:1, unit:"box",    cat:"pasta",    checked:false },
    { id:"tj48", name:"Couscous (Large Pearls)",            qty:1, unit:"box",    cat:"grains",   checked:false },
    { id:"tj49", name:"Tomato Sauce",                       qty:1, unit:"jar",    cat:"pantry",   checked:false },
    { id:"tj50", name:"Kalamata Olives",                    qty:1, unit:"jar",    cat:"pantry",   checked:false },
    { id:"tj51", name:"Black Olives",                       qty:1, unit:"can",    cat:"pantry",   checked:false },
    { id:"tj52", name:"Peanut Butter (creamy, no salt)",    qty:1, unit:"jar",    cat:"pantry",   checked:false },
    { id:"tj53", name:"Honey",                              qty:1, unit:"jar",    cat:"pantry",   checked:false },
    { id:"tj54", name:"Pickles",                            qty:1, unit:"jar",    cat:"pantry",   checked:false },
    { id:"tj55", name:"Mac & Cheese (shells)",              qty:1, unit:"box",    cat:"pantry",   checked:false },
    { id:"tj56", name:"Teriyaki Sauce",                     qty:1, unit:"bottle", cat:"pantry",   checked:false },
    { id:"tj57", name:"General Tso Sauce",                  qty:1, unit:"bottle", cat:"pantry",   checked:false },
    { id:"tj58", name:"Ketchup",                            qty:1, unit:"bottle", cat:"pantry",   checked:false },
    { id:"tj59", name:"Baking Soda",                        qty:1, unit:"box",    cat:"baking",   checked:false },
    { id:"tj60", name:"Almond Flour Tortilla Shells",       qty:4, unit:"packs",  cat:"pantry",   checked:false },
    { id:"tj61", name:"Pita",                               qty:1, unit:"pkg",    cat:"bakery",   checked:false },
    { id:"tj62", name:"Pistachios (light salt)",            qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj63", name:"Pretzels",                           qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj64", name:"Grainless Granola (purple bag)",     qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj65", name:"Dried Mango",                        qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj66", name:"Cashews (no salt)",                  qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj67", name:"PBJ Bites",                          qty:1, unit:"pkg",    cat:"snacks",   checked:false },
    { id:"tj68", name:"Chelsea Granola Bars",               qty:1, unit:"box",    cat:"snacks",   checked:false },
    { id:"tj69", name:"Strawberry Chips",                   qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj70", name:"Apple Chips",                        qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj71", name:"Cashew Travel Packs",                qty:1, unit:"box",    cat:"snacks",   checked:false },
    { id:"tj72", name:"Peanuts (light salt)",               qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj73", name:"Light Salt Cashews",                 qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj74", name:"Travel Nut Packs",                   qty:1, unit:"box",    cat:"snacks",   checked:false },
    { id:"tj75", name:"Banana Chips",                       qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj76", name:"Cheese Sandwich Crackers",           qty:1, unit:"box",    cat:"snacks",   checked:false },
    { id:"tj77", name:"Saltines / Oyster Crackers",         qty:1, unit:"box",    cat:"snacks",   checked:false },
    { id:"tj78", name:"Cheddar Rockets",                    qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj79", name:"Peapod Chips",                       qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj80", name:"Bamba",                              qty:1, unit:"bag",    cat:"snacks",   checked:false },
    { id:"tj81", name:"Chelsea Blueberry Bars",             qty:1, unit:"box",    cat:"snacks",   checked:false },
    { id:"tj82", name:"Seltzer",                            qty:1, unit:"case",   cat:"beverages",checked:false },
    { id:"tj83", name:"Chamomile Tea",                      qty:1, unit:"box",    cat:"beverages",checked:false },
    { id:"tj84", name:"Cheerios",                           qty:1, unit:"box",    cat:"breakfast",checked:false },
    { id:"tj85", name:"Avocado Oil Spray",                  qty:1, unit:"can",    cat:"pantry",   checked:false },
  ],
};

// ─── Meal Pool ────────────────────────────────────────────────────────────────
const ALL_MEALS = [
  { id:"m1",  emoji:"🍝", name:"Pasta with Pesto",          tags:["quick","vegetarian"],  note:"Any TJ pasta + pesto + fresh mozzarella. 15-min dinner.",        needs:["pasta","pesto","mozzarella"] },
  { id:"m2",  emoji:"🥩", name:"Grilled Skirt Steak Night", tags:["grill","Rachel"],       note:"Rachel's ½ lb skirt steak from LaRocca's + grilled asparagus.",  needs:["skirt steak","asparagus","lemons"] },
  { id:"m3",  emoji:"🍱", name:"Turkey Meatball Bowls",     tags:["quick","family"],       note:"TJ turkey meatballs over brown rice with wilted spinach.",        needs:["turkey meatballs","brown rice","spinach"] },
  { id:"m4",  emoji:"🌯", name:"Falafel Wraps",             tags:["vegetarian","quick"],   note:"TJ falafel in almond flour tortillas with kale + tomatoes.",     needs:["falafel","tortilla","kale","tomatoes"] },
  { id:"m5",  emoji:"🍗", name:"Teriyaki Chicken Bowls",    tags:["family","grill"],       note:"Marinate chicken in TJ teriyaki, serve over brown rice.",        needs:["chicken","teriyaki sauce","brown rice"] },
  { id:"m6",  emoji:"🍝", name:"Butternut Squash Ravioli",  tags:["quick","vegetarian"],   note:"Brown butter + fresh parmesan — elegant 15-min dinner.",         needs:["butternut squash ravioli","parmesan"] },
  { id:"m7",  emoji:"🍜", name:"General Tso Chicken",       tags:["family","quick"],       note:"TJ General Tso sauce over rice with edamame on the side.",      needs:["chicken","general tso sauce","brown rice","edamame"] },
  { id:"m8",  emoji:"🥗", name:"Greek Salad Plate",         tags:["vegetarian","light"],   note:"Feta + kalamata olives + tomatoes + cucumbers + lemon.",         needs:["tomatoes","cucumbers","feta","olives","lemons"] },
  { id:"m9",  emoji:"🥑", name:"Avocado Egg Toast",         tags:["breakfast","quick"],    note:"Smashed avocado on pita with a soft egg on top.",                needs:["avocados","eggs","pita"] },
  { id:"m10", emoji:"🍝", name:"Chickpea Pasta Primavera",  tags:["vegetarian","healthy"], note:"Chickpea pasta + sautéed zucchini + tomato sauce.",              needs:["chickpea pasta","zucchini","tomato sauce"] },
  { id:"m11", emoji:"🌽", name:"Full Veggie Grill Night",   tags:["grill","vegetarian"],   note:"Corn, zucchini, peppers, asparagus — whole spread on the grill.",needs:["corn","zucchini","peppers","asparagus"] },
  { id:"m12", emoji:"🐟", name:"Salmon & Asparagus",        tags:["grill","Jake"],         note:"WF salmon + TJ asparagus + lemon — Jake's go-to.",              needs:["salmon","asparagus","lemons"] },
  { id:"m13", emoji:"🍳", name:"Egg Scramble Bowls",        tags:["breakfast","quick"],    note:"Eggs + spinach + Mexican cheese — ready in 10 minutes.",         needs:["eggs","spinach","mexican cheese"] },
  { id:"m14", emoji:"🥣", name:"Sweet Potato & Kale Bowl",  tags:["vegetarian","healthy"], note:"Roasted sweet potato + massaged kale + crumbled feta.",          needs:["sweet potato","kale","feta"] },
  { id:"m15", emoji:"🍕", name:"Banza Pizza Night",         tags:["family","kids"],        note:"Top WF Banza with extra parmesan + whatever's in the fridge.",   needs:["banza pizza","parmesan"] },
  { id:"m16", emoji:"🥘", name:"Pearl Couscous Veggie Bowl",tags:["vegetarian","family"],  note:"Large pearl couscous + roasted veg + feta — great for Chelsea.", needs:["couscous","zucchini","tomatoes","feta"] },
  { id:"m17", emoji:"🌮", name:"Skirt Steak Tacos",         tags:["grill","family"],       note:"Slice Rachel's grilled skirt steak into almond flour tortillas + avo.", needs:["skirt steak","tortilla","avocados"] },
  { id:"m18", emoji:"🍗", name:"Chicken Nugget Platter",    tags:["kids","quick"],         note:"Chelsea-approved — nuggets + carrot sticks + ketchup dipping.",  needs:["chicken nuggets","ketchup","carrots"] },
  { id:"m19", emoji:"🥦", name:"Stir-Fry Veggie Bowl",      tags:["vegetarian","quick"],   note:"Peppers + baby corn + edamame + teriyaki over rice.",            needs:["peppers","baby corn","edamame","teriyaki sauce","brown rice"] },
  { id:"m20", emoji:"🫙", name:"Greek Yogurt Bowls",        tags:["breakfast","kids"],     note:"Plain Greek yogurt + frozen berries (thawed) + granola + honey.", needs:["greek yogurt","frozen berries","granola","honey"] },
];

const CAT_META = {
  produce:    { emoji:"🥦", label:"Produce" },
  meat:       { emoji:"🥩", label:"Meat" },
  seafood:    { emoji:"🐟", label:"Seafood" },
  dairy:      { emoji:"🧀", label:"Dairy" },
  frozen:     { emoji:"🧊", label:"Frozen" },
  pantry:     { emoji:"🥫", label:"Pantry" },
  pasta:      { emoji:"🍝", label:"Pasta" },
  grains:     { emoji:"🌾", label:"Grains" },
  snacks:     { emoji:"🍿", label:"Snacks" },
  beverages:  { emoji:"🥤", label:"Beverages" },
  bakery:     { emoji:"🍞", label:"Bakery" },
  baking:     { emoji:"🧁", label:"Baking" },
  breakfast:  { emoji:"🥣", label:"Breakfast" },
  other:      { emoji:"📦", label:"Other" },
};
const CAT_ORDER = ["produce","meat","seafood","dairy","frozen","pasta","grains","pantry","snacks","beverages","bakery","baking","breakfast","other"];

// ─── Storage (localStorage) ───────────────────────────────────────────────────
const SK = "grocery_lists_v1";
const HK = "grocery_history_v1";
const MK = "grocery_meals_v1";

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─── Meal Matching ────────────────────────────────────────────────────────────
function matchScore(meal, allItems) {
  const names = allItems.map(i => i.name.toLowerCase());
  const hits = meal.needs.filter(n => names.some(nm => nm.includes(n.toLowerCase())));
  return hits.length / meal.needs.length;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeStore, setActiveStore] = useState("tj");
  const [lists, setLists] = useState(() => lsGet(SK, DEFAULTS));
  const [history, setHistory] = useState(() => lsGet(HK, {}));
  const [mealFeedback, setMealFeedback] = useState(() => lsGet(MK, {}));
  const [view, setView] = useState("list");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:"", qty:1, unit:"", cat:"other" });
  const [confirmReset, setConfirmReset] = useState(false);
  const [search, setSearch] = useState("");
  const [swipe, setSwipe] = useState({ id:null, delta:0 });
  const touchX = useRef(null);
  const searchRef = useRef(null);

  // Persist on every change
  useEffect(() => { lsSet(SK, lists); }, [lists]);
  useEffect(() => { lsSet(HK, history); }, [history]);
  useEffect(() => { lsSet(MK, mealFeedback); }, [mealFeedback]);

  const S = STORES[activeStore];
  const items = lists[activeStore] || [];
  const allItems = Object.values(lists).flat();

  const toggle = useCallback((id) => {
    const item = items.find(i => i.id === id);
    const wasChecked = item?.checked;
    setLists(p => ({ ...p, [activeStore]: p[activeStore].map(i => i.id === id ? {...i, checked: !i.checked} : i) }));
    if (item && !wasChecked) {
      setHistory(p => {
        const key = item.name.toLowerCase();
        return { ...p, [key]: { name: item.name, count: (p[key]?.count||0)+1, lastQty: item.qty, store: activeStore } };
      });
    }
  }, [items, activeStore]);

  const adjustQty = (id, d) =>
    setLists(p => ({ ...p, [activeStore]: p[activeStore].map(i => i.id === id ? {...i, qty: Math.max(0.25, +(i.qty+d).toFixed(2))} : i) }));

  const removeItem = (id) =>
    setLists(p => ({ ...p, [activeStore]: p[activeStore].filter(i => i.id !== id) }));

  const addItem = () => {
    if (!form.name.trim()) return;
    const item = { id:`${activeStore}${Date.now()}`, name: form.name.trim(), qty: +form.qty||1, unit: form.unit.trim(), cat: form.cat, checked: false };
    setLists(p => ({ ...p, [activeStore]: [...p[activeStore], item] }));
    setForm({ name:"", qty:1, unit:"", cat:"other" });
    setAdding(false);
  };

  const reset = () => setLists(p => ({ ...p, [activeStore]: p[activeStore].map(i => ({...i, checked:false})) }));
  const clearDone = () => setLists(p => ({ ...p, [activeStore]: p[activeStore].filter(i => !i.checked) }));
  const resetAll = () => {
    setLists(p => Object.fromEntries(Object.entries(p).map(([k, its]) => [k, its.map(i => ({...i, checked:false}))])));
    setConfirmReset(false);
  };

  const rateMeal = (id, val) => setMealFeedback(p => ({...p, [id]: val}));

  // Swipe handlers
  const ts = (e, id) => { touchX.current = e.touches[0].clientX; setSwipe({ id, delta:0 }); };
  const tm = (e, id) => {
    if (swipe.id !== id) return;
    setSwipe({ id, delta: Math.max(-110, Math.min(0, e.touches[0].clientX - touchX.current)) });
  };
  const te = (id) => { if (swipe.delta < -80) removeItem(id); setSwipe({ id:null, delta:0 }); };

  // Derived data
  const unchecked = items.filter(i => !i.checked);
  const checked   = items.filter(i => i.checked);
  const grouped   = {};
  unchecked.forEach(i => { const c = i.cat||"other"; if (!grouped[c]) grouped[c]=[]; grouped[c].push(i); });
  Object.keys(grouped).forEach(c => grouped[c].sort((a,b) => a.name.localeCompare(b.name)));

  const searchQuery = search.trim().toLowerCase();
  const searchResults = searchQuery.length < 1 ? [] :
    Object.entries(lists).flatMap(([storeKey, storeItems]) =>
      storeItems.filter(i => i.name.toLowerCase().includes(searchQuery)).map(i => ({...i, storeKey}))
    ).sort((a,b) => a.name.localeCompare(b.name));

  const scoredMeals = ALL_MEALS
    .map(m => { const fb = mealFeedback[m.id]??0; const match = matchScore(m, allItems); return {...m, fb, match, score: match*2 + fb*0.6}; })
    .filter(m => m.fb > -1 && m.match > 0)
    .sort((a,b) => b.score - a.score);

  const likedMeals  = ALL_MEALS.filter(m => mealFeedback[m.id] === 1);
  const topHistory  = Object.values(history).sort((a,b) => b.count - a.count).slice(0, 10);

  return (
    <div style={{ fontFamily:"'Georgia',serif", background:"#f7f7f4", minHeight:"100vh", maxWidth:480, margin:"0 auto", paddingBottom:100 }}>

      {/* ── Header ── */}
      <div style={{ background:S.color, color:"#fff", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 18px rgba(0,0,0,0.18)" }}>
        <div style={{ padding:"16px 18px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:3, textTransform:"uppercase", opacity:0.6, fontFamily:"sans-serif" }}>Weekly Shop</div>
            <div style={{ fontSize:22, fontWeight:700, marginTop:1 }}>{S.emoji} {S.name}</div>
          </div>
          <div style={{ background:"rgba(255,255,255,0.18)", borderRadius:20, padding:"5px 14px", fontSize:13, fontFamily:"sans-serif" }}>
            {unchecked.length} left · {checked.length} ✓
          </div>
        </div>
        <div style={{ display:"flex", gap:2, padding:"10px 18px 0" }}>
          {Object.entries(STORES).map(([k,s]) => (
            <button key={k} onClick={() => setActiveStore(k)} style={{
              flex:1, background: activeStore===k ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.17)",
              color: activeStore===k ? s.color : "#fff", border:"none", borderRadius:"8px 8px 0 0",
              padding:"7px 2px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer"
            }}>{s.emoji} {s.short}</button>
          ))}
        </div>
      </div>

      {/* ── Sub-nav ── */}
      <div style={{ background:"#fff", borderBottom:"1px solid #eee", display:"flex", alignItems:"center", padding:"0 12px" }}>
        {[["list","📋 List"],["insights","📊 Insights"],["meals","🍽 Meals"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)} style={{
            background:"none", border:"none", padding:"11px 12px", fontSize:13,
            fontFamily:"sans-serif", fontWeight:600,
            color: view===v ? S.color : "#bbb",
            borderBottom: view===v ? `2.5px solid ${S.color}` : "2.5px solid transparent",
            cursor:"pointer"
          }}>{l}</button>
        ))}
        <div style={{ flex:1 }} />
        {view==="list" && <>
          <button onClick={reset} style={{ background:"none", border:"none", padding:"0 8px", fontSize:13, color:"#ccc", cursor:"pointer" }} title="Uncheck this store">↺</button>
          {checked.length > 0 && <button onClick={clearDone} style={{ background:"none", border:"none", padding:"0 8px", fontSize:13, color:"#e55", cursor:"pointer" }} title="Remove checked">🗑</button>}
          <button onClick={() => setConfirmReset(true)} style={{
            background:S.color, color:"#fff", border:"none", borderRadius:20,
            padding:"5px 13px", fontSize:12, fontFamily:"sans-serif", fontWeight:700,
            cursor:"pointer", marginLeft:4
          }}>New Week ✨</button>
        </>}
      </div>

      {/* ── Search Bar ── */}
      {view === "list" && (
        <div style={{ background:"#fff", padding:"10px 14px 12px", borderBottom:"1px solid #eee" }}>
          <div style={{ display:"flex", alignItems:"center", background:"#f4f4f2", borderRadius:12, padding:"8px 12px", gap:8 }}>
            <span style={{ fontSize:15, opacity:0.4 }}>🔍</span>
            <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search all lists…"
              style={{ flex:1, background:"none", border:"none", outline:"none", fontSize:15, fontFamily:"Georgia,serif", color:"#222" }} />
            {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", color:"#bbb", fontSize:18, cursor:"pointer", lineHeight:1, padding:0 }}>×</button>}
          </div>
        </div>
      )}

      {/* ── List View ── */}
      {view === "list" && (
        <div>
          {searchQuery.length > 0 ? (
            <div>
              <div style={{ padding:"10px 16px 4px", fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"#bbb", fontFamily:"sans-serif" }}>
                {searchResults.length === 0 ? "No matches" : `${searchResults.length} result${searchResults.length!==1?"s":""} across all stores`}
              </div>
              {searchResults.length === 0
                ? <div style={{ padding:"24px 16px", color:"#ccc", fontFamily:"sans-serif", fontSize:14 }}>"{search}" isn't on any list yet.</div>
                : searchResults.map(item => (
                  <div key={item.id} style={{ display:"flex", alignItems:"center", padding:"11px 14px", background:"#fff", borderBottom:"1px solid #f3f3f3", gap:10 }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:STORES[item.storeKey]?.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontFamily:"sans-serif", fontWeight:700, flexShrink:0 }}>
                      {STORES[item.storeKey]?.short}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:15.5, color: item.checked?"#ccc":"#1a1a1a", textDecoration: item.checked?"line-through":"none", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
                      <div style={{ fontSize:11, color:"#ccc", fontFamily:"sans-serif", marginTop:1 }}>{CAT_META[item.cat]?.emoji} {CAT_META[item.cat]?.label}{item.unit ? ` · ${item.unit}` : ""}</div>
                    </div>
                    <div style={{ fontSize:13, color: item.checked?"#4caf80":"#bbb", fontFamily:"sans-serif", fontWeight:600 }}>{item.checked ? "✓ in cart" : `qty ${item.qty}`}</div>
                  </div>
                ))
              }
            </div>
          ) : (
            <>
              {CAT_ORDER.filter(c => grouped[c]).map(cat => (
                <div key={cat}>
                  <div style={{ padding:"10px 16px 2px", fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"#bbb", fontFamily:"sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                    {CAT_META[cat]?.emoji} {CAT_META[cat]?.label}
                  </div>
                  {grouped[cat].map(item => (
                    <ItemRow key={item.id} item={item} color={S.color}
                      onToggle={() => toggle(item.id)} onAdjust={d => adjustQty(item.id,d)} onRemove={() => removeItem(item.id)}
                      swipeActive={swipe.id===item.id} swipeDelta={swipe.delta}
                      onTouchStart={e => ts(e,item.id)} onTouchMove={e => tm(e,item.id)} onTouchEnd={() => te(item.id)} />
                  ))}
                </div>
              ))}
              {checked.length > 0 && (
                <div>
                  <div style={{ padding:"10px 16px 2px", fontSize:10, letterSpacing:2.5, textTransform:"uppercase", color:"#bbb", fontFamily:"sans-serif" }}>✅ In Cart</div>
                  {checked.map(item => (
                    <ItemRow key={item.id} item={item} color={S.color}
                      onToggle={() => toggle(item.id)} onAdjust={d => adjustQty(item.id,d)} onRemove={() => removeItem(item.id)}
                      swipeActive={swipe.id===item.id} swipeDelta={swipe.delta}
                      onTouchStart={e => ts(e,item.id)} onTouchMove={e => tm(e,item.id)} onTouchEnd={() => te(item.id)} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Insights View ── */}
      {view === "insights" && (
        <div style={{ padding:16 }}>
          <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:2 }}>📈 Most Purchased</div>
            <div style={{ fontSize:12, color:"#aaa", fontFamily:"sans-serif", marginBottom:18 }}>Across all three stores — all time</div>
            {topHistory.length === 0
              ? <div style={{ color:"#ccc", fontSize:14, fontFamily:"sans-serif" }}>Check items off while shopping to build your history!</div>
              : topHistory.map(item => (
                <div key={item.name} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:13 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", background:STORES[item.store]?.color||"#999", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontFamily:"sans-serif", fontWeight:700, flexShrink:0 }}>
                    {STORES[item.store]?.short}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, marginBottom:3 }}>{item.name}</div>
                    <div style={{ height:5, background:"#f0f0f0", borderRadius:4 }}>
                      <div style={{ height:5, width:`${(item.count/(topHistory[0]?.count||1))*100}%`, background:STORES[item.store]?.color||"#999", borderRadius:4 }} />
                    </div>
                  </div>
                  <div style={{ fontSize:12, color:"#bbb", fontFamily:"sans-serif" }}>{item.count}×</div>
                </div>
              ))
            }
          </div>
          <div style={{ background:"#fff", borderRadius:16, padding:20, marginBottom:14, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>🛒 This Week's Lists</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {Object.entries(STORES).map(([k,s]) => {
                const its = lists[k]||[]; const done = its.filter(i=>i.checked).length;
                return (
                  <div key={k} style={{ background:s.light, borderRadius:12, padding:"14px 8px", textAlign:"center" }}>
                    <div style={{ fontSize:20 }}>{s.emoji}</div>
                    <div style={{ fontSize:26, fontWeight:700, color:s.color, lineHeight:1.1 }}>{its.length}</div>
                    <div style={{ fontSize:10, color:"#bbb", fontFamily:"sans-serif", textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>{s.short}</div>
                    {done > 0 && <div style={{ fontSize:11, color:s.color, marginTop:4, fontFamily:"sans-serif" }}>{done} done</div>}
                  </div>
                );
              })}
            </div>
          </div>
          {likedMeals.length > 0 && (
            <div style={{ background:"#fff", borderRadius:16, padding:20, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:17, fontWeight:700, marginBottom:14 }}>⭐ Favorite Meals</div>
              {likedMeals.map(m => (
                <div key={m.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:"1px solid #f5f5f5" }}>
                  <span style={{ fontSize:22 }}>{m.emoji}</span>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600 }}>{m.name}</div>
                    <div style={{ fontSize:12, color:"#aaa", fontFamily:"sans-serif" }}>{m.note}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Meals View ── */}
      {view === "meals" && (
        <div style={{ padding:16 }}>
          <div style={{ fontSize:13, color:"#aaa", fontFamily:"sans-serif", marginBottom:14, lineHeight:1.6 }}>
            Suggestions based on what's across <strong>all your lists</strong>. 👍 saves to favorites and bumps the meal up. 👎 hides it.
          </div>
          {scoredMeals.length === 0
            ? <div style={{ textAlign:"center", color:"#ccc", fontFamily:"sans-serif", marginTop:40 }}>No matches yet — your lists will suggest meals as you add items!</div>
            : scoredMeals.map(meal => (
              <div key={meal.id} style={{ background:"#fff", borderRadius:16, padding:18, marginBottom:12, boxShadow:"0 2px 10px rgba(0,0,0,0.05)", borderLeft: meal.fb===1 ? "4px solid #4caf80" : "4px solid transparent" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, marginRight:12 }}>
                    <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>{meal.emoji} {meal.name}</div>
                    <div style={{ fontSize:13, color:"#777", lineHeight:1.55, marginBottom:10 }}>{meal.note}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                      {meal.tags.map(t => <span key={t} style={{ background:"#f5f5f5", borderRadius:20, padding:"3px 10px", fontSize:11, color:"#999", fontFamily:"sans-serif" }}>#{t}</span>)}
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:"#ccc", fontFamily:"sans-serif", letterSpacing:1, marginBottom:3, textTransform:"uppercase" }}>{Math.round(meal.match*100)}% of ingredients in your lists</div>
                      <div style={{ height:3, background:"#f0f0f0", borderRadius:4 }}>
                        <div style={{ height:3, width:`${meal.match*100}%`, background:"#4caf80", borderRadius:4 }} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <button onClick={() => rateMeal(meal.id, meal.fb===1?0:1)} style={{ width:40, height:40, borderRadius:"50%", border:"none", background: meal.fb===1?"#e8f5e9":"#f5f5f5", fontSize:19, cursor:"pointer", boxShadow: meal.fb===1?"0 0 0 2px #4caf80":"none" }}>👍</button>
                    <button onClick={() => rateMeal(meal.id, meal.fb===-1?0:-1)} style={{ width:40, height:40, borderRadius:"50%", border:"none", background: meal.fb===-1?"#fce4ec":"#f5f5f5", fontSize:19, cursor:"pointer", boxShadow: meal.fb===-1?"0 0 0 2px #e57373":"none" }}>👎</button>
                  </div>
                </div>
              </div>
            ))
          }
          {Object.values(mealFeedback).some(v => v===-1) && (
            <div style={{ textAlign:"center", marginTop:8 }}>
              <button onClick={() => { const c = Object.fromEntries(Object.entries(mealFeedback).filter(([,v])=>v!==-1)); setMealFeedback(c); }} style={{ background:"none", border:"1px solid #eee", borderRadius:20, padding:"6px 16px", fontSize:12, color:"#bbb", cursor:"pointer", fontFamily:"sans-serif" }}>
                Restore hidden meals
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Add Drawer ── */}
      {adding && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:200, display:"flex", alignItems:"flex-end" }} onClick={() => setAdding(false)}>
          <div style={{ background:"#fff", width:"100%", maxWidth:480, margin:"0 auto", borderRadius:"22px 22px 0 0", padding:"24px 20px 36px" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:19, fontWeight:700, marginBottom:18 }}>Add to {S.name}</div>
            <input value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} onKeyDown={e => e.key==="Enter" && addItem()}
              style={{ width:"100%", border:"2px solid #eee", borderRadius:12, padding:"13px 14px", fontSize:16, fontFamily:"Georgia,serif", outline:"none", boxSizing:"border-box", marginBottom:12 }}
              placeholder="Item name…" autoFocus />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
              <input type="number" value={form.qty} onChange={e => setForm(f=>({...f, qty:e.target.value}))}
                style={{ border:"2px solid #eee", borderRadius:12, padding:"12px 14px", fontSize:15, fontFamily:"Georgia,serif", outline:"none" }} />
              <input value={form.unit} onChange={e => setForm(f=>({...f, unit:e.target.value}))}
                style={{ border:"2px solid #eee", borderRadius:12, padding:"12px 14px", fontSize:15, fontFamily:"Georgia,serif", outline:"none" }} placeholder="unit" />
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:20 }}>
              {Object.entries(CAT_META).map(([k,m]) => (
                <button key={k} onClick={() => setForm(f=>({...f, cat:k}))} style={{ background: form.cat===k?S.color:"#f5f5f5", color: form.cat===k?"#fff":"#888", border:"none", borderRadius:20, padding:"5px 12px", fontSize:12, cursor:"pointer", fontFamily:"sans-serif" }}>{m.emoji} {m.label}</button>
              ))}
            </div>
            <button onClick={addItem} style={{ width:"100%", background:S.color, color:"#fff", border:"none", borderRadius:14, padding:15, fontSize:16, fontFamily:"Georgia,serif", fontWeight:700, cursor:"pointer" }}>Add Item</button>
          </div>
        </div>
      )}

      {/* ── New Week Modal ── */}
      {confirmReset && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={() => setConfirmReset(false)}>
          <div style={{ background:"#fff", borderRadius:24, padding:"32px 28px", maxWidth:340, width:"100%", textAlign:"center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:42, marginBottom:12 }}>✨</div>
            <div style={{ fontSize:20, fontWeight:700, marginBottom:8 }}>Start a New Week?</div>
            <div style={{ fontSize:14, color:"#999", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:28 }}>
              This will uncheck all items across <strong>all three stores</strong> so you're ready for next week's shop.
            </div>
            <button onClick={resetAll} style={{ width:"100%", background:S.color, color:"#fff", border:"none", borderRadius:14, padding:"15px", fontSize:16, fontFamily:"Georgia,serif", fontWeight:700, cursor:"pointer", marginBottom:10 }}>Reset All Lists</button>
            <button onClick={() => setConfirmReset(false)} style={{ width:"100%", background:"none", border:"none", color:"#bbb", fontSize:14, fontFamily:"sans-serif", cursor:"pointer", padding:"8px" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── FAB ── */}
      <button onClick={() => setAdding(a => !a)} style={{
        position:"fixed", bottom:26,
        right: "max(16px, calc(50vw - 224px))",
        width:54, height:54, borderRadius:"50%",
        background:S.color, color:"#fff", border:"none", fontSize:28,
        cursor:"pointer", boxShadow:"0 4px 18px rgba(0,0,0,0.22)",
        display:"flex", alignItems:"center", justifyContent:"center",
        transform: adding?"rotate(45deg)":"none", transition:"transform 0.2s", zIndex:150
      }}>+</button>
    </div>
  );
}

// ─── Item Row Component ───────────────────────────────────────────────────────
function ItemRow({ item, color, onToggle, onAdjust, onRemove, swipeActive, swipeDelta, onTouchStart, onTouchMove, onTouchEnd }) {
  const delOp = swipeActive ? Math.min(1, Math.abs(swipeDelta)/80) : 0;
  return (
    <div style={{ position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:80, background:"#ff3b3b", display:"flex", alignItems:"center", justifyContent:"center", opacity:delOp }}>
        <span style={{ color:"#fff", fontSize:18 }}>🗑</span>
      </div>
      <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{
        display:"flex", alignItems:"center", padding:"11px 14px",
        background: item.checked?"#fafafa":"#fff", borderBottom:"1px solid #f3f3f3",
        transform: swipeActive?`translateX(${swipeDelta}px)`:"translateX(0)",
        transition: swipeActive?"none":"transform 0.25s",
        opacity: item.checked?0.45:1,
      }}>
        <button onClick={onToggle} style={{ width:26, height:26, borderRadius:"50%", flexShrink:0, background: item.checked?color:"#fff", border:`2px solid ${item.checked?color:"#ddd"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", marginRight:12, transition:"all 0.18s", fontSize:12 }}>
          {item.checked && <span style={{ color:"#fff", fontWeight:700 }}>✓</span>}
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15.5, textDecoration: item.checked?"line-through":"none", color: item.checked?"#ccc":"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{item.name}</div>
          {item.unit && <div style={{ fontSize:11, color:"#ccc", fontFamily:"sans-serif", marginTop:1 }}>{item.unit}</div>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7, flexShrink:0 }}>
          <button onClick={() => onAdjust(-0.25)} style={{ width:27, height:27, borderRadius:"50%", background:"#f4f4f4", border:"none", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#666" }}>−</button>
          <span style={{ fontSize:14, fontWeight:600, minWidth:24, textAlign:"center", color: item.checked?"#ccc":"#111" }}>{item.qty}</span>
          <button onClick={() => onAdjust(0.25)} style={{ width:27, height:27, borderRadius:"50%", background:"#f4f4f4", border:"none", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#666" }}>+</button>
        </div>
        <button onClick={onRemove} style={{ marginLeft:8, background:"none", border:"none", color:"#ddd", fontSize:18, cursor:"pointer", lineHeight:1 }}>×</button>
      </div>
    </div>
  );
}
