import { useState } from 'react';

const checkupPackages = [
  {
    id: 'basic',
    name: 'Basic Protection',
    target: 'Recommended for ages 15-30',
    price: '1,500',
    accent: '#5884b1',
    items: [
      'Complete blood count (CBC)',
      'Fasting blood sugar (FBS)',
      'Liver and kidney function screening',
      'Urinalysis (UA)',
    ],
  },
  {
    id: 'silver',
    name: 'Silver Vitality',
    target: 'Recommended for ages 30-50',
    price: '3,900',
    accent: '#2c4a6f',
    popular: true,
    items: [
      'All Basic Protection screenings',
      'Cholesterol and triglyceride panel',
      'Electrocardiogram (EKG)',
      'Chest X-ray',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Premium',
    target: 'Recommended for ages 50+',
    price: '7,500',
    accent: '#b18958',
    items: [
      'All Silver Vitality screenings',
      'Whole abdomen ultrasound',
      'Bone density screening',
      'Cancer risk screening panel',
    ],
  },
];

const annualText = {
  en: {
    title: 'Annual Health Checkup',
    subtitle: 'Choose a preventive care package that matches your age range and lifestyle.',
    popular: 'Popular',
    screenings: 'Highlighted screenings',
    selected: 'Selected Package',
    select: 'Select This Package',
    note: (name) => `${name} selected. The next step will connect this package to appointment date and time selection.`,
  },
  th: {
    title: 'โปรแกรมตรวจสุขภาพประจำปี',
    subtitle: 'เลือกแพ็กเกจที่เหมาะกับช่วงอายุและไลฟ์สไตล์ของคุณ',
    popular: 'ยอดนิยม',
    screenings: 'รายการตรวจเด่น',
    selected: 'เลือกแพ็กเกจนี้แล้ว',
    select: 'เลือกแพ็กเกจนี้',
    note: (name) => `เลือกแพ็กเกจ ${name} แล้ว ขั้นตอนถัดไปคือเลือกวันและเวลานัดหมาย`,
  },
};

function AnnualCheck({ language = 'en' }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const text = annualText[language];

  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <h2 className="fw-bold text-dark-blue mb-3">{text.title}</h2>
        <p className="text-muted fs-5 mx-auto annual-check-intro">
          {text.subtitle}
        </p>
      </section>

      <section className="row g-4 justify-content-center">
        {checkupPackages.map((pkg) => {
          const isSelected = selectedPackage?.id === pkg.id;

          return (
            <div className="col-lg-4 col-md-6" key={pkg.id}>
              <article
                className={`card h-100 border-0 shadow-sm rounded-3 bg-white position-relative annual-package-card ${
                  pkg.popular ? 'annual-package-popular' : ''
                } ${isSelected ? 'annual-package-selected' : ''}`}
              >
                {pkg.popular && (
                  <div className="annual-popular-ribbon">
                    {text.popular}
                  </div>
                )}

                <div className="card-body p-4 d-flex flex-column">
                  <div>
                    <div
                      className="annual-package-accent"
                      style={{ backgroundColor: pkg.accent }}
                    ></div>

                    <h4 className="fw-bold mb-1" style={{ color: pkg.accent }}>
                      {pkg.name}
                    </h4>
                    <p className="text-muted mb-4">{pkg.target}</p>

                    <div className="d-flex align-items-baseline mb-4">
                      <span className="display-5 fw-bold text-dark">{pkg.price}</span>
                      <span className="text-muted ms-2">THB</span>
                    </div>

                    <hr />

                    <p className="fw-bold text-secondary mb-3 annual-list-title">
                      {text.screenings}
                    </p>
                    <ul className="list-unstyled mb-0">
                      {pkg.items.map((item) => (
                        <li className="annual-package-item" key={item}>
                          <span className="annual-checkmark" style={{ color: pkg.accent }}>OK</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    className="btn btn-lg w-100 mt-5 text-white fw-bold annual-select-btn"
                    type="button"
                    style={{ backgroundColor: pkg.accent, borderColor: pkg.accent }}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {isSelected ? text.selected : text.select}
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </section>

      {selectedPackage && (
        <section className="alert alert-info border-0 shadow-sm mt-4 annual-selection-note">
          {text.note(selectedPackage.name)}
        </section>
      )}
    </main>
  );
}

export default AnnualCheck;
