import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// ✅ Load Bengali font into VFS
pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
  NotoSansBengali: {
    normal: "NotoSansBengali-Regular.ttf",
    bold: "NotoSansBengali-Regular.ttf",
    italics: "NotoSansBengali-Regular.ttf",
    bolditalics: "NotoSansBengali-Regular.ttf",
  },
};

export default pdfMake;
