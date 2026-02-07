import { getGolfers } from './src/utils/db';

async function checkDB() {
    try {
        const golfers = await getGolfers();
        console.log("Current Golfer Data in DB:");
        golfers.forEach(g => {
            console.log(`${g.name}: ${g.image}`);
        });
    } catch (e) {
        console.error(e);
    }
}

checkDB();
