import { LEVELS, LevelType, Student } from './types';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Fix lỗi import: Kiểm tra xem export nằm ở default hay root
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Config PDF.js worker
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
}

export const calculateLevel = (points: number): LevelType => {
  if (points >= LEVELS['cay-to'].min) return 'cay-to';
  if (points >= LEVELS['cay-con'].min) return 'cay-con';
  if (points >= LEVELS['nay-mam'].min) return 'nay-mam';
  return 'hat';
};

export const getNextLevelInfo = (currentPoints: number) => {
  const level = calculateLevel(currentPoints);
  
  if (level === 'cay-to') {
    return { percent: 100, remaining: 0, nextLevelName: 'Max Level' };
  }

  const currentLevelInfo = LEVELS[level];
  let nextMin = 100;
  let nextName = '';
  
  if (level === 'hat') { nextMin = 20; nextName = 'Nảy mầm'; }
  else if (level === 'nay-mam') { nextMin = 50; nextName = 'Cây con'; }
  else if (level === 'cay-con') { nextMin = 100; nextName = 'Cây to'; }

  const range = nextMin - currentLevelInfo.min;
  const progress = currentPoints - currentLevelInfo.min;
  const percent = Math.min(100, Math.max(0, (progress / range) * 100));
  
  return { percent, remaining: nextMin - currentPoints, nextLevelName: nextName };
};

export const triggerConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#4CAF50', '#FFD700', '#FF5722']
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#4CAF50', '#FFD700', '#FF5722']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

export const toExcel = (students: Student[]) => {
  const data = students.map(s => ({
    'STT': s.order || '',
    'ID': s.id,
    'Họ và Tên': s.name,
    'Ngày Sinh': s.dob || '',
    'Lớp': s.className || '',
    'Điểm Hiện Tại': s.totalPoints,
    'Cấp Độ': LEVELS[s.level].name,
    'Tổng Điểm Cộng': s.pointHistory.filter(h => h.change > 0).reduce((acc, curr) => acc + curr.change, 0),
    'Tổng Điểm Trừ': Math.abs(s.pointHistory.filter(h => h.change < 0).reduce((acc, curr) => acc + curr.change, 0)),
    'Số Quà Đã Đổi': s.rewardsRedeemed.length
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachHocSinh");
  XLSX.writeFile(workbook, `LopHocTichCuc_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Hàm trích xuất thông tin học sinh từ văn bản thô
// Hỗ trợ cả định dạng dòng đơn và bảng (multiline)
const extractStudentsFromText = (text: string): Partial<Student>[] => {
  const students: Partial<Student>[] = [];
  
  // Chuẩn hóa text: xóa ký tự lạ, chuyển dòng Windows về Unix
  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Regex mạnh mẽ hơn:
  // 1. (\d+) -> STT (Group 1)
  // 2. \s+ -> Khoảng trắng/dòng mới
  // 3. ([^\d]+?) -> Tên (Group 2) - Lấy non-greedy đến khi gặp số của ngày sinh
  // 4. \s+ -> Khoảng trắng/dòng mới
  // 5. Ngày sinh (Group 3): Hỗ trợ DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
  // 6. \s* -> Khoảng trắng tùy chọn
  // 7. (.*?) -> Lớp (Group 4) - Lấy đến hết dòng hoặc đến khi gặp số STT tiếp theo
  // Sử dụng flag 'g' để tìm tất cả, 'm' để xử lý dòng
  
  // Regex tìm kiếm mẫu: STT ... Tên ... Ngày Sinh ... Lớp
  // Lưu ý: [^\d] bao gồm cả xuống dòng (\n), giúp xử lý bảng DOCX bị tách dòng.
  const regex = /(\d+)\s+([^\d]+?)\s+((?:\d{1,2}[./-]\d{1,2}[./-]\d{4})|(?:\d{4}[./-]\d{1,2}[./-]\d{1,2}))\s*([^\n]*)/g;

  let match;
  // Dùng loop exec để tìm tất cả các kết quả khớp
  while ((match = regex.exec(cleanText)) !== null) {
    // Check rác: Nếu tên quá ngắn hoặc toàn ký tự đặc biệt thì bỏ qua
    const name = match[2].trim().replace(/[\n\t]/g, ' ');
    if (name.length < 2) continue;

    students.push({
      order: parseInt(match[1]),
      name: name,
      dob: match[3].trim(),
      className: match[4]?.trim() || undefined,
      totalPoints: 0
    });
  }

  // Fallback: Nếu không tìm thấy bằng regex phức tạp, thử regex đơn giản theo dòng (chấp nhận thiếu ngày sinh nếu cần thiết - tuỳ requirement)
  // Nhưng requirement yêu cầu có ngày sinh, nên ta giữ nguyên logic chặt chẽ.
  
  return students;
};

// Đọc file DOCX
const readDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

// Đọc file PDF
const readPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  // Sử dụng biến pdfjs đã được xử lý default export ở trên
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // PDF text items thường rời rạc. Để an toàn, ta nối chúng bằng khoảng trắng.
    // Tuy nhiên, để regex multiline hoạt động tốt với bảng, ta có thể thử nối thông minh hơn.
    // Nhưng đơn giản nhất là nối space, regex sẽ xử lý pattern "Số Tên Ngày" nằm trên cùng 1 dòng logic.
    const pageText = textContent.items.map((item: any) => item.str).join(' '); 
    fullText += pageText + '\n';
  }
  
  return fullText; 
};

// Hàm chính xử lý import file
export const parseDocument = async (file: File): Promise<Partial<Student>[]> => {
  let text = '';
  const fileType = file.name.split('.').pop()?.toLowerCase();

  try {
    if (fileType === 'docx') {
      text = await readDocx(file);
    } else if (fileType === 'pdf') {
      text = await readPdf(file);
      // Clean up PDF text: Đôi khi PDF nối dính STT và Tên "1NguyenVanA"
      // Thêm space sau số nếu theo sau là chữ
      text = text.replace(/(\d+)([A-Za-zÀ-ỹ])/g, '$1 $2');
    } else {
      throw new Error('Định dạng file không hỗ trợ. Vui lòng dùng .docx hoặc .pdf');
    }

    const students = extractStudentsFromText(text);
    
    if (students.length === 0) {
        // Log text để debug nếu cần (trong console dev)
        console.log("Extracted Text Preview:", text.substring(0, 500));
        throw new Error('Không tìm thấy dữ liệu phù hợp.\nĐịnh dạng mẫu: STT  Họ tên  dd/mm/yyyy  Lớp');
    }

    return students;
  } catch (error: any) {
    console.error("Parse Error:", error);
    throw error;
  }
};

export const getAvatarUrl = (name: string, url: string | null) => {
    if (url) return url;
    const initials = name.split(' ').pop()?.substring(0, 1).toUpperCase() || 'A';
    return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
}