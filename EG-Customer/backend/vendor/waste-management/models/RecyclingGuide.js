const mongoose = require('mongoose');

const recyclingCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    items: [{
        type: String,
        trim: true
    }],
    tips: [{
        type: String,
        trim: true
    }],
    icon: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const recyclingTipSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'en'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Predefined recycling categories
const defaultCategories = [
    {
        name: 'Paper & Cardboard',
        description: 'Recyclable paper products including newspapers, magazines, and cardboard boxes',
        items: ['Newspapers', 'Magazines', 'Cardboard boxes', 'Office paper', 'Junk mail'],
        tips: [
            'Remove any plastic or metal attachments',
            'Flatten cardboard boxes to save space',
            'Keep paper dry and clean',
            'Avoid paper with food stains or grease'
        ],
        icon: '📄',
        language: 'en'
    },
    {
        name: 'Glass',
        description: 'Glass containers that can be recycled into new glass products',
        items: ['Glass bottles', 'Glass jars', 'Clear glass containers'],
        tips: [
            'Rinse thoroughly before recycling',
            'Remove lids and caps',
            'Don\'t break glass into small pieces',
            'Check if your area accepts colored glass'
        ],
        icon: '🥃',
        language: 'en'
    },
    {
        name: 'Metal',
        description: 'Metal containers and items that can be recycled',
        items: ['Aluminum cans', 'Steel cans', 'Metal lids', 'Clean foil'],
        tips: [
            'Rinse cans thoroughly',
            'Crush aluminum cans to save space',
            'Remove paper labels when possible',
            'Keep metal items clean and dry'
        ],
        icon: '🥫',
        language: 'en'
    },
    {
        name: 'Plastic',
        description: 'Plastic containers and packaging materials',
        items: ['Plastic bottles', 'Plastic containers', 'Plastic bags', 'Plastic packaging'],
        tips: [
            'Check the recycling number on the bottom',
            'Rinse containers thoroughly',
            'Remove caps and lids',
            'Flatten containers to save space'
        ],
        icon: '♻️',
        language: 'en'
    },
    {
        name: 'Electronics',
        description: 'Electronic devices and components',
        items: ['Old phones', 'Laptops', 'Tablets', 'Chargers', 'Batteries'],
        tips: [
            'Remove batteries before recycling',
            'Wipe personal data from devices',
            'Don\'t throw in regular trash',
            'Use certified e-waste recyclers'
        ],
        icon: '📱',
        language: 'en'
    }
];

// Method to initialize default categories
recyclingCategorySchema.statics.initializeDefaultCategories = async function() {
    try {
        const count = await this.countDocuments();
        if (count === 0) {
            await this.insertMany(defaultCategories);
            console.log('Default recycling categories initialized');
        }
    } catch (error) {
        console.error('Error initializing default categories:', error);
    }
};

// Don't auto-initialize on module load - this causes issues
// We'll call this manually when needed

module.exports = {
    RecyclingCategory: mongoose.model('RecyclingCategory', recyclingCategorySchema),
    RecyclingTip: mongoose.model('RecyclingTip', recyclingTipSchema)
};

