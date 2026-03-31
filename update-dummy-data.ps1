$targetDir = "D:\ZERO MAN\Videos\car-marketplace\assets\images\cars"

# Get all image files
$files = Get-ChildItem -Path $targetDir -Filter *.jpeg
$files += Get-ChildItem -Path $targetDir -Filter *.jpg
$files += Get-ChildItem -Path $targetDir -Filter *.png

# Group files by their base name (without the (n) part)
$groups = @{}

foreach ($file in $files) {
    $baseName = $file.BaseName
    # Remove " (n)" or " (nn)" at the end
    $cleanName = $baseName -replace "\s\(\d+\)$", ""
    
    if (-not $groups.ContainsKey($cleanName)) {
        $groups[$cleanName] = New-Object System.Collections.Generic.List[string]
    }
    $groups[$cleanName].Add($file.Name)
}

$cars = @()

foreach ($cleanName in $groups.Keys) {
    # Ensure we treat this as an array
    $groupFiles = @($groups[$cleanName])
    $sortedFiles = @($groupFiles | Sort-Object)
    
    # Determine folder and metadata based on the clean name
    $folder = "general"
    if ($cleanName -match "^toyota_") { $folder = "toyota" }
    elseif ($cleanName -match "^new three tyre_" -or $cleanName -match "^treee tyre_") { $folder = "trice" } # Mapped to Trice as per user request
    elseif ($cleanName -match "^more cars_") { $folder = "general" } # Moved from Trice to General (since they are cars)
    elseif ($cleanName -match "^white_") { $folder = "hyundai" }
    
    $brand = "General"
    $model = "Verified"
    $type = "Car"
    
    if ($folder -eq "toyota") {
        $brand = "Toyota"
        $models = "Corolla", "Camry", "Highlander", "RAV4", "Voxy", "Sienta", "Vitz", "Land Cruiser"
        $model = $models[(Get-Random -Maximum $models.Count)]
    } elseif ($folder -eq "trice") {
        $brand = "Trice"
        $models = "Passenger Tricycle", "Apex Cargo Bike", "Delivery Motorbike", "Classic Pragia", "Royal Keke", "Modern TukTuk"
        $model = $models[(Get-Random -Maximum $models.Count)]
        $type = "Motorbike"
    } elseif ($folder -eq "hyundai") {
        $brand = "Hyundai" 
        $models = "Elantra", "Sonata", "Tucson", "Santa Fe", "Creta"
        $model = $models[(Get-Random -Maximum $models.Count)]
    } else {
        # Check if it was "general" or something else
        if ($cleanName -match "^honda_") {
             $brand = "Honda"
        } else {
             # Distinguish between Honda and other general cars
             $brands = "Honda", "Nissan", "Kia", "Mazda"
             $brand = $brands[(Get-Random -Maximum $brands.Count)]
        }
        $models = "Civic", "Accord", "CR-V", "Sunny", "Sportage", "Mazda 3"
        $model = $models[(Get-Random -Maximum $models.Count)]
    }

    # Price refinement: Bikes are cheaper
    if($type -eq "Motorbike") {
        $price = 8000 + (Get-Random -Maximum 22000)
    } else {
        $price = 25000 + (Get-Random -Maximum 130000)
    }
    
    $year = 2018 + (Get-Random -Maximum 7)
    
    # Map all images in the group to the car
    $imagePaths = @($sortedFiles | ForEach-Object { "'assets/images/cars/$($_ -replace "'", "''")'" })
    
    # RELATIVE IMAGES FIX: If a group has too many images (e.g. > 5), 
    # it might be different cars with same timestamp. We'll be conservative.
    if ($imagePaths.Count -gt 5) {
        $imagesArrayStr = $imagePaths[0..3] -join ", "
        $mainImage = $imagePaths[0]
    } else {
        $imagesArrayStr = $imagePaths -join ", "
        $mainImage = $imagePaths[0]
    }

    $carJson = @"
            { brand: '$brand', model: '$model', color: 'Assorted', year: $year, price: $price, condition: 'Foreign Used', transmission: 'Automatic', fuel: 'Petrol', image: $mainImage, images: [$imagesArrayStr], status: 'available' }
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
    
    console.log("Database seeded successfully with " + dummyCars.length + " entries!");
};

seedDatabase().catch(console.error);
"@

Set-Content -Path "D:\ZERO MAN\Videos\car-marketplace\js\database\dummy-data.js" -Value $dummyDataContent
Write-Host "Grouped $($groups.Count) entries from $($files.Count) images. Trice category now contains bikes/tricycles."
