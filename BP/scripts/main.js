import { system, world, ItemStack } from "@minecraft/server";
import { registerBlockSpreader } from "./components/block_spreader.js";
import { registerBlockGrower } from "./components/block_grower.js";
import { registerSideAttachment } from "./components/side_attachment.js";
import { registerBonemealDropper } from "./components/bonemeal_dropper.js";
import { registerBraidable } from "./components/braidable.js";
import { registerProgressiveBraider } from "./components/progressive_braider.js";
import { registerDryable } from "./components/dryable.js";
import { registerPlaces } from "./components/places.js";
import { registerSmudgeContainer } from "./components/smudge_container.js";
import { registerSmudgeable } from "./components/smudgeable.js";

system.run(() => { world.sendMessage("Crafting Cultures has loaded."); });

system.beforeEvents.startup.subscribe(ev => {
  const blockReg = ev.blockComponentRegistry;
  const itemReg = ev.itemComponentRegistry;
  // block components
  registerBlockSpreader(blockReg);
  registerBlockGrower(blockReg);
  registerSideAttachment(blockReg);
  registerDryable(blockReg);
  registerBonemealDropper(blockReg);
  registerSmudgeContainer(blockReg);
  // item components
  registerBraidable(itemReg);
  registerProgressiveBraider(itemReg);
  registerPlaces(itemReg);
  registerSmudgeable(itemReg);
});

// Bark drop logic (unchanged)
const axes = [
  "minecraft:wooden_axe","minecraft:stone_axe","minecraft:iron_axe","minecraft:golden_axe","minecraft:diamond_axe","minecraft:netherite_axe"
];
world.afterEvents.playerInteractWithBlock.subscribe(e => {
  if (e.beforeItemStack) {
    if (axes.includes(e.beforeItemStack.typeId) && e.block.typeId.includes("stripped")) {
      const regex = /stripped_([a-zA-Z]+)_/;
      const match = e.block.typeId.match(regex);
      const typeString = match[1];
      let amount = Math.floor(Math.random()*3)+1;
      const enchant = e.beforeItemStack.getComponent("minecraft:enchantable").getEnchantment("minecraft:looting")?.level;
      if (enchant) amount += enchant;
      world.getDimension(e.player.dimension.id).spawnItem(new ItemStack("cc:"+typeString+"_bark", amount), e.block.location);
    }
  }
});