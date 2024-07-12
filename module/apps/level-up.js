/**
 * A specialized form used to select from a checklist of attributes, traits, or properties
 * @extends {FormApplication}
 */

import TextField from "./text-field.js";

export default class LevelUp extends FormApplication {
 
    constructor(actor, ...args)
    {
        super(...args);
        this.actor = actor;
        this.careerLevel = this.actor.system.careerLevel.value;
        this.classInformation = {
          bab: "-", 
          fort: "-", 
          ref: "-", 
          will: "-", 
          def: "-", 
          init: "-", 
          life: "-", 
          leg: "-"
        }
        this.pageNum = 1;
    }
    
    /** @override */
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          id: "level-up",
        classes: ["fantasycraft"],
        title: "Level Up!",
        template: "systems/fantasycraft/templates/apps/level-up.hbs",
        width: 480,
        height: "auto",
        choices: {},
        minimum: 1,
        maximum: 1
      });
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
      const actor = this.actor
      const CurrentLevel = actor.system.careerLevel.value
      //const level = this.actor.system.careerLevel.value;
      let classes = this.getClasses();
      classes.unshift("");
      let feats = game.packs.get("fantasycraft.feats");
      let tricks = game.packs.get("fantasycraft.tricksandstances");
      let paths = game.packs.get("fantasycraft.paths");
      let spells = game.packs.get("fantasycraft.spells");
      const pages = this.getPages(CurrentLevel+1);

      return {
        actor: actor,
        lists: {
          classes: classes,
          feats: feats,
          tricks: tricks
        },
        pageNum: this.pageNum,
        classInfo: this.classInformation,
        limited: true,
        pages: pages
      }

    }
    activateListeners(html) {
      super.activateListeners(html);

      html.find('.classSelect').change(this.getClassInformation.bind(this));
      html.find('.addInterest').click(this.addInterest.bind(this));
  }


    getClasses()
    {
      let classes = game.packs.get("fantasycraft.classes").index;
      

      if (this.actor.system.careerLevel.value < 10)
        classes = classes.filter(item => item.system.classType != "master");
      if (this.actor.system.careerLevel.value < 5)
        classes = classes.filter(item => item.system.classType != "expert");

      return classes
    }

    async getClassInformation(event)
    {
      //get the selected classes vitality, skill points, bonuses, and next levels ability.
      event.preventDefault();

      
      const element = event.currentTarget;
      if (element.selectedOptions[0].value == "") return;
      const parent = event.currentTarget.parentElement.parentElement;
      const classTable = parent.children[1].children[0].children[1];
      const actorsClass = this.actor.items.filter(item => item.name == element.selectedOptions[0].label);

      let classes = this.getClasses();
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
    }

    getPages(level)
    {
      const fastFeats = game.settings.get('fantasycraft', 'fastFeats');
      const fastAttributes = game.settings.get('fantasycraft', 'fastAttributes');
      const fastProficiencies = game.settings.get('fantasycraft', 'fastProficiencies');
      const fastInterests = game.settings.get('fantasycraft', 'fastInterests');

      let pages = {
        class: true,
        skills:true,
        attributes:false,
        proficiencies:false,
        interests:false,
        feats:false,
        paths:false,
        spellcasting:false,
        eSlot:false
      }

      let pageArray = ["class", "skills"]

      console.log (fastAttributes + " + " + level)

      //attributes
      if ((!fastAttributes && level % 4 == 0) || (fastAttributes && level % 3 == 0))
      {
        pages.attributes = true;
        pageArray.push("attributes")
      }

      //feats
      if ((!fastFeats && level % 3 == 0) || (fastFeats && level % 2 == 0 || level == 1))
      {
        pages.feats = true;
      }

      //Proficiencies
      if ((!fastProficiencies && level % 2 == 1) || fastProficiencies)
      {
        pages.proficiencies = true;
      }
        
      //Interests
      if ((!fastInterests && (level == 2 || (level - 2) % 4 == 0)) || (fastInterests && level % 2 == 0))
      {
        pages.interests = true;
      }

      //spells/paths

      //E-Slot

      return pages;

    }

    nextPage(event)
    {
      event.preventDefault()
      this.pageNum ++;
    }

    previousPage(event)
    {
      event.preventDefault
      this.pageNum --;
    }

    addInterest(event)
    {
      event.preventDefault();
      const element = event.currentTarget;
      const label = element.parentElement.querySelector("label");
      const options = { name: element.dataset.target, title: label.innerText}
      new TextField(this.actor, options).render(true)
    }

    setUpFeats(actor)
    {

    }
    /* -------------------------------------------- */
 
     _updateObject() 
     {
         this.object.update();
     }
 
 }