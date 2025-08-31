import { world, system, BlockPermutation } from "@minecraft/server";

const DEBUG = true;
const log = (...args) => { if (DEBUG) console.warn('[cc:places]', ...args); };

const faceOffset = {
    Up:    { x: 0, y: 1, z: 0 },
    Down:  { x: 0, y: -1, z: 0 },
    North: { x: 0, y: 0, z: -1 },
    South: { x: 0, y: 0, z: 1 },
    West:  { x: -1, y: 0, z: 0 },
    East:  { x: 1, y: 0, z: 0 },
};

function extractParams(comp){
    // Prefer nested .customComponentParameters.params shape
    if (comp?.customComponentParameters?.params) return comp.customComponentParameters.params;
    return undefined;
}

function getPlacesParams(itemStack) {
    try {
        if (!itemStack) return;
        const comp = itemStack.getComponent?.('cc:places');
        if (!comp) return;
        return extractParams(comp);
    } catch (e) {
        log('Failed to read cc:places component params', e);
    }
}

export function registerPlaces(itemRegistry){
    itemRegistry.registerCustomComponent('cc:places', {
        onUse() { return { canceled: false }; }
    });

    if (registerPlaces._subscribed) return;
    registerPlaces._subscribed = true;

    world.beforeEvents.playerInteractWithBlock.subscribe(ev => {
        try {
            const { player, block, blockFace, itemStack } = ev;
            if (!itemStack) return;
            if (!itemStack.hasComponent('cc:places')) return;
            const params = getPlacesParams(itemStack);
            const pFace = params.face || null;
            if (pFace) {if  (pFace !== blockFace) return;}
            const needed = params.consume_count ?? params.count ?? 1;
            const consumeId = params.consume_item || itemStack.typeId;
            const targetBlockId = params.block || params.target_block || params.place || params.target;
            const off = faceOffset[blockFace];
            const placeLoc = { x: block.x + off.x, y: block.y + off.y, z: block.z + off.z };
            const dimension = player.dimension;
            const targetBlock = dimension.getBlock(placeLoc);
            if (targetBlock.typeId !== 'minecraft:air') return;

            // Ensure items available
            if (consumeId === itemStack.typeId) {
                if (itemStack.amount < needed) return;
            } else {
                const inv = player.getComponent('minecraft:inventory');
                let available = 0;
                if (inv) {
                    const cont = inv.container;
                    for (let i=0;i<cont.size && available < needed;i++){
                        const it = cont.getItem(i);
                        if (it && it.typeId===consumeId) available += it.amount;
                    }
                }
                if (available < needed) return;
            }

            ev.cancel = true; // suppress default
            system.run(() => {
                try {
                    // Re-fetch block next tick in case something else changed it
                    const fresh = player.dimension.getBlock(placeLoc);
                    if (fresh?.typeId === 'minecraft:air') {
                        fresh.setPermutation(BlockPermutation.resolve(targetBlockId));
                    }
                } catch (e) { log('deferred place failed', e); }
            });

            if (consumeId === itemStack.typeId) {
                system.run(() => {
                    const remaining = Math.max(0, itemStack.amount - needed);
                    const inv = player.getComponent('minecraft:inventory');
                    const cont = inv?.container;
                    if (cont) {
                        if (remaining > 0) {
                            let newStack;
                            try {
                                newStack = itemStack.clone?.() || new ItemStack(itemStack.typeId, remaining);
                                newStack.amount = remaining;
                            } catch (e) {log(e)}
                            cont.setItem(player.selectedSlotIndex, newStack);
                        } else {
                            cont.setItem(player.selectedSlotIndex, undefined);
                        }
                    }
                });
            }
        } catch(e){ log('handler error', e); }
    });
}
