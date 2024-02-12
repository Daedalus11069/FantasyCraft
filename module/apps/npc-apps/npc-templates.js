import * as Utils from '../../Utils.js';

export default class TemplateSelector extends Application   {
    constructor(actor, options, ...args)
    {
        super(...args);
        this.moveOptions = options;
        this.actor = actor; 
    }
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "npc-templates",
            classes: ["fantasycraft"],
            choices: {},
            template: "systems/fantasycraft/templates/apps/npcApps/npc-templates.handlebars",
            height: "auto",
            width: 500,
            title: "NPC Templates"
        });
    }

    /** @override */
    getData() 
    {

    }

    activateListeners(html) {
        super.activateListeners(html);
        let npc = this.actor;
        npc.system.movement.ground.value = parseInt(npc.system.movement.ground.value);

        //Rogue Templates
        html.find('.drake').click( async ev => {
            this.templateChanges(npc, "large", 2, [2, 3], "beast", ["fly", 40])
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.HWCvdngvEdaGozgp"]);
            await this.createNaturalAttack("claw", "II")
            await this.createNaturalAttack("bite", "II")
            this.createNaturalAttack("fireBreath", "II", "extraDamage", {}, {"area": {shape: "beam", value: 2}, "damageType": "fire"})
        });
        html.find('.dwarf').click( async ev => {
            npc.update({"system.abilityScores.constitution.value": npc.system.abilityScores.constitution.value + 2});
            this.templateChanges(npc, "medium", 1, [1, 1], null, ["ground", npc.system.movement.ground.value - 10])
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nmDQzxNRc0iJiUVt"], "", 2); //damage reduction
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.Ny1PUiIRi4DrCt0f"], "I");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.cyH3JwkPB2Bss8YS"]);
        });
        html.find('.elf').click( async ev => {
            npc.update({"system.abilityScores.wisdom.value": npc.system.abilityScores.wisdom.value + 2});
            this.templateChanges(npc, "medium", 1, [1, 1], "fey", ["ground", npc.system.movement.ground.value + 10])
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.ShLsSQ9BJREU6KIH"], "I");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.B5HWH8x8aJXX4dZN"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.mxOjqZoK4n72U1id"], "", 0, "hearing, sight");
        });
        html.find('.giant').click( async ev => {
            this.templateChanges(npc, "large", 2, [2, 2], null, ["ground", npc.system.movement.ground.value + 20])
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.cyH3JwkPB2Bss8YS"]);
            await this.createNaturalAttack("trample", "I")
        });
        html.find('.goblin').click( async ev => {
            this.templateChanges(npc, "small", 1, [1, 1])
            this.changeGrade("health", 1);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.Ny1PUiIRi4DrCt0f"], "I");
            await this.addFeature(["Compendium.fantasycraft.feats.IxpH2vv15rhPxe8t"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.oLYQbUtFsndSETfE"]);
        });
        html.find('.ogre').click( async ev => {
            npc.update({"system.abilityScores.constitution.value": npc.system.abilityScores.constitution.value + 2});
            this.templateChanges(npc, "large", 1, [2, 2], null)
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.XOOkj3VJPjhAuxuv"], "I");
        });
        html.find('.orc').click( async ev => {
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value + 2});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.R2AkiaFj2O9oFvuo"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.EtxxE4d6WKz9DDwg"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.oLYQbUtFsndSETfE"]);
        });
        html.find('.pech').click( async ev => {
            this.templateChanges(npc, "small", 1, [1, 1]);
            npc.update({"system.abilityScores.dexterity.value": npc.system.abilityScores.dexterity.value + 2});
        });
        html.find('.rootwalker').click( async ev => {
            this.templateChanges(npc, "large", 1, [2, 2], "plant")
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.EfpmP8QyQxIyNWhH"], "", 0, "fire");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.CA70Qb2GfjoegCot"], "", 0, "forest/jungle or swamp");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.HSSPuSUmBeaKLgmY"], "", 0, "bleeding");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nmDQzxNRc0iJiUVt"], "", 1); //damage reduction
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.27EjYo8QatRCtRhw"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.S0yibg5VPoDOsYJP"]);
        });
        html.find('.saurian').click( async ev => {
            
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.NOYK9ohkOfX8RTEo"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.HWCvdngvEdaGozgp"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.Ny1PUiIRi4DrCt0f"], "I");
            await this.createNaturalAttack("bite", "I")
            await this.createNaturalAttack("tailSlap", "II")
        });
        html.find('.unborn').click( async ev => {
            this.templateChanges(npc, "medium", 1, [1, 1], "construct", ["ground", npc.system.movement.ground.value - 10])
            this.changeGrade("defense", 1);
            this.changeGrade("health", 1);
            this.changeGrade("resilience", 1);
            npc.update({"system.abilityScores.charisma.value": npc.system.abilityScores.charisma.value - 2});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.EfpmP8QyQxIyNWhH"], "", 0, "electrical");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.S0yibg5VPoDOsYJP"]);
        });

        //Monster Templates
        html.find('.alpha').click( async ev => {
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value + 2});
            npc.update({"system.abilityScores.dexterity.value": npc.system.abilityScores.dexterity.value + 2});
            this.changeGrade("initiative", 1); this.changeGrade("attack", 1); this.changeGrade("defense", 1); this.changeGrade("health", 1); this.changeGrade("competence", 1);
            await this.addFeature(["Compendium.fantasycraft.classfeatures.Yc7bMgrzSBsRl43z"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.f5BSepNvdb0tZJHU"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.iqDo46kIUig2Wbbw"], "II");
        });
        html.find('.ancient').click( async ev => {
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value - 2});
            npc.update({"system.abilityScores.dexterity.value": npc.system.abilityScores.dexterity.value - 2});
            npc.update({"system.abilityScores.constitution.value": npc.system.abilityScores.constitution.value - 2});
            npc.update({"system.abilityScores.intelligence.value": npc.system.abilityScores.intelligence.value + 4});
            npc.update({"system.abilityScores.wisdom.value": npc.system.abilityScores.wisdom.value + 4});
            this.changeGrade("competence", 3);
            await this.addFeature(["Compendium.fantasycraft.classfeatures.G3xAvgXDSoQgRYgS"]);
            await this.addFeature(["Compendium.fantasycraft.classfeatures.RJfJTvELn3OUO8wj"], "I");
            await this.addFeature(["Compendium.fantasycraft.classfeatures.NC8pV2gh3l2sHsEA"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.B5HWH8x8aJXX4dZN"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.vvRcOK1FvoqlolkN"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.wYODVo2S977874fx"]);
        });
        html.find('.clockwork').click( async ev => {
            this.templateChanges(npc, "medium", 1, [1, 1], "construct")
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nmDQzxNRc0iJiUVt"], "", 3); //damage reduction
            await this.createNaturalAttack("slam", "III")
        });
        html.find('.dire').click( async ev => {
            this.templateChanges(npc, 2, 1, [1, 1])
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value + 4});
            npc.update({"system.abilityScores.constitution.value": npc.system.abilityScores.constitution.value + 4});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.XOOkj3VJPjhAuxuv"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.RVITSTvDokFD19HY"]);
        });
        html.find('.ghostly').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "spirit")
            this.templateChanges(npc, 0, 1, [1, 1], "undead")
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.7D2nmY8ZqpR6MK1h"]);
            await this.createNaturalAttack("ghostlyWail", "III", "extraSave", {}, {"area": {shape: "aura", value: 4}, saveUpgrade: "area", attackDescription: "shaking"});
            await this.createNaturalAttack("shadowOfDeath", "III", "extraSave", {}, {attackDescription: "drainingSoul"});
        });
        html.find('.heavenly').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "outsider")
            npc.update({"system.abilityScores.wisdom.value": npc.system.abilityScores.wisdom.value + 2});
            npc.update({"system.abilityScores.charisma.value": npc.system.abilityScores.charisma.value + 2});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.yrZzKWf1My7HGTuI"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.DMeQJ3K6vUqEMo9A", "", 2]);
            let naturalSpells = ["Compendium.fantasycraft.spells.uJKxXo2q3UAGcBHz", "Compendium.fantasycraft.spells.p411gIfhD9L3JtPh"]
            let spells = await Promise.all(naturalSpells.map(id => fromUuid(id)));
            await npc.createEmbeddedDocuments("Item", spells);

        });
        html.find('.infernal').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "outsider")
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value + 2});
            npc.update({"system.abilityScores.intelligence.value": npc.system.abilityScores.intelligence.value + 2});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.yrZzKWf1My7HGTuI"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.DMeQJ3K6vUqEMo9A", "", 2]);
            let naturalSpells = ["Compendium.fantasycraft.spells.zeWTABKrmEI6RKo8", "Compendium.fantasycraft.spells.vCSaN4Uv6xyyutrV"]
            let spells = await Promise.all(naturalSpells.map(id => fromUuid(id)));
            await npc.createEmbeddedDocuments("Item", spells);
        });
        html.find('.immature').click( async ev => {
            this.templateChanges(npc, -2, "-2", [1, 1], null)
            this.changeGrade("attack", -2); this.changeGrade("defense", -2); this.changeGrade("resilience", -2); this.changeGrade("health", -2); this.changeGrade("competence", -2);

            this.changeNaturalAttackGrades(-2);
        });
        html.find('.kaiju').click( async ev => {
            this.templateChanges(npc, "enormous", "4", [1, 1], null)
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value + 5});
            npc.update({"system.abilityScores.constitution.value": npc.system.abilityScores.constitution.value + 5});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.zYieAOvO4U0fdq2A"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.HSSPuSUmBeaKLgmY"], "", 0, "frightened");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.LTfeNJFlot4RamHt"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.qL4C4PlMuBqDUlMK"], "", 0, "stress, subdual");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nmDQzxNRc0iJiUVt"], "", 5);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.xTfL0gxkp8BEYnV7"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.QHUdSrT84jhZxh76"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nBJByQwjaQxAm2Lw"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.S0yibg5VPoDOsYJP"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.RvnomGGADEDOTLPh"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.R4NbESwYSBuliWb8"], "III");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.11sRB4einCaswAqS"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.XOOkj3VJPjhAuxuv"], "V");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.RVITSTvDokFD19HY"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.iqDo46kIUig2Wbbw"], "V");
            await this.createNaturalAttack("trample", "V", "naturalAttack", {"armourPiercing": 10})

        });
        html.find('.lich').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "undead")
            npc.update({"system.abilityScores.intelligence.value": npc.system.abilityScores.intelligence.value + 2});
            npc.update({"system.abilityScores.wisdom.value": npc.system.abilityScores.wisdom.value + 2});
            npc.update({"system.abilityScores.charisma.value": npc.system.abilityScores.charisma.value + 2});
            this.changeGrade("health", 2);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.HSSPuSUmBeaKLgmY"], "", 0, "enraged, fatigued, frightened, shaken");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.qL4C4PlMuBqDUlMK"], "", 0, "cold, electrical");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nmDQzxNRc0iJiUVt"], "", 5);
            await this.addFeature(["Compendium.fantasycraft.feats.Tn8P8mDMOwoaxxQd"]);
            await this.addFeature(["Compendium.fantasycraft.feats.7D2nmY8ZqpR6MK1h"]);
            await this.addFeature(["Compendium.fantasycraft.feats.LQOqeYtLg8j3rTfO"]);

            await this.createNaturalAttack("lichsTouch", "III", "extraSave", {}, {attackDescription: "paralyzing"});


        });
        html.find('.predatory').click( async ev => {
            this.addSignatureSkill("tactics", "V")

            await this.addFeature(["Compendium.fantasycraft.feats.Lggdve1ACzVwVQw1"]);
            await this.addFeature(["Compendium.fantasycraft.feats.m31SMCEAncjkSMGn"]);
            await this.addFeature(["Compendium.fantasycraft.feats.YcJCcZ3GdGLhvw7R"]);
            await this.addFeature(["Compendium.fantasycraft.feats.fGBXthSLYFKZyfDh"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.IVZiAEnSkOlHirkD"]);
        });
        html.find('.risen').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "undead")
            this.changeGrade("resilience", 2); this.changeGrade("initiative", -2); this.changeGrade("competence", -2);

            await this.addFeature(["Compendium.fantasycraft.npcfeatures.kUUc7PJmktyDxvPG"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.R4NbESwYSBuliWb8"], "I");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.E9My7yqMJvFjFkxd"]);

        });
        html.find('.skeletal').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "undead")

            await this.addFeature(["Compendium.fantasycraft.npcfeatures.hJJOwBg0B9KgpNQb"], "", 0, "edged");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.qL4C4PlMuBqDUlMK"], "", 0, "bows");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.VynIrBafeNYWOWp0"]);

        });
        html.find('.vampiric').click( async ev => {
            this.templateChanges(npc, 0, 1, [1, 1], "undead")
            this.changeGrade("defense", 2); this.changeGrade("health", 2);
            npc.update({"system.abilityScores.strength.value": npc.system.abilityScores.strength.value + 2});
            npc.update({"system.abilityScores.wisdom.value": npc.system.abilityScores.wisdom.value + 2});
            npc.update({"system.abilityScores.charisma.value": npc.system.abilityScores.charisma.value + 2});
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.EfpmP8QyQxIyNWhH"], "", 0, "divine, fire, flash");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.EMQhcf4HfVDoAGzq"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.hJJOwBg0B9KgpNQb"], "", 0, "cold");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.nmDQzxNRc0iJiUVt"], "", 5);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.Ny1PUiIRi4DrCt0f"], "II");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.ZzGoq5EE3sBldSHY"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.ku7YZwQPgNyIMkXq"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.oLYQbUtFsndSETfE"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.5M43IulSGpQHjnpl"]);
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.3qdnMeV1TMigd1p5"], "I");
            await this.addFeature(["Compendium.fantasycraft.npcfeatures.Q5oU2c3wuBs9sE1c"], "II");

            await this.createNaturalAttack("bite", "I")
            await this.createNaturalAttack("drainBlood", "I", "extraSave", {}, {attackDescription: "drainingLife", saveUpgrade: "linked", supernaturalAttack: {value: true, linkedAttack: "bite"}});
        });



        //close the window
        html.find('.submit').click( ev => {
            this.close();
        });
    }

    async templateChanges(npc = this.actor, tSize = "medium", tReach = 1, footprint = [1, 1], tType = null, tSpeed = null)
    {

        if (typeof tSize == "string")
        {
            let size = "system.size";
            await npc.update({[size]: tSize});
        }
        else if (typeof tSize == "number")
        {
            let size = "system.size";
            let newSize = this.sizeToNumber(npc.system.size) + tSize;
            if (newSize > 6) newSize = 6
            if (newSize < -5) newSize = -5
            newSize = this.numberToSize(newSize);
            await npc.update({[size]: newSize});
        }

        if (typeof tReach == "number")
        {
            if (npc.system.reach > tReach) 
                return;

            let reach = "system.reach"
            await npc.update({[reach]: tReach});
        }
        else if (typeof tReach == "string")
        {
            let reach = "system.reach"
            let newReach = npc.system.reach + parseInt(tReach);
            if (newReach < 1) newReach = 1
            await npc.update({[reach]: newReach});
        }
        if (npc.system.footprint.width < footprint[0]) 
        {
            let width = "system.footprint.width";
            await npc.update({[width]: footprint[0]});
        }
        if (npc.system.footprint.height < footprint[1]) 
        {
            let height = "system.footprint.height";
            await npc.update({[height]: footprint[1]});
        }
        if (tType != null && !npc.system.type.value.includes(tType)) 
        {
            npc.system.type.value.push(tType)
            let type = "system.type.value"
            await npc.update({[type]: npc.system.type.value});
        }
        if (tSpeed != null && npc.system.movement[tSpeed[0]].value < 40)
        {
            let newSpeed = "system.movement." + tSpeed[0] + ".value"
            await npc.update({[newSpeed]: tSpeed[1]});
        }
    }

    async changeGrade(trait, value)
    {
        let newGrade = Utils.numeralConverter(this.actor.system.traits[trait].grade) + value;
        if (newGrade > 10) newGrade = 10;
        if (newGrade < 1) newGrade = 1;
        newGrade = Utils.numberToNumeralConverter(newGrade);

        let gradeString = "system.traits." + trait + ".grade"
        await this.actor.update({[gradeString]: newGrade})
    }

    async addFeature(feature, grade = "", points = 0, entries = "")
    {
        const features = await Promise.all(feature.map(id => fromUuid(id)));

        let existingFeature = this.checkFeaturesForDoubles(features[0]);
        // if the character already has a feature of the same name.
        if (existingFeature != null)
        {
            //if the new version has a higher grade/point value/new entries add those to the existing feature before returning, otherwise just return
            if (grade != "" && Utils.numeralConverter(grade) > Utils.numeralConverter(existingFeature.system.grades.value))
            {
                let newGrade = "system.grades.value"
                existingFeature.update({[newGrade]: grade});
            }
            if (points > existingFeature.system.number)
            {
                let newNum = "system.number"
                existingFeature.update({[newNum]: points});
            }
            if (entries != "" && !existingFeature.system.damageTypes.string.includes("entries"))
            {
                let newString = "system.damageTypes.string"
                existingFeature.system.damageTypes.string = existingFeature.system.damageTypes.string + ", " + entries;
                existingFeature.update({[newString]: existingFeature.system.damageTypes.string});
            }
            
            return;
        }

        if (grade != "")
        {
            let newGrade = "system.grades.value"
            features[0].update({[newGrade]: grade});
        }
        if (points > 0)
        {
            let newNum = "system.number"
            features[0].update({[newNum]: points});
        }
        if (entries != "")
        {
            let newString = "system.damageTypes.string"
            features[0].update({[newString]: entries});
        }

        await this.actor.createEmbeddedDocuments("Item", features);
    }

    addSignatureSkill(skill, grade)
    {
        let sigSkills = this.actor.system.signatureSkills;
        if (sigSkills.length >= 5)
            return;
            
        for ( let [k, v] of Object.entries(sigSkills) ) 
        {
            if (v.skillName == skill)
            {
                if (Utils.numeralConverter(v.skillGrade) >= Utils.numeralConverter(grade))
                    return;
                else 
                {
                    v.skillGrade = grade;
                    return;
                }
            }
        }

        sigSkills.push({skillName: skill, skillGrade: grade, skillBonus: 0});

        this.actor.update({"system.signatureSkills": sigSkills});

    }

    async createNaturalAttack(name, grade, type = "naturalAttack", upgrades = {}, additionalInfo = null)
    {
        let itemName = name;

        itemName = game.i18n.localize("fantasycraft." + name)
      
        const itemData = {
            name: itemName,
            type: "attack",
            system: {naturalAttack: name, attackGrade: grade, attackType: type, naturalUpgrades: upgrades, ...additionalInfo }
        };

        await this.actor.createEmbeddedDocuments("Item", [itemData]);

    }

    checkFeaturesForDoubles(feature)
    {
        let featureCheck = this.actor.itemTypes.feature.find(c => c.name == feature.name)
        
        if (featureCheck)
            return featureCheck;

        let featCheck = this.actor.itemTypes.feat.find(c => c.name == feature.name)
        
        if (featCheck)
            return featCheck;
            
        return null;
    }

    async changeNaturalAttackGrades(number)
    {
        let naturalAttacks = this.actor.items.filter(function(item) {return item.type == 'attack'});

        if (naturalAttacks.length == 0)
            return;

        for (let attack of naturalAttacks)
        {
            let newGrade = Utils.numeralConverter(attack.system.attackGrade);
            newGrade = newGrade + number;
            if (newGrade > 10) newGrade = 10;
            else if (newGrade < 1) newGrade = 1;
            newGrade = Utils.numberToNumeralConverter(newGrade);
            let attackString = "system.attackGrade";
            await attack.update({[attackString]: newGrade});
        }
    }

    //Utility Functions

    sizeToNumber(size)
    {
        if (size == "nuisance") return -5;
        if (size == "fine") return -4;
        if (size == "diminutive") return -3;
        if (size == "tiny") return -2;
        if (size == "small") return -1;
        if (size == "medium") return 0;
        if (size == "large") return 1;
        if (size == "huge") return 2;
        if (size == "gargantuan") return 3;
        if (size == "colossal") return 4;
        if (size == "enormous") return 5;
        if (size == "vast") return 6;
    }

    numberToSize(number)
    {
        if (number == -5) return "nuisance";
        if (number == -4) return "fine";
        if (number == -3) return "diminutive";
        if (number == -2) return "tiny";
        if (number == -1) return "small";
        if (number == 0) return "medium";
        if (number == 1) return "large";
        if (number == 2) return "huge";
        if (number == 3) return "gargantuan";
        if (number == 4) return "colossal";
        if (number == 5) return "enormous";
        if (number == 6) return "vast";
    }
  }
  