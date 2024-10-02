import { fantasycraft } from "./module/config.js";

import ActorFC from "./module/actors/actor.js";
import ItemFC from "./module/items/item.js";

import { preloadHandlebarsTemplates } from "./module/templates.js";
import { registerSystemSettings } from "./module/SystemSettings.js";
import {  _getInitiativeFormula } from "./module/InitRules.js";

import { resetAbilityUsage, createMacro } from "./module/Utils.js";
import FCItemSheet from "./module/items/Sheets/FCItemSheet.js";
import FCCharacterSheet from "./module/actors/Sheets/FCCharacterSheet.js";
import FCNPCSheet from "./module/actors/Sheets/FCNPCSheet.js";
import TraitSelector from "./module/apps/trait-selector.js";
import Resistances from "./module/apps/resistances.js";
import SelectFromCompendium from "./module/apps/select-item-from-compendium.js";
import LevelUp from "./module/apps/level-up.js";

import * as Chat from "./module/chat.js";
import { Conditions, onCombatEnd } from "./module/StatusEffectsManager.js";


Hooks.once("init", function () {
	console.log("Fantasy Craft | Initialising the Fantasy Craft rule system");
	
	CONFIG.fantasycraft = fantasycraft;
	CONFIG.Actor.documentClass = ActorFC;
	CONFIG.Item.documentClass = ItemFC;

	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("fantasycraft", FCCharacterSheet, {     
		types: ["character"],
		makeDefault: true,
		label: "fantasycraft.ClassCharacter"
	});
	Actors.registerSheet("fantasycraft", FCNPCSheet, {     
		types: ["npc"],
		makeDefault: true,
		label: "fantasycraft.ClassNPC"
	});

	game.fantasycraft = {
		applications:
		{
			TraitSelector,
			Resistances,
			SelectFromCompendium,
			LevelUp
		},
		config: fantasycraft,
		chat: Chat,
		entities: 
		{
			ActorFC,
			ItemFC
		}
	};


	CONFIG.Actor.documentClass = ActorFC;

	CONFIG.Combat.initiative.formula = "1d20 + @initiative.class + @abilityScores.dexterity.mod + @initiative.featBonus";
	Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;

	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("fantasycraft", FCItemSheet, { 
		types: [
			'ancestry',
			'armour',
			'attack',
			'class',
			'feat',
			'feature',
			'general',
			'path',
			'specialty',
			'spell',
			'trick',
			'stance',
			'weapon',
			'store'
		],
		makeDefault: true 
	});
	
	
	preloadHandlebarsTemplates();
	registerSystemSettings();

	Hooks.once("ready", async function() {
		if (game.user.isGM)
		(await import(
			'./module/apps/gm-screen.js'
			)
		).default();
	});

	/////////////////////////////////////
	//////// Handlebars Helpers /////////
	/////////////////////////////////////
	Handlebars.registerHelper("times", function(n, content)
	{
		let result = "";

		for (let i = 0; i < n; ++i)
		{
			result += content.fn(i);
		}

		return result;
	})

	Handlebars.registerHelper("timesOverOne", function(n, content)
	{
		let result = "";
		if (n == 1)
			return result;

		for (let i = 0; i < n; ++i)
		{
			result += content.fn(i);
		}

		return result;
	})

	Handlebars.registerHelper("isBool", function(value)
	{
		if (value === 1) return false;
		return value == true;
	})

	Handlebars.registerHelper("convertToNumeral", function(n, content)
	{
		if (n < 2)
			return "";

		let result = "- II";

		if (n == 3) result = "- III"
		else if (n == 4) result = "- IV"
		else if (n == 5) result = "- V"
		else if (n == 6) result = "- VI"
		else if (n == 7) result = "- VII"
		else if (n == 8) result = "- VIII"
		else if (n == 9) result = "- IX"

		content.fn(result);
		return result;
	})

	Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

		let operator = options.hash.operator || "==";

		let operators = 
		{
			'==':		function(l,r) { return l == r; },
			'===':		function(l,r) { return l === r; },
			'!=':		function(l,r) { return l != r; },
			'<':		function(l,r) { return l < r; },
			'>':		function(l,r) { return l > r; },
			'<=':		function(l,r) { return l <= r; },
			'>=':		function(l,r) { return l >= r; },
			'typeof':	function(l,r) { return typeof l == r; }
		}

		var result = operators[operator](lvalue,rvalue);

		if( result )
			return options.fn(this);
		else
			return options.inverse(this);
	});

});



///////////////////////////////////////
//////// Hooks and Conditions /////////
///////////////////////////////////////


Hooks.once ('setup', function(){

	const effects = Conditions.createAllConditions();
	
	for (const effect of CONFIG.statusEffects) 
	{
		effects.push({
			id: effect.id,
			label: effect.name,
			icon: effect.img,
		})
	}

	CONFIG.statusEffects = effects;
});

Hooks.once ('init', function()
{
	CONFIG.Item.compendiumIndexFields = ["system.classType", "system.vitality", "system.baseAttack", "system.fortitude", "system.reflex", "system.will", "system.defense", "system.initiative", "system.lifeStyle", "system.legend", "system.spellPoints"];
});

Hooks.once("ready", async () => 
{
	for (const pack of game.packs.filter(p => p.documentName === "Item")) {
	  await pack.getIndex()
	}
});  

Hooks.on('createActiveEffect', async activeEffect => {
	const statusId = activeEffect.flags?.core?.statusId
	const _parent = activeEffect?.parent
	if (statusId && _parent && game.user.isGM) {
		await _parent.setFlag('fantasycraft', statusId, true)
	
		// If asleep, also add prone and uncoscious
		if (statusId === 'blinded' || statusId === 'held' || statusId === 'paralyzed' || statusId === 'pinned' || statusId === 'sprawled' || statusId === 'stunned') 
		{
		  if (!_parent.effects.find(effect => effect.flags?.core?.statusId === 'flatFooted')) 
		  {
			const flatFooted = CONFIG.statusEffects.find(effect => effect.id === 'flatFooted')
			flatFooted['flags.core.statusId'] = 'flatFooted'
			//await ActiveEffect.create(flatFooted, {parent: _parent})
		  }
		}
		if (statusId === 'prone' || statusId === 'sprawled' || statusId === 'helpless')
		{
		  const hasStance = _parent.effects.find(effect => effect.flags?.core?.statusId === 'stance')
		  if (hasStance) 
		  {
			  let stance = _parent.items.find(item => item.system?.inStance)
			  stance.update({'system.inStance': false});
		  }
		  await hasStance?.delete();
		}
	  }
})

Hooks.on('deleteActiveEffect', async activeEffect => {
	const statusId = activeEffect.flags?.core?.statusId
	const _parent = activeEffect?.parent
	if (statusId && _parent) {
	  await _parent.setFlag('fantasycraft', statusId)
  
	  // If removing a status effect that imposed flat-fooded, also remove flat-footed
	  	if (statusId === 'blinded' || statusId === 'held' || statusId === 'paralyzed' || statusId === 'pinned' || statusId === 'sprawled' || statusId === 'stunned') {
			const flatFooted = _parent.effects.find(effect => effect.flags?.core?.statusId === 'flatFooted')
			//await flatFooted?.delete()
		}
	}
})

Hooks.on('deleteCombat', async combat => 
{
	for (let combatEntry of Object.entries(combat.turns))
	{
		let combatant = game.actors.get(combatEntry[1].actorId);

		onCombatEnd(combatant);
	}
})
  
Hooks.on('combatTurn', async (combat) => 
{
	//combatTurn normally triggers on end turn, using combat.turn+1 to trigger on turn start instead
	let combatant = game.actors.get(combat.turns[combat.turn+1].actorId);
	
	resetAbilityUsage(combatant, "round");
})

//on round start
Hooks.on('combatRound', async (combat) => 
{
	//trigger the same code for the first person in initiative order as other start of turn scripts. 
	let combatant = game.actors.get(combat.turns[0].actorId);
	
	resetAbilityUsage(combatant, "round");
})

Hooks.on('hotbarDrop', (_bar, data, slot) => {
	let dataType = data.type
	delete data.type
	createMacro(data, dataType, slot);
});  

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));