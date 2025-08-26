### **STRUCTURE.md**

## 에이전트는 이 파일을 읽고 숙지한 후 코드 구현 작업을 진행해주세요.

## **Image Analyzer Website Project Plan (Mobile-First)**

### **1. 프로젝트 개요**

이 프로젝트는 Next.js를 사용하여 이미지를 분석하는 웹 애플리케이션을 구축합니다. 모바일 환경에 최적화된 UI/UX를 목표로 하며, React Native 앱처럼 사용자 친화적인 디자인을 적용합니다. 서버 측에서는 API 키를 안전하게 관리합니다.

### **2. 기술 스택 및 주요 기능**

  * **프레임워크**: Next.js (React)
  * **주요 기능**:
      * **클라이언트 사이드**: 모바일 퍼스트 디자인, 이미지 업로드, 질의문 입력, API 호출 및 결과 표시
      * **서버 사이드 (API 라우트)**: 클라이언트의 요청을 프록시하고, API 키를 안전하게 보호합니다.

### **3. 파일 및 디렉토리 구조**

```
/image-analyzer-project
├── pages/
│   ├── api/
│   │   └── analyze.js   // Next.js API 라우트
│   └── index.js         // 메인 페이지
├── styles/
│   ├── globals.css      // 전역 스타일
│   └── Home.module.css  // 페이지별 스타일 (CSS Modules 사용)
├── public/              // 정적 파일
├── .env.local           // 환경 변수 파일
├── package.json
└── README.md
```

-----

### **4. 컴포넌트 및 로직 상세**

#### **4.1. `pages/index.js` (메인 페이지)**

  * **목적**: 모바일에 최적화된 UI를 구성하고, 사용자 입력과 API 호출을 처리합니다.
  * **디자인 원칙**:
      * **모바일 퍼스트**: 최소 375px 너비를 기준으로 UI를 설계합니다.
      * **직관적인 레이아웃**: 핵심 기능(이미지 업로드, 질의 입력)이 화면 상단에 명확하게 배치되어야 합니다.
      * **큰 버튼 및 터치 영역**: 버튼과 입력 필드는 터치하기 쉽도록 충분한 크기를 가집니다.
      * **피드백**: 로딩 중에는 스피너를 표시하고, 완료 시에는 성공/실패 메시지를 보여줍니다.
  * **상태**: `useState` 훅을 사용해 `selectedFile`, `query`, `result`, `isLoading`, `error` 상태를 관리합니다.
  * **주요 함수**:
      * `handleFileChange(event)`: 파일 선택 시 호출. `event.target.files[0]`를 `selectedFile` 상태에 저장하고, 동시에 `FileReader`를 사용해 파일을 **Base64** 문자열로 변환하여 임시 상태에 저장합니다. 이는 `api/analyze.js`로 전송될 본문 데이터가 됩니다.
      * `handleSubmit(event)`: 폼 제출 시 호출. `e.preventDefault()`를 호출하여 페이지 새로고침을 막습니다. `isLoading` 상태를 `true`로 설정하고, `/api/analyze`로 **POST** 요청을 보냅니다. 본문은 JSON 형태로 `{ image: base64String, query: queryText }`를 포함합니다. 응답을 받아 `result` 상태에 저장하고, 로딩 상태를 해제합니다.
  * **UI 구조 (예시)**:
    ```jsx
    // CSS 모듈 적용을 위해 styles/Home.module.css 활용
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>📸 Image Analyzer</h1>
        <p className={styles.subtitle}>Upload an image and ask a question.</p>
      </header>

      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 이미지 선택 및 미리보기 영역 */}
          <div className={styles.fileInputContainer}>
            <input
              type="file"
              id="image-upload"
              className={styles.fileInput}
              onChange={handleFileChange}
              accept="image/*"
            />
            <label htmlFor="image-upload" className={styles.fileInputLabel}>
              {selectedFile ? 'Change Image' : 'Choose an Image'}
            </label>
            {/* 이미지 미리보기 */}
            {selectedFile && <img src={URL.createObjectURL(selectedFile)} alt="Preview" className={styles.previewImage} />}
          </div>

          <textarea
            className={styles.textarea}
            placeholder="What can you see in this image?"
            value={query}
            onChange={handleQueryChange}
            rows="3"
          />

          <button
            type="submit"
            className={styles.button}
            disabled={!selectedFile || !query || isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Image'}
          </button>
        </form>

        {error && <div className={styles.resultBox}><p className={styles.errorText}>{error}</p></div>}
        {result && (
          <div className={styles.resultBox}>
            <h2 className={styles.resultTitle}>Result</h2>
            <p className={styles.resultText}>{result.analysis}</p>
          </div>
        )}
      </main>
    </div>
    ```

-----

#### **4.2. `styles/Home.module.css` (모바일 스타일링)**

  * **목적**: `index.js` 컴포넌트의 스타일을 담당합니다. CSS Modules를 사용하여 클래스 이름 충돌을 방지합니다.
  * **주요 스타일링 원칙**:
      * **반응형 디자인**: `@media` 쿼리를 사용해 화면 크기에 따라 글꼴 크기나 레이아웃을 조정합니다. (기본은 모바일)
      * **색상 및 타이포그래피**: 모바일 가독성을 고려한 단순하고 명확한 색상 팔레트와 폰트를 사용합니다.
      * **간격**: 요소 간의 여백(padding, margin)을 충분히 확보하여 터치 오류를 줄입니다.
      * **그림자/경계**: 버튼과 입력 필드에 부드러운 그림자나 경계를 적용하여 입체감을 줍니다.
      * **로딩 스피너**: 로딩 중에는 CSS 기반 스피너를 구현하여 사용자에게 시각적 피드백을 제공합니다.

-----

#### **4.3. `pages/api/analyze.js` (API 라우트)**

  * **목적**: 클라이언트로부터 Base64 이미지 데이터와 질의문을 받아 외부 API에 요청을 보내고 결과를 반환합니다.
  * **로직**:
    1.  `req.method === 'POST'`인지 확인합니다.
    2.  `process.env.GEMINI_API_KEY`를 사용하여 API 키를 가져옵니다.
    3.  `req.body`로 전송된 JSON 데이터를 파싱합니다. `{ image, query }`를 얻습니다.
    4.  외부 API에 요청을 보낼 때, `Base64` 문자열을 바이너리 데이터로 다시 변환하여 `FormData`에 담습니다.
    5.  `fetch`를 사용하여 `https://msa-brain-gemini-173411279831.asia-northeast3.run.app/gemini/analyze_image`에 POST 요청을 보냅니다.
    6.  응답을 `json()`으로 파싱하여 클라이언트에게 다시 전송합니다.
    7.  오류 발생 시 `res.status(500).json({ error: '...' })`을 반환합니다.

### **5. 환경 변수 (`.env.local`)**

  * 프로젝트 루트에 `GEMINI_API_KEY=YOUR_API_KEY_HERE`를 추가합니다.

### **6. 구현 순서**

1.  Next.js 프로젝트를 생성합니다.
2.  `styles` 디렉토리를 만들고 `globals.css`와 `Home.module.css`를 생성합니다.
3.  `pages/index.js`에 **모바일 퍼스트 UI**와 클라이언트 로직을 구현합니다.
4.  `pages/api/analyze.js`에 서버 API 라우트 로직을 구현합니다.
5.  `.env.local` 파일을 생성하고 API 키를 설정합니다.
6.  `npm run dev`로 실행하며 디자인과 기능을 테스트합니다.

### **7. 행동 강령**

  * 에이전트는 매 핵심 작업이 끝나면 즉각 커밋하는 것 까지 작업을 마무리해주세요. (푸쉬는 하지 않아도 괜찮습니다.)