import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from server/.env
dotenv.config({ path: join(__dirname, '.env') });

console.log('📝 Environment loaded from:', join(__dirname, '.env'));
console.log('🔍 SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set ✅' : 'Missing ❌');
console.log('🔍 SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set ✅' : 'Missing ❌');
