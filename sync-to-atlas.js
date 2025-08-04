import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar configuración de producción
dotenv.config({ path: '.env.production.local' });

const LOCAL_URI = 'mongodb://localhost:27017/frutos-secos-local';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI no encontrado en .env.production.local');
  process.exit(1);
}

// Modelos (importar desde tu proyecto)
const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  images: [String],
  stock: Number,
  featured: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const CategorySchema = new mongoose.Schema({
  name: String,
  slug: String,
  image: String,
  color: String,
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const AdvertisementSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  link: String,
  active: Boolean,
  createdAt: { type: Date, default: Date.now }
});

async function syncToAtlas() {
  try {
    console.log('🔄 Iniciando sincronización Local → Atlas...');
    
    // Conectar a base local
    console.log('📡 Conectando a MongoDB Local...');
    const localConn = await mongoose.createConnection(LOCAL_URI);
    
    // Conectar a Atlas
    console.log('☁️ Conectando a MongoDB Atlas...');
    const atlasConn = await mongoose.createConnection(ATLAS_URI);
    
    // Modelos para ambas conexiones
    const LocalProduct = localConn.model('Product', ProductSchema);
    const LocalCategory = localConn.model('Category', CategorySchema);
    const LocalUser = localConn.model('User', UserSchema);
    const LocalAdvertisement = localConn.model('Advertisement', AdvertisementSchema);
    
    const AtlasProduct = atlasConn.model('Product', ProductSchema);
    const AtlasCategory = atlasConn.model('Category', CategorySchema);
    const AtlasUser = atlasConn.model('User', UserSchema);
    const AtlasAdvertisement = atlasConn.model('Advertisement', AdvertisementSchema);
    
    // Sincronizar Categorías
    console.log('📂 Sincronizando categorías...');
    const localCategories = await LocalCategory.find({});
    if (localCategories.length > 0) {
      await AtlasCategory.deleteMany({});
      await AtlasCategory.insertMany(localCategories.map(cat => cat.toObject()));
      console.log(`✅ ${localCategories.length} categorías sincronizadas`);
    }
    
    // Sincronizar Productos
    console.log('🛍️ Sincronizando productos...');
    const localProducts = await LocalProduct.find({});
    if (localProducts.length > 0) {
      await AtlasProduct.deleteMany({});
      await AtlasProduct.insertMany(localProducts.map(prod => prod.toObject()));
      console.log(`✅ ${localProducts.length} productos sincronizados`);
    }
    
    // Sincronizar Usuarios (solo admins)
    console.log('👥 Sincronizando usuarios administradores...');
    const localAdmins = await LocalUser.find({ role: 'admin' });
    if (localAdmins.length > 0) {
      // No eliminar todos los usuarios, solo sincronizar admins
      for (const admin of localAdmins) {
        await AtlasUser.findOneAndUpdate(
          { email: admin.email },
          admin.toObject(),
          { upsert: true }
        );
      }
      console.log(`✅ ${localAdmins.length} administradores sincronizados`);
    }
    
    // Sincronizar Anuncios
    console.log('📢 Sincronizando anuncios...');
    const localAds = await LocalAdvertisement.find({});
    if (localAds.length > 0) {
      await AtlasAdvertisement.deleteMany({});
      await AtlasAdvertisement.insertMany(localAds.map(ad => ad.toObject()));
      console.log(`✅ ${localAds.length} anuncios sincronizados`);
    }
    
    console.log('\n🎉 ¡Sincronización completada exitosamente!');
    console.log('📝 Ejecuta verify-sync.js para verificar los datos');
    
    await localConn.close();
    await atlasConn.close();
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

syncToAtlas();