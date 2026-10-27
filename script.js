'use strict';
// Recursive-descent arithmetic parser: no eval or executable user input.
function calculate(source) {
  const text = source.replace(/\s+/g, '').replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/−/g, '-');
  if (!text) throw new Error('Enter a calculation first.');
  if (text.length > 500) throw new Error('Please use a shorter calculation.');
  let position = 0;
  function expression() {
    let value = term();
    while (text[position] === '+' || text[position] === '-') {
      const operator = text[position++]; const next = term();
      value = operator === '+' ? value + next : value - next;
    }
    return value;
  }
  function term() {
    let value = unary();
    while (text[position] === '*' || text[position] === '/') {
      const operator = text[position++]; const next = unary();
      if (operator === '/' && next === 0) throw new Error('Cannot divide by zero.');
      value = operator === '*' ? value * next : value / next;
    }
    return value;
  }
  function unary() {
    if (text[position] === '+') { position++; return unary(); }
    if (text[position] === '-') { position++; return -unary(); }
    return power();
  }
  function power() {
    let value = primary();
    while (text[position] === '%') { position++; value /= 100; }
    if (text[position] === '^') { position++; value = Math.pow(value, unary()); }
    return value;
  }
  function primary() {
    if (text.startsWith('sqrt(', position)) {
      position += 5; const value = expression();
      if (text[position++] !== ')') throw new Error('Close every parenthesis.');
      if (value < 0) throw new Error('Square roots need a nonnegative number.');
      return Math.sqrt(value);
    }
    if (text.startsWith('pi', position)) { position += 2; return Math.PI; }
    if (text[position] === '(') {
      position++; const value = expression();
      if (text[position++] !== ')') throw new Error('Close every parenthesis.');
      return value;
    }
    const match = text.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i);
    if (!match) throw new Error('Check your expression. Use numbers and + − × ÷ ^.');
    position += match[0].length; return Number(match[0]);
  }
  const answer = expression();
  if (position !== text.length) throw new Error('Check your expression. Use × between values.');
  if (!Number.isFinite(answer)) throw new Error('The result is outside the real-number range.');
  return Object.is(answer, -0) ? 0 : answer;
}
const formulas = [
  {type:'algebra', name:'Quadratic formula', equation:'x = (−b ± √(b² − 4ac)) / 2a', note:'Solve ax² + bx + c = 0, where a ≠ 0.'},
  {type:'geometry', name:'Area of a circle', equation:'A = πr²', note:'The space inside a circle of radius r.'},
  {type:'geometry', name:'Pythagorean theorem', equation:'a² + b² = c²', note:'For a right triangle; c is the hypotenuse.'},
  {type:'algebra', name:'Difference of squares', equation:'a² − b² = (a − b)(a + b)', note:'Turn a difference into a useful product.'},
  {type:'geometry', name:'Area of a triangle', equation:'A = ½bh', note:'Use the perpendicular height to the base.'},
  {type:'algebra', name:'Arithmetic series', equation:'Sₙ = n(a₁ + aₙ) / 2', note:'Sum n equally spaced terms, first to last.'},
  {type:'geometry', name:'Circumference of a circle', equation:'C = 2πr', note:'The distance around a circle.'},
  {type:'algebra', name:'Slope of a line', equation:'m = (y₂ − y₁) / (x₂ − x₁)', note:'Change in y over change in x; x₂ ≠ x₁.'},
  {type:'geometry', name:'Volume of a cylinder', equation:'V = πr²h', note:'Circular base area multiplied by height.'}
];
if (typeof document !== 'undefined') {
  const input = document.querySelector('#expression');
  const result = document.querySelector('#result');
  function solve() {
    try { result.textContent = '= ' + Number(calculate(input.value).toPrecision(12)).toString(); }
    catch (error) { result.textContent = error.message; }
  }
  document.querySelector('.keys').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    if (button.dataset.action === 'equals') { solve(); return; }
    if (button.dataset.action === 'clear') { input.value = ''; result.textContent = 'Ready when you are.'; input.focus(); return; }
    input.focus();
    if (button.dataset.action === 'backspace') input.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end');
    else input.setRangeText(button.dataset.value, start, end, 'end');
    result.textContent = 'Press = or Enter to calculate.';
  });
  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === '=') { event.preventDefault(); solve(); }
    if (event.key === 'Escape') { input.value = ''; result.textContent = 'Ready when you are.'; }
  });
  input.addEventListener('input', () => { result.textContent = 'Press = or Enter to calculate.'; });
  let filter = 'all';
  const search = document.querySelector('#formula-search');
  function renderFormulas() {
    const query = search.value.trim().toLowerCase();
    const matches = formulas.filter(item => (filter === 'all' || item.type === filter) && `${item.name} ${item.type} ${item.note} ${item.equation}`.toLowerCase().includes(query));
    const grid = document.querySelector('#formula-grid');
    grid.replaceChildren(...matches.map(item => {
      const card = document.createElement('article'); card.className = 'formula-card';
      const label = document.createElement('span'); label.className = 'tiny-label'; label.textContent = item.type.toUpperCase();
      const title = document.createElement('h3'); title.textContent = item.name;
      const equation = document.createElement('div'); equation.className = 'equation'; equation.textContent = item.equation;
      const note = document.createElement('p'); note.textContent = item.note;
      card.append(label, title, equation, note); return card;
    }));
    document.querySelector('#empty').hidden = matches.length > 0;
  }
  function setFilter(value) {
    filter = value;
    document.querySelectorAll('[data-filter]').forEach(button => { const selected = button.dataset.filter === value; button.classList.toggle('active', selected); button.setAttribute('aria-pressed', String(selected)); });
    renderFormulas();
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
  search.addEventListener('input', renderFormulas); renderFormulas();
  const dialog = document.querySelector('#topic-dialog'); let currentTopic;
  const lessons = {
    algebra: {title:'Meet your unknowns.', content:'<p>Algebra uses letters to stand for numbers. An equation says that two expressions have the same value. To solve it, keep both sides balanced.</p><div class="example"><strong>Try this: 2x + 6 = 14</strong><p>Subtract 6 from both sides: 2x = 8.<br>Divide both sides by 2: x = 4.<br>Check: 2 × 4 + 6 = 14. It works!</p></div><p><strong>Keep exploring:</strong> linear equations, factoring, powers, and quadratic equations. Use the formula library to keep the essentials handy.</p>'},
    geometry: {title:'Find beauty in every shape.', content:'<p>Geometry studies shapes, sizes, angles, and space. Area measures a surface in square units. Perimeter measures the distance around a shape.</p><div class="example"><strong>A right triangle with sides 3 and 4</strong><p>Use a² + b² = c²: 9 + 16 = 25.<br>The hypotenuse is √25 = 5.<br>Its area is ½ × 3 × 4 = 6 square units.</p></div><p><strong>Remember:</strong> triangle angles add to 180°. Use consistent units, and measure height perpendicular to the base.</p>'}
  };
  document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => {
    currentTopic = button.dataset.topic; const lesson = lessons[currentTopic];
    document.querySelector('#lesson-label').textContent = 'EXPLORE / ' + currentTopic.toUpperCase();
    document.querySelector('#lesson-title').textContent = lesson.title;
    document.querySelector('#lesson-content').innerHTML = lesson.content;
    dialog.showModal();
  }));
  document.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  document.querySelector('#lesson-formulas').addEventListener('click', () => { dialog.close(); search.value = ''; setFilter(currentTopic); document.querySelector('#formulas').scrollIntoView({behavior:'smooth'}); });
}
if (typeof module !== 'undefined') module.exports = {calculate};
