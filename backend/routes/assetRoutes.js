const express = require('express');
const router = express.Router();
const { getAssets, getAssetStats, createAsset, updateAsset, deleteAsset } = require('../controllers/assetController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAssets);
router.get('/stats', protect, getAssetStats);
router.post('/', protect, createAsset);
router.put('/:id', protect, updateAsset);
router.delete('/:id', protect, deleteAsset);

module.exports = router;
