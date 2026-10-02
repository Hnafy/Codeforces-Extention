(() => {
  'use strict';

  const TAG = '[CF-AutoFiller]';
  const STORAGE_KEY = 'cfAutoFiller:lastProblem';
  const log = (...args) => console.log(TAG, ...args);
  const warn = (...args) => console.warn(TAG, ...args);

  const path = location.pathname.replace(/\/+$/, '');
  log('Script loaded. Path =', path);

  const RE = {
    // /problemset/problem/339/A
    problemsetProblem: /^\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)$/,
    // /contest/566197/problem/B  |  /gym/123/problem/A  |  /group/9me3Pr8wJd/contest/561080/problem/A
    contestProblem: /^(\/(?:group\/[^/]+\/)?(?:contest|gym)\/(\d+))\/problem\/([A-Za-z0-9]+)$/,
    // /problemset/submit
    problemsetSubmit: /^\/problemset\/submit$/,
    // /contest/ID/submit  |  /gym/ID/submit  |  /group/XXX/contest/ID/submit
    contestSubmit: /^(\/(?:group\/[^/]+\/)?(?:contest|gym)\/(\d+))\/submit(?:\/[A-Za-z0-9]+)?$/,
  };

  function saveProblem(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      log('Problem saved to sessionStorage:', data);
    } catch (e) {
      warn('Failed to save to sessionStorage:', e);
    }
  }

  function loadProblem() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      log('Loaded saved problem:', data);
      return data;
    } catch (e) {
      warn('Failed to read sessionStorage:', e);
      return null;
    }
  }

  function handleProblemPage() {
    let m = path.match(RE.problemsetProblem);
    if (m) {
      const contestId = m[1];
      const index = m[2].toUpperCase();
      log('Detected PROBLEMSET problem page:', { contestId, index });
      saveProblem({
        kind: 'problemset',
        contestId,
        index,
        code: contestId + index,
        contestBase: null,
        url: location.href,
        savedAt: Date.now(),
      });
      return true;
    }

    m = path.match(RE.contestProblem);
    if (m) {
      const contestBase = m[1];
      const contestId = m[2];
      const index = m[3].toUpperCase();
      log('Detected CONTEST/GROUP/GYM problem page:', { contestBase, contestId, index });
      saveProblem({
        kind: 'contest',
        contestId,
        index,
        code: contestId + index,
        contestBase,
        url: location.href,
        savedAt: Date.now(),
      });
      return true;
    }
    return false;
  }

  function fireEvents(el) {
    ['input', 'change'].forEach((type) => {
      el.dispatchEvent(new Event(type, { bubbles: true }));
      log(`Dispatched "${type}" event on`, el);
    });
  }

  function fillProblemsetInput(input, saved) {
    log('Filling input[name="submittedProblemCode"] with:', saved.code);
    input.focus();
    input.value = saved.code;
    fireEvents(input);
    log('Input value now =', input.value);
    return input.value === saved.code;
  }

  function selectProblemIndex(select, saved) {
    const options = Array.from(select.options);
    log('Select options found:', options.map((o) => ({ value: o.value, text: o.text.trim() })));

    const target = saved.index.toLowerCase();
    const opt =
      options.find((o) => o.value.trim().toLowerCase() === target) ||
      options.find((o) => o.text.trim().toLowerCase().startsWith(target + ' ')) ||
      options.find((o) => o.text.trim().toLowerCase().startsWith(target));

    if (!opt) {
      warn('No matching option for index', saved.index);
      return false;
    }
    log('Matched option:', { value: opt.value, text: opt.text.trim() });
    select.value = opt.value;
    fireEvents(select);
    log('Select value now =', select.value);
    return select.value === opt.value;
  }

  function setupSubmitPage() {
    const isProblemsetSubmit = RE.problemsetSubmit.test(path);
    const cm = path.match(RE.contestSubmit);
    if (!isProblemsetSubmit && !cm) return false;

    const pageContestId = cm ? cm[2] : null;
    log('Detected SUBMIT page:', isProblemsetSubmit ? 'problemset' : { contest: cm[1], pageContestId });

    const saved = loadProblem();
    if (!saved) {
      log('No saved problem — nothing to auto-fill.');
      return true;
    }

    let done = false;
    const tryFill = () => {
      if (done) return true;

      const codeInput = document.querySelector('input[name="submittedProblemCode"]');
      const indexSelect = document.querySelector('select[name="submittedProblemIndex"]');
      log('Field discovery:', { codeInput: !!codeInput, indexSelect: !!indexSelect });

      if (isProblemsetSubmit && codeInput) {
        done = true;
        const ok = fillProblemsetInput(codeInput, saved);
        log(ok ? `Auto-filled problemset code: ${saved.code}` : 'Auto-fill FAILED for problemset input.');
        return true;
      }

      if (cm && indexSelect) {
        done = true;
        if (pageContestId !== saved.contestId) {
          warn(`Saved problem belongs to contest ${saved.contestId} but this page is contest ${pageContestId}. Skipping auto-select.`);
          return true;
        }
        const ok = selectProblemIndex(indexSelect, saved);
        log(ok ? `Auto-selected problem index: ${saved.index}` : 'Auto-select FAILED for index select.');
        return true;
      }
      return false;
    };

    if (!tryFill()) {
      log('Fields not found yet — observing DOM for up to 8s...');
      const observer = new MutationObserver(() => {
        if (tryFill()) observer.disconnect();
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(() => {
        observer.disconnect();
        if (!done) warn('Gave up: submit fields were never found.');
      }, 8000);
    }
    return true;
  }

  if (handleProblemPage()) return;
  if (setupSubmitPage()) return;
  log('Page not relevant, nothing to do.');
})();
