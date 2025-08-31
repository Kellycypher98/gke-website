import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';
import 'dotenv/config';

// Types for Prisma schema parsing
interface Field {
  name: string;
  type: string;
  isId?: boolean;
  isUnique?: boolean;
  isOptional?: boolean;
  defaultValue?: string;
  relation?: {
    fields?: string[];
    references?: string[];
  };
}

interface Model {
  name: string;
  dbName: string | null;
  fields: Field[];
}

// Parse Prisma schema
function parsePrismaSchema(schema: string): Model[] {
  const models: Model[] = [];
  const modelRegex = /model\s+(\w+)\s*{([^}]+)}/g;
  const tableNameRegex = /@@map\(["']([^"']+)["']\)/;
  
  let match;
  while ((match = modelRegex.exec(schema)) !== null) {
    const [, name, content] = match;
    const tableNameMatch = content.match(tableNameRegex);
    
    const fields: Field[] = [];
    const fieldLines = content.split('\n').map(line => line.trim()).filter(Boolean);
    
    for (const line of fieldLines) {
      if (line.startsWith('//') || line.startsWith('@@')) continue;
      
      const fieldMatch = line.match(/^(\w+)\s+(\S+)(\s+@[^\n]+)?$/);
      if (!fieldMatch) continue;
      
      const [, fieldName, fieldType, attributes = ''] = fieldMatch;
      const isId = attributes.includes('@id');
      const isUnique = attributes.includes('@unique');
      const isOptional = fieldType.endsWith('?');
      const type = fieldType.replace('?', '');
      
      // Handle relations
      let relation;
      const relationMatch = attributes.match(/@relation\(([^)]+)\)/);
      if (relationMatch) {
        const relationContent = relationMatch[1];
        const fieldsMatch = relationContent.match(/fields:\s*\[([^\]]+)\]/);
        const referencesMatch = relationContent.match(/references:\s*\[([^\]]+)\]/);
        
        relation = {
          fields: fieldsMatch ? fieldsMatch[1].split(',').map(f => f.trim().replace(/["']/g, '')) : undefined,
          references: referencesMatch ? referencesMatch[1].split(',').map(f => f.trim().replace(/["']/g, '')) : undefined,
        };
      }
      
      fields.push({
        name: fieldName,
        type,
        isId,
        isUnique,
        isOptional,
        relation,
      });
    }
    
    models.push({
      name,
      dbName: tableNameMatch ? tableNameMatch[1] : null,
      fields,
    });
  }
  
  return models;
}

// Generate SQL for Supabase
function generateSupabaseSQL(models: Model[]): string {
  let sql = '-- Enable required extensions\n';
  sql += 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;\n\n';
  
  // Create tables
  for (const model of models) {
    const tableName = model.dbName || model.name.toLowerCase();
    sql += `-- ${model.name} table\n`;
    sql += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
    
    const columns: string[] = [];
    const primaryKeys: string[] = [];
    const uniqueConstraints: {name: string, fields: string[]}[] = [];
    
    // Add columns
    for (const field of model.fields) {
      let columnDef = `  "${field.name}"`;
      
      // Map Prisma types to SQL types
      switch (field.type.toLowerCase()) {
        case 'string':
          columnDef += ' TEXT';
          break;
        case 'boolean':
          columnDef += ' BOOLEAN';
          break;
        case 'int':
        case 'bigint':
          columnDef += ' BIGINT';
          break;
        case 'float':
        case 'decimal':
          columnDef += ' DECIMAL';
          break;
        case 'datetime':
          columnDef += ' TIMESTAMPTZ';
          break;
        case 'json':
          columnDef += ' JSONB';
          break;
        default:
          columnDef += ' TEXT'; // Default to TEXT for unknown types
      }
      
      // Add constraints
      if (field.isId) {
        columnDef += ' PRIMARY KEY';
        if (field.type === 'String') {
          columnDef += ' DEFAULT uuid_generate_v4()';
        }
        primaryKeys.push(field.name);
      }
      
      if (field.isUnique && !field.isId) {
        uniqueConstraints.push({
          name: `uk_${tableName}_${field.name}`,
          fields: [field.name]
        });
      }
      
      if (!field.isOptional && !field.isId) {
        columnDef += ' NOT NULL';
      }
      
      if (field.defaultValue) {
        columnDef += ` DEFAULT ${field.defaultValue}`;
      }
      
      columns.push(columnDef);
    }
    
    // Add composite unique constraints
    for (const uc of uniqueConstraints) {
      columns.push(`  CONSTRAINT ${uc.name} UNIQUE (${uc.fields.map(f => `"${f}"`).join(', ')})`);
    }
    
    // Add primary key constraint if composite
    if (primaryKeys.length > 1) {
      columns.push(`  PRIMARY KEY (${primaryKeys.map(k => `"${k}"`).join(', ')})`);
    }
    
    sql += columns.join(',\n') + '\n);\n\n';
    
    // Create indexes for foreign keys and unique fields
    for (const field of model.fields) {
      if (field.relation) {
        const indexName = `idx_${tableName}_${field.name}`;
        sql += `CREATE INDEX IF NOT EXISTS ${indexName} ON public.${tableName} ("${field.name}");\n`;
      }
      if (field.isUnique && !field.isId) {
        const indexName = `idx_${tableName}_${field.name}_unique`;
        sql += `CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON public.${tableName} ("${field.name}");\n`;
      }
    }
    
    sql += '\n';
  }
  
  // Add foreign key constraints after all tables are created
  for (const model of models) {
    const tableName = model.dbName || model.name.toLowerCase();
    
    for (const field of model.fields) {
      if (field.relation?.references) {
        const refModel = models.find(m => m.name === field.type);
        if (refModel) {
          const refTable = refModel.dbName || refModel.name.toLowerCase();
          const constraintName = `fk_${tableName}_${field.name}`;
          
          sql += `-- Add foreign key constraint for ${tableName}.${field.name}\n`;
          sql += `ALTER TABLE public.${tableName}\n`;
          sql += `  ADD CONSTRAINT ${constraintName}\n`;
          sql += `  FOREIGN KEY ("${field.name}")\n`;
          sql += `  REFERENCES public.${refTable}("${field.relation.references[0]}")\n`;
          sql += `  ON DELETE SET NULL\n`;
          sql += `  ON UPDATE CASCADE;\n\n`;
        }
      }
    }
  }
  
  return sql;
}

async function main() {
  try {
    // Read Prisma schema
    const schemaPath = join(__dirname, '..', 'prisma', 'schema.prisma');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Parse schema
    const models = parsePrismaSchema(schema);
    
    // Generate SQL
    const sql = generateSupabaseSQL(models);
    
    // Write SQL to file
    const outputPath = join(__dirname, '..', 'supabase', 'migrations', `${Date.now()}_initial_schema.sql`);
    require('fs').writeFileSync(outputPath, sql);
    
    console.log(`✅ Generated SQL migration file: ${outputPath}`);
    
    // Ask if user wants to apply the migration
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise<string>(resolve => {
      rl.question('Do you want to apply this migration to your Supabase database? (y/n) ', resolve);
    });
    
    if (answer.toLowerCase() === 'y') {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || await new Promise<string>(resolve => {
        rl.question('Enter your Supabase URL: ', resolve);
      });
      
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || await new Promise<string>(resolve => {
        rl.question('Enter your Supabase anon key: ', resolve);
      });
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Split SQL into individual statements and execute them
      const statements = sql.split(';').filter(s => s.trim().length > 0);
      
      for (const statement of statements) {
        try {
          const { error } = await supabase.rpc('pg_temp.execute', { query: statement });
          if (error) {
            console.error('Error executing statement:', error);
            console.log('Failed statement:', statement);
            break;
          }
          console.log('✓ Executed statement');
        } catch (err) {
          console.error('Error executing statement:', err);
          console.log('Failed statement:', statement);
          break;
        }
      }
      
      console.log('✅ Database migration completed!');
    }
    
    rl.close();
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

main();
