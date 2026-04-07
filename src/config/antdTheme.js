/* ========================================
   ANT DESIGN CUSTOM THEME CONFIGURATION
   F&B Optimized Color Scheme
   ======================================== */

export const antdThemeConfig = {
  token: {
    // Primary Colors
    colorPrimary: '#FF6B35',
    colorSuccess: '#50C878',
    colorWarning: '#FFC107',
    colorError: '#EF4444',
    colorInfo: '#4A90E2',
    
    // Font
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 28,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Border Radius
    borderRadius: 10,
    borderRadiusLG: 16,
    borderRadiusSM: 6,
    
    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    
    // Box Shadow
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.08)',
    
    // Line Height
    lineHeight: 1.5,
    lineHeightHeading: 1.25,
  },
  
  components: {
    Button: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      fontWeight: 600,
      primaryShadow: '0 8px 16px rgba(255, 107, 53, 0.2)',
    },
    
    Table: {
      headerBg: '#F9FAFB',
      headerColor: '#111827',
      borderColor: '#E5E7EB',
      rowHoverBg: '#FFF5EB',
    },
    
    Input: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
      colorBorder: '#E5E7EB',
      colorBgContainer: '#F9FAFB',
    },
    
    Select: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
    },
    
    DatePicker: {
      controlHeight: 40,
      controlHeightLG: 48,
      controlHeightSM: 32,
      borderRadius: 10,
    },
    
    Modal: {
      borderRadiusLG: 20,
      headerBg: '#FFFFFF',
      contentBg: '#FFFFFF',
    },
    
    Card: {
      borderRadiusLG: 16,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    },
    
    Drawer: {
      borderRadiusLG: 20,
    },
    
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(255, 107, 53, 0.1)',
      itemSelectedColor: '#FF6B35',
      itemHoverBg: 'rgba(255, 107, 53, 0.05)',
    },
    
    Tabs: {
      inkBarColor: '#FF6B35',
      itemActiveColor: '#FF6B35',
      itemHoverColor: '#FF8C5A',
      itemSelectedColor: '#FF6B35',
    },
    
    Tag: {
      borderRadiusSM: 6,
    },
    
    Notification: {
      borderRadiusLG: 16,
    },
    
    Message: {
      borderRadiusLG: 16,
    },
  },
};

// Locale Configuration (Indonesian)
export const antdLocale = {
  locale: 'id',
  Pagination: {
    items_per_page: '/ halaman',
    jump_to: 'Menuju',
    jump_to_confirm: 'konfirmasi',
    page: 'Halaman',
    prev_page: 'Halaman Sebelumnya',
    next_page: 'Halaman Selanjutnya',
    prev_5: '5 Halaman Sebelumnya',
    next_5: '5 Halaman Selanjutnya',
    prev_3: '3 Halaman Sebelumnya',
    next_3: '3 Halaman Selanjutnya',
  },
  DatePicker: {
    lang: {
      locale: 'id_ID',
      placeholder: 'Pilih tanggal',
      rangePlaceholder: ['Tanggal mulai', 'Tanggal selesai'],
      today: 'Hari ini',
      now: 'Sekarang',
      backToToday: 'Kembali ke hari ini',
      ok: 'OK',
      clear: 'Hapus',
      month: 'Bulan',
      year: 'Tahun',
      timeSelect: 'Pilih waktu',
      dateSelect: 'Pilih tanggal',
      monthSelect: 'Pilih bulan',
      yearSelect: 'Pilih tahun',
      decadeSelect: 'Pilih dekade',
      yearFormat: 'YYYY',
      dateFormat: 'D/M/YYYY',
      dayFormat: 'D',
      dateTimeFormat: 'D/M/YYYY HH:mm:ss',
      monthFormat: 'MMMM',
      monthBeforeYear: true,
    },
    timePickerLocale: {
      placeholder: 'Pilih waktu',
    },
  },
  Table: {
    filterTitle: 'Filter',
    filterConfirm: 'OK',
    filterReset: 'Reset',
    selectAll: 'Pilih semua',
    selectInvert: 'Balikkan pilihan',
    selectionAll: 'Pilih semua data',
    sortTitle: 'Urutkan',
    expand: 'Bentangkan baris',
    collapse: 'Ciutkan baris',
    triggerDesc: 'Klik untuk mengurutkan secara menurun',
    triggerAsc: 'Klik untuk mengurutkan secara menaik',
    cancelSort: 'Klik untuk membatalkan pengurutan',
  },
  Modal: {
    okText: 'OK',
    cancelText: 'Batal',
    justOkText: 'OK',
  },
  Popconfirm: {
    okText: 'OK',
    cancelText: 'Batal',
  },
  Transfer: {
    titles: ['', ''],
    searchPlaceholder: 'Cari',
    itemUnit: 'item',
    itemsUnit: 'items',
  },
  Upload: {
    uploading: 'Mengunggah...',
    removeFile: 'Hapus file',
    uploadError: 'Kesalahan unggah',
    previewFile: 'Pratinjau file',
    downloadFile: 'Unduh file',
  },
  Empty: {
    description: 'Tidak ada data',
  },
};
