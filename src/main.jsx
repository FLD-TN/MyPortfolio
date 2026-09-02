import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource-variable/outfit';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './index.css';

import App from './App.jsx';

/* Bật cờ trước lần vẽ đầu tiên. Chỉ khi có cờ này thì các khối Reveal mới bắt
   đầu ở trạng thái ẩn, nên nếu tệp kịch bản không tải được, trang vẫn đọc được
   toàn bộ nội dung thay vì đen thui. */
document.documentElement.dataset.js = 'on';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
