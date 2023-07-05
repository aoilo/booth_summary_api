const BoothItem = require('./BoothItem');
const ItemLog = require('./ItemLog');

ItemLog.belongsTo(BoothItem, { foreignKey: 'item_id', targetKey: 'id' });
BoothItem.hasMany(ItemLog, { foreignKey: 'item_id' });

module.exports = {
  BoothItem,
  ItemLog
};