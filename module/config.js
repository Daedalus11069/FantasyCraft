import {ClassFeatures} from "./Features.js"
import {OriginFeatures} from "./Features.js"

export const fantasycraft = {};

fantasycraft.classFeatures = ClassFeatures;
fantasycraft.originFeatures = OriginFeatures;

fantasycraft.abilityScores = 
{
	strength: "fantasycraft.strength",
	dexterity: "fantasycraft.dexterity",
	constitution: "fantasycraft.constitution",
	intelligence: "fantasycraft.intelligence",
	wisdom: "fantasycraft.wisdom",
	charisma: "fantasycraft.charisma"
}
fantasycraft.actionTime =
{
	none: "fantasycraft.free",
	half: "fantasycraft.halfAction",
	full: "fantasycraft.full",
	round: "fantasycraft.round",
	minute: "fantasycraft.minute"
}	
fantasycraft.armourCoverage = 
{
	none: "",
	partial: "Partial",
	moderate: "Moderate",
	full: "Full"
}
fantasycraft.bonusType = 
{
	untyped: "fantasycraft.untyped",
	morale: "fantasycraft.morale",
	gear: "fantasycraft.gear",
	magic: "fantasycraft.magic",
	insight: "fantasycraft.insight"
}
fantasycraft.classVitality = 
{
	Low: 6,
	Medium: 9,
	High: 12
}
fantasycraft.classInitiative = 
{
	Low: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6],
	Medium: [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 11, 12],
	High: [2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18]
}
fantasycraft.classSaves = 
{
	Low: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6],
	Medium: [1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9],
	High: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12]
}
fantasycraft.classDefense =
{
	Low: [0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8],
	Medium: [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 11, 12],
	High: [2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15, 15, 16]
}
fantasycraft.classBAB = 
{
	Low: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10],
	Medium: [0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15],
	High: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
}
fantasycraft.carryingCapacity = 
{
	light: [5 , 10, 15, 20, 25, 30,  35,  40,  45,  50,  60,  70,  80,  90, 100, 120, 140, 160, 180, 200, 250, 300,  350,  400,  450,  500,  600,  700,  800,  900, 1000, 1200, 1400, 1600, 1800, 2000, 2400, 2800, 3200,  3600,  4000,  4800,  5600,  6400, 7200],
	heavy: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 210, 240, 270, 300, 360, 420, 480, 540, 600, 750, 900, 1050, 1200, 1350, 1500, 1800, 2050, 2400, 2700, 3000, 3600, 4100, 4800, 5400, 6000, 7200, 8200, 9600, 10800, 12000, 14400, 16400, 19200, 21600],
}
fantasycraft.classLegend = 
{
	Low: [0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5],
	Medium: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10],
	High: [0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15]
}
fantasycraft.charmBonuses = 
{
	Lesser: [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4],
	Greater: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7]
}
fantasycraft.naturalAttacks = 
{
	bite: [{dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}, {dNum: 2, dSize:8}],
	claw: [{dNum: 1, dSize:3}, {dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}],
	slam: [{dNum: 1, dSize:3}, {dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}],
	kick: [{dNum: 1, dSize:3}, {dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}],
	talon: [{dNum: 1, dSize:3}, {dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}],
	gore: [{dNum: 1, dSize:3}, {dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}],
	squeeze: [{dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}, {dNum: 2, dSize:8}, {dNum: 2, dSize:10}],
	swallow: [{dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}, {dNum: 2, dSize:8}, {dNum: 2, dSize:10}],
	tailSlap: [{dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}, {dNum: 2, dSize:8}],
	trample: [{dNum: 1, dSize:4}, {dNum: 1, dSize:6}, {dNum: 1, dSize:8}, {dNum: 1, dSize:10}, {dNum: 1, dSize:12}, {dNum: 2, dSize:8}]
}
fantasycraft.npcInitDef = 
{
	I: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6],
	II: [0, 1, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9],
	III: [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 11, 12],
	IV: [1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15, 15],
	V: [2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18],
	VI: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
	VII: [3, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 22, 23, 24],
	VIII: [3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27],
	IX: [4, 5, 6, 8, 9, 10, 12, 13, 15, 16, 18, 19, 20, 22, 23, 25, 26, 28, 29, 30],
	X: [4, 6, 7, 9, 10, 12, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28, 30, 31, 33]
}
fantasycraft.npcAttack = 
{
	I: [0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10],
	II: [0, 1, 1, 2, 3, 3, 4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 11, 11, 12, 12],
	III: [0, 1, 2, 3, 3, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15],
	IV: [1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 15, 16, 17],
	V: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
	VI: [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22],
	VII: [2, 3, 4, 5, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 25],
	VIII: [2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23, 25, 27, 27],
	IX: [2, 3, 5, 6, 8, 9, 11, 12, 14, 16, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30],
	X: [3, 5, 6, 8, 9, 11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32]
}
fantasycraft.npcResCompHealth = 
{
	I: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6],
	II: [0, 1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8],
	III: [1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9],
	IV: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11],
	V: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12],
	VI: [2, 3, 3, 4, 5, 5, 6, 6, 7, 7, 8, 9, 9, 10, 10, 11, 11, 12, 13, 14],
	VII: [3, 4, 4, 5, 6, 7, 7, 8, 8, 9, 10, 10, 11, 11, 12, 13, 13, 14, 14, 15],
	VIII: [3, 4, 4, 5, 6, 7, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 15, 16, 16, 17],
	IX: [4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15, 15, 16, 17, 18, 18],
	X: [4, 5, 6, 7, 8, 8, 9, 10, 11, 12, 12, 13, 14, 15, 16, 16, 17, 18, 19, 20]
}
fantasycraft.npcSignatureSkills = 
{
	I: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12],
	II: [3, 3, 4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 11, 11, 12, 13, 13, 14, 15, 15],
	III: [4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 12, 12, 13, 14, 15, 15, 16, 17, 18, 18],
	IV: [5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18, 19, 20, 20, 21],
	V: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
	VI: [7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27],
	VII: [8, 10, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 28, 29, 30],
	VIII: [9, 11, 12, 13, 14, 16, 17, 18, 19, 21, 22, 23, 24, 26, 27, 28, 29, 31, 32, 33],
	IX: [10, 12, 13, 14, 16, 17, 18, 20, 21, 22, 24, 25, 26, 28, 29, 30, 32, 33, 34, 36],
	X: [11, 12, 14, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39] 
}
fantasycraft.heroicTitles = 
{
	1: "Swordsman",
	2: "Adventurer",
	3: "Gallant",
	4: "Champion",
	5: "Knight Errant",
	6: "Knight",
	7: "Exemplar",
	8: "Knight Champion",
	9: "Dragon Slayer",
	10: "Savior of the Realm"
}
fantasycraft.militaryTitles = 
{
	1: "Squire",
	2: "Man-at-Arms",
	3: "Corporal",
	4: "Sergeant",
	5: "Lieutenant",
	6: "Captain",
	7: "Major",
	8: "Lieutenant General",
	9: "General",
	10: "Warlord"
}
fantasycraft.nobleTitles = 
{
	1: "Lord",
	2: "Baron",
	3: "Viscount",
	4: "Earl",
	5: "Margrave",
	6: "Marquis",
	7: "Duke",
	8: "Archduke",
	9: "Monarch",
	10: "Lord Sovereign"
}
fantasycraft.areaRangeMultiplier = 
{
	aura: 10,
	beam: 10,
	blast: 5,
	cone: 10,
	gaze: 0, 
	ray: 20
}
fantasycraft.armourCustomizations = 
{
	fittings: "Fittings",
	customization: "Customization",
	materials: "Materials"
}
fantasycraft.armourUpgrades =
{
	beast: "Beast",
	blessed: "Blessed",
	ceremonial: "Ceremonial",
	cushioned: "Cushioned",
	discreet: "Discreet",
	fireproofed: "Fireproofed",
	fitted: "Fitted",
	insulated: "Insulated",
	lightweight: "Lightweight",
	reinforced: "Reinforced",
	vented: "Vented",
	warm: "Warm"
}
fantasycraft.classSpellPoints = 
{
	None: 0,
	Low: 1,
	High: 2
}
fantasycraft.classes =
{
	assassin: "Assassin",
	burglar: "Burglar",
	captain: "Captain",
	courtier: "Courtier",
	crusader: "Crusader",
	emissary: "Emissary",
	explorer: "Explorer",
	keeper: "Keeper",
	lancer: "Lancer",
	mage: "Mage",
	martialArist: "Martial Arist",
	priest: "Priest",
	sage: "Sage",
	scout: "Scout",
	soldier: "Soldier",
	alchemist: "Alchemist",
	beastMaster: "BeastMaster",
	bloodsworn: "Bloodsworn",
	deadeye: "Deadeye",
	edgemaster: "Edgemaster",
	forceOfNature: "ForceOfNature",
	gallant: "Gallant",
	infernalist: "Infernalist",
	inquisitor: "Inquisitor",
	mistDancer: "Mist Dancer",
	monk: "Monk",
	monsterSlayer: "Monster Slayer",
	paladin: "Paladin",
	runeKnight: "Rune Knight",
	shinobi: "Shinobi",
	skirmisher: "Skirmisher",
	swashbuckler: "Swashbuckler",
	witchHunter: "Witch Hunter",
	avatar: "Avatar",
	dragonLord: "Dragon Lord",
	regent: "Regent",
	spiritSinger: "Spirit Singer",
	windKnight: "Wind Knight",

	custom: "Custom Class"
}
fantasycraft.constructionTime = 
{
	day: "fantasycraft.d",
	week: "fantasycraft.w",
	month: "fantasycraft.m"
}
fantasycraft.creatureType = 
{
	animal: "fantasycraft.animal",
	beast: "fantasycraft.beast",
	construct: "fantasycraft.construct",
	elemental: "fantasycraft.elemental",
	fey: "fantasycraft.fey",
	folk: "fantasycraft.folk",
	horror: "fantasycraft.horror",
	ooze: "fantasycraft.ooze",
	outsider: "fantasycraft.outsider",
	plant: "fantasycraft.plant",
	spirit: "fantasycraft.spirit",
	undead: "fantasycraft.undead"
}
fantasycraft.currency = 
{
	silver: "fantasycraft.silver",
	reputation: "fantasycraft.reputation"
}
fantasycraft.customizations = 
{
	drake: "fantasycraft.drake",
	dwarf: "fantasycraft.dwarf",
	elf: "fantasycraft.elf",
	giant: "fantasycraft.giant",
	goblin: "fantasycraft.goblin",
	ogre: "fantasycraft.ogre",
	orc: "fantasycraft.orc",
	pech: "fantasycraft.pech",
	rootwalker: "fantasycraft.rootwalker",
	saurian: "fantasycraft.saurian",
	unborn: "fantasycraft.unborn"
}
fantasycraft.materials = 
{
	crude: "Crude",
	superior: "Superior"
}

fantasycraft.damageTypes = 
{
	lethal: "fantasycraft.lethal",
	acid: "fantasycraft.acid",
	bang: "fantasycraft.bang",
	cold: "fantasycraft.cold",
	divine: "fantasycraft.divine",
	electrical: "fantasycraft.electrical",
	explosive: "fantasycraft.explosive",
	fire: "fantasycraft.fire",
	flash: "fantasycraft.flash",
	force: "fantasycraft.force",
	heat: "fantasycraft.heat",
	sonic: "fantasycraft.sonic",
	stress: "fantasycraft.stress",
	subdual: "fantasycraft.subdual"
}
fantasycraft.damageAuraTypes = 
{
	acid: "fantasycraft.acid",
	divine: "fantasycraft.divine",
	electrical: "fantasycraft.electrical",
	fire: "fantasycraft.fire",
	force: "fantasycraft.force",
	sonic: "fantasycraft.sonic",
	stress: "fantasycraft.stress",
	subdual: "fantasycraft.subdual",
	blunt: "fantasycraft.blunt",
	edged: "fantasycraft.edged",
	cold: "fantasycraft.cold",
	heat: "fantasycraft.heat",
	poison: "fantasycraft.poisonAny1",
}
fantasycraft.damageResistanceArmour = 
{
	lethal: "fantasycraft.lethal",
	acid: "fantasycraft.acid",
	bang: "fantasycraft.bang",
	cold: "fantasycraft.cold",
	divine: "fantasycraft.divine",
	electrical: "fantasycraft.electrical",
	explosive: "fantasycraft.explosive",
	fire: "fantasycraft.fire",
	flash: "fantasycraft.flash",
	force: "fantasycraft.force",
	heat: "fantasycraft.heat",
	sonic: "fantasycraft.sonic",
	stress: "fantasycraft.stress",
	subdual: "fantasycraft.subdual",
	unarmed: "fantasycraft.unarmed",
	blunt: "fantasycraft.blunt",
	edged: "fantasycraft.edged",
	hurled: "fantasycraft.hurled",
	bows: "fantasycraft.bows",
	blackPowder: "fantasycraft.blackPowder",
	siege: "fantasycraft.siege"
}

fantasycraft.eras = 
{
	primitave: "fantasycraft.primitave",
	ancient: "fantasycraft.ancient",
	feudal: "fantasycraft.feudal",
	reason: "fantasycraft.reason",
	industrial: "fantasycraft.industrial"
}
fantasycraft.featType =
{
	basicCombat: "fantasycraft.basicCombat",
	meleeCombat: "fantasycraft.meleeCombat",
	rangedCombat: "fantasycraft.rangedCombat",
	unarmedCombat: "fantasycraft.unarmedCombat",
	chance: "fantasycraft.chance",
	covert: "fantasycraft.covert",
	gear: "fantasycraft.gear",
	skill: "fantasycraft.skill",
	species: "fantasycraft.species",
	spellcasting: "fantasycraft.spellcasting",
	style: "fantasycraft.style",
	terrain: "fantasycraft.terrain"
}
fantasycraft.featureType = 
{
	class: "fantasycraft.class",
	npcQuality: "fantasycraft.npcQuality",
	origin: "fantasycraft.origin"

}
fantasycraft.focusCrafting = 
{
	carving: "fantasycraft.carving",
	carpentry: "fantasycraft.carpentry",
	chemistry: "fantasycraft.chemistry",
	cooking: "fantasycraft.cooking",
	inscription: "fantasycraft.inscription",
	metalworking: "fantasycraft.metalworking",
	pharmacy: "fantasycraft.pharmacy",
	pottery: "fantasycraft.pottery",
	stonecutting: "fantasycraft.stonecutting",
	tailoring: "fantasycraft.tailoring"
}
fantasycraft.focusRide = 
{
	landAnimals: "fantasycraft.landAnimals",
	landVehicles: "fantasycraft.landVehicles",
	waterAnimals: "fantasycraft.waterAnimals",
	waterVehicles: "fantasycraft.waterVehicles",
	airAnimals: "fantasycraft.airAnimals",
	airVehicles: "fantasycraft.airVehicles"
}
fantasycraft.hardness = 
{
	brittle: "fantasycraft.brittle",
	soft: "fantasycraft.soft",
	hard: "fantasycraft.hard"
}
fantasycraft.interests = 
{
	studies: "fantasycraft.studies",
	languages: "fantasycraft.languages",
	alignment: "fantasycraft.alignment"
}
fantasycraft.itemType = 
{
	good: "fantasycraft.good",
	kit: "fantasycraft.kit",
	lockTrap: "fantasycraft.lockTrap",
	consumable: "fantasycraft.consumable",
	elixir: "fantasycraft.elixir",
	poison: "fantasycraft.poison",
	scroll: "fantasycraft.scroll",
	service: "fantasycraft.service",
	vehicle: "fantasycraft.vehicle"
}
fantasycraft.lifestyle = 
{
	panache: "fantasycraft.panache",
	prudence: "fantasycraft.prudence",
}
fantasycraft.magicItemCharms = 
{
	skillRanks: "fantasycraft.skillRanks",
 	storage: "fantasycraft.storage",
	defenseBonus: "fantasycraft.defenseBonus", 
	accuracyBonus: "fantasycraft.accuracyBonus",
	damageBonus: "fantasycraft.damageBonus", 
	bane: "fantasycraft.bane", 
	spellPoints: "fantasycraft.spellPoints", 
	spellEffect: "fantasycraft.spellEffect", 
	attributeBonus: "fantasycraft.attributeBonus" 
}
fantasycraft.magicItemEssences = 
{
	acp: "fantasycraft.acpNeg", 
	trainedSkill: "fantasycraft.trainedSkill", 
	interest: "fantasycraft.interest", 
	proficiency: "fantasycraft.proficiency",
	trick: "fantasycraft.trick", 
	npcQuality: "fantasycraft.npcQuality",
	alignedDamage: "fantasycraft.alignedDamage",
	exoticDamage: "fantasycraft.exoticDamage", 
	damageAura: "fantasycraft.damageAura", 
	damageResistance: "fantasycraft.damageResistance", 
	edgeSurge: "fantasycraft.edgeSurge", 
	travelSpeed: "fantasycraft.travelSpeed",
	saveBonus: "fantasycraft.saveBonus", 
	vitality: "fantasycraft.vitality", 
	wounds: "fantasycraft.wounds", 
	threatRange: "fantasycraft.threatRange", 
	damageReduction: "fantasycraft.damageReduction",
	feat: "fantasycraft.feat", 
	castingLevel: "fantasycraft.castingLevel",
	classAbility: "fantasycraft.classAbility",
	classEnhancement: "fantasycraft.classEnhancement"
}
fantasycraft.moveType = 
{
	ground: "fantasycraft.ground",
	fly: "fantasycraft.fly",
	burrow: "fantasycraft.burrow",
	swim: "fantasycraft.swim"
}
fantasycraft.creatureMovementType = 
{
	ground: "fantasycraft.walker",
	fly: "fantasycraft.flyer",
	burrow: "fantasycraft.burrower",
	swim: "fantasycraft.swimmer"
}
fantasycraft.extraordinaryAttackDescription = 
{
	damage: "fantasycraft.damage",
	rotting: "fantasycraft.rotting",
	rusting: "fantasycraft.rusting"
}
fantasycraft.extraordinarySaveDescription = 
{
	baffling: "fantasycraft.baffling",
	blinding: "fantasycraft.blinding",
	deafening: "fantasycraft.deafening",
	drainingAttribute: "fantasycraft.drainingAttribute",
	drainingLife: "fantasycraft.drainingLife",
	drainingSoul: "fantasycraft.drainingSoul",
	enraging: "fantasycraft.enraging",
	entangling: "fantasycraft.entangling",
	fatiguing: "fantasycraft.fatiguing",
	frightening: "fantasycraft.frightening",
	paralyzing: "fantasycraft.paralyzing",
	petrifying: "fantasycraft.petrifying",
	shaking: "fantasycraft.shaking",
	sickening: "fantasycraft.sickening",
	slowing: "fantasycraft.slowing",
	sprawling: "fantasycraft.sprawling",
	stunning: "fantasycraft.stunning",
	wounding: "fantasycraft.wounding"
}
fantasycraft.naturalAttack = 
{
	none: "",
	claw: "fantasycraft.claw",
	talon: "fantasycraft.talon",
	kick: "fantasycraft.kick",
	slam: "fantasycraft.slam",
	bite: "fantasycraft.bite",
	gore: "fantasycraft.gore",
	trample: "fantasycraft.trample",
	squeeze: "fantasycraft.squeeze",
	swallow: "fantasycraft.swallow",
	tailSlap: "fantasycraft.tailSlap"
}
fantasycraft.npcAttackTypes = 
{
	naturalAttack: "fantasycraft.naturalAttack",
	extraDamage: "fantasycraft.extraDamage",
	extraSave: "fantasycraft.extraSave",
	playerBreathWeapon: "fantasycraft.playerBreathWeapon"
}
fantasycraft.npcAttackAreas = 
{
	none: "",
	aura: "fantasycraft.aura",
	beam: "fantasycraft.beam",
	blast: "fantasycraft.blast",
	cone: "fantasycraft.cone",
	gaze: "fantasycraft.gaze",
	ray: "fantasycraft.ray"
}
fantasycraft.npcAttackGrades = 
{
	I: "I",
	II: "II",
	III: "III",
	IV: "IV",
	V: "V"
}
fantasycraft.npcTraits = 
{
	initiative: "fantasycraft.initiative",
	attack: "fantasycraft.attack",
	defense: "fantasycraft.defense",
	resilience: "fantasycraft.resilience",
	health: "fantasycraft.health",
	competence: "fantasycraft.competence"
}
fantasycraft.savingThrow = 
{
	none: "",
	fortitude: "fantasycraft.fortitude",
	reflex: "fantasycraft.reflex",
	will: "fantasycraft.will"
}

fantasycraft.savingThrowEffects = 
{
	partial: "fantasycraft.partial",
	half: "fantasycraft.half",
	negates: "fantasycraft.negates",
	negatesScene: "fantasycraft.negatesScene"
}

fantasycraft.savingThrowTerms = 
{
	disbelief: "fantasycraft.disbelief",
	harmless: "fantasycraft.harmless",
	repeatable: "fantasycraft.repeatable",
	terminal: "fantasycraft.terminal",
	damage: "fantasycraft.damage",
	condition: "fantasycraft.condition"
}

fantasycraft.skills = 
{
	none: "",
	acrobatics: "fantasycraft.acrobatics",
	athletics: "fantasycraft.athletics",
	blend: "fantasycraft.blend",
	bluff: "fantasycraft.bluff",
	crafting: "fantasycraft.crafting",
	disguise: "fantasycraft.disguise",
	haggle: "fantasycraft.haggle",
	impress: "fantasycraft.impress",
	intimidate: "fantasycraft.intimidate",
	investigate: "fantasycraft.investigate",
	medicine: "fantasycraft.medicine",
	notice: "fantasycraft.notice",
	prestidigitation: "fantasycraft.prestidigitation",
	resolve: "fantasycraft.resolve",
	ride: "fantasycraft.ride",
	search: "fantasycraft.search",
	senseMotive: "fantasycraft.senseMotive",
	sneak: "fantasycraft.sneak",
	survival: "fantasycraft.survival",
	tactics: "fantasycraft.tactics",
	spellcasting: "fantasycraft.spellcasting"
}

fantasycraft.skillAttribute = 
{
	acrobatics: "dexterity",
	athletics: "strength",
	blend: "charisma",
	bluff: "charisma",
	crafting: "intelligence",
	disguise: "charisma",
	haggle: "wisdom",
	impress: "charisma",
	intimidate: "wisdom",
	investigate: "intelligence",
	medicine: "intelligence",
	notice: "wisdom",
	prestidigitation: "dexterity",
	resolve: "constitution",
	ride: "dexterity",
	search: "intelligence",
	senseMotive: "wisdom",
	sneak: "dexterity",
	survival: "wisdom",
	tactics: "intelligence",
	spellcasting: "intelligence"
}

fantasycraft.size = 
{
	nuisance: "fantasycraft.nuisance",
	fine: "fantasycraft.fine",
	diminutive: "fantasycraft.diminutive",
	tiny: "fantasycraft.tiny",
	small: "fantasycraft.small",
	medium: "fantasycraft.medium",
	large: "fantasycraft.large",
	huge: "fantasycraft.huge",
	gargantuan: "fantasycraft.gargantuan",
	colossal: "fantasycraft.colossal",
	enormous: "fantasycraft.enormous",
	vast: "fantasycraft.vast"
}
fantasycraft.sizeLetter = 
{
	nuisance: "fantasycraft.nuisanceAb",
	fine: "fantasycraft.fineAb",
	diminutive: "fantasycraft.diminutiveAb",
	tiny: "fantasycraft.tinyAb",
	small: "fantasycraft.smallAb",
	medium: "fantasycraft.mediumAb",
	large: "fantasycraft.largeAb",
	huge: "fantasycraft.hugeAb",
	gargantuan: "fantasycraft.gargantuanAb",
	colossal: "fantasycraft.colossalAb",
	enormous: "fantasycraft.enormousAb",
	vast: "fantasycraft.vastAb"
}

fantasycraft.sizeNumber = 
{
	nuisance: -5,
	fine: -4,
	diminutive: -3,
	tiny: -2,
	small: -1,
	medium: 0,
	large: 1,
	huge: 2,
	gargantuan: 3,
	colossal: 4,
	enormous: 5,
	vast: 6
}

fantasycraft.spellFeatEffect = 
{
	none: "None",
	ability: "Abilities",
	save: "Save",
	skill: "Skill"
}
fantasycraft.spellArea = 
{
	none: "",
	casterDefined: "fantasycraft.casterDefined",
	cone: "fantasycraft.cone",
	cube: "fantasycraft.cube",
	pillar: "fantasycraft.pillar",
	sphere: "fantasycraft.sphere",
	wall: "fantasycraft.wall",
	custom: "fantasycraft.custom"
}
fantasycraft.spellLevel = 
{
	0: "fantasycraft.level0",
	1: "fantasycraft.level1",
	2: "fantasycraft.level2",
	3: "fantasycraft.level3",
	4: "fantasycraft.level4",
	5: "fantasycraft.level5",
	6: "fantasycraft.level6",
	7: "fantasycraft.level7",
	8: "fantasycraft.level8",
	9: "fantasycraft.level9"
}
fantasycraft.spellSchool = 
{
	none: "",
	channeler: "fantasycraft.channeler",
	conjurer: "fantasycraft.conjurer",
	enchanter: "fantasycraft.enchanter",
	preserver:"fantasycraft.preserver",
	prophet:"fantasycraft.prophet",
	reaper:"fantasycraft.reaper",
	seer:"fantasycraft.seer",
	trickster:"fantasycraft.trickster"
}

fantasycraft.spellDiscipline =
{
	none : "",
	channeler: 
	{
		energy: "fantasycraft.energy",
		force: "fantasycraft.force",
		weather: "fantasycraft.weather"
	},
	conjurer: 
	{
		compass: "fantasycraft.compass",
		conversion: "fantasycraft.conversion",
		creation: "fantasycraft.creation",
	},
	enchanter: 
	{
		charm: "fantasycraft.charm",
		healing: "fantasycraft.healing",
		nature: "fantasycraft.nature",
	},
	preserver: 
	{
		glory: "fantasycraft.glory",
		seals: "fantasycraft.seals",
		warding: "fantasycraft.warding",
	},
	prophet: 
	{
		blessing: "fantasycraft.blessing",
		calling: "fantasycraft.calling",
		foresight: "fantasycraft.foresight",
	},
	reaper: 
	{
		affliction: "fantasycraft.affliction",
		necromancy: "fantasycraft.necromancy",
		shadow: "fantasycraft.shadow",
	},
	seer: 
	{
		artifice: "fantasycraft.artifice",
		diviniation: "fantasycraft.diviniation",
		word: "fantasycraft.word"
	},
	trickster: 
	{
		illusion: "fantasycraft.illusion",
		secrets: "fantasycraft.secrets",
		shapeshifting: "fantasycraft.shapeshifting",
	}
}

fantasycraft.distance = 
{
	personal: "fantasycraft.personal",
	touch: "fantasycraft.touch",
	personalOrTouch: "fantasycraft.personalOrTouch",
	close: "fantasycraft.close",
	local: "fantasycraft.local",
	remote: "fantasycraft.remote",
	unlimited: "fantasycraft.unlimited",
	short: "fantasycraft.short",
	medium: "fantasycraft.medium",
	long: "fantasycraft.long",
	special: "fantasycraft.special"
}

fantasycraft.spellDuration = 
{
	instant: "fantasycraft.instant",
	permanent: "fantasycraft.permanent",
	concentrationAndDuration: "fantasycraft.concentrationAndDuration",
	concentrationToDuration: "fantasycraft.concentrationToDuration",
	fixedDuration: "fantasycraft.fixedDuration"
}

fantasycraft.spellDurationModifiers = 
{
	dismissable: "fantasycraft.dismissable",
	enduring: "fantasycraft.enduring",
	variable: "fantasycraft.variable"
}

fantasycraft.spellTerms = 
{
	air: "fantasycraft.air",
	aligned: "fantasycraft.aligned",
	curse: "fantasycraft.curse",
	darkness: "fantasycraft.darkness",
	earth: "fantasycraft.earth",
	fire: "fantasycraft.fire",
	ice: "fantasycraft.ice",
	light: "fantasycraft.light",
	lightning: "fantasycraft.lightning",
	silence: "fantasycraft.silence",
	sonic: "fantasycraft.sonic",
	water: "fantasycraft.water"
}

fantasycraft.timeIncrements =
{
	free: "fantasycraft.free",
	half: "fantasycraft.halfAction",
	full: "fantasycraft.full",
	round: "fantasycraft.round",
	minute: "fantasycraft.minute",
	hour: "fantasycraft.hour",
	day: "fantasycraft.day",
	varies: "fantasycraft.varies"
}

fantasycraft.durationTimeIncrements = 
{
	round: "fantasycraft.round",
	minute: "fantasycraft.minute",
	hour: "fantasycraft.hour",
	day: "fantasycraft.day",
	week: "fantasycraft.week",
	month: "fantasycraft.month",
	year: "fantasycraft.year",
}
fantasycraft.adventureIncrements =
{
	scene: "fantasycraft.scene",
	session: "fantasycraft.session",
	adventure: "fantasycraft.adventure"
}

fantasycraft.attackProficiency = 
{
	none: "",
	unarmed: "fantasycraft.unarmed",
	blunt: "fantasycraft.blunt",
	edged: "fantasycraft.edged",
	hurled: "fantasycraft.hurled",
	bows: "fantasycraft.bows",
	blackPowder: "fantasycraft.blackPowder",
	siege: "fantasycraft.siege"
}
fantasycraft.attackType = 
{
	unarmed: "fantasycraft.unarmed",
	melee: "fantasycraft.melee",
	ranged: "fantasycraft.ranged"
}
fantasycraft.numericWeaponProperties = 
{
	//armourPiercing: "fantasycraft.ap",
	ap: "fantasycraft.ap",
	blast: "fantasycraft.blast",
	guard: "fantasycraft.guard",
	keen: "fantasycraft.keen",
	load: "fantasycraft.load",
	reach: "fantasycraft.reach"
}
fantasycraft.weaponProperties = 
{
	aligned: "fantasycraft.aligned",
	bleed: "fantasycraft.bleed",
	bludgeon: "fantasycraft.bludgeon",
	cavalry: "fantasycraft.cavalry",
	cord: "fantasycraft.cord",
	double: "fantasycraft.double",
	excruciating: "fantasycraft.excruciating",
	finesse: "fantasycraft.finesse", 
	grip: "fantasycraft.grip",
	heavy: "fantasycraft.heavy",
	hook: "fantasycraft.hook",
	hurl: "fantasycraft.hurl",
	inaccurate: "fantasycraft.inaccurate",
	indirect: "fantasycraft.indirect",
	lightweight: "fantasycraft.lightweight",
	lure: "fantasycraft.lure",
	massive: "fantasycraft.massive",
	poisonous: "fantasycraft.poisonous",
	pummeling: "fantasycraft.pummeling",
	return: "fantasycraft.return",
	spread: "fantasycraft.spread",
	spike: "fantasycraft.spike",
	stationary: "fantasycraft.stationary",
	trip: "fantasycraft.trip",
	unreliable: "fantasycraft.unreliable"
}


fantasycraft.attackPropertiesList = 
{
	armourPiercing: "fantasycraft.ap",
	ap: "fantasycraft.ap",
	blast: "fantasycraft.blast",
	guard: "fantasycraft.guard",
	keen: "fantasycraft.keen",
	load: "fantasycraft.load",
	reach: "fantasycraft.reach",
	aligned: "fantasycraft.aligned",
	bleed: "fantasycraft.bleed",
	bludgeon: "fantasycraft.bludgeon",
	cavalry: "fantasycraft.cavalry",
	cord: "fantasycraft.cord",
	double: "fantasycraft.double",
	excruciating: "fantasycraft.excruciating",
	finesse: "fantasycraft.finesse", 
	grip: "fantasycraft.grip",
	heavy: "fantasycraft.heavy",
	hook: "fantasycraft.hook",
	hurl: "fantasycraft.hurl",
	inaccurate: "fantasycraft.inaccurate",
	indirect: "fantasycraft.indirect",
	lightweight: "fantasycraft.lightweight",
	lure: "fantasycraft.lure",
	massive: "fantasycraft.massive",
	poisonous: "fantasycraft.poisonous",
	pummeling: "fantasycraft.pummeling",
	return: "fantasycraft.return",
	spread: "fantasycraft.spread",
	spike: "fantasycraft.spike",
	stationary: "fantasycraft.stationary",
	trip: "fantasycraft.trip",
	unreliable: "fantasycraft.unreliable"
}

fantasycraft.trapTarget = 
{
	area: "fantasycraft.area",
	object: "fantasycraft.object",
	areaAndObject: "fantasycraft.areaAndObject"
}

fantasycraft.goodUpgrades =
{
	durable: "fantasycraft.durable",
	hollow: "fantasycraft.hollow",
	masterwork: "fantasycraft.masterWork"
}

fantasycraft.kitUpgrades = 
{
	beast: "fantasycraft.beast",
	hollow: "fantasycraft.hollow",
	masterwork: "fantasycraft.masterWork"
}

fantasycraft.lockTrapUpgrades=
{
	biggerArea: "fantasycraft.biggerArea",
	complexMechanism: "fantasycraft.complexMechanism",
	durable: "fantasycraft.durable",
	hairTrigger: "fantasycraft.hairTrigger",
	moreDamage: "fantasycraft.moreDamage",
	poison: "fantasycraft.poison",
	secondTrigger: "fantasycraft.secondTrigger",
	unusualDesign: "fantasycraft.unusualDesign",
	unusualMechanism: "fantasycraft.unusualMechanism"
}

fantasycraft.elixirUpgrades = 
{
	cocktail: "fantasycraft.cocktail",
	distilled: "fantasycraft.distilled",
	gas: "fantasycraft.gas"
}

fantasycraft.poisonUpgrades = 
{
	cocktail: "fantasycraft.cocktail",
	exotic: "fantasycraft.exotic",
	fastActing: "fantasycraft.fastActing",
	gas: "fantasycraft.gas",
	persistent: "fantasycraft.persistent",
	concentrated: "fantasycraft.concentrated",
	potent: "fantasycraft.potent",
	virulent: "fantasycraft.virulent"
}

fantasycraft.scrollUpgrades = 
{
	solidMaterial: "fantasycraft.solidMaterial",
	heavyMaterial: "fantasycraft.heavyMaterial"
}

fantasycraft.mountUpgrades = 
{
	exceptionalSpecimen: "fantasycraft.exceptionalSpecimen",
	training: "fantasycraft.training"
}

fantasycraft.vehicleUpgrades = 
{
	agile: "fantasycraft.agile",
	armored: "fantasycraft.armored",
	enclosed: "fantasycraft.enclosed",
	fast: "fantasycraft.fast",
	hauling: "fantasycraft.hauling",
	powered: "fantasycraft.powered",
	sailborne: "fantasycraft.sailborne",
	warbuilt: "fantasycraft.warbuilt"
}

fantasycraft.npcQualityLesser = 
{
	alwaysReady: "fantasycraft.alwaysReady",
	aquaticI: "fantasycraft.aquaticI",
	cageyI: "fantasycraft.cageyI",
	chameleonI: "fantasycraft.chameleonI",
	chargeAttack: "fantasycraft.chargeAttack",
	criticalSurge: "fantasycraft.criticalSurge",
	darkvisionI: "fantasycraft.darkvisionI",
	dread: "fantasycraft.dread",
	fastHealing: "fantasycraft.fastHealing",
	superiorJumperII: "fantasycraft.superiorJumperII",
	neverOutnumbered: "fantasycraft.neverOutnumbered",
	unnerving: "fantasycraft.unnerving"
}

fantasycraft.npcQualityGreater = 
{
	aquaticII: "fantasycraft.aquaticII",
	beguiling: "fantasycraft.beguiling",
	blindsight: "fantasycraft.blindsight",
	chameleonII: "fantasycraft.chameleonII",
	superiorClimberIII: "fantasycraft.superiorClimberIII",
	contagionImmunity: "fantasycraft.contagionImmunity",
	darkvisionII: "fantasycraft.darkvisionII",
	fearsome: "fantasycraft.fearsome",
	regeneration2: "fantasycraft.regeneration2",
	rend: "fantasycraft.rend",
	spellReflection: "fantasycraft.spellReflection",
	toughI: "fantasycraft.toughI"
}

fantasycraft.weaponSubcategory = 
{
	club: "fantasycraft.club",
	flail: "fantasycraft.flail",
	hammer: "fantasycraft.hammer",
	shield: "fantasycraft.shield",
	staff: "fantasycraft.staff",
	whip: "fantasycraft.whip",
	axe: "fantasycraft.axe",
	fencing: "fantasycraft.fencing",
	knife: "fantasycraft.knife",
	sword: "fantasycraft.sword",
	spear: "fantasycraft.spear",
	greatsword: "fantasycraft.greatsword",
	polearm: "fantasycraft.polearm",
	thrown: "fantasycraft.thrown",
	grenade: "fantasycraft.grenade",
	bow: "fantasycraft.bows",
	sidearm: "fantasycraft.sidearm",
	longarm: "fantasycraft.longarm",
	siege: "fantasycraft.siege"
}

fantasycraft.blunt = 
{
	club: "fantasycraft.club",
	flail: "fantasycraft.flail",
	hammer: "fantasycraft.hammer",
	shield: "fantasycraft.shield",
	staff: "fantasycraft.staff",
	whip: "fantasycraft.whip"
}

fantasycraft.edged = 
{
	axe: "fantasycraft.axe",
	fencing: "fantasycraft.fencing",
	knife: "fantasycraft.knife",
	sword: "fantasycraft.sword",
	spear: "fantasycraft.spear",
	greatsword: "fantasycraft.greatsword",
	polearm: "fantasycraft.polearm"
}

fantasycraft.bows = 
{
	arrowsAndBolts: "fantasycraft.arrowsAndBolts",
	bow: "fantasycraft.bow",
}

fantasycraft.hurled = 
{
	thrown: "fantasycraft.thrown",
	grenade: "fantasycraft.grenade",
}

fantasycraft.siege = 
{
	siege: "fantasycraft.siege"
}

fantasycraft.blackPowder = 
{
	powder: "fantasycraft.powder",
	sidearm: "fantasycraft.sidearm",
	longarm: "fantasycraft.longarm"
}

fantasycraft.trickTypes = 
{
	skillTrick: "fantasycraft.skillTrick",
	attackTrick: "fantasycraft.attackTrick",
	combatAction: "fantasycraft.combatAction",
	initiativeAction: "fantasycraft.initiativeAction"
}

fantasycraft.combatActions = 
{
	aim: "fantasycraft.aim",
	anticipate: "fantasycraft.anticipate",
	bullRush: "fantasycraft.bullRush",
	coupDeGrace: "fantasycraft.coupDeGrace",
	disarm: "fantasycraft.disarm",
	distract: "fantasycraft.distract",
	feint: "fantasycraft.feint",
	grapple: "fantasycraft.grapple",
	handleItem: "fantasycraft.handleItem",
	parry: "fantasycraft.parry",
	pummle: "fantasycraft.pummle",
	refresh: "fantasycraft.refresh",
	run: "fantasycraft.run",
	shieldBlock: "fantasycraft.shieldBlock",
 	taunt: "fantasycraft.taunt",
	trip: "fantasycraft.trip",
	threaten: "fantasycraft.threaten",
	tire: "fantasycraft.tire",
	totalDefense: "fantasycraft.totalDefense"
}

fantasycraft.attackTrickKeywords = 
{
	none: "",
	any: "fantasycraft.any",
	unarmed: "fantasycraft.unarmed",
	melee: "fantasycraft.melee",
	ranged: "fantasycraft.ranged",
	blunt: "fantasycraft.blunt",
	edged: "fantasycraft.edged",
	hurled: "fantasycraft.hurled",
	bow: "fantasycraft.bow",
	bowHurled: "fantasycraft.bowOrHurled",
	siege: "fantasycraft.siege",
	blackPowder: "fantasycraft.blackPowder",
	club: "fantasycraft.club",
	flail: "fantasycraft.flail",
	hammer: "fantasycraft.hammer",
	shield: "fantasycraft.shield",
	staff: "fantasycraft.staff",
	whip: "fantasycraft.whip",
	axe: "fantasycraft.axe",
	fencingBlade: "fantasycraft.fencingBlade",
	knife: "fantasycraft.knife",
	sword: "fantasycraft.sword",
	greatsword: "fantasycraft.greatsword",
	polearm: "fantasycraft.polearm",
	spear: "fantasycraft.spear",
	thrown: "fantasycraft.thrown",
	grenade: "fantasycraft.grenade",
	bows: "fantasycraft.bows",
	crossbow: "fantasycraft.crossbow",
	ritualWeapon: "fantasycraft.ritualWeapon",
	sidearm: "fantasycraft.sidearm",
	longarm: "fantasycraft.longarm",
	bite: "fantasycraft.bite",
	kick: "fantasycraft.kick",
	gore: "fantasycraft.gore",
	squeeze: "fantasycraft.squeeze",
	swallow: "fantasycraft.swallow",
	tailSlap: "fantasycraft.tailSlap",
	trample: "fantasycraft.trample",
	wingBuffet: "fantasycraft.wingBuffet",
	gaze: "fantasycraft.gaze",
	beam: "fantasycraft.beam",
	ray: "fantasycraft.ray"
}

fantasycraft.attackTrickEffects =
{
	replaceAttackRoll: "fantasycraft.replaceAttackRoll",
	replaceAttribute: "fantasycraft.replaceAttribute",
	failDamageSave: "fantasycraft.failDamageSave",
	twoGradesOfCondition: "fantasycraft.twoGradesOfCondition",
	impareAttribute: "fantasycraft.impareAttribute",
	applyCondition: "fantasycraft.applyCondition",
	applyPentaly: "fantasycraft.applyPentaly",
	bonusDamage: "fantasycraft.bonusDamage",
	bonusWeaponDamage: "fantasycraft.bonusWeaponDamage",
	saveBonus: "fantasycraft.saveBonus",
	healVitality: "fantasycraft.healVitality",
	minimumDamage: "fantasycraft.minimumDamage",
	ignoreAP: "fantasycraft.ignoreAP"
}

fantasycraft.trickConditions = 
{
	hitBy4: "If you hit by 4 or more",
	hitBy10: "If you hit by 4/10 or more",
	drIsGreater: "If your DR is greater than your Targets",
	targetHasCondition: "Target has a specific condition",
	targetIsSpecial: "Target is Special",
	targetIsStandard: "Target is Standard"
}

fantasycraft.combatActionTrickEffects = 
{
	stopMovement: "fantasycraft.stopMovement",
	gainDR: "fantasycraft.gainDR",
}

fantasycraft.negativeConditions =
{
	baffled: "fantasycraft.baffled",
	bleeding: "fantasycraft.bleeding",
	blinded: "fantasycraft.blinded",
	deafened: "fantasycraft.deafened",
	enraged: "fantasycraft.enraged",
	entangled: "fantasycraft.entangled",
	fatigued: "fantasycraft.fatigued",
	fixated: "fantasycraft.fixated",
	flanked: "fantasycraft.flanked",
	flatFooted: "fantasycraft.flatFooted",
	frightened: "fantasycraft.frightened",
	held: "fantasycraft.held",
	helpless: "fantasycraft.helpless",
	hidden: "fantasycraft.hidden",
	paralyzed: "fantasycraft.paralyzed",
	pinned: "fantasycraft.pinned",
	shaken: "fantasycraft.shaken",
	sickened: "fantasycraft.sickened",
	slowed: "fantasycraft.slowed",
	sprawled: "fantasycraft.sprawled",
	stunned: "fantasycraft.stunned"
}

fantasycraft.stanceEffects = 
{
	accuracyBonus: "fantasycraft.accuracyBonus",
	damageBonus: "fantasycraft.damageBonus",
	dodgeBonusToDefense: "fantasycraft.dodgeBonusToDefense",
	saveBonus: "fantasycraft.saveBonus",
	variableBonus: "fantasycraft.variableBonus",
	maxDamage: "fantasycraft.maxWeaponDamage",
	dr: "fantasycraft.dr",
	reduceHandRequirement: "fantasycraft.reduceHandRequirement",
	increaseAttributes: "fantasycraft.increasesAttribute",
	skillBonus: "fantasycraft.skillBonus",
	reduceThreat: "fantasycraft.reduceThreat",
	conditionImmunity: "fantasycraft.conditionImmunity"
}

fantasycraft.pathEffects = 
{
	feat: "fantasycraft.feat", 
	spell: "fantasycraft.spell", 
	resistances: "fantasycraft.resistance", 
	skillBonus: "fantasycraft.skillBonus", 
	damageBonus: "fantasycraft.damageBonus", 
	damageImmunity: "fantasycraft.damageImmunity", 
	speedBonus: "fantasycraft.speedBonus", 
	saveBonus: "fantasycraft.saveBonus", 
	other: "fantasycraft.other"

}