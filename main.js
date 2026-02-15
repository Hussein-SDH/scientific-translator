// ==================== Medical Translator App ====================
// By: Nurse Hussein Sabah Dhiool
// Version: 2.0 - Fixed Translation Engine

// ==================== Global Variables ====================
let currentTranslation = '';
let originalText = '';
let viewMode = 'line-by-line';
let translationHistory = JSON.parse(localStorage.getItem('translationHistory')) || [];
let appStats = JSON.parse(localStorage.getItem('appStats')) || {
    totalWords: 0,
    totalFiles: 0,
    totalTime: 0,
    todayTranslations: 0,
    lastDate: new Date().toDateString()
};
let uploadedFiles = [];
let startTime = Date.now();

// ==================== Medical Dictionary ====================
const medicalDictionary = {
    diseases: {
        'diabetes': 'السكري',
        'hypertension': 'ارتفاع ضغط الدم',
        'cancer': 'السرطان',
        'heart disease': 'أمراض القلب',
        'asthma': 'الربو',
        'arthritis': 'التهاب المفاصل',
        'pneumonia': 'الالتهاب الرئوي',
        'hepatitis': 'التهاب الكبد',
        'tuberculosis': 'السل',
        'malaria': 'الملاريا',
        'influenza': 'الإنفلونزا',
        'covid-19': 'كوفيد-19',
        'stroke': 'جلطة دماغية',
        'heart attack': 'نوبة قلبية',
        'kidney failure': 'فشل كلوي',
        'liver cirrhosis': 'تشمع الكبد'
    },
    symptoms: {
        'fever': 'حمى',
        'headache': 'صداع',
        'cough': 'سعال',
        'pain': 'ألم',
        'nausea': 'غثيان',
        'vomiting': 'تقيؤ',
        'fatigue': 'تعب',
        'dizziness': 'دوار',
        'shortness of breath': 'ضيق التنفس',
        'chest pain': 'ألم صدر',
        'abdominal pain': 'ألم بطني',
        'back pain': 'ألم ظهر',
        'joint pain': 'ألم مفاصل',
        'rash': 'طفح جلدي',
        'swelling': 'تورم'
    },
    medications: {
        'aspirin': 'أسبرين',
        'paracetamol': 'باراسيتامول',
        'acetaminophen': 'أسيتامينوفين',
        'ibuprofen': 'إيبوبروفين',
        'antibiotic': 'مضاد حيوي',
        'insulin': 'أنسولين',
        'vaccine': 'لقاح',
        'vitamin': 'فيتامين',
        'antihistamine': 'مضاد الهيستامين',
        'corticosteroid': 'كورتيكوستيرويد',
        'antidepressant': 'مضاد اكتئاب',
        'painkiller': 'مسكن ألم'
    },
    anatomy: {
        'heart': 'قلب',
        'brain': 'دماغ',
        'liver': 'كبد',
        'kidney': 'كلية',
        'lung': 'رئة',
        'stomach': 'معدة',
        'intestine': 'أمعاء',
        'bone': 'عظم',
        'muscle': 'عضلة',
        'blood': 'دم',
        'vein': 'وريد',
        'artery': 'شريان',
        'nerve': 'عصب',
        'spine': 'عمود فقري',
        'skull': 'جمجمة'
    },
    procedures: {
        'surgery': 'جراحة',
        'examination': 'فحص',
        'test': 'اختبار',
        'scan': 'مسح',
        'x-ray': 'أشعة سينية',
        'blood test': 'تحليل دم',
        'biopsy': 'خزعة',
        'vaccination': 'تطعيم',
        'transplant': 'زراعة',
        'dialysis': 'غسيل كلوي',
        'chemotherapy': 'علاج كيميائي',
        'radiation': 'علاج إشعاعي'
    }
};

// ==================== Translation Engine ====================
async function translateContent() {
    const inputText = document.getElementById('inputText').value.trim();
    const sourceLang = document.getElementById('sourceLang').value;
    const targetLang = document.getElementById('targetLang').value;
    
    if (!inputText && uploadedFiles.length === 0) {
        showNotification('الرجاء إدخال نص أو رفع ملف', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        let allText = inputText;
        
        // Add text from uploaded files
        for (let file of uploadedFiles) {
            if (file.content) {
                allText += '\n\n' + file.content;
            }
        }
        
        originalText = allText;
        
        // Perform translation
        const translatedText = await performTranslation(allText, sourceLang, targetLang);
        currentTranslation = translatedText;
        
        // Display translation
        displayTranslation(originalText, translatedText);
        
        // Update stats
        const wordCount = allText.split(/\s+/).length;
        appStats.totalWords += wordCount;
        appStats.todayTranslations++;
        updateStats();
        
        // Add to history
        addToHistory(allText, translatedText);
        
        showNotification('تمت الترجمة بنجاح!', 'success');
        
    } catch (error) {
        console.error('Translation error:', error);
        showNotification('حدث خطأ في الترجمة', 'error');
    } finally {
        showLoading(false);
    }
}

async function performTranslation(text, sourceLang, targetLang) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let translatedText = text;
    
    // Apply medical dictionary translations
    Object.values(medicalDictionary).forEach(category => {
        Object.entries(category).forEach(([english, arabic]) => {
            const regex = new RegExp(`\\b${english}\\b`, 'gi');
            translatedText = translatedText.replace(regex, arabic);
        });
    });
    
    // Add common translations
    const commonTranslations = {
        'patient': 'المريض',
        'doctor': 'الطبيب',
        'nurse': 'الممرض',
        'hospital': 'المستشفى',
        'clinic': 'العيادة',
        'pharmacy': 'الصيدلية',
        'emergency': 'الطوارئ',
        'icu': 'العناية المركزة',
        'operation room': 'غرفة العمليات',
        'medical record': 'السجل الطبي',
        'prescription': 'الوصفة الطبية',
        'dosage': 'الجرعة',
        'side effects': 'الآثار الجانبية',
        'allergy': 'حساسية',
        'chronic': 'مزمن',
        'acute': 'حاد',
        'benign': 'حميد',
        'malignant': 'خبيث'
    };
    
    Object.entries(commonTranslations).forEach(([en, ar]) => {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translatedText = translatedText.replace(regex, ar);
    });
    
    // If target is Arabic, add Arabic context
    if (targetLang === 'ar') {
        translatedText = `[الترجمة العربية]\n\n${translatedText}`;
    }
    
    return translatedText;
}

// ==================== Display Functions ====================
function displayTranslation(original, translated) {
    const outputDiv = document.getElementById('translationOutput');
    
    switch(viewMode) {
        case 'line-by-line':
            outputDiv.innerHTML = displayLineByLine(original, translated);
            break;
        case 'paragraph':
            outputDiv.innerHTML = displayParagraph(translated);
            break;
        case 'word-by-word':
            outputDiv.innerHTML = displayWordByWord(original, translated);
            break;
    }
}

function displayLineByLine(original, translated) {
    const originalLines = original.split(/[.!?]+/).filter(line => line.trim());
    const translatedLines = translated.split(/[.!?]+/).filter(line => line.trim());
    
    let html = '<div class="space-y-3">';
    
    for (let i = 0; i < Math.max(originalLines.length, translatedLines.length); i++) {
        const orig = originalLines[i] || '';
        const trans = translatedLines[i] || '';
        
        if (orig.trim() || trans.trim()) {
            html += `
                <div class="translation-line rounded-lg p-3 fade-in">
                    <div class="mb-2 pb-2 border-b border-slate-700">
                        <span class="text-slate-400 text-xs">النص الأصلي:</span>
                        <p class="text-slate-300 mt-1">${orig.trim()}</p>
                    </div>
                    <div>
                        <span class="text-sky-400 text-xs">الترجمة العربية:</span>
                        <p class="text-white font-medium mt-1">${trans.trim()}</p>
                    </div>
                </div>
            `;
        }
    }
    
    html += '</div>';
    return html;
}

function displayParagraph(translated) {
    return `
        <div class="fade-in">
            <div class="bg-slate-800/50 rounded-lg p-4">
                <p class="text-white leading-relaxed whitespace-pre-wrap">${translated}</p>
            </div>
        </div>
    `;
}

function displayWordByWord(original, translated) {
    const origWords = original.split(/\s+/).filter(w => w.trim());
    const transWords = translated.split(/\s+/).filter(w => w.trim());
    
    let html = '<div class="grid grid-cols-2 gap-2 fade-in">';
    
    for (let i = 0; i < Math.max(origWords.length, transWords.length); i++) {
        const orig = origWords[i] || '';
        const trans = transWords[i] || '';
        
        if (orig || trans) {
            html += `
                <div class="bg-slate-800/50 rounded p-2">
                    <span class="text-slate-400 text-xs block mb-1">${orig}</span>
                    <span class="text-white font-medium">${trans}</span>
                </div>
            `;
        }
    }
    
    html += '</div>';
    return html;
}

function setViewMode(mode) {
    viewMode = mode;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${mode === 'line-by-line' ? 'line' : mode === 'paragraph' ? 'para' : 'word'}`).classList.add('active');
    
    // Redisplay if there's content
    if (currentTranslation) {
        displayTranslation(originalText, currentTranslation);
    }
}

// ==================== File Handling ====================
const dropZone = document.getElementById('dropZone');

if (dropZone) {
    dropZone.addEventListener('click', () => document.getElementById('fileInput').click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}

async function handleFiles(files) {
    const fileList = document.getElementById('fileList');
    
    for (let file of files) {
        appStats.totalFiles++;
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item rounded-lg p-3 flex items-center justify-between';
        fileItem.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-file-medical text-sky-400"></i>
                <div>
                    <p class="text-white text-sm">${file.name}</p>
                    <p class="text-slate-400 text-xs">${formatFileSize(file.size)}</p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="status-icon processing-spinner w-5 h-5 border-2 border-sky-500/30 border-t-sky-500 rounded-full"></span>
                <button onclick="this.closest('.file-item').remove(); removeFile('${file.name}')" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        fileList.appendChild(fileItem);
        
        // Process file
        try {
            const content = await readFile(file);
            uploadedFiles.push({
                name: file.name,
                content: content,
                type: file.type
            });
            
            // Update status
            const statusIcon = fileItem.querySelector('.status-icon');
            statusIcon.className = 'text-green-400';
            statusIcon.innerHTML = '<i class="fas fa-check"></i>';
            
            showNotification(`تم رفع الملف: ${file.name}`, 'success');
            
        } catch (error) {
            console.error('File read error:', error);
            const statusIcon = fileItem.querySelector('.status-icon');
            statusIcon.className = 'text-red-400';
            statusIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            showNotification(`خطأ في قراءة الملف: ${file.name}`, 'error');
        }
    }
    
    updateStats();
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        
        if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            // For other files, return a placeholder
            resolve(`[محتوى الملف: ${file.name}]`);
        }
    });
}

function removeFile(fileName) {
    uploadedFiles = uploadedFiles.filter(f => f.name !== fileName);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ==================== Export Functions ====================
function toggleExportMenu() {
    document.getElementById('exportMenu').classList.toggle('hidden');
}

function exportAs(format) {
    if (!currentTranslation) {
        showNotification('لا يوجد نص للتصدير', 'warning');
        return;
    }
    
    const timestamp = new Date().getTime();
    
    switch(format) {
        case 'txt':
            downloadFile(currentTranslation, `ترجمة_${timestamp}.txt`, 'text/plain');
            break;
        case 'pdf':
            exportToPDF(currentTranslation, timestamp);
            break;
        case 'docx':
            exportToWord(currentTranslation, timestamp);
            break;
        case 'xlsx':
            exportToExcel(currentTranslation, timestamp);
            break;
    }
    
    toggleExportMenu();
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('تم التحميل بنجاح', 'success');
}

function exportToPDF(text, timestamp) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add Arabic font support (simplified)
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Medical Translation', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, 40);
    
    doc.save(`ترجمة_${timestamp}.pdf`);
    showNotification('تم تصدير PDF', 'success');
}

function exportToWord(text, timestamp) {
    const html = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Translation</title></head>
        <body><p>${text.replace(/\n/g, '<br>')}</p></body>
        </html>
    `;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ترجمة_${timestamp}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('تم تصدير Word', 'success');
}

function exportToExcel(text, timestamp) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([['الترجمة الطبية'], [text]]);
    XLSX.utils.book_append_sheet(wb, ws, 'Translation');
    XLSX.writeFile(wb, `ترجمة_${timestamp}.xlsx`);
    showNotification('تم تصدير Excel', 'success');
}

// ==================== Voice Synthesis ====================
function speakTranslation() {
    if (!currentTranslation) {
        showNotification('لا يوجد نص للنطق', 'warning');
        return;
    }
    
    if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentTranslation);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        const speakBtn = document.getElementById('speakBtn');
        speakBtn.classList.add('playing');
        
        utterance.onend = () => {
            speakBtn.classList.remove('playing');
        };
        
        window.speechSynthesis.speak(utterance);
    } else {
        showNotification('المتصفح لا يدعم النطق', 'error');
    }
}

// ==================== History Functions ====================
function addToHistory(original, translated) {
    const historyItem = {
        id: Date.now(),
        original: original.substring(0, 200) + (original.length > 200 ? '...' : ''),
        translated: translated.substring(0, 200) + (translated.length > 200 ? '...' : ''),
        fullOriginal: original,
        fullTranslated: translated,
        date: new Date().toLocaleString('ar-SA'),
        timestamp: Date.now()
    };
    
    translationHistory.unshift(historyItem);
    if (translationHistory.length > 50) {
        translationHistory.pop();
    }
    
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
}

function loadHistory() {
    const historyList = document.getElementById('historyList');
    
    if (translationHistory.length === 0) {
        historyList.innerHTML = '<p class="text-slate-400 text-center py-8">لا توجد ترجمات سابقة</p>';
        return;
    }
    
    historyList.innerHTML = translationHistory.map(item => `
        <div class="bg-slate-800/50 rounded-lg p-4 cursor-pointer hover:bg-slate-700/50 transition-colors" onclick="loadHistoryItem(${item.id})">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-400 text-xs">${item.date}</span>
                <button onclick="event.stopPropagation(); deleteHistoryItem(${item.id})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
            <p class="text-slate-300 text-sm mb-1">${item.original}</p>
            <p class="text-sky-400 text-sm">${item.translated}</p>
        </div>
    `).join('');
}

function loadHistoryItem(id) {
    const item = translationHistory.find(h => h.id === id);
    if (item) {
        document.getElementById('inputText').value = item.fullOriginal;
        currentTranslation = item.fullTranslated;
        originalText = item.fullOriginal;
        displayTranslation(originalText, currentTranslation);
        hideModal('historyModal');
        showNotification('تم تحميل الترجمة', 'success');
    }
}

function deleteHistoryItem(id) {
    translationHistory = translationHistory.filter(h => h.id !== id);
    localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
    loadHistory();
    showNotification('تم الحذف', 'success');
}

function clearHistory() {
    if (confirm('هل أنت متأكد من مسح السجل؟')) {
        translationHistory = [];
        localStorage.setItem('translationHistory', JSON.stringify(translationHistory));
        loadHistory();
        showNotification('تم مسح السجل', 'success');
    }
}

function saveToHistory() {
    if (!currentTranslation) {
        showNotification('لا يوجد نص للحفظ', 'warning');
        return;
    }
    
    // Already saved automatically, just notify
    showNotification('تم الحفظ في السجل', 'success');
}

// ==================== Dictionary Functions ====================
function renderDictionary(searchTerm = '') {
    const container = document.getElementById('dictionaryContent');
    let html = '';
    
    const categoryNames = {
        diseases: 'الأمراض',
        symptoms: 'الأعراض',
        medications: 'الأدوية',
        anatomy: 'التشريح',
        procedures: 'الإجراءات'
    };
    
    Object.entries(medicalDictionary).forEach(([category, terms]) => {
        const filtered = Object.entries(terms).filter(([en, ar]) => 
            en.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ar.includes(searchTerm)
        );
        
        if (filtered.length > 0) {
            html += `
                <div class="bg-slate-800/50 rounded-xl p-4">
                    <h3 class="text-sky-400 font-bold mb-3">${categoryNames[category]}</h3>
                    <div class="space-y-2">
                        ${filtered.map(([en, ar]) => `
                            <div class="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                                <span class="text-slate-300 text-sm">${en}</span>
                                <span class="text-white font-medium">${ar}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = html || '<p class="text-slate-400 text-center col-span-full">لا توجد نتائج</p>';
}

function searchDictionary(term) {
    renderDictionary(term);
}

// ==================== Stats Functions ====================
function updateStats() {
    // Reset daily count if new day
    const today = new Date().toDateString();
    if (appStats.lastDate !== today) {
        appStats.todayTranslations = 0;
        appStats.lastDate = today;
    }
    
    // Update time
    const elapsedMinutes = Math.floor((Date.now() - startTime) / 60000);
    appStats.totalTime = elapsedMinutes;
    
    localStorage.setItem('appStats', JSON.stringify(appStats));
    
    // Update UI
    document.getElementById('statWords').textContent = appStats.totalWords.toLocaleString();
    document.getElementById('statFiles').textContent = appStats.totalFiles;
    document.getElementById('statTime').textContent = appStats.totalTime;
    document.getElementById('statToday').textContent = appStats.todayTranslations;
}

// ==================== Utility Functions ====================
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    if (modalId === 'historyModal') {
        loadHistory();
    } else if (modalId === 'dictionaryModal') {
        renderDictionary();
    } else if (modalId === 'statsModal') {
        updateStats();
    }
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function updateWordCount() {
    const text = document.getElementById('inputText').value;
    const count = text.trim() ? text.trim().split(/\s+/).length : 0;
    document.getElementById('wordCount').textContent = `${count} كلمة`;
}

function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('wordCount').textContent = '0 كلمة';
    uploadedFiles = [];
    document.getElementById('fileList').innerHTML = '';
}

function copyTranslation() {
    if (!currentTranslation) {
        showNotification('لا يوجد نص للنسخ', 'warning');
        return;
    }
    
    navigator.clipboard.writeText(currentTranslation).then(() => {
        showNotification('تم النسخ', 'success');
    }).catch(() => {
        showNotification('فشل النسخ', 'error');
    });
}

// Close modals on outside click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                translateContent();
                break;
            case 'c':
                if (e.shiftKey) {
                    e.preventDefault();
                    copyTranslation();
                }
                break;
        }
    }
});

// Initialize
updateStats();
-2">
                        <span class="text-slate-400 text-xs">${item.date}</span>
                        <button onclick="event.stopPropagation(); app.deleteHistoryItem(${item.id})" class="text-red-400 hover:text-red-300">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                    <p class="text-white text-sm mb-1">${item.original}</p>
                    <p class="text-sky-400 text-sm">${item.translated}</p>
                </div>
            `).join('');
        }
        
        this.historyModal.classList.remove('hidden');
        this.historyModal.classList.add('flex');
    }

    loadHistoryItem(id) {
        const item = this.translationHistory.find(h => h.id === id);
        if (item) {
            this.sourceText.value = item.fullOriginal;
            this.currentTranslation = item.fullTranslated;
            this.displayAllTranslations();
            this.historyModal.classList.add('hidden');
            this.showNotification('تم تحميل الترجمة من السجل', 'success');
        }
    }

    deleteHistoryItem(id) {
        this.translationHistory = this.translationHistory.filter(h => h.id !== id);
        localStorage.setItem('translationHistory', JSON.stringify(this.translationHistory));
        this.showHistory();
        this.showNotification('تم حذف العنصر', 'success');
    }

    clearHistory() {
        if (confirm('هل أنت متأكد من مسح السجل بالكامل؟')) {
            this.translationHistory = [];
            localStorage.setItem('translationHistory', JSON.stringify(this.translationHistory));
            this.showHistory();
            this.showNotification('تم مسح السجل', 'success');
        }
    }

    // Favorites Management
    saveToFavorites() {
        const text = this.translationOutput.innerText;
        if (!text || text.includes('ستظهر الترجمة العلمية هنا')) {
            this.showNotification('لا يوجد نص للحفظ', 'warning');
            return;
        }
        
        const favoriteItem = {
            id: Date.now(),
            original: this.sourceText.value,
            translated: text,
            date: new Date().toLocaleString('ar-SA')
        };
        
        this.favorites.unshift(favoriteItem);
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
        this.showNotification('تم الحفظ في المفضلة', 'success');
    }

    // Dictionary
    showDictionary() {
        this.renderDictionary();
        this.dictionaryModal.classList.remove('hidden');
        this.dictionaryModal.classList.add('flex');
    }

    renderDictionary(searchTerm = '') {
        const grid = document.getElementById('dictionaryGrid');
        let html = '';
        
        Object.entries(this.medicalDictionary).forEach(([category, terms]) => {
            const categoryNames = {
                'diseases': 'الأمراض',
                'symptoms': 'الأعراض',
                'medications': 'الأدوية',
                'anatomy': 'التشريح',
                'procedures': 'الإجراءات'
            };
            
            const filteredTerms = Object.entries(terms).filter(([en, ar]) => 
                en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ar.includes(searchTerm)
            );
            
            if (filteredTerms.length > 0) {
                html += `
                    <div class="dictionary-card rounded-xl p-4">
                        <h3 class="text-sky-400 font-semibold mb-3 flex items-center">
                            <i class="fas fa-book-medical mr-2"></i>
                            ${categoryNames[category]}
                        </h3>
                        <div class="space-y-2">
                            ${filteredTerms.map(([en, ar]) => `
                                <div class="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                                    <span class="text-white text-sm">${en}</span>
                                    <span class="text-sky-400 text-sm font-semibold">${ar}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        grid.innerHTML = html || '<p class="text-slate-400 text-center col-span-3">لا توجد نتائج</p>';
    }

    searchDictionary(term) {
        this.renderDictionary(term);
    }

    // Night Mode
    toggleNightMode() {
        document.body.classList.toggle('night-mode');
        const isNightMode = document.body.classList.contains('night-mode');
        document.getElementById('nightModeBtn').innerHTML = isNightMode ? 
            '<i class="fas fa-sun text-yellow-400"></i>' : 
            '<i class="fas fa-moon text-white"></i>';
        this.showNotification(isNightMode ? 'تم تفعيل الوضع الليلي' : 'تم إلغاء الوضع الليلي', 'info');
    }

    // Search in Translation
    searchInTranslation(query) {
        if (!query) {
            // Remove highlights
            this.displayAllTranslations();
            return;
        }
        
        const output = this.translationOutput;
        const text = output.innerHTML;
        const regex = new RegExp(`(${query})`, 'gi');
        const highlighted = text.replace(regex, '<mark class="bg-yellow-500 text-black px-1 rounded">$1</mark>');
        output.innerHTML = highlighted;
    }

    // Undo
    undo() {
        if (this.undoStack.length > 0) {
            const lastState = this.undoStack.pop();
            this.sourceText.value = lastState.text;
            this.translationOutput.innerHTML = lastState.output;
            this.showNotification('تم التراجع', 'success');
        } else {
            this.showNotification('لا يوجد شيء للتراجع عنه', 'warning');
        }
    }

    // Word Count
    updateWordCount() {
        const text = this.sourceText.value;
        const count = text.trim() ? text.trim().split(/\s+/).length : 0;
        this.wordCount.textContent = `${count} كلمة`;
    }

    // Display Functions
    displayAllTranslations() {
        const mode = this.displayModeSelect.value;
        let html = '';

        if (this.sourceText.value.trim() && this.currentTranslation) {
            html += this.generateTranslationHTML(this.sourceText.value, this.currentTranslation, 'النص الرئيسي', mode);
        }

        if (this.originalTexts.length > 0 && this.translatedTexts.length > 0) {
            this.originalTexts.forEach((file, index) => {
                if (this.translatedTexts[index]) {
                    html += this.generateTranslationHTML(file.content, this.translatedTexts[index], file.name, mode);
                }
            });
        }

        this.translationOutput.innerHTML = html || `
            <div class="text-slate-400 text-center mt-20">
                <i class="fas fa-microscope text-4xl mb-3"></i>
                <p>ستظهر الترجمة العلمية هنا</p>
            </div>
        `;

        this.addTranslationAnimations();
        
        // Add to history
        if (this.sourceText.value.trim() && this.currentTranslation) {
            this.addToHistory(this.sourceText.value, this.currentTranslation);
        }
    }

    generateTranslationHTML(original, translated, title, mode) {
        let html = `<div class="mb-6 p-4 border border-slate-600 rounded-lg">
            <h4 class="text-sky-400 text-lg font-semibold mb-3 flex items-center">
                <i class="fas fa-file-medical mr-2"></i>
                ${title}
            </h4>`;

        switch (mode) {
            case 'side-by-side':
                html += this.generateSideBySideView(original, translated);
                break;
            case 'paragraph':
                html += this.generateParagraphView(translated);
                break;
            case 'words':
                html += this.generateWordByWordView(original, translated);
                break;
        }

        html += '</div>';
        return html;
    }

    generateSideBySideView(original, translated) {
        const originalLines = original.split(/[.!?]+/).filter(line => line.trim());
        const translatedLines = translated.split(/[.!?]+/).filter(line => line.trim());
        
        let html = '<div class="space-y-3">';
        
        for (let i = 0; i < Math.max(originalLines.length, translatedLines.length); i++) {
            const originalLine = originalLines[i] || '';
            const translatedLine = translatedLines[i] || '';
            
            if (originalLine || translatedLine) {
                html += `
                    <div class="translation-line-scientific p-3 rounded-lg">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p class="text-slate-400 text-sm mb-1 flex items-center">
                                    <i class="fas fa-globe mr-1"></i>
                                    النص الأصلي:
                                </p>
                                <p class="text-white text-base">${originalLine.trim()}</p>
                            </div>
                            <div>
                                <p class="text-slate-400 text-sm mb-1 flex items-center">
                                    <i class="fas fa-language mr-1"></i>
                                    الترجمة العربية:
                                </p>
                                <p class="text-white text-base font-semibold text-right">${translatedLine.trim()}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }

    generateParagraphView(translated) {
        return `
            <div class="p-4 bg-slate-800/50 rounded-lg">
                <h5 class="text-sky-400 text-sm font-semibold mb-2 flex items-center">
                    <i class="fas fa-paragraph mr-1"></i>
                    الترجمة الكاملة:
                </h5>
                <p class="text-white text-base leading-relaxed text-right">${translated}</p>
            </div>
        `;
    }

    generateWordByWordView(original, translated) {
        const originalWords = original.split(/\s+/);
        const translatedWords = translated.split(/\s+/);
        
        let html = '<div class="grid grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg">';
        
        for (let i = 0; i < Math.max(originalWords.length, translatedWords.length); i++) {
            const originalWord = originalWords[i] || '';
            const translatedWord = translatedWords[i] || '';
            
            if (originalWord || translatedWord) {
                html += `
                    <div class="flex items-center justify-between p-2 bg-slate-700/50 rounded border border-slate-600">
                        <span class="text-slate-300 text-sm">${originalWord}</span>
                        <span class="text-white text-sm font-semibold">${translatedWord}</span>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        return html;
    }

    addTranslationAnimations() {
        const lines = this.translationOutput.querySelectorAll('.translation-line-scientific');
        lines.forEach((line, index) => {
            line.style.opacity = '0';
            line.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                line.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                line.style.opacity = '1';
                line.style.transform = 'translateX(0)';
            }, index * 200);
        });
    }

    // Utility Functions
    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
            this.loadingOverlay.classList.add('flex');
        } else {
            this.loadingOverlay.classList.add('hidden');
            this.loadingOverlay.classList.remove('flex');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-24 right-6 z-50 px-6 py-4 rounded-xl text-white font-semibold transform translate-x-full transition-transform duration-300`;
        
        const colors = {
            success: 'bg-green-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
            info: 'bg-sky-600'
        };
        
        notification.classList.add(colors[type] || colors.info);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }

    // File handling methods
    handleDragOver(e) {
        e.preventDefault();
        this.uploadZone.classList.add('dragover');
    }

    handleDragLeave() {
        this.uploadZone.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadZone.classList.remove('dragover');
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        this.showFilePreview(files);
        this.showLoading(true);
        
        for (let i = 0; i < files.length; i++) {
            await this.processFile(files[i], i);
        }
        
        this.stats.totalFiles += files.length;
        this.updateStats();
        this.showLoading(false);
        this.showNotification('تم معالجة جميع الملفات', 'success');
    }

    showFilePreview(files) {
        this.filePreview.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item-scientific rounded-lg p-3 flex items-center justify-between';
            
            const fileIcon = this.getFileIcon(file.type);
            const fileSize = this.formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <i class="${fileIcon} text-white"></i>
                    </div>
                    <div>
                        <p class="text-white text-sm font-medium">${file.name}</p>
                        <p class="text-slate-400 text-xs">${fileSize}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <div id="status-${index}" class="processing-spinner w-5 h-5 border-2 border-sky-500/30 border-t-sky-500 rounded-full"></div>
                    <button onclick="this.parentElement.parentElement.remove()" class="text-slate-400 hover:text-white transition-colors">
                        <i class="fas fa-times text-sm"></i>
                    </button>
                </div>
            `;
            
            this.filePreview.appendChild(fileItem);
        });
        
        this.filePreview.classList.remove('hidden');
    }

    updateFileStatus(index, status) {
        const statusElement = document.getElementById(`status-${index}`);
        if (!statusElement) return;
        
        switch (status) {
            case 'processing':
                statusElement.className = 'processing-spinner w-5 h-5 border-2 border-sky-500/30 border-t-sky-500 rounded-full';
                break;
            case 'completed':
                statusElement.className = 'w-5 h-5 text-green-500';
                statusElement.innerHTML = '<i class="fas fa-check"></i>';
                break;
            case 'error':
                statusElement.className = 'w-5 h-5 text-red-500';
                statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                break;
        }
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fas fa-x-ray';
        if (fileType === 'application/pdf') return 'fas fa-file-medical';
        if (fileType === 'text/plain') return 'fas fa-file-alt';
        if (fileType.includes('word') || fileType === 'application/msword') return 'fas fa-file-prescription';
        return 'fas fa-file-medical-alt';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async translateAllContent() {
        this.showLoading(true);
        
        try {
            if (this.sourceText.value.trim()) {
                await this.translateText(this.sourceText.value, false);
            }
            
            if (this.originalTexts.length > 0) {
                for (let i = 0; i < this.originalTexts.length; i++) {
                    await this.translateText(this.originalTexts[i].content, true);
                }
            }
            
            this.displayAllTranslations();
            this.showNotification('تمت الترجمة العلمية بنجاح', 'success');
        } catch (error) {
            console.error('Translation error:', error);
            this.showNotification('حدث خطأ أثناء الترجمة العلمية', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    updateDisplayMode() {
        this.displayMode = this.displayModeSelect.value;
        if (this.originalTexts.length > 0 || this.sourceText.value.trim()) {
            this.displayAllTranslations();
        }
    }

    clearAll() {
        this.sourceText.value = '';
        this.translationOutput.innerHTML = `
            <div class="text-slate-400 text-center mt-20">
                <i class="fas fa-microscope text-4xl mb-3"></i>
                <p>ستظهر الترجمة العلمية هنا</p>
            </div>
        `;
        this.filePreview.innerHTML = '';
        this.filePreview.classList.add('hidden');
        this.originalTexts = [];
        this.translatedTexts = [];
        this.currentTranslation = '';
        this.updateWordCount();
        this.showNotification('تم مسح جميع البيانات', 'info');
    }

    async copyToClipboard() {
        const text = this.translationOutput.innerText;
        if (!text || text.includes('ستظهر الترجمة العلمية هنا')) {
            this.showNotification('لا يوجد نص للنسخ', 'warning');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('تم نسخ الترجمة العلمية', 'success');
        } catch (error) {
            console.error('Copy error:', error);
            this.showNotification('فشل نسخ النص', 'error');
        }
    }
}

// Initialize app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ScientificTranslationApp();
});

// Export function for HTML onclick
function exportTranslation(format) {
    if (app) {
        app.exportTranslation(format);
    }
}