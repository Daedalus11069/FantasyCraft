export const preloadHandlebarsTemplates = async function() {

    // Define template paths to load
    const templatePaths = [
  
      // Actor Sheet Partials
      "systems/fantasycraft/templates/sheets/pages/combat-page.handlebars",
      "systems/fantasycraft/templates/sheets/pages/spellcasting.handlebars",
      "systems/fantasycraft/templates/sheets/pages/character-info.handlebars",
      "systems/fantasycraft/templates/sheets/pages/items-and-reputation.handlebars",
      "systems/fantasycraft/templates/sheets/pages/features.handlebars",

      "systems/fantasycraft/templates/sheets/pages/npc-calculated.handlebars",

      "systems/fantasycraft/templates/items/parts/item-description.handlebars",
      "systems/fantasycraft/templates/items/parts/details.handlebars",
      "systems/fantasycraft/templates/items/parts/effects.handlebars",
      "systems/fantasycraft/templates/items/parts/charms.hbs",
      "systems/fantasycraft/templates/items/parts/essences.hbs",
      "systems/fantasycraft/templates/items/parts/weapon-customization.handlebars",
      "systems/fantasycraft/templates/items/parts/spell-customization.handlebars",
      "systems/fantasycraft/templates/items/parts/durationInformation.handlebars",
      "systems/fantasycraft/templates/items/parts/path-step-part.hbs",

      "systems/fantasycraft/templates/partials/item-part.hbs",
      "systems/fantasycraft/templates/partials/weapon-part.hbs",
      "systems/fantasycraft/templates/partials/attack-part.hbs",
      "systems/fantasycraft/templates/partials/spell-table.hbs",
      "systems/fantasycraft/templates/partials/spell-part.hbs",
      "systems/fantasycraft/templates/chat/weapon-chat.hbs",
      "systems/fantasycraft/templates/chat/natural-chat.hbs",
      "systems/fantasycraft/templates/chat/damage-chat.hbs",
      "systems/fantasycraft/templates/chat/spell-chat.hbs"
    ];
  
    // Load the template parts
    return loadTemplates(templatePaths);
  };
  