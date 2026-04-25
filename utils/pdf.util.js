const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FONT_REGULAR_CANDIDATES = [
    'C:/Windows/Fonts/times.ttf',
    'C:/Windows/Fonts/arial.ttf',
    'C:/Windows/Fonts/tahoma.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf'
];

const FONT_BOLD_CANDIDATES = [
    'C:/Windows/Fonts/timesbd.ttf',
    'C:/Windows/Fonts/arialbd.ttf',
    'C:/Windows/Fonts/tahomabd.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Times_New_Roman_Bold.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'
];

function resolveFont(candidates) {
    return candidates.find((f) => fs.existsSync(f)) || null;
}

class PdfUtil {
    static async generateRecommendationLetter(requestData) {
        return new Promise((resolve, reject) => {
            try {
                // ── Hằng số bố cục ──────────────────────────────────────────
                const PAGE_W  = 595.28;
                const MARGIN  = 55;
                const CONT_W  = PAGE_W - MARGIN * 2;          // ~485

                const L_X = MARGIN;
                const L_W = 220;
                const R_X = MARGIN + L_W + 20;
                const R_W = CONT_W - L_W - 20;

                const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });
                const fileName = `recommendation_${requestData.id}_${Date.now()}.pdf`;
                const filePath = path.join(__dirname, '../public/pdfs', fileName);

                const fontReg  = resolveFont(FONT_REGULAR_CANDIDATES);
                const fontBold = resolveFont(FONT_BOLD_CANDIDATES);
                if (fontReg)  doc.registerFont('Reg',  fontReg);
                if (fontBold) doc.registerFont('Bold', fontBold);

                const R = () => doc.font(fontReg  ? 'Reg'  : 'Helvetica');
                const B = () => doc.font(fontBold ? 'Bold' : 'Helvetica-Bold');

                const writeStream = fs.createWriteStream(filePath);
                doc.pipe(writeStream);

                const d     = new Date();
                const ngay  = d.getDate();
                const thang = d.getMonth() + 1;
                const nam   = d.getFullYear();

                // ── HEADER 2 CỘT ─────────────────────────────────────────────
                let lY = MARGIN;

                // Cột trái
                B();
                doc.fontSize(10).text('BỘ GIÁO DỤC VÀ ĐÀO TẠO', L_X, lY, { width: L_W, align: 'center' });
                lY = doc.y + 1;
                B();
                doc.fontSize(10).text('TRƯỜNG ĐẠI HỌC XÂY DỰNG HÀ NỘI', L_X, lY, { width: L_W, align: 'center' });
                lY = doc.y + 2;
                // Gạch dưới tên trường
                doc.moveTo(L_X + 15, lY).lineTo(L_X + L_W - 15, lY).lineWidth(0.8).strokeColor('#000').stroke();
                lY += 5;
                R();
                doc.fontSize(10).text('Số:  ......./ĐHXD', L_X, lY, { width: L_W, align: 'center' });
                const leftEndY = doc.y;

                // Cột phải
                let rY = MARGIN;
                B();
                doc.fontSize(10).text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', R_X, rY, { width: R_W, align: 'center' });
                rY = doc.y + 1;
                R();
                doc.fontSize(11).text('Độc lập - Tự do - Hạnh phúc', R_X, rY, { width: R_W, align: 'center' });
                rY = doc.y + 2;
                // Gạch dưới tiêu ngữ
                doc.moveTo(R_X + 20, rY).lineTo(R_X + R_W - 20, rY).lineWidth(0.8).strokeColor('#000').stroke();
                rY += 5;
                R();
                doc.fontSize(10).text(
                    `Hà Nội, ngày ${ngay} tháng ${thang} năm ${nam}`,
                    R_X, rY, { width: R_W, align: 'center' }
                );
                const rightEndY = doc.y;

                // Vị trí Y tiếp theo sau header
                let curY = Math.max(leftEndY, rightEndY) + 18;

                // ── TIÊU ĐỀ ──────────────────────────────────────────────────
                B();
                doc.fontSize(15).text('GIẤY GIỚI THIỆU', MARGIN, curY, { width: CONT_W, align: 'center' });
                curY = doc.y + 14;

                // ── NỘI DUNG ─────────────────────────────────────────────────
                R();
                doc.fontSize(12);

                // Kính gửi
                doc.text('Kính gửi: ', L_X, curY, { continued: true });
                B();
                doc.text(requestData.receiver || '...........................................................................');
                curY = doc.y + 8;

                // Đoạn giới thiệu
                R();
                doc.fontSize(12).text(
                    'Trường Đại học Xây dựng Hà Nội trân trọng giới thiệu đến Quý cơ quan sinh viên của Trường ' +
                    'đang thực hiện yêu cầu dưới đây. Nay Trường giới thiệu sinh viên đến Quý cơ quan, kính mong ' +
                    'Quý cơ quan tạo điều kiện giúp đỡ:',
                    L_X, curY, { width: CONT_W, align: 'justify', lineGap: 3 }
                );
                curY = doc.y + 10;

                // ── CÁC DÒNG THÔNG TIN có gạch chân ─────────────────────────
                const fieldLine = (label, value) => {
                    B();
                    doc.fontSize(12).text(label + ': ', L_X, curY, { continued: true, width: CONT_W });
                    R();
                    doc.text(value || '', { underline: true });
                    curY = doc.y + 5;
                };

                fieldLine('Họ và tên sinh viên', requestData.student_name);
                fieldLine('Loại giấy yêu cầu',   requestData.type);

                // Nội dung
                B();
                doc.fontSize(12).text('Nội dung:', L_X, curY);
                curY = doc.y + 3;
                R();
                doc.fontSize(12).text(requestData.content || '...', L_X, curY, {
                    width: CONT_W, align: 'justify', lineGap: 4
                });
                curY = doc.y + 12;

                // Câu kết
                R();
                doc.fontSize(12).text(
                    'Kính mong Quý cơ quan tạo điều kiện giúp đỡ sinh viên hoàn thành tốt công việc. ' +
                    'Trân trọng cảm ơn!',
                    L_X, curY, { width: CONT_W, align: 'justify', lineGap: 3 }
                );
                curY = doc.y + 22;

                // ── CHỮ KÝ 2 CỘT ─────────────────────────────────────────────
                const sigLX = L_X;
                const sigLW = 210;
                const sigRX = L_X + sigLW + 30;
                const sigRW = CONT_W - sigLW - 30;

                // Cột trái: Ý kiến đơn vị tiếp nhận
                B();
                doc.fontSize(11).text('Ý KIẾN CỦA ĐƠN VỊ TIẾP NHẬN', sigLX, curY, { width: sigLW, align: 'center' });
                R();
                doc.fontSize(10).text('(Ký tên, đóng dấu)', sigLX, doc.y + 2, { width: sigLW, align: 'center' });

                // Cột phải: Hiệu trưởng
                B();
                doc.fontSize(11).text('T.HIỆU TRƯỞNG', sigRX, curY, { width: sigRW, align: 'center' });
                doc.fontSize(11).text('PHÒNG ĐÀO TẠO', sigRX, doc.y + 1, { width: sigRW, align: 'center' });
                R();
                doc.fontSize(10).text('(Ký tên, đóng dấu)', sigRX, doc.y + 2, { width: sigRW, align: 'center' });

                // Khoảng trống cho chữ ký tay
                const afterSigY = doc.y + 55;

                // Tên người ký (phải)
                B();
                doc.fontSize(12).text('(Đã ký)', sigRX, afterSigY, { width: sigRW, align: 'center' });

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
