import { findAndReturnConfigInfo } from "./Utils.js";


export async function addAncestry(act, itemData) 
{
    // Apply racial adustments to attribute scores
    for ( let [n, name] of Object.entries(itemData.system.stats)) 
        if (name.value != 0)
        {		
            let abilityString = "system.abilityScores." + name.ability + ".value";
            await act.update({[abilityString]: act.system.abilityScores[name.ability].value + name.value});
        }                
    
    // Add any secondary move types to the character
    if (itemData.system.speed2.type != "none" && itemData.system.speed2.type != "")
    {
        let moveType = "system.movement." + itemData.system.speed2.type + ".value";
        let runSpeed = "system.movement." + itemData.system.speed2.type + ".run";
        let travelSpeed = "system.movement." + itemData.system.speed2.type + ".travel";
        await act.update({[moveType]: itemData.system.speed2.value, [runSpeed]: itemData.system.speed2.value*4, [travelSpeed]: itemData.system.speed2.value/10});
    }

    // Apply ancestries details to the character and add the ancestry's features.
    const features = await getOriginFeatures({ originName: itemData.name });

    for (const feature of features)
    {
        await act.createEmbeddedDocuments("Item", [feature]);
        //after creating the item on the character find the new item on the character and update the source
        let newFeature = act.items.find(item => item.name == feature.name);
        await newFeature.update({"system.source": itemData.name});
    }

    features.forEach(function (feature) {
        if (feature.system.containsFlag)
            act.setFlag("fantasycraft", feature.name, feature.name);
    })

    let ancestryName = (itemData.system.isTalent) ? act.system.ancestry + "/" + itemData.name : itemData.name;

    await act.update({"system.ancestry": ancestryName, "system.movement.ground.value": itemData.system.speed, "system.movement.ground.run": itemData.system.speed*4,
    "system.movement.ground.travel": itemData.system.speed/10, "system.size": itemData.system.size, "system.footprint.width": itemData.system.footprint.width, 
    "system.footprint.height": itemData.system.footprint.height, "system.reach": itemData.system.reach});

    await act.createEmbeddedDocuments("Item", [itemData]);
}

/**
 * Add a new class to a character upon level up.
 * @param {*} act           Reference to the Actor recieving the new class
 * @param {*} classData     Data about the class being added
 */
export async function addClass(act, classData)
{
    const char = act.system;
    classData = (classData.type == "class") ? classData : await fromUuid(classData.class.uuid);

    let features = await getClassFeatures
    ({ 
        className: classData.name, 
        level: 1,
        priorLevel: 0
    });

    // Set all of the skills from that class to class skills for the character.
    for (const skill of classData.system.classSkills.value)
    {
        char.skills[skill].classSkill = true;
        let skillString = "system.skills." + [skill] + ".classSkill";
        await act.update({[skillString]: true});
    }

    //Since this is your first class level, check to see if you already have a class of the same type, if you do remove the core ability before adding abilities to character.
    if (classData.system.levels == 1)
    {
        if (char.careerLevel.value > 0 && classData.system.classType == "base")
        {
            features.pop();
        }
        else if (classData.system.classType == "expert")
        {
            let expert = this.actor.items.find(item => item.type == "class" && item.system.classType == "expert");
            if (!!expert)
                features.pop();
        } 
        else if (classData.system.classType == "master")
        {
            let master = this.actor.items.find(item => item.type == "class" && item.system.classType == "master");
            if (!!master)
                features.pop();
        }
    }
    
    if (features[0] != null){
        await act.createEmbeddedDocuments("Item", [features[0]]);
    if (features.length > 1)
        await act.createEmbeddedDocuments("Item", [features[1]]);
    }

    await act.createEmbeddedDocuments("Item", [classData]);
}

// Function to return the features for a given class level
export async function getClassFeatures({className="", level=1, priorLevel=0, actor=null}={}) 
{
    const clsConfig = await findAndReturnConfigInfo({name: className, type: CONFIG.fantasycraft.classFeatures})
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

export async function playerLevelUp(event, act, nextLevel = null)
{
    let element = event.currentTarget;
    const clss = (nextLevel == null) ? act.itemTypes.class.find(c => c.name == element.closest(".item").dataset.itemName) : act.itemTypes.class.find(c => c.name == nextLevel.class.name);
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
    let features = await getClassFeatures({className: clss.name, level: clss.system.levels, priorLevel: priorLevel, actor: act});
    let clsConfig = await findAndReturnConfigInfo({name: clss.name, type: CONFIG.fantasycraft.classFeatures})

    if (clss.system.eSlot.hasESlot) 
    {
        if (next == clss.system.eSlot.firstLevel || ((next - clss.system.eSlot.firstLevel > 0) && (next - clss.system.eSlot.firstLevel) % clss.system.eSlot.frequency == 0))
        {
        //Expert classes do not get their eSlot on their final level
        if (clss.system.classType == "base" || (clss.system.classType == "expert" && next != 10))
        {
            let eSlotFeature = await _getESlotFeature(act, clsConfig);
            let newFeature = await Promise.all(eSlotFeature.map(id => fromUuid(id)));
            features = features.concat(newFeature);
        }
        }
    }

    features = _checkFeaturesForDoubles(features, act);

    for (let i = 0; i < features.length; i++)
    {
        await act.createEmbeddedDocuments("Item", [features[i]]);
    }

    //if any of the owned class features has a number of 0, set it to 1;
    act.items.filter(item => item.type == "feature" && item.system.number == 0).forEach(item => item.system.number = 1);
    }
}

function _checkFeaturesForDoubles(featureList, actor)
{
    // Check to see if the character already has something with the same name
    // if they do add 1 to the number owned of that feature and remove that id from the array
    for (let i = featureList.length - 1; i >= 0; i--)
    {
    let feature = actor.itemTypes.feature.find(c => c.name == featureList[i].name)
    if (feature)
    {
        //increase the number on the feature on the actor
        _increaseItemCount(feature);
                
        //remove the feature from the featureList.
        featureList.splice(i, 1);
    }
    }

    return featureList;
}


async function _increaseItemCount(item)
{
    await item.update({"system.number": item.system.number + 1});
}


async function _getESlotFeature(act, clsConfig)
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
            callback: html => resolve(act.returnSelection(html))
        }
        },
        close: () => resolve(null)
    }).render(true);
    });
}
export async function getSpecialty(act, itemData) 
{
    // Start by getting the feat that the specialty provides and adding to the sheet
    const feat = await getFeat({ specialtyName: itemData.name });
    if (feat != null) await act.createEmbeddedDocuments("Item", [feat]);

    // Get the different features added by the Specialty to add them to the sheet. 
    const features = await getOriginFeatures({originName: itemData.name});
    for (const feature of features)
    {
        await act.createEmbeddedDocuments("Item", [feature]);
        //after creating the item on the character find the new item on the character and update the source
        let newFeature = act.items.find(item => item.name == feature.name);
        await newFeature.update({"system.source": itemData.name});
    }

    //alter practiced and attribute training items on the sheet. 
    _alterOptions(act, itemData)
}

async function _alterOptions(act, itemData)
{
    let practiced = act.itemTypes.feature.filter(f => f.name == "Practiced");
    let attribute = act.itemTypes.feature.find(f => f.name == "Attribute Training");
    let skillPair = act.itemTypes.feature.find(f => f.name == "Paired Skills");
    let featExpert = act.itemTypes.feature.find(f => f.name == "Feat Expert");
    // Practiced skills
    if (!!practiced)
    {
        for (let i = 0; i < practiced.length; i++)
        {
            let practicedSkill = await getSkillOrStats({ originName: itemData.name, searchObject: "skill"})
            let newName = "Practiced " + practicedSkill[i];
            await practiced[i].update({name: newName});
        }
    }

    //Attribute Training
    if(!!attribute)
    {
        let attributeTraining = await getSkillOrStats({ originName: itemData.name, searchObject: "attribute"})
        let newDescription = "The lower of your " + attributeTraining[0] + " or " + attributeTraining[1] + " increases by 1, your choice in the case of a tie.";

        await attribute.update({"system.description.value": newDescription, name: "Attribute Training (" + attributeTraining[0] + ", " + attributeTraining[1]});
    }

    //Paired Skills
    if(!!skillPair)
    {
        let pairedSkill = await getSkillOrStats({ originName: itemData.name, searchObject: "paired"})
        let newDescription = "Whenever you gain ranks in " + pairedSkill[0] + " you gain equal ranks in  " + pairedSkill[1] + ". This may not increase " + pairedSkill[1] + " beyond its maximum ranks.";

        await skillPair.update({"system.description.value": newDescription, name: "Paired Skills (" + pairedSkill[0] + ", " + pairedSkill[1]});
    }

    //Feat Expert
    if(!!featExpert)
    {
        let featType = await getSkillOrStats({ originName: itemData.name, searchObject: "feat"})
        let newName = featType + " Expert";

        await featExpert.update({name: newName});
    }
}

export async function getSkillOrStats({originName="", searchObject="skill"})
{
    const ognConfig = await findAndReturnConfigInfo({name: originName, type: CONFIG.fantasycraft.originFeatures})
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

// Get the configuration of features which may be added
// Function to return the features for a given origin (ancestry, talent or specialty)
export async function getOriginFeatures({originName=""})
{
    const ognConfig = await findAndReturnConfigInfo({name: originName, type: CONFIG.fantasycraft.originFeatures})
    if (!ognConfig) return [];

    let ids = [];
    for ( let [l, f] of Object.entries(ognConfig.features || {}) ) {
    ids = ids.concat(f);
    }

    // Load item data for all identified features
    const features = await Promise.all(ids.map(id => fromUuid(id)));

    return features;
}

// Function to return the feat for a given specialty
export async function getFeat({specialtyName="",}={}) 
{
    const spcConfig = await findAndReturnConfigInfo({name: specialtyName, type: CONFIG.fantasycraft.originFeatures})
    if (!spcConfig) return [];

    // Acquire the feat from the specialty
    let id = spcConfig.feat;

    // Load item data for all identified features
    const features = await Promise.resolve(fromUuid(id));

    return features;
}