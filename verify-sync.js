import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar configuración de producción
dotenv.config({ path: '.env.production.local' });

const LOCAL_URI = 'mongodb://localhost:27017/planzzz';
const ATLAS_URI = process.env.MONGODB_URI;

async function verifySync() {
  try {
    console.log('🔍 Verificando sincronización Local ↔ Atlas...');
    
    // Conectar a ambas bases
    const localConn = await mongoose.createConnection(LOCAL_URI);
    const atlasConn = await mongoose.createConnection(ATLAS_URI);
    
    // Esquemas simples para conteo
    const simpleSchema = new mongoose.Schema({}, { strict: false });
    
    const LocalProduct = localConn.model('Product', simpleSchema);
    const LocalCategory = localConn.model('Category', simpleSchema);
    const LocalUser = localConn.model('User', simpleSchema);
    const LocalAdvertisement = localConn.model('Advertisement', simpleSchema);
    
    const AtlasProduct = atlasConn.model('Product', simpleSchema);
    const AtlasCategory = atlasConn.model('Category', simpleSchema);
    const AtlasUser = atlasConn.model('User', simpleSchema);
    const AtlasAdvertisement = atlasConn.model('Advertisement', simpleSchema);
    
    // Verificar conteos
    const localCounts = {
      products: await LocalProduct.countDocuments(),
      categories: await LocalCategory.countDocuments(),
      users: await LocalUser.countDocuments(),
      advertisements: await LocalAdvertisement.countDocuments()
    };
    
    const atlasCounts = {
      products: await AtlasProduct.countDocuments(),
      categories: await AtlasCategory.countDocuments(),
      users: await AtlasUser.countDocuments(),
      advertisements: await AtlasAdvertisement.countDocuments()
    };
    
    console.log('\n📊 RESUMEN DE SINCRONIZACIÓN:');
    console.log('┌─────────────────┬─────────┬─────────┬──────────┐');
    console.log('│ Colección       │ Local   │ Atlas   │ Estado   │');
    console.log('├─────────────────┼─────────┼─────────┼──────────┤');
    
    Object.keys(localCounts).forEach(key => {
      const local = localCounts[key];
      const atlas = atlasCounts[key];
      const status = local === atlas ? '✅ OK' : '❌ DIFF';
      console.log(`│ ${key.padEnd(15)} │ ${local.toString().padEnd(7)} │ ${atlas.toString().padEnd(7)} │ ${status.padEnd(8)} │`);
    });
    
    console.log('└─────────────────┴─────────┴─────────┴──────────┘');
    
    // Verificar advertisements activos
    const activeAds = await AtlasAdvertisement.find({ isActive: true });
    console.log(`\n📢 Advertisements activos en Atlas: ${activeAds.length}`);
    activeAds.forEach(ad => {
      console.log(`   - ${ad.title} (${ad.type})`);
    });
    
    // Verificar categorías activas
    const activeCategories = await AtlasCategory.find({ isActive: true });
    console.log(`\n📂 Categorías activas en Atlas: ${activeCategories.length}`);
    activeCategories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug})`);
    });
    
    await localConn.close();
    await atlasConn.close();
    
    console.log('\n✅ Verificación completada');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    process.exit(1);
  }
}

verifySync();