$targetDir = "D:\ZERO MAN\Videos\car-marketplace\assets\images\cars"

# List all files currently in the assets dir
$files = Get-ChildItem -Path $targetDir -Filter *.jpeg
$files += Get-ChildItem -Path $targetDir -Filter *.jpg
$files += Get-ChildItem -Path $targetDir -Filter *.png

$cars = @()

foreach ($file in $files) {
    $folder = "general"
    if ($file.Name -match "^toyota_") { $folder = "toyota" }
    elseif ($file.Name -match "^new three tyre_" -or $file.Name -match "^treee tyre_") { $folder = "three-tyre" }
    elseif ($file.Name -match "^more cars_") { $folder = "trice" }
    elseif ($file.Name -match "^white_") { $folder = "hyundai" }
    
    $brand = "General"
    $model = "Verified"
    
    if ($folder -eq "toyota") {
        $brand = "Toyota"
        $models = "Corolla", "Camry", "Highlander", "RAV4", "Voxy", "Sienta", "Vitz", "Land Cruiser"
        $model = $models[(Get-Random -Maximum $models.Count)]
    } elseif ($folder -eq "three-tyre") {
        $brand = "Three Tyre"
        $models = "Tricycle", "Cargo", "Passenger", "Elite"
        $model = $models[(Get-Random -Maximum $models.Count)]
    } elseif ($folder -eq "trice") {
        $brand = "Trice"
        $models = "Model X", "SUV Pro", "Sedan S", "Premium Pick-up"
        $model = $models[(Get-Random -Maximum $models.Count)]
    } elseif ($folder -eq "hyundai") {
        $brand = "Hyundai" 
        $models = "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta"
        $model = $models[(Get-Random -Maximum $models.Count)]
    } else {
        $brand = "Honda"
        $models = "Civic", "Accord", "CR-V", "Pilot", "Fit"
        $model = $models[(Get-Random -Maximum $models.Count)]
    }

    $price = 25000 + (Get-Random -Maximum 130000)
    $year = 2018 + (Get-Random -Maximum 7)
    $filenameSafe = $file.Name.Replace("'", "''")

    $carJson = @"
            { brand: '$brand', model: '$model', color: 'Assorted', year: $year, price: $price, condition: 'Foreign Used', transmission: 'Automatic', fuel: 'Petrol', image: 'assets/images/cars/$filenameSafe', status: 'available' }
"@
    $cars += $carJson
}

$carsArrayStr = $cars -join ",`n"

$dummyDataContent = @"
import { dbInstance } from './db.js';
import { HashUtils } from '../security/crypto.js';

export const seedDatabase = async () => {
    await dbInstance.init();

    const adminExists = await dbInstance.getOneByIndex('users', 'email', 'admin@cars45.test');
    if (!adminExists) {
        const adminPass = await HashUtils.hashPassword('admin123');
        await dbInstance.insert('users', {
            name: 'System Admin',
            email: 'admin@cars45.test',
            password: adminPass,
            role: 'admin',
            createdAt: new Date().toISOString()
        });
    }

    // Force clear old broken cars so we re-seed the locally copied images properly
    await dbInstance.doTransaction('cars', 'readwrite', store => store.clear());

    const dummyCars = [
$carsArrayStr
    ];

    for (const car of dummyCars) {
        await dbInstance.insert('cars', car);
    }
    
    console.log("Database seeded successfully with " + dummyCars.length + " valid cars!");
};

seedDatabase().catch(console.error);
"@

Set-Content -Path "D:\ZERO MAN\Videos\car-marketplace\js\database\dummy-data.js" -Value $dummyDataContent
