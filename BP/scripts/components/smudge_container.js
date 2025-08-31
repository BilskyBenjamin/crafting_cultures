import { ItemStack, world, system } from "@minecraft/server";

const BURN_TOTAL_BUCKETS = 10; // visual/remaining counter (not duration seconds)
const durationCache = new Map(); // key: dim|x|y|z  -> seconds

function key(block){
  const l = block.location; return `${block.dimension.id}|${l.x}|${l.y}|${l.z}`;
}

function getState(block, id){
  return block.permutation.getState(id);
}
function setStates(block, kv){
  let perm = block.permutation;
  for (const [k,v] of Object.entries(kv)) perm = perm.withState(k, v);
  block.setPermutation(perm);
}

export function registerSmudgeContainer(blockRegistry){
  blockRegistry.registerCustomComponent('cc:smudge_container', {
    tickInterval: 20,
    onPlayerInteract(ev){
      try {
        const { block, player } = ev; if(!block||!player) return;
        const stage = getState(block, 'cc:smudge_stage');
        const heldSlot = player.getComponent('minecraft:equippable')?.getEquipmentSlot('Mainhand');
        const item = heldSlot?.getItem();

        // Ignite loaded smudge
        if (item?.typeId === 'minecraft:flint_and_steel' && stage === 1){
          setStates(block, { 'cc:smudge_remaining': BURN_TOTAL_BUCKETS, 'cc:smudge_stage': 2 });
          const dur = item.getComponent('minecraft:durability');
          if (dur){ dur.damage += 1; heldSlot.setItem(item); }
          return;
        }

        // Load smudgeable
        if (stage === 0){
          if (!item?.hasComponent?.('cc:smudgeable')) return;
          const params = item.getComponent('cc:smudgeable')?.customComponentParameters?.params;
          if (!params?.effect) return;
          const effectKey = normalizeEffect(params.effect);
          durationCache.set(key(block), params.duration);
          setStates(block, {
            'cc:smudge_effect': effectKey,
            'cc:smudge_remaining': BURN_TOTAL_BUCKETS,
            'cc:smudge_stage': 1
          });
          if (item.amount > 0){ item.amount -= 1; heldSlot.setItem(item.amount?item:undefined); }
          return;
        }

        // Eject (sneak + loaded)
        if (player.isSneaking && stage === 1){
          durationCache.delete(key(block));
          setStates(block, { 'cc:smudge_stage': 0, 'cc:smudge_effect': 'none', 'cc:smudge_remaining': 0 });
          return;
        }
      } catch (e){world.sendMessage(e.message)}
    },
    onTick({ block }){
      try {
        if (getState(block,'cc:smudge_stage') !== 2) return;
        let rem = getState(block,'cc:smudge_remaining');
        if (rem > 0){
          rem -= 1;
          setStates(block, { 'cc:smudge_remaining': rem });
          block.dimension.spawnParticle('minecraft:campfire_smoke_particle', block.center());
        }
        if (rem <= 0){
          applySmudgeEffect(block);
          durationCache.delete(key(block));
          setStates(block, { 'cc:smudge_stage': 0, 'cc:smudge_effect': 'none', 'cc:smudge_remaining': 0 });
        }
      } catch (e){world.sendMessage(e.message)}
    }
  });
}

function normalizeEffect(e){
  if (!e) return 'none';
  const known=['cleanse','calm','speed','regeneration', 'absorption'];
  return known.includes(e)?e:'custom';
}

function applySmudgeEffect(block){
  try {
    const effectKey = getState(block,'cc:smudge_effect') || 'none';
    if (effectKey==='none') return;
    const seconds = durationCache.get(key(block)) ?? 0;
    if (seconds <= 0) return;
    const players = block.dimension.getPlayers({ location: block.location, maxDistance: 6 });
    for (const p of players){
      try {
        switch(effectKey){
          case 'cleanse':
            const NEGATIVE = ['minecraft:slowness','minecraft:mining_fatigue','minecraft:nausea','minecraft:blindness','minecraft:hunger','minecraft:weakness','minecraft:poison','minecraft:fatal_poison','minecraft:wither','minecraft:levitation','minecraft:darkness','minecraft:bad_omen','minecraft:instant_damage'];
            for (const eff of p.getEffects()) if (NEGATIVE.includes(eff.typeId)) p.removeEffect(eff.typeId);
            break;
          case 'calm':
            p.addEffect('minecraft:slow_falling', seconds*20, { showParticles:false });
            break;
          default:
            p.addEffect(effectKey, seconds*20, { showParticles:true });
        }
      } catch (e){world.sendMessage(e.message)}
    }
  } catch (e){world.sendMessage(e.message)}
}
