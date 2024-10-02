import * as Utils from '../../Utils.js';

export default class Qualities extends Application   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.actor = actor; 
    }
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "npc-qualites",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-qualities.handlebars",
            height: "auto",
            width: 250,
            title: "Qualities",
        });
    }

    /** @override */
    getData() 
    {
		let qualities = this.actor.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "npcQuality")});
		let classFeatures = this.actor.items.filter(function(item) {return (item.type == "feature" && item.system.featureType == "class")});
		let feats = this.actor.items.filter(function(item) {return (item.type == "feat")});
        let paths = this.actor.items.filter(function(item) {return (item.type == "path")});
        let tricks = this.actor.items.filter(function(item) {return (item.type == "trick")});

        qualities.sort( Utils.alphabatize )
        classFeatures.sort( Utils.alphabatize )
        feats.sort( Utils.alphabatize )
        paths.sort( Utils.alphabatize )
        tricks.sort( Utils.alphabatize )

        for (let quality of Object.entries(qualities))
        {
            quality = quality[1].system;   
            if (quality.xpMultiplier != "grades")
                continue;

            quality.grades.gradeArray = (quality.grades.gradeArray === 'undefined') ? [] : quality.grades.gradeArray;

            let maxGrades = Utils.numeralConverter(quality.grades.maximum)


            for (let i = 0; i < maxGrades; i++)
            {
                quality.grades.gradeArray[i] = Utils.numberToNumeralConverter(i+1)
            }
        }

        // Populate choices
        const choices = 
        {
            label: "Qualities",
        }
        // Return data
        return {
            choices: choices,
            qualities: qualities,
            classFeatures: classFeatures,
            feats: feats,
            paths: paths,
            tricks: tricks
        }
    }
  
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.changeGrade').change( async ev => {
            let event = ev.currentTarget;
            let itemId = ev.currentTarget.closest(".item").dataset.itemId;
            let item = this.actor.items.get(itemId);
            let updateString = "system." + event.name;
            let newValue = (updateString != "system.grades.value") ? parseInt(event.value) : event.value;
            await item.update({[updateString]: newValue});
            this.render(false);

        })

        html.find('.editItem').click( async ev => {
            let itemId = ev.currentTarget.closest(".item").dataset.itemId;
            let item = this.actor.items.get(itemId);
            return item.sheet.render(true); 
        });

        html.find('.deleteItem').click( async ev => {
            let itemId = ev.currentTarget.closest(".item").dataset.itemId;
            await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
            this.render(false);
        });

        //close the window
        html.find('.submit').click( ev => {
            this.close();
        });
    }

  }
  