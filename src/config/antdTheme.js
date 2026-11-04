/* ========================================
   ANT DESIGN THEME CONFIGURATION
   taste-skill v2 · Style: framed-sheet
   ======================================== */

export const antdThemeConfig = {
  token: {
    colorPrimary: '#131416',
    colorSuccess: '#1e7b4f',
    colorWarning: '#92400e',
    colorError: '#c4242a',
    colorInfo: '#1b6c80',

    fontFamily: '"IBM Plex Sans", Inter, system-ui, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 24,
    fontSizeHeading2: 20,
    fontSizeHeading3: 18,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,

    borderRadius: 6,
    borderRadiusLG: 12,
    borderRadiusSM: 6,

    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    boxShadow: 'none',
    boxShadowSecondary: 'none',

    lineHeight: 1.5,
    lineHeightHeading: 1.3,
  },

  components: {
    Button: {
      controlHeight: 38,
      controlHeightLG: 42,
      controlHeightSM: 32,
      fontWeight: 500,
      primaryShadow: 'none',
    },

    Table: {
      headerBg: '#f4f6f8',
      headerColor: '#525558',
      borderColor: '#e8eaec',
      rowHoverBg: '#f4f6f8',
    },

    Input: {
      controlHeight: 38,
      controlHeightLG: 42,
      controlHeightSM: 32,
      borderRadius: 6,
      colorBorder: '#cdced1',
      colorBgContainer: '#ffffff',
    },

    Select: {
      controlHeight: 38,
      controlHeightLG: 42,
      controlHeightSM: 32,
      borderRadius: 6,
    },

    DatePicker: {
      controlHeight: 38,
      controlHeightLG: 42,
      controlHeightSM: 32,
      borderRadius: 6,
    },

    Modal: {
      borderRadiusLG: 12,
      headerBg: '#ffffff',
      contentBg: '#ffffff',
    },

    Card: {
      borderRadiusLG: 8,
      boxShadow: 'none',
    },

    Drawer: {
      borderRadiusLG: 12,
    },

    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#ebedee',
      itemSelectedColor: '#131416',
      itemHoverBg: '#f4f6f8',
    },

    Tabs: {
      inkBarColor: '#131416',
      itemActiveColor: '#131416',
      itemHoverColor: '#1b6c80',
      itemSelectedColor: '#131416',
    },

    Tag: {
      borderRadiusSM: 6,
    },

    Notification: {
      borderRadiusLG: 8,
    },

    Message: {
      borderRadiusLG: 8,
    },
  },
};

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
