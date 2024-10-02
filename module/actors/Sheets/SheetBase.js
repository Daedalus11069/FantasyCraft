import TraitSelector from "../../apps/trait-selector.js";
import Resistances from "../../apps/resistances.js";
import LevelUp from "../../apps/level-up.js";
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
import {getClassFeatures, playerLevelUp} from "../../level-up-functions.js";
import PathBonuses from "../../apps/path-bonuses.js";

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
      return foundry.utils.mergeObject(super.defaultOptions, {
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
        html.find('.nextLevel').click(this._onNextLevel.bind(this));

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
      html.find('.path-bonus').click(this._getPathBonus.bind(this));
      html.find('.item-create').click(this._createItem.bind(this));
      html.find('.roll-treasure').click(this._rollTreasure.bind(this));
      html.find('.open-gm-screen').click(this.openGMScreen.bind(this));
      html.find('.pin-spell').click(this.pinSpell.bind(this));
      html.find('.coin-transfer').click(this._coinTransfer.bind(this));
      
      
      const filterLists = html.find(".filter-list");
      filterLists.each(this._initializeFilterItemList.bind(this));
      html.find('.filter-item').click(this._filterItem.bind(this));
      html.find('.filter-level').click(this._filterItem.bind(this));
      
      
      html.find('.selectStat').change(this._onStatChange.bind(this));
      
      new ContextMenu(html, '.skill-name', this.skillEntry);
      new ContextMenu(html, ".item-card", this.itemContextMenu);
      
      html.find('.fatigueShaken').click(this._fatigueShaken.bind(this));


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

      
      if (itemData.type == "spell" || itemData.type == "path")
      {
        if (act.items.filter(i => i.type == "path").length > 3)
          return;
        
        let hasFeature = act.items.find(c => c.name == itemData.name);
        
        if (!!hasFeature)
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
        "xp": newActor.system.xp,
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
      let features = await getClassFeatures({className: clss.name, level: clss.system.levels, priorLevel: clss.system.levels - 1, actor: this.actor});
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
        features = await getClassFeatures({className: cls.name, level: i, priorLevel: i - 1});
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

    async _onNextLevel(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const options = { title: "Level Up" };
      new LevelUp(this.actor, options).render(true);
    }

    //if level is 20, do nothing, otherwise, level up
    async _onLevelUp(event)
    {
      event.preventDefault();
      
      playerLevelUp(event, this.actor);
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

    async _updateGradedCondition(conditionGrade, element)
    {
      let conditionName = conditionGrade.substring(0, conditionGrade.length - 1);
      const act = this.actor.system[conditionName];
      let updateString;
      let direction = (act[conditionGrade]) ? 1 : -1;
      let gradeNum = parseInt(conditionGrade.slice(-1));

      //dynamically adjusted for loop

      for (let i = (direction == 1) ? 4 : 0 ; (direction == 1) ? i >= gradeNum : i <= gradeNum; i += -direction)
      {
        updateString = "system." + conditionName;
        if (Object.keys(act)[i-1] == undefined) continue;
        updateString += "." + Object.keys(act)[i-1];

        (act[conditionGrade] == true) ? await this.actor.update({[updateString]: false}) : await this.actor.update({[updateString]: true});
      }

      if (!element.checked)
        gradeNum--;

      updateString = "system.conditions.";
      updateString += (element.name.includes("fatigue")) ? "fatigued" : conditionName;
      await this.actor.update({[updateString]: gradeNum});

      if (conditionName == "fatigue") conditionName = "fatigued";

      if (this.actor.system.conditions[conditionName] > 0)
        this.actor.applyCondition(conditionName);
      else 
        this.actor.removeCondition(conditionName);
    }

    async _fatigueShaken(event)
    {
      let element = event.currentTarget;
      this._updateGradedCondition(element.dataset.grade, element);
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
      const element = event.currentTarget.closest("[data-skill]")
      const skill = element.dataset.skill;
      return this.actor.rollSkillCheck(skill);
    }
  
    _rollAD(event) 
    {
      const act = this.actor;
      let diceSize = event.currentTarget.dataset.diceSize;
      let explodesOn = (act.getFlag("fantasycraft", "Lady Luck's Smile")) ? ">=" + (diceSize - 1) : diceSize;
      let rollFormula = "d" + diceSize + "x" + explodesOn;
      let grace = act.items.find(item => item.name == game.i18n.localize("fantasycraft.graceUnderPressure"))?._id
      let fortune = act.items.find(item => item.name == game.i18n.localize("fantasycraft.fortuneFavorsTheBold"))?._id
      let pathOfFortune = act.items.find(item => item.name == game.i18n.localize("fantasycraft.pathOfFortune"));

      //Check to see if the character has any flags that modify AD, if so add to the roll formula
      if (fortune != undefined)
          rollFormula += " + @fortuneFavors";
      
      if (grace != undefined)
          rollFormula += " + @graceUnderPressure";
        
      if (pathOfFortune != undefined && pathOfFortune.system.pathStep >= 3)
        rollFormula += " + @pathOfFortune";
  
      let rollData = 
      {
          fortuneFavors: (act.items.get(fortune)) ? 2 : 0,
          graceUnderPressure: (act.items.get(grace)) ? 2 : 0,
          pathOfFortune: (pathOfFortune != undefined && pathOfFortune.system.pathStep >= 3) ? pathOfFortune.system.pathStep : 0
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
      
      if (path.system.pathStep > parseInt(newValue))
        this._getPathFeature(path, parseInt(newValue), "down");
      else 
        this._getPathFeature(path, parseInt(newValue), "up");


      path.update({"system.pathStep": parseInt(newValue)}) 
    }

    async _getPathBonus(event)
    {
      const element = event.currentTarget;
      const item = element.closest(".item");
      const pathName = item.dataset.itemName;
      const pathID = item.dataset.itemId;
      const path = this.actor.items.get(pathID);
      const options = { name: pathName, title: "Path Bonuses", choices: {path: path}};

      new PathBonuses(this.actor, options).render(true);
    }
    

    /**
     * Get the features from a path step and grant spells, feats, tricks, class features, and other qualities to the actor
     * @param {*} path Divine Path
     * @param {int} newStep The new step of the path
     * @param feature1 First feature of a path step
     * @param feature2 Second feature of a path step
     */
    async _getPathFeature(path, newStep, direction)
    {
      const act = this.actor;
      let x = (direction == "up") ? newStep : path.system.pathStep;
      let y = (direction == "up") ? path.system.pathStep + 1 : newStep + 1;

      for (let i = y; i <= x; i++)
      {
        let feature1 = path.system["step" + i].effect1;
        let feature2 = path.system["step" + i].effect2;
        //damageImmunity: "fantasycraft.damageImmunity", 
        
        if (feature1 == "attributeBonus" || feature2 == "attributeBonus")
        {
          let value = (feature1 == "attributeBonus") ? path.system["step" + i].value1 : path.system["step" + i].value2;
          if (direction == "down") value = -value;
          let attribute = (feature1 == "attributeBonus") ? path.system["step" + i].target1 : path.system["step" + i].target2;
          
          let updateString = "system.abilityScores." + attribute + ".value";
          let newValue = act.system.abilityScores[attribute].value + value;
          act.update({[updateString]: newValue});
        }
        
        //TODO: convertDamage
        if (feature1 == "convertDamage" || feature2 == "convertDamage")
        {
          if (direction == "up")
            this.actor.setFlag("fantasycraft", "convertDamage");
          else
            this.actor.unsetFlag("fantasycraft", "convertDamage");
        }
        
        if (feature1 == "spell" || feature1 == "feat" || feature1 == "classAbility" || feature1 == "npcOrOriginFeature" || feature1 == "trick" )
        {
          if (direction == "up")
          {
            feature1 = await fromUuid(path.system["step" + i].target1);
            let double = act.items.find(item => item.name == feature1.name)
            if (double == undefined)
              await act.createEmbeddedDocuments("Item", [feature1]);
          }
          else 
          {
            feature1 = act.items. find(item => item.name == path.system["step" + i].value1);
            await act.deleteEmbeddedDocuments("Item", [feature1._id]);
          }
        }

        if (feature2 == "spell" || feature2 == "feat" || feature2 == "classAbility" || feature2 == "npcOrOriginFeature" || feature2 == "trick" )
        {
          if (direction == "up")
          {
            feature2 = await fromUuid(path.system["step" + i].target2);
            if (!act.items.find(item => item.name == feature2.name))
              await act.createEmbeddedDocuments("Item", [feature2]);
          }
          else 
          {
            feature2 = act.items.find(item => item.name == path.system["step" + i].value2);
            if (feature2 == undefined)
              continue;
            await act.deleteEmbeddedDocuments("Item", [feature2._id]);
          }
        }
      }
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

      _coinTransfer(event)
      {
        event.preventDefault();

        let actor = this.actor;

        //convert coin in hand to stake
        if (actor.system.coin.inHand > 0)
        {
            let newValue = Math.ceil(actor.system.coin.inHand * (actor.system.lifeStyle.savedEarned / 100));
            let updateString = "system.coin.inHand"
            actor.update({[updateString]: 0})

            updateString = "system.coin.stake"
            actor.update({[updateString]: actor.system.coin.stake + newValue});
        }
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
      this.actor.rollUnarmedAttack(item, skipInputs)
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
      const element = event.currentTarget;
      this.actor.rollCompetence(element.dataset.rollInfo);
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
    

}