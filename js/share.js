// 출력 기능 관련 스크립트

// 출력 버튼 이벤트 설정
document.addEventListener('DOMContentLoaded', function() {
    const printBtn = document.getElementById('printBtn');
    if (printBtn) {
        printBtn.addEventListener('click', handlePrint);
    }
});

// 출력 처리
function handlePrint() {
    // 출력 스타일 적용 후 print() 실행
    window.print();
}

// 공유 텍스트 생성
function generateShareText() {
    const scores = getCurrentScores();
    const totalScore = scores.total;
    const percentage = scores.percentage;
    
    // 개인별 맞춤 코멘트 생성
    const personalComment = generatePersonalComment(scores);
    
    const shareText = `🧠 나는 지금, 부자 마인드셋 ${percentage}% 가진 사람!

💰 시간 가치: ${scores.time}/5점
🏗️자산 창출: ${scores.asset}/5점  
🔄 관계 투자: ${scores.relationship}/5점

${personalComment}

나도 테스트해보기: ${window.location.href}
#부자마인드셋 #자기계발 #시간관리 #자산만들기`;

    return {
        text: shareText,
        url: window.location.href,
        title: '부자 마인드셋 체크 결과'
    };
}

// 현재 점수 가져오기
function getCurrentScores() {
    // 결과 화면에서 현재 표시된 점수 추출
    const totalScore = parseInt(document.getElementById('totalScore').textContent);
    const timeScore = parseInt(document.getElementById('timeScore').textContent.split('/')[0]);
    const assetScore = parseInt(document.getElementById('assetScore').textContent.split('/')[0]);
    const relationshipScore = parseInt(document.getElementById('relationshipScore').textContent.split('/')[0]);
    
    return {
        total: totalScore,
        time: timeScore,
        asset: assetScore,
        relationship: relationshipScore,
        percentage: Math.round((totalScore / 15) * 100)
    };
}

// 개인별 맞춤 코멘트 생성
function generatePersonalComment(scores) {
    const comments = [];
    
    // 각 영역별 코멘트
    if (scores.time <= 2) {
        comments.push('시간보다 돈을 아끼는 내가 보인다… 반성 중');
    } else if (scores.time === 5) {
        comments.push('시간 가치를 제대로 아는 사람 🕐✨');
    }
    
    if (scores.asset <= 2) {
        comments.push('아직은 월급쟁이 마인드에 머물러 있나?');
    } else if (scores.asset === 5) {
        comments.push('자산 만들기의 달인! 💪');
    }
    
    if (scores.relationship <= 2) {
        comments.push('관계도 투자라는 걸 깨달아야겠어');
    } else if (scores.relationship === 5) {
        comments.push('인맥왕의 품격 👑');
    }
    
    // 전체 점수에 따른 코멘트
    if (scores.total >= 13) {
        return '이미 부자 마인드셋 완성! 존경합니다 🙏';
    } else if (scores.total >= 10) {
        return '부자 마인드셋 거의 완성! 조금만 더 💪';
    } else if (scores.total >= 7) {
        return '부자 마인드셋으로 가는 중... 화이팅! 🚀';
    } else {
        return comments.length > 0 ? comments[0] : '부자 마인드셋 여행 시작! 🌱';
    }
}

// Web Share API 사용
function shareWithWebAPI(shareData) {
    navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url
    }).then(() => {
        showShareSuccess();
    }).catch((error) => {
        console.log('공유 취소됨:', error);
        // 공유가 취소된 경우 클립보드 복사로 대체
        copyToClipboard(shareData.text);
    });
}

// 공유 모달 표시 (데스크톱용)
function showShareModal(shareData) {
    const modal = createShareModal(shareData);
    document.body.appendChild(modal);
    
    // 모달 애니메이션
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 공유 모달 생성
function createShareModal(shareData) {
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
        <div class="share-modal-content">
            <div class="share-modal-header">
                <h3>결과 공유하기</h3>
                <button class="share-modal-close">&times;</button>
            </div>
            <div class="share-modal-body">
                <textarea class="share-text" readonly>${shareData.text}</textarea>
                <div class="share-options">
                    <button class="share-option clipboard-btn">
                        📋 클립보드 복사
                    </button>
                    <button class="share-option kakao-btn">
                        💬 카카오톡
                    </button>
                    <button class="share-option facebook-btn">
                        📘 페이스북
                    </button>
                    <button class="share-option twitter-btn">
                        🐦 트위터
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 이벤트 리스너 추가
    addShareModalEvents(modal, shareData);
    
    return modal;
}

// 공유 모달 이벤트 추가
function addShareModalEvents(modal, shareData) {
    const closeBtn = modal.querySelector('.share-modal-close');
    const clipboardBtn = modal.querySelector('.clipboard-btn');
    const kakaoBtn = modal.querySelector('.kakao-btn');
    const facebookBtn = modal.querySelector('.facebook-btn');
    const twitterBtn = modal.querySelector('.twitter-btn');
    
    // 모달 닫기
    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // 클립보드 복사
    clipboardBtn.addEventListener('click', () => {
        copyToClipboard(shareData.text);
        closeModal();
    });
    
    // 카카오톡 공유
    kakaoBtn.addEventListener('click', () => {
        shareToKakao(shareData);
        closeModal();
    });
    
    // 페이스북 공유
    facebookBtn.addEventListener('click', () => {
        shareToFacebook(shareData);
        closeModal();
    });
    
    // 트위터 공유
    twitterBtn.addEventListener('click', () => {
        shareToTwitter(shareData);
        closeModal();
    });
}

// 클립보드 복사
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showShareSuccess('클립보드에 복사되었습니다!');
        }).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 클립보드 복사 대체 방법
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareSuccess('클립보드에 복사되었습니다!');
    } catch (err) {
        showShareError('복사에 실패했습니다. 텍스트를 직접 복사해주세요.');
    }
    
    document.body.removeChild(textArea);
}

// 카카오톡 공유
function shareToKakao(shareData) {
    const url = `https://sharer.kakao.com/talk/friends/?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.text)}`;
    window.open(url, '_blank', 'width=500,height=500');
}

// 페이스북 공유
function shareToFacebook(shareData) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

// 트위터 공유
function shareToTwitter(shareData) {
    const tweetText = shareData.text.length > 280 ? shareData.text.substring(0, 250) + '...' : shareData.text;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareData.url)}`;
    window.open(url, '_blank', 'width=600,height=400');
}

// 공유 성공 메시지
function showShareSuccess(message = '공유되었습니다!') {
    showToast(message, 'success');
}

// 공유 실패 메시지
function showShareError(message = '공유에 실패했습니다.') {
    showToast(message, 'error');
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // 애니메이션
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 자동으로 제거
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// 모바일 여부 확인
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 공유 관련 CSS 스타일 추가
const shareStyles = document.createElement('style');
shareStyles.textContent = `
    /* 공유 모달 스타일 */
    .share-modal {
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
    
    .share-modal.show {
        opacity: 1;
    }
    
    .share-modal-content {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        transform: translateY(-20px);
        transition: transform 0.3s ease;
    }
    
    .share-modal.show .share-modal-content {
        transform: translateY(0);
    }
    
    .share-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .share-modal-header h3 {
        margin: 0;
        color: #2d3748;
    }
    
    .share-modal-close {
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
    
    .share-modal-close:hover {
        background: #f7fafc;
    }
    
    .share-modal-body {
        padding: 20px;
    }
    
    .share-text {
        width: 100%;
        height: 150px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        font-size: 0.9rem;
        line-height: 1.4;
        resize: none;
        margin-bottom: 20px;
        font-family: inherit;
    }
    
    .share-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }
    
    .share-option {
        padding: 12px 16px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .share-option:hover {
        background: #f7fafc;
        transform: translateY(-1px);
    }
    
    .clipboard-btn:hover {
        border-color: #4facfe;
        color: #4facfe;
    }
    
    .kakao-btn:hover {
        border-color: #fee500;
        background: #fee500;
        color: #000;
    }
    
    .facebook-btn:hover {
        border-color: #1877f2;
        background: #1877f2;
        color: white;
    }
    
    .twitter-btn:hover {
        border-color: #1da1f2;
        background: #1da1f2;
        color: white;
    }
    
    /* 토스트 메시지 스타일 */
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    }
    
    .toast.show {
        transform: translateX(0);
    }
    
    .toast-success {
        background: #48bb78;
    }
    
    .toast-error {
        background: #f56565;
    }
    
    .toast-info {
        background: #4299e1;
    }
    
    /* 모바일 반응형 */
    @media (max-width: 768px) {
        .share-modal-content {
            margin: 20px;
            width: calc(100% - 40px);
        }
        
        .share-options {
            grid-template-columns: 1fr;
        }
        
        .toast {
            right: 10px;
            left: 10px;
            text-align: center;
        }
    }
`;

document.head.appendChild(shareStyles);