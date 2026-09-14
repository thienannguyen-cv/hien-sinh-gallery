const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const target = targets.find(value => value.type === 'page' && value.url.includes('/gallery'));
if (!target) throw new Error('No disposable local Acceptance-A browser page was found.');
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let nextId = 0;
function evaluate(expression) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    const timeout = setTimeout(() => reject(new Error('CDP evaluation timed out.')), 15_000);
    const receive = event => {
      const result = JSON.parse(event.data);
      if (result.id !== id) return;
      socket.removeEventListener('message', receive); clearTimeout(timeout);
      if (result.error || result.result?.exceptionDetails) reject(new Error(JSON.stringify(result.error ?? result.result.exceptionDetails)));
      else resolve(result.result.result.value);
    };
    socket.addEventListener('message', receive);
    socket.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: true, awaitPromise: true } }));
  });
}

if (process.argv.includes('--open-curator')) {
  await evaluate(`(() => { const candidates = [...document.querySelectorAll('*')]; const element = candidates.find(value => value.children.length === 0 && /MEET THE CURATOR/i.test(value.textContent || '')) || candidates.find(value => /Meet the Curator/i.test(value.getAttribute('aria-label') || '')); if (!element) throw new Error('Curator entry was not found.'); (element.closest('button,[role="button"],a') || element).click(); })()`);
  await new Promise(resolve => setTimeout(resolve, 250));
}
if (process.argv.includes('--conclude-encounter')) {
  await evaluate(`(() => { const element = [...document.querySelectorAll('button')].find(value => /CONCLUDE ENCOUNTER/i.test(value.textContent || '')); if (!element) throw new Error('Conclude Encounter was not available.'); element.click(); })()`);
  await new Promise(resolve => setTimeout(resolve, 500));
}
if (process.argv.includes('--submit-real-provider')) {
  await evaluate(`(() => { const input = document.querySelector('input[placeholder*="ask in your own words"]'); const form = input?.closest('form'); if (!input || !form) throw new Error('Public Curator form was not found.'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, 'Please describe one visible relation in the composition.'); input.dispatchEvent(new Event('input', { bubbles: true })); form.requestSubmit(); })()`);
  const waitArgument = process.argv.find(value => value.startsWith('--wait-ms='));
  const waitMs = Math.min(90_000, Math.max(1_000, Number(waitArgument?.split('=')[1] ?? 10_000)));
  await new Promise(resolve => setTimeout(resolve, waitMs));
  const result = await evaluate(`JSON.stringify({
    counterOne: document.body.innerText.includes('1 / 3'),
    counterZero: document.body.innerText.includes('0 / 3'),
    loading: document.body.innerText.includes('CURATOR IS RESPONDING'),
    curatorSeals: (document.body.innerText.match(/\\[PUBLIC CURATOR\\]/g) || []).length,
    visitorPresent: document.body.innerText.includes('Please describe one visible relation in the composition.'),
    concludeAvailable: document.body.innerText.includes('CONCLUDE ENCOUNTER')
  })`);
  console.log(result);
}
const observation = await evaluate(`JSON.stringify({
  title: document.title,
  inputs: [...document.querySelectorAll('input')].map((input, index) => ({ index, placeholder: input.placeholder, aria: input.getAttribute('aria-label'), value: input.value })),
  forms: [...document.querySelectorAll('form')].map((form, index) => ({ index, text: form.innerText.slice(0, 500) })),
  resources: performance.getEntriesByType('resource').filter(entry => entry.name.includes('curator-interaction')).map(entry => ({ duration: entry.duration, transferSize: entry.transferSize, responseStatus: entry.responseStatus })),
  publicCounter: ['3 / 3', '2 / 3', '1 / 3', '0 / 3'].find(value => document.body.innerText.includes(value)) || null,
  curatorTurnCount: [...document.querySelectorAll('.t-curator-response')].length,
  transportStatusVisible: document.body.innerText.includes('The Curator could not be reached. Your exchange has been preserved.'),
  retryVisible: document.body.innerText.includes('RETRY'),
  atelierMarkerVisible: document.body.innerText.includes('FRAME CURATOR') || document.body.innerText.includes('ATELIER'),
  preparedContinuationVisible: [...document.querySelectorAll('button')].some(button => /^USE PREPARED /.test(button.textContent?.trim() || ''))
})`);
console.log(observation);
socket.close();
