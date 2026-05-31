/* لعبة إكس أو — XO
   - 3 أوضاع: لاعبان / سهل (عشوائي ذكي) / صعب (Minimax مثالي لا يُهزم)
   - اللاعب دائماً ❌ ويبدأ. الكمبيوتر ⭕.
*/
(function () {
  "use strict";

  const boardEl = document.getElementById("board");
  const statusEl = document.getElementById("status");
  const sxEl = document.getElementById("sx");
  const soEl = document.getElementById("so");
  const sdEl = document.getElementById("sd");

  const WINS = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let board, current, mode, locked, score = { x:0, o:0, d:0 };

  // mode: "pvp" | "easy" | "hard"
  mode = "hard";

  function buildBoard() {
    boardEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const c = document.createElement("div");
      c.className = "cell";
      c.dataset.i = i;
      c.addEventListener("click", onCellClick);
      boardEl.appendChild(c);
    }
  }

  function newRound() {
    board = Array(9).fill("");
    current = "x";
    locked = false;
    [...boardEl.children].forEach(c => { c.className = "cell"; c.textContent = ""; });
    setStatus();
  }

  function mark(p){ return p==="x" ? "<span class='mk x'>✕</span>" : "<span class='mk o'>◯</span>"; }
  function setStatus(text) {
    if (text) { statusEl.innerHTML = text; return; }
    if (mode === "pvp") {
      statusEl.innerHTML = (current === "x" ? "دور " : "دور ") + mark(current);
    } else {
      statusEl.innerHTML = current === "x" ? ("دورك " + mark("x")) : ("يفكّر الكمبيوتر… " + mark("o"));
    }
  }

  function render(i) {
    const c = boardEl.children[i];
    c.textContent = board[i] === "x" ? "✕" : "◯";
    c.classList.add(board[i]);
  }

  function winner(b) {
    for (const [a,bb,c] of WINS) {
      if (b[a] && b[a] === b[bb] && b[a] === b[c]) return { player:b[a], line:[a,bb,c] };
    }
    if (b.every(v => v)) return { player:"draw", line:[] };
    return null;
  }

  function finish(res) {
    locked = true;
    if (res.player === "draw") {
      score.d++; sdEl.textContent = score.d;
      setStatus("تعادل 🤝");
    } else {
      res.line.forEach(i => boardEl.children[i].classList.add("win"));
      if (res.player === "x") { score.x++; sxEl.textContent = score.x; }
      else { score.o++; soEl.textContent = score.o; }
      const who = res.player === "x"
        ? (mode === "pvp" ? ("فاز " + mark("x")) : ("تهانينا! فزت " + mark("x")))
        : (mode === "pvp" ? ("فاز " + mark("o")) : ("فاز الكمبيوتر " + mark("o")));
      setStatus(who);
    }
  }

  function onCellClick(e) {
    const i = +e.currentTarget.dataset.i;
    if (locked || board[i]) return;
    if (mode !== "pvp" && current !== "x") return; // انتظر دور اللاعب

    play(i);
    if (locked) return;

    if (mode !== "pvp" && current === "o") {
      setStatus();
      setTimeout(aiMove, 260);
    }
  }

  function play(i) {
    board[i] = current;
    render(i);
    const res = winner(board);
    if (res) { finish(res); return; }
    current = current === "x" ? "o" : "x";
    setStatus();
  }

  /* ---------- الذكاء الاصطناعي ---------- */
  function emptyCells(b) {
    const a = [];
    for (let i = 0; i < 9; i++) if (!b[i]) a.push(i);
    return a;
  }

  function aiMove() {
    if (locked) return;
    const cells = emptyCells(board);
    if (!cells.length) return;

    let move;
    if (mode === "easy") {
      // سهل: 55% عشوائي، 45% أفضل حركة — قابل للهزيمة
      move = Math.random() < 0.55
        ? cells[Math.floor(Math.random() * cells.length)]
        : bestMove(board, "o").index;
    } else {
      // صعب: minimax مثالي — لا يُهزم أبداً
      move = bestMove(board, "o").index;
    }
    play(move);
  }

  // minimax: يعيد {score, index} — "o" تعظّم، "x" تُصغّر
  function bestMove(b, player) {
    const res = winner(b);
    if (res) {
      if (res.player === "o") return { score: 10 };
      if (res.player === "x") return { score: -10 };
      return { score: 0 };
    }
    const cells = emptyCells(b);
    let best = player === "o"
      ? { score: -Infinity, index: cells[0] }
      : { score: Infinity, index: cells[0] };

    for (const i of cells) {
      b[i] = player;
      const r = bestMove(b, player === "o" ? "x" : "o");
      b[i] = "";
      // تفضيل الفوز الأسرع / التأخير في الخسارة
      const adj = r.score - (r.score > 0 ? 0.01 * countFilled(b) : 0);
      if (player === "o") {
        if (r.score > best.score) best = { score: r.score, index: i };
      } else {
        if (r.score < best.score) best = { score: r.score, index: i };
      }
    }
    return best;
  }

  function countFilled(b){ return b.filter(Boolean).length; }

  /* ---------- الأوضاع ---------- */
  const btns = {
    pvp:  document.getElementById("mPvP"),
    easy: document.getElementById("mEasy"),
    hard: document.getElementById("mHard"),
  };
  function setMode(m) {
    mode = m;
    Object.entries(btns).forEach(([k, el]) => el.classList.toggle("active", k === m));
    newRound();
  }
  btns.pvp.addEventListener("click", () => setMode("pvp"));
  btns.easy.addEventListener("click", () => setMode("easy"));
  btns.hard.addEventListener("click", () => setMode("hard"));

  document.getElementById("reset").addEventListener("click", newRound);
  document.getElementById("clear").addEventListener("click", () => {
    score = { x:0, o:0, d:0 };
    sxEl.textContent = soEl.textContent = sdEl.textContent = "0";
    newRound();
  });

  /* ---------- إقلاع ---------- */
  buildBoard();
  newRound();

  // PWA offline
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(()=>{});
  }
})();
