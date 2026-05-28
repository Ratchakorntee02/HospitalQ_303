import { useState } from 'react';

const queueData = {
  queueId: 'B6922004',
  currentQueue: 'B6922001',
  waitingAhead: 3,
  progressSteps: 4,
  totalSteps: 5,
};

const queueStatusText = {
  en: {
    live: 'Live Queue',
    yourNumber: 'Your Queue Number',
    nowServing: 'Now Serving',
    ahead: 'Queues Ahead',
    queues: 'Queues',
    estimate: 'Estimated wait:',
    updated: 'Updated just now',
    notify: 'Notify Me When Close',
    enabled: 'Notification Enabled',
    navigate: 'Navigate to Department',
    department: 'General Medicine',
    room: 'Examination Room 3',
    location: '2nd Floor, Building A',
    waitTime: '15 minutes',
  },
  th: {
    live: 'คิวเรียลไทม์',
    yourNumber: 'หมายเลขคิวของคุณ',
    nowServing: 'คิวที่กำลังเรียก',
    ahead: 'จำนวนคิวที่ต้องรอ',
    queues: 'คิว',
    estimate: 'เวลารอโดยประมาณ:',
    updated: 'อัปเดตล่าสุดเมื่อสักครู่',
    notify: 'แจ้งเตือนเมื่อใกล้ถึงคิว',
    enabled: 'เปิดการแจ้งเตือนแล้ว',
    navigate: 'นำทางไปยังแผนก',
    department: 'อายุรกรรมทั่วไป',
    room: 'ห้องตรวจที่ 3',
    location: 'ชั้น 2 อาคาร A',
    waitTime: '15 นาที',
  },
};

function QueueStatus({ language = 'en' }) {
  const [isNotifyEnabled, setIsNotifyEnabled] = useState(false);
  const text = queueStatusText[language];

  const queueBars = Array.from({ length: queueData.totalSteps }, (_, index) => index);

  return (
    <main className="container py-5 queue-status-page">
      <section className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4 text-center">
        <div className="card-body">
          <span className="queue-live-badge mb-3">{text.live}</span>
          <p className="text-muted fw-medium fs-4 mb-1">{text.yourNumber}</p>

          <h1 className="queue-number my-3">{queueData.queueId}</h1>

          <h2 className="fw-bold text-dark-blue mb-2">{text.department}</h2>
          <p className="text-muted fs-5 mb-1">{text.room}</p>
          <p className="text-muted fs-5 mb-0">{text.location}</p>

          <hr className="my-4 mx-auto queue-divider" />

          <div className="row g-3 my-2">
            <div className="col-md-6 queue-summary-divider">
              <p className="text-muted text-uppercase fw-bold mb-2">{text.nowServing}</p>
              <h2 className="fw-bold text-dark queue-now-serving">{queueData.currentQueue}</h2>
            </div>
            <div className="col-md-6">
              <p className="text-muted text-uppercase fw-bold mb-2">{text.ahead}</p>
              <h2 className="fw-bold text-danger queue-waiting-count">
                {queueData.waitingAhead} {text.queues}
              </h2>
            </div>
          </div>

          <div className="queue-status-bars mt-4" aria-label="Queue progress">
            {queueBars.map((bar) => (
              <div
                className={`queue-status-bar ${bar < queueData.progressSteps ? 'active' : ''}`}
                key={bar}
              ></div>
            ))}
          </div>

          <p className="queue-estimate mt-3 mb-1">
            {text.estimate} {text.waitTime}
          </p>
          <p className="text-muted mb-0">{text.updated}</p>
        </div>
      </section>

      <section className="queue-action-panel">
        <button
          className={`btn px-4 py-3 queue-action-btn ${
            isNotifyEnabled ? 'btn-success' : 'btn-outline-primary'
          }`}
          type="button"
          onClick={() => setIsNotifyEnabled(true)}
        >
          {isNotifyEnabled ? text.enabled : text.notify}
        </button>

        <button className="btn btn-outline-secondary px-4 py-3 queue-action-btn" type="button">
          {text.navigate}
        </button>
      </section>
    </main>
  );
}

export default QueueStatus;
