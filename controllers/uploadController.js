const excelService = require('../services/excelService');
const leadRepository = require('../repositories/leadRepository');
const path = require('path');

class UploadController {
  // Upload and parse Excel file
  async uploadExcel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const filePath = req.file.path;
      console.log('📁 Processing file:', filePath);

      // Parse Excel file
      const parsedData = excelService.parseExcelFile(filePath);

      if (parsedData.valid.length === 0) {
        // Delete file
        excelService.deleteFile(filePath);

        return res.status(400).json({
          success: false,
          message: 'No valid leads found in Excel file',
          errors: parsedData.invalid
        });
      }

      // Check for duplicate phone numbers
      const uniqueLeads = await this.filterDuplicates(parsedData.valid);

      // Save leads to database
      const savedLeads = await leadRepository.createMany(uniqueLeads.new);

      // Delete uploaded file
      excelService.deleteFile(filePath);

      res.status(201).json({
        success: true,
        message: 'Leads uploaded successfully',
        data: {
          total: parsedData.valid.length,
          imported: savedLeads.length,
          duplicates: uniqueLeads.duplicates.length,
          errors: parsedData.invalid.length,
          leads: savedLeads,
          duplicateList: uniqueLeads.duplicates,
          errorList: parsedData.invalid
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up file on error
      if (req.file) {
        excelService.deleteFile(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload leads'
      });
    }
  }

  // Filter out duplicate phone numbers
  async filterDuplicates(leads) {
    const newLeads = [];
    const duplicates = [];

    for (const lead of leads) {
      // Check if phone already exists
      const existing = await leadRepository.findByPhone(lead.phone);
      
      if (existing) {
        duplicates.push({
          ...lead,
          existingId: existing._id,
          reason: 'Phone number already exists'
        });
      } else {
        newLeads.push(lead);
      }
    }

    return {
      new: newLeads,
      duplicates
    };
  }

  // Download sample Excel template
  async downloadSample(req, res) {
    try {
      const samplePath = path.join(__dirname, '../uploads/sample-leads.xlsx');
      
      // Generate sample file if it doesn't exist
      excelService.generateSampleExcel(samplePath);

      res.download(samplePath, 'sample-leads.xlsx', (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({
            success: false,
            message: 'Failed to download sample file'
          });
        }
      });
    } catch (error) {
      console.error('Sample generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate sample file'
      });
    }
  }
}

module.exports = new UploadController();