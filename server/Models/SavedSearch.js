const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    query: {
        searchTerm: String,
        category: String,
        location: {
            lat: Number,
            lng: Number,
            distance: Number
        },
        filters: mongoose.Schema.Types.Mixed
    },
    notificationsEnabled: {
        type: Boolean,
        default: false
    },
    lastNotified: {
        type: Date
    }
}, { 
    timestamps: true,
    collection: 'savedSearches'
});

// Index for faster lookups
savedSearchSchema.index({ userId: 1, createdAt: -1 });

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);
module.exports = SavedSearch;
