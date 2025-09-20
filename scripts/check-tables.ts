const { createClient: supabaseCreateClient } = require('@supabase/supabase-js');

interface TableInfo {
  tablename: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

async function checkTables() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  const supabase = supabaseCreateClient(supabaseUrl, supabaseKey);

  try {
    // Check if bookings table exists
    const { data: tables, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) throw error;

    console.log('Available tables:');
    console.table(tables);

    // Check if gallery_items table exists
    const galleryTableExists = tables.some((t: TableInfo) => t.tablename === 'gallery_items');
    
    if (galleryTableExists) {
      console.log('\ngallery_items table exists. Checking columns...');
      
      // Get column information for gallery_items using information_schema
      const { data: columns, error: columnError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'gallery_items');
      
      if (columnError) {
        console.error('Error fetching column info:', columnError);
      } else {
        console.log('\nColumns in gallery_items table:');
        console.table(columns);
      }
    } else {
      console.log('\ngallery_items table does not exist in the database.');
      console.log('You need to run the migration to create the table.');
      console.log('Run: npx supabase db push');
    }

    // If bookings table exists, show its structure
    if (tables.some((t: TableInfo) => t.tablename === 'bookings')) {
      console.log('\nBookings table structure:');
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'bookings');
      
      if (colError) throw colError;
      console.table(columns);
    } else {
      console.log('\nBookings table does not exist!');
    }
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

checkTables();
