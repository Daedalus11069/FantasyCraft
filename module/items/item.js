export default class ItemFC extends Item {

  prepareDerivedData() 
  {
    super.prepareDerivedData();

    // Get the Item's data
    const itemData = this;
    const data = itemData.system;
    const config = CONFIG.fantasycraft;
    const labels = this.labels = {};


    if (itemData.type === "class") {
      data.levels = Math.clamped(data.levels, 1, 20);
    }
    
    if(itemData.type === "spell"){
      this._separateSpellTerms(data);
    }

    if(itemData.type === "armour")
    {
      this._armourCustomizations();
    }

    if(itemData.type === "trick")
    {
      if (itemData.system.effect.additionalEffect == "applyCondition" || itemData.system.effect.additionalEffect == "impareAttribute" || itemData.system.effect.additionalEffect == "healVitality" || itemData.system.effect.additionalEffect == "minimumDamage")
      {
        itemData.system.button.requiresButton = true;
        itemData.system.button.buttonText = "fantasycraft." + itemData.system.effect.additionalEffect + "Button";
      }
    }

    if(itemData.type === "attack")
    {
      if (itemData.system.attackType === "naturalAttack")
      {
        this._calculateDamage(data);
        this._calculateThreat(data);
      }
      else
        this._prepareExtraordinaryAttack(data);
    }

    if (itemData.system.isMagic)
    {
      this.essences = [data.essences.essence1, data.essences.essence2,
        data.essences.essence3, data.essences.essence4]
      this.charms = [data.charms.charm1, data.charms.charm2,
        data.charms.charm3, data.charms.charm4]
      
      this._calculateMagicItemReputationCost(itemData);

      this._calculateCharmCastingLevel(itemData);

      for (let i = itemData.system.charms.charmNumber+1; i <= 4; i++)
      {
        let charmNum = "charm" + i;
        itemData.system.charms[charmNum].ability = "none";
      }
      for (let i = itemData.system.essences.essenceNumber+1; i <= 4; i++)
      {
        let essenceNum = "essence" + i;
        itemData.system.essences[essenceNum].ability = "none";
      }

    }
  }

  _calculateMagicItemReputationCost(itemData)
  {
    let totalRepCost = 0;
    let repDiscount = 0;
    
    if (itemData.type == "armour")
      repDiscount = 10;
    else 
      repDiscount = itemData.system.type;

    for (let i = 1; i <= itemData.system.charms.charmNumber; i++)
    {
      let charmNum = "charm" + i;
      let charmInfo = itemData.system.charms[charmNum];
      let charmCost = 1;
      
      if (charmInfo.ability == "defenseBonus" || charmInfo.ability == "accuracyBonus" || charmInfo.ability == "bane" || charmInfo.ability == "spellPointBonus")
        charmCost = 8;
      else if (charmInfo.ability == "skillRanks")
        charmCost = 4;
      else if (charmInfo.ability == "attributeBonus" || charmInfo.ability == "damageBonus")
        charmCost = 10;
      else if (charmInfo.ability == "storage" && charmInfo.greater)
        charmCost = 2;
      else if (charmInfo.ability == "spellEffect")
        charmCost = (charmInfo.greater) ? charmInfo.spellLevel*3 : charmInfo.spellLevel;

      totalRepCost += (charmInfo.greater) ? charmCost * CONFIG.fantasycraft.charmBonuses.Greater[this.system.itemLevel - 1] : charmCost * CONFIG.fantasycraft.charmBonuses.Lesser[this.system.itemLevel - 1];
    }

    for (let i = 1; i <= itemData.system.essences.essenceNumber; i++)
    {
      let essenceNum = "essence" + i;
      let essenceInfo = itemData.system.essences[essenceNum];
      let essenceCost = 1;
      
      if (essenceInfo.ability == "acp")
      {
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 5 : 3;
      }
      else if (essenceInfo.ability == "trainedSkill" || essenceInfo.ability == "interest")
        essenceCost = 3;
      else if (essenceInfo.ability == "proficiency" || essenceInfo.ability == "trick")
        essenceCost = 4;
      else if (essenceInfo.ability == "npcQuality")
      {
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 15 : 6;
      }     
      else if (essenceInfo.ability == "alignedDamage")
      {
        essenceCost = (essenceInfo.ranged) ? 5 : 4;
      }
      else if (essenceInfo.ability == "exoticDamage")
        essenceCost = 5;
      else if (essenceInfo.ability == "damageAura")
      {  
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 10 : 6;
      }
      else if (essenceInfo.ability == "damageResistance")
      {
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 15 : 8;
      }
      else if (essenceInfo.ability == "edgeSurge")
      {  
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 15 : 8;
      }
      else if (essenceInfo.ability == "travelSpeed")
      { 
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 20 : 10;
      }
      else if (essenceInfo.ability == "saveBonus")
      {  
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 25 : 8;
      }
      else if (essenceInfo.ability == "vitality")
      {  
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 25 : 12;
      }
      else if (essenceInfo.ability == "wounds")
      {  
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 25 : 10;
      }
      else if (essenceInfo.ability == "threatRange")
      {  
        essenceInfo.canBeGreater = true;
        essenceCost = (essenceInfo.greater) ? 20 : 10;
      }
      else if (essenceInfo.ability == "damageReduction")
      {
        essenceInfo.mustBeGreater = true;
        essenceCost = 15;
      }
      else if (essenceInfo.ability == "feat" || essenceInfo.ability == "castingLevel" || essenceInfo.ability == "classAbility")
      {
        essenceInfo.mustBeGreater = true;
        essenceCost = 20;
      }
      else if (essenceInfo.ability == "classEnhancement")
      {
        essenceInfo.mustBeGreater = true;
        essenceCost = 25;
      }
      
      totalRepCost += essenceCost;
      if(essenceInfo.mustBeGreater)
      {
        essenceInfo.greater = true;
      }
      else
      {
        essenceInfo.greater = (essenceInfo.canBeGreater) ? essenceInfo.greater : false;
      }
    }


    if (repDiscount * 2 > totalRepCost)
      totalRepCost = Math.ceil(totalRepCost/2);
    else 
      totalRepCost -= repDiscount;

    itemData.system.totalReputation = totalRepCost;
  }

  _calculateCharmCastingLevel(itemData)
  {
    for (let i = 1; i <= itemData.system.charms.charmNumber; i++)
    {
      let charmNum = "charm" + i;
      let charmInfo = itemData.system.charms[charmNum];

      if (charmInfo.ability == "spellEffect")
        itemData.system.castingLevel = itemData.system.itemLevel;
    }
  }

  _separateSpellTerms(terms) 
  {
    const map = 
    {
      "secondaryTerms": CONFIG.fantasycraft.spellTerms,
      "savingThrowTerms": CONFIG.fantasycraft.savingThrowTerms
    };

    for ( let [t, choices] of Object.entries(map) ) 
    {
      const term = terms[t];
      if ( !term ) continue;
      let values = [];
      if ( term.value ) 
      {
        values = term.value instanceof Array ? term.value : [term.value];
      }
      term.selected = values.reduce((obj, t) => 
      {
        obj[t] = choices[t];
        return obj;
      }, 
      {});

      // Add custom entry
      if ( term.custom ) 
      {
        term.custom.split(";").forEach((c, i) => term.selected[`custom${i+1}`] = c.trim());
      }

      term.cssClass = !isEmpty(term.selected) ? "" : "inactive";
    }
  }

  _armourCustomizations()
  {
    if (!this.system.fittings)
    {
      this.system.upgrades.fittings = "";
    }
  }
  
  _calculateDamage(data)
  {
    let damage = data.damage.value;
    let diceNum = 1;

    if (data.attackGrade == "III" || data.attackGrade == "IV")
      diceNum = 2
    else if (data.attackGrade == "V")
      diceNum = 3

    if (data.naturalAttack == "bite" || data.naturalAttack == "trample" || data.naturalAttack == "tailSlap")
    {
      damage = diceNum + "d8"
    } 
    else if (data.naturalAttack == "squeeze" || data.naturalAttack == "swallow")
    {
      damage = diceNum + "d10"
    }
    else 
      damage = diceNum + "d6"

      data.damage.value = damage;
  }

  _calculateThreat(data)
  {
      let baseThreat = 20;
  
      if (data.naturalAttack == "bite")
        baseThreat = 18;
      else if (data.naturalAttack == "gore")
        baseThreat = 19
      else if (data.naturalAttack == "squeeze" || data.naturalAttack == "swallow")
      {
        data.threat = 0
        return;
      }
      
      if (data.attackGrade == "II" || data.attackGrade == "III")
        baseThreat -= 1;
      if (data.attackGrade == "IV" || data.attackGrade == "V")
        baseThreat -= 2;
  
      data.threat = baseThreat
  }

  _prepareExtraordinaryAttack(data)
  {
    if (data.attackType == "extraDamage") this._damageCalc(data);
    if (data.attackType == "extraSave") this._saveCalc(data);

    this._areaCalc(data);
  }

  _damageCalc(data)
  {
        //for damage extraordinary abilities damage = TL/2 rounded up dice size is based on grade. This is done in the NPC sheet
        let diceSize = 4;

        switch (data.attackGrade)
        {
          case "I":
            diceSize = 4;
            break;
          case "II":
            diceSize = 6;
            break;
          case "III":
            diceSize = 8;
            break;
          case "IV":
            diceSize = 10;
            break;
          case "V":
            diceSize = 12;
            break;
          default:
            console.log("Grade outside recognized bounds.");
        }
    
        data.damage.diceSize = diceSize;
  }

  _saveCalc(data)
  {
    let saveDC = 5

    switch (data.attackGrade)
    {
      case "I":
        saveDC += 5;
        break;
      case "II":
        saveDC += 10;
        break;
      case "III":
        saveDC += 15;
        break;
      case "IV":
        saveDC += 20;
        break;
      case "V":
        saveDC += 25;
        break;
      default:
        console.log("Grade outside recognized bounds.");
    }

    data.saveDC = saveDC;
  }

  _areaCalc(data)
  {
    let areaSize = data.area.value;
    let areaShape = data.area.shape;
    let multiplier = 10;

    if (areaShape == "blast")
      multiplier = 5;
    else if (areaShape == "ray")
      multiplier = 20;
    else if (areaShape == "gaze")
      multiplier = 0;

    data.area.totalRange = areaSize * multiplier;
  }
}