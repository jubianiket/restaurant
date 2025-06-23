
import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';
import { replaceMenuItemsForUser } from '@/lib/menuService'; // Updated function name
import type { MenuItem } from '@/types';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ message: 'User ID is required for upload' }, { status: 400 });
    }

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.type !== 'application/vnd.ms-excel') {
        return NextResponse.json({ message: 'Invalid file type. Only Excel files (.xlsx, .xls) are allowed.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
        return NextResponse.json({ message: 'Excel file contains no sheets.' }, { status: 400 });
    }
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet) as any[];

    const newMenuItemsData: Omit<MenuItem, 'id' | 'userId'>[] = [];
    const errors: string[] = [];

    jsonData.forEach((row, index) => {
      const name = String(row['Name'] || row['name'] || '').trim();
      const description = String(row['Description'] || row['description'] || '').trim();
      const priceStr = String(row['Price'] || row['price'] || '').trim();
      const price = parseFloat(priceStr);
      const category = String(row['Category'] || row['category'] || '').trim();
      const portion = String(row['Portion'] || row['portion'] || '').trim();
      const imageUrl = String(row['ImageUrl'] || row['imageUrl'] || row['imageurl'] || '').trim();
      const dataAiHint = String(row['DataAiHint'] || row['dataAiHint'] || row['dataaihint'] || '').trim();

      if (!name) {
        errors.push(`Row ${index + 2}: Name is missing or invalid.`);
        return;
      }
      if (isNaN(price) || price <= 0) {
        errors.push(`Row ${index + 2} (Item: ${name}): Price is missing, zero, or invalid ('${priceStr}'). Must be a positive number.`);
        return;
      }
      if (!category) {
        errors.push(`Row ${index + 2} (Item: ${name}): Category is missing or invalid.`);
        return;
      }

      // Don't include id or userId here, service will handle it
      newMenuItemsData.push({
        name,
        description,
        price,
        category,
        portion: portion || undefined,
        imageUrl: imageUrl || undefined,
        dataAiHint: dataAiHint || undefined,
      });
    });

    if (errors.length > 0 && newMenuItemsData.length === 0) {
      return NextResponse.json({ 
        message: 'Error processing Excel file. No valid items found.', 
        errors 
      }, { status: 400 });
    }
    
    if (newMenuItemsData.length === 0 && jsonData.length > 0 && errors.length === 0) {
         return NextResponse.json({ message: 'No menu items found in the Excel file, or columns are misnamed. Expected columns: Name, Price, Category, Description (optional), ImageUrl (optional), DataAiHint (optional), Portion (optional).' }, { status: 400 });
    }
    if (newMenuItemsData.length === 0 && jsonData.length === 0) {
        return NextResponse.json({ message: 'Excel file is empty or has no data rows.' }, { status: 400 });
    }

    const processedItems = replaceMenuItemsForUser(newMenuItemsData, userId);

    return NextResponse.json({ 
        message: `Menu items for user ${userId} uploaded successfully. ${processedItems.length} items processed.`, 
        count: processedItems.length,
        warnings: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Excel upload error:', error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error during Excel processing.";
    return NextResponse.json({ message: 'Failed to upload menu items from Excel.', error: errorMessage }, { status: 500 });
  }
}
