import TraitSelector from "../../apps/trait-selector.js";
import ArmourResistance from "../../apps/armour-resistances.js";
import { returnPlusOrMinusString } from "../../Utils.js";

export default class FCItemSheet extends ItemSheet {

	get template(){
		return `systems/fantasycraft/templates/items/${this.item.type}-sheet.handlebars`;
  }
  
	static get defaultOptions() 
  {
    return mergeObject(super.defaultOptions, {
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      classes: ["fantasycraft", "sheet", "item"],
      width: 600,
      height: 375, 
      dragDrop: [{dragSelector: null, dropSelector: null}]
    });
  }

  // @override base getData
  async	getData(options)
	{
    if (this.item.type == "class" || (this.item.type == "store" && !this.item.system?.freeBuy))
    {
      this.position.height = 875;
      this.position.width = 685;
    }
    else if (this.item.type == "trick" || this.item.type == "stance")
    {
      this.position.height = 300;
    }
    else if ((this.item.type == "store" && this.item.system?.freeBuy))
    {
      this.position.height = 475;
    }
    const data = super.getData(options);

    const itemData = data;
    data.config = CONFIG.fantasycraft;

    this.prepairDerivedData(data.item);
    this._prepareOptions(data.item.system.classSkills)

    data.item = itemData.item;
    data.data = itemData.item.system;
    data.isGM = game.user.isGM;

    if (data.item.type == "spell")
    {
      data.spellDisciplines = data.config.spellDiscipline[data.data.school];
      this._spellSaveCheck(data);
      this._spellDistanceCheck(data);
      this._spellDurationCheck(data);
      this._spellArea(data);
    }

    if(data.item.type == "attack")
    {
      data.apDropdown = {0: 0, 2: 2, 4: 4, 6: 6, 8: 8, 10: 10, 12: 12, 14: 14, 16: 16, 18: 18, 20: 20};
      data.keenDropdown = {0: 0, 4: 4, 8: 8, 12: 12, 16: 16, 20: 20, 24: 24, 28: 28, 32: 32, 36: 36, 40: 40};
      data.reachDropdown = {0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20};
      data.saveUpgrade = {none: "none", linked: "Linked to Attack", area: "area"};

      data.data.naturalUpgrades.keen = parseInt(data.data.naturalUpgrades.keen);
      data.data.naturalUpgrades.armourPiercing = parseInt(data.data.naturalUpgrades.armourPiercing);
      data.data.naturalUpgrades.reach = parseInt(data.data.naturalUpgrades.reach);
    }

    if(data.item.type == "feature")
    {
      data.xpChoices = {none: game.i18n.localize("fantasycraft.noEntry"), points: game.i18n.localize("fantasycraft.point"), grades: game.i18n.localize("fantasycraft.grade"), entries: game.i18n.localize("fantasycraft.entries"), damageType: game.i18n.localize("fantasycraft.damageType")}
      data.grades = {"": "", I: "I", II: "II", III: "III", IV: "IV", V: "V", VI: "VI", VII: "VII", VIII: "VIII", IX: "IX", X: "X"}
    }

    if(data.item.type == "general")
    {
      if (data.item.system.itemType != "service" && data.item.system.itemType != "consumable")
      {
        let itemString = data.item.system.itemType + "Upgrades";
        data.itemUpgrades = data.config[itemString];
      }  
    }

    if(data.item.type == "class")
    {
      this.item.system.abilities = TextEditor.enrichHTML(this.item.system.abilities);
      this.item.system.classTable = TextEditor.enrichHTML(this.item.system.classTable);
    }
    if(data.item.type == "stance")
    {
      let effect1 = this.item.system.effect1.effect;
      let effect2 = this.item.system.effect2.effect;

      if (effect1 == "accuracyBonus" || effect1  == "damageBonus" || effect1 == "dodgeBonusToDefense" || effect1 == "dr" || effect1 == "damageResistance" || effect1 == "increasesAttributes" || effect1 == "skillBonus" || 
      effect1 == "reduceThreat" || effect1 == "saveBonus")
      {
        data.effect1IsNumeric = true;
      }

      if (effect2 == "accuracyBonus" || effect2  == "damageBonus" || effect2 == "dodgeBonusToDefense" || effect2 == "dr" || effect2 == "damageResistance" || effect2 == "increasesAttributes" || effect2 == "skillBonus" || 
      effect2 == "reduceThreat" || effect2 == "saveBonus")
      {
        data.effect2IsNumeric = true;
      }
    }

    if (data.item.type == "store")
    {
      let cart = this.item.system.shoppingCart;
      let store = this.item.system.storeArray;

      store.forEach(item => item.system.newCost = Math.round(item.system.cost * this.item.system.pricePercent));
      cart.forEach(item => item.system.newCost = Math.round(item.system.cost * this.item.system.pricePercent));

      let total = 0;
      let repTotal = 0;
      cart.forEach(function(item){
        if (item.system.currency == "Silver") total += (item.system.newCost * item.system.quantity); 
        if (item.system.currency == "Reputation") repTotal += (item.system.newCost * item.system.quantity); 
      })
      data.silverTotal = total;
      data.reputationTotal = repTotal;
    }

    return data;
	}
	
  activateListeners(html) 
  {
    // Editable Only Listeners
    if ( this.isEditable ) 
    {
      // Trait Selector
      html.find('.trait-selector').click(this._onTraitSelector.bind(this));
      html.find('.armour-resistances').click(this._onArmourResistance.bind(this));
    }

    html.find('.charmSelecter').change(this._magicItemInformation.bind(this));
    html.find('.essenceSelecter').change(this._magicItemInformation.bind(this));

    html.find('.buy').click(this._purchaseItems.bind(this));
    html.find('.haggle').click(this._haggleShop.bind(this));
    html.find('.resetHaggle').click(this._resetHaggle.bind(this));
    html.find('.freeBuy').change(this._changeShopType.bind(this));

    html.find('.increase').click(this._increaseItem.bind(this));
    html.find('.decrease').click(this._decreaseItem.bind(this));
    html.find('.moveItem').click(this._move.bind(this));
    html.find('.deleteItem').click(this._delete.bind(this));


    // Handle default listeners last so system listeners are triggered first
    super.activateListeners(html);
  }

	prepairDerivedData(itemData)
	{

    //If the item is a class, get the number of starting proficiencies and skill points
		if (itemData.type == "class")
		{
			let attack = itemData.system.baseAttack;
			let vitCont = 0;
			let attCont = 0;
			let _skillPoints = 8;

			//determine starting proficiencies
			if (itemData.system.vitality > 6) 
			{
				vitCont = (itemData.system.vitality == 9) ? 1 : 2;
				_skillPoints = (itemData.system.vitality == 9) ? 6 : 4;
			}
			if (attack != "Low") attCont = (attack == "Medium") ? 1 : 2;
			itemData.system.proficiencies.value = 2 + vitCont + attCont;

			//determine starting skill points
			itemData.system.skillPoints = _skillPoints;
		}
	}

  _prepareOptions(options) 
  {
    if (options == undefined)
      return;

    //create a list of the different skills
    const map = 
    {
      "skills": CONFIG.fantasycraft.skills
    };

    //Go through the list of skills
    for ( let [o, choices] of Object.entries(map) ) 
    {
      const option = options[o];

      if ( !option ) continue;
      
      let values = [];
      
      if ( option.value ) 
      {
        values = option.value instanceof Array ? option.value : [option.value];
      }
      option.selected = values.reduce((obj, o) => 
      {
        obj[o] = choices[o];
        return obj;
      }, 
      {});

      // Add custom entry
      if ( option.custom ) 
      {
        option.custom.split(";").forEach((c, i) => option.selected[`custom${i+1}`] = c.trim());
      }
      
      option.cssClass = !isEmpty(option.selected) ? "" : "inactive";
    }
  }

  _canDragDrop(selector)
  {
    return true;
  }

  async _onDrop(itemData)
  {

    //get the item from the drag event
    itemData = TextEditor.getDragEventData(itemData);
    const itemFromID = await fromUuid(itemData.uuid)
    let droppedItem = {... itemFromID};
    const item = this.item;
    
    //if the dropped item does not have a cost or if this is not a store, return
    if(droppedItem.system?.cost == undefined || item.type != "store")
      return
    
    droppedItem.referenceId = itemData.uuid;

    //figure out if this is going in the shopping cart directly or into a store inventory
    let targetArray = (item.system.freeBuy) ? item.system.shoppingCart : item.system.storeArray;
    let arrayString = (item.system.freeBuy) ? "system.shoppingCart" : "system.storeArray";

    //only the GM can drop into store inventories, return if a player is trying to add an item to a store inventory
    if (!game.user.isGM && !item.system.freeBuy)
      return;

    //if the item already exists in the store, increase the quantity, otherwise add it to the list
    if (targetArray.find(a => (a.name == droppedItem.name && a.system?.itemType != "service")))
    {
      let _item = targetArray.find(a => a.name == droppedItem.name);
      _item.system.quantity += 1;
    }
    else
      targetArray.push(droppedItem);

    //update the item and rerender the sheet
    await item.update({[arrayString]: targetArray});

    this.render(true);
  }

  _magicItemInformation(event)
  {
    event.preventDefault();
    const element = event.currentTarget;
    const effect = element.value;

    // Determine if there should be a lesser/greater option
    let greaterOption = this._getMagicEffectInformation(effect);
    let reputation = 0;

    // Determine the reputation cost of a given trait
    if (!greaterOption)
    {
      //reputation = 
    }    
  }

  _getMagicEffectInformation(effect)
  {
    let greater = ["skillRanks", "storage", "defenseBonus", "accuracyBonus", "damageBonus", "bane", "spellPoints", "spellEffect", "attributeBonus", 
    "acp", "trainedSkill", "alignedDamage", "exoticDamage", "damageAura", "damageResistance", "edgeSurge", "travelSpeed", "saveBonus", "vitality", "wounds", "threatRange"]
    
    return (greater.includes(effect)) ? true: false;
  }

  _spellDistanceCheck(spell)
  {
    let distance = spell.item.system.distance;

    this.item.update({"system.distance.description": "fantasycraft." + distance.value});

    if (distance.value == "personalOrTouch")
      distance.description = "fantasycraft.personalOrTouch"
  }

  _spellDurationCheck(spell)
  {
    let duration = spell.item.system.duration;

    if (duration.value == "instant" || duration.value == "permanent")
      this.item.update({"system.duration.isNotInstantOrPermanent": false});

    if(duration.enduring || duration.dismissable)
      this.item.update({"system.duration.durationKeyword": true});

    if (duration.value == "instant")
      this.item.update({"system.duration.durationText": "fantasycraft.instant"});
    else if (duration.value == "permanent")
      this.item.update({"system.duration.durationText": "fantasycraft.permanent"});
    else if (duration.value == "concentrationAndDuration")
      this.item.update({"system.duration.durationText": "fantasycraft.concentrationAndDuration"});
    else if(duration.value == "concentrationToDuration")
      this.item.update({"system.duration.durationText": "fantasycraft.concentrationToDuration"});
  }

  _spellArea(spell)
  {
    let area = spell.item.system.area;


    if (area.shape == "custom")
      area.customShape = true;

  }

  _spellSaveCheck(spell)
  {
    let save1 = spell.item.system.save;
    let save2 = spell.item.system.save2;

    this.item.update({"system.save.hasSave": (save1.saveType == "none") ? false : true});
    this.item.update({"system.save2.hasSave": (save2.saveType == "none") ? false : true});
  }

	_onTraitSelector(event) 
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.parentElement.querySelector("label");
      const choices = CONFIG.fantasycraft[element.dataset.options];
      const options = { name: element.dataset.target, title: label.innerText, choices };
      new TraitSelector(this.item, options).render(true)
	} 

  _onArmourResistance(event)
  {
    event.preventDefault();
    const element = event.currentTarget;
    const label = element.parentElement.querySelector("label");
    const choices = CONFIG.fantasycraft[element.dataset.options];
    const options = { name: element.dataset.target, title: label.innerText, choices };
    new ArmourResistance(this.item, options).render(true)
  }

  _purchaseItems(event)
  {
    const character = game.user.character; //Get the players character
    if (character == undefined)
    {
      ui.notifications.warn(game.i18n.localize('fantasycraft.Dialog.noCharacterAssigned'));
      return;
    }

    const store = this.item.system;
    let silverPrice = 0;
    let repPrice = 0;
    store.shoppingCart.forEach(function(item){
      if (item.system.currency == "Silver") silverPrice += (item.system.newCost * item.system.quantity);
      if (item.system.currency == "Reputation") repPrice += (item.system.newCost * item.system.quantity); 
    })

    //Make sure the player hasn't set any currency to null
    if (character.system.coin.stake == null) character.system.coin.stake = 0;
    if (character.system.coin.inHand == null) character.system.coin.inHand = 0;
    if (character.system.reputationAndRenown.reputation == null) character.system.reputationAndRenown.reputation = 0

    //Check to see if the player can afford their purchase
    if (character.system.coin.inHand + character.system.coin.stake < silverPrice || character.system.reputationAndRenown.reputation < repPrice)
    {
      ui.notifications.warn(game.i18n.localize('fantasycraft.Dialog.youCantAffordThat'));
      return;
    }

    ////// Take the money //////
    //subtract from the coin in hand first, then from the stake if there was not enough in coin in hand
    if (silverPrice > 0)
      character.system.coin.inHand -= silverPrice;
    if (character.system.coin.inHand < 0)
    {
      character.system.coin.stake += character.system.coin.inHand;
      character.system.coin.inHand = 0;
    }

    if (repPrice > 0)
    {
      character.system.reputationAndRenown.reputation -= repPrice; 
    }

    character.update({"system.coin.stake": character.system.coin.stake});
    character.update({"system.coin.inHand": character.system.coin.inHand});
    character.update({"system.reputationAndRenown.reputation": character.system.reputationAndRenown.reputation});

    ////// Give the items //////
    store.shoppingCart.forEach(function(item){
      if (item.system?.itemType != "service") character.onCreateItemFromStore(item);
    })

    store.shoppingCart = [];

    this.item.update({"system.shoppingCart": store.shoppingCart});

  }

  async _haggleShop(event)
  {
    if(game.user.isGM)
    {
      ui.notifications.warn(game.i18n.localize("GMs cannot, currently, haggle in shops"));
      return;
    }
    const character = game.user.character; //Get the players character
    const level = character.system.careerLevel.value; //get the players level
    const merchantHaggleSkill = CONFIG.fantasycraft.npcSignatureSkills['X'][(level-1)] //get the merchants haggle skill (look at the Haggle table for skill grade X at the players level)
    const store = this.item.system;
    let rollFormula = "1d20 + " + merchantHaggleSkill; // roll a haggle roll for the merchant
    let merchantRoll = new Roll(rollFormula);
    merchantRoll.evaluate({async: false});
  
    let playerRoll = await character.rollSkillCheck("haggle").total;
    let merchantTotal = merchantRoll.total;

    store.hasBeenHaggled = true;

    await this.item.update({"system.hasBeenHaggled": true});

    if (playerRoll == merchantTotal)
      return;

    let difference = playerRoll - merchantTotal;
    let newPrice;

    if (difference >= 10)
      newPrice = 0.5;
    else if (difference >= 7)
      newPrice = 0.6;
    else if (difference >= 4)
      newPrice = 0.8;
    else if (difference >= 1)
      newPrice = 0.9;
    else if (difference >= -3)
      newPrice = 1.1;
    else if (difference >= -6)
      newPrice = 1.2;  
    else if (difference >= -9)
      newPrice = 1.4;
    else
      newPrice = 1.5;

    await this.item.update({"system.pricePercent": newPrice});

    console.log("Merchant Roll: " + merchantTotal)
    this.render(true);
  }

  _resetHaggle(event)
  {
    event.preventDefault();
    this.item.update({"system.hasBeenHaggled": false});
    this.item.update({"system.pricePercent": 1});

    this.render(true)
  }

  _increaseItem(event)
  {
    event.preventDefault();
    this._changeQuantity(event, "up");
  }

  _decreaseItem(event)
  {
    event.preventDefault();
    this._changeQuantity(event, "down");

  }

  _changeQuantity(event, direction)
  {
    const element = event.currentTarget;
    const list = element.parentElement.parentElement.parentElement.parentElement.querySelector("label").innerText;
    const array = (list == "Store") ? this.item.system.storeArray : this.item.system.shoppingCart;
    const itemName = element.parentElement.parentElement.id;
    let string = (list == "Store") ? "system.storeArray" : "system.shoppingCart";
    let quantity = 0;

    //you can't increase the number of mail delivery they own.
    if (direction == "up" && array.find(a => a.name == itemName).system?.itemType == "service")
      return;

    quantity = this._quantity(event, quantity);

    if (direction == "down")
      {
      //if there is exactly 1 of an item when you decrease, just delete the item  
      if (array.find(a => a.name == itemName).system.quantity == 1)
      {
        this._delete(event);
        return;
      }
      //otherwise convert the change value to a negative number
      quantity *= -1;
    }

    //increase or decrease the quantity of the item based on the change value
    array.find(a => a.name == itemName).system.quantity += quantity;
    
    //if this causes a negative number change it to 1. This does not delete to allow the functionality of decreasing something from 87 to 1 if you want it to still be on the list but not go through the trouble of several different key modifiers to get to the right number. 
    if (array.find(a => a.name == itemName).system.quantity < 1)
      array.find(a => a.name == itemName).system.quantity = 1;


    this.item.update({[string]: array});
  }

  _changeShopType(event)
  {
    event.preventDefault();
    const element = event.currentTarget;
    element.checked = true;
    let freeBuy = (element.value == "false") ? false : true;
    this.position.height = (freeBuy) ? 475 : 875;
    this.item.update({"system.freeBuy": freeBuy});
  }

  _quantity(event, quantity)
  {
    //holding shift increases by 5, ctrl by 10, alt by 20 and ctrl+shift by 100
    if (!event?.ctrlKey && event?.shiftKey)
      quantity += 5
    else if (event?.ctrlKey && !event?.shiftKey)
      quantity += 10
    else if (event?.altKey)
      quantity += 20
    else if (event?.ctrlKey && event?.shiftKey)
      quantity += 100
    else
      quantity += 1

      return quantity
  }

  async _move(event)
  {
    event.preventDefault();
    const element = event.currentTarget;
    const list = element.parentElement.parentElement.parentElement.parentElement.querySelector("label").innerText;
    
    //establish our source and destination arrays
    const sourceArray = (list == "Store") ? this.item.system.storeArray : this.item.system.shoppingCart;
    const destinationArray = (list == "Store") ? this.item.system.shoppingCart : this.item.system.storeArray;
    const itemName = element.parentElement.parentElement.id;
    
    //source and destination strings for update later
    const sourceString = (list == "Store") ? "system.storeArray" : "system.shoppingCart";
    const destinationString = (list == "Store") ? "system.shoppingCart" : "system.storeArray";
    
    let newArray = sourceArray;
    let moveQuantity = 0;

    
    //get the item we're moving from the source list.
    let listEntry = sourceArray.find(a => a.name == itemName)
    
    //get the number that we're moving, if that number is greater than the number in the supplying stack, change the move number to to total quantity. 
    moveQuantity = this._quantity(event, moveQuantity);
    if (listEntry.system.quantity < moveQuantity)
      moveQuantity = listEntry.system.quantity

    if ((listEntry.system.quantity == moveQuantity) && (listEntry.system?.itemType != "service" || destinationString == "system.storeArray"))
    {
      newArray = sourceArray.filter(a => a.name != itemName)
    }
    
    //check and see if the receiving list has the same item on it
    let destinationItem = destinationArray.find(a => a.name == itemName)
    if(destinationItem)
    {
      if (destinationItem.system?.itemType != "service")
        destinationItem.system.quantity += moveQuantity;
    }
    else
    {
      destinationArray.push(listEntry)
    }

    if (listEntry.system?.itemType != "service")
      listEntry.system.quantity -= moveQuantity;

    await this.item.update({[sourceString]: newArray})

    if(destinationItem == undefined)
      destinationArray.find(a => a.name == itemName).system.quantity = moveQuantity;

    await this.item.update({[destinationString]: destinationArray})
  }


  _delete(event)
  {
    event.preventDefault();
    const element = event.currentTarget;
    const list = element.parentElement.parentElement.parentElement.parentElement.querySelector("label").innerText;
    let array = (list == "Store") ? this.item.system.storeArray : this.item.system.shoppingCart;
    const itemName = element.parentElement.parentElement.id;
    let string = (list == "Store") ? "system.storeArray" : "system.shoppingCart";
    let newArray = array.filter(a => a.name != itemName)
    this.item.update({[string]: newArray})
  }
}