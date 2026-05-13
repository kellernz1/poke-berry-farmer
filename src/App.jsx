import { useState, useEffect, useRef } from 'react';

// --- BANCO DE DADOS ---
const BERRIES = {
  oran: { id: 'oran', name: "Oran", growthTime: 10, value: 5, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/oran-berry.png" },
  pecha: { id: 'pecha', name: "Pecha", growthTime: 15, value: 8, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pecha-berry.png" },
  sitrus: { id: 'sitrus', name: "Sitrus", growthTime: 60, value: 30, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sitrus-berry.png" },
  qualot: { id: 'qualot', name: "Qualot", growthTime: 300, value: 150, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/qualot-berry.png" },
  enigma: { id: 'enigma', name: "Enigma", growthTime: 3600, value: 500, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/enigma-berry.png" }
};

const HELPERS = {
  water: { id: 'water', basePrice: 50, stages: [ { name: "Squirtle", minLvl: 0, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png", effect: "Tempo -20%", mult: 0.8 }, { name: "Wartortle", minLvl: 10, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png", effect: "Tempo -40%", mult: 0.6 }, { name: "Blastoise", minLvl: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png", effect: "Tempo -60%", mult: 0.4 } ] },
  collector: { id: 'collector', basePrice: 200, stages: [ { name: "Meowth", minLvl: 0, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png", effect: "Colhe Automática", bonusChance: 0 }, { name: "Persian", minLvl: 15, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png", effect: "Auto + 20% Chance 2x", bonusChance: 0.2 } ] },
  fertilizer: { id: 'fertilizer', basePrice: 150, stages: [ { name: "Bulbasaur", minLvl: 0, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png", effect: "10% chance 2x", mult: 0.1 }, { name: "Ivysaur", minLvl: 10, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png", effect: "25% chance 2x", mult: 0.25 }, { name: "Venusaur", minLvl: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png", effect: "50% chance 2x", mult: 0.5 } ] },
  planter: { id: 'planter', basePrice: 500, stages: [ { name: "Cherubi", minLvl: 0, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/420.png", effect: "10% Auto-Replant", chance: 0.1 }, { name: "Cherrim", minLvl: 10, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/421.png", effect: "30% Auto-Replant", chance: 0.3 }, { name: "Celebi", minLvl: 25, sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/251.png", effect: "100% Auto-Replant", chance: 1.0 } ] }
};

const KEY_ITEMS = {
  wailmerPail: { id: 'wailmerPail', name: "Wailmer Pail", price: 5000, desc: "Tempo -10%", icon: "🚿" },
  amuletCoin: { id: 'amuletCoin', name: "Amulet Coin", price: 15000, desc: "Ganhos +50%", icon: "🪙" },
  machoBrace: { id: 'machoBrace', name: "Macho Brace", price: 25000, desc: "BerryDex x2", icon: "💪" }
};

const WILD_ENCOUNTERS = [
  { id: 'pikachu', name: "Pikachu", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png", type: 'money', amount: 150, buffDesc: "Spawns Rocket +1%" },
  { id: 'eevee', name: "Eevee", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png", type: 'money', amount: 300, buffDesc: "Mutação +10%" },
  { id: 'pidgey', name: "Pidgey", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png", type: 'berry', berryId: 'sitrus', amount: 3, buffDesc: "Crescimento +5%" },
  { id: 'mew', name: "Mew", sprite: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png", type: 'money', amount: 2000, buffDesc: "Venda +10%" }
];

const ACHIEVEMENTS = [
  { id: 'first_harvest', name: "Fazendeiro", desc: "Colha 100 berries no total", req: (state) => Object.values(state.stats).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) >= 100 },
  { id: 'rich_boy', name: "Magnata", desc: "Acumule ₽ 50.000 de uma vez", req: (state) => state.money >= 50000 },
  { id: 'defender', name: "Policial", desc: "Derrote a Equipe Rocket 5 vezes", req: (state) => (state.stats.rocketsDefeated || 0) >= 5 },
  { id: 'traveler', name: "Viajante", desc: "Viaje para Johto", req: (state) => state.regionIndex >= 1 }
];

const REGIONS = ["Kanto", "Johto", "Hoenn", "Sinnoh", "Unova", "Kalos", "Alola", "Galar", "Paldea"];

const getHelperStage = (helperId, level) => HELPERS[helperId].stages.slice().reverse().find(s => level >= s.minLvl) || HELPERS[helperId].stages[0];
const getMasteryLevel = (totalHarvested) => Math.floor((totalHarvested || 0) / 10);

const checkMutation = (beds, index, baseBerry, eeveeBonus) => {
  const left = index > 0 && !beds[index-1].isEmpty ? beds[index-1].berryId : null;
  const right = index < beds.length - 1 && !beds[index+1].isEmpty ? beds[index+1].berryId : null;
  const neighbors = [left, right];
  const mult = eeveeBonus ? 1.1 : 1.0;

  if ((baseBerry === 'oran' && neighbors.includes('pecha')) || (baseBerry === 'pecha' && neighbors.includes('oran'))) if (Math.random() < (0.10 * mult)) return 'sitrus';
  if ((baseBerry === 'pecha' && neighbors.includes('sitrus')) || (baseBerry === 'sitrus' && neighbors.includes('pecha'))) if (Math.random() < (0.05 * mult)) return 'qualot';
  if ((baseBerry === 'sitrus' && neighbors.includes('qualot')) || (baseBerry === 'qualot' && neighbors.includes('sitrus'))) if (Math.random() < (0.02 * mult)) return 'enigma';
  return baseBerry;
};

const generateQuest = (id) => {
  const templates = [
     { desc: "Colha 50 Oran", type: "harvest", targetId: "oran", target: 50, reward: 500 },
     { desc: "Venda 30 Pecha", type: "sell", targetId: "pecha", target: 30, reward: 1000 },
     { desc: "Ache 2 Selvagens", type: "wild", targetId: "any", target: 2, reward: 3000 }
  ];
  const q = templates[Math.floor(Math.random() * templates.length)];
  return { ...q, id, progress: 0 };
};

const updateQuestsProgress = (quests, type, targetId, amount) => quests.map(q => (q.type === type && (q.targetId === 'any' || q.targetId === targetId)) ? { ...q, progress: Math.min(q.progress + amount, q.target) } : q);

const INITIAL_STATE = {
  money: 0, regionIndex: 0, unlockedBeds: 2,
  inventory: { oran: 0, pecha: 0, sitrus: 0, qualot: 0, enigma: 0 },
  stats: { oran: 0, pecha: 0, sitrus: 0, qualot: 0, enigma: 0, rocketsDefeated: 0 },
  helpers: { water: 0, collector: 0, fertilizer: 0, planter: 0 },
  beds: Array(12).fill({ isEmpty: true, berryId: null, progress: 0, isShiny: false }),
  tools: { wailmerPail: false, amuletCoin: false, machoBrace: false },
  pasture: {}, 
  wildPokemon: { active: false, timeLeft: 0 },
  rocketEvent: { active: false, timeLeft: 0 }, 
  achievements: {}, 
  quests: [generateQuest(0), generateQuest(1), generateQuest(2)],
  lastTick: Date.now(),
};

export default function App() {
  const [activeTab, setActiveTab] = useState('loja');
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [evolvingHelper, setEvolvingHelper] = useState(null); 
  const floatingTextId = useRef(0);

  const triggerFloatingText = (text, x, y, color = 'text-white') => {
    floatingTextId.current += 1;
    const id = floatingTextId.current;
    setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 1000);
  };

  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('pokeBerrySave');
    if (saved) {
      try {
        const parsedSave = JSON.parse(saved);
        const now = Date.now();
        const offlineSeconds = Math.floor((now - parsedSave.lastTick) / 1000);
        
        const waterLvl = parsedSave.helpers?.water || 0;
        const tools = parsedSave.tools || { wailmerPail: false, amuletCoin: false, machoBrace: false };
        const pidgeyBonus = parsedSave.pasture?.pidgey > 0 ? 0.95 : 1.0;
        const waterMult = (waterLvl > 0 ? getHelperStage('water', waterLvl).mult : 1.0) * (tools.wailmerPail ? 0.9 : 1.0) * pidgeyBonus;

        let savedBeds = parsedSave.beds || [];
        while (savedBeds.length < 12) savedBeds.push({ isEmpty: true, berryId: null, progress: 0, isShiny: false });

        const updatedBeds = savedBeds.map(bed => {
          if (!bed.isEmpty) {
            const masteryLvl = getMasteryLevel(parsedSave.stats?.[bed.berryId]);
            const masteryTimeMult = 1 - Math.min(masteryLvl * 0.01, 0.50); 
            const maxTime = (BERRIES[bed.berryId]?.growthTime || 10) * waterMult * masteryTimeMult;
            return { ...bed, progress: Math.min(bed.progress + offlineSeconds, maxTime) };
          }
          return bed;
        });

        return { 
          ...INITIAL_STATE, ...parsedSave, 
          inventory: { ...INITIAL_STATE.inventory, ...(parsedSave.inventory || {}) },
          stats: { ...INITIAL_STATE.stats, ...(parsedSave.stats || {}), rocketsDefeated: parsedSave.stats?.rocketsDefeated || 0 },
          helpers: { ...INITIAL_STATE.helpers, ...(parsedSave.helpers || {}) },
          pasture: parsedSave.pasture || {},
          regionIndex: parsedSave.regionIndex || 0,
          achievements: parsedSave.achievements || {},
          tools, wildPokemon: { active: false, timeLeft: 0 }, rocketEvent: { active: false, timeLeft: 0 }, beds: updatedBeds, lastTick: now,
          quests: parsedSave.quests || [generateQuest(0), generateQuest(1), generateQuest(2)]
        };
      } catch (error) {
        console.error("Save file corrupted, starting fresh:", error);
        localStorage.removeItem('pokeBerrySave'); // Limpa o dado quebrado
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  const [selectedSeed, setSelectedSeed] = useState('oran');

  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const now = Date.now();
        let newInventory = { ...prev.inventory };
        let newStats = { ...prev.stats };
        let newQuests = [...prev.quests];
        let newAchievements = { ...prev.achievements };
        let newMoney = prev.money;

        const tools = prev.tools;
        const machoMult = tools.machoBrace ? 2 : 1;
        const pidgeyBonus = prev.pasture?.pidgey > 0 ? 0.95 : 1.0;
        const waterLvl = prev.helpers?.water || 0;
        const waterMult = (waterLvl > 0 ? getHelperStage('water', waterLvl).mult : 1.0) * (tools.wailmerPail ? 0.9 : 1.0) * pidgeyBonus;
        const fertLvl = prev.helpers?.fertilizer || 0;
        const fertMult = fertLvl > 0 ? getHelperStage('fertilizer', fertLvl).mult : 0;
        const collLvl = prev.helpers?.collector || 0;
        const collStage = getHelperStage('collector', collLvl);
        const planterLvl = prev.helpers?.planter || 0;
        const planterStage = getHelperStage('planter', planterLvl);
        const eeveeBonus = prev.pasture?.eevee > 0;

        const updatedBeds = prev.beds.map((bed, index) => {
          if (index >= prev.unlockedBeds || bed.isEmpty) return bed;
          
          const masteryLvl = getMasteryLevel(prev.stats[bed.berryId]);
          const masteryTimeMult = 1 - Math.min(masteryLvl * 0.01, 0.50);
          const maxTime = BERRIES[bed.berryId].growthTime * waterMult * masteryTimeMult;
          
          let newProgress = bed.progress + 1;

          if (newProgress >= maxTime && collLvl > 0) {
             let yieldAmt = bed.isShiny ? 10 : 1; 
             if (Math.random() < fertMult) yieldAmt *= 2;
             if (Math.random() < collStage.bonusChance) yieldAmt *= 2;
             const finalBerry = checkMutation(prev.beds, index, bed.berryId, eeveeBonus);
             
             newInventory[finalBerry] = (newInventory[finalBerry] || 0) + yieldAmt;
             newStats[finalBerry] = (newStats[finalBerry] || 0) + (yieldAmt * machoMult);
             newQuests = updateQuestsProgress(newQuests, 'harvest', finalBerry, yieldAmt);

             if (planterLvl > 0 && Math.random() < planterStage.chance) {
                const newMasteryLvl = getMasteryLevel(newStats[bed.berryId]);
                let startProgress = 0;
                if (newMasteryLvl >= 50 && Math.random() < 0.05) startProgress = 999999; 
                return { isEmpty: false, berryId: bed.berryId, progress: startProgress, isShiny: Math.random() < 0.05 }; 
             }
             return { isEmpty: true, berryId: null, progress: 0, isShiny: false };
          }
          return { ...bed, progress: Math.min(newProgress, maxTime) };
        });

        let newWild = prev.wildPokemon;
        let newRocket = prev.rocketEvent;

        if (newRocket && newRocket.active) {
            newRocket.timeLeft -= 1;
            if (newRocket.timeLeft <= 0) {
                newMoney = Math.max(0, Math.floor(newMoney * 0.95));
                newRocket = { active: false };
            }
        } else if (newWild && newWild.active) {
            newWild.timeLeft -= 1;
            if (newWild.timeLeft <= 0) newWild = { active: false };
        } else {
            const pikachuBonus = prev.pasture?.pikachu > 0 ? 0.01 : 0;
            const rand = Math.random();
            if (rand < (0.01 + pikachuBonus)) {
                newRocket = { active: true, timeLeft: 10, x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 80) + 10 };
            } else if (rand < 0.02) {
                const poke = WILD_ENCOUNTERS[Math.floor(Math.random() * WILD_ENCOUNTERS.length)];
                newWild = { active: true, ...poke, timeLeft: 15, x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 80) + 10 }; 
            }
        }

        const stateForCheck = { ...prev, money: newMoney, stats: newStats };
        ACHIEVEMENTS.forEach(ach => {
            if (!newAchievements[ach.id] && ach.req(stateForCheck)) newAchievements[ach.id] = true;
        });

        const newState = { ...prev, beds: updatedBeds, inventory: newInventory, stats: newStats, money: newMoney, quests: newQuests, wildPokemon: newWild, rocketEvent: newRocket, achievements: newAchievements, lastTick: now };
        localStorage.setItem('pokeBerrySave', JSON.stringify(newState));
        return newState;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrestige = (e) => {
    setGameState(prev => {
      const nextRegion = prev.regionIndex + 1;
      if (nextRegion >= REGIONS.length) return prev;
      if (window.confirm(`Viajar para ${REGIONS[nextRegion]}?`)) {
        triggerFloatingText(`Bem-vindo a ${REGIONS[nextRegion]}!`, e.clientX, e.clientY, 'text-yellow-400');
        return { ...INITIAL_STATE, regionIndex: nextRegion, stats: prev.stats, achievements: prev.achievements, pasture: prev.pasture, lastTick: Date.now() };
      }
      return prev;
    });
  };

  const plantBerry = (index, e) => {
    setGameState(prev => {
      const newBeds = [...prev.beds];
      if (newBeds[index].isEmpty) {
        const masteryLvl = getMasteryLevel(prev.stats[selectedSeed]);
        let startProgress = 0;
        if (masteryLvl >= 50 && Math.random() < 0.05) {
            startProgress = 999999;
            if (e) triggerFloatingText("⭐ Maestria!", e.clientX, e.clientY, 'text-yellow-400');
        } else {
            if (e) triggerFloatingText("🌱", e.clientX, e.clientY);
        }
        newBeds[index] = { isEmpty: false, berryId: selectedSeed, progress: startProgress, isShiny: Math.random() < 0.05 };
      }
      return { ...prev, beds: newBeds };
    });
  };

  const harvestBerry = (index, e) => {
    setGameState(prev => {
      const newBeds = [...prev.beds];
      const bed = newBeds[index];
      
      const pidgeyBonus = prev.pasture?.pidgey > 0 ? 0.95 : 1.0;
      const waterMult = (prev.helpers?.water > 0 ? getHelperStage('water', prev.helpers.water).mult : 1.0) * (prev.tools.wailmerPail ? 0.9 : 1.0) * pidgeyBonus;
      const masteryLvl = getMasteryLevel(prev.stats[bed.berryId]);
      const masteryTimeMult = 1 - Math.min(masteryLvl * 0.01, 0.50);
      const maxTime = BERRIES[bed.berryId].growthTime * waterMult * masteryTimeMult;

      if (!bed.isEmpty && bed.progress >= maxTime) {
        let yieldAmt = bed.isShiny ? 10 : 1;
        if (prev.helpers?.fertilizer > 0 && Math.random() < getHelperStage('fertilizer', prev.helpers.fertilizer).mult) yieldAmt *= 2;
        
        const finalBerry = checkMutation(prev.beds, index, bed.berryId, prev.pasture?.eevee > 0);
        if (e) triggerFloatingText(`+${yieldAmt} ${BERRIES[finalBerry].name}`, e.clientX, e.clientY, bed.isShiny ? 'text-yellow-400' : 'text-green-400');

        const newInventory = { ...prev.inventory };
        newInventory[finalBerry] = (newInventory[finalBerry] || 0) + yieldAmt;
        let newQuests = updateQuestsProgress(prev.quests, 'harvest', finalBerry, yieldAmt);
        
        if (prev.helpers?.planter > 0 && Math.random() < getHelperStage('planter', prev.helpers.planter).chance) {
          const newMasteryLvl = getMasteryLevel(prev.stats[bed.berryId]);
          let startProgress = 0;
          if (newMasteryLvl >= 50 && Math.random() < 0.05) startProgress = 999999;
          newBeds[index] = { isEmpty: false, berryId: bed.berryId, progress: startProgress, isShiny: Math.random() < 0.05 };
        } else {
          newBeds[index] = { isEmpty: true, berryId: null, progress: 0, isShiny: false };
        }
        
        return { ...prev, beds: newBeds, inventory: newInventory, quests: newQuests };
      }
      return prev;
    });
  };

  const sellBerries = (berryId, e) => {
    setGameState(prev => {
      const qty = prev.inventory[berryId] || 0;
      if (qty > 0) {
        const regionBonus = 1 + (prev.regionIndex || 0); 
        const dexBonus = 1 + (Math.floor((prev.stats[berryId] || 0) / 10) * 0.01);
        const amuletMult = prev.tools.amuletCoin ? 1.5 : 1.0;
        const achievBonus = 1 + (Object.keys(prev.achievements || {}).length * 0.05); 
        const mewBonus = prev.pasture?.mew > 0 ? 1.10 : 1.0;
        
        const earnings = Math.floor(qty * BERRIES[berryId].value * regionBonus * dexBonus * amuletMult * achievBonus * mewBonus);
        if (e) triggerFloatingText(`+₽${earnings}`, e.clientX, e.clientY, 'text-yellow-300');

        return { ...prev, money: prev.money + earnings, inventory: { ...prev.inventory, [berryId]: 0 }, quests: updateQuestsProgress(prev.quests, 'sell', berryId, qty) };
      }
      return prev;
    });
  };

  const catchWildPokemon = (e) => {
    setGameState(prev => {
       if (!prev.wildPokemon?.active) return prev;
       let newMoney = prev.money;
       let newInv = { ...prev.inventory };
       const wildId = prev.wildPokemon.id;
       
       if (prev.wildPokemon.type === 'money') {
         newMoney += prev.wildPokemon.amount;
         triggerFloatingText(`+₽${prev.wildPokemon.amount}`, e.clientX, e.clientY, 'text-yellow-300');
       }
       if (prev.wildPokemon.type === 'berry') {
         newInv[prev.wildPokemon.berryId] = (newInv[prev.wildPokemon.berryId] || 0) + prev.wildPokemon.amount;
         triggerFloatingText(`+${prev.wildPokemon.amount} ${BERRIES[prev.wildPokemon.berryId].name}`, e.clientX, e.clientY, 'text-green-300');
       }
       
       const newPasture = { ...prev.pasture, [wildId]: (prev.pasture[wildId] || 0) + 1 };
       return { ...prev, money: newMoney, inventory: newInv, wildPokemon: { active: false }, pasture: newPasture, quests: updateQuestsProgress(prev.quests, 'wild', 'any', 1) };
    });
  };

  const defeatRocket = (e) => {
      setGameState(prev => {
         if (!prev.rocketEvent?.active) return prev;
         const reward = 500 * (1 + prev.regionIndex); 
         triggerFloatingText(`Derrotado! +₽${reward}`, e.clientX, e.clientY, 'text-blue-300');
         const newStats = { ...prev.stats, rocketsDefeated: (prev.stats.rocketsDefeated || 0) + 1 };
         return { ...prev, money: prev.money + reward, stats: newStats, rocketEvent: { active: false } };
      });
  };

  const claimQuest = (questIndex, e) => {
    setGameState(prev => {
        const quest = prev.quests[questIndex];
        if (quest.progress >= quest.target) {
            triggerFloatingText(`Quest! +₽${quest.reward}`, e.clientX, e.clientY, 'text-blue-300');
            const newQuests = [...prev.quests];
            newQuests[questIndex] = generateQuest(quest.id);
            return { ...prev, money: prev.money + quest.reward, quests: newQuests };
        }
        return prev;
    });
  };

  const buyHelper = (helperId, e) => {
    setGameState(prev => {
      const qtyOwned = prev.helpers[helperId] || 0;
      const cost = Math.floor(HELPERS[helperId].basePrice * Math.pow(1.15, qtyOwned));
      if (prev.money >= cost) {
        triggerFloatingText(`-₽${cost}`, e.clientX, e.clientY, 'text-red-400');
        const currentStageName = getHelperStage(helperId, qtyOwned).name;
        const nextStageName = getHelperStage(helperId, qtyOwned + 1).name;
        if (currentStageName !== nextStageName) {
           setEvolvingHelper(helperId);
           setTimeout(() => setEvolvingHelper(null), 1500); 
        }
        return { ...prev, money: prev.money - cost, helpers: { ...prev.helpers, [helperId]: qtyOwned + 1 } };
      }
      return prev;
    });
  };

  const buyLand = (e) => {
    setGameState(prev => {
      const cost = 500 * Math.pow(2, prev.unlockedBeds - 2);
      if (prev.money >= cost && prev.unlockedBeds < 12) {
        triggerFloatingText(`-₽${cost}`, e.clientX, e.clientY, 'text-red-400');
        return { ...prev, money: prev.money - cost, unlockedBeds: prev.unlockedBeds + 1 };
      }
      return prev;
    });
  };

  const buyTool = (toolId, e) => {
    setGameState(prev => {
        const item = KEY_ITEMS[toolId];
        if (prev.money >= item.price && !prev.tools[toolId]) {
            triggerFloatingText(`Item Obtido!`, e.clientX, e.clientY, 'text-orange-400');
            return { ...prev, money: prev.money - item.price, tools: { ...prev.tools, [toolId]: true } };
        }
        return prev;
    });
  };

  const handleResetSave = () => {
    if (window.confirm("🚨 Apagar TODO o seu progresso?")) {
      localStorage.removeItem('pokeBerrySave');
      setGameState(INITIAL_STATE);
    }
  };

  const currentRegion = gameState.regionIndex || 0;
  const prestigeCost = 100000 * Math.pow(5, currentRegion);
  const nextRegionName = REGIONS[currentRegion + 1] || "Fim";

  return (
    <div className="min-h-screen p-8 flex flex-col md:flex-row gap-8 text-[10px] md:text-xs text-gba-dark relative">
      {floatingTexts.map(ft => (
        <div key={ft.id} className={`fixed font-bold text-sm ${ft.color} floating-text pointer-events-none z-50`} style={{ left: ft.x, top: ft.y }}>
          {ft.text}
        </div>
      ))}

      {/* COLUNA ESQUERDA (FAZENDA PRINCIPAL) */}
      <div className="flex-1 space-y-6">
        <header className="gba-dialog-blue p-4 shadow-lg flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl mb-2 drop-shadow-md">Poké-Berry Farmer</h1>
            <p className="text-lg">PokéDollars: ₽ {gameState.money}</p>
          </div>
          <div className="text-right">
            <p className="text-yellow-300 drop-shadow-md text-lg">📍 {REGIONS[currentRegion]}</p>
            <p className="text-white text-[8px]">(Multiplicador: x{currentRegion + 1})</p>
          </div>
        </header>

        {gameState.money >= (prestigeCost * 0.8) && currentRegion < REGIONS.length - 1 && (
          <div className="gba-dialog p-4 bg-yellow-100/90 text-center border-yellow-500 animate-pulse">
            <h2 className="text-yellow-800 mb-2">A Elite 4 de {REGIONS[currentRegion]} desafia você!</h2>
            <button onClick={handlePrestige} disabled={gameState.money < prestigeCost} className="bg-yellow-500 text-white px-4 py-2 rounded shadow border-b-4 border-yellow-700 active:translate-y-[2px] active:border-b-0 disabled:opacity-50 cursor-pointer">
              Viajar para {nextRegionName} (Custa ₽ {prestigeCost})
            </button>
          </div>
        )}

        <section className={`relative gba-dialog p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-[url('https://www.transparenttextures.com/patterns/dirt.png')] bg-amber-900/10 transition-colors ${gameState.rocketEvent?.active ? 'ring-4 ring-red-500 ring-inset bg-red-900/20' : ''}`}>
          {gameState.wildPokemon?.active && (
            <div onClick={catchWildPokemon} className="absolute z-10 cursor-pointer animate-bounce flex flex-col items-center p-2 rounded-full hover:bg-white/50 transition-colors" style={{ top: `${gameState.wildPokemon.y}%`, left: `${gameState.wildPokemon.x}%`, transform: 'translate(-50%, -50%)' }}>
              <img src={gameState.wildPokemon.sprite} alt="Wild" className="w-16 h-16 drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
              <span className="bg-white border-2 border-gba-dark text-[8px] px-1 rounded shadow text-blue-600 font-bold">!</span>
            </div>
          )}

          {gameState.rocketEvent?.active && (
            <div onClick={defeatRocket} className="absolute z-20 cursor-pointer animate-pulse flex flex-col items-center p-2 rounded-full hover:bg-red-500/50 transition-colors" style={{ top: `${gameState.rocketEvent.y}%`, left: `${gameState.rocketEvent.x}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="relative">
                 <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png" alt="Rocket" className="w-20 h-20 drop-shadow-lg" style={{ imageRendering: 'pixelated' }} />
                 <span className="absolute top-0 right-0 text-red-600 text-xl font-bold drop-shadow-[0_2px_2px_rgba(255,255,255,1)]">R</span>
              </div>
              <span className="bg-black border-2 border-red-600 text-[10px] text-white px-2 rounded shadow font-bold mt-1">DERROTAR! ({gameState.rocketEvent.timeLeft}s)</span>
            </div>
          )}

          {gameState.beds.map((bed, i) => {
             if (i > gameState.unlockedBeds) return null;
             if (i === gameState.unlockedBeds) {
               if (gameState.unlockedBeds >= 12) return null; 
               const landCost = 500 * Math.pow(2, gameState.unlockedBeds - 2);
               return (
                 <div key={i} onClick={buyLand} className="h-32 border-4 border-dashed border-yellow-600 bg-yellow-100/80 hover:bg-yellow-200 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 z-0">
                   <span className="text-yellow-800 font-bold mb-2">Comprar Lote</span>
                   <span className="text-yellow-600 bg-white px-2 py-1 border border-yellow-600 rounded">₽ {landCost}</span>
                 </div>
               );
             }

             const berryInfo = bed.berryId ? BERRIES[bed.berryId] : null;
             const pidgeyBonus = gameState.pasture?.pidgey > 0 ? 0.95 : 1.0;
             const waterMult = (gameState.helpers?.water > 0 ? getHelperStage('water', gameState.helpers.water).mult : 1.0) * (gameState.tools.wailmerPail ? 0.9 : 1.0) * pidgeyBonus;
             
             const masteryLvl = getMasteryLevel(gameState.stats?.[bed.berryId]);
             const masteryTimeMult = 1 - Math.min(masteryLvl * 0.01, 0.50);
             const maxTime = berryInfo ? berryInfo.growthTime * waterMult * masteryTimeMult : 0;
             
             const isReady = bed.progress >= maxTime;
             const progressPercent = berryInfo ? Math.min((bed.progress / maxTime) * 100, 100) : 0;
             
             let barColor = 'bg-red-500';
             if (progressPercent >= 25) barColor = 'bg-yellow-400';
             if (progressPercent >= 75) barColor = 'bg-green-500';

             const shinyStyle = bed.isShiny ? { filter: 'drop-shadow(0 0 10px gold) brightness(1.2) sepia(1) hue-rotate(-50deg) saturate(3)' } : {};

             return (
               <div key={i} onClick={(e) => bed.isEmpty ? plantBerry(i, e) : harvestBerry(i, e)} className={`h-32 border-4 ${bed.isEmpty ? 'border-dashed border-gba-dark/50 hover:bg-gba-green/20' : 'border-gba-dark bg-white'} rounded-lg flex flex-col items-center justify-center cursor-pointer transition-transform active:scale-95 relative z-0`}>
                 {bed.isEmpty ? (
                   <span className="opacity-50 text-center">Clique<br/>Plantar</span>
                 ) : (
                   <>
                     {bed.isShiny && <span className="absolute top-1 text-[8px] text-yellow-500 font-bold animate-pulse z-10">✨ SHINY</span>}
                     <img src={berryInfo.sprite} alt={berryInfo.name} style={{ imageRendering: 'pixelated', ...shinyStyle }} className={`w-12 h-12 ${isReady ? 'animate-bounce drop-shadow-md scale-125' : 'opacity-60 scale-75'}`} />
                     
                     {!isReady && (
                       <div className="w-10/12 hp-bar-container mt-2 h-4 relative overflow-hidden">
                         <div className={`${barColor} h-full transition-all duration-1000 ease-linear rounded-sm`} style={{ width: `${progressPercent}%` }}></div>
                       </div>
                     )}
                     {isReady && <span className="mt-2 text-green-600 animate-pulse font-bold">Pronto!</span>}
                   </>
                 )}
               </div>
             )
          })}
        </section>

        <section className="gba-dialog p-4 flex justify-between items-center bg-white/90">
          <div className="flex items-center gap-2">
            <h2 className="underline">Semente:</h2>
            <div className="flex items-center border-2 border-gba-dark bg-white">
              <img src={BERRIES[selectedSeed].sprite} alt="seed" className="w-6 h-6 ml-2" style={{ imageRendering: 'pixelated' }}/>
              <select className="p-2 outline-none bg-transparent cursor-pointer" value={selectedSeed} onChange={(e) => setSelectedSeed(e.target.value)}>
                {Object.values(BERRIES).map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleResetSave} className="text-red-600 font-bold border-2 border-transparent hover:border-red-600 bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors cursor-pointer">Resetar Save</button>
        </section>
      </div>

      {/* COLUNA DIREITA (MENU DE ABAS) */}
      <div className="w-full md:w-96 flex flex-col h-full">
        
        {/* BARRA DE NAVEGAÇÃO DAS ABAS */}
        <div className="flex flex-wrap gap-1 mb-4 bg-gba-dark p-1 rounded-lg shadow-lg">
          {[
            { id: 'loja', label: '📦 Loja' },
            { id: 'ajudantes', label: '🐾 Ajudantes' },
            { id: 'itens', label: '🎒 Inventário' },
            { id: 'missoes', label: '📋 Missões' },
            { id: 'progresso', label: '🏆 Progresso' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-[9px] font-bold rounded cursor-pointer transition-colors ${activeTab === tab.id ? 'bg-gba-green text-white shadow-inner border-2 border-transparent' : 'bg-white text-gba-dark border-2 border-b-4 border-gray-300 hover:bg-gray-100 active:translate-y-[2px] active:border-b-2'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO DINÂMICO DAS ABAS */}
        <div className="space-y-6">

          {activeTab === 'loja' && (
            <section className="gba-dialog p-4 bg-white/90 animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="text-lg mb-4 text-center border-b-2 border-gba-dark pb-2">📦 Vender</h2>
              <div className="space-y-3">
                {Object.values(BERRIES).map(berry => {
                  const qty = gameState.inventory[berry.id] || 0;
                  const unitValue = Math.floor(berry.value * (1 + currentRegion) * (1 + (Math.floor((gameState.stats[berry.id] || 0) / 10) * 0.01)) * (gameState.tools.amuletCoin ? 1.5 : 1.0) * (1 + (Object.keys(gameState.achievements || {}).length * 0.05)) * (gameState.pasture?.mew > 0 ? 1.10 : 1.0));

                  return (
                    <div key={berry.id} className="flex justify-between items-center bg-gray-50 p-1 border border-gray-200 rounded">
                      <div className="flex items-center gap-1">
                        <img src={berry.sprite} alt={berry.name} className="w-6 h-6" style={{ imageRendering: 'pixelated' }}/>
                        <span>x {qty}</span>
                      </div>
                      <button onClick={(e) => sellBerries(berry.id, e)} disabled={qty === 0} className="bg-gba-green text-white px-2 py-2 border-2 border-b-4 border-gba-dark active:border-b-2 active:translate-y-[2px] disabled:opacity-50 cursor-pointer">
                        Vender (₽{unitValue * qty})
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {activeTab === 'ajudantes' && (
            <section className="gba-dialog p-4 bg-white/90 animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="text-lg mb-4 text-center border-b-2 border-gba-dark pb-2">🐾 Ajudantes</h2>
              <div className="space-y-4">
                {Object.keys(HELPERS).map(helperId => {
                  const helperData = HELPERS[helperId];
                  const qtyOwned = gameState.helpers[helperId] || 0;
                  const cost = Math.floor(helperData.basePrice * Math.pow(1.15, qtyOwned));
                  const currentStage = getHelperStage(helperId, qtyOwned);
                  const isEvolving = evolvingHelper === helperId;

                  return (
                    <div key={helperId} className="border-2 border-gba-dark p-2 rounded bg-gray-50 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={currentStage.sprite} alt={currentStage.name} className={`w-12 h-12 bg-gray-200 rounded-full border-2 border-gba-dark ${isEvolving ? 'evolve-anim' : ''}`} style={{ imageRendering: 'pixelated' }}/>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="font-bold">{currentStage.name}</span>
                            <span className="text-blue-600">Lvl {qtyOwned}</span>
                          </div>
                          <p className="text-[8px] text-gray-600">{currentStage.effect}</p>
                        </div>
                      </div>
                      <button onClick={(e) => buyHelper(helperId, e)} disabled={gameState.money < cost} className="w-full bg-blue-500 text-white px-2 py-2 border-2 border-b-4 border-gba-dark active:border-b-2 active:translate-y-[2px] disabled:opacity-50 cursor-pointer transition-all">
                        UPGRADE (₽ {cost})
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 'itens' && (
            <>
              <section className="gba-dialog p-4 bg-orange-50/90 animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className="text-lg mb-4 text-center border-b-2 border-gba-dark pb-2 text-orange-800">🎒 Itens Base</h2>
                <div className="space-y-2">
                  {Object.keys(KEY_ITEMS).map(toolId => {
                    const item = KEY_ITEMS[toolId];
                    const isOwned = gameState.tools[toolId];
                    return (
                      <div key={toolId} className={`border-2 border-gba-dark p-2 rounded flex justify-between items-center ${isOwned ? 'bg-orange-200/50' : 'bg-white'}`}>
                          <div className="flex flex-col">
                            <span className="font-bold flex items-center gap-1">{item.icon} {item.name}</span>
                          </div>
                          {isOwned ? (
                            <span className="text-green-700 font-bold text-[10px]">Comprado</span>
                          ) : (
                            <button onClick={(e) => buyTool(toolId, e)} disabled={gameState.money < item.price} className="bg-orange-500 text-white px-2 py-1 border-b-2 border-gba-dark active:border-b-0 active:translate-y-[2px] disabled:opacity-50 cursor-pointer text-[9px]">
                              ₽ {item.price}
                            </button>
                          )}
                      </div>
                    )
                  })}
                </div>
              </section>

              <section className="gba-dialog p-4 bg-green-50/90 border-green-600 animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className="text-lg mb-2 border-b-2 border-green-600 pb-1 text-green-800">🐾 Pasto de Colecionador</h2>
                <p className="text-[8px] text-gray-600 mb-2 text-center">Capture Pokémon na fazenda para buffs!</p>
                <div className="grid grid-cols-2 gap-2">
                    {WILD_ENCOUNTERS.map(poke => {
                      const isCaught = gameState.pasture?.[poke.id] > 0;
                      return (
                          <div key={poke.id} className={`p-1 border-2 rounded flex flex-col items-center text-center ${isCaught ? 'border-green-500 bg-white shadow-sm' : 'border-gray-300 bg-gray-100 opacity-60 grayscale'}`}>
                            <img src={poke.sprite} alt={poke.name} className="w-10 h-10" style={{ imageRendering: 'pixelated' }}/>
                            <span className="font-bold text-[8px] text-gba-dark">{isCaught ? poke.name : '???'}</span>
                            {isCaught && <span className="text-[7px] text-blue-600 mt-1">{poke.buffDesc}</span>}
                          </div>
                      )
                    })}
                </div>
              </section>
            </>
          )}

          {activeTab === 'missoes' && (
            <section className="gba-dialog p-4 bg-white/90 animate-[fadeIn_0.3s_ease-in-out]">
              <h2 className="text-lg mb-2 border-b-2 border-gba-dark pb-1 text-blue-800">📋 Missões do Oak</h2>
              <div className="space-y-2">
                {gameState.quests.map((q, i) => (
                  <div key={q.id} className="border-2 border-gba-dark p-2 bg-white rounded flex flex-col justify-between">
                    <p className="font-bold text-[9px] mb-2">{q.desc}</p>
                    <div className="w-full hp-bar-container h-2 mb-2">
                        <div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min((q.progress / q.target)*100, 100)}%` }}></div>
                    </div>
                    <button onClick={(e) => claimQuest(i, e)} disabled={q.progress < q.target} className="bg-green-500 text-white py-1 border-b-2 border-gba-dark active:border-b-0 active:translate-y-[2px] disabled:opacity-50 disabled:bg-gray-400 cursor-pointer text-[9px]">
                      {q.progress >= q.target ? `Coletar ₽${q.reward}` : `${q.progress}/${q.target}`}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'progresso' && (
            <>
              <section className="gba-dialog p-4 bg-white/90 animate-[fadeIn_0.3s_ease-in-out]">
                <h2 className="text-lg mb-4 border-b-2 border-gba-dark pb-2 text-center text-blue-800">📖 BerryDex & Maestria</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.values(BERRIES).map(berry => {
                    const totalHarvested = gameState.stats[berry.id] || 0;
                    const isDiscovered = totalHarvested > 0;
                    const masteryLvl = getMasteryLevel(totalHarvested);
                    const speedBonus = Math.min(masteryLvl, 50);

                    return (
                      <div key={berry.id} className={`border-2 p-2 flex flex-col items-center rounded ${isDiscovered ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-100 grayscale opacity-50'}`}>
                        <img src={berry.sprite} alt={berry.name} className="w-8 h-8" style={{ imageRendering: 'pixelated' }}/>
                        <span className="font-bold mt-1 text-[9px]">{isDiscovered ? berry.name : '???'}</span>
                        {isDiscovered && (
                          <>
                            <span className="text-[8px] text-blue-600 font-bold mt-1">Lvl {masteryLvl}</span>
                            <span className="text-[7px] text-green-600 mt-1">Tempo -{speedBonus}%</span>
                            {masteryLvl >= 50 && <span className="text-[7px] text-yellow-600 font-bold">5% Instacrop</span>}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="gba-dialog p-4 bg-yellow-50/90 border-yellow-600 animate-[fadeIn_0.3s_ease-in-out]">
                <div className="flex justify-between items-center mb-4 border-b-2 border-yellow-600 pb-2">
                    <h2 className="text-lg text-yellow-800">🏆 Conquistas</h2>
                </div>
                <span className="text-[9px] bg-yellow-200 text-yellow-800 px-2 py-1 rounded border border-yellow-600 font-bold block text-center mb-3">
                    Bônus Global de Venda: +{Object.keys(gameState.achievements || {}).length * 5}%
                </span>
                <div className="grid grid-cols-1 gap-2">
                    {ACHIEVEMENTS.map(ach => {
                      const isUnlocked = gameState.achievements?.[ach.id];
                      return (
                          <div key={ach.id} className={`p-2 border-2 rounded flex flex-col ${isUnlocked ? 'border-yellow-500 bg-yellow-100' : 'border-gray-300 bg-gray-100 opacity-60 grayscale'}`}>
                            <span className="font-bold text-[10px] text-gba-dark">{ach.name}</span>
                            <span className="text-[8px] text-gray-600 mt-1">{ach.desc}</span>
                          </div>
                      )
                    })}
                </div>
              </section>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

