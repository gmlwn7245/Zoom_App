// http(X) ws(O) || window.location.host == localhost:3000 (server.js에 설정한 포트)
const socket = new WebSocket(`ws://${window.location.host}`);

