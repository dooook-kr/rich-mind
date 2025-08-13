// 로컬 스토리지 관리 스크립트

const STORAGE_KEY = 'richMindsetResults';
const MAX_RESULTS = 10; // 최대 10개의 결과만 저장

// 결과 저장
function saveResults(resultData) {
    try {
        const existingResults = getStoredResults();
        
        // 새 결과를 맨 앞에 추가
        existingResults.unshift(resultData);
        
        // 최대 개수 제한
        if (existingResults.length > MAX_RESULTS) {
            existingResults.splice(MAX_RESULTS);
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingResults));
        
        console.log('결과가 저장되었습니다.');
    } catch (error) {
        console.error('결과 저장 실패:', error);
    }
}

// 저장된 결과 가져오기
function getStoredResults() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('저장된 결과 로드 실패:', error);
        return [];
    }
}

// 최근 결과 가져오기
function getLatestResult() {
    const results = getStoredResults();
    return results.length > 0 ? results[0] : null;
}

// 이전 결과 로드 (페이지 로드 시) - 비활성화됨
function loadPreviousResults() {
    // 이전 결과 표시 기능 완전히 제거
    return;
}

// 이전 결과 옵션 표시
function showPreviousResultOption(result) {
    // 마지막 테스트로부터 24시간이 지났는지 확인
    const lastTestTime = new Date(result.timestamp);
    const now = new Date();
    const hoursDiff = (now - lastTestTime) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
        createPreviousResultBanner(result, hoursDiff);
    }
}

// 이전 결과 배너 생성
function createPreviousResultBanner(result, hoursDiff) {
    const banner = document.createElement('div');
    banner.className = 'previous-result-banner';
    
    const timeAgo = hoursDiff < 1 ? 
        `${Math.round(hoursDiff * 60)}분 전` : 
        `${Math.round(hoursDiff)}시간 전`;
    
    banner.innerHTML = `
        <div class="banner-content">
            <div class="banner-icon">📊</div>
            <div class="banner-text">
                <div class="banner-title">${timeAgo}에 테스트한 결과가 있어요</div>
                <div class="banner-subtitle">총 ${result.scores.total}/15점 (${result.scores.percentage}%)</div>
            </div>
            <div class="banner-actions">
                <button class="banner-btn view-btn" onclick="showPreviousResult()">결과 보기</button>
                <button class="banner-btn close-btn" onclick="closePreviousResultBanner()">&times;</button>
            </div>
        </div>
    `;
    
    // 헤더 아래에 삽입
    const header = document.querySelector('.header');
    header.insertAdjacentElement('afterend', banner);
    
    // 애니메이션
    setTimeout(() => {
        banner.classList.add('show');
    }, 500);
}

// 이전 결과 보기
function showPreviousResult() {
    const latestResult = getLatestResult();
    if (latestResult) {
        displayResults(latestResult.scores, latestResult.feedback, latestResult.actionTasks);
        closePreviousResultBanner();
    }
}

// 이전 결과 배너 닫기
function closePreviousResultBanner() {
    const banner = document.querySelector('.previous-result-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

// 히스토리 기능 제거됨 - 더 이상 사용하지 않음

// 통계 정보 가져오기
function getStatistics() {
    const results = getStoredResults();
    
    if (results.length === 0) {
        return null;
    }
    
    const stats = {
        totalTests: results.length,
        averageScore: 0,
        averageTime: 0,
        averageAsset: 0,
        averageRelationship: 0,
        bestScore: 0,
        worstScore: 15,
        improvement: 0
    };
    
    let totalScore = 0;
    let totalTime = 0;
    let totalAsset = 0;
    let totalRelationship = 0;
    
    results.forEach(result => {
        const score = result.scores.total;
        totalScore += score;
        totalTime += result.scores.time;
        totalAsset += result.scores.asset;
        totalRelationship += result.scores.relationship;
        
        if (score > stats.bestScore) stats.bestScore = score;
        if (score < stats.worstScore) stats.worstScore = score;
    });
    
    stats.averageScore = Math.round(totalScore / results.length * 10) / 10;
    stats.averageTime = Math.round(totalTime / results.length * 10) / 10;
    stats.averageAsset = Math.round(totalAsset / results.length * 10) / 10;
    stats.averageRelationship = Math.round(totalRelationship / results.length * 10) / 10;
    
    // 개선도 계산 (최신 3개 vs 이전 3개)
    if (results.length >= 6) {
        const recent = results.slice(0, 3);
        const old = results.slice(-3);
        
        const recentAvg = recent.reduce((sum, r) => sum + r.scores.total, 0) / 3;
        const oldAvg = old.reduce((sum, r) => sum + r.scores.total, 0) / 3;
        
        stats.improvement = Math.round((recentAvg - oldAvg) * 10) / 10;
    }
    
    return stats;
}

// 히스토리 버튼 기능 제거됨 - 더 이상 사용하지 않음

// 스토리지 관련 CSS 스타일 추가
const storageStyles = document.createElement('style');
storageStyles.textContent = `
    /* 이전 결과 배너 스타일 */
    .previous-result-banner {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        margin: 20px -20px;
        padding: 0;
        border-radius: 12px;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    }
    
    .previous-result-banner.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .banner-content {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 16px;
    }
    
    .banner-icon {
        font-size: 1.5rem;
    }
    
    .banner-text {
        flex: 1;
    }
    
    .banner-title {
        font-weight: 600;
        margin-bottom: 4px;
    }
    
    .banner-subtitle {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .banner-actions {
        display: flex;
        gap: 8px;
        align-items: center;
    }
    
    .banner-btn {
        padding: 8px 16px;
        border: 1px solid rgba(255,255,255,0.3);
        border-radius: 20px;
        background: rgba(255,255,255,0.1);
        color: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
    }
    
    .banner-btn:hover {
        background: rgba(255,255,255,0.2);
    }
    
    .close-btn {
        width: 32px;
        height: 32px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }
    
    /* 히스토리 모달 스타일 */
    .history-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .history-modal.show {
        opacity: 1;
    }
    
    .history-modal-content {
        background: white;
        border-radius: 16px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        transform: translateY(-20px);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
    }
    
    .history-modal.show .history-modal-content {
        transform: translateY(0);
    }
    
    .history-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .history-modal-header h3 {
        margin: 0;
        color: #2d3748;
    }
    
    .history-modal-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .history-modal-close:hover {
        background: #f7fafc;
    }
    
    .history-modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
    }
    
    .history-item {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
    }
    
    .history-item:hover {
        background: #edf2f7;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    
    .history-item.latest {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        border-color: transparent;
    }
    
    .history-item.latest:hover {
        background: linear-gradient(135deg, #e084fc 0%, #f4476b 100%);
    }
    
    .history-date {
        font-size: 0.9rem;
        margin-bottom: 8px;
        opacity: 0.8;
    }
    
    .history-scores {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 8px;
    }
    
    .history-total {
        font-size: 1.2rem;
        font-weight: 600;
    }
    
    .history-percentage {
        font-size: 0.9rem;
        opacity: 0.8;
    }
    
    .history-breakdown {
        font-size: 0.85rem;
        opacity: 0.9;
    }
    
    .latest-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(255,255,255,0.2);
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
    }
    
    .history-modal-footer {
        padding: 20px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
    }
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
        .previous-result-banner {
            margin: 15px -15px;
        }
        
        .banner-content {
            padding: 12px 15px;
            gap: 12px;
        }
        
        .banner-actions {
            flex-direction: column;
            gap: 6px;
        }
        
        .banner-btn {
            font-size: 0.8rem;
            padding: 6px 12px;
        }
        
        .history-modal-content {
            margin: 20px;
            width: calc(100% - 40px);
        }
        
        .history-item {
            padding: 12px;
        }
        
        .history-total {
            font-size: 1.1rem;
        }
    }
`;

document.head.appendChild(storageStyles);

// 전역 함수로 노출 (HTML에서 onclick으로 사용)
window.showPreviousResult = showPreviousResult;
window.closePreviousResultBanner = closePreviousResultBanner;