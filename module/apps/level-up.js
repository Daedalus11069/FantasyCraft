import { addAncestry, addClass, playerLevelUp, getSpecialty } from "../level-up-functions.js";
import TextField from "./text-field.js";

export default class LevelUp extends FormApplication {
     
    /** @override */
      static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
        id: "level-up",
        classes: ["fantasycraft"],
        title: "Level Up!",
        template: "systems/fantasycraft/templates/apps/level-up.hbs",
        width: 500,
        height: "auto",
        choices: {},
        minimum: 1,
        maximum: 1,
      });
    }

    _canDragDrop(selector) {
      return true;
    }
  

    static async GetESlot(options) { 
      const sheet = new FeatureSelector(options);
      await sheet.render(true);
  
      return new Promise(resolve => {
          sheet._resolvePromise = resolve;
      });
    }

    /* -------------------------------------------- */
  
    /**
     * Return a reference to the target attribute
     * @type {String}
     */
    get attribute() {
        return this.options.name;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      const actor = this.object;
      const CurrentLevel = actor.system.careerLevel.value;
      const interests = 
      {
        studies: actor.system.interests.studies,
        languages: actor.system.interests.languages,
        alignments: actor.system.interests.alignment
      };
      if (this.options.baseActor == undefined)
      {
        this.options.baseActor = structuredClone(this.object.system);
        this.options.updatingActor = structuredClone(this.object);
        this.options.proficiencies = structuredClone(this.object.system.proficency);
        this.options.pageNum = 0;
        this.options.nextLevel = { class: "", skills: {}, arcane: {}, abilityBonus: {}, feats: {}, interests: { studies: "", languages: "", alignment: "",}, proficiencies: {}, careerTrick: {}, classSpell: {}};
        this.options.ranksRemaining = this.options.ranksAllotted;
        this.options.updatedAttributes = this.options.updatingActor.system.abilityScores;
        this.options.proficiencyPoints = 0;
      }
      let pages = this.getPages(CurrentLevel+1);
      let classes = this.getClasses(actor);
      if (pages.proficiencies)
        setUpProficiencies();
      let paths = game.packs.get("fantasycraft.paths");

      return {
        actor: actor,

        classes: classes,
        nextLevel: this.options.nextLevel,
        options: this.options,
        pageIndex: this.options.pageNum + 1,
        limited: true,
        pages: pages,
        baseActor: this.options.baseActor
      }

    }
    activateListeners(html) {
      super.activateListeners(html);

      html.find('.classSelect').change(this.getClassInformation.bind(this));
      html.find('.interest').change(this.updateInterests.bind(this));
      html.find('.next-page').click(this.nextPage.bind(this));
      html.find('.previous-page').click(this.previousPage.bind(this));
      html.find('.increase-attribute').click(this.changeAttribute.bind(this));
      html.find('.decrease-attribute').click(this.changeAttribute.bind(this));
      html.find('.change-proficiencies').click(this.changeProficiencies.bind(this));
      html.find('.skill-ranks').change(this.updateSkillRanks.bind(this));
      this.form?.addEventListener('drop', this._onDrop.bind(this));
  }


    getClasses(actor)
    {
      let classes = game.packs.get("fantasycraft.classes").index;
      

      if (actor.system.careerLevel.value < 10)
        classes = classes.filter(item => item.system.classType != "master");
      else 
        classes = classes.filter(item => item.type == "class");
      if (actor.system.careerLevel.value < 5)
        classes = classes.filter(item => item.system.classType != "expert");

      return classes
    }

    async getClassInformation(event)
    {
      //get the selected classes vitality, skill points, bonuses, and next levels ability.
      event.preventDefault();
      
      const element = event.currentTarget;
      const parent = event.currentTarget.parentElement.parentElement;
      const nextButton = parent.closest(".sheet").querySelector(`[name=next-button]`);
      if (element.selectedOptions[0].value == "") 
      {
        nextButton.disabled = true;
        return;
      }
      const classTable = parent.children[1].children[0].children[1];
      const actorsClass = this.object.items.filter(item => item.name == element.selectedOptions[0].label);

      let classes = this.getClasses(this.object);
      let classLevel = 0
      if (!actorsClass.length == 0)
        classLevel = actorsClass[0].system.levels;

      let selectedClass = classes.find(item => item._id == element.selectedOptions[0].value)

      parent.querySelector('[name=level]').innerText = (classLevel + 1)

      //parent.querySelector[`[name=classpic]`]
      classTable.querySelector(`[name=bab]`).value = CONFIG.fantasycraft.classBAB[selectedClass.system.baseAttack][classLevel];
      classTable.querySelector(`[name=fort]`).value = CONFIG.fantasycraft.classSaves[selectedClass.system.fortitude][classLevel];
      classTable.querySelector(`[name=ref]`).value = CONFIG.fantasycraft.classSaves[selectedClass.system.reflex][classLevel];
      classTable.querySelector(`[name=will]`).value = CONFIG.fantasycraft.classSaves[selectedClass.system.will][classLevel];
      classTable.querySelector(`[name=def]`).value = CONFIG.fantasycraft.classDefense[selectedClass.system.defense][classLevel],
      classTable.querySelector(`[name=init]`).value = CONFIG.fantasycraft.classInitiative[selectedClass.system.initiative][classLevel];
      classTable.querySelector(`[name=life]`).value = CONFIG.fantasycraft.classSaves[selectedClass.system.lifeStyle][classLevel];
      classTable.querySelector(`[name=leg]`).value = CONFIG.fantasycraft.classLegend[selectedClass.system.legend][classLevel];

      this.options.nextLevel.currentLevel = classLevel;
      this.options.nextLevel.level = classLevel+1;

      this.options.nextLevel.classInformation = 
      {          
        bab: CONFIG.fantasycraft.classBAB[selectedClass.system.baseAttack][classLevel],
        fort: CONFIG.fantasycraft.classSaves[selectedClass.system.fortitude][classLevel],
        ref: CONFIG.fantasycraft.classSaves[selectedClass.system.reflex][classLevel],
        will: CONFIG.fantasycraft.classSaves[selectedClass.system.will][classLevel],
        def: CONFIG.fantasycraft.classDefense[selectedClass.system.defense][classLevel],
        init: CONFIG.fantasycraft.classInitiative[selectedClass.system.initiative][classLevel],
        life: CONFIG.fantasycraft.classSaves[selectedClass.system.lifeStyle][classLevel],
        leg: CONFIG.fantasycraft.classLegend[selectedClass.system.legend][classLevel]
      }

      nextButton.removeAttribute("disabled");

      this.options.nextLevel.class = selectedClass;

      this._updateSkills(selectedClass);
      this.options.proficiencyPoints = (this.object.system.careerLevel.value == 0) ? await this._setProficiencies(selectedClass) : 1;
    }

    /**
     * Get proficency points at level 1 based on class
     * @param {object} selectedClass        The chosen class
     */
    async _setProficiencies(selectedClass)
    {
      //clear all current proficiencies.
      this.options.nextLevel.proficiencies = this.object.system.proficency

      //TODO if a origin option gives a proficiency, reset that.

      
      //grant proficiencies based on class
      let vitCont = 0;
      let attCont = 0;
			if (selectedClass.system.vitality != "Low") vitCont = (selectedClass.system.vitality == "Medium") ? 1 : 2;
      if (selectedClass.system.baseAttack != "Low") attCont = (selectedClass.system.baseAttack == "Medium") ? 1 : 2;
      
      return 2 + vitCont + attCont;
    }

    _updateSkills(selectedClass)
    {
      if (selectedClass.system.vitality == "High")
        this.options.ranksAllotted = 4;
      else if (selectedClass.system.vitality == "Medium")
        this.options.ranksAllotted = 6;
      else if (selectedClass.system.vitality == "Low")
        this.options.ranksAllotted = 8;
      
      this.options.ranksAllotted += this.options.updatedAttributes.intelligence.mod
      
      if (this.object.system.careerLevel.value == 0)
        this.options.ranksAllotted *= 4;

      let showOff = this.object.items.find(item => item.name == "Show-Off");
      let sharpMind = this.object.items.filter(item => item.name == "Sharp Mind");
      this.options.ranksAllotted += sharpMind.length;
      if (showOff)
        this.options.ranksAllotted ++;

      this.options.ranksRemaining = this.options.ranksAllotted;

      this._calculateSkills();
    }

    _calculateSkills()
    {
      for (let [k, s] of Object.entries(this.options.updatingActor.system.skills))
        {
          let ability = this.options.updatingActor.system.abilityScores[s.ability];
          s.abModifier = ability.mod;
          s.total = ability.mod + s.ranks + s.misc + s.magic;
        }
    }


    /**
     * When a skill ranks box is updated determine if the new value is less than the base value, if so reset the value to the base value and end
     * otherwise find how many new skill ranks are remaining. 
     * if the number is negative, reduce the number of skill points spent on the most recent change and set ranks remaining to 0
     * @param {*} event 
     * @param baseSkills           Skills prior to any modifications
     * @param pointHolder          HTML element that displays the number of skills points left
     * @param updatedSkill         The Skill that is being updated
     * @param skillName            The name of the Skill being updated
     * @param ranks                A list of all html elements that contain skill ranks
     * @param currentSkills        Variable to hold the total number of skill points currently spent during leveling up.
     * @param baseValue            the value of the specific skill were modifying, prior to modification.
     * @returns 
     */
    updateSkillRanks(event)
    {
      //Reorganize this so it flows better
      event.preventDefault();
      const element = event.currentTarget;
      const baseSkills = this.getRanks(this.options.baseActor.skills);
      const pointHolder = event.currentTarget.closest(".page-container").children[0].querySelector("input");
      const updatedSkill = event.currentTarget.closest(".skill-ranks");
      const skillName = event.currentTarget.closest(".skill").dataset.skill;
      let ranks = element.form.getElementsByClassName("skill-ranks");
      let currentSkills = 0;
      let baseValue = (skillName == "spellcasting") ? this.options.baseActor.arcane[skillName].ranks : this.options.baseActor.skills[skillName].ranks;
      if (updatedSkill.value == "")
        updatedSkill.value = 0;

      if (baseValue > updatedSkill.value)
      {
        updatedSkill.value = baseValue;
        this.setSkillRanksForUpdate(skillName, updatedSkill, element);
        return;
      }

      currentSkills = this.getRanks(ranks);
      let rr = baseSkills + this.options.ranksAllotted - currentSkills;

      //If the attempted spending is greater than ranks remaining
      //Set the value of the changed skill to the maximum you can actually afford and set the ranks remaining to 0
      if (rr < 0)  
      {
        element.value = parseInt(element.value) + (baseSkills + this.options.ranksAllotted - currentSkills);

        this.options.ranksRemaining = 0;
      } 
      //otherwise just reduce the ranks remaining appropriately
      else 
        this.options.ranksRemaining = baseSkills + this.options.ranksAllotted - currentSkills;

  
      pointHolder.value = this.options.ranksRemaining; //update the point holder with current points

      this.setSkillRanksForUpdate(skillName, updatedSkill, element);
    }

    setSkillRanksForUpdate(skillName, updatedSkill, element)
    {
      if (skillName == "spellcasting")
        {
          let wisdom = (!!this.options.nextLevel.abilityBonus.wisdom) ? this.options.nextLevel.abilityBonus.wisdom : this.options.updatingActor.system.abilityScores.wisdom.value;
          this.newSpells(updatedSkill.value, wisdom);
          this.options.nextLevel.arcane.spellcasting = element.value;
          this.options.updatingActor.system.arcane[skillName].ranks = element.value;
        }      
        else 
        {
          this.options.nextLevel.skills[skillName] = element.value;
          this.options.updatingActor.system.skills[skillName].ranks = parseInt(element.value);
        }

        this._calculateSkills();
        this.render("false");
    }

    getRanks(skills)
    {
      let totalRanks = 0;
      for (let [id, skill] of Object.entries(skills)) 
      {
        if (id == "spellcasting")
          continue;
        
        totalRanks += (skill.ranks == undefined) ? parseInt(skill.value) : parseInt(skill.ranks);
      }

      return totalRanks
    }

    newSpells(skillRanks, wisdom)
    {
      //TODO spell library localization change
      let lifeStyle = this.options.baseActor.lifeStyle.value
      if (lifeStyle == "NaN") lifeStyle = 0;
      const spellLibrary = (this.object.items.find(item => item.name == "Spell Library"))? lifeStyle : 0;
      const spellsCurrent = this.object.items.filter(item => item.type == "spell").length + spellLibrary;
      const newLibrary = this.options.nextLevel?.careerFeat?.name == "Spell Library" ? lifeStyle : 0;
      const spellsKnown = parseInt(skillRanks) + wisdom + newLibrary;
      
      this.options.newSpells = spellsKnown - spellsCurrent;;
    }

    /**
     *  Function to determine which pages should be active during level up. 
     * @param {*} level                     The Players Level
     * @param {bool} fastFeats              A bool based on if the Fast Feats campaign quality
     * @param {bool} fastAttributes         A bool based on if the Fast Attributes campaign quality
     * @param {bool} fastProficiencies      A bool based on if the Fast Proficiencies campaign quality
     * @param {bool} fastInterests          A bool based on if the Fast Interests campaign quality
     * @param {object} pages                An object that determines both the order pages are in as well as which pages are sent to the array.
     * @returns {Array}                     The Array of pages
     */
    getPages(level)
    {
      const fastFeats = game.settings.get('fantasycraft', 'fastFeats');
      const fastAttributes = game.settings.get('fantasycraft', 'fastAttributes');
      const fastProficiencies = game.settings.get('fantasycraft', 'fastProficiencies');
      const fastInterests = game.settings.get('fantasycraft', 'fastInterests');

      let pages = {
        attributes:false,
        origin: false,
        class: false,
        skills:true,
        proficiencies:false,
        interests:false,
        feats:false,
        paths:false,
        spellcasting:false,
        eSlot:false,
        summary: true,
      }

      let pageArray = [{"page": "class"}];

      if (level == 1) 
      {
        pageArray = [];

        pages.attributes = true;
        pages.origin = true;
        pages.class = true
        pages.proficiencies = true;
        pages.interests = true;
        pages.feats = true;
        
        let attributePoints = 36;
        if (game.settings.get('fantasycraft', 'largerThanLifeHeroes')) attributePoints = 40;
        else if (game.settings.get('fantasycraft', 'lesserHeroes')) attributePoints = 32;
    
        this.options.attributePoints = (this.options.attributePoints != undefined) ? this.options.attributePoints : attributePoints;
        
        //if a class with arcane spellcasting is selected add the spellcasting page
        if(this.options.nextLevel.class.system?.spellPoints != "None" && this.options.nextLevel.class.system?.spellPoints != undefined && (this.options.nextLevel?.abilityBonus?.wisdom != undefined || this.options.nextLevel?.arcane?.spellcasting != undefined))
          pages.spellcasting = true;
        else 
          pages.spellcasting = false;
        
        this.options.interestsAllotted = 4;
        this.options.interestsRemaining = (this.options.interestsRemaining != undefined) ? this.options.interestsRemaining : this.options.interestsAllotted;

        for (let page of Object.entries(pages))
        {
          if (page[1]) pageArray.push({"page": page[0]});
        }
        
        pages.summary = true;

        return pageArray;
      }  

      //attributes
      if ((!fastAttributes && level % 4 == 0) || (fastAttributes && level % 3 == 0))
      {
        pages.attributes = true;
        this.options.attributePoints = (this.options.attributePoints != undefined) ? this.options.attributePoints : 1;
      }
      //feats
      if ((!fastFeats && level % 3 == 0) || (fastFeats && level % 2 == 0 || level == 1))
        pages.feats = true;
      //Proficiencies
      if ((!fastProficiencies && level % 2 == 1) || fastProficiencies)
        pages.proficiencies = true;
      //Interests
      if ((!fastInterests && (level == 2 || (level - 2) % 4 == 0)) || (fastInterests && level % 2 == 0))
      {
        this.options.interestsAllotted = 1;
        this.options.interestsRemaining = (this.options.interestsRemaining != undefined) ? this.options.interestsRemaining : this.options.interestsAllotted;
        pages.interests = true;
      }
      //if a class with arcane spellcasting is selected add the spellcasting page
      if(this.options.nextLevel.class.system?.spellPoints != "None" && this.options.nextLevel.class.system?.spellPoints != undefined && (this.options.nextLevel?.abilityBonus?.wisdom != undefined || this.options.nextLevel?.arcane?.spellcasting != undefined))
        pages.spellcasting = true;
      else 
        pages.spellcasting = false;

      //E-Slot

      //TODO add Lifestyle page if charisma or lifestyle changed

      for (let page of Object.entries(pages))
      {
        if (page[1]) pageArray.push({"page": page[0]});
      }

      pages.summary = true;

      return pageArray;

    }

    nextPage(event)
    {
      event.preventDefault();

      this.options.pageNum ++;
      this.render(false);
    }

    previousPage(event)
    {
      event.preventDefault();
      this.options.pageNum --;

      this.render(true);
    }

    async updateInterests(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const pointHolder = element.closest(".page-container").children[0].querySelector("input");
      const allTextInputs = element.closest(".page-container").querySelectorAll("input");
      const label = element.parentElement.querySelector("label");
      const inputField = element.parentElement.querySelector("input");
      const nextLevel = this.options.nextLevel.interests;
      let totalInterests = allTextInputs[1].value + "; " + allTextInputs[2].value + "; " + allTextInputs[3].value;
      totalInterests = totalInterests.split(";").map(e => e.trim()).filter(i => i);
      
      if (totalInterests.length > this.options.interestsAllotted)
      {
        inputField.value = (nextLevel[label.innerText].length > 0) ? nextLevel[label.innerText].join("; ") : "";
        return;
      }
        
      this.options.interestsRemaining = this.options.interestsAllotted - totalInterests.length;
      pointHolder.value = this.options.interestsRemaining;

      let newInterests = inputField.value.split(";").map(e => e.trim());
      newInterests = newInterests.filter(i => i);
      inputField.value = newInterests.join("; ");

      this.options.nextLevel.interests[label.innerText] = newInterests.join("; ");
    }

    /**
     * Updates Ability Scores
     * @param {*} event 
     * @pointHolder       Reference to the HTML element that shows the remaining points
     * @input             Reference to the HTML element that shows the Ability Score being modified
     * @attribute         The Ability Score being updated
     * @changeDirection   Whether the score is being increased or decreased
     * @baseAttribute     The value of the Attribute before any changes were made
     * @newAttribute      The updated version of the attribute
     * @changeCost        Currently 1 but can be changed for point-buy scores for a level 1 character later
     * @returns           Updated Attributes 
     */
    changeAttribute(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const pointHolder = event.currentTarget.closest(".page-container").children[0].querySelector("input");
      const input = element.parentElement.parentElement.querySelector("input");
      const attribute = element.dataset.attribute;
      const changeDirection = (element.classList[2] == "decrease-attribute") ? "down" : "up";
      const baseAttribute = this.options.baseActor.abilityScores[attribute].value;
      let newAttribute = this.options.updatedAttributes[attribute].value;
      let forcasted = (changeDirection == "down") ? newAttribute : newAttribute + 1;
      let limit = (game.settings.get('fantasycraft', 'largerThanLifeHeroes')) ? 21 : 18;
      if (forcasted <= 8 || forcasted > limit)
        return;

      let changeCost = (this.object.system.careerLevel.value == 0) ? CONFIG.fantasycraft.pointBuy.pointCost[forcasted] : 1


      if (changeDirection == "down")
      {
        if (newAttribute <= baseAttribute)
          return;

        newAttribute --;
        this.options.attributePoints += changeCost;
        if (attribute == "intelligence" && this.options.nextLevel.class && newAttribute % 2 != 0)
        {
          this.options.ranksAllotted -= (this.options.nextLevel.level == 1) ? this.options.nextLevel.level * 4 : this.options.nextLevel.level;
          this.options.ranksRemaining -= (this.options.nextLevel.level == 1) ? this.options.nextLevel.level * 4 : this.options.nextLevel.level;
        }
      }
      else 
      {
        if (this.options.attributePoints < changeCost)
          return;

        newAttribute ++;
        this.options.attributePoints -= changeCost;

        
        if (attribute == "intelligence" && this.options.nextLevel.class && newAttribute % 2 == 0)
        {
          this.options.ranksAllotted += (this.options.nextLevel.level == 1) ? this.options.nextLevel.level * 4 : this.options.nextLevel.level;
          this.options.ranksRemaining += (this.options.nextLevel.level == 1) ? this.options.nextLevel.level * 4 : this.options.nextLevel.level;
        }
      }

      this.options.updatedAttributes[attribute].value = newAttribute;
      this.options.updatedAttributes[attribute].mod = Math.floor((this.options.updatedAttributes[attribute].value - 10)/2);
      pointHolder.value = this.options.attributePoints;
      input.value = newAttribute;

      this.options.nextLevel.abilityBonus[attribute] = newAttribute;

      if (attribute == "wisdom")
        this.newSpells(this.options.nextLevel?.skills?.spellcasting, newAttribute)

      this._calculateSkills();

      return this.options.updatedAttributes;
    }

    changeProficiencies(event)
    {
      const element = event.currentTarget;
      const baseActor = this.options.baseActor.proficency;
      const prof = element.dataset.type;
      const proficient = element.dataset.proficiency;
      let pointHolder = element.closest(".page-container").children[0].querySelector("input");

      if (baseActor[prof][proficient] || (element.checked && parseInt(pointHolder.value) == 0) || ((element.checked && parseInt(pointHolder.value) == 1) && proficient == "forte" && !this.options.proficiencies[prof].proficient))
      {
        event.preventDefault();
        return;
      }

      pointHolder.value = (element.checked) ? parseInt(pointHolder.value) - 1 : parseInt(pointHolder.value) + 1;
      if (proficient == "forte" && !this.options.proficiencies[prof].proficient)
      {
        element.parentElement.children[1].checked = true;
        pointHolder.value = parseInt(pointHolder.value) - 1;
        this.options.proficiencies[prof].proficient = true;
      }
      if (proficient == "proficient" && this.options.proficiencies[prof].forte)
      {
        element.parentElement.children[2].checked = false;
        pointHolder.value = parseInt(pointHolder.value) + 1;
        this.options.proficiencies[prof].forte = false;
      }
        
      this.options.proficiencyPoints = pointHolder.value;
      this.options.proficiencies[prof][proficient] = element.checked;
      this.options.nextLevel.proficiencies = this.options.proficiencies;

      this.render(false);
    }

    /* -------------------------------------------- */
    /* ---------------@Inherited Docs-------------- */
    /* -------------------------------------------- */


    /**
     * Drop handler to take dropped items in specific drop zones and add them to the nextLevel object
     * @param {*} event                   The original drop event
     * @param {HTML} DropData             HTML element where the item was dropped
     * @param {string} suboption          Any additional restrictions like feat types
     * @param {string} suboption2         Any additional restrictions like feat types
     * @param {Object} droppedItem        Feat, Trick, Ancestry, Talent or Specialty dropped into a drop zone
     * @param {Object} Dataset            HTML dataset from the event.
     * @param {string} holder             String to hold the name that the item will be stored under in nextLevel
     *
     */
    async _onDrop(event)
    {
      const ItemData = TextEditor.getDragEventData(event);
      const DropData = event.target.closest('.drop-zone');
      if (DropData?.dataset == null)
        return;
      const Dataset = DropData.dataset;
      const itemFromID = await fromUuid(ItemData.uuid)
      let droppedItem = {... itemFromID};
      let holder = Dataset.source + Dataset.type;
      if (Dataset.type == "Talent" && (this.options.nextLevel?.careerAncestry?.name != "Human" || !droppedItem.system.isTalent))
        return;
      Dataset.type = (Dataset.type == "Talent") ? "Ancestry" : Dataset.type;

      if (DropData == null || droppedItem.type != Dataset.type.toLowerCase())
        return;

      //exceptions for Human Talents
      else if (Dataset.type == "Ancestry" && (this.options.nextLevel?.careerAncestry?.name != "Human" || this.options.nextLevel?.careerAncestry?.name != undefined) && !droppedItem.system.isTalent)
      {
        this.options.nextLevel.careerTalent = null;
      }

      if (Dataset.type == "Trick" || Dataset.type == "Spell")
      {
        if (Dataset["subOption-1"] != droppedItem.system?.requirement?.toLowerCase() && Dataset["subOption-1"] != "any")
          return;

        let target = (Dataset.type == "Trick") ? this.options.nextLevel?.careerTrick : this.options.nextLevel?.classSpell;
        if (!!target?.[Dataset["subOption-2"]])
        {
          target[Dataset["subOption-2"]] = droppedItem;  
        }
        else 
        {
          if (Dataset.type == "Trick") this.options.proficiencyPoints --
          if (Dataset.type == "Spell") this.options.newSpells --

          target = (!!target) ? target : {}
          let newFeature = Dataset.type.toLowerCase() + Object.keys(target).length;
          target[newFeature] = droppedItem;
        }
      }
      else
        this.options.nextLevel[holder] = droppedItem;
      
      this.render(true);
    }

    _updateObject(event)
    {
      //Add or increase the level of a class
      let updateData = {};
      let nextLevel = this.options.nextLevel;

      if (nextLevel.level == 1)
        addClass(this.object, nextLevel);
      else
        playerLevelUp(event, this.object, nextLevel);

      // Increase Attributes
      for (let [ability, value] of Object.entries(nextLevel.abilityBonus))
      {
        updateData[`system.abilityScores.${ability}.value`] = parseInt(value);
      }

      // Update Proficiencies
      for (let [proficiency, value] of Object.entries(nextLevel.proficiencies))
      {
        if (value.proficient) updateData[`system.proficency.${proficiency}.proficient`] = value.proficient;
        if (value.forte) updateData[`system.proficency.${proficiency}.forte`] = value.forte;
      }

      // Update Interests
      for (let [interest, value] of Object.entries(nextLevel.interests))
      {
        if (this.object.system.interests[interest].custom == "")
          updateData[`system.interests.${interest}.custom`] = value;
        else
          updateData[`system.interests.${interest}.custom`] = this.object.system.interests[interest].custom + "; " + value;
      }
  
      // Update skills
      for (let [skill, value] of Object.entries(nextLevel.skills))
      {
        updateData[`system.skills.${skill}.ranks`] = parseInt(value);
      }
      if (nextLevel.arcane?.spellcasting != undefined && nextLevel.arcane?.spellcasting != 0)
        updateData[`system.arcane.spellcasting.ranks`] = nextLevel.arcane.spellcasting;

      //Add Feats
      if (nextLevel.careerFeat)
        this.object.createEmbeddedDocuments("Item", [nextLevel.careerFeat]);

      //Add Tricks
      if (nextLevel.careerTrick)
        for (let item of Object.entries(nextLevel.careerTrick))
        {
          this.object.createEmbeddedDocuments("Item", [item[1]]);
        }

      //Add Ancestries, Talents, and Specialties
      if (nextLevel.careerAncestry)
      {
        addAncestry(this.object, nextLevel.careerAncestry);

        if (nextLevel.careerTalent && nextLevel.careerTalent != {})
          addAncestry(this.object, nextLevel.careerTalent);

      }
      if (nextLevel.careerSpecialty)
      {
        getSpecialty(this.object, nextLevel.careerSpecialty);
        this.object.createEmbeddedDocuments("Item", [nextLevel.careerSpecialty]);
      }

      //Add Spells
      if (nextLevel.classSpell && nextLevel.classSpell != {})
        for (let item of Object.entries(nextLevel.classSpell))
        {
          this.object.createEmbeddedDocuments("Item", [item[1]]);
        }

      this.object.update(updateData);
    }
 
 }