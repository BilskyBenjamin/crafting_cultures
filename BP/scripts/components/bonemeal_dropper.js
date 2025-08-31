import { ItemStack, EquipmentSlot, GameMode } from "@minecraft/server";

export function registerBonemealDropper(itemRegistry){
  itemRegistry.registerCustomComponent('cc:bonemeal_dropper', {
    onPlayerInteract({ block, dimension, player }, { params }) {
      if (!player) return;
      const equippable = player.getComponent("minecraft:equippable");
      if (!equippable) return;
      const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
      if (!mainhand.hasItem() || mainhand.typeId !== "minecraft:bone_meal") return;

      const dropChance = params.drop_chance || 0.2;
      if (Math.random() < dropChance) {
        const itemToDrop = params.drop_item || block.typeId;
        const dropAmount = params.drop_amount || 1;
        dimension.spawnItem(new ItemStack(itemToDrop, dropAmount), block.center());
      }
      if (player.getGameMode() !== GameMode.Creative) {
        if (mainhand.amount > 1) mainhand.amount--; else mainhand.setItem(undefined);
      }
      const effectLocation = block.center();
      dimension.playSound("item.bone_meal.use", effectLocation);
      dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);
    }
  });
}
