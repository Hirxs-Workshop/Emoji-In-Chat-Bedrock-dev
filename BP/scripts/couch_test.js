import { system, world, BlockPermutation, ItemStack, MolangVariableMap } from "@minecraft/server";
function changeFurnitureColor(player, block) {
    const holdItem = player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex)?.typeId;
    if (holdItem?.endsWith('_dye')) {
        const newColor = holdItem.replace('minecraft:', '').replace('_dye', '');
        const oldColor = ['white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black'].find(color => block.typeId.includes(color));
        if (oldColor && oldColor !== newColor) {
            const data = [
                ["white", "1", "1", "1"],
                ["light_gray", "0.827", "0.827", "0.827"],
                ["gray", "0.333", "0.333", "0.333"],
                ["brown", "0.4039", "0.1922", "0.0392"],
                ["red", "0.9843", "0.2118", "0.1451"],
                ["orange", "1", "0.647", "0"],
                ["yellow", "1", "1", "0"],
                ["lime", "0.502", "1", "0"],
                ["green", "0.3686", "0.6", "0.0353"],
                ["cyan", "0.1765", "0.4863", "0.6157"],
                ["light_blue", "0.3843", "0.6", "1"],
                ["blue", "0.1019", "0.3216", "0.9333"],
                ["purple", "0.502", "0", "0.502"],
                ["magenta", "1", "0", "1"],
                ["pink", "1", "0.753", "0.796"]
            ];
            const colorValues = data.find(item => item[0] === newColor) || ["", "0", "0", "0"];
            const extractedColor = {
                red: parseFloat(colorValues[1]),
                green: parseFloat(colorValues[2]),
                blue: parseFloat(colorValues[3])
            };

            const molang = new MolangVariableMap();
            molang.setColorRGB("variable.color", extractedColor);
            player.dimension.spawnParticle("venture:dye_furniture", block.center(), molang)
            player.dimension.playSound('sign.ink_sac.use', block.location);
            const newBlock = block.typeId.replace(oldColor, newColor);
            block.setPermutation(BlockPermutation.resolve(newBlock, block.permutation.getAllStates()));
            usedReduce(player);
            return true;
        }
    }
}
function returnRotation(cardinalDirection) {
    const rotations = { north: 0, east: 90, south: 180, west: -90 };
    return rotations[cardinalDirection] ?? -90;
}
function modifyCurrentCurtain(block, settingType) {
    if (!block.typeId.endsWith('curtain')) return;
    let direction = normalizeDirection(block.permutation.getState('minecraft:cardinal_direction'));
    if (direction === 'north' || direction === 'south') {
        expandCurtain(block, 'east', 'west', settingType, 'curtain');
    } else {
        expandCurtain(block, 'north', 'south', settingType, 'curtain');
    };
}
function normalizeDirection(direction) {
    if (direction === 'south') return 'north';
    if (direction === 'west') return 'east';
    return direction;
}
function settingInBetweenCurtain(block, start, end, settingType) {
    if (start.x === end.x && start.z === end.z) {
        let height = block.below().isAir ? 2 : 1;
        block.setPermutation(BlockPermutation.resolve(block.typeId, { 'venture:curtain_state': 'both', 'venture:height': height, 'minecraft:cardinal_direction': normalizeDirection(block.permutation.getState('minecraft:cardinal_direction')) }));
        return
    };
    [start, end] = (start.x > end.x || (start.x === end.x && start.z > end.z)) ? [end, start] : [start, end];
    const [xStart, yNorm, zStart] = [start.x, start.y, start.z];
    const [xEnd, zEnd] = [end.x, end.z];
    let finalDirection = normalizeDirection(block.permutation.getState('minecraft:cardinal_direction'));
    if (settingType === 'normal') {
        if (xStart !== xEnd) {
            for (let xLoop = Math.min(xStart, xEnd) + 1; xLoop < Math.max(xStart, xEnd); xLoop++) {
                block.dimension.getBlock({ x: xLoop, y: yNorm, z: zStart }).setPermutation(modifyPermutation(block, 'venture:height', 1));
            }
        } else {
            for (let zLoop = Math.min(zStart, zEnd) + 1; zLoop < Math.max(zStart, zEnd); zLoop++) {
                block.dimension.getBlock({ x: xStart, y: yNorm, z: zLoop }).setPermutation(modifyPermutation(block, 'venture:height', 1));
            }
        };
        block.dimension.getBlock(start).below().isAir ? block.dimension.getBlock(start).setPermutation(BlockPermutation.resolve(block.typeId, { 'venture:curtain_state': 'open_left', 'venture:height': 2, 'minecraft:cardinal_direction': finalDirection })) : undefined;
        block.dimension.getBlock(end).below().isAir ? block.dimension.getBlock(end).setPermutation(BlockPermutation.resolve(block.typeId, { 'venture:curtain_state': 'open_right', 'venture:height': 2, 'minecraft:cardinal_direction': finalDirection })) : undefined;
    } else if (settingType === 'closed') {
        if (xStart !== xEnd) {
            for (let xLoop = Math.min(xStart, xEnd); xLoop <= Math.max(xStart, xEnd); xLoop++) {
                let selectedBlock = block.dimension.getBlock({ x: xLoop, y: yNorm, z: zStart });
                let height = selectedBlock.below().isAir ? 2 : 1;
                selectedBlock.setPermutation(BlockPermutation.resolve(block.typeId, { 'venture:curtain_state': 'none', 'venture:is_closed': true, 'venture:height': height, 'minecraft:cardinal_direction': finalDirection }));
            }
        } else {
            for (let zLoop = Math.min(zStart, zEnd); zLoop <= Math.max(zStart, zEnd); zLoop++) {
                let selectedBlock = block.dimension.getBlock({ x: xStart, y: yNorm, z: zLoop });
                let height = selectedBlock.below().isAir ? 2 : 1;
                selectedBlock.setPermutation(BlockPermutation.resolve(block.typeId, { 'venture:curtain_state': 'none', 'venture:is_closed': true, 'venture:height': height, 'minecraft:cardinal_direction': finalDirection }));
            }
        };
    }
}
function settingInBetweenSofa(block, start, end) {
    if (start.x === end.x && start.z === end.z) {
        block.setPermutation(modifyPermutation(block, 'venture:arm_state', 'both'));
        return
    };
    [start, end] = (start.x > end.x || (start.x === end.x && start.z > end.z)) ? [end, start] : [start, end];
    const [xStart, yNorm, zStart] = [start.x, start.y, start.z];
    const [xEnd, zEnd] = [end.x, end.z];
    try {
        if (xStart !== xEnd) {
            for (let xLoop = Math.min(xStart, xEnd) + 1; xLoop < Math.max(xStart, xEnd); xLoop++) {
                block.dimension.getBlock({ x: xLoop, y: yNorm, z: zStart }).setPermutation(modifyPermutation(block, 'venture:arm_state', 'none'));
            }
        } else {
            for (let zLoop = Math.min(zStart, zEnd) + 1; zLoop < Math.max(zStart, zEnd); zLoop++) {
                block.dimension.getBlock({ x: xStart, y: yNorm, z: zLoop }).setPermutation(modifyPermutation(block, 'venture:arm_state', 'none'));
            }
        };
        let sofaDirection = block.permutation.getState('minecraft:cardinal_direction');
        let startDirection = (sofaDirection === 'north' || sofaDirection === 'east') ? 'left' : 'right';
        let endDirection = startDirection === 'left' ? 'right' : 'left';
        block.dimension.getBlock(start).setPermutation(modifyPermutation(block, 'venture:arm_state', startDirection));
        block.dimension.getBlock(end).setPermutation(modifyPermutation(block, 'venture:arm_state', endDirection));
    } catch (error) {
        return;
    };
}
function expandCurtain(block, direction1, direction2, settingType, option) {
    let start = block.location;
    let end = block.location;
    let blockDirection = (settingType === "normal" || settingType === "closed") ? normalizeDirection(block.permutation.getState('minecraft:cardinal_direction')) : block.permutation.getState('minecraft:cardinal_direction');
    let current = block;
    let strict = option === 'curtain' ? false : true;
    while (isMatchingBlock(current[direction1](), block.typeId, blockDirection, strict)) {
        end = current[direction1]().location;
        current = current[direction1]();
    }
    current = block;
    while (isMatchingBlock(current[direction2](), block.typeId, blockDirection, strict)) {
        start = current[direction2]().location;
        current = current[direction2]();
    }
    option === 'curtain' ? settingInBetweenCurtain(block, start, end, settingType) : settingInBetweenSofa(block, start, end);
}
function isMatchingBlock(block, typeId, direction, restrict) {
    if (block?.typeId !== typeId) return false;
    let blockDirection = restrict ? block.permutation.getState('minecraft:cardinal_direction') : normalizeDirection(block.permutation.getState('minecraft:cardinal_direction'));
    return blockDirection === direction;
}
function modifyPermutation(block, permutationName, state) {
    return block.permutation.withState(permutationName, state);
};
let currentlyInteracting = false;
function sitPlacementInit(block, player, ridingEntity, onTop) {
    if (player?.getComponent('minecraft:riding')) return;
    onTop ? onTop = block.above().bottomCenter() : onTop = block.center();
    let sitPlacement = player.dimension.spawnEntity(ridingEntity, onTop);
    sitPlacement.getComponent('minecraft:rideable').addRider(player);
    ridingEntity === 'venture:sit_placement' ? sitPlacement.setRotation({ x: 0, y: returnRotation(block.permutation.getState('minecraft:cardinal_direction')) }) : undefined;
    player.ridingCheck = system.runInterval(() => {
        if (!sitPlacement?.getComponent('minecraft:rideable')?.getRiders()[0]) {
            system.clearRun(player.ridingCheck);
            sitPlacement?.remove();
        }
    });
}
const traitList = [
    'white', 'orange', 'magenta', 'light_blue', 'yellow', 'lime', 'pink', 'gray', 'light_gray', 'cyan', 'purple', 'blue', 'brown', 'green', 'red', 'black',
    'oak', 'spruce', 'birch', 'jungle', 'acacia', 'dark_oak', 'crimson', 'warped', 'cherry', 'bamboo', 'mangrove'
]
const decomposedMaterial = {
    'sofa': { '$wool': 3, 'stick': 2, 'oak_planks': 2 },
    'chair': { '$planks': 4, 'stick': 2 },
    'engraved_chair': { '$planks': 3, 'stick': 3 },
    'lamp': { 'torch': 1, 'stick': 1, '$wool': 3 },
    'drawer': { '$planks': 6, 'stick': 1 },
    'stool': { 'oak_planks': 2, '$wool': 3 },
    'tall_stool': { 'oak_planks': 5, '$wool': 3 },
    'shelf': { '$planks': 3, 'stick': 1 },
    'piano': { 'oak_planks': 8, 'noteblock': 1 },
    'bird_cage': { 'stick': 8 },
    'brick_oven': { 'brick': 8, 'coal': 1 },
    'terracotta_tea_pot': { 'brick': 7 },
    'item_sign': { 'oak_planks': 6, 'chain': 2 },
    'clock': { 'clock': 1, 'stick': 4 },
    'curtain': { '$wool': 4, 'stick': 2 },
    'based_grandfather_clock': { '$planks': 8, 'clock': 1 },
    'awning': { '$carpet': 4 },
    'wind_bell': { 'iron_ingot': 2, 'chain': 1 },
    'table': { '$planks': 3, 'stick': 2 }
}
world.afterEvents.playerPlaceBlock.subscribe((e) => {
    let block = e.block;
    if (block.above().typeId.endsWith('_curtain')) {
        block.dimension.getBlock(block.above().location).setPermutation(modifyPermutation(block.above(), 'venture:height', 1));
    };
    if (block.typeId.startsWith('venture:') && block.below().typeId === 'venture:furniture_design') {
        block.dimension.playSound('venture.saw', block.location)
        let blockTrait = traitList.find(trait => block.typeId.includes(trait)) + '_' || '';
        let bareName = block.typeId.replace('venture:', '').replace(blockTrait, '');
        let decomposed = decomposedMaterial[bareName];
        for (let key in decomposed) {
            if (decomposed.hasOwnProperty(key)) {
                if (key.startsWith('$')) {
                    block.dimension.spawnItem(new ItemStack('minecraft:' + blockTrait + key.replace('$', ''), decomposed[key]), block.center());
                } else {
                    block.dimension.spawnItem(new ItemStack('minecraft:' + key, decomposed[key]), block.center());
                }
            }
        };
        if (block.typeId.endsWith('based_grandfather_clock')) block.above().setPermutation(BlockPermutation.resolve('minecraft:air'));
        block.setPermutation(BlockPermutation.resolve('minecraft:air'));
    }
});
function normalizeAndRotate(d) {
    return ['north', 'west', 'south', 'east'][(['north', 'west', 'south', 'east'].indexOf(d) + 1) % 4];
}
world.beforeEvents.playerPlaceBlock.subscribe((e) => {
    let blockPerm = e.permutationBeingPlaced;
    let blockId = blockPerm.type.id;
    let face = e.face;
    if (blockId.endsWith('_lamp') || blockId === 'venture:wind_bell' || blockId === 'venture:item_sign') {
        if (face !== 'Up' && face !== 'Down') {
            let faceToSet = blockId === 'venture:item_sign' ? normalizeAndRotate(face.toLowerCase()) : face.toLowerCase();
            system.run(() => {
                e.block.setPermutation(BlockPermutation.resolve(blockId, { 'venture:wall_bit': true, 'minecraft:cardinal_direction': faceToSet }));
            });
        };
    };
    if (blockId === 'venture:clock') {
        if (face !== 'Up' && face !== 'Down') {
            system.run(() => {
                e.block.setPermutation(BlockPermutation.resolve(blockId, { 'minecraft:cardinal_direction': face.toLowerCase() }));
            });
        };
    };
    if (blockId === "venture:piano") {
        let { block } = e;
        if (block.below().typeId === 'venture:furniture_design') return;
        let rotation = blockPerm.getState('minecraft:cardinal_direction');
        let directions = rotation === "south" || rotation === "north" ? ["east", "west"] : ["north", "south"];
        let sideTest = directions.find(dir => block[dir]().isAir);
        let upperTest = block.above().isAir;
        let pointTest = block[rotation](-1).isAir;
        if (sideTest && upperTest && pointTest) {
            let cardinalDirection = blockPerm.getState('minecraft:cardinal_direction');
            let pointUpperTest = block[rotation](-1).above().isAir;
            let sidePointTest = block[sideTest]()[rotation](-1).isAir;
            let sideUpperTest = sideTest ? block[sideTest]().above().isAir : false;
            if (pointUpperTest && sideUpperTest && sidePointTest) {
                const d = ['north', 'east', 'south', 'west'];
                let firstPart = d.indexOf(sideTest) === (d.indexOf(cardinalDirection) + 1) % 4 || d.indexOf(sideTest) === (d.indexOf(cardinalDirection) + 2) % 4 ? "left" : "right";
                let secondPart = firstPart === "left" ? "right" : "left";
                system.run(() => {
                    const emptyBlock = BlockPermutation.resolve('venture:empty_block', { 'minecraft:cardinal_direction': cardinalDirection });
                    block.setPermutation(BlockPermutation.resolve('venture:' + firstPart + '_piano', { 'minecraft:cardinal_direction': cardinalDirection }));
                    block[sideTest]().setPermutation(BlockPermutation.resolve('venture:' + secondPart + '_piano', { 'minecraft:cardinal_direction': cardinalDirection }));
                    block[rotation](-1).setPermutation(emptyBlock);
                    block[sideTest]()[rotation](-1).setPermutation(emptyBlock);
                    block.above().setPermutation(emptyBlock);
                    block[sideTest]().above().setPermutation(emptyBlock);
                });
            } else {
                e.cancel = true;
            }
        } else {
            e.cancel = true;
        }
    }
});
world.afterEvents.playerBreakBlock.subscribe((e) => {
    let block = e.block;
    if (block.above().typeId.endsWith('_curtain')) {
        block.dimension.getBlock(block.above().location).setPermutation(modifyPermutation(block.above(), 'venture:height', 2));
    };
});
function removeOneChest(block) {
    block.dimension.getEntities({ type: 'minecraft:item', name: 'Chest', location: block.location }).forEach((item) => {
        let currentItemStack = item.getComponent("item").itemStack;
        if (currentItemStack.amount > 1) { currentItemStack.amount = currentItemStack.amount - 1 } else { item.remove() };
        return;
    });
}
function getSideTest(r, c) {
    return ['north', 'east', 'south', 'west'][((['north', 'east', 'south', 'west'].indexOf(c) + (r[0] === 'l' ? 3 : 1)) % 4)];
}
function breakPiano(block, cardinalDirection, state) {
    const air = BlockPermutation.resolve('minecraft:air');
    state = state === 'right' ? 'left' : 'right';
    block.setPermutation(air);
    block.above().setPermutation(air);
    block[cardinalDirection](-1).setPermutation(air);
    block[getSideTest(state, cardinalDirection)]().setPermutation(air);
    block[getSideTest(state, cardinalDirection)]().above().setPermutation(air);
    block[getSideTest(state, cardinalDirection)]()[cardinalDirection](-1).setPermutation(air);
    block.dimension.spawnItem(BlockPermutation.resolve(`venture:piano`).getItemStack(), block.location);
}
world.beforeEvents.playerBreakBlock.subscribe((e) => {
    let block = e.block;
    let cardinalDirection = block.permutation.getState('minecraft:cardinal_direction');
    let blockId = block.typeId;
    system.run(() => {
        if ((blockId.includes('slab') || blockId.includes('campfire') || blockId.includes('brick_oven'))) {
            if (block.above().typeId === 'venture:terracotta_tea_pot') {
                block.above().setPermutation(BlockPermutation.resolve('minecraft:air'))
                block.dimension.spawnItem(BlockPermutation.resolve('venture:terracotta_tea_pot').getItemStack(), block.above().location);
            };
        };
        if (blockId.endsWith('_grandfather_clock')) {
            let woodType = blockId.replace('venture:', '').slice(0, -24)
            block.dimension.spawnItem(BlockPermutation.resolve(`venture:${woodType}_grandfather_clock`).getItemStack(), block.location)
        };
        if (blockId.endsWith('_drawer')) {
            let hiddenInventory = block.dimension.getEntities({ type: 'venture:hidden_inventory', tags: [JSON.stringify(block.location)] })[0];
            hiddenInventory?.tryTeleport(block.location);
            hiddenInventory?.kill();
            removeOneChest(block);
        };
        if (blockId === 'venture:right_piano') {
            breakPiano(block, cardinalDirection, 'right');
        };
        if (blockId === 'venture:left_piano') {
            breakPiano(block, cardinalDirection, 'left');
        }
        if (blockId === 'venture:empty_block') {
            for (let direction of ['north', 'east', 'south', 'west', 'below', 'above']) {
                if (block[direction]().typeId.endsWith('_piano')) {
                    let interestedBlock = block[direction]();
                    breakPiano(interestedBlock, interestedBlock.permutation.getState('minecraft:cardinal_direction'), interestedBlock.typeId.includes('left') ? 'left' : 'right');
                    break;
                };
            }
        };
    });
});
function isDiagonal(direction) {
    const normalized = ((direction % 360) + 360) % 360;
    return (normalized % 90 >= 22.5) && (normalized % 90 < 67.5);
}
function isLeftTrue(direction) {
    return (direction > 0 && direction < 45) || (direction > 90 && direction < 135) || (direction > 180 && direction < 225) || (direction > 270 && direction < 315);
}
const cookableItem = {
    "beef": "cooked_beef",
    "chicken": "cooked_chicken",
    "cod": "cooked_cod",
    "potato": "baked_potato",
    "rabbit": "cooked_rabbit",
    "porkchop": "cooked_porkchop",
    "kelp": "dried_kelp",
    "rotten_flesh": "leather",
    "salmon": "cooked_salmon",
    "mutton": "cooked_mutton",
    "cactus": "green_dye",
    "sea_pickle": "lime_dye",
    "clay_ball": "brick",
    "chorus_fruit": "popped_chorus_fruit"
}
function usedReduce(player) {
    let currentItem = player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex);
    let afterItem;
    if (currentItem.amount > 1) {
        afterItem = new ItemStack(currentItem.typeId, currentItem.amount - 1);
    } else {
        afterItem = undefined;
    }
    player.getComponent("minecraft:equippable").getEquipmentSlot('Mainhand').setItem(afterItem)
}

function connectAwning(startBlock) {
    if (!startBlock.typeId.endsWith('awning')) return;

    const directions = ['north', 'east', 'south', 'west'];
    const oppositeDirections = { north: 'south', east: 'west', south: 'north', west: 'east' };

    const queue = [startBlock];
    const visited = new Set();

    while (queue.length > 0) {
        const block = queue.shift();
        const blockId = `${block.x},${block.y},${block.z}`;
        if (visited.has(blockId)) continue;
        visited.add(blockId);
        directions.forEach((direction) => {
            const neighborBlock = block[direction]();
            if (neighborBlock.typeId.endsWith('awning')) {
                block.setPermutation(modifyPermutation(block, `venture:hide_${direction}`, false));
                const oppositeDirection = oppositeDirections[direction];
                neighborBlock.setPermutation(modifyPermutation(neighborBlock, `venture:hide_${oppositeDirection}`, false));
                if (!visited.has(`${neighborBlock.x},${neighborBlock.y},${neighborBlock.z}`)) {
                    queue.push(neighborBlock);
                }
            } else if (!neighborBlock.isAir) {
                block.setPermutation(modifyPermutation(block, `venture:hide_${direction}`, false));
            }
        });
    }
}
world.beforeEvents.worldInitialize.subscribe(initEvent => {
    const musicList = {
        "faded": ["venture.faded", 420],
        "christmas": ["venture.christmas", 320],
        "fur elise": ["venture.fur_elise", 300],
        "golden hour": ["venture.golden_hour", 300],
        "glimpse of us": ["venture.glimpse_of_us", 700],
        "symphony": ["venture.symphony", 780],
    };
    initEvent.blockComponentRegistry.registerCustomComponent('venture:awning_interact', {
        beforeOnPlayerPlace: (e) => {
            if (e.block.below().typeId.endsWith('fence')) {
                e.permutationToPlace = e.permutationToPlace.withState('venture:hide_handle', true);
            }
        },
        onPlace: (e) => {
            connectAwning(e.block, undefined);
        },
        onPlayerInteract: (e) => {
            changeFurnitureColor(e.player, e.block);
        },
        onPlayerDestroy: (e) => {
            const oppositeDirections = { north: 'south', east: 'west', south: 'north', west: 'east' };
            ['north', 'east', 'south', 'west'].forEach((direction) => {
                const neighborBlock = e.block[direction]();
                if (neighborBlock.typeId.endsWith('awning')) {
                    const oppositeDirection = oppositeDirections[direction];
                    neighborBlock.setPermutation(modifyPermutation(neighborBlock, `venture:hide_${oppositeDirection}`, true));
                }
            });
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:wind_chime', {
        onTick: (e) => {
            e.block.dimension.playSound('venture.wind_chime', e.block.location);
        },
        onPlayerInteract: (e) => {
            e.block.dimension.playSound('venture.wind_chime', e.block.location);
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:furniture_design', {
        onPlayerInteract: (e) => {
            gui.showFirstPage(e.player);
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:piano_play', {
        onPlayerInteract: (e) => {
            let player = e.player;
            let holdItem = player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex);
            if (holdItem?.typeId === 'minecraft:book') {
                let musicName = musicList[holdItem?.nameTag?.toLowerCase()];
                if (musicName && typeof player.particleEffect === 'undefined') {
                    player.dimension.playSound(musicName[0], player.location);
                    player.particleEffect = system.runInterval(() => {
                        player.dimension.spawnParticle('venture:note', e.block.above().center());
                    }, 20);
                    system.runTimeout(() => {
                        system.clearRun(player.particleEffect);
                        player.particleEffect = undefined;
                    }, musicName[1]
                    );
                };
            } else { player.dimension.playSound('note.bass', player.location, { pitch: 0.2 + Math.random() * 1.5 }) };
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:brick_oven', {
        onPlayerInteract: (e) => {
            let player = e.player;
            let holdItem = player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex);
            const holdItemName = holdItem?.typeId.replace('minecraft:', '');
            const canBeCookedTo = cookableItem[holdItemName];
            if (canBeCookedTo && !player.dimension.getEntities({ type: 'venture:cookable', location: e.block.location, maxDistance: 1 })[0]) {
                usedReduce(player);
                let cookable = player.dimension.spawnEntity('venture:cookable', e.block.center());
                cookable.setProperty('venture:state', holdItemName);
                cookable.dimension.spawnParticle('venture:smoke', cookable.location);
                cookable.dimension.playSound('venture.sizzle', cookable.location);
                system.runTimeout(() => {
                    try {
                        cookable?.dimension?.spawnItem(new ItemStack("minecraft:" + canBeCookedTo, 1), e.block.above(2).center());
                        cookable?.remove();
                    } catch (error) {
                        return;
                    };
                }, 60);
            };
        },
        onTick: (e) => {
            let block = e.block;
            block.dimension.spawnParticle('venture:oven_flame', e.block.center());
            block.dimension.playSound('block.campfire.crackle', e.block.center(), { volume: 0.35 });
            ['east', 'west', 'north', 'south'].forEach(facingDirection => {
                let interestedBlock = block[facingDirection]();
                if (interestedBlock.typeId === 'minecraft:hopper') {
                    let hopperContainer = interestedBlock.getComponent('minecraft:inventory').container;
                    for (let i = 0; i < hopperContainer.size; i++) {
                        let currentItem = hopperContainer.getItem(i);
                        const canBeCookedTo = cookableItem[currentItem?.typeId.replace('minecraft:', '')];
                        if (canBeCookedTo && !block.dimension.getEntities({ type: 'venture:cookable', location: e.block.location, maxDistance: 1 })[0]) {
                            let afterItem;
                            if (currentItem.amount > 1) {
                                afterItem = new ItemStack(currentItem.typeId, currentItem.amount - 1);
                            } else {
                                afterItem = undefined;
                            }
                            hopperContainer.setItem(i, afterItem)
                            let cookable = block.dimension.spawnEntity('venture:cookable', e.block.center());
                            cookable.setProperty('venture:state', currentItem?.typeId.replace('minecraft:', ''));
                            cookable.dimension.spawnParticle('venture:smoke', cookable.location);
                            cookable.dimension.playSound('venture.sizzle', cookable.location);
                            system.runTimeout(() => {
                                try {
                                    cookable?.dimension?.spawnItem(new ItemStack("minecraft:" + canBeCookedTo, 1), e.block.above(2).center());
                                    cookable?.remove();
                                } catch (error) {
                                    return;
                                };
                            }, 60);
                        }
                    }
                }
            });

        },
        onPlayerDestroy: (e) => {
            let excessFood = e.player.dimension.getEntities({ type: 'venture:cookable', location: e.block.location, maxDistance: 1 })[0];
            if (excessFood) {
                excessFood.remove();
            };
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:tea_pot', {
        beforeOnPlayerPlace: (e) => {
            let player = e.player;
            let blockBelowId = e.block.below().typeId;
            let y = player.getRotation().y;
            let rot = y + 360 * (y !== Math.abs(y));
            e.permutationToPlace = e.permutationToPlace.withState('venture:is_diagonal', isDiagonal(rot)).withState('venture:is_left', isLeftTrue(rot)).withState('venture:on_ground', !(blockBelowId.includes('slab') || blockBelowId.includes('campfire') || blockBelowId.includes('brick_oven')));
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:bird_cage', {
        onPlayerInteract: (e) => {
            let player = e.player;
            let playerRider = player.getComponent('minecraft:rideable');
            let cageEmpty = player.dimension.getEntities({ type: 'venture:rotate_sit_placement', location: e.block.location, maxDistance: 1 })[0];
            let parrot = playerRider.getRiders()[0];
            if (parrot && typeof cageEmpty === 'undefined') {
                playerRider.ejectRider(parrot);
                let sitter = player.dimension.spawnEntity('venture:rotate_sit_placement', e.block.center());
                sitter.getComponent('minecraft:rideable').addRider(parrot);
            } else {
                player.dimension.getEntities({ type: 'venture:rotate_sit_placement', location: e.block.location, maxDistance: 1 })[0]?.remove();
            }
        },
        onPlayerDestroy: (e) => {
            let block = e.block;
            block.dimension.getEntities({ type: 'venture:rotate_sit_placement', location: block.location, maxDistance: 1 })[0]?.remove();
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:lamp_state', {
        onPlayerInteract: (e) => {
            let block = e.block;
            let endNow = changeFurnitureColor(e.player, block);
            if (endNow) return;
            let nextState = block.permutation.getState('venture:lamp_on_bit') === 'on' ? 'off' : 'on';
            block.setPermutation(modifyPermutation(block, 'venture:lamp_on_bit', nextState));
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:sofa_state', {
        onPlace: (e) => {
            let block = e.block;
            let direction = block.permutation.getState('minecraft:cardinal_direction');
            if (direction === 'north' || direction === 'south') {
                expandCurtain(block, 'east', 'west', direction, 'sofa');
            } else {
                expandCurtain(block, 'north', 'south', direction, 'sofa');
            };
        },
        onPlayerDestroy: (e) => {
            let block = e.block;
            let previousBlock = e.destroyedBlockPermutation;
            ['west', 'east', 'north', 'south'].forEach(facingDirection => {
                if (block[facingDirection]().typeId === previousBlock.type.id) {
                    let direction = previousBlock.getState('minecraft:cardinal_direction');
                    if (direction === 'north' || direction === 'south') {
                        expandCurtain(block.east(), 'east', 'west', direction, 'sofa');
                        expandCurtain(block.west(), 'east', 'west', direction, 'sofa');
                    } else {
                        expandCurtain(block.north(), 'north', 'south', direction, 'sofa');
                        expandCurtain(block.south(), 'north', 'south', direction, 'sofa');
                    };
                }
            });
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:upper_clock', {
        onTick: (e) => {
            let block = e.block;
            let currentTime = +block.permutation.getState('venture:clockarm');
            let nextTime = currentTime === 12 ? 1 : currentTime + 1;
            try {
                block.setPermutation(modifyPermutation(block, 'venture:clockarm', nextTime));
            } catch (error) {
                return;
            }
        },
        onPlayerDestroy: (e) => {
            e.block.below().setPermutation(BlockPermutation.resolve('minecraft:air'));
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:based_clock', {
        onPlayerDestroy: (e) => {
            e.block.above().setPermutation(BlockPermutation.resolve('minecraft:air'));
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:miniture_grandfather_clock', {
        onPlace: (e) => {
            let block = e.block;
            if (!block.above().isAir) {
                block.dimension.spawnItem(block.permutation.getItemStack(1), block.location);
                block.setPermutation(BlockPermutation.resolve('minecraft:air'));
                return;
            }
            let woodType = block.typeId.replace('venture:', '').replace('_grandfather_clock', '');
            let facingDirection = block.permutation.getState('minecraft:cardinal_direction');
            block.setPermutation(BlockPermutation.resolve(`venture:${woodType}_based_grandfather_clock`, { 'minecraft:cardinal_direction': facingDirection }));
            block.above().setPermutation(BlockPermutation.resolve(`venture:${woodType}_upper_grandfather_clock`, { 'minecraft:cardinal_direction': facingDirection }));
        }
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:drawer_state', {
        onPlayerInteract: (e) => {
            let player = e.player;
            let block = e.block;
            let hiddenInventory = block.dimension.getEntities({ location: { x: block.center().x, y: 330, z: block.center().z }, maxDistance: 1, type: 'venture:hidden_inventory', tags: [JSON.stringify(block.location)] })[0];
            let start = +block.permutation.getState('venture:open_state');
            if (start === 1) {
                if (!hiddenInventory) {
                    hiddenInventory = block.dimension.spawnEntity('venture:hidden_inventory', block.bottomCenter());
                    hiddenInventory.addTag(JSON.stringify(block.location));
                };
                hiddenInventory?.tryTeleport(block[block.permutation.getState('minecraft:cardinal_direction')](-1).bottomCenter());
                player.dimension.getEntities({ type: 'venture:hidden_inventory' }).forEach((entity) => {
                    let storedLocation = JSON.parse(entity?.getTags()[0]);
                    if (!player.dimension.getBlock(storedLocation)?.typeId.endsWith('_drawer')) {
                        entity.tryTeleport(block.location);
                        entity.kill();
                        removeOneChest(block);
                    }
                });
            } else {
                hiddenInventory = block.dimension.getEntities({ location: block.bottomCenter(), maxDistance: 1, type: 'venture:hidden_inventory' })[0];
                hiddenInventory?.tryTeleport({ x: block.center().x, y: 330, z: block.center().z });
            };
            let delta = start === 1 ? 1 : -1;
            let endStart = start === 1 ? 12 : 1;
            player.countDownstate = start;
            player.countDown = system.runInterval(() => {
                try {
                    player.countDownstate = player.countDownstate + delta;
                    block.setPermutation(modifyPermutation(block, 'venture:open_state', player.countDownstate));
                    if (player.countDownstate === endStart) {
                        system.clearRun(player.countDown);
                        return;
                    }
                } catch (error) {
                    system.clearRun(player.countDown);
                    return;
                };
            });
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:chair', {
        onPlayerInteract: (e) => {
            let endNow = changeFurnitureColor(e.player, e.block);
            if (endNow) return;
            let player = e.player;
            let ridingEntity = e.block.typeId.endsWith('_stool') ? 'venture:rotate_sit_placement' : 'venture:sit_placement';
            let onTop = (e.block.typeId.endsWith('_tall_stool'));
            sitPlacementInit(e.block, player, ridingEntity, onTop);
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:item_sign', {
        onPlayerInteract: (e) => {
            let player = e.player;
            let block = e.block;
            if (player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex)?.typeId.endsWith('_axe')) {
                let state = +block.permutation.getState('venture:item_bit');
                let nextState = player.isSneaking ? (state === 1 ? 11 : state - 1) : (state === 11 ? 1 : state + 1);
                block.setPermutation(modifyPermutation(block, 'venture:item_bit', nextState));
            };
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:engraved_chair', {
        onPlayerInteract: (e) => {
            let player = e.player;
            let block = e.block;
            if (player.getComponent("minecraft:inventory")?.container?.getItem(player?.selectedSlotIndex)?.typeId.endsWith('_axe')) {
                let state = +block.permutation.getState('venture:engraved_style');
                let nextState = player.isSneaking ? (state === 1 ? 11 : state - 1) : (state === 11 ? 1 : state + 1);
                block.setPermutation(modifyPermutation(block, 'venture:engraved_style', nextState));
            } else {
                sitPlacementInit(block, player, 'venture:sit_placement', false);
            };
        },
    });
    initEvent.blockComponentRegistry.registerCustomComponent('venture:curtain', {
        onPlayerInteract: (e) => {
            let block = e.block;
            let endNow = changeFurnitureColor(e.player, block);
            if (endNow) return;
            block.setPermutation(modifyPermutation(block, 'venture:is_closed', !block.permutation.getState('venture:is_closed')));
            if (+block.permutation.getState('venture:height') === 2 && block.permutation.getState('venture:curtain_state') === 'none') {
                modifyCurrentCurtain(block, 'normal');
                return;
            };
            if (+block.permutation.getState('venture:height') === 1 || block.permutation.getState('venture:curtain_state') !== 'both') {
                modifyCurrentCurtain(block, 'closed');
            };
            block.dimension.playSound('use.cloth', block.location);
            currentlyInteracting = true;
        },
        onPlace: (e) => {
            if (currentlyInteracting || e.previousBlock.type.id !== 'minecraft:air') {
                currentlyInteracting = false;
                return;
            };
            let block = e.block;
            if (!block.below().isAir && block.permutation.withState('venture:height', 2)) {
                block.setPermutation(modifyPermutation(block, 'venture:height', 1));
                return;
            };
            modifyCurrentCurtain(block, 'normal');
        },
        onPlayerDestroy: (e) => {
            let block = e.block;
            let previousBlock = e.destroyedBlockPermutation;
            ['west', 'east', 'north', 'south'].forEach(direction => {
                if (block[direction]().typeId === previousBlock.type.id) {
                    modifyCurrentCurtain(block[direction](), 'normal');
                }
            });
        }
    });
});