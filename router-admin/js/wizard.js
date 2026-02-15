// js/wizard.js

export function initWizard() {
  const tryInit = (attempt = 0) => {
    const welcome = document.getElementById('welcomeScreen');
    const wizard  = document.getElementById('wizardContainer');
    const start   = document.getElementById('startWizardBtn');

    if (welcome && wizard && start) {
      console.log("Мастер: элементы найдены");

      // Принудительно показываем приветственный экран
      welcome.style.display = 'block';
      wizard.style.display = 'none';

      let currentStep = 1;
      const totalSteps = 7;
      const steps = Array.from({ length: totalSteps }, (_, i) => 
        document.getElementById(`step${i+1}`)
      ).filter(Boolean);

      const back   = document.getElementById('wizardBack');
      const next   = document.getElementById('wizardNext');
      const finish = document.getElementById('wizardFinish');

      function showStep(n) {
        if (n < 1 || n > totalSteps) return;
        steps.forEach((s, i) => s?.classList.toggle('active', i === n-1));
        if (back) back.disabled = n === 1;
        if (next) next.style.display = n < totalSteps ? 'inline-block' : 'none';
        if (finish) finish.style.display = n === totalSteps ? 'inline-block' : 'none';
        currentStep = n;
      }

      start.addEventListener('click', e => {
        e.preventDefault();
        welcome.style.display = 'none';
        wizard.style.display = 'block';
        showStep(1);
      });

      back?.addEventListener('click', () => currentStep > 1 && showStep(currentStep - 1));
      next?.addEventListener('click', () => currentStep < totalSteps && showStep(currentStep + 1));

      finish?.addEventListener('click', () => {
        // Скрываем шаги и кнопки навигации (с проверкой)
        wizard.querySelectorAll('.wizard-step').forEach(s => s.style.display = 'none');
        
        const buttonsContainer = wizard.querySelector('.wizard-buttons');
        if (buttonsContainer) {
          buttonsContainer.style.display = 'none';
        }

        // Экран перезагрузки
        const reboot = document.createElement('div');
        reboot.style.cssText = `
          text-align:center; 
          padding:80px 30px; 
          background:linear-gradient(135deg,#f0f4f8,#e0eaff); 
          border-radius:16px; 
          box-shadow:0 10px 30px rgba(0,102,153,0.15); 
          max-width:700px; 
          margin:60px auto;
        `;
        reboot.innerHTML = `
          <h2 style="color:#004466;font-size:28px;margin-bottom:20px;">Настройки сохранены!</h2>
          <div style="margin:40px 0;height:120px;position:relative;">
            <div style="
              width:80px;height:80px;
              border:8px solid #e0e0e0;
              border-top:8px solid #00a8e0;
              border-radius:50%;
              animation:spin 1.2s linear infinite;
              position:absolute;
              top:50%;left:50%;
              transform:translate(-50%,-50%);
            "></div>
          </div>
          <p style="font-size:18px;color:#555;margin:20px 0 40px;">
            Роутер перезагружается...<br>Подождите 30–60 секунд.
          </p>
          <div id="countdown" style="font-size:48px;font-weight:bold;color:#006699;margin:20px 0;">15</div>
          <p style="color:#777;font-size:16px;">
            Возврат через <span id="sec">15</span> сек...
          </p>
        `;
        wizard.appendChild(reboot);

        let sec = 15;
        const cd = reboot.querySelector('#countdown');
        const st = reboot.querySelector('#sec');

        const t = setInterval(() => {
          sec--;
          if (cd) cd.textContent = sec;
          if (st) st.textContent = sec;
          if (sec <= 0) {
            clearInterval(t);
            reboot.innerHTML = `
              <div style="padding:60px 20px;">
                <div style="font-size:80px;color:#28a745;margin-bottom:30px;">✔</div>
                <h2 style="color:#28a745;font-size:32px;margin-bottom:20px;">Перезагрузка завершена</h2>
                <p style="font-size:18px;color:#444;margin-bottom:40px;">Роутер запущен с новыми настройками.</p>
                <p style="font-size:16px;color:#666;">Возврат на начальный экран через 4 секунды...</p>
              </div>
            `;

            setTimeout(() => {
              wizard.querySelectorAll('.wizard-step').forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active');
              });
              const step1 = document.querySelector('#step1');
              if (step1) step1.classList.add('active');

              const buttons = wizard.querySelector('.wizard-buttons');
              if (buttons) buttons.style.display = 'flex';

              welcome.style.display = 'block';
              wizard.style.display = 'none';
              reboot.remove();

              currentStep = 1;
              if (back) back.disabled = true;
              if (next) next.style.display = 'inline-block';
              if (finish) finish.style.display = 'none';

              alert('Роутер перезагружен. Мастер готов к новому использованию.');
            }, 4000);
          }
        }, 1000);
      });

      // Анимации
      if (!document.getElementById('wizard-animations')) {
        const st = document.createElement('style');
        st.id = 'wizard-animations';
        st.textContent = `
          @keyframes spin {
            0% { transform: translate(-50%,-50%) rotate(0deg); }
            100% { transform: translate(-50%,-50%) rotate(360deg); }
          }
        `;
        document.head.appendChild(st);
      }

      return true;
    }

    if (attempt < 20) {
      setTimeout(() => tryInit(attempt + 1), 100);
    } else {
      console.warn("Мастер: не удалось найти элементы после 20 попыток");
    }
  };

  tryInit();
  return true;
}