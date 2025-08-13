// 전역 변수
let currentAnswers = {};
let totalQuestions = 15;
let shuffledQuestions = [];

// 질문 데이터 (원본 순서)
const questionData = [
    // 시간 영역 (1-5)
    { id: 1, category: 'time', text: '급할 때 돈을 더 내고 시간을 아낀다' },
    { id: 2, category: 'time', text: '2만 원 아끼려 4시간 쓰는 것보다 10만 원 쓰고 4시간을 아낀다' },
    { id: 3, category: 'time', text: '전문적인 일은 직접 배우기보다 전문가에게 맡긴다' },
    { id: 4, category: 'time', text: '반복 업무에 유료 앱을 써 시간을 확보한다' },
    { id: 5, category: 'time', text: '저가치 활동에 낭비되는 시간을 아까워한다' },
    
    // 자산 영역 (6-10)
    { id: 6, category: 'asset', text: '수입이 생기면 소비보다 투자를 먼저 생각한다' },
    { id: 7, category: 'asset', text: '월급 외 \'파이프라인\'을 만들려 노력한다' },
    { id: 8, category: 'asset', text: '내 기술을 상품으로 만들 방법을 고민한다' },
    { id: 9, category: 'asset', text: '미래의 자산이 될 콘텐츠를 꾸준히 만든다' },
    { id: 10, category: 'asset', text: '회사나 프로젝트의 소유권을 얻을 방법을 찾는다' },
    
    // 관계 영역 (11-15)
    { id: 11, category: 'relationship', text: '단기 이익보다 장기적인 신뢰 관계를 우선한다' },
    { id: 12, category: 'relationship', text: '평판이 단기 이익보다 더 큰 가치라 생각한다' },
    { id: 13, category: 'relationship', text: '사소한 약속도 반드시 지키려 한다' },
    { id: 14, category: 'relationship', text: '믿을 수 있는 소수와 깊은 관계를 유지한다' },
    { id: 15, category: 'relationship', text: '주변 사람과 10년 후의 목표를 함께 이야기한다' }
];

// DOM 요소
const introContainer = document.getElementById('introContainer');
const calculateBtn = document.getElementById('calculateBtn');
const quizContainer = document.getElementById('quizContainer');
const resultContainer = document.getElementById('resultContainer');
const retryBtn = document.getElementById('retryBtn');

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadPreviousResults();
});

// 배열 섞기 함수
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// 앱 초기화
function initializeApp() {
    // 페이지 로드 시 URL 파라미터 확인
    checkUrlParams();
    
    // 테스트 시작하기 버튼 이벤트
    const startTestBtn = document.getElementById('startTestBtn');
    if (startTestBtn) {
        startTestBtn.addEventListener('click', startQuiz);
    }
    
    // 다시 체크하기 버튼 이벤트 (동적으로 추가되는 버튼을 위해 이벤트 위임 사용)
    document.addEventListener('click', function(event) {
        if (event.target && event.target.id === 'retryBtn') {
            resetQuiz();
        }
        // 공유하기 버튼 이벤트
        if (event.target && event.target.id === 'shareBtn') {
            shareResults();
        }
    });
}


// 퀴즈 시작
function startQuiz() {
    // 대문 페이지 숨기기
    introContainer.style.display = 'none';
    
    // 퀴즈 컨테이너 보이기
    quizContainer.style.display = 'block';
    
    // 퀴즈 초기화
    initializeQuiz();
}

// 퀴즈 초기화
function initializeQuiz() {
    // 질문 섞기
    shuffledQuestions = shuffleArray(questionData);
    
    // 섞인 질문으로 HTML 생성
    generateQuestionHTML();
    
    // 초기 상태 설정
    updateProgress();
}

// 질문 HTML 생성
function generateQuestionHTML() {
    const container = quizContainer;
    container.innerHTML = '';
    
    // 임시 결과 미리보기 버튼 제거됨
    
    shuffledQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question';
        questionDiv.setAttribute('data-question-id', question.id);
        
        questionDiv.innerHTML = `
            <div class="question-number">Q${index + 1}.</div>
            <div class="question-row">
                <div class="question-text">${question.text}</div>
                <div class="answer-options">
                    <button class="answer-btn no-btn" data-question-id="${question.id}" data-value="0" title="아니오">N</button>
                    <button class="answer-btn yes-btn" data-question-id="${question.id}" data-value="1" title="예">Y</button>
                </div>
            </div>
        `;
        
        container.appendChild(questionDiv);
    });
    
    // 결과 확인 버튼 추가
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-container';
    buttonDiv.innerHTML = '<button class="btn-primary" id="calculateBtn" disabled>결과 확인하기</button>';
    container.appendChild(buttonDiv);
    
    // 버튼 이벤트 리스너 추가
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(btn => {
        btn.addEventListener('click', handleAnswerClick);
    });
    
    // 새로운 결과 확인 버튼에 이벤트 추가
    document.getElementById('calculateBtn').addEventListener('click', calculateResults);
}

// 답변 버튼 클릭 처리
function handleAnswerClick(event) {
    const questionId = parseInt(event.target.getAttribute('data-question-id'));
    const answer = parseInt(event.target.getAttribute('data-value'));
    
    // 같은 질문의 다른 버튼들 비활성화
    const questionDiv = event.target.closest('.question');
    const allButtons = questionDiv.querySelectorAll('.answer-btn');
    allButtons.forEach(btn => btn.classList.remove('selected'));
    
    // 선택된 버튼 활성화
    event.target.classList.add('selected');
    
    // 답변 저장
    currentAnswers[questionId] = answer;
    
    // 프로그레스 업데이트
    updateProgress();
    
    // 버튼 활성화/비활성화
    updateCalculateButton();
}

// 프로그레스 바 업데이트 (비활성화)
function updateProgress() {
    // 프로그레스 바 제거됨 - 아무 작업 안함
}

// 계산 버튼 상태 업데이트
function updateCalculateButton() {
    const answeredCount = Object.keys(currentAnswers).length;
    const btn = document.getElementById('calculateBtn');
    
    if (answeredCount === totalQuestions) {
        btn.disabled = false;
        btn.textContent = '결과 확인하기';
    } else {
        btn.disabled = true;
        btn.textContent = `결과 확인하기 (${answeredCount}/${totalQuestions})`;
    }
}

// 결과 계산
function calculateResults() {
    // 로딩 화면 표시
    showLoadingScreen();
    
    // 2-3초 후에 결과 표시
    setTimeout(() => {
        const scores = calculateScores();
        const feedback = generateFeedback(scores);
        const actionTasks = generateActionTasks(scores);
        
        displayResults(scores, feedback, actionTasks);
        
        // 스크롤을 결과로 이동
        resultContainer.scrollIntoView({ behavior: 'smooth' });
        
        // 다시 테스트하기 버튼에 이벤트 리스너 추가
        const retryButton = document.getElementById('retryBtn');
        if (retryButton) {
            retryButton.onclick = resetQuiz;
        }
        
        // 결과 저장
        saveResults({
            scores,
            feedback,
            actionTasks,
            timestamp: new Date().toISOString()
        });
        
        // 로딩 화면 숨기기
        hideLoadingScreen();
    }, 4000); // 4초 대기
}

// 로딩 화면 표시
function showLoadingScreen() {
    const loadingHTML = `
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-content">
                <div class="loading-icon">🧠</div>
                <div class="loading-title">분석 중입니다</div>
                <div class="loading-subtitle">당신의 부자 마인드셋을 분석하고 있어요</div>
                <div class="loading-bar">
                    <div class="loading-progress"></div>
                </div>
                <div class="loading-steps">
                    <div class="step active" id="step1">📊 답변 분석</div>
                    <div class="step" id="step2">🎯 점수 계산</div>
                    <div class="step" id="step3">💡 맞춤 피드백 생성</div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loadingHTML);
    
    // 애니메이션 시작 (4초에 맞춰 조정)
    setTimeout(() => document.getElementById('step2').classList.add('active'), 1200);
    setTimeout(() => document.getElementById('step3').classList.add('active'), 2400);
}

// 로딩 화면 숨기기
function hideLoadingScreen() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.remove();
        }, 300);
    }
}

// 점수 계산
function calculateScores() {
    // 각 영역별 점수 계산
    const timeScore = calculateCategoryScore('time');
    const assetScore = calculateCategoryScore('asset');
    const relationshipScore = calculateCategoryScore('relationship');
    
    const totalScore = timeScore + assetScore + relationshipScore;
    const percentage = Math.round((totalScore / 15) * 100);
    
    return {
        time: timeScore,
        asset: assetScore,
        relationship: relationshipScore,
        total: totalScore,
        percentage: percentage
    };
}

// 카테고리별 점수 계산
function calculateCategoryScore(category) {
    let score = 0;
    questionData.forEach(question => {
        if (question.category === category && currentAnswers[question.id] !== undefined) {
            score += currentAnswers[question.id];
        }
    });
    return score;
}

// 피드백 생성
function generateFeedback(scores) {
    const feedback = [];
    
    // 시간 영역 피드백
    feedback.push({
        title: '시간 가치 분석',
        icon: '🕑',
        content: getTimeFeedback(scores.time)
    });
    
    // 자산 영역 피드백
    feedback.push({
        title: '자산 창출 분석',
        icon: '🏢',
        content: getAssetFeedback(scores.asset)
    });
    
    // 관계 영역 피드백
    feedback.push({
        title: '관계 투자 분석',
        icon: '🤝',
        content: getRelationshipFeedback(scores.relationship)
    });
    
    return feedback;
}

// 시간 영역 피드백
function getTimeFeedback(score) {
    if (score >= 4) {
        return '<strong>시간의 진정한 가치를 아는 분이군요!</strong><br><br>당신은 <strong>시간을 돈보다 귀하게 여기는 부자 마인드셋</strong>을 이미 갖추고 있습니다. 평소에도 택시, 배달, 자동화 앱을 적극 활용하며, <strong>시간을 투자의 관점</strong>에서 바라보는 습관이 잘 형성되어 있어요. 이미 <strong>\"Time is Money\"를 체화</strong>하고 계시니, 이제는 아낀 시간을 더 높은 가치의 활동에 투자하는 것에 집중해보세요. 당신의 시간 관리 철학을 주변 사람들과 나누는 것도 좋겠습니다.';
    } else if (score >= 2) {
        return '<strong>좋은 시작이에요!</strong><br><br>당신은 <strong>시간의 가치를 어렴풋이 알고 있지만</strong>, 아직은 돈을 아끼는 습관이 더 강합니다. 가끔 택시를 타거나 배달 앱을 이용하지만, 여전히 <strong>\"돈이 아까워서\"</strong>라는 생각이 먼저 드는 경우가 많죠. 이미 <strong>시간의 소중함을 알고 계시는 것은 좋은 신호</strong>입니다. 하지만 한 단계 더 나아가려면 내 시간에 대한 명확한 가치 계산이 필요해요. 예를 들어 시급 2만원 가치의 일을 한다면, 1만 5천원짜리 택시를 타고 1시간을 아껴서 더 가치있는 일에 쓰는 것이 합리적 선택입니다.';
    } else {
        return '<strong>새로운 시작점이에요!</strong><br><br>당신은 아직 <strong>시간을 돈으로 사는 것에 익숙하지 않습니다.</strong> 대부분의 상황에서 돈을 아끼는 것을 우선순위로 두고, 시간이 조금 더 걸리더라도 <strong>절약을 선택하는 경향</strong>이 강합니다. 이는 매우 일반적인 사고방식이에요. 하지만 <strong>시간과 돈의 관계에 대해 다시 한번 생각해 볼 필요</strong>가 있습니다. 내 시간의 가치를 구체적으로 계산해보고, 어떤 상황에서 시간을 사는 것이 더 현명한 선택인지 고민해보세요. 작은 것부터 시작해보는 것이 중요합니다.';
    }
}

// 자산 영역 피드백
function getAssetFeedback(score) {
    if (score >= 4) {
        return '<strong>자산 창출의 달인이시네요!</strong><br><br>당신은 이미 <strong>\"만들고 소유하는\" 것에 대한 명확한 인식</strong>을 갖고 있습니다. 유튜브, 전자책, 사이드 프로젝트를 시작했거나 준비 중일 수 있어요. <strong>패시브 인컴의 중요성</strong>을 깊이 이해하고 있군요. <strong>\"내가 자지 않는 동안에도 돈을 벌어다 주는 것\"</strong>의 가치를 알고 계시니, 이제는 기존 자산들을 확장하고 다양화하는 데 집중해보세요. 당신의 경험과 노하우 자체가 또 다른 사람들에게는 귀중한 자산이 될 수 있습니다.';
    } else if (score >= 2) {
        return '<strong>발전 가능성이 보여요!</strong><br><br>당신은 <strong>자산의 중요성을 이해하지만</strong>, 아직은 실행보다 \"벌고 쓰는\" 단계에 머물러 있을 수 있습니다. 투자나 부업에 관심은 있지만 <strong>구체적인 행동으로 옮기는 데는 망설임</strong>이 있는 상태로 보입니다. 주식이나 부동산 투자를 고려해보거나, 블로그나 유튜브 등 컨텐츠 제작에 관심을 보이는 단계일 수 있어요. 이미 <strong>자산 마인드의 기초는 갖추어져 있으니</strong>, 이제는 작은 것부터 시작해보는 것이 중요합니다. 월 10만원이라도 투자에 돌리거나, 내 전문 지식을 활용한 사이드 프로젝트를 시작해보세요.';
    } else {
        return '<strong>지금부터 시작이에요!</strong><br><br>당신은 <strong>\"노동\"으로 돈을 버는 것에 익숙</strong>하며, 자산의 개념에 대해서는 아직 깊이 생각해보지 않았을 수 있습니다. 월급을 받고 생활비로 쓰는 것이 자연스러운 패턴이고, <strong>투자나 부업에 대한 관심은 상대적으로 적은 상태</strong>입니다. 하지만 이것이 나쁜 것은 아닙니다! 모든 부자들도 이 단계에서 시작했어요. <strong>자산의 개념을 더 깊이 이해하고, 나만의 자산을 만드는 데 관심을 가져야 할 시점</strong>입니다. 작은 투자 공부나 사이드 프로젝트부터 천천히 시작해보세요.';
    }
}

// 관계 영역 피드백
function getRelationshipFeedback(score) {
    if (score >= 4) {
        return '<strong>관계 투자의 마스터네요!</strong><br><br>당신은 <strong>장기적인 관계와 신뢰의 중요성</strong>을 잘 알고 있으며, 이것이 <strong>가장 큰 자산임을 깨닫고 있습니다.</strong> 단기적 이익보다 평판과 신뢰를 우선시하며, <strong>10년, 20년을 내다보는 관계 투자</strong>를 실천하고 있어요. <strong>\"네트워크가 순자산\"</strong>이라는 말을 몸소 실천하시는군요. 이미 탄탄한 관계의 기반을 갖추고 계시니, 이제는 이러한 관계들을 통해 서로 성장할 수 있는 시너지를 만들어가는 데 집중해보세요. 당신의 관계 철학이 주변 사람들에게도 긍정적인 영향을 미칠 것입니다.';
    } else if (score >= 2) {
        return '<strong>기본기는 탄탄해요!</strong><br><br>당신은 <strong>사람 관계가 중요하다고 생각하지만</strong>, 때로는 단기적인 이익에 흔들릴 수 있습니다. 평소에는 신뢰 관계를 중시하지만, 급하거나 이해관계가 걸린 상황에서는 <strong>조금씩 타협하는 모습</strong>을 보일 수 있어요. 이는 자연스러운 현상이지만, 진정한 부자가 되려면 <strong>일관성이 중요</strong>합니다. 작은 약속부터 철저히 지키고, 당장 손해가 보이더라도 장기적 관계를 우선시하는 연습이 필요해요. <strong>관계에 대한 기본기는 갖추어져 있으니</strong>, 이제 실천의 일관성만 더하면 됩니다.';
    } else {
        return '<strong>관계의 새로운 관점이 필요해요!</strong><br><br>당신은 아직 <strong>인간관계를 \"투자\"의 관점에서 생각하는 것에 익숙하지 않습니다.</strong> 사람들과의 관계를 중요하게 생각하지만, 그것이 <strong>미래에 얼마나 큰 영향을 미치는지</strong>에 대해서는 깊이 생각해보지 않았을 수 있어요. 관계는 단순히 감정적 유대가 아니라, <strong>서로에게 가치를 주고받는 투자의 개념</strong>으로 바라볼 필요가 있습니다. 장기적인 관점에서 신뢰할 수 있는 관계를 구축하는 것이 얼마나 중요한지, 그리고 그것이 당신의 미래에 어떤 영향을 미칠지 생각해보는 시간이 필요합니다.';
    }
}

// 실천 과제 생성
function generateActionTasks(scores) {
    const tasks = [];
    
    // 3점 이하인 영역에 대한 실천 과제 추가
    if (scores.time <= 3) {
        tasks.push({
            title: 'Q. 오늘 내가 돈으로 살 수 있었던 소중한 시간은?',
            content: '오늘 하루 중 당신의 소중한 시간을 가장 많이 낭비한 활동을 하나 적어보고, 그 활동을 다른 사람에게 맡기거나 자동화하기 위해 필요한 비용을 계산해 보세요. 그리고 그 비용을 지불하고 아낀 시간으로 어떤 더 가치 있는 일을 할 수 있을지 구체적으로 생각해 보세요.'
        });
    }
    
    if (scores.asset <= 3) {
        tasks.push({
            title: 'Q. 남들이 돈을 지불할 나의 지식은?',
            content: '내가 지금 잘하는 것, 좋아하는 것, 혹은 다른 사람에게 도움을 줄 수 있는 지식이 무엇인지 3가지 이상 적어보세요. 예: 요가 수업 노트를 전자책으로 만든 김OO님의 사례처럼요. 이 중에서 하나를 골라, \"내가 없어도 돈을 벌어다 주는 자산\"으로 만들려면 어떻게 시작해야 할지 구체적인 아이디어와 첫 번째 단계를 적어보세요.'
        });
    }
    
    if (scores.relationship <= 3) {
        tasks.push({
            title: 'Q. 내가 오랫동안 함께 하고 싶은 사람은?',
            content: '당신이 앞으로 10년 뒤에도 함께하고 싶은 사람 3명을 떠올려보고 그들에게 당신이 줄 수 있는 가치는 무엇인지, 그리고 당신이 그들과 함께 이루고 싶은 장기적인 목표는 무엇인지 적어보세요.'
        });
    }
    
    return tasks;
}

// 결과 표시
function displayResults(scores, feedback, actionTasks) {
    // 전역 변수에 점수 저장 (공유용)
    window.currentResultScores = scores;
    
    // 컨테이너 표시 전환
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    
    // 메인 헤더 숨기기
    const mainHeader = document.querySelector('.header');
    if (mainHeader) {
        mainHeader.style.display = 'none';
    }
    
    // 각 영역별 통합 표시
    displayCategoryResults('time', scores.time, feedback[0], actionTasks);
    displayCategoryResults('asset', scores.asset, feedback[1], actionTasks);
    displayCategoryResults('relationship', scores.relationship, feedback[2], actionTasks);
}

// 영역별 통합 결과 표시
function displayCategoryResults(category, score, feedbackItem, actionTasks) {
    // 점수 아이콘 표시
    const scoreElement = document.getElementById(category + 'Score');
    
    // 각 영역별로 다른 아이콘 사용
    let filledIcon, emptyIcon;
    if (category === 'time') {
        filledIcon = '🕐'; emptyIcon = '🕐';
    } else if (category === 'asset') {
        filledIcon = '💎'; emptyIcon = '💎';
    } else {
        filledIcon = '🧡'; emptyIcon = '🧡';
    }
    
    let icons = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= score) {
            icons += `<span class="score-filled">${filledIcon}</span>`;
        } else {
            icons += `<span class="score-empty">${emptyIcon}</span>`;
        }
    }
    scoreElement.innerHTML = icons;
    
    // 피드백 표시
    const feedbackElement = document.getElementById(category + 'Feedback');
    feedbackElement.innerHTML = `<div class="feedback-content">${feedbackItem.content}</div>`;
    
    // 해당 영역의 실천 과제 표시
    const taskElement = document.getElementById(category + 'Task');
    let categoryTask;
    
    // 3점 이하인 영역에만 실천 과제 표시
    if (score <= 3) {
        if (category === 'time') {
            categoryTask = actionTasks.find(task => task.title.includes('돈으로 살 수 있었던 소중한 시간'));
        } else if (category === 'asset') {
            categoryTask = actionTasks.find(task => task.title.includes('돈을 지불할 나의 지식'));
        } else if (category === 'relationship') {
            categoryTask = actionTasks.find(task => task.title.includes('함께 하고 싶은 사람'));
        }
    }
    
    if (categoryTask) {
        taskElement.innerHTML = `
            <div class="task-title">${categoryTask.title}</div>
            <div class="task-content">${categoryTask.content}</div>
        `;
        taskElement.style.display = 'block';
    } else {
        taskElement.style.display = 'none';
    }
}

// 랜덤 결과 생성 함수
function showRandomResults() {
    // 각 영역별로 1-5점 랜덤 점수 생성
    const timeScore = Math.floor(Math.random() * 5) + 1;
    const assetScore = Math.floor(Math.random() * 5) + 1;
    const relationshipScore = Math.floor(Math.random() * 5) + 1;
    
    const randomScores = { 
        time: timeScore, 
        asset: assetScore, 
        relationship: relationshipScore, 
        total: timeScore + assetScore + relationshipScore, 
        percentage: Math.round((timeScore + assetScore + relationshipScore) / 15 * 100)
    };
    
    const randomFeedback = generateFeedback(randomScores);
    const randomTasks = generateActionTasks(randomScores);
    
    displayResults(randomScores, randomFeedback, randomTasks);
}

// 결과 페이지 미리보기 (임시 함수)
function showMockResults() {
    const mockScores = { time: 3, asset: 3, relationship: 3, total: 9, percentage: 60 };
    const mockFeedback = [
        { title: '시간 가치 분석', icon: '🕑', content: '<strong>좋은 시작이에요!</strong><br><br>당신은 <strong>시간의 가치를 어렴풋이 알고 있지만</strong>, 아직은 돈을 아끼는 습관이 더 강합니다. 가끔 택시를 타거나 배달 앱을 이용하지만, 여전히 <strong>"돈이 아까워서"</strong>라는 생각이 먼저 드는 경우가 많죠. 이미 <strong>시간의 소중함을 알고 계시는 것은 좋은 신호</strong>입니다. 하지만 한 단계 더 나아가려면 내 시간에 대한 명확한 가치 계산이 필요해요. 예를 들어 시급 2만원 가치의 일을 한다면, 1만 5천원짜리 택시를 타고 1시간을 아껴서 더 가치있는 일에 쓰는 것이 합리적 선택입니다.' },
        { title: '자산 창출 분析', icon: '🏢', content: '<strong>발전 가능성이 보여요!</strong><br><br>당신은 <strong>자산의 중요성을 이해하지만</strong>, 아직은 실행보다 "벌고 쓰는" 단계에 머물러 있을 수 있습니다. 투자나 부업에 관심은 있지만 <strong>구체적인 행동으로 옮기는 데는 망설임</strong>이 있는 상태로 보입니다.<br><br>주식이나 부동산 투자를 고려해보거나, 블로그나 유튜브 등 컨텐츠 제작에 관심을 보이는 단계일 수 있어요. 이미 <strong>자산 마인드의 기초는 갖추어져 있으니</strong>, 이제는 작은 것부터 시작해보는 것이 중요합니다. 월 10만원이라도 투자에 돌리거나, 내 전문 지식을 활용한 사이드 프로젝트를 시작해보세요.' },
        { title: '관계 투자 분석', icon: '🤝', content: '<strong>기본기는 탄탄해요!</strong><br><br>당신은 <strong>사람 관계가 중요하다고 생각하지만</strong>, 때로는 단기적인 이익에 흔들릴 수 있습니다. 평소에는 신뢰 관계를 중시하지만, 급하거나 이해관계가 걸린 상황에서는 <strong>조금씩 타협하는 모습</strong>을 보일 수 있어요.<br><br>이는 자연스러운 현상이지만, 진정한 부자가 되려면 <strong>일관성이 중요</strong>합니다. 작은 약속부터 철저히 지키고, 당장 손해가 보이더라도 장기적 관계를 우선시하는 연습이 필요해요. <strong>관계에 대한 기본기는 갖추어져 있으니</strong>, 이제 실천의 일관성만 더하면 됩니다.' }
    ];
    const mockTasks = [
        { title: 'Q. 오늘 내가 돈으로 살 수 있었던 소중한 시간은?', content: '오늘 하루 중 당신의 소중한 시간을 가장 많이 낭비한 활동을 하나 적어보고, 그 활동을 다른 사람에게 맡기거나 자동화하기 위해 필요한 비용을 계산해 보세요. 그리고 그 비용을 지불하고 아낀 시간으로 어떤 더 가치 있는 일을 할 수 있을지 구체적으로 생각해 보세요.' },
        { title: 'Q. 남들이 돈을 지불할 나의 지식은?', content: '내가 지금 잘하는 것, 좋아하는 것, 혹은 다른 사람에게 도움을 줄 수 있는 지식이 무엇인지 3가지 이상 적어보세요. 예: 요가 수업 노트를 전자책으로 만든 김OO님의 사례처럼요. 이 중에서 하나를 골라, "내가 없어도 돈을 벌어다 주는 자산"으로 만들려면 어떻게 시작해야 할지 구체적인 아이디어와 첫 번째 단계를 적어보세요.' },
        { title: 'Q. 내가 오랫동안 함께 하고 싶은 사람은?', content: '당신이 앞으로 10년 뒤에도 함께하고 싶은 사람 3명을 떠올려보고 그들에게 당신이 줄 수 있는 가치는 무엇인지, 그리고 당신이 그들과 함께 이루고 싶은 장기적인 목표는 무엇인지 적어보세요.' }
    ];
    
    displayResults(mockScores, mockFeedback, mockTasks);
}

// 퀴즈 리셋
function resetQuiz() {
    // 답변 초기화
    currentAnswers = {};
    
    // 컨테이너 표시 전환
    resultContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    introContainer.style.display = 'block';
    
    // 메인 헤더 다시 표시
    const mainHeader = document.querySelector('.header');
    if (mainHeader) {
        mainHeader.style.display = 'block';
    }
    
    // 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// URL 파라미터 확인 (공유된 결과 표시)
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const resultParam = urlParams.get('result');
    
    if (resultParam) {
        const scores = decodeResultFromUrl(resultParam);
        if (scores) {
            const feedback = generateFeedback(scores);
            const actionTasks = generateActionTasks(scores);
            displayResults(scores, feedback, actionTasks);
            
            // 공유된 결과임을 표시
            window.isSharedResult = true;
            
            // 대문 페이지 숨기기
            introContainer.style.display = 'none';
            
            // 메인 헤더 숨기기
            const mainHeader = document.querySelector('.header');
            if (mainHeader) {
                mainHeader.style.display = 'none';
            }
            
            // 공유된 결과용 버튼으로 교체
            updateButtonsForSharedResult();
        }
    }
}

// URL에서 점수 디코딩
function decodeResultFromUrl(resultParam) {
    try {
        // 형식: t3a4r2 (time3, asset4, relationship2)
        const timeMatch = resultParam.match(/t(\d+)/);
        const assetMatch = resultParam.match(/a(\d+)/);
        const relationshipMatch = resultParam.match(/r(\d+)/);
        
        if (timeMatch && assetMatch && relationshipMatch) {
            const time = parseInt(timeMatch[1]);
            const asset = parseInt(assetMatch[1]);
            const relationship = parseInt(relationshipMatch[1]);
            
            // 유효한 점수 범위 확인 (1-5)
            if (time >= 0 && time <= 5 && asset >= 0 && asset <= 5 && relationship >= 0 && relationship <= 5) {
                const total = time + asset + relationship;
                const percentage = Math.round((total / 15) * 100);
                
                return { time, asset, relationship, total, percentage };
            }
        }
    } catch (error) {
        console.error('URL 파라미터 디코딩 오류:', error);
    }
    return null;
}

// 점수를 URL로 인코딩
function encodeResultToUrl(scores) {
    return `t${scores.time}a${scores.asset}r${scores.relationship}`;
}

// 결과 공유하기
function shareResults() {
    // 현재 결과 점수 가져오기 (전역 변수에서)
    if (!window.currentResultScores) {
        alert('공유할 결과가 없습니다.');
        return;
    }
    
    const encoded = encodeResultToUrl(window.currentResultScores);
    const shareUrl = `${window.location.origin}${window.location.pathname}?result=${encoded}`;
    
    // 클립보드에 복사
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showShareNotification('결과 링크가 복사되었습니다! 친구들과 공유해보세요 🎉');
        }).catch(() => {
            fallbackCopyTextToClipboard(shareUrl);
        });
    } else {
        fallbackCopyTextToClipboard(shareUrl);
    }
}

// 클립보드 복사 대체 방법
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showShareNotification('결과 링크가 복사되었습니다! 친구들과 공유해보세요 🎉');
    } catch (err) {
        showShareNotification('링크: ' + text);
    }
    
    document.body.removeChild(textArea);
}

// 공유 알림 표시
function showShareNotification(message) {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.share-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 애니메이션
    setTimeout(() => notification.classList.add('show'), 100);
    
    // 3초 후 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 공유된 결과용 버튼으로 교체
function updateButtonsForSharedResult() {
    const resultActions = document.getElementById('resultActions');
    if (resultActions) {
        resultActions.innerHTML = `
            <button class="btn-primary btn-take-test" id="takeTestBtn">
                나도 테스트하기
            </button>
        `;
        
        // 나도 테스트하기 버튼 이벤트 추가
        const takeTestBtn = document.getElementById('takeTestBtn');
        if (takeTestBtn) {
            takeTestBtn.addEventListener('click', function() {
                // URL에서 파라미터 제거
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // 페이지 새로고침하여 처음부터 시작
                window.location.reload();
            });
        }
    }
}

// 전역 함수로 노출 (개발용)
window.showRandomResults = showRandomResults;