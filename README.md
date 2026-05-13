# 🍓 Poké-Berry Farmer

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

**Poké-Berry Farmer** is a web-based incremental/idle farming game built with **React** and **Tailwind CSS**.

Plant berries, automate your farm with Pokémon helpers, unlock mutations, prestige through regions, and become the ultimate Berry Tycoon!

---

## 🎮 Play the Game

> 🌐 **Live Demo:** https://kellernz1.github.io/poke-berry-farmer/

> *(Replace this with your Vercel, Netlify, or GitHub Pages deployment link.)*

---

## ✨ Features

---

### 🌱 Farming Mechanics

- Plant multiple berry types
- Different growth durations and sell values
- Strategic farm management and progression

---

### 💤 Offline Progress System

The game tracks the time spent away and automatically:
- Grows planted berries
- Calculates missed income
- Processes helper actions

Your farm keeps evolving even while offline.

---

### 🐾 Pokémon Helpers

Hire Pokémon companions that automate your farm.

#### Examples

| Pokémon | Ability |
|---|---|
| Squirtle | Reduces berry growth time |
| Meowth | Automatically harvests crops |
| Celebi | Automatically replants berries |

Helpers:
- Gain experience
- Level up
- Evolve into stronger forms

---

### 🧬 Mutation System

Plant specific berries adjacent to each other for a chance to create:
- Rare hybrid berries
- High-value crops
- Secret combinations

---

### 🎒 Key Items & Permanent Upgrades

Purchase special items such as:
- **Wailmer Pail** → Faster watering
- **Amulet Coin** → Increased profits
- **Growth Mulch** → Better mutation chances

Permanent upgrades persist across resets.

---

### 📖 BerryDex & Mastery

Track:
- Harvest history
- Rare discoveries
- Berry mastery levels

High mastery unlocks:
- Faster growth
- Increased profits
- "Instacrop" chances

---

### 🏆 Achievement System

Unlock global achievements that provide:
- Permanent sell multipliers
- Gameplay bonuses
- Prestige rewards

---

### 🚀 Dynamic Events

Special random encounters can occur on your farm.

#### 🌿 Wild Pokémon Encounters
Catch Pokémon to unlock passive bonuses in your **Pasture**.

#### 🚨 Team Rocket Invasions
Defend your farm against thieves and sabotage events.

---

### 🗺️ Prestige & Region System

Defeat the Elite 4 to unlock:
- New regions
- Stronger berries
- Permanent wealth multipliers

Regions include:
- Johto
- Hoenn
- Sinnoh
- And more...

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React 18 | Frontend framework |
| Vite | Development/build tool |
| Tailwind CSS | Styling and UI |
| React Hooks | State management |
| localStorage | Save persistence |
| PokéAPI | Pokémon sprites/assets |

---

## ⚙️ React Concepts Used

This project was built to practice and demonstrate:

- `useState` for reactive game state
- `useEffect` for game loops and timers
- `useRef` for interval management
- Component-based UI architecture
- Persistent save systems with `localStorage`
- Idle/incremental game balancing logic

---

## 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/your-username/poke-berry-farmer.git
```

### 2. Navigate into the folder

```bash
cd poke-berry-farmer
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:5173
```

---

## 📂 Project Structure

```text
/poke-berry-farmer
├── public/
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
└── README.md
```

---

## 🧠 Core Systems

### ⏱️ Main Game Loop
Managed through:
- `setInterval`
- `useEffect`
- Tick-based resource updates

### 💾 Save System
Uses browser `localStorage` to preserve:
- Farm progress
- Upgrades
- Pokémon helpers
- Prestige level

### 🎨 Juicy UI
Custom animations include:
- Floating numbers
- Evolution flashes
- Harvest effects
- Retro-inspired transitions

---

## 🎨 Visual Style

Inspired by:
- Pokémon Gen 3 & Gen 4 menus
- Game Boy Advance aesthetics
- Cozy farming simulators
- Idle/incremental games

---

## 🔮 Future Improvements

- [ ] 🎵 Add background music & SFX
- [ ] ☁️ Cloud save support
- [ ] 📱 Mobile-optimized controls
- [ ] 🌎 Multiplayer berry trading
- [ ] 🧪 Seasonal weather system
- [ ] 🎣 Additional side activities
- [ ] 🏠 Farm decoration/customization

---

## ⚖️ Disclaimer & Copyright Notice

This is a non-profit educational fan project created for:
- Portfolio purposes
- Learning
- Practice

All Pokémon names, sprites, characters, and related assets are property of:

- Nintendo
- Game Freak
- The Pokémon Company

Sprites are sourced dynamically through the **PokéAPI** ecosystem.

No copyright infringement is intended.

Please support the official Pokémon games and releases.

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

## 👨‍💻 Author

Developed by **Keller Nz**

---

## ⭐ Support

If you enjoyed this project, consider giving it a ⭐ on GitHub!
