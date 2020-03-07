/* Global configuration file for craft.js */

// Global names for block types
export const blockTypes = {
    AIR: 'air',
    GRASS: 'grass',
    DIRT: 'dirt',
    STONE: 'stone',
    BEDROCK: 'bedrock'
}

// Information about block type materials used for assigning materials at runtime
export const materialMeta = [{
        type: blockTypes.DIRT,
        length: 1
    },

    {
        type: blockTypes.STONE,
        length: 1
    },

    {
        type: blockTypes.BEDROCK,
        length: 1
    },

    {
        type: blockTypes.GRASS,
        length: 3,
        map: [1, 1, 0, 2, 1, 1]
    }
]

// Chunk generation config
export const chunkConf = {
    size: 16,
    height: 256,
    seaLevel: 62
}