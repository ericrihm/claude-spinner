const CATEGORIES = [
  { name: 'Cooking', emoji: '\ud83c\udf73', verbs: ['Blanching','Caramelizing','Flamb\u00e9ing','Julienning','Kneading','Saut\u00e9ing','Seasoning','Simmering','Stewing','Zesting','Garnishing','Frosting','Marinating','Fermenting','Leavening','Proofing','Tempering','Brewing','Baking','Cooking','Drizzling','Whisking'] },
  { name: 'Thinking', emoji: '\ud83e\udde0', verbs: ['Cogitating','Contemplating','Considering','Deliberating','Musing','Pondering','Ruminating','Mulling','Cerebrating','Philosophising','Ideating','Puzzling','Noodling'] },
  { name: 'Movement', emoji: '\ud83d\udc83', verbs: ['Boogieing','Frolicking','Gallivanting','Jitterbugging','Moonwalking','Scampering','Shimmying','Skedaddling','Sock-hopping','Waddling','Meandering','Moseying','Perambulating','Scurrying','Slithering'] },
  { name: 'Chaos', emoji: '\ud83c\udf00', verbs: ['Discombobulating','Flibbertigibbeting','Hullaballooing','Razzmatazzing','Shenaniganing','Tomfoolering','Topsy-turvying','Boondoggling','Flummoxing','Befuddling','Dilly-dallying','Lollygagging','Whatchamacalliting','Wibbling','Canoodling','Fiddle-faddling'] },
  { name: 'Science', emoji: '\ud83d\udd2c', verbs: ['Crystallizing','Ionizing','Nebulizing','Nucleating','Osmosing','Photosynthesizing','Precipitating','Sublimating','Symbioting','Germinating','Evaporating','Pollinating','Metamorphosing','Propagating','Quantumizing'] },
  { name: 'Tech', emoji: '\u2699\ufe0f', verbs: ['Bootstrapping','Computing','Hashing','Gitifying','Processing','Generating','Synthesizing','Reticulating','Calculating','Crunching','Architecting','Hyperspacing'] },
  { name: 'Vibes', emoji: '\u2728', verbs: ['Vibing','Grooving','Enchanting','Manifesting','Harmonizing','Flowing','Beaming','Levitating','Envisioning','Unfurling','Sprouting'] },
];

export function getCategoryForVerb(verb) {
  for (const cat of CATEGORIES) {
    if (cat.verbs.includes(verb)) return cat;
  }
  return { name: 'Miscellaneous', emoji: '\ud83c\udfb2' };
}

export { CATEGORIES };
