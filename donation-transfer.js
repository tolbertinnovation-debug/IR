(() => {
  const section = document.querySelector('#bank-transfer');
  if (!section) return;
  const status = section.querySelector('[data-copy-status]');

  // Read the displayed details so the copied instructions stay in sync with the page.
  const allInstructions = () => {
    const blocks = [...section.querySelectorAll('[data-transfer-copy-block]')].map((block) => {
      const heading = block.querySelector('h3').textContent.trim();
      const note = block.querySelector('.wire-card__note')?.textContent.trim();
      const rows = [...block.querySelectorAll('dl > div')].map((row) => {
        const value = row.querySelector('dd').cloneNode(true);
        value.querySelectorAll('button').forEach((button) => button.remove());
        return `${row.querySelector('dt').textContent.trim()}: ${value.textContent.trim()}`;
      });
      const reference = block.querySelector('#payment-reference')?.textContent.trim();
      return [heading, note, ...rows, reference].filter(Boolean).join('\n');
    });
    return [
      'IMPACTREACH FOUNDATION (IRF)',
      'International Donation and Bank Transfer Instructions',
      'Reaching Life. Transforming Future.',
      '',
      section.querySelector('.wire-confirmation').innerText.trim(),
      'Bank transfer services: https://ibliberia.com/money-transfer-service/',
      '',
      ...blocks.map((block) => `${block}\n`),
      'Contact IRF before completing a transaction if additional information is required.',
      'Rock Hill, ELWA, Paynesville City, Liberia',
      '+231 773 224 296 | +231 886 421 636 | +231 770 255 066',
      'impactreachfoundation@gmail.com',
      'https://impactreachglobal.org/'
    ].join('\n');
  };

  const copy = async (text, label, target) => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = `${label} copied. Confirm the account number and routing before sending funds.`;
    } catch {
      // Clipboard permissions can be blocked. Keep manual copying available without
      // claiming success or removing the instructions from the page.
      const range = document.createRange();
      range.selectNodeContents(target);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Automatic copying is unavailable. Select and copy the highlighted details manually. Confirm the account number and routing before sending funds.';
    }
  };

  section.querySelectorAll('[data-copy-target]').forEach((button) => {
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    button.hidden = false;
    button.addEventListener('click', () => copy(target.textContent.trim(), button.dataset.copyLabel, target));
  });
  const copyAll = section.querySelector('[data-copy-all]');
  copyAll.hidden = false;
  copyAll.addEventListener('click', () => copy(allInstructions(), 'Transfer instructions', section));
})();
