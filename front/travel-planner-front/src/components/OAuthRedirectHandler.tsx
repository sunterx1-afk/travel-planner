import { useEffect, useRef } from 'react'; // 💡 1. useRef를 추가합니다.
import axios from 'axios';

const OAuthRedirectHandler = () => {
  // 💡 2. StrictMode로 인해 백엔드 요청이 연달아 2번 가는 것을 막아주는 잠금장치 변수입니다.
  const isProcessed = useRef(false);

  useEffect(() => {
    // 1. URL에서 인가 코드(code) 추출
    const code = new URL(window.location.href).searchParams.get("code");
    
    // 💡 3. 코드가 존재하고, 아직 백엔드 요청을 보낸 적이 없을 때만 실행합니다.
    if (code && !isProcessed.current) {
      isProcessed.current = true; // 요청 보냈다고 표시 (문 잠그기)

      // 2. 백엔드 API 호출
      axios.post('http://localhost:8080/api/auth/kakao', 
        { code: code },
        { withCredentials: true } // 💡 4. [가장 중요] 이게 빠져 있어서 그동안 쿠키가 안 생겼던 것입니다!
      )
      .then(res => {
        console.log("백엔드 로그인 성공:", res.data);
        alert("로그인 성공!");
        window.location.href = "/"; // 성공 시 메인으로 이동
      })
      .catch(err => {
        console.error("로그인 실패:", err);
        alert("로그인에 실패했습니다.");
        // 실패하면 다시 시도할 수 있게 상태를 풀어줍니다.
        isProcessed.current = false; 
      });
    }
  }, []);

  return <div>로그인 중입니다...</div>;
};

export default OAuthRedirectHandler;