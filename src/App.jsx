import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_STORES = [
  { id: "traderjoes", name: "Trader Joe's", emoji: "🌻", color: "#e63946" },
  { id: "wholefoods", name: "Whole Foods", emoji: "🌿", color: "#2d6a4f" },
  { id: "larocca", name: "LaRocca's Market", emoji: "🧺", color: "#e9832d" },
];

// ─── Pre-populated lists ──────────────────────────────────────────────────────
function makeItem(name) {
  return { id: name.toLowerCase().replace(/\s+/g, "_") + "_" + Math.random().toString(36).slice(2,7), name, qty: 1, checked: false, skipped: false };
}

const DEFAULT_LISTS = {
  larocca: [
    "Apples", "Chelsea fruit", "Dinner",
  ].map(makeItem),

  wholefoods: [
    "Chicken fingers", "Banza pizza", "Dino nugs", "Fresh Parmesan", "Tea",
    "Grill", "C fruit", "Greek yogurt", "Whole wheat pasta",
    "Fluffy pita whole wheat", "Pesto", "Banana", "Chelsea yogurt",
  ].map(makeItem),

  traderjoes: [
    // Fruits & Veggies
    "Avocados (bag of minis)", "C fruit - Mixed fruit, straw", "Sweet potato",
    "Blueberries", "Apples", "Tomatoes", "Bananas", "Edamame", "Kale",
    "Mini cucumbers", "Peppers", "Big carrot", "Clementines or oranges",
    "Asparagus", "Baby corn", "Rachel salad mix", "Lemons 2-3",
    "Color carrots", "Zucchini", "Regular potato", "Corn", "Mandarin oranges",
    "Strawberries", "Nectarines (unripe, hard)", "Romaine or bib lettuce prewashed",
    "Broccoli", "Spinach", "Zigzag cut squash", "Onion", "Lime",
    // Dairy / Fridge
    "Eggs", "Mexican cheese", "Pumpkin ravioli", "Feta", "Baby bells x2",
    "Fresh mozz balls", "Almond milk", "Greek yogurt x2", "Yogurt tubes",
    "Chelsea fruit yogurt", "Orange juice", "Shredded mozz", "Pesto",
    "Pizza dough x2", "Pizza sauce", "Chelsea string cheese", "Hummus",
    "Cream cheese", "4 cheese rav", "Parm cheese", "Whipped cream", "Jake Smoothie",
    // Frozen
    "Frozen berries x2", "Falafel", "In shell edamame x2", "Turkey Meatballs",
    "Check for lunches for Jake", "Cauli pizza x1",
    "Butternut squash Mac and cheese x1", "Brown rice", "Cauli fried rice",
    "Frozen wontons", "Chicken taquitos",
    // Meat
    "Chicken for dillas", "Organic Chicken nugs", "Protein for Wed/Thurs for Jake",
    // Other
    "Baking soda", "Pistachios light salt", "Whole wheat pasta", "Pretzels",
    "Granola - purple bag, grainless granola", "Ketchup",
    "Tortilla shells (4 pack almond flour)", "Kalamata olives", "Tomato sauce",
    "Black olive can", "Peanut butter", "Dried mango", "Cashews no salt",
    "PBJ bites", "Chelsea strawberry bars or other", "Strawberry chips",
    "Apple chips", "Cashew travel packs", "Tea - chamomile", "Chickpea pasta x2",
    "Chelsea blueberry bars", "Avocado oil spray", "Peanuts light salt",
    "Light salt cashews", "Cheerios", "Travel nut packs", "Banana chips",
    "Rachel bars", "Regular flour dillas", "Cheese sandwich crackers",
    "Colored pasta x2", "Plain pasta", "Couscous (large pearls)", "Honey",
    "Bamba", "Pickles refrigerator", "Mac and cheese (shells white cheddar)",
    "Teriyaki sauce", "Saltines / oyster crackers", "General Tso sauce",
    "Cheddar rockets", "Peapod chips", "Applesauce pouches", "Pita",
    "Jake bars", "Seltzer bottles",
  ].map(makeItem),
};

const CATEGORY_MAP = {
  produce: ["apple","banana","lettuce","spinach","kale","tomato","onion","garlic","lemon","lime","avocado","broccoli","carrot","celery","pepper","cucumber","zucchini","mushroom","potato","sweet potato","ginger","herbs","basil","cilantro","parsley","arugula","beet","radish","scallion","grape","berry","strawberry","blueberry","raspberry","mango","peach","plum","melon","pear","orange","grapefruit","clementine","mandarin","asparagus","corn","squash","nectarine","romaine","romain","edamame","color carrot","zigzag","baby corn","salad mix"],
  dairy: ["milk","cheese","yogurt","butter","cream","egg","eggs","kefir","cottage","ricotta","mozzarella","mozz","parmesan","parm","cheddar","brie","feta","almond milk","string cheese","cream cheese","baby bell","hummus","whipped"],
  meat: ["chicken","beef","pork","turkey","lamb","salmon","tuna","shrimp","fish","sausage","bacon","ham","steak","ground","nugs","taquito","meatball","protein","dilla"],
  bakery: ["bread","bagel","muffin","croissant","baguette","roll","pita","tortilla","naan","sourdough","dough"],
  pantry: ["pasta","rice","quinoa","oat","cereal","flour","sugar","salt","oil","vinegar","sauce","broth","stock","canned","bean","lentil","chickpea","soup","tomato sauce","coconut milk","honey","maple","jam","peanut","almond","nut","seed","spice","herb","dried","olive","ketchup","teriyaki","general tso","couscous","cracker","saltine","oyster cracker","baking soda","cheerio","granola","pretzel","chip","pita","applesauce","cashew","pistachio","peanut butter","bamba","pb","bar","pbj","mango"],
  frozen: ["frozen","ice cream","pizza","edamame","peas","waffle","falafel","brown rice","fried rice","wonton","ravioli","rav","mac and cheese","cauli","butternut","smoothie"],
  beverages: ["water","juice","coffee","tea","wine","beer","soda","sparkling","kombucha","drink","oat milk","orange juice","seltzer","camomile","chamomile"],
  snacks: ["chip","cracker","cookie","bar","popcorn","pretzel","granola","chocolate","candy","dried fruit","trail mix","pita","applesauce","bamba","banana chip","strawberry chip","apple chip","peapod","cheddar rocket","travel pack","sandwich cracker"],
  household: ["paper towel","toilet paper","dish","soap","detergent","cleaner","trash","bag","wrap","foil","sponge","tissue","spray"],
  personal: ["shampoo","conditioner","lotion","toothpaste","deodorant","razor","vitamin","supplement"],
};

const EMOJI_OPTIONS = ["🛒","🍎","🥦","🧀","🥩","🍞","🧊","☕","🍫","🏠","🌿","🌻","🧺","🛍️","🥗","🍳","🥐","🍋","🧄","🫑"];
const COLOR_OPTIONS = ["#e63946","#2d6a4f","#e9832d","#3a86ff","#8338ec","#ff006e","#06d6a0","#ffd166","#ef476f","#118ab2","#073b4c","#b5838d"];

const MEAL_SUGGESTIONS = [
  { name: "Sheet Pan Chicken & Veggies", ingredients: ["chicken","broccoli","carrot","olive oil","garlic","lemon"] },
  { name: "Pasta Primavera", ingredients: ["pasta","zucchini","tomato","pepper","parmesan","basil"] },
  { name: "Black Bean Tacos", ingredients: ["tortilla","black bean","avocado","cheese","cilantro","lime"] },
  { name: "Salmon & Quinoa Bowl", ingredients: ["salmon","quinoa","spinach","lemon","olive oil","garlic"] },
  { name: "Stir-Fry Noodles", ingredients: ["noodles","broccoli","carrot","soy sauce","ginger","sesame oil"] },
  { name: "Greek Salad", ingredients: ["cucumber","tomato","feta","olive","red onion","olive oil"] },
  { name: "Veggie Frittata", ingredients: ["eggs","spinach","mushroom","onion","cheese","pepper"] },
  { name: "Chicken Soup", ingredients: ["chicken","carrot","celery","onion","garlic","broth","noodles"] },
  { name: "Avocado Toast", ingredients: ["sourdough","avocado","lemon","salt","egg","chili flakes"] },
  { name: "Lentil Dal", ingredients: ["lentil","tomato","onion","garlic","ginger","coconut milk","spice"] },
  { name: "Beef Stir-Fry", ingredients: ["beef","broccoli","soy sauce","garlic","ginger","rice"] },
  { name: "Caprese Salad", ingredients: ["tomato","mozzarella","basil","olive oil","balsamic"] },
  { name: "Turkey Meatballs", ingredients: ["turkey","egg","breadcrumbs","garlic","parsley","tomato sauce","pasta"] },
  { name: "Smoothie Bowl", ingredients: ["banana","berry","yogurt","granola","honey","almond milk"] },
  { name: "Grilled Cheese Soup", ingredients: ["bread","cheddar","butter","tomato soup","onion"] },
  { name: "Buddha Bowl", ingredients: ["quinoa","chickpea","avocado","kale","carrot","tahini","lemon"] },
  { name: "Shrimp Tacos", ingredients: ["shrimp","tortilla","cabbage","lime","cilantro","avocado"] },
  { name: "Oatmeal Breakfast", ingredients: ["oat","banana","almond milk","honey","berry","nut"] },
  { name: "Veggie Burger", ingredients: ["black bean","onion","garlic","egg","breadcrumbs","cheese","bun"] },
  { name: "Pesto Pasta", ingredients: ["pasta","basil","parmesan","pine nut","garlic","olive oil"] },
];

function categorize(itemName) {
  const lower = itemName.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some((kw) => lower.includes(kw))) return cat;
  }
  return "other";
}

function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    const cat = categorize(item.name);
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

// ─── Swipe hook ───────────────────────────────────────────────────────────────
function useSwipe(onSwipeLeft) {
  const startX = useRef(null);
  return {
    onTouchStart: (e) => { startX.current = e.touches[0].clientX; },
    onTouchEnd: (e) => {
      if (startX.current === null) return;
      const diff = startX.current - e.changedTouches[0].clientX;
      if (diff > 60) onSwipeLeft();
      startX.current = null;
    },
  };
}

// ─── Default state ────────────────────────────────────────────────────────────
function makeDefaultState() {
  return {
    stores: DEFAULT_STORES,
    lists: DEFAULT_LISTS,
    mealFeedback: {},
    insights: [],
  };
}

// ─── Firestore doc reference ──────────────────────────────────────────────────
const FIRESTORE_DOC = doc(db, "grocery", "shared");
const CORRECT_PIN = import.meta.env.VITE_APP_PIN;

// ─── PIN Screen ───────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }) {
  const [digits, setDigits] = useState("");
  const [shake, setShake] = useState(false);

  function handleDigit(d) {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        sessionStorage.setItem("pin_ok", "1");
        onUnlock();
      } else {
        setShake(true);
        setTimeout(() => { setShake(false); setDigits(""); }, 600);
      }
    }
  }

  function handleDelete() {
    setDigits((d) => d.slice(0, -1));
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100dvh", background: "#f8f5f0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <div style={{ fontSize: 36 }}>🛒</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#1a1a1a" }}>Enter PIN</div>
        <div style={{ display: "flex", gap: 14, animation: shake ? "shake 0.4s" : "none" }}>
          {[0,1,2,3].map((i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: digits.length > i ? "#1a1a1a" : "#e0dbd3", transition: "background 0.15s" }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12 }}>
          {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
            <button key={i} onClick={() => d === "⌫" ? handleDelete() : d !== "" ? handleDigit(d) : null}
              style={{ height: 72, borderRadius: 16, border: "none", background: d === "" ? "transparent" : "#fff", fontSize: d === "⌫" ? 20 : 24, fontWeight: 700, color: "#1a1a1a", cursor: d === "" ? "default" : "pointer", boxShadow: d === "" ? "none" : "0 1px 4px rgba(0,0,0,0.08)", fontFamily: "'Nunito', sans-serif" }}>
              {d}
            </button>
          ))}
        </div>
        <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`}</style>
      </div>
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem("pin_ok") === "1");
  const [state, setState] = useState(makeDefaultState);
  const [syncStatus, setSyncStatus] = useState("loading"); // "loading" | "synced" | "error"
  const isMounted = useRef(true);
  const [activeTab, setActiveTab] = useState("store");
  const [activeStoreId, setActiveStoreId] = useState("traderjoes");
  const [newItemText, setNewItemText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewWeekModal, setShowNewWeekModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showDeleteStoreModal, setShowDeleteStoreModal] = useState(null);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreEmoji, setNewStoreEmoji] = useState("🛒");
  const [newStoreColor, setNewStoreColor] = useState("#3a86ff");
  const [showSkipped, setShowSkipped] = useState(false);

  // ── Firestore real-time sync ────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;

    // First, check if doc exists — if not, seed it with defaults
    getDoc(FIRESTORE_DOC).then((snap) => {
      if (!snap.exists()) {
        setDoc(FIRESTORE_DOC, makeDefaultState());
      }
    }).catch(() => setSyncStatus("error"));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      FIRESTORE_DOC,
      (snap) => {
        if (!isMounted.current) return;
        if (snap.exists()) {
          setState(snap.data());
          setSyncStatus("synced");
        }
      },
      () => setSyncStatus("error")
    );

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  const { stores, lists, mealFeedback, insights } = state;

  // ── Persist to Firestore ────────────────────────────────────────────────────
  function persist(newState) {
    setState(newState);
    setDoc(FIRESTORE_DOC, newState).catch(() => setSyncStatus("error"));
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0];
  const activeList = lists[activeStoreId] || [];

  function addItem() {
    const trimmed = newItemText.trim();
    if (!trimmed) return;
    const newItem = {
      id: Date.now().toString(),
      name: trimmed,
      qty: 1,
      checked: false,
      skipped: false,
    };
    const newLists = {
      ...lists,
      [activeStoreId]: [...activeList, newItem],
    };
    persist({ ...state, lists: newLists });
    setNewItemText("");
  }

  function toggleItem(itemId) {
    const updated = activeList.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    persist({ ...state, lists: { ...lists, [activeStoreId]: updated } });
  }

  function toggleSkip(itemId) {
    const updated = activeList.map((item) =>
      item.id === itemId ? { ...item, skipped: !item.skipped, checked: false } : item
    );
    persist({ ...state, lists: { ...lists, [activeStoreId]: updated } });
    const remainingSkipped = updated.filter((i) => i.skipped).length;
    if (remainingSkipped === 0) setShowSkipped(false);
  }

  function deleteItem(itemId) {
    const updated = activeList.filter((item) => item.id !== itemId);
    persist({ ...state, lists: { ...lists, [activeStoreId]: updated } });
  }

  function changeQty(itemId, delta) {
    const updated = activeList.map((item) =>
      item.id === itemId
        ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) }
        : item
    );
    persist({ ...state, lists: { ...lists, [activeStoreId]: updated } });
  }

  function handleNewWeek() {
    const newInsights = [...(insights || [])];
    for (const store of stores) {
      for (const item of lists[store.id] || []) {
        if (item.checked) {
          newInsights.push({ name: item.name, store: store.name, date: new Date().toISOString() });
        }
      }
    }
    const resetLists = {};
    for (const store of stores) {
      resetLists[store.id] = (lists[store.id] || []).map((item) => ({
        ...item,
        checked: false,
        skipped: false,
      }));
    }
    persist({ ...state, lists: resetLists, insights: newInsights });
    setShowNewWeekModal(false);
  }

  function addStore() {
    if (!newStoreName.trim()) return;
    const id = newStoreName.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const newStore = { id, name: newStoreName.trim(), emoji: newStoreEmoji, color: newStoreColor };
    const newStores = [...stores, newStore];
    const newLists = { ...lists, [id]: [] };
    persist({ ...state, stores: newStores, lists: newLists });
    setNewStoreName("");
    setNewStoreEmoji("🛒");
    setNewStoreColor("#3a86ff");
    setShowAddStoreModal(false);
    setActiveStoreId(id);
  }

  function deleteStore(storeId) {
    const newStores = stores.filter((s) => s.id !== storeId);
    const newLists = { ...lists };
    delete newLists[storeId];
    const nextId = newStores[0]?.id || null;
    persist({ ...state, stores: newStores, lists: newLists });
    if (activeStoreId === storeId) setActiveStoreId(nextId);
    setShowDeleteStoreModal(null);
  }

  function rateMeal(mealName, rating) {
    const newFeedback = { ...mealFeedback, [mealName]: rating };
    persist({ ...state, mealFeedback: newFeedback });
  }

  // ── Render helpers ──────────────────────────────────────────────────────────
  const visibleItems = showSkipped
    ? activeList.filter((i) => i.skipped)
    : activeList.filter((i) => !i.skipped && !i.checked);

  const checkedItems = activeList.filter((i) => !i.skipped && i.checked);
  const skippedCount = activeList.filter((i) => i.skipped).length;

  const allItems = stores.flatMap((s) =>
    (lists[s.id] || []).map((item) => ({ ...item, storeName: s.name, storeId: s.id }))
  );

  const searchResults = searchQuery.length > 1
    ? allItems.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const scoredMeals = MEAL_SUGGESTIONS.map((meal) => {
    const allNames = allItems.map((i) => i.name.toLowerCase());
    const matches = meal.ingredients.filter((ing) =>
      allNames.some((n) => n.includes(ing))
    ).length;
    return { ...meal, score: matches };
  }).sort((a, b) => b.score - a.score);

  const insightCounts = {};
  for (const entry of insights || []) {
    insightCounts[entry.name] = (insightCounts[entry.name] || 0) + 1;
  }
  const topInsights = Object.entries(insightCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  // ── Styles ───────────────────────────────────────────────────────────────────
  const styles = {
    app: {
      fontFamily: "'Nunito', sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      minHeight: "100dvh",
      backgroundColor: "#f8f5f0",
      display: "flex",
      flexDirection: "column",
      position: "relative",
    },
    header: {
      padding: "16px 16px 8px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e8e2da",
      background: "#fff",
      position: "sticky",
      top: 0,
      zIndex: 50,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 800,
      color: "#1a1a1a",
      letterSpacing: "-0.3px",
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    syncDot: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: syncStatus === "synced" ? "#06d6a0" : syncStatus === "error" ? "#e63946" : "#ffd166",
      flexShrink: 0,
    },
    newWeekBtn: {
      fontSize: 12,
      fontWeight: 700,
      padding: "6px 12px",
      borderRadius: 20,
      border: "none",
      background: "#1a1a1a",
      color: "#fff",
      cursor: "pointer",
    },
    storeTabs: {
      display: "flex",
      gap: 6,
      padding: "10px 12px 4px",
      overflowX: "auto",
      background: "#fff",
      borderBottom: "1px solid #e8e2da",
      scrollbarWidth: "none",
    },
    storeTab: (store, active) => ({
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "6px 12px",
      borderRadius: 20,
      border: `2px solid ${active ? store.color : "#e0dbd3"}`,
      background: active ? store.color : "#fff",
      color: active ? "#fff" : "#555",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all 0.15s",
      flexShrink: 0,
    }),
    addStoreTab: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: "6px 10px",
      borderRadius: 20,
      border: "2px dashed #ccc",
      background: "transparent",
      color: "#999",
      fontWeight: 700,
      fontSize: 13,
      cursor: "pointer",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    content: {
      flex: 1,
      overflowY: "auto",
      padding: "12px 12px 80px",
    },
    storeHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    storeName: {
      fontSize: 20,
      fontWeight: 800,
      color: "#1a1a1a",
    },
    deleteStoreBtn: {
      fontSize: 11,
      color: "#e63946",
      background: "none",
      border: "1px solid #e63946",
      borderRadius: 12,
      padding: "3px 9px",
      cursor: "pointer",
      fontWeight: 700,
    },
    addItemRow: {
      display: "flex",
      gap: 8,
      marginBottom: 12,
    },
    input: {
      flex: 1,
      padding: "10px 14px",
      borderRadius: 12,
      border: "1.5px solid #e0dbd3",
      fontSize: 15,
      background: "#fff",
      outline: "none",
      fontFamily: "'Nunito', sans-serif",
    },
    addBtn: (color) => ({
      padding: "10px 16px",
      borderRadius: 12,
      border: "none",
      background: color,
      color: "#fff",
      fontWeight: 800,
      fontSize: 16,
      cursor: "pointer",
    }),
    skippedToggle: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
      cursor: "pointer",
    },
    skippedToggleText: {
      fontSize: 13,
      color: "#888",
      fontWeight: 700,
    },
    skippedBadge: {
      background: "#f0ebe4",
      color: "#888",
      borderRadius: 10,
      padding: "1px 7px",
      fontSize: 11,
      fontWeight: 800,
    },
    categoryLabel: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: "#aaa",
      marginTop: 16,
      marginBottom: 6,
      paddingLeft: 4,
    },
    itemRow: (checked, skipped) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 12,
      background: skipped ? "#f5f5f5" : "#fff",
      marginBottom: 6,
      border: skipped ? "1.5px dashed #ddd" : "1.5px solid #ede8e1",
      opacity: skipped ? 0.6 : 1,
      transition: "opacity 0.2s",
    }),
    checkbox: (checked, color) => ({
      width: 22,
      height: 22,
      borderRadius: 6,
      border: checked ? "none" : `2px solid ${color}`,
      background: checked ? color : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
      transition: "all 0.15s",
    }),
    itemName: (checked, skipped) => ({
      flex: 1,
      fontSize: 15,
      fontWeight: 600,
      color: checked || skipped ? "#bbb" : "#1a1a1a",
      textDecoration: checked ? "line-through" : "none",
      fontStyle: skipped ? "italic" : "normal",
    }),
    qtyRow: {
      display: "flex",
      alignItems: "center",
      gap: 4,
    },
    qtyBtn: {
      width: 22,
      height: 22,
      borderRadius: 6,
      border: "1.5px solid #e0dbd3",
      background: "#f8f5f0",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 800,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#555",
    },
    qtyNum: {
      fontSize: 13,
      fontWeight: 800,
      color: "#555",
      minWidth: 16,
      textAlign: "center",
    },
    skipBtn: (skipped) => ({
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 16,
      opacity: skipped ? 1 : 0.35,
      padding: "0 2px",
    }),
    deleteBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 16,
      color: "#e63946",
      padding: "0 2px",
      opacity: 0.5,
    },
    bottomNav: {
      position: "fixed",
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
      maxWidth: 480,
      display: "flex",
      background: "#fff",
      borderTop: "1px solid #e8e2da",
      zIndex: 100,
    },
    navBtn: (active) => ({
      flex: 1,
      padding: "10px 4px 14px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 3,
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: 10,
      fontWeight: 800,
      color: active ? "#1a1a1a" : "#bbb",
      fontFamily: "'Nunito', sans-serif",
      letterSpacing: 0.3,
    }),
    modal: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      zIndex: 200,
    },
    modalBox: {
      background: "#fff",
      borderRadius: "20px 20px 0 0",
      padding: "24px 20px 36px",
      width: "100%",
      maxWidth: 480,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: 800,
      marginBottom: 14,
      color: "#1a1a1a",
    },
    modalBtnRow: {
      display: "flex",
      gap: 10,
      marginTop: 18,
    },
    cancelBtn: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      border: "1.5px solid #e0dbd3",
      background: "#fff",
      fontWeight: 700,
      fontSize: 15,
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
    },
    confirmBtn: (color = "#1a1a1a") => ({
      flex: 1,
      padding: 12,
      borderRadius: 12,
      border: "none",
      background: color,
      color: "#fff",
      fontWeight: 800,
      fontSize: 15,
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
    }),
    emojiGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },
    emojiOption: (selected) => ({
      width: 36,
      height: 36,
      borderRadius: 8,
      border: selected ? "2.5px solid #1a1a1a" : "1.5px solid #e0dbd3",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 18,
      cursor: "pointer",
      background: selected ? "#f0ebe4" : "#fff",
    }),
    colorGrid: {
      display: "flex",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    colorSwatch: (color, selected) => ({
      width: 28,
      height: 28,
      borderRadius: "50%",
      background: color,
      cursor: "pointer",
      border: selected ? "3px solid #1a1a1a" : "2px solid transparent",
      outline: selected ? "2px solid #fff" : "none",
      outlineOffset: -4,
    }),
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (syncStatus === "loading") {
    return (
      <>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
        <div style={{ ...styles.app, alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#aaa" }}>Loading your lists…</div>
        </div>
      </>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      <div style={styles.app}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>🛒 Groceries</span>
          <div style={styles.headerRight}>
            <div style={styles.syncDot} title={syncStatus === "synced" ? "Synced" : syncStatus === "error" ? "Sync error" : "Connecting…"} />
            <button style={styles.newWeekBtn} onClick={() => setShowNewWeekModal(true)}>
              New Week
            </button>
          </div>
        </div>

        {activeTab === "store" && (
          <div style={styles.storeTabs}>
            {stores.map((store) => (
              <button
                key={store.id}
                style={styles.storeTab(store, activeStoreId === store.id)}
                onClick={() => setActiveStoreId(store.id)}
              >
                {store.emoji} {store.name}
              </button>
            ))}
            <button style={styles.addStoreTab} onClick={() => setShowAddStoreModal(true)}>
              + Store
            </button>
          </div>
        )}

        <div style={styles.content}>
          {activeTab === "store" && (
            <>
              <div style={styles.storeHeader}>
                <span style={styles.storeName}>
                  {activeStore?.emoji} {activeStore?.name}
                </span>
                {!DEFAULT_STORES.find((s) => s.id === activeStoreId) && (
                  <button style={styles.deleteStoreBtn} onClick={() => setShowDeleteStoreModal(activeStoreId)}>
                    Remove Store
                  </button>
                )}
              </div>

              <div style={styles.addItemRow}>
                <input
                  style={styles.input}
                  placeholder="Add item…"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
                <button style={styles.addBtn(activeStore?.color || "#333")} onClick={addItem}>+</button>
              </div>

              {skippedCount > 0 && (
                <div style={styles.skippedToggle} onClick={() => setShowSkipped((v) => !v)}>
                  <span style={{ fontSize: 14 }}>{showSkipped ? "◀" : "▸"}</span>
                  <span style={styles.skippedToggleText}>
                    {showSkipped ? "← Back to list" : "Show skipped this week"}
                  </span>
                  <span style={styles.skippedBadge}>{skippedCount}</span>
                </div>
              )}

              {visibleItems.length === 0 && (
                <div style={{ textAlign: "center", color: "#bbb", marginTop: 40, fontSize: 14 }}>
                  {showSkipped ? "No skipped items." : "List is empty — add something!"}
                </div>
              )}

              {groupByCategory(visibleItems).map(([cat, items]) => (
                <div key={cat}>
                  <div style={styles.categoryLabel}>{cat}</div>
                  {items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      storeColor={activeStore?.color}
                      styles={styles}
                      onToggle={() => toggleItem(item.id)}
                      onToggleSkip={() => toggleSkip(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onQty={(d) => changeQty(item.id, d)}
                    />
                  ))}
                </div>
              ))}
              {checkedItems.length > 0 && (
                <div>
                  <div style={styles.categoryLabel}>checked off</div>
                  {checkedItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      storeColor={activeStore?.color}
                      styles={styles}
                      onToggle={() => toggleItem(item.id)}
                      onToggleSkip={() => toggleSkip(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onQty={(d) => changeQty(item.id, d)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "search" && (
            <>
              <input
                style={{ ...styles.input, width: "100%", boxSizing: "border-box", marginBottom: 12 }}
                placeholder="Search all stores…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchResults.length === 0 && searchQuery.length > 1 && (
                <div style={{ textAlign: "center", color: "#bbb", marginTop: 32 }}>No results found.</div>
              )}
              {searchResults.map((item) => {
                const store = stores.find((s) => s.id === item.storeId);
                return (
                  <div key={item.id + item.storeId} style={{ ...styles.itemRow(item.checked, item.skipped), flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a" }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: store?.color || "#888", fontWeight: 700, marginTop: 2 }}>
                      {store?.emoji} {store?.name}
                    </div>
                  </div>
                );
              })}
            </>
          )}

          {activeTab === "meals" && (
            <>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                Scored by how many ingredients you already have on your lists.
              </div>
              {scoredMeals.map((meal) => (
                <div key={meal.name} style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 8, border: "1.5px solid #ede8e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 800, fontSize: 15 }}>{meal.name}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => rateMeal(meal.name, mealFeedback[meal.name] === "up" ? null : "up")}
                        style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", opacity: mealFeedback[meal.name] === "up" ? 1 : 0.3 }}>👍</button>
                      <button onClick={() => rateMeal(meal.name, mealFeedback[meal.name] === "down" ? null : "down")}
                        style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", opacity: mealFeedback[meal.name] === "down" ? 1 : 0.3 }}>👎</button>
                    </div>
                  </div>
                  <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {meal.ingredients.map((ing) => {
                      const have = allItems.some((i) => i.name.toLowerCase().includes(ing));
                      return (
                        <span key={ing} style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: have ? "#d8f3dc" : "#f0ebe4", color: have ? "#2d6a4f" : "#aaa" }}>
                          {ing}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 12, color: "#aaa", fontWeight: 700 }}>
                    {meal.score}/{meal.ingredients.length} ingredients on your list
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "insights" && (
            <>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 14 }}>
                Your most-purchased items across all stores.
              </div>
              {topInsights.length === 0 && (
                <div style={{ textAlign: "center", color: "#bbb", marginTop: 40 }}>
                  Complete a week to see insights!
                </div>
              )}
              {topInsights.map(([name, count], i) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: "12px 14px", borderRadius: 12, marginBottom: 8, border: "1.5px solid #ede8e1" }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "#e0dbd3", width: 28 }}>#{i + 1}</span>
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{name}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "#888" }}>{count}×</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div style={styles.bottomNav}>
          {[
            { id: "store", icon: "🏪", label: "Lists" },
            { id: "search", icon: "🔍", label: "Search" },
            { id: "meals", icon: "🍽️", label: "Meals" },
            { id: "insights", icon: "📊", label: "Insights" },
          ].map((tab) => (
            <button key={tab.id} style={styles.navBtn(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {showNewWeekModal && (
        <div style={styles.modal} onClick={() => setShowNewWeekModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Start a New Week?</div>
            <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
              All checked items will be logged to Insights. All items — including skipped ones — will reset back to active for the new week.
            </p>
            <div style={styles.modalBtnRow}>
              <button style={styles.cancelBtn} onClick={() => setShowNewWeekModal(false)}>Cancel</button>
              <button style={styles.confirmBtn()} onClick={handleNewWeek}>Reset Week</button>
            </div>
          </div>
        </div>
      )}

      {showAddStoreModal && (
        <div style={styles.modal} onClick={() => setShowAddStoreModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Add a Store</div>
            <input
              style={{ ...styles.input, width: "100%", boxSizing: "border-box", marginBottom: 14 }}
              placeholder="Store name…"
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStore()}
              autoFocus
            />
            <div style={{ fontSize: 12, fontWeight: 800, color: "#aaa", letterSpacing: 1, marginBottom: 8 }}>EMOJI</div>
            <div style={styles.emojiGrid}>
              {EMOJI_OPTIONS.map((em) => (
                <div key={em} style={styles.emojiOption(newStoreEmoji === em)} onClick={() => setNewStoreEmoji(em)}>
                  {em}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#aaa", letterSpacing: 1, marginBottom: 8 }}>COLOR</div>
            <div style={styles.colorGrid}>
              {COLOR_OPTIONS.map((c) => (
                <div key={c} style={styles.colorSwatch(c, newStoreColor === c)} onClick={() => setNewStoreColor(c)} />
              ))}
            </div>
            <div style={styles.modalBtnRow}>
              <button style={styles.cancelBtn} onClick={() => setShowAddStoreModal(false)}>Cancel</button>
              <button style={styles.confirmBtn(newStoreColor)} onClick={addStore}>Add Store</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteStoreModal && (
        <div style={styles.modal} onClick={() => setShowDeleteStoreModal(null)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalTitle}>Remove Store?</div>
            <p style={{ color: "#666", fontSize: 14, lineHeight: 1.5 }}>
              This will permanently delete{" "}
              <strong>{stores.find((s) => s.id === showDeleteStoreModal)?.name}</strong> and all its items.
            </p>
            <div style={styles.modalBtnRow}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteStoreModal(null)}>Cancel</button>
              <button style={styles.confirmBtn("#e63946")} onClick={() => deleteStore(showDeleteStoreModal)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Item Row Component ───────────────────────────────────────────────────────
function ItemRow({ item, storeColor, styles, onToggle, onToggleSkip, onDelete, onQty }) {
  const swipe = useSwipe(onDelete);
  return (
    <div style={styles.itemRow(item.checked, item.skipped)} {...swipe}>
      <div
        style={styles.checkbox(item.checked, storeColor || "#333")}
        onClick={!item.skipped ? onToggle : undefined}
      >
        {item.checked && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
      </div>
      <span style={styles.itemName(item.checked, item.skipped)}>{item.name}</span>
      {!item.skipped && (
        <div style={styles.qtyRow}>
          <div style={styles.qtyBtn} onClick={() => onQty(-1)}>−</div>
          <span style={styles.qtyNum}>{item.qty || 1}</span>
          <div style={styles.qtyBtn} onClick={() => onQty(1)}>+</div>
        </div>
      )}
      <button style={styles.skipBtn(item.skipped)} onClick={onToggleSkip} title={item.skipped ? "Un-skip this week" : "Skip this week"}>
        {item.skipped ? "⏸️" : "⏸"}
      </button>
      <button style={styles.deleteBtn} onClick={onDelete}>✕</button>
    </div>
  );
}
