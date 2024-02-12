import * as Utils from '../Utils.js';
export default function renderGMScreen() {
    const system = game.system;
    const moduleId = system.id;
    const title = system.data.title;
    game.settings.register(title, 'version', {
        name: `${title}`,
        default: "0.0.0",
        type: String,
        scope: 'world',
    });


    class GMScreen extends Application {
        static get defaultOptions() {
            const options = super.defaultOptions;
            options.template = `systems/fantasycraft/templates/gm-screen.handlebars`;
            options.resizable = false;
            options.width = 320;
            options.height = 285;
            options.classes = ["gm-screen"];
            options.title = `${title} - Game Master Screen`;

            return options;
        }

        /** @override */
        getData(html)
        {
            const data = super.getData();

            data.gmActionDice = 3

            return data;
        }

        activateListeners(html) {
            super.activateListeners(html);

            html.find('.newScene').click(newScene.bind(this));
            html.find('.newSession').click(newSession.bind(this));
            html.find('.newAdventure').click(newAdventure.bind(this));
            html.find('.awardAD').click(awardAD.bind(this));
            html.find('.numberOfPlayers').change(gmActionDice.bind(this));
            html.find('.menaceLevel').change(gmActionDice.bind(this));
            html.find('.rollAD').click(rollAD.bind(this));
        
        }
    }

    (new GMScreen()).render(true);
}

function gmActionDice(event)
{
    event.preventDefault();

    const element = event.currentTarget.parentElement;
    let numPlayers = element.children[1].value;
    let menace = element.children[3].value;

    let gmAD = element.parentElement.children[5];
    gmAD.children[3].value = parseInt(numPlayers) + (parseInt(menace) *2);
    
    gmAD.children[1].value = gmAD.children[3].value;

}

function newScene()
{
    //find all PCs
    let characters = game.actors.filter(item => item.type =="character");

    for (let character of Object.entries(characters))
    {
        character = character[1];

        let tricks = character.items.filter(item => item.type == "trick" && item.system?.uses.timeFrame == "scene");

        //reset any tricks that refresh on scene change. 
        for (let trick of Object.entries(tricks))
        {
            trick = trick[1];

            let updateString = "system.uses.usesRemaining"
            trick.update({[updateString]: trick.system.uses.maxUses})
        }

        //reset their spellpoints to max
        if (character.system.arcane.spellPointMax > 0)
        {
            let updateString = "system.arcane.spellPoints"
            character.update({[updateString]: character.system.arcane.spellPointMax})
        }
    }

}

function newSession()
{
    let characters = game.actors.filter(item => item.type =="character");

    for (let character of Object.entries(characters))
    {
        character = character[1];

        //reset their action dice to their starting AD
        let updateString = "system.actionDice"
        character.update({[updateString]: character.system.startingActionDice})

        let tricks = character.items.filter(item => item.type == "trick" && item.system?.uses.timeFrame == "session");

        //reset any tricks that refresh on session change. 
        for (let trick of Object.entries(tricks))
        {
            trick = trick[1];

            let updateString = "system.uses.usesRemaining"
            trick.update({[updateString]: trick.system.uses.maxUses})
        }
    }
}


function newAdventure()
{
    let characters = game.actors.filter(item => item.type =="character");

    for (let character of Object.entries(characters))
    {
        character = character[1];

        //convert coin in hand to stake
        if (character.system.coin.inHand > 0)
        {
            let newValue = Math.ceil(character.system.coin.inHand * (character.system.lifeStyle.savedEarned / 100));
            let updateString = "system.coin.inHand"
            character.update({[updateString]: 0})

            updateString = "system.coin.stake"
            character.update({[updateString]: character.system.coin.stake + newValue});
        }

        let tricks = character.items.filter(item => item.type == "trick" && item.system?.uses.timeFrame == "adventure");

        //reset any tricks that refresh on session change. 
        for (let trick of Object.entries(tricks))
        {
            trick = trick[1];

            let updateString = "system.uses.usesRemaining"
            trick.update({[updateString]: trick.system.uses.maxUses})
        }
    }
}

function awardAD(event)
{
    let element = event.currentTarget.parentElement.parentElement.children[5].children[1];
    let targets = Utils.getTargets();
    let characterList = "";

    for (let target of Object.entries(targets))
    {
        characterList = (target[0] == 0) ? characterList + target[1].document.actor.name : characterList + ", " + target[1].document.actor.name ;
        target = target[1].document.actor;
        if (target.type == "character")
        {
            let updateString = "system.actionDice"
            target.update({[updateString]: target.system.actionDice +1})

            element.value = parseInt(element.value) + 1;
        }
    }

    if (targets.length == 1)
        ui.notifications.warn("Congratulations! " + characterList + " was awarded an Action Dice!")
    if (targets.length > 1)
        ui.notifications.warn("Congratulations! " + characterList + " were each awarded an Action Dice!")
}

function rollAD(event)
{
    let diceSize = event.currentTarget.outerText;
    diceSize = (diceSize[1] == 1 || diceSize[1] == 2) ? parseInt(diceSize.slice(1)): parseInt(diceSize[1]);
    const speaker = ChatMessage.getSpeaker();
    const token = ChatMessage.getSpeakerActor(speaker);
    let explodesOn = diceSize;
    let rollFormula = "d" + diceSize + "x";
    let rollData;
    //if a token is selected during the roll
    if (token != null)
    {
        //Check to see if the character has any flags that modify AD, if so add to the roll formula
        let explodesOn = (token.getFlag("fantasycraft", "Lady Luck's Smile")) ? ">=" + (diceSize - 1) : diceSize;
        rollFormula += explodesOn;
        if (token.getFlag("fantasycraft", "Fortune Favors the Bold"))
            rollFormula += " + @fortuneFavors";

        if (token.getFlag("fantasycraft", "Grace under Pressure"))
            rollFormula += " + @graceUnderPressure";

        rollData = 
        {
            fortuneFavors: (token.getFlag("fantasycraft", "Fortune Favors the Bold")) ? 2 : 0,
            graceUnderPressure:  (token.getFlag("fantasycraft", "Grace under Pressure")) ? 2 :0 
        };
    }
    else 
    {
        rollData = {};
    
        rollFormula += explodesOn;
    }

    let messageData = 
    {
        speaker: ChatMessage.getSpeaker()
    }

    new Roll(rollFormula, rollData).toMessage(messageData);
}