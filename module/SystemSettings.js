export const registerSystemSettings = async function() {

	//////////////////////////////////
	////////CAMPAIGN QUALITIES////////
	//////////////////////////////////

	//Adventure Insurance
	game.settings.register("fantasycraft", "adventureInsurance", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.adventureInsurance.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.adventureInsurance.label",
		type: Boolean,
		default: false
	});

	//Beefy Heroes
	game.settings.register("fantasycraft", "beefyHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.beefyHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.beefyHeroes.label",
		type: Boolean,
		default: false
	});

	//Bleak Heroes
	game.settings.register("fantasycraft", "bleakHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.bleakHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.bleakHeroes.label",
		type: Boolean,
		default: false
	});


	//Bold Heroes
	game.settings.register("fantasycraft", "boldHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.boldHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.boldHeroes.label",
		type: Boolean,
		default: false
	});


	//Code of Honor
	game.settings.register("fantasycraft", "codeOfHonor", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.codeOfHonor.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.codeOfHonor.label",
		type: Boolean,
		default: false
	});


	//Complex Heroes
	game.settings.register("fantasycraft", "complexHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.complexHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.complexHeroes.label",
		type: Boolean,
		default: false
	});


	//Dead Means Dead
	game.settings.register("fantasycraft", "deadMeansDead", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.deadMeansDead.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.deadMeansDead.label",
		type: Boolean,
		default: false
	});


	//Deadly Combat
	game.settings.register("fantasycraft", "deadlyCombat", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.deadlyCombat.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.deadlyCombat.label",
		type: Boolean,
		default: false
	});


	//Dominant Heroes
	game.settings.register("fantasycraft", "dominantHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.dominantHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.dominantHeroes.label",
		type: Boolean,
		default: false
	});


	//Doomed Heroes
	game.settings.register("fantasycraft", "doomedHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.doomedHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.doomedHeroes.label",
		type: Boolean,
		default: false
	});


	//Dramatic Pacing
	game.settings.register("fantasycraft", "dramaticPacing", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.dramaticPacing.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.dramaticPacing.label",
		type: Boolean,
		default: false
	});


	//Fast Attributes
	game.settings.register("fantasycraft", "fastAttributes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fastAttributes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fastAttributes.label",
		type: Boolean,
		default: false
	});


	//Fast Feats
	game.settings.register("fantasycraft", "fastFeats", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fastFeats.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fastFeats.label",
		type: Boolean,
		default: false
	});


	//Fast Interests
	game.settings.register("fantasycraft", "fastInterests", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fastInterests.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fastInterests.label",
		type: Boolean,
		default: false
	});


	//Fast Levels
	game.settings.register("fantasycraft", "fastLevels", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fastLevels.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fastLevels.label",
		type: Boolean,
		default: false
	});


	//Fast Proficiencies
	game.settings.register("fantasycraft", "fastProficiencies", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fastProficiencies.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fastProficiencies.label",
		type: Boolean,
		default: false
	});


	//Feat Exchange
	game.settings.register("fantasycraft", "featExchange", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.featExchange.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.featExchange.label",
		type: Boolean,
		default: false
	});


	//Flexible Magic Items
	game.settings.register("fantasycraft", "flexibleMagicItems", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.flexibleMagicItems.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.flexibleMagicItems.label",
		type: Boolean,
		default: false
	});


	//Fragile Heroes
	game.settings.register("fantasycraft", "fragileHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fragileHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fragileHeroes.label",
		type: Boolean,
		default: false
	});


	//Fragile Monsters (Custom)
    game.settings.register("fantasycraft", "fragileMonsters", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fragileMonsters.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fragileMonsters.label",
		type: Boolean,
		default: false
	});


	//Greater Magic Items
    game.settings.register("fantasycraft", "fragileMonsters", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.fragileMonsters.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.fragileMonsters.label",
		type: Boolean,
		default: false
	});

	//Hearty Heroes
    game.settings.register("fantasycraft", "heartyHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.heartyHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.heartyHeroes.label",
		type: Boolean,
		default: false
	});

	//Hewn Limbs
    game.settings.register("fantasycraft", "hewnLimbs", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.hewnLimbs.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.hewnLimbs.label",
		type: Boolean,
		default: false
	});

	//Iron Heroes
    game.settings.register("fantasycraft", "ironHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.ironHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.ironHeroes.label",
		type: Boolean,
		default: false
	});

	//Jacks of all Trades
    game.settings.register("fantasycraft", "jacksOfAllTrades", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.jacksOfAllTrades.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.jacksOfAllTrades.label",
		type: Boolean,
		default: false
	});

	//Larger-Than-Life Heroes
    game.settings.register("fantasycraft", "largerThanLifeHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.largerThanLifeHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.largerThanLifeHeroes.label",
		type: Boolean,
		default: false
	});

	//Lesser Heroes
    game.settings.register("fantasycraft", "lesserHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.lesserHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.lesserHeroes.label",
		type: Boolean,
		default: false
	});

	//Luck Abounds
    game.settings.register("fantasycraft", "luckAbounds", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.luckAbounds.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.luckAbounds.label",
		type: Boolean,
		default: false
	});

	//Miracles
	game.settings.register("fantasycraft", "Miracles", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.miracles.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.miracles.label",
		type: Boolean,
		default: true
    });

		//Beneficent Universe
		game.settings.register("fantasycraft", "beneficentUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.beneficentUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.beneficentUniverse.label",
			type: Boolean,
			default: false
		});
		//Fickle Universe
		game.settings.register("fantasycraft", "fickleUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.fickleUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.fickleUniverse.label",
			type: Boolean,
			default: false
		});
		//Generous Universe
		game.settings.register("fantasycraft", "generousUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.generousUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.generousUniverse.label",
			type: Boolean,
			default: false
		});
		//Indifferent Universe
		game.settings.register("fantasycraft", "indifferentUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.indifferentUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.indifferentUniverse.label",
			type: Boolean,
			default: false
		});
		//Strict Universe
		game.settings.register("fantasycraft", "strictUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.strictUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.strictUniverse.label",
			type: Boolean,
			default: false
		});
		//Warring Universe
		game.settings.register("fantasycraft", "warringUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.warringUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.warringUniverse.label",
			type: Boolean,
			default: false
		});
		//Wrathful Universe
		game.settings.register("fantasycraft", "wrathfulUniverse", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.wrathfulUniverse.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.wrathfulUniverse.label",
			type: Boolean,
			default: false
		});
    

	//Monty Haul
	game.settings.register("fantasycraft", "montyHaul", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.montyHaul.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.montyHaul.label",
		type: Boolean,
		default: false
	});

	//Non-Scaling NPCs
	game.settings.register("fantasycraft", "nonScalingNPCs", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.nonScalingNPCs.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.nonScalingNPCs.label",
		type: Boolean,
		default: false
	});

	//Paranoia
	game.settings.register("fantasycraft", "paranoia", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.paranoia.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.paranoia.label",
		type: Boolean,
		default: false
	});

	//Plentiful Magic Items
	game.settings.register("fantasycraft", "plentifulMagicItems", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.plentifulMagicItems.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.plentifulMagicItems.label",
		type: Boolean,
		default: false
	});

	//Rampant Corruption
	game.settings.register("fantasycraft", "rampantCorruption", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.rampantCorruption.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.rampantCorruption.label",
		type: Boolean,
		default: false
	});

	//Rare Magic Items
	game.settings.register("fantasycraft", "rareMagicItems", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.rareMagicItems.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.rareMagicItems.label",
		type: Boolean,
		default: false
	});

	//Reputable Heroes
	game.settings.register("fantasycraft", "reputableHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.reputableHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.reputableHeroes.label",
		type: Boolean,
		default: false
	});

	//Reviled Heroes
	game.settings.register("fantasycraft", "reviledHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.reviledHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.reviledHeroes.label",
		type: Boolean,
		default: false
	});

	//Savage Wilds
	game.settings.register("fantasycraft", "savageWilds", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.savageWilds.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.savageWilds.label",
		type: Boolean,
		default: false
	});

	//Sorcery
    game.settings.register("fantasycraft", "Sorcery", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.sorcery.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.sorcery.label",
		type: Boolean,
		default: true
	});

	
		//Corrupting Magic
		game.settings.register("fantasycraft", "corruptingMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.corruptingMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.corruptingMagic.label",
			type: Boolean,
			default: false
		});
		//Cyclical Magic
		game.settings.register("fantasycraft", "cyclicalMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.cyclicalMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.cyclicalMagic.label",
			type: Boolean,
			default: false
		});
		//Difficult Magic
		game.settings.register("fantasycraft", "difficultMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.difficultMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.difficultMagic.label",
			type: Boolean,
			default: false
		});
		//Easy Magic
		game.settings.register("fantasycraft", "easyMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.easyMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.easyMagic.label",
			type: Boolean,
			default: false
		});
		//Potent Magic
		game.settings.register("fantasycraft", "potentMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.potentMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.potentMagic.label",
			type: Boolean,
			default: false
		});
		//Lost Magic
		game.settings.register("fantasycraft", "lostMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.lostMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.lostMagic.label",
			type: Boolean,
			default: false
		});
		//Random Magic
		game.settings.register("fantasycraft", "randomMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.randomMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.randomMagic.label",
			type: Boolean,
			default: false
		});
		//Ubiquitous Magic
		game.settings.register("fantasycraft", "ubiquitousMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.ubiquitousMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.ubiquitousMagic.label",
			type: Boolean,
			default: false
		});
		//Wild Magic
		game.settings.register("fantasycraft", "wildMagic", {
			config: true,
			scope: "world",
			name: "fantasycraft.SETTINGS.campaignQualities.wildMagic.name",
			hint: "fantasycraft.SETTINGS.campaignQualities.wildMagic.label",
			type: Boolean,
			default: true
		});

	//Tense
	game.settings.register("fantasycraft", "tense", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.tense.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.tense.label",
		type: Boolean,
		default: false
	});

	//Thrifty Heroes
	game.settings.register("fantasycraft", "thriftyHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.thriftyHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.thriftyHeroes.label",
		type: Boolean,
		default: false
	});

	//Triumphant Heroes
	game.settings.register("fantasycraft", "triumphantHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.triumphantHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.triumphantHeroes.label",
		type: Boolean,
		default: false
	});

	//Versitile Heroes
	game.settings.register("fantasycraft", "versatileHeroes", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.versatileHeroes.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.versatileHeroes.label",
		type: Boolean,
		default: false
	});

	//Wire Fu
	game.settings.register("fantasycraft", "wireFu", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.wireFu.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.wireFu.label",
		type: Boolean,
		default: false
	});

	//////////////////////////////////

	game.settings.register("fantasycraft", "milestoneLeveling", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.milestoneLeveling.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.milestoneLeveling.label",
		type: Boolean,
		default: true
	});

    game.settings.register("fantasycraft", "autoRollForNPCs", {
		config: true,
		scope: "world",
		name: "fantasycraft.SETTINGS.campaignQualities.autoRoll.name",
		hint: "fantasycraft.SETTINGS.campaignQualities.autoRoll.label",
		type: Boolean,
		default: true
	});

};
  