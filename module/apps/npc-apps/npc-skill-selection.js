export default class SkillSelector extends FormApplication   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.skills = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "skill-selector",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-skills.handlebars",
            height: "auto",
            width: 250,
            title: "Select Signature Skills"
        });
    }

    /** @override */
    getData() 
    {
      let signatureSkills = this.actor.system.signatureSkills;
        //Populate choices
        const choices =foundry.utils.duplicate(this.skills.choices);
        for ( let [k, v] of Object.entries(this.skills.choices) ) {
          if (v != "fantasycraft.spellcasting")
          {
            choices[k] = v;
          }
        }
        delete choices.spellcasting;   
        
        //set the "selected" value for each skill based on existing skills
        return {
            skills: signatureSkills,
            choices: choices,
            grades: {I: "I", II: "II", III: "III", IV: "IV", V: "V", VI: "VI", VII: "VII", VIII: "VIII", IX: "IX", X: "X"}
        }
    }
  
    _updateObject(event, formData) {
      const updateData = {};
      
      // Obtain choices
      const skillSets = [];
      
      for ( let [k, v] of Object.entries(formData.signatureSkills) ) 
      {
        //The form data doesn't differentiate between dropdowns, so only look at even numbered dropdowns to skip unrequired dropdowns.
        if (k % 2 == 0)
        {
            if (v != 'none')
            {
              let hasSkill = skillSets.find(s => s.skillName == v);
              let nextNum = parseInt(k)+1;
              
              //remove duplicates (removing the one with the lower grade)
              if (!!hasSkill && this._parseSkillGrade(hasSkill.skillGrade) >= this._parseSkillGrade(formData.signatureSkills[nextNum]))
              continue;
              else if (!!hasSkill && this._parseSkillGrade(hasSkill.skillGrade) < this._parseSkillGrade(formData.signatureSkills[nextNum]))
              {
                hasSkill.skillGrade = formData.signatureSkills[nextNum];
                continue;
              }
              
              skillSets.push({skillName: formData.signatureSkills[k], skillGrade: formData.signatureSkills[nextNum], skillBonus: 0})
            }
          }
        }

        updateData[`system.signatureSkills`] = skillSets;
        
        //return that array to the actor
        this.actor.update(updateData);
    }

    _parseSkillGrade(grade)
    {
      if (grade == "I") return 1;
      else if (grade == "II") return 2;
      else if (grade == "III") return 3;
      else if (grade == "IV") return 4;
      else if (grade == "V") return 5;
      else if (grade == "VI") return 6;
      else if (grade == "VII") return 7;
      else if (grade == "VIII") return 8;
      else if (grade == "IX") return 9;
      else if (grade == "X") return 10;
      else return 0
    }
}
  