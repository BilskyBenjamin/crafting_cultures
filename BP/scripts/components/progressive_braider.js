import { ItemStack } from "@minecraft/server";

export function registerProgressiveBraider(itemRegistry){
  itemRegistry.registerCustomComponent('cc:progressive_braider', {
    onCompleteUse({ source, itemStack }, { params }) {
      const equippable = source.getComponent("minecraft:equippable");
      if (!equippable) return;
      const durabilityComp = itemStack.getComponent("minecraft:durability");
      if (!durabilityComp) return;
      const newDamage = durabilityComp.damage - 1;
      const currentIndex = parseInt(itemStack.typeId.split("_").pop());
      const nextIndex = currentIndex + 1;
      const finalItem = params.final_item || "cc:sweetgrass_braid";
      const maxIndex = params.max_index || 2;
      if (nextIndex > maxIndex) {
        equippable.setEquipment("Mainhand", new ItemStack(finalItem, 1));
      } else {
        const nextItemId = `cc:incomplete_sweetgrass_braid_${nextIndex}`;
        const nextItem = new ItemStack(nextItemId, 1);
        const nextDurabilityComp = nextItem.getComponent("minecraft:durability");
        if (nextDurabilityComp) nextDurabilityComp.damage = newDamage;
        equippable.setEquipment("Mainhand", nextItem);
      }
    }
  });
}
