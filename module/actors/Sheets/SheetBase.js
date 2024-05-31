import TraitSelector from "../../apps/trait-selector.js";
import Resistances from "../../apps/resistances.js";
import MoveSelector from "../../apps/npc-apps/movement-selector.js";
import SkillSelector from "../../apps/npc-apps/npc-skill-selection.js";
import GearDialog from "../../apps/npc-apps/gear-selection.js";
import AttackDialog from "../../apps/npc-apps/attack-selection.js";
import Spellcasting from "../../apps/npc-apps/spellcasting-selection.js";
import TemplateSelector from "../../apps/npc-apps/npc-templates.js";
import Qualities from "../../apps/npc-apps/quality-selection.js";
import Treasure from "../../apps/npc-apps/treasure-selection.js";
import TextField from "../../apps/text-field.js";
import * as Chat from "../../chat.js";
import ActionDiceInfo from "../../apps/action-dice-info.js";

export default class ActorSheetFC extends ActorSheet 
{
    constructor(...args) {
      super(...args);
    }
  
    _filters = {
      spellList: new Set(),
      spellLevels: new Set()
    };
    /* -------------------------------------------- */
  
    /** @override */
    static get defaultOptions() 
    {
      return mergeObject(super.defaultOptions, {
        tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}],
      });
    }
  
    getData()
    {
        const data =
        {
            isCharacter: this.document.type === "character",
            config: CONFIG.fantasycraft
        };

        data.actor = this.actor;
        data.items = this.actor.items.map(i => {
          i.system.labels = i.labels;
          return i.system;
        });
        data.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
        data.data = data.actor.system;
        data.labels = this.actor.labels || {};
        data.filters = this._filters;
        data.collapsed = this._collapsed;

        //Set Labels for 
        this._setLabel(data.data.abilityScores, CONFIG.fantasycraft.abilityScores);   //Ability Modifiers
        this._setLabel(data.data.saves, CONFIG.fantasycraft.savingThrow);             //Saves
        this._setLabel(data.data.movement, CONFIG.fantasycraft.moveType);             //Move
        this._setLabel(data.data.attackTypes, CONFIG.fantasycraft.attackType);        //Attack
        
        if (data.isCharacter) 
        {
          this._setLabel(data.data.skills, CONFIG.fantasycraft.skills);                 //Skills
          this._setLabel(data.data.proficency, CONFIG.fantasycraft.attackProficiency);  //Proficiencies
        }
        if (!data.isCharacter)
        {
          //this._setLabel(data.data.signatureSkills, CONFIG.fantasycraft.npcTraits);
          this._setLabel(data.data.traits, CONFIG.fantasycraft.npcTraits);
        }

        data.mounts = [];
    
        if (data.actor.system.mount)
        {
          for (let [k,v] of Object.entries(data.actor.system.mount))
            data.mounts.push(game.actors.get(v.id));
        }

        return data;
    }

    //for each entry in the character sheet for the thing provided label that entry based on the similar entry in the config file. 
    //This is just to set names.
    _setLabel(charInfo, labels)
    {
      for ( let [n, name] of Object.entries(charInfo)) 
      {
          name.label = labels[n];
      }
    }

    /////////////////////////////////
    /////////// Listeners ///////////
    /////////////////////////////////
    activateListeners(html) 
    {
      // Editable Only Listeners
      if ( this.isEditable ) 
      {
        // Application form windows
        html.find('.action-dice-info').click(this._actionDiceInfo.bind(this));
        html.find('.trait-selector').click(this._onTraitSelector.bind(this));
        html.find('.resistance').click(this._onResistances.bind(this));

        html.find('.movement-selector').click(this._onMovementSelector.bind(this));
        html.find('.npc-templates').click(this._onTemplateSelector.bind(this));
        html.find('.npc-skill-selection').click(this._onSkillSelection.bind(this));
        html.find('.gear').click(this._onGearSelection.bind(this));
        html.find('.attacks').click(this._onAttackSelection.bind(this));
        html.find('.spellcasting').click(this._onSpellcasting.bind(this));
        html.find('.qualities').click(this._onQualities.bind(this));
        html.find('.treasure-selector').click(this._onTreasureSelection.bind(this));

        //Rolls
        html.find('.roll-save').click(this._rollSave.bind(this));
        html.find('.roll-skill').click(this._rollSkill.bind(this));
        html.find('.roll-ad').click(this._rollAD.bind(this));
        html.find('.roll-knowledge').click(this._rollKnowledge.bind(this));
        html.find('.roll-weapon').click(this._rollWeapon.bind(this));
        html.find('.roll-natural-attack').click(this._rollNatural.bind(this));
        html.find('.roll-unarmed').click(this._rollUnarmed.bind(this));
        html.find('.roll-combat-action').click(this._rollCombatAction.bind(this));
        html.find('.roll-damage-save').click(this._rollDamageSave.bind(this));
        html.find('.roll-competence').click(this._rollCompetence.bind(this));
        
      }

      html.find('.addItem').click(this._onAddItem.bind(this));
      html.find('.editItem').click(this._onEditItem.bind(this));
      html.find('.deleteItem').click(this._onItemDelete.bind(this));
      html.find('.openActor').click(this._onEditMount.bind(this));
      html.find('.removeMount').click(this._onRemoveMount.bind(this));
      html.find('.removeContact').click(this._onRemoveContact.bind(this));
      html.find('.levelDown').click(this._onLevelDown.bind(this));
      html.find('.levelUp').click(this._onLevelUp.bind(this));
      html.find('.increaseItem').click(this._onIncreaseQuantity.bind(this));
      html.find('.decreaseItem').click(this._onDecreaseQuantity.bind(this));
      html.find('.readyWeapon').click(this._readyWeapon.bind(this));
      html.find('.equipArmour').click(this._equipArmour.bind(this));
      html.find('.adoptStance').click(this._adoptStance.bind(this));
      html.find('.spellCard').click(this._spellCard.bind(this));
      html.find('.pathChange').change(this._pathChange.bind(this));
      html.find('.item-create').click(this._createItem.bind(this));
      html.find('.roll-treasure').click(this._rollTreasure.bind(this));
      html.find('.open-gm-screen').click(this.openGMScreen.bind(this));
      html.find('.pin-spell').click(this.pinSpell.bind(this));
      html.find('.collapse').click(this.collapseCategory.bind(this));
      
      
      const filterLists = html.find(".filter-list");
      filterLists.each(this._initializeFilterItemList.bind(this));
      html.find('.filter-item').click(this._filterItem.bind(this));
      html.find('.filter-level').click(this._filterItem.bind(this));
      
      
      html.find('.selectStat').change(this._onStatChange.bind(this));
      
      new ContextMenu(html, '.skill-name', this.skillEntry);
      new ContextMenu(html, ".item-card", this.itemContextMenu);
      
      html.find('.fatigueShaken').change(this._fatigueShaken.bind(this));


      // Handle default listeners last so system listeners are triggered first
      super.activateListeners(html);
    }

    
    _initializeFilterItemList(i, ul) {
      const set = this._filters[ul.dataset.filter];
      const filters = ul.querySelectorAll(".filter-item");
      const levelFilters = ul.querySelectorAll(".filter-level");
      for ( let li of filters ) {
        if ( set.has(li.dataset.filter) ) li.classList.add("active");
      }
      for ( let li of levelFilters ) {
        if ( set.has(li.dataset.filter) ) li.classList.add("active");
      }
    }

    async _onDropItemCreate(itemData)
    {
      let act = this.actor;

      if (itemData.type == "spell")
      {
        let hasSpell = act.itemTypes.spell.find(c => c.name == itemData.name);
        
        if (!!hasSpell)
          return;
      }

      super._onDropItemCreate(itemData);
    }

    //This allows the dropdown menu to edit and delete feats.
    itemContextMenu = 
    [
      {
        name: game.i18n.localize("fantasycraft.chat"),
        icon: '<i class="fas fa-comment"></i>',
        callback: element =>
        {
          Chat.linkOptionFromContextMenu(element, this.actor);
        }
      },
      {
        name: game.i18n.localize("fantasycraft.edit"),
        icon: '<i class="fas fa-edit"></i>',
        callback: element =>
        {
          const item = this.actor.items.get(element.data("item-id"));
          item.sheet.render(true);
        }
      },
      {
        name: game.i18n.localize("fantasycraft.delete"),
        icon: '<i class="fas fa-trash"></i>',
        callback: element =>
        {
          if (this.actor.getFlag("fantasycraft", element.data("item-name")))
            this.actor.unsetFlag("fantasycraft", element.data("item-name"));

          this._onItemDelete(element, element.data("item-id"));
        }
      }
    ];

    //open the journal page for a skill
    skillEntry = 
    [
      {
        name: game.i18n.localize("fantasycraft.journal"),
        icon: '<i class="fas fa-edit"></i>',
        callback: async element =>
        {
          const skill = element[0].innerText.substring(0, element[0].innerText.indexOf('J')-1);

          let journalID = (skill == "Spellcasting") ? "Compendium.fantasycraft.rules.A41GzaLNJEIo8o5H" : "Compendium.fantasycraft.rules.7pCAJJG6pugfqZE4"
          let journal = await fromUuid(journalID);
          journal.sheet.render(true, {pageId: journal.pages.getName(skill).id})
        }
      }

    ];

    //overwrite ondropactor to allow an ID reference to Mounts
    async _onDropActor(event, data)
    {
      const docType = getDocumentClass("Actor");
      const newActor = await docType.fromDropData(data); 

      let isMount = await this.configureMountorContact();

      //if the receiving actor is an NPC or the above selection was "mount", place the dropped actor ID into mounts.
      if (this.actor.type == "npc" || isMount)
      {
        this._collectMountAndContactInformation("mount", "system.mount", newActor);
      }  
      else if (this.actor.type =="character" && !isMount)
      {
        this._collectMountAndContactInformation("contacts", "system.contacts", newActor);    
      }
    }

    async configureMountorContact()
    {
      //if the receiving actor is a player character ask the player if they want to create a mount or a contact.
      if (this.actor.type == "character")
      {
        // Create and render the Dialog
        return new Promise (resolve => {
          new Dialog({
            title: game.i18n.localize("fantasycraft.isMount"),
            content: "Is this a mount or a contact?",
            buttons: {
              Mount: {
                label: game.i18n.localize("fantasycraft.mount"),
                callback: () => resolve(true)
              },
              Contact: {
                label: game.i18n.localize("fantasycraft.contact"),
                callback: () => resolve(false)
              }
            }
          }).render(true);
        })
      }
    }

    //Function to check if the dropped actor is already attached to the character and if not add them to the respective array
    async _collectMountAndContactInformation(actorType, updateString, newActor)
    {
      let duplicateCheck = this.actor.system[actorType].filter(function(item) {return item.id == newActor._id})
      if (duplicateCheck.length > 0)
        return;

      let actorInfo = {
        "name": newActor.name,
        "id": newActor._id
      }
      let actorDest = this.actor.system[actorType];
      actorDest.push(actorInfo);
      await this.actor.update({[updateString]: actorDest});
    }

    _actionDiceInfo(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const options = { name: element.dataset.target, title: "Action Dice Info", choices: [] };
      new ActionDiceInfo(this.actor, options).render(true);
    }
    
    _onResistances(event) 
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.parentElement.querySelector("label");
      const choices = CONFIG.fantasycraft[element.dataset.options];
      const options = { name: element.dataset.options, title: "Resistances", choices };
      new Resistances(this.actor, options).render(true);
    }

    _onTraitSelector(event) 
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.parentElement.querySelector("label");
      const choices = CONFIG.fantasycraft[element.dataset.options];
      const options = { name: element.dataset.target, title: label.innerText, choices };
      new TraitSelector(this.actor, options).render(true);
    } 
  
    _onMovementSelector(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.parentElement.querySelector("label");
      const choices = CONFIG.fantasycraft[element.dataset.options];
      const options = { name: element.dataset.target, title: label.innerText, choices };
      new MoveSelector(this.actor, options).render(true);
    }

    _onTemplateSelector(event)
    {
      let options = this._handleEvents(event);
      new TemplateSelector(this.actor, options).render(true);
    }

    _onSkillSelection(event)
    {
      let options = this._handleEvents(event);
      new SkillSelector(this.actor, options).render(true);
    }

    _onGearSelection(event)
    {      
      let options = this._handleEvents(event);
      new GearDialog(this.actor, options).render(true);
    }

    _onAttackSelection(event)
    {      
      let options = this._handleEvents(event);
      new AttackDialog(this.actor, options).render(true);
    }

    _onSpellcasting(event)
    {
      let options = this._handleEvents(event);
      new Spellcasting(this.actor, options).render(true);
    }

    _onQualities(event)
    {
      let options = this._handleEvents(event);
      new Qualities(this.actor, options).render(true);
    }

    _onTreasureSelection(event)
    {
      let options = this._handleEvents(event);
      new Treasure(this.actor, options).render(true);
    }

    _handleEvents(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.childNodes[0];
      const choices = CONFIG.fantasycraft[element.dataset.options];
      const options = { name: element.dataset.target, title: label.innerText, choices };
      return options;
    }

    _onAddItem(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.parentElement.querySelector("label");
      const options = { name: element.dataset.target, title: label.innerText}
      new TextField(this.actor, options).render(true)
    }

    //deletes the item removing it from the character
    async _onItemDelete(event, id="")
    {
      let item;
      if (id == "")
      {
        event.preventDefault();
        let element = event.currentTarget;
        item = element.closest(".item").dataset;
      }
      else 
      {
        let thisItem = this.actor.items.find(item => item._id == id)
        item = {itemName: thisItem.name, itemId: id}
      }

      let isClass = !!this.actor.itemTypes.class.find(c => c.name == item.itemName);
      if (isClass)
      {
        this._deleteClassFeatures(this.actor.itemTypes.class.find(c => c.name == item.itemName))
      }

      //checks to see if this item had set a flag and unsets it needed.
      if (this.actor.getFlag("fantasycraft", item.itemName))
        this.actor.unsetFlag("fantasycraft", item.itemName)

      await this.actor.deleteEmbeddedDocuments("Item", [item.itemId]);
    }

    async _onEditItem(event)
    {
      event.preventDefault();
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      return item.sheet.render(true);  
    }

    async _onEditMount(event)
    {
      event.preventDefault();
      const li = event.currentTarget.closest(".actor");
      const actor = game.actors.get(li.dataset.actorId);
      return actor.sheet.render(true);  
    }

    async _onRemoveMount(event)
    {
      event.preventDefault();
      const li = event.currentTarget.closest(".actor");

      this.actor.removeItemFromArray("mount", li)
    }

    async _onRemoveContact(event)
    {
      event.preventDefault();
      const li = event.currentTarget.closest(".actor");

      this.actor.removeItemFromArray("contacts", li)
    }

    //if level is 1 delete the class, else reduce the level by 1
    async _onLevelDown(event)
    {
      event.preventDefault();
      let element = event.currentTarget;
      let itemID = element.closest(".item");
      const clss = this.actor.itemTypes.class.find(c => c.name == itemID.dataset.itemName);

      //find the features of the level being removed and either delete them or reduce their number by 1
      let features = await ActorSheetFC.getClassFeatures({className: clss.name, level: clss.system.levels, priorLevel: clss.system.levels - 1, actor: this.actor});
      this._reduceOrRemoveFeatures(features);

      if (clss.system.levels == 1)
      {
        return this._onItemDelete(event);
      }
      else
      {
        let last = clss.system.levels - 1;
        clss.system.levels = last;
        await clss.update({"system.levels": last});
      }
    }

    async _deleteClassFeatures(cls)
    {
      let features = {};

      for (let i = cls.system.levels; i >= 0; i--)
      {
        features = await ActorSheetFC.getClassFeatures({className: cls.name, level: i, priorLevel: i - 1});
        for (let j = features.length - 1; j >= 0; j--)
        {
            let feature = this.actor.itemTypes.feature.find(f => f.name == features[j].name)
          
            await this.actor.deleteEmbeddedDocuments("Item", [feature._id]);
        }
      }      
    }

    //check the features against what the character has, if they have more than 1 of the feature, reduce it by 1, otherwise delete it.
    async _reduceOrRemoveFeatures(features)
    {
      const act = this.actor;

      for (let i = features.length - 1; i >= 0; i--)
      {
        let feature = act.itemTypes.feature.find(f => f.name == features[i].name)
        if(!feature) continue;

        if (feature.system.number > 1)
          await feature.update({"system.number": feature.system.number - 1});
        else 
        {
          await act.deleteEmbeddedDocuments("Item", [feature._id]);
        }
      }
    }

    //if level is 20, do nothing, otherwise, level up
    async _onLevelUp(event)
    {
      event.preventDefault();

      let element = event.currentTarget;
      const act = this.actor;
      const clss = act.itemTypes.class.find(c => c.name == element.closest(".item").dataset.itemName);
      let priorLevel = clss.system.levels;
      let maxLevel = 20;
      let classCap;

      //if the class is a base class max level is 20, if it is exper it's 10 and if it's a master class the max level is 5
      if (clss.system.classType != "base")
        classCap = (clss.system.classType == "expert") ? 10 : 5;

      const next = (act.system.careerLevel.value == maxLevel || clss.system.levels == classCap) ? 0 : priorLevel + 1;
      
      if (next > priorLevel)
      {
        clss.system.levels = next;
        await clss.update({"system.levels": next});
        let features = await ActorSheetFC.getClassFeatures({className: clss.name, level: clss.system.levels, priorLevel: priorLevel, actor: act});
        let clsConfig = await ActorSheetFC.findAndReturnConfigInfo({name: clss.name, type: CONFIG.fantasycraft.classFeatures})

        if (clsConfig.hasESlotChoice) 
        {
          if ((next != 3 && next % 3 == 0 && (clss.name != "Keeper" || clss.name != "Deadeye") ) || (clss.name == "Keeper" && ((next-1) % 4 == 0)) || (clss.name == "Deadeye" && (next == 4 || next == 6 || next == 8)))
          {
            let eSlotFeature = await this.getESlotFeature(clsConfig);
            let newFeature = await Promise.all(eSlotFeature.map(id => fromUuid(id)));
            features = features.concat(newFeature);
          }
        }

        features = this.checkFeaturesForDoubles(features);

        if(features.length != 0)
          await act.createEmbeddedDocuments("Item", [features[0]]);
      }
    }

    async getESlotFeature(clsConfig)
    {
      const content = await renderTemplate("systems/fantasycraft/templates/chat/dropdownDialog.hbs", {
        options: clsConfig.eSlot
        });
        
      return new Promise(resolve => {
        new Dialog({
            title: "Feature Select",
            content,
            buttons: {
            accept: {
                label: game.i18n.localize("fantasycraft.accept"),
                callback: html => resolve(this.actor.returnSelection(html))
            }
            },
            close: () => resolve(null)
        }).render(true);
      });
    }


    async _onIncreaseQuantity(event)
    {
      event.preventDefault();

      let element = event.currentTarget;
      const act = this.actor;
      const item = act.items.find(c => c.name == element.closest(".item").dataset.itemName);
      let newValue = item.system.quantity;

      //holding shift decreases by 5, ctrl by 10, alt by 20 and ctrl+shift by 100
      if (!event?.ctrlKey && event?.shiftKey)
        newValue += 5
      else if (event?.ctrlKey && !event?.shiftKey)
        newValue += 10
      else if (event?.altKey)
        newValue += 20
      else if (event?.ctrlKey && event?.shiftKey)
        newValue += 100
      else
        newValue += 1

      await item.update({"system.quantity": newValue});
    }

    async _onDecreaseQuantity(event)
    {
      event.preventDefault();

      let element = event.currentTarget;
      const act = this.actor;
      const item = act.items.find(c => c.name == element.closest(".item").dataset.itemName);
      let newValue = item.system.quantity;

        //holding shift decreases by 5, ctrl by 10, alt by 20 and ctrl+shift by 100
      if (!event?.ctrlKey && event?.shiftKey)
        newValue -= 5
      else if (event?.ctrlKey && !event?.shiftKey)
        newValue -= 10
      else if (event?.altKey)
        newValue -= 20
      else if (event?.ctrlKey && event?.shiftKey)
        newValue -= 100
      else
        newValue -= 1

      await item.update({"system.quantity": newValue});

      if (item.system.quantity < 1)
        this._onItemDelete(event);
    }

    async _fatigueShaken(event)
    {
      let element = event.currentTarget;
      const act = (element.name.includes("fatigue")) ? this.actor.system.fatigue : this.actor.system.shaken;
      if (element.checked == false)
      {  
        for (let i = parseInt(element.name.slice(-1)); i <= 4; i++)
        {
          let updateString = (element.name.includes("fatigue")) ? "system.fatigue" : "system.shaken";
          updateString += "." + Object.keys(act)[i-1];
          await this.actor.update({[updateString]: false});
        }
      }
      else if (element.checked == true)
      {  
        for (let i = parseInt(element.name.slice(-1)); i > 0; i--)
        {
          let updateString = (element.name.includes("fatigue")) ? "system.fatigue" : "system.shaken";
          updateString += "." + Object.keys(act)[i-1];
          await this.actor.update({[updateString]: true});
        }
      }
      
      let newValue = parseInt(element.name.slice(-1));
      if (element.checked)
      {
        let updateString = "system.conditions."
        updateString += (element.name.includes("fatigue")) ? "fatigued" : "shaken";
        await this.actor.update({[updateString]: newValue});
      }
      else 
      {
        newValue--
        let updateString = "system.conditions."
        updateString += (element.name.includes("fatigue")) ? "fatigued" : "shaken";
        await this.actor.update({[updateString]: newValue});
      }

      if (element.name.includes("fatigue"))
      {
        if (this.actor.system.conditions.fatigued > 0)
          this.actor.applyCondition("fatigued");
        else 
          this.actor.removeCondition("fatigued");
      }
      else if (element.name.includes("shaken"))
      {
        if(this.actor.system.conditions.shaken > 0)
          this.actor.applyCondition("shaken");
        else 
          this.actor.removeCondition("shaken");
      }
    }

    async _readyWeapon(event)
    {
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      
      if (item.system.readied)
      {
        item.update({'system.readied': false});
        this.render(true)
        return;
      }
      if (this.actor.type == "npc")
      {
        await item.update({'system.readied': true});
        this.render(true);
        return;
      }

      const readiedWeapons = this.actor.items.filter(item => item.type == "weapon" && item.system.readied)
      const hands = this.actor.system.hands;
      // check if the character is in a stance that reduces the number of hands required for 1 two handed weapon
      const titans = this.actor.items.filter(item => (item.system.effect1?.effect == "reduceHandRequirement" || item.system.effect2?.effect == "reduceHandRequirement") && item.system.inStance);

      let handsUsed = 0;


      if (readiedWeapons.length > 0)
      {
        if (titans.length > 0)
          readiedWeapons.find(item => item.system.size.hands == "2h").system.size.hands = "1h";

        for (let weapon of readiedWeapons)
        {
          handsUsed += (weapon.system.size.hands == "2h") ? 2 : 1;
        }
      }

      if (hands > handsUsed)
      {
        if ((hands - handsUsed) >= parseInt(item.system.size.hands.slice(0, 1)))
          item.update({'system.readied': true});
      }
      
      this.render(true);
    }

    async _equipArmour(event)
    {
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);

      if (item.system.equipped)
      {
        item.update({'system.equipped': false});
        this.render(true)
        return;
      }

      const equippedArmour = this.actor.items.filter(item => item.type == "armour" && item.system.equipped)

      if (equippedArmour.length > 0)
        return;

      item.update({'system.equipped': true});
      this.render(true);
    }

    async _adoptStance(event)
    {
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);

      // If you are already in this stance change out get out of the stance and remove the active effect
      if (item.system.inStance)
      {
        item.update({'system.inStance': false});

        this.actor.removeCondition("stance")
        this.render(true);
        return;
      }

      const inStance = this.actor.items.filter(item => item.type == "stance" && item.system.inStance);

      //if you're already in a different stance, return;
      if (inStance.length > 0)
        return;

      item.update({'system.inStance': true});
      
      this.actor.applyCondition("stance");
      this.render(true);
    }

    //For origin ability scores that can change, called when dropdown menu is changed.
    async _onStatChange(event)
    {
      const id = event.target.id;                         //which stat we're pulling from in the ancestry. (stat1, stat2 etc...)
      const value = event.target.value;                   //What the new selection is.
      const act = this.actor;                             // reference to the actor
      const abilityScores = act.system.abilityScores;     //reference to the ability scores of the actor
      const anst = act.itemTypes.ancestry.find(c => c.name ==  event.currentTarget.closest(".item").dataset.itemName);
      const stat = anst.system.stats
      
      let abilityString = "system.abilityScores." + stat[id].ability + ".value";
      let newAbility = "system.abilityScores." + value + ".value";
      let ancestryChange = "system.stats." + id + ".ability";
      await act.update({[abilityString]: abilityScores[stat[id].ability].value - stat[id].value, [newAbility]: abilityScores[value].value + stat[id].value});

      await anst.update({[ancestryChange]: value});
    }

    // Get the configuration of features which may be added
    static async findAndReturnConfigInfo({name="", type})
    {
      return type[name.toLowerCase()];
    }

    // Function to return the features for a given origin (ancestry, talent or specialty)
    static async getOriginFeatures({originName=""})
    {
      const ognConfig = await ActorSheetFC.findAndReturnConfigInfo({name: originName, type: CONFIG.fantasycraft.originFeatures})
      if (!ognConfig) return [];

      let ids = [];
      for ( let [l, f] of Object.entries(ognConfig.features || {}) ) {
        ids = ids.concat(f);
      }

      // Load item data for all identified features
      const features = await Promise.all(ids.map(id => fromUuid(id)));

      return features;
    }

    // Function to return the features for a given origin (ancestry, talent or specialty)
    static async getSkillOrStats({originName="", searchObject="skill"})
    {
      const ognConfig = await ActorSheetFC.findAndReturnConfigInfo({name: originName, type: CONFIG.fantasycraft.originFeatures})
      if (!ognConfig) return [];

      //Determine where in the feature block to pull information from
      if (searchObject == "attribute") searchObject = ognConfig.attributes;
      else if (searchObject == "skill") searchObject = ognConfig.practiced;
      else if (searchObject == "paired") searchObject = ognConfig.paired;
      else if (searchObject == "feat") searchObject = ognConfig.expert;

      let ids = [];
      for ( let [l, f] of Object.entries(searchObject || {}) ) {
        ids = ids.concat(f);
      }

      return ids;
    }    

    // Function to return the features for a given class level
    static async getClassFeatures({className="", level=1, priorLevel=0, actor=null}={}) 
    {
      const clsConfig = await ActorSheetFC.findAndReturnConfigInfo({name: className, type: CONFIG.fantasycraft.classFeatures})
      if (!clsConfig) return [];
  
      // Acquire class features
      let ids = [];
      for ( let [l, f] of Object.entries(clsConfig.features || {}) ) {
        l = parseInt(l);

        if ( (l <= level) && (l > priorLevel) ) ids = ids.concat(f);
      }

      // Load item data for all identified features
      const features = await Promise.all(ids.map(id => fromUuid(id)));
  
      return features;
    }

    checkFeaturesForDoubles(featureList)
    {
      // Check to see if the character already has something with the same name
      // if they do add 1 to the number owned of that feature and remove that id from the array
      for (let i = featureList.length - 1; i >= 0; i--)
      {
        let feature = this.actor.itemTypes.feature.find(c => c.name == featureList[i].name)
        if (feature)
        {
          //increase the number on the feature on the actor
          this._increaseItemCount(feature);
                    
          //remove the feature from the featureList.
          featureList.splice(i, 1);
        }
      }

        return featureList;
    }

    async _increaseItemCount(item)
    {
      await item.update({"system.number": item.system.number + 1});
    }

    // Function to return the feat for a given specialty
    static async getFeat({specialtyName="",}={}) 
    {
      const spcConfig = await ActorSheetFC.findAndReturnConfigInfo({name: specialtyName, type: CONFIG.fantasycraft.originFeatures})
      if (!spcConfig) return [];
  
      // Acquire the feat from the specialty
      let id = spcConfig.feat;

      // Load item data for all identified features
      const features = await Promise.resolve(fromUuid(id));
  
      return features;
    }

    ////Dice functions////
    _rollSave(event) 
    {
      let text = event.currentTarget.outerText;
      if(text == "Shield Block" || text == "Arrow Cutting" || text == "Parry")
      {
        this.actor.rollSavingThrow(event.currentTarget.dataset.rollInfo, text.toLowerCase());  
      }
      else 
        this.actor.rollSavingThrow(event.currentTarget.dataset.rollInfo);
    }

    _rollSkill(event)
    {
      event.preventDefault();
      const skill = event.currentTarget.closest("[data-skill]").dataset.skill;
      return this.actor.rollSkillCheck(skill, {event: event});
    }
  
    _rollAD(event) 
    {
      const act = this.actor;
      let diceSize = event.currentTarget.dataset.diceSize;
      let explodesOn = (act.getFlag("fantasycraft", "Lady Luck's Smile")) ? ">=" + (diceSize - 1) : diceSize;
      let rollFormula = "d" + diceSize + "x" + explodesOn;
      let grace = act.items.find(item => item.name == game.i18n.localize("fantasycraft.graceUnderPressure"))?._id
      let fortune = act.items.find(item => item.name == game.i18n.localize("fantasycraft.fortuneFavorsTheBold"))?._id

      //Check to see if the character has any flags that modify AD, if so add to the roll formula
      if (fortune != undefined)
          rollFormula += " + @fortuneFavors";
      
      if (grace != undefined)
          rollFormula += " + @graceUnderPressure";
  
      let rollData = 
      {
          fortuneFavors: (act.items.get(fortune)) ? 2 : 0,
          graceUnderPressure:  (act.items.get(grace)) ? 2 : 0
      };
  
      let messageData = 
      {
          speaker: ChatMessage.getSpeaker()
      }
  
      new Roll(rollFormula, rollData).toMessage(messageData);    
    }

    _rollKnowledge(event)
    {
      const act = this.actor.system;
      const rollFormula = "1d20 + @studies + @attributeBonus + @miscBonus"
      
      let rollData = 
      {
          studies: act.knowledge.studies,
          attributeBonus: Math.floor((act.abilityScores.intelligence.value-10)/2),
          miscBonus: act.knowledge.misc
      }
  
      let messageData = 
      {
          speaker: ChatMessage.getSpeaker()
      }
  
      new Roll(rollFormula, rollData).toMessage(messageData);    }

    _spellCard(event, spellName = null, macro = false)
    {
      event.preventDefault();
      const li = (macro) ? null : event.currentTarget.closest("[data-item-id]");
      const spell = (macro) ? this.actor.items.get(spellName) : this.actor.items.get(li.dataset.itemId);

      Chat.spellCard(spell, this.actor);
    }

    _pathChange(event)
    {
      event.preventDefault();
      const newValue = event.currentTarget.value;
      const pathID = event.currentTarget.dataset.itemId;

      const path = this.actor.items.get(pathID);

      path.update({"system.pathStep": parseInt(newValue)}) 
    }

    _rollTreasure(event)
    {
      event.preventDefault();
      const act = this.actor.system;
      const treasure = act.treasure;
      let rollFormula = "1d20 + " + act.threat + " + " + act.treasureRollMod; 
      
      for (let tr of Object.entries(treasure))
      {
        if (tr[1].value > 0)
        {
          let table = game.tables.getName("Table 7.11: Any");

          table.draw({roll: new Roll(rollFormula)});
        }
      }
    }

    _createItem(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const type = element.dataset.type;
      let itemName = "attack";

      if (type == "attack")
        itemName = game.i18n.localize("fantasycraft.claw")
      else if (type == "weapon")
        itemName = game.i18n.localize("fantasycraft.newWeapon")
      else if (type == "general")
        itemName = game.i18n.localize("fantasycraft.newItem")
  
      const itemData = {
        name: itemName,
        type: type,
        system: foundry.utils.expandObject({ ...element.dataset })
      };
      delete itemData.system.type;

      if (type == "attack")
      {
        itemData.system.naturalAttack = "claw"
      }
      else if (type == "general")
        itemData.system.itemType = "good"
      
      return this.actor.createEmbeddedDocuments("Item", [itemData]);
      }

    _filterItem(event)
    {
      event.preventDefault();
      const li = event.currentTarget;
      const set = this._filters[li.parentElement.dataset.filter];
      const filter = li.dataset.filter;

      if (filter == "all" && set.has(filter))
      {
        set.clear();
        return this.render();
      }
      else if (filter == "all" && !set.has(filter))
      {
        let allFilters = Array.from(li.parentElement.children);
        let mass = allFilters.map(i => i.dataset.filter);

        mass.forEach(item => set.add(item))
        return this.render();
      }
      else if(filter != "all" && set.size == 0)
      {
        let allFilters = Array.from(li.parentElement.children);
        let mass = allFilters.map(i => i.dataset.filter);

        mass.forEach(item => set.add(item))
      }
      if ( set.has(filter) ) set.delete(filter);
      else set.add(filter);
      return this.render();
    }

    _rollWeapon(event)
    {
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      const skipInputs = event?.shiftKey;
      this.actor.rollWeaponAttack(item, skipInputs)
    }

    _rollNatural(event)
    {
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);
      const skipInputs = event?.shiftKey;
      this.actor.rollNaturalAttack(item, skipInputs)
    }

    _rollUnarmed(event)
    {
      const skipInputs = event?.shiftKey;
      this.actor.rollUnarmedAttack(null, skipInputs)
    }

    _rollCombatAction(event)
    {
      const action = event.currentTarget.innerText;
      
      this.actor.rollCombatAction(action.toLowerCase())
    }

    _rollDamageSave(event)
    {      
      if (this.actor.type == "npc")        
        this.actor.npcDamageSave(0, true)
    }

    _rollCompetence(event)
    {      
      this.actor.rollCompetence();
    }

    async openGMScreen(event)
    {
      (await import(
        '../../../module/apps/gm-screen.js'
        )
      ).default();
    }

    async pinSpell(event)
    {
      const li = event.currentTarget.closest(".item");
      const item = this.actor.items.get(li.dataset.itemId);

      if (item.system.pinned)
      {
        item.update({'system.pinned': false});
        this.render(true)
        return;
      }

      item.update({'system.pinned': true});
    }
    
    _collapsed = new Set();

    async collapseCategory(event)
    {
      const li = event.target

			if (!li.parentNode.open) {
				this._collapsed.add(li.dataset.collapseId);
			} else {
				this._collapsed.delete(li.dataset.collapseId);
			};
    }

}