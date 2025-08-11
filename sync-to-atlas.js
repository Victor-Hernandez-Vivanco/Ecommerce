import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar configuración de producción
dotenv.config({ path: '.env.production.local' });

const LOCAL_URI = 'mongodb://localhost:27017/planzzz';
const ATLAS_URI = process.env.MONGODB_URI;

if (!ATLAS_URI) {
  console.error('❌ Error: MONGODB_URI no encontrado en .env.production.local');
  process.exit(1);
}

// ✅ ESQUEMAS ACTUALIZADOS PARA COINCIDIR CON LA APLICACIÓN
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
  pricesByWeight: { type: [PriceByWeightSchema], required: true },
  pricePerKilo: { type: Number, required: true, min: 0 },
  images: { type: [ProductImageSchema], required: true },
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
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  color: { type: String, default: '#4299e1' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

// ✅ ESQUEMA CORRECTO DE ADVERTISEMENT
const AdvertisementImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
}, { _id: false });

const AdvertisementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: false, maxlength: 200 },
  image: { type: AdvertisementImageSchema, required: false },
  imageUrl: { type: String, required: false },
  linkUrl: { type: String, required: false },
  order: { type: Number, default: 0, min: 0 },
  isActive: { type: Boolean, default: true },
  type: {
    type: String,
    enum: ["product", "promotion", "external", "announcement"],
    default: "promotion"
  },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  views: { type: Number, default: 0, min: 0 },
  clicks: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
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
    
    // ✅ SINCRONIZAR CATEGORÍAS
    console.log('📂 Sincronizando categorías...');
    const localCategories = await LocalCategory.find({});
    if (localCategories.length > 0) {
      await AtlasCategory.deleteMany({});
      const categoriesToSync = localCategories.map(cat => {
        const obj = cat.toObject();
        delete obj._id;
        return obj;
      });
      await AtlasCategory.insertMany(categoriesToSync);
      console.log(`✅ ${localCategories.length} categorías sincronizadas`);
    } else {
      console.log('📭 No hay categorías para sincronizar');
    }
    
    // ✅ SINCRONIZAR PRODUCTOS
    console.log('🛍️ Sincronizando productos...');
    const localProducts = await LocalProduct.find({});
    if (localProducts.length > 0) {
      console.log(`📊 Productos encontrados en local: ${localProducts.length}`);
      
      await AtlasProduct.deleteMany({});
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of localProducts) {
        try {
          const productObj = product.toObject();
          delete productObj._id;
          
          await AtlasProduct.create(productObj);
          successCount++;
          console.log(`   ✅ "${product.name}" sincronizado`);
        } catch (productError) {
          errorCount++;
          console.error(`   ❌ Error sincronizando "${product.name}":`, productError.message);
        }
      }
      
      console.log(`✅ Productos sincronizados: ${successCount}/${localProducts.length}`);
      if (errorCount > 0) {
        console.log(`❌ Productos con errores: ${errorCount}`);
      }
    } else {
      console.log('📭 No hay productos para sincronizar');
    }
    
    // ✅ SINCRONIZAR USUARIOS
    console.log('👥 Sincronizando usuarios...');
    const localUsers = await LocalUser.find({});
    if (localUsers.length > 0) {
      for (const user of localUsers) {
        const userObj = user.toObject();
        delete userObj._id;
        await AtlasUser.findOneAndUpdate(
          { email: user.email },
          userObj,
          { upsert: true }
        );
      }
      console.log(`✅ ${localUsers.length} usuarios sincronizados`);
    } else {
      console.log('📭 No hay usuarios para sincronizar');
    }
    
    // ✅ SINCRONIZAR ADVERTISEMENTS
    console.log('📢 Sincronizando advertisements...');
    const localAds = await LocalAdvertisement.find({});
    if (localAds.length > 0) {
      await AtlasAdvertisement.deleteMany({});
      const adsToSync = localAds.map(ad => {
        const obj = ad.toObject();
        delete obj._id;
        return obj;
      });
      await AtlasAdvertisement.insertMany(adsToSync);
      console.log(`✅ ${localAds.length} advertisements sincronizados`);
    } else {
      console.log('📭 No hay advertisements para sincronizar');
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