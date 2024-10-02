import ActorSheetFC from "./SheetBase.js";
import * as Utils from '../../Utils.js';

export default class FCNPCSheet extends ActorSheetFC 
{
    static get defaultOptions()
	{
		return foundry.utils.mergeObject(super.defaultOptions, {
			template:"systems/fantasycraft/templates/sheets/npc-sheet.handlebars",
			classes: ["fantasycraft", "sheet", "actor"],
			width: 750,
			height: 650
		});
	}

    getData()
	{
		const data = super.getData();
		data.config = CONFIG.fantasycraft;
		data.isGM = game.user.isGM;

		this._getSkillInformation(data)
		data.spells = data.actor.items.filter(function(item) {return item.type == "spell"});
		data.armour = data.actor.items.filter(function(item) {return item.type == "armour"});
		data.weapons = data.actor.items.filter(function(item) {return item.type == "weapon"});
		data.attacks = data.actor.items.filter(function(item) {return item.type == "attack"});
		data.general = data.actor.items.filter(function(item) {return item.type == "general"});

		data.qualities = data.actor.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "npcQuality")});
		data.classFeatures = data.actor.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "class")});
		data.feats = data.actor.items.filter(function(item) {return (item.type == "feat")});
		data.paths = data.actor.items.filter(function(item) {return (item.type == "path")});
		data.tricks = data.actor.items.filter(function(item) {return (item.type == "trick")});
		data.stances = data.actor.items.filter(function(item) {return (item.type == "stance")});

		data.featuresList = this._createAlphbatizedNPCQualities(data.actor.items.filter(function(item) {return (item.type == "feature")}), data.feats, data.tricks, data.paths);

		data.spells.sort(Utils.alphabatize)
		data.qualities.sort(Utils.alphabatize)
		this._parseInts(data.attacks); //since the select fields like to return strings rather than ints, a function to fix that.

		for (let [k,v] of Object.entries(data.attacks))
		{
			this._damageAdjustment(v, data.config)
		}

		return data;
	}

	async _onDropItemCreate(itemData)
	{
		let act = this.actor;

		if (itemData.system.containsFlag)
	        act.setFlag("fantasycraft", itemData.name, itemData.name);

		if (itemData.type =="spell")
		{
			let spells = act.items.filter(function(item) {return item.type == "spell"});
			//if the npc already has spells equal to their casting grade, do not add another grade
			let exSpellbook = act.items.filter(function(item) {return item.type == "feature" && item.name == "Expanded Spellbook"});
			if (exSpellbook.length > 0) // For some reason this would not accept any variation of checking to see if it was undefined 
			{
				exSpellbook = exSpellbook[0];
				exSpellbook = Utils.numeralConverter(exSpellbook.system.grades.value);
				if(spells.length >= (Utils.numeralConverter(this.actor.system.spellcasting.grade) + exSpellbook))
					return;
			}
			else if(spells.length >= Utils.numeralConverter(this.actor.system.spellcasting.grade))
			{
				return;
			}
		} 
		else if (itemData.type == "feat")
		{
			if (itemData.system["trick-stance1"] != "")
			{
				const pack = game.packs.get("fantasycraft.tricksandstances");
				let id = pack.index.getName(itemData.system["trick-stance1"])?._id;
				if (!id)
					ui.notifications.warn("fantasycraft.noTrickOrStanceWarning");
				else
				{
					let trick = await pack.getDocument(id);
					await act.createEmbeddedDocuments("Item", [trick]);
				}
			}
			if (itemData.system["trick-stance2"] != "")
			{
				const pack = game.packs.get("fantasycraft.tricksandstances");
				let id = pack.index.getName(itemData.system["trick-stance2"])?._id;
				if (!id)
					ui.notifications.warn("fantasycraft.noTrickOrStanceWarning");
				else
				{
					let trick = await pack.getDocument(id);
					await act.createEmbeddedDocuments("Item", [trick]);
				}
			}

			if (itemData.system.containsFlag)
				act.setFlag("fantasycraft", itemData.name, itemData.name);
		}

		super._onDropItemCreate(itemData);
	}

	_createAlphbatizedNPCQualities(features, feats, tricks, paths)
	{
		let newArray = [];
		let classAbilities = [];
		let featArray = [];
		let trickArray = [];
		let pathArray = [];
		let pathSteps = [];

		for (let [k,v] of Object.entries(features))
		{
			if (v.system.featureType == "class")
			{
				classAbilities.push(v.name);
			}
			else 
			{
				let toPush = v.name;
				if (v.system.xpMultiplier == "grades")
					toPush = toPush + " " + v.system.grades.value;
				if (v.system.xpMultiplier == "points")
					toPush = toPush + " " + v.system.number;
				if (v.system.xpMultiplier == "entries")
					toPush = toPush + " (" + v.system.damageTypes.string + ")";
				if (v.system.xpMultiplier == "damageType")
					toPush = toPush + " (" + v.system.damageTypes.string + ")";

				newArray.push(toPush);
			}
		}
		for (let [k,v] of Object.entries(feats))
		{
			featArray.push(v.name);
		}
		for (let [k,v] of Object.entries(tricks))
		{
			trickArray.push(v.name);
		}
		for (let [k,v] of Object.entries(paths))
		{
			let name = v.name.replace('Path of ','');
			pathArray.push([name, v.system.pathStep]);
		}
		
		if (featArray.length > 0)
		{
			let featString = "Feats(" + this._arrayToString(featArray.sort()) + ")";
			newArray.push(featString);
		}
		
		if (classAbilities.length > 0)
		{
			let classString = "Class Features(" + this._arrayToString(classAbilities.sort()) + ")";
			newArray.push(classString);
		}

		if (trickArray.length > 0)
		{
			let trickString = "Tricky(" + this._arrayToString(trickArray.sort()) + ")";
			newArray.push(trickString);
		}
		if (pathArray.length > 0)
		{
			let pathString = "Devoted(" + this._arrayToString(pathArray.sort(), true) + ")";
			newArray.push(pathString);
		}

		newArray.sort();

		return newArray;
	}

	_arrayToString(array, step = false)
	{
		let string = ""
		for (let i = 0; i < array.length; i++) 
		{
			if (i == array.length - 1)
				string = (step) ? string + array[i][0] + " " + array[i][1] : string + array[i];
			else
			string = (step) ? string + array[i][0] + " " + array[i][1] + ", ": string + array[i] + ", ";
		}

		return string;
	}

	_parseInts(attacks)
	{
		for (let [k,v] of Object.entries(attacks))
		{
			let upgrade = v.system.naturalUpgrades;
			upgrade.keen = parseInt(upgrade.keen);
			upgrade.armourPiercing = parseInt(upgrade.armourPiercing);
			upgrade.reach = parseInt(upgrade.reach);	  
		}
	}

	async _damageAdjustment(attackData, config)
	{
		if (attackData.system.attackType == "extraSave") return;

		let dSize = attackData.system.damage.diceSize;
		let dNum = attackData.system.damage.diceNum;

		if (attackData.system.attackType == "extraDamage")
		{
			dNum = Math.ceil(this.actor.system.threat/2)
			attackData.system.damage.diceNum = dNum;
			attackData.system.damage.value = dNum + "d" + dSize;
			return;
		}

		switch(this.actor.system.size)
		{
			case "nuisance": case "fine": case "diminutive": case "tiny":
				dSize = config.naturalAttacks[attackData.system.naturalAttack][0].dSize;
				dNum = config.naturalAttacks[attackData.system.naturalAttack][0].dNum;
				break;
			case "small":
				dSize = config.naturalAttacks[attackData.system.naturalAttack][1].dSize;
				dNum = config.naturalAttacks[attackData.system.naturalAttack][1].dNum;
				break;
			case "medium":
				dSize = config.naturalAttacks[attackData.system.naturalAttack][2].dSize;
				dNum = config.naturalAttacks[attackData.system.naturalAttack][2].dNum;
				break;
			case "large":
				dSize = config.naturalAttacks[attackData.system.naturalAttack][3].dSize;
				dNum = config.naturalAttacks[attackData.system.naturalAttack][3].dNum;
				break;
			case "huge": case "gargantuan":
				dSize = config.naturalAttacks[attackData.system.naturalAttack][4].dSize;
				dNum = config.naturalAttacks[attackData.system.naturalAttack][4].dNum;
				break;
			case "colossal": case "enormous": case "vast":
				dSize = config.naturalAttacks[attackData.system.naturalAttack][5].dSize;
				dNum = config.naturalAttacks[attackData.system.naturalAttack][5].dNum;
				break;
			default:
				console.log("size not found")
		}

		if (attackData.system.attackGrade != "I" && attackData.system.attackGrade != "II")  
			dNum *= (attackData.system.attackGrade == "V") ? 3 : 2;
		else dNum *=1

		attackData.system.damage.diceSize = dSize;
		attackData.system.damage.diceNum = dNum;
		attackData.system.damage.value = dNum + "d" + dSize;
	}

	async _getSkillInformation(actorData)
	{
		let npcSkills = actorData.actor.system.signatureSkills;
		let npcGradeTable = actorData.config.npcSignatureSkills;

		this._assignAttributeMod(actorData, npcSkills);

		for (let [k,v] of Object.entries(npcSkills))
		{
			v.skillBonus = npcGradeTable[v.skillGrade][(actorData.actor.system.threat-1)];
			v.total = v.skillBonus + v.attributeBonus;
		}

		await actorData.actor.update({"system.signatureSkills": npcSkills});
		
		return actorData;
	}

	_assignAttributeMod(actorData, npcSkills)
	{
		for (let [k,v] of Object.entries(npcSkills))
		{
			let skillName = v.skillName.replace('fantasycraft.', '');
			v.skillAttribute = actorData.config.skillAttribute[skillName];
			v.attributeBonus = actorData.actor.system.abilityScores[v.skillAttribute].mod;
		}
		
		return npcSkills
	}

}