const XLSX = require('xlsx');
const fs = require('fs');

class ExcelService {
  // Parse Excel file and return lead data
  parseExcelFile(filePath) {
    try {
      // Read the file
      const workbook = XLSX.readFile(filePath);
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`📊 Parsed ${rawData.length} rows from Excel`);
      
      // Clean and validate data
      const leads = this.cleanLeadData(rawData);
      
      console.log(`✅ Validated ${leads.valid.length} leads, ${leads.invalid.length} errors`);
      
      return leads;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw new Error('Failed to parse Excel file: ' + error.message);
    }
  }

  // Clean and validate lead data
  cleanLeadData(rawData) {
    const valid = [];
    const invalid = [];

    rawData.forEach((row, index) => {
      try {
        // Required fields
        const name = this.cleanString(row.Name || row.name || row.NAME);
        const phone = this.cleanPhone(row.Phone || row.phone || row.PHONE);
        
        if (!name || !phone) {
          invalid.push({
            row: index + 2, // Excel row number (1-indexed + header)
            data: row,
            error: 'Missing required fields: Name or Phone'
          });
          return;
        }

        // Optional fields
        const email = this.cleanEmail(row.Email || row.email || row.EMAIL);
        const location = this.cleanString(row.Location || row.location || row.LOCATION);
        const status = this.normalizeStatus(row.Status || row.status || row.STATUS);
        const budget = this.cleanString(row.Budget || row.budget || row.BUDGET);
        const priority = this.normalizePriority(row.Priority || row.priority || row.PRIORITY);

        valid.push({
          name,
          phone,
          email,
          location,
          status,
          budget,
          priority,
          source: 'Excel Import',
          notes: this.cleanString(row.Notes || row.notes || row.NOTES || '')
        });
      } catch (error) {
        invalid.push({
          row: index + 2,
          data: row,
          error: error.message
        });
      }
    });

    return { valid, invalid };
  }

  // Clean string fields
  cleanString(value) {
    if (!value) return '';
    return String(value).trim();
  }

  // Clean and validate phone number
  cleanPhone(value) {
    if (!value) return null;
    
    // Remove all non-digits
    let phone = String(value).replace(/\D/g, '');
    
    // Handle Indian phone numbers
    if (phone.length === 10) {
      phone = '+91' + phone;
    } else if (phone.length === 12 && phone.startsWith('91')) {
      phone = '+' + phone;
    } else if (!phone.startsWith('+')) {
      phone = '+' + phone;
    }
    
    // Validate length
    if (phone.length < 10 || phone.length > 15) {
      throw new Error('Invalid phone number length');
    }
    
    return phone;
  }

  // Clean and validate email
  cleanEmail(value) {
    if (!value) return '';
    
    const email = String(value).trim().toLowerCase();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return ''; // Return empty instead of throwing error
    }
    
    return email;
  }

  // Normalize status values
  normalizeStatus(value) {
    if (!value) return 'New';
    
    const status = String(value).trim().toLowerCase();
    
    const statusMap = {
      'new': 'New',
      'contacted': 'Contacted',
      'interested': 'Interested',
      'not interested': 'Not Interested',
      'callback': 'Callback',
      'appointment booked': 'Appointment Booked',
      'closed': 'Closed'
    };
    
    return statusMap[status] || 'New';
  }

  // Normalize priority values
  normalizePriority(value) {
    if (!value) return 'Medium';
    
    const priority = String(value).trim().toLowerCase();
    
    const priorityMap = {
      'high': 'High',
      'medium': 'Medium',
      'low': 'Low',
      'h': 'High',
      'm': 'Medium',
      'l': 'Low'
    };
    
    return priorityMap[priority] || 'Medium';
  }

  // Generate sample Excel file
  generateSampleExcel(filePath) {
    const sampleData = [
      {
        Name: 'Rajesh Kumar',
        Phone: '+919876543210',
        Email: 'rajesh.kumar@email.com',
        Location: 'Bhubaneswar',
        Status: 'New',
        Budget: '50-75L',
        Priority: 'High',
        Notes: 'Looking for 3BHK'
      },
      {
        Name: 'Priya Sharma',
        Phone: '+919876543211',
        Email: 'priya.sharma@email.com',
        Location: 'Cuttack',
        Status: 'New',
        Budget: '75L-1Cr',
        Priority: 'Medium',
        Notes: 'Interested in premium apartments'
      },
      {
        Name: 'Amit Patel',
        Phone: '+919876543212',
        Email: 'amit.patel@email.com',
        Location: 'Puri',
        Status: 'Interested',
        Budget: '40-50L',
        Priority: 'High',
        Notes: 'Previously visited another project'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');
    
    XLSX.writeFile(workbook, filePath);
    console.log(`✅ Sample Excel file created: ${filePath}`);
    
    return filePath;
  }

  // Delete uploaded file after processing
  deleteFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}

module.exports = new ExcelService();