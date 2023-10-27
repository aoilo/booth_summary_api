const Redis = require('ioredis');
const cron = require('node-cron');
const sequelize = require('../../services/booth-db.service');

const client = new Redis({
    host: 'redis',
    port: 6379
});

client.on('connect', () => {
    console.log('Connected to Redis');
});

client.on('error', (err) => {
    console.error('Redis Error:', err);
});

const updateRedisCache = async () => {
    try {
        const result = await getTopItemsData();
        await client.set('topItemsCache', JSON.stringify(result));
    } catch (err) {
        console.error('Failed to update Redis cache:', err);
    }
};

const getTopItemsData = async () => {
    const limit = 20;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    return await sequelize.query(`
SELECT boothitems.*, item_logs.likes
FROM boothitems
JOIN (
    SELECT item_id, likes, created_at
    FROM item_logs
    WHERE (item_id, created_at) IN (
    SELECT item_id, MAX(created_at)
    FROM item_logs
    WHERE created_at >= :eightDaysAgo
    GROUP BY item_id
    )
) as item_logs
ON boothitems.id = item_logs.item_id
WHERE boothitems.created_at >= :oneWeekAgo
ORDER BY item_logs.likes DESC
LIMIT :limit;
    `, {
        replacements: { limit: limit, oneWeekAgo: oneWeekAgo, eightDaysAgo: eightDaysAgo },
        type: sequelize.QueryTypes.SELECT
    });
};

cron.schedule('*/1 * * * *', async () => {
    try {
        console.log('start update');
        await updateRedisCache();
    } catch (error) {
        console.error('Error during update:', error);
    }
});

module.exports = getTopItemsData;
