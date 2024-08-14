import { world, system, ItemStack } from "@minecraft/server"

world.beforeEvents.worldInitialize.subscribe(initEvent => {
    initEvent.itemComponentRegistry.registerCustomComponent('eic:show_guide', {
        onUseOn: e => {
            const { block, player } = e;
            e.source.runCommand("scriptevent eic:book");
        }
    });
})