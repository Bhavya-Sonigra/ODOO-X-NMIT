const mongoose = require('mongoose');

const favoriteSellersSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    favoriteUsers: [{
        sellerId: {
            type: String,
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String
        }
    }]
}, { 
    timestamps: true,
    collection: 'favoriteSellers'
});

const FavoriteSellers = mongoose.model('FavoriteSellers', favoriteSellersSchema);
module.exports = FavoriteSellers;
