import ActorSheetFC from "./SheetBase.js";

export default class FCCharacterSheet extends ActorSheetFC {

	static get defaultOptions()
	{
		return mergeObject(super.defaultOptions, {
			template:"systems/fantasycraft/templates/sheets/character-sheet.handlebars",
			scrollY: [
			  ".spellcasting .spell-list"
			],
			classes: ["fantasycraft", "sheet", "actor"],
			width: 756,
			height: 950	  
		});
	}

	_preCreate(data, user) 
	{
		super._preCreate(data, user);
	
		const tokenUpdateData = {};
		// Link token data by default
		if (data.prototypeToken?.actorLink === undefined) {
		  tokenUpdateData["actorLink"] = true;
		}
	
		if (!foundry.utils.isEmpty(tokenUpdateData)) this.prototypeToken.updateSource(tokenUpdateData);
	}	

	getData()
	{
		const data = super.getData();
		data.config = CONFIG.fantasycraft;


		data.ancestries = data.actor.items.filter(function(item) {return item.type == "ancestry"});
		data.ancestryFeatures = data.actor.items.filter(function(item) {return (item.type == "feature" && (item.system.source == data.ancestries[0]?.name || item.system.source == data.ancestries[1]?.name))});
		data.armour = data.actor.items.filter(function(item) {return item.type == "armour"});
		data.classes = data.actor.items.filter(function(item) {return item.type == "class"});
		data.classFeatures = data.actor.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "class")});
		data.feats = data.actor.items.filter(function(item) {return item.type == "feat"});
		data.magicItems = data.actor.items.filter(function(item) {return item.system.isMagic});
		data.ownedItems = data.actor.items.filter(function(item) {return item.type == "general"});
		data.paths = data.actor.items.filter(function(item) {return item.type == "path"});
		data.specialty = data.actor.items.filter(function(item) {return item.type == "specialty"});
		data.specialties = data.actor.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "origin" && item.system.source != data.ancestries[0]?.name && item.system.source != data.ancestries[1]?.name)});
		data.spells = data.actor.items.filter(function(item) {return item.type == "spell"});
		data.attacks = data.actor.items.filter(function(item) {return item.type == "attack"});
		data.weapons = data.actor.items.filter(function(item) {return item.type == "weapon"});
		data.effects = data.actor.getEmbeddedCollection("ActiveEffect").contents;
		data.tricks = data.actor.items.filter(item => item.type == "trick" && (item.system.trickType.keyword != "pathSpellCasting" && item.system.trickType.keyword != "spellcasting"));
		data.spellTricks = data.actor.items.filter(item => item.type == "trick" && (item.system.trickType.keyword == "pathSpellCasting" || item.system.trickType.keyword == "spellcasting"));
		data.stances = data.actor.items.filter(item => item.type == "stance");

		data.hasCutting = data.actor.items.filter(item => item.name == game.i18n.localize("fantasycraft.arrowCutting"));
		data.hasParry = data.actor.items.filter(item => item.name == game.i18n.localize("fantasycraft.parry"));
		data.hasBlock = data.actor.items.filter(item => item.name == game.i18n.localize("fantasycraft.shieldBlock"));
		
		data.weapons = this._ammoSort(data.weapons);
		let feats = this._getFeatNumber(data);
		for (let feat of Object.keys(feats))
		{
			data[feat] = feats[feat];
		}

		this._calculateEquipmentWeight(data);
		this._splitInterests(data);
		
		//Set the labels for the stat fields in the players ancestries and talents. 
		for (let i = 0; i < data.ancestries.length; i ++)
		{
			for ( let [n, name] of Object.entries(data.ancestries[i].system.stats)) 
			name.label = n;
		}

		data.spells = this._filterItems(data.spells, this._filters.spellList, "school");
		data.spells = this._filterItems(data.spells, this._filters.spellLevels, "level");

		data["classNames"] = this.actor.itemTypes.class.map(c => c.name).join(", ");
		
		return data;
	}

	activateListeners(html)
	{
		html.find('.sortTable').click(this._sortTable.bind(this));
		//html.find('.school-filter').click(this._filterSpells.bind(this));

		super.activateListeners(html);
	}

	_ammoSort(weapons)
	{
		let sortedArr = weapons.reduce((acc, element) => {
			if (element.system.weaponCategory == "arrowsAndBolts") {
			  return [element, ...acc];
			}
			return [...acc, element];
		  }, []);

		  sortedArr = weapons.reduce((acc, element) => {
			if (element.name == "Standard ammo") {
			  return [element, ...acc];
			}
			return [...acc, element];
		  }, []);

		  
		return sortedArr;
	}

	_getFeatNumber(data)
	{
		let items = data.actor.items;
		let expertFeats = items.filter(item => (item.type == "feature" && item.name.includes(game.i18n.localize("fantasycraft.expert"))));

		//get the number of each type of feat the character has. 
		let feats = {
			basicFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.basicCombat")).length,
			meleeFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.meleeCombat")).length,
			rangedFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.rangedCombat")).length,
			unarmedFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.unarmedCombat")).length,
			chanceFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.chance")).length,
			covertFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.covert")).length,
			gearFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.gear")).length,
			skillFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.skill")).length,
			spellcastingFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.spellcasting")).length,
			speciesFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.species")).length,
			styleFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.style")).length,
			terrainFeats: items.filter(item => (item.type == "feat" && item.system.featType == "fantasycraft.terrain")).length
		}

		//if the character has a feat expert feature, add 2 to that type of feat. 
		if (expertFeats.length > 0)
		{
			for (let feat of Object.keys(feats))
			{
				let featName = feat.replace('Feats', '');
				featName = featName.charAt(0).toUpperCase() + featName.slice(1);
				if(expertFeats.find(item => item.name.includes(featName)))
					feats[feat] += 2;
			}
		}

		return feats;
	}

	//Replace the normal code for dropping an item on the character sheet.
	async _onDropItemCreate(itemData) 
	{		
		const act = this.actor;
		const char = act.system;
		let dontAdd = false;
		
		if (itemData.type == "ancestry")
		{
			let ancestryCheck = act.itemTypes.ancestry.find(a => a.type == itemData.type);
			let hasAncestry = !!ancestryCheck;
			let talented = undefined;

			//If the player has an ancestry already
			if (hasAncestry)
			{
				//check to see if the character is human and if we're trying to add a talent
				if (ancestryCheck.name == "Human" && itemData.system.isTalent)
				{
					//if the character is human check to see if they already have a talent
					talented = act.itemTypes.ancestry.find(a => a.system.isTalent);
				}

				//if the character is not human, the item being added is not a talent, or if the human character already has a talent don't add this origin option
				if (ancestryCheck.name != "Human" || !itemData.system.isTalent || !!talented)
				{
					dontAdd = true;
					return;		
				}
			}
			
			//Add tyhe ancestry
			this._alterAncestry(itemData, act, true);
		}
		if (itemData.type == "general")
		{
			let itemCheck = act.itemTypes.general.find(i => i.name == itemData.name);
			let hasItem = !!itemCheck;

			if (hasItem)
			{
				dontAdd = true;
				await itemCheck.update({"system.quantity": itemCheck.system.quantity++});
			}
		}
		else if ( itemData.type == "class")
		{
			//look through the classes that are already on the character to see if any match the name of the dropped class
			const clss = act.itemTypes.class.find(c => c.name == itemData.name);
			//if clss does exist on our character prior level is equal to the class level already on the character, if undefined it's 0
			let priorLevel = clss?.system.levels ?? 0;
			//if clss is defined hasClass is true, else false
			const hasClass = !!clss;

			// Increment levels instead of creating a new item
			if ( hasClass ) {
				const next = (char.careerLevel.value == 20) ? 0 : priorLevel + 1;

				if ( next > priorLevel ) 
				{
					itemData.levels = next;
					await clss.update({"system.levels": next});
				}
				dontAdd = true;
			}
			// If we're adding a class for the first time, also set all of the skills from that class to class skills for the character.
			else
			{
				for (const skill of itemData.system.classSkills.value)
				{
					char.skills[skill].classSkill = true;
					let skillString = "system.skills." + [skill] + ".classSkill";
					await act.update({[skillString]: true});
				}
			}
			// Add class features
			if ( !hasClass || dontAdd ) 
			{
				let features = await ActorSheetFC.getClassFeatures(
					{ 
						className: itemData.name, 
						level: itemData.system.levels, 
						priorLevel: priorLevel
					}
				);

				//If this is your first class level, check to see if you already have a class of the same type, if you do remove the core ability before adding abilities to character.
				if (itemData.system.levels == 1)
				{
					if (char.careerLevel.value > 0 && itemData.system.classType == "base")
					{
						features.pop();
					}
					else if (itemData.system.classType == "expert")
					{
						let expert = this.actor.items.find(item => item.type == "class" && item.system.classType == "expert");
						if (!!expert)
							features.pop();
					} 
					else if (itemData.system.classType == "master")
					{
						let master = this.actor.items.find(item => item.type == "class" && item.system.classType == "master");
						if (!!master)
							features.pop();
					}
				}
				
				if (features.length > 0){
					await act.createEmbeddedDocuments("Item", [features[0]]);
					if (features.length > 1)
						await act.createEmbeddedDocuments("Item", [features[1]]);
				}
			}

		} else if (itemData.type == "specialty")
		{
			// Start by getting the feat that the specialty provides and adding to the sheet
			const feat = await ActorSheetFC.getFeat({ specialtyName: itemData.name });
			if (feat != null) await this.actor.createEmbeddedDocuments("Item", [feat]);

			// Get the different features added by the Specialty to add them to the sheet. 
			const features = await ActorSheetFC.getOriginFeatures({originName: itemData.name});
			for (const feature of features)
			{
				await act.createEmbeddedDocuments("Item", [feature]);
				//after creating the item on the character find the new item on the character and update the source
				let newFeature = act.items.find(item => item.name == feature.name);
				await newFeature.update({"system.source": itemData.name});
			}

			//alter practiced and attribute training items on the sheet. 
			this.alterOptions(act, itemData)
		}
		else if (itemData.type == "spell")
		{
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
		else if (itemData.type == "feature")
		{
			if (itemData.system.containsFlag)
				act.setFlag("fantasycraft", itemData.name, itemData.name);
		}
		// Default drop handling if the item should be added
		if ( !dontAdd ) super._onDropItemCreate(itemData);
	}


	//Add or remove an ancestry from the character
	async _alterAncestry(itemData, act, add)
	{
		//if add is true apply racial adustments, if add is false, remove them instead
		for ( let [n, name] of Object.entries(itemData.system.stats)) 
			if (name.value != 0)
				this.AbilityAdjustment(name, act, add);
  
		
		//Add any secondary move types to the character
		if (itemData.system.speed2.type != "none")
		{
			let charRef = act.system.movement[itemData.system.speed2.type];
			let moveType = "system.movement." + itemData.system.speed2.type + ".value";
			let runSpeed = "system.movement." + itemData.system.speed2.type + ".run";
			let travelSpeed = "system.movement." + itemData.system.speed2.type + ".travel";
			if (add)
				await act.update({[moveType]: itemData.system.speed2.value, [runSpeed]: itemData.system.speed2.value*4,
				[travelSpeed]: itemData.system.speed2.value/10});
			else
				await act.update({[moveType]: charRef.value - itemData.system.speed2.value, [runSpeed]: charRef.value - (itemData.system.speed2.value*4),
				[travelSpeed]: charRef.value - (itemData.system.speed2.value/10)});
		}

		//If adding an ancestry apply that ancestries details to the character and add the ancestry features, otherwise set them back to default and remove the features.
		if (add)
		{
			const features = await ActorSheetFC.getOriginFeatures({ originName: itemData.name });

			for (const feature of features)
			{
				await act.createEmbeddedDocuments("Item", [feature]);
				//after creating the item on the character find the new item on the character and update the source
				let newFeature = act.items.find(item => item.name == feature.name);
				await newFeature.update({"system.source": itemData.name});
			}

			features.forEach(function (feature) {
				if (feature.system.containsFlag)
					act.setFlag("fantasycraft", feature.name, feature.name);
			})

			let ancestryName = (itemData.system.isTalent) ? act.system.ancestry + "/" + itemData.name : itemData.name;

			await act.update({"system.ancestry": ancestryName, "system.movement.ground.value": itemData.system.speed, "system.movement.ground.run": itemData.system.speed*4,
			"system.movement.ground.travel": itemData.system.speed/10, "system.size": itemData.system.size, "system.footprint.width": itemData.system.footprint.width, 
			"system.footprint.height": itemData.system.footprint.height, "system.reach": itemData.system.reach});
		}
		else
		{
			let features = act.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "ancestry")});
			let featureIDs = [];

			if (features.length > 0)
				for (let i = features.length - 1; i >= 0; i--)
					featureIDs = featureIDs.concat(features[i]._id)

			await act.deleteEmbeddedDocuments("Item", featureIDs);

			await act.update({"system.ancestry": "undefined", "system.movement.ground.value": 0, "system.movement.ground.run": 0, "system.movement.ground.travel": 0, "system.size": "medium", 
			"system.footprint.width": 1, "system.footprint.height": 1, "system.reach": 1});
		}
	}

	async alterOptions(act, itemData)
	{
		let practiced = act.itemTypes.feature.filter(f => f.name == "Practiced");
		let attribute = act.itemTypes.feature.find(f => f.name == "Attribute Training");
		let skillPair = act.itemTypes.feature.find(f => f.name == "Paired Skills");
		let featExpert = act.itemTypes.feature.find(f => f.name == "Feat Expert");
		// Practiced skills
		if (!!practiced)
		{
			for (let i = 0; i < practiced.length; i++)
			{
				let practicedSkill = await ActorSheetFC.getSkillOrStats({ originName: itemData.name, searchObject: "skill"})
				let newName = "Practiced " + practicedSkill[i];
				await practiced[i].update({name: newName});
			}
		}

		//Attribute Training
		if(!!attribute)
		{
			let attributeTraining = await ActorSheetFC.getSkillOrStats({ originName: itemData.name, searchObject: "attribute"})
			let newDescription = "The lower of your " + attributeTraining[0] + " or " + attributeTraining[1] + " increases by 1, your choice in the case of a tie.";

			await attribute.update({"system.description.value": newDescription, name: "Attribute Training (" + attributeTraining[0] + ", " + attributeTraining[1]});
		}

		//Paired Skills
		if(!!skillPair)
		{
			let pairedSkill = await ActorSheetFC.getSkillOrStats({ originName: itemData.name, searchObject: "paired"})
			let newDescription = "Whenever you gain ranks in " + pairedSkill[0] + " you gain equal ranks in  " + pairedSkill[1] + ". This may not increase " + pairedSkill[1] + " beyond its maximum ranks.";

			await skillPair.update({"system.description.value": newDescription, name: "Paired Skills (" + pairedSkill[0] + ", " + pairedSkill[1]});
		}

		//Feat Expert
		if(!!featExpert)
		{
			let featType = await ActorSheetFC.getSkillOrStats({ originName: itemData.name, searchObject: "feat"})
			let newName = featType + " Expert";

			await featExpert.update({name: newName});
		}
	}

	//overriding the default _onItemDelete from sheetbase to also remove important features
	async _onItemDelete(event, id="")
	{
		let act = this.actor;
		let itemID;
		let itemData;
		if (id == "")
		{
			itemID = event.currentTarget.closest(".item");
			itemData = act.items.get(itemID.dataset.itemId);
		}
		else 
			itemData = act.items.get(id);

		//If the item being removed is an ancestry, remove the ancestry features
		if (itemData.type == "ancestry")
		{
			this._alterAncestry(itemData, act, false);
		}
		//Most class information auto calculates but still need to remove class skills if they're not duplicated by another class.
		else if (itemData.type == "class")
		{
			for (const skill of itemData.system.classSkills.value)
			{
				let keepSkill = false;
				// For each class the character has other than this one
				for (const clss of act.itemTypes.class)
				{
					if (clss.name == itemData.name)
						continue;
					// If that class has 'skill' as a class skill then skip this skill
					if (clss.system.classSkills.value.includes(skill))
						keepSkill = true;
				}

				let skillString = "system.skills." + [skill] + ".classSkill";
				await act.update({[skillString]: keepSkill});						
			}
		}
		else if (itemData.type == "feat")
		{
			if (itemData.system["trick-stance1"] != "")
			{
				let id = act.items.find(item => item.name == itemData.system["trick-stance1"])?._id;
				if (!!id)
					act.deleteEmbeddedDocuments("Item", [id])
			}
			if (itemData.system["trick-stance2"] != "")
			{
				let id = act.items.find(item => item.name == itemData.system["trick-stance2"])?._id;
				if (!!id)
					act.deleteEmbeddedDocuments("Item", [id])
			}
		}
	
		if (id == "")
			super._onItemDelete(event);
		else 
			super._onItemDelete(event, id);
	}

	_calculateEquipmentWeight(data)
	{
		for (let [k,v] of Object.entries(data.ownedItems))
		{
			let weight = (parseFloat(v.system.weight) * v.system.quantity);
			let rounded = Math.round(weight * 100) / 100
			v.update({"system.totalWeight": rounded});
		}
		for (let [k,v] of Object.entries(data.weapons))
		{
			let weight = (parseFloat(v.system.weight) * v.system.quantity);
			let rounded = Math.round(weight * 100) / 100
			v.update({"system.totalWeight": rounded});		
		}
	}

	_splitInterests(data)
	{
		let act = this.actor;
		
		let interests = act.system.interests;

		interests.studies.array = interests.studies.custom.split(";");
		interests.languages.array = interests.languages.custom.split(";");
		interests.alignment.array = interests.alignment.custom.split(";");
	}

	//wrapper function to add or remove racial modifiers from the character.
	async AbilityAdjustment(itemData, act, add)
	{
		let abilityString = "system.abilityScores." + itemData.ability + ".value";
		if (add)
			await act.update({[abilityString]: act.system.abilityScores[itemData.ability].value + itemData.value});
		else
			await act.update({[abilityString]: act.system.abilityScores[itemData.ability].value - itemData.value});
	}

	
	_sortTable(event)
	{
		let pinnedSpellList = this.actor.items.filter(item => item.type == "spell" && item.system.pinned);

		this._sortFunction(event, pinnedSpellList);

		this._sortFunction(event, null, 1+pinnedSpellList.length);

	}

	_sortFunction(event, pinnedList, startPosition = 1)
	{
		let table;
		let rows;
		let switching;
		let i;
		let x;
		let y;
		let shouldSwitch;
		let dir;
		let switchcount = 0;
		table = event.currentTarget.parentElement.closest(".item-table");
		let col = event.target.attributes.value.value;
		switching = true;
		// Set the sorting direction to ascending:
		dir = "asc";
		/* Make a loop that will continue until no switching has been done: */
		while (switching) 
		{
			switching = false;
			rows = table.rows;
			/* Loop through all table rows (except the first, which contains table headers): */
			for (i = startPosition; i < (rows.length - 1); i++) 
			{
				// Start by saying there should be no switching:
				shouldSwitch = false;
				/* Get the two elements you want to compare, one from current row and one from the next: */
				x = (col == 1 ) ? rows[i].getElementsByTagName("td")[col].children[0].children[0] : rows[i].getElementsByTagName("td")[col];
				let xPin = (pinnedList == null) ? true : pinnedList.filter(item => item.name == rows[i].getElementsByTagName("td")[1].children[0].children[0].children[0].innerHTML)[0]?.system.pinned;
				y = (col == 1 ) ? rows[i+1].getElementsByTagName("td")[col].children[0].children[0] : rows[i+1].getElementsByTagName("td")[col];
				let yPin = (pinnedList == null) ? true : pinnedList.filter(item => item.name == rows[i+1].getElementsByTagName("td")[1].children[0].children[0].children[0].innerHTML)[0]?.system.pinned;

				/* Check if the two rows should switch place, based on the direction, asc or desc: */
				/* Also, if checking pinned items only, switch if y is a pinned item */
				if (pinnedList != null)
				{
					if (!xPin && yPin)
					{
						shouldSwitch = true;
						break;
					}
					else if (xPin && yPin && dir == "asc" && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase())
					{
						shouldSwitch = true;
						break;
					}
					else if (xPin && yPin && dir == "desc" && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase())
					{
						shouldSwitch = true;
						break;
					}
				}
				else
				{
					if (dir == "asc") 
					{
						if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) 
						{
							// If so, mark as a switch and break the loop:
							shouldSwitch = true;
							break;
						}
					} else if (dir == "desc") 
					{
						if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) 
						{
							// If so, mark as a switch and break the loop:
							shouldSwitch = true;
							break;
						}
					}
				}
			}
			if (shouldSwitch) 
			{
				/* If a switch has been marked, make the switch and mark that a switch has been done: */
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
				// Each time a switch is done, increase this count by 1:
				switchcount ++;
			} 
			else 
			{
				/* If no switching has been done AND the direction is "asc", set the direction to "desc" and run the while loop again. */
				if (switchcount == 0 && dir == "asc") 
				{
					dir = "desc";
					switching = true;
				}
			}
		}	
	}

	//If x > y and x is NOT pinned or x and y are both pinned, switch
	//
	
	_filterItems(items, filters, filterType)
	{
		if (filterType == "school")
		{
			return items.filter(item => {

				let school = item.system.school;
				school = school.charAt(0).toUpperCase() + school.slice(1);

				if (filters.has(school)) return false;
			
				return true;
			});
		}
		else if (filterType == "level")
		{
			return items.filter(item => {

				let level = item.system.level;
				//level = level.charAt(0).toUpperCase() + school.slice(1);

				if (filters.has("level" + level)) return false;
			
				return true;
			});
		}
	}
}