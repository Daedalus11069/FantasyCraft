import {fantasycraft} from '../config.js';
import * as Chat from "../chat.js";
import * as Utils from '../Utils.js';
import {determinePreRollTrickEffect, determinePostRollTrickEffect} from '../Tricks.js';

export default class ActorFC extends Actor {

    prepareBaseData() 
    {
        switch ( this.type ) 
        {
          case "character":
            return this._prepareCharacterData(this.system);
          case "npc":
            return this._prepareNPCData(this.system);
        }
    }

    _prepareCharacterData(actorData) 
    {
      const data = actorData;
    }

    _prepareNPCData(actorData)
    {
      this.system.defense.defenseAttribute = (this.system.defense.defenseAttribute != undefined) ? this.system.defense.defenseAttribute : "dexterity";
      this._npcThreatLevel(actorData);
      this._prepareNPCTraits(actorData);
    }
    
    /** @override */
    prepareDerivedData() 
    {
      const actorData = this;
      const data = actorData.system;
            
      // Ability modifiers
      for (let [id, abl] of Object.entries(data.abilityScores)) 
        abl.mod = Math.floor(((abl.value + abl.adjustment) - 10) / 2);
      
      if (this.type == "npc") 
      {
        this._calculateNPCXP(actorData);
        this._calculateNPCHealth(actorData);
        this._calcualteNPCMovementSpeeds();
        this._getToughValue(actorData);
      }
      
      if(this.type == "character")
      {
        this._careerLevel(actorData);
        this._prepareInterestsAndFocuses(data);
        this._prepareKnowledge(actorData);
        this._prepareskills(actorData);
        this._prepareLifeStyle();
        this._renownInformation();
        this._carryingCapacity(data);

        this._equipmentWeight();
        this._calculateMovementSpeed();

        this.system.unarmedDamage = (this.system.proficency.unarmed.proficient) ? "1d4" : "1d3";
        if (this.system.proficency.unarmed.proficient)
          this.system.attackTypes.unarmed.damageType = "lethal"
      }
      
      this._prepareInitiative(actorData);   
      this._prepareDefense(actorData);
      this._prepareAttack(actorData);       // Determine Attack Bonus, includes checking for martial and masters art
      this._prepareSaves(actorData);
      this._calculateWounds(actorData);
      this._linkAttacks(actorData);
      this._prepareCastingFromItems(actorData);

      if (data.castingLevel > 0)
        this._prepareCasting(actorData);

      this._calculateDamageReduction(actorData);
      this._compileResistances(actorData);
      this._getTrickUses(actorData);

    }

    /////NPC functions/////
    
    _calcualteNPCMovementSpeeds()
    {
      let movement = this.system.movement;

      if (this.system.primaryMovement == "immobile")
        return;
     
      let armourCheck = this.items.filter(function(item) {return (item.type == "armour")});

      let multipler = (armourCheck?.armourCoverage == "full") ? 3 : 4;
      let runnerCheck = this.items.filter(function(item) {return (item.type == "feature" && item.name == "Superior Runner")});
      let travelerCheck = this.items.filter(function(item) {return (item.type == "feature" && item.name == "Superior Traveler")});
      let runner = 0, traveler = 0;
      
      if (runnerCheck.length > 0)
        runner = Utils.numeralConverter(runnerCheck[0].system.grades.value);

      if (travelerCheck.length > 0)
        traveler = Utils.numeralConverter(travelerCheck[0].system.grades.value);

      multipler += runner;

      for (let [k,v] of Object.entries(movement))
      {
        v.run = v.value * multipler;
        v.travel = (v.value/10) + traveler;
      }
    }

    _calculateNPCXP(data)
    {
      let totalXP = 0;
      let npc = data.system;
      //type XP : Construct, Elemental, Horror, Ooze, Plant, Spirit, Undead
      for (let [k, v] of Object.entries(npc.type.value))
      {
        if (v == "construct" || v == "elemental" || v == "horror" || v == "ooze" || v == "plant" || v == "spirit" || v == "undead")
          totalXP += 5;
      }
      //Reach XP
      totalXP += (npc.reach > 1 ) ? npc.reach -1 : 0;
      //movement XP

      if (npc.primaryMovement == "immobile")
      {
        totalXP -= 5;
      }
      else{
        for (let [k,v] of Object.entries(npc.movement))
        {
          totalXP += this._movementXPCalculate(v, k);
        }
      }

      //Attribute XP
      for (let [k, v] of Object.entries(npc.abilityScores))
      {
        if (v.value > 10)
          totalXP += (v.value-10);
      }
      //Traits XP
      for (let [k, v] of Object.entries(npc.traits))
      {
        totalXP += Utils.numeralConverter(v.grade);
      }
      //Skills XP
      for (let [k, v] of Object.entries(npc.signatureSkills))
      {
        totalXP += Utils.numeralConverter(v.skillGrade);
      }
      //Spellcasting XP
      totalXP += Utils.numeralConverter(npc.spellcasting.grade);
      
      //Qualities XP
      totalXP += this._calculateQualityXP(data);
      
      totalXP += this._pathXPCalculate(data)

      //Attacks XP
      totalXP += this._attackXPCalculate(data);

      //Gear XP
      if (npc.playerControlled)
      totalXP += this._gearXPCalculator(data);

      let npcFeats = data.items.filter(function(item) {return item.type == "feat"});
      totalXP += (npcFeats.length *2);
      
      let npcTricks = data.items.filter(function(item) {return item.type == "trick"});
      totalXP += (npcTricks.length *2);

      npc.xp = totalXP;
    }

    _separateDamageTypes(data)
    {
      let damageArray = [];

      data.system.damageTypes.string.split(",").forEach((c, i) => damageArray[i] = c.trim());

      return (damageArray.length * data.system.xpValue);
    }

    _calculateQualityXP(data)
    {
      let tempXP = 0;
      let npcQualities = data.items.filter(function(item) {return item.type == "feature"});
      
      for (let [k,v] of Object.entries(npcQualities))
      {
        let qualityXP = parseInt(v.system.xpValue)
        if (v.system.xpMultiplier == "none")
          tempXP += qualityXP;
        else if (v.system.xpMultiplier == "entries")
          tempXP += this._separateDamageTypes(v);
        else if (v.system.xpMultiplier == "points")
        {
          tempXP += (v.system.number * qualityXP);
        }
        else if (v.system.xpMultiplier == "grades")
        {
          if (v.system.xpDifferentOnIncrease)
          {
            let gradeToNum = Utils.numeralConverter(v.system.grades.value)
            if (gradeToNum > 1)
              tempXP += qualityXP + ((gradeToNum-1) * v.system.xpPerGrade);
            else
              tempXP += qualityXP;
          }
          else
            tempXP += (Utils.numeralConverter(v.system.grades.value) * qualityXP);
        }
        else if (v.system.xpMultiplier == "damageType")
        {
          if (v.system.damageTypes.string == "lethal")
            tempXP += qualityXP;
          else
          {
            tempXP += v.system.xpPerGrade;
          }
        }
      }

      return tempXP;
    }

    _movementXPCalculate(data, moveType)
    {
      if (data.value == 0) return 0;

      let tempXP = 0;
      let type = this._changeMovetype(moveType);

      if (this.system.primaryMovement == type)
        tempXP = ((data.value - 30) /10);
      else
        tempXP += (data.value / 10)

      tempXP = (tempXP < 0) ? 0 : tempXP;

        return tempXP;
    }

    _changeMovetype(type)
    {
      if (type == "ground") return "walker";
      if (type == "fly") return "flyer";
      if (type == "burrow") return "burrower";
      if (type == "swim") return "swimmer";
    }

    _pathXPCalculate(data)
    {
      let npcPaths = data.items.filter(function(item) {return item.type == "path"});
      let pathXP = 0;

      for (let [k,v] of Object.entries(npcPaths))
      {
        pathXP += (v.system.pathStep * 2)
      }

      return pathXP;
    }

    _attackXPCalculate(data)
    {
      let tempXP = 0;

      let attacks = data.items.filter(function(item) {return item.type == "attack"});

      //for each attack add up the XP
      for (let [k, v] of Object.entries(attacks))
      {
        //natural attack 
        if (v.system.attackType == "naturalAttack")
        {
          tempXP += (parseInt(v.system.naturalUpgrades.reach * 2));
          tempXP += (v.system.naturalUpgrades.finesse) ? 2 : 0;
          tempXP += (v.system.naturalUpgrades.grab) ? 2 : 0;
          tempXP += (v.system.naturalUpgrades.trip) ? 2 : 0;
        }
        //natural attack or extraordinary damage
        if (v.system.attackType == "naturalAttack" || v.system.attackType == "extraDamage")
        {
          tempXP += (v.system.attackType == "naturalAttack") ? (Utils.numeralConverter(v.system.attackGrade) * 2) * (v.system.quantity) : (Utils.numeralConverter(v.system.attackGrade) * 2);          
          tempXP += (v.system.damageType == "lethal") ? 0 : 2;
          tempXP += (parseInt(v.system.naturalUpgrades.keen / 2));
          tempXP += (parseInt(v.system.naturalUpgrades.armourPiercing));
          tempXP += (v.system.naturalUpgrades.bleed) ? 2 : 0;
          tempXP += (v.system.naturalUpgrades.aligned) ? 2 : 0;
          tempXP += (v.system.naturalUpgrades.diseased) ? 2 : 0;
          tempXP += (v.system.naturalUpgrades.venomous) ? 2 : 0;
        }

        if (v.system.attackType == "extraSave")
        {
          let descriptionXP = 2;

          if (v.system.attackDescription == "baffling" || v.system.attackDescription == "drainingLife" || v.system.attackDescription == "fatiguing" || v.system.attackDescription == "shaking"
          || v.system.attackDescription == "slowing" || v.system.attackDescription == "stunning")
            descriptionXP = 3;
          if (v.system.attackDescription == "drainingAttribute" || v.system.attackDescription == "paralyzing")
            descriptionXP = 4;
          if (v.system.attackDescription == "drainingSoul" || v.system.attackDescription == "petrifying")
            descriptionXP = 5;

          tempXP += (descriptionXP * Utils.numeralConverter(v.system.attackGrade));
          }

        //extraordinary save
        if ((v.system.attackType == "extraSave" && v.system.saveUpgrade == "area") || v.system.attackType == "extraDamage")
        {
          if (v.system.area.shape == "gaze")
          {
            tempXP += 3;
            continue;
          }

          let multipler = 1
          if(v.system.area.shape == "aura" || v.system.area.shape == "blast")
            multipler = 3;
          else if (v.system.area.shape == "cone")
            multipler = 2;
          
          tempXP += multipler * v.system.area.value;
        }

        if (v.system.attackType == "extraSave" && v.system.saveUpgrade == "linked")
        {
          tempXP += 2;
        }
      }

      return tempXP;
    }

    _gearXPCalculator(data)
    {
      let tempXP = 0;

      let weapons = data.items.filter(function(item) {return item.type == "weapon"});
      let armour = data.items.filter(function(item) {return item.type == "armour"});
      let general = data.items.filter(function(item) {return item.type == "general"});

      for (let [k, v] of Object.entries(weapons))
        tempXP += v.system.complexity.number;
      for (let [k, v] of Object.entries(armour))
        tempXP += v.system.complexity.number;
      for (let [k, v] of Object.entries(general))
        tempXP += v.system.complexity.number;
      

      return (Math.ceil(tempXP/10));
    }

    _calculateNPCHealth(data)
    {
      let act = data.system;
      let vitality = data.system.vitality;

      vitality.max = game.settings.get('fantasycraft', 'fragileMonsters') ? Math.floor(act.threat * Utils.numeralConverter(act.traits.health.grade) * 2.5) : act.threat * Utils.numeralConverter(act.traits.health.grade) * 5;
    }

    _getToughValue(data)
    {
      let act = data.system;
      const tough = this.items.find(function(item) {return item.name == "Tough"})

      if (tough == null)
        return;

        //if the NPC has tough
      act.toughMax =  Utils.numeralConverter(tough.system.grades.value);
    }

    _linkAttacks(data)
    {
      let attacks = data.items.filter(item => item.type == "attack");

      for (let [k, attack] of Object.entries(attacks))
      {
        if (attack.system.attackType == "extraSave" && attack.system.supernaturalAttack.linkedAttack != "")
        {
          attack.system.supernaturalAttack.value = true;
        }
      }
    }

    /////PC functions//////

    //Set Career level to the sum of all class levels.
    _careerLevel(actorData)
    {
      let careerLevel = actorData.system.careerLevel.value;
      let castingLevel = actorData.system.castingLevel;
      careerLevel = 0;
      castingLevel = 0;
      let moreThanLuck = actorData.items.find(item => item.name == game.i18n.localize("fantasycraft.moreThanLuck"))

      let classList = actorData.items.filter(item => item.type == "class");

      for (let [a, item] of Object.entries(classList))
      {
        careerLevel += item.system.levels;

        if (item.system.castingLevel)
        castingLevel += item.system.levels;
      }

      actorData.system.startingActionDice = 3 + Math.floor((careerLevel-1)/5);
      if (moreThanLuck != null)
        actorData.system.startingActionDice += 1;
      actorData.system.actionDiceSize = 4 + (Math.floor((careerLevel-1)/5)*2);
      actorData.system.careerLevel.value = careerLevel;
      actorData.system.castingLevel = castingLevel;
    }

    _prepareInitiative(actorData)
    {
      // Determine Initiative Modifier
      const init = actorData.system.initiative;
      init.ability.name = (this.system.mastersArt) ? actorData.system.defense.ability.name : "dexterity";
      init.ability.value = actorData.system.abilityScores[init.ability.name].mod;
      let classBonus = 0;

      for ( let item of this.items) 
      {        
        if(item.type == "class")
          classBonus += CONFIG.fantasycraft.classInitiative[item.system.initiative][item.system.levels-1];
          
          if (this.getFlag("fantasycraft", "Special Construction (Clockwork)"))
            init.featBonus = 2;
      }
      init.class = classBonus;
      
      init.value = init.ability.value + init.class + init.featBonus;
    }

    _prepareDefense(actorData)
    {
        //Total = class, ability, size, guard, misc, penalty
        const def = actorData.system.defense;
        let misc = def.misc;
        let guard = 0, penalty = 0, size = 0, magic = 0;
        def.ability.name = (actorData.system.martialArts) ? def.ability.name : "dexterity";
        def.ability.value = actorData.system.abilityScores[def.ability.name].mod;

        def.class = 0;
        for ( let item of this.items) 
        {
          // get class defense
          if (item.type == "class")
            def.class += CONFIG.fantasycraft.classDefense[item.system.defense][item.system.levels-1];
          // if armour is equipped get the defense penalty
          if (item.type == "armour")
            penalty = this._getArmourPenalty(item);
          //get guard bonus
          if(item.type == "weapon")
            guard = this._getGuardBonus(item, guard);
        }

        //if get any size modifier
        if (actorData.system.size != "medium")
        {
          size = CONFIG.fantasycraft.sizeNumber[actorData.system.size];
          if (size != 0)
          {
            size = (size < 0) ? size*-1 : size;
            size = Math.pow(2, size-1);
            if (CONFIG.fantasycraft.sizeNumber[actorData.system.size] > 0)
              size = size * -1;
          }
        }

        actorData.system.defense.size = size;
        actorData.system.defense.guard = guard;
        magic = this._calculateCharmBonus("defenseBonus");
        
        actorData.system.flatFootedDefense = (def.ability.value > 0) ? 10 + def.class + size - penalty : 10 + def.ability.value + def.class + size - penalty ;
        def.value = 10 + def.ability.value + def.class + size + guard + misc + magic - penalty;
    }

    _getArmourPenalty(item)
    {
      let penalty = 0;

      if(item.system.equipped)
      {
        penalty = item.system.defensePenalty;

        //reduce penalty for armour basics or the armour being fitted
        penalty = this.items.filter(item => item.type == "feat" && item.name == game.i18n.localize("fantasycraft.armourBasics")).length > 0 ? penalty - 1 : penalty;
        if (item.system.upgrades.fitted)
          penalty --;

        if (penalty < 0)
          penalty = 0;
      }

      return penalty;
    }

    _getGuardBonus(item, guard)
    {
      if (item.system.readied && item.system.weaponProperties.guard > 0 && item.system.weaponProperties.guard > guard)
      guard = item.system.weaponProperties.guard;


      return guard
    }

    _calculateDamageReduction(actorData)
    {
        let dr = 0;
        const armour = this.items.find(item => (item.type == "armour" && item.system.equipped == true))
        if (armour != null)
        {
            dr += armour.system.damageReduction;
        }

        console.log(`DR is now ${dr}`);

        let magic = this._calculateEssenceBonus("damageReduction");
        dr += magic;
        this.system.dr = dr;
    }

    _prepareAttack(actorData)
    {
        //total = BAB + ability + misc + magic
        const attackU = actorData.system.attackTypes.unarmed;
        const attackM = actorData.system.attackTypes.melee;
        const attackR = actorData.system.attackTypes.ranged;
        const act = this;

        attackU.attackType = "unarmed";
        attackM.attackType = "melee";
        attackR.attackType = "ranged";
        const attackArray = [attackU, attackM, attackR];

        let magic = 0;

        let itemList = actorData.items.filter(item => item.type != "");

        for (let [d, item] of Object.entries(itemList))
        {
          if (item.type == "class")
            actorData.system.baseAttack += CONFIG.fantasycraft.classBAB[item.system.baseAttack][item.system.levels-1];
        }


        attackArray.forEach(function(item) 
        {
          item.ability.value = actorData.system.abilityScores[item.ability.name].mod;
          magic = act._calculateCharmBonus("accuracyBonus", item.attackType);
          item.value = item.ability.value + actorData.system.baseAttack + item.misc + magic;
          
        });

        if (this.items.find(item => item.name == game.i18n.localize("fantasycraft.martialArts")))
        {
          this.system.martialArts = true;
          
          if (this.items.find(item => item.name == game.i18n.localize("fantasycraft.mastersArt"))){
            this.update({"system.mastersArt": true});
          }
        }
    }

    _prepareSaves(actorData)
    {
        //total = class + ability + feat + magic - (defense penalty for reflex) 
        const fort = actorData.system.saves.fortitude;
        const ref = actorData.system.saves.reflex;
        const will = actorData.system.saves.will;
        let magic = 0;

        fort.class = 0;
        ref.class = 0;
        will.class = 0;

        fort.ability.value = actorData.system.abilityScores[fort.ability.name].mod;
        ref.ability.value = actorData.system.abilityScores[ref.ability.name].mod;
        will.ability.value = actorData.system.abilityScores[will.ability.name].mod;

        let itemList = actorData.items.filter(item => item.type != "");

        for (let [d, item] of Object.entries(itemList))
        {
          if (item.type == "class")
          {
            fort.class += CONFIG.fantasycraft.classSaves[item.system.fortitude][item.system.levels-1];
            ref.class += CONFIG.fantasycraft.classSaves[item.system.reflex][item.system.levels-1];
            will.class += CONFIG.fantasycraft.classSaves[item.system.will][item.system.levels-1];
          }
        }

        
        magic = this._calculateEssenceBonus("saveBonus", "fortitude");
        fort.value = fort.class + fort.ability.value + magic + fort.misc;
        magic = this._calculateEssenceBonus("saveBonus", "reflex");
        ref.value = ref.class + ref.ability.value + magic + ref.misc;
        magic = this._calculateEssenceBonus("saveBonus", "will");
        will.value = will.class + will.ability.value + magic + will.misc;
    }

    _calculateWounds(actorData)
    {
      const wounds = actorData.system.wounds;
      const con = actorData.system.abilityScores.constitution.value;
      let size = 0;
      
      if (actorData.system.size == "medium")
        wounds.max = con;
      else if (CONFIG.fantasycraft.sizeNumber[actorData.system.size] > 0)
      {
        if (CONFIG.fantasycraft.sizeNumber[actorData.system.size] == 1)
          wounds.max = Math.ceil(con * 1.5);
        else
        wounds.max = con * CONFIG.fantasycraft.sizeNumber[actorData.system.size];
      }
      else
      {
        if (CONFIG.fantasycraft.sizeNumber[actorData.system.size] == -1)
        wounds.max = Math.ceil(con * 0.666);
        else if (CONFIG.fantasycraft.sizeNumber[actorData.system.size] == -5)
        wounds.max = Math.ceil(con/8);
        else
        wounds.max = Math.ceil(con/Math.abs(CONFIG.fantasycraft.sizeNumber[actorData.system.size]));
        //Nuisance (N)	 1/8 Constitution score (rounded up);   Fine (F)	 1/4 Constitution score (rounded up)
        //Diminutive (D)	 1/3 Constitution score (rounded up); Tiny (T)	 1/2 Constitution score (rounded up)
        //Small (S)	 2/3 Constitution score (rounded up);       Medium (M)	 Equal to Constitution score
        //Large (L)	 1.5 × Constitution score (rounded up);     Huge (H)	 2 × Constitution score
        //Gargantuan (G)	 3 × Constitution score;              Colossal (C)	 4 × Constitution score
        //Enormous (E)	 5 × Constitution score;                Vast (V)	 6 × Constitution score 
      }

      //if character flag for great fortitude is set, +4 wounds
      if (this.getFlag("fantasycraft", "Great Fortitude"))
        wounds.max += 4;
      if (this.getFlag("fantasycraft", "Rock Solid"))
        wounds.max += actorData.system.careerLevel.value;

      wounds.max += this._calculateEssenceBonus("wounds");
        
      if (wounds.value > wounds.max)
        wounds.value = wounds.max;

    }

    //Autocalculation for skills Ability Score + Ranks + misc
    _prepareskills(actorData)
    {
      const characterData = actorData.system;
      let totalRanks = 0;

      
      //Get total for each individual skill
      for (let [id, skill] of Object.entries(characterData.skills)) 
      {
        // Compute modifier
        skill.magic = this._calculateCharmBonus("skillRanks", id)
        skill.abModifier = characterData.abilityScores[skill.ability].mod;
        skill.total = skill.abModifier + skill.ranks + skill.misc + skill.magic;

        totalRanks += skill.ranks;
      }

      //Find Max Ranks and total ranks spent
      characterData.maxSkillRanks = characterData.careerLevel.value + 3.
      characterData.totalSkillRanks = totalRanks;

      let armour = this.items.filter(item => item.type == "armour" && item.system.equipped)[0]

      if (!armour)
      {
        characterData.acp = 0;
        return;
      }
      //prepare ACP armour penalty
      characterData.acp = armour.system.armourCheckPenalty;

      characterData.acp = this.items.filter(item => item.type == "feat" && item.name == game.i18n.localize("fantasycraft.armourBasics")).length > 0 ? characterData.acp - 1 : characterData.acp;

      let magicItems = this.items.filter (item => item.system?.isMagic)
      if (magicItems.length > 0)
      {
        for (let magicItem of magicItems)
        for (let i = 1; i <= magicItem.system.essences.essenceNumber; i++)
        {
          let essence = magicItem.system.essences[Object.keys(magicItem.system.essences)[i]];
          if (essence.ability == "acp")
          {
            characterData.acp = (!essence.greater) ? characterData.acp - 2 : 0;
          }
        }
      }

      if (characterData.acp < 0)
        characterData.acp = 0;
    }

    _calculateEssenceBonus(type, target = "")
    {
      let magicItems = Utils.getMagicItems(this)
      let totalBonus = 0;
      let greaterBonus = 0;
      let lesserBonus = 0;

      if (type == "wounds")
      {
        greaterBonus = 10;
        lesserBonus = 4;
      } 
      else if (type == "vitality")
      {
        greaterBonus = 20;
        lesserBonus = 10;
      }
      else if (type == "saveBonus")
      {
        greaterBonus = 3;
        lesserBonus = 1;
      }
      else if (type == "damageReduction")
      {
          greaterBonus = 2;   // Only available in Greater form
      }

      for (let item of magicItems)
      {
        let counter = item.system.essences.essenceNumber;
        for (let essence of Object.entries(item.system.essences))
        {
          if (counter < 0) break;
          if (essence[1]?.ability == type)
          {
            if (essence[1].greater && totalBonus < greaterBonus && (target == "" || target == essence[1].target))
              totalBonus = greaterBonus;
            if (!essence[1].greater && totalBonus < lesserBonus && (target == "" || target == essence[1].target))
              totalBonus = lesserBonus
          }
          counter --;
        }
      }

      return totalBonus;
    }

    _calculateCharmBonus(type, target="")
    {
      let magicItems = Utils.getMagicItems(this)
      let greaterBonus = 0;
      let lesserBonus = 0;
      let totalBonus = 0;



      for (let item of magicItems)
      {
        greaterBonus = CONFIG.fantasycraft.charmBonuses.Greater[item.system.itemLevel];
        lesserBonus = CONFIG.fantasycraft.charmBonuses.Lesser[item.system.itemLevel];

        let counter = item.system.charms.charmNumber;
        for (let charm of Object.entries(item.system.charms))
        {
          if (counter < 0) break;
          if (charm[1]?.ability == type)
          {
            if (charm[1].greater && totalBonus < greaterBonus && (target == "" || target == charm[1].target))
              totalBonus = greaterBonus;
            if (!charm[1].greater && totalBonus < lesserBonus && (target == "" || target == charm[1].target))
              totalBonus = lesserBonus
          }
          counter --;
        }
      }

      for (let item of magicItems)
      {
          greaterBonus = CONFIG.fantasycraft.charmBonuses.Greater[item.system.itemLevel];
          lesserBonus = CONFIG.fantasycraft.charmBonuses.Lesser[item.system.itemLevel];

          if (item.system.charms.charm1?.ability == type) 
          {
            if (item.system.charms.charm1.greater && totalBonus < greaterBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = greaterBonus;
            if (!item.system.charms.charm1.greater && totalBonus < lesserBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = lesserBonus
          }
          if (item.system.charms.charm2?.ability == type) 
          {
            if (item.system.charms.charm2.greater && totalBonus < greaterBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = greaterBonus;
            if (!item.system.charms.charm2.greater && totalBonus < lesserBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = lesserBonus
          }
          if (item.system.charms.charm3?.ability == type) 
          {
            if (item.system.charms.charm3.greater && totalBonus < greaterBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = greaterBonus;
            if (!item.system.charms.charm3.greater && totalBonus < lesserBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = lesserBonus
          }
          if (item.system.charms.charm4?.ability == type) 
          {
            if (item.system.charms.charm4.greater && totalBonus < greaterBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = greaterBonus;
            if (!item.system.charms.charm4.greater && totalBonus < lesserBonus &&( target == "" || target == item.system.charms.charm1.target))
              totalBonus = lesserBonus
          }
      }

      return totalBonus;
    }


    _prepareInterestsAndFocuses(traits) 
    {
      const map = 
      {
        "focusRide": CONFIG.fantasycraft.focusRide,
        "focusCrafting": CONFIG.fantasycraft.focusCrafting,
      };

      for ( let [t, choices] of Object.entries(map) ) 
      {
        const trait = traits[t];
        if ( !trait ) continue;
        let values = [];
        if ( trait.value ) 
        {
          values = trait.value instanceof Array ? trait.value : [trait.value];
        }
        trait.selected = values.reduce((obj, t) => 
        {
          obj[t] = choices[t];
          return obj;
        }, 
        {});

        // Add custom entry
        if ( trait.custom ) 
        {
          trait.custom.split(";").forEach((c, i) => trait.selected[`custom${i+1}`] = c.trim());
        }

        trait.cssClass = !isEmpty(trait.selected) ? "" : "inactive";
      }
    }

    _prepareKnowledge(actorData)
    {
      let char = actorData.system;
      char.knowledge.studies = char.interests.studies.custom.split(";").length;

      char.knowledge.value = char.knowledge.studies + char.abilityScores.intelligence.mod + char.knowledge.misc;
    }

    _prepareCasting(actorData)
    {
      const char = actorData.system;
      let castingFeats = [];

      //Go through all feats and add any spellcasting feats to the castingFeats array
      for ( let [l, f] of Object.entries(this.itemTypes.feat || {}) ) 
      {
        if (f.system.featType == "fantasycraft.spellcasting")
          castingFeats.push(f);
      }
      //Casting feats equals the length of the array we just created
      char.castingFeats = castingFeats.length;

      //Characters spellsave equals number of spellcasting feats plus Charisa modifier.
      char.spellSave = 10 + char.abilityScores.charisma.mod + char.castingFeats;

      if (char.isArcane)
      {
        const casting = char.arcane.spellcasting;
        let classSpellPoints = 0;
        let magicBonus = this._calculateCharmBonus("spellPoints");

        //spellcasting roll
        casting.value = char.abilityScores.intelligence.mod + casting.ranks + casting.misc;

        //Spells known
        char.arcane.spellsKnown.value = char.abilityScores.wisdom.value + casting.ranks + char.arcane.spellsKnown.misc;
        let classes = this.items.filter(item => item.type == "class");

        //spellpoints
        for (let [d, item] of Object.entries(classes))
        {
          if (item.type == "class")
          {
            classSpellPoints += CONFIG.fantasycraft.classSpellPoints[item.system.spellPoints] * item.system.levels;
          }
        }

        char.arcane.spellPointMax = (this.getFlag("fantasycraft", "Spell Power")) ? classSpellPoints + char.startingActionDice + magicBonus : classSpellPoints + magicBonus

      }
    }

    _prepareCastingFromItems(actorData)
    {
        const char = actorData.system;

        // Get information from every item on the character that has a castingLevel
        let items = actorData.items.filter(function(item) {return item.system.castingLevel})
        // Drop weapons and armor that are not equipped
        items = items.filter(item => ((item.type != "weapon" && item.type != "armour") || item.system.readied || item.system.equipped) )
        if(items.length > 0)
        {
            // Only set the casting level if we don't already have a class that gives us casting levels
            if(items.filter(function(item) {return item.system.type === 'class'}).length === 0)
            {
                char.castingLevel = 1;
            }
        }
        else
        {
            char.castingLevel = 0;
        }
    }

    _prepareLifeStyle()
    {
      let style = this.system.lifeStyle;

      style.value = style.panache + style.prudence;

      style.appearance = Math.ceil((style.panache -1)/3)
      this.system.appearance = style.appearance + style.appearanceMisc;
      style.income = style.panache * 10;

      style.savedEarned = (style.prudence *5) +15;
    }

    _renownInformation()
    {
      let rep = this.system.reputationAndRenown;

      rep.renownTotal = rep.heroicRenown + rep.militaryRenown + rep.nobleRenown + rep.customRenown;

      this._getTitle();
    }
    
    _getTitle()
    {
      let rep = this.system.reputationAndRenown;

      if (rep.heroicRenown > 10) rep.heroicRenown = 10;
      if (rep.heroicRenown < 0) rep.heroicRenown = 0;
      if (rep.militaryRenown > 10) rep.militaryRenown = 10;
      if (rep.militaryRenown < 0) rep.militaryRenown = 0;
      if (rep.nobleRenown > 10) rep.nobleRenown = 10;
      if (rep.nobleRenown < 0) rep.nobleRenown = 0;

      rep.heroicTitle = CONFIG.fantasycraft.heroicTitles[rep.heroicRenown];
      rep.militaryTitle = CONFIG.fantasycraft.militaryTitles[rep.militaryRenown];
      rep.nobleTitle = CONFIG.fantasycraft.nobleTitles[rep.nobleRenown];
    }

    //ensure that threat level is between 1 and 20
    _npcThreatLevel(actorData)
    {
      if (actorData.threat > 20) actorData.threat = 20;
      if (actorData.threat < 1) actorData.threat = 1;
    }

    _prepareNPCTraits(actorData)
    {
      this.system.martialArts = (this.items.find(item => item.name == game.i18n.localize("fantasycraft.martialArts"))) ? true : false;
      this.system.mastersArt = (this.items.find(item => item.name == game.i18n.localize("fantasycraft.mastersArt"))) ? true : false;
      const traits = actorData.traits;
      const level = actorData.threat-1; //set level to the npcs threat level -1 to get the index

      // Attack
      traits.attack.value = CONFIG.fantasycraft.npcAttack[traits.attack.grade][level];
      actorData.spellcasting.value = (actorData.spellcasting.grade == "") ? 0 : CONFIG.fantasycraft.npcSignatureSkills[actorData.spellcasting.grade][level];

      // Initiative and Defense
      traits.defense.value = CONFIG.fantasycraft.npcInitDef[traits.defense.grade][level];
      traits.initiative.value = CONFIG.fantasycraft.npcInitDef[traits.initiative.grade][level];
      
      // Resilience, Health, and Comp
      traits.resilience.value = CONFIG.fantasycraft.npcResCompHealth[traits.resilience.grade][level];
      traits.health.value = CONFIG.fantasycraft.npcResCompHealth[traits.health.grade][level];
      traits.competence.value = (traits.competence.grade == "-") ? 0 : CONFIG.fantasycraft.npcResCompHealth[traits.competence.grade][level];

      for (let [k,v] of Object.entries(actorData.abilityScores))
        v.mod = this._getAttributeMod(v);

      this._calculateTotals(actorData);
    }

    _getAttributeMod(attribute)
    {
      return Math.floor((attribute.value-10)/2)
    }

    _calculateTotals(actorData)
    {
      const traits = actorData.traits;
      const sizeNumber = CONFIG.fantasycraft.sizeNumber[actorData.size];
      let initMod = (actorData.mastersArt) ? actorData.defense.defenseAttribute : "dexterity"

      this._calculateDefense(actorData, traits, sizeNumber);

      actorData.defense.dexPositive = (actorData.abilityScores.dexterity.mod >= 0) ? true : false;
      actorData.defense.dexNormalized = (actorData.defense.dexPositive) ? actorData.abilityScores.dexterity.mod : actorData.abilityScores.dexterity.mod * -1;

      traits.initiative.total = traits.initiative.value + actorData.abilityScores[initMod].mod;
      traits.attack.meleeTotal = traits.attack.value + actorData.abilityScores.strength.mod;
      traits.attack.rangedTotal = traits.attack.value + actorData.abilityScores.dexterity.mod;this
      actorData.saves.fortitude.total = traits.resilience.value + actorData.abilityScores.constitution.mod;
      actorData.saves.reflex.total = traits.resilience.value + actorData.abilityScores.dexterity.mod;
      actorData.saves.will.total = traits.resilience.value + actorData.abilityScores.wisdom.mod;
      traits.health.total = traits.health.value + actorData.abilityScores.constitution.mod + (sizeNumber*2);

      actorData.spellcasting.total = actorData.spellcasting.value + actorData.abilityScores.intelligence.mod;
    }

    _calculateDefense(actorData, traits, sizeNumber)
    {
      let sizeDefense = sizeNumber;
      let penalty = 0;
      let guard = 0;
      let defenseMod = (actorData.martialArts) ? this.system.defense.defenseAttribute : "dexterity";

      if (sizeNumber != 0)
      {
        sizeDefense = (sizeDefense < 0) ? sizeDefense*-1 : sizeDefense;
        sizeDefense = Math.pow(2, sizeDefense-1);
        if (sizeNumber > 0)
          sizeDefense = sizeDefense * -1;
      }

      for ( let item of this.items) 
      {
        // if armour is equipped get the defense penalty
        if (item.type == "armour")
          penalty = this._getArmourPenalty(item);
        //get guard bonus
        if (item.type == "weapon")
          guard = this._getGuardBonus(item, guard)
      }
      
      actorData.defense.guard = guard;
      actorData.defense.penalty = penalty;
      actorData.defense.attributePositive = (actorData.abilityScores[defenseMod].mod >= 0) ? true : false;
      actorData.defense.attributeNormalized = (actorData.defense.attributePositive) ? actorData.abilityScores[defenseMod].mod : actorData.abilityScores[defenseMod].mod * -1;

      traits.defense.total = 10 + traits.defense.value + actorData.abilityScores[defenseMod].mod + sizeDefense + actorData.defense.guard - actorData.defense.penalty;

    }

    _carryingCapacity(actorData)
    {
      let str = actorData.abilityScores.strength.value;
      let improvedStability = this.items.find(item => item.name == game.i18n.localize("fantasycraft.improvedStability"));
      
      if (CONFIG.fantasycraft.sizeNumber[actorData.size] > 0)
        str += CONFIG.fantasycraft.sizeNumber[actorData.size] * 5;
      if (CONFIG.fantasycraft.sizeNumber[actorData.size] < 0)
        str -= CONFIG.fantasycraft.sizeNumber[actorData.size] * 2;

      if (str < 1) str = 1;
      
      let backpack = this.items.find(item => item.name == game.i18n.localize("fantasycraft.backpack"));
      if (backpack != null)
        str += 2;

      if (str <= 45)
      {
        actorData.carryingCapacity.light = CONFIG.fantasycraft.carryingCapacity.light[str-1];
        actorData.carryingCapacity.heavy = CONFIG.fantasycraft.carryingCapacity.heavy[str-1];
        actorData.carryingCapacity.overloaded = CONFIG.fantasycraft.carryingCapacity.heavy[str-1] + 1;
      }
      if (str > 45)
      {
        actorData.carryingCapacity.light = "Dost";
        actorData.carryingCapacity.heavy = "thou";
        actorData.carryingCapacity.overloaded = "even lift?";
      }
    }

    _equipmentWeight()
    {
      let totalWeight = 0

      for ( let item of this.items) 
      {
        if (item.type == "general" || item.type == "weapon" || item.type == "armour")
        {
          if (item.system.type != "vehicle")
          {
            totalWeight += (item.type == "armour") ? parseFloat(item.system.weight) : parseFloat(item.system.totalWeight);
          }
        }
      }

      totalWeight += Math.floor(this.system.coin.inHand/25);

      totalWeight = Math.round(totalWeight * 100) / 100
      this.system.totalWeight = totalWeight
    }

    _calculateMovementSpeed()
    {
      let movement = this.system.movement;
      let ancestry = this.items.filter(item => item.type == "ancestry");
      let features = this.items.filter(item => item.type == "feat" || item.type == "feature");
      let armourCheck = this.items.filter(function(item) {return (item.type == "armour" && item.system.equipped)});

      if (ancestry.length == 0 || (ancestry.length == 1 && ancestry[0].name == game.i18n.localize("fantasycraft.human"))) return;

      ancestry = (ancestry[0].name == game.i18n.localize("fantasycraft.human")) ? ancestry[1] : ancestry[0]

      movement.ground.value = ancestry.system.speed;
      if (armourCheck[0]?.system.speedPenalty > 0)
      {
        let speedPenalty = 0
        speedPenalty = (armourCheck[0]?.system.upgrades.lightweight) ? armourCheck[0]?.system.speedPenalty - 5 : armourCheck[0]?.system.speedPenalty;
        speedPenalty = this.items.filter(item => item.type == "feat" && item.name == game.i18n.localize("fantasycraft.armourBasics")).length > 0 ? speedPenalty - 5 : speedPenalty;
        movement.ground.value = (speedPenalty > 0) ? movement.ground.value - speedPenalty : movement.ground.value;
      }

      if (ancestry.system.speed2.type != "none")
        movement[ancestry.system.speed2.type].value = ancestry.system.speed2.value;

      if (features.filter(item => item.name == game.i18n.localize("fantasycraft.mobilitySupremacy")).length > 0)
        movement.ground.value += 10;
      if (features.filter(item => item.name == game.i18n.localize("fantasycraft.spiderNoble")).length > 0)
        movement.ground.value += 10;
      if (features.filter(item => item.name == game.i18n.localize("fantasycraft.fast")).length > 0)
        movement.ground.value += 10;
      if (features.filter(item => item.name == game.i18n.localize("fantasycraft.easternHorde")).length > 0)
      movement.ground.value += 5;
      if (features.filter(item => item.name == game.i18n.localize("fantasycraft.chargingBasics")).length > 0)
        movement.ground.value += 5;

      let paths = this.items.filter(function(item) {return item.type == "path"})
      for (let [key, path] of Object.entries(paths))
      {
        //get number of steps of the path
        let steps = path.system.pathStep;

        //loop through the steps to check for resistances
        movement.ground.value += this.pathStepSpeedCheck(path, steps);
      }


      let multipler = (armourCheck[0]?.system.armourCoverage == "full") ? 3 : 4;

      movement.ground.run = movement.ground.value * multipler;
      movement.ground.travel = Math.ceil(movement.ground.value/10);

      for (let i = 1; i < 3; i++)
      {
        let moveType = movement[Object.keys(movement)[i]];
        if (moveType.value != 0)
        {
          moveType.run = moveType.value * multipler;
          moveType.travel = moveType.value/10;
        }
      }
    }

    _compileResistances(actor)
    {
      actor.system.resistances = {};

      //get resistances from feats
      let feats = actor.items.filter(function(item) {return item.type == "feat"})
      for (let [key, feat] of Object.entries(feats))
      {
        let res = feat.system.resistances;

        if (feat.system.grantsResistance)
        {
          if (res.value1 > 0)
            this.addOrImproveResistance(actor.system.resistances, {name: res.resistance1, value: res.value1});
          if (res.value2 > 0)
            this.addOrImproveResistance(actor.system.resistances, {name: res.resistance2, value: res.value2});
        }

      }

      //get resistances from path steps
      let paths = actor.items.filter(function(item) {return item.type == "path"})
      for (let [key, path] of Object.entries(paths))
      {
        //get number of steps of the path
        let steps = path.system.pathStep;

        //loop through the steps to check for resistances
        this.pathStepResistanceCheck(path, steps, actor.system.resistances);
      }

      //get resistances from items(armour and magic items)
      let items = actor.items.filter(function(item) {return (item.type == "armour" && item.system.equipped) || item.type == "general" || (item.type == "weapon" && item.system.readied) })
      for (let [key, item] of Object.entries(items))
      {
        if (item.type == "armour")
        {
          for (let [key, res] of Object.entries(item.system.resistances))
          {
            this.addOrImproveResistance(actor.system.resistances, res);
          }
        }

        if (item.system.isMagic)
        {
          let res;
          
          for (let essence of Object.entries(item.system.essences))
          {
            if (essence[1]?.ability == "damageResistance")
            {
              res = (essence[1].greater) ? {name: essence[1].target, value: '10'} : {name: essence[1].target, value: '4'}
              this.addOrImproveResistance(actor.system.resistances, res)
            }
          }
        }
      }
    }
      
    _getTrickUses(actor)
    {
      let tricks = actor.items.filter(item => item.type == "trick");

      for (let trick of Object.entries(tricks))
      {
        trick = trick[1];
        if (trick.system.uses.timeFrame != "unlimited")
        {
          if (trick.system.uses.counter == "feat")
          {
            let featNumber = actor.items.filter(item => (item.type == "feat" && game.i18n.localize(item.system.featType) == game.i18n.localize(CONFIG.fantasycraft.featType[trick.system.uses.featType]))).length;
            trick.system.uses.maxUses = featNumber;
          }
          else if (trick.system.uses.counter == "actionDie")
          {
            trick.system.uses.maxUses = actor.system.startingActionDice;
          }

          if (trick.system.uses.usesRemaining == null || trick.system.uses.usesRemaining == undefined)
            trick.system.uses.usesRemaining = trick.system.uses.maxUses;
        }
      }
    }

    pathImmunityCheck(path, step, damageType)
    {
      for (let i = 1; i <= step; i++)
      {
        let pathStep = "step" + i;

        if ((path.system[pathStep].effect1 == "damageImmunity" &&  path.system[pathStep].value1 == damageType) 
          || (path.system[pathStep].effect2 == "damageImmunity" && path.system[pathStep].value2 == damageType))          
          return true;
      }

      return false;
    }

    pathStepSpeedCheck(path, step)
    {
      let movementBonus = 0;
      for (let i = 1; i <= step; i++)
      {
        let pathStep = "step" + i;

        if (path.system[pathStep].effect1 == "speedBonus")
        {
          movementBonus += path.system[pathStep].value1;
        }
        if (path.system[pathStep].effect2 == "speedBonus")
        {
          movementBonus += path.system[pathStep].value2;
        }
      }

      return movementBonus;
    }

    pathStepResistanceCheck(path, step, resistances)
    {
      //loop through the steps to check for resistances
      for (let i = 1; i <= step; i++)
      {
        let pathStep = "step" + i;

        if (path.system[pathStep].effect1 == "resistances")
        {
          let newRes = {value: path.system[pathStep].value1, name: path.system[pathStep].damageType1}
          if (path.system[pathStep].effect1Scaling)
            newRes.value = newRes.value * step;
          this.addOrImproveResistance(resistances, newRes);
        }
        if (path.system[pathStep].effect2 == "resistances")
        {
          let newRes = {value: path.system[pathStep].value2, name: path.system[pathStep].damageType2}
          if (path.system[pathStep].effect2Scaling)
            newRes.value = newRes.value * step;
          this.addOrImproveResistance(resistances, newRes);        
        }
      }
    }

    addOrImproveResistance(actorResistances, newRes)
    {
      if (newRes.value > 0 && this.system?.resistances[newRes.name])
        actorResistances[newRes.name] += parseInt(newRes.value);
      else if (newRes.value > 0)
        actorResistances[newRes.name] = parseInt(newRes.value);
    }

    async removeItemFromArray(type, event)
    {
      let target = [...this.system[type]];
      let arrayIndex = -1;
      let updateString = "system." + type;

      //find the item ID in the chosen array
      for (let [k,v] of Object.entries(target))
      {
        if (v.id == Object.values(event.dataset)[0])
          arrayIndex = k;
      }

      //delete that object from the array
      if (arrayIndex < 0)
        console.log("Error, object not in the array");
      else
        target.splice(arrayIndex, 1);

        this.update({[updateString]: target});
    }

    reduceRemainingAbilityUses(ability)
    {
      let newValue = ability.system.uses.usesRemaining - 1
      let updateString = "system.uses.usesRemaining"
      ability.update({[updateString]: newValue});
    }

    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    ///////////////// DICE ROLLS //////////////////
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    rollSavingThrow(saveName, iaction = null)
    {
      saveName = this.type == "character" ? saveName.toLowerCase() : saveName;
      let save = this.system.saves[saveName];
      let saveInfo = [];

      if (this.type == "character")
      {
        saveInfo = [
          save.class,
          save.ability.value,
        ]
        if (save.misc != 0)
        {
          saveInfo.push(save.misc);
        }
      }
      else if (this.type == "npc")
      {
        saveInfo = [
          this.system.traits.resilience.value,
          save.value
        ]
      }
    
      let rollFormula = ["1d20"];
      for (let bonus of saveInfo)
      {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
      }    
      const saveRoll = new Roll(rollFormula)
      saveRoll.evaluate({async: false})

      let trick;
      if (iaction == "parry")
        trick = this.items.filter(item => item.name == game.i18n.localize("fantasycraft.parry"));
      if (iaction == "shield block")
        trick = this.items.filter(item => item.name == game.i18n.localize("fantasycraft.shieldBlock"));
      if (iaction == "arrow cutting")
        trick = this.items.filter(item => item.name == game.i18n.localize("fantasycraft.arrowCutting"));

      if (trick != null && trick[0].system.uses.usesRemaining <= 0)
      {
        ui.notifications.error(game.i18n.localize('fantasycraft.Dialog.noUsesRemainingForChosenTrick'))
        return;
      }
      if (trick != null)
        this.reduceRemainingAbilityUses(trick[0]);

      Chat.onSavingThrow(saveRoll, this, saveName);

      return saveRoll.total;
    }

    rollSkillCheck(skillName)
    {
      const actor = this.system;
      let skill = this.type == "character" ? actor.skills[skillName] : actor.signatureSkills[skillName];

      if (skillName == "spellcasting") 
        skill = this.type == "character" ? actor.arcane[skillName] : actor[skillName];

      const flawless = this.items.filter(item => item.type == "feature" && item.system.flawless.isFlawless && (item.system.flawless.skill1 == skillName || item.system.flawless.skill2 == skillName ));
      let flawlessResult = 0;
      if (flawless.length > 0)
      {
        if (this.type == "character")
        {
          for (let feature of flawless)
          {
            let classes = this.items.filter(item => item.name.toLowerCase() == feature.system.flawless.classSource);
            for (let cls of classes)
            {
              flawlessResult += cls.system.levels;
            }
          }
          flawlessResult = flawlessResult + 20;
        }
        else 
          flawlessResult = this.system.threat + 20;
      }

      let skillModifiers = []

      let magicItems = Utils.getMagicItems(this);
      let magicBonus = 0;

      //ranks, ability mod, misc, threat range
      if (this.type == "character")
      {
        if (!skill.ranks) skill.ranks = 0;
        skillModifiers =
        [
          actor.abilityScores[skill.ability].mod,
          skill.ranks,
          skill.misc
        ]
      }
      else if (this.type == "npc")
      {
        if (skillName == "spellcasting")
          skillModifiers = 
          [
            actor.abilityScores.intelligence.mod,
            actor[skillName].value
          ]
        else
          skillModifiers = 
          [
            actor.signatureSkills[skillName].attributeBonus,
            actor.signatureSkills[skillName].skillBonus
          ]
      }

      if (magicItems.length > 0)
      {
        for (let item of magicItems)
        {
          let charm = Utils.getSpecificCharm(item, "skillRanks")
          if (charm != null && charm[1].target == skillName)
            magicBonus = (Utils.getCharmBonus(item, charm[1].greater) > magicBonus) ? Utils.getCharmBonus(item, charm[1].greater) : magicBonus;
        }
      }

      if (skill.ability == "strength" || skill.ability == "dexterity" || skill.ability == "constitution")
        skillModifiers.push(-actor.acp);

      if (skill.ability == "charisma")
        skillModifiers.push(actor.appearance);

      if (magicBonus > 0)
        skillModifiers.push(magicBonus);

      let rollFormula = ["1d20"];
      for (let bonus of skillModifiers)
      {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
      }

      const skillRoll = new Roll(rollFormula)
      skillRoll.evaluate({async: false})

      if (skillRoll.terms[0].results[0].result == 1)
        flawlessResult = 0;

      Chat.onSkillCheck(skillRoll, this, skillName, flawlessResult);
    }
    async rollCompetence()
    {
      let formula = "d20";
      let competence = this.system.traits.competence.value;
      let ability = await this.getRelatedAbility();
      ability = ability[0].replace('fantasycraft.','');

      formula += " + " + competence + Utils.returnPlusOrMinusString(this.system.abilityScores[ability].mod);

      const skillRoll = new Roll(formula)
      skillRoll.evaluate({async: false})

      Chat.onSkillCheck(skillRoll, this, "competence", 0);
    }

    async getRelatedAbility()
    {
      const content = await renderTemplate("systems/fantasycraft/templates/chat/dropdownDialog.hbs", {
        options: CONFIG.fantasycraft.abilityScores
      });

      return new Promise(resolve => {
        new Dialog({
          title: game.i18n.localize("fantasycraft.ability"),
          content,
          buttons: {
            accept: {
              label: game.i18n.localize("fantasycraft.accept"),
              callback: html => resolve(this.returnSelection(html))
            }
          },
          close: () => resolve(null)
        }).render(true);
      });
    }

    async returnSelection(html)
    {
      const form = html[0].querySelector("form");
      let dialogOptions = [];
  
      dialogOptions[0] = form.elements.choice.value
    
      return dialogOptions;
    }

    rollHealing(healingValue, healingType)
    {
      
      let healingRoll = new Roll(healingValue)
      healingRoll.evaluate({async: false})

      Chat.onHealingRoll(healingRoll, this, healingType);

      return healingRoll.total;
    }

    rollHealthSave(saveDC)
    {
      const saveMod = 
      [
        this.system.abilityScores.constitution.mod,
        this.system.traits.health.value
      ]

      let rollFormula = ["1d20"];
      for (let bonus of saveMod)
      {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
      }

      const damageSaveRoll = new Roll(rollFormula)
      damageSaveRoll.evaluate({async: false})

      Chat.onSavingThrow(damageSaveRoll, this, game.i18n.localize("fantasycraft.damage"), saveDC)
    
      return damageSaveRoll.total;
    }

    async getWeaponTricks(weapon)
    {
      let tricks = this.items.filter(function(item) {return (item.type == "trick")});
      tricks = tricks.filter(item => item.system.trickType.trickTarget == "attackTrick");
      tricks = tricks.filter(function(item) {return (
      (item.system.trickType.keyword == weapon.system.attackType || 
        item.system.trickType.keyword == weapon.system.weaponProficiency || item.system.trickType.keyword == weapon.system.weaponCategory) || 
      (item.system.trickType.keyword2 == weapon.system.attackType || item.system.trickType.keyword2 == weapon.system.weaponProficiency || 
        item.system.trickType.keyword2 == weapon.system.weaponCategory || item.system.trickType.keyword == "any" || item.system.trickType.keyword2 == "any"
        || (item.system.trickType.keyword == "bowHurled" && (weapon.system.weaponCategory == "bow" || weapon.system.weaponCategory == "hurled"))
        || (item.system.trickType.keyword2 == "bowHurled" && (weapon.system.weaponCategory == "bow" || weapon.system.weaponCategory == "hurled"))) 
      )});
      
      tricks = tricks.filter(item => item.system.uses.usesRemaining > 0 || item.system.uses.timeFrame == "unlimited");

      return tricks
    }

    async getUnarmedAttackTricks()
    {
      let tricks = this.items.filter(function(item) {return (item.type == "trick")});
      tricks = tricks.filter(item => item.system.trickType.trickTarget == "attackTrick"); 

      tricks = tricks.filter(function(item) {return (
        item.system.trickType.keyword == "unarmed" || item.system.trickType.keyword2 == "unarmed" || item.system.trickType.keyword == "any" || item.system.trickType.keyword2 == "any"
      )});

      tricks = tricks.filter(item => item.system.uses.usesRemaining > 0 || item.system.uses.timeFrame == "unlimited");
  
      return tricks
    }

    async getCombatActionTricks(action)
    {
      let tricks = this.items.filter(function(item) {return (item.type == "trick")});
      tricks = tricks.filter(function(item) {return (item.system.trickType.keyword == action)});
      tricks = tricks.filter(item => item.system.uses.usesRemaining > 0 || item.system.uses.timeFrame == "unlimited");

      let weapons = this.items.filter(function(item) {return (item.type == "weapon" && item.system.readied)});

      let newTricks = [];

      //check potential tricks to see if they have a secondary keyword requirement and check that keyword against the weapons that the character has readied.
      for (let trick of Object.entries(tricks))
      {
        if (trick[1].system.trickType.keyword2 == "")
        {
          newTricks.push(trick[1]);
        }

        for (let weapon of Object.entries(weapons))
        {
          if ((trick[1].system.trickType.keyword2 == weapon[1].system.attackType || trick[1].system.trickType.keyword2 == weapon[1].system.weaponProficiency || 
            trick[1].system.trickType.keyword2 == weapon[1].system.weaponCategory || (trick[1].system.trickType.keyword2 == "bowHurled" && (weapon[1].system.weaponCategory == "bow" 
            || weapon[1].system.weaponCategory == "hurled"))))
            {
              newTricks.push(trick[1]);
            }
        }
      }

      tricks = newTricks

      return tricks;
    }

    genericAttackModifiers(attackModifiers, item)
    {
      // sickened/prone/sprawled/blinded/Entangled/shaken/slowed 
      attackModifiers = this.applyEffectsToAttackRoll(attackModifiers, item?.system.attackType);
      
      let magicItems = Utils.getMagicItems(this);
      let magicBonus = 0;

      if (magicItems.length > 0)
      {
        for (let mi of magicItems)
        {
          let charm = Utils.getSpecificCharm(mi, "accuracyBonus");
          
          if (charm != null && (charm[1].target == item.system.attackType || mi == item))
              magicBonus = (Utils.getCharmBonus(mi, charm[1].greater) > magicBonus) ? Utils.getCharmBonus(mi, charm[1].greater) : magicBonus;
        }
      }

      if (magicBonus != 0) attackModifiers.push(magicBonus);


      let stances = this.items.filter(item => item.type == "stance" && item.system.inStance);
      if (stances.length > 0)
      {
        if (stances[0].system.effect1.effect == "accuracyBonus") attackModifiers.push(stances[0].system.effect1.bonus)
        if (stances[0].system.effect2.effect == "accuracyBonus") attackModifiers.push(stances[0].system.effect2.bonus)
      }

      return attackModifiers;
    }

    async rollWeaponAttack(item, skipInputs)
    {
      const actor = this.system;

      let abilityMod = actor.attackTypes[item.system.attackType].ability.name;
      let attackBonus = (this.type == "character") ? actor.baseAttack : actor.traits.attack.value;
      let tricks = await this.getWeaponTricks(item);
      let powerAttack = false;
      let multiAttack = false;
      let target = Utils.getTargets();
      let mastersTouch = false;
      let mastersTouchII = false;

      if (item.system.attackType == "melee" && (this.getFlag("fantasycraft", "Two-Weapon Fighting") || this.getFlag("fantasycraft", "Darting Weapon"))) multiAttack = true;
      else if (item.system.attackType == "ranged" && (this.getFlag("fantasycraft", "Angry Hornet"))) multiAttack = true;
      
      if (item.system.attackType == "melee" && this.getFlag("fantasycraft", "All-Out Attack")) powerAttack = true;
      else if (item.system.attackType == "ranged" && this.getFlag("fantasycraft", "Bullseye")) powerAttack = true;

      let mastersCheck = this.items.find(item => item.name == game.i18n.localize("fantasycraft.mastersTouch"))
      if (mastersCheck)
      {
        mastersTouch = true;
  
        if (mastersCheck.system.grades.value == "II")
          mastersTouchII = true
      }

        //if a character has heartseeker then there attack bonus is equal to their career level
      if (( target[0]?.document.actor.type == "character" ||  target[0]?.document.actor.system?.type == "special") && this.items.find(item => item.type == "feature" && item.name == game.i18n.localize("fantasycraft.heartseeker")))
      {
        attackBonus = actor.careerLevel.value;
      }

      //Str/Dex + BAB + Weapon Forte + stance bonus
      let attackModifiers = 
      [
        actor.abilityScores[abilityMod].mod,
        attackBonus
      ];
      
      //If the actor is a character get their proficiency bonus
      if (this.type == "character")
      {
        let proficency = 0;
        
        if (!actor.proficency[item.system.weaponProficiency].proficient) proficency = -4;
        else if (actor.proficency[item.system.weaponProficiency].forte) proficency = 1

        if (proficency != 0) attackModifiers.push(proficency);
      }
      
      //Magic Bonuses, stance bonueses, Conditions bonuses and penalties
      attackModifiers = this.genericAttackModifiers(attackModifiers, item);

      let rollFormula = ["1d20"];
      for (let bonus of attackModifiers)
      {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
      }

      let stances = this.items.filter(item => item.type == "stance" && item.system.inStance);
      let stance = false
      if (stances.length > 0)
      {
        if (stances[0].system.effect1.effect == "variableBonus") stance = true
        if (stances[0].system.effect2.effect == "variableBonus") stance = true
      }

      //check to see if the weapon requires the player to choose an ammunition type, and if the player has any ammunition for that weapon.
      let ammo;
      if (item.system.weaponCategory == "bow")
        ammo = this.itemTypes.weapon.filter(i => i.system.weaponCategory=="arrowsAndBolts");

      if (ammo?.length == 0)
      {
        ui.notifications.error(game.i18n.localize('fantasycraft.Dialog.noAmmunitionForChosenWeapon'))
        return;
      }
      
      if (!skipInputs)
      {
        const rollInfo = await this.preRollDialog(item.name, "systems/fantasycraft/templates/chat/attackRoll-Dialog.hbs", rollFormula, tricks, powerAttack, multiAttack, mastersTouch, mastersTouchII, stance, ammo)

        if (rollInfo == null) return;

        //Alter qualities based on class features, or ammunition
        let pod = this.itemTypes.path.find(i => i.name == game.i18n.localize("fantasycraft.pathOfDestruction"));
        item.system.weaponProperties.ap += (!!pod) ? pod.system.pathStep : 0;
        
        if (rollInfo.ammo != null)
          this.handleAmmo(rollInfo.ammo, item);
        

        rollFormula = determinePreRollTrickEffect(rollInfo?.trick1, actor, rollInfo, rollFormula, target, rollInfo?.trick2);
        if (rollFormula == "Error") return;

        //subtract the effect of power attack or multiattack feats
        if(rollInfo?.powerAttack) rollFormula += " - " + rollInfo.powerAttack;
        if(rollInfo?.multiAttack) rollFormula += " - " + rollInfo.multiAttack;
        if(rollInfo?.morale) rollFormula += Utils.returnPlusOrMinusString(rollInfo.morale);

        //roll the dice
        const attackRoll = new Roll(rollFormula)
        attackRoll.evaluate({async: false})

        let additionalInfo = determinePostRollTrickEffect(rollInfo?.trick1, actor, item, target, attackRoll);

        if (rollInfo == null)
          return;

        Chat.onAttack(attackRoll, this, item, rollInfo.trick1, rollInfo.trick2, additionalInfo, rollInfo.ammo);
      }
      else
      {
        let pod = this.itemTypes.path.find(i => i.name == game.i18n.localize("fantasycraft.pathOfDestruction"));
        item.system.weaponProperties.ap += (!!pod) ? pod.system.pathStep : 0;
        
        if (!!ammo)
        {
          this.handleAmmo(ammo[0], item)
        }

        const attackRoll = new Roll(rollFormula)
        attackRoll.evaluate({async: false})

        if (!!ammo)
          Chat.onAttack(attackRoll, this, item, null, null, null, ammo[0]);
        else 
          Chat.onAttack(attackRoll, this, item, null, null, null, null);
      }

    }

    async handleAmmo(ammo, item)
    {
        let ammoProperties = ammo.system.weaponProperties;
        for (let prop of Object.entries(item.system.weaponProperties))
        {
          let numeric = ["ap","blast", "guard", "keen", "load", "reach"]
          if (numeric.includes(prop[0]) && ammoProperties[prop[0]] > 0)
          {
            item.system.weaponProperties[prop[0]] += ammoProperties[prop[0]];
          } else if (ammoProperties[prop[0]] == true)
          {
            item.system.weaponProperties[prop[0]] = true;
          } else if ((prop[0] == "craftsmanship" || prop[0] == "materials") && ammoProperties[prop[0]] != "none")
          {
            item.system.weaponProperties[prop[0]] = ammoProperties[prop[0]];
          }
        }
    }

    //natural attack/save attack/damage attack
    async rollNaturalAttack(item, skipInputs)
    {
      const actor = this.system;

      const attackType = item.system.attackType;
      let supernaturalAttack;
      let attackModifiers;
      let target = Utils.getTargets();
      let tricks = await this.getUnarmedAttackTricks();
      let abilityMod = "strength";
      let attackBonus = (this.type == "character") ? actor.baseAttack : actor.traits.attack.value;
      let mastersTouch = false;
      let mastersTouchII = false;
      let multiAttack = false;
      let powerAttack = false;

      if (this.getFlag("fantasycraft", "Two-Hit combo")) multiAttack = true;
      
      if (this.getFlag("fantasycraft", "All-Out Attack")) powerAttack = true;
      
      //check to see if the player has the masters touch ability
      let mastersCheck = this.items.find(item => item.name == game.i18n.localize("fantasycraft.mastersTouch"))
      if (mastersCheck)
      {
        mastersTouch = true;
  
        if (mastersCheck.system.grades.value == "II")
          mastersTouchII = true
      }

      if (actor.martialArts) 
      {
        abilityMod = (this.type == "character") ? actor.defense.ability.name : actor.defense.defenseAttribute;
        item.system.threatRange = (actor.mastersArt) ? item.system.threat - 2 : item.system.threat - 1;
      }

      let stances = this.items.filter(item => item.type == "stance" && item.system.inStance);
      let stance = false
      if (stances.length > 0)
      {
        if (stances[0].system.effect1.effect == "variableBonus") stance = true
        if (stances[0].system.effect2.effect == "variableBonus") stance = true
      }

      //needs to determine if the attack is natural attack, if it is treat it essentially like a weapon attack
      if (attackType == "naturalAttack" || !!supernaturalAttack)
      {
        attackModifiers = this.naturalOrUnarmedAttackModifiers(actor, attackBonus, abilityMod);
      }
      
      //if the attack is instead a damage extrodanary attack needs to roll damage and output the total as well as damage type and save.
      if (attackType == "playerBreathWeapon" || attackType == "extraDamage" || attackType == "extraSave")
      {
        if (item.system.area.shape != "")
          abilityMod = "dexterity"

          attackModifiers = this.naturalOrUnarmedAttackModifiers(actor, attackBonus, abilityMod);
      }

      //finally if the attack is extraordinary save it needs to output the information about the attack, 
      if (attackType == "extraSave")
      {
        //if the attack is linked to a natural attack it should roll the natural attack instead and then include the save information below.
        if (item.system.supernaturalAttack.value == true){
          let itemID =  this.items.find(i => i.name == item.system.supernaturalAttack.linkedAttack)._id;
          supernaturalAttack = item;
          item = this.items.get(itemID);
        }
      }

      //Magic Bonuses, Conditions bonuses and penalties
      attackModifiers = this.genericAttackModifiers(attackModifiers, item);

      
      let rollFormula = ["1d20"];
      for (let bonus of attackModifiers)
      {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
      }
      if (!skipInputs)
      {
        const rollInfo = await this.preRollDialog(item.name, "systems/fantasycraft/templates/chat/attackRoll-Dialog.hbs", rollFormula, tricks, powerAttack, multiAttack, mastersTouch, mastersTouchII, stance);
        if (rollInfo == null) return;

        rollFormula = determinePreRollTrickEffect(rollInfo?.trick1, actor, rollInfo, rollFormula, target, rollInfo?.trick2);
        if (rollFormula == "Error") return;

        //subtract the effect of power attack or multiattack feats
        if(rollInfo?.powerAttack) rollFormula += " - " + rollInfo.powerAttack;
        if(rollInfo?.multiAttack) rollFormula += " - " + rollInfo.multiAttack;
        if(rollInfo?.morale) rollFormula += Utils.returnPlusOrMinusString(rollInfo.morale);
        
        //roll the dice
        const attackRoll = new Roll(rollFormula)
        attackRoll.evaluate({async: false})
  
        //let additionalInfo = determinePostRollTrickEffect(rollInfo?.trick1, actor, item, null, attackRoll);
  
        if (rollInfo == null)
          return;
  
        Chat.onNaturalAttack(attackRoll, this, item, rollInfo.trick1, rollInfo.trick2, supernaturalAttack);
      }
      else 
      {
        const attackRoll = new Roll(rollFormula)
        attackRoll.evaluate({async: false})

        Chat.onNaturalAttack(attackRoll, this, item, null, null, supernaturalAttack);
      }

    }

    //unarmed attack
    async rollUnarmedAttack(item, skipInputs)
    {
      const actor = this.system;

      let attackBonus = (this.type == "character") ? actor.baseAttack : actor.traits.attack.value;
      let abilityMod = "strength"
      let threatRange = 20;
      let errorRange = 1;
      let ap = 0; 
      let target = Utils.getTargets();
      let tricks = await this.getUnarmedAttackTricks();
      let multiAttack = (this.getFlag("fantasycraft", game.i18n.localize("fantasycraft.twoHitCombo"))) ? true : false;
      let powerAttack = (this.getFlag("fantasycraft", game.i18n.localize("fantasycraft.allOutAttack"))) ? true : false;
      let mastersTouch = false;
      let mastersTouchII = false;

      ap = (this.items.find(item => item.name == game.i18n.localize("fantasycraft.kickingMastery"))) ? 2 : 0;
      ap += this.items.find(item => item.name == game.i18n.localize("fantasycraft.pathOfDestruction"))?.system.pathStep;

      //check to see if the player has the masters touch ability
      let mastersCheck = this.items.find(item => item.name == game.i18n.localize("fantasycraft.mastersTouch"))
      if (mastersCheck)
      {
        mastersTouch = true;
  
        if (mastersCheck.system.grades.value == "II")
          mastersTouchII = true
      }

      if (actor.martialArts) 
      {
        abilityMod = (this.type == "character") ? actor.defense.ability.name : actor.defense.defenseAttribute;
        threatRange = (actor.mastersArt) ? 18 : 19;
      }
      
      let attackModifiers = this.naturalOrUnarmedAttackModifiers(actor, attackBonus, abilityMod);
      let rollFormula = ["1d20"];
      for (let bonus of attackModifiers)
      {
        rollFormula += Utils.returnPlusOrMinusString(bonus);
      }

      //Magic Bonuses, Conditions bonuses and penalties
      attackModifiers = this.genericAttackModifiers(attackModifiers, item);

      
      if (!skipInputs)
      {
        const rollInfo = await this.preRollDialog(game.i18n.localize("fantasycraft.unarmedStrike"), "systems/fantasycraft/templates/chat/attackRoll-Dialog.hbs", rollFormula, tricks, powerAttack, multiAttack, mastersTouch, mastersTouchII)
        if (rollInfo == null) return;

        rollFormula = determinePreRollTrickEffect(rollInfo?.trick1, actor, rollInfo, rollFormula, target, rollInfo?.trick2);
        if(rollInfo?.powerAttack) rollFormula += " - " + rollInfo.powerAttack;
        if(rollInfo?.multiAttack) rollFormula += " - " + rollInfo.multiAttack;
        if(rollInfo?.stance) rollFormula += " - " + rollInfo.stance;
        if(rollInfo?.morale) rollFormula += Utils.returnPlusOrMinusString(rollInfo.morale);
      }

      const attackRoll = new Roll(rollFormula)
      attackRoll.evaluate({async: false})

      let unarmedItem = 
      {
        id: "",
        name: "Unarmed Attack",
        system: {
          threatRange: threatRange,
          errorRange: errorRange,
          weaponProperties: 
          {
            ap: ap
          }
        },
      }

      Chat.onAttack(attackRoll, this, unarmedItem);
    }

    applyEffectsToAttackRoll(attackModifiers, attackType)
    {
      if (this.effects.find(e => e.flags?.core?.statusId === "sickened")) attackModifiers.push(-2);

      if (attackType == "melee")
        if (this.effects.find(e => e.flags?.core?.statusId === "prone")) attackModifiers.push(-2);
  
      if (this.effects.find(e => e.flags?.core?.statusId === "sprawled")) attackModifiers.push(-2);
      if (this.effects.find(e => e.flags?.core?.statusId === "blinded")) attackModifiers.push(-8);
      if (this.effects.find(e => e.flags?.core?.statusId === "entangled")) attackModifiers.push(-2);
      if (this.effects.find(e => e.flags?.core?.statusId === "shaken")) 
      {
        let attackPenalty = this.effects.find(e => e.flags?.core?.statusId === "shaken").changes[0].value;
        attackPenalty *= this.system.conditions.shaken;
        attackModifiers.push(attackPenalty);
      }
      if (this.effects.find(e => e.flags?.core?.statusId === "slowed")) attackModifiers.push(-1);
      if (this.effects.find(e => e.flags?.core?.statusId === "haste")) attackModifiers.push(1);

      return attackModifiers;
    }


    async rollCombatAction(action)
    {
      let actionShort = (action == "bull rush") ? "bullRush" : action;
      let actionValue = this.system.combatActions[actionShort];
      let tricks = await this.getCombatActionTricks(actionShort);
      const rollFormula = "1d20 " + Utils.returnPlusOrMinusString(actionValue);
      
      
      //check for tricks
      const rollInfo = await this.preRollDialog(actionShort, "systems/fantasycraft/templates/chat/attackRoll-Dialog.hbs", rollFormula, tricks);

      if (rollInfo == null) return;

      const actionRoll = new Roll(rollFormula);
      actionRoll.evaluate({async: false});


      if (rollInfo == null)
        return;

      if (rollInfo?.trick1) this.reduceRemainingAbilityUses(rollInfo.trick1);
  

      Chat.onCombatAction(actionRoll, this, actionShort, rollInfo.trick1);
    }
    
    naturalOrUnarmedAttackModifiers(actor, attackBonus, abilityMod)
    {
        let attackModifiers = 
        [
          actor.abilityScores[abilityMod].mod,
          attackBonus
        ];
        
        ////Str/Dex + BAB + Weapon Forte 
        if (this.type == "character")
        {
          let proficency = 0;
        
          if (!actor.proficency.unarmed.proficient) proficency = -4;
          else if (actor.proficency.unarmed.forte) proficency = 1;
        
          if (proficency != 0)
            attackModifiers.push(proficency);
        }

        return attackModifiers;
    }

    async preRollDialog(attackName, template, formula, tricks, powerAttack = false, multiAttack = false, mastersTouch = false, mastersTouchII = false, stance = false, ammo=false)
    {
      const content = await renderTemplate(template, {
        formula: formula,
        tricks: tricks,
        powerAttack: powerAttack,
        multiAttack: multiAttack,
        mastersTouch: mastersTouch,
        mastersTouchII: mastersTouchII,
        stance: stance,
        ammo: ammo
      });

      return new Promise(resolve => {
        new Dialog({
          title: attackName,
          content,
          buttons: {
            accept: {
              label: game.i18n.localize("fantasycraft.accept"),
              callback: html => resolve(this.onDialogSubmit(html))
            }
          },
          close: () => resolve(null)
        }).render(true);
      });
    }

    onDialogSubmit(html)
    {
      const form = html[0].querySelector("form");
      let dialogOptions = {};

      if (form.ammunition?.value)
      {
        let ammo = this.items.get(form.ammunition.value)
        dialogOptions.ammo = ammo;
        ammo.update({"system.quantity": (ammo.system.quantity - 1)})
        if (ammo.system.quantity < 1)
          this.deleteEmbeddedDocuments("Item", [ammo._id]);

      }

      //convert the input to a useable number, if the number is less than 0 make it positive. If it's more than 4 reduce it to 4
      if (form.powerAttackValue?.value && form.powerAttackValue?.value != 0)
      {
        form.powerAttackValue.value = (form.powerAttackValue.value < 0) ? form.powerAttackValue.value * -1 : form.powerAttackValue.value;
        
        form.powerAttackValue.value = (form.powerAttackValue.value > 4) ? 4 : form.powerAttackValue.value;

        dialogOptions.powerAttack = form.powerAttackValue.value;
        this.system.powerAttack = form.powerAttackValue.value;
      }
      else
        this.system.powerAttack = 0;
      
      if (form.multiAttackPenalty?.value > 0)
      {
        dialogOptions.multiAttack = form.multiAttackPenalty.value;
      }

      if (form.moraleValue.value != 0)
        dialogOptions.morale = form.moraleValue.value

      if (form.trick.value)
      {
        dialogOptions.trick1 = this.items.get(form.trick.value);
        if (form?.trick2) dialogOptions.trick2 = this.items.get(form.trick2.value);
      }

      return dialogOptions;
    }


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    ///////////////// APPLY CHANGES //////////////////
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////

    async applyHealing(healing, healingType)
    {
      if (healing.toString().includes("d"))
      {
        healing = this.rollHealing(healing, healingType)
      }

      if (this.type == "character" || this.system.isSpecial)
      {
        if (healingType == "vitality")
          this.system.vitality.value = (this.system.vitality.value + healing >= this.system.vitality.max) ? this.system.vitality.max : this.system.vitality.value + healing;
        if (healingType == "wounds")
          this.system.wounds.value = (this.system.wounds.value + healing >= this.system.wounds.max) ? this.system.wounds.max : this.system.wounds.value + healing;
        if (healingType == "stress")
          this.system.stress = (this.system.stress - healing <= 0) ? 0 : this.system.stress - healing;
        if (healingType == "subdual")
          this.system.subdual = (this.system.subdual - healing <= 0) ? 0 : this.system.subdual - healing;
        if (healingType == "mixed")
        {
          //sort that shit out yourselves
        }
      } else
        this.system.damageTaken -= healing;
    }

    async applyDamage(damage, options={damageType: "lethal", ap: 0, crit: false, weaponType: "", trick1: null, trick2: null})
    {
      if (this.effects.find(e => e.flags?.core?.statusId === 'dead')) 
        return;

      const lethal = (options.damageType == "subdual" || options.damageType == "cold" || options.damageType == "heat" || options.damageType == "stress") ? false : true;

      let isImmune = false;


      //first check for a wide variety of reasons why the creature may be immune (creature type, has the damage immunity quality for the damage type... they're dead.)
      if (!lethal && (this.system.type == "undead" || this.system.type == "construct"))
        isImmune = true;

      if ((options.damageType == "subdual" || options.damageType == "cold" || options.damageType == "heat") && this.system.type == "elemental")
      isImmune = true;

      const immune = this.items.find(item => item.name == game.i18n.localize("fantasycraft.damageImmunity"))?.system.damageTypes.string.split(",").map(e => e.trim());
      const defiance = this.items.find(item => item.name == game.i18n.localize("fantasycraft.damageDefiance"))?.system.damageTypes.string.split(",").map(e => e.trim());
      const vulnerability = this.items.find(item => item.name == game.i18n.localize("fantasycraft.achillesHeel"))?.system.damageTypes.string.split(",").map(e => e.trim());
      
      if (immune?.includes(options.damageType))
        isImmune = true;

        let paths = this.items.filter(function(item) {return item.type == "path"})
        for (let [key, path] of Object.entries(paths))
        {
          //get number of steps of the path
          let steps = path.system.pathStep;

          if (steps == 0)
            continue;
  
          //loop through the steps to check for resistances
          pathImmunityCheck(path, steps, options.damageType)
        }

      if (!vulnerability?.includes(options.damageType) && isImmune)
        return;

      if (vulnerability?.includes(options.damageType) && isImmune)
      {
        applyDamage(damage, options={damageType: "lethal", ap: ap, crit: crit, weaponType: weaponType, trick1: trick1, trick2: trick2})
        return;
      }

      //flash and bang damage do not actually do damage and should not be handled by this function, but if a creature has vulnerability that damage needs to carry through
      if (options.damageType == "flash" || options.damageType == "bang")
      {
        if (!vulnerability?.includes(options.damageType))
          return;
      }

      if (this.effects.find(e => e.flags?.core?.statusId === 'unconscious') && options.damageType == "subdual") 
        options.damageType = "lethal";

      let dr = this.system.dr;
      dr = (dr - options.ap < 0) ? 0 : dr - options.ap;


      //first reduce damage by (DR-AP)
      if (dr > 0 && options.damageType != "cold" && options.damageType != "divine" && options.damageType != "electrical" && options.damageType != "heat" && options.damageType != "sonic" && options.damageType != "stress" && options.damageType != "flash" && options.damageType != "bang")
        damage -= dr;

      //then reduce damage by resistances (if any)
      if(this.system?.resistances[options.damageType])
        damage -= this.system.resistances[options.damageType];

      if (defiance?.includes(options.damageType))
        damage = Math.floor(damage/2)

      if (damage <= 0) return 0;
        
      if (vulnerability?.includes(options.damageType) && (!options.damageType == "flash" || !options.damageType == "bang"))
        damage = damage*2;
        
      const vitality = this.system.vitality;
      const wounds = this.system.wounds;
      //if the actor is a character or a special NPC deduct from vitality first and then wounds
      if (this.type == "character" || (this.type == "npc" && this.system.isSpecial))
      {
        if (lethal)
        {
          if (!options.crit && vitality.value > 0){
            vitality.value -= damage;
            damage = (vitality.value > 0) ? 0 : -vitality.value;
          }

          if (damage > 0)
          {
            wounds.value -= damage;
            vitality.value = 0
          }

          this.system.vitality.value = vitality.value;
          this.system.wounds.value = wounds.value;

          if (this.system.wounds.value <= -10)
          {
            this.applyCondition("dead");
          }
          else if (this.system.wounds.value <= 0)
          {
            this.applyCondition("unconscious");  
          }
        }
        else
        {
          if (options.damageType == "cold" || options.damageType == "heat" || options.damageType == "subdual")
          {
            this.system.subdual += damage;
            if (this.type == "npc" && game.settings.get('fantasycraft', 'autoRollForNPCs')) 
            {
              let fortSave = this.rollSavingThrow("fortitude")

              if (fortSave < 10 + Math.floor(this.system.subdual/2))
              {
                this.system.subdual = 0;
                if (this.system.conditions.fatigue == 4 || ((options.trick1?.system.effect.secondaryCheck == "fatigue" || options.trick2?.system.effect.secondaryCheck == "fatigue") && this.system.conditions.fatigue == 3)) 
                {
                  this.applyCondition("unconscious");
                }
                else if (options.trick1?.system.effect.secondaryCheck == "fatigue" || options.trick2?.system.effect.secondaryCheck == "fatigue")
                  this.system.conditions.fatigue += 2;
                else
                  this.system.conditions.fatigue += 1;
              }
            }
          }
          else if (options.damageType == "stress")
          {
            this.system.stress += damage;
            if (this.type == "npc" && !game.settings.get('fantasycraft', 'autoRollForNPCs')) 
            {
              let willSave = this.rollSavingThrow("will")

              if (willSave < 10 + Math.floor(this.system.stress/2))
              {
                this.system.stress = 0;                
                if (this.system.conditions.shaken == 4 || ((options.trick1?.system.effect.secondaryCheck == "shaken" || options.trick2?.system.effect.secondaryCheck == "shaken") && this.system.conditions.shaken == 3)) 
                {
                  this.applyCondition("unconscious");
                }
                else if (options.trick1?.system.effect.secondaryCheck == "shaken" || options.trick2?.system.effect.secondaryCheck == "shaken")
                  this.system.conditions.shaken += 2;
                else
                  this.system.conditions.shaken += 1;
              }
            }
          }

          if (options.crit)
          {
            this.applyCondition("stunned");
          }
        }
      }
      //if the character is an NPC instead just roll a damage roll. 
      else if (this.type == "npc" && !this.system.isSpecial)
      {
        if (!options.crit)
          this.npcDamageSave(damage, lethal);
        else
          this.npcDamageSave(damage, lethal, true);
      }
    }

    async npcDamageSave(damage, lethal, autoKill=false)
    {
      let saveRoll;
      let saveDC;
      let totalDamage;

      if (!autoKill)
      {
        //add the damage to the npcs "total damage"
        totalDamage = this.system.damageTaken;

        totalDamage += damage;
        saveDC = Math.floor((totalDamage/2) + 10);

        //roll 1d20 + con + health grade value, if that value is less than 10 + (total damage/2)
        saveRoll = this.rollHealthSave(saveDC);
      }

      if (autoKill || saveRoll < saveDC)
      {
        this.system.failedSaves ++;
        //check to see if the NPC has "Tough"
        const tough = this.items.find(function(item) {return item.name == "Tough"})

        //if the NPC does not have tough, or if the npc has failed more saves than their tough grade kill the NPC
        if (tough == null || (this.system.failedSaves > Utils.numeralConverter(tough.system.grades.value)))
        {
          if (lethal)
          {
            this.applyCondition("dead");
          }
          else 
          {
            this.applyCondition("unconscious");          
          }
        }
      }
      else 
      {
        this.system.damageTaken = totalDamage;
      }
    }

    applyImparement(attribute, amount=-1)
    {
      if ((attribute == "intelligence" || attribute == "wisdom" || attribute == "charisma") && this.system.type == "construct")
        return
      if (attribute == "constitution" && this.system.type == "undead")
        return;

      const unbreakable = this.items.find(item => item.name == game.i18n.localize("fantasycraft.unbreakable"));

      if (unbreakable)
        amount += 1

      if (amount >= 0)
        return;

      this.system.abilityScores[attribute].adjustment += amount;
      this.system.abilityScores[attribute].mod = Math.floor(((this.system.abilityScores[attribute].value + this.system.abilityScores[attribute].adjustment) - 10) / 2);
    }

    async applyCondition(effect)
    {
      if (this.effects.find(e => e.flags?.core?.statusId === effect))
        return; 

      if ((effect == "bleeding" || effect == "enraged" || effect == "fatigued" || effect == "fixated" || effect == "frightened" || effect == "paralyzed" || 
      effect == "shaken" || effect == "sickened") && this.system.type == "construct")
        return;
      if ((effect == "bleeding" || effect == "flanked" || effect == "paralyzed" || effect == "sickened") && this.system.type == "elemental")
        return;
      if ((effect == "fixated"|| effect == "paralyzed" || effect == "sickened") && this.system.type == "plant")
        return;
      if ((effect == "bleeding" || effect == "paralyzed" || effect == "sickened" || effect == "stunned") && this.system.type == "undead")
        return;

      const immune = this.items.find(item => item.name == game.i18n.localize("fantasycraft.conditionImmunity"))?.system.damageTypes.string.split(",").map(e => e.trim());
      const stance = this.items.find(item => item.system?.inStance &&  ((item.system.effect1?.effect == "conditionImmunity" && item.system.effect1?.bonusTarget == effect) || 
      (item.system.effect2?.effect == "conditionImmunity" && item.system.effect2?.bonusTarget == effect)))

      if (stance?.length > 0)
        return

      if (immune?.includes(effect))
        return;

      let condition = CONFIG.statusEffects.find(e => e.id === effect);
      condition['flags.core.statusId'] = effect;
      await ActiveEffect.create(condition, {parent: this});       
    }

    async removeCondition(effectName)
    {
      const effect = this.effects.find(effect => effect.flags?.core?.statusId === effectName)

      await effect?.delete() 
    }
}