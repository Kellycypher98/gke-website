import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the expected CSV format
interface TicketCsvRow {
  email: string;
  name: string;
  amount: string; // in cents, e.g., "2500" for $25.00
  quantity: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  ticketType: string;
  orderId: string;
}

// Configuration
const BATCH_SIZE = 5; // Number of tickets to process in parallel
const API_URL = 'http://localhost:3000/api/admin/send-tickets';
const API_KEY = process.env.ADMIN_API_KEY;

if (!API_KEY) {
  console.error('Error: ADMIN_API_KEY is not set in .env file');
  process.exit(1);
}

async function processBatch(batch: TicketCsvRow[]) {
  const payload = batch.map(row => ({
    email: row.email.trim(),
    name: row.name.trim(),
    amount: parseInt(row.amount, 10),
    quantity: parseInt(row.quantity, 10),
    eventName: row.eventName.trim(),
    eventDate: row.eventDate.trim(),
    eventLocation: row.eventLocation.trim(),
    ticketType: row.ticketType.trim(),
    orderId: row.orderId.trim(),
  }));

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending batch:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function main() {
  // Get CSV file path from command line arguments
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide the path to the CSV file');
    console.log('Usage: npx ts-node send-batch-tickets.ts <path-to-csv>');
    process.exit(1);
  }

  const csvPath = path.resolve(process.cwd(), args[0]);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: File not found: ${csvPath}`);
    process.exit(1);
  }

  console.log(`Reading tickets from: ${csvPath}`);
  
  try {
    // Read and parse CSV file
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records: TicketCsvRow[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    if (records.length === 0) {
      console.log('No records found in the CSV file');
      return;
    }

    console.log(`Found ${records.length} tickets to process`);
    
    // Process in batches
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} (${i + 1}-${Math.min(i + BATCH_SIZE, records.length)})`);
      
      const result = await processBatch(batch);
      
      if (result.success) {
        console.log(`Successfully processed batch:`, result);
      } else {
        console.error('Error processing batch:', result.error);
      }
      
      // Add a small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\nBatch processing complete!');
  } catch (error) {
    console.error('Error processing CSV file:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
