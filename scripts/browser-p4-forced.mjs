/**
 * Disposable-browser P4 contract probe. It installs temporary page-local
 * fetch fixtures through CDP; it never changes the candidate, adapter, or a
 * production endpoint, and deliberately emits metadata only.
 */
const targets = await (await fetch('http://127.0.0.1:9223/json/list')).json();
const target = targets.find(value => value.type === 'page' && value.url.includes('/gallery'));
if (!target) throw new Error('No disposable local browser page is available.');
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
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const resetAndOpen = async () => {
  await evaluate(`(() => { localStorage.clear(); location.href = '/gallery'; })()`);
  await pause(1_000);
  await evaluate(`(() => { const leaf = [...document.querySelectorAll('*')].find(value => value.children.length === 0 && /MEET THE CURATOR/i.test(value.textContent || '')); const target = leaf?.closest('button,[role="button"],a') || leaf; if (!target) throw new Error('Curator entry unavailable'); target.click(); })()`);
  await pause(350);
};
const setMode = mode => evaluate(`(() => {
  const native = window.__hsP4NativeFetch || window.fetch.bind(window);
  window.__hsP4NativeFetch = native;
  const code = ${JSON.stringify(mode)};
  window.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (!url.includes('/api/curator-interaction')) return native(input, init);
    if (code === 'capacity') return new Response(JSON.stringify({ error: 'HOSTED_CURATOR_CAPACITY_UNAVAILABLE' }), { status: 503, headers: { 'content-type': 'application/json' } });
    if (code === 'transport') throw new TypeError('Synthetic local transport failure');
    if (code === 'success') return new Response(JSON.stringify({ content: 'A visible relation can remain open to further looking.', seal: '[PUBLIC CURATOR]' }), { status: 200, headers: { 'content-type': 'application/json' } });
    return native(input, init);
  };
})()`);
const submit = async (value) => {
  await evaluate(`(() => { const input = document.querySelector('input[placeholder*="ask in your own words"]'); const form = input?.closest('form'); if (!input || !form) throw new Error('Public input unavailable'); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); form.requestSubmit(); })()`);
  await pause(4_500);
};
const snapshot = () => evaluate(`JSON.stringify((() => { const text = document.body.innerText; return {
  counter: ['3 / 3', '2 / 3', '1 / 3', '0 / 3'].find(value => text.includes(value)) || null,
  curatorTurns: [...document.querySelectorAll('.t-curator-response')].length,
  visitorTurns: [...document.querySelectorAll('.t-curator-response')].length >= 0 ? [...document.querySelectorAll('div')].filter(value => value.style?.textAlign === 'right').length : 0,
  capacityStatus: [...document.querySelectorAll('[role="status"]')].some(value => (value.textContent || '').includes('A fixed continuity response is present. It is not a provider response.')),
  transportStatus: [...document.querySelectorAll('[role="status"]')].some(value => (value.textContent || '').includes('The Curator could not be reached. Your exchange has been preserved.')),
  statusSurface: document.querySelectorAll('[role="status"]').length,
  retryCount: [...document.querySelectorAll('button')].filter(value => value.textContent?.trim() === 'RETRY').length,
  conclude: text.includes('CONCLUDE ENCOUNTER'),
  inputAvailable: Boolean(document.querySelector('input[placeholder*="ask in your own words"]')),
  atelier: text.includes('FRAME CURATOR') || text.includes('ATELIER')
}; })())`);
const clickFallbackRetry = () => evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(value => value.textContent?.trim() === 'RETRY'); if (!button) throw new Error('Fallback retry unavailable'); button.click(); })()`);

// Three committed capacity turns can complete PUBLIC without claiming a model response.
await resetAndOpen();
await setMode('capacity');
await submit('capacity one');
const capacityOne = await snapshot();
await submit('capacity two');
await submit('capacity three');
const capacityThree = await snapshot();

// An attempted retry failure preserves the committed first fallback branch.
await setMode('transport');
await clickFallbackRetry();
await pause(800);
const retryFailure = await snapshot();

// A later successful retry atomically replaces the selected fallback branch;
// completion remains witnessed although the active dialogue has rewound to 1.
await setMode('success');
await clickFallbackRetry();
await pause(4_000);
const retrySuccess = await snapshot();
await evaluate(`(() => { const button = [...document.querySelectorAll('button')].find(value => /CONCLUDE ENCOUNTER/i.test(value.textContent || '')); if (!button) throw new Error('Witnessed completion did not retain Conclude'); button.click(); })()`);
await pause(500);
const witnessedAtelier = await snapshot();

// Distinct forced transport branch: no fabricated Curator turn or advancement.
await resetAndOpen();
const transportBefore = await snapshot();
await setMode('transport');
await submit('transport branch');
const transportAfter = await snapshot();

console.log(JSON.stringify({ capacityOne, capacityThree, retryFailure, retrySuccess, witnessedAtelier, transportBefore, transportAfter }));
socket.close();
