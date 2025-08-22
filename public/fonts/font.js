import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Or, if you want a custom Bengali font:
import NotoSansBengali from "./NotoSansBengali-Regular.ttf";

pdfMake.fonts = {
  NotoSansBengali: {
    normal: NotoSansBengali,
  },
};

export default pdfMake;
