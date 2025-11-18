const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

// Sample pesticides and fertilizers data
const products = [
  // Insecticides
  { title: 'Imidacloprid 17.8% SL', category: 'insecticide', composition: 'Imidacloprid 17.8%', dosage: { perAcre: '100-150 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '250 ml', tags: ['aphids', 'whitefly', 'thrips'] },
  { title: 'Acephate 75% SP', category: 'insecticide', composition: 'Acephate 75%', dosage: { perAcre: '500-750 g', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton', 'Sugarcane'], price: 380, brand: 'Generic', weight: '500 g', tags: ['sucking pests', 'leafhoppers'] },
  { title: 'Chlorpyriphos 20% EC', category: 'insecticide', composition: 'Chlorpyriphos 20%', dosage: { perAcre: '1-1.5 L', format: 'Foliar Spray' }, crops: ['Rice', 'Wheat', 'Cotton'], price: 520, brand: 'Generic', weight: '1 L', tags: ['stem borer', 'armyworm'] },
  { title: 'Quinalphos 25% EC', category: 'insecticide', composition: 'Quinalphos 25%', dosage: { perAcre: '1-1.5 L', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton', 'Vegetables'], price: 480, brand: 'Generic', weight: '1 L', tags: ['borers', 'sucking pests'] },
  { title: 'Monocrotophos 36% SL', category: 'insecticide', composition: 'Monocrotophos 36%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Sugarcane', 'Vegetables'], price: 420, brand: 'Generic', weight: '500 ml', tags: ['aphids', 'jassids'] },
  
  // Fungicides
  { title: 'Tricyclazole 75% WP', category: 'fungicide', composition: 'Tricyclazole 75%', dosage: { perAcre: '200-300 g', format: 'Foliar Spray' }, crops: ['Rice'], price: 650, brand: 'Generic', weight: '250 g', tags: ['rice blast', 'fungal diseases'] },
  { title: 'Propiconazole 25% EC', category: 'fungicide', composition: 'Propiconazole 25%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Wheat', 'Vegetables'], price: 580, brand: 'Generic', weight: '250 ml', tags: ['leaf spot', 'rust', 'powdery mildew'] },
  { title: 'Mancozeb 75% WP', category: 'fungicide', composition: 'Mancozeb 75%', dosage: { perAcre: '1-1.5 kg', format: 'Foliar Spray' }, crops: ['Rice', 'Potato', 'Tomato'], price: 320, brand: 'Generic', weight: '500 g', tags: ['early blight', 'late blight', 'brown spot'] },
  { title: 'Carbendazim 50% WP', category: 'fungicide', composition: 'Carbendazim 50%', dosage: { perAcre: '250-500 g', format: 'Foliar Spray' }, crops: ['Rice', 'Wheat', 'Vegetables'], price: 450, brand: 'Generic', weight: '250 g', tags: ['fungal diseases', 'root rot'] },
  { title: 'Copper Oxychloride 50% WP', category: 'fungicide', composition: 'Copper Oxychloride 50%', dosage: { perAcre: '1-1.5 kg', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables', 'Fruits'], price: 380, brand: 'Generic', weight: '500 g', tags: ['bacterial diseases', 'fungal diseases'] },
  
  // Herbicides
  { title: 'Glyphosate 41% SL', category: 'herbicide', composition: 'Glyphosate 41%', dosage: { perAcre: '1-1.5 L', format: 'Foliar Spray' }, crops: ['All Crops'], price: 280, brand: 'Generic', weight: '1 L', tags: ['broadleaf weeds', 'grasses'] },
  { title: '2,4-D Amine 58% SL', category: 'herbicide', composition: '2,4-D Amine 58%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Wheat', 'Rice'], price: 320, brand: 'Generic', weight: '500 ml', tags: ['broadleaf weeds'] },
  { title: 'Pendimethalin 30% EC', category: 'herbicide', composition: 'Pendimethalin 30%', dosage: { perAcre: '1-1.5 L', format: 'Pre-emergence' }, crops: ['Rice', 'Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '1 L', tags: ['grasses', 'weeds'] },
  
  // Fertilizers
  { title: 'Urea 46% N', category: 'fertilizer', composition: 'Nitrogen 46%', dosage: { perAcre: '50-100 kg', format: 'Basal/Top Dressing' }, crops: ['All Crops'], price: 600, brand: 'Generic', weight: '50 kg', tags: ['nitrogen', 'growth', 'vegetative'] },
  { title: 'DAP (Di-Ammonium Phosphate)', category: 'fertilizer', composition: 'N 18%, P2O5 46%', dosage: { perAcre: '50-100 kg', format: 'Basal Application' }, crops: ['All Crops'], price: 1200, brand: 'Generic', weight: '50 kg', tags: ['nitrogen', 'phosphorus', 'root development'] },
  { title: 'MOP (Muriate of Potash)', category: 'fertilizer', composition: 'K2O 60%', dosage: { perAcre: '25-50 kg', format: 'Basal Application' }, crops: ['All Crops'], price: 800, brand: 'Generic', weight: '50 kg', tags: ['potassium', 'flowering', 'fruiting'] },
  { title: 'NPK 19:19:19', category: 'fertilizer', composition: 'N 19%, P2O5 19%, K2O 19%', dosage: { perAcre: '25-50 kg', format: 'Foliar Spray' }, crops: ['All Crops'], price: 1500, brand: 'Generic', weight: '25 kg', tags: ['balanced', 'complete nutrition'] },
  { title: 'Ammonium Sulfate', category: 'fertilizer', composition: 'N 21%, S 24%', dosage: { perAcre: '50-100 kg', format: 'Top Dressing' }, crops: ['Rice', 'Wheat'], price: 550, brand: 'Generic', weight: '50 kg', tags: ['nitrogen', 'sulfur'] },
  { title: 'Single Super Phosphate (SSP)', category: 'fertilizer', composition: 'P2O5 16%, S 11%', dosage: { perAcre: '100-150 kg', format: 'Basal Application' }, crops: ['All Crops'], price: 450, brand: 'Generic', weight: '50 kg', tags: ['phosphorus', 'sulfur'] },
  { title: 'Zinc Sulfate', category: 'fertilizer', composition: 'Zn 21%', dosage: { perAcre: '5-10 kg', format: 'Basal/Top Dressing' }, crops: ['Rice', 'Wheat', 'Maize'], price: 180, brand: 'Generic', weight: '5 kg', tags: ['zinc', 'micronutrient'] },
  { title: 'Boron', category: 'fertilizer', composition: 'B 17%', dosage: { perAcre: '1-2 kg', format: 'Foliar Spray' }, crops: ['All Crops'], price: 250, brand: 'Generic', weight: '1 kg', tags: ['boron', 'micronutrient', 'flowering'] },
  { title: 'Iron Chelate', category: 'fertilizer', composition: 'Fe 12%', dosage: { perAcre: '500 g - 1 kg', format: 'Foliar Spray' }, crops: ['All Crops'], price: 350, brand: 'Generic', weight: '500 g', tags: ['iron', 'micronutrient', 'chlorosis'] },
  { title: 'Organic Manure', category: 'fertilizer', composition: 'Organic Matter 40-50%', dosage: { perAcre: '2-5 tons', format: 'Basal Application' }, crops: ['All Crops'], price: 800, brand: 'Generic', weight: '50 kg', tags: ['organic', 'soil health'] }
];

// Add more products to reach 70 pesticides + 10 fertilizers
const additionalInsecticides = [
  { title: 'Dimethoate 30% EC', category: 'insecticide', composition: 'Dimethoate 30%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 400, brand: 'Generic', weight: '500 ml', tags: ['aphids', 'mites'] },
  { title: 'Malathion 50% EC', category: 'insecticide', composition: 'Malathion 50%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 350, brand: 'Generic', weight: '500 ml', tags: ['sucking pests'] },
  { title: 'Phosalone 35% EC', category: 'insecticide', composition: 'Phosalone 35%', dosage: { perAcre: '1-1.5 L', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 420, brand: 'Generic', weight: '1 L', tags: ['borers', 'caterpillars'] },
  { title: 'Endosulfan 35% EC', category: 'insecticide', composition: 'Endosulfan 35%', dosage: { perAcre: '1-1.5 L', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 380, brand: 'Generic', weight: '1 L', tags: ['sucking pests', 'borers'] },
  { title: 'Cypermethrin 25% EC', category: 'insecticide', composition: 'Cypermethrin 25%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '250 ml', tags: ['caterpillars', 'beetles'] },
  { title: 'Deltamethrin 2.8% EC', category: 'insecticide', composition: 'Deltamethrin 2.8%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 480, brand: 'Generic', weight: '250 ml', tags: ['caterpillars', 'beetles'] },
  { title: 'Lambda Cyhalothrin 5% EC', category: 'insecticide', composition: 'Lambda Cyhalothrin 5%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 500, brand: 'Generic', weight: '250 ml', tags: ['caterpillars', 'beetles'] },
  { title: 'Thiamethoxam 25% WG', category: 'insecticide', composition: 'Thiamethoxam 25%', dosage: { perAcre: '50-100 g', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton', 'Vegetables'], price: 550, brand: 'Generic', weight: '100 g', tags: ['sucking pests', 'whitefly'] },
  { title: 'Acetamiprid 20% SP', category: 'insecticide', composition: 'Acetamiprid 20%', dosage: { perAcre: '50-100 g', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 480, brand: 'Generic', weight: '100 g', tags: ['aphids', 'whitefly'] },
  { title: 'Fipronil 5% SC', category: 'insecticide', composition: 'Fipronil 5%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton'], price: 520, brand: 'Generic', weight: '500 ml', tags: ['stem borer', 'termites'] },
  { title: 'Cartap Hydrochloride 50% SP', category: 'insecticide', composition: 'Cartap Hydrochloride 50%', dosage: { perAcre: '500-750 g', format: 'Foliar Spray' }, crops: ['Rice'], price: 450, brand: 'Generic', weight: '500 g', tags: ['stem borer', 'leaf folder'] },
  { title: 'Buprofezin 25% SC', category: 'insecticide', composition: 'Buprofezin 25%', dosage: { perAcre: '400-600 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton'], price: 480, brand: 'Generic', weight: '500 ml', tags: ['brown planthopper', 'whitefly'] },
  { title: 'Ethion 50% EC', category: 'insecticide', composition: 'Ethion 50%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 400, brand: 'Generic', weight: '500 ml', tags: ['mites', 'sucking pests'] },
  { title: 'Profenofos 50% EC', category: 'insecticide', composition: 'Profenofos 50%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '500 ml', tags: ['sucking pests', 'borers'] },
  { title: 'Triazophos 40% EC', category: 'insecticide', composition: 'Triazophos 40%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton'], price: 420, brand: 'Generic', weight: '500 ml', tags: ['stem borer', 'sucking pests'] },
  { title: 'Chlorantraniliprole 18.5% SC', category: 'insecticide', composition: 'Chlorantraniliprole 18.5%', dosage: { perAcre: '100-150 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Cotton', 'Vegetables'], price: 650, brand: 'Generic', weight: '100 ml', tags: ['caterpillars', 'borers'] },
  { title: 'Flubendiamide 39.35% SC', category: 'insecticide', composition: 'Flubendiamide 39.35%', dosage: { perAcre: '50-75 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 680, brand: 'Generic', weight: '100 ml', tags: ['caterpillars', 'borers'] },
  { title: 'Emamectin Benzoate 5% SG', category: 'insecticide', composition: 'Emamectin Benzoate 5%', dosage: { perAcre: '50-100 g', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 600, brand: 'Generic', weight: '100 g', tags: ['caterpillars', 'borers'] },
  { title: 'Spinosad 45% SC', category: 'insecticide', composition: 'Spinosad 45%', dosage: { perAcre: '50-75 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 720, brand: 'Generic', weight: '100 ml', tags: ['caterpillars', 'thrips'] },
  { title: 'Indoxacarb 14.5% SC', category: 'insecticide', composition: 'Indoxacarb 14.5%', dosage: { perAcre: '100-150 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 650, brand: 'Generic', weight: '100 ml', tags: ['caterpillars', 'borers'] },
  { title: 'Novaluron 10% EC', category: 'insecticide', composition: 'Novaluron 10%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 480, brand: 'Generic', weight: '250 ml', tags: ['whitefly', 'jassids'] },
  { title: 'Diafenthiuron 50% WP', category: 'insecticide', composition: 'Diafenthiuron 50%', dosage: { perAcre: '200-300 g', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 520, brand: 'Generic', weight: '250 g', tags: ['whitefly', 'mites'] },
  { title: 'Pyriproxyfen 10% EC', category: 'insecticide', composition: 'Pyriproxyfen 10%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '250 ml', tags: ['whitefly', 'scale insects'] },
  { title: 'Fenpyroximate 5% SC', category: 'insecticide', composition: 'Fenpyroximate 5%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 480, brand: 'Generic', weight: '250 ml', tags: ['mites', 'red spider mite'] },
  { title: 'Abamectin 1.9% EC', category: 'insecticide', composition: 'Abamectin 1.9%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 550, brand: 'Generic', weight: '250 ml', tags: ['mites', 'leaf miners'] },
  { title: 'Azadirachtin 0.03% EC', category: 'insecticide', composition: 'Azadirachtin 0.03%', dosage: { perAcre: '1-2 L', format: 'Foliar Spray' }, crops: ['All Crops'], price: 380, brand: 'Generic', weight: '1 L', tags: ['organic', 'broad spectrum'] },
  { title: 'Neem Oil', category: 'insecticide', composition: 'Azadirachtin', dosage: { perAcre: '1-2 L', format: 'Foliar Spray' }, crops: ['All Crops'], price: 320, brand: 'Generic', weight: '1 L', tags: ['organic', 'repellent'] },
  { title: 'Bacillus Thuringiensis', category: 'insecticide', composition: 'Bt', dosage: { perAcre: '500-750 g', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '500 g', tags: ['organic', 'caterpillars'] },
  { title: 'Spodoptera Litura NPV', category: 'insecticide', composition: 'NPV', dosage: { perAcre: '250-500 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 520, brand: 'Generic', weight: '250 ml', tags: ['bio-pesticide', 'armyworm'] },
  { title: 'Helicoverpa Armigera NPV', category: 'insecticide', composition: 'NPV', dosage: { perAcre: '250-500 ml', format: 'Foliar Spray' }, crops: ['Cotton', 'Vegetables'], price: 520, brand: 'Generic', weight: '250 ml', tags: ['bio-pesticide', 'bollworm'] }
];

const additionalFungicides = [
  { title: 'Hexaconazole 5% EC', category: 'fungicide', composition: 'Hexaconazole 5%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 480, brand: 'Generic', weight: '250 ml', tags: ['sheath blight', 'rust'] },
  { title: 'Tebuconazole 25% EC', category: 'fungicide', composition: 'Tebuconazole 25%', dosage: { perAcre: '200-300 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Wheat', 'Vegetables'], price: 550, brand: 'Generic', weight: '250 ml', tags: ['rust', 'powdery mildew'] },
  { title: 'Difenoconazole 25% EC', category: 'fungicide', composition: 'Difenoconazole 25%', dosage: { perAcre: '100-150 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 600, brand: 'Generic', weight: '100 ml', tags: ['leaf spot', 'blight'] },
  { title: 'Azoxystrobin 23% SC', category: 'fungicide', composition: 'Azoxystrobin 23%', dosage: { perAcre: '100-150 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 680, brand: 'Generic', weight: '100 ml', tags: ['blast', 'blight'] },
  { title: 'Pyraclostrobin 20% WG', category: 'fungicide', composition: 'Pyraclostrobin 20%', dosage: { perAcre: '50-75 g', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 720, brand: 'Generic', weight: '50 g', tags: ['broad spectrum', 'fungal diseases'] },
  { title: 'Fluxapyroxad 25% SC', category: 'fungicide', composition: 'Fluxapyroxad 25%', dosage: { perAcre: '100-150 ml', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 750, brand: 'Generic', weight: '100 ml', tags: ['sheath blight', 'root rot'] },
  { title: 'Thiophanate Methyl 70% WP', category: 'fungicide', composition: 'Thiophanate Methyl 70%', dosage: { perAcre: '250-500 g', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 420, brand: 'Generic', weight: '250 g', tags: ['fungal diseases'] },
  { title: 'Metalaxyl 35% WS', category: 'fungicide', composition: 'Metalaxyl 35%', dosage: { perAcre: '2-3 g per kg seed', format: 'Seed Treatment' }, crops: ['Rice', 'Wheat'], price: 380, brand: 'Generic', weight: '100 g', tags: ['seed treatment', 'root rot'] },
  { title: 'Validamycin 3% L', category: 'fungicide', composition: 'Validamycin 3%', dosage: { perAcre: '1-1.5 L', format: 'Foliar Spray' }, crops: ['Rice'], price: 450, brand: 'Generic', weight: '1 L', tags: ['sheath blight'] },
  { title: 'Kasugamycin 3% SL', category: 'fungicide', composition: 'Kasugamycin 3%', dosage: { perAcre: '500-750 ml', format: 'Foliar Spray' }, crops: ['Rice'], price: 480, brand: 'Generic', weight: '500 ml', tags: ['bacterial blight'] },
  { title: 'Streptocycline', category: 'fungicide', composition: 'Streptomycin + Tetracycline', dosage: { perAcre: '50-100 g', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 350, brand: 'Generic', weight: '50 g', tags: ['bacterial diseases'] },
  { title: 'Copper Hydroxide 77% WP', category: 'fungicide', composition: 'Copper Hydroxide 77%', dosage: { perAcre: '500-750 g', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 420, brand: 'Generic', weight: '500 g', tags: ['bacterial diseases', 'fungal diseases'] },
  { title: 'Sulfur 80% WP', category: 'fungicide', composition: 'Sulfur 80%', dosage: { perAcre: '1-2 kg', format: 'Foliar Spray' }, crops: ['Vegetables', 'Fruits'], price: 280, brand: 'Generic', weight: '1 kg', tags: ['powdery mildew', 'mites'] },
  { title: 'Zineb 75% WP', category: 'fungicide', composition: 'Zineb 75%', dosage: { perAcre: '1-1.5 kg', format: 'Foliar Spray' }, crops: ['Potato', 'Tomato'], price: 350, brand: 'Generic', weight: '500 g', tags: ['early blight', 'late blight'] },
  { title: 'Captan 50% WP', category: 'fungicide', composition: 'Captan 50%', dosage: { perAcre: '1-1.5 kg', format: 'Foliar Spray' }, crops: ['Vegetables', 'Fruits'], price: 380, brand: 'Generic', weight: '500 g', tags: ['fruit rot', 'seed treatment'] },
  { title: 'Thiram 75% WP', category: 'fungicide', composition: 'Thiram 75%', dosage: { perAcre: '2-3 g per kg seed', format: 'Seed Treatment' }, crops: ['All Crops'], price: 320, brand: 'Generic', weight: '100 g', tags: ['seed treatment', 'soil borne'] },
  { title: 'Bordeaux Mixture', category: 'fungicide', composition: 'Copper Sulfate + Lime', dosage: { perAcre: '1-2% solution', format: 'Foliar Spray' }, crops: ['All Crops'], price: 250, brand: 'Generic', weight: '1 kg', tags: ['bacterial diseases', 'fungal diseases'] },
  { title: 'Bavistin (Carbendazim)', category: 'fungicide', composition: 'Carbendazim 50%', dosage: { perAcre: '250-500 g', format: 'Foliar Spray' }, crops: ['Rice', 'Wheat', 'Vegetables'], price: 450, brand: 'Generic', weight: '250 g', tags: ['fungal diseases', 'root rot'] },
  { title: 'Ridomil Gold (Metalaxyl + Mancozeb)', category: 'fungicide', composition: 'Metalaxyl 4% + Mancozeb 64%', dosage: { perAcre: '1-1.5 kg', format: 'Foliar Spray' }, crops: ['Potato', 'Tomato'], price: 650, brand: 'Generic', weight: '500 g', tags: ['late blight', 'downy mildew'] },
  { title: 'Nativo (Tebuconazole + Trifloxystrobin)', category: 'fungicide', composition: 'Tebuconazole 50% + Trifloxystrobin 25%', dosage: { perAcre: '200-300 g', format: 'Foliar Spray' }, crops: ['Rice', 'Vegetables'], price: 750, brand: 'Generic', weight: '250 g', tags: ['broad spectrum', 'fungal diseases'] }
];

const additionalHerbicides = [
  { title: 'Butachlor 50% EC', category: 'herbicide', composition: 'Butachlor 50%', dosage: { perAcre: '1-1.5 L', format: 'Pre-emergence' }, crops: ['Rice'], price: 380, brand: 'Generic', weight: '1 L', tags: ['grasses', 'weeds'] },
  { title: 'Pretilachlor 50% EC', category: 'herbicide', composition: 'Pretilachlor 50%', dosage: { perAcre: '500-750 ml', format: 'Pre-emergence' }, crops: ['Rice'], price: 420, brand: 'Generic', weight: '500 ml', tags: ['grasses', 'weeds'] },
  { title: 'Anilofos 30% EC', category: 'herbicide', composition: 'Anilofos 30%', dosage: { perAcre: '500-750 ml', format: 'Pre-emergence' }, crops: ['Rice'], price: 450, brand: 'Generic', weight: '500 ml', tags: ['grasses', 'weeds'] },
  { title: 'Bispyribac Sodium 10% SC', category: 'herbicide', composition: 'Bispyribac Sodium 10%', dosage: { perAcre: '200-300 ml', format: 'Post-emergence' }, crops: ['Rice'], price: 520, brand: 'Generic', weight: '250 ml', tags: ['grasses', 'weeds'] },
  { title: 'Penoxsulam 2% + Cyhalofop 10%', category: 'herbicide', composition: 'Penoxsulam 2% + Cyhalofop 10%', dosage: { perAcre: '200-300 ml', format: 'Post-emergence' }, crops: ['Rice'], price: 580, brand: 'Generic', weight: '250 ml', tags: ['grasses', 'weeds'] },
  { title: 'Metsulfuron Methyl 20% WP', category: 'herbicide', composition: 'Metsulfuron Methyl 20%', dosage: { perAcre: '10-20 g', format: 'Post-emergence' }, crops: ['Wheat'], price: 350, brand: 'Generic', weight: '50 g', tags: ['broadleaf weeds'] },
  { title: 'Sulfosulfuron 75% WG', category: 'herbicide', composition: 'Sulfosulfuron 75%', dosage: { perAcre: '25-40 g', format: 'Post-emergence' }, crops: ['Wheat'], price: 480, brand: 'Generic', weight: '50 g', tags: ['grasses', 'weeds'] },
  { title: 'Clodinafop Propargyl 15% WP', category: 'herbicide', composition: 'Clodinafop Propargyl 15%', dosage: { perAcre: '40-60 g', format: 'Post-emergence' }, crops: ['Wheat'], price: 450, brand: 'Generic', weight: '50 g', tags: ['grasses'] },
  { title: 'Fenoxaprop-P-Ethyl 9.3% EC', category: 'herbicide', composition: 'Fenoxaprop-P-Ethyl 9.3%', dosage: { perAcre: '400-600 ml', format: 'Post-emergence' }, crops: ['Wheat'], price: 420, brand: 'Generic', weight: '500 ml', tags: ['grasses'] },
  { title: 'Quizalofop Ethyl 5% EC', category: 'herbicide', composition: 'Quizalofop Ethyl 5%', dosage: { perAcre: '400-600 ml', format: 'Post-emergence' }, crops: ['Cotton', 'Vegetables'], price: 450, brand: 'Generic', weight: '500 ml', tags: ['grasses'] },
  { title: 'Haloxyfop-R-Methyl 10.8% EC', category: 'herbicide', composition: 'Haloxyfop-R-Methyl 10.8%', dosage: { perAcre: '200-300 ml', format: 'Post-emergence' }, crops: ['Cotton', 'Vegetables'], price: 520, brand: 'Generic', weight: '250 ml', tags: ['grasses'] },
  { title: 'Oxadiargyl 80% WP', category: 'herbicide', composition: 'Oxadiargyl 80%', dosage: { perAcre: '50-75 g', format: 'Pre-emergence' }, crops: ['Rice'], price: 480, brand: 'Generic', weight: '50 g', tags: ['grasses', 'weeds'] },
  { title: 'Pyrazosulfuron Ethyl 10% WP', category: 'herbicide', composition: 'Pyrazosulfuron Ethyl 10%', dosage: { perAcre: '20-30 g', format: 'Pre-emergence' }, crops: ['Rice'], price: 450, brand: 'Generic', weight: '50 g', tags: ['grasses', 'weeds'] },
  { title: 'Alachlor 50% EC', category: 'herbicide', composition: 'Alachlor 50%', dosage: { perAcre: '1-1.5 L', format: 'Pre-emergence' }, crops: ['Cotton', 'Vegetables'], price: 380, brand: 'Generic', weight: '1 L', tags: ['grasses', 'weeds'] },
  { title: 'Metribuzin 70% WP', category: 'herbicide', composition: 'Metribuzin 70%', dosage: { perAcre: '100-150 g', format: 'Pre-emergence' }, crops: ['Potato', 'Tomato'], price: 420, brand: 'Generic', weight: '100 g', tags: ['broadleaf weeds', 'grasses'] },
  { title: 'Atrazine 50% WP', category: 'herbicide', composition: 'Atrazine 50%', dosage: { perAcre: '1-1.5 kg', format: 'Pre-emergence' }, crops: ['Maize'], price: 350, brand: 'Generic', weight: '1 kg', tags: ['broadleaf weeds', 'grasses'] },
  { title: 'Paraquat 24% SL', category: 'herbicide', composition: 'Paraquat 24%', dosage: { perAcre: '500-750 ml', format: 'Post-emergence' }, crops: ['All Crops'], price: 320, brand: 'Generic', weight: '500 ml', tags: ['contact herbicide', 'weeds'] },
  { title: 'Glufosinate Ammonium 13.5% SL', category: 'herbicide', composition: 'Glufosinate Ammonium 13.5%', dosage: { perAcre: '500-750 ml', format: 'Post-emergence' }, crops: ['All Crops'], price: 450, brand: 'Generic', weight: '500 ml', tags: ['contact herbicide', 'weeds'] },
  { title: 'Carfentrazone Ethyl 40% DF', category: 'herbicide', composition: 'Carfentrazone Ethyl 40%', dosage: { perAcre: '20-30 g', format: 'Post-emergence' }, crops: ['Wheat', 'Rice'], price: 480, brand: 'Generic', weight: '50 g', tags: ['broadleaf weeds'] },
  { title: 'Metsulfuron + Chlorimuron', category: 'herbicide', composition: 'Metsulfuron + Chlorimuron', dosage: { perAcre: '10-20 g', format: 'Post-emergence' }, crops: ['Wheat'], price: 420, brand: 'Generic', weight: '50 g', tags: ['broadleaf weeds'] }
];

const allProducts = [
  ...products,
  ...additionalInsecticides,
  ...additionalFungicides,
  ...additionalHerbicides
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kisan-sewa-kendra');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert products
    await Product.insertMany(allProducts);
    console.log(`Seeded ${allProducts.length} products successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, allProducts };

