const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// ── Font resolution ──────────────────────────────────────────────────────────
const FONT_REGULAR_CANDIDATES = [
    'C:/Windows/Fonts/times.ttf',
    'C:/Windows/Fonts/arial.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
];
const FONT_BOLD_CANDIDATES = [
    'C:/Windows/Fonts/timesbd.ttf',
    'C:/Windows/Fonts/arialbd.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf',
];
const FONT_ITALIC_CANDIDATES = [
    'C:/Windows/Fonts/timesi.ttf',
    'C:/Windows/Fonts/ariali.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Italic.ttf',
];

function resolveFont(list) {
    return list.find((f) => fs.existsSync(f)) || null;
}

// ── Nội dung động theo từng loại giấy ───────────────────────────────────────
function getTypeContent(type, studentName, receiver, content) {
    const sv   = studentName || '............................';
    const recv = receiver    || '............................';

    const map = {
        'Thực tập doanh nghiệp': {
            opening:
                'Nhằm giúp cho sinh viên trường có kiến thức thực tế, nâng cao trình độ chuyên môn ' +
                'và học hỏi kinh nghiệm làm việc tại doanh nghiệp. ' +
                'Nay Trường Đại học Xây dựng Hà Nội giới thiệu:',
            viecViec: content || 'Thực tập tại đơn vị.',
            closing:
                `Kính mong ${recv} tạo điều kiện giúp đỡ cho sinh viên ${sv} ` +
                'hoàn thành tốt đợt thực tập.',
            bottomLabel: 'Ý KIẾN CỦA ĐƠN VỊ THỰC TẬP',
        },
        'Liên hệ công tác': {
            opening:
                'Nay Trường Đại học Xây dựng Hà Nội trân trọng giới thiệu sinh viên của Trường ' +
                'đến Quý cơ quan để liên hệ công tác:',
            viecViec: content || 'Liên hệ công tác tại đơn vị.',
            closing:
                `Kính mong ${recv} tạo điều kiện giúp đỡ cho sinh viên ${sv} ` +
                'hoàn thành tốt nhiệm vụ công tác.',
            bottomLabel: 'Ý KIẾN CỦA ĐƠN VỊ TIẾP NHẬN',
        },
        'Làm đề tài nghiên cứu': {
            opening:
                'Nhằm giúp cho sinh viên trường có điều kiện thu thập tài liệu thực tế, ' +
                'phục vụ nghiên cứu và làm đề tài tốt nghiệp khóa học. ' +
                'Nay Trường Đại học Xây dựng Hà Nội giới thiệu:',
            viecViec: content || 'Thu thập tài liệu, nghiên cứu và hoàn thành đề tài tốt nghiệp.',
            closing:
                `Kính mong ${recv} tạo điều kiện giúp đỡ cho sinh viên ${sv} ` +
                'hoàn thành tốt đề tài nghiên cứu.',
            bottomLabel: 'Ý KIẾN CỦA ĐƠN VỊ TIẾP NHẬN',
        },
    };

    return map[type] || map['Thực tập doanh nghiệp'];
}

// ── PdfUtil ──────────────────────────────────────────────────────────────────
class PdfUtil {
    static async generateRecommendationLetter(requestData) {
        return new Promise((resolve, reject) => {
            try {
                // Bố cục trang
                const MARGIN = 60;
                const PAGE_W = 595.28;
                const CONT_W = PAGE_W - MARGIN * 2;   // ~475pt

                // Cột header
                const L_X = MARGIN;
                const L_W = 215;
                const R_X = MARGIN + L_W + 15;
                const R_W = CONT_W - L_W - 15;

                const doc      = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
                const fileName = `recommendation_${requestData.id}_${Date.now()}.pdf`;
                const filePath = path.join(__dirname, '../public/pdfs', fileName);

                const fontReg    = resolveFont(FONT_REGULAR_CANDIDATES);
                const fontBold   = resolveFont(FONT_BOLD_CANDIDATES);
                const fontItalic = resolveFont(FONT_ITALIC_CANDIDATES);
                if (fontReg)    doc.registerFont('Reg',    fontReg);
                if (fontBold)   doc.registerFont('Bold',   fontBold);
                if (fontItalic) doc.registerFont('Italic', fontItalic);

                const R  = (sz = 12) => doc.font(fontReg    ? 'Reg'    : 'Helvetica').fontSize(sz);
                const B  = (sz = 12) => doc.font(fontBold   ? 'Bold'   : 'Helvetica-Bold').fontSize(sz);
                const It = (sz = 10) => doc.font(fontItalic ? 'Italic' : 'Helvetica-Oblique').fontSize(sz);

                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);

                // Ngày tháng năm hiện tại
                const d     = new Date();
                const ngay  = d.getDate();
                const thang = d.getMonth() + 1;
                const nam   = d.getFullYear();

                // Ngày hết hạn (30 ngày)
                const exp = new Date(d);
                exp.setDate(exp.getDate() + 30);
                const expiryStr = `${exp.getDate()}/${exp.getMonth() + 1}/${exp.getFullYear()}`;

                // Nội dung động
                const tc = getTypeContent(
                    requestData.type,
                    requestData.student_name,
                    requestData.receiver,
                    requestData.content
                );

                // ── HEADER 2 CỘT ─────────────────────────────────────────────
                let lY = MARGIN;

                // Cột trái
                B(10); doc.text('BỘ GIÁO DỤC VÀ ĐÀO TẠO', L_X, lY, { width: L_W, align: 'center' });
                lY = doc.y + 1;
                R(10); doc.text('Trường Đại học Xây dựng Hà Nội', L_X, lY, { width: L_W, align: 'center' });
                lY = doc.y + 1;
                doc.moveTo(L_X + 10, lY).lineTo(L_X + L_W - 10, lY).lineWidth(0.7).stroke();
                const leftEndY = lY + 3;

                // Cột phải
                let rY = MARGIN;
                B(10); doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', R_X, rY, { width: R_W, align: 'center' });
                rY = doc.y + 1;
                R(10); doc.text('Độc lập – Tự do – Hạnh phúc', R_X, rY, { width: R_W, align: 'center' });
                rY = doc.y + 1;
                doc.moveTo(R_X + 25, rY).lineTo(R_X + R_W - 25, rY).lineWidth(0.7).stroke();
                const rightEndY = rY + 3;

                // Dòng số và ngày
                let curY = Math.max(leftEndY, rightEndY) + 10;
                R(10); doc.text('Số: ......./GGT-ĐHXD', L_X, curY, { width: L_W });
                R(10); doc.text(`Hà Nội, ngày ${ngay} tháng ${thang} năm ${nam}`, R_X, curY, { width: R_W, align: 'center' });

                // ── TIÊU ĐỀ ──────────────────────────────────────────────────
                curY = Math.max(doc.y, curY) + 18;
                B(15); doc.text('GIẤY GIỚI THIỆU', MARGIN, curY, { width: CONT_W, align: 'center', underline: false });
                curY = doc.y + 14;

                // ── HELPER FORMAT FIELD ──────────────────────────────────────
                const formatField = (val, dots) => {
                    if (!val) return dots;
                    // Loại bỏ các dấu chấm vô tình bị dính ở cuối chuỗi
                    return String(val).replace(/\.+$/, '').trim();
                };

                // ── KÍNH GỬI ─────────────────────────────────────────────────
                R(12); doc.text('Kính gửi: ', MARGIN + 90, curY, { continued: true, underline: false });
                B(12); doc.text(formatField(requestData.receiver, '......................................................................'), { underline: false });
                curY = doc.y + 8;

                // ── ĐOẠN MỞ ĐẦU (thay đổi theo loại giấy) ──────────────────
                R(12); doc.text(tc.opening, L_X, curY, { width: CONT_W, align: 'justify', lineGap: 3, underline: false });
                curY = doc.y + 8;

                // ── DÒNG THÔNG TIN SINH VIÊN ─────────────────────────────────
                // "Sinh viên: [tên]    MSSV: .......    Lớp: .......    Khóa: ......."
                B(12); doc.text('Sinh viên: ', L_X, curY, { continued: true, underline: false });
                R(12); doc.text(formatField(requestData.student_name, '..........................'), { continued: true, underline: false });
                B(12); doc.text('   MSSV: ', { continued: true, underline: false });
                R(12); doc.text('..............', { continued: true, underline: false });
                B(12); doc.text('   Lớp: ', { continued: true, underline: false });
                R(12); doc.text('..............', { continued: true, underline: false });
                B(12); doc.text('   Khóa: ', { continued: true, underline: false });
                R(12); doc.text('..............', { underline: false });
                curY = doc.y + 5;

                // "Được giới thiệu đến: [receiver]"
                B(12); doc.text('Được giới thiệu đến: ', L_X, curY, { continued: true, underline: false });
                R(12); doc.text(formatField(requestData.receiver, '...................................................................'), { underline: false });
                curY = doc.y + 5;

                // "Địa chỉ: ..."
                B(12); doc.text('Địa chỉ: ', L_X, curY, { continued: true, underline: false });
                R(12); doc.text('...................................................................................................', { underline: false });
                curY = doc.y + 5;

                // "Về việc: ..."
                B(12); doc.text('Về việc: ', L_X, curY, { continued: true, underline: false });
                R(12); doc.text(formatField(tc.viecViec, '...................................................................'), { width: CONT_W - 75, underline: false });
                curY = doc.y + 14;

                // ── CÂU KẾT ──────────────────────────────────────────────────
                R(12); doc.text(tc.closing, L_X, curY, { width: CONT_W, align: 'justify', lineGap: 3 });
                curY = doc.y + 20;

                // ── VÙNG CHỮ KÝ 2 CỘT ────────────────────────────────────────
                const sigLW = 210;
                const sigRX = L_X + sigLW + 20;
                const sigRW = CONT_W - sigLW - 20;

                // Trái: Ngày hết hạn (in nghiêng)
                It(10); doc.text(`Giấy này có giá trị đến hết ngày ${expiryStr}`, L_X, curY, { width: sigLW, align: 'center' });

                // Phải: TL. Hiệu trưởng
                B(11); doc.text('TL. HIỆU TRƯỞNG', sigRX, curY, { width: sigRW, align: 'center' });
                B(11); doc.text('TRƯỞNG KHOA', sigRX, doc.y + 1, { width: sigRW, align: 'center' });
                R(10); doc.text('(Ký tên và đóng dấu)', sigRX, doc.y + 2, { width: sigRW, align: 'center' });

                curY = doc.y + 60;

                // ── Ý KIẾN ĐƠN VỊ (thay đổi label theo loại giấy) ───────────
                B(11); doc.text(tc.bottomLabel, L_X, curY, { width: sigLW });
                curY = doc.y + 12;
                R(11);
                doc.text('................................................................................', L_X, curY);
                curY = doc.y + 10;
                doc.text('................................................................................', L_X, curY);
                curY = doc.y + 8;
                It(10); doc.text('(Ký tên và đóng dấu)', L_X, curY, { width: sigLW, align: 'center' });

                doc.end();
                writeStream.on('close', () => resolve(`/pdfs/${fileName}`));
                writeStream.on('error',  (err) => reject(err));

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PdfUtil;
