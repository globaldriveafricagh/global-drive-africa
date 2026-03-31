const fs = require('fs');
const path = require('path');

const baseDir = 'D:\\ZERO MAN\\Videos';
const folders = ['general cars', 'more cars', 'new three tyre', 'toyota', 'treee tyre', 'white'];

let cars = [];

folders.forEach(folder => {
    const dirPath = path.join(baseDir, folder);
    if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
            if (file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png')) {
                // Determine brand
                let brand = 'General';
                let model = 'Type-S';
                if (folder === 'toyota') brand = 'Toyota';
                else if (folder.includes('three')) { brand = 'Three Tyre'; model = 'Tricycle Load'; }
                else if (folder.includes('treee')) { brand = 'Three Tyre'; model = 'Tricycle Pass'; }
                else if (folder === 'more cars') brand = 'Trice Motor';
                else if (folder === 'white') brand = 'Hyundai';
                else brand = ['Honda', 'Toyota', 'Hyundai', 'Trice Motor', 'Three Tyre'][Math.floor(Math.random() * 5)];

                // Color mapping
                let color = 'Assorted';
                if(folder === 'white') color = 'White';
                else color = ['Red', 'Blue', 'Black', 'Silver', 'Grey'][Math.floor(Math.random() * 5)];

                cars.push({
                    brand: brand,
                    model: model,
                    color: color,
                    year: 2018 + Math.floor(Math.random() * 7),
                    price: 15000 + Math.floor(Math.random() * 150000),
                    condition: Math.random() > 0.5 ? 'Foreign Used' : 'Locally Used',
                    transmission: brand === 'Three Tyre' ? 'Manual' : 'Automatic',
                    fuel: 'Petrol',
                    image: `../${folder}/${file}`,
                    status: 'available'
                });
            }
        });
    }
});

const content = `import { dbInstance } from './db.js';
import { HashUtils } from '../security/crypto.js';

export const seedDatabase = async () => {
    await dbInstance.init();

    // Admin credentials must be configured manually — never hardcoded.

    const cars = await dbInstance.getAll('cars');
    if (cars.length === 0) {
        const dummyCars = ${JSON.stringify(cars, null, 4)};

        for (const car of dummyCars) {
            await dbInstance.insert('cars', car);
        }
    }
};

seedDatabase().catch(console.error);
`;

fs.writeFileSync(path.join(baseDir, 'car-marketplace', 'js', 'database', 'dummy-data.js'), content);
console.log('Generated ' + cars.length + ' cars.');
