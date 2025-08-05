import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

// Cargar configuración de producción
dotenv.config({ path: '.env.production.local' });

const LOCAL_URI = 'mongodb://localhost:27017/planzzz';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI no encontrado en .env.production.local');
  process.exit(1);
}

// Modelos (importar desde tu proyecto)
// Reemplaza el ProductSchema actual (líneas 17-26) con:
const PriceByWeightSchema = new mongoose.Schema({
  weight: { type: Number, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 }
}, { _id: false });

const ProductImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now },
  isPrimary: { type: Boolean, default: false }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  pricesByWeight: {
    type: [PriceByWeightSchema],
    required: true
  },
  pricePerKilo: { type: Number, required: true, min: 0 },
  images: {
    type: [ProductImageSchema],
    required: true
  },
  image: { type: String, required: false },
  basePricePer100g: { type: Number, required: false, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ["Frutos Secos", "Frutas Deshidratadas", "Despensa", "Semillas", "Mix", "Cereales", "Snack", "Full", "Box"]
  },
  categories: { type: [String], required: false },
  totalStock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  isAdvertisement: { type: Boolean, default: false },
  isMainCarousel: { type: Boolean, default: false },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    fats: Number,
    carbs: Number
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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
    
    // Sincronizar Productos (reemplaza las líneas 125-131)
    console.log('🛍️ Sincronizando productos...');
    try {
      const localProducts = await LocalProduct.find({});
      console.log(`📊 Productos encontrados en local: ${localProducts.length}`);
      
      if (localProducts.length > 0) {
        // Validar productos antes de sincronizar
        console.log('🔍 Validando productos...');
        for (let i = 0; i < localProducts.length; i++) {
          const product = localProducts[i];
          console.log(`   - Producto ${i + 1}: ${product.name}`);
          
          // Verificar campos requeridos
          if (!product.pricesByWeight || product.pricesByWeight.length === 0) {
            console.warn(`   ⚠️  Producto "${product.name}" no tiene pricesByWeight válido`);
          }
          if (!product.images || product.images.length === 0) {
            console.warn(`   ⚠️  Producto "${product.name}" no tiene imágenes válidas`);
          }
        }
        
        console.log('🗑️ Eliminando productos existentes en Atlas...');
        const deleteResult = await AtlasProduct.deleteMany({});
        console.log(`   Eliminados: ${deleteResult.deletedCount} productos`);
        
        console.log('📤 Insertando productos en Atlas...');
        
        // Insertar uno por uno para mejor control de errores
        let successCount = 0;
        let errorCount = 0;
        
        for (const product of localProducts) {
          try {
            const productObj = product.toObject();
            delete productObj._id; // Eliminar _id para evitar conflictos
            
            await AtlasProduct.create(productObj);
            successCount++;
            console.log(`   ✅ "${product.name}" sincronizado`);
          } catch (productError) {
            errorCount++;
            console.error(`   ❌ Error sincronizando "${product.name}":`, productError.message);
            
            // Log detallado del producto problemático
            console.log('   📋 Datos del producto problemático:', {
              name: product.name,
              hasImages: product.images?.length || 0,
              hasPricesByWeight: product.pricesByWeight?.length || 0,
              category: product.category
            });
          }
        }
        
        console.log(`✅ Productos sincronizados: ${successCount}/${localProducts.length}`);
        if (errorCount > 0) {
          console.log(`❌ Productos con errores: ${errorCount}`);
        }
      } else {
        console.log('📭 No hay productos para sincronizar');
      }
    } catch (error) {
      console.error('❌ Error general en sincronización de productos:', error);
      throw error;
    }
    
    // Sincronizar Usuarios (solo admins)
    console.log('👥 Sincronizando usuarios administradores...');
    // Líneas 190-202 - Cambiar de:
    const localAdmins = await LocalUser.find({ role: 'admin' });
    if (localAdmins.length > 0) {
      for (const admin of localAdmins) {
        await AtlasUser.findOneAndUpdate(
          { email: admin.email },
          admin.toObject(),
          { upsert: true }
        );
      }
      console.log(`✅ ${localAdmins.length} administradores sincronizados`);
    }
    
    // A:
    const localUsers = await LocalUser.find({});
    if (localUsers.length > 0) {
      for (const user of localUsers) {
        await AtlasUser.findOneAndUpdate(
          { email: user.email },
          user.toObject(),
          { upsert: true }
        );
      }
      console.log(`✅ ${localUsers.length} usuarios sincronizados`);
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