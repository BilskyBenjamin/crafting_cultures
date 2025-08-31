import { BlockPermutation } from "@minecraft/server";
import { trySpread } from "../helpers.js";

export function registerBlockSpreader(registry){
  registry.registerCustomComponent('cc:block_spreader', {
    onTick(e){
      if (Math.random()<0.01){
        trySpread(e.block);
      }
    }
  });
}
